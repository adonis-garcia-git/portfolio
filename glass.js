const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLASS_DATA_PATH = 'glass_portfolio_content.json';

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

const formatCategoryLabel = (text = '') =>
  text
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\w\S*/g, (segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

const renderInvolvements = (involvements = [], glassMeta = {}) => {
  const lead = document.getElementById('glass-involvements-lead');
  if (lead && glassMeta.programDescription) {
    lead.textContent = glassMeta.programDescription;
  }

  const grid = document.getElementById('glass-involvements-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!Array.isArray(involvements) || involvements.length === 0) {
    const placeholder = document.createElement('article');
    placeholder.className = 'glass-card';
    placeholder.innerHTML = '<h3>More updates soon</h3><p>Additional involvements are on the way.</p>';
    grid.appendChild(placeholder);
    return;
  }

  involvements.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'glass-card';
    card.dataset.animate = 'fade';

    const label = document.createElement('p');
    label.className = 'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]';
    label.textContent = item.category || 'GLASS Involvement';

    const heading = document.createElement('h3');
    heading.textContent = item.title || 'GLASS Contribution';

    card.append(label, heading);
    grid.appendChild(card);
    fadeObserver.observe(card);
  });
};

const createExperienceMeta = (entry = {}) => {
  const meta = document.createElement('div');
  meta.className = 'glass-experience-card__meta';

  const categoryChip = document.createElement('span');
  categoryChip.textContent = formatCategoryLabel(entry.category || 'Experience');
  meta.appendChild(categoryChip);

  if (entry.duration) {
    const durationChip = document.createElement('span');
    durationChip.textContent = entry.duration;
    meta.appendChild(durationChip);
  }

  if (entry.location) {
    const locationChip = document.createElement('span');
    locationChip.textContent = entry.location;
    meta.appendChild(locationChip);
  }

  if (entry.organization) {
    const orgChip = document.createElement('span');
    orgChip.textContent = entry.organization;
    meta.appendChild(orgChip);
  }

  return meta;
};

const renderExperiences = (experiences = {}, glassMeta = {}) => {
  const lead = document.getElementById('glass-experiences-lead');
  if (lead && glassMeta.programImpact?.intro) {
    lead.textContent = glassMeta.programImpact.intro;
  }

  const grid = document.getElementById('glass-experiences-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const flattened = Object.entries(experiences || {}).flatMap(([category, items]) =>
    (Array.isArray(items) ? items : []).map((entry) => ({ ...entry, category }))
  );

  if (!flattened.length) {
    const empty = document.createElement('article');
    empty.className = 'glass-card';
    empty.innerHTML = '<h3>Experiences coming soon</h3><p>Stay tuned for more GLASS updates.</p>';
    grid.appendChild(empty);
    return;
  }

  flattened.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'glass-card';
    card.dataset.animate = 'fade';

    const meta = createExperienceMeta(entry);
    const heading = document.createElement('h3');
    heading.textContent = entry.title || 'GLASS Experience';

    const summary = document.createElement('p');
    summary.textContent = entry.description || entry.impact || entry.connection || '';

    card.append(meta, heading);
    if (summary.textContent.trim()) {
      card.appendChild(summary);
    }

    const detailsList = document.createElement('ul');
    detailsList.className = 'glass-list';
    ['why', 'impact', 'connection'].forEach((key) => {
      if (!entry[key]) return;
      const detail = document.createElement('li');
      detail.innerHTML = `<strong>${formatCategoryLabel(key)}:</strong> ${entry[key]}`;
      detailsList.appendChild(detail);
    });

    if (detailsList.childElementCount > 0) {
      card.appendChild(detailsList);
    }

    grid.appendChild(card);
    fadeObserver.observe(card);
  });
};

const renderProject = (project = {}, personal = {}) => {
  const title = document.getElementById('glass-project-heading');
  if (title && project.title) {
    title.textContent = `Project: ${project.title}`;
  }

  const lead = document.getElementById('glass-project-lead');
  if (lead && project.about) {
    lead.textContent = project.about;
  }

  const callout = document.getElementById('glass-project-callout');
  if (!callout) return;
  callout.innerHTML = '';

  const calloutTitle = document.createElement('h3');
  calloutTitle.textContent = project.status
    ? `${project.status} • ${project.title || 'GLASS Project'}`
    : project.title || 'GLASS Project';
  callout.appendChild(calloutTitle);

  if (project.missionStatement?.currentWork) {
    const overview = document.createElement('p');
    overview.textContent = project.missionStatement.currentWork;
    callout.appendChild(overview);
  }

  if (project.missionStatement) {
    const missionList = document.createElement('ul');
    missionList.className = 'glass-list';
    Object.entries(project.missionStatement).forEach(([key, value]) => {
      if (!value) return;
      const li = document.createElement('li');
      li.innerHTML = `<strong>${formatCategoryLabel(key)}:</strong> ${value}`;
      missionList.appendChild(li);
    });
    callout.appendChild(missionList);
  }

  const technologies =
    (Array.isArray(project.technologies) && project.technologies.length
      ? project.technologies
      : (project.areasOfExcellence || []).map((item) => item.area).filter(Boolean)) || [];

  if (technologies.length) {
    const label = document.createElement('p');
    label.className = 'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]';
    label.textContent = 'Focus Areas';
    callout.appendChild(label);

    const meta = document.createElement('div');
    meta.className = 'glass-meta';
    technologies.forEach((tech) => {
      const chip = document.createElement('span');
      chip.textContent = tech;
      meta.appendChild(chip);
    });
    callout.appendChild(meta);
  }

  if (Array.isArray(project.unGoals) && project.unGoals.length) {
    const goalList = document.createElement('ul');
    goalList.className = 'glass-list';
    project.unGoals.forEach((goal) => {
      if (!goal.goal) return;
      const li = document.createElement('li');
      li.innerHTML = `<strong>${goal.goal}:</strong> ${goal.description || ''}`;
      goalList.appendChild(li);
    });
    callout.appendChild(goalList);
  }

  const ctaGroup = document.createElement('div');
  ctaGroup.className = 'glass-cta-group';

  const projectLink = project.link || project.caseStudy || project.repo;
  if (projectLink) {
    const primaryCta = document.createElement('a');
    primaryCta.href = projectLink;
    primaryCta.className = 'btn btn--primary';
    primaryCta.target = projectLink.startsWith('http') ? '_blank' : '_self';
    primaryCta.rel = projectLink.startsWith('http') ? 'noopener' : '';
    primaryCta.textContent = project.ctaLabel || 'View Project';
    ctaGroup.appendChild(primaryCta);
  }

  if (personal.email) {
    const contactCta = document.createElement('a');
    contactCta.href = `mailto:${personal.email}`;
    contactCta.className = 'btn btn--ghost';
    contactCta.textContent = 'Contact Me';
    ctaGroup.appendChild(contactCta);
  }

  if (ctaGroup.childElementCount > 0) {
    callout.appendChild(ctaGroup);
  }
};

const hydrateGlassContent = async () => {
  try {
    const response = await fetch(GLASS_DATA_PATH);
    if (!response.ok) {
      throw new Error('Failed to load glass content');
    }
    const data = await response.json();
    renderInvolvements(data.involvements, data.glass);
    renderExperiences(data.experiences, data.glass);
    renderProject(data.project, data.personal || {});
  } catch (error) {
    console.error('Unable to load glass_portfolio_content.json', error);
  }
};

hydrateGlassContent();

// Footer year --------------------------------------------------------------
const yearTarget = document.getElementById('current-year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
