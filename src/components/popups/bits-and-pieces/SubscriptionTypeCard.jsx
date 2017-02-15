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

    return (
      <div className="subscription-type__card">
        <Typography.T1
          className   = "subscription-type__card__title"
          themeType   = 'dark'
          type        = 'default'
        >
          {this.props.subscriptionType}
        </Typography.T1>
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
            <span className="subscription-type__card__price-info__price-per-template">
              <span className="currency-sign">{currencySign}</span>
              <span className="price">{pricePerTemplate}</span>
            </span>
            <span className="subscription-type__card__price-info__sale-per-template">
              <span className="sale">{currencySign} {saleAmount} off</span>
              per template
            </span>
        </section>
      </div>
    );
  }
}
