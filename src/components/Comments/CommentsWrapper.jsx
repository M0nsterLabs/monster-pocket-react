import React from 'react';
import Config from 'config.js';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ContentEmptyMessage from '../ContentEmptyMessage/';
import L1 from 'quark/lib/loaders/L1';
import L3 from 'quark/lib/loaders/L3';
import B2E from 'quark/lib/buttons/B2E';
import DD1 from 'quark/lib/dropdowns/DD1';

import ReviewsData from 'plasma-reviews-api-client-js';

import CommentItem from './CommentItem';
import CommentsForm from './CommentsForm';

import {
  getCdnImageUrl,
  infiniteDataLoader,
  getCurrentLocale,
  getResponseJSON,
} from 'utils/';

import './Comments.less';

const comments = new ReviewsData(Config.reviewsServiceURL);
let LOCALE = getCurrentLocale();
const PENDING = 'pending';

export default class Comments extends React.Component {
  static propTypes = {
    templateId: PropTypes.number.isRequired,
    accessToken: PropTypes.string,
  };

  static contextTypes = {
    i18n: PropTypes.object,
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
    usersIds: [],
    usersData: [],
    allAvatars: false,
    otherLocales: false,
  };

  componentDidMount() {
    if (this.props.accessToken) {
      this.getUserProfile();
      this.getCommentsUser(LOCALE);
      this.getComments(LOCALE);
      this.getProductData(LOCALE);
    } else {
      this.getComments(LOCALE);
      this.getProductData(LOCALE);
    }
  }

  /**
   * Get product data of template
   * @param locale
   */
  getProductData = (locale = 'en') => {
    const { templateId } = this.props;

    fetch(`${Config.productsServiceURL}products/${locale}/${templateId}`, {
      method: 'get',
    })
      .then(response => (
       response.json()
  )).then((product) => {
        this.setState({
          productAuthorId: product.authorUserId || 0,
        });
      });
  };

  /**
   * Show all comments on template
   * @returns {Array}
   */
  renderComments = () => {
    const { accessToken, templateId } = this.props;
    const { comments, user, productAuthorId, otherLocales } = this.state;
    if (comments.items) {
      return (
        comments.items.map((comment) => {
          let avatar = '';
          let email = comment.user_email;
          if (comment.avatar) {
            avatar = comment.avatar;
          } else if (comment.status === PENDING) {
            avatar = user.avatar;
            email = user.mail;
          }
          const isUserComment = accessToken && parseInt(user.id) === parseInt(comment.user_id);
          return (
            <CommentItem
              userName={comment.user_name}
              userMail={email}
              content={comment.content}
              avatar={avatar}
              date={comment.created_at}
              key={comment.created_at}
              status={comment.status}
              accessToken={accessToken}
              answers={comment.answers}
              id={comment.id}
              templateId={templateId}
              userData={user}
              voteUp={comment.vote_up}
              voteDown={comment.vote_down}
              vote={accessToken && comment.vote ? comment.vote.type : ''}
              noVote={isUserComment}
              authorId={parseInt(productAuthorId)}
              locale={comment.locale}
              otherLocales={otherLocales}
            />
          );
        })
      );
    }
  };

