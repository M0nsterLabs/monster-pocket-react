import User from 'model/advice/Context/User';

export default class CountryOfOrigin {
  static equals (country) {
    return [
      User, 'u', 'u.country == "' + country + '"'
    ];
  }
}
