#!/usr/bin/env node
/* Generates skema-raleigh-fall-2026.ics from the EVENTS array in app.js,
   so the calendar file can never drift from the page. Run: npm run build:ics */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

/* Evaluate everything from LINKS through the merged EVENTS list, so recurring
   series expand exactly the same way here as they do in the browser. */
const block = src.slice(src.indexOf('const LINKS'), src.indexOf('const MONTHS'));
// eslint-disable-next-line no-eval -- our own source file
const EVENTS = eval(block + '; EVENTS');

const PRODID = '-//SKEMA Entrepreneurs Raleigh//Fall 2026//EN';
const STAMP = '20260829T120000Z';
const URL_BASE = 'https://www.skemaraleigh.com';

const utc = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function fold(line) {
  // RFC 5545: octet-count lines at 75, continuation lines start with a space
  const out = [];
  let s = line;
  while (Buffer.byteLength(s) > 75) {
    let cut = 75;
    while (Buffer.byteLength(s.slice(0, cut)) > 75) cut--;
    out.push(s.slice(0, cut));
    s = ' ' + s.slice(cut);
  }
  out.push(s);
  return out.join('\r\n');
}

const esc = t => String(t).replace(/[\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');

const lines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:' + PRODID,
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:SKEMA Entrepreneurs · Raleigh · Fall 2026',
  'X-WR-TIMEZONE:America/New_York',
];

for (const e of EVENTS) {
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${e.date.replace(/-/g, '')}-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@skema-raleigh`);
  lines.push('DTSTAMP:' + STAMP);
  lines.push('DTSTART:' + utc(e.start));
  lines.push('DTEND:' + utc(e.end || e.start));
  lines.push(fold('SUMMARY:' + esc(e.name + ' · SKEMA Entrepreneurs Raleigh')));
  // descriptions may contain a link for the modal; .ics wants plain text
  const plainDesc = e.desc
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, '$2: $1')
    .replace(/<[^>]+>/g, '');
  lines.push(fold('DESCRIPTION:' + esc(plainDesc) + '\\n\\n' + URL_BASE));
  lines.push(fold('LOCATION:' + esc(e.where + ', ' + e.address)));
  lines.push('URL:' + URL_BASE);
  lines.push('END:VEVENT');
}

lines.push('END:VCALENDAR');

const out = path.join(root, 'skema-raleigh-fall-2026.ics');
fs.writeFileSync(out, lines.join('\r\n') + '\r\n');
console.log(`Wrote ${path.basename(out)} — ${EVENTS.length} events`);
