import {Component } from '@angular/core';
import {Router} from '@angular/router';
import { navItems } from '../../_nav';
import {AuthService} from '../../auth/auth.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
	public sidebarMinimized = false;
	public navItems = navItems;

	constructor(
		private router: Router,
		private authService: AuthService,
	) {}

	toggleMinimize(e) {
		this.sidebarMinimized = e;
	}

	logout() {
		this.authService.logout();
	}
}
