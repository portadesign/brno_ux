# Spec — Wireframe pin-comments system

**Date:** 2026-05-21
**Branch:** TBD (feature branch off `feature/l3-pages-and-sos` after merge, or directly off `main`)
**Status:** Draft for user review

## Background

The wireframe POC is a static HTML site (no build step) that gets shared with clients for review via Vercel deploy or local file/PDF. Today, clients can only leave feedback via separate channels (Slack, email, PDF annotation). We want to bring feedback into the wireframe itself: clients click a "pin" on any wireframe page, leave a comment, and the team sees all comments aggregated in a hosted database.

## Goals

1. Reviewer can drop a pin anywhere on any wireframe page and write a comment.
2. Reviewer can reply to existing pins (threaded discussion).
3. Either the reviewer or team can mark a pin as `resolved`.
4. All reviewers see all comments from all reviewers (shared visibility).
5. Reviewer identity captured as a name string (no real auth).
6. Comments persist in a hosted Postgres database (Supabase).
7. Zero build-step: works as `<script>` + `<link>` tags added to existing static pages.

## Non-goals

- Real user authentication / accounts. Name field is freeform.
- Comment editing or deletion (out of scope for POC).
- Real-time updates (no WebSocket subscription). Reviewers see others' new comments after page reload.
- Notifications (email, Slack).
- Anti-spam (it's an internal review tool; reviewers self-identify).
- Mobile-first design. Comments work on mobile (responsive layout), but precise pin placement on touch is best-effort.

## Decisions (locked in during brainstorm)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Database / backend | Supabase (hosted Postgres + PostgREST + RLS) |
| 2 | Threading model | Threaded — each root pin has thread of replies |
| 3 | Resolve workflow | Yes — anyone can mark `resolved`; UI filter to hide/show |
| 4 | Visibility | All reviewers see all comments |
| 5 | Supabase client | Raw `fetch` against PostgREST endpoints (no SDK CDN dependency) |
| 6 | Auth model | Anonymous; identity = freeform `name` in localStorage |
| 7 | Pin storage | `x_pct` (0–100 % of page width) + `y_pct_px` (pixels from top of document) |
| 8 | XSS prevention | All user content rendered via `textContent`, never `innerHTML` |

## Architecture

### File structure

**New files:**
- `Wireframe/comments.js` — main IIFE module (~450 lines): Supabase URL+key constants, modal/popover/pin rendering, click handlers, REST calls.
- `Wireframe/comments.css` — styles for bubble toggle button, pin marker, popover, modal, reviewer-name prompt (~180 lines).

**Modified files:**
- All wireframe `.html` files (42 pages: index, sitemap, sos, all L2/L3/L4 + T7/T8 + V1 archive) — add 2 lines in `<head>`:
  ```html
  <link rel="stylesheet" href="comments.css">
  <script src="comments.js" defer></script>
  ```
  Skip backup files in `Wireframe/_backup/`.

**Existing file potentially modified:**
- None to wireframe.css/wireframe.js (the comments system is self-contained in its own pair of files).

### Database

Already created in Supabase via SQL Editor:

```sql
create table comments (
  id          uuid primary key default gen_random_uuid(),
  page        text not null,
  parent_id   uuid references comments(id) on delete cascade,
  author      text not null,
  body        text not null,
  x_pct       numeric,
  y_pct_px    integer,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint root_has_position check (
    (parent_id is null and x_pct is not null and y_pct_px is not null)
    or (parent_id is not null)
  )
);
```

Plus 2 indexes (`comments_page_root_idx`, `comments_thread_idx`) and 3 RLS policies (anon select / insert / update; no delete).

### Supabase access from JS

```js
const SUPABASE_URL = 'https://comzoybjvsglnhftnqgr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4PkGzHCUGmnEg_tf86e5Gg_r9l52XCN';
const SUPABASE_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};
```

Three REST endpoints used:
- **List for current page** (root pins + threaded replies via separate queries OR via `?select=*,replies:comments(*)` PostgREST trick):
  ```
  GET /rest/v1/comments?page=eq.<filename>&order=created_at.asc
  ```
  Frontend groups by `parent_id` after fetch (single query, in-memory grouping).

- **Insert (root pin or reply):**
  ```
  POST /rest/v1/comments
  body: { page, author, body, x_pct?, y_pct_px?, parent_id? }
  ```

- **Update (resolve toggle):**
  ```
  PATCH /rest/v1/comments?id=eq.<uuid>
  body: { resolved: true|false }
  ```

### Security exception

The Supabase URL + `sb_publishable_*` key are hardcoded in `comments.js`. This is per Supabase's design (publishable keys are intended for client-side use, analogous to Stripe's `pk_live_*` keys). Actual data protection comes from RLS policies on the `comments` table, which limit anon role to SELECT/INSERT/UPDATE without delete or schema changes.

