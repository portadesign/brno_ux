# Brno EN — IA Scaffold (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce 5 navigable HTML files in `iA/` that map the proposed information architecture for the English version of brno.cz, with page containers, component tiles, and cross-page link badges.

**Architecture:** Static HTML, no JS, no build step. Each file is self-contained (inline CSS identical across files). Files open via `file://`. Tasks 2–7 build one HTML file each — they're independent after Task 1 finishes the shared CSS, so they can be executed in parallel by subagents.

**Tech Stack:** HTML5, CSS3 (custom properties + flexbox/grid). No JavaScript, no external CSS, no build tooling.

**Spec:** See `docs/superpowers/specs/2026-04-29-brno-en-ia-scaffold-design.md`.

---

## Reference assets used across all tasks

These are the canonical pieces that every file-building task copies. They're defined once here so each task below can reference them.

### Shared CSS (paste into every `<style>` block, identical across files)

```css
:root {
  --red: #E2231A;
  --red-dark: #C41A12;
  --red-light: #FCE8E6;
  --black: #1A1A1A;
  --gray-900: #2C2C2C;
  --gray-700: #4D4D4D;
  --gray-500: #8C8C8C;
  --gray-300: #D9D9D9;
  --gray-200: #E5E5E5;
  --gray-100: #F2F2F2;
  --gray-50: #F8F8F8;
  --white: #FFFFFF;
  --warning: #FFB800;
  --warning-bg: #FFF4D6;
  --warning-text: #B45309;
  --font-sans: 'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  font-family: var(--font-sans);
  color: var(--black);
  background: var(--gray-50);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--red); }

/* Sticky mini-sitemap header */
.ia-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--white);
  border-bottom: 2px solid var(--red);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 13px;
}
.ia-header .ia-title {
  font-weight: 700;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: auto;
}
.ia-header nav { display: flex; gap: 6px; flex-wrap: wrap; }
.ia-header nav a {
  text-decoration: none;
  color: var(--gray-700);
  padding: 4px 10px;
  border-radius: 2px;
  font-family: var(--font-mono);
}
.ia-header nav a:hover { color: var(--red); background: var(--red-light); }
.ia-header nav a.active {
  color: var(--white);
  background: var(--red);
  font-weight: 600;
}

/* File body */
.ia-body { padding: 32px 24px 64px; }
.ia-section-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--black);
}
.ia-section-intro {
  margin-bottom: 32px;
  color: var(--gray-700);
  max-width: 720px;
  font-size: 14px;
}

/* Page-container grid */
.ia-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

/* Page container (one box = one page) */
.page-box {
  width: 300px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.page-box-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}
.page-box-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--gray-500);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-family: var(--font-mono);
}
.page-box-id { color: var(--red); }
.page-box-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--black);
  line-height: 1.3;
  margin-bottom: 4px;
}
.page-box-slug {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--gray-500);
}
.page-box-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

/* Component tile inside page container */
.tile {
  border: 1px dashed var(--gray-300);
  border-radius: 3px;
  padding: 8px 10px;
  background: var(--white);
}
.tile-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-family: var(--font-mono);
}
.tile-content {
  font-size: 12px;
  color: var(--gray-900);
  line-height: 1.4;
}
.tile-content ul { list-style: none; margin: 0; padding: 0; }
.tile-content li { padding: 2px 0; }

/* Link badges */
.tile-links {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dotted var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.badge {
  display: inline-block;
  font-size: 11px;
  color: var(--red);
  text-decoration: none;
  font-family: var(--font-mono);
}
.badge:hover { text-decoration: underline; }
.badge .arrow { display: inline-block; width: 16px; }

/* Sitemap overview (only on index.html) */
.sitemap-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 32px 0 48px;
}
.sitemap-col {
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 16px;
  background: var(--white);
}
.sitemap-col h4 {
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: var(--font-mono);
}
.sitemap-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.sitemap-col a {
  color: var(--black);
  text-decoration: none;
  font-family: var(--font-mono);
}
.sitemap-col a:hover { color: var(--red); }

/* SOS variant (used only on 99-sos.html) */
body.sos { background: var(--warning-bg); }
body.sos .ia-header { border-bottom-color: var(--warning); }
body.sos .ia-section-title { color: var(--warning-text); }

/* Legend block at bottom of every file */
.ia-legend {
  margin-top: 64px;
  padding: 24px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  font-size: 12px;
  color: var(--gray-700);
  max-width: 720px;
}
.ia-legend h3 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: var(--black);
  font-family: var(--font-mono);
}
.ia-legend dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
}
.ia-legend dt {
  font-family: var(--font-mono);
  color: var(--red);
  font-weight: 600;
}
```

### HTML scaffold template (one per file)

The placeholders in `[BRACKETS]` are filled per file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brno EN IA — [SECTION TITLE]</title>
  <style>
    /* PASTE the entire shared CSS block here */
  </style>
</head>
<body[ class="sos"]>  <!-- omit class on non-SOS files -->
  <header class="ia-header">
    <span class="ia-title">Brno EN — IA Map</span>
    <nav>
      <a href="index.html"[ class="active"]>index</a>
      <a href="01-family-education.html"[ class="active"]>01 Family</a>
      <a href="02-mobility-residence.html"[ class="active"]>02 Mobility</a>
      <a href="03-business-fees.html"[ class="active"]>03 Business</a>
      <a href="04-services-info.html"[ class="active"]>04 Services</a>
      <a href="99-sos.html"[ class="active"]>99 SOS</a>
    </nav>
  </header>
  <main class="ia-body">
    <h1 class="ia-section-title">[H1 TITLE]</h1>
    <p class="ia-section-intro">[1–2 sentence intro for this file]</p>
    <!-- (index.html only) sitemap-overview block goes here -->
    <div class="ia-grid">
      <!-- page-box elements go here, one per page -->
    </div>
    <section class="ia-legend">
      <h3>Legend</h3>
      <dl>
        <dt>[T1]</dt><dd>Homepage template</dd>
        <dt>[T2]</dt><dd>Section landing</dd>
        <dt>[T4]</dt><dd>Service detail</dd>
        <dt>[T5]</dt><dd>Department list</dd>
        <dt>[T6]</dt><dd>Department detail</dd>
        <dt>[T7]</dt><dd>Person profile</dd>
        <dt>[T8]</dt><dd>Contacts</dd>
        <dt>→</dt><dd>Link inside this file</dd>
        <dt>↗</dt><dd>Cross-file link</dd>
        <dt>⇡</dt><dd>Link to homepage / index</dd>
      </dl>
    </section>
  </main>
