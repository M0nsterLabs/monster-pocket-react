import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A9 extends AbstractUseCase {
  id = 'A9';

  conditions () {
    return [
      TimeSpentOnPage.seconds(40)
    ];
  }

  action (facts) {
    return {};
  }
}