This is the only viable approach for a static-site wireframe (no server, no build step). Documented exception to the global "no secrets in code" rule because the publishable key is public-by-design.

## UI components

### 1. Floating bubble toggle (top-right)

A round button in the top-right corner of every page, positioned `fixed; top: 16px; right: 16px;`. Icon = speech-bubble SVG (filled when comment mode active, outlined when inactive). Position **next to** the Sitemap link's typical location.

The existing `.wf-toggle-btn` for the sidepanel TREE is at top-left, so this doesn't conflict.

States:
- **Default (idle)**: outlined bubble icon. Hover = subtle scale.
- **Active (comment mode)**: filled bubble + red accent. Cursor on page becomes crosshair.
- **Badge**: small count badge showing total open (un-resolved root pins) on the current page.

Click toggles comment mode.

### 2. Reviewer name modal (first interaction)

Triggered when the user first activates comment mode (or first opens any pin's popover for replying) AND `localStorage.getItem('wf-reviewer-name')` is empty.

Centered modal overlay:
- Title: "What's your name?"
- Subtitle: "We'll use this to label your comments."
- Single text input (max 60 chars)
- Submit button "Save" / Cancel link

On submit, stored in `localStorage` under key `wf-reviewer-name`. Modal dismisses.

### 3. Pin markers

For each root pin on the current page, render a small marker absolutely positioned on the page:
- Circle, 28px × 28px, red background (#C8102E), white text, displaying thread count (1 = just root, 2 = root+1 reply, …).
- Resolved pins: gray background, smaller (22px), slightly faded.
- `position: absolute; left: ${x_pct}%; top: ${y_pct_px}px; transform: translate(-50%, -50%);` — anchor pin center on the click target.

Click marker → opens popover anchored to it.

### 4. Popover (existing pin)

Floating panel anchored to the pin, ~320px wide:
- Header: pin number ("#3") + resolved badge (if resolved) + "Close" ×
- Thread body: list of comments in chronological order, each showing:
  - Author name (bold)
  - Body (whitespace-pre-wrap to preserve line breaks)
  - Timestamp (relative: "2 hours ago" or absolute "2026-05-21 14:32")
- "Reply" textarea + "Send reply" button (only shown if name is set; else triggers name modal first)
- Footer: "Mark resolved" / "Mark open" toggle button

Auto-flips edge (right → left, bottom → top) if it would overflow viewport.

### 5. New-pin overlay (comment mode + click)

When user is in comment mode and clicks anywhere not on an existing pin/popover/sidepanel/toggle-btn:
1. Compute click position (x_pct, y_pct_px) relative to document.
2. Insert a temporary "draft pin" marker at that position (visually distinct: dashed border).
3. Open popover with empty textarea: "Add your comment…" + Save / Cancel.
4. On Save: POST to Supabase, on success replace draft pin with real pin (with id from response) and stay in comment mode.
5. On Cancel: remove draft pin.

If name not set yet, trigger name modal first; once name saved, draft pin remains and popover stays open.

## Interaction model

### First-time reviewer journey

1. Opens wireframe page → sees comment bubble in top-right.
2. Clicks bubble → comment mode activates → cursor crosshair.
3. Clicks on page → name modal appears.
4. Enters name "Klient Eva" → Save → modal closes.
5. Draft pin appears at click point → popover with textarea open.
6. Types comment → Save → pin becomes #1 with 1 comment.
7. Repeats for more pins, OR clicks bubble again to exit comment mode.

### Returning reviewer

1. Opens wireframe page → `wf-reviewer-name` in localStorage → no prompt.
2. Existing pins from all reviewers render immediately.
3. Clicks existing pin → popover shows thread → can read, reply, or resolve.

### Resolved comments toggle (optional UI)

In top-right area near the bubble, a small filter chip "Show resolved (N)" / "Hide resolved (N)". Default: show all. Click toggles visibility.

(Optional for POC — can be deferred if implementation runs over.)

## Edge cases

| Case | Behavior |
|---|---|
| User has no name and clicks "Reply" on existing pin | Trigger name modal first; then proceed |
| User in incognito (no localStorage) | Name prompted every time. Acceptable. |
| Pin position drifts when window resizes | Accept it. Wireframe POC, reviewers expected at near-desktop width. |
| Very long page (e.g. health-insurance at 6840px tall) | Pin uses `y_pct_px` (absolute pixels) → renders correctly regardless of viewport height. |
| Pin near right/bottom edge | Popover auto-flips to opposite side. |
| User clicks while popover open and another draft exists | Close the existing draft (treat as cancel), open new draft. |
| Network failure on POST | Show inline error in popover; keep draft pin visible so user can retry. |
| Page loaded with `comments.js` missing (script blocked) | Page works normally; just no comments UI. Graceful degradation. |
| Backup file `Wireframe/_backup/...` loaded | comments.js detects path contains `/_backup/`; bail early. No comments shown or loadable. |
| Reviewer's local clock is wrong | Timestamps from server-side `created_at` (`now()`); reviewer clock irrelevant. |
| Two reviewers comment simultaneously | Both succeed (no conflict — separate rows). Each reviewer sees the other's after reload. |

## Open questions deferred to implementation

- Should there be a global "All comments" view (sidebar list) for navigating to pins, or only per-page? **Deferred to v2.**
- Should bubble button show total comment count across all pages, or only current page? **Current page only.**
- Color scheme: pin red same as `var(--red)` brand color, or distinct color so pins don't blend? **Use brand red; pins are clearly marked and outside content flow.**
- Should we add a "Comment mode" tutorial tooltip first time? **Skip for POC; UI should be self-explanatory.**
- Should resolved pins be hidden by default? **Show by default; provide filter chip if implementation budget allows.**

## Success criteria

1. Open any wireframe page → bubble appears top-right; no other visual change.
2. Click bubble → cursor crosshair, comment mode active.
3. Click on page (first time) → name modal → save name → draft pin → comment → save → real pin #1 visible.
4. Reload page → pin #1 still visible (loaded from Supabase) with author + text.
5. Click existing pin → popover with thread.
6. Type reply → Send → reply appears in thread.
7. Click "Mark resolved" → pin visual changes (gray/smaller); popover stays open.
8. Open the same wireframe page in another browser → see the same pin + comments + resolved state.
9. Click bubble again → exit comment mode → cursor normal; pins still visible (click to view).
10. Open a wireframe page in `Wireframe/_backup/...` → no comments UI loaded.

## Implementation order (rough preview)

1. Write `comments.css` (visual building blocks)
2. Write `comments.js` (config, Supabase REST wrappers, name modal, bubble + comment mode toggle, pin rendering, popover, click handlers)
3. Mass-add `<link>` + `<script>` tags to all 42 wireframe pages (Python script, similar to nav cleanup pattern)
4. Smoke-test: place a pin from one browser, reload in another → visible
5. Edge case test: resolve toggle, reply, name persistence, backup-page bail
