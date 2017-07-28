import React, {Component} from 'react';
import {Link} from 'react-router';
import SubscriptionTypePopUp from '../components/popups/SubscriptionTypePopUp.jsx';
import MembershipsClient from 'plasma-membership-api-client-js';

export default class PopUpTest extends Component {
  memberships = null
  state = {
    subscriptions: []
  };

  constructor () {
    super();
    const that = this;
    that.membershipAPI = new MembershipsClient('https://memberships.templatemonsterdev.com/api/v1', 'en');
    that.membershipAPI.getMembershipGroups({
      type_id: 67280
    }).then(function (data) {
      const membershipGroup = data[0];
      that.membershipAPI.getMemberships({
        group_id: membershipGroup.id
      }).then(function (data) {
        that.setState({
          ...that.state,
          subscriptions: data
        });
      }).catch(function (exception) {
        console.warn('getMemberships error', exception);
      });
    }).catch(function (exception) {
      console.warn('getMembershipGroups error', exception);
    });
  }
  render () {
    return (
      <div className='container'>
        <h1>PopUpTest Test</h1>
        <ul>
          <li><Link to='/mascot_test'>Mascot test</Link></li>
          <li><Link to='/'>Home</Link></li>
        </ul>
        <SubscriptionTypePopUp subscriptions={this.state.subscriptions} />
        {this.props.children}
      </div>
    );
  }
}
