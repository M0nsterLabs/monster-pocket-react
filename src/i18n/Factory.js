import Tools from './Tools';

function loadInternationalizationFile (localeToLoad) {
  if (localeToLoad === 'en') {
    // No need to load as UI already in English
    return Promise.resolve({});
  }

  return fetch(`./lang/${localeToLoad}.json`).then(res => {
    if (res.status >= 400) {
      throw new Error('Bad response from server');
    }

    return res.json();
  });
}

export default class Factory {
  constructor (locale = 'en') {
    if (typeof Factory.instance === 'object') {
      return Factory.instance;
    }
    this._locale = locale;
    Factory.instance = this;
  }

  get loclae () {
    return this._locale;
  }

  isLoaded () {
    return typeof this.i18nProvider !== 'undefined';
  }

  getProvider () {
    return this.i18nProvider;
  }

  whenLocaleIsLoaded (callback) {
    let locale = this._locale;

    this::loadInternationalizationFile(locale).then(localeData => {
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