</body>
</html>
```

Rules for the scaffold:
- Add `class="active"` to the nav link of the current file. Remove the `[ class="active"]` placeholder on the other 5 nav links.
- Add `class="sos"` on the `<body>` only in `99-sos.html`.

### Page-container template

Every page in every file uses this exact HTML structure. Plug in `[VALUES]`:

```html
<article class="page-box" id="[ANCHOR-ID]">
  <div class="page-box-header">
    <div class="page-box-meta">
      <span class="page-box-id">[PAGE-ID]</span>
      <span class="page-box-template">[TEMPLATE]</span>
    </div>
    <h2 class="page-box-title">[PAGE TITLE]</h2>
    <div class="page-box-slug">[URL SLUG]</div>
  </div>
  <div class="page-box-body">
    <!-- one .tile per component on this page -->
  </div>
</article>
```

- `[ANCHOR-ID]` is the page-id lowercased with hyphens, e.g. `01-p02`.
- `[PAGE-ID]` is the human-readable id, e.g. `01-P02`.
- `[TEMPLATE]` is `[T1]`, `[T2]`, `[T4]`, `[T5]`, `[T6]`, or `[T8]` (square brackets included in the visible text).

### Component tile template

Each tile = one UI component shown on this page. Two flavors:

**Without links:**
```html
<div class="tile">
  <div class="tile-label">[COMPONENT_ID] · [COMPONENT_NAME]</div>
  <div class="tile-content">[content lines or <ul><li>… items]</div>
</div>
```

**With link badges:**
```html
<div class="tile">
  <div class="tile-label">[COMPONENT_ID] · [COMPONENT_NAME]</div>
  <div class="tile-content">[content]</div>
  <div class="tile-links">
    <a class="badge" href="[HREF]"><span class="arrow">[ARROW]</span> [TARGET LABEL]</a>
    <!-- one <a class="badge"> per outgoing link -->
  </div>
</div>
```

Arrow values:
- `→` for same-file (`href="#01-p02"`)
- `↗` for cross-file (`href="04-services-info.html#04-p02"`)
- `⇡` for homepage (`href="index.html"`)

---

## Task 1: Set up `iA/` folder and verify shared assets render

**Files:**
- Create: `iA/_template.html` (reference scaffold — kept for review, not for browser use)

**Why this task exists:** Sanity-check the CSS and scaffold render before duplicating across 5 files. If a class is broken, fix here before propagation.

- [ ] **Step 1: Confirm `iA/` directory exists and is empty**

Run: `ls /Users/panparek/Development/BrnoEN/iA/`
Expected: empty output (folder exists, is empty)

- [ ] **Step 2: Create `iA/_template.html` with the scaffold + one example container**

Write this file exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brno EN IA — Template Reference</title>
  <style>
    /* PASTE the entire shared CSS block from the Reference Assets section */
  </style>
</head>
<body>
  <header class="ia-header">
    <span class="ia-title">Brno EN — IA Map</span>
    <nav>
      <a href="index.html">index</a>
      <a href="01-family-education.html">01 Family</a>
      <a href="02-mobility-residence.html">02 Mobility</a>
      <a href="03-business-fees.html">03 Business</a>
      <a href="04-services-info.html">04 Services</a>
      <a href="99-sos.html">99 SOS</a>
    </nav>
  </header>
  <main class="ia-body">
    <h1 class="ia-section-title">Template reference (do not link from production files)</h1>
    <p class="ia-section-intro">This file exists only to verify the shared CSS and HTML patterns. Files index.html and 01–99 are the actual deliverables.</p>
    <div class="ia-grid">
      <article class="page-box" id="example">
        <div class="page-box-header">
          <div class="page-box-meta">
            <span class="page-box-id">XX-P01</span>
            <span class="page-box-template">[T4]</span>
          </div>
          <h2 class="page-box-title">Example page title</h2>
          <div class="page-box-slug">/example/slug</div>
        </div>
        <div class="page-box-body">
          <div class="tile">
            <div class="tile-label">C03 · Page banner</div>
            <div class="tile-content">"Example title in red banner"</div>
          </div>
          <div class="tile">
            <div class="tile-label">C13 · Process steps</div>
            <div class="tile-content">
              <ul><li>1. Do this</li><li>2. Then this</li><li>3. Finish</li></ul>
            </div>
            <div class="tile-links">
              <a class="badge" href="#example"><span class="arrow">→</span> XX-P01 self-loop demo</a>
              <a class="badge" href="04-services-info.html#04-p02"><span class="arrow">↗</span> 04-P02 cross-file demo</a>
              <a class="badge" href="index.html"><span class="arrow">⇡</span> Homepage demo</a>
            </div>
          </div>
        </div>
      </article>
    </div>
    <section class="ia-legend">
      <h3>Legend</h3>
      <dl>
        <dt>[T1]</dt><dd>Homepage template</dd>
        <dt>[T2]</dt><dd>Section landing</dd>
        <dt>[T4]</dt><dd>Service detail</dd>
        <dt>[T5]</dt><dd>Department list</dd>
        <dt>[T6]</dt><dd>Department detail</dd>
        <dt>[T7]</dt><dd>Person profile</dd>
        <dt>[T8]</dt><dd>Contacts</dd>
        <dt>→</dt><dd>Link inside this file</dd>
        <dt>↗</dt><dd>Cross-file link</dd>
        <dt>⇡</dt><dd>Link to homepage / index</dd>
      </dl>
    </section>
  </main>
</body>
</html>
```

- [ ] **Step 3: Verify the template renders**

Open `iA/_template.html` in a browser (or `open iA/_template.html` from terminal on macOS).

Visual checks:
- Sticky header at top, "Brno EN — IA Map" left, six nav links right.
- Main heading visible.
- Single page-box with red `XX-P01` id, gray meta row, title, slug.
- Three tiles inside, third tile has three colored badges with `→ ↗ ⇡` arrows.
- Legend block at bottom with badge symbols and template tags.

If anything looks broken (missing border, wrong font, badges on top of each other), fix the CSS in `_template.html` AND update the "Shared CSS" block above before proceeding.

---

## Task 2: Build `iA/index.html` (Homepage + sitemap overview)

