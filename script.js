// ============================================
// PERFORMANCE UTILITIES
// ============================================

// Throttle function - limits execution rate for better performance
const throttle = (func, delay = 16) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

// ============================================
// CONFIGURATION
// ============================================

const DATA_PATH = 'resume.json';
const RESUME_PATH = 'assets/Adonis_G_Resume_Fall_2025 (1).pdf';
const TAGLINE = 'software_engineer --passionate --impact';
let resumeData = null;
const siteHeader = document.querySelector('.site-header');

// Canvas particle animation
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const particles = [];
const particleCount = 30; // Reduced for better performance
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getParticleRGB = () =>
  getComputedStyle(document.body).getPropertyValue('--particle-color-rgb').trim() || '245, 166, 35';
let particleRGB = getParticleRGB();

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 100;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedY = Math.random() * -0.2 - 0.03;
    this.speedX = Math.random() * 0.2 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < -50) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, ${this.alpha})`;
    ctx.shadowColor = `rgba(${particleRGB}, 0.6)`;
    ctx.shadowBlur = 6;
    ctx.fill();
  }
}

if (!prefersReducedMotion) {
  for (let i = 0; i < particleCount; i += 1) {
    particles.push(new Particle());
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

// Smooth scroll for anchor links and scroll indicator
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

// Mobile navigation toggle
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

const updateHeaderOnScroll = () => {
  if (!siteHeader) return;
  if (window.scrollY > 8) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
};

updateHeaderOnScroll();
window.addEventListener('scroll', throttle(updateHeaderOnScroll, 16), { passive: true });

// Fade-in observer with stagger support
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      
      // Apply staggered delays to children
      const staggerChildren = entry.target.querySelectorAll('[data-stagger]');
      staggerChildren.forEach((child, index) => {
        child.style.animationDelay = `${index * 0.08}s`;
      });
      
      fadeObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

const registerAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (!el.classList.contains('visible')) {
      fadeObserver.observe(el);
    }
  });
};

// Render helpers -----------------------------------------------------------

const renderHero = (data) => {
  const heroName = document.getElementById('hero-name');
  const heroTagline = document.getElementById('hero-tagline');
  const heroSummary = document.getElementById('hero-summary');
  const heroLinks = document.getElementById('hero-links');
  const footerName = document.getElementById('hero-footer-name');

  // Terminal-style tagline
  heroTagline.textContent = TAGLINE;
  
  // Greeting with name
  heroName.innerHTML = `Hi, I'm ${data.name}.`;

  heroSummary.textContent = `Based in New York, NY, I'm looking to further my skillset as a software developer through personal projects while also looking for a fulltime position.`;

  heroLinks.innerHTML = '';
  const contactLinks = [
    { label: 'github', href: data.contact?.github },
    { label: 'linkedin', href: data.contact?.linkedin },
    { label: 'email', href: data.contact?.email ? `mailto:${data.contact.email}` : null },
  ].filter((link) => Boolean(link.href));

  contactLinks.forEach((link, index) => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.target = link.href.startsWith('http') ? '_blank' : '_self';
    anchor.rel = link.href.startsWith('http') ? 'noopener' : '';
    anchor.textContent = link.label;
    anchor.dataset.stagger = '';
    anchor.style.animationDelay = `${index * 0.1}s`;
    heroLinks.appendChild(anchor);
  });

  if (footerName) {
    footerName.textContent = data.name;
  }
};

// Generate a filename from project name
const generateFilename = (name) => {
  if (!name) return 'project.js';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 20) + '.js';
};

const resolveRepoLink = (project = {}, repoMap = {}, contact = {}) => {
  if (project.repo) return project.repo;
  const identifiers = [project.id, project.slug, project.name].filter(Boolean);
  for (const key of identifiers) {
    if (repoMap && repoMap[key]) {
      return repoMap[key];
    }
  }
  return project.link || contact.github || '#';
};

