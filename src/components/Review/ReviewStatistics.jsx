import React from 'react';
import PropTypes from 'prop-types';
import StarsRating from 'quark/lib/StarsRating';

export default class ReviewStatistics extends React.Component {
  static contextTypes = {
    i18n: PropTypes.object
  };

  constructor () {
    super();
    this.summPercent = 0;
    this.percentReview = [];
    this.iterator = 0;
    this.lineBlockWidth = 650;
    this.maxLine = 5;
  }

  static propTypes = {
    countReview: PropTypes.array,
    summReview: PropTypes.number,
    averageRating: PropTypes.number,
  };

  componentWillMount () {
    this.countPercents();
  };

  setColor = (percent) => {
    const colors = ["#1976D2", "#2196F3", "#42A5F5", "#64B5F6", "#90CAF9", "#FFE082", "#FFCA28", "#FFAB00", "#FF8F00", "#FF6F00"];
    return colors[Math.min(colors.length-1, Math.floor(percent/10))];
  };

  showStatisticsLine = (stars) => {
    let {countReview} = this.props;
    if (this.iterator >= this.maxLine) return;
    this.iterator++;
    if (countReview[this.iterator-1] === 0) return;
    this.lineBlockWidth = document.querySelector(".page-content").clientWidth - 240;
    let getMaxPercent = this.getMaxPercent(),
      percent = this.percentReview[this.iterator-1],
      widthLine = percent*this.lineBlockWidth/getMaxPercent,
      color = this.setColor(percent),
      widthLinePercent = widthLine*100/this.lineBlockWidth +'%';
    return (
        <div className="statistics__line-block">
          <div className="statistics__stars rating__stars rating-stars-block">
            <StarsRating
              defaultRating={stars}
              disabled
            />
            <span className="t5">{countReview[this.iterator-1]}</span>
          </div>
          <div className="statistics__line-wrap" style={{"color": color, width: `calc(100% - 220px)`}}>
            <div className="statistics__line" style={{ width: widthLinePercent, "backgroundColor": color}}>
              <span className="statistics__percent t5" style={{"color": color}}>{this.percentReview[this.iterator-1]}% </span>
            </div>
          </div>
        </div>
    )
  };

  countPercents = () => {
    this.props.countReview.map((countReviewItem, i) => {
      this.percentReview[i]=Math.round(countReviewItem*100/this.props.summReview);
      this.summPercent+=this.percentReview[i];
    });
    let diffSummPercent = this.summPercent - 100;
    if (diffSummPercent === 0) return;
    if (diffSummPercent > 0) {
      for (let i = 4; i >= 0; i--) {
        if (this.percentReview[i] != 0) {
          this.percentReview[i] -= diffSummPercent;
          break;
        }
      }
    }
    else {
      for (let i = 0; i < this.maxLine; i++) {
        if (this.percentReview[i] != 0) {
          this.percentReview[i] -= diffSummPercent;
          break;
        }
      }
    }
  };

  getMaxPercent = () => {
    let maxPercent = this.percentReview[0];
    for (let i = 0; i < this.maxLine; i++) {
      if (this.percentReview[i] > maxPercent) {
        maxPercent = this.percentReview[i];
      }
    }
    return maxPercent;
  };

  render() {
    let {averageRating} = this.props;
    return (
      <div className="reviews__infographics">
        <div className="rating">
          <h3 className="rating__name h3">{this.context.i18n.l('STATISTICS')}</h3>
          <div className="rating__stars">
            <meta itemProp="ratingValue" content = {this.props.averageRating} />
            <span className="rating__text t1">
              {this.context.i18n.l('Average rating')}:
            </span>
            <StarsRating
              defaultRating={averageRating}
              disabled
            />
          </div>
          <span className="rating__text_new-page h3">{this.context.i18n.l('Product rating')}:</span>

        </div>


        <span className="reviews__infographics-text-new-page t1">{this.context.i18n.l('INCLUDES')}:</span>

        <div className="statistics">
          {this.showStatisticsLine(5)}
          {this.showStatisticsLine(4)}
          {this.showStatisticsLine(3)}
          {this.showStatisticsLine(2)}
          {this.showStatisticsLine(1)}
        </div>
      </div>
    )
  }
}