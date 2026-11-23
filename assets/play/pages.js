/* Features and Buy pages (Figma "Website — Playful v2": "Features · Desktop",
   "Buy · Yearly + Pay once · Desktop"). Sits on top of play.css and about.css,
   the same way about.js does, and reuses the home page's motion: the same
   fixWord letter swap (GSAP 3.13.0, assets/vendor), the typo hunt and its
   "N of N typos fixed" counter, headings that arrive misspelled and fix
   themselves as they scroll in. Rule: laugh at the typo, never at the
   typist. Reduce Motion gets a normal page: words are simply corrected. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap;
  var motion = !reduce && !!G;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var TICK = '<svg class="tick" viewBox="0 0 16 14" aria-hidden="true"><path d="M1 7 L6 12 L15 1"/></svg>';
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chars = function (s) { return s.split('').map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join(''); };

  // Theme: same key and behaviour as the home page.
  var themeBtn = $('#theme');
  try { var saved = localStorage.getItem('repeit-theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  var isDark = function () { return root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; };
  var syncTheme = function () { if (themeBtn) themeBtn.textContent = isDark() ? '☀' : '☾'; };
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('repeit-theme', root.dataset.theme); } catch (e) {}
    syncTheme();
  });

  var toastEl = $('#toast'), toastTimer;
  var toast = function (msg, ms) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  };

  // The home page's fixWord: letters hop out, the right ones hop in, a tick.
  function fixWord(el, right, done) {
    var target = el.querySelector('.w') || el;
    var finish = function () {
      el.classList.add('fixed');
      if (!el.querySelector('.tick')) el.insertAdjacentHTML('beforeend', TICK);
      if (done) done();
    };
    if (!motion) { target.textContent = right; finish(); return; }
    target.innerHTML = chars(target.textContent);
    G.timeline()
      .to(target.children, { yPercent: -70, opacity: 0, rotation: function () { return G.utils.random(-30, 30); }, duration: 0.18, stagger: 0.015, ease: 'power2.in' })
      .add(function () {
        target.innerHTML = chars(right);
        el.classList.add('fixed');
        G.from(target.children, { yPercent: 80, opacity: 0, duration: 0.42, stagger: 0.025, ease: 'back.out(2.4)', onComplete: function () { target.textContent = right; finish(); } });
      });
  }

  // Typo hunt: words marked .hunt, counted in the nav like on the home page.
  var hunts = $$('.hunt'), fixedCount = 0, counter = $('#counter'), counterText = $('#counter-text');
  var updateCounter = function () {
    if (!counter) return;
    counterText.textContent = fixedCount + ' of ' + hunts.length + ' typos fixed';
    counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
    if (fixedCount === hunts.length) setTimeout(function () { toast('All ' + hunts.length + ' fixed. You’d make a great proofreader. Repeat would like a word.', 5200); }, 500);
  };
  if (counterText) counterText.textContent = '0 of ' + hunts.length + ' typos fixed';
  hunts.forEach(function (el) {
    var go = function () {
      if (el.classList.contains('fixed') || el.dataset.busy) return;
      el.dataset.busy = '1';
      el.setAttribute('aria-label', 'Fixed: ' + el.dataset.fix);
      fixWord(el, el.dataset.fix, function () { fixedCount++; updateCounter(); });
    };
    el.addEventListener('click', go);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  if (counter) counter.addEventListener('click', function () {
    var left = hunts.filter(function (h) { return !h.classList.contains('fixed'); });
    toast(left.length ? left.length + ' typos are hiding on this page. Tap them to fix them.' : 'All fixed. Nothing left to find.');
    if (motion && left.length) G.fromTo(left, { scale: 1 }, { scale: 1.15, yoyo: true, repeat: 1, duration: 0.25, stagger: 0.06 });
  });

  // Headings with data-wrong arrive misspelled and fix themselves (fixWord)
  // once they reach the lower fifth of the screen, or when clicked.
  var heads = $$('[data-wrong]');
  heads.forEach(function (el) {
    var right = el.textContent.trim();
    el.dataset.right = right;
    el.setAttribute('aria-label', right);
    el.innerHTML = '<span class="typo"><span class="w" aria-hidden="true"></span></span>';
    el.querySelector('.w').textContent = el.dataset.wrong;
    el.querySelector('.typo').addEventListener('click', function () { fixHead(el); });
  });
  function fixHead(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var typo = el.querySelector('.typo');
    setTimeout(function () { fixWord(typo, el.dataset.right); }, motion ? 450 : 0);
  }
  var check = function () {
    var line = window.innerHeight * 0.8;
    heads.forEach(function (el) { if (!el.dataset.done && el.getBoundingClientRect().top < line) fixHead(el); });
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();

  // Cards rise in as they scroll into view (motion only).
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        G.from(e.target, { y: 18, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rise').forEach(function (el) { io.observe(el); });
  }
})();
