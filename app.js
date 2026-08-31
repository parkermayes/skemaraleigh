/* =============================================================================
   SKEMA Entrepreneurs · Raleigh — Fall 2026
   Single source of truth for the semester. Edit EVENTS and the month grid, the
   list, the live countdown and the event modal all follow.
   (Re-run `npm run build:ics` after changing dates to refresh the .ics file.)

   `start` / `end` carry an explicit America/New_York offset — -04:00 during EDT,
   -05:00 after DST ends on Nov 1 2026 — so the countdown is correct for a viewer
   in any timezone.
   ============================================================================= */

const LINKS = {
  club:        'https://forms.cloud.microsoft/e/FC6SxfznNm',
  accelerator: 'https://airtable.com/appNrxLoRfolsKUep/pag6OT126BZwe6Pf0/form',
  list:        'https://forms.cloud.microsoft/e/wnPZEM1FtH',
};

const ONE_OFFS = [
  {
    date: '2026-08-25',
    start: '2026-08-25T17:30:00-04:00',
    end:   '2026-08-25T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Launch Night',
    track: 'club',
    desc: 'Kickoff for the whole campus. A local founder keynotes, the semester calendar is unveiled, and applications open.',
    where: 'Venture II, Room 144',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Join the Club', href: LINKS.club },
  },
  {
    date: '2026-08-28',
    start: '2026-08-28T13:00:00-04:00',
    end:   '2026-08-28T14:00:00-04:00',
    time: '1:00 to 2:00 PM',
    name: 'Club Meetup',
    track: 'club',
    desc: 'First working meetup of the semester. Open roles discussed, event planning starts.',
    where: 'Venture II, AI Lab',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Apply Now', href: LINKS.club },
  },
  {
    date: '2026-09-01',
    start: '2026-09-01T11:30:00-04:00',
    end:   '2026-09-01T12:30:00-04:00',
    time: '11:30 AM to 12:30 PM',
    name: 'Accelerator Interest Session',
    track: 'accelerator',
    desc: 'Everything about the 12-week accelerator, answered in the room. Bring the questions you have not asked yet.',
    where: 'Venture II, AI Lab',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Apply Now', href: LINKS.accelerator },
  },
  {
    date: '2026-09-01',
    start: '2026-09-01T23:59:00-04:00',
    end:   '2026-09-01T23:59:59-04:00',
    time: 'Closes 11:59 PM',
    name: 'Club Leadership Application Deadline',
    track: 'club',
    inBanner: false,
    desc: 'Last day to apply for one of the six open club leadership roles: President, Vice President, Events, Marketing, Partnerships and Community. No experience required for any of them. <a href="' + LINKS.club + '" target="_blank" rel="noopener">Apply here</a>.',
    where: 'Online',
    address: 'Applications are submitted online',
    cta: { label: 'Apply Now', href: LINKS.club },
  },
  {
    date: '2026-09-07',
    start: '2026-09-07T23:59:00-04:00',
    end:   '2026-09-07T23:59:59-04:00',
    time: 'Closes 11:59 PM',
    name: 'Accelerator Application Deadline',
    track: 'accelerator',
    inBanner: false,
    desc: 'Last day to apply for the Fall 2026 accelerator cohort. Applications close at 11:59 PM and the cohort is selected the following week. <a href="' + LINKS.accelerator + '" target="_blank" rel="noopener">Apply here</a>.',
    where: 'Online',
    address: 'Applications are submitted online',
    cta: { label: 'Apply Now', href: LINKS.accelerator },
  },
  {
    date: '2026-09-23',
    start: '2026-09-23T17:30:00-04:00',
    end:   '2026-09-23T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Pitch Night',
    track: 'club',
    desc: 'Campus-wide competition with invited students from partner Raleigh colleges. Local founders judge. Real cash prizes.',
    where: 'Venture II, Room 144',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Get Details', href: LINKS.list },
  },
  {
    date: '2026-10-27',
    start: '2026-10-27T17:30:00-04:00',
    end:   '2026-10-27T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Ecosystem Night',
    track: 'club',
    desc: 'An evening with working founders at Raleigh Founded, walkable from campus. See real early-stage companies operating.',
    where: 'Raleigh Founded, main classroom on the left as you walk in',
    address: '1017 Main Campus Dr, Suite 1650 (Partners I), Raleigh, NC 27606',
    cta: { label: 'Get Details', href: LINKS.list },
  },
  {
    date: '2026-11-19',
    start: '2026-11-19T17:30:00-05:00',
    end:   '2026-11-19T19:30:00-05:00',
    time: '5:30 PM',
    name: 'Demo Day & Showcase',
    track: 'accelerator',
    desc: 'The capstone. Every accelerator venture presents real traction, streamed live to every SKEMA campus.',
    where: 'Hunt Library, room TBD',
    address: '1070 Partners Way, Raleigh, NC 27606',
    cta: { label: 'Get Details', href: LINKS.list },
  },
];

