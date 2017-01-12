import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Home extends Component {
  render () {
    return (
      <div className='container'>
        <h1>Home</h1>
        <ul>
          <li><Link to='/mascot_test'>Mascot test</Link></li>
          <li><Link to='/socials_test'>Social test</Link></li>
        </ul>
        {/* добавили вывод потомков */}
        {this.props.children}
      </div>
    );
  }
}
