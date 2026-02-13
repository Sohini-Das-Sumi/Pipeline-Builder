const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function tryPorts(ports) {
  for (const port of ports) {
    const url = `http://localhost:${port}`;
    try {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);
      console.log('Opening', url);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Ensure toolbar is present and click the Node Manager button to add a manager node
      try {
        await page.waitForSelector('.toolbar-container', { timeout: 5000 });
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('.toolbar-container div'));
          const btn = buttons.find(b => (b.innerText || '').trim().includes('Node Manager'));
          if (btn) btn.click();
        });
      } catch (e) {
        // toolbar not found, continue and hope node exists
      }

      // Wait for any node to appear (if not found, fall back to full-page screenshot)
      let nodePresent = true;
      try {
        await page.waitForSelector('.node-container', { timeout: 10000 });
      } catch (e) {
        nodePresent = false;
      }

      if (!nodePresent) {
        const fallbackPath = path.resolve(__dirname, 'no-node-found-full.png');
        await page.screenshot({ path: fallbackPath, fullPage: true });
        console.log('No node found; full page screenshot saved to', fallbackPath);
        await browser.close();
        return false;
      }

      // Find the Custom Node Manager node by title text
      const nodeHandle = await page.evaluateHandle(() => {
        const nodes = Array.from(document.querySelectorAll('.node-container'));
        for (const n of nodes) {
          const titleEl = n.querySelector('span');
          if (titleEl && titleEl.innerText && titleEl.innerText.includes('Custom Node Manager')) {
            return n;
          }
        }
        return null;
      });

      const node = nodeHandle.asElement ? nodeHandle.asElement() : null;
      if (!node) {
        console.log('Custom Node Manager node not found on', url);
        await browser.close();
        continue;
      }

      // Try to click the closed view button if present
      const clicked = await page.evaluate((node) => {
        try {
          const btn = node.querySelector('button');
          if (btn && /Click to manage custom nodes/i.test(btn.innerText || '')) {
            btn.click();
            return true;
          }
          // If no closed button, try header open (span text)
          const headerBtn = node.querySelector('div > button');
          if (headerBtn) {
            headerBtn.click();
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      }, node);

      if (!clicked) {
        console.log('Could not find a clickable open button inside the node; attempting to click the node container');
        await node.click();
      }

      // Wait for display open attribute on node (data-display-open="true")
      await page.waitForFunction((title) => {
        const nodes = Array.from(document.querySelectorAll('.node-container'));
        for (const n of nodes) {
          const span = n.querySelector('span');
          if (span && span.innerText && span.innerText.includes(title)) {
            return n.getAttribute('data-display-open') === 'true';
          }
        }
        return false;
      }, { timeout: 5000 }, 'Custom Node Manager');

      // Re-query node element to get bounding box
      const boundingBox = await node.boundingBox();
      const screenshotPath = path.resolve(__dirname, 'custom-node-manager-open.png');
      if (boundingBox) {
        await page.screenshot({ path: screenshotPath, clip: {
          x: Math.max(0, Math.floor(boundingBox.x)),
          y: Math.max(0, Math.floor(boundingBox.y)),
          width: Math.min(Math.floor(boundingBox.width), 2000),
          height: Math.min(Math.floor(boundingBox.height), 2000)
        }});
        console.log('Screenshot saved to', screenshotPath);
      } else {
        // Fallback to full page screenshot
        const fallbackPath = path.resolve(__dirname, 'custom-node-manager-open-full.png');
        await page.screenshot({ path: fallbackPath, fullPage: true });
        console.log('Bounding box not available; full page screenshot saved to', fallbackPath);
      }

      await browser.close();
      return true;
    } catch (err) {
      console.error(`Error accessing ${url}:`, err.message || err);
      // try next port
    }
  }
  return false;
}

(async () => {
  const arg = process.argv[2];
  let ports = [3000, 3002];
  if (arg) {
    try {
      ports = arg.split(',').map(p => parseInt(p, 10)).filter(n => !isNaN(n));
    } catch (e) {
      // ignore
    }
  }
  const success = await tryPorts(ports);
  process.exit(success ? 0 : 2);
})();
