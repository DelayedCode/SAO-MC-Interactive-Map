const { chromium } = require('playwright');

const base = 'http://localhost:8080';

async function profilePage(name, path, readyCheck, secondaryCheck) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const resourceMeta = [];

  await page.addInitScript(() => {
    window.__navStart = performance.now();
    window.__domContentLoaded = null;
    window.__loadEvent = null;
  });

  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      window.__domContentLoaded = performance.now() - window.__navStart;
    }, { once: true });
    window.addEventListener('load', () => {
      window.__loadEvent = performance.now() - window.__navStart;
    }, { once: true });
  });

  page.on('response', response => {
    const type = response.request().resourceType();
    if (['script', 'stylesheet', 'image', 'font', 'xhr', 'fetch'].includes(type)) {
      resourceMeta.push({
        url: response.url(),
        type,
        status: response.status(),
        size: Number(response.headers()['content-length']) || 0,
        mime: response.headers()['content-type'] || ''
      });
    }
  });

  await page.goto(`${base}${path}`, { waitUntil: 'load', timeout: 120000 });

  const ready2 = await page.waitForFunction(readyCheck, { timeout: 30000 })
    .then(() => page.evaluate(() => performance.now() - window.__navStart))
    .catch(() => null);

  const secondary = secondaryCheck
    ? await page.waitForFunction(secondaryCheck, { timeout: 30000 })
        .then(() => page.evaluate(() => performance.now() - window.__navStart))
        .catch(() => null)
    : null;

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const jsScripts = resources.filter(r => r.initiatorType === 'script');
    const cssResources = resources.filter(r => r.initiatorType === 'link' || /\.css(?:\?|$)/i.test(r.name));
    const imageResources = resources.filter(r => r.initiatorType === 'img' || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(r.name));
    const longTasks = performance.getEntriesByType('longtask') || [];
    const domNodes = document.querySelectorAll('*').length;

    return {
      dcl: window.__domContentLoaded,
      load: window.__loadEvent,
      domNodes,
      scriptCount: document.querySelectorAll('script').length,
      cssCount: cssResources.length,
      jsScriptCount: jsScripts.length,
      jsBytes: jsScripts.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0),
      cssBytes: cssResources.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0),
      imageBytes: imageResources.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0),
      jsLoadDuration: jsScripts.reduce((sum, entry) => sum + (entry.duration || 0), 0),
      longTaskCount: longTasks.length,
      longTaskTotalMs: longTasks.reduce((sum, entry) => sum + (entry.duration || 0), 0),
      totalResourceCount: resources.length,
      navigation: nav ? {
        responseStart: nav.responseStart,
        domInteractive: nav.domInteractive,
        domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd
      } : null
    };
  });

  const output = {
    name,
    path,
    firstUsable: ready2,
    secondaryUsable: secondary,
    metrics,
    scripts: resourceMeta.filter(r => r.type === 'script').map(r => ({ url: r.url.replace(/^http:\/\/localhost:8080\//, ''), size: r.size, type: r.type })),
    totalScriptBytes: resourceMeta.filter(r => r.type === 'script').reduce((sum, item) => sum + item.size, 0)
  };

  await browser.close();
  return output;
}

(async () => {
  const charBuild = await profilePage(
    'Character Build',
    '/Aincrad/Character%20Build/character-build.html',
    () => !!document.getElementById('characterClass') && document.querySelectorAll('.slot-button').length >= 14 && document.querySelectorAll('.skill-node').length > 0,
    () => !!document.querySelector('.skill-node') && !!document.getElementById('skillDetail')
  );

  const ecompendium = await profilePage(
    'Equipment',
    '/Aincrad/eCompendium/ecompendium.html?floor=floor1',
    () => !!document.getElementById('entryList') && document.querySelectorAll('.ecompendium-card').length > 0,
    () => !!document.getElementById('ecompendiumSearch') && document.querySelectorAll('.ecompendium-card').length > 0
  );

  console.log(JSON.stringify({ charBuild, ecompendium }, null, 2));
})();
