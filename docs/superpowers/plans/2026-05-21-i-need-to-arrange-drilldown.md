# "I need to arrange" drill-down browser — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the L2 `I need to arrange` page + 9 L3 topic pages with a single-page 3-column drill-down browser (categories → sub-topics → tasks), modelled on `brno.cz/potrebuji-vyridit`.

**Architecture:** Pre-rendered HTML in `05-p01-life-admin.html` holds the entire dataset (10 categories × ~3 sub-topics × ~4 tasks). Page-local JS toggles `.active` classes and `data-mobile-view` attribute — no innerHTML manipulation, no data fetching, no framework. All leaf tasks link to `01-p04-health-insurance.html` (existing T4 sample) and the title text is injected as H1 label via the existing `wireframe.js` sessionStorage mechanism.

**Tech Stack:** Vanilla HTML5 / CSS3 / JS (no build step). Existing wireframe.css uses CSS custom properties (`var(--red)`, `var(--gray-700)` etc.). No tests — verification is visual inspection in browser (file://).

**Commit policy:** Per user's global rule, do NOT auto-commit between tasks. Final task asks user to commit the whole feature as one logical changeset.

---

## File structure

| File | Action | Notes |
|------|--------|-------|
| `Wireframe/05-p01-life-admin.html` | Rewrite | Single source of truth for browser DOM, dataset, and page-local JS |
| `Wireframe/wireframe.css` | Append | ~180 lines under `/* I need to arrange — drill-down browser */` |
| `Wireframe/wireframe.js` | Modify | Remove 9 L3 entries from TREE array |
| `Wireframe/sitemap.html` | Modify | Remove 9 L3 entries |
| `Wireframe/index.html` | Modify | Replace any L3 fragment links with `05-p01-life-admin.html#category` |
| `Wireframe/01-p01-live.html` … (all other wireframe pages with header nav, ~26 files) | Modify | Strip 9 L3 sub-items from `<div class="dropdown-menu">` under "I need to arrange" |
| `Wireframe/05-p02-documents.html` … `05-p10-construction-property.html` | Delete | Backup already at `Wireframe/_backup/i-need-to-arrange-2026-05-21/` |
| `/tmp/export_wireframe_pdf.py` | Modify | Drop 9 entries from PAGES list |

---

## Task 1: Add browser CSS

**Files:**
- Modify: `Wireframe/wireframe.css` (append at end of file)

- [ ] **Step 1: Append the CSS block**

Append to the end of `Wireframe/wireframe.css`:

```css
/* =========================================================
   I need to arrange — drill-down browser
   ========================================================= */

.lifeadm-search {
  background: var(--gray-100, #f4f4f4);
  padding: 24px 0;
  margin-bottom: 32px;
}
.lifeadm-search-inner {
  display: flex;
  gap: 0;
  align-items: stretch;
  max-width: 100%;
}
.lifeadm-search-input {
  flex: 1;
  border: 1px solid var(--gray-300, #d6d6d6);
  border-right: none;
  background: var(--white);
  padding: 14px 18px 14px 44px;
  font-size: 15px;
  line-height: 1.4;
  color: var(--gray-700, #333);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'><circle cx='11' cy='11' r='7'/><path d='m20 20-4-4'/></svg>");
  background-repeat: no-repeat;
  background-position: 14px center;
}
.lifeadm-search-input:focus {
  outline: none;
  border-color: var(--red);
}
.lifeadm-search-btn {
  background: var(--white);
  color: var(--red);
  border: 1px solid var(--red);
  padding: 14px 28px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
}
.lifeadm-search-btn:hover { background: var(--red); color: var(--white); }

.lifeadm-grid {
  display: grid;
  grid-template-columns: 280px 320px 1fr;
  gap: 0;
  border: 1px solid var(--gray-300, #d6d6d6);
  background: var(--white);
}

.lifeadm-cats {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--gray-300, #d6d6d6);
}
.lifeadm-cat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-900, #1a1a1a);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-200, #ebebeb);
  transition: background-color 0.12s;
}
.lifeadm-cat:last-child { border-bottom: none; }
.lifeadm-cat::after {
  content: "›";
  color: var(--gray-500, #999);
  font-size: 20px;
  line-height: 1;
}
.lifeadm-cat:hover { background: var(--gray-100, #f7f7f7); }
.lifeadm-cat.active {
  background: var(--red);
  color: var(--white);
}
.lifeadm-cat.active::after { color: var(--white); }

.lifeadm-subs {
  padding: 24px 24px;
  border-right: 1px solid var(--gray-300, #d6d6d6);
}
.lifeadm-sub-group { display: none; }
.lifeadm-sub-group.active { display: block; }
.lifeadm-sub-title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 20px 0;
  color: var(--gray-900, #1a1a1a);
}
.lifeadm-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--red);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-200, #ebebeb);
  transition: background-color 0.12s;
}
.lifeadm-sub:last-child { border-bottom: none; }
.lifeadm-sub:hover { background: var(--gray-100, #f7f7f7); }
.lifeadm-sub.active {
  background: var(--red);
  color: var(--white);
}
.lifeadm-sub.active::after {
  content: "›";
  color: var(--white);
  font-size: 20px;
  line-height: 1;
}

.lifeadm-tasks { padding: 24px 32px; }
.lifeadm-task-group { display: none; }
.lifeadm-task-group.active { display: block; }
.lifeadm-task-title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 20px 0;
  color: var(--gray-900, #1a1a1a);
}
.lifeadm-task {
  display: block;
  font-size: 15px;
  line-height: 1.5;
  color: var(--red);
  text-decoration: none;
  padding: 10px 0;
  border-bottom: 1px solid transparent;
}
.lifeadm-task:hover { text-decoration: underline; }

.lifeadm-back { display: none; }

/* Mobile sequential views */
@media (max-width: 767px) {
  .lifeadm-grid {
    display: block;
    border: none;
  }
  .lifeadm-cats,
  .lifeadm-subs,
  .lifeadm-tasks {
    border: none;
    padding: 0;
  }
  .lifeadm-back {
    display: block;
    padding: 14px 0;
    margin-bottom: 8px;
    color: var(--red);
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid var(--gray-200, #ebebeb);
  }
  .lifeadm-back::before { content: "‹ "; }

  .lifeadm-browser[data-mobile-view="categories"] .lifeadm-subs,
  .lifeadm-browser[data-mobile-view="categories"] .lifeadm-tasks { display: none; }

  .lifeadm-browser[data-mobile-view="subs"] .lifeadm-cats,
  .lifeadm-browser[data-mobile-view="subs"] .lifeadm-tasks { display: none; }
  .lifeadm-browser[data-mobile-view="subs"] .lifeadm-back-cats { display: block; }
  .lifeadm-browser[data-mobile-view="subs"] .lifeadm-back-subs { display: none; }

  .lifeadm-browser[data-mobile-view="tasks"] .lifeadm-cats,
  .lifeadm-browser[data-mobile-view="tasks"] .lifeadm-subs { display: none; }
  .lifeadm-browser[data-mobile-view="tasks"] .lifeadm-back-subs { display: block; }
  .lifeadm-browser[data-mobile-view="tasks"] .lifeadm-back-cats { display: none; }
}

/* Desktop always shows all 3 columns */
@media (min-width: 768px) {
  .lifeadm-back { display: none !important; }
}
```

- [ ] **Step 2: Visual sanity check**

This step has no visible effect on its own — the HTML it styles doesn't exist yet. Move on to Task 2.

---

## Task 2: Rewrite L2 page HTML

**Files:**
- Modify: `Wireframe/05-p01-life-admin.html` (full rewrite)

The new page keeps the existing nav/header/footer scaffolding but replaces `<main>` content with the search bar + 3-column browser. All 10 categories' DOM is pre-rendered.

- [ ] **Step 1: Open existing file and replace `<main>` … `</main>` block**

Open `Wireframe/05-p01-life-admin.html`. Find the `<main>` block (lines ~127–279). Replace the entire `<main>` … `</main>` block with the content below.

Keep everything ABOVE `<main>` (DOCTYPE, head, body open, wireframe widget, top-bar, header nav) as-is. Keep everything BELOW `</main>` (footer + body/html close) as-is.

**However**, in the header nav block, also remove the 9 L3 sub-links from the "I need to arrange" dropdown — replace the contents of `<div class="dropdown-menu">` (the one under "I need to arrange") with just the single self-link, AND remove the `<span class="caret"></span>` from the active nav-link. The same cleanup happens in Task 5 across all other pages.

Find:
```html
      <div class="nav-item">
        <a class="nav-link active" href="05-p01-life-admin.html">I need to arrange <span class="caret"></span></a>
        <div class="dropdown-menu">
        <a href="05-p01-life-admin.html" style="font-weight:600;">All you need to handle</a>
        <a href="05-p02-documents.html">Documents</a>
        <a href="05-p03-visa-residency.html">Visa &amp; residency</a>
        <a href="05-p04-transport-vehicles.html">Transport &amp; vehicles</a>
        <a href="05-p05-fees-payments.html">Fees, payments &amp; fines</a>
        <a href="05-p06-document-legalization.html">Document legalization &amp; vidimation</a>
        <a href="05-p07-social-services-family.html">Social services &amp; family</a>
        <a href="05-p08-environment-waste.html">Environment &amp; waste</a>
        <a href="05-p09-city-hall-services.html">City hall services</a>
        <a href="05-p10-construction-property.html">Construction &amp; city property</a>
        </div>
      </div>
```

Replace with:
```html
      <div class="nav-item">
        <a class="nav-link active" href="05-p01-life-admin.html">I need to arrange</a>
      </div>
```

- [ ] **Step 2: Write the new `<main>` block**

Replace the existing `<main>`…`</main>` with this:

```html
<main>
  <!-- C03 Page banner + breadcrumbs -->
  <section class="page-header">
    <div class="container">
      <nav class="breadcrumbs">
        <a href="index.html">Homepage</a>
        <span class="sep">›</span>
        <span class="current">I need to arrange</span>
      </nav>
      <h1 class="title-banner">I need to arrange</h1>
    </div>
  </section>

  <!-- Search bar -->
  <div class="lifeadm-search">
    <div class="container">
      <form class="lifeadm-search-inner" onsubmit="event.preventDefault();">
        <input class="lifeadm-search-input" type="search" placeholder="Search across all admin tasks — e.g. driver's licence, waste fee, residence permit…" aria-label="Search admin tasks">
        <button class="lifeadm-search-btn" type="submit">Search</button>
      </form>
    </div>
  </div>

  <section class="section" style="padding-top:0;">
    <div class="container">
      <div class="lifeadm-browser" data-mobile-view="categories">

        <!-- Column 1: Categories -->
        <nav class="lifeadm-cats" aria-label="Topic categories">
          <a href="#popular"      class="lifeadm-cat active" data-cat="popular">Most popular</a>
          <a href="#documents"    class="lifeadm-cat" data-cat="documents">Documents</a>
          <a href="#visa"         class="lifeadm-cat" data-cat="visa">Visa &amp; residency</a>
          <a href="#transport"    class="lifeadm-cat" data-cat="transport">Transport &amp; vehicles</a>
          <a href="#fees"         class="lifeadm-cat" data-cat="fees">Fees, payments &amp; fines</a>
          <a href="#legalization" class="lifeadm-cat" data-cat="legalization">Document legalization &amp; vidimation</a>
          <a href="#social"       class="lifeadm-cat" data-cat="social">Social services &amp; family</a>
          <a href="#environment"  class="lifeadm-cat" data-cat="environment">Environment &amp; waste</a>
          <a href="#cityhall"     class="lifeadm-cat" data-cat="cityhall">City hall services</a>
          <a href="#construction" class="lifeadm-cat" data-cat="construction">Construction &amp; city property</a>
        </nav>

        <!-- Column 2: Sub-topic groups (one per category, only one .active at a time) -->
        <div class="lifeadm-subs">
          <a href="#" class="lifeadm-back lifeadm-back-cats">Categories</a>

          <!-- POPULAR -->
          <div class="lifeadm-sub-group active" data-cat="popular">
            <h3 class="lifeadm-sub-title">Most popular</h3>
            <a href="#popular/driver-licence" class="lifeadm-sub active" data-sub="driver-licence">Driver's licence</a>
            <a href="#popular/waste-fee"      class="lifeadm-sub" data-sub="waste-fee">Pay waste fee</a>
            <a href="#popular/vehicle-reg"    class="lifeadm-sub" data-sub="vehicle-reg">Vehicle registration</a>
            <a href="#popular/czechpoint"     class="lifeadm-sub" data-sub="czechpoint">Czech POINT extracts</a>
          </div>

          <!-- DOCUMENTS -->
          <div class="lifeadm-sub-group" data-cat="documents">
            <h3 class="lifeadm-sub-title">Documents</h3>
            <a href="#documents/driver-licence" class="lifeadm-sub" data-sub="driver-licence">Driver's licence</a>
            <a href="#documents/czechpoint"     class="lifeadm-sub" data-sub="czechpoint">Czech POINT extracts</a>
            <a href="#documents/updates"        class="lifeadm-sub" data-sub="updates">Document changes &amp; updates</a>
          </div>

          <!-- VISA -->
          <div class="lifeadm-sub-group" data-cat="visa">
            <h3 class="lifeadm-sub-title">Visa &amp; residency</h3>
            <a href="#visa/permits"        class="lifeadm-sub" data-sub="permits">Residence permits</a>
            <a href="#visa/registration"   class="lifeadm-sub" data-sub="registration">Address &amp; pobyt registration</a>
            <a href="#visa/foreign-docs"   class="lifeadm-sub" data-sub="foreign-docs">Documents from abroad</a>
          </div>

          <!-- TRANSPORT -->
          <div class="lifeadm-sub-group" data-cat="transport">
            <h3 class="lifeadm-sub-title">Transport &amp; vehicles</h3>
            <a href="#transport/register" class="lifeadm-sub" data-sub="register">Register your vehicle</a>
            <a href="#transport/dereg"    class="lifeadm-sub" data-sub="dereg">Deregistration &amp; export</a>
            <a href="#transport/parking"  class="lifeadm-sub" data-sub="parking">Parking &amp; road permits</a>
          </div>

          <!-- FEES -->
          <div class="lifeadm-sub-group" data-cat="fees">
            <h3 class="lifeadm-sub-title">Fees, payments &amp; fines</h3>
            <a href="#fees/waste"   class="lifeadm-sub" data-sub="waste">Pay your waste fee</a>
            <a href="#fees/fines"   class="lifeadm-sub" data-sub="fines">Fines &amp; penalties</a>
            <a href="#fees/other"   class="lifeadm-sub" data-sub="other">Other fees &amp; appeals</a>
          </div>

          <!-- LEGALIZATION -->
          <div class="lifeadm-sub-group" data-cat="legalization">
            <h3 class="lifeadm-sub-title">Document legalization &amp; vidimation</h3>
            <a href="#legalization/czechpoint"   class="lifeadm-sub" data-sub="czechpoint">Czech POINT services</a>
            <a href="#legalization/verification" class="lifeadm-sub" data-sub="verification">Verification of documents</a>
            <a href="#legalization/international" class="lifeadm-sub" data-sub="international">International document use</a>
          </div>

          <!-- SOCIAL -->
          <div class="lifeadm-sub-group" data-cat="social">
            <h3 class="lifeadm-sub-title">Social services &amp; family</h3>
            <a href="#social/family"     class="lifeadm-sub" data-sub="family">Family &amp; children</a>
            <a href="#social/disability" class="lifeadm-sub" data-sub="disability">Disability &amp; senior support</a>
            <a href="#social/crisis"     class="lifeadm-sub" data-sub="crisis">Family crisis &amp; vulnerable groups</a>
          </div>

          <!-- ENVIRONMENT -->
          <div class="lifeadm-sub-group" data-cat="environment">
            <h3 class="lifeadm-sub-title">Environment &amp; waste</h3>
            <a href="#environment/waste-fee" class="lifeadm-sub" data-sub="waste-fee">Pay your waste fee</a>
            <a href="#environment/bins"      class="lifeadm-sub" data-sub="bins">Bins &amp; sorting</a>
            <a href="#environment/services"  class="lifeadm-sub" data-sub="services">Environment services</a>
          </div>

          <!-- CITYHALL -->
          <div class="lifeadm-sub-group" data-cat="cityhall">
            <h3 class="lifeadm-sub-title">City hall services</h3>
            <a href="#cityhall/formal"  class="lifeadm-sub" data-sub="formal">Submit a formal request</a>
            <a href="#cityhall/honors"  class="lifeadm-sub" data-sub="honors">City honors &amp; ceremonies</a>
            <a href="#cityhall/career"  class="lifeadm-sub" data-sub="career">Career &amp; administration</a>
          </div>

          <!-- CONSTRUCTION -->
          <div class="lifeadm-sub-group" data-cat="construction">
            <h3 class="lifeadm-sub-title">Construction &amp; city property</h3>
            <a href="#construction/permits"  class="lifeadm-sub" data-sub="permits">Building permits</a>
            <a href="#construction/property" class="lifeadm-sub" data-sub="property">City property &amp; spaces</a>
            <a href="#construction/networks" class="lifeadm-sub" data-sub="networks">Engineering networks &amp; utilities</a>
          </div>
        </div>

        <!-- Column 3: Task groups (one per cat+sub combination, only one .active at a time) -->
        <div class="lifeadm-tasks">
          <a href="#" class="lifeadm-back lifeadm-back-subs">Most popular</a>

          <!-- POPULAR / Driver's licence -->
          <div class="lifeadm-task-group active" data-cat="popular" data-sub="driver-licence">
            <h3 class="lifeadm-task-title">Driver's licence</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Replace lost, stolen or damaged driver's licence</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Renew expired driver's licence</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Exchange foreign driver's licence for Czech one</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for international driver's licence</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Driver record extract (body)</a>
          </div>

          <!-- POPULAR / Waste fee -->
          <div class="lifeadm-task-group" data-cat="popular" data-sub="waste-fee">
            <h3 class="lifeadm-task-title">Pay waste fee</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Pay your annual waste fee online</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Who owes — residents vs visitors</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for instalment plan</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Reduced rate (senior, ZTP, low income)</a>
          </div>

          <!-- POPULAR / Vehicle registration -->
          <div class="lifeadm-task-group" data-cat="popular" data-sub="vehicle-reg">
            <h3 class="lifeadm-task-title">Vehicle registration</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Register a new vehicle</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Change of vehicle owner</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Vehicle import from abroad (COC, homologation)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">License plates — request, replace, lost</a>
          </div>

          <!-- POPULAR / Czech POINT -->
          <div class="lifeadm-task-group" data-cat="popular" data-sub="czechpoint">
            <h3 class="lifeadm-task-title">Czech POINT extracts</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Find your nearest Czech POINT</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Trade Register extract (živnostenský rejstřík)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Cadastre extract (katastr nemovitostí)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Criminal record extract (rejstřík trestů)</a>
          </div>

          <!-- DOCUMENTS / Driver's licence -->
          <div class="lifeadm-task-group" data-cat="documents" data-sub="driver-licence">
            <h3 class="lifeadm-task-title">Driver's licence</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Driver's licence — lost, stolen, damaged</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Replace expired licence (validity end)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for international driver's licence</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Driver record extract (body)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Conditional driving (glasses, contacts)</a>
          </div>

          <!-- DOCUMENTS / Czech POINT -->
          <div class="lifeadm-task-group" data-cat="documents" data-sub="czechpoint">
            <h3 class="lifeadm-task-title">Czech POINT extracts</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Find your nearest Czech POINT</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Trade Register extract (živnostenský rejstřík)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Cadastre extract (katastr nemovitostí)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Criminal record extract (rejstřík trestů)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Driver record extract</a>
          </div>

          <!-- DOCUMENTS / Updates -->
          <div class="lifeadm-task-group" data-cat="documents" data-sub="updates">
            <h3 class="lifeadm-task-title">Document changes &amp; updates</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Name/surname change (after marriage etc.)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Professional driver licence (PIC)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Driver licence upgrade (B → C, etc.)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Document recovery (lost original)</a>
          </div>

          <!-- VISA / Permits -->
          <div class="lifeadm-task-group" data-cat="visa" data-sub="permits">
            <h3 class="lifeadm-task-title">Residence permits</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for long-term residence</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for permanent residence (after 5 years)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Visa types overview (Schengen, employment, study)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">EU citizen registration (free, optional)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Emergency travel document</a>
          </div>

          <!-- VISA / Registration -->
          <div class="lifeadm-task-group" data-cat="visa" data-sub="registration">
            <h3 class="lifeadm-task-title">Address &amp; pobyt registration</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Address registration (přihlášení k pobytu)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Provide data from citizens-register</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Set up delivery address only</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">End permanent residence in CZ</a>
          </div>

          <!-- VISA / Foreign docs -->
          <div class="lifeadm-task-group" data-cat="visa" data-sub="foreign-docs">
            <h3 class="lifeadm-task-title">Documents from abroad</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Document legalization &amp; apostille</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Certified Czech translation list</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Higher verification of marriage/birth certificates</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Recognition of foreign qualifications</a>
          </div>

          <!-- TRANSPORT / Register -->
          <div class="lifeadm-task-group" data-cat="transport" data-sub="register">
            <h3 class="lifeadm-task-title">Register your vehicle</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Register a new vehicle</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Change of vehicle owner</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Vehicle import from abroad (COC, homologation)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">License plates — request, replace, lost</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Custom plates (RZP) &amp; electric plates</a>
          </div>

          <!-- TRANSPORT / Dereg -->
          <div class="lifeadm-task-group" data-cat="transport" data-sub="dereg">
            <h3 class="lifeadm-task-title">Deregistration &amp; export</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Vehicle deregistration / export</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Vehicle scrapping (zánik vozidla)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Temporary withdrawal</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Historical &amp; sports vehicle registration</a>
          </div>

          <!-- TRANSPORT / Parking -->
          <div class="lifeadm-task-group" data-cat="transport" data-sub="parking">
            <h3 class="lifeadm-task-title">Parking &amp; road permits</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Reserved disabled parking</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Reserved parking for businesses</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Road closure permit</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Connection of property to local road</a>
          </div>

          <!-- FEES / Waste -->
          <div class="lifeadm-task-group" data-cat="fees" data-sub="waste">
            <h3 class="lifeadm-task-title">Pay your waste fee</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Pay online (now)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Who owes — residents vs visitors</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Instalment plan for waste fee</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Reduced rate (senior, disabled, low income)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Late payment &amp; surcharges</a>
          </div>

          <!-- FEES / Fines -->
          <div class="lifeadm-task-group" data-cat="fees" data-sub="fines">
            <h3 class="lifeadm-task-title">Fines &amp; penalties</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Pay a fine (Municipal Police)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Pay a fine (Magistrát departments)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for instalment plan or postponement</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Dispute or appeal a fine</a>
          </div>

          <!-- FEES / Other -->
          <div class="lifeadm-task-group" data-cat="fees" data-sub="other">
            <h3 class="lifeadm-task-title">Other fees &amp; appeals</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Trade licence fees</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Parking permit fees</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Building permit fees</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Local fee appeal (Odbor rozpočtu)</a>
          </div>

          <!-- LEGALIZATION / Czech POINT -->
          <div class="lifeadm-task-group" data-cat="legalization" data-sub="czechpoint">
            <h3 class="lifeadm-task-title">Czech POINT services</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Find your nearest Czech POINT</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Extracts available at Czech POINT</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Czech POINT@home (online with electronic ID)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Czech POINT — fees overview</a>
          </div>

          <!-- LEGALIZATION / Verification -->
          <div class="lifeadm-task-group" data-cat="legalization" data-sub="verification">
            <h3 class="lifeadm-task-title">Verification of documents</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Vidimation (copy verification)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Legalization (signature verification)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Court Czech POINT alternative</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Lost original — document recovery</a>
          </div>

          <!-- LEGALIZATION / International -->
          <div class="lifeadm-task-group" data-cat="legalization" data-sub="international">
            <h3 class="lifeadm-task-title">International document use</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Higher verification (apostille) for use abroad</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apostille on matrika documents (birth/marriage)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Foreign documents for use in CZ (apostille + translation)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Certified Czech translators directory</a>
          </div>

          <!-- SOCIAL / Family -->
          <div class="lifeadm-task-group" data-cat="social" data-sub="family">
            <h3 class="lifeadm-task-title">Family &amp; children</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">School enrollment (MŠ &amp; ZŠ)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Compulsory schooling abroad (special agenda)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Foster care (náhradní rodinná péče)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Single-parent housing (samoživitelé)</a>
          </div>

          <!-- SOCIAL / Disability -->
          <div class="lifeadm-task-group" data-cat="social" data-sub="disability">
            <h3 class="lifeadm-task-title">Disability &amp; senior support</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Disability parking permit</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Euroklíč (universal access key)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Senior &amp; disability help (OSP referral)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">SOS emergency button — 24/7 monitoring</a>
          </div>

          <!-- SOCIAL / Crisis -->
          <div class="lifeadm-task-group" data-cat="social" data-sub="crisis">
            <h3 class="lifeadm-task-title">Family crisis &amp; vulnerable groups</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Family in social exclusion (pomoc rodinám)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Youth &amp; young adults social aid</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Crisis life situations — housing</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Social aid grants for organisations</a>
          </div>

          <!-- ENVIRONMENT / Waste fee -->
          <div class="lifeadm-task-group" data-cat="environment" data-sub="waste-fee">
            <h3 class="lifeadm-task-title">Pay your waste fee</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Pay online (now)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Who owes — residents vs visitors</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Reduced rate (senior, ZTP, low income)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Late payment &amp; surcharges</a>
          </div>

          <!-- ENVIRONMENT / Bins -->
          <div class="lifeadm-task-group" data-cat="environment" data-sub="bins">
            <h3 class="lifeadm-task-title">Bins &amp; sorting</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Request a new mixed-waste bin</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Replace damaged bin</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Sorted waste — what goes where</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Hazardous &amp; bulky waste collection</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Find your nearest sběrný dvůr</a>
          </div>

          <!-- ENVIRONMENT / Services -->
          <div class="lifeadm-task-group" data-cat="environment" data-sub="services">
            <h3 class="lifeadm-task-title">Environment services</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Tree felling permission</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Water management permit</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Environment information request</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Brownfield &amp; contamination reports</a>
          </div>

          <!-- CITYHALL / Formal -->
          <div class="lifeadm-task-group" data-cat="cityhall" data-sub="formal">
            <h3 class="lifeadm-task-title">Submit a formal request</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">File a petition</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Submit a complaint</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Information request (Act 106)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Submission to the Council or Assembly</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Personal data request (GDPR)</a>
          </div>

          <!-- CITYHALL / Honors -->
          <div class="lifeadm-task-group" data-cat="cityhall" data-sub="honors">
            <h3 class="lifeadm-task-title">City honors &amp; ceremonies</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Brno City Awards (Ceny města Brna)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Honorary citizenship of Brno</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Use Brno logo or flag (permission)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Public assemblies notification</a>
          </div>

          <!-- CITYHALL / Career -->
          <div class="lifeadm-task-group" data-cat="cityhall" data-sub="career">
            <h3 class="lifeadm-task-title">Career &amp; administration</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Open positions at Magistrát</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Confirmation of employment from closed organisation</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Street/building numbering</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Induction loops for hearing-impaired</a>
          </div>

          <!-- CONSTRUCTION / Permits -->
          <div class="lifeadm-task-group" data-cat="construction" data-sub="permits">
            <h3 class="lifeadm-task-title">Building permits</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Apply for building permit</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Additional building permit (dodatečné)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Approval (kolaudace) of new building</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Demolition permit (povolení odstranění)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Change of building use (změna v užívání)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Preliminary information request</a>
          </div>

          <!-- CONSTRUCTION / Property -->
          <div class="lifeadm-task-group" data-cat="construction" data-sub="property">
            <h3 class="lifeadm-task-title">City property &amp; spaces</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Rent city-owned commercial space</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Acquire/sell/exchange city property</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Easement (věcné břemeno) for utilities</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Public space occupation permit</a>
          </div>

          <!-- CONSTRUCTION / Networks -->
          <div class="lifeadm-task-group" data-cat="construction" data-sub="networks">
            <h3 class="lifeadm-task-title">Engineering networks &amp; utilities</h3>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Water management permit (nakládání s vodami)</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Excavation work permit</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Heritage/monument area approval</a>
            <a href="01-p04-health-insurance.html" class="lifeadm-task">Spatial plan inspection &amp; changes</a>
          </div>

        </div>
      </div>
    </div>
  </section>
</main>
```

- [ ] **Step 3: Visual verification (desktop)**

Open `Wireframe/05-p01-life-admin.html` in a browser (e.g. `open Wireframe/05-p01-life-admin.html` on macOS, or via a local server).

Expected:
- Page banner red, breadcrumbs visible.
- Gray search bar below banner.
- 3-column browser:
  - Col 1: 10 category links, first one ("Most popular") highlighted in red with white text.
  - Col 2: H3 "Most popular" + 4 sub-topic links, first one ("Driver's licence") highlighted in red.
  - Col 3: H3 "Driver's licence" + 5 task links in red typography.

If only col 1 appears or columns look stacked: check viewport (must be ≥ 768px) and re-check the CSS file was saved.

- [ ] **Step 4: Visual verification (mobile)**

Resize browser to < 768px width (or use device emulator).

Expected:
- Only col 1 visible (full-width list of 10 categories).
- "‹ Categories" back link is NOT visible (we're at the root view).
- Clicking a category does nothing yet (no JS attached) — this is expected; move to Task 3.

---

## Task 3: Add browser JS (clicks + hash + mobile views)

**Files:**
- Modify: `Wireframe/05-p01-life-admin.html` (append `<script>` block just before `</body>`)

- [ ] **Step 1: Insert the script block**

Find the closing `</body>` tag near the bottom of `05-p01-life-admin.html`. Insert the following BEFORE it (after `</footer>` and any existing script references):

```html
<script>
(function () {
  var browser = document.querySelector('.lifeadm-browser');
  if (!browser) return;

  var cats        = browser.querySelectorAll('.lifeadm-cat');
  var subGroups   = browser.querySelectorAll('.lifeadm-sub-group');
  var taskGroups  = browser.querySelectorAll('.lifeadm-task-group');
  var backToCats  = browser.querySelector('.lifeadm-back-cats');
  var backToSubs  = browser.querySelector('.lifeadm-back-subs');

  function setActive(nodeList, predicate) {
    nodeList.forEach(function (n) {
      n.classList.toggle('active', predicate(n));
    });
  }

  function firstSubOf(catKey) {
    var grp = browser.querySelector('.lifeadm-sub-group[data-cat="' + catKey + '"]');
    if (!grp) return null;
    var first = grp.querySelector('.lifeadm-sub');
    return first ? first.getAttribute('data-sub') : null;
  }

  function categoryLabel(catKey) {
    var a = browser.querySelector('.lifeadm-cat[data-cat="' + catKey + '"]');
    return a ? a.textContent.trim() : '';
  }

  function applyState(catKey, subKey) {
    // Default if missing/invalid
    var catEl = browser.querySelector('.lifeadm-cat[data-cat="' + catKey + '"]');
    if (!catEl) { catKey = 'popular'; }
    if (!subKey) { subKey = firstSubOf(catKey); }
    // If sub doesn't exist in this cat, fall back to first
    var subEl = browser.querySelector('.lifeadm-sub-group[data-cat="' + catKey + '"] .lifeadm-sub[data-sub="' + subKey + '"]');
    if (!subEl) { subKey = firstSubOf(catKey); }

    setActive(cats,       function (n) { return n.getAttribute('data-cat') === catKey; });
    setActive(subGroups,  function (n) { return n.getAttribute('data-cat') === catKey; });
    var subsInGrp = browser.querySelectorAll('.lifeadm-sub-group[data-cat="' + catKey + '"] .lifeadm-sub');
    setActive(subsInGrp,  function (n) { return n.getAttribute('data-sub') === subKey; });
    setActive(taskGroups, function (n) {
      return n.getAttribute('data-cat') === catKey && n.getAttribute('data-sub') === subKey;
    });

    // Update mobile back-link labels
    if (backToSubs) backToSubs.textContent = categoryLabel(catKey);
  }

  function writeHash(catKey, subKey) {
    var h = '#' + catKey + (subKey ? '/' + subKey : '');
    history.replaceState(null, '', h);
  }

  function parseHash() {
    var h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return { cat: 'popular', sub: null };
    var parts = h.split('/');
    return { cat: parts[0] || 'popular', sub: parts[1] || null };
  }

  // Init from hash
  var initial = parseHash();
  applyState(initial.cat, initial.sub);
  // On initial load: if there's a hash with a sub, jump to mobile view 3; if just cat, view 2; if no hash, view 1
  if (window.location.hash) {
    var v = initial.sub ? 'tasks' : 'subs';
    if (window.matchMedia('(max-width: 767px)').matches) {
      browser.setAttribute('data-mobile-view', v);
    }
  }

  // Category click
  cats.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var catKey = a.getAttribute('data-cat');
      var subKey = firstSubOf(catKey);
      applyState(catKey, subKey);
      writeHash(catKey, subKey);
      if (window.matchMedia('(max-width: 767px)').matches) {
        browser.setAttribute('data-mobile-view', 'subs');
        window.scrollTo(0, 0);
      }
    });
  });

  // Sub-topic click
  browser.querySelectorAll('.lifeadm-sub').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var subKey = a.getAttribute('data-sub');
      var catKey = a.closest('.lifeadm-sub-group').getAttribute('data-cat');
      applyState(catKey, subKey);
      writeHash(catKey, subKey);
      if (window.matchMedia('(max-width: 767px)').matches) {
        browser.setAttribute('data-mobile-view', 'tasks');
        window.scrollTo(0, 0);
      }
    });
  });

  // Mobile back links
  if (backToCats) {
    backToCats.addEventListener('click', function (e) {
      e.preventDefault();
      browser.setAttribute('data-mobile-view', 'categories');
      window.scrollTo(0, 0);
    });
  }
  if (backToSubs) {
    backToSubs.addEventListener('click', function (e) {
      e.preventDefault();
      browser.setAttribute('data-mobile-view', 'subs');
      window.scrollTo(0, 0);
    });
  }
})();
</script>
</body>
```

(Note: the closing `</body>` tag is shown above to mark where the script block goes — it was already there; don't add a second one.)

- [ ] **Step 2: Verify desktop click behavior**

Reload `05-p01-life-admin.html` in browser.

- Click "Documents" in col 1 → col 1 highlight moves to Documents (red), col 2 shows H3 "Documents" with 3 sub-topics, col 3 shows H3 "Driver's licence" with 5 tasks. URL becomes `…/05-p01-life-admin.html#documents/driver-licence`.
- Click "Czech POINT extracts" in col 2 → col 2 highlight moves, col 3 shows H3 "Czech POINT extracts" with 5 tasks. URL becomes `…#documents/czechpoint`.
- Click "Visa & residency" in col 1 → col 2 swaps to that category's 3 subs, col 3 shows first sub's tasks. URL updates.

If clicks do nothing: open browser DevTools console, look for JS errors. Likely cause: missing `data-cat` or `data-sub` attribute typo in HTML.

- [ ] **Step 3: Verify deep-link**

Manually visit `…/05-p01-life-admin.html#construction/property` in the URL bar.

Expected: page loads with "Construction & city property" active in col 1, "City property & spaces" active in col 2, and its 4 tasks in col 3.

Try `…#nonsense/whatever`: should fall back to default (`popular` + `driver-licence`).

- [ ] **Step 4: Verify mobile click flow**

Resize to < 768px width (or use device emulator). Reload page without a hash (or after clearing the hash).

- Initial view: only col 1 visible (10 categories), no back link.
- Click "Documents" → col 1 hidden, col 2 shows with "‹ Categories" back link on top + H3 "Documents" + 3 subs.
- Click "Czech POINT extracts" → col 2 hidden, col 3 shows with "‹ Documents" back link on top + H3 + 5 tasks.
- Click "‹ Documents" → returns to col 2 (subs).
- Click "‹ Categories" → returns to col 1.
- URL hash updates as on desktop.

- [ ] **Step 5: Verify task click navigates to T4 with label injection**

In any view, click any task link (e.g., "Replace lost, stolen or damaged driver's licence").

Expected: browser navigates to `01-p04-health-insurance.html`. The H1 banner on that page shows the original wireframe title + injected label "— Replace lost, stolen or damaged driver's licence" (this is existing wireframe.js behavior — no new code needed).

If the label doesn't appear: confirm `<script src="wireframe.js" defer></script>` is still in the head of `05-p01-life-admin.html` (it should be untouched from the original page).

---

## Task 4: Sidepanel TREE cleanup in wireframe.js

**Files:**
- Modify: `Wireframe/wireframe.js:23-32` (the 9 L3 entries within the TREE array)

- [ ] **Step 1: Remove 9 L3 entries from TREE**

Open `Wireframe/wireframe.js`. Find the TREE array (starts around line 17). Locate this block:

```js
    { divider: 'Main sections' },
    { label: 'I need to arrange', href: '05-p01-life-admin.html', level: 2, tag: 'T3' },
    { label: 'Documents', href: '05-p02-documents.html', level: 3, tag: 'T6' },
    { label: 'Visa & residency', href: '05-p03-visa-residency.html', level: 3, tag: 'T6' },
    { label: 'Transport & vehicles', href: '05-p04-transport-vehicles.html', level: 3, tag: 'T6' },
    { label: 'Fees, payments & fines', href: '05-p05-fees-payments.html', level: 3, tag: 'T6' },
    { label: 'Document legalization & vidimation', href: '05-p06-document-legalization.html', level: 3, tag: 'T6' },
    { label: 'Social services & family', href: '05-p07-social-services-family.html', level: 3, tag: 'T6' },
    { label: 'Environment & waste', href: '05-p08-environment-waste.html', level: 3, tag: 'T6' },
    { label: 'City hall services', href: '05-p09-city-hall-services.html', level: 3, tag: 'T6' },
    { label: 'Construction & city property', href: '05-p10-construction-property.html', level: 3, tag: 'T6' },
    { label: 'Live', href: '01-p01-live.html', level: 2, tag: 'T2' },
```

Replace with:

```js
    { divider: 'Main sections' },
    { label: 'I need to arrange', href: '05-p01-life-admin.html', level: 2, tag: 'T3' },
    { label: 'Live', href: '01-p01-live.html', level: 2, tag: 'T2' },
```

- [ ] **Step 2: Verify sidepanel**

Open any wireframe page in a browser. Click the floating wireframe widget button (top-left or wherever the toggle is).

Expected: sidepanel TREE shows "I need to arrange" as a single entry (no more 9 L3 sub-rows under it). All other sections (Live, Work, etc.) unchanged.

---

## Task 5: Header nav cleanup across all wireframe pages

**Files:**
- Modify: ~26 files in `Wireframe/` that contain `<a class="nav-link... href="05-p01-life-admin.html">I need to arrange`

The dropdown under "I need to arrange" in EVERY page's header nav needs the 9 L3 sub-links stripped, leaving just the parent self-link, and the `<span class="caret"></span>` removed from the parent. The previous task already did this for `05-p01-life-admin.html` itself. This task does it for the rest.

- [ ] **Step 1: List affected files**

Run from project root:
```bash
grep -l 'href="05-p02-documents.html"' Wireframe/*.html
```

Expected: a list of ~26 .html files (everything except `05-p01-life-admin.html` and the 9 L3 files already in backup).

- [ ] **Step 2: Run a single Python script to do the substitution**

Save this as `/tmp/clean_nav.py` and run `python3 /tmp/clean_nav.py`:

```python
#!/usr/bin/env python3
"""Strip 9 L3 sub-links and caret from 'I need to arrange' header nav across all wireframe pages."""
import glob
import re

OLD_BLOCK_PATTERN = re.compile(
    r'<div class="nav-item">\s*'
    r'<a class="nav-link( active)?" href="05-p01-life-admin\.html">I need to arrange\s*<span class="caret"></span></a>\s*'
    r'<div class="dropdown-menu">\s*'
    r'<a href="05-p01-life-admin\.html"[^>]*>All you need to handle</a>\s*'
    r'<a href="05-p02-documents\.html">Documents</a>\s*'
    r'<a href="05-p03-visa-residency\.html">Visa &amp; residency</a>\s*'
    r'<a href="05-p04-transport-vehicles\.html">Transport &amp; vehicles</a>\s*'
    r'<a href="05-p05-fees-payments\.html">Fees, payments &amp; fines</a>\s*'
    r'<a href="05-p06-document-legalization\.html">Document legalization &amp; vidimation</a>\s*'
    r'<a href="05-p07-social-services-family\.html">Social services &amp; family</a>\s*'
    r'<a href="05-p08-environment-waste\.html">Environment &amp; waste</a>\s*'
    r'<a href="05-p09-city-hall-services\.html">City hall services</a>\s*'
    r'<a href="05-p10-construction-property\.html">Construction &amp; city property</a>\s*'
    r'</div>\s*'
    r'</div>',
    re.DOTALL,
)

def replacement(m):
    active = m.group(1) or ''
    return (
        '<div class="nav-item">\n'
        f'        <a class="nav-link{active}" href="05-p01-life-admin.html">I need to arrange</a>\n'
        '      </div>'
    )

count = 0
for path in glob.glob('Wireframe/*.html'):
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    new = OLD_BLOCK_PATTERN.sub(replacement, src)
    if new != src:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new)
        count += 1
        print(f'  cleaned: {path}')
print(f'\nDone — {count} files modified.')
```

Expected output:
```
  cleaned: Wireframe/01-p01-live.html
  cleaned: Wireframe/01-p02-transport.html
  ... (~26 lines) ...

Done — 26 files modified.
```

If the count is 0 or very low: the regex didn't match. Check by hand whether the block format in the wireframe pages differs (whitespace, attribute order). Adjust regex and re-run.

- [ ] **Step 3: Verify header nav visually**

Open any page (e.g., `Wireframe/01-p01-live.html`) in browser. Hover "I need to arrange" in the main nav.

Expected: NO dropdown appears (the link is now flat). Clicking navigates to `05-p01-life-admin.html`.

Also hover other nav items (Live, Work, Enjoy, etc.) — their dropdowns should still work unchanged.

- [ ] **Step 4: Delete the helper script**

```bash
rm /tmp/clean_nav.py
```

---

## Task 6: Delete 9 L3 source files

**Files:**
- Delete: `Wireframe/05-p02-documents.html` … `Wireframe/05-p10-construction-property.html` (9 files)

- [ ] **Step 1: Confirm backup intact**

```bash
ls Wireframe/_backup/i-need-to-arrange-2026-05-21/
```

Expected: 10 files listed (`05-p01-life-admin.html` through `05-p10-construction-property.html`).

If missing or short: STOP. Re-create the backup before deleting:
```bash
mkdir -p Wireframe/_backup/i-need-to-arrange-2026-05-21
cp Wireframe/05-*.html Wireframe/_backup/i-need-to-arrange-2026-05-21/
```

- [ ] **Step 2: Delete the 9 L3 files**

```bash
rm Wireframe/05-p02-documents.html \
   Wireframe/05-p03-visa-residency.html \
   Wireframe/05-p04-transport-vehicles.html \
   Wireframe/05-p05-fees-payments.html \
   Wireframe/05-p06-document-legalization.html \
   Wireframe/05-p07-social-services-family.html \
   Wireframe/05-p08-environment-waste.html \
   Wireframe/05-p09-city-hall-services.html \
   Wireframe/05-p10-construction-property.html
```

- [ ] **Step 3: Verify**

```bash
ls Wireframe/05-*.html
```

Expected: only `Wireframe/05-p01-life-admin.html` remains.

---

## Task 7: Sitemap + index + export script cleanup

**Files:**
- Modify: `Wireframe/sitemap.html`
- Modify: `Wireframe/index.html`
- Modify: `/tmp/export_wireframe_pdf.py`

- [ ] **Step 1: Sitemap cleanup**

Open `Wireframe/sitemap.html` and search for references to any of the 9 deleted L3 page filenames (e.g., `05-p02-documents.html`). Remove the entries — typically each is a `<li><a href="...">...</a></li>` row. Keep the parent `<li>` for "I need to arrange" pointing to `05-p01-life-admin.html`.

After edit, open `sitemap.html` in browser. The "I need to arrange" entry should appear without 9 children.

- [ ] **Step 2: Index.html cleanup**

Run:
```bash
grep -n '05-p0[2-9]\|05-p10' Wireframe/index.html
```

For each match, decide:
- If the link targets a specific L3 page that's now deleted, replace with a fragment link to the corresponding category in the browser. Mapping:

| Old href | New href |
|----------|----------|
| `05-p02-documents.html` | `05-p01-life-admin.html#documents` |
| `05-p03-visa-residency.html` | `05-p01-life-admin.html#visa` |
| `05-p04-transport-vehicles.html` | `05-p01-life-admin.html#transport` |
| `05-p05-fees-payments.html` | `05-p01-life-admin.html#fees` |
| `05-p06-document-legalization.html` | `05-p01-life-admin.html#legalization` |
| `05-p07-social-services-family.html` | `05-p01-life-admin.html#social` |
| `05-p08-environment-waste.html` | `05-p01-life-admin.html#environment` |
| `05-p09-city-hall-services.html` | `05-p01-life-admin.html#cityhall` |
| `05-p10-construction-property.html` | `05-p01-life-admin.html#construction` |

If grep returns no matches: nothing to update. Move on.

- [ ] **Step 3: Same check across all other Wireframe pages**

```bash
grep -rn '05-p0[2-9]\|05-p10' Wireframe/*.html | grep -v _backup
```

(The `_backup` filter excludes the backup files — those should keep their references intact.)

For any remaining matches, apply the same fragment-link mapping as Step 2. Most likely candidates: `sos.html`, contact pages, sidebar cards across various pages.

- [ ] **Step 4: PDF export script cleanup**

Open `/tmp/export_wireframe_pdf.py`. Find the PAGES list (lines ~14–75) and remove the 9 lines from `('05-p02-documents.html', 'L3'),` through `('05-p10-construction-property.html', 'L3'),` — keep `('05-p01-life-admin.html', 'L2'),`.

The PAGES list after edit should drop from 51 to 42 entries.

- [ ] **Step 5: Run a final broken-link grep**

```bash
grep -rn '05-p0[2-9]\|05-p10' Wireframe/ /tmp/export_wireframe_pdf.py | grep -v _backup
```

Expected: no output (clean).

---

## Task 8: Final verification + commit prep

- [ ] **Step 1: Full visual walkthrough**

Open `Wireframe/05-p01-life-admin.html` in browser, then run through this checklist:

1. Default state: "Most popular" + "Driver's licence" active. ✓
2. Click each of 10 categories in col 1 — col 2 + col 3 update each time. ✓
3. In a few categories, click each sub-topic — col 3 updates. ✓
4. Click 2-3 task links — navigate to `01-p04-health-insurance.html`, H1 banner shows injected task title. ✓
5. Back-button in browser: returns to the wireframe (not unwinding state, because we use replaceState). ✓
6. Deep-link test: paste `…/05-p01-life-admin.html#cityhall/honors` in URL → page loads with City hall + City honors active. ✓
7. Mobile test (< 768px): sequential drill-down, back links work. ✓
8. Open `sitemap.html` — no broken links. ✓
9. Open `Wireframe/01-p01-live.html` — header nav shows "I need to arrange" as flat link (no dropdown), all other section dropdowns still work. ✓
10. Floating wireframe widget on any page — TREE shows "I need to arrange" as single entry. ✓

- [ ] **Step 2: Git status review**

```bash
git status --short
git diff --stat
```

Expected: 
- ~28 modified files (1 L2 page + wireframe.css + wireframe.js + sitemap + index + ~24 other wireframe pages with nav cleanup)
- 9 deleted files (the L3 source pages)
- backup directory + spec/plan as untracked or added depending on git history

- [ ] **Step 3: Ask user to commit**

Show the user:

```
Implementation complete. Summary:
- New 3-column drill-down browser on 'I need to arrange' L2 page (10 categories × ~30 sub-topics × ~120 task links).
- 9 L3 pages removed (backup at Wireframe/_backup/i-need-to-arrange-2026-05-21/).
- Header nav, sidepanel TREE, sitemap, and PDF export script all updated.

Would you like to commit this as one feature commit? Suggested message:
  feat(wireframe): replace I-need-to-arrange L3 pages with 3-column drill-down browser
```

DO NOT auto-commit. Wait for user's explicit yes.
