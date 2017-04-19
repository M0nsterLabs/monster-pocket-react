import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Home extends Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };
  render () {
    return (
      <div className='container'>
        <h1>{this.context.i18n.l('Home')}</h1>
        <ul>
          <li><Link to='/mascot_test'>{this.context.i18n.l('Mascot test')}</Link></li>
          <li><Link to='/socials_test'>{this.context.i18n.l('Social test')}</Link></li>
          <li><Link to='/review_test'>{this.context.i18n.l('Reviews & Ratings')}</Link></li>
        </ul>
        {/* добавили вывод потомков */}
        {this.props.children}
      </div>
    );
  }
}
