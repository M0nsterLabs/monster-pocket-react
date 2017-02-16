import React from 'react';
import POP2 from 'quark/lib/popups/POP2';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';

import SubscriptionTypeCard from './bits-and-pieces/SubscriptionTypeCard.jsx';
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
    const licenseTypes = ['bronze','silver','gold','platinum','diamond'];

    const cards = licenseTypes.map((item, key) => {
      const imgUrl = `./img/license_types/${item}.png`;
      return (
        <SubscriptionTypeCard
          key                 = {key}
          subscriptionType    = {item}
          subscriptionTypeImg = {imgUrl}
          buttonType          = {item ==='gold' ? Buttons.B1C : ''}
        >
          {item ==='gold' &&
            <span className="subscription-type__card__advice">
              <span>55% of customers choose this subscription</span>
              <img
                src="./img/license_types/arrow.svg"
              />
            </span>
          }
        </SubscriptionTypeCard>
      )
    });

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

        <span className="subscription-type-popup__advice">

        </span>
      </POP2>
    );
  }
}
