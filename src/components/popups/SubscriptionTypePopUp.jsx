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

  static propTypes = {
    //
  };

  static defaultProps = {
    //
  };

  hidePopUp = () => {
    this.licenceTypePopup.popup.animateClose();
    this.setState({
      showPopup: false
    });
  };

  render () {
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
            className=''
          >
            You’ll be able to download certain quantity of any of 260+ Shopify templates for a chosen period of time!
          </Typography.T1>
        </div>

        <section className="subscription-type-popup__licenses">
          <SubscriptionTypeCard
            subscriptionType="bronze"
            subscriptionTypeImg="./img/license_types/bronze.png"
          />
          <SubscriptionTypeCard
            subscriptionType="silver"
            subscriptionTypeImg="./img/license_types/silver.png"
          />
          <SubscriptionTypeCard
            buttonType={Buttons.B1C}
            subscriptionType="gold"
            subscriptionTypeImg="./img/license_types/gold.png"
          />
          <SubscriptionTypeCard
            subscriptionType="platinum"
            subscriptionTypeImg="./img/license_types/platinum.png"
          />
          <SubscriptionTypeCard
            subscriptionType="diamond"
            subscriptionTypeImg="./img/license_types/diamond.png"
          />
        </section>
      </POP2>
    );
  }
}
