import React, { Component } from 'react';
import ReviewTab from '../components/Review/ReviewTab';

export default class Review extends Component {
  render () {
    return (
      <div className='container' style={{maxWidth: '900px', margin: 'auto'}}>
        <h1>Reviews & Ratings</h1>

        <ReviewTab/>
      </div>
    );
  }
}