const renderProjects = (projects = [], contact = {}, repoMap = {}) => {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  projects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.animate = 'fade';
    card.dataset.filename = generateFilename(project.name);

    const title = document.createElement('h3');
    title.textContent = project.name;
    title.dataset.stagger = '';
    
    const metaText = [project.location].filter(Boolean).join('\n');
    if (metaText) {
      const meta = document.createElement('p');
      meta.style.whiteSpace = 'pre-line';
      meta.className = 'project-meta';
      meta.textContent = metaText;
      meta.dataset.stagger = '';
      card.appendChild(meta);
    }

    const techStack = project.tech || [];
    const descItems = project.description || [];

    if (techStack.length) {
      const techList = document.createElement('ul');
      techList.className = 'project-card__stack';
      techStack.forEach((tech, techIndex) => {
        const li = document.createElement('li');
        li.textContent = tech;
        li.dataset.stagger = '';
        techList.appendChild(li);
      });
      card.appendChild(techList);
    }

    if (descItems.length) {
      const descList = document.createElement('ul');
      descList.className = 'project-card__details';
      descItems.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        li.dataset.stagger = '';
        descList.appendChild(li);
      });
      card.appendChild(descList);
    }

    const actions = document.createElement('div');
    actions.className = 'project-card__actions';

    // Git Clone button for all projects
    const repoLink = resolveRepoLink(project, repoMap, contact);
    const githubButton = document.createElement('a');
    githubButton.className = 'btn btn--ghost';
    githubButton.innerHTML = '$ git clone';
    if (repoLink && repoLink !== '#') {
      githubButton.href = repoLink;
      githubButton.target = '_blank';
      githubButton.rel = 'noopener noreferrer';
    } else {
      githubButton.href = '#';
      githubButton.classList.add('btn--disabled');
      githubButton.title = 'Repository coming soon';
    }
      actions.appendChild(githubButton);

    // Website button for specific projects
    const projectNameLower = (project.name || '').toLowerCase();
    if (projectNameLower.includes('q-quake') || projectNameLower.includes('qquake')) {
      const websiteButton = document.createElement('a');
      websiteButton.className = 'btn btn--primary btn--small btn--with-icon';
      websiteButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Hackathon`;
      websiteButton.href = 'https://hackathon.nyuad.nyu.edu/year/2025/';
      websiteButton.target = '_blank';
      websiteButton.rel = 'noopener noreferrer';
      actions.appendChild(websiteButton);
    } else if (projectNameLower.includes('portfolio')) {
      const websiteButton = document.createElement('button');
      websiteButton.className = 'btn btn--primary btn--small btn--with-icon';
      websiteButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> You're here!`;
      websiteButton.title = "You're already viewing this site!";
      websiteButton.onclick = () => alert("You're already here! Nice try though.");
      actions.appendChild(websiteButton);
    }

    card.prepend(title);
    card.append(actions);
    grid.appendChild(card);
  });

  // Initialize projects carousel for mobile
  const dotsContainer = document.getElementById('projects-dots');
  const prevBtn = document.getElementById('proj-prev');
  const nextBtn = document.getElementById('proj-next');
  
  projectsCarousel = new ProjectsCarousel(grid, dotsContainer, prevBtn, nextBtn);
};

// Experience Carousel Class
class ExperienceCarousel {
  constructor(track, dotsContainer, prevBtn, nextBtn, experienceData) {
    this.track = track;
    this.dotsContainer = dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.experiences = experienceData;
    this.currentIndex = 0;
    this.cards = [];
    this.dots = [];
    
    this.init();
  }

  init() {
    this.renderCards();
    this.renderDots();
    this.updateCarousel();
    this.bindEvents();
  }

  renderCards() {
    this.track.innerHTML = '';
    
    this.experiences.forEach((role, index) => {
      const card = document.createElement('article');
      card.className = 'carousel-card';
      card.dataset.index = index;

      // Generate logo content
      const logoContent = role.logo
        ? `<img src="${role.logo}" alt="${role.logoAlt || role.company}" loading="lazy" />`
        : `<span class="carousel-card__logo-text">${(role.company || '')
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .slice(0, 3)}</span>`;

      // Generate tags HTML
      const tagsHtml = (role.tags || []).slice(0, 6).map(tag => 
        `<span class="carousel-card__tag">${tag}</span>`
      ).join('');

      card.innerHTML = `
        <div class="carousel-card__header">
          <div class="carousel-card__logo">
            ${logoContent}
          </div>
          <div class="carousel-card__info">
            <p class="carousel-card__date">${role.date || ''}</p>
            <h3 class="carousel-card__company">${role.company || 'Experience'}</h3>
            <p class="carousel-card__title">${role.title || ''}</p>
            <p class="carousel-card__location">${role.location || ''}</p>
          </div>
        </div>
        ${role.teamFocus ? `<p class="carousel-card__team">${role.teamFocus}</p>` : ''}
        <p class="carousel-card__description">${role.description || ''}</p>
        <div class="carousel-card__tags">${tagsHtml}</div>
      `;

      this.cards.push(card);
      this.track.appendChild(card);
    });
  }

