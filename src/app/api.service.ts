import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Config} from './config';
import {environment} from '../environments/environment';
import {AuthService} from './auth/auth.service';
import {Observable, of} from 'rxjs';
import {Token} from './models/token';

@Injectable({providedIn: 'root'})
export class ApiService {
	private token: Token;

	constructor(
		private http: HttpClient,
		private authService: AuthService,
	) {}

	generateHeader() {
		return new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', `Bearer ${this.authService.token.access_token}`)
			.set('x-ibm-client-id', environment.client_id)
			.set('subscriberid', this.authService.token.metadata);
	}

	getSummary() {
		const options = {headers: this.generateHeader()};

		return this.http.get<any>(`${Config.apiDomain}/sltvasservices/dashboard/summary`, options)
			.pipe(
				map(result => result),
				catchError(this.handleError()),
			);
	}

	getDailyUsageThisMonth() {
		const options = {headers: this.generateHeader()};

		return this.http.get<any>(`${Config.apiDomain}/sltvasservices/dailyusage/current?billdate=01`, options)
			.pipe(
				map(result => result),
				catchError(this.handleError()),
			);
	}

	private handleError<T>(result?: T) {
		return (error: any): Observable<T> => {
			console.log(`ApiService#error: ${JSON.stringify(error)}`);
			return of(result as T);
		};
	}
}
