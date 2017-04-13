import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import NoPurchases from 'model/advice/Condition/NoPurchases';

export default class A4 extends AbstractUseCase {
  id = 'A4';

  conditions () {
    return [
      TimeSpentOnPage.seconds(35),
      NoPurchases.create()
    ];
  }

  action (facts) {
    return {};
  }
}
