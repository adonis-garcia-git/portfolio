/**
 * GLASS Page JavaScript
 * Handles animations, interactivity, and data rendering for the GLASS honors program page
 */

// ============================================
// CONFIGURATION
// ============================================

const GLASS_DATA_PATH = 'glass_portfolio_content.json';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// PARTICLE ANIMATION (Purple Theme)
// ============================================

const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const particles = [];
const particleCount = 45;

// NYU Purple particle color
const getParticleRGB = () => '137, 0, 225';
let particleRGB = getParticleRGB();

const resizeCanvas = () => {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

if (canvas) {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    if (!canvas) return;
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 100;
    this.size = Math.random() * 1.8 + 0.4;
    this.speedY = Math.random() * -0.15 - 0.02;
    this.speedX = Math.random() * 0.15 - 0.075;
    this.alpha = Math.random() * 0.4 + 0.15;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, ${this.alpha})`;
    ctx.shadowColor = `rgba(${particleRGB}, 0.5)`;
    ctx.shadowBlur = 8;
    ctx.fill();
  }
}

if (!prefersReducedMotion && canvas && ctx) {
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animateParticles);
  };

  animateParticles();
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================

const progressBar = document.getElementById('scroll-progress');

const updateScrollProgress = () => {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = `${progress}%`;
};

window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress();

// ============================================
// HEADER SCROLL STATE
// ============================================

const siteHeader = document.querySelector('.site-header');

const updateHeaderOnScroll = () => {
  if (!siteHeader) return;
  if (window.scrollY > 8) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
};

updateHeaderOnScroll();
window.addEventListener('scroll', updateHeaderOnScroll);

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

const scrollTriggers = document.querySelectorAll('a[href^="#"], [data-scroll]');
scrollTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetSelector = trigger.getAttribute('href')?.startsWith('#')
      ? trigger.getAttribute('href')
      : trigger.dataset.scroll;
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    const headerOffset = (siteHeader?.offsetHeight || 0) + 24;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(targetPosition - headerOffset, 0);
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  });
});

// ============================================
// MOBILE NAVIGATION
// ============================================

const mobileToggle = document.getElementById('mobile-nav-toggle');
const mobileOverlay = document.getElementById('mobile-nav-overlay');
const mobileSheet = document.getElementById('mobile-nav-sheet');
const mobileLinks = document.querySelectorAll('[data-mobile-nav-link]');
let isMobileNavOpen = false;

const setMobileNavState = (isOpen) => {
  if (!mobileOverlay || !mobileSheet) return;
  isMobileNavOpen = isOpen;
  mobileOverlay.classList.toggle('active', isOpen);
  mobileSheet.classList.toggle('active', isOpen);
  mobileSheet.setAttribute('aria-hidden', String(!isOpen));
  mobileOverlay.setAttribute('aria-hidden', String(!isOpen));
};

mobileToggle?.addEventListener('click', () => setMobileNavState(!isMobileNavOpen));
mobileOverlay?.addEventListener('click', () => setMobileNavState(false));
mobileLinks.forEach((link) =>
  link.addEventListener('click', () => {
    setMobileNavState(false);
  })
);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMobileNavOpen) {
    setMobileNavState(false);
  }
});

// ============================================
// FADE-IN ANIMATIONS
// ============================================

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      
      // Stagger children animations
      const staggerChildren = entry.target.querySelectorAll('[data-stagger]');
      staggerChildren.forEach((child, index) => {
        child.style.animationDelay = `${index * 0.1}s`;
      });
      
      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

const registerAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (!el.classList.contains('visible')) {
      fadeObserver.observe(el);
    }
  });
};

// ============================================
// TIMELINE SCROLL ANIMATION
// ============================================

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      // Add staggered delay based on position
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 150);
      timelineObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
);

const registerTimelineAnimations = () => {
  document.querySelectorAll('.glass-timeline__item').forEach((item) => {
    timelineObserver.observe(item);
  });
};

// ============================================
// 5 WINDOWS TAB NAVIGATION
// ============================================

const windowButtons = document.querySelectorAll('.glass-window-btn');
const windowPanels = document.querySelectorAll('.glass-window-panel');

const switchWindow = (windowId) => {
  // Update buttons
  windowButtons.forEach((btn) => {
    const isActive = btn.dataset.window === windowId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
  
  // Update panels
  windowPanels.forEach((panel) => {
    const isActive = panel.id === `panel-${windowId}`;
    panel.classList.toggle('active', isActive);
  });
};

windowButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const windowId = btn.dataset.window;
    if (windowId) {
      switchWindow(windowId);
    }
  });
});

// Keyboard navigation for windows
const windowsNav = document.querySelector('.glass-windows__nav');
if (windowsNav) {
  windowsNav.addEventListener('keydown', (e) => {
    const buttons = Array.from(windowButtons);
    const currentIndex = buttons.findIndex((btn) => btn.classList.contains('active'));
    
    let newIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % buttons.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }
    
    if (newIndex !== currentIndex) {
      buttons[newIndex].click();
      buttons[newIndex].focus();
    }
  });
}

// ============================================
// PARALLAX EFFECT FOR HERO
// ============================================

const heroSection = document.querySelector('.glass-hero');
const heroVisual = document.querySelector('.glass-hero .hero__visual');

const updateParallax = () => {
  if (prefersReducedMotion || !heroVisual) return;
  
  const scrollY = window.scrollY;
  const heroHeight = heroSection?.offsetHeight || 800;
  
  if (scrollY < heroHeight) {
    const parallaxAmount = scrollY * 0.3;
    heroVisual.style.transform = `translateY(${parallaxAmount}px)`;
  }
};

window.addEventListener('scroll', updateParallax);

// ============================================
// IMAGE PLACEHOLDER INTERACTION
// ============================================

const imagePlaceholders = document.querySelectorAll('.glass-image-placeholder');

imagePlaceholders.forEach((placeholder) => {
  placeholder.addEventListener('click', () => {
    const imageType = placeholder.dataset.image || 'photo';
    console.log(`Image placeholder clicked: ${imageType}`);
    // Future: Could open a modal or file picker here
  });
});

// ============================================
// FOOTER YEAR
// ============================================

const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

// ============================================
// DATA LOADING (Optional - for dynamic content)
// ============================================

const loadGlassData = async () => {
  try {
    const response = await fetch(GLASS_DATA_PATH);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('GLASS data file not found or invalid, using static content');
    return null;
  }
};

// ============================================
// INITIALIZE
// ============================================

const init = async () => {
  // Load data (optional enhancement for future)
  const glassData = await loadGlassData();
  if (glassData) {
    window.glassData = glassData; // Expose for debugging
  }
  
  // Register all animations
  registerAnimations();
  registerTimelineAnimations();
  
  // Initial parallax position
  updateParallax();
  
  console.log('GLASS page initialized');
};

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
