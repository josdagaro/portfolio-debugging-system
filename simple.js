const boot = require('./boot');
const config = require('./config');

async function run(person, params) {
  await boot.run(
    config.defaults.puppeteerArgs,
    { person: person, params: params },
    main
  );
}

async function main(page, args) {
  console.log('[INFO]: Running application Simple...');
  page = await login(page, config.providers.simple);
  page = await chooseContributor(page, args);
  await find(page, args);
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

  // Login
  await page.click('#login');
  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/simple/login.png' });
  return page;
}

async function chooseContributor(page, args) {
  let contributorInfo = null;
  let contributorImg = null;
  contributorsCards = await page.$$('.aportante-card-hover > .cont-card');

  for (let i = 0; i < contributorsCards.length; i++) {
    contributorInfo = await contributorsCards[i].$$('.cont-info > .data-register');
    value = await page.evaluate(el => el.textContent, contributorInfo[0]);
    value = value.trim();
    console.log('[DEBUG]: Finding contributor...');
    console.log('[DEBUG]: ', args.params.simple.contributor, ' == ', value, ' | Result: ', args.params.simple.contributor == value);

    if (args.params.simple.contributor == value) {
      console.log('[DEBUG]: Found: ', args.params.simple.contributor);
      contributorImg = await contributorsCards[i].$$('.cont-image > img');
      await contributorImg[0].click();
      break;
    }
  }

  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/simple/contributor.png' });
  return page;
}

async function find(page, args) {
  await page.click('#link_informe_individual');
  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.$$('.modal-content > app-rs1608 > modal-footer > .btn-secundary')[0].click();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/simple/search.png' });
}

exports.run = run;


// Rango de busquea no puede ser superior a 12 meses
