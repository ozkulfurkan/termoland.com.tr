/* ============================================================
   TERMOLAND – main.js
   ============================================================ */

/* ============================================================
   PRODUCT MODAL DATA
   ============================================================ */
const PRODUCT_DATA = {
  'TPU': {
    img:   'assets/tpu-sole.svg',
    title: 'TPU',
    sub:   'Termoplastik Poliüretan',
    desc:  'Portföyümüzde, 75–85 Shore A sertlikte, transparent TPU (Termoplastik Poliüretan) hammadde seçenekleri yer almaktadır.',
    specs: [
      { label: 'Malzeme Türü', value: 'TPU (Termoplastik Poliüretan)' },
      { label: 'Sertlik',      value: '75–85 Shore A' },
      { label: 'Renk',         value: 'Transparent (Şeffaf)' },
      { label: 'Form',         value: 'Granül hammadde' }
    ]
  },
  'TPR': {
    img:   'assets/tpr-sole.svg',
    title: 'TPR',
    sub:   'Termoplastik Kauçuk',
    desc:  'Ayakkabı sektöründe en çok tüketilen standart hafiflikte aşınma direncine sahip üründür. ÖZKUL TERMOPLASTİK bünyesinde 1000 civarında renk bulunmaktadır.',
    specs: []
  },
  'TR Light': {
    img:   'assets/tr-light-sole.svg',
    title: 'TR Light',
    sub:   'Hafif Taban Malzemesi',
    desc:  'Alışılmışın dışında hafiflikte ve mükemmel cilt görünümü ile taban sektöründe son yılların trendi olan bu ürün bünyemizde farklı renklerde üretilmektedir. Bu hammadde sayesinde ayakkabılar artık daha hafif.',
    specs: []
  }
};

document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================
     NAVBAR
     ====================================================== */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightNavLink();
  }, { passive: true });

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function highlightNavLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  highlightNavLink();

  /* ========================================================
     HAMBURGER
     ====================================================== */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function () {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ========================================================
     SCROLL REVEAL
     ====================================================== */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ========================================================
     SMOOTH SCROLL (anchor links)
     ====================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  /* ========================================================
     TYPEWRITER HERO
     ====================================================== */
  const twEl = document.getElementById('typewriter');
  if (twEl) {
    const phrases = {
      tr: ['Sınırları Aşan Kalite', 'Dünyaya Açılan Pencere', '16 Ülkede Güvenilir Ortak'],
      en: ['Quality Without Borders', 'Your Window to the World', 'Trusted Partner in 16 Countries'],
    };

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let paused    = false;

    function getCurrentPhrases() {
      const lang = (window.termoLang && window.termoLang.current) || 'tr';
      return phrases[lang] || phrases.tr;
    }

    function tick() {
      if (paused) return;
      const list   = getCurrentPhrases();
      const phrase = list[phraseIdx % list.length];

      if (!deleting) {
        charIdx++;
        twEl.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          paused = true;
          setTimeout(() => { paused = false; deleting = true; setTimeout(tick, 50); }, 2200);
          return;
        }
      } else {
        charIdx--;
        twEl.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx++;
          setTimeout(tick, 300);
          return;
        }
      }

      setTimeout(tick, deleting ? 45 : 75);
    }

    setTimeout(tick, 1400);
  }

  /* ========================================================
     PARTICLE CANVAS (Hero background)
     ====================================================== */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 60;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function initParticles() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x:  rand(0, W),
          y:  rand(0, H),
          r:  rand(1, 2.8),
          vx: rand(-0.3, 0.3),
          vy: rand(-0.3, 0.3),
          a:  rand(0.08, 0.35),
        });
      }
    }
    initParticles();

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,200,200,${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,180,${p.a})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;
      });

      requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }

  /* ========================================================
     HOLOGRAPHIC CARD — tilt + foil + glare
     ====================================================== */
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  document.querySelectorAll('.product-card').forEach(card => {
    function applyTilt(clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top)  / rect.height;
      const rx = (y - 0.5) * -18;
      const ry = (x - 0.5) *  18;
      card.style.setProperty('--rx',      `${rx}deg`);
      card.style.setProperty('--ry',      `${ry}deg`);
      card.style.setProperty('--px',      `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--py',      `${(y * 100).toFixed(1)}%`);
      card.style.setProperty('--angle',   `${125 + ry}deg`);
      card.style.setProperty('--foil-o',  '1');
      card.style.setProperty('--glare-o', '0.8');
    }

    function resetTilt() {
      card.style.setProperty('--rx',      '0deg');
      card.style.setProperty('--ry',      '0deg');
      card.style.setProperty('--foil-o',  '0');
      card.style.setProperty('--glare-o', '0');
    }

    if (!isTouch) {
      card.addEventListener('mousemove', e => applyTilt(e.clientX, e.clientY));
      card.addEventListener('mouseleave', resetTilt);
    } else {
      card.addEventListener('touchmove', e => {
        const t = e.touches[0];
        applyTilt(t.clientX, t.clientY);
      }, { passive: true });
      card.addEventListener('touchend', resetTilt);
    }

    // Click → open modal
    card.addEventListener('click', () => {
      const key = card.dataset.key;
      if (key && PRODUCT_DATA[key]) openModal(key);
    });
  });

  /* ========================================================
     PRODUCT MODAL
     ====================================================== */
  const modal       = document.getElementById('productModal');
  const modalClose  = document.getElementById('modalClose');
  const modalBd     = document.getElementById('modalBackdrop');
  const modalImg    = document.getElementById('modalImg');
  const modalTag    = document.getElementById('modalTag');
  const modalTitle  = document.getElementById('modalTitle');
  const modalSub    = document.getElementById('modalSub');
  const modalDesc   = document.getElementById('modalDesc');
  const modalSpecs  = document.getElementById('modalSpecs');

  function openModal(key) {
    const d = PRODUCT_DATA[key];
    modalImg.src      = d.img;
    modalImg.alt      = d.title;
    modalTag.textContent   = 'Ürün Detayı';
    modalTitle.textContent = d.title;
    modalSub.textContent   = d.sub;
    modalDesc.textContent  = d.desc;
    modalSpecs.innerHTML   = d.specs.map(s =>
      `<div class="modal-spec-row"><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>`
    ).join('');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBd)    modalBd.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

});
