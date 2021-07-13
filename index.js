const puppeteer = require('puppeteer');

(async () => {
  const simpleConfig = {
    urls: {
      login: 'https://www.simple.co/sso/#/login'
    },
    user: {
      name: 'CC1065014890',
      pass: '2021',
      nit: '1065014890',
      nitType: 'CC'
    }
  }

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
    ]
  });

  const page = await browser.newPage();
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

  // virtualKeyboardNumbers[0].click()
  // await new Promise(resolve => setTimeout(resolve, 500)).catch();
  // virtualKeyboardNumbers[1].click()
  // await new Promise(resolve => setTimeout(resolve, 500)).catch();
  // virtualKeyboardNumbers[2].click()
  // await new Promise(resolve => setTimeout(resolve, 500)).catch();
  // virtualKeyboardNumbers[3].click()
  // await new Promise(resolve => setTimeout(resolve, 500)).catch();
  // await page.click('#2');
  // await page.click('#0');
  // await page.click('#2');
  // await page.click('#1');

  // Login
  await page.click('#login');
  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page._client.send('Emulation.clearDeviceMetricsOverride');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();