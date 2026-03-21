/* ============================================================
   TERMOLAND – counter.js
   Animates .stat-number elements from 0 to data-target
   when they enter the viewport.
   ============================================================ */

(function () {
  'use strict';

  function animateCount(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const counterEls = document.querySelectorAll('.stat-number[data-target]');
    if (!counterEls.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => observer.observe(el));
  });
})();
