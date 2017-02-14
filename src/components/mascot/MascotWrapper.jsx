import React from 'react';
import ReactDOM from 'react-dom';
import HtmlToJsx from '../html-to-js';
import {connectNotificationTrigger} from 'quark/lib/utils';
import Mascot from './Mascot.jsx';
import 'quark/css/main.css';

export default class MascotWrapper extends React.Component {
  static propTypes = {
    timeout            : React.PropTypes.number,
    type               : React.PropTypes.string,
    afterRemoveDomNode : React.PropTypes.func,
    button             : React.PropTypes.object
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
    ReactDOM.findDOMNode(this.trigger.target.domNode).addEventListener('animationend', () => {
      this.setState({
        hide: true
      });
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
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
        this.props.afterRemoveDomNode();
        this.status.umounted = true;
      });
    }
  }

  componentDidMount () {
    let MascotDomElement = ReactDOM.findDOMNode(this.trigger.target.domNode).getElementsByClassName('mascot')[0];
    MascotDomElement.addEventListener('animationend', () => {
      this.showTooltip();
    });
    if (this.props.timeout) {
      setTimeout(() => {
        this.closeMascot();
      }, this.props.timeout);
    }
    this.status.umounted = false;
  }

  render () {
    const MascotWrapperTrigger = connectNotificationTrigger(Mascot);
    return (<MascotWrapperTrigger
      notification={{
        code     : 'N1G',
        text     : (<HtmlToJsx html={this.props.text} />),
        minWidth : '250px',
        button   : this.props.button
      }}
      afterClose={this.closeMascot}
      notificationAlt={{status: false}}
      trigger={this.trigger}
      ref={c => this.trigger = c}
      hide={this.state.hide}
      type={this.props.type}
    />);
  }
}
