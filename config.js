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
  simple: simpleConfig = {
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
};
