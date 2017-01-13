import React from 'react';

export default class HtmlToJsx extends React.Component {
  render () {
    return <span dangerouslySetInnerHTML={{__html : this.props.html}}>
      {this.props.children}
    </span>;
  }
}