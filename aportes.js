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
  console.log('[INFO]: Running application Aportes...');
  page = await login(page, config.providers.simple);
  page = await chooseContributor(page, args);
  page = await search(page, args);
  page = await downloadPdfs(page, config.defaults.downloadsPath);
}
