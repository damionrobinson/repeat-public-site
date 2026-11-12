/* Pop-out menu for smaller screens: the same links as the desktop nav, behind a button. */
(function () {
  var nav = document.querySelector('header.nav');
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('site-menu');
  if (!nav || !btn || !menu) return;
  var set = function (open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  };
  btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) set(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180) set(false); });
})();
