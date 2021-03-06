import React                        from 'react';
import PropTypes                    from 'prop-types';
import StarsRating                  from 'quark/lib/StarsRating';
import {connectNotificationTrigger} from 'quark/lib/utils';
import TA5                          from 'quark/lib/textareas/TA5';
import B3J                          from 'quark/lib/buttons/B3E';
import B2J                          from 'quark/lib/buttons/B2E';
import ReviewsData                  from 'plasma-reviews-api-client-js';
import Config                       from 'config.js';

import {
  getCurrentLocale
} from 'utils/';

const reviews = new ReviewsData(Config.reviewsServiceURL, getCurrentLocale());
const STATUS_PENDING = 'pending';
const STATUS_APPROVED = 'approved';

export default class ReviewEditor extends React.Component {
  static contextTypes = {
    i18n: PropTypes.object
  };
  state = {
    stars        : 0,
    showContent  : false,
    promocode    : 15
  };

  constructor (props) {
    super(props);

    this.closePopupOnEsc = this.closePopupOnEsc.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }


  componentDidMount () {
    window.addEventListener('click', this.handleDocumentClick);
    window.addEventListener('keydown', this.closePopupOnEsc);
  };

  componentWillUnmount () {
    window.removeEventListener('click', this.handleDocumentClick);
    window.removeEventListener('keydown', this.closePopupOnEsc);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextState.stars !== this.state.stars;
  }

  handleDocumentClick = (event) => {
    const area = ReactDOM.findDOMNode(this.trigger);
    if (this.trigger && this.state.showContent && event.target !== this.trigger && !area.contains(event.target)) {
      this.hideTooltip();
    }
  };

