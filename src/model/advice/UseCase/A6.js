import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Sales from 'model/advice/Condition/Sales';

export default class A6 extends AbstractUseCase {
  id = 'A6';

  conditions () {
    return [
      TimeSpentOnPage.seconds(10),
      Sales.atLeast(50)
    ];
  }

  action (facts) {
    return {
      hours: this._rand(1, 5)
    };
  }
}
