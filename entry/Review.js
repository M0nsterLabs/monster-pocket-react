import Review from 'components/Review/ReviewWrapper.jsx'; // ваша композиция
import RRC from 'utils/reactRemoteControl.js'; // Интерфейс проброса компонента наружу

export default class IndexPage extends RRC {
  constructor(...params) {
    super(...params);
    this.components = {
      Review
    };
  }
}
