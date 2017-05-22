import React       from 'react';
import PropTypes   from 'prop-types';
import {stringify} from 'qs';
import StarsRating from 'quark/lib/StarsRating';
import Avatar      from 'quark/lib/Avatar';
import TA3         from 'quark/lib/textareas/TA3';
import B1A         from 'quark/lib/buttons/B1A';
import Config      from 'config.js';
import ReviewsData from 'plasma-reviews-api-client-js';

import {getCurrentLocale} from 'utils/';

const LOCALE = getCurrentLocale();
let reviews = new ReviewsData(Config.reviewsServiceURL, LOCALE);

export default class ReviewItem extends React.Component {
  static contextTypes = {
    i18n: PropTypes.object
  };

  static propTypes = {
    reviewId      : PropTypes.number.isRequired,
    userName      : PropTypes.string,
    userMail      : PropTypes.string,
    reviewScore   : PropTypes.number,
    reviewContent : PropTypes.string,
    reviewDate    : PropTypes.number,
    reviewFlag    : PropTypes.string,
    userAvatar    : PropTypes.string,
    accessToken   : PropTypes.string,
    comments      : PropTypes.array,
    moderatorName : PropTypes.string,
    moderatorAva  : PropTypes.string,
    moderatorMail : PropTypes.string,
    status        : PropTypes.string
  };

