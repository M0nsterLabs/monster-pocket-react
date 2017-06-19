import React               from 'react';
import Config              from 'config.js';
import _                   from 'lodash';
import PropTypes           from 'prop-types';
import ContentEmptyMessage from 'components/ContentEmptyMessage/';
import L1                  from 'quark/lib/loaders/L1';
import L3                  from 'quark/lib/loaders/L3';
import B2E                 from 'quark/lib/buttons/B2E';
import DD1                 from 'quark/lib/dropdowns/DD1';

import ReviewsData         from 'plasma-reviews-api-client-js';
import ProductsData        from 'tm-products-api-client-js';

import ReviewItem          from './ReviewItem';
import ReviewEditor        from './ReviewEditor';

import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale,
  getResponseJSON
} from 'utils/';

import './Reviews.less';

const LOCALE = getCurrentLocale();
let reviews = new ReviewsData(Config.reviewsServiceURL);
let products = new ProductsData(Config.productsServiceURL, LOCALE);
const STATUS_INITIAL = 'initial';
const STATUS_PENDING = 'pending';
const STATUS_DECLINED = 'declined';
const STATUS_APPROVED = 'approved';
const LOCALES = [LOCALE, 'en', 'es', 'ru', 'de', 'pl', 'it', 'tr', 'fr', 'pt', 'nl', 'zh', 'cs', 'uk', 'hu', 'sv'];

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
    showMoreVisible        : false,
    sort                   : 'id DESC'
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
                moderable     = {this.state.reviews.canModerate}
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
          {this.context.i18n.l('Only buyers of that product can rate it')}
        </p>
      )
    }
    return null;
  };

  renderMyReviews = () => {
    if (_.isEmpty(this.state.userReview)) {return;}
    if (this.state.userReview.status === STATUS_PENDING || this.state.userReview.status === STATUS_DECLINED) {
      return (
        <li className="reviews__item reviews__item_my-reviews review__content" key={this.state.userReview.id}>
          <ReviewItem
            userAvatar={this.state.user.avatar}
            userName={this.state.user.userName}
            reviewScore={this.state.userReview.score}
            reviewContent={this.state.userReview.content}
            userMail={this.state.userMail}
            reviewDate={this.state.userReview.created_at}
            reviewFlag={this.state.userReview.locale}
            reviewId={this.state.userReview.id}
            accessToken={this.props.accessToken}
            moderatorName={this.state.user.userName}
            moderatorAva={this.state.user.avatar}
            moderatorMail={this.state.userMail}
            comments={this.state.userReview.comments}
            status={this.state.userReview.status}
          />
          {this.renderNotification(this.state.userReview.status)}
        </li>
      );
    }
  };

  // Get reviews on template
  getReviews = (locale) => {
    let products = new ProductsData(Config.productsServiceURL, LOCALE);
    if (!locale) {
      locale = '';
    }
    let params = {
      'template_id' : this.props.templateId,
      'sort'        : this.state.sort,
      'per-page'    : 10,
      'expand'      : 'comments',
      'locale'       : locale
    };
    if (this.props.accessToken) {
      params['access_token'] = this.props.accessToken;
    }
    return this.getReviewsData(reviews, products, params);
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
        paginationData.canModerate = !!data.canModerate;

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
          if (this.iteratorLocale < 2 && LOCALE !== 'en') {
            this.getReviews(LOCALES[this.iteratorLocale]);
          } else {
            this.getCountReviewsOtherLocale(reviews, {
              'template_id': this.props.templateId
            });
            this.setState({
              isFetching: false
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
                totalCount : paginationData.totalCount,
                canModerate: paginationData.canModerate
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

  getUserData = () => {
    fetch(`${Config.accountServiceURL}users/profile?access_token=${this.props.accessToken}`, {
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
          userReview: data.items[0]
        });
      }
    }).then(() => {
      this.getUserData();
    });
  };
  // Get reviews of user on template

  // Product data of template
  getProductUser = (locale = 'en') => {
    return this.getProductUserData(locale);
  };

  getProductUserData = (locale = 'en') => {
    fetch(`${Config.productsServiceURL}products/${locale}/${this.props.templateId}`, {
      method: 'get'
    })
    .then(getResponseJSON)
    .then((product) => {
      const size = {
        width  : 400,
        height : 400
      };
      this.templateName = product.templateFullTitle;
      this.imageUrl = getCdnImageUrl(product.templateId, product.screenshots, 'original', size) || '';
      this.setState({
        productUserData : product,
        templateUrl     : this.state.templateUrl,
        authorId        : product.authorUserId
      });
    });
  };
  // Product data of template

  // Template Url
  getTemplateUrl = (locale) => {
    fetch(`${Config.monsterURL}api/${locale}/template/${this.props.templateId}/`, {
      method: 'get'
    })
    .then(getResponseJSON)
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
    this.getProductUser(LOCALE);
    this.getTemplateUrl(LOCALE);
  };

  loadDownloads = () => {
   if (this.state.reviews.totalCount > 0 && this.state.isFetching !== true) {
     if (this.state.countReviewOtherLocale > 0) {
       return this.getReviews();
     } else {
       return this.getReviews(LOCALES[this.iteratorLocale]);
     }
   }
  };

  otherLocale = () => {
    this.setState({
      otherLocale: true
    });
    this.getReviews();
  };

  renderContentEmptyPage = (showTitle = true) => {
    return (
      showTitle ? (
        <ContentEmptyMessage
          page         = {'reviews'}
          show         = {this.state.isEmpty}
          description  = {this.context.i18n.l(`It seems there are no reviews to this product from your locale.\nYou can look at the reviews from other locales.`)}
          textNoLocale = {this.context.i18n.l(`It seems there are no reviews to this product.`)}
          isButton     = {this.state.countReviewOtherLocale > 0}
          buttonText   = {this.context.i18n.l(`View ${this.state.countReviewOtherLocale} Reviews From Other Locales`)}
          buttonClick  = {this.otherLocale}
          title        = {this.context.i18n.l('REVIEWS & RATINGS')}
        />
      ) : (
        <ContentEmptyMessage
          page         = {'reviews'}
          show         = {this.state.isEmpty}
          description  = {this.context.i18n.l(`It seems there are no reviews to this product from your locale.\nYou can look at the reviews from other locales.`)}
          textNoLocale = {this.context.i18n.l(`It seems there are no reviews to this product.`)}
          isButton     = {this.state.countReviewOtherLocale > 0}
          buttonText   = {this.context.i18n.l(`View ${this.state.countReviewOtherLocale} Reviews From Other Locales`)}
          buttonClick  = {this.otherLocale}
        />
      )
    )
  };

  renderEmptyPage = () => {
    return (
      this.state.userReview.status === STATUS_INITIAL
        ? <div className="page-content__empty-inner">
            <h2 className="h3">{this.context.i18n.l('REVIEWS & RATINGS')}</h2>
            {this.renderReviewEditor()}
            {this.renderContentEmptyPage(false)}
          </div>
        :
          this.renderContentEmptyPage()
    )
  };

  changeSortValue = (sorted) => {
    let sortedBy = 'id DESC';
    switch (sorted) {
      case 'sortNewest':
        sortedBy = 'id DESC';
        break;
      case 'sortMosthelpful':
        sortedBy = 'id DESC';
        break;
      case 'sortTopratings':
        sortedBy = 'score DESC,id DESC';
        break;
      case 'sortLowratings':
        sortedBy = 'score ASC,id DESC';
        break;
      default:
        break;
    }
    this.setState({
      sort: sortedBy,
      reviews: {
        items: []
      },
    }, () => {
      this.getReviews(LOCALES[this.iteratorLocale]);
    })
  };
  
  sortReviews = () => {
    const sortValue = [
      this.context.i18n.l('Newest'),
      this.context.i18n.l('Most helpful'),
      this.context.i18n.l('Top ratings'),
      this.context.i18n.l('Low ratings')
    ];
    let form;
    return (
      <DD1
        className="reviews__sort"
        options={sortValue.map(sortItem => ({
          label: sortItem,
          icon: ``,
          value: `sort${sortItem.replace(/\s/g,'')}`,
        }))}
        ref={(ref) => { form = ref; }}
        label={this.context.i18n.l('Show first:')}
        pattern=""
        defaultValue={"Newest" || null}
        onChange={value => this.changeSortValue(value)}
      />
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
                  {
                    (
                    this.state.userReview.status === STATUS_DECLINED ||
                    this.state.userReview.status === STATUS_PENDING)
                      ? (
                        <div className="reviews">
                          <h2 className="h3">{this.context.i18n.l('REVIEWS & RATINGS')}</h2>
                          {this.renderReviewEditor()}
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
                  <div className="reviews__header">
                    <h2 className="h3"><span className="reviews__total-count">{this.state.reviews.totalCount}</span> {this.context.i18n.l(`REVIEWS & RATINGS`)}</h2>
                    {this.sortReviews()}
                  </div>

                  {this.renderReviewEditor()}

                  {_.isEmpty(this.state.reviews.items)
                    ? <L1 className="content-loader" />
                    :
                      <ul className="reviews__list">
                        {this.renderMyReviews()}
                        {this.renderReviews()}
                      </ul>
                  }

                  {this.state.showMoreVisible && !_.isEmpty(this.state.reviews.items) && (
                    <B2E
                      className = "reviews__btn"
                      id        = "show-more-reviews"
                      onClick   = {this.loadDownloads}
                      disabled  = {this.state.isFetching}
                      isLoading = {this.state.isFetching}
                    >
                      {this.state.isFetching ? (
                        <L3 />
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
