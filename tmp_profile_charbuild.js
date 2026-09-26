const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text(), location: msg.location() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: String(err) }));
  page.on('request', req => logs.push({ type: 'request', url: req.url(), method: req.method(), resourceType: req.resourceType() }));
  page.on('response', res => logs.push({ type: 'response', url: res.url(), status: res.status(), resourceType: res.request().resourceType() }));
  await page.goto('http://localhost:8080/Aincrad/Character%20Build/character-build.html', { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2000);
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || null;
    const res = performance.getEntriesByType('resource');
    const longTasks = performance.getEntriesByType('longtask') || [];
    return {
      nav: nav ? { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, response: nav.responseStart, duration: nav.duration } : null,
      resourceCount: res.length,
      longTaskCount: longTasks.length,
      longTaskTotal: longTasks.reduce((sum, e) => sum + e.duration, 0),
      readyState: document.readyState,
      buttons: document.querySelectorAll('button').length,
      slots: document.querySelectorAll('.slot-button').length,
      skillNodes: document.querySelectorAll('.skill-node').length,
      title: document.title,
      time: performance.now()
    };
  });
  console.log(JSON.stringify({ metrics, logs: logs.slice(0, 200) }, null, 2));
  await browser.close();
})();
