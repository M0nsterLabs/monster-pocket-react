import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A15 extends AbstractUseCase {
  id = 'A15';

  conditions () {
    return [
      TimeSpentOnPage.seconds(20)
    ];
  }

  action (facts) {
    return {};
  }
}
