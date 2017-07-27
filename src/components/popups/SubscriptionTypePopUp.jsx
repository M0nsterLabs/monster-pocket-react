import React from 'react';
import POP2 from 'quark/lib/popups/POP2';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';

import SubscriptionTypeCard, {T1, T3} from './bits-and-pieces/SubscriptionTypeCard.jsx';
import './SubscriptionTypePopUp.less';

export default class SubscriptionTypePopUp extends React.Component {
  state = {
    showPopup: true
  };

  hidePopUp = () => {
    this.licenceTypePopup.popup.animateClose();
    this.setState({
      showPopup: false
    });
  };

  render () {
    // этот комопнент на вход должен получить по сути только объект с данными по лицензиям и колбек для открытия чата
    const licenseTypes = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currencySign = '$';

    const cards = licenseTypes.map((item, key) => {
      const imgUrl = `./img/license_types/${item}.png`;
      const pricePerTemplate  = '22';
      const saleAmount        = '108';
      const downloads         = '45';
      const months            = '6';
      const toPay             = '999';

      return (
        <SubscriptionTypeCard
          key                 = {key}
          subscriptionType    = {item}
          subscriptionTypeImg = {imgUrl}
          buttonType          = {item === 'gold' ? Buttons.B1C : ''}
          currencySign        = {currencySign}
          pricePerTemplate    = {pricePerTemplate}
          saleAmount          = {saleAmount}
          downloads           = {downloads}
          months              = {months}
          toPay               = {toPay}
        >
          {item === 'gold' &&
            <span className="subscription-type__card__advice">
              <span>55% of customers choose this subscription</span>
              <img
                src="./img/license_types/arrow.svg"
              />
            </span>
          }
        </SubscriptionTypeCard>
      );
    });

    const AskedQuestion = (props) => {
      return (
        <div className="subscription-type-popup__questions__item">
          <img
            className="subscription-type-popup__questions__item__icon"
            src={props.icon}
          />
          <span className="subscription-type-popup__questions__item__description">
            <T1 className="subscription-type-popup__questions__item__description__title font_bold">
              {props.title}
            </T1>
            <T3 type="default">
              {props.text}
            </T3>
          </span>
        </div>
      );
    };

    return (
      <POP2
        id               = "subscription-type-popup"
        className        = "subscription-type-popup"
        padding          = "none"
        closeText        = "Close"
        open             = {this.state.showPopup}
        onRequestClose   = {this.hidePopUp}
        ref              = {(ref) => { this.licenceTypePopup = ref; }}
        open             = {this.state.showPopup}
      >
        <div className="subscription-type-popup__head">
          <Typography.H3
            className="subscription-type-popup__head__title"
            themeType='dark'
            type='default'
          >
            Choose the plan and get any shopify product cheaper up to 90%
          </Typography.H3>
          <Typography.T1
            themeType='dark'
            type='default'
          >
            You’ll be able to download certain quantity of any of 260+ Shopify templates for a chosen period of time!
          </Typography.T1>
        </div>

        <section className="subscription-type-popup__licenses">
          {cards}
        </section>

        <Typography.H3
          themeType='dark'
          type='default'
        >
          The consumers usually ask before the purchase:
        </Typography.H3>

        <span className="subscription-type-popup__questions">
          <AskedQuestion
            icon  = "./img/license_types/icon-question.svg"
            title = "What’s going to happen if the subscription expires but there are still downloads left?"
            text  = "When the subscription expires you’re no longer able to download products unless you pay for subscription, in other case you are to buy them at full price. Unfortunately unused downloads will be unavailable."
          />
          <AskedQuestion
            icon  = "./img/license_types/icon-support.svg"
            title = "What’s going to happen if downloads are up before the subscription expires?"
            text  = "In this case the subscription will automatically end. You’ll be able to arrange a new one and get extra downloads, in other case you are to buy products at full price."
          />
        </span>

        <T3
          type="default"
        >
          Still have questions? <a href="#" onClick={() => this.props.contacUsCallback()} className="font_bold">Contact us in chat</a>, we will help with the choice!
        </T3>
      </POP2>
    );
  }
}
