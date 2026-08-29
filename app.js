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
  accelerator: 'https://forms.cloud.microsoft/e/5mdwPGDtFc',
  list:        'https://forms.cloud.microsoft/e/wnPZEM1FtH',
};

const EVENTS = [
  {
    date: '2026-08-25',
    start: '2026-08-25T17:30:00-04:00',
    end:   '2026-08-25T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Launch Night',
    desc: 'Kickoff for the whole campus. A local founder keynotes, the semester calendar is unveiled, and applications open.',
    where: 'Venture II, Room 144',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Join the club', href: LINKS.club },
  },
  {
    date: '2026-08-28',
    start: '2026-08-28T13:00:00-04:00',
    end:   '2026-08-28T14:00:00-04:00',
    time: '1:00 – 2:00 PM',
    name: 'Club Meetup',
    desc: 'First working meetup of the semester. Open roles discussed, event planning starts.',
    where: 'Venture II, AI Lab',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Apply for a role', href: LINKS.club },
  },
  {
    date: '2026-09-01',
    start: '2026-09-01T11:30:00-04:00',
    end:   '2026-09-01T12:30:00-04:00',
    time: '11:30 AM – 12:30 PM',
    name: 'Accelerator Interest Session',
    desc: 'Everything about the 12-week accelerator, answered in the room. Bring the questions you have not asked yet.',
    where: 'Venture II, AI Lab',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Apply to the accelerator', href: LINKS.accelerator },
  },
  {
    date: '2026-09-22',
    start: '2026-09-22T17:30:00-04:00',
    end:   '2026-09-22T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Pitch Night',
    desc: 'Campus-wide competition with invited students from partner Raleigh colleges. Local founders judge. Real cash prizes.',
    where: 'Venture II, Room 144',
    address: 'Venture II, Centennial Campus, Raleigh, NC 27606',
    cta: { label: 'Get the details', href: LINKS.list },
  },
  {
    date: '2026-10-27',
    start: '2026-10-27T17:30:00-04:00',
    end:   '2026-10-27T19:30:00-04:00',
    time: '5:30 PM',
    name: 'Ecosystem Night',
    desc: 'An evening with working founders at Raleigh Founded — walkable from campus. See real early-stage companies operating.',
    where: 'Raleigh Founded — main classroom, left as you walk in',
    address: '1017 Main Campus Dr, Suite 1650 (Partners I), Raleigh, NC 27606',
    cta: { label: 'Get the details', href: LINKS.list },
  },
  {
    date: '2026-11-17',
    start: '2026-11-17T17:30:00-05:00',
    end:   '2026-11-17T19:30:00-05:00',
    time: '5:30 PM',
    name: 'Demo Day & Showcase',
    desc: 'The capstone. Every accelerator venture presents real traction, streamed live to every SKEMA campus.',
    where: 'Hunt Library — room TBD',
    address: '1070 Partners Way, Raleigh, NC 27606',
    cta: { label: 'Get the details', href: LINKS.list },
  },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* Calendar dates are parsed at local noon so the day never shifts by timezone.
   Countdown math uses `start`, which carries a real offset. */
const parseDay = iso => { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d, 12); };
const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const eventsOn = iso => EVENTS.filter(e => e.date === iso);
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* the next event that has not finished yet */
function nextEvent() {
  const now = Date.now();
  return EVENTS.find(e => new Date(e.end || e.start).getTime() > now) || null;
}

/* ============================================================ live countdown */
let countdownTimer = null;

