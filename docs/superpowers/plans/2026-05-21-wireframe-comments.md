# Wireframe Pin-Comments — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pin-based commenting system to every wireframe page so clients can drop pins, leave threaded comments, and mark them resolved — backed by Supabase.

**Architecture:** Two new self-contained files (`comments.css` + `comments.js`) loaded into every wireframe page via `<link>` and `<script>` tags. Vanilla JS IIFE; raw `fetch` against Supabase PostgREST endpoints (no SDK). State lives in Supabase; reviewer name persists in `localStorage`. Comment-mode toggles a body class; clicks anywhere place a draft pin; popovers anchor to pins and support reply / resolve.

**Tech Stack:** Vanilla HTML5 / CSS3 / ES2017+ JS. No build step. Supabase (hosted Postgres + PostgREST + RLS). Existing wireframe.css conventions (CSS custom properties).

**Commit policy:** Per user's global rule, do NOT auto-commit between tasks. Final task asks user to commit the whole feature as one logical changeset.

---

## File structure

| File | Action | Notes |
|------|--------|-------|
| `Wireframe/comments.css` | Create | All styles for bubble button, pin marker, popover, name modal, draft pin (~190 lines) |
| `Wireframe/comments.js` | Create | Full IIFE module: Supabase config, REST helpers, name modal, bubble + comment mode toggle, pin/popover rendering, click handlers, resolve toggle (~470 lines) |
| `Wireframe/*.html` (42 wireframe pages) | Modify | Add 2 lines in `<head>`: `<link rel="stylesheet" href="comments.css">` + `<script src="comments.js" defer></script>` |

The `Wireframe/_backup/` folder is left untouched — `comments.js` self-disables when path contains `/_backup/`.

Supabase schema + RLS policies are already provisioned (user ran SQL in the dashboard).

---

## Task 1: Create `comments.css`

**Files:**
- Create: `Wireframe/comments.css`

- [ ] **Step 1: Write the full CSS file**

Create `Wireframe/comments.css` with this content:

