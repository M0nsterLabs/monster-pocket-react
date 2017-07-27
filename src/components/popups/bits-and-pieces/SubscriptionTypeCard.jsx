import React from 'react';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';
import './SubscriptionTypeCard.less';

export default class SubscriptionTypeCard extends React.Component {
  state = {
    isCardVisible: false
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
    let   Button            = (this.props.buttonType) || Buttons.B2C;
    let   cardVisibility    = this.state.isCardVisible ? '' : 'opacity_null scaled';
    // тут нужно передавать ссылку на продукт который попадет в виртуальную корзину (про виртуальную корзину читать тут http://confluence.devoffice.com/pages/viewpage.action?pageId=19399881)
    const urlToAdd          = 'https://www.templatemonster.com/checkout.php?add=62046&channel=preview&price_variant=regular&p_62046_512=1&sc_62046_512=656&pr_62046_512=5937&oids%5B%5D=512&p_62046_239=2&sc_62046_239=656&pr_62046_239=1311&oids%5B%5D=239&p_62046_515=3&sc_62046_515=656&pr_62046_515=5948&oids%5B%5D=515&p_62046_420=4&sc_62046_420=656&pr_62046_420=3987&oids%5B%5D=420&_tmvcid=_vc_ats'

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
      <div className={'subscription-type__card' + ' ' + cardVisibility}>
        <T1 className={'subscription-type__card__title' + ' ' + this.props.subscriptionType}>
          {this.props.subscriptionType}
        </T1>
        <img
          className   = "subscription-type__card__img"
          src         = {this.props.subscriptionTypeImg}
        />
        <Button
          href        = {urlToAdd}
          className   = "subscription-type__card__button"
          roundedType = "all"
          type        = "link"
          icon        = ""
        >
          {'Choose' + ' ' + this.props.subscriptionType}
        </Button>
        <section className="subscription-type__card__price-info">
            <div className="subscription-type__card__price-info__wrapper">
              <span className="subscription-type__card__price-info__price-per-template">
                <span className="currency-sign">{this.props.currencySign}</span>
                <span className="price">{this.props.pricePerTemplate}</span>
              </span>
              <span className="subscription-type__card__price-info__sale-per-template">
                <span className="sale">{this.props.currencySign} {this.props.saleAmount} off</span>
                <T3>
                  per template
                </T3>
              </span>
            </div>
            <div>
              <DetailedInfo
                value={this.props.downloads}
                label="downloads"
              />
              <DetailedInfo
                value={this.props.months}
                label="months"
              />
              <DetailedInfo
                value={this.props.currencySign + this.props.toPay}
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
