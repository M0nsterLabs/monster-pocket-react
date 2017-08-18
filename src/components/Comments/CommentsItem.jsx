import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Interpolate from 'react-interpolate-component';
import Avatar from 'quark/lib/Avatar';
import FormattedDate from '../formattedDate';
import NotificationModeration from '../NotificationModeration/';
import AnswersForm from './AnswersForm';
import './Comments.less';

const APPROVED = 'approved';

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
    parentId: PropTypes.number,
    templateId: PropTypes.number,
    userData: PropTypes.object,
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    showComments: false,
    showFormAnswer: false,
    showForm: false,
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

  replyButton = (answer) => {
    return (
      <span
        className="comments__item-reply tm-icon icon-message"
        onClick={() => (answer === 'answer' ? this.showFormAnswer(): this.showForm())}
      >
          {this.context.i18n.l('Reply')}
      </span>
    )
  };

  showFormAnswer = () => {
    this.setState({
      showFormAnswer: true,
      showForm: false,
    });
  };

  showForm = () => {
    this.setState({
      showForm: true,
      showFormAnswer: false,
    });
  };

  renderForm = () => {
    const { templateId, access_token, userData, parentId } = this.props;
    return (
      <AnswersForm
        template_id={templateId}
        access_token={access_token}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={parentId}
      />
    )
  };

  showComments = () => {
    this.setState({
      showComments: !this.state.showComments,
      showFormAnswer: false,
      showForm: false,
    })
  };

  showCommentItem = (name, email, avatar, date, content, showModeratorMessage, showAnswersToComment, mainComment ) => {
    const { access_token, answers, parentId, status } = this.props;
    const { showComments, showForm, showFormAnswer } = this.state;
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
            {
              status === APPROVED &&
                <div className="comments__describe-footer t3">
                  {access_token &&
                  (mainComment
                      ? this.replyButton()
                      : this.replyButton('answer')
                  )
                  }
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
            }
          </div>
          {showModeratorMessage && this.showModeratorMessage()}
          {showForm && this.renderForm()}
          {showAnswersToComment && showComments && this.showAnswersToComment()}
          {showFormAnswer && this.renderForm()}
        </div>
      </article>
    )
  };

  showAnswersToComment = () => {
    const { answers, parentId } = this.props;
    // const { showFormAnswer } = this.state;

    if (_.isEmpty(answers)) return;
    return (
      answers.map((answer) => {
        return (
          <div className="comments__answers">
            {this.showCommentItem(answer.user_name, answer.user_email, answer.avatar, answer.created_at, answer.content, true, false, false )}
          </div>
        )
      })
    )
  };

  render () {
    const { userMail, userName, userAvatar, content, date, parentId } = this.props;
    const { showForm } = this.state;
    console.log('userMail', userMail);
    console.log('userName', userName);
    console.log('userAvatar', userAvatar);
    console.log('content', content);
    console.log('date',date );
    return (
      <div>
        {this.showCommentItem(userName, userMail, userAvatar, date, content, true, true, true )}
        {/*{showForm && this.renderForm(parentId) }*/}
      </div>
    )
  }
}
