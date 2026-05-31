# Spec — "I need to arrange" drill-down browser

**Date:** 2026-05-21
**Branch:** `feature/l3-pages-and-sos`
**Status:** Draft for user review

## Background

The current "I need to arrange" section is a 10-page hierarchy (L2 `05-p01-life-admin.html` + 9 L3 topic pages). The pages are descriptive, narrative-style ("popisné povídání"). Client requested converting the section to a systematic drill-down catalog modeled on the Czech version of the site (`brno.cz/potrebuji-vyridit`): a single L2 page with a 3-column browser — categories → sub-topics → tasks — so a user lands and immediately drills toward a concrete action instead of reading prose.

## Goals

1. Replace narrative L2 + 9 L3 pages with a single-page drill-down catalog.
2. Match the Czech version's 3-column visual pattern (left = categories, middle = sub-topics in selected category, right = tasks under selected sub-topic).
3. Preserve the foreigner-focused IA (keep our 9 categories, add "Most popular" smart entry at top).
4. Mine existing L3 page content so we don't lose the structured quick-links we already wrote.
5. Make all leaf tasks clickable in the wireframe (each leads to the existing T4 sample article `01-p04-health-insurance.html` for demo).

## Non-goals

- Real search functionality (visible search bar but no behavior in POC).
- Real article detail pages per task (all share one T4 sample).
- PDF / print export of the browser (out of scope; HTML still carries all data in DOM for accessibility, but no print CSS).
- Pushing state to browser History (Back button should leave the wireframe, not navigate column states).

## Decisions (locked in during brainstorm)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Navigation model | Single-page JS browser on L2; 9 L3 pages removed from TREE |
| 2 | Category set | Our 9 + "Most popular" at top = 10 categories |
| 3 | Content depth | Mine existing L3 pages + fill gaps from brno.cz CZ |
| 4 | Leaf click target | All link to `01-p04-health-insurance.html` (existing T4 sample) |
| 5 | Mobile behavior | Sequential drill-down (one column at a time, back link top) |

## Architecture

### Files affected

**Rewritten:**
- `Wireframe/05-p01-life-admin.html` — full rewrite as 3-column browser with pre-rendered DOM containing all 10 categories × ~3–5 sub-topics × ~3–6 tasks.

**Modified:**
- `Wireframe/wireframe.css` — add `/* I need to arrange — drill-down browser */` section (~150–200 lines: 3-col grid, mobile sequential views, list styles).
- `Wireframe/wireframe.js` — (a) remove 9 L3 entries from `TREE` array, (b) add small IIFE for browser interactions (click handlers, hash routing, mobile view state).
- Header nav dropdown in all wireframe pages — remove 9 sub-links under "I need to arrange"; convert "I need to arrange" nav-link to a flat link (no caret), matching the Contact pattern.
- `Wireframe/index.html` — if any links target a specific L3 page, rewrite to fragment link like `05-p01-life-admin.html#documents`.
- `Wireframe/sitemap.html` — remove the 9 L3 entries.
- `/tmp/export_wireframe_pdf.py` — drop the 9 removed entries from `PAGES` (still relevant for re-export later if needed).

**Removed (moved to backup):**
- `Wireframe/05-p02-documents.html` … `05-p10-construction-property.html` (9 files)
  - Backup already present: `Wireframe/_backup/i-need-to-arrange-2026-05-21/`
  - Git fallback: `git checkout c3aae4e -- Wireframe/05-*.html`

### TREE / sidepanel effect

Before: 10 entries under "I need to arrange" (1 L2 + 9 L3).
After: 1 entry (L2 only).

## Layout

### Desktop (≥ 768px)

```
page-header (red banner with breadcrumbs + H1 "I need to arrange")
─────────────────────────────────────────────────────────────
search bar (gray bg, full-width, visual-only)
─────────────────────────────────────────────────────────────
┌─────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│ CATEGORIES  │ │ IN: <cat>    │ │ TASK: <sub-topic>        │
│  ~280px     │ │  ~320px      │ │  flex-grow               │
└─────────────┘ └──────────────┘ └──────────────────────────┘
```

**Column 1 (categories):** vertical list. Active = red bg (`var(--red)`), white text, `›` right-aligned. Inactive = white bg, dark text, gray chevron, hover = light gray bg.

**Column 2 (sub-topics):** H3 of category name on top (bold weight 700). Below: vertical list of sub-topics. Active = red bg + white text + chevron. Inactive = red text on white, bottom border 1px gray, no chevron.

**Column 3 (tasks):** H3 of sub-topic name on top. Below: tasks as red hypertext links on multiple rows (line-height ~1.7, gap 16–20px). No frames, no chevrons — just typographic links.

### Mobile (< 768px) — sequential drill-down

JS toggles `data-mobile-view="categories|subs|tasks"` on container; CSS hides 2 of 3 columns.

- **View 1 — categories:** full-width list. Click → view 2.
- **View 2 — subs:** top row `‹ Categories` (red link, own line). Below: H3 category name + sub-topics list. Click → view 3.
- **View 3 — tasks:** top row `‹ <category name>` back link. Below: H3 sub-topic name + tasks list.

JS additionally scrolls to top on view change.

## Interaction model

### Default state (no hash)

