import React, { Component } from 'react';
import Reviews from '../components/ReviewCard/ReviewWrapper';

export default class Review extends Component {
  render () {
    return (
      <div className='container'>
        <h1>Reviews & Ratings</h1>

        <Reviews />
      </div>
    );
  }
}
