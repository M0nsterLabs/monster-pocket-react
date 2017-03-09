import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';

export default class A13 extends AbstractUseCase {
  id = 'A13';

  conditions () {
    return [
      TimeSpentOnPage.seconds(30)
    ];
  }

  action (facts) {
    return {};
  }
}
