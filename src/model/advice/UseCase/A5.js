import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import CountryOfOrigin from 'model/advice/Condition/CountryOfOrigin';
import Sales from 'model/advice/Condition/Sales';
export default class A5 extends AbstractUseCase {
  id = 'A5';

  conditions () {
    return [
      TimeSpentOnPage.seconds(10),
      Sales.atLeast(50),
      CountryOfOrigin.equals('US')
    ];
  }

  action (facts) {
    return {
      watch: this._getWatchNowCount(facts.p.sales)
    };
  }

  _getWatchNowCount (sales) {
    return Math.floor(parseInt(sales) * 0.16);
  }
}
