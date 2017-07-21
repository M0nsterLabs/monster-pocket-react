import React     from 'react';
import PropTypes from 'prop-types';
import './Mascot.less';
export default class Mascot extends React.Component {
  static propTypes = {
    type : PropTypes.string,
    hide : PropTypes.bool
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
