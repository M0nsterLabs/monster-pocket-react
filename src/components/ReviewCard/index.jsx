import React                        from 'react';
import ReactDOM                     from 'react-dom';
// import {connect}                    from 'react-redux';
import StarsRating                  from 'quark/lib/StarsRating';
import TA5                          from 'quark/lib/textareas/TA5';
import B3J                          from 'quark/lib/buttons/B3E';
import B2J                          from 'quark/lib/buttons/B2E';
import {connectNotificationTrigger} from 'quark/lib/utils';
// import {putAddReview}               from 'actions/profileActions';

import './ReviewCard.less';

export default class ReviewCard extends React.Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };

  static propTypes = {
    imageUrl           : React.PropTypes.string,
    templateUrl        : React.PropTypes.string,
    typeUrl            : React.PropTypes.string,
    iconType           : React.PropTypes.string,
    templateType       : React.PropTypes.string,
    templateName       : React.PropTypes.string,
    templatePrice      : React.PropTypes.string,
    templateLicense    : React.PropTypes.string,
    rating             : React.PropTypes.number,
    status             : React.PropTypes.string,
    textReview         : React.PropTypes.string,
    token              : React.PropTypes.string,
    reviewId           : React.PropTypes.number,
    onClickOutside     : React.PropTypes.func,
    hideOnClickOutside : React.PropTypes.bool,
    show               : React.PropTypes.bool,
    userMail           : React.PropTypes.string,
    userName           : React.PropTypes.string
  };

  static defaultProps = {
    imageUrl        : '',
    templateUrl     : '',
    typeUrl         : '',
    templateType    : '',
    templateName    : '',
    templatePrice   : '',
    templateLicense : '',
    rating          : 0,
    status          : '',
    textReview      : '',
    show            : false
  };

  state = {
    key                : 0,
    clickStars         : 0,
    hideOnClickOutside : true,
    state              : false,
    showContent        : false,
    stars              : 0,
    initial            : 'initial',
    pending            : 'pending',
    declined           : 'declined',
    approved           : 'approved',
    success            : false,
    promocode          : 15,
    countReview        : this.props.textReview
  };

  constructor (props) {
    super(props);
    this.closePopupOnEsc = this.closePopupOnEsc.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  renderNotification (status) {
    if (status === this.state.pending) {
      return (<div className="template-review__message review-message review-message_progress">
        <i className="review-message__icon icon icon-in-progress icon-in-progress_white"/>
        <p className="review-message__text t3">{this.context.i18n.l('The review is visible only for you. Sorry, but we need to check your review before publication. In case your review corresponds to our rules, it will be published soon :)')}
        </p>
        <div className="review-message__triangle review-message__triangle_progress"></div>
      </div>);
    } else if (status === this.state.declined) {
      return (<div className="template-review__message review-message review-message_declined">
        <i className="review-message__icon icon icon-pen"/>
        <p className="review-message__text t3">{this.context.i18n.l('Unfortunately, we can’t post your review because it doesn’t meet our guidelines, please try again with another review.')}
        </p>
        <div className="review-message__triangle review-message__triangle_declined"></div>
      </div>);
    } else {
      return '';
    }
  }

  showTooltip = (val) => {
    this.state.clickStars = val;
    this.setState({
      showContent : false,
      stars       : val
    }, () => {
      let promise = new Promise((resolve) => {
        resolve(this.trigger.showNotification());
      });
      promise.then(() => {
        document.querySelector('.stars-rating-wrapper > div > .notification--large').classList.add('notification__review-center');
        document.querySelector('.notification__review-center').classList.add(`notification__review-center_${val}`);
        if (this.props.status === this.state.pending || this.props.status === this.state.approved) {
          document.querySelector('.notification__review-center').classList.add(`notification__review-center_pos-center`);
        }
        this.trigger.targetNode.addEventListener('animationend', () => {
          this.state.showContent = true;
        });
      });
    });
  };

  hideTooltip = () => {
    let notification = document.querySelector('.stars-rating-wrapper .notification');
    notification.classList.remove('notification_invalid');
    this.trigger.hideNotification(this, true);
    this.trigger.targetNode.addEventListener('animationend', () => {
      this.setState({
        key         : this.state.key++,
        stars       : 0,
        showContent : false
      });
    });
  };

  textValidationRule (value) {
    const valueRegExp = /^[^<>]+$/;
    const teatAreaValue   = value.trim();
    const valueCount = value.length;
    const isValid = valueRegExp.test(teatAreaValue);
    if (isValid) {
      if (valueCount < 60) {
        return {
          isValid : false,
          message : this.context.i18n.l('Review must contain at least 60 symbols')
        };
      } else {
        if (valueCount > 400) {
          this.state.promocode = 25;
        }
        return {
          isValid : true,
          message : null
        };
      }
    } else {
      return {
        isValid : false,
        message : this.context.i18n.l('Please remove special symbols')
      };
    }
  }

  handleFormSubmit (event) {
    event.preventDefault();
    let textArea = document.getElementById('review-text');
    let reviewText = textArea.value;
    let notification = document.querySelector('.stars-rating-wrapper .notification');
    notification.classList.remove('notification_invalid');
    if (this.textValidationRule(reviewText).isValid) {
      this.state.success = true;
      const reviewsData = {
        title          : this.props.templateName,
        score          : this.state.clickStars,
        content        : textArea.value,
        template_title : this.props.templateName,
        template_image : this.props.imageUrl,
        template_url   : this.props.templateUrl,
        user_name      : this.props.userName
      };
      notification.classList.add('notification_result');
      let promise = new Promise((resolve) => {
        resolve(this.props.putAddReview(this.props.token, this.props.reviewId, reviewsData));
      });
      promise.then(() => {
        setTimeout(() => {
          this.showTooltip(reviewsData.score);
        }, 2000);
      });
    } else {
      this.state.success = false;
      setTimeout(function () {
        notification.classList.add('notification_invalid');
      }, 1);
      this.textarea.input.handleValidation({
        status  : false,
        message : this.textValidationRule(reviewText).message
      });
    }
  }

  closePopupOnEsc = (event) => {
    if (event.keyCode === 27 && this.state.showContent) {
      this.hideTooltip();
    }
  };

  componentDidMount () {
    window.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('keydown', this.closePopupOnEsc);
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('keydown', this.closePopupOnEsc);
  }

  handleDocumentClick = (event) => {
    const area = ReactDOM.findDOMNode(this.trigger);
    if (this.trigger && this.state.showContent && event.target !== this.trigger && !area.contains(event.target)) {
      this.hideTooltip();
    }
  };

  renderPopover (success, count) {
    return (
      <div className={`notification-review ${success ? 'notification_result' : ''}`}>
        <div className="notification-review__info">
          <p className="notification-review__text t2">{`${this.context.i18n.l('Please, write at least 60 symbols for review')}`}</p>
          <form
            className="notification-review__form"
            id="review-form"
            onSubmit={(event) => {
              this.handleFormSubmit(event);
            }}
          >
            <TA5
              className="notification-review__textarea spacing-outer-bottom-20"
              id="review-text"
              label="Your opinion about this product"
              increaseValue={true}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2A"
            />
            <B3J
              className="notification-review__button notification-review__button_first"
              onClick={() => this.hideTooltip()}
            >
              Cancel
            </B3J>
            <B2J
              className="notification-review__button"
              type="submit"
            >
              Post
            </B2J>
            <input id="reviewTitle" name="title" type="hidden" value={this.props.templateName}/>
            <input id="countStars" name="score" type="hidden" value={this.state.clickStars}/>
            <input id="tmplTitle" name="template_title" type="hidden" value={this.props.templateName}/>
            <input id="tmplImg" name="template_image" type="hidden" value={this.props.imageUrl}/>
            <input id="tmplUrl" name="template_url" type="hidden" value={this.props.templateUrl}/>
          </form>
        </div>
        <div className="notification-review__promocode">
          <p className="notification-review__info-name t1">{`${this.context.i18n.l('Thank you for your review!')}`}</p>
          <p className="notification-review__info-text t3">
            {`${this.context.i18n.l("We've generated your one-time promo-code and within 10 minutes it will reach your email:")}`}</p>
          <p className="notification-review__info-mail t3">{this.props.userMail}</p>
          <p className="notification-review__info-quantity h0">-{this.state.promocode}%</p>
          <p className="notification-review__info-text t3">{`${this.context.i18n.l('on all our themes')}`}</p>
        </div>
      </div>
    );
  }

  renderStars = (status, success, count) => {
    const StartNotification = connectNotificationTrigger(StarsRating);
    if (this.props.status === this.state.initial || this.props.status === this.state.declined) {
      return (<StartNotification
        defaultRating={this.state.stars}
        onChange={this.showTooltip}
        key={this.state.key}
        notification={{
          text: (
            this.renderPopover(success)
          ),
          code: 'N1F'
        }}
        trigger={this.trigger}
        ref={c => {
          this.trigger = c;
        }}
        notificationAlt={{status: false}}
      />);
    } else if (status === this.state.pending || status === this.state.approved) {
      return (<StartNotification
        defaultRating={this.props.rating}
        onChange={this.showTooltip}
        key={this.state.key}
        disabled={true}
        noHovered={true}
        notification={{
          text: (
            this.renderPopover(true)
          ),
          code: 'N1F'
        }}
        trigger={this.trigger}
        ref={c => {
          this.trigger = c;
        }}
        notificationAlt={{status: false}}
      />);
    }
  };

  render () {
    return (
      <div className={`template-reviews ${this.props.status === this.state.initial ? 'template-reviews_no-reviews' : ''}
      ${this.props.status === this.state.declined ? 'template-reviews_no-reviews template-reviews_no-reviews-declined' : ''}`}>
        <a
          className="template-reviews__img"
          href={this.props.templateUrl}
        >
          <img
            className="template-reviews__thumb"
            src={this.props.imageUrl}
            alt="template screenshot"
          />
        </a>
        <div className="template-reviews__info">
          <div className="template-reviews__desc">
            <a
              className="template-reviews__type"
              href={this.props.typeUrl}
            >
              <i className={`template-reviews__icon icon icon-type-${this.props.iconType}`}/>
              <span className="template-reviews__title t3">
                {this.props.templateType}
              </span>
            </a>
            <br/>
            <a
              className="template-reviews__name t1"
              href={this.props.templateUrl}
            >
              {this.props.templateName}
            </a>
            <div className="template-reviews__license">
              <span className="template-reviews__license-price">
                {this.props.templatePrice}
              </span>
              <span className="template-reviews__license-name t5">
                {this.props.templateLicense}
              </span>
            </div>
          </div>
          <div className = "template-reviews__rating template__rating  template-rating t1">
            <span className="template-reviews__rating-name">
              {`${this.props.status === this.state.initial || this.props.status === this.state.declined ? this.context.i18n.l('Please rate:') : this.context.i18n.l('Your rate:')}`}
            </span>
            {this.renderStars(this.props.status, this.state.success, this.state.countReview)}
          </div>
          <div className="template-reviews__review template-review">
            <h6 className="template-reviews__title t1">Your review:</h6>
            <div className={`template-reviews__text t3 ${this.props.status === this.state.approved ? 'template-reviews__text_approved' : ''}`}>
              {this.props.textReview}
            </div>
            {this.renderNotification(this.props.status)}
          </div>
        </div>
      </div>
    );
  }
}

// function mapStateToProps (state) {
//   return {
//     reviews: state.profileData.reviews
//   };
// }
//
// function mapDispatchToProps (dispatch) {
//   return {
//     putAddReview: (token, id, params) => { dispatch(putAddReview(token, id, params)); }
//   };
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(ReviewCard);
