import React from 'react';
import Typography from 'quark/lib/typography';
import './SubscriptionTypeCard.less';

export default class SubscriptionTypeCard extends React.Component {

  render () {
    return (
      <div className="subscription-type__card">
        <Typography.T1
          className="subscription-type__card__title"
          themeType='dark'
          type='default'
        >
          {this.props.subscriptionName}
        </Typography.T1>
        <img
          className="subscription-type__card__img"
          src={this.props.subscriptionTypeImg}
        />
      </div>
    );
  }
}