  state = {
    showContentModerator: false
  };

  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name}
        size      = {40}
        src       = {avatar}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

  showForm = () => {
    this.setState({
      showContentModerator: true
    })
  };

  formModerator = () => {
    return (
      <div className="review__item-moderator t5">
        {this.showAvatar(this.props.moderatorMail, this.props.moderatorName, this.props.moderatorAva)}
        <form
          className="review__info-form"
          onSubmit={(event) => {
            this.sendReplyReview(event);
          }}
        >
          <TA3
            className           = "review__info-textarea"
            id                  = "reviewReplyModerator"
            label               = {this.context.i18n.l('Type your answer here')}
            notificationType    = "N2A"
            closeOnCLickOutside
            ref                 = {(ref) => { this.replyModerator = ref; }}
            autofocus
          />
          <B1A
            icon      = "message tm-icon"
            className = "review__info-button"
            type      = "submit"
          >
            {this.context.i18n.l('Send Message')}
          </B1A>
          <span className="review__info-text t6">
            {this.context.i18n.l('Press Ctrl + Enter to send your message')}
          </span>
        </form>
      </div>
    )
  };

  sendReplyReview = (event) => {
    event.preventDefault();
    const textReview = document.getElementById('reviewReplyModerator').value;
    const reviewText = {
      content: textReview
    };
    console.log('this.props.accessToken', this.props.accessToken);
    console.log('this.props.reviewId', this.props.reviewId);
    console.log('reviewText', reviewText);
    //reviews.replayTheReview(this.props.accessToken, this.props.reviewId, reviewText).then(
    //  (data) => {
    //    console.log('success');
    //    console.log('data', data);
    //  }
    //);

     fetch(`${Config.reviewsServiceURL}reviews/${this.props.reviewId}/comments`, {
       method: 'post',
       headers : {
         'Content-Type'  : 'application/x-www-form-urlencoded',
         'Authorization' : this.props.accessToken,
         'Access-Control-Allow-Origin' : Config.monsterURL
       },
       body: stringify(reviewText)
     }).then((data) => {
       console.log('data', data);
     });
  };

  showComments = () => {
    if (_.isEmpty(this.props.comments)) {
      return;
    }
    return (
      this.props.comments.map((comment) => {
        return (
          <div className="review__item review__item-moderator t5" key={comment.id}>
            {this.showAvatar('', comment.author, '')}
            <div className="review__info review__info-textarea">
              <div className="review__author">
                <span className="review__author-name">{comment.author}</span>
                <span className="review__date t5">{this.formattedDate(comment.created_at)}</span>
              </div>
              <div className="review__content t3">
                {comment.content}
              </div>
            </div>
          </div>
        )
      })
    )
  };

  formattedDate = (timestamp) => {
    const time = new Date(timestamp * 1000);
    const months = [
      this.context.i18n.l('Jan'),
      this.context.i18n.l('Feb'),
      this.context.i18n.l('Mar'),
      this.context.i18n.l('Apr'),
      this.context.i18n.l('May'),
      this.context.i18n.l('Jun'),
      this.context.i18n.l('Jul'),
      this.context.i18n.l('Aug'),
      this.context.i18n.l('Sep'),
      this.context.i18n.l('Oct'),
      this.context.i18n.l('Nov'),
      this.context.i18n.l('Dec')
    ];
    const year = time.getFullYear();
    const month = months[time.getMonth()];
    const day  = time.getDate();
    let hour = time.getHours();
    let min = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
    const timeNowUTC = new Date();
    const timeNow = new Date().getTime() / 1000;
    const average =  timeNow - timestamp;

    const units = {
      MINUTE : 60,
      HOUR   : 60 * 60,
      DAY    : 60 * 60 * 24
    };

    if (average < units.HOUR * 10) {
      time.setHours(0);
      time.setMinutes(average / units.MINUTE);
      hour = time.getHours();
      min = time.getMinutes();
    }

    let date = '';

    if (average < units.MINUTE * 2) {
      date = this.context.i18n.l('Now');
    } else if (average < units.HOUR) {
      date = `${min} ${this.context.i18n.l('minutes ago')}`;
    } else if (average < units.HOUR * 2) {
      date = `${hour} ${this.context.i18n.l('hour ago')}`;
    } else if (average < units.HOUR * 10) {
      date = `${hour} ${this.context.i18n.l('hours ago')}`;
    }  else if ((average < units.DAY * 1) && (timeNowUTC.toDateString() === time.toDateString())) {
      date = `${this.context.i18n.l('Today at')} ${hour}:${min}`;
    }  else if ((average < units.DAY * 2) && (timeNowUTC.toDateString() !== time.toDateString())) {
      date = `${this.context.i18n.l('Yesterday at')} ${hour}:${min}`;
    } else {
      date = `${month} ${day}, ${year} ${this.context.i18n.l('at')} ${hour}:${min}`;
    }

    return date;
  };

  render() {
    return (
      <div className="review__item t3" itemProp="review" itemScope itemType="http://schema.org/Review">
        <div className="review__info">
          <div className="review__author">
            {this.showAvatar(this.props.userMail, this.props.userName, this.props.userAvatar)}
            <span className="review__author-name" itemProp="author">{this.props.userName}</span>
          </div>
          <span className="review__score rating-stars-block" itemProp="reviewRating" itemScope itemType="http://schema.org/Rating">
            <meta itemProp="worstRating" content = "1" />
            <meta itemProp="bestRating" content = "5" />
            <meta itemProp="ratingValue" content = {this.props.reviewScore} />
            <StarsRating
              defaultRating={this.props.reviewScore}
              disabled={true}
            />
            <span className={`review__flag iti-flag ${this.props.reviewFlag}`}> </span>
          </span>
          <span  className="review__date" itemProp="datePublished" content={this.formattedDate(this.props.reviewDate)}>
            {this.formattedDate(this.props.reviewDate)}
          </span>
        </div>
         <div className={`review__item-content t3 review__item-content_${this.props.status}`} itemProp="description">
          {this.props.reviewContent}
        </div>
        <div className="review__item-controls">
          <span className="review__item-reply tm-icon icon-message" onClick={() => this.showForm()}>{this.context.i18n.l('Reply')}</span>
        </div>
        <div className="review__item-comments">
          {this.showComments()}
          {this.state.showContentModerator && this.formModerator()}
        </div>
      </div>
    )
  }
}
