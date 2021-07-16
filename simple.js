const boot = require('./boot');
const config = require('./config');

async function run() {
  await boot.run(config.defaults.puppeteerArgs, main);
}

async function main(page) {
  await login(page, config.providers.simple);
}

async function login(page, simpleConfig) {
  await page.goto(simpleConfig.urls.login);
  await page.waitForSelector('#nro-doc-login');
  await page.focus('#nro-doc-login');
  
  // Fill NIT
  await page.keyboard.type(simpleConfig.user.nit);
  await page.select('#doc-types', simpleConfig.user.nitType);
  await page.click('#login-continue');
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();

  // Fill password
  await page.waitForSelector('#pass-login');
  virtualKeyboardNumbers = await page.$$('#teclado-virtual > span');
  simpleUserPassword = simpleConfig.user.pass;

  for (let i = 0; i < simpleUserPassword.length; i++) {
    for (let j = 0; j < virtualKeyboardNumbers.length; j++) {
      value = await page.evaluate(el => el.getAttribute('numbers'), virtualKeyboardNumbers[j]);

      if (simpleUserPassword.charAt(i) == value) {
        await virtualKeyboardNumbers[j].click();
        break;
      }
    }
  }

  await page.click('#login');
  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page._client.send('Emulation.clearDeviceMetricsOverride');
  await page.screenshot({ path: config.defaults.screenShotsPath + '/simple/login.png' });
}

exports.run = run;
