import React                        from 'react';
import Config                       from 'config.js';
import _                            from 'lodash';
import PropTypes                    from 'prop-types';
import ContentEmptyMessage          from 'components/ContentEmptyMessage/';
import L1                           from 'quark/lib/loaders/L1';
import B2E                          from 'quark/lib/buttons/B2E';

import ReviewsData                  from 'plasma-reviews-api-client-js';
import ProductsData                 from 'tm-products-api-client-js';

import ReviewItem                   from './ReviewItem';
import ReviewEditor                 from './ReviewEditor';

import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale,
  getResponseJSON
} from 'utils/';

import './Reviews.less';

const LOCALE = getCurrentLocale();
let reviews = new ReviewsData(Config.reviewsServiceURL, LOCALE);
let products = new ProductsData(Config.productsServiceURL, LOCALE);
const STATUS_INITIAL = 'initial';
const STATUS_PENDING = 'pending';
const STATUS_DECLINED = 'declined';
const STATUS_APPROVED = 'approved';
const LOCALES_NO_UNIQUE = [LOCALE, 'en', 'es', 'ru', 'de', 'pl', 'it', 'tr', 'fr', 'pt-br', 'nl', 'cn', 'cz', 'ua', 'hu', 'sv'];
const LOCALES = [...new Set(LOCALES_NO_UNIQUE)];

export default class Reviews extends React.Component {
  static propTypes = {
    templateId  : PropTypes.number.isRequired,
    accessToken : PropTypes.string
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    isFetching : false,
    isEmpty    : false,
    reviews    : {
      totalCount: 0
    },
    products               : {},
    userReview             : {},
    userProducts           : {},
    user                   : {},
    templateUrl            : '',
    userName               : '',
    userMail               : '',
    authorId               : 0,
    countReviewOtherLocale : 0,
    otherLocale            : false,
    showMoreVisible        : false
  };

  constructor (props) {
    super(props);

    this.templateName = '';
    this.imageUrl = '';
    this.iteratorLocale = 0;
    this.countReview = 0;
    this.updateUserReview = this.updateUserReview.bind(this);
  }

  updateUserReview (item) {
    this.setState({
      userReview: item
    });
  };

  renderNotification = (status) => {
    if (status === STATUS_PENDING) {
      return (<div className="template-review__message review-message review-message_progress">
        <i className="review-message__icon tm-icon icon-sand-clock"/>
        <p className="review-message__text t3">{this.context.i18n.l('The review is visible only for you. Sorry, but we need to check your review before publication. In case your review corresponds to our rules, it will be published soon :)')}
        </p>
        <div className="review-message__triangle review-message__triangle_progress"></div>
      </div>);
    } else if (status === STATUS_DECLINED) {
      return (<div className="template-review__message review-message review-message_declined">
        <i className="review-message__icon tm-icon icon-sand-clock"/>
        <p className="review-message__text t3">{this.context.i18n.l('Unfortunately, we can’t post your review because it doesn’t meet our guidelines, please try again with another review.')}
        </p>
        <div className="review-message__triangle review-message__triangle_declined"></div>
      </div>);
    } else {
      return '';
    }
  };

  renderReviews = () => {
    if (this.state.reviews.items && this.state.products.products) {
      return (
        this.state.reviews.items.map((review) => {
          return (
            <li className="reviews__item reviews__item_my-reviews review__content" key={review.id}>
              <ReviewItem
                userAvatar    = {review.avatar}
                userName      = {review.user_name}
                reviewScore   = {review.score}
                reviewContent = {review.content}
                reviewDate    = {review.created_at}
                reviewFlag    = {review.locale}
                reviewId      = {review.id}
                accessToken   = {this.props.accessToken}
                moderatorName = {this.state.user.userName}
                moderatorAva  = {this.state.user.avatar}
                moderatorMail = {this.state.userMail}
                comments      = {review.comments}
              />
            </li>
          );
        })
      );
    }
  };

  renderReviewEditor = () => {
    if (this.state.userReview.status === STATUS_INITIAL || this.state.userReview.status === STATUS_DECLINED || this.state.userReview.status === STATUS_PENDING) {
      return (
        <ReviewEditor
          userMail={this.state.userMail}
          promocode={this.promocode}
          templateName={this.templateName}
          templateUrl={this.state.templateUrl}
          imageUrl={this.imageUrl}
          authorId={this.state.authorId}
          userReview={this.state.userReview}
          accessToken={this.props.accessToken}
          updateUserReview={this.updateUserReview}
          statusReview={this.state.userReview.status}
          scoreReview={this.state.userReview.score}
        />
      );
    } else if (this.state.userReview.status !== STATUS_INITIAL
      && this.state.userReview.status !== STATUS_DECLINED
      && this.state.userReview.status !== STATUS_PENDING
      && this.state.userReview.status !== STATUS_APPROVED
    ) {
      return (
        <p className="reviews-info-msg t1">
          <span className="tm-icon icon-star-filled"> </span>
          Only buyers of that product can rate it
        </p>
      )
    }
    return null;
  };

