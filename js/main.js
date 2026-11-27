/* Business Systems hub — motion: scroll reveals, animated counters,
   hero headline words, sticky header, scroll progress, hero parallax.
   Vanilla JS, respects prefers-reduced-motion. */
'use strict';

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hero headline — word by word */
(function heroTitle() {
  var h = document.getElementById('hero-title');
  if (!h || reduced) return;
  var i = 0;
  Array.prototype.slice.call(h.childNodes).forEach(function (child) {
    if (child.nodeType === 3) {
      var frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span');
        s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
        frag.appendChild(s);
      });
      h.replaceChild(frag, child);
    }
  });
})();

/* Scroll reveals */
(function reveals() {
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (n) { n.classList.add('in'); });
    return;
  }
  items.forEach(function (n, i) {
    n.classList.add('pre');
    n.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.classList.remove('pre');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (n) { io.observe(n); });
})();

/* Animated counters */
(function counters() {
  var nums = document.querySelectorAll('.count');
  function run(node) {
    var target = Number(node.dataset.count) || 0;
    if (reduced) { node.textContent = target.toLocaleString('en-PK'); return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(target * eased).toLocaleString('en-PK');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  nums.forEach(function (n) { io.observe(n); });
})();

/* Sticky header + scroll progress + hero parallax */
(function scrollFx() {
  var nav = document.getElementById('top');
  var bar = document.getElementById('scroll-progress');
  var photo = document.getElementById('hero-photo');
  var ticking = false;
  function update() {
    var y = window.scrollY || 0;
    nav.classList.toggle('is-stuck', y > 24);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (photo && !reduced && y < window.innerHeight * 1.2) {
      photo.style.translate = '0 ' + (y * 0.22) + 'px';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
