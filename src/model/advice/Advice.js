import Flow from 'model/advice/Flow';
import UseCase from 'model/advice/UseCase';
import _ from 'lodash';
import * as Context from 'model/advice/Context';

export default class Advice {
  constructor () {
    const name = '' + new Date();
    this.flow = new Flow(name);

    _.each(UseCase, (e) => {
      this.flow.addUseCase(e);
    });
  }

  timeOnPage (n) {
    this.flow.replace(Context.TimeOnPage.seconds(n));
  }

  userCountry (s) {
    this.flow.swap(Context.User, function (user) {
      user.country = s;
    });
  }

  userPurchaseCount (n) {
    this.flow.swap(Context.User, function (user) {
      user.purchases = n;
    });
  }

  numberOfSales (n) {
    this.flow.swap(Context.Product, function (p) {
      p.sales = n;
    });
  }

  buyout (price) {
    this.flow.swap(Context.Product, function (p) {
      p.buyout = price;
    });
  }

  singleSiteLicense (price) {
    this.flow.swap(Context.Product, function (p) {
      p.singleSite = price;
    });
  }

  assert (fact) {
    this.flow.assert(fact);
  }

  getFacts () {
    return this.flow.getFacts();
  }

  match () {
    return this.flow.match();
  }
}
