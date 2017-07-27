import React, {Component} from 'react';
import {Link} from 'react-router';
import SubscriptionTypePopUp from '../components/popups/SubscriptionTypePopUp.jsx';

export default class PopUpTest extends Component {
  render () {
    return (
      <div className='container'>
        <h1>PopUpTest Test</h1>
        <ul>
          <li><Link to='/mascot_test'>Mascot test</Link></li>
          <li><Link to='/'>Home</Link></li>
        </ul>
        <SubscriptionTypePopUp />
        {this.props.children}
      </div>
    );
  }
}
