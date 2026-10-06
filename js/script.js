/* ============================================
   Lakshay Dhawan — Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Grid children get their own reveal + stagger (before observer query) */
  document.querySelectorAll('.projects-grid, .capstone-requirements, .docs-grid, .capstone-timeline').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--stagger', `${(Math.min(i, 6) * 70 / 1000).toFixed(2)}s`);
    });
  });

  /* ---------- DOM References ---------- */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const reveals     = document.querySelectorAll('.reveal');

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  /* ===========================================
     1. THEME TOGGLE (dark / light)
     =========================================== */
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ===========================================
     2. MOBILE HAMBURGER MENU
     =========================================== */
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ===========================================
     3. NAVBAR SCROLL EFFECT + PROGRESS BAR
     =========================================== */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      navbar.classList.toggle('scrolled', scrollY > 50);
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      ticking = false;
    });
  }, { passive: true });

  /* ===========================================
     4. ACTIVE NAV LINK ON SCROLL
     =========================================== */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          allNavLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ===========================================
     5. SCROLL-REVEAL (IntersectionObserver)
     =========================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  /* ===========================================
     6. SMOOTH SCROLL FOR ANCHOR LINKS
     =========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 72; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ===========================================
     7. CONTACT — LinkedIn / GitHub only (no dead form)
     =========================================== */

  /* ===========================================
     8. COVER LETTER GENERATOR
     =========================================== */
  const coverLetterDoc  = document.getElementById('coverLetterDoc');
  const copyBtn         = document.getElementById('copyCoverLetter');
  const downloadBtn     = document.getElementById('downloadCoverLetter');
  const resetBtn        = document.getElementById('resetCoverLetter');
  const editableFields  = document.querySelectorAll('.cl-editable');

  // Store original values for reset
  const originalValues = [];
  editableFields.forEach(field => {
    originalValues.push(field.textContent);
  });

  // Mark as edited when user changes content
  editableFields.forEach(field => {
    field.addEventListener('focus', () => {
      if (field.textContent === field.dataset.placeholder) {
        field.textContent = '';
      }
    });
    field.addEventListener('blur', () => {
      if (field.textContent.trim() === '') {
        field.textContent = field.dataset.placeholder;
        field.classList.remove('edited');
      } else if (field.textContent !== field.dataset.placeholder) {
        field.classList.add('edited');
      }
    });
    field.addEventListener('input', () => {
      if (field.textContent.trim() !== '' && field.textContent !== field.dataset.placeholder) {
        field.classList.add('edited');
      }
    });
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    const text = coverLetterDoc.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      copyBtn.style.background = '#10b981';
      setTimeout(() => {
        copyBtn.innerHTML = original;
        copyBtn.style.background = '';
      }, 2000);
    });
  });

  // Download as .txt
  downloadBtn.addEventListener('click', () => {
    const text = coverLetterDoc.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'Lakshay_Dhawan_Cover_Letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Reset template
  resetBtn.addEventListener('click', () => {
    editableFields.forEach((field, i) => {
      field.textContent = originalValues[i];
      field.classList.remove('edited');
    });
  });

  /* ===========================================
     9. SCRAMBLE-DECODE on section titles
     =========================================== */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*<>/\\{}[]';
  function scramble(el) {
    const final = el.dataset.finalText;
    let frame = 0;
    const queue = [...final].map((ch, i) => ({
      ch, start: Math.floor(i * 1.6), end: Math.floor(i * 1.6) + 8 + Math.random() * 10,
    }));
    function tick() {
      let out = '';
      let done = 0;
      queue.forEach(q => {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start) { out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
        else out += ' ';
      });
      el.textContent = out;
      if (done < queue.length) { frame++; requestAnimationFrame(tick); }
      else el.textContent = final;
    }
    tick();
  }

  if (!prefersReducedMotion) {
    document.querySelectorAll('.section-title').forEach(el => {
      el.dataset.finalText = el.textContent;
    });
    const scrambleObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble(entry.target);
          scrambleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section-title').forEach(el => scrambleObserver.observe(el));
  }

  /* ===========================================
     10. 3D TILT on project cards (pointer tracking)
     =========================================== */
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.add('tilt');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ===========================================
     11. MAGNETIC pull on primary buttons
     =========================================== */
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.18;
        const dy = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
        btn.style.transform = '';
        setTimeout(() => { btn.style.transition = ''; }, 400);
      });
    });
  }

  /* ===========================================
     12. THREE.JS hero field (lazy, optional)
     =========================================== */
  if (!prefersReducedMotion && !matchMedia('(prefers-reduced-data: reduce)').matches) {
    import('./hero-3d.js')
      .then(m => m.initHero3D())
      .catch(() => { /* no WebGL / offline CDN — page stays as-is */ });
  }
});
