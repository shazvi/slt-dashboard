import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import {Title} from '@angular/platform-browser';
import idx from 'idx';
import {AuthService} from '../../auth/auth.service';
import {Config} from '../../config';



@Component({
	selector: 'app-dashboard',
	templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
	loginForm: FormGroup;
	loading = false;
	submitted = false;
	returnUrl: string;
	errors: object = [];

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private titleService: Title,
	) {
		// redirect to home if already logged in
		if (this.authService.token) {
			this.router.navigate(['/']);
		}
	}

	ngOnInit() {
		this.titleService.setTitle(`Login - ${Config.title}`);
		this.loginForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});

		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	// convenience getter for easy access to form fields
	get f() { return this.loginForm.controls; }

	onSubmit() {
		this.submitted = true;
		this.errors = [];

		// stop here if form is invalid
		if (this.loginForm.invalid) {
			return;
		}

		this.loading = true;
		this.authService.login(this.f.username.value, this.f.password.value)
			.pipe(first())
			.subscribe(
				data => {
					console.log(`LoginComponent#data: ${JSON.stringify(data)}`);
					if (data === undefined) {
						this.errors = ['Whoops. Looks like something went wrong'];
						this.loading = false;
					}
					this.router.navigate([this.returnUrl]);
				},
				error => {
					this.loading = false;
					console.log(`LoginComponent#error: ${JSON.stringify(error)}`);

					if (idx(error, _ => _.error.error) === 'invalid_grant') {
						this.errors = ['Incorrect username or password'];
					} else {
						this.errors = ['Whoops. Looks like something went wrong'];
					}
				});
	}
}
