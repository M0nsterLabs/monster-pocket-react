import AbstractUseCase from 'model/advice/UseCase/AbstractUseCase';
import TimeSpentOnPage from 'model/advice/Condition/TimeSpentOnPage';
import Product from 'model/advice/Context/Product';


export default class A12 extends AbstractUseCase {
  id = 'A12';

  conditions () {
    return [
      TimeSpentOnPage.seconds(40),
      [Product, 'p']
    ];
  }

  action (facts) {
    return {
      sales: facts.p.sales
    };
  }
}
