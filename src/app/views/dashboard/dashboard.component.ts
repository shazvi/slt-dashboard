import { Component, OnInit } from '@angular/core';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {Title} from '@angular/platform-browser';
import {Config} from '../../config';
import {ApiService} from '../../api.service';
import idx from 'idx';
import {UsageDetails} from '../../models/usageDetails';
import {Label} from 'ng2-charts';
import {ChartDataSets} from 'chart.js';

@Component({
	templateUrl: 'dashboard.component.html',
	styles: ['.bg-warning { background-color: #e1a900 !important; }']
})
export class DashboardComponent implements OnInit {
	constructor(
		private titleService: Title,
		private apiService: ApiService,
	) {}

	totalUsageDetails = new UsageDetails();
	daytimeUsageDetails = new UsageDetails();
	nighttimeUsageDetails = new UsageDetails();
	dailyLimit = 0;
	nightlyLimit = 0;
	now: any = new Date();
	lastDateOfMonth = (new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0)).getDate();
	fetchingSummary: boolean = false;
	fetchingDailyUsage: boolean = false;

	monthsList: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	// barChart
	public barChartData1: Array<number> = [];
	public barChartData2: Array<number> = [];
	public barChartData3: Array<number> = [];
	public barChartData4: Array<number> = [];

	public barChartData: ChartDataSets[] = [
		{data: this.barChartData1, label: 'Day'},
		{data: this.barChartData2, label: 'Night'},
		{data: this.barChartData3, label: 'Daily limit', type: 'line'},
		{data: this.barChartData4, label: 'Nightly limit', type: 'line'},
	];

	public barChartLabels: Label[] = [];

	public barChartOptions: any = {
		tooltips: {
			enabled: false,
			custom: CustomTooltips,
			intersect: true,
			mode: 'index',
			position: 'nearest',
			callbacks: {
				labelColor: function(tooltipItem, chart) {
					return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
				}
			}
		},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			xAxes: [{}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'GB'
				}
			}]
		},
		elements: {
			line: {
				borderWidth: 2
			},
			point: {
				radius: 0,
				hitRadius: 10,
				hoverRadius: 4,
				hoverBorderWidth: 3,
			}
		},
		legend: {
			display: true
		}
	};
	public barChartColours: Array<any> = [
		{ // Day
			backgroundColor: hexToRgba(getStyle('--warning'), 70),
			borderColor: getStyle('--warning'),
			pointHoverBackgroundColor: '#fff',
		},
		{ // Night
			backgroundColor: hexToRgba(getStyle('--primary'), 70),
			borderColor: getStyle('--primary'),
			pointHoverBackgroundColor: '#fff',
		},
		{ // Daily limit
			backgroundColor: 'transparent',
			borderColor: getStyle('--warning'),
			pointHoverBackgroundColor: '#fff',
			borderWidth: 2,
			borderDash: [8, 5],
		},
		{ // Nightly limit
			backgroundColor: 'transparent',
			borderColor: getStyle('--primary'),
			pointHoverBackgroundColor: '#fff',
			borderWidth: 2,
			borderDash: [8, 5],
		}
	];

	roundToOneDecimalPoint(val: number): number {
		return parseFloat(val.toFixed(1));
	}

	getEndDate(used, total): number {
		return Math.round( (this.now.getDate() / used) * total );
	}

	getEndDateString(used, total): string {
		const endDate = this.getEndDate(used, total);
		if (!endDate) {
			return '<br>';
		} else if (used >= total) {
			return 'Data finished';
		} else if (endDate > this.lastDateOfMonth) {
			return 'Expected to last the entire month';
		} else {
			return 'Expected finish date: <b>' + endDate + '</b>';
		}
	}


	ngOnInit(): void {
		this.titleService.setTitle(Config.title);

		const fetchSummary = () => {
			this.fetchingSummary = true;
			this.apiService.getSummary()
				.subscribe(data => {
					// console.log(`DashboardComponent#summary_data: ${JSON.stringify(data)}`);
					this.fetchingSummary = false;

					if (data) {

						const _totalUsageDetails = idx(data, _ => _.my_package_info.usageDetails[1]);
						this.totalUsageDetails.limit = this.roundToOneDecimalPoint(parseFloat(_totalUsageDetails.limit));
						this.totalUsageDetails.used = this.roundToOneDecimalPoint(parseFloat(_totalUsageDetails.used));
						this.totalUsageDetails.remaining = this.roundToOneDecimalPoint(parseFloat(_totalUsageDetails.remaining));
						this.totalUsageDetails.percentage = 100 - _totalUsageDetails.percentage;
						this.totalUsageDetails.rate = this.roundToOneDecimalPoint(this.totalUsageDetails.used / (new Date().getDate()));

						const _daytimeUsageDetails = idx(data, _ => _.my_package_info.usageDetails[0]);
						this.daytimeUsageDetails.limit = this.roundToOneDecimalPoint(parseFloat(_daytimeUsageDetails.limit));
						this.daytimeUsageDetails.used = this.roundToOneDecimalPoint(parseFloat(_daytimeUsageDetails.used));
						this.daytimeUsageDetails.remaining = this.roundToOneDecimalPoint(parseFloat(_daytimeUsageDetails.remaining));
						this.daytimeUsageDetails.percentage = 100 - _daytimeUsageDetails.percentage;
						this.daytimeUsageDetails.rate = this.roundToOneDecimalPoint(this.daytimeUsageDetails.used / (new Date().getDate()));
						this.dailyLimit = this.roundToOneDecimalPoint(parseFloat(_daytimeUsageDetails.limit) / 30);

						// night time variables
						this.nighttimeUsageDetails.limit = this.roundToOneDecimalPoint(this.totalUsageDetails.limit - this.daytimeUsageDetails.limit);
						this.nighttimeUsageDetails.used = this.roundToOneDecimalPoint(this.totalUsageDetails.used - this.daytimeUsageDetails.used);
						this.nighttimeUsageDetails.remaining = this.roundToOneDecimalPoint(this.totalUsageDetails.remaining - this.daytimeUsageDetails.remaining);
						this.nighttimeUsageDetails.percentage = 100 - parseInt(((this.nighttimeUsageDetails.remaining / this.nighttimeUsageDetails.limit) * 100).toFixed(), 10);
						this.nighttimeUsageDetails.rate = this.roundToOneDecimalPoint(this.nighttimeUsageDetails.used / (new Date().getDate()));
						this.nightlyLimit = this.roundToOneDecimalPoint((this.totalUsageDetails.limit - this.daytimeUsageDetails.limit) / 30);

						fetchDailyUsage();

					} else {
						// hide loading indicator
						// show error
						// OR retry and then show error
						fetchDailyUsage();
					}
				});
		};

		const fetchDailyUsage = () => {
			this.fetchingDailyUsage = true;
			this.apiService.getDailyUsageThisMonth()
				.subscribe(data => {
					// console.log(`DashboardComponent#dailyUsage_data: ${JSON.stringify(data)}`);
					this.fetchingDailyUsage = false;

					if (data) {
						for (let i = 0; i < this.lastDateOfMonth; i++) {
							this.barChartLabels.push((i + 1) + '');

							this.barChartData1[i] = data.dailylist[i] ? this.roundToOneDecimalPoint(parseFloat(data.dailylist[i].standardusage)) : 0;
							this.barChartData2[i] = data.dailylist[i] ? this.roundToOneDecimalPoint(parseFloat(data.dailylist[i].freeusage)) : 0;
							this.barChartData3[i] = this.dailyLimit;
							this.barChartData4[i] = this.nightlyLimit;
						}

					} else {
						// hide loading indicator
						// show error
						// OR retry and then show error
					}
				});
		};

		fetchSummary();
	}
}
