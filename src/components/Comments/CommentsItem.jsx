import React from 'react';
import PropTypes from 'prop-types';
import Avatar from 'quark/lib/Avatar';

import './Comments.less';

export default class CommentsItem extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    date: PropTypes.string,
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

  render () {
    const { userMail, userName, userAvatar, content, date} = this.props;
    return (
      <article className="comments__item">
        <div className="comments__avatar">
          {this.showAvatar(userMail, userName, userAvatar)}
        </div>
        <div className="comments__describe">
          <div className="comments__describe-header t5">
            <div className="comments__author">{userName || this.context.i18n.l('User')}</div>
            <div className="comments__date">{date}</div>
          </div>
          <div className="comments__content t3">{content}</div>
          <div className="comments__describe-footer t3">
            <div className="">Reply</div>
            <div className="">View 1 answer</div>
            <div className="">Controls</div>
          </div>
        </div>
      </article>
    );
  }
}
