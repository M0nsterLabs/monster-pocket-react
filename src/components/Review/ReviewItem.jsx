import React       from 'react';
import PropTypes   from 'prop-types';
import StarsRating from 'quark/lib/StarsRating';

export default class ReviewItem extends React.Component {
  static contextTypes = {
    i18n: React.PropTypes.object
  };

  render() {
    return (
      <div className="review__item t3">
        <div className="review__info">
          <div className="review__author">
            {
              !this.props.userAvatar &&
              <span className="review__author-icon review__author-icon_default"> </span>
            }
            {
              this.props.userAvatar &&
              <img
                className="review__author-icon"
                alt="avatar"
                src={`${this.props.userAvatar}`}
              />
            }
            <span className="review__author-name">{this.props.userName}</span>
          </div>
          <span className="review__score rating-stars-block">
            <StarsRating
              defaultRating={this.props.reviewScore}
              disabled={true}
            />
            <span className="review__flag iti-flag us"> </span>
          </span>
          <span  className="review__date">date</span>
        </div>
        <div className="review__item-content">
          {this.props.reviewContent}
        </div>
        <div className="review__item-controls">
          <span className="review__item-reply tm-icon icon-message">{this.context.i18n.l('Reply')}</span>
        </div>
      </div>
    )
  }
}

ReviewItem.propTypes = {
  userAvatar    : PropTypes.string,
  userName      : PropTypes.string,
  reviewScore   : PropTypes.number,
  reviewContent : PropTypes.string,
};