const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  // Determine content type
  let contentType = 'text/html';
  if (req.url.endsWith('.js')) contentType = 'application/javascript';
  else if (req.url.endsWith('.css')) contentType = 'text/css';
  else if (req.url.endsWith('.json')) contentType = 'application/json';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
