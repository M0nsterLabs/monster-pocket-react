import _ from 'lodash';
import Advice from 'model/advice/Advice';
import TimeOnPage from 'model/advice/Context/TimeOnPage';
import Product from 'model/advice/Context/Product';
import {expect} from 'chai';


describe('js api', function () {
	beforeEach(function () {
		this.advice = new Advice();

		this.assertUseCase = function (useCase) {
			const match = this.advice.match()[0];
			expect(match).to.have.any.keys({
				useCase: useCase
			});
		};

		this.assertNoMatch = function () {
			const match = this.advice.match();
			expect(match).to.deep.equal([]);
		}
	});

	it('return an empty array when there is no match', function () {
		this.advice.assert(new TimeOnPage(115));
		this.assertNoMatch();
	});


	describe('builder', function () {
		it('updates time on page', function () {
			this.advice.timeOnPage(1);
			expect(this.advice.getFacts()).to.have.lengthOf(1);
			this.advice.timeOnPage(2);
			expect(this.advice.getFacts()).to.have.lengthOf(1);
		});

		it('adds a number of sales', function () {
			this.advice.numberOfSales(10);
			expect(this.advice.getFacts()).to.have.lengthOf(1);
			expect(this.advice.getFacts()[0]).to.be.an.instanceof(Product);
			expect(this.advice.getFacts()[0].sales).to.equal(10);
		});
	});

	describe('A1', function () {
		beforeEach(function () {
			this.willCreateTimeAndSalesCount = function (t, n) {
				this.advice.assert(TimeOnPage.seconds(t));
				this.advice.assert(new Product(n));
			};

			this.assertHasBeenWatchedTimes = function (a, b) {
				const match = this.advice.match()[0];

				const hasBeenWatched = match.views;
				expect(hasBeenWatched).to.not.be.undefined;

				expect(hasBeenWatched).to.be.at.least(a);
				expect(hasBeenWatched).to.be.at.most(b);
			}
		});

		it('matches nothing if number of sales is too low', function () {
			this.willCreateTimeAndSalesCount(5, 5);
			expect(this.advice.match()).to.deep.equal([]);
		});

		it('returns A1 when it matches the conditions', function () {
			this.willCreateTimeAndSalesCount(5, 15);

			this.assertUseCase('A1');
			this.assertHasBeenWatchedTimes(2, 4);
		});
	});


	describe('A2', function () {
		beforeEach(function () {
			this.assertMatches = function (n) {
				this.advice.timeOnPage(n);
				expect(this.advice.match()).to.deep.equal ([{useCase: 'A2'}]);
			}

			this.assertDoesNotMatches = function (n) {
				this.advice.timeOnPage(n);
				expect(this.advice.match()).to.deep.equal ([]);
			}
		});

		it('shows up when exactly 40 seconds are up', function () {
			this.assertMatches(40);
			this.assertDoesNotMatches(39);
			this.assertDoesNotMatches(41);
		});
	});


	describe('A8', function () {
		beforeEach(function () {
			this.assertBuyout = function (buyout, productionPrice) {
				this.advice = new Advice();
				this.advice.timeOnPage(10);
				this.advice.buyout(buyout);
				const match = this.advice.match();
				this.assertUseCase('A8');
				expect(match[0]).to.have.any.keys({
					spent: productionPrice
				});
			};

			this.assertPrice = function (singleSitePrice) {
				this.advice = new Advice();
				this.advice.timeOnPage(10);
				this.advice.singleSiteLicense(singleSitePrice);
				const match = this.advice.match();
				this.assertUseCase('A8');
				expect(match[0]).to.have.any.keys({
					price: singleSitePrice,
				});
			}
		});

		it('does not match when it was less than 10 seconds on the page', function () {
			this.advice = new Advice();
			this.advice.timeOnPage(9);
			this.assertNoMatch();
		});

		it('calculates production price given buyout price', function () {
			this.assertBuyout(1000, 880);
			this.assertBuyout(2000, 1760);
		});

		it('shows correct price according to single site license price', function () {
			this.assertPrice(67);
			this.assertPrice(128);
		});
	});
});

