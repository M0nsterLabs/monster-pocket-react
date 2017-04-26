import Config from 'config.js';

function getAppLocales () {
  return ['en', 'es', 'ru', 'de', 'pl', 'it', 'tr', 'fr', 'pt-br', 'nl', 'cn', 'cz', 'ua', 'hu', 'sv'];
}

export function getResponseJSON (response) {
  return response.json();
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
  let vars = window.location.pathname.split('/');
  // let vars = ['', 'de', 'wordpress-themen-tipo-51241.html'];
  let locale = 'en';
  vars.forEach(elem => {
    if (appLocales.includes(elem)) {
      locale = elem;
    }
  });
  console.log('locale', locale);
  return locale;
}
