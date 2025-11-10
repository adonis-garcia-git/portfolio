const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const siteHeader = document.querySelector('.site-header');
const glassNavLink = document.querySelector('[data-nav-glass]');
glassNavLink?.classList.add('is-active');
glassNavLink?.setAttribute('aria-current', 'page');
document.body.classList.add('glass-theme');

// Particle background ------------------------------------------------------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas?.getContext('2d');
const particles = [];
const particleCount = 70;

const getParticleColor = () =>
  getComputedStyle(document.body)
    .getPropertyValue('--particle-color-rgb')
    .trim() || '55, 241, 142';

let particleRGB = getParticleColor();

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particleRGB = getParticleColor();
};

if (canvas && ctx) {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

class Particle {
  constructor(initial = false) {
    this.reset(initial);
  }

  reset(initial = false) {
    if (!canvas) return;
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 120;
    this.size = Math.random() * 1.2 + 0.2;
    this.speedY = Math.random() * -0.3 - 0.05;
    this.speedX = Math.random() * 0.3 - 0.15;
    this.alpha = Math.random() * 0.6 + 0.25;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < -60) {
      this.reset();
    }
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, ${this.alpha})`;
    ctx.shadowColor = `rgba(${particleRGB}, 0.7)`;
    ctx.shadowBlur = 8;
    ctx.fill();
  }
}

if (!prefersReducedMotion && canvas && ctx) {
  for (let i = 0; i < particleCount; i += 1) {
    particles.push(new Particle(true));
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  };

  animate();
}

// Smooth scroll ------------------------------------------------------------
const headerHeight = () => (siteHeader?.offsetHeight || 0) + 24;

const scrollTriggers = document.querySelectorAll('a[href^="#"]');
scrollTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetSelector = trigger.getAttribute('href');
    if (!targetSelector || targetSelector === '#') return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetTop = Math.max(targetTop - headerHeight(), 0);
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});

// Mobile navigation --------------------------------------------------------
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

// Header state -------------------------------------------------------------
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

// Section reveal -----------------------------------------------------------
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('[data-animate]').forEach((el) => fadeObserver.observe(el));

// Footer year --------------------------------------------------------------
const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
