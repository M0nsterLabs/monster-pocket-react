import React from 'react';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';
import PropTypes from 'prop-types';
import './SubscriptionTypeCard.less';

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
          <T3 className="subscription-type__card__price-info_detailed__label">
            {props.label}
          </T3>
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
              <span className="subscription-type__card__price-info__sale-per-template">
                <span className="sale">{sprintf(l('$%d economy'), parseInt(this.props.economy, 10))}</span>
                <span className="info">{l('per month, paid annually')}</span>
              </span>
            </div>
            <div>
              <DetailedInfo
                value={this.props.downloads}
                label={l('downloads per month')}
              />
              <DetailedInfo
                value={this.props.currencySign + this.props.toPay}
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
    themeType   = 'dark'
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