**Files:**
- Create: `iA/index.html`

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| index-P01 | `index-p01` | T1 | Homepage | `/` |

Plus a special `sitemap-overview` block (between H1 and `.ia-grid`) — see Step 3.

**Component tiles for `index-P01`:**

| Component | Content | Link badges |
|-----------|---------|-------------|
| C04 · Hero carousel | 3 slides: "Kindergarten registrations open", "Pay your waste fee", "Vehicle import guide" | `↗ 01-P02 Kindergarten enrollment`, `↗ 03-P03 Pay waste fee`, `↗ 02-P04 Vehicle import` |
| C06 · "I need to handle" tile group | Top 6 priority-5 services | `↗ 01-P02 Kindergarten`, `↗ 01-P03 Primary school`, `↗ 02-P02 Vehicle registration`, `↗ 02-P03 Driver's license`, `↗ 03-P02 Trade license`, `↗ 03-P03 Pay waste` |
| Inline SOS button | "I need help right now" — large warning-color tile | `↗ 99-P01 SOS landing` |
| C07 · News card list | 3 placeholder news items | (none) |
| C08 · Banner cards (3 large tiles) | Family & Education / Mobility & Residence / Business & Fees | `↗ 01-P01 Family & Education`, `↗ 02-P01 Mobility & Residence`, `↗ 03-P01 Business & Fees` |
| C09 · Department grid | 6 departments | `↗ 04-P04 Department list`, `↗ 02-P06 Transport Dept`, `↗ 03-P04 Trade Office` |
| C11 · Mega menu (schema) | Note: appears under main nav, not in body | `↗ 01-P01`, `↗ 02-P01`, `↗ 03-P01`, `↗ 04-P01` |
| C17 · Footer (schema) | Site-wide footer with link inventory | `↗ 04-P05 Contacts`, `↗ 04-P04 Department list` |

- [ ] **Step 1: Write the file scaffold**

Use the scaffold from Reference Assets. Substitute:
- `<title>` → `Brno EN IA — Homepage & Sitemap`
- Active nav → `<a href="index.html" class="active">index</a>`
- `[H1 TITLE]` → `Homepage and global sitemap`
- intro `<p>` → `The homepage of brno.cz/en plus a master sitemap of every section in this IA proposal.`

- [ ] **Step 2: Insert the sitemap-overview block**

Between the `<p class="ia-section-intro">` and the `<div class="ia-grid">`, insert:

```html
<section class="sitemap-overview">
  <div class="sitemap-col">
    <h4>01 Family &amp; Education</h4>
    <ul>
      <li><a href="01-family-education.html#01-p01">01-P01 Section landing</a></li>
      <li><a href="01-family-education.html#01-p02">01-P02 Kindergarten enrollment</a></li>
      <li><a href="01-family-education.html#01-p03">01-P03 Primary school enrollment</a></li>
      <li><a href="01-family-education.html#01-p04">01-P04 Schooling abroad</a></li>
      <li><a href="01-family-education.html#01-p05">01-P05 Crisis accommodation</a></li>
    </ul>
  </div>
  <div class="sitemap-col">
    <h4>02 Mobility &amp; Residence</h4>
    <ul>
      <li><a href="02-mobility-residence.html#02-p01">02-P01 Section landing</a></li>
      <li><a href="02-mobility-residence.html#02-p02">02-P02 Vehicle registration</a></li>
      <li><a href="02-mobility-residence.html#02-p03">02-P03 Driver's license replacement</a></li>
      <li><a href="02-mobility-residence.html#02-p04">02-P04 Vehicle import</a></li>
      <li><a href="02-mobility-residence.html#02-p05">02-P05 License plates</a></li>
      <li><a href="02-mobility-residence.html#02-p06">02-P06 Transport Department</a></li>
    </ul>
  </div>
  <div class="sitemap-col">
    <h4>03 Business &amp; Fees</h4>
    <ul>
      <li><a href="03-business-fees.html#03-p01">03-P01 Section landing</a></li>
      <li><a href="03-business-fees.html#03-p02">03-P02 Trade license</a></li>
      <li><a href="03-business-fees.html#03-p03">03-P03 Pay waste fee</a></li>
      <li><a href="03-business-fees.html#03-p04">03-P04 Trade Office</a></li>
    </ul>
  </div>
  <div class="sitemap-col">
    <h4>04 Public Services</h4>
    <ul>
      <li><a href="04-services-info.html#04-p01">04-P01 Section landing</a></li>
      <li><a href="04-services-info.html#04-p02">04-P02 Czech POINT</a></li>
      <li><a href="04-services-info.html#04-p03">04-P03 Document legalization</a></li>
      <li><a href="04-services-info.html#04-p04">04-P04 Department list</a></li>
      <li><a href="04-services-info.html#04-p05">04-P05 Contacts</a></li>
    </ul>
  </div>
  <div class="sitemap-col">
    <h4>99 SOS</h4>
    <ul>
      <li><a href="99-sos.html#99-p01">99-P01 SOS landing</a></li>
      <li><a href="99-sos.html#99-p02">99-P02 Lost &amp; Found</a></li>
      <li><a href="99-sos.html#99-p03">99-P03 DL after theft</a></li>
    </ul>
  </div>
</section>
```

- [ ] **Step 3: Insert the Homepage page-box**

Inside the `<div class="ia-grid">`, place exactly this:

