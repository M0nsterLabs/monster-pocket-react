import CountryOfOrigin from 'model/advice/Condition/CountryOfOrigin';
import {expect} from 'chai';


describe('Conditions', function () {
  describe('Country of origin', function () {
    const country = CountryOfOrigin.equals('US');
    expect(country[2]).to.equal('u.country == "US"');
  });
});
