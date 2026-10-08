/* ============================================
   Lakshay Dhawan — Portfolio JavaScript
   v2: cinematic motion layer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.remove('booting');

  /* Grid children get their own reveal + stagger (before observer query) */
  document.querySelectorAll('.projects-grid, .capstone-requirements, .docs-grid, .capstone-timeline, .about-stats').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--stagger', `${(Math.min(i, 7) * 0.16).toFixed(2)}s`);
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
     3. NAVBAR SCROLL + PROGRESS + SLIDING INDICATOR
     =========================================== */
  const navList = document.querySelector('.nav-links');
  const navIndicator = document.createElement('span');
  navIndicator.className = 'nav-indicator';
  navList.appendChild(navIndicator);

  function moveIndicator() {
    const active = document.querySelector('.nav-link.active');
    if (!active || getComputedStyle(navList).display === 'none') return;
    const lr = navList.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    navIndicator.style.transform = `translateX(${ar.left - lr.left}px)`;
    navIndicator.style.width = `${ar.width}px`;
  }

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
          moveIndicator();
        }
      } else if (allNavLinks.length) {
        // section with no nav link (e.g. cover letter): keep the nearest
        // preceding linked section active instead of clearing the indicator
        const before = [...sections].filter(s => s.offsetTop <= scrollY && document.querySelector(`.nav-link[href="#${s.id}"]`));
        const anchor = before[before.length - 1];
        if (anchor) {
          allNavLinks.forEach(l => l.classList.remove('active'));
          const a = document.querySelector(`.nav-link[href="#${anchor.id}"]`);
          a.classList.add('active');
          moveIndicator();
        }
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  addEventListener('resize', moveIndicator);
  updateActiveNav();
  requestAnimationFrame(moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  /* ===========================================
     5. SCROLL-REVEAL — replayable both directions
     =========================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => {
    if (el.closest('.hero')) return; // hero uses the entrance choreography
    revealObserver.observe(el);
  });

  /* ===========================================
     6. HERO ENTRANCE — choreographed timeline
     =========================================== */
  const heroCopy   = document.querySelector('.hero-copy');
  const heroName   = document.querySelector('.hero-name');
  const heroGreet  = document.querySelector('.hero-greeting');
  const heroTitle  = document.querySelector('.hero-title');
  const heroIntro  = document.querySelector('.hero-intro');
  const heroCta    = document.querySelector('.hero-cta');
  const heroNotes  = document.querySelector('.hero-notes');

  [heroGreet, heroName, heroTitle, heroIntro, heroCta, heroNotes].forEach(el => el && el.classList.remove('reveal'));
  if (heroCopy && heroName && !prefersReducedMotion) {
    const words = heroName.textContent.trim().split(/\s+/);
    heroName.innerHTML = words.map(w => `<span class="hero-word"><span>${w}</span></span>`).join(' ');

    document.body.classList.add('hero-enter');
    setTimeout(() => document.body.classList.add('hero-enter-done'), 4200);
  }

  /* Hero notes card: pointer tilt (applied through CSS vars, composed in CSS) */
  if (heroNotes && !prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      heroNotes.style.setProperty('--tilt-x', `${((e.clientY / innerHeight) - 0.5) * -3}deg`);
      heroNotes.style.setProperty('--tilt-y', `${((e.clientX / innerWidth) - 0.5) * 4}deg`);
    }, { passive: true });
  }

  /* ===========================================
     7. SMOOTH SCROLL FOR ANCHOR LINKS
     =========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href.length < 2) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 72; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ===========================================
     8. RESUME ACCORDION — turns the 5,000px wall
        into collapsible, animated panels
     =========================================== */
  document.querySelectorAll('#resume .resume-section').forEach((block, i) => {
    const title = block.querySelector('.resume-section-title');
    if (!title) return;
    const panel = document.createElement('div');
    panel.className = 'resume-panel';
    const inner = document.createElement('div');
    inner.className = 'resume-panel-inner';
    while (block.children.length > 1) inner.appendChild(block.children[1]);
    panel.appendChild(inner);
    block.appendChild(panel);

    const count = panel.querySelectorAll('.resume-entry').length ||
                  panel.querySelectorAll('.skill-tag').length;
    title.insertAdjacentHTML('beforeend',
      `<span class="resume-chev" aria-hidden="true">+</span>` +
      (count ? `<span class="resume-count">${count}</span>` : ''));

    if (i === 0) {
      block.classList.add('open');
      title.setAttribute('aria-expanded', 'true');
    }
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.addEventListener('click', () => {
      const open = block.classList.toggle('open');
      title.setAttribute('aria-expanded', String(open));
    });
    title.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); title.click(); }
    });
  });

  /* ===========================================
     9. STAT COUNT-UP
     =========================================== */
  if (!prefersReducedMotion) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        statObserver.unobserve(entry.target);
        const el = entry.target;
        const m  = el.textContent.match(/^(\d+)(.*)$/);
        if (!m) return;
        const target = parseInt(m[1], 10);
        const suffix = m[2] || '';
        const dur = 2600, t0 = performance.now();
        (function tick(t) {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));
  }

  /* ===========================================
     10. SCRAMBLE-DECODE on section titles (slow decode)
     =========================================== */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*<>/\\{}[]';
  function scramble(el) {
    const final = el.dataset.finalText;
    let frame = 0;
    const queue = [...final].map((ch, i) => ({
      ch, start: Math.floor(i * 5.5), end: Math.floor(i * 5.5) + 26 + Math.random() * 18,
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
      else { el.textContent = final; el.classList.add('decoded'); }
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
    document.querySelectorAll('.section-title').forEach(el => {
      if (el.closest('.hero')) return;
      scrambleObserver.observe(el);
    });
  }

  /* ===========================================
     11. SLOW 3D TILT on project cards
     =========================================== */
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.add('tilt');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ===========================================
     12. MAGNETIC pull on buttons (gentle, slow release)
     =========================================== */
  if (!prefersReducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.14;
        const dy = (e.clientY - r.top - r.height / 2) * 0.22;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transition = 'transform 0.7s cubic-bezier(.16,1,.3,1)';
        btn.style.transform = '';
        setTimeout(() => { btn.style.transition = ''; }, 700);
      });
    });
  }

  /* ===========================================
     14. CINEMATIC HERO PARALLAX (lerped rAF loop)
     =========================================== */
  if (heroCopy && !prefersReducedMotion) {
    let cur = -1;
    (function loop() {
      const y = window.scrollY;
      const heroH = heroCopy.offsetHeight || 600;
      if (Math.abs(y - cur) > 0.5) {
        cur = y;
        const p = Math.min(1, y / heroH);
        heroCopy.style.transform  = `translateY(${p * 170}px)`;
        heroCopy.style.opacity    = String(Math.max(0, 1 - p * 1.15));
        if (heroNotes) {
          heroNotes.style.setProperty('--p-y', `${p * -70}px`);
          heroNotes.style.setProperty('--p-r', `${p * 4}deg`);
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ===========================================
     15. COVER LETTER GENERATOR
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
     16. THREE.JS hero scene (lazy, optional)
     =========================================== */
  if (!prefersReducedMotion && !matchMedia('(prefers-reduced-data: reduce)').matches) {
    import('./hero-3d.js')
      .then(m => m.initHero3D())
      .catch(() => { /* no WebGL / offline CDN — page stays as-is */ });
  }
});

  /* ===========================================
     12. GITHUB FEED — latest public commits, quiet failure
     =========================================== */
  (function ghFeed() {
    const list = document.getElementById('ghFeed');
    if (!list) return;
    const NOISE = /(\d{9}|COMP\d|lab|a2_|exam|test|assign|exec|winter20|chat_app|midterm)/i;
    fetch('https://api.github.com/users/imlakshayd/repos?sort=updated&per_page=30', {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(repos => {
        const picks = repos
          .filter(r => !NOISE.test(r.name) && r.pushed_at)
          .slice(0, 5);
        if (!picks.length) throw 0;
        const fmt = d => {
          const days = Math.floor((Date.now() - new Date(d)) / 864e5);
          return days < 1 ? 'today' : days < 30 ? days + 'd ago' : new Date(d).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
        };
        list.innerHTML = picks.map(r => `<li><a href="${r.html_url}" target="_blank" rel="noopener"><span class="gh-repo">${r.name}</span></a><span class="gh-meta">${r.language || 'code'} &middot; ${fmt(r.pushed_at)}</span></li>`).join('');
      })
      .catch(() => {
        list.innerHTML = '<li class="gh-feed-empty">Latest activity lives on <a href="https://github.com/imlakshayd" target="_blank" rel="noopener">github.com/imlakshayd</a>.</li>';
      });
  })();