```html
<article class="page-box" id="index-p01">
  <div class="page-box-header">
    <div class="page-box-meta">
      <span class="page-box-id">index-P01</span>
      <span class="page-box-template">[T1]</span>
    </div>
    <h2 class="page-box-title">Homepage</h2>
    <div class="page-box-slug">/</div>
  </div>
  <div class="page-box-body">
    <div class="tile">
      <div class="tile-label">C04 · Hero carousel</div>
      <div class="tile-content">
        <ul>
          <li>Slide 1: Kindergarten registrations open</li>
          <li>Slide 2: Pay your waste fee (seasonal)</li>
          <li>Slide 3: Vehicle import guide</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="01-family-education.html#01-p02"><span class="arrow">↗</span> 01-P02 Kindergarten enrollment</a>
        <a class="badge" href="03-business-fees.html#03-p03"><span class="arrow">↗</span> 03-P03 Pay waste fee</a>
        <a class="badge" href="02-mobility-residence.html#02-p04"><span class="arrow">↗</span> 02-P04 Vehicle import</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">SOS · Crisis CTA</div>
      <div class="tile-content">"I need help right now" — prominent warning-color button above-the-fold</div>
      <div class="tile-links">
        <a class="badge" href="99-sos.html#99-p01"><span class="arrow">↗</span> 99-P01 SOS landing</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C06 · "I need to handle" tile group</div>
      <div class="tile-content">
        <ul>
          <li>Top 6 priority services for foreigners</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="01-family-education.html#01-p02"><span class="arrow">↗</span> 01-P02 Kindergarten</a>
        <a class="badge" href="01-family-education.html#01-p03"><span class="arrow">↗</span> 01-P03 Primary school</a>
        <a class="badge" href="02-mobility-residence.html#02-p02"><span class="arrow">↗</span> 02-P02 Vehicle registration</a>
        <a class="badge" href="02-mobility-residence.html#02-p03"><span class="arrow">↗</span> 02-P03 Driver's license</a>
        <a class="badge" href="03-business-fees.html#03-p02"><span class="arrow">↗</span> 03-P02 Trade license</a>
        <a class="badge" href="03-business-fees.html#03-p03"><span class="arrow">↗</span> 03-P03 Pay waste fee</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C07 · News card list</div>
      <div class="tile-content">
        <ul>
          <li>News item 1 (city update)</li>
          <li>News item 2 (event)</li>
          <li>News item 3 (notice for foreigners)</li>
        </ul>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C08 · Banner cards (3 large tiles)</div>
      <div class="tile-content">
        <ul>
          <li>Family &amp; Education</li>
          <li>Mobility &amp; Residence</li>
          <li>Business &amp; Fees</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="01-family-education.html#01-p01"><span class="arrow">↗</span> 01-P01 Family &amp; Education</a>
        <a class="badge" href="02-mobility-residence.html#02-p01"><span class="arrow">↗</span> 02-P01 Mobility &amp; Residence</a>
        <a class="badge" href="03-business-fees.html#03-p01"><span class="arrow">↗</span> 03-P01 Business &amp; Fees</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C09 · Department grid (top 6)</div>
      <div class="tile-content">
        <ul>
          <li>Schools, Transport, Trade Office, Czech POINT, Social, Environment</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="04-services-info.html#04-p04"><span class="arrow">↗</span> 04-P04 Full department list</a>
        <a class="badge" href="02-mobility-residence.html#02-p06"><span class="arrow">↗</span> 02-P06 Transport Department</a>
        <a class="badge" href="03-business-fees.html#03-p04"><span class="arrow">↗</span> 03-P04 Trade Office</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C11 · Mega menu (schema, attached to main nav)</div>
      <div class="tile-content">Multi-column dropdown under each top-level nav item, listing key sub-pages.</div>
      <div class="tile-links">
        <a class="badge" href="01-family-education.html#01-p01"><span class="arrow">↗</span> 01-P01 Family &amp; Education</a>
        <a class="badge" href="02-mobility-residence.html#02-p01"><span class="arrow">↗</span> 02-P01 Mobility &amp; Residence</a>
        <a class="badge" href="03-business-fees.html#03-p01"><span class="arrow">↗</span> 03-P01 Business &amp; Fees</a>
        <a class="badge" href="04-services-info.html#04-p01"><span class="arrow">↗</span> 04-P01 Public Services</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C17 · Footer (schema)</div>
      <div class="tile-content">Site-wide footer with full link inventory.</div>
      <div class="tile-links">
        <a class="badge" href="04-services-info.html#04-p05"><span class="arrow">↗</span> 04-P05 Contacts</a>
        <a class="badge" href="04-services-info.html#04-p04"><span class="arrow">↗</span> 04-P04 Department list</a>
      </div>
    </div>
  </div>
</article>
```

- [ ] **Step 4: Verify the file renders correctly**

Run: `open /Users/panparek/Development/BrnoEN/iA/index.html`

Visual checks:
- Sticky header at top with `index` highlighted in red.
- Sitemap overview: 5 columns, each listing pages. Click a link inside a column — should land on the right `id` in the right file (will fail until those files exist; for now, just confirm the URL structure is right by checking the `<a href>` value in DevTools).
- Homepage page-box on the left with all 8 tiles.
- Legend block at bottom.

- [ ] **Step 5: Sanity-check the anchor**

Run: `grep -c 'id="index-p01"' /Users/panparek/Development/BrnoEN/iA/index.html`
Expected: `1`

---

## Task 3: Build `iA/01-family-education.html`

**Files:**
- Create: `iA/01-family-education.html`

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| 01-P01 | `01-p01` | T2 | Family & Education — section landing | `/family` |
| 01-P02 | `01-p02` | T4 | Kindergarten enrollment | `/family/kindergarten-enrollment` |
| 01-P03 | `01-p03` | T4 | Primary school enrollment | `/family/primary-school-enrollment` |
| 01-P04 | `01-p04` | T4 | Schooling abroad | `/family/schooling-abroad` |
| 01-P05 | `01-p05` | T4 | Crisis accommodation for families | `/family/crisis-accommodation` |

**Component tiles per page:**

`01-P01` Section landing:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Family & Education" — red Brno banner | (none) |
| C06 · Service tile group | 4 priority services | `→ 01-P02 Kindergarten`, `→ 01-P03 Primary school`, `→ 01-P04 Schooling abroad`, `→ 01-P05 Crisis accommodation` |
| C04 · Hero block | "Kindergarten registrations now open" | `→ 01-P02 Kindergarten enrollment` |
| C07 · News card list | 3 family/education news items | (none) |
| C14 · Help sidebar | School Department contact | `↗ 04-P04 Department list`, `↗ 04-P05 Contacts` |

`01-P02` Kindergarten enrollment:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Kindergarten enrollment" | (none) |
| C13 · Process steps | 1. Pick a kindergarten → 2. Submit application → 3. Hearing → 4. Confirm placement | `→ 01-P01 Section landing` |
| C16 · Accordion FAQ | When are registrations open? / Required documents / Special needs / Foreign nationals | `↗ 04-P03 Document legalization`, `↗ 04-P02 Czech POINT` |
| C14 · Help sidebar | Contact: School Department | `↗ 04-P04 Department list` |

`01-P03` Primary school enrollment:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Primary school enrollment" | (none) |
| C13 · Process steps | 1. Catchment area check → 2. Choose school → 3. Submit application → 4. Decision | `→ 01-P01 Section landing` |
| C16 · Accordion FAQ | Catchment rules / Documents / Foreign children / Mid-year transfer | `↗ 04-P03 Document legalization` |
| C14 · Help sidebar | Contact: School Department | `↗ 04-P04 Department list` |

