# SKEMA Entrepreneurs · Raleigh

**Live:** https://skema-raleigh-production.up.railway.app

One-page landing site for SKEMA Entrepreneurs in Raleigh — Fall 2026 semester.
Static HTML/CSS/JS served by a zero-dependency Node server.

Brand colors are sampled directly from the SKEMA logo: `#E7433C` red, `#262626` ink.

## Run locally

```bash
npm start          # http://localhost:3000
```

No install step — there are no dependencies.

## Editing content

| What | Where |
|---|---|
| **Event dates, times, locations, descriptions** | the `EVENTS` array at the top of `app.js` — the calendar, the "Next up" ribbon and the countdown all read from it |
| Hero, beliefs, club roles, accelerator copy, FAQ | `index.html` |
| Colors, type, spacing | the `:root` block in `styles.css` |
| Application / mailing-list links | search `forms.cloud.microsoft` in `index.html` |

After changing a date in `app.js`, regenerate the downloadable calendar file:

```bash
npm run build:ics
```

`styles.css` and `app.js` are linked with a `?v=N` query string. **Bump both numbers
in `index.html` whenever you change either file** so returning visitors don't get a
stale cached copy.

## Current links

- Mailing list — https://forms.cloud.microsoft/e/wnPZEM1FtH
- Club leadership application — https://forms.cloud.microsoft/e/FC6SxfznNm
- Accelerator application — https://forms.cloud.microsoft/e/5mdwPGDtFc

## Deploying

Railway builds this with Nixpacks (Node detected via `package.json`) and runs
`node server.js`, binding to the `PORT` it injects. Pushing to `main` triggers a
redeploy automatically.

```bash
git add -A && git commit -m "Update dates" && git push
```
