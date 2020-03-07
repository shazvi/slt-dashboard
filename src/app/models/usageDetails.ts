export class UsageDetails {

	private _limit: number;
	private _used: number;
	private _remaining: number;
	private _percentage: number;
	private _rate: number;
	private _expected_finish: number;

	get limit() { return this._limit || 0; }
	get used() { return this._used || 0; }
	get remaining() { return this._remaining || 0; }
	get percentage() { return this._percentage || 0; }
	get rate(): number { return this._rate || 0; }
	get expected_finish(): number { return this._expected_finish || 0; }

	set limit(value: number) { this._limit = value; }
	set used(value: number) { this._used = value; }
	set remaining(value: number) { this._remaining = value; }
	set percentage(value: number) { this._percentage = value; }
	set rate(value: number) { this._rate = value; }
	set expected_finish(value: number) { this._expected_finish = value; }
}