/* --------------------------------------------------------------------------
   Recurring series. `every` is in weeks; `skip` drops individual dates.
   DST: America/New_York is -04:00 until Nov 1 2026, -05:00 after.
   -------------------------------------------------------------------------- */
const offsetFor = iso => (iso < '2026-11-01' ? '-04:00' : '-05:00');

function series({ first, every, until, skip = [], startTime, endTime, ...rest }) {
  const out = [];
  const stop = new Date(until + 'T12:00:00');
  for (let d = new Date(first + 'T12:00:00'); d <= stop; d.setDate(d.getDate() + every * 7)) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (skip.includes(iso)) continue;
    out.push({
      ...rest,
      date: iso,
      start: `${iso}T${startTime}:00${offsetFor(iso)}`,
      end: `${iso}T${endTime}:00${offsetFor(iso)}`,
    });
  }
  return out;
}

/* Club meets every other Thursday, 11:30 to 12:20, through November.
   Nov 26 is Thanksgiving, so it is skipped. */
const CLUB_MEETINGS = series({
  first: '2026-09-03',
  every: 2,
  until: '2026-11-30',
  skip: ['2026-11-26'],
  startTime: '11:30',
  endTime: '12:20',
  time: '11:30 AM to 12:20 PM',
  name: 'Club Meetup',
  desc: 'Open working meeting for the Entrepreneurship Club. Planning the next event, role updates, and whatever the room needs. Anyone can walk in.',
  where: 'Venture II, Room 144',
  address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
  track: 'club',
  cta: { label: 'Join the Club', href: LINKS.club },
});

/* Accelerator cohort works every Tuesday, 11:30 to 12:20, Sep 15 through Nov 24. */
const ACCELERATOR_SESSIONS = series({
  first: '2026-09-15',
  every: 1,
  until: '2026-11-24',
  startTime: '11:30',
  endTime: '12:20',
  time: '11:30 AM to 12:20 PM',
  name: 'Accelerator Session',
  desc: 'Weekly working session for the cohort. Real-time coaching on live problems: first customers, pricing, US market entry. Never lecture-style.',
  where: 'Venture I, Room 106',
  address: 'Venture I, Centennial Campus, Raleigh, NC 27606',
  track: 'accelerator',
  cta: { label: 'Apply Now', href: LINKS.accelerator },
});

/* Triangle Startup Collective, co-hosted by Parker Mayes at Raleigh Founded on
   North Street. A community event rather than SKEMA programming, so it sits on
   the calendar but is kept out of the next-up banner. */
const STARTUP_COLLECTIVE = ['2026-09-14', '2026-10-05', '2026-11-09'].map(date => ({
  date,
  start: `${date}T18:00:00${offsetFor(date)}`,
  end:   `${date}T20:00:00${offsetFor(date)}`,
  time: '6:00 to 8:00 PM',
  name: 'Triangle Startup Collective',
  desc: 'Downtown Raleigh meetup where 50+ founders, operators and investors trade real stories from the early days. Guests share short, raw lessons, then entrepreneurs in the room take the hot seat with live questions about their own company and get direct answers. Food and drinks provided, 100 seats. Co-hosted by Parker Mayes.',
  where: 'Raleigh Founded, North Street',
  address: '509 W North St, Suite 224, Raleigh, NC 27603',
  track: 'club',
  inBanner: false,
  cta: { label: 'RSVP on Meetup', href: 'https://www.meetup.com/triangle-startup-collective/' },
}));

