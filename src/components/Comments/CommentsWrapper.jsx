import React               from 'react';
import Config              from 'config.js';
import _                   from 'lodash';
import PropTypes           from 'prop-types';
import ContentEmptyMessage from '../ContentEmptyMessage/';
import L1                  from 'quark/lib/loaders/L1';
import L3                  from 'quark/lib/loaders/L3';
import B2E                 from 'quark/lib/buttons/B2E';
import DD1                 from 'quark/lib/dropdowns/DD1';

import ReviewsData         from 'plasma-reviews-api-client-js';
import ProductsData        from 'tm-products-api-client-js';

import CommentsItem from './CommentsItem';

import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale,
  getResponseJSON
} from 'utils/';

import './Comments.less';

let comments = new ReviewsData(Config.reviewsServiceURL);
let LOCALE = getCurrentLocale();

export default class Comments extends React.Component {
  static propTypes = {
    templateId  : PropTypes.number.isRequired,
    accessToken : PropTypes.string
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    comments: {
      items: [],
      totalCount: 0,
      isLoading: false,
    },
    sort: '-helpful,-created_at',
    showMoreVisible: false,
    localeIterator: 0,
  };

  componentDidMount () {
    this.getComments(LOCALE);
  };

  renderComments = () => {
    const { comments } = this.state;
    if (comments.items) {
      return (
        comments.items.map((comment) => {
          return (
            <CommentsItem
              userName={comments.user_name}
              userMame={comments.user_email}
              content={comment.content}
              avatar=""
              date={comment.created_at}
              key={comment.id}
            />
          );
        })
      )
    }
  };

  getComments = (locale) => {
    this.setState({
      isLoading: false,
    });
    let params = {
      'template_id' : 55555,
      'per-page'    : 10,
      'locale'      : locale,
      'sort'        : this.state.sort,
      'expand'      : 'vote',
    };
    const paginationData   = {};
    const currentState = this.state.comments;
    if (this.shouldFetchDataItems(currentState)) {
      const requestPageIndex = currentState.currentPageIndex + 1 || 1;
      params = {
        ...params,
        'page': requestPageIndex
      };

      comments.getComments(params)
        .then((data) => {

          paginationData.currentPageIndex = data.currentPageIndex;
          paginationData.lastPageIndex = data.lastPageIndex;
          paginationData.totalCount = data.totalCount;

          if (paginationData.totalCount > 10) {
            this.setState({
              showMoreVisible: true
            })
          }

          this.setState({
            comments: {
              items: [...this.state.comments.items, ...data.items],
              totalCount: data.totalCount,
              ...paginationData,
            },
            isLoading: true,
            localeIterator: this.state.localeIterator+1
          })
        })
        .then(() => {
          if (paginationData.currentPageIndex === paginationData.lastPageIndex) {
            this.setState({
              showMoreVisible: false
            })
          }
        })
        .then(() => {
          if (this.state.comments.totalCount === 0 && this.state.localeIterator >= 1) {
            console.log('no countLocaleCurrent');
            LOCALE='it';
            if (this.state.localeIterator >= 2) {
              LOCALE='';
            }
            this.getComments(LOCALE);
          }
        });
    }

  };

  shouldFetchDataItems = (currentState) => {
    const currentItemsCount = currentState.items ? currentState.items.length : 0;
    const totalItemsCount   = currentState.totalCount;
    return currentItemsCount === 0 || currentItemsCount < totalItemsCount;
  };

  changeSortValue = (sorted) => {
    let sortedBy;
    switch (sorted) {
      case 'sortNewest':
        sortedBy = '-created_at';
        break;
      case 'sortMosthelpful':
        sortedBy = '-helpful,-created_at';
        break;
      case 'sortTopratings':
        sortedBy = '-score,-created_at';
        break;
      case 'sortLowratings':
        sortedBy = 'score,-created_at';
        break;
      default:
        sortedBy = '-helpful,-created_at';
        break;
    }
    this.setState({
      sort: sortedBy,
      comments: {
        items: []
      },
    }, () => {
      this.getComments(LOCALE);
    })
  };

  sortReviews = () => {
    const sortValue = [
      this.context.i18n.l('Most helpful'),
      this.context.i18n.l('Newest'),
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
        defaultValue={"Most helpful" || null}
        onChange={value => this.changeSortValue(value)}
      />
    )
  };

  loadDownloads = () => {
    if (this.state.comments.totalCount > 0 && this.state.isLoading === true) {
      this.getComments(LOCALE);
    }
  };

  render () {
    const {comments} = this.state;

    return (
      <div className="page-content ">
        <span className="comments__count">{comments.totalCount}</span>
        {
          this.state.comments.totalCount === 0 && !this.state.isLoading
          ? (
            <L1 className="content-loader"/>
          )
          : (
            <div className="comments">
              <div className="comments__header">
                <h2 className="h3">
                  <span className="comments__total-count">{comments.totalCount} </span>
                  {this.context.i18n.l(`Questions & Answers`)}
                </h2>
                {this.sortReviews()}
              </div>

              {_.isEmpty(this.state.comments.items)
                ? <L1 className="content-loader"/>
                :
                this.renderComments()
              }

              {
                this.state.showMoreVisible && !_.isEmpty(this.state.comments.items) && (
                  <B2E
                    className = "reviews__btn"
                    id        = "show-more-reviews"
                    onClick   = {this.loadDownloads}
                    disabled  = {!this.state.isLoading}
                    isLoading = {!this.state.isLoading}
                  >
                    {!this.state.isLoading ? (
                      <L3 />
                    ) : (
                      this.context.i18n.l('Show more')
                    )}
                  </B2E>
                )
              }
            </div>
          )
        }
      </div>

    );
  }
}
