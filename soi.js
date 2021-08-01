const boot = require('./boot');
const config = require('./config');
const zip = require('extract-zip');
const path = require('path');
const fs = require('fs');
const global = require('./global');

async function run(person, params) {
  return await boot.run(
    config.defaults.puppeteerArgs,
    { person: person, params: params },
    main
  );
}

async function main(page, args) {
  console.log('[INFO][SOI]: Running application SOI...');
  page = await login(page, config.providers.soi, args);
  page = await search(page, args);
  page = await downloadPdfs(page, config.defaults.downloadsPath);
  // page = await chooseContributor(page, args);
  // page = await search(page, args);
}

async function login(page, soiConfig, args) {
  await page.goto(soiConfig.urls.login, { timeout: 60000 });
  await page.waitForSelector('input[name=numeroIdUsuario');
  await page.focus('input[name=numeroIdUsuario');

  // Fill User NIT
  await page.keyboard.type(soiConfig.user.nit);
  await page.select('#tipoIdUsuario', extractNitTypeValue(soiConfig.user.nitType));

  // Fill Company NIT
  await page.focus('input[name=numeroIdEmpresa');
  await page.keyboard.type(args.params.contributor);
  await page.select('#tipoIdEmpresa', "2");

  // Fill password
  await page.focus('input[name=claveUsuario');
  await page.keyboard.type(soiConfig.user.pass);

  // Login
  console.log('[DEBUG][SOI]: Login');
  await page.click('input[value=Ingresar].botton');
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/soi/login.png' });
  return page;
}

async function search(page, args) {
  let subMenuOptions = null;
  let radioButtons = null;
  console.log('[DEBUG][SOI]: Start search');
  await page.click('#opcion0');
  await new Promise(resolve => setTimeout(resolve, 500)).catch();
  subMenuOptions = await page.$$('td.menuSubNivel');
  console.log('[DEBUG][SOI]: Found sub menu options:', subMenuOptions.length);

  for (let i = 0; i < subMenuOptions.length; i++) {
    let text = await page.evaluate(elem => elem.textContent, subMenuOptions[i]);
    text = text.trim();

    if (text === 'Reporte') {
      console.log('[DEBUG][SOI]: Found required sub menu option, clicking');
      await subMenuOptions[i].click();
      break;
    }
  }

  await page.waitForSelector('td > input[type=radio]')
  radioButtons = await page.$$('td > input[type=radio]');
  console.log('[DEBUG][SOI]: Found radio buttons:', radioButtons.length);

  for (let i = 0; i < radioButtons.length; i++) {
    let value = await page.evaluate(elem => elem.value, radioButtons[i]);

    if (value === '1') {
      console.log('[DEBUG][SOI]: Found required radio button, clicking');
      await radioButtons[i].click();
      break;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/soi/search-1.png' });
  await page.click('#siguiente1');
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/soi/search-2.png' });
  await page.select('#tipoIdentificacion', extractNitTypeValue(args.person.nitType) + ',' + args.person.nitType);
  await page.focus('#numeroIdentificacion');
  await page.keyboard.type(args.person.nit);
  await page.select('#tipoPlanilla', '1,E');
  await page.click('input[name=addOne]');
  await page.select('select[name=annio]', args.params.search.dates.year.toString());
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/soi/search-3.png' });
  await page.click('input[name=ingresar]');
  await new Promise(resolve => setTimeout(resolve, 1000)).catch();
  await page.screenshot({ path: config.defaults.screenShotsPath + '/soi/search-4.png' });
  return page;
}

async function downloadPdfs(page, downloadsPath) {
  let pdfButtonsLength = 0;

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadsPath + '/soi',
  });

  pdfButtonsLength = (await page.$$('td > table > tbody > tr > td.textoNota > img[title="Descargar Soporte"]')).length;
  console.log('[DEBUG][SOI]: Starting PDF download');

  for (let i = 0; i < pdfButtonsLength; i++) {
    let pdfButtons = await page.$$('td > table > tbody > tr > td.textoNota > img[title="Descargar Soporte"]');
    console.log('[DEBUG][SOI]: Downloading PDF number:', i + 1);
    await pdfButtons[i].click();
    await new Promise(resolve => setTimeout(resolve, 3200)).catch();
  }

  await extractZipFile('soi', downloadsPath);
  return page;
}

async function extractZipFile(scope, downloadsPath) {
  const zipDirPath = path.join(__dirname, downloadsPath + '/' + scope);

  let zipFiles = fs.readdirSync(zipDirPath).map(name => {
    return {
      name: path.basename(name, ".zip"),
      url: `/${scope}/${name}`
    };
  });

  zipFiles = global.filterFiles(zipFiles);
  console.log('[DEBUG][SOI]: Extracting ZIP file...');

  for(let i = 0; i < zipFiles.length; i++) {
    await zip(zipDirPath + `/${zipFiles[i].name}.zip`, { dir: zipDirPath }, function (err) {
      throw err;
   });

   fs.unlink(zipDirPath + `/${zipFiles[i].name}.zip`, function (err) {
    if (err) {
      throw err;
    }
  });
  }
}

function extractNitTypeValue(nitType) {
  let value = "1";

  switch (nitType) {
    case 'CC':
      value = "1";
      break;
    case 'CD':
      value = "8";
      break;
    case 'CE':
      value = "6";
      break;
    case 'PA':
      value = "5";
      break;
    case 'PE':
      value = "9";
      break;
    case 'RC':
      value = "4";
      break;
    case 'TI':
      value = "3";
      break;
  }

  return value;
}

exports.run = run;