const EVENTS = [...ONE_OFFS, ...CLUB_MEETINGS, ...ACCELERATOR_SESSIONS, ...STARTUP_COLLECTIVE]
  .sort((a, b) => new Date(a.start) - new Date(b.start));

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* The grid only spans the live semester — September through November 2026.
   Extend RANGE when spring dates exist. */
const RANGE = { from: { y: 2026, m: 8 }, to: { y: 2026, m: 10 } }; // m is 0-indexed
const monthIndex = (y, m) => y * 12 + m;
const RANGE_MIN = monthIndex(RANGE.from.y, RANGE.from.m);
const RANGE_MAX = monthIndex(RANGE.to.y, RANGE.to.m);
const clampMonth = i => Math.min(RANGE_MAX, Math.max(RANGE_MIN, i));

/* Calendar dates are parsed at local noon so the day never shifts by timezone.
   Countdown math uses `start`, which carries a real offset. */
const parseDay = iso => { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d, 12); };
const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const eventsOn = iso => EVENTS.filter(e => e.date === iso);
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* the next event that has not finished yet, overall or within one track */
function nextEvent(track) {
  const now = Date.now();
  return EVENTS.find(e =>
    e.inBanner !== false &&
    (!track || e.track === track) &&
    new Date(e.end || e.start).getTime() > now) || null;
}

const TRACKS = [
  { key: 'accelerator', label: 'Next up · Accelerator' },
  { key: 'club',        label: 'Next up · Club' },
];

/* ============================================================ live countdown */
let countdownTimer = null;

function segments(msLeft) {
  let sec = Math.floor(msLeft / 1000);
  const days = Math.floor(sec / 86400); sec -= days * 86400;
  const hrs  = Math.floor(sec / 3600);  sec -= hrs * 3600;
  const mins = Math.floor(sec / 60);    sec -= mins * 60;
  return [[days,'days'],[hrs,'hrs'],[mins,'min'],[sec,'sec']]
    .map(([v,l]) => `<span class="seg"><b>${String(v).padStart(2,'0')}</b><i>${l}</i></span>`)
    .join('');
}

function renderCountdowns() {
  const host = document.getElementById('nextup');
  if (!host) return;

  const live = TRACKS.map(t => ({ ...t, ev: nextEvent(t.key) }));

  host.innerHTML = live.map(({ key, label, ev }) => {
    if (!ev) {
      return `<div class="nu-col" data-track="${key}">
          <span class="tag">${label}</span>
          <span class="what">Nothing left this semester</span>
          <span class="when">Spring dates announced soon. Join the list to get them first.</span>
        </div>`;
    }
    const d = parseDay(ev.date);
    return `<div class="nu-col" data-track="${key}">
        <span class="tag">${label}</span>
        <span class="what">${ev.name}</span>
        <span class="when">${DAYS[d.getDay()]}, ${MON_SHORT[d.getMonth()]} ${d.getDate()} · ${ev.time} · ${ev.where}</span>
        <span class="cd" data-start="${new Date(ev.start).getTime()}" data-end="${new Date(ev.end || ev.start).getTime()}"></span>
      </div>`;
  }).join('');

  if (countdownTimer) clearInterval(countdownTimer);

  function tick() {
    const now = Date.now();
    let rolled = false;

    host.querySelectorAll('.cd').forEach(el => {
      const startMs = Number(el.dataset.start);
      const endMs = Number(el.dataset.end);

      if (now >= endMs) { rolled = true; return; }        // event finished — rebuild
      if (now >= startMs) {
        el.classList.add('is-live');
        el.innerHTML = '<span class="livenow">Happening now</span>';
        return;
      }
      el.classList.remove('is-live');
      el.innerHTML = segments(startMs - now);
    });

    if (rolled) renderCountdowns();
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ============================================================== month grid */
let viewYear, viewMonth;

function renderGrid() {
  const grid = document.getElementById('grid');
  const label = document.getElementById('monthLabel');
  if (!grid || !label) return;

  label.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

  const first = new Date(viewYear, viewMonth, 1);
  const lead = first.getDay();                             // blanks before the 1st
  const total = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = startOfToday();
  const todayIso = isoOf(today);

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<div class="cell is-empty"></div>');

  for (let day = 1; day <= total; day++) {
    const date = new Date(viewYear, viewMonth, day, 12);
    const iso = isoOf(date);
    const evs = eventsOn(iso);
    const isPast = date < today;
    const upcoming = evs.some(e => new Date(e.end || e.start) >= new Date());
    const cls = ['cell',
      upcoming ? 'has-ev' : '',
      evs.length && !upcoming ? 'has-ev-done' : '',
      isPast ? 'is-past' : '',
      iso === todayIso ? 'is-today' : ''].filter(Boolean).join(' ');

    // grey per event, keyed on its end time, so a morning event dims that afternoon
    const chips = evs.map(e => {
      const done = new Date(e.end || e.start) < new Date();
      return `<button class="chip${done ? ' is-done' : ''}" data-date="${e.date}" data-name="${e.name}">${e.name}</button>`;
    }).join('');

    cells.push(`<div class="${cls}"><span class="num">${day}</span>${chips}</div>`);
  }

  // pad the last row so the grid keeps its rectangle
  while (cells.length % 7) cells.push('<div class="cell is-empty"></div>');

  grid.innerHTML = cells.join('');
  grid.querySelectorAll('.chip').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.date, btn.dataset.name)));

  const here = monthIndex(viewYear, viewMonth);
  document.getElementById('prevMonth').disabled = here <= RANGE_MIN;
  document.getElementById('nextMonth').disabled = here >= RANGE_MAX;
}

