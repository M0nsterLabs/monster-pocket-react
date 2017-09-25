import React from 'react';
import PropTypes from 'prop-types';
import './NotificationModeration.less';

export default class NotificationModeration extends React.Component {

  static propTypes = {
    status: PropTypes.string,
    message: PropTypes.string,
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  render () {
    const { status, message } = this.props;

    return (
      <div className={`notification-mod notification-mod_${status}`}>
        <i className="notification-mod__icon tm-icon icon-sand-clock"/>
        <p
          className="notification-mod__text t3">{message}
        </p>
        <div className={`notification-mod__triangle notification-mod__triangle_${status}`}> </div>
      </div>
    )
  }
}