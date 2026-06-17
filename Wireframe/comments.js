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
    pinEl.className = 'wf-cmt-pin color-' + pinColorOf(comment)
      + (comment.resolved ? ' resolved' : '');
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

  // ===== Color picker =====
  var COLORS = ['red', 'green', 'orange', 'blue'];

  function pinColorOf(comment) {
    var c = comment && comment.color;
    return COLORS.indexOf(c) === -1 ? 'red' : c;
  }

  function buildColorPicker(currentColor, onChange) {
    var picker = document.createElement('div');
    picker.className = 'wf-cmt-color-picker';
    COLORS.forEach(function (color) {
      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'wf-cmt-color-swatch color-' + color
        + (color === currentColor ? ' active' : '');
      sw.setAttribute('aria-label', 'Set color: ' + color);
      sw.setAttribute('data-color', color);
      sw.addEventListener('click', function (e) {
        e.stopPropagation();
        picker.querySelectorAll('.wf-cmt-color-swatch').forEach(function (s) {
          s.classList.toggle('active', s.getAttribute('data-color') === color);
        });
        onChange(color);
      });
      picker.appendChild(sw);
    });
    return picker;
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
    textarea.maxLength = 2000;
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

    // Color picker — appended to popover title. Changes persist immediately.
    var colorPicker = buildColorPicker(pinColorOf(rootComment), function (newColor) {
      var prevColor = pinColorOf(rootComment);
      updateComment(rootComment.id, { color: newColor }).then(function (updated) {
        var idx = comments.findIndex(function (c) { return c.id === rootComment.id; });
        if (idx >= 0) comments[idx] = updated;
        rootComment.color = updated.color;
        renderPins();
      }).catch(function (err) {
        colorPicker.querySelectorAll('.wf-cmt-color-swatch').forEach(function (s) {
          s.classList.toggle('active', s.getAttribute('data-color') === prevColor);
        });
        errEl.textContent = 'Failed: ' + err.message;
        errEl.style.display = 'block';
      });
    });
    shell.titleEl.appendChild(colorPicker);

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
    textarea.maxLength = 2000;
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

    // Color picker — selected color is included in the insertComment payload below.
    var selectedColor = 'red';
    var colorPicker = buildColorPicker(selectedColor, function (newColor) {
      selectedColor = newColor;
    });
    shell.titleEl.appendChild(colorPicker);

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
          color: selectedColor,
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
    // Click outside popover closes it (skips if in comment mode — onDocumentClick
    // handles that case by opening a new draft popover at the click point).
    document.addEventListener('click', function (e) {
      if (!openPopover) return;
      if (commentMode) return;
      if (openPopover.el.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.wf-cmt-pin')) return;
      if (e.target.closest && e.target.closest('.wf-cmt-modal-backdrop')) return;
      closePopover();
      cancelDraftPin();
    });
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
