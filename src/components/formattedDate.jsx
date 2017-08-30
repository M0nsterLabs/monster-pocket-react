import React from 'react';
import PropTypes from 'prop-types';

/**
 * Render component with information how far
 * given date time in correct format
 * @param {number} timestamp moment in time from we should count distance to now
 * @param {string} className modifier class, when needed
 * @return {ReactComponent} return rendered component
 */

export default class FormattedDate extends React.Component {

  state = {
    date: '',
  };

  componentDidMount () {
    const time = new Date(this.props.timestamp * 1000);
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
    const average =  timeNow - this.props.timestamp;

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
      this.setState({
        date: `${this.context.i18n.l('Today')}`
      });
    }  else if ((average < units.DAY * 2) && (timeNowUTC.toDateString() !== time.toDateString())) {
      this.setState({
        date: `${this.context.i18n.l('Yesterday')}`
      });
    } else {
      this.setState({
        date: `${month} ${day}, ${year}`
      });
    }

  }

  render () {
    return (
      <time className={`${this.props.className}`} itemProp="dateCreated" dateTime={this.props.timestamp}>
        { this.state.date }
      </time>
    )
  }
};

/**
 * Object that contains expected props and their types
 * and used for props validation
 * @static
 * @type {Object}
 */
FormattedDate.propTypes = {
  className: PropTypes.string,
  timestamp: PropTypes.number,
};

/**
 * Object containing default props value
 * @static
 * @type {Object}
 */
FormattedDate.defaultProps = {
  className: '',
  timestamp: null,
};

FormattedDate.contextTypes = {
  i18n: PropTypes.object
};
