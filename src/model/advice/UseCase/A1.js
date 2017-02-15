import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Sales from 'model/advice/Condition/Sales';

export default class A1 extends AbstractUseCase {
  id = 'A1';

  conditions () {
    return [
      TimeSpentOnPage.seconds(5),
      Sales.atLeast(10)
    ];
  }

  action (facts) {
    return {
      views: this._getNumberOfViews(facts.p.sales)
    };
  }

  _getNumberOfViews (sales) {
    if (sales < 30) {
      return this._rand(2, 4);
    }

    if (sales < 100) {
      return this._rand(5, 12);
    }

    return this._rand(10, 20);
  }
}