function shiftMonth(delta) {
  const target = clampMonth(monthIndex(viewYear, viewMonth) + delta);
  viewYear = Math.floor(target / 12);
  viewMonth = target % 12;
  renderGrid();
}

/* =================================================================== modal */
let lastFocused = null;

function openModal(dateIso, name) {
  const ev = EVENTS.find(e => e.date === dateIso && e.name === name);
  if (!ev) return;

  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  const d = parseDay(ev.date);
  const isPast = new Date(ev.end || ev.start) < new Date();

  body.innerHTML = `
    <p class="m-kicker">${isPast ? 'This one has happened' : 'Upcoming'}</p>
    <h3 id="modalTitle">${ev.name}</h3>
    <dl class="m-meta">
      <div><dt>When</dt><dd>${DAYS_FULL[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}<br>${ev.time}</dd></div>
      <div><dt>Where</dt><dd>${ev.where}<br><span class="addr">${ev.address}</span></dd></div>
    </dl>
    <p class="m-desc">${ev.desc}</p>
    ${isPast ? '' : `<div class="m-cta">
      <a class="btn btn--red" href="${ev.cta.href}" target="_blank" rel="noopener">${ev.cta.label} <span class="arw" aria-hidden="true">&rarr;</span></a>
    </div>`}`;

  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.m-close').focus();
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

/* ==================================================================== tabs */
function initTabs() {
  const tabs = Array.from(document.querySelectorAll('.switch [role="tab"]'));
  if (!tabs.length) return;

  function select(key, focus) {
    tabs.forEach(tab => {
      const on = tab.dataset.panel === key;
      tab.setAttribute('aria-selected', String(on));
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && focus) tab.focus();
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.panel)));
  tabs.forEach((tab, i) => tab.addEventListener('keydown', ev => {
    if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
    ev.preventDefault();
    const next = tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    select(next.dataset.panel, true);
  }));

  document.querySelectorAll('[data-open]').forEach(link =>
    link.addEventListener('click', () => select(link.dataset.open)));

  if (location.hash === '#accelerator') select('accelerator');
}

/* ==================================================================== init */
document.addEventListener('DOMContentLoaded', () => {
  // Open on the current month whenever the semester is running, so October
  // lands on October even if the next event is not until November. Before or
  // after the semester it clamps to the nearest month in range. Earlier months
  // stay reachable with the arrows, and past events stay clickable.
  const now = new Date();
  const opening = clampMonth(monthIndex(now.getFullYear(), now.getMonth()));
  viewYear = Math.floor(opening / 12);
  viewMonth = opening % 12;

  renderCountdowns();
  renderGrid();
  initTabs();

  document.getElementById('prevMonth')?.addEventListener('click', () => shiftMonth(-1));
  document.getElementById('nextMonth')?.addEventListener('click', () => shiftMonth(1));

  const modal = document.getElementById('modal');
  modal?.querySelector('.m-close')?.addEventListener('click', closeModal);
  modal?.querySelector('.m-backdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
