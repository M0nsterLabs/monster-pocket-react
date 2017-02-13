import Product from 'model/advice/Context/Product';
import {expect} from 'chai';

describe('Context', function () {
	it('contains buyout price in the product object', function () {
		const p = new Product(123, 1000);
		expect(p.buyout).to.equal(1000);
	});
});
