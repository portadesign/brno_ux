/* =========================================================
   BRNO EN — IA WIREFRAME (Phase 1 POC)
   Floating toggle + side panel with auto-populated tree.

   To add a new page:
   1. Build the HTML file as usual.
   2. Add an entry to the TREE array below (label, href, level, tag).
   3. The panel updates automatically — no edits needed in other files.
   ========================================================= */

(function () {
  'use strict';

  // ----- Page tree (single source of truth) -----
  // Levels: 1 = Homepage · 2 = Section landing · 3 = Sub-page / service detail · 4 = Article under a sub-page
  // Tags: T1/T2/T4/T6 = template type; "soon" = not yet built (disabled)
  var TREE = [
    { label: 'Homepage', href: 'index.html', level: 1, tag: 'T1' },
    { label: 'Sitemap', href: 'sitemap.html', level: 1, tag: '—' },
    { label: 'SOS · I need help now', href: 'sos.html', level: 1, tag: 'SOS' },

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
    { label: 'How to start', href: '01-p05-how-to-start.html', level: 3, tag: 'T6' },
    { label: 'Accommodation', href: '01-p06-accommodation.html', level: 3, tag: 'T6' },
    { label: 'Transport', href: '01-p02-transport.html', level: 3, tag: 'T6' },
    { label: 'Healthcare', href: '01-p03-healthcare.html', level: 3, tag: 'T6' },
    { label: 'Health insurance', href: '01-p04-health-insurance.html', level: 4, tag: 'T4' },
    { label: 'Social care', href: '01-p07-social-care.html', level: 3, tag: 'T6' },
    { label: 'Education', href: '01-p08-education.html', level: 3, tag: 'T6' },
    { label: 'Speak Czech', href: '01-p09-speak-czech.html', level: 3, tag: 'T6' },
    { label: 'Work', href: '02-p01-work.html', level: 2, tag: 'T2' },
    { label: 'Right to work in Czechia', href: '02-p02-right-to-work.html', level: 3, tag: 'T6' },
    { label: 'Find a job', href: '02-p03-find-a-job.html', level: 3, tag: 'T6' },
    { label: 'Employment essentials', href: '02-p04-employment-essentials.html', level: 3, tag: 'T6' },
    { label: 'Become self-employed', href: '02-p05-become-self-employed.html', level: 3, tag: 'T6' },
    { label: 'Start a company', href: '02-p06-start-a-company.html', level: 3, tag: 'T6' },
    { label: 'Brno business ecosystem', href: '02-p07-brno-business-ecosystem.html', level: 3, tag: 'T6' },
    { label: 'Research & Study', href: '03-p01-research-study.html', level: 2, tag: 'T2' },
    { label: 'Study in Brno', href: '03-p02-study-in-brno.html', level: 3, tag: 'T6' },
    { label: 'Science & Innovation', href: '03-p03-science-innovation.html', level: 3, tag: 'T6' },
    { label: 'Enjoy', href: '04-p01-enjoy.html', level: 2, tag: 'T2' },
    { label: 'Leisure & Sports', href: '04-p02-leisure-sports.html', level: 3, tag: 'T6' },
    { label: 'Culture', href: '04-p03-culture.html', level: 3, tag: 'T6' },
    { label: 'Sights & architecture', href: '04-p04-sights-architecture.html', level: 3, tag: 'T6' },
    { label: 'Events', href: '04-p05-events.html', level: 3, tag: 'T6' },
    { label: 'Maps & Guides', href: '04-p06-maps-guides.html', level: 3, tag: 'T6' },
    { label: 'Food and Drink', href: '04-p07-food-drink.html', level: 3, tag: 'T6' },
    { label: 'Communities & meeting people', href: '04-p08-communities.html', level: 3, tag: 'T6' },
    { label: 'About Brno', href: '06-p01-about-brno.html', level: 2, tag: 'T2' },
    { label: 'Mayor & City Council', href: '06-p02-mayor-council.html', level: 3, tag: 'T6' },
    { label: 'Brno facts & vision', href: '06-p03-brno-facts-vision.html', level: 3, tag: 'T6' },
    { label: 'Detail organizační jednotky', href: 'detail-organizacni-jednotky.html', level: 4, tag: 'T7' },

    { divider: 'Varianta 1 (T2 detail-block)' },
    { label: 'Live · V1', href: '01-p01-live-v1.html', level: 2, tag: 'T2' },
    { label: 'Work · V1', href: '02-p01-work-v1.html', level: 2, tag: 'T2' },
    { label: 'Research & Study · V1', href: '03-p01-research-study-v1.html', level: 2, tag: 'T2' },
    { label: 'Enjoy · V1', href: '04-p01-enjoy-v1.html', level: 2, tag: 'T2' },
    { label: 'About Brno · V1', href: '06-p01-about-brno-v1.html', level: 2, tag: 'T2' }
  ];

  var TOTAL_PLANNED = 24;

  // ----- Helpers -----
  function getCurrentFilename() {
    var p = window.location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ----- Render -----
  function renderTree() {
    var container = document.querySelector('.wf-tree');
    if (!container) return;

    var current = getCurrentFilename();
    var built = TREE.filter(function (i) { return i.href; }).length;
    var html = '';

    TREE.forEach(function (item) {
      if (item.divider) {
        html += '<div class="wf-section-divider">' + escapeHtml(item.divider) + '</div>';
        return;
      }
      var classes = ['wf-tree-item', 'wf-level-' + (item.level || 2)];
      if (item.disabled) classes.push('wf-disabled');
      if (item.href === current) classes.push('wf-active');

      var nameHTML = '<span class="wf-name">' + escapeHtml(item.label) + '</span>';
      var tagHTML = item.level ? '<span class="wf-tag">L' + item.level + '</span>' : '';

      if (item.disabled || !item.href) {
        html += '<span class="' + classes.join(' ') + '">' + nameHTML + tagHTML + '</span>';
      } else {
        html += '<a href="' + item.href + '" class="' + classes.join(' ') + '">' + nameHTML + tagHTML + '</a>';
      }
    });

    container.innerHTML = html;

    var counter = document.querySelector('.wf-count');
    if (counter) counter.textContent = built + ' of ' + TOTAL_PLANNED + ' pages built';
  }

  // ----- Toggle behavior -----
  function setupToggle() {
    var btn = document.querySelector('.wf-toggle-btn');
    var panel = document.querySelector('.wf-sidepanel');
    var overlay = document.querySelector('.wf-overlay');
    var closeBtn = document.querySelector('.wf-close');
    if (!btn || !panel) return;

    function open() {
      panel.classList.add('open');
      if (overlay) overlay.classList.add('show');
    }
    function close() {
      panel.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
    }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // ----- "From-link" label propagation -----
  // Captures the text of the last in-page link the user clicked into sessionStorage,
  // then appends it to h1.title-banner on the destination page so demo banners read
  // e.g. "Detail článku (L4) — Step-by-step guide".
  var STORAGE_KEY = 'wf:lastLabel';

  function cleanLinkText(raw) {
    return (raw || '')
      .replace(/[›→»▾▴⌄⌃]+\s*$/g, '') // strip trailing chevrons / arrows / accordion carets
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Walks up from the given element to find the nearest enclosing block heading
  // (h2/h3/h4 that is a direct child of an ancestor). Returns null if none found.
  function findEnclosingHeading(node) {
    var container = node.parentElement;
    while (container && container !== document.body) {
      var h = container.querySelector(':scope > h2, :scope > h3, :scope > h4');
      if (h && h.textContent.trim()) return h;
      container = container.parentElement;
    }
    return null;
  }

  function trackLastLinkClick() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      // Don't pollute the label with wireframe-widget or browser-back style clicks
      if (a.closest('.wf-sidepanel')) return;
      if (a.closest('.wf-toggle-btn')) return;
      if (a.classList && a.classList.contains('lang-switch')) return;
      var text = cleanLinkText(a.textContent);
      if (!text) return;
      // Generic CTAs ("Show more / less / all") carry no destination info on their own.
      // Substitute the nearest enclosing heading so the next page's H1 reflects which
      // block the user was reading rather than the literal button label.
      if (/^show (more|less|all)$/i.test(text)) {
        var heading = findEnclosingHeading(a);
        if (heading) text = cleanLinkText(heading.textContent);
      }
      try { sessionStorage.setItem(STORAGE_KEY, text); } catch (err) {}
    }, true);
  }

  function injectLastLinkLabel() {
    // Skip label injection on L2 section-landing pages — they keep their own H1 wording.
    // Also skip the SOS page — its H1 is itself an action label and shouldn't be duplicated.
    var current = getCurrentFilename();
    if (current === 'sos.html') return;
    var entry = null;
    for (var i = 0; i < TREE.length; i++) {
      if (TREE[i].href === current) { entry = TREE[i]; break; }
    }
    if (entry && entry.level === 2) return;

    var label;
    try { label = sessionStorage.getItem(STORAGE_KEY); } catch (err) { return; }
    if (!label) return;
    var h1 = document.querySelector('h1.title-banner');
    if (!h1) return;
    // Avoid duplicating on reload: drop any previously injected label first.
    var existing = h1.querySelector('.wf-from-label');
    if (existing) existing.remove();
    var span = document.createElement('span');
    span.className = 'wf-from-label';
    span.style.cssText = 'margin-left:10px;';
    span.textContent = '— ' + label;
    h1.appendChild(span);
  }

  function init() {
    renderTree();
    setupToggle();
    trackLastLinkClick();
    injectLastLinkLabel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
