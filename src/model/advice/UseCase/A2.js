import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A2 extends AbstractUseCase {
  id = 'A2';

  conditions () {
    return [
      TimeSpentOnPage.seconds(40)
    ];
  }

  action (facts) {
    return {};
  }
}
