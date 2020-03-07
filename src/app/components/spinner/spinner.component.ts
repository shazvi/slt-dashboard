import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-spinner',
	template: `
		<div class="sk-circle sk-center">
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
			<div class="sk-circle-dot"></div>
		</div>
	`
})
export class SpinnerComponent implements OnInit {

	constructor() { }

	ngOnInit() {
	}

}
