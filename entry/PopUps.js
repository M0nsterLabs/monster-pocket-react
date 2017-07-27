import SubscriptionTypePopUp from 'components/popups/SubscriptionTypePopUp.jsx';
import RRC from 'utils/reactRemoteControl.js';

export default class IndexPage extends RRC {
  constructor (componentName) {
    super(componentName);
    this.components = {
      SubscriptionTypePopUp
    };
  }
}
