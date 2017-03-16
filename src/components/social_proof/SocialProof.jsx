import React from 'react';
import ReactDOM from 'react-dom';
const Shortid = require('shortid');
import './SocialProof.less';
export default class SocialProof extends React.Component {
  static propTypes = {
    notice: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    width: React.PropTypes.number
  };

  static defaultProps = {
    notice             : {},
    width              : 340,
    afterRemoveDomNode : () => {
    }
  };
  state = {
    notice      : [],
    fixed       : false,
    topPosition : 0
  };
  isUpdate = false;
  refsArray = [];

  constructor (props) {
    super(props);
    if (Array.isArray(props.notice)) {
      this.state.notice = props.notice.map((item) => {
        item.type = item.type || 'default';
        item.icon = item.icon || false;
        item.hide = false;
        return item;
      });
    } else {
      let item = props.notice;
      item.type = item.type || 'default';
      item.icon = item.icon || false;
      item.hide = false;
      this.state.notice = [item];
    }
  };

  onHideNotice = (id) => {
    const noticeHTML = this.refsArray.find((element) => {
      let result = null;
      if (element.getAttribute('data-id') === id) {
        result = element;
      }
      return result;
    });
    let state = this.state;
    setTimeout(() => {
      noticeHTML.style.marginTop = (noticeHTML.offsetHeight * -1) + 'px';
    }, 1);
    state.notice = this.state.notice.map((element) => {
      let item = element;
      if (item.id === id) {
        item.hide = true;
      }
      return item;
    });
    state = this.clearNoticeObject(state);
    this.setState(state);
    noticeHTML.addEventListener('animationend', () => {
      state.notice = this.state.notice.filter((element) => {
        return element.id !== id;
      });
      this.setState(state);
      if (!this.state.notice.length) {
        this.props.afterRemoveDomNode();
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
      }
    });
  };

  clearNoticeObject = (state = this.state) => {
    state.notice.map((item) => {
      let element = item;
      element.className = '';
      return element;
    });
    return state;
  };

  calcMarginTop = () => {
    let totalHeight = 0;
    if (this.isUpdate) {
      this.refsArray.forEach((element) => {
        if (element.classList.contains('new-element')) {
          totalHeight += (element.offsetHeight || 0) + 20;
          element.classList.remove('new-element');
        }
      });
    }
    this.refsArray.forEach((element, i) => {
      if (totalHeight) {
        if (i === 0) {
          element.style.marginTop = (totalHeight * -1) + 'px';
        } else {
          element.style.marginTop = '20px';
        }
      } else {
        element.style.marginTop = (element.offsetHeight * -1) + 'px';
      }
      element.addEventListener('animationend', () => {
        element.style.marginTop = '20px';
        element.classList.remove('notice_show');
      });
    });
  };

  componentWillReceiveProps = (nextProps) => {
    let newProps = nextProps;
    let state = this.clearNoticeObject();
    if (Array.isArray(newProps.notice)) {
      newProps.notice.map((item) => {
        let element = item;
        element.className = 'new-element notice_show';
        element.id = Shortid.generate();
        state.notice.unshift(element);
      });
    } else {
      let element = newProps.notice;
      element.className = 'new-element notice_show';
      element.id = Shortid.generate();
      state.notice.unshift(element);
    }
    this.isUpdate = true;
    state.notice = state.notice.map((item) => {
      item.type = item.type || 'default';
      item.icon = item.icon || false;
      return item;
    });
    this.setState(state);
  };

  componentDidUpdate = () => {
    if (this.isUpdate) {
      this.calcMarginTop();
      this.isUpdate = false;
    }
  };

  componentDidMount = () => {
    this.calcMarginTop();
    this.setState({
      ...this.state,
      topPosition: ReactDOM.findDOMNode(this).offsetTop
    });
    document.addEventListener('scroll', e => {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      if (scrolled > this.state.topPosition && !this.state.fixed) {
        this.setState({
          ...this.state,
          fixed: true
        });
      }
      if (scrolled < this.state.topPosition && this.state.fixed) {
        this.setState({
          ...this.state,
          fixed: false
        });
      }
    });
  };

  componentWillMount = () => {
    let state = this.state;
    let notice = [];
    [...state.notice].forEach((element, i) => {
      element.id = Shortid.generate();
      if (element.className) {
        element.className += ' notice_show';
      } else {
        element.className = ' notice_show';
      }
      notice[i] = element;
    });
    state.notice = notice;
    this.setState(state);
  };

  render () {
    this.refsArray = [];
    return (
      <div className={`notice-wrapper ${this.state.fixed ? 'notice-wrapper_fixed' : ''}`} style={{width: this.props.width}}>
        {this.state.notice.map((item) => {
          const iconClass = (item.icon) ? `notice_has-icon notice_icon-${item.icon}` : '';
          return (
            <div
              className={`notice notice_type-${item.type} ${iconClass} ${(item.hide) ? 'notice_hide' : ''} ${item.className.length ? item.className : ''}`}
              key={item.id}
              style={{marginTop: '-20px'}}
              data-id={item.id}
              ref={(e) => {
                if (e) this.refsArray.push(e);
              }}
            >
              <span className="notice-text t3">{item.text}</span>
              <div className='notice__closeBlock'>
                <div
                  className='notice__closeBlock__closeArea'
                  onClick={this.onHideNotice.bind(null, item.id)}
                  onTouchEnd={this.onHideNotice.bind(null, item.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
