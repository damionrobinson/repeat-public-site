/* About and Changelog pages: theme switch (same key as the home page) and
   headings that arrive misspelled and fix themselves as they scroll in. */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme');
  try { var saved = localStorage.getItem('repeit-theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  var isDark = function () { return root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; };
  var sync = function () { if (btn) btn.textContent = isDark() ? '☀' : '☾'; };
  sync();
  if (btn) btn.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('repeit-theme', root.dataset.theme); } catch (e) {}
    sync();
  });

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heads = [].slice.call(document.querySelectorAll('[data-wrong]'));
  var fix = function (el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var w = el.querySelector('.w');
    setTimeout(function () {
      w.textContent = el.dataset.right;
      el.querySelector('.typo').classList.add('fixed');
    }, still ? 0 : 650);
  };
  heads.forEach(function (el) {
    var right = el.textContent.trim();
    el.dataset.right = right;
    el.setAttribute('aria-label', right);
    el.innerHTML = '<span class="typo"><span class="w" aria-hidden="true"></span></span>';
    el.querySelector('.w').textContent = el.dataset.wrong;
    el.querySelector('.typo').addEventListener('click', function () { fix(el); });
  });
  // Fix every heading that has reached the lower fifth of the screen, including ones a fast scroll jumped past.
  var check = function () {
    var line = window.innerHeight * 0.8;
    heads.forEach(function (el) { if (!el.dataset.done && el.getBoundingClientRect().top < line) fix(el); });
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
})();
