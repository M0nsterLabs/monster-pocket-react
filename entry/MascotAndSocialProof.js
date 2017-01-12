import SocialProof from '../src/components/social_proof/SocialProof.jsx';
import Mascot from '../src/components/mascot/MascotWrapper.jsx';
import RRC from '../src/utils/reactRemoteControl.js';

export default class IndexPage extends RRC {
  constructor (componentName) {
    super(componentName);
    this.components = {
      Mascot,
      SocialProof
    };
  }
}
