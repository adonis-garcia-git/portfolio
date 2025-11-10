const DATA_PATH = 'resume.json';
const RESUME_PATH = 'assets/Adonis_G_Resume_Fall_2025 (1).pdf';
const TAGLINE = 'Software Engineer | Passionate about Impact';
let resumeData = null;
const siteHeader = document.querySelector('.site-header');

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
const particles = [];
const particleCount = 70;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getParticleRGB = () =>
  getComputedStyle(document.body).getPropertyValue('--particle-color-rgb').trim() || '0, 191, 166';
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
    this.size = Math.random() * 1.2 + 0.2;
    this.speedY = Math.random() * -0.25 - 0.05;
    this.speedX = Math.random() * 0.3 - 0.15;
    this.alpha = Math.random() * 0.6 + 0.25;
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
    ctx.shadowColor = `rgba(${particleRGB}, 0.7)`;
    ctx.shadowBlur = 8;
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
window.addEventListener('scroll', updateHeaderOnScroll);

// Fade-in observer reused after data renders
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

  heroTagline.textContent = TAGLINE;
  heroName.textContent = `Hi, I'm ${data.name}.`;

  const primaryLocation = data.education?.[0]?.location || 'New York, NY';
  const projectCount = data.projects?.length || 0;
  const experienceCount = data.experience?.length || 0;
  const experienceCopy = experienceCount
    ? `${experienceCount} engineering experiences`
    : 'multi-disciplinary experiences';
  const projectCopy = projectCount ? `${projectCount} experiments` : 'countless experiments';
  heroSummary.textContent = `Based in ${primaryLocation}, I'm looking to further my skillset as a software developer through personal projects while also looking for a fulltime position.`;

  heroLinks.innerHTML = '';
  const contactLinks = [
    { label: 'GitHub', href: data.contact?.github },
    { label: 'LinkedIn', href: data.contact?.linkedin },
    { label: 'Email', href: data.contact?.email ? `mailto:${data.contact.email}` : null },
  ].filter((link) => Boolean(link.href));

  contactLinks.forEach((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.target = link.href.startsWith('http') ? '_blank' : '_self';
    anchor.rel = link.href.startsWith('http') ? 'noopener' : '';
    anchor.textContent = link.label;
    heroLinks.appendChild(anchor);
  });

  if (footerName) {
    footerName.textContent = data.name;
  }
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

  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.animate = 'fade';

    const title = document.createElement('h3');
    title.textContent = project.name;
    
    const metaText = [project.location].filter(Boolean).join('\n');
    if (metaText) {
      const meta = document.createElement('p');
      meta.style.whiteSpace = 'pre-line';
      meta.className = 'project-meta';
      meta.textContent = metaText;
      card.appendChild(meta);
    }

    const techStack = project.tech || [];
    const descItems = project.description || [];

    if (techStack.length) {
      const techList = document.createElement('ul');
      techList.className = 'project-card__stack';
      techStack.forEach((tech) => {
        const li = document.createElement('li');
        li.textContent = tech;
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
        descList.appendChild(li);
      });
      card.appendChild(descList);
    }

    const actions = document.createElement('div');
    actions.className = 'project-card__actions';

    const repoLink = resolveRepoLink(project, repoMap, contact);
    if (repoLink && repoLink !== '#') {
      const githubButton = document.createElement('a');
      githubButton.className = 'btn btn--ghost';
      githubButton.textContent = 'View on GitHub';
      githubButton.href = repoLink;
      githubButton.target = '_blank';
      githubButton.rel = 'noopener noreferrer';
      actions.appendChild(githubButton);
    }

    card.prepend(title);
    card.append(actions);
    grid.appendChild(card);

  });
};