- `Most popular` category active.
- First sub-topic under it active (`Driver's licence`).
- Tasks for that sub-topic visible in right column.

### URL hash routing

- `#popular` → Most popular + its first sub-topic.
- `#popular/driver-licence` → Most popular + Driver's licence sub-topic specifically.
- `#documents` → Documents + first sub-topic.
- Click on category or sub-topic updates hash via `history.replaceState` (not pushState — browser Back leaves the wireframe instead of unwinding column state).
- On load, parse hash; if invalid or empty, fall back to default state.

### Click behavior

- Click category in col 1 → toggle `.active` class on cat + on first `lifeadm-sub-group[data-cat=X]`; activate first `.lifeadm-sub` in that group; toggle `.lifeadm-task-group` with matching cat + sub. Update hash.
- Click sub-topic in col 2 → toggle `.active` on sub + on `lifeadm-task-group[data-cat=X][data-sub=Y]`. Update hash.
- Click task in col 3 → normal link navigation to `01-p04-health-insurance.html`. The existing `wireframe.js` sessionStorage label-injection mechanism picks up the click text and shows it in the destination H1 banner. No extra work needed.

## Data model (HTML structure)

```html
<div class="lifeadm-browser" data-mobile-view="categories">

  <!-- Column 1: 10 categories -->
  <nav class="lifeadm-cats" aria-label="Topic categories">
    <a href="#popular"     class="lifeadm-cat active" data-cat="popular">Most popular ›</a>
    <a href="#documents"   class="lifeadm-cat"        data-cat="documents">Documents ›</a>
    <!-- ... 8 more ... -->
  </nav>

  <!-- Column 2: 10 sub-topic groups, one per category, only one .active at a time -->
  <div class="lifeadm-subs">
    <div class="lifeadm-sub-group active" data-cat="popular">
      <h3>Most popular</h3>
      <a href="#popular/driver-licence" class="lifeadm-sub active" data-sub="driver-licence">Driver's licence ›</a>
      <a href="#popular/waste-fee"      class="lifeadm-sub"        data-sub="waste-fee">Pay waste fee ›</a>
      <!-- ... -->
    </div>
    <div class="lifeadm-sub-group" data-cat="documents"> ... </div>
    <!-- ... 8 more ... -->
  </div>

  <!-- Column 3: ~45 task groups, only one .active at a time -->
  <div class="lifeadm-tasks">
    <div class="lifeadm-task-group active" data-cat="popular" data-sub="driver-licence">
      <h3>Driver's licence</h3>
      <a href="01-p04-health-insurance.html" class="lifeadm-task">Replace lost or stolen driver's licence</a>
      <a href="01-p04-health-insurance.html" class="lifeadm-task">Renew expired licence</a>
      <!-- ... -->
    </div>
    <!-- ... ~44 more ... -->
  </div>

</div>
```

JS only manipulates `.active` classes and `data-mobile-view`; never `innerHTML`.

## Content scope

10 categories, each with 3–6 sub-topics, each sub-topic with 3–6 tasks. Approximate totals: ~45 sub-topic groups, ~180 task links.

| # | Category | Source of content |
|---|----------|-------------------|
| 1 | Most popular | New — synthesize top tasks across other 9 categories |
| 2 | Documents | Existing `05-p02-documents.html` (3 H2 sections ready) |
| 3 | Visa & residency | Existing `05-p03-visa-residency.html` + fill gaps |
| 4 | Transport & vehicles | Existing `05-p04-transport-vehicles.html` |
| 5 | Fees, payments & fines | Existing `05-p05-fees-payments.html` |
| 6 | Document legalization | Existing `05-p06-document-legalization.html` + brno.cz CZ for sworn translations / signature legalization |
| 7 | Social services & family | Existing `05-p07-social-services-family.html` |
| 8 | Environment & waste | Existing `05-p08-environment-waste.html` |
| 9 | City hall services | Existing `05-p09-city-hall-services.html` |
| 10 | Construction & property | Existing `05-p10-construction-property.html` |

The exact list of sub-topics and tasks is content work for implementation, not a design decision. Each category will be built from its existing L3 source page's H2 sections + quick-link lists.

## Open questions deferred to implementation

- Exact wording of "Most popular" tasks (synthesized after seeing all 9 categories' content).
- Whether the search bar should have a placeholder hinting at what's searchable, e.g., "Try: driver's licence, waste fee, residence permit".
- Whether sidebar (Czech POINT box, Need help, SOS) from current L2 stays alongside the browser or gets removed for visual cleanness.

These are micro-decisions to resolve inline during implementation, not blockers.

## Success criteria

1. Loading `05-p01-life-admin.html` shows the 3-column browser with "Most popular" + "Driver's licence" active by default.
2. Clicking any of the 10 categories updates column 2 + column 3 without page reload, updates URL hash.
3. Clicking any of ~45 sub-topics updates column 3 + hash.
4. Clicking any of ~180 task links navigates to `01-p04-health-insurance.html` with the task title injected as label in the H1 banner (existing mechanism).
5. On mobile (browser dev tools < 768px), only one column visible at a time; back links work.
6. Header nav, sidepanel TREE, sitemap, and HP fragments all reflect the new structure (no broken links to removed L3 pages).
7. Deep links work: opening `05-p01-life-admin.html#documents/driver-licence` lands directly on that state.
