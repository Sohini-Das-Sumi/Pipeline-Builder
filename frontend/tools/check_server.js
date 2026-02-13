const http = require('http');

const portsToTry = [3003, 3000, 3001, 3002, 5173];

function checkPort(port) {
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port, path: '/', method: 'GET', timeout: 3000 };
    const req = http.request(options, (res) => {
      resolve({ port, status: res.statusCode });
    });
    req.on('error', (e) => resolve({ port, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ port, error: 'timeout' }); });
    req.end();
  });
}

(async () => {
  for (const p of portsToTry) {
    // eslint-disable-next-line no-await-in-loop
    const r = await checkPort(p);
    if (r.status) {
      console.log(`OK port=${r.port} status=${r.status}`);
      // Fetch a small snippet of the root document to ensure HTML is returned
      http.get({ hostname: 'localhost', port: r.port, path: '/', timeout: 3000 }, (res) => {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
          if (body.length > 400) {
            console.log('BODY_SNIPPET', body.slice(0, 400).replace(/\n/g, ' '));
            process.exit(0);
          }
        });
        res.on('end', () => {
          console.log('BODY_SNIPPET', body.slice(0, 400).replace(/\n/g, ' '));
          process.exit(0);
        });
      }).on('error', (e) => { console.error('ERROR_FETCH', e.message); process.exit(2); });
    }
    console.log(`FAIL port=${r.port} error=${r.error}`);
  }
  console.error('ERROR: no responding ports found');
  process.exit(2);
})();
