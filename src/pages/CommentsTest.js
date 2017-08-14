import React, { Component } from 'react';
import CommentTab from '../components/Comments/CommentsTab';

export default class Comment extends Component {
  render () {
    return (
      <div className='container' style={{maxWidth: '900px', margin: 'auto'}}>
        <h1>Comments</h1>

        <CommentTab/>
      </div>
    );
  }
}
