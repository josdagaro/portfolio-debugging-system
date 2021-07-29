require('dotenv').config();

exports.defaults = {
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1920,1080',
  ],
  screenShotsPath: process.env.SCREENSHOTS_PATH,
  downloadsPath: process.env.DOWNLOADS_PATH,
}

exports.providers = {
  simple: {
    urls: {
      login: process.env.SIMPLE_LOGIN_URL
    },
    user: {
      name: process.env.SIMPLE_USER_NAME,
      pass: process.env.SIMPLE_USER_PASSWORD,
      nit: process.env.SIMPLE_USER_NIT,
      nitType: process.env.SIMPLE_USER_NIT_TYPE
    }
  },
  aportes: {
    urls: {
      login: process.env.APORTES_LOGIN_URL
    },
    user: {
      name: process.env.APORTES_USER_NAME,
      pass: process.env.APORTES_USER_PASSWORD,
      nit: process.env.APORTES_USER_NIT,
      nitType: process.env.APORTES_USER_NIT_TYPE,
    }
  },
};
