import Config from 'config.js';

function getAppLocales () {
  return ['en', 'es', 'ru', 'de', 'pl', 'it', 'tr', 'fr', 'pt-br', 'nl', 'cn', 'cz', 'ua', 'hu', 'sv'];
}

export function getResponseJSON (response) {
  return response.json();
}

function getQueryVariable (variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

export function infiniteDataLoader (action, codition) {
  if (isEndOfPage() && codition) {
    action();
  }
}

export function getCdnImageUrl (id = false, screenshots = false, type = false, size = {width: 150, height: false}) {
  if (!id || !screenshots || !type) {
    return false;
  }
  let fileName = false;
  for (const screenshot of screenshots) {
    if (screenshot.scr_type_id === Config.screenshotTypes[type]) {
      fileName = screenshot.filename;
    }
  }
  if (fileName) {
    const templateFolder = Math.floor(id / 100) * 100;
    return `${Config.cdnURL + templateFolder}/${fileName}?width=${size.width}${size.height ? '&height=' + size.height : ''}`;
  }
  return false;
}

export function isEndOfPage () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );

  return (window.innerHeight + scrollTop) >= documentHeight - 230;
}

export function getCurrentLocale () {
  const appLocales  = getAppLocales();
  const localeInURL = getQueryVariable('lang');
  return localeInURL && appLocales.indexOf(localeInURL) >= 0 ? localeInURL : 'en';
}
