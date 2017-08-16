const baseConfig = require('./application.base.js');
export default {
  ...baseConfig.default,
  authServiceURL: '//api.templatemonsterdev.com/oauth/',
  accountServiceURL: '//api.templatemonsterdev.com/users/v1/',
  uploaderServiceURL: '//api.templatemonsterdev.com/uploads/v1/',
  productsServiceURL: '//api.templatemonsterdev.com/products/v1/',
  authorServiceURL: '//api.templatemonsterdev.com/authors/v1/',
  ordersServiceURL: '//api.templatemonsterdev.com/orders/v1/',
  reviewsServiceURL: '//api.templatemonsterdev.com/reviews/v1/',
  balancesServiceURL: '//api.templatemonsterdev.com/balances/v1/',
  monsterURL: '//www.templatemonsterdev.com/',
  chatURL: '//chat.template-help.dev/',
  tmimgcdnURL: '//s.tmimgcdn.com/scr/400x400/',
  facebookAppId: '1449028418459900'
};