  closePopupOnEsc = (event) => {
    if (event.keyCode === 27 && this.state.showContent) {
      this.hideTooltip();
    }
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
          this.setState({
            promocode: 25
          });
          document.querySelector('.quark-notification-review__info-quantity').textContent = '-25%';
        }
        return {
          isValid : true,
          message : null
        };
      }
    } else {
      if (valueCount < 60) {
        return {
          isValid : false,
          message : this.context.i18n.l('Review must contain at least 60 symbols')
        };
      } else {
        return {
          isValid : false,
          message : this.context.i18n.l('Please remove special symbols')
        };
      }
    }
  }


  handleFormSubmit (event) {
    event.preventDefault();
    let textArea = document.getElementById('review-text');
    let reviewText = textArea.value;
    let notification = document.querySelector('.stars-rating-wrapper .quark-notification');
    notification.classList.remove('quark-notification_invalid');
    if (this.textValidationRule(reviewText).isValid) {
      const reviewsData = {
        title          : this.props.templateName,
        score          : this.state.stars,
        content        : reviewText,
        template_title : this.props.templateName,
        template_image : this.props.imageUrl,
        template_url   : this.props.templateUrl,
        author_id      : this.props.authorId || 0
      };

      notification.classList.add('quark-notification_result');
      let promise = new Promise((resolve) => {
        resolve(this.putAddReview(this.props.accessToken, this.props.userReview.id, reviewsData));
      });
      promise.then(() => {
        this.showTooltip(reviewsData.score);
      });
    } else {
      setTimeout(function () {
        notification.classList.add('quark-notification_invalid');
      }, 1);
      this.textarea.input.handleValidation({
        status  : false,
        message : this.textValidationRule(reviewText).message
      });
    }
  }


  renderPopover (success) {
    return (
      <div className={`quark-notification-review ${success ? 'quark-notification_result' : ''}`}>
        <div className="quark-notification-review__info">
          <p className="quark-notification-review__text t2">{`${this.context.i18n.l('Please, write at least 60 symbols for review')}`}</p>
          <form
            className="quark-notification-review__form"
            id="review-form"
            onSubmit={(event) => {
              this.handleFormSubmit(event);
            }}
          >
            <TA5
              className="quark-notification-review__textarea spacing-outer-bottom-20"
              id="review-text"
              label={this.context.i18n.l("Your opinion about this product")}
              increaseValue={true}
              ref={c => this.textarea = c}
              name="content"
              notificationType="N2B"
            />
            <B3J
              className="quark-notification-review__button quark-notification-review__button_first"
              onClick={() => this.hideTooltip()}
            >
              {this.context.i18n.l("Cancel")}
            </B3J>
            <B2J
              className="quark-notification-review__button"
              type="submit"
            >
              {this.context.i18n.l("Post")}
            </B2J>
          </form>
        </div>
        <div className="quark-notification-review__promocode">
          <p className="quark-notification-review__info-name t1">{`${this.context.i18n.l('Thank you for your review!')}`}</p>
          <p className="quark-notification-review__info-text t3">
            {`${this.context.i18n.l("We've generated your one-time promo-code and within 10 minutes it will reach your email:")}`}</p>
          <p className="quark-notification-review__info-mail t3">{this.props.userMail}</p>
          <p className="quark-notification-review__info-quantity h0">-{this.state.promocode}%</p>
          <p className="quark-notification-review__info-text t3">{`${this.context.i18n.l('on all our themes')}`}</p>
        </div>
      </div>
    );
  }


  renderStars = () => {
    const StartNotification = connectNotificationTrigger(StarsRating);

    return (
      <StartNotification
        defaultRating={this.props.statusReview === STATUS_PENDING ? this.props.scoreReview : this.state.stars}
        disabled={this.props.statusReview === STATUS_PENDING}
        noHovered={this.props.statusReview === STATUS_PENDING}
        onChange={this.showTooltip}
        notification={{
          text: (
            this.renderPopover(this.props.statusReview === STATUS_PENDING)
          ),
          button      : {},
          code: 'N1F'
        }}
        trigger={this.trigger}
        ref={c => {
          this.trigger = c;
        }}
        notificationAlt={{status: false}}
      />
    )
  };

  hideTooltip = () => {
    let notification = document.querySelector('.stars-rating-wrapper .quark-notification');
    notification.classList.remove('quark-notification_invalid');
    this.trigger.hideNotification(this, true);
    this.trigger.targetNode.addEventListener('animationend', () => {
      this.setState({
        stars       : 0,
        showContent : false
      });
    });
  };


  showTooltip = (val) => {
    this.setState({
      showContent : false,
      stars       : val
    }, () => {
      let promise = new Promise((resolve) => {
        resolve(this.trigger.showNotification());
      });
      promise.then(() => {
        document.querySelector('.stars-rating-wrapper > div > .quark-notification--large').classList.add('quark-notification__review-center');
        document.querySelector('.stars-rating-wrapper > div > .quark-notification--large').classList.add('animated-tooltip_open_bottom');
        document.querySelector('.quark-notification__review-center').classList.add(`quark-notification__review-center_${this.state.stars}`);
        if (this.props.statusReview === STATUS_PENDING || this.props.statusReview === STATUS_APPROVED) {
          document.querySelector('.quark-notification__review-center').classList.add(`quark-notification__review-center_pos-center`);
        }
        this.trigger.targetNode.addEventListener('animationend', () => {
          this.setState({
            showContent: true
          })
        });
      });
    });
  };

  putAddReview = (token, id, params) => {
    reviews.completeReview(token, id, params).then((data) => {
      let {items} = data;
      items.score = parseInt(items.score);
      this.props.updateUserReview(items);
      this.setState({
        showContent: true
      })
    });
  };

  render () {
    return (
      <div className="template-reviews__rating template__rating  template-rating t1">
        <span className="template-reviews__rating-name">
        {this.context.i18n.l('Please rate the product:')}
        </span>
        {this.renderStars()}
      </div>
    )
  }
}

ReviewEditor.propTypes = {
  userMail     : PropTypes.string,
  statusReview : PropTypes.string,
  scoreReview  : PropTypes.number
};
