#!/usr/bin/env node
/* Generates skema-raleigh-fall-2026.ics from the EVENTS array in app.js,
   so the calendar file can never drift from the page. Run: npm run build:ics */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const m = src.match(/const EVENTS = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('Could not find the EVENTS array in app.js');
const EVENTS = eval(m[1]); // eslint-disable-line no-eval -- our own source file

const PRODID = '-//SKEMA Entrepreneurs Raleigh//Fall 2026//EN';
const STAMP = '20260829T120000Z';
const URL_BASE = 'https://skema-raleigh-production.up.railway.app';

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
const plain = d => d.replace(/-/g, '');

function nextDay(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

const lines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:' + PRODID,
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:SKEMA Entrepreneurs · Raleigh — Fall 2026',
  'X-WR-TIMEZONE:America/New_York',
];

for (const e of EVENTS) {
  const ics = e.ics || { allDay: true };
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${plain(e.date)}-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@skema-raleigh`);
  lines.push('DTSTAMP:' + STAMP);
  if (ics.allDay) {
    lines.push('DTSTART;VALUE=DATE:' + plain(e.date));
    lines.push('DTEND;VALUE=DATE:' + nextDay(e.date));
  } else {
    lines.push('DTSTART:' + ics.start);
    lines.push('DTEND:' + ics.end);
  }
  lines.push(fold('SUMMARY:' + esc(e.name + ' — SKEMA Entrepreneurs Raleigh')));
  lines.push(fold('DESCRIPTION:' + esc(e.desc + (ics.allDay ? ' (Time announced soon.)' : '')) + '\\n\\n' + URL_BASE));
  lines.push(fold('LOCATION:' + esc(e.where + ', Centennial Campus, Raleigh, NC')));
  lines.push('URL:' + URL_BASE);
  lines.push('END:VEVENT');
}

lines.push('END:VCALENDAR');

const out = path.join(root, 'skema-raleigh-fall-2026.ics');
fs.writeFileSync(out, lines.join('\r\n') + '\r\n');
console.log(`Wrote ${path.basename(out)} — ${EVENTS.length} events`);