```css
/* =========================================================
   Wireframe pin-comments — bubble button, pins, popover, modal
   All classes prefixed wf-cmt- to avoid collisions.
   ========================================================= */

/* --- Z-index layering ---
   100 = pin markers + bubble toggle
   200 = popovers (above pins, below modal)
   300 = name modal overlay
*/

/* Bubble toggle button (top-right corner) */
.wf-cmt-bubble {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--white);
  border: 2px solid var(--red);
  color: var(--red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: transform 0.12s, background 0.12s, color 0.12s;
  padding: 0;
}
.wf-cmt-bubble:hover { transform: scale(1.05); }
.wf-cmt-bubble.active {
  background: var(--red);
  color: var(--white);
}
.wf-cmt-bubble svg { width: 22px; height: 22px; }

/* Badge inside bubble showing open-pin count for current page */
.wf-cmt-bubble-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--red);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid var(--white);
}
.wf-cmt-bubble.active .wf-cmt-bubble-badge { background: var(--white); color: var(--red); }
.wf-cmt-bubble-badge.hidden { display: none; }

/* Comment mode — crosshair cursor everywhere */
body.wf-cmt-mode { cursor: crosshair !important; }
body.wf-cmt-mode a, body.wf-cmt-mode button { cursor: crosshair !important; }

/* Overlay container holds all pins, absolutely positioned over document */
.wf-cmt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
.wf-cmt-overlay > * { pointer-events: auto; }

/* Body must be position: relative for the overlay to anchor correctly */
body { position: relative; }

/* Pin marker */
.wf-cmt-pin {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--red);
  color: var(--white);
  font-size: 13px;
  font-weight: 700;
  border: 2px solid var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.12s;
}
.wf-cmt-pin:hover { transform: translate(-50%, -50%) scale(1.15); }
.wf-cmt-pin.resolved {
  background: var(--gray-500);
  width: 22px;
  height: 22px;
  font-size: 11px;
  opacity: 0.7;
}
.wf-cmt-pin.draft {
  background: var(--white);
  color: var(--red);
  border: 2px dashed var(--red);
}

/* Popover */
.wf-cmt-popover {
  position: absolute;
  width: 320px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  z-index: 200;
  font-size: 14px;
  line-height: 1.45;
  color: var(--gray-900);
  display: flex;
  flex-direction: column;
  max-height: 480px;
}
.wf-cmt-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-100);
  border-radius: 6px 6px 0 0;
}
.wf-cmt-popover-title {
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.wf-cmt-popover-resolved-badge {
  background: var(--gray-500);
  color: var(--white);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.wf-cmt-popover-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--gray-700);
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
}
.wf-cmt-popover-close:hover { color: var(--gray-900); }

.wf-cmt-popover-thread {
  overflow-y: auto;
  padding: 10px 14px;
  flex: 1;
}
.wf-cmt-message {
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-200);
}
.wf-cmt-message:last-child { border-bottom: none; }
.wf-cmt-message-author {
  font-weight: 600;
  color: var(--gray-900);
  margin-right: 8px;
}
.wf-cmt-message-time {
  font-size: 12px;
  color: var(--gray-500);
}
.wf-cmt-message-body {
  white-space: pre-wrap;
  margin-top: 4px;
  color: var(--gray-700);
}

.wf-cmt-popover-footer {
  border-top: 1px solid var(--gray-200);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wf-cmt-textarea {
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  resize: vertical;
  box-sizing: border-box;
}
.wf-cmt-textarea:focus { outline: none; border-color: var(--red); }
.wf-cmt-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}
.wf-cmt-actions-right { display: flex; gap: 8px; }
.wf-cmt-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
}
.wf-cmt-btn-primary {
  background: var(--red);
  color: var(--white);
  border-color: var(--red);
}
.wf-cmt-btn-primary:hover { background: var(--red-dark, #A50D26); }
.wf-cmt-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.wf-cmt-btn-secondary {
  background: var(--white);
  color: var(--gray-700);
  border-color: var(--gray-300);
}
.wf-cmt-btn-secondary:hover { background: var(--gray-100); }
.wf-cmt-btn-resolve { font-size: 12px; padding: 4px 10px; }
.wf-cmt-error {
  color: var(--red);
  font-size: 12px;
  margin-top: 4px;
}

/* Name modal (full-screen overlay) */
.wf-cmt-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wf-cmt-modal {
  background: var(--white);
  border-radius: 8px;
  padding: 28px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
.wf-cmt-modal h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}
.wf-cmt-modal p {
  margin: 0 0 18px 0;
  color: var(--gray-700);
  font-size: 14px;
  line-height: 1.5;
}
.wf-cmt-modal input {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  margin-bottom: 16px;
  box-sizing: border-box;
  font-family: inherit;
}
.wf-cmt-modal input:focus { outline: none; border-color: var(--red); }
.wf-cmt-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

- [ ] **Step 2: Sanity check**

This file isn't loaded by any page yet, so there's nothing to visually verify. Move on to Task 2.

---

## Task 2: Create `comments.js`

**Files:**
- Create: `Wireframe/comments.js`

- [ ] **Step 1: Write the full JS module**

Create `Wireframe/comments.js` with this content:

```js
/* =========================================================
   Wireframe pin-comments — single-file IIFE module
   Loaded on every wireframe page via <script src="comments.js" defer>.
   ========================================================= */
