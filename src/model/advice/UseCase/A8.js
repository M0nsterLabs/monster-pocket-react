import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Product from 'model/advice/Context/Product';

export default class A8 extends AbstractUseCase {
  id = 'A8';

  conditions () {
    return [
      TimeSpentOnPage.seconds(10),
      [Product, 'p']
    ];
  }

  action (facts) {
    return {
      price : facts.p.singleSite,
      spent : Math.floor(facts.p.buyout * 0.88)
    };
  }
}
