import React               from 'react';

import Config              from 'config.js';
import Cookie              from 'service/Cookie.js';

import ContentLoader       from 'components/ContentLoader/';
import ContentEmptyMessage from 'components/ContentEmptyMessage/';
import L1                  from 'quark/lib/loaders/L1';

import ReviewCard          from './index';
import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale
}
                           from 'utils/';
import ReviewsData         from 'plasma-reviews-api-client-js';
import ProductsData        from 'tm-products-api-client-js';

import './Reviews.less';

const reviews = new ReviewsData(Config.reviewsServiceURL, getCurrentLocale());
const products = new ProductsData(Config.productsServiceURL, getCurrentLocale());

export default class Reviews extends React.Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };

  state = {
    isEmpty      : false,
    isFetching   : false,
    initStatus   : false,
    reviewsUser  : {},
    productsUser : {}
  };

  renderDiscountMessage () {
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
  }

  renderMyReviews = () => {
    if (this.state.reviewsUser.items && this.state.productsUser.products) {
      return (
        this.state.reviewsUser.items.map((review, i) => {
          const product = this.state.productsUser.products.find((product) => {
            return (review.template_id === product.templateId);
          });
          if (product) {
            const size = {
              width  : 400,
              height : 400
            };
            const url = getCdnImageUrl(product.templateId, product.screenshots, 'original', size);
            const token = 'vzWDZE5d442XYZXfTqJ5UHMwICDwO2B4LUABNKxo';// Cookie.getItem('access_token');
            const iconTemplateType = product.typeShortName.toLowerCase().trim().replace(/\s/g, '-');
            return (
              <li className="reviews__item reviews__item_my-reviews" key={review.id}>
                <ReviewCard
                  imageUrl={url || ''}
                  templateUrl={Config.monsterURL + product.templateUrl.slice(1)}
                  typeUrl={`${Config.monsterURL}${product.templateType.typeUrl}.php`}
                  templateType={product.templateType.typeName}
                  templateName={product.templateFullTitle}
                  templatePrice={`$${product.price}`}
                  templateLicense={this.context.i18n.l('Single Site License')}
                  rating={review.score}
                  textReview={review.content}
                  status={review.status}
                  token={token}
                  reviewId={review.id}
                  hideOnClickOutside={true}
                  userMail={'qwerty'}
                  userName={'qwerty123'}
                  iconType={iconTemplateType}
                />
              </li>
            );
          }
          review.status === 'initial' ? this.state.initStatus = true : '';
        })
      );
    }
  };

  getReviews = () => {
    return this.getReviewsData({
      'access_token' : 'vzWDZE5d442XYZXfTqJ5UHMwICDwO2B4LUABNKxo',//Cookie.getItem('access_token'),
      'sort'         : '-id',
      'per-page'     : 10
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

      reviews.getReviewsUser(params).then((data) => {
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
    }
  };

  shouldFetchDataItems = (currentState) => {
    const currentItemsCount = currentState.items ? currentState.items.length : 0;
    const totalItemsCount   = currentState.totalCount;
    return currentItemsCount === 0 || currentItemsCount < totalItemsCount;
  };

  componentDidMount () {
    this.state.productsUser.products = [];
    this.getReviews();
    window.addEventListener('scroll', this.loadDownloads);
  };

  componentWillUnmount () {
    window.removeEventListener('scroll', this.loadDownloads);
  }

  loadDownloads = () => {
    infiniteDataLoader(() => {
      return this.getReviews();
    }, this.state.reviewsUser.totalCount > 0 && this.state.isFetching !== true);
  };

  render () {
    return (
      <div>
        {!this.state.reviewsUser.items ? (
          <ContentEmptyMessage
            page        = {'reviews'}
            show        = {this.state.isEmpty}
            title       = {this.context.i18n.l('You haven\'t left any review or rating')}
            description = {this.context.i18n.l('Here you will be able to rate your products & preview your reviews and ratings. Right now you have no products to rate')}
            linkType    = "anchor"
            linkUrl     = {Config.monsterURL}
            linkText    = {this.context.i18n.l('Go & Find Your Dream Template')}
          />
        ) : (
          <div className="reviews">
            {this.state.initStatus ? this.renderDiscountMessage() : ''}
            <ul className="reviews__list">
              {this.renderMyReviews()}
            </ul>
            {this.state.reviewsUser.totalCount > 0 && this.state.isFetching && (
              <L1 className="downloads__loader"/>
            )}
          </div>
        )}
      </div>
    );
  }
}
