import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';
import App from '../src/pages/App';
import Home from '../src/pages/Home';
import Mascot from '../src/pages/MascotTest';
import Socials from '../src/pages/SocialTest';
import PopUp from '../src/pages/PopUpTest';

import {
  Router,
  Route,
  IndexRoute,
  browserHistory
} from 'react-router';

render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Home}/>
      <Route path='/mascot_test' component={Mascot}/>
      <Route path='/socials_test' component={Socials}/>
      <Route path='/popups_test' component={PopUp}/>
    </Route>
  </Router>
  ,
  document.getElementById('root')
);