`01-P04` Schooling abroad:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Plnění povinné školní docházky v zahraničí" | (none) |
| C13 · Process steps | 1. Notify school → 2. Submit foreign documents → 3. Annual examination | `→ 01-P01 Section landing`, `→ 01-P03 Primary school enrollment` |
| C16 · Accordion FAQ | Document recognition / Returning to CZ / Examinations | `↗ 04-P03 Document legalization`, `↗ 04-P02 Czech POINT` |
| C14 · Help sidebar | Contact: School Department | `↗ 04-P04 Department list` |

`01-P05` Crisis accommodation for families:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Crisis accommodation for families" | (none) |
| C13 · Process steps | 1. Call crisis line → 2. Initial contact → 3. Placement | (none) |
| C14 · Help sidebar | Crisis hotline + email; mobile-first contact info | `↗ 99-P01 SOS landing` |

- [ ] **Step 1: Write the file from the scaffold**

Use the scaffold (Reference Assets) with:
- `<title>` → `Brno EN IA — 01 Family & Education`
- Active nav → `<a href="01-family-education.html" class="active">01 Family</a>`
- `[H1 TITLE]` → `01 Family & Education`
- intro → `Section covering kindergarten and primary school enrollment, schooling abroad, and family-related crisis support.`

- [ ] **Step 2: Insert the 5 page-boxes inside `.ia-grid`**

For each page in the table above, render the page-container template with the listed tiles. Build links using the badge template:
- Same-file links use `href="#01-pNN"`
- Cross-file links use `href="04-services-info.html#04-pNN"`, `href="99-sos.html#99-p01"`, etc.

Worked example for `01-P02` (use this exact structure as the pattern for all other pages on this file):

```html
<article class="page-box" id="01-p02">
  <div class="page-box-header">
    <div class="page-box-meta">
      <span class="page-box-id">01-P02</span>
      <span class="page-box-template">[T4]</span>
    </div>
    <h2 class="page-box-title">Kindergarten enrollment</h2>
    <div class="page-box-slug">/family/kindergarten-enrollment</div>
  </div>
  <div class="page-box-body">
    <div class="tile">
      <div class="tile-label">C03 · Page banner</div>
      <div class="tile-content">"Kindergarten enrollment"</div>
    </div>
    <div class="tile">
      <div class="tile-label">C13 · Process steps</div>
      <div class="tile-content">
        <ul>
          <li>1. Pick a kindergarten</li>
          <li>2. Submit application</li>
          <li>3. Hearing</li>
          <li>4. Confirm placement</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="#01-p01"><span class="arrow">→</span> 01-P01 Section landing</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C16 · Accordion FAQ</div>
      <div class="tile-content">
        <ul>
          <li>When are registrations open?</li>
          <li>Required documents</li>
          <li>Special needs</li>
          <li>Foreign nationals — additional steps</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="04-services-info.html#04-p03"><span class="arrow">↗</span> 04-P03 Document legalization</a>
        <a class="badge" href="04-services-info.html#04-p02"><span class="arrow">↗</span> 04-P02 Czech POINT</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C14 · Help sidebar</div>
      <div class="tile-content">Contact: School Department</div>
      <div class="tile-links">
        <a class="badge" href="04-services-info.html#04-p04"><span class="arrow">↗</span> 04-P04 Department list</a>
      </div>
    </div>
  </div>
</article>
```

Apply the same template for `01-P01`, `01-P03`, `01-P04`, `01-P05` using the data from the tables above. Order in the file: P01, P02, P03, P04, P05.

- [ ] **Step 3: Verify the file renders and anchors exist**

Run: `open /Users/panparek/Development/BrnoEN/iA/01-family-education.html`

Visual: 5 page-boxes flowing left-to-right, mini-sitemap header with `01 Family` highlighted.

Run: `grep -E 'id="01-p[0-9]+"' /Users/panparek/Development/BrnoEN/iA/01-family-education.html | wc -l`
Expected: `5` (one for each page)

---

## Task 4: Build `iA/02-mobility-residence.html`

**Files:**
- Create: `iA/02-mobility-residence.html`

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| 02-P01 | `02-p01` | T2 | Mobility & Residence — section landing | `/mobility` |
| 02-P02 | `02-p02` | T4 | Vehicle registration & change of owner | `/mobility/vehicle-registration` |
| 02-P03 | `02-p03` | T4 | Driver's license replacement | `/mobility/driver-license-replacement` |
| 02-P04 | `02-p04` | T4 | Vehicle import | `/mobility/vehicle-import` |
| 02-P05 | `02-p05` | T4 | License plates | `/mobility/license-plates` |
| 02-P06 | `02-p06` | T6 | Transport Department | `/departments/transport` |

**Component tiles per page:**

`02-P01` Section landing:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Mobility & Residence" | (none) |
| C06 · Service tile group | 5 service tiles | `→ 02-P02 Vehicle registration`, `→ 02-P03 Driver's license`, `→ 02-P04 Vehicle import`, `→ 02-P05 License plates`, `→ 02-P06 Transport Department` |
| C04 · Hero | "Just imported a vehicle? Start here." | `→ 02-P04 Vehicle import` |
| C07 · News card list | 3 transport-related notices | (none) |
| C14 · Help sidebar | Transport Department contact | `→ 02-P06 Transport Department`, `↗ 04-P05 Contacts` |

`02-P02` Vehicle registration / change of owner:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Vehicle registration & change of owner" | (none) |
| C13 · Process steps | 1. Documents check → 2. Forms → 3. Submit at counter → 4. Receive plates | `→ 02-P01 Section landing` |
| C16 · Accordion FAQ | Imported vehicle / Used vehicle / Heir / Foreign-issued title | `↗ 04-P02 Czech POINT`, `→ 02-P04 Vehicle import` |
| C14 · Help sidebar | Transport Department | `→ 02-P06 Transport Department` |

`02-P03` Driver's license replacement:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Driver's license — lost, stolen, damaged" | (none) |
| C13 · Process steps | 1. Report (if stolen) → 2. Apply for replacement → 3. Pickup | `→ 02-P01 Section landing` |
| C16 · Accordion FAQ | Stolen DL — what first? / Lost abroad / Foreign DL conversion | `↗ 99-P03 SOS — DL after theft`, `↗ 04-P02 Czech POINT` |
| C14 · Help sidebar | Transport Department | `→ 02-P06 Transport Department` |