  renderMyReviews = () => {
    if (_.isEmpty(this.state.userReview)) {return;}
    if (this.state.userReview.status !== STATUS_APPROVED) {return;}
    if (this.state.userReview.status !== STATUS_INITIAL) {return;}

    return (
      <li className="reviews__item reviews__item_my-reviews review__content" key={this.state.userReview.id}>
        <ReviewItem
          userAvatar    = {this.state.user.avatar}
          userName      = {this.state.user.userName}
          reviewScore   = {this.state.userReview.score}
          reviewContent = {this.state.userReview.content}
          userMail      = {this.state.userMail}
          reviewDate    = {this.state.userReview.created_at}
          reviewFlag    = {this.state.userReview.locale}
          reviewId      = {this.state.userReview.id}
          accessToken   = {this.props.accessToken}
          moderatorName = {this.state.user.userName}
          moderatorAva  = {this.state.user.avatar}
          moderatorMail = {this.state.userMail}
          comments      = {this.state.userReview.comments}
          status        = {this.state.userReview.status}
        />
        {this.renderNotification(this.state.userReview.status)}
      </li>
    );
  };

  // Get reviews on template
  getReviews = (locale) => {
    let reviews = new ReviewsData(Config.reviewsServiceURL, locale);
    let products = new ProductsData(Config.productsServiceURL, LOCALE);

    return this.getReviewsData(reviews, products, {
      'template_id' : this.props.templateId,
      'sort'        : 'id DESC',
      'per-page'    : 10,
      'expand'      : 'comments'
    });
  };

  getReviewsData = (reviews, products, params = {}) => {
    this.setState({
      isFetching: true
    });
    const paginationData   = {};
    const currentState = this.state.reviews;
    let itemsReview;
    if (this.shouldFetchDataItems(currentState)) {
      const requestPageIndex = currentState.currentPageIndex + 1 || 1;
      params = {
        ...params,
        'page': requestPageIndex
      };

      reviews.getReviews(params)
        .then((data) => {
        paginationData.currentPageIndex = data.currentPageIndex;
        paginationData.lastPageIndex = data.lastPageIndex;
        paginationData.totalCount = data.totalCount;

        if (paginationData.totalCount > 10) {
          this.setState({
            showMoreVisible: true
          })
        }
        this.countReview += data.totalCount;

        itemsReview = this.state.reviews.items ? [...this.state.reviews.items, ...data.items] : data.items;
        const ids = _.uniq(itemsReview.map((item, i) => {
          //Get user avatar
          fetch(`${Config.accountServiceURL}users/${item.user_id}/profile`, {
            method: 'get'
          }).then(getResponseJSON)
          .then((data) => {
            itemsReview[i]['avatar'] = data.avatar;
          });

          return item.template_id;
        }));
        if (this.countReview === 0 && !this.state.otherLocale) {
          this.iteratorLocale++;
          if (this.iteratorLocale < 2) {
            this.getReviews(LOCALES[this.iteratorLocale]);
            this.setState({
              isFetching: false
            });
          } else {
            reviews = new ReviewsData(Config.reviewsServiceURL, `IN_${LOCALES}`);
            this.getCountReviewsOtherLocale(reviews, {
              'template_id': this.props.templateId
            });
          }
        } else if (ids.length) {
          products.getProducts(ids).then((products) => {
            this.setState({
              products: {
                ...this.state.products,
                ...products
              },
              reviews: {
                ...this.state.reviews,
                items      : itemsReview,
                ...paginationData,
                totalCount : paginationData.totalCount
              },
              isFetching: false
            });
          });
        }
      })
        .then(() => {
          if (paginationData.currentPageIndex === paginationData.lastPageIndex) {
            this.setState({
              showMoreVisible: false
            })
          }
        });
    } else {
      this.setState({
        isFetching: false
      });
    }
  };
  // /Get reviews on template

  // Get count of reviews from other locale
  getCountReviewsOtherLocale = (reviews, params = {}) => {
    params = {
      ...params
    };
    reviews.getReviews(params).then((data) => {
      this.setState({
        countReviewOtherLocale: this.state.countReviewOtherLocale + data.totalCount
      });
    });
  };

  getUserData = (userId) => {
    fetch(`${Config.accountServiceURL}users/${userId}/profile`, {
      method: 'get'
    }).then(getResponseJSON)
    .then((data) => {
      this.setState({
        user: {
          userName : data.userName,
          avatar   : data.avatar
        }
      });
    });
  };

  // Get reviews of user on template
  getReviewsUser = () => {
    return this.getReviewsUserData({
      'template_id'  : this.props.templateId,
      'access_token' : this.props.accessToken
    });
  };

  getReviewsUserData = (params = {}) => {
    let reviews = new ReviewsData(Config.reviewsServiceURL);
    reviews.getReviewsUser(params).then((data) => {
      if (data.items.length > 0) {
        this.setState({
          userReview: data.items[0]
        });
      }
    }).then(() => {
      if (!_.isEmpty(this.state.userReview)) {
        this.getUserData(this.state.userReview.user_id);
      }
    });
  };
  // Get reviews of user on template

