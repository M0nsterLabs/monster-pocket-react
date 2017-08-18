import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Interpolate from 'react-interpolate-component';
import Avatar from 'quark/lib/Avatar';
import FormattedDate from '../formattedDate';
import NotificationModeration from '../NotificationModeration/';
import './Comments.less';


export default class CommentsItem extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    date: PropTypes.number,
    status: PropTypes.string,
    access_token: PropTypes.string,
    answers: PropTypes.arrayOf(PropTypes.object),
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    showComments: false,
  };

  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name ? name : this.context.i18n.l('User')}
        size      = {40}
        src       = {avatar ? avatar : ''}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

  showModeratorMessage = () => {
    const { status } = this.props;
    if (status === 'pending') {
      return (
        <NotificationModeration
          status={status}
          message={this.context.i18n.l('The comment is visible only for you. Sorry, but we need to check it before publication. When we check it & reply to it, you\'ll get a notifications and an email :)')}
        />
      )
    }
  };

  replyButton = () => {
    return (
      <span className="comments__item-reply tm-icon icon-message" onClick={() => this.showForm()}>{this.context.i18n.l('Reply')}</span>
    )
  };

  showComments = () => {
    this.setState({
      showComments: !this.state.showComments
    })
  };

  showCommentItem = (name, email, avatar, date, content, showModeratorMessage, showAnswersToComment ) => {
    const { access_token, answers } = this.props;
    const { showComments } = this.state;
    let textViewButton;
    if (!_.isEmpty(answers)) {
      if (!showComments && answers.length === 1) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answer');
      } else if (!showComments && answers.length > 1 ) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answers');
      } else if (answers.length === 1) {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answer');
      } else {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answers');
      }
    }
    return (
      <article className="comments__item">
        <div className="comments__avatar">
          {this.showAvatar(email, name, avatar)}
        </div>
        <div className="comments__info">
          <div className="comments__describe">
            <div className="comments__describe-header t5">
              <div className="comments__author">{name || this.context.i18n.l('User')}</div>
              <FormattedDate timestamp={date} className="comments__date"/>
            </div>
            <div className="comments__content t3">{content}</div>
            <div className="comments__describe-footer t3">
              {access_token && this.replyButton()}
              {showAnswersToComment && !_.isEmpty(answers)
                && <div className="comments__viewAnswer" onClick={() => this.showComments()}>
                     <Interpolate
                       with={{countAnswers: answers.length}}
                       format={textViewButton}
                     />
                   </div>
              }
              <div className="comments__votes">Controls</div>
            </div>
          </div>
          {showModeratorMessage && this.showModeratorMessage()}
          {showAnswersToComment && showComments && this.showAnswersToComment()}
        </div>
      </article>
    )
  };

  showAnswersToComment = () => {
    const { answers } = this.props;
    if (_.isEmpty(answers)) return;
    return (
      answers.map((answer) => {
        return (
          <div className="comments__answers">
            {this.showCommentItem(answer.user_name, answer.user_email, answer.avatar, answer.created_at, answer.content, true, false )}
          </div>
        )
      })
    )
  };

  render () {
    const { userMail, userName, userAvatar, content, date } = this.props;

    return (
      this.showCommentItem(userName, userMail, userAvatar, date, content, true, true )
    )
  }
}
