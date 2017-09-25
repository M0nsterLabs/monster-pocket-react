import React from 'react';
import PropTypes from 'prop-types';
import Config from 'config.js';
import ReviewsData from 'plasma-reviews-api-client-js';
import Avatar from 'quark/lib/Avatar';
import N1C from 'quark/lib/notifications/N1C';
import FormattedDate from '../formattedDate';
import NotificationModeration from '../NotificationModeration/';
import AnswersForm from './AnswersForm';
import HtmlToJsx from '../html-to-js';
import './Comments.less';

const APPROVED = 'approved';
const comments = new ReviewsData(Config.reviewsServiceURL);

export default class AnswerItem extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    userMail: PropTypes.string,
    userName: PropTypes.string,
    date: PropTypes.number,
    status: PropTypes.string,
    accessToken: PropTypes.string,
    id: PropTypes.number,
    templateId: PropTypes.number,
    userData: PropTypes.object,
    voteUp: PropTypes.number,
    voteDown: PropTypes.number,
    vote: PropTypes.string,
    noVote: PropTypes.bool,
    parentId: PropTypes.number,
    author: PropTypes.string,
    authorId: PropTypes.number,
    avatar: PropTypes.string,
  };

  static defaultProps = {
    content: '',
    userMail: '',
    userName: '',
    userAvatar: '',
    date: 0,
    status: '',
    accessToken: '',
    answers: [],
    id: 0,
    templateId: 0,
    userData: {},
    voteUp: 0,
    voteDown: 0,
    vote: '',
    noVote: false,
    parentId: 0,
    author: '',
    authorId: 0,
    avatar: '',
  };

  static contextTypes = {
    i18n: PropTypes.object,
  };

  state = {
    showFormAnswer: false,
    showForm: false,
    voteUp: this.props.voteUp,
    voteDown: this.props.voteDown,
    vote: this.props.vote,
    showModeratorMessage: false,
  };

  /**
   * Show user avatar
   * @param email
   * @param name
   * @param avatar
   * @returns {XML}
   */
  showAvatar = (email, name, avatar) => (
    <Avatar
      email={email || ''}
      name={name || this.context.i18n.l('Anonymous')}
      size={40}
      src={avatar || ''}
      isRounded
      className="review__author-icon"
    />
    );

  /**
   * Show moderator message - answer is on review
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
      );
    }
  }

  /**
   * Show reply button on answer
   * @param answer
   * @returns {XML}
   */
  replyButton = answer => (
    <span
      className="Comments__itemReply tm-icon icon-message"
      onClick={() => (answer === 'answer' ? this.showFormAnswer() : this.showForm())}
    >
      {this.context.i18n.l('Reply')}
    </span>
    );

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
   * Set state show comments
   */
  showComments = () => {
    this.setState({
      showFormAnswer: false,
    });
  };

  /**
   * Votes on answers
   * @param {string} type - 'up' or 'down'
   */
  addVote = (type) => {
    const { accessToken, id } = this.props;
    comments.addCommentVote(accessToken, id, { vote_type: type }).then(
      (data) => {
        this.setState({
          voteUp: data.items.vote_up,
          voteDown: data.items.vote_down,
        });
      },
    );
  };

  /**
   * Add vote up on answer
   */
  addVoteUp = () => {
    this.addVote('up');
    switch (this.state.vote) {
      case 'up':
        this.setState({
          vote: '',
        });
        break;
      default:
        this.setState({
          vote: 'up',
        });
        break;
    }
  };

  /**
   * Add vote down on answer
   */
  addVoteDown = () => {
    this.addVote('down');
    switch (this.state.vote) {
      case 'down':
        this.setState({
          vote: '',
        });
        break;
      default:
        this.setState({
          vote: 'down',
        });
        break;
    }
  };

  /**
   * Show control buttons on answer
   * @param type
   * @param clickVote
   * @param constrolText
   * @param controlNotification
   * @param stateVote
   * @returns {XML}
   */
  showControl = (type, clickVote, constrolText, controlNotification, stateVote) => {
    const { vote } = this.state;
    const { noVote, accessToken } = this.props;
    return (
      <div className={'review-votes__control'}>
        <span
          className={`review-votes__item review-votes__item-${type} ${vote === type ? `review-votes__item-${type}_active` : ''}`}
          onClick={() => { !noVote && accessToken ? clickVote() : ''; }}
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
    );
  };

  /**
   * Show vote controls on answer
   * @returns {XML}
   */
  voteControls = () => {
    const { voteUp, voteDown } = this.state;
    const { accessToken, noVote } = this.props;
    const { l } = this.context.i18n;
    let notificationText = '';
    if (accessToken) {
      notificationText = l("You can't estimate your own comment");
    } else {
      notificationText = l('Please log in at first');
    }
    return (
      <div className={`review-votes t3 ${noVote || !accessToken ? 'review-votes__no-vote' : ''}`}>
        {this.showControl('up', this.addVoteUp, l('Helpful'), notificationText, voteUp)}
        {this.showControl('down', this.addVoteDown, l('Useless'), notificationText, voteDown)}
      </div>
    );
  };

  /**
   * Show answer form
   * @returns {XML}
   */
  renderForm = () => {
    const { templateId, accessToken, userData, parentId, userName, authorId } = this.props;
    return (
      <AnswersForm
        templateId={templateId}
        accessToken={accessToken}
        userName={userData.name}
        userMail={userData.mail}
        userAvatar={userData.avatar}
        parentId={parentId}
        userAnswerName={userName || this.context.i18n.l('Anonymous')}
        replyToAnswer
        authorId={authorId}
      />
    );
  };

  render() {
    const { userMail, userName, content, date,
      accessToken, status, author, id, avatar } = this.props;
    const { showForm, voteUp, showModeratorMessage } = this.state;
    return (
      <div className="Answer" id={id}>
        <article
          className={`Comments__item
          ${author === 'moderator' ? 'Comments__itemModerator' : ''}
          ${author === 'vendor' ? 'Comments__itemContributor' : ''}`}
          itemScope
          itemType="http://schema.org/Question"
        >
          <meta itemProp="upvoteCount" content={voteUp} />
          <div className="Comments__avatar">
            {this.showAvatar(userMail, userName, avatar)}
          </div>
          <div className="Comments__info">
            <div className="Comments__describe">
              <div className="Comments__describeHeader t5">
                <div className="Comments__author" itemScope itemType="http://schema.org/Person" itemProp="author">
                  <meta itemProp="name" content={userName} />
                  {userName || this.context.i18n.l('Anonymous')}
                  {(author === 'moderator') && (<span className="Comments__authorModerator t5" >TemplateMonster</span>)}
                  {(author === 'vendor') && (<span className="Comments__authorContributor t5" >{this.context.i18n.l('Vendor')}</span>)}
                </div>
                <FormattedDate timestamp={date} className="Comments__date" />
              </div>
              <div className="Comments__content t3" itemProp="text"><HtmlToJsx html={content} /></div>
              {
              status === APPROVED &&
              <div className="Comments__describeFooter t3">
                {accessToken && this.replyButton()}
                <div className="Comments__votes">
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
    );
  }
}
