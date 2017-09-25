import React from 'react';
import {render} from 'react-dom';
import App from '../src/pages/App';
import Home from '../src/pages/Home';
import Mascot from '../src/pages/MascotTest';
import Socials from '../src/pages/SocialTest';
import Review from '../src/pages/ReviewTest';
import Comments from '../src/pages/CommentsTest';
import i18n from '../src/i18n';
import PopUp from '../src/pages/PopUpTest';

import {
  Router,
  Route,
  IndexRoute,
  browserHistory
} from 'react-router';
const localeService = new i18n.Factory('ru');
localeService.whenLocaleIsLoaded(function (provider) {
  render(
    <i18n.Provider i18n={provider}>
      <Router history={browserHistory}>
        <Route path='/' component={App}>
          <IndexRoute component={Home}/>
          <Route path='/mascot_test' component={Mascot}/>
          <Route path='/socials_test' component={Socials}/>
          <Route path='/popups_test' component={PopUp}/>
          <Route path='/review_test' component={Review}/>
          <Route path='/comments_test' component={Comments}/>
        </Route>
      </Router>
    </i18n.Provider>,
    document.getElementById('root')
  );
});
