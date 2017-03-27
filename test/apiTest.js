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

      return [useCases, _.intersection(useCases, found)];
    };

    this.assertUseCase = (useCase, done = _.noop) => {
      this.advice.match().then((matches) => {
        const [ucase, intersection] = this._foundAmong(useCase, matches);
        expect(intersection).to.deep.equal(ucase);
      }).then(done);
    };

    this.assertNoMatch = (useCase, done = _.noop) => {
      this.advice.match().then((match) => {
        const [, intersection] = this._foundAmong(useCase, match);
        expect(intersection).to.deep.equal([]);
        done();
      });
    };

    this.getUseCase = search => {
      return new Promise((resolve, reject) => {
        this.advice.match().then((match) => {
          const trueMatch = _.find(match, item => {
            return item.useCase === search;
          });
          resolve(trueMatch);
        }).catch(res => {
          reject(res);
        });
      });
    };
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
      this.advice.numberOfSales(10);
      this.assertHasBeenWatchedTimes = function (t, n) {
        this.advice.assert(TimeOnPage.seconds(t));
        this.advice.assert(new Product(n));
      };

      this.willCreateTimeAndSalesCount = function (a, b, done) {
        this.advice.match().then(function (match) {
          let hasBeenWatched;
          if (typeof match[0] !== 'undefined') {
            hasBeenWatched = match[0].views;
            expect(hasBeenWatched).to.not.be.undefined;
            expect(hasBeenWatched).to.be.at.least(a);
            expect(hasBeenWatched).to.be.at.most(b);
            done();
          }
        });
      };
    });

    it('matches nothing if number of sales is too low', function (done) {
      this.willCreateTimeAndSalesCount(10, 10);
      this.assertUseCase([], done);
    });

    it('returns A1 when it matches the conditions', function (done) {
      this.assertHasBeenWatchedTimes(10, 15);
      this.assertUseCase('A1');
      this.willCreateTimeAndSalesCount(2, 4, done);
    });
  });

  describe('A2', function () {
    it('shows up when exactly 40 seconds are up', function (done) {
      this.advice.timeOnPage(40);
      this.assertUseCase('A2', done);
    });

    it('does not match when the time is wrong', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A2', done);
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
    beforeEach(function () {
      this.advice.timeOnPage(10);
      this.advice.userCountry('US');
      this.advice.numberOfSales(50);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A5', done);
    });

    it('does not show up when the country differs', function (done) {
      this.advice.userCountry('CA');
      this.assertNoMatch('A5', done);
    });

    it('does not show up when the number of sales is less than 50', function (done) {
      this.advice.numberOfSales(49);
      this.assertNoMatch('A5', done);
    });

    it('show correct watch now count', function (done) {
      this.getUseCase('A5').then(match => {
        expect(match.watch).to.be.equal(8);
        done();
      });
    });
  });

  describe('A6', function () {
    beforeEach(function () {
      this.advice.timeOnPage(10);
      this.advice.numberOfSales(50);
    });

    it('does not match when it was less than 10 seconds on the page', function (done) {
      this.advice.timeOnPage(9);
      this.assertNoMatch('A6', done);
    });

    it('does not match when it was less after 10 seconds on the page', function (done) {
      this.advice.timeOnPage(11);
      this.assertNoMatch('A6', done);
    });

    it('does not match when it was less than 50 downloads', function (done) {
      this.advice.numberOfSales(49);
      this.assertNoMatch('A6', done);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A6', done);
    });

    it('can be found when the download more 50', function (done) {
      this.advice.numberOfSales(60);
      this.assertUseCase('A6', done);
    });

    it('show correct data', function (done) {
      this.getUseCase('A6').then(match => {
        expect(match.hours).to.be.within(2, 4);
        done();
      });
    });
  });

  describe('A7', function () {
    beforeEach(function () {
      this.advice.timeOnPage(15);
      this.advice.numberOfSales(100);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A7', done);
    });

    it('does not match when it was less than 15 seconds on the page', function (done) {
      this.advice.timeOnPage(14);
      this.assertNoMatch('A7', done);
    });

    it('does not match when it was less after 15 seconds on the page', function (done) {
      this.advice.timeOnPage(16);
      this.assertNoMatch('A7', done);
    });

    it('does not match when it was less than 100 downloads', function (done) {
      this.advice.numberOfSales(99);
      this.assertNoMatch('A7', done);
    });

    it('does not match when it was less than 100 downloads', function (done) {
      this.advice.numberOfSales(101);
      this.assertUseCase('A7', done);
    });

    it('show correct data', function (done) {
      this.getUseCase('A7').then(match => {
        expect(match.sales).to.be.equal(4);
        done();
      });
    });
  });

  describe('A8', function () {
    beforeEach(function () {
      this.willHaveSingleSitePrice = function (price, locale = 'en') {
        this.advice.timeOnPage(10);
        this.advice.singleSiteLicense(price);
        this.advice.userLocale(locale);
      };

      this.willHaveBuyoutPrice = function (price, locale = 'en') {
        this.advice.timeOnPage(10);
        this.advice.buyout(price);
        this.advice.userLocale(locale);
      };

      this.assertBuyout = function (productionPrice, done = _.noop) {
        this.advice.match().then((match) => {
          expect(_.get(match, [0, 'spent'])).to.equal(productionPrice);
          done();
        });
      };

      this.assertPrice = function (singleSitePrice, done = _.noop) {
        this.advice.match().then((match) => {
          expect(match[0]).to.have.any.keys({
            price: singleSitePrice
          });
          done();
        });
      };
    });

    it('does not match when it was less than 10 seconds on the page', function (done) {
      this.advice.timeOnPage(9);
      this.assertNoMatch('A8', done);
    });

    it('calculates production price given buyout price', function (done) {
      this.willHaveBuyoutPrice(1000);
      this.assertBuyout('$880', done);
    });

    it('returns correct price for a 2000 buyout with locale en', function (done) {
      this.willHaveBuyoutPrice(2000);
      this.assertBuyout('$1.760', done);
    });

    it('returns correct price for a 2000 buyout with locale ru', function (done) {
      this.willHaveBuyoutPrice(2000, 'ru');
      this.assertBuyout('1,760 $', done);
    });

    it('returns correct price for a 2000 buyout with locale de', function (done) {
      this.willHaveBuyoutPrice(2000, 'de');
      this.assertBuyout('1,760 €', done);
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

  describe('A9', function () {
    beforeEach(function () {
      this.advice.timeOnPage(40);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A9', done);
    });

    it('does not match when it was less than 40 seconds on the page', function (done) {
      this.advice.timeOnPage(39);
      this.assertNoMatch('A9', done);
    });

    it('does not match when it was less after 40 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A9', done);
    });
  });

  describe('A10', function () {
    beforeEach(function () {
      this.advice.timeOnPage(25);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A10', done);
    });

    it('does not match when it was less than 25 seconds on the page', function (done) {
      this.advice.timeOnPage(24);
      this.assertNoMatch('A10', done);
    });

    it('does not match when it was less after 25 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A10', done);
    });
  });

  describe('A11', function () {
    beforeEach(function () {
      this.advice.timeOnPage(35);
      this.advice.userPurchaseCount(0);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A11', done);
    });

    it('does not match when it was less than 35 seconds on the page', function (done) {
      this.advice.timeOnPage(24);
      this.assertNoMatch('A11', done);
    });

    it('does not match when it was less after 35 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A11', done);
    });

    it('does not appear when the user has bought at least once from us', function (done) {
      this.advice.userPurchaseCount(2);
      this.assertNoMatch('A11', done);
    });
  });

  describe('A12', function () {
    beforeEach(function () {
      this.advice.timeOnPage(40);
      this.advice.numberOfSales(50);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A12', done);
    });

    it('does not match when it was less than 40 seconds on the page', function (done) {
      this.advice.timeOnPage(24);
      this.assertNoMatch('A12', done);
    });

    it('does not match when it was less after 40 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A12', done);
    });

    it('show correct data', function (done) {
      this.getUseCase('A12').then(match => {
        expect(match.sales).to.be.equal(50);
        done();
      });
    });
  });

  describe('A13', function () {
    beforeEach(function () {
      this.advice.timeOnPage(30);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A13', done);
    });

    it('does not match when it was less than 30 seconds on the page', function (done) {
      this.advice.timeOnPage(24);
      this.assertNoMatch('A13', done);
    });

    it('does not match when it was less after 30 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A13', done);
    });
  });

  describe('A14-17', function () {
    beforeEach(function () {
      this.advice.timeOnPage(20);
    });

    it('can be found when the time is right', function (done) {
      this.assertUseCase('A14');
      this.assertUseCase('A15');
      this.assertUseCase('A16');
      this.assertUseCase('A17', done);
    });

    it('does not match when it was less than 20 seconds on the page', function (done) {
      this.advice.timeOnPage(14);
      this.assertNoMatch('A14');
      this.assertNoMatch('A15');
      this.assertNoMatch('A16');
      this.assertNoMatch('A17', done);
    });

    it('does not match when it was less after 20 seconds on the page', function (done) {
      this.advice.timeOnPage(41);
      this.assertNoMatch('A14');
      this.assertNoMatch('A15');
      this.assertNoMatch('A16');
      this.assertNoMatch('A17', done);
    });
  });
});

