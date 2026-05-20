# Brno EN — IA Scaffold (Phase 1)

**Status:** Design approved, ready for implementation plan
**Date:** 2026-04-29
**Scope:** Phase 1 — hierarchical multi-file IA scaffold for the English version of the official Brno city website. Phase 2 (later) will expand each file to cover all 17 priority-5 agendas in full.

## Goal

Produce a navigable HTML map of the proposed information architecture so the client can:
1. Verify the structural understanding of the IA before committing to full coverage.
2. See which UI components from the existing prototype (`brno-en-prototype.html`) are placed on which pages.
3. Trace the cross-page links — especially through hub pages (Czech POINT, SOS, Homepage).

The output is a documentation artefact, not a production website. Files open from disk (`file://`), no server needed.

## Reference materials

- `src_img/ia-example.pdf` — visual reference for IA map style (page boxes with stacked component tiles).
- `brno-en-prototype.html` — existing wireframe defining 8 page templates (T1–T8) and 17 components (C01–C17).
- Strategic brief (provided in the original conversation) — defines target audiences, 17 priority-5 agendas, hierarchy of topic areas.

## Strategic constraints

From the brief:

- **Education** and **Transport** are anchor pillars (highest relevance). For Phase 1 they are merged with adjacent topics, but each gets first-class treatment within its file.
- **Czech POINT** must function as a cross-link hub — linked to from any agenda that requires document extracts or certified submissions.
- **Waste fee payment** ("Pay for waste") is the highest-frequency interaction. Treated as a seasonal CTA in `03-business-fees.html` and surfaced on Homepage.
- **SOS / crisis** scenarios are isolated in their own file as a high-stakes, mobile-first user journey.
- **Construction agendas** (29 items, low relevance) are deliberately suppressed — not represented in Phase 1.

## File structure

Output goes to `iA/` folder. Five files plus a shared visual style (inline in each file, identical):

| File | Purpose | Approx. page count |
|------|---------|---------------------|
| `index.html` | Homepage + global sitemap overview | 2–3 |
| `01-family-education.html` | Family, education, social care | ~5 |
| `02-mobility-residence.html` | Transport, documents, housing | ~6 |
| `03-business-fees.html` | Business, fees, waste | ~4 |
| `04-services-info.html` | Czech POINT, document legalization, contacts, departments | ~5 |
| `99-sos.html` | Crisis / urgent situations | ~3 |

Total Phase 1: ~25 page containers.

### `index.html`

- **01-P01 [T1] Homepage** — components: hero carousel (C04), SOS dlaždice prominent, "I need to handle" service tile group (C06) with top 6 priority-5 agendas, news (C07), banner cards (C08) for Family & Education / Mobility / Business, department grid (C09).
- **Sitemap overview block** — five columns, one per sub-file, each listing the pages inside it with `↗` links. Functions as the master rozcestník.
- **Header (C01) + Mega menu (C11)** demonstrated once with full link inventory; subsequent files reference it.
- **Footer (C17)** with all administrative links.

### `01-family-education.html`

- **01-P01 [T2] Section landing "Family & Education"** — hero, breadcrumb, service tiles, news.
- **01-P02 [T4] Kindergarten enrollment** (priority 5) — process steps, FAQ accordion, help sidebar linking to School Department.
- **01-P03 [T4] Primary school enrollment** (priority 5).
- **01-P04 [T4] Schooling abroad** (priority 5) — niche but priority-5; cross-links to `↗ 04-services-info.html` for document legalization.
- **01-P05 [T4] Crisis accommodation for families** (priority 3) — short summary, link `↗ 99-P01 SOS landing` (the SOS landing page surfaces crisis-accommodation contacts as a tile).

### `02-mobility-residence.html`

- **02-P01 [T2] Section landing "Mobility & Residence"**.
- **02-P02 [T4] Vehicle registration / change of owner** (priority 5).
- **02-P03 [T4] Driver's license replacement** (priority 5) — also linked from SOS.
- **02-P04 [T4] Vehicle import** (priority 5) — cross-links to `↗ 04-services-info.html` for document legalization.
- **02-P05 [T4] License plates** (priority 5).
- **02-P06 [T6] Department detail "Transport Department"** — contains C10 person card linking to T7.

### `03-business-fees.html`

- **03-P01 [T2] Section landing "Business & Fees"**.
- **03-P02 [T4] Establishing trade license** (priority 5) — cross-links to `↗ 04-services-info.html#czech-point`.
- **03-P03 [T4] Pay waste fee** (priority 5) — seasonal CTA component visible on Homepage.
- **03-P04 [T6] Department detail "Trade Office"**.