(function () {
  'use strict';

  // ===== Config (Supabase publishable key — public by design) =====
  var SUPABASE_URL = 'https://comzoybjvsglnhftnqgr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_4PkGzHCUGmnEg_tf86e5Gg_r9l52XCN';
  var SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
  };

  // ===== Page ID detection (filename of current wireframe page) =====
  function getPageId() {
    var path = window.location.pathname;
    if (path.indexOf('/_backup/') !== -1) return null; // disable on backup files
    var name = path.substring(path.lastIndexOf('/') + 1);
    return name || 'index.html';
  }

  var PAGE_ID = getPageId();
  if (PAGE_ID === null) return; // backup pages get no comments UI

  // ===== State =====
  var comments = [];          // flat list of all comments for current page
  var commentMode = false;
  var draftPin = null;        // { el, x_pct, y_pct_px }
  var openPopover = null;     // { el, comment } | { el, draft: true }
  var reviewerName = null;
  try { reviewerName = localStorage.getItem('wf-reviewer-name') || null; } catch (e) {}

  // ===== Utilities =====
  function escapeHtml(s) {
    // Defensive: even though we use textContent everywhere, keep this for safety.
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatTimestamp(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('en-GB', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch (e) { return iso; }
  }

  function getRoots() { return comments.filter(function (c) { return !c.parent_id; }); }
  function getReplies(rootId) {
    return comments.filter(function (c) { return c.parent_id === rootId; });
  }
  function getOpenRootCount() {
    return getRoots().filter(function (c) { return !c.resolved; }).length;
  }

  // ===== REST API =====
  function fetchComments() {
    var url = SUPABASE_URL + '/rest/v1/comments?page=eq.'
      + encodeURIComponent(PAGE_ID) + '&order=created_at.asc';
    return fetch(url, { headers: SUPABASE_HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('Fetch failed: ' + r.status); return r.json(); });
  }

  function insertComment(payload) {
    return fetch(SUPABASE_URL + '/rest/v1/comments', {
      method: 'POST',
      headers: Object.assign({}, SUPABASE_HEADERS, { 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) throw new Error('Insert failed: ' + r.status);
      return r.json();
    }).then(function (data) { return data[0]; });
  }

  function updateComment(id, payload) {
    var url = SUPABASE_URL + '/rest/v1/comments?id=eq.' + encodeURIComponent(id);
    return fetch(url, {
      method: 'PATCH',
      headers: Object.assign({}, SUPABASE_HEADERS, { 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) throw new Error('Update failed: ' + r.status);
      return r.json();
    }).then(function (data) { return data[0]; });
  }

  // ===== Name modal =====
  function showNameModal(onSaved) {
    var backdrop = document.createElement('div');
    backdrop.className = 'wf-cmt-modal-backdrop';
    var modal = document.createElement('div');
    modal.className = 'wf-cmt-modal';

    var h = document.createElement('h3'); h.textContent = "What's your name?";
    var p = document.createElement('p'); p.textContent = "We'll use this to label your comments.";
    var input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 60;
    input.placeholder = 'e.g. Marek';
    input.value = reviewerName || '';

    var actions = document.createElement('div');
    actions.className = 'wf-cmt-modal-actions';
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'wf-cmt-btn wf-cmt-btn-secondary';
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    var saveBtn = document.createElement('button');
    saveBtn.className = 'wf-cmt-btn wf-cmt-btn-primary';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    modal.appendChild(h);
    modal.appendChild(p);
    modal.appendChild(input);
    modal.appendChild(actions);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    input.focus();
    input.select();

    function close() { backdrop.remove(); }
    function save() {
      var name = input.value.trim().substring(0, 60);
      if (!name) { input.focus(); return; }
      reviewerName = name;
      try { localStorage.setItem('wf-reviewer-name', name); } catch (e) {}
      close();
      if (onSaved) onSaved();
    }
    cancelBtn.addEventListener('click', close);
    saveBtn.addEventListener('click', save);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
  }

  function ensureName(callback) {
    if (reviewerName) { callback(); return; }
    showNameModal(callback);
  }

  // ===== Bubble button =====
  var bubbleEl = null;
  var badgeEl = null;

  function renderBubble() {
    bubbleEl = document.createElement('button');
    bubbleEl.className = 'wf-cmt-bubble';
    bubbleEl.type = 'button';
    bubbleEl.title = 'Toggle comment mode';
    bubbleEl.setAttribute('aria-label', 'Toggle comment mode');
    bubbleEl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>' +
      '<span class="wf-cmt-bubble-badge hidden">0</span>';
    badgeEl = bubbleEl.querySelector('.wf-cmt-bubble-badge');
    bubbleEl.addEventListener('click', function () { setCommentMode(!commentMode); });
    document.body.appendChild(bubbleEl);
  }

  function updateBadge() {
    var n = getOpenRootCount();
    if (!badgeEl) return;
    if (n === 0) {
      badgeEl.classList.add('hidden');
    } else {
      badgeEl.classList.remove('hidden');
      badgeEl.textContent = String(n);
    }
  }

  function setCommentMode(on) {
    commentMode = on;
    if (on) {
      document.body.classList.add('wf-cmt-mode');
      bubbleEl.classList.add('active');
    } else {
      document.body.classList.remove('wf-cmt-mode');
      bubbleEl.classList.remove('active');
      cancelDraftPin();
    }
  }

  // ===== Overlay (holds pins) =====
  var overlayEl = null;

  function renderOverlay() {
    overlayEl = document.createElement('div');
    overlayEl.className = 'wf-cmt-overlay';
    document.body.appendChild(overlayEl);
    syncOverlayHeight();
    window.addEventListener('resize', syncOverlayHeight);
  }

  function syncOverlayHeight() {
    if (!overlayEl) return;
    overlayEl.style.height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) + 'px';
  }

  // ===== Pin rendering =====
  function renderPins() {
    if (!overlayEl) return;
    // Clear existing
    while (overlayEl.firstChild) overlayEl.removeChild(overlayEl.firstChild);

    var roots = getRoots();
    roots.forEach(function (root, idx) {
      var pinEl = createPinEl(root, idx + 1);
      overlayEl.appendChild(pinEl);
    });
    updateBadge();
    syncOverlayHeight();
  }

  function createPinEl(comment, displayNumber) {
    var pinEl = document.createElement('button');
    pinEl.className = 'wf-cmt-pin' + (comment.resolved ? ' resolved' : '');
    pinEl.type = 'button';
    pinEl.style.left = comment.x_pct + '%';
    pinEl.style.top = comment.y_pct_px + 'px';
    pinEl.textContent = String(displayNumber);
    pinEl.setAttribute('aria-label', 'Comment #' + displayNumber);
    pinEl.addEventListener('click', function (e) {
      e.stopPropagation();
      openCommentPopover(comment, pinEl);
    });
    return pinEl;
  }

  function createDraftPinEl(x_pct, y_pct_px) {
    var pinEl = document.createElement('div');
    pinEl.className = 'wf-cmt-pin draft';
    pinEl.style.left = x_pct + '%';
    pinEl.style.top = y_pct_px + 'px';
    pinEl.textContent = '+';
    overlayEl.appendChild(pinEl);
    return pinEl;
  }

  // ===== Popover =====
  function closePopover() {
    if (openPopover) {
      openPopover.el.remove();
      openPopover = null;
    }
  }

  function positionPopover(popoverEl, anchorEl) {
    var anchorRect = anchorEl.getBoundingClientRect();
    var popRect = popoverEl.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var sx = window.scrollX, sy = window.scrollY;

    var left = anchorRect.right + 12 + sx;
    var top = anchorRect.top + sy;

    // Flip horizontally if would overflow right
    if (left + popRect.width > sx + vw - 8) {
      left = anchorRect.left + sx - popRect.width - 12;
    }
    // Clamp left to viewport
    if (left < sx + 8) left = sx + 8;
    // Clamp vertically
    if (top + popRect.height > sy + vh - 8) {
      top = sy + vh - popRect.height - 8;
    }
    if (top < sy + 8) top = sy + 8;

    popoverEl.style.left = left + 'px';
    popoverEl.style.top = top + 'px';
  }

  function buildPopoverShell(title) {
    var pop = document.createElement('div');
    pop.className = 'wf-cmt-popover';

    var header = document.createElement('div');
    header.className = 'wf-cmt-popover-header';
    var titleEl = document.createElement('div');
    titleEl.className = 'wf-cmt-popover-title';
    titleEl.textContent = title;
    var closeBtn = document.createElement('button');
    closeBtn.className = 'wf-cmt-popover-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closePopover);
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    pop.appendChild(header);

    return { pop: pop, titleEl: titleEl };
  }

  function openCommentPopover(rootComment, pinEl) {
    closePopover();

    var shell = buildPopoverShell('Comment #' + (getRoots().indexOf(rootComment) + 1));
    var pop = shell.pop;

    if (rootComment.resolved) {
      var badge = document.createElement('span');
      badge.className = 'wf-cmt-popover-resolved-badge';
      badge.textContent = 'Resolved';
      shell.titleEl.appendChild(badge);
    }

    // Thread body
    var thread = document.createElement('div');
    thread.className = 'wf-cmt-popover-thread';
    function renderThreadInto(container) {
      while (container.firstChild) container.removeChild(container.firstChild);
      var messages = [rootComment].concat(getReplies(rootComment.id));
      messages.forEach(function (msg) {
        var wrap = document.createElement('div');
        wrap.className = 'wf-cmt-message';
        var meta = document.createElement('div');
        var author = document.createElement('span');
        author.className = 'wf-cmt-message-author';
        author.textContent = msg.author;
        var time = document.createElement('span');
        time.className = 'wf-cmt-message-time';
        time.textContent = formatTimestamp(msg.created_at);
        meta.appendChild(author);
        meta.appendChild(time);
        var body = document.createElement('div');
        body.className = 'wf-cmt-message-body';
        body.textContent = msg.body;
        wrap.appendChild(meta);
        wrap.appendChild(body);
        container.appendChild(wrap);
      });
    }
    renderThreadInto(thread);
    pop.appendChild(thread);

    // Footer: reply textarea + actions
    var footer = document.createElement('div');
    footer.className = 'wf-cmt-popover-footer';

    var textarea = document.createElement('textarea');
    textarea.className = 'wf-cmt-textarea';
    textarea.placeholder = 'Reply…';

    var actions = document.createElement('div');
    actions.className = 'wf-cmt-actions';
    var resolveBtn = document.createElement('button');
    resolveBtn.className = 'wf-cmt-btn wf-cmt-btn-secondary wf-cmt-btn-resolve';
    resolveBtn.type = 'button';
    resolveBtn.textContent = rootComment.resolved ? 'Mark open' : 'Mark resolved';
    var right = document.createElement('div');
    right.className = 'wf-cmt-actions-right';
    var sendBtn = document.createElement('button');
    sendBtn.className = 'wf-cmt-btn wf-cmt-btn-primary';
    sendBtn.type = 'button';
    sendBtn.textContent = 'Send reply';
    right.appendChild(sendBtn);
    actions.appendChild(resolveBtn);
    actions.appendChild(right);

    var errEl = document.createElement('div');
    errEl.className = 'wf-cmt-error';
    errEl.style.display = 'none';

    footer.appendChild(textarea);
    footer.appendChild(actions);
    footer.appendChild(errEl);
    pop.appendChild(footer);

    document.body.appendChild(pop);
    positionPopover(pop, pinEl);
    openPopover = { el: pop, comment: rootComment };

    sendBtn.addEventListener('click', function () {
      var body = textarea.value.trim();
      if (!body) { textarea.focus(); return; }
      ensureName(function () {
        sendBtn.disabled = true;
        errEl.style.display = 'none';
        insertComment({
          page: PAGE_ID,
          parent_id: rootComment.id,
          author: reviewerName,
          body: body,
        }).then(function (saved) {
          comments.push(saved);
          textarea.value = '';
          renderThreadInto(thread);
          sendBtn.disabled = false;
        }).catch(function (err) {
          errEl.textContent = 'Failed to send: ' + err.message;
          errEl.style.display = 'block';
          sendBtn.disabled = false;
        });
      });
    });

    resolveBtn.addEventListener('click', function () {
      resolveBtn.disabled = true;
      var newState = !rootComment.resolved;
      updateComment(rootComment.id, { resolved: newState }).then(function (updated) {
        // Update local state
        var idx = comments.findIndex(function (c) { return c.id === rootComment.id; });
        if (idx >= 0) comments[idx] = updated;
        rootComment.resolved = updated.resolved;
        resolveBtn.textContent = updated.resolved ? 'Mark open' : 'Mark resolved';
        // Update badge in popover title
        var existingBadge = shell.titleEl.querySelector('.wf-cmt-popover-resolved-badge');
        if (updated.resolved && !existingBadge) {
          var b = document.createElement('span');
          b.className = 'wf-cmt-popover-resolved-badge';
          b.textContent = 'Resolved';
          shell.titleEl.appendChild(b);
        } else if (!updated.resolved && existingBadge) {
          existingBadge.remove();
        }
        renderPins();
        resolveBtn.disabled = false;
      }).catch(function (err) {
        errEl.textContent = 'Failed: ' + err.message;
        errEl.style.display = 'block';
        resolveBtn.disabled = false;
      });
    });
  }

  function openDraftPopover(draftEl, x_pct, y_pct_px) {
    closePopover();

    var shell = buildPopoverShell('New comment');
    var pop = shell.pop;

    var thread = document.createElement('div');
    thread.className = 'wf-cmt-popover-thread';
    var hint = document.createElement('div');
    hint.style.color = 'var(--gray-500)';
    hint.style.fontSize = '13px';
    hint.style.padding = '4px 0';
    hint.textContent = 'Posted as: ' + (reviewerName || '(name will be asked on save)');
    thread.appendChild(hint);
    pop.appendChild(thread);

    var footer = document.createElement('div');
    footer.className = 'wf-cmt-popover-footer';
    var textarea = document.createElement('textarea');
    textarea.className = 'wf-cmt-textarea';
    textarea.placeholder = 'Type your comment…';
    var actions = document.createElement('div');
    actions.className = 'wf-cmt-actions';
    var right = document.createElement('div');
    right.className = 'wf-cmt-actions-right';
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'wf-cmt-btn wf-cmt-btn-secondary';
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    var saveBtn = document.createElement('button');
    saveBtn.className = 'wf-cmt-btn wf-cmt-btn-primary';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    right.appendChild(cancelBtn);
    right.appendChild(saveBtn);
    actions.appendChild(document.createElement('div')); // spacer-left
    actions.appendChild(right);
    var errEl = document.createElement('div');
    errEl.className = 'wf-cmt-error';
    errEl.style.display = 'none';
    footer.appendChild(textarea);
    footer.appendChild(actions);
    footer.appendChild(errEl);
    pop.appendChild(footer);

    document.body.appendChild(pop);
    positionPopover(pop, draftEl);
    openPopover = { el: pop, draft: true };
    textarea.focus();

    cancelBtn.addEventListener('click', function () { cancelDraftPin(); });

    saveBtn.addEventListener('click', function () {
      var body = textarea.value.trim();
      if (!body) { textarea.focus(); return; }
      ensureName(function () {
        // Update hint after name set
        hint.textContent = 'Posted as: ' + reviewerName;
        saveBtn.disabled = true;
        errEl.style.display = 'none';
        insertComment({
          page: PAGE_ID,
          parent_id: null,
          author: reviewerName,
          body: body,
          x_pct: x_pct,
          y_pct_px: y_pct_px,
        }).then(function (saved) {
          comments.push(saved);
          // Remove draft pin
          if (draftPin && draftPin.el) draftPin.el.remove();
          draftPin = null;
          closePopover();
          renderPins();
        }).catch(function (err) {
          errEl.textContent = 'Failed to save: ' + err.message;
          errEl.style.display = 'block';
          saveBtn.disabled = false;
        });
      });
    });
  }

  // ===== Draft pin (comment-mode click) =====
  function startDraftPin(x_pct, y_pct_px) {
    cancelDraftPin();
    var el = createDraftPinEl(x_pct, y_pct_px);
    draftPin = { el: el, x_pct: x_pct, y_pct_px: y_pct_px };
    openDraftPopover(el, x_pct, y_pct_px);
  }

  function cancelDraftPin() {
    if (draftPin) {
      if (draftPin.el) draftPin.el.remove();
      draftPin = null;
    }
    if (openPopover && openPopover.draft) closePopover();
  }

  // ===== Document click handler (capture) =====
  function isComponentClick(target) {
    if (!target.closest) return false;
    return !!target.closest(
      '.wf-cmt-bubble, .wf-cmt-popover, .wf-cmt-modal-backdrop, .wf-cmt-pin,'
      + ' .wf-sidepanel, .wf-toggle-btn, .wf-overlay'
    );
  }

  function onDocumentClick(e) {
    if (!commentMode) return;
    if (isComponentClick(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    var docX = e.clientX + window.scrollX;
    var docY = e.clientY + window.scrollY;
    var width = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    var x_pct = (docX / width) * 100;
    var y_pct_px = Math.round(docY);
    startDraftPin(parseFloat(x_pct.toFixed(2)), y_pct_px);
  }

  // ===== Init =====
  function init() {
    renderBubble();
    renderOverlay();
    fetchComments().then(function (data) {
      comments = data;
      renderPins();
    }).catch(function (err) {
      console.warn('[wf-cmt] Failed to load comments:', err);
    });
    document.addEventListener('click', onDocumentClick, true);
    // Esc closes popover or exits comment mode
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (openPopover) { closePopover(); cancelDraftPin(); return; }
      if (commentMode) setCommentMode(false);
    });
    // Sync overlay height on dynamic content changes
    window.addEventListener('load', syncOverlayHeight);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Sanity check**

Open the file in your editor and verify ~470 lines, balanced braces. No page references this script yet, so no visible effect.

---

## Task 3: Inject `<link>` + `<script>` tags into all 42 wireframe pages

**Files:**
- Modify: all `Wireframe/*.html` (42 files)

- [ ] **Step 1: Write and run injection script**

Save this as `/tmp/inject_comments_tags.py` and run `python3 /tmp/inject_comments_tags.py`:

```python
#!/usr/bin/env python3
"""Inject <link href="comments.css"> + <script src="comments.js" defer></script> into <head> of every wireframe HTML page."""
import glob
import re

# Insert AFTER the wireframe.js script tag (which all pages have in <head>)
ANCHOR = '<script src="wireframe.js" defer></script>'
INJECTION = (
    '<script src="wireframe.js" defer></script>\n'
    '<link rel="stylesheet" href="comments.css">\n'
    '<script src="comments.js" defer></script>'
)

count = 0
skipped = 0
for path in glob.glob('Wireframe/*.html'):
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    if 'comments.js' in src:
        print(f'  skipped (already injected): {path}')
        skipped += 1
        continue
    if ANCHOR not in src:
        print(f'  SKIPPED (anchor not found): {path}')
        skipped += 1
        continue
    new = src.replace(ANCHOR, INJECTION, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new)
    count += 1
    print(f'  injected: {path}')

print(f'\nDone — {count} files injected, {skipped} skipped.')
```

Expected output: `injected:` line for each of ~42 files; `Done — 42 files injected, 0 skipped.`

If you see "anchor not found" for some files: that page is missing the standard `<script src="wireframe.js" defer></script>` line. Add it manually or skip that page.

- [ ] **Step 2: Verify injection**

```bash
grep -lc 'comments.js' Wireframe/*.html | grep -v ':0$' | wc -l
# Expected: 42 (every wireframe page now references comments.js)

grep -c 'comments.css' Wireframe/index.html
# Expected: 1
```

- [ ] **Step 3: Visual verification (one page)**

```bash
open Wireframe/index.html
```

Expected: a red-bordered round bubble button appears in the top-right corner. No badge yet (no comments exist).

If the bubble doesn't appear:
- Open DevTools Console → look for JS errors.
- Check Network tab → `comments.css` and `comments.js` should both return 200.
- Check that the `<link>` and `<script>` tags are in the `<head>` (View Page Source).

- [ ] **Step 4: Delete the helper script**

```bash
rm /tmp/inject_comments_tags.py
```

---

## Task 4: End-to-end smoke test + commit prep

- [ ] **Step 1: Test the full flow on `Wireframe/index.html`**

Open `Wireframe/index.html` in browser. Walk through:

1. **Bubble visible**: top-right corner shows red-bordered bubble icon, no badge.
2. **Activate comment mode**: click bubble → bubble fills red, cursor becomes crosshair.
3. **Click on page**: name modal appears with title "What's your name?".
4. **Save name**: type "Test reviewer", click Save → modal closes, draft pin appears at click point, popover open with textarea showing "Posted as: Test reviewer".
5. **Type and save comment**: type "Hello world", click Save → draft pin replaced with real pin "#1", popover closes.
6. **Bubble badge**: top-right bubble now shows red "1" badge.
7. **Reload page**: pin #1 still visible at same position. Bubble shows "1" badge.
8. **Click pin #1**: popover opens with thread showing "Test reviewer — [timestamp]" + "Hello world".
9. **Send reply**: type "Reply text", click "Send reply" → reply appears below first message.
10. **Mark resolved**: click "Mark resolved" → pin becomes gray and smaller, badge title shows "Resolved", bubble badge updates to 0.
11. **Mark open**: click "Mark open" → pin back to red, badge back to 1.
12. **Esc key**: closes popover. Esc again: exits comment mode.

- [ ] **Step 2: Cross-browser sync test**

Open `Wireframe/index.html` in a second browser (or incognito window).
- Existing pin #1 should appear.
- Click bubble → enter name "Reviewer 2" → drop a second pin → save.
- Reload first browser → pin #2 appears.

- [ ] **Step 3: Backup-bail test**

```bash
open Wireframe/_backup/i-need-to-arrange-2026-05-21/05-p02-documents.html
```

Expected: page loads normally, NO bubble button appears (comments.js bails because path contains `/_backup/`).

- [ ] **Step 4: Per-page isolation test**

Open `Wireframe/01-p01-live.html`. Drop a pin. Save.
Now open `Wireframe/index.html`. The Live-page pin should NOT appear on the homepage (each page's comments are isolated by the `page` column).

- [ ] **Step 5: Verify Supabase storage**

In Supabase dashboard → Table Editor → `comments` table. You should see all rows from your test session with correct `page`, `author`, `body`, `parent_id`, `x_pct`, `y_pct_px`, `resolved`, `created_at`.

- [ ] **Step 6: Clean up test comments (optional)**

If you want to start fresh, in Supabase SQL Editor run:
```sql
delete from comments;
```

- [ ] **Step 7: Report status + ask user about commit**

Summarize for the user:

```
Wireframe comments system implemented end-to-end. Summary:

- New files:
  - Wireframe/comments.css (~190 lines)
  - Wireframe/comments.js (~470 lines, includes hardcoded Supabase publishable key)
- 42 wireframe pages updated with <link> + <script> tags

Verified manually:
- Bubble appears top-right on every wireframe page
- Name modal first time
- Drop pin → save → persists across reloads
- Reply / resolve / re-open
- Cross-browser sync via Supabase
- Backup pages have no comments UI

Suggested commit message:

feat(wireframe): add pin-based comments system backed by Supabase

- New comments.css + comments.js loaded into every wireframe page
- Click bubble (top-right) → enter comment mode → drop pin → save
- Threaded replies + resolve/re-open toggle + bubble badge with open count
- Reviewer name persisted in localStorage; storage in Supabase Postgres
- Self-disables on /_backup/ pages
- Security exception: publishable Supabase key hardcoded per Supabase design
  for static-site client use; RLS policies enforce actual data protection
```

DO NOT auto-commit. Wait for user's explicit yes.
