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
import AnswerItem from "./AnswerItem";

const APPROVED = 'approved';
let comments = new ReviewsData(Config.reviewsServiceURL);

export default class CommentItem extends React.Component {
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
    noVote: PropTypes.bool
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
    showAnswers: false,
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
    const { templateId, access_token, userData, id } = this.props;
    return (
      <AnswersForm
        template_id={templateId}
        access_token={access_token}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={id}
      />
    )
  };

  showComments = () => {
    this.setState({
      showAnswers: !this.state.showAnswers,
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

  showAnswers = () => {
    const { answers, access_token, templateId, userData, id } = this.props;
    if (_.isEmpty(answers)) return;
    return (
      answers.map((answer) => {
        return (
          <div className="comments__answers">
            <AnswerItem
              userName={answer.user_name}
              userMail={answer.user_email}
              content={answer.content}
              avatar=""
              date={answer.created_at}
              // key={comment.id}
              status={answer.status}
              access_token={access_token}
              id={answer.id}
              templateId={templateId}
              userData={userData}
              voteUp={answer.vote_up}
              voteDown={answer.vote_down}
              vote={access_token && answer.vote ? answer.vote.type : ''}
              parentId={id}
            />
          </div>
        );
      })
    );
  };

  render () {
    const { userMail, userName, userAvatar, content, date, access_token, answers, status } = this.props;
    const { showForm, voteUp, showAnswers } = this.state;
    let textViewButton;
    if (!_.isEmpty(answers)) {
      if (!showAnswers && answers.length === 1) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answer');
      } else if (!showAnswers && answers.length > 1 ) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answers');
      } else if (answers.length === 1) {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answer');
      } else {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answers');
      }
    }

    return (
      <article className="comments__item" itemScope itemType="http://schema.org/Question">
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
              </div>
              <FormattedDate timestamp={date} className="comments__date"/>
            </div>
            <div className="comments__content t3" itemProp="text">{content}</div>
            {
              status === APPROVED &&
              <div className="comments__describe-footer t3">
                {access_token && this.replyButton()}
                { !_.isEmpty(answers)
                && <div className="comments__viewAnswer" onClick={() => this.showComments()}>
                  <meta itemProp="answerCount" content={answers.length} />
                  <Interpolate
                    with={{countAnswers: answers.length}}
                    format={textViewButton}
                  />
                </div>
                }
                <div className="comments__votes">
                  {this.voteControls()}
                </div>
              </div>
            }
          </div>
          {this.showModeratorMessage()}
          {showForm && this.renderForm()}
          {showAnswers && this.showAnswers()}
        </div>
      </article>
    );
  }
}