### `04-services-info.html`

- **04-P01 [T2] Section landing "Public Services"**.
- **04-P02 [T4] Czech POINT** (priority 5) — designated hub; receives many cross-links.
- **04-P03 [T4] Document legalization & verification** (priority 5).
- **04-P04 [T5] Department list** — full grid (C09) of all departments.
- **04-P05 [T8] Contacts** — citywide contacts page.

### `99-sos.html`

- **99-P01 [T2] Crisis landing "I need help right now"** — page-banner in warning style; surfaces SOS components.
- **99-P02 [T4] Lost & Found** (priority 5) — phone-first layout.
- **99-P03 [T4] Driver's license after theft** — cross-links to `↗ 02-mobility-residence.html#dl-replacement`.

## Page container anatomy

Each page is rendered as a fixed-width box (~300px) with variable height. Layout per file: flex-wrap grid of containers, automatic flow.

```
┌──────────────────────────────────┐
│ [02-P03] [T4]                    │
│ Driver's license replacement     │
│ /mobility/driver-license          │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ C03 Page banner              │ │
│ │ "DL replacement"             │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ C13 Process steps            │ │
│ │ 1. Report 2. Apply 3. Pickup │ │
│ │ ↗ 04-P02 Czech POINT         │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ C14 Help sidebar             │ │
│ │ → 02-P06 Transport Dept      │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Container header
- Page ID `[02-P03]` (file prefix + local sequence)
- Template tag `[T4]`
- Page title (English)
- URL slug

### Component tile inside container
- Component ID + label (`C13 Process steps`)
- Skeletal content preview (1–3 lines)
- Link badges at the bottom (only when relevant)

## Linking conventions

| Symbol | Meaning | Example |
|--------|---------|---------|
| `→` | Same-file link | `→ 01-P01 Section landing` |
| `↗` | Cross-file link | `↗ 04-P02 Czech POINT` |
| `⇡` | Link to homepage / index | `⇡ Homepage` |

Link badges are clickable `<a>` elements. Cross-file links use `href="04-services-info.html#04-p02"`. Anchor IDs match page IDs (lowercased).

## Visual style

- **No color coding by page type** — all containers neutral (white background, light gray border `#E5E5E5`).
- Template tag (T1, T2, T4 etc.) shown as small text label inside the container header.
- Tokens reused from `brno-en-prototype.html`: Source Sans 3, Brno red `#E2231A` for accents only, gray scale for structure.
- Each file has a sticky **mini-sitemap header** showing all 5 files for fast navigation. Active file is highlighted in red.
- Each file has a **legend block** at the bottom: explains badge symbols and template tags.

## Technical constraints

- Single inline `<style>` block per file. Identical CSS across files (copy-paste, no external stylesheet dependency yet — keeps each file self-contained for offline review).
- No JavaScript. Pure HTML anchors.
- Files must work via `file://` protocol (no relative URLs that require a server).
- HTML5, `lang="en"`.
- Page IDs unique per file. Anchor format: `id="02-p03"` (lowercased, hyphenated).

## Out of scope (Phase 1)

- Full coverage of all 17 priority-5 agendas — only ~12–15 represented as full containers; rest mentioned only inside link badges.
- Full content of every component — components show schematic content (1–3 lines), not realistic copy.
- Color coding by page type (rejected during brainstorming).
- SVG curve connections between boxes (rejected during brainstorming — variant A inline badges only).
- Interactive features: hover highlighting, search, filtering.

## Phase 2 (future, not part of this work)

Expand each file to include the remaining priority-5 agendas as full containers. May also split `01-family-education.html` to give Education its own file once full coverage warrants it. The current scaffold structure is designed to absorb additions without restructuring (just add more `[T4]` boxes within existing files).

## Acceptance criteria

1. Five HTML files exist in `iA/` and open in any browser via `file://`.
2. All Phase-1 priority-5 agendas listed above are represented as containers.
3. Every container shows: page ID, template tag, page name, URL slug, and at least 2 component tiles.
4. Cross-file links resolve correctly (clicking a `↗` badge jumps to the right file and anchor).
5. Czech POINT (`04-P02`) and SOS (`99-P01`) function as visible hubs — each receives at least 3 incoming cross-links from other files.
6. Sticky mini-sitemap header is consistent across all 5 files.
