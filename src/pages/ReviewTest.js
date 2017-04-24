import React, { Component } from 'react';
import Reviews from '../components/ReviewCard/ReviewWrapper';

export default class Review extends Component {
  render () {
    return (
      <div className='container' style={{maxWidth: '600px'}}>
        <h1>Reviews & Ratings</h1>

        <Reviews
          templateId={53001}
          accessToken={'SRd4yhJY1NnssLu2GjqjrVdeOS35FNzuFVNM9W8t'}
        />
      </div>
    );
  }
}
