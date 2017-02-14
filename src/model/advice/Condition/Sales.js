import Product from 'model/advice/Context/Product';

export default class Sales {
  static atLeast (n) {
    return [
      Product, 'p', 'p.sales >= ' + n
    ];
  }
}
