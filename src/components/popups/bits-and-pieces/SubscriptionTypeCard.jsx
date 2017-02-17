import React from 'react';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';
import {sprintf} from 'sprintf-js';
import './SubscriptionTypeCard.less';

export default class SubscriptionTypeCard extends React.Component {

  render () {
    let Button = (this.props.buttonType) || Buttons.B2C;
    const currencySign = '$';
    const pricePerTemplate = '22';
    const saleAmount = '108';
    const downloads = '45';
    const months = '6';
    const toPay = '999';

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
      <div className="subscription-type__card">
        <T1 className={'subscription-type__card__title'+' '+this.props.subscriptionType}>
          {this.props.subscriptionType}
        </T1>
        <img
          className   = "subscription-type__card__img"
          src         = {this.props.subscriptionTypeImg}
        />
        <Button
          onClick     = {() => {}}
          className   = "subscription-type__card__button"
          roundedType = "all"
          type        = "text"
          icon        = ""
        >
          {'Choose' + ' ' + this.props.subscriptionType}
        </Button>
        <section className="subscription-type__card__price-info">
            <div className="subscription-type__card__price-info__wrapper">
              <span className="subscription-type__card__price-info__price-per-template">
                <span className="currency-sign">{currencySign}</span>
                <span className="price">{pricePerTemplate}</span>
              </span>
              <span className="subscription-type__card__price-info__sale-per-template">
                <span className="sale">{currencySign} {saleAmount} off</span>
                <T3>
                  per template
                </T3>
              </span>
            </div>
            <div>
              <DetailedInfo
                value={downloads}
                label="downloads"
              />
              <DetailedInfo
                value={months}
                label="months"
              />
              <DetailedInfo
                value={currencySign+toPay}
                label="to pay"
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
