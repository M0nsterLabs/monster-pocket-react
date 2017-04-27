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

const LOCALE = getCurrentLocale();
const reviews = new ReviewsData(Config.reviewsServiceURL, LOCALE);
const products = new ProductsData(Config.productsServiceURL, LOCALE);
const STATUS_INITIAL = 'initial';
const STATUS_PENDING = 'pending';
const STATUS_DECLINED = 'declined';
const STATUS_APPROVED = 'approved';

export default class Reviews extends React.Component {
  static propTypes = {
    templateId  : React.PropTypes.number.isRequired,
    accessToken : React.PropTypes.string
  };

  static contextTypes = {
    i18n: React.PropTypes.object
  };

  state = {
    isFetching   : false,
    reviews      : {},
    products     : {},
    userReview   : {},
    userProducts : {},
    user         : {},
    templateUrl  : '',
    userName     : '',
    userMail     : '',
    authorId     : 0
  };

  constructor (props) {
    super(props);

    this.templateName = '';
    this.imageUrl = '';
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
  getReviews = () => {
    return this.getReviewsData({
      'template_id' : this.props.templateId,
      'sort'        : '-id',
      'per-page'    : 10
    });
  };

  getReviewsData = (params = {}) => {
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

        itemsReview = this.state.reviews.items ? [...this.state.reviews.items, ...data.items] : data.items;
        const ids = _.uniq(itemsReview.map((item) => {
          return item.template_id;
        }));
        if (ids.length) {
          products.getProducts(ids).then((products) => {
            this.setState({
              products : {
                ...this.state.products,
                ...products
              },
              reviews  : {
                ...this.state.reviews,
                items : itemsReview,
                ...paginationData
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
    this.getReviews();
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
      return this.getReviews();
    }, this.state.reviews.totalCount > 0 && this.state.isFetching !== true);
  };

  render () {
    return (
      <div>
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
      </div>
    );
  }
}
