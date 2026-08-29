/* Zero-dependency static file server. Railway sets PORT; default 3000 locally. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.ics':  'text/calendar; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

const MEDIA = new Set(['.png', '.jpg', '.svg', '.ico']);

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (pathname === '/') pathname = '/index.html';

  // resolve inside ROOT only — blocks ../ traversal
  const file = path.join(ROOT, path.normalize(pathname));
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(file, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p><a href="/">SKEMA Entrepreneurs &middot; Raleigh</a></p>');
      return;
    }

    const ext = path.extname(file).toLowerCase();
    // filenames are not content-hashed, so markup and logic must revalidate on
    // every load — otherwise a deploy ships behind a stale browser cache
    const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag }).end();
      return;
    }

    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(500).end('Server error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': MEDIA.has(ext) ? 'public, max-age=86400' : 'no-cache',
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(buf);
    });
  });
});

server.listen(PORT, () => console.log(`SKEMA Raleigh listening on ${PORT}`));
