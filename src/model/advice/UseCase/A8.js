import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Product from 'model/advice/Context/Product';
import User from 'model/advice/Context/User';
import currencyFormatter from 'currency-formatter';
import Formats from '../../../../config/currencyFormats';

export default class A8 extends AbstractUseCase {
  id = 'A8';

  conditions () {
    return [
      TimeSpentOnPage.seconds(10),
      [Product, 'p'],
      [User, 'u']
    ];
  }

  action (facts) {
    return {
      price : this.currencyFormater(facts.p.singleSite, facts.u.locale),
      spent : this.currencyFormater(Math.floor(facts.p.buyout * 0.88), facts.u.locale)
    };
  }

  currencyFormater (value, locale = 'en') {
    const format = Formats[locale] || Formats['en'];
    const a = currencyFormatter.format(value, format);
    console.info('qqq', a);
    console.info('qqq', format);
    return currencyFormatter.format(value, format);
  }
}
