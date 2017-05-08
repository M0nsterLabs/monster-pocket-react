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
  let locale = 'en';
  vars.forEach(elem => {
    if (appLocales.includes(elem)) {
      locale = elem;
    }
  });
  console.log('locale', locale);
  return locale;
}

export function formattedDate (timestamp) {
  const time = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = time.getFullYear();
  const month = months[time.getMonth()];
  const day  = time.getDate();
  const hour = time.getHours();
  const min = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
  const timeNow = new Date();
  const average =  timeNow - timestamp;

  const units = {
    MINUTE : 60 * 1000,
    HOUR   : 60 * 1000 * 60,
    DAY    : 60 * 1000 * 60 * 24
  };

  if (average < units.HOUR * 10) {
    time.setHours(0);
    time.setMinutes(average / units.MINUTE);
  }

  let date = '';

  if (average < units.MINUTE * 2) {
    date = 'Now';
  } else if (average < units.HOUR) {
    date = `${time.getMinutes()} minutes ago `;
  } else if (average < units.HOUR * 2) {
    date = `${time.getHours()} hour ago `;
  } else if (average < units.HOUR * 10) {
    date = `${time.getHours()} hours ago `;
  }  else if (average < units.DAY * 1) {
    date = `Today at ${time.getHours()}:${time.getMinutes()}`;
  }  else if (average < units.DAY * 2) {
    date = `Yesterday at ${time.getHours()}:${time.getMinutes()}`;
  } else {
    date = `${month} ${day}, ${year} at ${hour} : ${min}`;
  }

  console.log('--------------------------');
  console.log('date', date);
  console.log('timeNow', timeNow);
  console.log('time', time);

  return date;
}
