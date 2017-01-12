import React from 'react';
import './Mascot.less';
export default class Mascot extends React.Component {
  static propTypes = {
    type : React.PropTypes.string,
    hide : React.PropTypes.bool
  };

  static defaultProps = {
    type : 'dro',
    hide : false
  };

  render () {
    const hideClass = (this.props.hide) ? 'mascot_hide' : '';
    return <div className={`mascot-wrapper mascot-wrapper_${this.props.type}`} ref={(mascot) => { this.domNode = mascot; }}>
      <div className={`mascot ${hideClass}`}>
        <div className={`mascot__face mascot__face_${this.props.type}`}></div>
      </div>
    </div>;
  }
}
