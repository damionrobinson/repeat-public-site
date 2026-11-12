// repeit.com, playful version. Figma: "Website — Playful v2".
// Plain script, no build step. GSAP 3.13.0 (assets/vendor) does the motion.
// Rule: laugh at the typo, never at the typist. Reduce Motion gets a normal page.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
  var motion = !reduce && !!G;
  if (G && ST) G.registerPlugin(ST);
  if (G && Split) G.registerPlugin(Split);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var TICK = '<svg class="tick" viewBox="0 0 16 14" aria-hidden="true"><path d="M1 7 L6 12 L15 1"/></svg>';
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---------- Theme (per-viewer convenience only) ----------
  var themeBtn = $('#theme');
  try { var saved = localStorage.getItem('repeit-theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  var isDark = function () { return root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; };
  var syncThemeIcon = function () { if (themeBtn) themeBtn.textContent = isDark() ? '☀' : '☾'; };
  syncThemeIcon();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('repeit-theme', root.dataset.theme); } catch (e) {}
    syncThemeIcon();
  });

  // ---------- Toast ----------
  var toastEl = $('#toast'), toastTimer;
  var toast = function (msg, ms) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  };

  // ---------- Fixing a word: the core joke ----------
  // Swaps the letters with a little hop, then draws a tick.
  function fixWord(el, right, done) {
    var target = el.querySelector('.w') || el;
    var finish = function () {
      el.classList.add('fixed');
      if (!el.querySelector('.tick')) el.insertAdjacentHTML('beforeend', TICK);
      if (done) done();
    };
    if (!motion) { target.textContent = right; finish(); return; }
    var oldChars = target.textContent.split('').map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('');
    target.innerHTML = oldChars;
    G.timeline()
      .to(target.children, { yPercent: -70, opacity: 0, rotation: function () { return G.utils.random(-30, 30); }, duration: 0.18, stagger: 0.015, ease: 'power2.in' })
      .add(function () {
        target.innerHTML = right.split('').map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>'; }).join('');
        el.classList.add('fixed');
        G.from(target.children, { yPercent: 80, opacity: 0, duration: 0.42, stagger: 0.025, ease: 'back.out(2.4)', onComplete: function () { target.textContent = right; finish(); } });
      });
  }

  // ---------- Typo hunt ----------
  var hunts = $$('.hunt'), fixedCount = 0, counterText = $('#counter-text'), counter = $('#counter');
  var updateCounter = function () {
    counterText.textContent = fixedCount + ' of ' + hunts.length + ' typos fixed';
    counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
    if (fixedCount === hunts.length) setTimeout(function () { toast('All ' + hunts.length + ' fixed. You’d make a great proofreader. Repeat would like a word.', 5200); }, 500);
  };
  hunts.forEach(function (el) {
    var go = function () {
      if (el.classList.contains('fixed') || el.dataset.busy) return;
      el.dataset.busy = '1';
      el.setAttribute('aria-label', 'Fixed: ' + el.dataset.fix);
      fixWord(el, el.dataset.fix, function () { fixedCount++; updateCounter(); });
    };
    el.addEventListener('click', go);
    el.addEventListener('mouseenter', function () { if (el.classList.contains('tile')) go(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  var huntHint = function (e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    toast(hunts.length - fixedCount + ' typos are hiding on this page. Tap them to fix them.');
    if (motion) G.fromTo('.tile:not(.fixed)', { scale: 1 }, { scale: 1.15, yoyo: true, repeat: 1, duration: 0.25, stagger: 0.06 });
  };
  counter.addEventListener('click', huntHint);
  var hl = $('#hunt-link'); if (hl) hl.addEventListener('click', huntHint);

  // ---------- Hero: rings and orbiting typo tiles ----------
  var rings = $('.rings');
  [520, 800, 1120, 1480, 1880].forEach(function (d) { var i = document.createElement('i'); i.style.width = i.style.height = d + 'px'; rings.appendChild(i); });
  var tiles = $$('.tile');
  var orbit = tiles.map(function (t, i) {
    return { el: t, a: (i / tiles.length) * Math.PI * 2 + 0.35, r: [1, 0.9, 1.08, 0.95, 1.04, 0.86, 1.0][i % 7], tilt: [-8, 6, 5, -5, -3, 4, -4][i % 7], speed: 0.018 + (i % 3) * 0.004, paused: false };
  });
  orbit.forEach(function (o) {
    o.el.addEventListener('mouseenter', function () { o.paused = true; });
    o.el.addEventListener('mouseleave', function () { o.paused = false; });
  });
  var heroEl = $('.hero');
  // Phones: no room to orbit around the text, so tiles bob in a band above and below it.
  var PHONE_SPOTS = [[-0.30, 0], [0.05, 0], [0.32, 0], [-0.32, 1], [0.0, 1], [0.30, 1], [0.36, 0.5]];
  var placeTiles = function (dt) {
    var w = window.innerWidth, h = Math.max(560, window.innerHeight - 64);
    var rx = Math.min(640, w * 0.46), ry = Math.min(300, h * 0.36);
    var phone = w < 900, hh = heroEl.offsetHeight;
    orbit.forEach(function (o, i) {
      if (dt && !o.paused) o.a += o.speed * dt;
      var x, y;
      if (phone) {
        var s = PHONE_SPOTS[i % 7];
        x = s[0] * w + Math.cos(o.a * 3) * 6;
        y = (s[1] ? hh * 0.54 - 58 : -hh * 0.46 + 46) + Math.sin(o.a * 4) * 6;
      } else { var c = Math.cos(o.a); x = (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 0.55) * rx * o.r; y = Math.sin(o.a) * ry * o.r; } // hug the sides, cross the middle quickly
      o.el.style.transform = 'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + o.tilt + 'deg)';
    });
  };
  placeTiles(0);
  window.addEventListener('resize', function () { placeTiles(0); });
  if (motion) {
    G.ticker.add(function (time, deltaMs) { placeTiles(Math.min(deltaMs, 64) / 1000); });
    // Intro: everything sharpens into focus, then the headline fixes its own typo.
    G.from('.hero .stack > *', { opacity: 0, y: 18, filter: 'blur(10px)', duration: 0.8, stagger: 0.09, ease: 'power3.out', clearProps: 'filter,transform,opacity' });
    G.from('.tile', { opacity: 0, scale: 0.4, duration: 0.6, stagger: 0.07, delay: 0.5, ease: 'back.out(2)' });
    G.from('.rings i', { opacity: 0, scale: 0.85, duration: 1.2, stagger: 0.06, ease: 'power2.out' });
  }
  var headTypo = $('#headline-typo');
  setTimeout(function () { fixWord(headTypo, 'spelled'); }, motion ? 1700 : 0);

  // ---------- Pinned stage: sections swap in place ----------
  var stage = $('#stage'), panels = $$('.panel'), n = panels.length;
  var barNum = $('#bar-num'), barLabel = $('#bar-label'), barRight = $('#bar-right');
  var rulerLinks = $$('.ruler a'), pctEl = $('#pct'), track = $('#track');
  var active = -1, st = null, STEP = 1.5, HOLD = 0.5, TOTAL = (n - 1) * STEP + HOLD;
  var entered = {};

  function fixHeading(h) {
    if (!h || h.dataset.done) return;
    h.dataset.done = '1';
    var right = h.dataset.right;
    if (!motion) { h.textContent = right; return; }
    h.classList.add('caught');
    setTimeout(function () {
      h.classList.remove('caught');
      h.textContent = right;
      var split = Split ? Split.create(h, { type: 'words,chars' }) : null;
      var chars = split ? split.chars : [h];
      G.from(chars, { yPercent: -60, opacity: 0, rotation: function () { return G.utils.random(-25, 25); }, duration: 0.5, stagger: 0.022, ease: 'back.out(2.2)',
        onComplete: function () { if (split) split.revert(); h.insertAdjacentHTML('beforeend', TICK); var t = h.querySelector('.tick'); G.to(t, { opacity: 0, delay: 1.4, duration: 0.5 }); } });
    }, 420);
  }

  function setActive(i) {
    if (i === active) return;
    var p = panels[i];
    var flip = function () { barNum.textContent = p.dataset.num; barLabel.textContent = p.dataset.label; barRight.textContent = p.dataset.right; };
    if (motion && active !== -1) {
      barNum.classList.add('caught');
      G.timeline().to(barNum, { yPercent: -100, opacity: 0, duration: 0.18, delay: 0.25 })
        .add(function () { flip(); barNum.classList.remove('caught'); })
        .fromTo(barNum, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
    } else flip();
    active = i;
    rulerLinks.forEach(function (a, k) { a.classList.toggle('done', k <= i); });
    fixHeading($('h2', p));
    if (!entered[p.id]) { entered[p.id] = true; if (enterHooks[p.id]) enterHooks[p.id](); }
  }

  var goto = function (i) {
    if (st) {
      var y = st.start + ((i * STEP + HOLD / 2) / TOTAL) * (st.end - st.start);
      // Instant jump: smooth scrolling fights the snap. The scrubbed swap still animates.
      window.scrollTo({ top: Math.round(y), behavior: 'auto' });
    } else panels[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('[data-goto]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); goto(+a.dataset.goto); }); });

  var pinned = motion && ST && window.innerHeight >= 520;
  if (pinned) {
    root.classList.remove('no-pin');
    panels.forEach(function (p, i) {
      var h = $('h2', p);
      h.innerHTML = '<span class="wrong" aria-hidden="true">' + esc(h.dataset.wrong) + '</span><span class="sr">' + esc(h.dataset.right) + '</span>';
      if (i) G.set(p, { autoAlpha: 0 });
    });
    var tl = G.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to({}, { duration: HOLD });
    for (var i = 1; i < n; i++) {
      tl.to(panels[i - 1], { autoAlpha: 0, y: -90, filter: 'blur(10px)', duration: 0.6 }, (i - 1) * STEP + HOLD)
        .fromTo(panels[i], { autoAlpha: 0, y: 90, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, (i - 1) * STEP + HOLD + 0.4)
        .to({}, { duration: HOLD });
    }
    var snaps = panels.map(function (_, k) { return (k * STEP + HOLD / 2) / TOTAL; });
    st = ST.create({
      trigger: stage, pin: true, start: 'top top', end: function () { return '+=' + Math.round((n - 1) * window.innerHeight * 1.1); },
      scrub: 0.6, animation: tl, anticipatePin: 1,
      snap: { snapTo: snaps, directional: false, inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.05, ease: 'power2.inOut' },
      onEnter: function () { setActive(Math.max(0, active)); },
      onUpdate: function (self) {
        var t = self.progress * TOTAL;
        var idx = Math.max(0, Math.min(n - 1, Math.round((t - HOLD / 2) / STEP)));
        setActive(idx);
      }
    });
  } else {
    // Normal page: fix each heading as it scrolls into view.
    panels.forEach(function (p) {
      var h = $('h2', p);
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fixHeading(h); if (!entered[p.id]) { entered[p.id] = true; if (enterHooks[p.id]) enterHooks[p.id](); } } }); }, { threshold: 0.4 });
      io.observe(p);
    });
  }

  // Page % proofread
  var onScroll = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
    pctEl.textContent = 'Page ' + pct + '% proofread';
    track.style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- 01 Talk: pretend hold-to-talk (no microphone) ----------
  var holdkey = $('#holdkey'), pill = $('#pill'), pillWords = $('#pill-words'), raw = $('#raw'), clean = $('#clean');
  var SCRIPT = 'so um I think we should, scratch that, let’s move the review to Thursday'.split(' ');
  var CLEAN = 'Let’s move the review to Thursday.';
  var talkTimer = null, wordI = 0, holding = false, touched = false;
  var startTalk = function () {
    if (holding) return; holding = true; wordI = 0;
    holdkey.classList.add('down'); pill.classList.add('on'); pillWords.textContent = 'Listening…';
    raw.classList.remove('struck'); raw.textContent = ''; clean.textContent = '';
    talkTimer = setInterval(function () {
      if (wordI >= SCRIPT.length) return;
      wordI++;
      var said = SCRIPT.slice(0, wordI).join(' ');
      raw.textContent = said;
      pillWords.innerHTML = esc(SCRIPT.slice(Math.max(0, wordI - 6), wordI - 1).join(' ')) + ' <em>' + esc(SCRIPT[wordI - 1]) + '</em>';
    }, motion ? 170 : 1);
  };
  var stopTalk = function () {
    if (!holding) return; holding = false; clearInterval(talkTimer);
    holdkey.classList.remove('down');
    raw.textContent = SCRIPT.join(' ');
    raw.classList.add('struck');
    pillWords.innerHTML = '✓';
    if (motion) {
      clean.textContent = '';
      var k = 0, typer = setInterval(function () { k++; clean.textContent = CLEAN.slice(0, k); if (k >= CLEAN.length) clearInterval(typer); }, 22);
    } else clean.textContent = CLEAN;
    setTimeout(function () { pill.classList.remove('on'); pillWords.textContent = 'Hold the key and talk'; }, 900);
  };
  holdkey.addEventListener('pointerdown', function (e) { touched = true; holdkey.setPointerCapture(e.pointerId); startTalk(); });
  holdkey.addEventListener('pointerup', stopTalk);
  holdkey.addEventListener('pointercancel', stopTalk);
  holdkey.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); touched = true; startTalk(); } });
  holdkey.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); stopTalk(); } });
  pillWords.textContent = 'Hold the key and talk';

  // ---------- 02 Fix: live squiggles from a small built-in list ----------
  var FIX = { definately: 'definitely', definatly: 'definitely', recieve: 'receive', recieved: 'received', seperate: 'separate', seperately: 'separately', tommorow: 'tomorrow', tomorow: 'tomorrow',
    teh: 'the', alot: 'a lot', wierd: 'weird', occured: 'occurred', occurence: 'occurrence', untill: 'until', begining: 'beginning', beleive: 'believe', belive: 'believe', accomodate: 'accommodate',
    acheive: 'achieve', adress: 'address', arguement: 'argument', calender: 'calendar', collegue: 'colleague', comming: 'coming', concious: 'conscious', embarass: 'embarrass', enviroment: 'environment',
    existance: 'existence', foward: 'forward', freind: 'friend', goverment: 'government', grammer: 'grammar', happend: 'happened', independant: 'independent', judgement: 'judgment', knowlege: 'knowledge',
    libary: 'library', lisence: 'licence', licence: 'licence', maintainance: 'maintenance', neccessary: 'necessary', necesary: 'necessary', noticable: 'noticeable', ocasion: 'occasion', persue: 'pursue',
    posession: 'possession', prefered: 'preferred', priviledge: 'privilege', publically: 'publicly', recomend: 'recommend', refered: 'referred', relevent: 'relevant', resturant: 'restaurant', rythm: 'rhythm',
    succesful: 'successful', suprise: 'surprise', thier: 'their', truely: 'truly', wich: 'which', wether: 'whether', writting: 'writing', speled: 'spelled', typso: 'typos', hte: 'the', adn: 'and', becuase: 'because',
    beacuse: 'because', dont: 'don’t', cant: 'can’t', wont: 'won’t', im: 'I’m', ive: 'I’ve', youre: 'you’re', thats: 'that’s', recieving: 'receiving', exmaple: 'example', repeit: 'Repeat' };
  delete FIX.licence;
  var ta = $('#try'), mirror = $('#mirror'), fixesEl = $('#fixes'), fixTitle = $('#fix-title'), fixcard = $('#fixcard');
  var matchCase = function (orig, fix) { return orig[0] && orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase() ? fix[0].toUpperCase() + fix.slice(1) : fix; };
  var findTypos = function (text) {
    var out = [], re = /[A-Za-z’']+/g, m;
    while ((m = re.exec(text))) { var key = m[0].toLowerCase().replace(/[’']/g, ''); if (FIX[key] && FIX[key].toLowerCase() !== m[0].toLowerCase()) out.push({ word: m[0], at: m.index, fix: matchCase(m[0], FIX[key]) }); }
    return out;
  };
  var render = function () {
    var text = ta.value, typos = findTypos(text), html = '', last = 0;
    typos.forEach(function (t) { html += esc(text.slice(last, t.at)) + '<mark>' + esc(t.word) + '</mark>'; last = t.at + t.word.length; });
    mirror.innerHTML = html + esc(text.slice(last)) + '\n';
    fixesEl.innerHTML = '';
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!typos.length || words < 3) {
      fixcard.classList.add('clear');
      fixTitle.textContent = words < 3 ? 'Waiting for three words before checking…' : 'Reads well. Nothing to fix.';
      $('#fixall').style.display = 'none';
      return;
    }
    fixcard.classList.remove('clear'); $('#fixall').style.display = '';
    fixTitle.textContent = typos.length === 1 ? '1 small fix' : typos.length + ' small fixes in this sentence';
    typos.forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<s>' + esc(t.word) + '</s><b>' + esc(t.fix) + '</b>';
      b.setAttribute('aria-label', 'Change ' + t.word + ' to ' + t.fix);
      b.addEventListener('click', function () { applyFixes([t]); });
      fixesEl.appendChild(b);
    });
  };
  var applyFixes = function (list) {
    var text = ta.value;
    list.slice().sort(function (a, b) { return b.at - a.at; }).forEach(function (t) { text = text.slice(0, t.at) + t.fix + text.slice(t.at + t.word.length); });
    ta.value = text; render();
    if (motion) G.fromTo(ta, { y: -3 }, { y: 0, duration: 0.35, ease: 'bounce.out' });
  };
  $('#fixall').addEventListener('click', function () { applyFixes(findTypos(ta.value)); });
  ta.addEventListener('input', render);
  ta.addEventListener('scroll', function () { mirror.scrollTop = ta.scrollTop; });
  render();

  // ---------- 03 Meaning guard slapstick ----------
  var playSlap = function () {
    var notw = $('#notword'), cur = $('#aicursor'), lab = $('#ailabel'), held = $('#held');
    if (!motion) { G && G.set(held, { opacity: 1 }); held.style.opacity = 1; return; }
    G.timeline()
      .set(held, { opacity: 0, y: 16 }).set(notw, { x: 0, y: 0, rotation: -6 })
      .fromTo([cur, lab], { x: 160, y: 60, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to(cur, { x: -46, y: -64, duration: 0.45, ease: 'power2.inOut' })
      .to(lab, { x: -46, y: -64, duration: 0.45, ease: 'power2.inOut' }, '<')
      .to(notw, { x: 70, y: -26, rotation: 10, duration: 0.35, ease: 'power1.in' })
      .to([cur, lab], { x: 24, y: -90, duration: 0.35, ease: 'power1.in' }, '<')
      .to(notw, { rotation: -14, duration: 0.08, repeat: 5, yoyo: true, ease: 'none' })
      .to(notw, { x: 0, y: 0, rotation: -6, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' })
      .to([cur, lab], { x: 220, y: 40, opacity: 0, rotation: 20, duration: 0.5, ease: 'power3.in' }, '<')
      .to(held, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, '-=0.3');
  };
  $('#again').addEventListener('click', playSlap);

  var enterHooks = {
    talk: function () { if (!touched) { setTimeout(function () { if (touched) return; startTalk(); setTimeout(stopTalk, 2700); }, motion ? 900 : 0); } },
    meaning: function () { setTimeout(playSlap, motion ? 700 : 0); }
  };

  // ---------- 04 Everywhere: tap to flip on touch screens ----------
  $$('.plat').forEach(function (p) { p.addEventListener('click', function (e) { if (e.target.closest('a')) return; p.classList.toggle('flip'); }); });

  // ---------- 05 Pricing: the buy button misspells itself, then fixes it ----------
  var buy = $('#buy'), buyTimer;
  if (buy) buy.addEventListener('mouseenter', function () {
    if (!motion) return;
    buy.innerHTML = '<span class="typo"><span class="w">Buy a licnece</span></span>';
    clearTimeout(buyTimer); buyTimer = setTimeout(function () { buy.textContent = 'Buy a licence'; }, 380);
  });

  // ---------- Beta sign-up (same Formspree form as index.html) ----------
  var FORM_ENDPOINT = 'https://formspree.io/f/mzeenoke';
  var DOWNLOAD_URL = ''; // set once the GitHub Release exists
  var email = $('#email');
  if (motion) {
    var ph = function () { if (document.activeElement === email || email.value) return; email.placeholder = 'you@exmaple.com'; setTimeout(function () { email.placeholder = 'you@example.com'; }, 1400); };
    setInterval(ph, 6000); ph();
  }
  $('#beta-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!email.checkValidity()) { email.focus(); email.reportValidity(); return; }
    var data = new FormData(e.target); data.append('variant', 'playful');
    var done = function () {
      e.target.style.display = 'none';
      if (DOWNLOAD_URL) $('#download-link').href = DOWNLOAD_URL; else $('#download-block').style.display = 'none';
      $('#thanks').style.display = 'block';
      if (window.repeitTrack) window.repeitTrack('generate_lead', { method: 'beta_form' }); // counted only if analytics accepted; no email sent to GA
    };
    var button = e.target.querySelector('button');
    var failed = function () { button.disabled = false; button.textContent = 'Get the beta'; toast('Sorry, that didn’t go through. Please try again in a moment.'); };
    button.disabled = true; button.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).then(function (r) { if (r.ok) done(); else failed(); }, failed);
  });
})();

// On-device side tab: opens a short promise panel (founder, 12 Nov).
(function () {
  var btn = document.getElementById('sidetab-btn'), panel = document.getElementById('sidetab-panel');
  if (!btn) return;
  var set = function (open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.hidden = !open; };
  btn.addEventListener('click', function () { set(panel.hidden); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#sidetab')) set(false); });
})();
