import React                        from 'react';
import Config                       from 'config.js';
import _                            from 'lodash';
import ContentLoader                from 'components/ContentLoader/';
import ContentEmptyMessage          from 'components/ContentEmptyMessage/';
import L1                           from 'quark/lib/loaders/L1';
import TA5                          from 'quark/lib/textareas/TA5';
import B3J                          from 'quark/lib/buttons/B3E';
import B2J                          from 'quark/lib/buttons/B2E';
import StarsRating                  from 'quark/lib/StarsRating';
import {connectNotificationTrigger} from 'quark/lib/utils';

import ReviewsData                  from 'plasma-reviews-api-client-js';
import ProductsData                 from 'tm-products-api-client-js';

import ReviewCard                   from './index';
import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale
} from 'utils/';

import './Reviews.less';

const reviews = new ReviewsData(Config.reviewsServiceURL, getCurrentLocale());
const products = new ProductsData(Config.productsServiceURL, getCurrentLocale());

class ReviewItem extends React.Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };

  static propTypes = {
    userAvatar    : React.PropTypes.string,
    userName      : React.PropTypes.string,
    reviewScore   : React.PropTypes.number,
    reviewContent : React.PropTypes.string,
  };

  render() {
    return (
      <div className="review__item t3">
        <div className="review__info">
          <div className="review__author">
            {
              !this.props.userAvatar &&
              <span className="review__author-icon review__author-icon_default"> </span>
            }
            {
              this.props.userAvatar &&
              <img
                className="review__author-icon"
                alt="avatar"
                src={`${this.props.userAvatar}`}
              />
            }
            <span className="review__author-name">{this.props.userName}</span>
          </div>
          <span className="review__score rating-stars-block">
            <StarsRating
              defaultRating={this.props.reviewScore}
              disabled={true}
            />
            <span className="review__flag iti-flag us"> </span>
          </span>
          <span  className="review__date">date</span>
        </div>
        <div className="review__item-content">
          {this.props.reviewContent}
        </div>
        <div className="review__item-controls">
          <span className="review__item-reply tm-icon icon-message">{this.context.i18n.l('Reply')}</span>
        </div>
      </div>
    )
  }
}

