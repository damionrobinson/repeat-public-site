// Cookie consent + Google Analytics for repeit.com (website only — the Repeat app never runs this).
// Google Analytics is loaded ONLY after the visitor clicks "Accept analytics". Until then nothing is
// sent to Google Analytics and no analytics cookies are set (UK PECR / GDPR). The choice is kept in
// localStorage; "Cookie settings" in the footer reopens the banner. Privacy notice: /privacy.html#cookies
(function () {
  'use strict';
  var GA_ID = 'G-F3P1BZFKBR';
  var KEY = 'repeit-consent-v1';
  var loaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    // Remove _ga / _ga_* cookies if someone withdraws consent.
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name)) {
        var host = location.hostname, parts = host.split('.');
        for (var i = 0; i < parts.length - 1; i++) {
          var d = parts.slice(i).join('.');
          document.cookie = name + '=; Max-Age=0; path=/; domain=.' + d;
        }
        document.cookie = name + '=; Max-Age=0; path=/';
      }
    });
  }

  // Pages call this for meaningful moments (beta sign-up, purchase). Never send personal data in params.
  window.repeitTrack = function (name, params) {
    if (getChoice() === 'granted' && window.gtag) window.gtag('event', name, params || {});
  };

  var css = '.rp-consent{position:fixed;right:16px;bottom:16px;z-index:80;max-width:380px;background:var(--surface,#fff);color:var(--ink,#1B1D22);border:2px solid var(--ink,#1B1D22);border-radius:16px;box-shadow:5px 5px 0 var(--ink,#1B1D22);padding:18px 18px 16px;font:15px/1.5 "Atkinson Hyperlegible",system-ui,sans-serif}' +
    '.rp-consent strong{display:block;font-size:17px;margin-bottom:4px}.rp-consent p{margin:0 0 12px}.rp-consent a{color:inherit}' +
    '.rp-consent .rp-row{display:flex;gap:8px;flex-wrap:wrap}.rp-consent button{font:700 15px "Atkinson Hyperlegible",system-ui,sans-serif;border-radius:10px;padding:9px 14px;cursor:pointer;border:2px solid var(--ink,#1B1D22)}' +
    '.rp-consent .rp-yes{background:var(--ink,#1B1D22);color:var(--on-ink,#fff)}.rp-consent .rp-no{background:transparent;color:var(--ink,#1B1D22)}' +
    '@media (max-width:600px){.rp-consent{left:12px;right:12px;bottom:12px;max-width:none}}';

  function showBanner() {
    if (document.getElementById('rp-consent')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('div');
    b.className = 'rp-consent'; b.id = 'rp-consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookie choice');
    b.innerHTML = '<strong>Cookies? Only if you say so.</strong>' +
      '<p>We’d like to use Google Analytics to count visits and see which pages help. No ads, no selling data, and nothing from the Repeat app. <a href="/privacy.html#cookies">Details</a></p>' +
      '<div class="rp-row"><button type="button" class="rp-yes">Accept analytics</button><button type="button" class="rp-no">No thanks</button></div>';
    document.body.appendChild(b);
    b.querySelector('.rp-yes').addEventListener('click', function () { setChoice('granted'); b.remove(); loadGA(); });
    b.querySelector('.rp-no').addEventListener('click', function () { var was = getChoice(); setChoice('denied'); b.remove(); clearGACookies(); if (was === 'granted') location.reload(); });
  }

  function init() {
    var c = getChoice();
    if (c === 'granted') loadGA(); else if (c !== 'denied') showBanner();
    document.querySelectorAll('[data-cookie-settings]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
