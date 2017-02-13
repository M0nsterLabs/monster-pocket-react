import TimeOnPage from 'model/advice/Context/TimeOnPage';

export default class TimeSpentOnPage {
	static seconds(n) {
		return [
			TimeOnPage, 'top', 'top.seconds == ' + n
		];
	}
}
