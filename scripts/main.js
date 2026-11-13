(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // theme
  var tg = $('#themeToggle');
  if (tg) tg.addEventListener('click', function () {
    var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    try { localStorage.setItem('mg-theme', n); } catch (e) {}
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = n === 'dark' ? '#0e0b24' : '#f5f2ff';
  });

  // year
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // progress, dock, nav active
  var prog = $('#progress'), dock = $('#dock');
  var links = $$('.nav a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    if (dock) dock.classList.toggle('show', h.scrollTop > 500);
    var cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 140) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // reveal
  var rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  // count-up
  function countUp(el) {
    var to = +el.getAttribute('data-count'); if (reduce) { el.textContent = to; return; }
    var t0 = performance.now();
    (function f(t) { var p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
  }, { threshold: .6 }) : null;
  $$('[data-count]').forEach(function (el) { cio ? cio.observe(el) : null; });

  // impact: count from "before" to "after" once when visible
  var fmt = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var outs = $$('.lab output');
  function finalText(o) { return fmt(+o.getAttribute('data-to'), +o.getAttribute('data-dec')) + (o.getAttribute('data-plus') ? '+' : ''); }
  function runImpact() {
    outs.forEach(function (o) {
      var from = +o.getAttribute('data-from'), to = +o.getAttribute('data-to'), d = +o.getAttribute('data-dec');
      if (reduce) { o.textContent = finalText(o); return; }
      var t0 = performance.now();
      (function f(t) {
        var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
        o.textContent = p < 1 ? fmt(from + (to - from) * e, d) : finalText(o);
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    });
  }
  var lab = $('.lab');
  if (lab && 'IntersectionObserver' in window && !reduce) {
    outs.forEach(function (o) { o.textContent = fmt(+o.getAttribute('data-from'), +o.getAttribute('data-dec')); });
    var lio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { runImpact(); lio.disconnect(); } }, { threshold: .35 });
    lio.observe(lab);
  }

  // accordion: keep one open (name attr fallback)
  $$('.case').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) $$('.case').forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // AI steps cycle
  var steps = $$('.step'), si = 0, paused = false, st = $('#steps');
  if (steps.length && !reduce) {
    steps[0].classList.add('on');
    if (st) { st.addEventListener('mouseenter', function () { paused = true; }); st.addEventListener('mouseleave', function () { paused = false; }); }
    steps.forEach(function (s, k) { s.addEventListener('mouseenter', function () { steps.forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); si = k; }); });
    setInterval(function () { if (paused || document.hidden) return; steps[si].classList.remove('on'); si = (si + 1) % steps.length; steps[si].classList.add('on'); }, 2800);
  }

  // cursor tag + magnetic buttons (fine pointers only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var cur = document.createElement('div'); cur.className = 'cursor'; document.body.appendChild(cur);
    document.addEventListener('mousemove', function (e) {
      cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
      var t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) { cur.textContent = t.getAttribute('data-cursor'); cur.classList.add('on'); cur.style.transform = 'translate(14px,14px) scale(1)'; } else cur.classList.remove('on');
    });
    $$('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // copy email
  var cb = $('#copyBtn'), cs = $('#copyStatus');
  if (cb) cb.addEventListener('click', function () {
    var mail = 'guptamuskan423@gmail.com', done = function (ok) {
      var old = cb.textContent; cb.textContent = ok ? 'Copied ✓' : 'Press Ctrl+C'; if (cs) cs.textContent = ok ? 'Email address copied' : 'Copy failed';
      setTimeout(function () { cb.textContent = old; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
})();