function renderCountdown() {
  const ev = nextEvent();
  const nameEl = document.getElementById('nextName');
  const whenEl = document.getElementById('nextWhen');
  const cdEl   = document.getElementById('cd');
  if (!nameEl || !whenEl || !cdEl) return;

  if (!ev) {
    nameEl.textContent = 'That’s the semester.';
    whenEl.textContent = 'Spring dates announced soon — join the list to get them first.';
    cdEl.hidden = true;
    if (countdownTimer) clearInterval(countdownTimer);
    return;
  }

  const d = parseDay(ev.date);
  nameEl.textContent = ev.name;
  whenEl.textContent = `${DAYS[d.getDay()]}, ${MON_SHORT[d.getMonth()]} ${d.getDate()} · ${ev.time} · ${ev.where}`;

  const startMs = new Date(ev.start).getTime();
  const endMs = new Date(ev.end || ev.start).getTime();

  function tick() {
    const now = Date.now();

    // event is running right now
    if (now >= startMs) {
      cdEl.classList.add('is-live');
      cdEl.innerHTML = '<span class="livenow">Happening now</span>';
      if (now >= endMs) { clearInterval(countdownTimer); renderCountdown(); } // roll to the next one
      return;
    }

    let s = Math.floor((startMs - now) / 1000);
    const days = Math.floor(s / 86400); s -= days * 86400;
    const hrs  = Math.floor(s / 3600);  s -= hrs * 3600;
    const mins = Math.floor(s / 60);    s -= mins * 60;

    cdEl.innerHTML = [[days,'days'],[hrs,'hrs'],[mins,'min'],[s,'sec']]
      .map(([v,l]) => `<span class="seg"><b>${String(v).padStart(2,'0')}</b><i>${l}</i></span>`)
      .join('');
  }

  cdEl.hidden = false;
  cdEl.classList.remove('is-live');
  if (countdownTimer) clearInterval(countdownTimer);
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
    const cls = ['cell',
      evs.length ? 'has-ev' : '',
      isPast ? 'is-past' : '',
      iso === todayIso ? 'is-today' : ''].filter(Boolean).join(' ');

    const chips = evs.map(e =>
      `<button class="chip" data-date="${e.date}" data-name="${e.name}">${e.name}</button>`
    ).join('');

    cells.push(`<div class="${cls}"><span class="num">${day}</span>${chips}</div>`);
  }

  // pad the last row so the grid keeps its rectangle
  while (cells.length % 7) cells.push('<div class="cell is-empty"></div>');

  grid.innerHTML = cells.join('');
  grid.querySelectorAll('.chip').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.date, btn.dataset.name)));
}

function shiftMonth(delta) {
  const d = new Date(viewYear, viewMonth + delta, 1);
  viewYear = d.getFullYear();
  viewMonth = d.getMonth();
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
    <div class="m-cta">
      ${isPast ? '' : `<a class="btn btn--red" href="${ev.cta.href}" target="_blank" rel="noopener">${ev.cta.label} <span class="arw" aria-hidden="true">&rarr;</span></a>`}
      <a class="btn btn--ghost" href="skema-raleigh-fall-2026.ics" download>Add to calendar</a>
    </div>`;

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

/* ============================================================== list below */
function renderList() {
  const host = document.getElementById('cal');
  if (!host) return;
  const today = startOfToday();
  const next = nextEvent();

  host.innerHTML = EVENTS.map(e => {
    const d = parseDay(e.date);
    const isDone = new Date(e.end || e.start) < new Date();
    const isNext = next && e.date === next.date && e.name === next.name;
    const cls = ['cal-row', isDone ? 'is-done' : '', isNext ? 'is-next' : ''].filter(Boolean).join(' ');
    const pill = isNext ? '<span class="pill pill--next">Next up</span>'
               : isDone ? '<span class="pill pill--done">Done</span>'
               : '<span class="pill">Upcoming</span>';
    return `
      <button class="${cls}" data-date="${e.date}" data-name="${e.name}">
        <span class="date"><span class="d">${d.getDate()}</span><span class="m">${MON_SHORT[d.getMonth()]} &middot; ${DAYS[d.getDay()]}</span></span>
        <span class="ev"><span class="t">${e.name}</span><span class="d">${e.desc}</span></span>
        <span class="meta"><b>${e.time}</b>${e.where}</span>
        <span class="status">${pill}</span>
      </button>`;
  }).join('');

  host.querySelectorAll('.cal-row').forEach(row =>
    row.addEventListener('click', () => openModal(row.dataset.date, row.dataset.name)));
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
  // open on the month of the next event, or the current month once the semester ends
  const ev = nextEvent();
  const anchor = ev ? parseDay(ev.date) : new Date();
  viewYear = anchor.getFullYear();
  viewMonth = anchor.getMonth();

  renderCountdown();
  renderGrid();
  renderList();
  initTabs();

  document.getElementById('prevMonth')?.addEventListener('click', () => shiftMonth(-1));
  document.getElementById('nextMonth')?.addEventListener('click', () => shiftMonth(1));

  const modal = document.getElementById('modal');
  modal?.querySelector('.m-close')?.addEventListener('click', closeModal);
  modal?.querySelector('.m-backdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
