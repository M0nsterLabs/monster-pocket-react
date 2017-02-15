import React, {Component} from 'react';
import {Link} from 'react-router';
import MascotComponent from '../components/mascot/MascotWrapper';

export default class MascotTest extends Component {
  render () {
    return (
      <div className='container'>
        <h1>Mascot test</h1>
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/socials_test'>Socials Test</Link></li>
        </ul>
        <MascotComponent
          type="chan"
          text="<b>Plop Plop! I’m Dro</b>, OpenCart monster. My mission is to give you some useful info."
          timeout={0}
          button={{
            text    : 'it`s ok',
            onClick : () => console.log(111)
          }}
        />
        {this.props.children}
      </div>
    );
  }
}
