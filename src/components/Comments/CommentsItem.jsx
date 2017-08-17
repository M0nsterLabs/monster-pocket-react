import React from 'react';
import PropTypes from 'prop-types';
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

  render () {
    const { userMail, userName, userAvatar, content, date } = this.props;
    return (
      <article className="comments__item">
          <div className="comments__avatar">
            {this.showAvatar(userMail, userName, userAvatar)}
          </div>
          <div className="comments__info">
            <div className="comments__describe">
              <div className="comments__describe-header t5">
                <div className="comments__author">{userName || this.context.i18n.l('User')}</div>
                <FormattedDate timestamp={date} className="comments__date" />
              </div>
              <div className="comments__content t3">{content}</div>
              <div className="comments__describe-footer t3">
                <div className="">Reply</div>
                <div className="">View 1 answer</div>
                <div className="">Controls</div>
              </div>
            </div>
            {this.showModeratorMessage()}
          </div>
      </article>
    );
  }
}
