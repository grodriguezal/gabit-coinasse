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
