/* ============================================================
   TERMOLAND – Language Toggle (TR / EN)
   Uses data-tr / data-en attributes on every text node.
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'termoland-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'tr';

  /* ---------- apply language -------------------------------- */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    // Update all elements with data-tr / data-en
    document.querySelectorAll('[data-tr]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text) el.innerHTML = text;
    });

    // Toggle active styling on the button spans
    const trEl = document.getElementById('langTR');
    const enEl = document.getElementById('langEN');
    if (trEl && enEl) {
      if (lang === 'tr') {
        trEl.classList.add('lang-active');
        enEl.classList.remove('lang-active');
      } else {
        enEl.classList.add('lang-active');
        trEl.classList.remove('lang-active');
      }
    }

    // Update page title
    if (lang === 'en') {
      document.title = 'Termoland – Foreign Trade | Global Thermoplastic Solutions';
    } else {
      document.title = 'Termoland – Dış Ticaret | Global Thermoplastic Solutions';
    }
  }

  /* ---------- toggle --------------------------------------- */
  function toggle() {
    applyLang(currentLang === 'tr' ? 'en' : 'tr');
  }

  /* ---------- init ----------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    // Wire button
    const btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', toggle);

    // Apply saved / default language
    applyLang(currentLang);
  });

  // Expose globally if needed
  window.termoLang = { toggle, applyLang, get current() { return currentLang; } };
})();
