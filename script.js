// Site favicon — shared across all static pages.
const faviconHref = '/favicon.svg?v=20260911-tight';
const existingFavicons = document.querySelectorAll('link[rel~="icon"]');
if (existingFavicons.length) {
  existingFavicons.forEach((favicon) => {
    favicon.type = 'image/svg+xml';
    favicon.href = faviconHref;
  });
} else {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = faviconHref;
  document.head.appendChild(favicon);
}

// Social channels — shared across all static page footers.
const footerNav = document.querySelector('.site-footer > div');
if (footerNav && !footerNav.querySelector('.site-socials')) {
  const socials = document.createElement('span');
  socials.className = 'site-socials';
  socials.innerHTML = `
    <a class="site-social-link" href="https://www.instagram.com/gabitcoinasse/" target="_blank" rel="noopener noreferrer" aria-label="Gabit Coinasse en Instagram" title="Instagram">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        <circle cx="12" cy="12" r="4.2"></circle>
        <circle class="social-dot" cx="17.4" cy="6.7" r="1.1"></circle>
      </svg>
    </a>
    <a class="site-social-link" href="https://x.com/gabitcoinasse" target="_blank" rel="noopener noreferrer" aria-label="Gabit Coinasse en X" title="X">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 4.5 19 19.5M19 4.5 5 19.5"></path>
      </svg>
    </a>`;
  footerNav.appendChild(socials);

  const socialStyles = document.createElement('style');
  socialStyles.textContent = `
    .site-socials{margin-left:auto;display:flex;align-items:center;gap:10px}
    .site-footer>div .site-social-link{width:38px;height:38px;border:1px solid rgba(244,240,231,.45);display:inline-flex;align-items:center;justify-content:center;text-decoration:none;transition:background-color .15s ease,color .15s ease,border-color .15s ease}
    .site-social-link svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .site-social-link .social-dot{fill:currentColor;stroke:none}
    .site-social-link:hover,.site-social-link:focus-visible{background:#ffd400;color:#111;border-color:#ffd400;outline:0}
    @media(max-width:540px){.site-socials{margin-left:0;margin-top:6px}}
  `;
  document.head.appendChild(socialStyles);
}

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const closeMenu = ({ restoreFocus = false } = {}) => {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton.focus();
};
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  if (open) return closeMenu();
  menuButton.setAttribute('aria-expanded', 'true');
  mobileMenu.hidden = false;
  document.body.classList.add('menu-open');
  mobileMenu.querySelector('a')?.focus();
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu({ restoreFocus: true });
});

// Reading-time labels: keep article metadata inviting and comparable across the site.
// Existing long-form pieces are normalized to an editorial 5–9 minute scale;
// Explainers and already-short labels remain unchanged.
const READING_TIME_MAP = new Map([
  [22, 9], [21, 9], [20, 8], [19, 8], [18, 8], [17, 7],
  [16, 7], [15, 7], [14, 6], [13, 6], [12, 6], [11, 5], [10, 5],
  [9, 5], [8, 4], [7, 4], [6, 3], [5, 3],
]);

const normalizeReadingTimeLabels = () => {
  const selectors = [
    '.eyebrow',
    '.hub-grid span',
    '.feature-card span',
    '.story-list span',
    '.rabbit-list span',
    '.rabbit-list small',
    '.latest-grid span',
    '.meta',
  ];

  document.querySelectorAll(selectors.join(',')).forEach((label) => {
    label.textContent = label.textContent.replace(/\b(\d{1,2})\s*MIN\b/g, (match, value) => {
      const minutes = Number.parseInt(value, 10);
      return `${READING_TIME_MAP.get(minutes) ?? minutes} MIN`;
    });
  });
};

normalizeReadingTimeLabels();

// Hub search + progressive reveal.
// All links remain in the HTML for crawlability and no-JS access; JavaScript only
// controls what is visible to the reader. Hub cards are text-only, so this keeps
// the pages lightweight while preserving direct discovery by search engines.
const normalizeHubText = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

document.querySelectorAll('[data-hub]').forEach((hub) => {
  const grid = hub.querySelector('[data-hub-grid]');
  const controls = hub.querySelector('[data-hub-controls]');
  const input = hub.querySelector('[data-hub-search]');
  const status = hub.querySelector('[data-hub-status]');
  const loadMore = hub.querySelector('[data-hub-more]');
  if (!grid || !controls || !input || !loadMore) return;

  const cards = Array.from(grid.children).filter((card) => card.matches('a'));
  const pageSize = Number.parseInt(hub.dataset.hubPageSize || '12', 10) || 12;
  let visibleCount = pageSize;

  cards.forEach((card) => {
    card.dataset.hubHaystack = normalizeHubText([
      card.textContent,
      card.getAttribute('data-search') || '',
      card.getAttribute('href') || '',
    ].join(' '));
  });

  const renderHub = () => {
    const query = normalizeHubText(input.value);
    let matchCount = 0;

    cards.forEach((card, index) => {
      const matchesQuery = !query || card.dataset.hubHaystack.includes(query);
      if (matchesQuery) matchCount += 1;
      card.hidden = query ? !matchesQuery : index >= visibleCount;
    });

    if (status) {
      if (query) {
        status.textContent = matchCount === 1 ? '1 resultado' : `${matchCount} resultados`;
      } else {
        status.textContent = cards.length > pageSize ? `Mostrando ${Math.min(visibleCount, cards.length)} de ${cards.length}` : '';
      }
    }

    loadMore.hidden = Boolean(query) || visibleCount >= cards.length;
  };

  controls.hidden = false;
  input.addEventListener('input', () => {
    visibleCount = pageSize;
    renderHub();
  });

  loadMore.addEventListener('click', () => {
    visibleCount += pageSize;
    renderHub();
  });

  renderHub();
});

// Google Analytics 4 — Gabit Coinasse
const GA_MEASUREMENT_ID = 'G-Z1DYMZX6YM';

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID, {
  anonymize_ip: true,
});

const googleTagScript = document.createElement('script');
googleTagScript.async = true;
googleTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTagScript);
