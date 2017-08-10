import React from 'react';
import POP2 from 'quark/lib/popups/POP2';
import Typography from 'quark/lib/typography';
import Buttons from 'quark/lib/buttons';
import Interpolate from 'react-interpolate-component';
import PropTypes from 'prop-types';

import SubscriptionTypeCard, {T1, T3} from './bits-and-pieces/SubscriptionTypeCard.jsx';
import './SubscriptionTypePopUp.less';
import '../../www/styles/helpers.less';

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
    const l = this.context.i18n.l;
    const currencySign = '$';
    return (
      <POP2
        id = "subscription-type-popup"
        className = "subscription-type-popup"
        padding = "none"
        closeText = "Close"
        open = {this.state.showPopup}
        onRequestClose = {this.hidePopUp}
        ref = {ref => { this.licenceTypePopup = ref; }}
      >
        <div className="subscription-type-popup__head">
          <Typography.H3
            className="subscription-type-popup__head__title"
            themeType='dark'
            type='default'
          >
            {l('Choose the plan and get any shopify product cheaper up to 99%')}
          </Typography.H3>
          <Typography.T1
            themeType='dark'
            type='default'
            className="subscription-type-popup__head__subtitle"
          >
            {l('You’ll be able to download certain quantity of any from hundreds Shopify themes for year!')}
          </Typography.T1>
        </div>

        <section className="subscription-type-popup__licenses">
          {this.props.subscriptions.map((item, key) => {
            const unLim = parseInt(item.unlimited_downloads, 10);
            const cardLength = this.props.subscriptions.length;
            const economy = !unLim
              ? parseInt(this.props.defaultTemplatePrice, 10) * parseInt(item.max_downloads, 10)
              : parseInt(this.props.defaultTemplatePrice, 10) * parseInt(this.props.templatesQuantity, 10);
            const centerElement = (cardLength >= 5) ? 2 : 1;
            return (
              <SubscriptionTypeCard
                cardLength = {cardLength}
                itemID = {item.id}
                groupID = {item.group.id}
                key = {`subscription-${key}`}
                subscriptionType = {item.title}
                subscriptionTypeImg = {item.icon}
                buttonType = {centerElement === key ? Buttons.B1C : ''}
                currencySign = {currencySign}
                pricePerTemplate = {item.price / 12}
                downloads = {unLim ? l('Unlimited') : item.max_downloads}
                toPay = {parseInt(item.price, 10)}
                economy = {economy}
                templatesQuantity = {this.props.templatesQuantity}
                defaultTemplatePrice = {this.props.defaultTemplatePrice}
                bySubscriptionFunc = {this.props.bySubscriptionFunc}
              >
                {centerElement === key &&
                <span className="subscription-type__card__advice">
              <span>{l('68% of customers choose this subscription')}</span>
              <img
                src="https://s.tmimgcdn.com/wp-content/uploads/memberships/arrow.svg"
              />
            </span>
                }
              </SubscriptionTypeCard>
            );
          })}
        </section>

        <Typography.H3
          themeType='dark'
          type='default'
        >
          The consumers usually ask before the purchase:
        </Typography.H3>

        <span className="subscription-type-popup__questions">
          <div className="subscription-type-popup__questions__item">
            <img
              className="subscription-type-popup__questions__item__icon"
              src="https://s.tmimgcdn.com/wp-content/uploads/memberships/icon-question.svg"
            />
            <span className="subscription-type-popup__questions__item__description">
              <T1 className="subscription-type-popup__questions__item__description__title font_bold" themeType="dark">
                {l('What’s going to happen if the subscription expires but there are still downloads left?')}
              </T1>
              <T3 type="default">
                {(<Interpolate
                  with={{
                    newString: (<br />)
                  }}
                  format={
                    l('When the subscription expires you’re no longer able to download products unless you pay for subscription, in other case you are to buy them at full price. %(newString)s Unfortunately unused downloads will be unavailable.')
                  } />)}
              </T3>
            </span>
          </div>
          <div className="subscription-type-popup__questions__item">
            <img
              className="subscription-type-popup__questions__item__icon"
              src="https://s.tmimgcdn.com/wp-content/uploads/memberships/icon-support.svg"
            />
            <span className="subscription-type-popup__questions__item__description">
              <T1 className="subscription-type-popup__questions__item__description__title font_bold" themeType="dark">
                {l('What’s going to happen if downloads are up before the subscription expires?')}
              </T1>
              <T3 type="default">
                {l('In this case the subscription will automatically end. You’ll be able to arrange a new one and get extra downloads, in other case you are to buy products at full price.')}
              </T3>
            </span>
          </div>
        </span>

        <T3
          type="default"
        >
          <Interpolate
            with={{
              contactUs: (<a href="#" onClick={() => { this.props.contactUsCallback(); }} className="font_bold">{l('Contact us in chat')}</a>)
            }}
            format={l('Still have questions? %(contactUs)s, we will help with the choice!')}
          />
        </T3>
      </POP2>
    );
  }
}

SubscriptionTypePopUp.propTypes = {
  subscriptions        : PropTypes.array,
  templatesQuantity    : PropTypes.number,
  defaultTemplatePrice : PropTypes.number,
  contactUsCallback    : PropTypes.func,
  bySubscriptionFunc   : PropTypes.func
};

SubscriptionTypePopUp.defaultProps = {
  subscriptions        : [],
  templatesQuantity    : 310,
  defaultTemplatePrice : 139,
  contactUsCallback    : () => {},
  bySubscriptionFunc   : () => {}
};

SubscriptionTypePopUp.contextTypes = {
  i18n: PropTypes.object
};
