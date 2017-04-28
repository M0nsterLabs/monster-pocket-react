import React                        from 'react';
import Config                       from 'config.js';
import _                            from 'lodash';
import PropTypes                    from 'prop-types';
import ContentLoader                from 'components/ContentLoader/';
import ContentEmptyMessage          from 'components/ContentEmptyMessage/';
import L1                           from 'quark/lib/loaders/L1';

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

const LOCALE = 'ru';//getCurrentLocale();
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
    templateId  : React.PropTypes.number.isRequired,
    accessToken : React.PropTypes.string
  };

  static contextTypes = {
    i18n: React.PropTypes.object
  };

  state = {
    isFetching             : true,
    isEmpty                : false,
    reviews                : {
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
    otherLocale            : false
  };

  constructor (props) {
    super(props);

    this.templateName = '';
    this.imageUrl = '';
    this.iteratorLocale = 0;
    this.countReview = 0;
    this.updateUserReview = this.updateUserReview.bind(this);
  }

  updateUserReview(item){
    this.setState({
      userReview : item
    });
  };

  renderNotification = (status) => {
    if (status === STATUS_PENDING) {
      return (<div className="template-review__message review-message review-message_progress">
        <i className="review-message__icon icon icon-in-progress icon-in-progress_white"/>
        <p className="review-message__text t3">{this.context.i18n.l('The review is visible only for you. Sorry, but we need to check your review before publication. In case your review corresponds to our rules, it will be published soon :)')}
        </p>
        <div className="review-message__triangle review-message__triangle_progress"></div>
      </div>);
    } else if (status === STATUS_DECLINED) {
      return (<div className="template-review__message review-message review-message_declined">
        <i className="review-message__icon icon icon-pen"/>
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
        this.state.reviews.items.map((review, i) => {
          return (
            <li className="reviews__item reviews__item_my-reviews review__content" key={review.id}>
              <ReviewItem
                userAvatar = {this.state.user.avatar}
                userName = {review.user_name}
                reviewScore = {review.score}
                reviewContent = {review.content}
              />
            </li>
          );
        })
      );
    }
  };

  renderReviewEditor = () => {
    if (this.state.userReview.status === STATUS_INITIAL
        || this.state.userReview.status === STATUS_DECLINED
        || this.state.userReview.status === STATUS_PENDING) {
      return (
        <ReviewEditor
          success={this.state.success}
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
      )
    }
    return null;
  };


  renderMyReviews = () => {
    if (_.isEmpty(this.state.userReview) ) {
      return;
    }
    if (this.state.userReview.status !== STATUS_INITIAL) {
      return (
        <li className="reviews__item reviews__item_my-reviews review__content" key={this.state.userReview.id}>
          <ReviewItem
            userAvatar    = {this.state.user.avatar}
            userName      = {this.state.user.userName}
            reviewScore   = {this.state.userReview.score}
            reviewContent = {this.state.userReview.content}
          />
          {this.renderNotification(this.state.userReview.status)}
        </li>
      );
    }
  };

  //Get reviews on template
  getReviews = (locale) => {
    let reviews = new ReviewsData(Config.reviewsServiceURL, locale);
    let products = new ProductsData(Config.productsServiceURL, LOCALE);

    return this.getReviewsData(reviews, products, {
      'template_id' : this.props.templateId,
      'sort'        : 'id DESC',
      'per-page'    : 10
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

      reviews.getReviews(params).then((data) => {
        paginationData.currentPageIndex = data.currentPageIndex;
        paginationData.lastPageIndex = data.lastPageIndex;
        paginationData.totalCount = data.totalCount;

        this.countReview += data.totalCount;
        
        itemsReview = this.state.reviews.items ? [...this.state.reviews.items, ...data.items] : data.items;
        const ids = _.uniq(itemsReview.map((item) => {
          return item.template_id;
        }));
        if (this.countReview === 0 && !this.state.otherLocale) {
          if (this.iteratorLocale < 2) {
            this.iteratorLocale++;
            this.getReviews(LOCALES[this.iteratorLocale]);
            this.setState({
               isFetching : false
            });
          }
          else {
            reviews = new ReviewsData(Config.reviewsServiceURL, `IN_${LOCALES}`);
            this.getCountReviewsOtherLocale(reviews, {
              'template_id' : this.props.templateId
            });
          }
        }
        else if (ids.length) {
          products.getProducts(ids).then((products) => {
            this.setState({
              products: {
                ...this.state.products,
                ...products
              },
              reviews: {
                ...this.state.reviews,
                items : itemsReview,
                ...paginationData,
                totalCount: paginationData.totalCount
              },
              isFetching: false
            });
          });
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
        countReviewOtherLocale : this.state.countReviewOtherLocale + data.totalCount
      });
    });
  };

  getUserData = (user_id) => {
    fetch(`${Config.accountServiceURL}users/${user_id}/profile`, {
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
    reviews.getReviewsUser(params).then((data) => {
      if (data.items.length > 0) {
        this.setState({
          userReview : data.items[0]
        });
      }
    }).then(() => {
      if (!_.isEmpty(this.state.userReview)) {
        this.getUserData(this.state.userReview.user_id);
      }
    });
  };
  // /Get reviews of user on template

  //Product data of template
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
        templateUrl  : this.state.templateUrl,
        authorId     : product[0].aid
      });
    });
  };
  //Product data of template



  //Template Url
  getTemplateUrl = (locale) => {
    fetch(`http://www.templatemonster.com/api/${locale}/template/${this.props.templateId}/`, {
      method : 'get'
    }).then(getResponseJSON)
    .then((data) => {
      this.setState({
        templateUrl: data.url
      })
    });
  };

  //Get auth-user email
  getUserProfile = () => {
   fetch(`${Config.accountServiceURL}users/profile`, {
      method : 'get',
      headers: {
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
    }
    this.getReviews(LOCALES[this.iteratorLocale]);
    this.getProductUser();
    this.getTemplateUrl(LOCALE);
    this.getUserProfile();
    window.addEventListener('scroll', this.loadDownloads);
  };

  componentWillUnmount () {
    window.removeEventListener('scroll', this.loadDownloads);
  }

  loadDownloads = () => {
    infiniteDataLoader(() => {
      if (this.state.countReviewOtherLocale > 0) {
        return this.getReviews(`IN_${LOCALES}`);
      } else {
        return this.getReviews(LOCALES[this.iteratorLocale]);
      }
    }, this.state.reviews.totalCount > 0 && this.state.isFetching !== true);
  };

  otherLocale = () => {
    this.setState({
      otherLocale: true
    });
    this.iteratorLocale = 0;
    this.getReviews(`IN_${LOCALES}`);
  };

  render () {
    return (
      <div className="page-content">
        {
          this.state.reviews.totalCount === 0 && this.state.isFetching
            ? (
              <ContentLoader />
            )
            : (this.state.reviews.totalCount === 0
              ? (
                <ContentEmptyMessage
                  page        = {'reviews'}
                  show        = {this.state.isEmpty}
                  title       = {this.context.i18n.l('REVIEWS & RATINGS')}
                  description = {this.context.i18n.l(`It seems there are no reviews to this product from your locale.
                    You can look at the reviews from other locales.`)}
                  isButton    = {this.state.countReviewOtherLocale > 0}
                  buttonText  = {this.context.i18n.l(`View ${this.state.countReviewOtherLocale} Reviews From Other Locales`)}
                  buttonClick = {this.otherLocale}
                />
                )
              : (
                <div className="reviews">

                  {this.renderReviewEditor()}

                  <ul className="reviews__list">
                    {this.renderMyReviews()}
                    {this.renderReviews()}
                  </ul>
                  {this.state.reviews.totalCount > 0 && this.state.isFetching && (
                    <L1 className="downloads__loader"/>
                  )}
                </div>
                )
            )
        }
      </div>
    );
  }
}
