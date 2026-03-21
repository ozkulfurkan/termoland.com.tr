/* ============================================================
   TERMOLAND – contact.js
   EmailJS integration for the contact form.

   ⚠️  SETUP REQUIRED:
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (Gmail, Outlook, etc.)
   3. Create an Email Template with variables:
        {{from_name}}, {{from_email}}, {{subject}}, {{message}}
   4. Replace the three placeholders below with your IDs.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- ⚙️  Configure these three values ------------- */
  const EMAILJS_PUBLIC_KEY = 'JxAQfShQscl4LIIqO';   // e.g. "abc123XYZ"
  const EMAILJS_SERVICE_ID = 'service_8eq3qs5';   // e.g. "service_xxxxx"
  const EMAILJS_TEMPLATE_ID = 'template_opvn9la';  // e.g. "template_xxxxx"
  /* ---------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {

    // Guard: EmailJS must be loaded
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS SDK not loaded.');
      return;
    }

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn && submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn && submitBtn.querySelector('.btn-spinner');
    const successEl = document.getElementById('formSuccess');
    const errorEl = document.getElementById('formError');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Hide previous feedback
      if (successEl) successEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      // Show loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';

      const templateParams = {
        from_name: form.from_name.value.trim(),
        from_email: form.from_email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
        to_name: 'Termoland',
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          // Success
          if (successEl) {
            successEl.style.display = 'block';
            // Translate text if lang is EN
            const lang = (window.termoLang && window.termoLang.current) || 'tr';
            successEl.textContent = lang === 'en'
              ? '✓ Your message was sent! We\'ll get back to you shortly.'
              : '✓ Mesajınız iletildi! En kısa sürede dönüş yapacağız.';
          }
          form.reset();
          submitBtn.classList.add('success');
          setTimeout(() => submitBtn.classList.remove('success'), 600);
        })
        .catch(function (err) {
          console.error('EmailJS error:', err);
          if (errorEl) {
            errorEl.style.display = 'block';
            const lang = (window.termoLang && window.termoLang.current) || 'tr';
            errorEl.textContent = lang === 'en'
              ? '✗ An error occurred. Please try again.'
              : '✗ Bir hata oluştu. Lütfen tekrar deneyin.';
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (btnText) btnText.style.display = 'inline';
          if (btnSpinner) btnSpinner.style.display = 'none';
        });
    });

  });
})();
