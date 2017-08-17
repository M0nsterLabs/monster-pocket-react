import React from 'react';
import Config from 'config.js';
import PropTypes from 'prop-types';
import Avatar from 'quark/lib/Avatar';
import TA5 from 'quark/lib/textareas/TA5';
import B1A from 'quark/lib/buttons/B1A';
import ReviewsData from 'plasma-reviews-api-client-js';

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
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {

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
    console.log(params);
    comments.addComment(this.props.access_token, params).then((data) => {
      console.log(data);
    });
  };


  handleFormSubmit = (event) => {
    event.preventDefault();
    let textArea = document.getElementById('comment-text');
    let reviewText = textArea.value;

    if (reviewText.length > 0) {
      const commentsData = {
        template_id: this.props.template_id,
        content: reviewText,
        locale: LOCALE,
        user_name: this.props.userName,
        user_email   : this.props.userMail,
      };
      this.sendComment(commentsData);
    }
    // else {
    //   this.textarea.input.handleValidation({
    //     status  : false,
    //     message : this.textValidationRule(reviewText).message
    //   });
    // }
  };

  render () {
    const { userMail, userName, userAvatar} = this.props;
    return (
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
    );
  }
}
