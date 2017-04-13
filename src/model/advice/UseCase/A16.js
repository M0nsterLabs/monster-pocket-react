import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A16 extends AbstractUseCase {
  id = 'A16';

  conditions () {
    return [
      TimeSpentOnPage.seconds(20)
    ];
  }

  action (facts) {
    return {};
  }
}
