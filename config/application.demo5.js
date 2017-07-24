const baseConfig = require('./application.base.js');
export default {
  ...baseConfig.default,
  cabinetURL                  : '//account-demo5.templatemonsterdev.com/',
  accountAuthURL              : '//account-demo5.templatemonsterdev.com/auth/',
  authServiceURL              : '//api.templatemonsterdev.com/oauth/',
  accountServiceURL           : '//api.templatemonsterdev.com/users/v1/',
  uploaderServiceURL          : '//api.templatemonsterdev.com/uploads/v1/',
  productsServiceURL          : '//api.templatemonsterdev.com/products/v1/',
  authorServiceURL            : '//api.templatemonsterdev.com/authors/v1/',
  ordersServiceURL            : '//service-orders-demo5.templatemonsterdev.com/api/v1/',
  reviewsServiceURL           : '//api.templatemonsterdev.com/reviews/v1/',
  balancesServiceURL          : '//api.templatemonsterdev.com/balances/v1/',
  monsterURL                  : '//demo5.templatemonsterdev.com/',
  chatURL                     : '//chat.template-help.dev/',
  monsterDomainPlusSubDomains : '.templatemonsterdev.com',
  tmimgcdnURL                 : '//s.tmimgcdn.com/scr/400x400/',
  facebookAppId               : '331138767219958'
};
