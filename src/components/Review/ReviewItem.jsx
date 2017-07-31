import React       from 'react';
import PropTypes   from 'prop-types';
import StarsRating from 'quark/lib/StarsRating';
import Avatar      from 'quark/lib/Avatar';
import TA3         from 'quark/lib/textareas/TA3';
import B1A         from 'quark/lib/buttons/B1A';
import N1C         from 'quark/lib/notifications/N1C';
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
    status        : PropTypes.string,
    moderable     : PropTypes.bool,
    voteUp        : PropTypes.number,
    voteDown      : PropTypes.number,
    vote          : PropTypes.string,
    noVote        : PropTypes.bool
  };

  state = {
    showContentModerator: false,
    comments: [],
    showModeratorClass: false,
    voteUp: this.props.voteUp,
    voteDown: this.props.voteDown,
    vote: this.props.vote,
  };

  componentWillMount() {
    this.setState({
      comments: this.props.comments,
    });
  }

  componentDidMount () {
    window.addEventListener('keydown', this.sendComment);
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.sendComment);
  }

  sendComment = (event) => {
    if (event.keyCode === 13 && event.ctrlKey && this.state.showContentModerator) {
      this.sendReplyReview(event);
    }
  };

  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name ? name : ''}
        size      = {40}
        src       = {avatar ? avatar : ''}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

  showForm = () => {
    this.setState({
      showContentModerator: true
    });
    //Added class to comments form for auto height field
    setTimeout(() => {
      this.setState({
        showModeratorClass: true
      })
    }, 600);
  };

  formModerator = () => {
    return (
      <div className={`review__item-moderator review__item-moderator_form review__item-moderator${this.state.showContentModerator ? '_show' : ''}
       review__item-moderator${this.state.showModeratorClass ? '_show-auto' : ''} t5`}>
        {this.showAvatar(this.props.moderatorMail, this.props.moderatorName, this.props.moderatorAva)}
        {this.state.showContentModerator ?
          (
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
          )
          : ''}
      </div>
    )
  };

  sendReplyReview = (event) => {
    event.preventDefault();
    const textReview = document.getElementById('reviewReplyModerator').value;
    const reviewText = {
      content   : textReview,
      user_name : this.props.moderatorName
    };
    reviews.replayTheReview(this.props.accessToken, this.props.reviewId, reviewText).then(
      (data) => {
          this.setState({
            comments: [ ...this.state.comments, data.items],
            showContentModerator: false,
          });
      }
    );
  };

  showComments = () => {
    if (_.isEmpty(this.state.comments)) {
      return;
    }
    return (
      this.state.comments.map((comment) => {
        return (
          <div
            className={`review__item review__item-moderator t5 ${comment.author === 'moderator' ? 'review__item-moderator-orange' : ''}`}
            key={comment.id}>
            {this.showAvatar('', comment.user_name || comment.author, '')}
            <div className="review__info review__info-textarea">
              <div className="review__author">
                <span className="review__author-name">{comment.user_name || comment.author}</span>
                {comment.author === 'moderator' ? (<span className="review__author-label t5" >TemplateMonster</span>) : ''}
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

  replyButton = () => {
    return (
      <span className="review__item-reply tm-icon icon-message" onClick={() => this.showForm()}>{this.context.i18n.l('Reply')}</span>
    )
  };

  addVote = (type) => {
    reviews.addReviewVote(this.props.accessToken, this.props.reviewId, {vote_type: type}).then(
      (data) => {
        this.setState({
          voteUp: data.items.vote_up,
          voteDown: data.items.vote_down
        });
      }
    );
  };

  addVoteUp = () => {
    this.addVote("up");
    switch (this.state.vote) {
      case "up":
        this.setState({
          vote: ""
        });
        break;
      default:
        this.setState({
          vote: "up"
        });
        break;
    }
  };

  addVoteDown = () => {
    this.addVote("down");
    switch (this.state.vote) {
      case "down":
        this.setState({
          vote: ""
        });
        break;
      default:
        this.setState({
          vote: "down"
        });
        break;
    }
  };

  showControl = (type, clickVote, constrolText, controlNotification, stateVote) => {
    const {vote} = this.state;
    const {noVote, accessToken} = this.props;
    return (
      <div className={`review-votes__control`}>
          <span
            className={`review-votes__item review-votes__item-${type} ${vote === type ? `review-votes__item-${type}_active` : ""}`}
            onClick={() => {!noVote && accessToken ? clickVote() : ""}}
          >
            {constrolText}
            {stateVote > 0 && <span className="review-votes__item-counter t5">{stateVote}</span>}
          </span>
      {noVote || !accessToken
        ? <N1C
            className="review-votes__notification"
            text={controlNotification}
          />
        : ''}
      </div>
    )
  };

  voteControls = () => {
    const {voteUp, voteDown} = this.state;
    const {accessToken, noVote} = this.props;
    const {l} = this.context.i18n;
    let notificationText ="";
    if (accessToken) {
      notificationText = l("You can't estimate your own review");
    } else {
      notificationText = l("Please log in at first");
    }
    return (
      <div className={`review-votes t3 ${noVote || !accessToken ? "review-votes__no-vote" : ""}`}>
        {this.showControl("up", this.addVoteUp, l("Helpful"), notificationText, voteUp)}
        {this.showControl("down", this.addVoteDown, l("Useless"), notificationText, voteDown)}
      </div>
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

    // if (average < units.MINUTE * 2) {
    //   date = this.context.i18n.l('Now');
    // } else if (average < units.HOUR) {
    //   date = `${min} ${this.context.i18n.l('minutes ago')}`;
    // } else if (average < units.HOUR * 2) {
    //   date = `${hour} ${this.context.i18n.l('hour ago')}`;
    // } else if (average < units.HOUR * 10) {
    //   date = `${hour} ${this.context.i18n.l('hours ago')}`;
    // }  else if ((average < units.DAY * 1) && (timeNowUTC.toDateString() === time.toDateString())) {
    //   date = `${this.context.i18n.l('Today at')} ${hour}:${min}`;
    // }  else if ((average < units.DAY * 2) && (timeNowUTC.toDateString() !== time.toDateString())) {
    //   date = `${this.context.i18n.l('Yesterday at')} ${hour}:${min}`;
    // } else {
    //   date = `${month} ${day}, ${year} ${this.context.i18n.l('at')} ${hour}:${min}`;
    // }

    if ((average < units.DAY * 1) && (timeNowUTC.toDateString() === time.toDateString())) {
      date = `${this.context.i18n.l('Today')}`;
    }  else if ((average < units.DAY * 2) && (timeNowUTC.toDateString() !== time.toDateString())) {
      date = `${this.context.i18n.l('Yesterday')}`;
    } else {
      date = `${month} ${day}, ${year}`;
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
          <div className="review-replies">
            {this.props.moderable && this.replyButton()}
          </div>
          {this.voteControls()}
        </div>
        <div className="review__item-comments">
          {this.showComments()}
          {this.formModerator()}
        </div>
      </div>
    )
  }
}