  // Product data of template
  getProductUser = () => {
    const ids = [this.props.templateId];
    return this.getProductUserData(ids);
  };

  getProductUserData = (ids) => {
    products.getProducts(ids).then((product) => {
      const size = {
        width  : 400,
        height : 400
      };
      this.templateName = product[0].templateFullTitle;
      this.imageUrl = getCdnImageUrl(product[0].templateId, product[0].screenshots, 'original', size) || '';
      this.setState({
        productUserData : product[0],
        templateUrl     : this.state.templateUrl,
        authorId        : product[0].aid
      });
    });
  };
  // Product data of template

  // Template Url
  getTemplateUrl = (locale) => {
    fetch(`${Config.monsterURL}api/${locale}/template/${this.props.templateId}/`, {
      method: 'get'
    }).then(getResponseJSON)
    .then((data) => {
      this.setState({
        templateUrl: data.url
      });
    });
  };

  // Get auth-user email
  getUserProfile = () => {
    fetch(`${Config.accountServiceURL}users/profile`, {
      method  : 'get',
      headers : {
        'Authorization': this.props.accessToken
      }
    })
    .then(getResponseJSON)
    .then((data) => {
      this.setState({
        userMail: data.login
      });
    });
  };

  shouldFetchDataItems = (currentState) => {
    const currentItemsCount = currentState.items ? currentState.items.length : 0;
    const totalItemsCount   = currentState.totalCount;
    return currentItemsCount === 0 || currentItemsCount < totalItemsCount;
  };

  componentDidMount () {
    this.state.products.products = [];
    if (this.props.accessToken) {
      this.getReviewsUser();
      this.getUserProfile();
    }
    this.getReviews(LOCALES[this.iteratorLocale]);
    this.getProductUser();
    this.getTemplateUrl(LOCALE);
  };

  loadDownloads = () => {
   if (this.state.reviews.totalCount > 0 && this.state.isFetching !== true) {
     if (this.state.countReviewOtherLocale > 0) {
       return this.getReviews(`IN_${LOCALES}`);
     } else {
       return this.getReviews(LOCALES[this.iteratorLocale]);
     }
   }
  };

  otherLocale = () => {
    this.setState({
      otherLocale: true
    });
    this.getReviews(`IN_${LOCALES}`);
  };

  renderContentEmptyPage = () => {
    return (
      <ContentEmptyMessage
        page        = {'reviews'}
        show        = {this.state.isEmpty}
        description = {this.context.i18n.l(`It seems there are no reviews to this product from your locale.
                                You can look at the reviews from other locales.`)}
        isButton    = {this.state.countReviewOtherLocale > 0}
        buttonText  = {this.context.i18n.l(`View ${this.state.countReviewOtherLocale} Reviews From Other Locales`)}
        buttonClick = {this.otherLocale}
      />
    )
  };

  renderEmptyPage = () => {
    return (
      this.state.userReview.status === STATUS_INITIAL
        ? <div>
            {this.renderReviewEditor()}
            {this.renderContentEmptyPage()}
          </div>
        :
          this.renderContentEmptyPage()
    )
  };

  render () {
    return (
      <div className="page-content"><span className="reviews__count">{this.state.reviews.totalCount}</span>
        {
          this.state.reviews.totalCount === 0 && this.state.isFetching
            ? (
              <L1 className="content-loader" />
            )
            : (this.state.reviews.totalCount === 0
              ? (
                <div className="page-content__empty">
                  <h2 className="h3">{this.context.i18n.l('REVIEWS & RATINGS')}</h2>
                  {
                    (
                    this.state.userReview.status === STATUS_DECLINED ||
                    this.state.userReview.status === STATUS_PENDING)
                      ? (
                        <div className="reviews">
                          <ul className="reviews__list">
                            {this.renderMyReviews()}
                          </ul>
                        </div>
                      )
                      : this.renderEmptyPage()
                  }
                </div>
                )
              : (
                <div className="reviews">
                  <h2 className="h3">{this.context.i18n.l(`${this.state.reviews.totalCount} REVIEWS & RATINGS`)}</h2>
                  {this.renderReviewEditor()}

                  <ul className="reviews__list">
                    {this.renderMyReviews()}
                    {this.renderReviews()}
                  </ul>

                  {this.state.showMoreVisible && (
                    <B2E
                      className = "reviews__btn"
                      id        = "show-more-reviews"
                      onClick   = {this.loadDownloads}
                      disabled  = {this.state.isFetching}
                      isLoading = {this.state.isFetching}
                    >
                      {this.state.isFetching ? (
                        <L1 />
                      ) : (
                        this.context.i18n.l('Show more')
                      )}
                    </B2E>
                  )}
                </div>
                )
            )
        }
      </div>
    );
  }
}
