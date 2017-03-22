import React, {Component} from 'react';
import {Link} from 'react-router';
import SocialProof from '../components/social_proof/SocialProof';

export default class SocialTest extends Component {
  render () {
    return (
      <div className='container'>
        <SocialProof
          notice={[
            {
              text        : 'Hello world!!',
              icon        : 'cart',
              iconCloseId : 'fdsjkfs'
            },
            {
              text : 'Hello world!!',
              icon : 'cash'
            },
            {
              text : 'Hello world!!',
              icon : 'docs'
            },
            {
              text : 'Hello world!!',
              icon : 'like-fill'
            },
            {
              text : 'Hello world!!',
              icon : 'search'
            },
            {
              text: 'Hello world!!'
            }
          ]}
        />
        <h1>Socials test</h1>
        <ul>
          <li><Link to='/mascot_test'>Mascot test</Link></li>
          <li><Link to='/'>Home</Link></li>
        </ul>
        {/* добавили вывод потомков */}
        {this.props.children}
      </div>
    );
  }
}

