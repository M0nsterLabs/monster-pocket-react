import React from 'react';
import PropTypes from 'prop-types';
import StarsRating from 'quark/lib/StarsRating';

let summPercent = 0;
let percentReview = [];
let iterator = 0;
let lineBlockWidth = 650;

export default class ReviewStatistics extends React.Component {
  static contextTypes = {
    i18n: PropTypes.object
  };

  static propTypes = {
    countReview: PropTypes.array,
    summReview: PropTypes.number,
    averageRating: PropTypes.number,
  };

  componentWillMount () {
    this.countPercents();
  };

  setColor = (percent) => {
    let color;
    switch (true) {
      case (percent >= 0) && (percent <= 9) :
        color = "#1976D2";
        break;
      case (percent >= 10) && (percent <= 19) :
        color = "#2196F3";
        break;
      case (percent >= 20) && (percent <= 29) :
        color = "#42A5F5";
        break;
      case (percent >= 30) && (percent <= 39) :
        color = "#64B5F6";
        break;
      case (percent >= 40) && (percent <= 49) :
        color = "#90CAF9";
        break;
      case (percent >= 50) && (percent <= 59) :
        color = "#FFE082";
        break;
      case (percent >= 60) && (percent <= 69) :
        color = "#FFCA28";
        break;
      case (percent >= 70) && (percent <= 79) :
        color = "#FFAB00";
        break;
      case (percent >= 80) && (percent <= 89) :
        color = "#FF8F00";
        break;
      default :
        color = "#FF6F00";
        break;
    }
    return color;
  };

  showStatisticsLine = (stars) => {
    let {countReview} = this.props;
    if (iterator >= 5) return;
    iterator++;
    if (countReview[iterator-1] === 0) return;
    lineBlockWidth = document.querySelector(".page-content").clientWidth - 240;
    let getMaxPercent = this.getMaxPercent(),
      percent = percentReview[iterator-1],
      widthLine = percent*lineBlockWidth/getMaxPercent,
      color = this.setColor(percent),
      widthLinePercent = widthLine*100/lineBlockWidth +'%';
    return (
        <div className="statistics__line-block js-statistic">
          <div className="statistics__stars js-statistics-stars rating__stars rating-stars-block">
            <StarsRating
              defaultRating={stars}
              disabled={true}
            />
            <span className="t5 js-statistic-count">{countReview[iterator-1]}</span>
          </div>
          <div className="statistics__line-wrap js-line-wrap" style={{"color": color, width: `calc(100% - 220px)`}}>
            <div className="statistics__line js-statistic-line" style={{ width: widthLinePercent, "backgroundColor": color}}>
              <span className="statistics__percent t5 js-statistic-percent" style={{"color": color}}>{percentReview[iterator-1]}% </span>
            </div>
          </div>
        </div>
    )
  };

  countPercents = () => {
    this.props.countReview.map((countReviewItem, i) => {
      percentReview[i]=Math.round(countReviewItem*100/this.props.summReview);
      summPercent+=percentReview[i];
    });
    let diffSummPercent = summPercent - 100;
    if (diffSummPercent === 0) return;
    if (diffSummPercent > 0) {
      for (let i = 4; i >= 0; i--) {
        if (percentReview[i] != 0) {
          percentReview[i] -= diffSummPercent;
          break;
        }
      }
    }
    else {
      for (let i = 0; i < 5; i++) {
        if (percentReview[i] != 0) {
          percentReview[i] -= diffSummPercent;
          break;
        }
      }
    }
  };

  getMaxPercent = () => {
    let maxPercent = percentReview[0];
    for (let i = 0; i < 5; i++) {
      if (percentReview[i] > maxPercent) {
        maxPercent = percentReview[i];
      }
    }
    return maxPercent;
  };

  render() {
    return (
      <div className="reviews__infographics js-reviews-statistics" id="preview-page">
        <div className="rating">
          <h3 className="h3">{this.context.i18n.l('STATISTICS')}</h3>
          <div className="rating__stars">
            <span className="rating__text t1">
              {this.context.i18n.l('Average rating')}:
            </span>
            <StarsRating
              defaultRating={this.props.averageRating}
              disabled={true}
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