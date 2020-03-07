import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { LoginComponent } from './views/login/login.component';
import {AuthGuard} from './auth/auth.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full',
	},
	{
		path: '404',
		component: P404Component,
		data: {
			title: 'Page 404'
		}
	},
	{
		path: 'login',
		component: LoginComponent,
		data: {
			title: 'Login Page'
		}
	},
	{
		path: '',
		component: DefaultLayoutComponent,
		canActivate: [AuthGuard],
		data: {
			title: 'Home'
		},
		children: [{
			path: 'dashboard',
			loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
		}]
	},
	{ path: '**', component: P404Component }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
