import SubscriptionTypeCard from '../src/components/popups/SubscriptionTypePopUp';
import RRC from '../src/utils/reactRemoteControl';
import '../src/www/styles/fonts.less';

export default class Memberships extends RRC {
  constructor (...params) {
    super(...params);
    this.components = {
      popup: SubscriptionTypeCard
    };
  }
}
