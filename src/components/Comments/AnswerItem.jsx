import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config.js';
import _ from 'lodash';
import Interpolate from 'react-interpolate-component';
import ReviewsData from 'plasma-reviews-api-client-js';
import Avatar from 'quark/lib/Avatar';
import N1C from 'quark/lib/notifications/N1C';
import FormattedDate from '../formattedDate';
import NotificationModeration from '../NotificationModeration/';
import AnswersForm from './AnswersForm';
import CommentsForm from './CommentsForm';
import './Comments.less';

const APPROVED = 'approved';
let comments = new ReviewsData(Config.reviewsServiceURL);

export default class AnswerItem extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    date: PropTypes.number,
    status: PropTypes.string,
    access_token: PropTypes.string,
    answers: PropTypes.arrayOf(PropTypes.object),
    id: PropTypes.number,
    templateId: PropTypes.number,
    userData: PropTypes.object,
    voteUp: PropTypes.number,
    voteDown: PropTypes.number,
    vote: PropTypes.string,
    noVote: PropTypes.bool,
    parentId: PropTypes.number,
    author: PropTypes.string,
    author_id: PropTypes.number,
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  state = {
    showFormAnswer: false,
    showForm: false,
    voteUp: this.props.voteUp,
    voteDown: this.props.voteDown,
    vote: this.props.vote,
    showModeratorMessage: false,
  };

  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name ? name : this.context.i18n.l('User')}
        size      = {40}
        src       = {avatar ? avatar : ''}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

  showModeratorMessage = () => {
    const { status } = this.props;
    if (status === 'pending') {
      return (
        <NotificationModeration
          status={status}
          message={this.context.i18n.l('The comment is visible only for you. Sorry, but we need to check it before publication. When we check it & reply to it, you\'ll get a notifications and an email :)')}
        />
      )
    }
  };

  replyButton = (answer) => {
    return (
      <span
        className="comments__item-reply tm-icon icon-message"
        onClick={() => (answer === 'answer' ? this.showFormAnswer(): this.showForm())}
      >
          {this.context.i18n.l('Reply')}
      </span>
    )
  };

  showFormAnswer = () => {
    this.setState({
      showFormAnswer: true,
    });
  };

  showForm = () => {
    this.setState({
      showForm: true,
      showFormAnswer: true,
    });
  };

  renderForm = () => {
    const { templateId, access_token, userData, parentId, userName, author_id } = this.props;
    return (
      <AnswersForm
        template_id={templateId}
        access_token={access_token}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={parentId}
        userAnswerName={userName}
        replyToAnswer
        author_id={author_id}
      />
    )
  };

  showComments = () => {
    this.setState({
      showFormAnswer: false,
    })
  };

  addVote = (type) => {
    const { access_token, id } = this.props;
    comments.addCommentVote(access_token, id, {vote_type: type}).then(
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
    const {noVote, access_token} = this.props;
    return (
      <div className={`review-votes__control`}>
          <span
            className={`review-votes__item review-votes__item-${type} ${vote === type ? `review-votes__item-${type}_active` : ""}`}
            onClick={() => {!noVote && access_token ? clickVote() : ""}}
          >
            {constrolText}
            {stateVote > 0 && <span className="review-votes__item-counter t5">{stateVote}</span>}
          </span>
        {noVote || !access_token
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
    const {access_token, noVote} = this.props;
    const {l} = this.context.i18n;
    let notificationText="";
    if (access_token) {
      notificationText = l("You can't estimate your own comment");
    } else {
      notificationText = l("Please log in at first");
    }
    return (
      <div className={`review-votes t3 ${noVote || !access_token ? "review-votes__no-vote" : ""}`}>
        {this.showControl("up", this.addVoteUp, l("Helpful"), notificationText, voteUp)}
        {this.showControl("down", this.addVoteDown, l("Useless"), notificationText, voteDown)}
      </div>
    )
  };

  render () {
    const { userMail, userName, userAvatar, content, date, access_token, status, author, id } = this.props;
    const { showForm, voteUp, showModeratorMessage } = this.state;
    return (
    <div className="answer" id={id}>
      <article
        className={`comments__item
          ${author === 'moderator' ? 'comments__item-moderator' : ''}
          ${author === 'contributor' ? 'comments__item-contributor' : ''}`}
        itemScope
        itemType="http://schema.org/Question"
      >
        <meta itemProp="upvoteCount" content = {voteUp} />
        <div className="comments__avatar">
          {this.showAvatar(userMail, userName, userAvatar)}
        </div>
        <div className="comments__info">
          <div className="comments__describe">
            <div className="comments__describe-header t5">
              <div className="comments__author" itemScope itemType="http://schema.org/Person" itemProp="author">
                <meta itemProp="name" content={userName} />
                {userName || this.context.i18n.l('User')}
                {author === 'moderator'
                  ? (<span className="comments__author-moderator t5" >TemplateMonster</span>)
                  : ''}
                {author === 'contributor'
                  ? (<span className="comments__author-contributor t5" >{this.context.i18n.l('Contributor')}</span>)
                  : ''}
              </div>
              <FormattedDate timestamp={date} className="comments__date"/>
            </div>
            <div className="comments__content t3" itemProp="text">{content}</div>
            {
              status === APPROVED &&
              <div className="comments__describe-footer t3">
                {access_token && this.replyButton()}
                <div className="comments__votes">
                  {this.voteControls()}
                </div>
              </div>
            }
          </div>
          {showModeratorMessage && this.showModeratorMessage()}
        </div>
      </article>
      {showForm && this.renderForm()}
    </div>
    )
  }
}
