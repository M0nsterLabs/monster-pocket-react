import User from 'model/advice/Context/User';

export default class NoPurchases {
	static create () {
		return [
			User, 'u', 'u.purchases == 0'
		];
	}
}
