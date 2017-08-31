import React from 'react';
import Config from 'config.js';
import PropTypes from 'prop-types';
import Avatar from 'quark/lib/Avatar';
import TA5 from 'quark/lib/textareas/TA5';
import B1A from 'quark/lib/buttons/B1A';
import ReviewsData from 'plasma-reviews-api-client-js';
import CommentItem from './CommentItem';
import NotificationModeration from '../NotificationModeration/';

import './Comments.less';

import {
  getCurrentLocale,
} from 'utils/';

let comments = new ReviewsData(Config.reviewsServiceURL);
let LOCALE = getCurrentLocale();

export default class CommentsForm extends React.Component {
  static propTypes = {
    template_id: PropTypes.number,
    access_token: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    parentId: PropTypes.number,
    author_id: PropTypes.number,
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    showComment: false,
    comments: {
      items: []
    },
    commentValue: "",
  };

  componentDidMount () {
    window.addEventListener('keydown', this.sendCommentKey);
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.sendCommentKey);
  }

  // componentWillUpdate () {
  //   this.setState({
  //     commentValue: '',
  //   });
  // }

  /**
   * Add ctrl+enter event on send form
   * @param event
   */
  sendCommentKey = (event) => {
    if (event.keyCode === 13 && event.ctrlKey && document.querySelector('.text-area.text-area_focused')) {
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
  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name ? name : this.context.i18n.l('Anonymous')}
        size      = {40}
        src       = {avatar ? avatar : ''}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

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

    const { access_token, template_id, userName, userMail, userAvatar } = this.props;
    const user = {
      user_name: userName,
      user_mail: userMail,
      avatar: userAvatar,
    };

    this.setState({
      commentValue: ' ',
    });

    comments.addComment(this.props.access_token, params).then((data) => {
      const commentItem = {
        user_name: data.items.user_name,
        user_email: data.items.user_email,
        content: data.items.content,
        date: data.items.created_at,
        status: data.items.status,
        access_token: access_token,
        templateId: template_id,
        userData: user,
      };
      this.setState({
        comments: {
          items: [ ...this.state.comments.items, commentItem ]
        },
        showComment: true,
        commentValue: '',
      })
    });
  };

  /**
   * Validation text from form
   * @param value
   * @returns {*}
   */
  textValidationRule (value) {
    const valueRegExp = /^[^<>]+$/;
    const teatAreaValue = value.trim();
    const valueCount = value.length;
    const isValid = valueRegExp.test(teatAreaValue);
    if (isValid) {
      if (valueCount < 1) {
        return {
          isValid : false,
          message : this.context.i18n.l('Minimum length of the comment is 1 sign')
        };
      } else {
        return {
          isValid : true,
          message : null
        };
      }
    } else {
      if (valueCount < 1) {
        return {
          isValid : false,
          message : this.context.i18n.l('Minimum length of the comment is 1 sign')
        };
      } else {
        return {
          isValid: false,
          message: this.context.i18n.l('Please remove special symbols')
        };
      }
    }
  }

  /**
   * Validation text and send form
   * @param event
   */
  handleFormSubmit = (event) => {
    const { template_id, userName, userMail, parentId, author_id } = this.props;
    event.preventDefault();
    let textArea = document.getElementById('comment-text');
    let reviewText = textArea.value;

    if (this.textValidationRule(reviewText).isValid) {
      const commentsData = {
        template_id: template_id,
        content: reviewText,
        locale: LOCALE,
        user_name: userName,
        user_email: userMail,
        author_id: author_id,
      };
      if (parentId) {
        commentsData['parent_id'] = parentId;
      }
      this.sendComment(commentsData);
    }
    else {
      this.textarea.input.handleValidation({
        status  : false,
        message : this.textValidationRule(reviewText).message
      });
    }
  };

  /**
   * Show comment
   * @returns {Array}
   */
  showComments = () => {
    const { access_token, template_id, userAvatar, userMail } = this.props;
    const { comments } = this.state;
    comments.items.sort(function(a, b) {
      return b.date - a.date;
    });
    return (
      comments.items.map((comment) => {
          return (
            <div className="Comments__itemNew">
              <CommentItem
                userName={comment.user_name}
                userMail={userMail}
                content={comment.content}
                avatar={userAvatar}
                date={comment.date}
                status={comment.status}
                access_token={access_token}
                answers={comment.answers}
                parentId={comment.id}
                templateId={template_id}
                userData={comment.userData}
              />
            </div>
          )
        }
      )
    )
  };

  render () {
    const { userMail, userName, userAvatar } = this.props;
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
          >
            <TA5
              className="CommentsForm__textarea"
              id="comment-text"
              label={this.context.i18n.l("Ask the author any question about the product")}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2B"
              value={commentValue}
            />
            <div className="CommentsForm__action">
              <B1A
                className="CommentsForm__button"
                type="submit"
                icon="message tm-icon"
              >
                {this.context.i18n.l("Send Message")}
              </B1A>
              <span className="CommentsForm__text t6">{this.context.i18n.l("Press Ctrl + Enter to send your message")}</span>
            </div>
          </form>
        </div>
        { showComment && this.showComments() }
      </div>
    );
  }
}