`02-P04` Vehicle import:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Individual import of a vehicle from abroad" | (none) |
| C13 · Process steps | 1. Customs → 2. Tech inspection → 3. Emissions → 4. Register & receive plates | `→ 02-P01 Section landing`, `→ 02-P02 Vehicle registration` |
| C16 · Accordion FAQ | EU vs non-EU / Used vehicles / VAT | `↗ 04-P03 Document legalization`, `↗ 04-P02 Czech POINT` |
| C14 · Help sidebar | Transport Department | `→ 02-P06 Transport Department` |

`02-P05` License plates:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "License plates — request, replace" | (none) |
| C13 · Process steps | 1. Report loss / damage → 2. Apply → 3. Pick up new plates | `→ 02-P01 Section landing` |
| C16 · Accordion FAQ | Stolen plates / Damaged plates / Custom plates | `↗ 04-P02 Czech POINT` |
| C14 · Help sidebar | Transport Department | `→ 02-P06 Transport Department` |

`02-P06` Transport Department (T6):
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Transport Department" | (none) |
| C10 · Person card | Head of department (placeholder name + role) | (none — T7 person profile out of scaffold) |
| C09 · Sub-departments grid | Vehicle Registry / Driver Licensing / Traffic Offenses | `→ 02-P02 Vehicle registration`, `→ 02-P03 Driver's license`, `→ 02-P05 License plates` |
| C14 · Help sidebar | Office hours, address, phone, email | `↗ 04-P05 Contacts` |

- [ ] **Step 1: Write the file from the scaffold**

Same as Task 3 Step 1, but:
- `<title>` → `Brno EN IA — 02 Mobility & Residence`
- Active nav → `<a href="02-mobility-residence.html" class="active">02 Mobility</a>`
- `[H1 TITLE]` → `02 Mobility & Residence`
- intro → `Section covering vehicle registration, driver's license replacement, vehicle import and license plates, plus the Transport Department.`

- [ ] **Step 2: Insert the 6 page-boxes**

Use the page-container template (Reference Assets) with the data from the tables above. Order: 02-P01, 02-P02, 02-P03, 02-P04, 02-P05, 02-P06.

Worked example for the cross-link-heavy `02-P03`:

```html
<article class="page-box" id="02-p03">
  <div class="page-box-header">
    <div class="page-box-meta">
      <span class="page-box-id">02-P03</span>
      <span class="page-box-template">[T4]</span>
    </div>
    <h2 class="page-box-title">Driver's license replacement</h2>
    <div class="page-box-slug">/mobility/driver-license-replacement</div>
  </div>
  <div class="page-box-body">
    <div class="tile">
      <div class="tile-label">C03 · Page banner</div>
      <div class="tile-content">"Driver's license — lost, stolen, damaged"</div>
    </div>
    <div class="tile">
      <div class="tile-label">C13 · Process steps</div>
      <div class="tile-content">
        <ul>
          <li>1. Report theft (if stolen)</li>
          <li>2. Apply for replacement</li>
          <li>3. Pick up new licence</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="#02-p01"><span class="arrow">→</span> 02-P01 Section landing</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C16 · Accordion FAQ</div>
      <div class="tile-content">
        <ul>
          <li>Stolen DL — what to do first</li>
          <li>Lost DL abroad</li>
          <li>Converting a foreign DL</li>
        </ul>
      </div>
      <div class="tile-links">
        <a class="badge" href="99-sos.html#99-p03"><span class="arrow">↗</span> 99-P03 SOS — DL after theft</a>
        <a class="badge" href="04-services-info.html#04-p02"><span class="arrow">↗</span> 04-P02 Czech POINT</a>
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">C14 · Help sidebar</div>
      <div class="tile-content">Transport Department contact</div>
      <div class="tile-links">
        <a class="badge" href="#02-p06"><span class="arrow">→</span> 02-P06 Transport Department</a>
      </div>
    </div>
  </div>
</article>
```

- [ ] **Step 3: Verify**

Run: `open /Users/panparek/Development/BrnoEN/iA/02-mobility-residence.html`

Run: `grep -E 'id="02-p[0-9]+"' /Users/panparek/Development/BrnoEN/iA/02-mobility-residence.html | wc -l`
Expected: `6`

---

## Task 5: Build `iA/03-business-fees.html`

**Files:**
- Create: `iA/03-business-fees.html`

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| 03-P01 | `03-p01` | T2 | Business & Fees — section landing | `/business` |
| 03-P02 | `03-p02` | T4 | Establishing a trade license | `/business/trade-license` |
| 03-P03 | `03-p03` | T4 | Pay your waste fee | `/fees/waste` |
| 03-P04 | `03-p04` | T6 | Trade Office | `/departments/trade-office` |

**Component tiles per page:**

`03-P01` Section landing:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Business & Fees" | (none) |
| C06 · Service tile group | Tiles for trade license, waste fee, fines | `→ 03-P02 Trade license`, `→ 03-P03 Pay waste fee`, `→ 03-P04 Trade Office` |
| C04 · Hero | "Pay your waste fee — seasonal CTA" | `→ 03-P03 Pay waste fee` |
| C08 · Banner cards (2) | Small businesses / Freelancers | `→ 03-P02 Trade license` |
| C14 · Help sidebar | Trade Office contact | `→ 03-P04 Trade Office`, `↗ 04-P05 Contacts` |

`03-P02` Establishing a trade license:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Establishing a trade license (živnostenské oprávnění)" | (none) |
| C13 · Process steps | 1. Select activity → 2. Fill JRF form → 3. Submit & pay → 4. Receive licence | `→ 03-P01 Section landing` |
| C16 · Accordion FAQ | Foreign nationals / Required documents / Visa & residence link | `↗ 04-P02 Czech POINT`, `↗ 04-P03 Document legalization` |
| C14 · Help sidebar | Trade Office | `→ 03-P04 Trade Office` |

`03-P03` Pay waste fee:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Pay your waste fee — annual obligation" | (none) |
| C13 · Process steps | 1. Identify (birth no. or special ID) → 2. Online payment → 3. Receipt | `→ 03-P01 Section landing` |
| Inline CTA | Big "Pay online now" button — primary action | (none) |
| C16 · Accordion FAQ | Who pays / Deadlines / Penalty for late / In-person payment | `↗ 04-P02 Czech POINT (in-person counter)` |
| C14 · Help sidebar | Fees department contact | `↗ 04-P05 Contacts` |

