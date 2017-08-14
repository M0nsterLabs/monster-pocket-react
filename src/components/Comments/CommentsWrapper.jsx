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
  };

  renderComments = () => {
    const { comments } = this.state;
    if (comments.items) {
      return (
        comments.items.map((comment) => {
          console.log(comment);
          return (
            <CommentsItem
              userName={comments.user_name}
              userMame={comments.user_email}
              content={comment.content}
              avatar=""
              date={comment.created_at}
            />
          );
        })
      )
    }
  };

  getComments = () => {
    this.setState({
      isLoading: false,
    });
    let params = {
      'template_id' : 55555,
      'per-page'    : 10,
      'locale'      : 'en',
      'sort'        : this.state.sort,
      'expand'      : 'vote',
    };
    const paginationData   = {};
    comments.getComments(params).then((data) => {
      paginationData.currentPageIndex = data.currentPageIndex;
      paginationData.lastPageIndex = data.lastPageIndex;
      paginationData.totalCount = data.totalCount;

      console.log(data);

      this.setState({
        comments: {
          items: [...this.state.comments.items, ...data.items],
          totalCount: data.totalCount,
        },
        isLoading: true,
      })
    })

  };

  componentDidMount () {
    this.getComments();
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
      this.getComments();
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
            </div>
          )
        }
      </div>

    );
  }
}
