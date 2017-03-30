import Tools from './Tools';
import Promise from 'bluebird';

function loadInternationalizationFile (localeToLoad, path) {
  if (localeToLoad === 'en') {
    // No need to load as UI already in English
    return Promise.resolve({});
  }

  return fetch(`${path}/lang/${localeToLoad}.json`).then(res => {
    if (res.status >= 400) {
      throw new Error('Bad response from server');
    }

    return res.json();
  });
}

export default class Factory {
  constructor (locale = 'en', path = '.') {
    if (typeof Factory.instance === 'object') {
      return Factory.instance;
    }
    this._locale = locale;
    this._path = path;
    Factory.instance = this;
  }

  get locale () {
    return this._locale;
  }

  get path () {
    return this._path;
  }

  whenLocaleIsLoaded (callback) {
    const locale = this.locale;
    const path = this.path;

    this::loadInternationalizationFile(locale, path).then(localeData => {
      this.i18nProvider = new Tools({
        localeData,
        locale
      });
      const i18nProvider = this.i18nProvider;
      const nullContext = null;
      callback.call(nullContext, i18nProvider);
    });
  }
}
