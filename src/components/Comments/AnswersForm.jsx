import React from 'react';
import Config from 'config.js';
import PropTypes from 'prop-types';
import Avatar from 'quark/lib/Avatar';
import TA5 from 'quark/lib/textareas/TA5';
import B1A from 'quark/lib/buttons/B1A';
import ReviewsData from 'plasma-reviews-api-client-js';
import CommentItem from './CommentItem';

import './Comments.less';

import {
  getCurrentLocale,
} from 'utils/';

const comments = new ReviewsData(Config.reviewsServiceURL);
const LOCALE = getCurrentLocale();

export default class CommentsForm extends React.Component {
  static propTypes = {
    template_id: PropTypes.number,
    accessToken: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    parentId: PropTypes.number,
    userData: PropTypes.object,
    replyToAnswer: PropTypes.bool,
    userAnswerName: PropTypes.string,
    authorId: PropTypes.number,
  };

  static contextTypes = {
    i18n: PropTypes.object,
  };

  state = {
    showComment: false,
    comments: {
      items: [],
    },
    commentValue: '',
  };

  componentDidMount() {
    window.addEventListener('keydown', this.sendCommentKey);
    window.addEventListener('keydown', this.checkCountValue);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.sendCommentKey);
    window.removeEventListener('keydown', this.checkCountValue);
  }

  checkCountValue = (event) => {
    const area = ReactDOM.findDOMNode(this.AnswerForm);
    if (area.contains(event.target)) {
      const textArea = document.getElementById('answer-text').value;
      const textAreaCount = textArea.length;
      if (textAreaCount >= 2000) {
        this.textarea.input.handleValidation({
          status: false,
          message: this.context.i18n.l('Maximum length of the comment is 2 000 signs'),
        });
      }
    }
  };

  componentWillMount() {
    this.state.commentValue = `${this.props.userAnswerName}, `;
  }

  /**
   * Add ctrl+enter event on send form
   * @param event
   */
  sendCommentKey = (event) => {
    const area = ReactDOM.findDOMNode(this.AnswerForm);
    if (event.keyCode === 13 && event.ctrlKey && area.contains(event.target) && document.querySelector('.AnswerTextArea.text-area.text-area_focused')) {
      this.handleFormSubmit(event);
    }
  };

  /**
   * Show user avatar
   * @param email
   * @param name
   * @param avatar
   * @returns {XML}
   */
  showAvatar = (email, name, avatar) => (
    <Avatar
      email={email || ''}
      name={name || this.context.i18n.l('Anonymous')}
      size={40}
      src={avatar || ''}
      isRounded
      className="review__author-icon"
    />
    );

  /**
   * Send comment
   * @param params
   */
  sendComment = (params) => {
    this.setState({
      commentValue: ' ',
    }, () => {
      const textarea = document.querySelector('.CommentsForm__textarea ');
      if (textarea.classList.contains('text-area_focused')) {
        textarea.classList.remove('text-area_focused');
      }
      textarea.classList.remove('text-area_filled');
    });

    const { accessToken, template_id, userName, userMail, userAvatar } = this.props;
    const user = {
      user_name: userName,
      user_mail: userMail,
      avatar: userAvatar,
    };

    this.setState({
      commentValue: ' ',
    });

    comments.addComment(accessToken, params).then((data) => {
      const commentItem = {
        user_name: data.items.user_name,
        user_email: data.items.user_email,
        content: data.items.content,
        date: data.items.created_at,
        status: data.items.status,
        accessToken,
        templateId: template_id,
        userData: user,
      };
      this.setState({
        comments: {
          items: [...this.state.comments.items, commentItem],
        },
        showComment: true,
        commentValue: '',
      });
    });
  };

  /**
   * Validation text from form
   * @param value
   * @returns {*}
   */
  textValidationRule(value) {
    const valueRegExp = /^[^<>]+$/;
    const teatAreaValue = value.trim();
    const valueCount = value.length;
    const isValid = valueRegExp.test(teatAreaValue);
    if (isValid) {
      if (valueCount < 1) {
        return {
          isValid: false,
          message: this.context.i18n.l('Minimum length of the comment is 1 sign'),
        };
      }
      return {
        isValid: true,
        message: null,
      };
    } else if (valueCount < 1) {
      return {
        isValid: false,
        message: this.context.i18n.l('Minimum length of the comment is 1 sign'),
      };
    }
    return {
      isValid: false,
      message: this.context.i18n.l('Please remove special symbols'),
    };
  }

  /**
   * Validation text and send form
   * @param event
   */
  handleFormSubmit = (event) => {
    const { template_id, userName, userMail, parentId, replyToAnswer, authorId } = this.props;
    let { userAnswerName } = this.props;
    event.preventDefault();
    const commentText = this.textarea.input.inputElement.value;

    if (this.textValidationRule(commentText).isValid) {
      let commentTextNew = commentText;
      if (replyToAnswer) {
        userAnswerName = userAnswerName || this.context.i18n.l('Anonymous');
        const reg = new RegExp(userAnswerName, 'g');
        commentTextNew = commentText.replace(reg, `<strong>${userAnswerName}</strong>`);
      }

      const commentsData = {
        template_id: template_id,
        content: commentTextNew,
        locale: LOCALE,
        user_name: userName,
        user_email: userMail,
        parent_id: parentId,
        authorId: authorId,
      };
      this.sendComment(commentsData);
    } else {
      this.textarea.input.handleValidation({
        status: false,
        message: this.textValidationRule(commentText).message,
      });
    }
  };

  /**
   * Show comment
   * @returns {Array}
   */
  showComments = () => {
    const { accessToken, template_id, userMail } = this.props;
    const { comments } = this.state;
    return (
      comments.items.map(comment => (
        <div className="Comments__itemNew">
          <CommentItem
            key={comment.date}
            userName={comment.user_name}
            userMail={userMail}
            content={comment.content}
            avatar=""
            date={comment.date}
            status={comment.status}
            accessToken={accessToken}
            answers={comment.answers}
            parentId={comment.id}
            templateId={template_id}
            userData={comment.userData}
          />
        </div>
          ),
      )
    );
  };


  render() {
    const { userMail, userName, userAvatar, replyToAnswer, userAnswerName } = this.props;
    const { showComment, commentValue } = this.state;

    return (
      <div className="Comments__form">
        <div className="Comments__item">
          <div className="Comments__avatar">
            {this.showAvatar(userMail, userName, userAvatar)}
          </div>
          <form
            className="CommentsForm"
            onSubmit={(event) => {
              this.handleFormSubmit(event);
            }}
            ref={c => this.AnswerForm = c}
          >
            <TA5
              className="CommentsForm__textarea AnswerTextArea"
              id="answer-text"
              label={this.context.i18n.l('Ask the author any question about the product')}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2B"
              value={commentValue}
              autofocus
            />
            <div className="CommentsForm__action">
              <B1A
                className="CommentsForm__button"
                type="submit"
                icon="message tm-icon"
              >
                {this.context.i18n.l('Send Message')}
              </B1A>
              <span className="CommentsForm__text t6">{this.context.i18n.l('Press Ctrl + Enter to send your message')}</span>
            </div>
          </form>
        </div>
        {
          showComment && this.showComments()
        }
      </div>
    );
  }
}
