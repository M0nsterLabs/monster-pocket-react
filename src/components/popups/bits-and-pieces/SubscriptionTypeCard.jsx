import React from 'react';
import currencyFormatter from 'currency-formatter';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';
import PropTypes from 'prop-types';
import './SubscriptionTypeCard.less';
import { getCurrentLocale } from '../../../utils';
import Formats from '../../../../config/currencyFormats';

export default class SubscriptionTypeCard extends React.Component {
  state = {
    isCardVisible: false
  };

  static contextTypes = {
    i18n: PropTypes.object
  };

  componentDidMount () {
    /** timeout is needed for demonstrating card appear animation **/
    setTimeout(() => {
      this.setState({
        isCardVisible: true
      });
    }, 100);
  }

  render () {
    const l = this.context.i18n.l;
    const format = Formats[getCurrentLocale() || 'en'];
    const sprintf = this.context.i18n.sprintf;
    const Button = (this.props.buttonType) || Buttons.B2C;
    const cardVisibility    = this.state.isCardVisible ? '' : 'opacity_null scaled';
    let cardLength = '';
    switch (true) {
      case (this.props.cardLength >= 5):
        cardLength = 'subscription-type__card_five';
        break;
      case (this.props.cardLength >= 3):
        cardLength = 'subscription-type__card_three';
        break;
      default:
        cardLength = '';
        break;
    }

    const DetailedInfo = (props) => (
      <span className="subscription-type__card__price-info_detailed">
          <T1 className="subscription-type__card__price-info_detailed__value">
            {props.value}
          </T1>
          <T5 className="subscription-type__card__price-info_detailed__label">
            {props.label}
          </T5>
        </span>
    );

    return (
      <div className={`subscription-type__card ${cardVisibility} ${cardLength}`}>
        <T1 className={`subscription-type__card__title ${this.props.subscriptionType}`}>
          {this.props.subscriptionType}
        </T1>
        <img
          className   = "subscription-type__card__img"
          src         = {this.props.subscriptionTypeImg}
        />
        <Button
          onClick = {() => {
            this.props.bySubscriptionFunc(this.props.itemID, this.props.groupID);
          }}
          className   = "subscription-type__card__button"
          roundedType = "all"
          type        = "link"
          icon        = ""
        >
          {sprintf(l('Choose %s subscription'), this.props.subscriptionType)}
        </Button>
        <section className="subscription-type__card__price-info">
            <div className="subscription-type__card__price-info__wrapper">
              <span className="subscription-type__card__price-info__price-per-template">
                <span className="currency-sign">{this.props.currencySign}</span>
                <span className="price">{this.props.pricePerTemplate}</span>
              </span>
              <T5 className="subscription-type__card__price-info__sale-per-template">
                <span className="sale">{sprintf(l('%s economy'), currencyFormatter.format(parseInt(this.props.economy, 10), format))}</span>
                <span className="info">{l('per month, paid annually')}</span>
              </T5>
            </div>
            <div>
              <DetailedInfo
                value={this.props.downloads}
                label={l('templates')}
              />
              <DetailedInfo
                value={currencyFormatter.format(this.props.toPay, format)}
                label={l('you`ll be charged once a year')}
              />
            </div>
        </section>
        {this.props.children}
      </div>
    );
  }
}

export const T1 = (props) => (
  <Typography.T1
    className   = {props.className}
    themeType   = {props.themeType || ''}
    type        = 'default'
  >
    {props.children}
  </Typography.T1>
);

export const T3 = (props) => (
  <Typography.T3
    className   = {props.className}
    themeType   = 'dark'
    type        = {props.type || 'secondary'}
  >
    {props.children}
  </Typography.T3>
);

export const T5 = (props) => (
  <Typography.T5
    className   = {props.className}
    themeType   = 'dark'
    type        = {props.type || 'secondary'}
  >
    {props.children}
  </Typography.T5>
);
