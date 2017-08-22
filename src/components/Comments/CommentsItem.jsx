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

export default class CommentsItem extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    date: PropTypes.number,
    status: PropTypes.string,
    access_token: PropTypes.string,
    answers: PropTypes.arrayOf(PropTypes.object),
    parentId: PropTypes.number,
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
    showComments: false,
    showFormAnswer: false,
    showForm: false,
    voteUp: this.props.voteUp,
    voteDown: this.props.voteDown,
    vote: this.props.vote,
    answersVote: this.props.answers,
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
    const { templateId, access_token, userData, parentId } = this.props;
    return (
      <AnswersForm
        template_id={templateId}
        access_token={access_token}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={parentId}
      />
    )
  };

  showComments = () => {
    this.setState({
      showComments: !this.state.showComments,
      showFormAnswer: false,
    })
  };

  showCommentItem = (params) => {
    const { access_token, answers, parentId, status } = this.props;
    const { showComments, showForm, showFormAnswer, voteUp, voteDown, vote, answersVote } = this.state;
    let textViewButton;
    if (!_.isEmpty(answers)) {
      if (!showComments && answers.length === 1) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answer');
      } else if (!showComments && answers.length > 1 ) {
        textViewButton = this.context.i18n.l('View %(countAnswers)s answers');
      } else if (answers.length === 1) {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answer');
      } else {
        textViewButton = this.context.i18n.l('Hide %(countAnswers)s answers');
      }
    }

    return (
      <article className="comments__item" itemScope itemType="http://schema.org/Question">
        <meta itemProp="upvoteCount" content = {params.voteUp} />
        <div className="comments__avatar">
          {this.showAvatar(params.email, params.name, params.avatar)}
        </div>
        <div className="comments__info">
          <div className="comments__describe">
            <div className="comments__describe-header t5">
              <div className="comments__author" itemScope itemType="http://schema.org/Person" itemProp="author">
                <meta itemProp="name" content={params.name} />
                {params.name || this.context.i18n.l('User')}
              </div>
              <FormattedDate timestamp={params.date} className="comments__date"/>
            </div>
            <div className="comments__content t3" itemProp="text">{params.content}</div>
            {
              status === APPROVED &&
                <div className="comments__describe-footer t3">
                  {access_token &&
                  (params.mainComment
                      ? this.replyButton()
                      : this.replyButton('answer')
                  )
                  }
                  {params.showAnswersToComment && !_.isEmpty(answers)
                  && <div className="comments__viewAnswer" onClick={() => this.showComments()}>
                    <meta itemProp="answerCount" content={answers.length} />
                    <Interpolate
                      with={{countAnswers: answers.length}}
                      format={textViewButton}
                    />
                  </div>
                  }
                  <div className="comments__votes">
                    {this.voteControls(params.id, answersVote.vote_up || voteUp,  answersVote.voteDown || voteDown,  answersVote.vote || vote)}
                  </div>
                </div>
            }
          </div>
          {params.showModeratorMessage && this.showModeratorMessage()}
          {showForm && params.mainComment && this.renderForm()}
          {params.showAnswersToComment && showComments && this.showAnswersToComment()}
          {showFormAnswer && !params.mainComment && this.renderForm()}
        </div>
      </article>
    )
  };

  addVote = (id, type) => {
    const { access_token } = this.props;
    comments.addCommentVote(access_token, id, {vote_type: type}).then(
      (data) => {
        this.setState({
          voteUp: data.items.vote_up,
          voteDown: data.items.vote_down
        });
      }
    );
  };

  addVoteUp = (id) => {
    this.addVote(id, "up");
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

  addVoteDown = (id) => {
    this.addVote(id, "down");
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

  showControl = (id, type, clickVote, constrolText, controlNotification, stateVote, vote) => {
   // const {vote} = this.state;
    const {noVote, access_token} = this.props;
    return (
      <div className={`review-votes__control`}>
          <span
            className={`review-votes__item review-votes__item-${type} ${vote === type ? `review-votes__item-${type}_active` : ""}`}
            onClick={() => {!noVote && access_token ? clickVote(id) : ""}}
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

  voteControls = (id, voteUp, voteDown, vote) => {
   // const {voteUp, voteDown} = this.state;
    const {access_token, noVote} = this.props;
    const {l} = this.context.i18n;
    let notificationText ="";
    if (access_token) {
      notificationText = l("You can't estimate your own comment");
    } else {
      notificationText = l("Please log in at first");
    }
    return (
      <div className={`review-votes t3 ${noVote || !access_token ? "review-votes__no-vote" : ""}`}>
        {this.showControl(id, "up", this.addVoteUp, l("Helpful"), notificationText, voteUp, vote)}
        {this.showControl(id, "down", this.addVoteDown, l("Useless"), notificationText, voteDown, vote)}
      </div>
    )
  };

  showAnswersToComment = () => {
    const { answers, access_token } = this.props;
    if (_.isEmpty(answers)) return;
    return (
      answers.map((answer) => {

        let params = {
          id: answer.id,
          name: answer.user_name,
          email: answer.user_email,
          avatar: answer.avatar,
          date: answer.created_at,
          content: answer.content,
          showModeratorMessage: true,
          showAnswersToComment: false,
          mainComment: false,
          voteUp: answer.vote_up,
          voteDown: answer.vote_down,
          vote: access_token && answer.vote ? answer.vote.type : ''
        };
        return (
          <div className="comments__answers">
            {this.showCommentItem(params)}
          </div>
        )
      })
    )
  };

  render () {
    const { userMail, userName, userAvatar, content, date, parentId } = this.props;
    const { showForm, showFormAnswer } = this.state;
    let params = {
      id: parentId,
      name: userName,
      email: userMail,
      avatar: userAvatar,
      date: date,
      content: content,
      showModeratorMessage: true,
      showAnswersToComment: true,
      mainComment: true,
    };
    return (
      <div>
        {this.showCommentItem(params)}
        {/*{showForm && this.renderForm(parentId) }*/}
      </div>
    )
  }
}
