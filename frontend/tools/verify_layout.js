// Puppeteer script to auto-select nodes and capture their positions.
// Requires: `npm install puppeteer` in the frontend folder.
// Run: `node tools/verify_layout.js`

const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:3000';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

  console.log('Opening', url);

  // Load the page first, then create nodes by clicking the toolbar buttons.
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => { console.error('goto error', e.message); process.exit(2); });

  // Wait for the toolbar to be available
  await page.waitForSelector('.toolbar-container', { timeout: 10000 }).catch(e => { console.error('toolbar not found', e.message); process.exit(2); });

  // Click the Calculator button (toolbar children order: Input, Text, LLM, ..., Calculator)
  // Calculator is the last button in the toolbar
  await page.evaluate(() => {
    const toolbar = document.querySelector('.toolbar-container');
    if (!toolbar || !toolbar.children || toolbar.children.length < 11) return false;
    const calcBtn = toolbar.children[toolbar.children.length - 1]; // Last button is Calculator
    calcBtn.click();
    return true;
  });

  // Wait for nodes to appear after clicking toolbar
  await page.waitForSelector('.node-container', { timeout: 10000 }).catch(e => { console.error('nodes not found after toolbar clicks', e.message); process.exit(2); });

  // Wait for nodes to appear
  await page.waitForSelector('.node-container', { timeout: 10000 }).catch(e => { console.error('nodes not found', e.message); process.exit(2); });

  // Re-query fresh node handles after UI updates to avoid detached elements
  const nodeHandles = await page.$$('.node-container');
  console.log('Found nodes:', nodeHandles.length);
  const clickCount = Math.min(3, nodeHandles.length); // Test multiple node selection

  // Select multiple nodes by calling the store's onSelectionChange function
  await page.evaluate(async (count) => {
    // Wait for the store to be available
    let attempts = 0;
    while (!window.store && attempts < 10) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (!window.store) {
      console.log('Store not available');
      return;
    }
    // Get node IDs from the store
    const nodes = window.store.nodes;
    const nodeIds = nodes.slice(0, count).map(n => n.id);
    console.log('Selecting nodes:', nodeIds);
    // Select multiple nodes at once
    const elements = { nodes: nodeIds.map(id => ({ id })), edges: [] };
    window.store.onSelectionChange(elements);
  }, clickCount);

  await new Promise(r => setTimeout(r, 800));

  // Gather positions and display flags
  const nodes = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.node-container'));
    return els.map(el => {
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentCs = parent ? window.getComputedStyle(parent) : null;
      const vp = document.querySelector('.react-flow__viewport');
      const vpTransform = vp ? window.getComputedStyle(vp).transform : 'none';
      const flowRoot = document.querySelector('.react-flow');
      const flowRect = flowRoot ? flowRoot.getBoundingClientRect() : { left: 0, top: 0 };
      return {
        id: el.getAttribute('data-id') || el.getAttribute('id') || el.dataset.nodeId || el.querySelector('span')?.textContent?.trim() || 'unknown',
        displayOpen: el.getAttribute('data-display-open'),
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        computedStyle: {
          width: cs.width,
          maxWidth: cs.maxWidth,
          transform: cs.transform,
          display: cs.display
        },
        parentComputed: parentCs ? { width: parentCs.width, transform: parentCs.transform } : null,
        viewportTransform: vpTransform,
        flowRect
      };
    });
  });

  console.log('Nodes state after selection:');
  nodes.forEach(n => console.log(JSON.stringify(n)));

  // Also print any arrange logs from the page
  const arrangeLogs = await page.evaluate(() => window.__arrangeLogs || []);
  console.log('Arrange logs (last 5):', arrangeLogs.slice(-5));

  await browser.close();
})();
