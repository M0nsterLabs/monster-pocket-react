const baseConfig = require('./application.base.js');
export default {
  ...baseConfig.default,
  cabinetURL                  : '//betaaccount.templatemonster.com/',
  authServiceURL              : '//betaapi.templatemonster.com/oauth/',
  accountAuthURL              : '//betaaccount.templatemonster.com/auth/',
  accountServiceURL           : '//betaapi.templatemonster.com/users/v1/',
  uploaderServiceURL          : '//betaapi.templatemonster.com/uploads/v1/',
  productsServiceURL          : '//api.templatemonster.com/products/v1/',
  authorServiceURL            : '//betaapi.templatemonster.com/authors/v1/',
  ordersServiceURL            : '//betaapi.templatemonster.com/orders/v1/',
  reviewsServiceURL           : '//betaapi.templatemonster.com/reviews/v1/',
  balancesServiceURL          : '//betaapi.templatemonster.com/balances/v1/',
  monsterURL                  : '//beta.templatemonster.com/',
  chatURL                     : '//chat.template-help.com/',
  monsterDomainPlusSubDomains : '.templatemonster.com',
  tmimgcdnURL                 : '//s.tmimgcdn.com/scr/400x400/',
  facebookAppId               : '331138767219958'
};
