import _ from 'lodash';
import Advice from 'model/advice/Advice';
import TimeOnPage from 'model/advice/Context/TimeOnPage';
import Product from 'model/advice/Context/Product';
import {expect} from 'chai';


describe('js api', function () {
	beforeEach(function () {
		this.advice = new Advice();

		this._foundAmong = function (useCases, matches) {
			useCases = _.isArray(useCases) ? useCases : [useCases];

			const found = _.map(matches, function (obj) {
				return obj.useCase;
			});

			return [useCases, _.intersection(useCases, found)]
		};

		this.assertUseCase = (useCase, done = _.noop) => {
			this.advice.match().then((matches) => {
				const [ucase, intersection] = this._foundAmong(useCase, matches);
				expect(intersection).to.deep.equal(ucase);
			}).then(done);
		};

		this.assertNoMatch = (useCase, done) => {
			this.advice.match().then((match) => {
				const [, intersection] = this._foundAmong(useCase, match);
				expect(intersection).to.deep.equal([]);
				done();
			})
		}
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

			this.assertHasBeenWatchedTimes = function (a, b, done) {
				this.advice.match().then(function (match) {
					const hasBeenWatched = match[0].views;
					expect(hasBeenWatched).to.not.be.undefined;

					expect(hasBeenWatched).to.be.at.least(a);
					expect(hasBeenWatched).to.be.at.most(b);
					done();
				});
			}
		});

		it('matches nothing if number of sales is too low', function (done) {
			this.willCreateTimeAndSalesCount(5, 5);
			this.assertUseCase([], done)
		});

		it('returns A1 when it matches the conditions', function (done) {
			this.willCreateTimeAndSalesCount(5, 15);

			this.assertUseCase('A1');
			this.assertHasBeenWatchedTimes(2, 4, done);
		});
	});


	describe('A2', function () {
		it('shows up when exactly 40 seconds are up', function (done) {
			this.advice.timeOnPage(40);
			this.assertUseCase('A2', done);
		});

		it('does not match when the time is wrong', function (done) {
			this.advice.timeOnPage(41);
			this.assertNoMatch('A2', done)
		});

	});


	describe('A4', function () {
		it('can be found when the time is right', function () {
			this.advice.timeOnPage(35);
			this.advice.userPurchaseCount(0);
			this.assertUseCase('A4');
		});

		it('does not appear when the time is not favorable', function (done) {
			this.advice.timeOnPage(15);
			this.advice.userPurchaseCount(0);
			this.assertNoMatch('A4', done);
		});

		it('does not appear when the user has bought at least once from us', function (done) {
			this.advice.timeOnPage(35);
			this.advice.userPurchaseCount(1);
			this.assertNoMatch('A4', done);
		});
	});


	describe('A5', function () {
		it('can be found when the time is right', function (done) {
			this.advice.timeOnPage(10);
			this.advice.userCountry('US');
			this.advice.numberOfSales(50);

			this.assertUseCase('A5', done);
		});

		it('does not show up when the country differs', function (done) {
			this.advice.timeOnPage(10);
			this.advice.numberOfSales(50);
			this.advice.userCountry('CA');
			this.assertNoMatch('A5', done);
		});

		it('does not show up when the number of sales is less than 50', function (done) {
			this.advice.timeOnPage(10);
			this.advice.numberOfSales(49);
			this.advice.userCountry('US');

			this.assertNoMatch('A5', done);
		});

	});

	describe('A8', function () {
		beforeEach(function () {
			this.willHaveSingleSitePrice = function (price) {
				this.advice.timeOnPage(10);
				this.advice.singleSiteLicense(price);
			};

			this.willHaveBuyoutPrice = function (price) {
				this.advice.timeOnPage(10);
				this.advice.buyout(price);
			};


			this.assertBuyout = function (productionPrice, done = _.noop) {
				this.advice.match()
					.then((match) => {
						expect(_.get(match, [0, "spent"])).to.equal(productionPrice);
						done();
					});
			};

			this.assertPrice = function (singleSitePrice, done = _.noop) {
				this.advice.match().then((match)=> {
					expect(match[0]).to.have.any.keys({
						price: singleSitePrice,
					});
					done();
				})
			}
		});

		it('does not match when it was less than 10 seconds on the page', function (done) {
			this.advice.timeOnPage(9);
			this.assertNoMatch('A8', done);
		});


		it('calculates production price given buyout price', function (done) {
			this.willHaveBuyoutPrice(1000);
			this.assertBuyout(880, done);
		});

		it('returns correct price for a 2000 buyout', function (done) {
			this.willHaveBuyoutPrice(2000);
			this.assertBuyout(1760, done);
		});


		it('shows correct price according to single site license price', function (done) {
			this.willHaveSingleSitePrice(67);
			this.assertUseCase('A8', done);
		});

		it('test', function (done) {
			this.willHaveSingleSitePrice(128);
			this.assertUseCase('A8', done);
		});
	});
});