  /**
   * Get all comments on template
   * @param locale
   */
  getComments = (locale) => {
    this.setState({
      isLoading: false,
    });
    let params = {
      template_id: this.props.templateId,
      'per-page': 10,
      locale,
      sort: this.state.sort,
      expand: 'vote,answers',
    };
    const paginationData = {};
    const currentState = this.state.comments;
    if (this.shouldFetchDataItems(currentState)) {
      const requestPageIndex = currentState.currentPageIndex + 1 || 1;
      params = {
        ...params,
        page: requestPageIndex,
      };

      comments.getComments(params)
        .then((data) => {
          paginationData.currentPageIndex = data.currentPageIndex;
          paginationData.lastPageIndex = data.lastPageIndex;
          paginationData.totalCount = data.totalCount;

          if (paginationData.totalCount > 10) {
            this.setState({
              showMoreVisible: true,
            });
          }

          this.setState({
            comments: {
              items: [...this.state.comments.items, ...data.items],
              totalCount: this.state.comments.totalCount + data.totalCount,
              ...paginationData,
            },
            isLoading: true,
            localeIterator: this.state.localeIterator + 1,
          });
        })
        .then(() => {
          if (paginationData.currentPageIndex === paginationData.lastPageIndex) {
            this.setState({
              showMoreVisible: false,
            });
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
        }).then(() => {
          this.state.comments.items.map((comment) => {
            this.state.usersIds.push(comment.user_id);
          });
        }).then(() => {
          this.getAvatars();
        });
    }
  };

  /**
   * Get users avatars
   */
  getAvatars = () => {
    const { usersIds, comments } = this.state;
    let { usersData } = this.state;
    fetch(`${Config.accountServiceURL}users/profiles?ids=${usersIds}`, {
      method: 'get',
    })
      .then(getResponseJSON)
      .then((data) => {
        usersData = [...usersData, ...data];
      })
      .then(() => {
        comments.items.map(comment => (
            usersData.map((userData) => {
              if (comment.user_id != userData.id) return;
              comment.avatar = userData.avatar;
            })
          ));
      })
      .then(() => {
        this.setState({
          allAvatars: true,
        });
      });
  };

  /**
   * Get users comments (all status)
   * @param locale
   */
  getCommentsUser = (locale) => {
    const params = {
      access_token: this.props.accessToken,
      template_id: this.props.templateId,
      'per-page': 50,
      locale,
      sort: this.state.sort,
      status: 'pending',
    };
    comments.getCommentsUser(params)
      .then((data) => {
        this.setState({
          comments: {
            items: [...this.state.comments.items, ...data.items],
            totalCount: this.state.comments.totalCount + data.totalCount,
          },
        });
      });
  };

  /**
   * Get comments from other locales
   */
  getCommentsOtherLocales = () => {
    this.setState({
      otherLocales: true,
    });
    const params = {
      template_id: this.props.templateId,
      'per-page': 10,
      sort: this.state.sort,
      expand: 'vote',
    };
    comments.getComments(params).then((data) => {
      this.setState({
        countCommentsOtherLocale: data.totalCount,
      });
    });
  };

  /**
   * Loading on page for get next page with comments
   * @param currentState
   * @returns {boolean}
   */
  shouldFetchDataItems = (currentState) => {
    const currentItemsCount = currentState.items ? currentState.items.length : 0;
    const totalItemsCount = currentState.totalCount;
    return currentItemsCount === 0 || currentItemsCount < totalItemsCount;
  };

  /**
   * Get sorted comments
   * @param sorted
   */
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
        items: [],
      },
    }, () => {
      this.getComments(LOCALE);
    });
  };

  /**
   * Sorting for comments
   * @returns {XML}
   */
  sortComments = () => {
    const sortValue = [
      'Newest',
      'Most helpful',
      'New answers',
    ];
    let form;
    return (
      <DD1
        className="reviews__sort"
        options={sortValue.map(sortItem => ({
          label: sortItem,
          icon: '',
          value: `sort${sortItem.replace(/\s/g, '')}`,
        }))}
        ref={(ref) => { form = ref; }}
        label={this.context.i18n.l('Show first:')}
        pattern=""
        defaultValue={'Most helpful' || null}
        onChange={value => this.changeSortValue(value)}
      />
    );
  };

  /**
   * Load next comments
   */
  loadDownloads = () => {
    if (this.state.comments.totalCount > 0 && this.state.isLoading === true) {
      this.getComments(LOCALE);
    }
  };

  /**
   * Get reviews from other locales
   */
  otherLocale = () => {
    this.getComments('');
  };

  /**
   * Show empty comments page
   * @returns {XML}
   */
  renderEmptyPage = () => (
    <ContentEmptyMessage
      page={'comments'}
      show={this.state.isEmpty}
      description={this.context.i18n.l('It seems there are no comments to this product from your locale.\nYou can look at the comments from other locales.')}
      textNoLocale={this.context.i18n.l('It seems there are no comments to this product.')}
      isButton={this.state.countCommentsOtherLocale > 0}
      buttonText={this.context.i18n.l(`View ${this.state.countCommentsOtherLocale} Comments From Other Locales`)}
      buttonClick={this.otherLocale}
    />
    );

  /**
   * Show form
   * @returns {XML}
   */
  renderForm = () => {
    const { templateId, accessToken } = this.props;
    const { user, productAuthorId } = this.state;
    return (
      <CommentsForm
        template_id={templateId}
        accessToken={accessToken}
        userName={user.name}
        userMail={user.mail}
        userAvatar={user.avatar}
        authorId={parseInt(productAuthorId)}
      />
    );
  };

  /**
   * Get users profile
   */
  getUserProfile = () => {
    fetch(`${Config.accountServiceURL}users/profile`, {
      method: 'get',
      headers: {
        Authorization: this.props.accessToken,
      },
    })
      .then(getResponseJSON)
      .then((data) => {
        this.setState({
          user: {
            id: data.id,
            name: data.userName || this.context.i18n.l('Anonymous'),
            avatar: data.avatar,
            mail: data.login,
          },
        });
      });
  };

  render() {
    const { accessToken } = this.props;
    const { comments } = this.state;

    return (
      <div className="PageContent">
        <span className="Comments__count">{comments.totalCount}</span>
        {
          comments.totalCount === 0 && !this.state.isLoading
          ? (
            <L1 className="ContentLoader" />
          )
          : (
            comments.totalCount === 0
              ? (
                <div className="PageContent__empty">
                  <div className="Comments">
                    <h2 className="h3">{this.context.i18n.l('Questions & Answers')}</h2>

                    {accessToken && this.renderForm()}
                  </div>
                  {this.renderEmptyPage()}
                </div>
              )
              : (
                <div className="Comments">
                  <div className="Comments__header">
                    <h2 className="h3">
                      <span className="Comments__totalCount">{comments.totalCount} </span>
                      {this.context.i18n.l('Questions & Answers')}
                    </h2>
                    {this.sortComments()}
                  </div>

                  {_.isEmpty(this.state.comments.items)
                    ? <L1 className="ContentLoader" />
                    :
                    <div className="Comments__content">
                      {accessToken && this.renderForm()}
                      {this.renderComments()}
                    </div>
                  }

                  {
                    this.state.showMoreVisible && !_.isEmpty(this.state.comments.items) && (
                      <B2E
                        className="Comments__btn"
                        id="ShowMoreComments"
                        onClick={this.loadDownloads}
                        disabled={!this.state.isLoading}
                        isLoading={!this.state.isLoading}
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
