const baseConfig = require('./application.base.js');
export default {
  ...baseConfig.default,
  cabinetURL                  : '//account.templatemonster.com/',
  authServiceURL              : '//api.templatemonster.com/oauth/',
  accountAuthURL              : '//account.templatemonster.com/auth/',
  accountServiceURL           : '//api.templatemonster.com/users/v1/',
  uploaderServiceURL          : '//api.templatemonster.com/uploads/v1/',
  productsServiceURL          : '//api.templatemonster.com/products/v1/',
  authorServiceURL            : '//api.templatemonster.com/authors/v1/',
  ordersServiceURL            : '//api.templatemonster.com/orders/v1/',
  reviewsServiceURL           : '//api.templatemonster.com/reviews/v1/',
  balancesServiceURL          : '//api.templatemonster.com/balances/v1/',
  monsterURL                  : '//www.templatemonster.com/',
  chatURL                     : '//chat.template-help.com/',
  monsterDomainPlusSubDomains : '.templatemonster.com',
  tmimgcdnURL                 : '//s.tmimgcdn.com/scr/400x400/',
  facebookAppId               : '128293383907353'
};
