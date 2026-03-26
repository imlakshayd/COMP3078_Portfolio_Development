/* ============================================
   Lakshay Dhawan — Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DOM References ---------- */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');
  const contactForm = document.getElementById('contactForm');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const reveals     = document.querySelectorAll('.reveal');

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
     3. NAVBAR SCROLL EFFECT
     =========================================== */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
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
     7. CONTACT FORM HANDLER
     =========================================== */
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('formName').value.trim();
    const email   = document.getElementById('formEmail').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !message) return;

    // Visual feedback
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Message Sent!';
    btn.style.background = '#10b981';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 2500);
  });

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
     9. TYPING EFFECT ON HERO NAME (subtle)
     =========================================== */
  const heroGreeting = document.querySelector('.hero-greeting');
  if (heroGreeting) {
    heroGreeting.style.opacity = '0';
    setTimeout(() => {
      heroGreeting.style.transition = 'opacity 1s ease';
      heroGreeting.style.opacity = '1';
    }, 300);
  }
});
