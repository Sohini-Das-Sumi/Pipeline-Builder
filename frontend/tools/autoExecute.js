const puppeteer = require('puppeteer');

async function tryPorts(ports) {
  for (const port of ports) {
    const url = `http://localhost:${port}`;
    try {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);
      console.log('Opening', url);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for the main button or the submit container
      // Wait for body to ensure page has loaded
      await page.waitForSelector('body', { timeout: 10000 });

      // If input exists, fill it
      const hasInput = await page.$('#pipeline-input');
      if (hasInput) {
        await page.evaluate(() => {
          const inp = document.getElementById('pipeline-input');
          if (inp) { inp.value = 'Automated input from puppeteer'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        });
      }

      // Instrument window.fetch to capture any /api/llm responses
      await page.evaluate(() => {
        try {
          if (!window.__originalFetch) {
            window.__originalFetch = window.fetch.bind(window);
            window.__llmResp = null;
            window.fetch = async function(...args) {
              const res = await window.__originalFetch(...args);
              try {
                const url = args[0] && (typeof args[0] === 'string' ? args[0] : args[0].url);
                if (url && url.includes('/api/llm')) {
                  try {
                    const clone = res.clone();
                    window.__llmResp = await clone.json().catch(() => null);
                  } catch (e) {
                    // ignore
                  }
                }
              } catch (e) {
                // ignore
              }
              return res;
            };
          }
        } catch (e) {
          // ignore
        }
      });

      // Click the Execute Pipeline button by text
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => /Execute Pipeline/i.test(b.innerText));
        if (btn) { btn.click(); return true; }
        return false;
      });

      if (!clicked) {
        console.log('Execute button not found on', url);
        await browser.close();
        continue;
      }

      console.log('Clicked execute; waiting for result...');
      // Wait for status span to show (max 15s)
      try {
        await page.waitForFunction(() => {
          const spans = Array.from(document.querySelectorAll('span'));
          return spans.some(s => /Pipeline executed successfully|Error:/i.test(s.innerText));
        }, { timeout: 15000 });

        const status = await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll('span'));
          const s = spans.find(s => /Pipeline executed successfully|Error:/i.test(s.innerText));
          return s ? s.innerText : null;
        });

        console.log('Execution status:', status);
      // Try to read captured response from page's fetch wrapper
      try {
        const pageResp = await page.evaluate(() => window.__llmResp);
        if (pageResp) {
          console.log('Captured /api/llm response via fetch wrapper:', JSON.stringify(pageResp, null, 2));
        } else {
          console.log('No /api/llm response captured via fetch wrapper.');
        }
      } catch (e) {
        console.log('Error reading fetch wrapper response:', e && e.message ? e.message : e);
      }
      } catch (e) {
        console.log('No visible result after clicking execute.');
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
  const success = await tryPorts([3000, 3002]);
  if (!success) process.exit(2);
  process.exit(0);
})();
