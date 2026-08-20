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

// Google Analytics 4 — Gabit Coinasse
const GA_MEASUREMENT_ID = 'G-Z1DYMZX6YM';
const ANALYTICS_CONSENT_KEY = 'gabit-analytics-consent';

const loadGoogleAnalytics = () => {
  if (window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

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
    'padding:16px',
    'background:#111',
    'color:#fff',
    'border:1px solid rgba(255,255,255,.2)',
    'box-shadow:0 12px 36px rgba(0,0,0,.25)',
    'font:inherit',
  ].join(';');

  banner.innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <p style="margin:0;max-width:520px;line-height:1.45">
        Uso Google Analytics para entender cómo se utiliza Gabit Coinasse y mejorar la web. Puedes aceptar o rechazar la analítica.
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" data-analytics-reject style="padding:10px 14px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;font:inherit">RECHAZAR</button>
        <button type="button" data-analytics-accept style="padding:10px 14px;border:1px solid #fff;background:#fff;color:#111;cursor:pointer;font:inherit">ACEPTAR</button>
      </div>
    </div>`;

  banner.querySelector('[data-analytics-accept]')?.addEventListener('click', () => {
    saveAnalyticsConsent('granted');
    removeAnalyticsBanner();
    loadGoogleAnalytics();
  });

  banner.querySelector('[data-analytics-reject]')?.addEventListener('click', () => {
    saveAnalyticsConsent('denied');
    removeAnalyticsBanner();
  });

  document.body.appendChild(banner);
};

let analyticsConsent = null;
try {
  analyticsConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
} catch (_) {
  analyticsConsent = null;
}

if (analyticsConsent === 'granted') {
  loadGoogleAnalytics();
} else if (analyticsConsent !== 'denied') {
  showAnalyticsConsent();
}
