import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Sales from 'model/advice/Condition/Sales';

export default class A7 extends AbstractUseCase {
  id = 'A7';

  conditions () {
    return [
      TimeSpentOnPage.seconds(15),
      Sales.atLeast(100)
    ];
  }

  action (facts) {
    return {
      sales: this._getSaleOfLastDay(facts.p.sales)
    };
  }

  _getSaleOfLastDay (sales) {
    return Math.floor(parseInt(sales) * 0.04);
  }
}