const renderExperience = (experienceRecords = []) => {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';

  const sortedExperience = [...experienceRecords].sort((a, b) => {
    const orderA = parseInt(a.id, 10) || 0;
    const orderB = parseInt(b.id, 10) || 0;
    return orderA - orderB;
  });

  sortedExperience.forEach((role, index) => {
    const entry = document.createElement('article');
    entry.className = 'experience-entry';
    entry.dataset.animate = 'fade';

    const marker = document.createElement('div');
    marker.className = 'experience-marker';
    marker.textContent = String(index + 1).padStart(2, '0');

    const summaryCard = document.createElement('div');
    summaryCard.className = 'experience-summary-card flex flex-col gap-4';
    summaryCard.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="experience-logo">
          ${
            role.logo
              ? `<img src="${role.logo}" alt="${role.logoAlt || role.company}" class="experience-logo__image" loading="lazy" />`
              : `<span class="text-lg font-semibold tracking-[0.4em] text-white/80">${(role.company || '')
                  .split(' ')
                  .map((word) => word.charAt(0))
                  .join('')
                  .slice(0, 3)}</span>`
          }
        </div>
        <div>
          <p class="experience-summary-meta">${role.date || ''}</p>
          <h3>${role.company || 'Experience'}</h3>
          <p class="text-sm text-[var(--text-muted)]">${role.title || ''}</p>
        </div>
      </div>
      <p class="text-sm text-[var(--text-muted)]">${role.location || ''}</p>
      ${
        role.teamFocus
          ? `<p class="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">${role.teamFocus}</p>`
          : ''
      }
      <p class="experience-description">${role.description || ''}</p>
    `;

    const detailCard = document.createElement('div');
    detailCard.className = 'experience-detail-card';

    if (role.highlights && role.highlights.length > 0) {
      const section = document.createElement('section');
      section.innerHTML = '<h4>Highlights</h4>';
      const list = document.createElement('ul');
      list.className = 'experience-highlights';
      role.highlights.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      section.appendChild(list);
      detailCard.appendChild(section);
    }

    if (role.tags && role.tags.length > 0) {
      const tagsSection = document.createElement('section');
      tagsSection.innerHTML = '<h4>Technologies</h4>';
      const tagWrap = document.createElement('div');
      tagWrap.className = 'experience-tags';
      role.tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'experience-tag';
        span.textContent = tag;
        tagWrap.appendChild(span);
      });
      tagsSection.appendChild(tagWrap);
      detailCard.appendChild(tagsSection);
    }

    entry.append(marker, summaryCard, detailCard);
    container.appendChild(entry);
  });
};

const renderEducation = (education = []) => {
  const container = document.getElementById('education-cards');
  if (!container) return;
  container.innerHTML = '';

  const createChip = (label, variant = 'default') => {
    const span = document.createElement('span');
    const variantClass = variant === 'accent' ? 'edu-chip--accent' : '';
    span.className = `edu-chip ${variantClass} inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium`;
    span.textContent = label;
    return span;
  };

  education.forEach((entry) => {
    const card = document.createElement('article');
    card.dataset.animate = 'fade';
    card.className =
      'relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl p-8 md:p-10 flex flex-col gap-8';
    card.style.background = 'var(--bg-panel-strong)';
    card.style.borderColor = 'var(--divider-color)';

    // GPA badge
    const gpaBadge = document.createElement('div');
    gpaBadge.className =
      'absolute top-6 right-6 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-[0.35em]';
    gpaBadge.style.borderColor = 'var(--divider-color)';
    gpaBadge.style.background = 'var(--chip-bg-strong)';
    gpaBadge.style.color = 'var(--text-primary)';
    gpaBadge.innerHTML = `<span>GPA</span><span class="tracking-normal text-base font-semibold">${entry.gpa || '—'}</span>`;
    card.appendChild(gpaBadge);

    // Header with logo & degree info
    const header = document.createElement('div');
    header.className = 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between';

    const identity = document.createElement('div');
    identity.className = 'flex items-center gap-4';

    const logoWrap = document.createElement('div');
    logoWrap.className =
      'w-16 h-16 rounded-2xl border flex items-center justify-center overflow-hidden';
    logoWrap.style.borderColor = 'var(--divider-color)';
    logoWrap.style.background = 'var(--chip-bg)';

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
    grad.textContent = entry.expectedGraduation || '';

    const schoolName = document.createElement('h3');
    schoolName.className = 'text-2xl font-semibold text-[var(--text-primary)] leading-tight';
    schoolName.textContent = entry.school;

    const degree = document.createElement('p');
    degree.className = 'text-sm text-[var(--text-muted)]';
    degree.textContent = entry.minor
      ? `${entry.degree}, Minor in ${entry.minor}`
      : entry.degree || '';

    const location = document.createElement('p');
    location.className = 'text-sm text-[var(--text-muted)]';
    location.textContent = entry.location || '';

    schoolBlock.append(grad, schoolName, degree, location);
    identity.append(logoWrap, schoolBlock);
    header.appendChild(identity);
    card.appendChild(header);

    // Content sections stacked
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'space-y-6';

    const courseworkSection = document.createElement('div');
    const courseworkTitle = document.createElement('p');
    courseworkTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3';
    courseworkTitle.textContent = 'Coursework';

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

    courseworkSection.append(courseworkTitle, courseworkGrid);

    const organizationsSection = document.createElement('div');
    const organizationsTitle = document.createElement('p');
    organizationsTitle.className =
      'text-xs uppercase tracking-[0.4em] text-[var(--text-muted)] mb-3';
    organizationsTitle.textContent = 'Organizations';

    const organizationsWrap = document.createElement('div');
    organizationsWrap.className = 'flex flex-wrap gap-2';

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

    organizationsSection.append(organizationsTitle, organizationsWrap);

    contentWrapper.append(courseworkSection, organizationsSection);
    card.appendChild(contentWrapper);

    container.appendChild(card);
  });
};

const renderSkills = (skills = {}) => {
  const groups = document.getElementById('skills-groups');
  if (!groups) return;
  groups.innerHTML = '';

  const mapping = [
    { key: 'languages', label: 'Languages' },
    { key: 'developerTools', label: 'Developer Tools' },
    { key: 'spokenLanguages', label: 'Spoken Languages' },
  ];

  mapping.forEach(({ key, label }) => {
    if (!Array.isArray(skills[key]) || skills[key].length === 0) return;
    const group = document.createElement('div');
    group.className = 'skill-group';
    group.dataset.animate = 'fade';

    const heading = document.createElement('h3');
    heading.textContent = label;

    const tags = document.createElement('div');
    tags.className = 'skill-tags';

    skills[key].forEach((skill) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
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
