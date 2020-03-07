import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {Token} from '../models/token';
import {catchError, filter, switchMap, take} from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(public authService: AuthService) {}

	private refreshTokenInProgress = false;
	// Refresh Token Subject tracks the current token, or is null if no token is currently
	// available (e.g. refresh pending).
	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	refreshRequest: Observable<Token> = null;

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const accessTokenExpired = this.authService.token && Date.now() > this.authService.token.loggedInTime + (this.authService.token.expires_in * 1000);

		if (this.isNotRefreshTokenRequest(req) && accessTokenExpired) {

			if (this.refreshTokenInProgress) {
				// If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
				// – which means the new token is ready and we can retry the request again
				return this.refreshTokenSubject.pipe(
					filter(result => result !== null),
					take(1),
					switchMap(() => {
						req = req.clone({
							setHeaders: {Authorization: `Bearer ${this.authService.token.access_token}`}
						});
						return next.handle(req);
					}));
			} else {
				this.refreshTokenInProgress = true;

				// Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
				this.refreshTokenSubject.next(null);

				// Call auth.refreshAccessToken(this is an Observable that will be returned)
				return this.authService.refreshToken().pipe(
					switchMap((token: any) => {
						// When the call to refreshToken completes we reset the refreshTokenInProgress to false
						// for the next time the token needs to be refreshed
						this.refreshTokenInProgress = false;
						this.refreshTokenSubject.next(token);

						req = req.clone({
							setHeaders: {Authorization: `Bearer ${this.authService.token.access_token}`}
						});
						return next.handle(req);
					})
				);
				// catchError((err: any) => {
				// 	this.refreshTokenInProgress = false;
				//
				// 	// this.authService.logout();
				// 	return Observable.throw(err);
				// })
			}
		}

		return next.handle(req);
	}


	isNotRefreshTokenRequest(req) {
		if (req.body) {
			return req.body.indexOf('grant_type=refresh_token') === -1;
		}
		return true;
	}
}
