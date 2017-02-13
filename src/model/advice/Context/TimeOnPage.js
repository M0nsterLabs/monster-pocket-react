export default class TimeOnPage {
	static seconds(n) {
		return new TimeOnPage(n);
	}

	constructor(seconds) {
		this.seconds = seconds;
	}
}