`03-P04` Trade Office (T6):
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Trade Office" | (none) |
| C10 · Person card | Head of office (placeholder) | (none) |
| C09 · Sub-services grid | New licence / Modification / Cancellation / Records | `→ 03-P02 Establishing a trade license` |
| C14 · Help sidebar | Office hours, contact | `↗ 04-P05 Contacts` |

- [ ] **Step 1: Write the file from the scaffold**

- `<title>` → `Brno EN IA — 03 Business & Fees`
- Active nav → `<a href="03-business-fees.html" class="active">03 Business</a>`
- `[H1 TITLE]` → `03 Business & Fees`
- intro → `Section covering trade licensing, the seasonal waste fee, and the Trade Office.`

- [ ] **Step 2: Insert the 4 page-boxes**

Apply the page-container template with the tile data from the tables above. Order: 03-P01, 03-P02, 03-P03, 03-P04.

- [ ] **Step 3: Verify**

Run: `open /Users/panparek/Development/BrnoEN/iA/03-business-fees.html`

Run: `grep -E 'id="03-p[0-9]+"' /Users/panparek/Development/BrnoEN/iA/03-business-fees.html | wc -l`
Expected: `4`

---

## Task 6: Build `iA/04-services-info.html`

**Files:**
- Create: `iA/04-services-info.html`

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| 04-P01 | `04-p01` | T2 | Public Services — section landing | `/services` |
| 04-P02 | `04-p02` | T4 | Czech POINT | `/services/czech-point` |
| 04-P03 | `04-p03` | T4 | Document legalization & verification | `/services/document-legalization` |
| 04-P04 | `04-p04` | T5 | Department list | `/departments` |
| 04-P05 | `04-p05` | T8 | Contacts | `/contacts` |

**Component tiles per page:**

`04-P01` Section landing:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Public Services" | (none) |
| C06 · Service tile group | Czech POINT, Legalization, Departments, Contacts | `→ 04-P02 Czech POINT`, `→ 04-P03 Document legalization`, `→ 04-P04 Department list`, `→ 04-P05 Contacts` |
| C12 · Search bar | Search across services and departments | `→ 04-P04 Department list` |
| C07 · News card list | 3 service updates | (none) |
| C14 · Help sidebar | Information line | `→ 04-P05 Contacts` |

`04-P02` Czech POINT (designated cross-link hub):
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Czech POINT — universal counter for extracts and verified submissions" | (none) |
| C13 · Process steps | 1. Pick the service → 2. Bring ID → 3. Receive verified document | (none) |
| C16 · Accordion · Available services | Trade Register extract / Criminal record / Cadastre / Driver register / Authorized conversion | (none — Czech POINT is a destination, not a source) |
| C14 · Help sidebar | Office hours, address, phone | `→ 04-P05 Contacts`, `→ 04-P04 Department list` |

`04-P03` Document legalization & verification:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Document legalization & verification" | (none) |
| C13 · Process steps | 1. Bring docs → 2. Translation → 3. Apostille / superlegalization → 4. Submit | `→ 04-P02 Czech POINT` |
| C16 · Accordion FAQ | Apostille countries / Sworn translators / Vyšší ověření matričních dokladů | `→ 04-P02 Czech POINT` |
| C14 · Help sidebar | Information line | `→ 04-P05 Contacts` |

`04-P04` Department list (T5):
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Departments" | (none) |
| C12 · Search bar | Search departments by name | (none) |
| C09 · Department grid | Schools / Transport / Trade Office / Czech POINT / Social / Environment / Construction | `↗ 02-P06 Transport Department`, `↗ 03-P04 Trade Office`, `→ 04-P02 Czech POINT` |
| C14 · Help sidebar | Help finding the right department | `→ 04-P05 Contacts` |

`04-P05` Contacts (T8):
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner | "Contacts" | (none) |
| C12 · Search bar | Search contacts by name or department | (none) |
| Contact list (custom) | Cards for: Mayor's office / Information line / Departments | `→ 04-P04 Department list`, `↗ 02-P06 Transport Department`, `↗ 03-P04 Trade Office` |
| C14 · Help sidebar | Crisis numbers | `↗ 99-P01 SOS landing` |

- [ ] **Step 1: Write the file from the scaffold**

- `<title>` → `Brno EN IA — 04 Public Services`
- Active nav → `<a href="04-services-info.html" class="active">04 Services</a>`
- `[H1 TITLE]` → `04 Public Services & Information`
- intro → `Cross-cutting services: Czech POINT, document legalization, the full department list, and citywide contacts.`

- [ ] **Step 2: Insert the 5 page-boxes**

Apply the page-container template with the tile data above. Order: 04-P01, 04-P02, 04-P03, 04-P04, 04-P05.

- [ ] **Step 3: Verify**

Run: `open /Users/panparek/Development/BrnoEN/iA/04-services-info.html`

Run: `grep -E 'id="04-p[0-9]+"' /Users/panparek/Development/BrnoEN/iA/04-services-info.html | wc -l`
Expected: `5`

---

## Task 7: Build `iA/99-sos.html`

**Files:**
- Create: `iA/99-sos.html`

**Important:** The `<body>` tag has `class="sos"` — this triggers the warning-color theme.

**Pages on this file:**

| Page ID | Anchor | Template | Title | URL slug |
|---------|--------|----------|-------|----------|
| 99-P01 | `99-p01` | T2 | I need help right now — SOS landing | `/sos` |
| 99-P02 | `99-p02` | T4 | Lost & Found | `/sos/lost-found` |
| 99-P03 | `99-p03` | T4 | Driver's license after theft | `/sos/driver-license-theft` |

**Component tiles per page:**

`99-P01` SOS landing:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner (warning) | "I need help right now" | (none) |
| C06 · SOS tile group | Lost & Found / Stolen DL / Crisis accommodation / Pay overdue waste fee | `→ 99-P02 Lost & Found`, `→ 99-P03 DL after theft`, `↗ 01-P05 Crisis accommodation`, `↗ 03-P03 Pay waste fee` |
| Emergency contacts (custom) | Mobile-first phone block: 112, 158, 155, 150, city crisis line | (none) |
| C14 · Help sidebar | "Not what you need?" | `⇡ Homepage`, `↗ 04-P05 Contacts` |

