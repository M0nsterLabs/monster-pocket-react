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

import CommentItem from './CommentItem';
import CommentsForm from './CommentsForm';

import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale,
  getResponseJSON,
} from 'utils/';

import './Comments.less';

let comments = new ReviewsData(Config.reviewsServiceURL);
let LOCALE = getCurrentLocale();
const PENDING = 'pending';

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
    sort: '-created_at',
    showMoreVisible: false,
    localeIterator: 0,
    countCommentsOtherLocale: 0,
    user: {
      name: '',
      avatar: '',
      mail: '',
    },
    productAuthorId: 0,
  };

  componentDidMount () {
    if (this.props.accessToken) {
      this.getUserProfile();
      this.getCommentsUser(LOCALE);
      this.getComments(LOCALE);
      this.getProductData(LOCALE);
    } else {
      this.getComments(LOCALE);
      this.getProductData(LOCALE);
    }
  };

  /**
   * get product data of template
   * @param locale
   */

  getProductData = (locale = 'en') => {
    const { templateId } = this.props;

    fetch(`${Config.productsServiceURL}products/${locale}/${templateId}`, {
      method: 'get'
    })
      .then(getResponseJSON)
      .then((product) => {
        this.setState({
          productAuthorId: product.authorUserId
        });
      });
  };

  renderComments = () => {
    const { accessToken, templateId } = this.props;
    const { comments, user, productAuthorId } = this.state;
    if (comments.items) {
      return (
        comments.items.map((comment) => {
          let isUserComment = accessToken && parseInt(user.id) === parseInt(comment.user_id);
          return (
            <CommentItem
              userName={comment.user_name}
              userMail={comment.user_email}
              content={comment.content}
              avatar=""
              date={comment.created_at}
              // key={comment.id}
              status={comment.status}
              access_token={accessToken}
              answers={comment.answers}
              id={comment.id}
              templateId={templateId}
              userData={user}
              voteUp={comment.vote_up}
              voteDown={comment.vote_down}
              vote={accessToken && comment.vote ? comment.vote.type : ''}
              noVote={isUserComment}
              author_id={parseInt(productAuthorId)}
            />
          )
        })
      )
    }
  };

  getComments = (locale) => {
    this.setState({
      isLoading: false,
    });
    let params = {
      'template_id' : this.props.templateId,
      'per-page'    : 10,
      'locale'      : locale,
      'sort'        : this.state.sort,
      'expand'      : 'vote,answers',
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
              totalCount: this.state.comments.totalCount+data.totalCount,
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
          if (this.state.comments.totalCount === 0 && this.state.localeIterator === 1 && LOCALE !== 'en') {
            LOCALE = 'en';
            this.getComments(LOCALE);
          } else if (this.state.comments.totalCount === 0 && this.state.localeIterator <= 2 && LOCALE === 'en') {
            LOCALE = '';
            this.getCommentsOtherLocales();
          }
        });
    }
  };

  getCommentsUser = (locale) => {
    let params = {
      'access_token': this.props.accessToken,
      'template_id': this.props.templateId,
      'per-page': 50,
      'locale': locale,
      'sort': this.state.sort,
      'status': 'pending',
    };
    comments.getCommentsUser(params)
      .then((data) => {
        this.setState({
          comments: {
            items: [...this.state.comments.items, ...data.items],
            totalCount: this.state.comments.totalCount+data.totalCount,
          },
        })
      });
  };

  getCommentsOtherLocales = () => {
    let params = {
      'template_id' : this.props.templateId,
      'per-page'    : 10,
      'sort'        : this.state.sort,
      'expand'      : 'vote',
    };
    comments.getComments(params).then((data) => {
      this.setState({
        countCommentsOtherLocale: data.totalCount
      });
    });
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
      case 'sortNewanswers':
        sortedBy = '-last_reply,-created_at';
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
      this.context.i18n.l('Newest'),
      this.context.i18n.l('Most helpful'),
      this.context.i18n.l('New answers'),
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

  otherLocale = () => {
    this.getComments('');
  };

  renderEmptyPage = () => {
    return (
      <ContentEmptyMessage
        page         = {'comments'}
        show         = {this.state.isEmpty}
        description  = {this.context.i18n.l(`It seems there are no comments to this product from your locale.\nYou can look at the comments from other locales.`)}
        textNoLocale = {this.context.i18n.l(`It seems there are no comments to this product.`)}
        isButton     = {this.state.countCommentsOtherLocale > 0}
        buttonText   = {this.context.i18n.l(`View ${this.state.countCommentsOtherLocale} Comments From Other Locales`)}
        buttonClick  = {this.otherLocale}
      />
    )
  };

  renderForm = () => {
    const { templateId, accessToken } = this.props;
    const { user, productAuthorId } = this.state;
    return (
      <CommentsForm
        template_id={templateId}
        access_token={accessToken}
        userName={user.name}
        userMail={user.mail}
        userAvatar={user.avatar}
        author_id={parseInt(productAuthorId)}
      />
    )
  };

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
          user: {
            id: data.id,
            name: data.userName,
            avatar: data.avatar,
            mail: data.login,
          }
        });
      });
  };

  render () {
    const {comments} = this.state;

    return (
      <div className="page-content ">
        <span className="comments__count">{comments.totalCount}</span>
        {
          comments.totalCount === 0 && !this.state.isLoading
          ? (
            <L1 className="content-loader"/>
          )
          : (
            comments.totalCount === 0
              ? (
                <div className="page-content__empty">
                  <div className="comments">
                    <h2 className="h3">{this.context.i18n.l('Questions & Answers')}</h2>


                  </div>
                  {this.renderEmptyPage()}
                </div>
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

                  {this.renderForm()}

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
          )
        }
      </div>

    );
  }
}
