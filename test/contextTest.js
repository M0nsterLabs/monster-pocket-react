import Product from 'model/advice/Context/Product';
import User from 'model/advice/Context/User';
import {expect} from 'chai';

describe('Context', function () {
  it('contains buyout price in the product object', function () {
    const p = new Product(123, 1000, 1);
    expect(p.sales).to.equal(123);
    expect(p.buyout).to.equal(1000);
    expect(p.singleSite).to.equal(1);
  });

  it('can create User context', function () {
    const u = new User(1, 'US', 'en');
    expect(u.purchases).to.equal(1);
    expect(u.country).to.equal('US');
    expect(u.locale).to.equal('en');
  });
});
