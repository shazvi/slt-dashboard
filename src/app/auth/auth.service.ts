import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Token} from '../models/token';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Config} from '../config';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';


@Injectable({providedIn: 'root'})
export class AuthService {
	private currentTokenSubject: BehaviorSubject<Token>;
	public currentToken: Observable<Token>;

	constructor(
		private http: HttpClient,
		private router: Router,
	) {
		this.currentTokenSubject = new BehaviorSubject<Token>(JSON.parse(localStorage.getItem('token')));
		this.currentToken = this.currentTokenSubject.asObservable();
	}

	public get token(): Token {
		return this.currentTokenSubject.value;
	}

	login(username: string, password: string): Observable<Token> {
		const body = new URLSearchParams();
		body.set('username', username);
		body.set('password', password);
		body.set('client_id', environment.client_id);
		body.set('scope', environment.scope);
		body.set('grant_type', 'password');

		const options = {
			headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
		};

		return this.http.post<any>(
			`${Config.apiDomain}/sltvasoauth/oauth2/token`, body.toString(), options
		).pipe(
			map(token => {
				if (token && token.access_token) {
					// store token details in local storage to keep user logged in between page refreshes
					token = {...token, loggedInTime: Date.now()};
					localStorage.setItem('token', JSON.stringify(token));
					this.currentTokenSubject.next(token);
					return token;
				} else {
					this.handleError();
				}
			}),
			// catchError(this.handleError())
		);
	}

	refreshToken(): Observable<Token> {
		const body = new URLSearchParams();
		body.set('client_id', environment.client_id);
		body.set('scope', environment.scope);
		body.set('grant_type', 'refresh_token');
		body.set('refresh_token', this.token.refresh_token);

		const options = {
			headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
		};

		return this.http.post<any>(
			`${Config.apiDomain}/sltvasoauth/oauth2/token`, body.toString(), options
		).pipe(
			map(token => {
				if (token && token.access_token) {
					// store token details in local storage to keep user logged in between page refreshes
					token = {...token, loggedInTime: Date.now(), metadata: this.token.metadata};
					localStorage.setItem('token', JSON.stringify(token));
					this.currentTokenSubject.next(token);
					return token;
				} else {
					this.handleError();
				}
			}),
			// catchError(this.handleError())
		);
	}

	private handleError<T>(result?: T) {
		return (error: any): Observable<T> => {
			console.log(`AuthService#error: ${JSON.stringify(error)}`);
			return of(result as T);
		};
	}


	logout() {
		localStorage.removeItem('token');
		this.currentTokenSubject.next(null);
		this.router.navigate(['/login']);
	}
}
