import Flow from 'model/advice/Flow';
import UseCase from 'model/advice/UseCase';
import TimeOnPage from 'model/advice/Context/TimeOnPage';
import Product from 'model/advice/Context/Product';

export default class Advice {
  constructor () {
    const name = '' + new Date();
    this.flow = new Flow(name);
    this.flow.addUseCase(UseCase.A1);
    this.flow.addUseCase(UseCase.A2);
    this.flow.addUseCase(UseCase.A8);
  }

  timeOnPage (n) {
    this.flow.replace(TimeOnPage.seconds(n));
  }

  numberOfSales (n) {
    this.flow.swap(Product, function (p) {
      p.sales = n;
    });
  }

  buyout (price) {
    this.flow.swap(Product, function (p) {
      p.buyout = price;
    });
  }

  singleSiteLicense (price) {
    this.flow.swap(Product, function (p) {
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
