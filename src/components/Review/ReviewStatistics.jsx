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
    this.maxPercent = 100;
    this.widthLine = [];
    this.color = [];
    this.widthLinePercent = [];
  }

  static propTypes = {
    countReview: PropTypes.array,
    summReview: PropTypes.number,
    averageRating: PropTypes.number,
  };

  componentWillMount () {
    this.calculateData();
  };

  calculateData = () => {
    this.countPercents();
    this.maxPercent = this.getMaxPercent();
    this.lineBlockWidth = document.querySelector(".page-content").clientWidth - 240;

    this.props.countReview.map((countReviewItem, i) => {
      this.widthLine[i] = this.percentReview[i]*this.lineBlockWidth/this.maxPercent;
      this.color[i] = this.setColor(this.percentReview[i]);
      this.widthLinePercent[i] = this.widthLine[i]*100/this.lineBlockWidth +'%';
    });
  };

  setColor = (percent) => {
    const colors = ["#1976D2", "#2196F3", "#42A5F5", "#64B5F6", "#90CAF9", "#FFE082", "#FFCA28", "#FFAB00", "#FF8F00", "#FF6F00"];
    return colors[Math.min(colors.length-1, Math.floor(percent/10))];
  };

  showStatisticsLine = (stars) => {
    let {countReview} = this.props;
    if (countReview[stars-1] === 0) return;
    let statistics__line_width = 220;
    if (document.body.classList.contains("js-item-page-b")) statistics__line_width = 50;
    return (
        <div className="statistics__line-block">
          <div className="statistics__stars rating__stars rating-stars-block">
            <StarsRating
              defaultRating={stars}
              disabled
            />
            <span className="t5">{countReview[stars-1]}</span>
          </div>
          <div className="statistics__line-wrap" style={{"color": this.color[stars-1], width: `calc(100% - ${statistics__line_width}px)`}}>
            <div className="statistics__line" style={{ width: this.widthLinePercent[stars-1], "backgroundColor": this.color[stars-1]}}>
              <span className="statistics__percent t5" style={{"color": this.color[stars-1]}}>{this.percentReview[stars-1]}% </span>
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

        <span className="reviews__infographics-text-new-page t1">{this.context.i18n.l('Includes')}:</span>

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