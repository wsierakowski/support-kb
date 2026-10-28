# Rendered pages

`rendered/` is the static build of this kb (`npm install && npm run build`), committed so the pages
can be read as the desk sees them, with every table computed from `src/lib/data` at render time.

- The #4471 split page: [`rendered/kb/incidents/4471-split/index.html`](rendered/kb/incidents/4471-split/index.html),
  source [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx).
- The desk's #4471 page, unchanged: [`rendered/kb/incidents/4471/index.html`](rendered/kb/incidents/4471/index.html).
