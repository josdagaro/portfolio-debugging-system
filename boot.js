const puppeteer = require('puppeteer');

async function run(args = [], run) {
  let browser = null;
  let page = null;
  browser = await puppeteer.launch({ args: args });
  page = await browser.newPage();
  await page._client.send('Emulation.clearDeviceMetricsOverride');
  await run(page);
  await browser.close();
}

exports.run = run;