`99-P02` Lost & Found:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner (warning) | "Lost & Found" | (none) |
| C13 · Process steps | 1. Where you lost it → 2. Check online registry → 3. Visit Lost & Found office | `→ 99-P01 SOS landing` |
| C16 · Accordion FAQ | Lost on transit / Lost on street / How long items are held | (none) |
| C14 · Help sidebar (mobile-first) | Phone, address, hours; map link | `↗ 04-P05 Contacts` |

`99-P03` Driver's license after theft:
| Component | Content | Links |
|-----------|---------|-------|
| C03 · Page banner (warning) | "Driver's license — stolen" | (none) |
| C13 · Process steps | 1. Report theft to Police (158) → 2. Get police report → 3. Apply for replacement → 4. Temporary permit | `→ 99-P01 SOS landing`, `↗ 02-P03 DL replacement (full process)` |
| C14 · Help sidebar | Transport Department contact | `↗ 02-P06 Transport Department` |

- [ ] **Step 1: Write the file from the scaffold (with SOS variant)**

- `<title>` → `Brno EN IA — 99 SOS`
- `<body class="sos">` (this triggers the warning theme)
- Active nav → `<a href="99-sos.html" class="active">99 SOS</a>`
- `[H1 TITLE]` → `99 SOS — Crisis & urgent situations`
- intro → `Crisis-oriented landing for time-pressured users (lost ID, stolen vehicle, urgent shelter need). Designed for mobile-first access.`

- [ ] **Step 2: Insert the 3 page-boxes**

Apply the page-container template. Order: 99-P01, 99-P02, 99-P03.

- [ ] **Step 3: Verify**

Run: `open /Users/panparek/Development/BrnoEN/iA/99-sos.html`

Visual: background should have a warm warning tint (amber/yellow), page title in dark amber, `99 SOS` highlighted in red in the nav.

Run: `grep -E 'id="99-p[0-9]+"' /Users/panparek/Development/BrnoEN/iA/99-sos.html | wc -l`
Expected: `3`

Run: `grep -c 'class="sos"' /Users/panparek/Development/BrnoEN/iA/99-sos.html`
Expected: `1`

---

## Task 8: Cross-link verification + visual review

**Files:** No new files. Verify all 6 files (`index.html` + 5 sub-files + `_template.html`) work as a cohesive map.

- [ ] **Step 1: Verify every cross-file `↗` link resolves**

For each sub-file, extract every cross-file `↗` link target and verify the target anchor exists in the destination file.

Run: `grep -oE 'href="(0[1-4]-[a-z-]+\.html|99-sos\.html|index\.html)#[a-z0-9-]+"' /Users/panparek/Development/BrnoEN/iA/*.html | sort -u`

For each line of output (format: `path:href="filename.html#anchor"`):
1. Note the destination filename and anchor.
2. Run `grep -c 'id="<anchor>"' iA/<filename>` — must return `1`.

Any returning `0` is a broken link. Edit the source file to fix the anchor or the target file to add the anchor.

- [ ] **Step 2: Verify Czech POINT and SOS function as hubs**

Run: `grep -c '04-services-info\.html#04-p02' /Users/panparek/Development/BrnoEN/iA/*.html`
Expected: `04-P02` referenced in at least 4 files (01-family, 02-mobility, 03-business, 99-sos).

Run: `grep -c '99-sos\.html#99-p01' /Users/panparek/Development/BrnoEN/iA/*.html`
Expected: `99-P01` referenced in at least 3 files (index, 01-family, 04-services).

If counts are below threshold, add more cross-links (the spec says these are hubs).

- [ ] **Step 3: Visual review — open all files and click through**

Open each file in turn:
```
open /Users/panparek/Development/BrnoEN/iA/index.html
open /Users/panparek/Development/BrnoEN/iA/01-family-education.html
open /Users/panparek/Development/BrnoEN/iA/02-mobility-residence.html
open /Users/panparek/Development/BrnoEN/iA/03-business-fees.html
open /Users/panparek/Development/BrnoEN/iA/04-services-info.html
open /Users/panparek/Development/BrnoEN/iA/99-sos.html
```

In each, perform these checks:
1. Sticky header visible at top, current file highlighted in red.
2. All page-boxes render (check the count matches the table at the top of each task).
3. Click a few `↗` cross-file badges — should jump to the right file and scroll to the right page-box.
4. Click a few `→` same-file badges — should scroll to the right page-box within the file.
5. Legend block visible at the bottom.

- [ ] **Step 4: Anchor-uniqueness sanity check**

For each file, ensure no duplicate `id` attributes:
```
for f in /Users/panparek/Development/BrnoEN/iA/*.html; do
  echo "=== $f ==="
  grep -oE 'id="[^"]+"' "$f" | sort | uniq -d
done
```
Expected: each `===` line followed by no output (no duplicates).

- [ ] **Step 5: Delete `_template.html`**

After verification passes, the reference file is no longer needed. Remove it:
```
rm /Users/panparek/Development/BrnoEN/iA/_template.html
```

Final state of `iA/`:
```
iA/
├── index.html
├── 01-family-education.html
├── 02-mobility-residence.html
├── 03-business-fees.html
├── 04-services-info.html
└── 99-sos.html
```

---

## Self-review notes

**Spec coverage check:**
- ✅ All 5 files in spec → Tasks 2–7
- ✅ Container anatomy → reference templates + worked examples in Tasks 2 and 4
- ✅ Link badges (→ ↗ ⇡) → defined in reference assets, exercised in every task
- ✅ Czech POINT as hub → Task 8 Step 2 verifies cross-link count
- ✅ SOS file with warning theme → Task 7 (`<body class="sos">`)
- ✅ Sticky mini-sitemap header → in scaffold template, used in every file task
- ✅ Acceptance criteria 1–6 → covered by Task 8 verification steps
- ✅ Local numbering per file (01-PNN) → enforced by anchor-id format in every task

**Type/naming consistency check:**
- All anchor ids follow `<file>-p<NN>` lowercase format (`01-p02`, `99-p03`).
- All page-id labels use `<FILE>-P<NN>` upper-case format (`01-P02`, `99-P03`).
- Cross-file hrefs always use full filename + anchor.
- `index-p01` is the lone exception (homepage's only page) — documented in Task 2.
