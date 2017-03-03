import Jed from 'jed';

export default class Tools {
  constructor ({ localeData, locale }) {
    this.jed = new Jed(localeData);
    this.locale = locale;
  }

  l = (text, context) => {
    return context
      ? this.jed.pgettext(context, text)
      : this.jed.gettext(text);
  };

  nl = (singular, plural, amount, context) => {
    return context
      ? this.jed.npgettext(context, singular, plural, amount)
      : this.jed.ngettext(singular, plural, amount);
  };

  sprintf = (...params) => {
    return this.jed.sprintf(...params);
  };

  getLocale = () => {
    return this.locale.toLowerCase();
  }
}
