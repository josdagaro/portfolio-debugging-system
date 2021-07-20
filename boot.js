const puppeteer = require('puppeteer');

async function run(args = [], appArgs, run) {
  let browser = null;
  let page = null;
  let result = null;
  browser = await puppeteer.launch({ args: args });
  page = await browser.newPage();
  await page._client.send('Emulation.clearDeviceMetricsOverride');
  result = await run(page, appArgs);
  await browser.close();
  return result;
}

exports.run = run;
