import React from 'react';
import Comments from './CommentsWrapper';

export default class CommentsTab extends React.Component {

  render () {
    return (
      <Comments
        templateId={55555}
        accessToken={''}
      />
    )
  }
}