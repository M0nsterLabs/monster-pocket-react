import SocialProof from 'components/social_proof/SocialProof.jsx';
import Mascot from 'components/mascot/MascotWrapper.jsx';
import RRC from 'utils/reactRemoteControl.js';
import Promise from 'bluebird';

export default class IndexPage extends RRC {
  constructor (...params) {
    super(...params);
    this.components = {
      Mascot,
      SocialProof
    };
  }
}
