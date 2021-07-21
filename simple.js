const boot = require('./boot');
const config = require('./config');

async function run(person, params) {
  return await boot.run(
    config.defaults.puppeteerArgs,
    { person: person, params: params },
    main
  );
}

async function main(page, args) {
  let monthDifference = null;
  console.log('[INFO]: Running application Simple...');

  monthDifference = monthDiff(
    convertStringToDate(args.params.search.dates.from),
    convertStringToDate(args.params.search.dates.to)
  );

  validateMonthDiff(monthDifference);
  page = await login(page, config.providers.simple);
  page = await chooseContributor(page, args);
  page = await search(page, args);
  page = await downloadPdfs(page, config.defaults.downloadsPath);
}

async function login(page, simpleConfig) {
  await page.goto(simpleConfig.urls.login, { timeout: 60000 });
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
      value = await page.evaluate(elem => elem.getAttribute('numbers'), virtualKeyboardNumbers[j]);

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
    value = await page.evaluate(elem => elem.textContent, contributorInfo[0]);
    value = value.trim();
    console.log('[DEBUG]: Finding contributor...');
    console.log('[DEBUG]:', args.params.contributor, '==', value, '| Result:', args.params.contributor == value);

    if (args.params.contributor == value) {
      console.log('[DEBUG]: Found:', args.params.contributor);
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

async function search(page, args) {
  let buttonForUpdatingInfo = null;
  let iframe = null;
  let paymentDatesRadioButton = null;
  await page.click('#link_informe_individual');
  await page.waitForNavigation();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  buttonForUpdatingInfo = await page.$$('.modal-footer > .btn.btn-secundary');
  await buttonForUpdatingInfo[0].click();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.waitForSelector("iframe");
  iframe = await page.$('#iframeApp');
  iframe = await iframe.contentFrame();
  await iframe.waitForSelector('input[value="RANGO_FECHAS"]');
  paymentDatesRadioButton = await iframe.$('input[value="RANGO_FECHAS"]');
  await paymentDatesRadioButton.click();
  await iframe.$eval('#tx_fechaInicial\\:textoFecha', (elem, args) => elem.value = args.params.search.dates.from, args);
  await iframe.$eval('#tx_fechaFinal\\:textoFecha', (elem, args) => elem.value = args.params.search.dates.to, args);
  await iframe.select('#tipoDocumentoCotizante', args.person.nitType);
  await iframe.$eval('#inputNroDocCotizante', (elem, args) => elem.value = args.person.nit, args);
  console.log('[DEBUG]: Finding person...');
  (await iframe.$('#btnConsultar')).click();
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/simple/search.png' });
  await validateSearch(iframe);
  return page;
}

function monthDiff(date1, date2) {
  let months = null;
  months = (date2.getFullYear() - date1.getFullYear()) * 12;
  months -= date1.getMonth();
  months += date2.getMonth();
  console.log('[DEBUG]: Month difference between dates:', months);
  return months <= 0 ? 0 : months;
}

function convertStringToDate(date) {
  let dateParts = date.split('/');
  let formatedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  console.log('[DEBUG]: Formated date:', formatedDate);
  return new Date(formatedDate);
}

function validateMonthDiff(monthDiff) {
  if (monthDiff > 12) {
    throw {
      message: 'El rango de fechas debe ser inferior a 12 meses',
      status: 400,
    };
  }
}

async function validateSearch(iframe) {
  let errorDialogElement = await iframe.$('#errorDialog.ui-dialog-content.ui-widget-content');
  let errorDialogElementStyle = null;
  console.log('[DEBUG]: Validating search...');

  if (errorDialogElement != null) {
    errorDialogElementStyle = await iframe.evaluate(elem => elem.getAttribute('style'), errorDialogElement);
    console.log('[DEBUG]: Error dialog element style:', errorDialogElementStyle);

    if (errorDialogElementStyle != 'display: none;') {
      console.log('[DEBUG]: Person NOT found!');

      throw {
        message: 'Person not found',
        status: 404,
      };
    } else {
      console.log('[DEBUG]: Person found!');
    }
  } else {
    console.log('[DEBUG]: Person found!');
  }
}

async function downloadPdfs(page, downloadsPath) {
  let paidSpreedSheetsElementsListLength = 0;
  await page.waitForSelector("iframe");
  iframe = await page.$('#iframeApp');
  iframe = await iframe.contentFrame();
  paidSpreedSheetsElementsListLength = (await iframe.$$('#listaPlanillasPagadas > tbody > tr > td > input.borderImage')).length;

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadsPath + '/simple',
  });

  for (let i = 0; i < paidSpreedSheetsElementsListLength; i++) {
    let pdfButtons = await iframe.$$('#listaPlanillasPagadas > tbody > tr > td > input.borderImage');
    console.log('Downloading PDF number:', i + 1);
    await pdfButtons[i].click();
    await new Promise(resolve => setTimeout(resolve, 3000)).catch();
  }

  return page;
}

exports.run = run;