export default class Reviews extends React.Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };

  static propTypes = {
    templateId  : React.PropTypes.number,
    accessToken : React.PropTypes.string
  };

  state = {
    isEmpty            : false,
    isFetching         : false,
    initStatus         : false,
    reviewsUser        : {},
    productsUser       : {},
    reviewsUserOwn     : {},
    productUserOwn     : {},
    user               : {},
    reviewsData        : {},
    key                : 0,
    clickStars         : 0,
    hideOnClickOutside : true,
    state              : false,
    showContent        : false,
    stars              : 0,
    initial            : 'initial',
    pending            : 'pending',
    declined           : 'declined',
    approved           : 'approved',
    success            : false,
    promocode          : 15,
    countReview        : this.props.textReview,
    // reviewId           : 0,
    // userId             : 0,
    templateName       : '',
    imageUrl           : '',
    templateUrl        : '',
    userName           : '',
    userMail           : '',
    authorId           : 0
  };

  constructor (props) {
    super(props);

    this.locale = getCurrentLocale();

    this.closePopupOnEsc = this.closePopupOnEsc.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  renderDiscountMessage = () => {
    let Interpolate = React.createFactory(require('react-interpolate-component'));
    return (
      <div className="reviews__message discount-message">
        <i className="discount-message__icon icon icon-star-fill" />
        <h1 className="discount-message__title h3">
          {this.context.i18n.l('Rate purchased template and get a discount up to 25% on all templatemonster themes')}
        </h1>
        <p className="discount-message__text t3">
          <Interpolate
            with={{firstDiscount: <strong>{this.context.i18n.l('15%')}</strong>, secondDiscount: <strong>{this.context.i18n.l('25%')}</strong>}}
            format={this.context.i18n.l('For your review you\'ll get an email with promo code discount of %(firstDiscount)s for 60+ characters and %(secondDiscount)s for 400+ characters')}
          />
        </p>
        <div className="discount-message__bg-1" />
        <div className="discount-message__bg-2" />
      </div>
    );
  };

  renderNotification = (status) => {
    if (status === this.state.pending) {
      return (<div className="template-review__message review-message review-message_progress">
        <i className="review-message__icon icon icon-in-progress icon-in-progress_white"/>
        <p className="review-message__text t3">{this.context.i18n.l('The review is visible only for you. Sorry, but we need to check your review before publication. In case your review corresponds to our rules, it will be published soon :)')}
        </p>
        <div className="review-message__triangle review-message__triangle_progress"></div>
      </div>);
    } else if (status === this.state.declined) {
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
    if (this.state.reviewsUser.items && this.state.productsUser.products) {
      return (
        this.state.reviewsUser.items.map((review, i) => {
          const product = this.state.productsUser.products.find((product) => {
            return (review.template_id === product.templateId);
          });
          if (product) {
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
          }
          review.status === 'initial' ? this.state.initStatus = true : '';
        })
      );
    }
  };

  renderMyReviews = () => {
    if (!_.isEmpty(this.state.reviewsUserOwn)) {
      const reviewData = {...this.state.reviewsUserOwn.items[0]};
      if (this.state.reviewsUserOwn.items.length) {
        if (this.state.reviewsUserOwn.items[0].status === this.state.initial) {
          // Review initial
          return (
            <div className="template-reviews__rating template__rating  template-rating t1">
              <span className="template-reviews__rating-name">
                {this.context.i18n.l('Please rate the product:')}
              </span>
              {this.renderStars(this.state.success)}
            </div>
          )
        } else if (this.state.reviewsUserOwn.items[0].status === this.state.pending) {
          // Review pending
          return (
            <li className="reviews__item reviews__item_my-reviews review__content" key={reviewData.id}>
              <ReviewItem
                userAvatar    = {this.state.user.avatar}
                userName      = {reviewData.user_name}
                reviewScore   = {reviewData.score}
                reviewContent = {reviewData.content}
              />
              {this.renderNotification(reviewData.status)}
            </li>
          );
        }
        else if (this.state.reviewsUserOwn.items[0].status === this.state.declined) {
          // Review declined
          return (
            <li className="reviews__item reviews__item_my-reviews review__content" key={reviewData.id}>
              <div className="template-reviews__rating template__rating  template-rating t1">
                <span className="template-reviews__rating-name">
                  {this.context.i18n.l('Please rate the product:')}
                </span>
                {this.renderStars(this.state.success)}
              </div>
              <ReviewItem
                userAvatar    = {this.state.user.avatar}
                userName      = {this.state.user.userName}
                reviewScore   = {reviewData.score}
                reviewContent = {reviewData.content}
              />
              {this.renderNotification(reviewData.status)}
            </li>
          );
        }
        else if (this.state.reviewsUserOwn.items[0].status === this.state.approved) {
          // Review approved
        }
      }
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
    const currentState = this.state.reviewsUser;
    let itemsReview, productsReview;
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

        itemsReview = this.state.reviewsUser.items ? [...this.state.reviewsUser.items, ...data.items] : data.items;
        const ids = _.uniq(itemsReview.map((item) => {
          return item.template_id;
        }));
        if (ids.length) {
          products.getProducts(ids).then((products) => {
            productsReview = this.state.productsUser.products.concat(...products);
          }).then(() => {
            this.setState({
              productsUser : {
                ...this.state.productsUser,
                products: productsReview
              },
              reviewsUser: {
                ...this.state.reviewsUser,
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
    }).then((response) => {
      return  response.json();
    }).then((data) => {
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
    this.setState({
      isFetching: true
    });

    reviews.getReviewsUser(params).then((data) => {
       this.setState({
         reviewsUserOwn: data
       });
    }).then(() => {
      if (!_.isEmpty(this.state.reviewsUserOwn)) {
        this.getUserData(this.state.reviewsUserOwn.items[0].user_id);
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
      const url = getCdnImageUrl(product[0].templateId, product[0].screenshots, 'original', size);

      this.setState({
        productUserData : product[0],

        templateName : product[0].templateFullTitle,
        imageUrl     : url || '',
        templateUrl  : this.state.templateUrl, //Config.monsterURL + product.templateUrl.slice(1),
        userName     : this.state.reviewsUserOwn.items[0].user_name,
        userMail     : 'mail',
        authorId     : product[0].aid
      });
    });
  };
  //Product data of template

  putAddReview = (token, id, params) => {
      reviews.completeReview(token, id, params).then((data) => {
        this.state.reviewsUserOwn.items.map((element) => {
          if (element.id === data.items.id) {
            element.content = data.items.content;
            element.score = parseInt(data.items.score);
            element.status = data.items.status;
          }
          return element;
        });
      }).then(() => {
        this.setState({
          reviewsUser: {
            ...this.state.reviewsUser,
            items: [...this.state.reviewsUserOwn.items[0], ...this.state.reviewsUser.items]
          }
        });
      });
  };

  //Template Url
  getTemplateUrl = (locale) => {
    fetch(`http://www.templatemonster.com/api/${locale}/template/${this.props.templateId}/`, {
      method : 'get'
    }).then((response) => {
      return response.json();
    }).then((data) => {
      this.setState({
        templateUrl: data.url
      })
    });
  };

  getUserProfile = () => {
    fetch(`${Config.accountServiceURL}profile`, {
      method : 'get',
      headers: {
        'Access-Control-Allow-Origin':'*',
        'Authorization': this.props.accessToken
      }
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log('data', data);
    });
  };

  shouldFetchDataItems = (currentState) => {
    const currentItemsCount = currentState.items ? currentState.items.length : 0;
    const totalItemsCount   = currentState.totalCount;
    return currentItemsCount === 0 || currentItemsCount < totalItemsCount;
  };

  componentDidMount () {
    this.state.productsUser.products = [];
    this.getReviewsUser();
    this.getReviews();
    this.getProductUser();
    this.getTemplateUrl(this.locale);
    this.getUserProfile();
    window.addEventListener('scroll', this.loadDownloads);
    window.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('keydown', this.closePopupOnEsc);
  };

  componentWillUnmount () {
    window.removeEventListener('scroll', this.loadDownloads);
    window.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('keydown', this.closePopupOnEsc);
  }

  loadDownloads = () => {
    infiniteDataLoader(() => {
      return this.getReviews();
    }, this.state.reviewsUser.totalCount > 0 && this.state.isFetching !== true);
  };

  renderStars = (success) => {
    const StartNotification = connectNotificationTrigger(StarsRating);
    return (
      <StartNotification
        defaultRating={this.state.stars}
        onChange={this.showTooltip}
        key={this.state.key}
        notification={{
          text: (
            this.renderPopover(success)
          ),
          code: 'N1F'
        }}
        trigger={this.trigger}
        ref={c => {
          this.trigger = c;
        }}
        notificationAlt={{status: false}}
      />
    )
  };

  renderPopover (success) {
    return (
      <div className={`notification-review ${success ? 'notification_result' : ''}`}>
        <div className="notification-review__info">
          <p className="notification-review__text t2">{`${this.context.i18n.l('Please, write at least 60 symbols for review')}`}</p>
          <form
            className="notification-review__form"
            id="review-form"
            onSubmit={(event) => {
              this.handleFormSubmit(event);
            }}
          >
            <TA5
              className="notification-review__textarea spacing-outer-bottom-20"
              id="review-text"
              label="Your opinion about this product"
              increaseValue={true}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2A"
            />
            <B3J
              className="notification-review__button notification-review__button_first"
              onClick={() => this.hideTooltip()}
            >
              Cancel
            </B3J>
            <B2J
              className="notification-review__button"
              type="submit"
            >
              Post
            </B2J>
            <input id="reviewTitle" name="title" type="hidden" value={this.state.templateName}/>
            <input id="countStars" name="score" type="hidden" value={this.state.clickStars}/>
            <input id="tmplTitle" name="template_title" type="hidden" value={this.state.templateName}/>
            <input id="tmplImg" name="template_image" type="hidden" value={this.state.imageUrl}/>
            <input id="tmplUrl" name="template_url" type="hidden" value={this.state.templateUrl}/>
          </form>
        </div>
        <div className="notification-review__promocode">
          <p className="notification-review__info-name t1">{`${this.context.i18n.l('Thank you for your review!')}`}</p>
          <p className="notification-review__info-text t3">
            {`${this.context.i18n.l("We've generated your one-time promo-code and within 10 minutes it will reach your email:")}`}</p>
          <p className="notification-review__info-mail t3">{this.props.userMail}</p>
          <p className="notification-review__info-quantity h0">-{this.state.promocode}%</p>
          <p className="notification-review__info-text t3">{`${this.context.i18n.l('on all our themes')}`}</p>
        </div>
      </div>
    );
  }

  showTooltip = (val) => {
    this.state.clickStars = val;
    this.setState({
      showContent : false,
      stars       : val
    }, () => {
      let promise = new Promise((resolve) => {
        resolve(this.trigger.showNotification());
      });
      promise.then(() => {
        document.querySelector('.stars-rating-wrapper > div > .notification--large').classList.add('notification__review-center');
        document.querySelector('.notification__review-center').classList.add(`notification__review-center_${val}`);
        // document.querySelector('.notification__review-center').classList.add(`notification__review-center_pos-center`);
        this.trigger.targetNode.addEventListener('animationend', () => {
          this.state.showContent = true;
        });
      });
    });
  };

  textValidationRule (value) {
    const valueRegExp = /^[^<>]+$/;
    const teatAreaValue   = value.trim();
    const valueCount = value.length;
    const isValid = valueRegExp.test(teatAreaValue);
    if (isValid) {
      if (valueCount < 60) {
        return {
          isValid : false,
          message : this.context.i18n.l('Review must contain at least 60 symbols')
        };
      } else {
        if (valueCount > 400) {
          this.state.promocode = 25;
        }
        return {
          isValid : true,
          message : null
        };
      }
    } else {
      return {
        isValid : false,
        message : this.context.i18n.l('Please remove special symbols')
      };
    }
  }

  handleFormSubmit (event) {
    event.preventDefault();
    let textArea = document.getElementById('review-text');
    let reviewText = textArea.value;
    let notification = document.querySelector('.stars-rating-wrapper .notification');
    notification.classList.remove('notification_invalid');
    if (this.textValidationRule(reviewText).isValid) {
      this.state.success = true;
      const reviewsData = {
        title          : this.state.templateName,
        score          : this.state.clickStars,
        content        : reviewText,
        template_title : this.state.templateName,
        template_image : this.state.imageUrl,
        template_url   : this.state.templateUrl,
        user_name      : this.state.userName,
        author_id      : this.state.authorId
      };

      notification.classList.add('notification_result');
      let promise = new Promise((resolve) => {
        resolve(this.putAddReview(this.props.accessToken, this.state.reviewsUserOwn.items[0].id, reviewsData));
      });
      promise.then(() => {
        setTimeout(() => {
          this.showTooltip(reviewsData.score);
        }, 2000);
      });
    } else {
      this.state.success = false;
      setTimeout(function () {
        notification.classList.add('notification_invalid');
      }, 1);
      this.textarea.input.handleValidation({
        status  : false,
        message : this.textValidationRule(reviewText).message
      });
    }
  }

  hideTooltip = () => {
    let notification = document.querySelector('.stars-rating-wrapper .notification');
    notification.classList.remove('notification_invalid');
    this.trigger.hideNotification(this, true);
    this.trigger.targetNode.addEventListener('animationend', () => {
      this.setState({
        key         : this.state.key++,
        stars       : 0,
        showContent : false
      });
    });
  };

  handleDocumentClick = (event) => {
    const area = ReactDOM.findDOMNode(this.trigger);
    if (this.trigger && this.state.showContent && event.target !== this.trigger && !area.contains(event.target)) {
      this.hideTooltip();
    }
  };

  closePopupOnEsc = (event) => {
    if (event.keyCode === 27 && this.state.showContent) {
      this.hideTooltip();
    }
  };

  render () {
    return (
      <div>
          <div className="reviews">
            {this.state.initStatus ? this.renderDiscountMessage() : ''}
            <ul className="reviews__list">
              {this.renderMyReviews()}
              {this.renderReviews()}
            </ul>
            {this.state.reviewsUser.totalCount > 0 && this.state.isFetching && (
              <L1 className="downloads__loader"/>
            )}
          </div>
      </div>
    );
  }
}
