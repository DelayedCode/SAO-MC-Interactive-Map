const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const events = [];
  const requestLog = [];
  const consoleLog = [];
  page.on('request', req => requestLog.push({ ts: Date.now(), url: req.url(), method: req.method(), type: req.resourceType() }));
  page.on('response', res => requestLog.push({ ts: Date.now(), url: res.url(), status: res.status(), type: res.request().resourceType() }));
  page.on('console', msg => consoleLog.push({ ts: Date.now(), text: msg.text() }));
  page.on('pageerror', err => consoleLog.push({ ts: Date.now(), text: `pageerror:${String(err)}` }));

  await page.goto('http://localhost:8080/', { waitUntil: 'load', timeout: 120000 });
  const start = Date.now();
  const before = await page.evaluate(() => performance.now());
  await page.click('#characterBuildButton');
  const navTarget = await page.waitForURL(/Character%20Build\/character-build\.html/, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => !!document.getElementById('characterClass') && !!document.querySelector('.build-page'), { timeout: 30000 });
  const after = await page.evaluate(() => ({ time: performance.now(), title: document.title, slots: document.querySelectorAll('.slot-button').length, skillNodes: document.querySelectorAll('.skill-node').length, readyState: document.readyState }));
  const total = Date.now() - start;
  console.log(JSON.stringify({ total, before, after, requestLog: requestLog.slice(0, 80), consoleLog: consoleLog.slice(0, 80) }, null, 2));
  await browser.close();
})();
