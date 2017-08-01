import React, { Component } from 'react';
import Header from '../containers/Header';
import './App.less';
import '../www/styles/fonts.less';

export default class App extends Component {
  render () {
    return (
      <div className='app'>
        <Header/>
        {this.props.children}
      </div>
    );
  }
}
