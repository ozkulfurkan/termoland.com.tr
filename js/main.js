/* ============================================================
   TERMOLAND – main.js
   · Navbar scroll behaviour
   · Hamburger mobile menu
   · Scroll reveal (Intersection Observer)
   · Active nav link highlight
   · Typewriter hero text
   · Particle canvas hero background
   · Touch flip for product cards
   ============================================================ */

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
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

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
     TOUCH FLIP for product cards (mobile / no-hover)
     ====================================================== */
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', function () {
        const inner = this.querySelector('.card-inner');
        inner.classList.toggle('flipped');
      });
    });
  }

});
