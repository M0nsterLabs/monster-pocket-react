import React from 'react';
import Config from 'config.js';
import PropTypes from 'prop-types';
import Avatar from 'quark/lib/Avatar';
import TA5 from 'quark/lib/textareas/TA5';
import B1A from 'quark/lib/buttons/B1A';
import ReviewsData from 'plasma-reviews-api-client-js';
import CommentsItem from './CommentsItem';

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
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    showComment: false,
    comments: {
      items: []
    },
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

  sendComment = (params) => {
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
    const { template_id, userName, userMail, parentId } = this.props;
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
    textArea.value='';
  };

  showComments = () => {
    const { access_token, template_id } = this.props;
    const { comments } = this.state;
    return (
      comments.items.map((comment) => {
          return (
            <div className="comments__item-new">
              <CommentsItem
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
    const { userMail, userName, userAvatar } = this.props;
    const { showComment } = this.state;
    return (
      <div className="comments__form">
        <div className="comments__item">
          <div className="comments__avatar">
            {this.showAvatar(userMail, userName, userAvatar)}
          </div>
          <form
            className="CommentsForm"
            id="comment-form"
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
            />
            <B1A
              className="CommentsForm__button"
              type="submit"
              icon="message tm-icon"
            >
              {this.context.i18n.l("Send Message")}
            </B1A>
          </form>
        </div>
        {
          showComment && this.showComments()
        }
      </div>
    );
  }
}
