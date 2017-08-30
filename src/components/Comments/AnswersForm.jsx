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
    userData: PropTypes.object,
    replyToAnswer: PropTypes.bool,
    userAnswerName: PropTypes.string,
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

  sendCommentKey = (event) => {
    if (event.keyCode === 13 && event.ctrlKey && document.querySelector('.text-area.text-area_focused')) {
      this.handleFormSubmit(event);
    }
  };

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
      })
    });
  };

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

  handleFormSubmit = (event) => {
    const { template_id, userName, userMail, parentId, replyToAnswer, author_id } = this.props;
    let { userAnswerName } = this.props;
    event.preventDefault();
    let textArea = document.getElementById('answer-text');
    let commentText = textArea.value;

    if (this.textValidationRule(commentText).isValid) {

      let commentTextNew = commentText;
      if (replyToAnswer) {
        userAnswerName = userAnswerName || this.context.i18n.l("Anonymous");
        let reg = new RegExp(userAnswerName,"g");
       // commentTextNew = commentText.replace(reg, "&lt;em&gt;$1&lt;/em&gt;");
        commentTextNew = commentText.replace(reg, userAnswerName);
      }

      const commentsData = {
        template_id: template_id,
        content: commentTextNew,
        locale: LOCALE,
        user_name: userName,
        user_email: userMail,
        parent_id: parentId,
        author_id: author_id,
      };
      this.sendComment(commentsData);
    }
    else {
      this.textarea.input.handleValidation({
        status  : false,
        message : this.textValidationRule(commentText).message
      });
    }
  };

  showComments = () => {
    const { access_token, template_id } = this.props;
    const { comments } = this.state;
    return (
      comments.items.map((comment) => {
          return (
            <div className="comments__item-new">
              <CommentItem
                userName={comment.user_name}
                userMail={comment.user_email}
                content={comment.content}
                avatar=""
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
    const { userMail, userName, userAvatar, replyToAnswer, userAnswerName } = this.props;
    const { showComment, commentValue } = this.state;

    return (
      <div className="comments__form">
        <div className="comments__item">
          <div className="comments__avatar">
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
              id="answer-text"
              label={this.context.i18n.l("Ask the author any question about the product")}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2B"
              value={replyToAnswer ? `${userAnswerName || this.context.i18n.l('Anonymous')}, ` : ''}
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
        {
          showComment && this.showComments()
        }
      </div>
    );
  }
}
