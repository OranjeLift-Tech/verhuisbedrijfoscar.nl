/* ============================================
   Verhuisbedrijf Oscar - Main JavaScript
   Vanilla ES6 | No dependencies
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     1. MOBILE MENU (hamburger toggle)
     ------------------------------------------ */
  const hamburger = document.querySelector('.header__hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  function openMobileMenu() {
    hamburger.classList.add('active');
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('active');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    // Close when clicking the overlay background
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        closeMobileMenu();
      }
    });

    // Close when clicking a nav link
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }


  /* ------------------------------------------
     2. HEADER SCROLL EFFECT
     ------------------------------------------ */
  const header = document.querySelector('.header');
  let lastScrollState = false;
  let ticking = false;

  function updateHeaderScroll() {
    const scrolled = window.scrollY > 50;
    if (scrolled !== lastScrollState) {
      lastScrollState = scrolled;
      if (scrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    ticking = false;
  }

  if (header) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderScroll);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state
    updateHeaderScroll();
  }


  /* ------------------------------------------
     3. SMOOTH SCROLL
     ------------------------------------------ */
  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;

    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // Handle all anchor links with hash
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      e.preventDefault();
      smoothScrollTo(href);

      // Update URL without jumping
      history.pushState(null, '', href);
    });
  });

  // Handle cross-page hash links (e.g., from contact.html to index.html#offerte)
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return; // Already handled above

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const targetPage = href.substring(0, hashIndex);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // If the link points to the current page, smooth scroll instead of navigating
    if (targetPage === currentPage || targetPage === '') {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = href.substring(hashIndex);
        smoothScrollTo(hash);
        history.pushState(null, '', hash);
      });
    }
  });

  // On page load, scroll to hash if present
  if (window.location.hash) {
    setTimeout(() => {
      smoothScrollTo(window.location.hash);
    }, 100);
  }


  /* ------------------------------------------
     4. FORM VALIDATION
     ------------------------------------------ */
  const forms = document.querySelectorAll('#offerte-form, #contact-form');

  function showError(field, message) {
    clearError(field);
    field.classList.add('invalid');

    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    field.parentNode.insertBefore(errorSpan, field.nextSibling);
  }

  function clearError(field) {
    field.classList.remove('invalid');
    const existing = field.parentNode.querySelector('.error-message');
    if (existing) {
      existing.remove();
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[0-9+\-\s()]{7,20}$/.test(phone);
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const isRequired = field.hasAttribute('required');

    // Checkbox validation (privacy checkbox)
    if (type === 'checkbox') {
      if (isRequired && !field.checked) {
        showError(field, 'Dit veld is verplicht.');
        return false;
      }
      clearError(field);
      return true;
    }

    // Required check
    if (isRequired && value.length === 0) {
      showError(field, 'Dit veld is verplicht.');
      return false;
    }

    // Skip further validation if field is empty and not required
    if (value.length === 0) {
      clearError(field);
      return true;
    }

    // Email validation
    if (type === 'email') {
      if (!validateEmail(value)) {
        showError(field, 'Voer een geldig e-mailadres in.');
        return false;
      }
      clearError(field);
      return true;
    }

    // Phone validation
    if (type === 'tel') {
      if (!validatePhone(value)) {
        showError(field, 'Voer een geldig telefoonnummer in.');
        return false;
      }
      clearError(field);
      return true;
    }

    // Text minimum length
    if ((type === 'text' || type === 'textarea' || field.tagName === 'TEXTAREA') && value.length < 2) {
      showError(field, 'Minimaal 2 tekens vereist.');
      return false;
    }

    clearError(field);
    return true;
  }

  forms.forEach((form) => {
    const fields = form.querySelectorAll('input, textarea, select');

    // Live validation: clear errors as user types
    fields.forEach((field) => {
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) {
          validateField(field);
        }
      });

      // Also validate checkboxes on change
      if (field.type === 'checkbox') {
        field.addEventListener('change', () => {
          if (field.classList.contains('invalid')) {
            validateField(field);
          }
        });
      }
    });

    // Submit validation
    form.addEventListener('submit', (e) => {
      let isValid = true;

      fields.forEach((field) => {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();

        // Scroll to first error
        const firstError = form.querySelector('.invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
      // If valid, form submits naturally (Web3Forms handles it)
    });
  });


  /* ------------------------------------------
     5. COOKIE BANNER
     ------------------------------------------ */
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAcceptBtn = cookieBanner ? cookieBanner.querySelector('#cookie-accept') : null;
  const cookieDeclineBtn = cookieBanner ? cookieBanner.querySelector('#cookie-reject') : null;

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.add('hiding');
    setTimeout(() => {
      cookieBanner.style.display = 'none';
    }, 300);
  }

  if (cookieBanner) {
    const accepted = localStorage.getItem('oscar-cookies-accepted');
    const declined = localStorage.getItem('oscar-cookies-declined');

    if (accepted || declined) {
      cookieBanner.style.display = 'none';
    }

    if (cookieAcceptBtn) {
      cookieAcceptBtn.addEventListener('click', () => {
        localStorage.setItem('oscar-cookies-accepted', 'true');
        hideCookieBanner();
      });
    }

    if (cookieDeclineBtn) {
      cookieDeclineBtn.addEventListener('click', () => {
        localStorage.setItem('oscar-cookies-declined', 'true');
        hideCookieBanner();
      });
    }
  }


  /* ------------------------------------------
     6. SCROLL ANIMATIONS (IntersectionObserver)
     ------------------------------------------ */
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeElements.forEach((el) => fadeObserver.observe(el));
  } else {
    // Fallback: make all visible immediately
    fadeElements.forEach((el) => el.classList.add('visible'));
  }


  /* ------------------------------------------
     7. STATS COUNTER ANIMATION
     ------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-item__number[data-target]');

  function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out: deceleration curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        element.textContent = current.toLocaleString('nl-NL', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      } else {
        element.textContent = Math.floor(current).toLocaleString('nl-NL');
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure final value is exact
        if (isDecimal) {
          element.textContent = target.toLocaleString('nl-NL', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          });
        } else {
          element.textContent = target.toLocaleString('nl-NL');
        }
      }
    }

    requestAnimationFrame(update);
  }

  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach((el) => statsObserver.observe(el));
  } else {
    // Fallback: show final values immediately
    statNumbers.forEach((el) => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = target % 1 !== 0;
      if (isDecimal) {
        el.textContent = target.toLocaleString('nl-NL', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
      } else {
        el.textContent = target.toLocaleString('nl-NL');
      }
    });
  }


  /* ------------------------------------------
     8. FAQ ACCORDION
     ------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQ items
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq__answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0px';
          const otherBtn = other.querySelector('.faq__question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        // Close this item
        item.classList.remove('active');
        answer.style.maxHeight = '0px';
        question.setAttribute('aria-expanded', 'false');
      } else {
        // Open this item
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ------------------------------------------
     9. PHONE TRACKING
     ------------------------------------------ */
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

  phoneLinks.forEach((link) => {
    link.addEventListener('click', () => {
      console.log('Phone click tracked: ' + link.getAttribute('href'));
    });
  });


  /* ------------------------------------------
     10. FLOATING WHATSAPP BUTTON
     ------------------------------------------ */
  const whatsappBtn = document.querySelector('.whatsapp-float');
  let whatsappTicking = false;

  function updateWhatsappVisibility() {
    if (!whatsappBtn) return;
    if (window.scrollY > 300) {
      whatsappBtn.style.opacity = '1';
      whatsappBtn.style.pointerEvents = 'auto';
    } else {
      whatsappBtn.style.opacity = '0';
      whatsappBtn.style.pointerEvents = 'none';
    }
    whatsappTicking = false;
  }

  if (whatsappBtn) {
    whatsappBtn.style.transition = 'opacity 0.3s ease';
    whatsappBtn.style.opacity = '0';
    whatsappBtn.style.pointerEvents = 'none';

    window.addEventListener('scroll', () => {
      if (!whatsappTicking) {
        requestAnimationFrame(updateWhatsappVisibility);
        whatsappTicking = true;
      }
    }, { passive: true });

    // Check initial scroll position
    updateWhatsappVisibility();
  }


  /* ------------------------------------------
     11. FORM FIELD FLOATING LABELS
     ------------------------------------------ */
  const formGroups = document.querySelectorAll('.form-group');

  formGroups.forEach((group) => {
    const input = group.querySelector('input, textarea, select');
    if (!input) return;

    function updateLabelState() {
      if (input.value.trim().length > 0 || document.activeElement === input) {
        group.classList.add('has-value');
      } else {
        group.classList.remove('has-value');
      }
    }

    input.addEventListener('focus', updateLabelState);
    input.addEventListener('blur', updateLabelState);
    input.addEventListener('input', updateLabelState);

    // Set initial state for pre-filled fields
    updateLabelState();
  });


  /* ------------------------------------------
     12. PARALLAX EFFECT (hero, desktop only)
     ------------------------------------------ */
  const hero = document.querySelector('.hero');
  let parallaxTicking = false;

  function updateParallax() {
    if (!hero || window.innerWidth <= 768) {
      parallaxTicking = false;
      return;
    }

    const scrollPos = window.scrollY;
    const offset = scrollPos * 0.3;
    hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;

    parallaxTicking = false;
  }

  if (hero) {
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });

    // Reset on resize (disable parallax if switched to mobile)
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        hero.style.backgroundPosition = '';
      }
    });
  }

});
