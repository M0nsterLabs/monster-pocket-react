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
import './Comments.less';
import AnswerItem from './AnswerItem';
import HtmlToJsx from '../html-to-js';
import {
  getResponseJSON
} from 'utils/';

const APPROVED = 'approved';
const PENDING = 'pending';
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
    noVote: PropTypes.string,
    author_id: PropTypes.number,
    avatar: PropTypes.string,
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
    usersIds: [],
    usersData: [],
    allAvatars: false,
  };

  getUsersIds = () => {
    const { answers } = this.props;
    const { showAnswers, usersIds } = this.state;
    if (showAnswers && answers.length) {
      answers.map((answer) => {
        usersIds.push(answer.user_id);
      });
      this.getAvatars();
    }
  };

  /**
   * Get users avatars
   */
  getAvatars = () => {
    const { answers } = this.props;
    const { usersIds } = this.state;
    let { usersData } = this.state;
    fetch(`${Config.accountServiceURL}users/profiles?ids=${usersIds}`, {
      method: 'get',
    })
      .then(getResponseJSON)
      .then((data) => {
        usersData = [...usersData, ...data];
      })
      .then(() => {
        answers.map((answer) => {
          return (
            usersData.map((userData) => {
              if (answer.user_id != userData.id) return;
              answer['avatar'] = userData.avatar;
            })
          );
        });
      })
      .then(() => {
        this.setState({
          allAvatars: true,
        });
      });
  };

  /**
   * Show user avatar
   * @param email
   * @param name
   * @param avatar
   * @returns {XML}
   */
  showAvatar = (email, name, avatar) => {
    return (
      <Avatar
        email     = {email ? email : ''}
        name      = {name ? name : this.context.i18n.l('Anonymous')}
        size      = {40}
        src       = {avatar ? avatar : ''}
        isRounded = {true}
        className = "review__author-icon"
      />
    )
  };

  /**
   * Show moderator message - comment is on review
   * @returns {XML}
   */
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

  /**
   * Show reply button on comment
   * @param answer
   * @returns {XML}
   */
  replyButton = (answer) => {
    return (
      <span
        className="Comments__itemReply tm-icon icon-message"
        onClick={() => (answer === 'answer' ? this.showFormAnswer(): this.showForm())}
      >
          {this.context.i18n.l('Reply')}
      </span>
    )
  };

  /**
   * Set state on show answer form
   */
  showFormAnswer = () => {
    this.setState({
      showFormAnswer: true,
    });
  };

  /**
   * Set state on show forms
   */
  showForm = () => {
    this.setState({
      showForm: true,
      showFormAnswer: true,
    });
  };

  /**
   * Show comment form
   * @returns {XML}
   */
  renderForm = () => {
    const { templateId, access_token, userData, id, author_id, userName } = this.props;
    return (
      <AnswersForm
        template_id={templateId}
        access_token={access_token}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={id}
        author_id={author_id}
        userAnswerName={userName || this.context.i18n.l('Anonymous')}
        replyToAnswer
      />
    )
  };

  /**
   * Set state show comments
   */
  showComments = () => {
    this.setState({
      showAnswers: !this.state.showAnswers,
      showFormAnswer: false,
    }, () => {
      this.getUsersIds();
    });
  };

  /**
   * Votes on comment
   * @param type
   */
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

  /**
   * Add vote up on comment
   */
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

  /**
   * Add vote down on comment
   */
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

  /**
   * Show control buttons on comment
   * @param type
   * @param clickVote
   * @param constrolText
   * @param controlNotification
   * @param stateVote
   * @returns {XML}
   */
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

  /**
   * Show vote controls on comment
   * @returns {XML}
   */
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

  /**
   * Show answers on comment
   */
  showAnswers = () => {
    const { answers, access_token, templateId, userData, id, author_id, userAvatar, userMail } = this.props;
    if (_.isEmpty(answers)) return;
    return (
      <div className="Comments__answersWrap">
        {
          answers.map((answer) => {
            let avatar = '';
            let email = answer.user_email;
            if (answer.avatar) {
              avatar = answer.avatar;
            } else if (answer.status === PENDING) {
              avatar = userAvatar;
              email = userMail;
            }
            return (
              <div className="Comments__answers">
                <AnswerItem
                  userName={answer.user_name}
                  userMail={email}
                  content={answer.content}
                  avatar={avatar}
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
                  author={answer.author}
                  author_id={author_id}
                />
              </div>
            );
          })
        }
      </div>
    );
  };

  render () {
    const { userMail, userName, content, date, access_token, answers, status, id, avatar } = this.props;
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
      <article id={id} className="Comments__item" itemScope itemType="http://schema.org/Question">
        <meta itemProp="upvoteCount" content = {voteUp} />
        <div className="Comments__avatar">
          {this.showAvatar(userMail, userName, avatar)}
        </div>
        <div className="Comments__info">
          <div className="Comments__describe">
            <div className="Comments__describeHeader t5">
              <div className="Comments__author" itemScope itemType="http://schema.org/Person" itemProp="author">
                <meta itemProp="name" content={userName} />
                {userName || this.context.i18n.l('Anonymous')}
              </div>
              <FormattedDate timestamp={date} className="Comments__date"/>
            </div>
            <div className="Comments__content t3" itemProp="text">{<HtmlToJsx html={content}/>}</div>
            {
              status === APPROVED &&
              <div className="Comments__describeFooter t3">
                {access_token && this.replyButton()}
                { !_.isEmpty(answers)
                && <div className="Comments__viewAnswer" onClick={() => this.showComments()}>
                  <meta itemProp="answerCount" content={answers.length} />
                  <Interpolate
                    with={{countAnswers: answers.length}}
                    format={textViewButton}
                  />
                </div>
                }
                <div className="Comments__votes">
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
