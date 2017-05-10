import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import HtmlToJsx from '../html-to-js';
import {connectNotificationTrigger} from 'quark/lib/utils';
import Mascot from './Mascot.jsx';
import 'quark/css/main.css';

export default class MascotWrapper extends React.Component {
  static propTypes = {
    timeout            : PropTypes.number,
    type               : PropTypes.string,
    closeIconId        : PropTypes.string,
    afterRemoveDomNode : PropTypes.func,
    button             : PropTypes.object
  };

  static defaultProps = {
    text               : '',
    timeout            : 0,
    type               : 'dro',
    button             : {},
    afterRemoveDomNode : () => {
    }
  };

  status = {
    umounted: false
  };

  state = {
    hide: false
  };

  closeMascot = () => {
    this.setState({
      hide: true
    });
    this.trigger.hideNotification(this, true);
  };

  showTooltip = () => {
    this.trigger.showNotification();
    let notice = ReactDOM.findDOMNode(this.trigger.notification.notification);
    notice.style.width = '240px';
  };

  componentDidUpdate () {
    if (this.state.hide) {
      ReactDOM.findDOMNode(this).addEventListener('animationend', () => {
        this.props.afterRemoveDomNode();
        this.status.umounted = true;
      });
    }
  }

  componentDidMount () {
    setTimeout(() => {
      this.showTooltip();
    }, 150);
    if (this.props.timeout) {
      setTimeout(() => {
        this.closeMascot();
      }, this.props.timeout);
    }
    this.status.umounted = false;
  }

  render () {
    const MascotWrapperTrigger = connectNotificationTrigger(Mascot);
    return (!this.status.umounted) ? (<MascotWrapperTrigger
      notification={{
        code        : 'N1G',
        text        : (<HtmlToJsx html={this.props.text}/>),
        minWidth    : '250px',
        button      : this.props.button,
        closeIconId : this.props.closeIconId
      }}
      afterClose={this.closeMascot}
      notificationAlt={{status: false}}
      trigger={this.trigger}
      ref={c => this.trigger = c}
      hide={this.state.hide}
      type={this.props.type}
    />) : false;
  }
}