  renderDots() {
    this.dotsContainer.innerHTML = '';
    
    this.experiences.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to experience ${index + 1}`);
      this.dots.push(dot);
      this.dotsContainer.appendChild(dot);
    });
  }

  updateCarousel() {
    const total = this.cards.length;
    
    this.cards.forEach((card, index) => {
      // Remove all position classes
      card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
      
      // Calculate position relative to current
      let position = index - this.currentIndex;
      
      // Handle wrap-around for infinite loop effect
      if (position > total / 2) position -= total;
      if (position < -total / 2) position += total;
      
      // Apply appropriate class
      if (position === 0) {
        card.classList.add('active');
      } else if (position === -1 || (position === total - 1 && this.currentIndex === 0)) {
        card.classList.add('prev');
      } else if (position === 1 || (position === -(total - 1) && this.currentIndex === total - 1)) {
        card.classList.add('next');
      } else if (position < -1) {
        card.classList.add('hidden-left');
      } else {
        card.classList.add('hidden-right');
      }
    });

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  goToSlide(index) {
    const total = this.cards.length;
    // Wrap around
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    
    this.currentIndex = index;
    this.updateCarousel();
  }

  next() {
    this.goToSlide(this.currentIndex + 1);
  }

  prev() {
    this.goToSlide(this.currentIndex - 1);
  }

  bindEvents() {
    // Arrow buttons
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Dot navigation
    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index, 10);
        this.goToSlide(index);
      });
    });

    // Click on side cards
    this.cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('prev')) {
          this.prev();
        } else if (card.classList.contains('next')) {
          this.next();
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const carouselInView = this.track.getBoundingClientRect().top < window.innerHeight &&
                            this.track.getBoundingClientRect().bottom > 0;
      if (!carouselInView) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }
}

// Global carousel instance
let experienceCarousel = null;

// Projects Carousel Class (Mobile Only)
class ProjectsCarousel {
  constructor(container, dotsContainer, prevBtn, nextBtn) {
    this.container = container;
    this.dotsContainer = dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.currentIndex = 0;
    this.cards = [];
    this.dots = [];
    this.isMobile = window.innerWidth <= 768;
    this.isInitialLoad = true; // Flag to prevent scroll on initial load
    
    // Only initialize on mobile
    if (this.isMobile) {
      this.init();
    }

    // Re-check on resize
    window.addEventListener('resize', throttle(() => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile && !wasMobile) {
        this.init();
      }
    }, 250));
  }

  init() {
    // Wait for cards to be rendered
    setTimeout(() => {
      this.cards = Array.from(this.container.querySelectorAll('.project-card'));
      if (this.cards.length === 0) return;
      
      this.renderDots();
      this.updateCarousel();
      this.bindEvents();
      this.isInitialLoad = false; // After init, allow scrolling
    }, 100);
  }

  renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.dots = [];
    
    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'projects-carousel-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to project ${index + 1}`);
      this.dots.push(dot);
      this.dotsContainer.appendChild(dot);
    });
  }

  updateCarousel() {
    if (!this.isMobile || this.cards.length === 0) return;

    // Scroll to current card (skip on initial load to prevent auto-scroll)
    if (!this.isInitialLoad) {
      const card = this.cards[this.currentIndex];
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  next() {
    if (!this.isMobile) return;
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateCarousel();
  }

  prev() {
    if (!this.isMobile) return;
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.updateCarousel();
  }

  goToSlide(index) {
    if (!this.isMobile) return;
    this.currentIndex = index;
    this.updateCarousel();
  }

  bindEvents() {
    // Arrow buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }
}

// Global projects carousel instance
let projectsCarousel = null;

const renderExperience = (experienceRecords = []) => {
  const track = document.getElementById('experience-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('exp-prev');
  const nextBtn = document.getElementById('exp-next');
  
  if (!track) return;

  const sortedExperience = [...experienceRecords].sort((a, b) => {
    const orderA = parseInt(a.id, 10) || 0;
    const orderB = parseInt(b.id, 10) || 0;
    return orderA - orderB;
  });

  // Create carousel instance
  experienceCarousel = new ExperienceCarousel(
    track,
    dotsContainer,
    prevBtn,
    nextBtn,
    sortedExperience
  );
};

const renderEducation = (education = []) => {
  const container = document.getElementById('education-cards');
  if (!container) return;
  container.innerHTML = '';

  const createChip = (label, variant = 'default') => {
    const span = document.createElement('span');
    const variantClass = variant === 'accent' ? 'edu-chip--accent' : '';
    span.className = `edu-chip ${variantClass} inline-flex items-center rounded border px-3 py-1 text-sm font-medium`;
    span.textContent = label;
    span.dataset.stagger = '';
    return span;
  };

  education.forEach((entry) => {
    const card = document.createElement('article');
    card.dataset.animate = 'fade';
    card.className =
      'relative overflow-hidden rounded border shadow-2xl backdrop-blur-xl p-8 md:p-10 flex flex-col gap-8';
    card.style.background = 'var(--bg-panel-strong)';
    card.style.borderColor = 'var(--divider-color)';
    card.style.borderRadius = '4px';

    // GPA badge (desktop - absolute positioned)
    const gpaBadge = document.createElement('div');
    gpaBadge.className =
      'gpa-badge-desktop absolute top-6 right-6 inline-flex items-center gap-2 rounded border px-4 py-1 text-xs font-semibold tracking-[0.35em]';
    gpaBadge.style.borderColor = 'var(--accent-main)';
    gpaBadge.style.background = 'var(--chip-bg-strong)';
    gpaBadge.style.color = 'var(--accent-main)';
    gpaBadge.style.fontFamily = "'JetBrains Mono', monospace";
    gpaBadge.style.borderRadius = '3px';
    gpaBadge.innerHTML = `<span>GPA</span><span class="tracking-normal text-base font-semibold">${entry.gpa || '—'}</span>`;
    card.appendChild(gpaBadge);

    // Header with logo & degree info
    const header = document.createElement('div');
    header.className = 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between';

    const identity = document.createElement('div');
    identity.className = 'flex items-center gap-4';

    const logoWrap = document.createElement('div');
    logoWrap.className =
      'w-16 h-16 rounded border flex items-center justify-center overflow-hidden';
    logoWrap.style.borderColor = 'var(--divider-color)';
    logoWrap.style.background = 'var(--chip-bg)';
    logoWrap.style.borderRadius = '4px';

    if (entry.logo) {
      const img = document.createElement('img');
      img.src = entry.logo;
      img.alt = entry.logoAlt || `${entry.school || 'University'} logo`;
      img.loading = 'lazy';
      img.className = 'education-logo__image';
      logoWrap.appendChild(img);
    } else {
      const initials = document.createElement('span');
      initials.className = 'text-lg font-semibold tracking-[0.4em] text-white/80';
      initials.style.fontFamily = "'JetBrains Mono', monospace";
      initials.textContent = (entry.school || '')
        .split(' ')
        .map((word) => word?.charAt(0) || '')
        .join('')
        .slice(0, 3);
      logoWrap.appendChild(initials);
    }

    const schoolBlock = document.createElement('div');
    const grad = document.createElement('p');
    grad.className = 'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-2';
    grad.style.fontFamily = "'JetBrains Mono', monospace";
    grad.textContent = `// ${entry.expectedGraduation || ''}`;

    const schoolName = document.createElement('h3');
    schoolName.className = 'text-2xl font-semibold text-[var(--text-primary)] leading-tight';
    schoolName.textContent = entry.school;

    const degree = document.createElement('p');
    degree.className = 'text-sm text-[var(--text-muted)] education-degree';
    // Use abbreviated degree on mobile
    const isMobile = window.innerWidth <= 768;
    const degreeText = isMobile 
      ? (entry.degree || '').replace('Bachelor of Science in', 'B.S.').replace('Bachelor of Science', 'B.S.')
      : entry.degree;
    degree.textContent = entry.minor
      ? `${degreeText}, Minor in ${entry.minor}`
      : degreeText || '';

    const location = document.createElement('p');
    location.className = 'text-sm text-[var(--text-muted)]';
    location.style.fontFamily = "'JetBrains Mono', monospace";
    location.textContent = entry.location || '';

    schoolBlock.append(grad, schoolName, degree, location);
    identity.append(logoWrap, schoolBlock);
    header.appendChild(identity);
    card.appendChild(header);

    // Content sections stacked
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'space-y-6';

    // Coursework Section with collapsible wrapper for mobile
    const courseworkSection = document.createElement('div');
    courseworkSection.className = 'edu-collapsible-section';
    
    const courseworkBtn = document.createElement('button');
    courseworkBtn.className = 'edu-collapsible-btn';
    courseworkBtn.innerHTML = '<span>View Coursework</span><span class="edu-collapsible-icon">›</span>';
    
    const courseworkContent = document.createElement('div');
    courseworkContent.className = 'edu-collapsible-content';
    
    const courseworkTitle = document.createElement('p');
    courseworkTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3 edu-section-title';
    courseworkTitle.style.fontFamily = "'JetBrains Mono', monospace";
    courseworkTitle.textContent = '// Coursework';

    const courseworkGrid = document.createElement('div');
    courseworkGrid.className = 'grid gap-2 sm:grid-cols-2';

    (entry.coursework || []).forEach((course) => {
      courseworkGrid.appendChild(createChip(course));
    });

    if (!courseworkGrid.childElementCount) {
      const fallback = document.createElement('p');
      fallback.className = 'text-sm text-[var(--text-muted)]';
      fallback.textContent = 'Coursework available on request.';
      courseworkGrid.appendChild(fallback);
    }

    courseworkContent.append(courseworkTitle, courseworkGrid);
    courseworkSection.append(courseworkBtn, courseworkContent);
    
    // Toggle coursework on click
    courseworkBtn.addEventListener('click', () => {
      const isExpanded = courseworkContent.classList.toggle('expanded');
      courseworkBtn.classList.toggle('expanded', isExpanded);
    });

    // Organizations Section with collapsible wrapper for mobile
    const organizationsSection = document.createElement('div');
    organizationsSection.className = 'edu-collapsible-section';
    
    const organizationsBtn = document.createElement('button');
    organizationsBtn.className = 'edu-collapsible-btn';
    organizationsBtn.innerHTML = '<span>View Organizations</span><span class="edu-collapsible-icon">›</span>';
    
    const organizationsContent = document.createElement('div');
    organizationsContent.className = 'edu-collapsible-content';
    
    const organizationsTitle = document.createElement('p');
    organizationsTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3 edu-section-title';
    organizationsTitle.style.fontFamily = "'JetBrains Mono', monospace";
    organizationsTitle.textContent = '// Organizations';

    const organizationsWrap = document.createElement('div');
    organizationsWrap.className = 'organizations-grid';

    const organizationsData =
      (entry.organizations && entry.organizations.length > 0
        ? entry.organizations
        : (resumeData?.leadership || []).map((item) => item.organization)
      ).filter(Boolean);

    organizationsData.forEach((org) => {
      organizationsWrap.appendChild(createChip(org, 'accent'));
    });

    if (!organizationsWrap.childElementCount) {
      const fallback = document.createElement('p');
      fallback.className = 'text-sm text-[var(--text-muted)]';
      fallback.textContent = 'Active learner & collaborator.';
      organizationsWrap.appendChild(fallback);
    }

    organizationsContent.append(organizationsTitle, organizationsWrap);
    organizationsSection.append(organizationsBtn, organizationsContent);
    
    // Toggle organizations on click
    organizationsBtn.addEventListener('click', () => {
      const isExpanded = organizationsContent.classList.toggle('expanded');
      organizationsBtn.classList.toggle('expanded', isExpanded);
    });

    // GPA badge (mobile - positioned below organizations)
    const gpaBadgeMobile = document.createElement('div');
    gpaBadgeMobile.className =
      'gpa-badge-mobile inline-flex items-center gap-2 rounded border px-4 py-1 text-xs font-semibold tracking-[0.35em]';
    gpaBadgeMobile.style.fontFamily = "'JetBrains Mono', monospace";
    gpaBadgeMobile.style.borderRadius = '3px';
    gpaBadgeMobile.innerHTML = `<span>CUMULATIVE GPA</span><span class="tracking-normal text-base font-semibold">${entry.gpa || '—'}</span>`;

    // GPA badge appears first on mobile (above coursework)
    contentWrapper.append(gpaBadgeMobile, courseworkSection, organizationsSection);
    card.appendChild(contentWrapper);

    container.appendChild(card);
  });
};

// Fixed skills rendering - now uses correct keys from resume.json
const renderSkills = (skills = {}) => {
  const groups = document.getElementById('skills-groups');
  if (!groups) return;
  groups.innerHTML = '';

  // Highlighted items (these will appear first in their categories)
  const highlightedLanguages = ['Python'];
  const highlightedFrameworks = ['RAG', 'LangChain', 'Pinecone'];
  const highlightedTools = ['Git', 'GitHub', 'APIs', 'Agile'];
  const highlightedInterests = ['Travel', 'Sci-Fi', 'Gym'];

  // Helper to sort highlighted items first
  const sortHighlightedFirst = (items, highlighted) => {
    return [...items].sort((a, b) => {
      const aHighlighted = highlighted.includes(a);
      const bHighlighted = highlighted.includes(b);
      if (aHighlighted && !bHighlighted) return -1;
      if (!aHighlighted && bHighlighted) return 1;
      return 0;
    });
  };

  // Get highlighted array for each type
  const getHighlighted = (type) => {
    switch (type) {
      case 'languages': return highlightedLanguages;
      case 'frameworks': return highlightedFrameworks;
      case 'tools': return highlightedTools;
      case 'interests': return highlightedInterests;
      default: return [];
    }
  };

  // Updated mapping to match resume.json keys
  const mapping = [
    { key: 'languages', label: 'Languages', type: 'languages' },
    { key: 'mlFrameworks', label: 'ML & Frameworks', type: 'frameworks' },
    { key: 'tools', label: 'Tools & Platforms', type: 'tools' },
    { key: 'spokenLanguages', label: 'Spoken Languages', type: 'spoken' },
    { key: 'interests', label: 'Interests', type: 'interests' },
  ];

  mapping.forEach(({ key, label, type }) => {
    if (!Array.isArray(skills[key]) || skills[key].length === 0) return;
    const group = document.createElement('div');
    group.className = 'skill-group';
    group.dataset.animate = 'fade';
    group.dataset.type = type;
    group.dataset.category = `// ${key}`;

    const heading = document.createElement('h3');
    heading.textContent = label;

    const tags = document.createElement('div');
    tags.className = 'skill-tags';

    // Sort skills with highlighted items first
    const highlighted = getHighlighted(type);
    const sortedSkills = sortHighlightedFirst(skills[key], highlighted);

    sortedSkills.forEach((skill, index) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.dataset.stagger = '';
      
      // Add highlight class if skill is highlighted
      if (highlighted.includes(skill)) {
        tag.classList.add('skill-tag--highlight');
      }
      
      tags.appendChild(tag);
    });

    group.append(heading, tags);
    groups.appendChild(group);
  });
};

// Fetch + render resume.json driven content -------------------------------

/**
 * Updating resume.json automatically updates every section.
 * Add/remove entries from projects, experience, education, or skills arrays
 * and the UI will reflect the new content on the next page load.
 */
const hydrateSite = async () => {
  try {
    const response = await fetch(DATA_PATH);
    const data = await response.json();
    resumeData = data;
    window.cbData = data; // expose for debugging

    renderHero(data);
    renderProjects(data.projects, data.contact, data.githubRepos || {});
    renderExperience(data.experience);
    renderEducation(data.education);
    renderSkills(data.skills);

    registerAnimations();
  } catch (error) {
    console.error('Unable to load resume.json', error);
  }
};

hydrateSite();

// Footer year + resume link fallback
const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const resumeButtons = document.querySelectorAll('#resume a.btn');
resumeButtons.forEach((btn) => {
  if (!btn.getAttribute('href')) {
    btn.setAttribute('href', RESUME_PATH);
  }
});
