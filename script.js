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
// Advanced Consent Mode: Google tag loads for all visitors with analytics storage
// denied by default. Before consent, GA4 can send cookieless pings; full analytics
// storage is enabled only after the visitor accepts.
const GA_MEASUREMENT_ID = 'G-Z1DYMZX6YM';
const ANALYTICS_CONSENT_KEY = 'gabit-analytics-consent';

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500,
});

let analyticsConsent = null;
try {
  analyticsConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
} catch (_) {
  analyticsConsent = null;
}

if (analyticsConsent === 'granted') {
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  });
}

window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID, {
  anonymize_ip: true,
});

const googleTagScript = document.createElement('script');
googleTagScript.async = true;
googleTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTagScript);

const removeAnalyticsBanner = () => {
  document.querySelector('[data-analytics-consent]')?.remove();
};

const saveAnalyticsConsent = (choice) => {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, choice);
  } catch (_) {
    // If storage is unavailable, keep the choice for this page only.
  }
};

const showAnalyticsConsent = () => {
  if (document.querySelector('[data-analytics-consent]')) return;

  const banner = document.createElement('aside');
  banner.setAttribute('data-analytics-consent', '');
  banner.setAttribute('aria-label', 'Preferencias de analítica');
  banner.style.cssText = [
    'position:fixed',
    'left:16px',
    'right:16px',
    'bottom:16px',
    'z-index:9999',
    'max-width:760px',
    'margin:0 auto',
    'padding:14px 16px',
    'background:#111',
    'color:#fff',
    'border:1px solid rgba(255,255,255,.2)',
    'box-shadow:0 12px 36px rgba(0,0,0,.25)',
    'font:inherit',
  ].join(';');

  banner.innerHTML = `
    <div style="display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <p style="margin:0;max-width:520px;line-height:1.4;font-size:.92em">
        Uso analítica para entender qué contenidos funcionan mejor y mejorar la web. Si rechazas, no se guardan cookies de Analytics.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" data-analytics-reject style="padding:9px 12px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;font:inherit">RECHAZAR</button>
        <button type="button" data-analytics-accept style="padding:9px 12px;border:1px solid #fff;background:#fff;color:#111;cursor:pointer;font:inherit">ACEPTAR</button>
      </div>
    </div>`;

  banner.querySelector('[data-analytics-accept]')?.addEventListener('click', () => {
    saveAnalyticsConsent('granted');
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
    removeAnalyticsBanner();
  });

  banner.querySelector('[data-analytics-reject]')?.addEventListener('click', () => {
    saveAnalyticsConsent('denied');
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    removeAnalyticsBanner();
  });

  document.body.appendChild(banner);
};

if (analyticsConsent !== 'granted' && analyticsConsent !== 'denied') {
  showAnalyticsConsent();
}
