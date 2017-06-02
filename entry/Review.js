import Review from 'components/Review/ReviewWrapper.jsx';
import RRC from 'utils/reactRemoteControl.js';

export default class IndexPage extends RRC {
  constructor(...params) {
    super(...params);
    this.components = {
      Review
    };
  }
}
