# MUICT Norway — 3D Landing Page

A single-page, interactive recruitment landing page for prospective students in **Norway**, promoting the
**B.Sc. in Information and Communication Technology (International Program)** at the **Faculty of ICT,
Mahidol University, Thailand**.

Built as the Week 14 website landing page for **ITLG311 Business Communication** (Group 1, Norway campaign,
November 2026).

**Live site:** https://yellowman0000.github.io/muict-norway-landing/

---

## What it does

- **Interactive 3D hero** — a real-time THREE.js model of the Faculty of ICT building that auto-spins, turns a
  full circle as you scroll ("scroll to spin"), and responds to click/tap and drag.
- **One page, one goal** — the five campaign messages (portfolio, rankings, health + technology, international
  internships, funding) lead to a single call to action: explore admission requirements.
- **Apple-style minimal design** — large display type, generous whitespace, alternating light/dark sections,
  one accent colour, and a fluid responsive layout down to 360 px.
- **Self-contained** — no build step, no server, no CDN, no network requests at runtime. Opens directly from
  `file://` and works offline.
- **Accessible** — semantic landmarks, skip link, visible focus styles, keyboard-operable menu, reduced-motion
  mode (the 3D scene still responds to interaction), and a photograph fallback when WebGL is unavailable.

## Run it locally

Open `index.html` in any modern browser:

- macOS: double-click `index.html`
- or serve the folder: `python3 -m http.server 8000` → http://localhost:8000

Recommended: current Chrome, Edge, Firefox or Safari. The hero needs WebGL; without it the page shows the
official building photograph and all content and CTAs still work.

## Deploy on GitHub Pages

This repository is already configured for GitHub Pages:

1. **Settings → Pages**
2. **Build and deployment → Source:** *Deploy from a branch*
3. **Branch:** `main` · **Folder:** `/ (root)` → **Save**

There is no build step — GitHub serves the files as-is. A `.nojekyll` file is included.

Any other static host works the same way (Netlify, Vercel, Cloudflare Pages, the Faculty's web server):
upload the repository contents and keep the file paths intact.

## Structure

```
.
├── index.html            all page content and semantics
├── css/
│   └── style.css         design system, sections, responsive rules
├── js/
│   ├── main.js           nav, menu, reveal animations, counters, 3D scene + interactions
│   └── three.min.js      THREE.js r128 (vendored, MIT — © three.js authors)
├── assets/img/
│   ├── building-render.jpg   official Faculty of ICT building rendering (hero poster / K3)
│   ├── classroom.jpg         computer laboratory (K1)
│   └── ai-center.jpg         MU AI Center (K3)
├── .nojekyll
└── README.md
```

## Editing the copy

| What | Where |
|---|---|
| Hero headline, sub-headline, CTAs | `index.html` — `section.hero` |
| USP sentence | `index.html` — `section.usp` |
| Key messages K1–K5 | `index.html` — the `.lead` paragraph in each section (`#programme` … `#funding`) |
| Rankings and caveat | `index.html` — `section#rankings` |
| Minor tracks (8 cards) | `index.html` — `section#tracks` |
| Final CTA, contacts | `index.html` — `section#apply`, `footer` |
| Colours, type, spacing, responsive rules | `css/style.css` |
| 3D building, scroll/click/drag behaviour | `js/main.js` |

Before publishing any change, re-confirm fees, intake dates, rankings and partner lists with the Faculty —
these change between intakes.

## Content and credits

- Programme information and imagery: **Faculty of ICT, Mahidol University** — official pages at
  <https://www.ict.mahidol.ac.th/en/> and the Faculty of ICT Information Pack (November 2026).
- Rankings: QS World University Rankings 2027, QS Asia University Rankings 2026, THE World University
  Rankings 2027, THE Asia University Rankings 2026 (as reported in the Faculty Information Pack).
- Norwegian market data: HK-dir (2026). Funding rules: Lånekassen.

**Disclaimer:** this is a student coursework project for ITLG311 Business Communication. It is **not** an
official publication of Mahidol University. Fees, dates, rankings and partner lists are subject to change —
always confirm current details with the Faculty before applying.

## License

Code in this repository is provided for the ITLG311 course submission. THREE.js is MIT-licensed
(see `js/three.min.js`). Faculty imagery and programme content remain the property of Mahidol University.
