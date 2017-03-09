import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A10 extends AbstractUseCase {
  id = 'A10';

  conditions () {
    return [
      TimeSpentOnPage.seconds(25)
    ];
  }

  action (facts) {
    return {};
  }
}
