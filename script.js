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

const normalizeReadingTimeText = (text = '') => text.replace(/\b(\d{1,2})\s*MIN\b/g, (match, value) => {
  const minutes = Number.parseInt(value, 10);
  return `${READING_TIME_MAP.get(minutes) ?? minutes} MIN`;
});

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
    label.textContent = normalizeReadingTimeText(label.textContent);
  });
};

normalizeReadingTimeLabels();

// Home temporal feed. It uses /articulos/ as its single source of truth, so every
// new editorial article automatically moves to the top when the article index is
// updated. Explainers are intentionally excluded from this chronological stream.
const homeHero = document.querySelector('main#main-content > .hero');
if (homeHero && !document.querySelector('[data-recent-feed]')) {
  const recentSection = document.createElement('section');
  recentSection.className = 'recent-feed section';
  recentSection.setAttribute('aria-labelledby', 'recent-feed-title');
  recentSection.dataset.recentFeed = '';
  recentSection.innerHTML = `
    <div class="recent-feed-head">
      <div>
        <p class="section-kicker">EN ORDEN DE PUBLICACIÓN</p>
        <h2 id="recent-feed-title">LO ÚLTIMO.</h2>
        <p class="recent-feed-intro">Los últimos artículos publicados, con lo nuevo siempre arriba. Un hilo temporal para seguir lo que estamos mirando ahora.</p>
      </div>
      <a class="recent-feed-all" href="articulos/">VER TODOS LOS ARTÍCULOS →</a>
    </div>
    <div class="recent-feed-list" data-recent-list aria-live="polite"></div>`;
  homeHero.insertAdjacentElement('afterend', recentSection);

  const recentStyles = document.createElement('style');
  recentStyles.textContent = `
    .recent-feed{background:var(--paper)}
    .recent-feed-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:36px;align-items:end;padding-bottom:28px;border-bottom:2px solid var(--ink)}
    .recent-feed-intro{max-width:650px;margin:18px 0 0;font-size:18px;line-height:1.5}
    .recent-feed-all{align-self:end;font:700 15px "Archivo Narrow",sans-serif;text-decoration:none;padding:9px 0}
    .recent-feed-all:hover,.recent-feed-all:focus-visible{background:var(--yellow);outline:3px solid var(--yellow);outline-offset:2px}
    .recent-feed-list{margin-top:0}
    .recent-item{display:grid;grid-template-columns:64px minmax(0,1fr) 38px;gap:22px;align-items:start;padding:26px 18px;border-bottom:1px solid var(--ink);text-decoration:none;transition:background-color .15s ease}
    .recent-item:hover,.recent-item:focus-visible{background:var(--yellow);outline:0}
    .recent-item.is-latest{background:var(--yellow);padding-top:32px;padding-bottom:32px}
    .recent-order{padding-top:4px;font:600 11px "IBM Plex Mono",monospace;letter-spacing:.04em}
    .recent-meta-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .recent-item .meta{margin:0}
    .recent-badge{padding:4px 7px;background:var(--ink);color:var(--paper);font:600 9px "IBM Plex Mono",monospace;letter-spacing:.04em}
    .recent-item h3{max-width:980px;margin:9px 0 8px;font:700 clamp(29px,3vw,44px)/.96 "Archivo Narrow",sans-serif;letter-spacing:-.015em}
    .recent-item.is-latest h3{font-size:clamp(38px,4.4vw,64px);line-height:.92}
    .recent-summary{max-width:780px;margin:0;font-size:16px;line-height:1.5}
    .recent-arrow{align-self:center;font-size:28px;transition:transform .15s ease}
    .recent-item:hover .recent-arrow,.recent-item:focus-visible .recent-arrow{transform:translateX(5px)}
    @media(max-width:900px){.recent-feed-head{grid-template-columns:1fr;gap:18px}.recent-feed-all{justify-self:start}.recent-item{grid-template-columns:48px minmax(0,1fr) 30px;gap:16px}.recent-item.is-latest h3{font-size:clamp(36px,7vw,54px)}}
    @media(max-width:560px){.recent-feed-intro{font-size:16px}.recent-item{grid-template-columns:32px minmax(0,1fr);gap:12px;padding:22px 8px}.recent-item.is-latest{padding:26px 8px}.recent-arrow{display:none}.recent-item h3{font-size:30px}.recent-item.is-latest h3{font-size:38px}.recent-summary{font-size:15px}}
  `;
  document.head.appendChild(recentStyles);

  const recentList = recentSection.querySelector('[data-recent-list]');
  const fallbackPosts = [
    {
      href: 'dinero/oro-tokenizado-vs-bitcoin/',
      meta: 'DINERO · MERCADOS · 22 MIN',
      title: 'SI PUEDES TOKENIZAR EL ORO, ¿PARA QUÉ NECESITAS BITCOIN?',
      summary: 'Tokenizar el oro arregla buena parte de su torpeza digital. Eso deja al descubierto las diferencias fundamentales: custodia, oferta, colateral y qué significa poseer cada activo.',
    },
    {
      href: 'economia/ia-productividad-salarios-desigualdad/',
      meta: 'ECONOMÍA · PODER · MERCADOS · 22 MIN',
      title: '¿QUIÉN SE QUEDA CON EL DINERO SI LA IA NOS HACE MÁS PRODUCTIVOS?',
      summary: 'La IA puede elevar productividad y PIB. La pregunta difícil es cuánto termina como salario, precios más bajos, beneficios, activos o tiempo libre.',
    },
    {
      href: 'poder/como-puede-europa-congelar-reservas-rusia/',
      meta: 'PODER · DINERO · MERCADOS · 20 MIN',
      title: '¿CÓMO PUEDE EUROPA CONGELAR MÁS DE €200.000 MILLONES DE RUSIA?',
      summary: 'Una reserva internacional puede seguir siendo tuya y, aun así, dejar de estar disponible. Ahí empieza el poder de custodios, jurisdicciones y redes financieras.',
    },
    {
      href: 'dinero/que-es-el-debasement-trade/',
      meta: 'DINERO · MERCADOS · PODER · 20 MIN',
      title: '¿QUÉ ES EL DEBASEMENT TRADE Y DE QUÉ TE ESTÁS PROTEGIENDO REALMENTE?',
      summary: 'Deuda, inflación, tipos reales, oro y Bitcoin conectados por una pregunta: qué ocurre si las promesas nominales pierden valor real.',
    },
    {
      href: 'mercados/por-que-wall-street-cae-cuando-empleo-sale-bien/',
      meta: 'MERCADOS · ECONOMÍA · 18 MIN',
      title: '¿POR QUÉ WALL STREET PUEDE CAER CUANDO EL EMPLEO SALE DEMASIADO BIEN?',
      summary: 'Una buena noticia económica puede cambiar lo que el mercado espera de la Fed. Y cuando cambia el precio del dinero, cambia cuánto estamos dispuestos a pagar por el futuro.',
    },
  ];

  const renderRecentPosts = (posts) => {
    recentList.replaceChildren();
    posts.slice(0, 5).forEach((post, index) => {
      const item = document.createElement('a');
      item.className = `recent-item${index === 0 ? ' is-latest' : ''}`;
      item.href = post.href;

      const order = document.createElement('span');
      order.className = 'recent-order';
      order.textContent = String(index + 1).padStart(2, '0');

      const copy = document.createElement('div');
      const metaRow = document.createElement('div');
      metaRow.className = 'recent-meta-row';
      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = normalizeReadingTimeText(post.meta);
      metaRow.appendChild(meta);
      if (index === 0) {
        const badge = document.createElement('span');
        badge.className = 'recent-badge';
        badge.textContent = 'MÁS RECIENTE';
        metaRow.appendChild(badge);
      }

      const title = document.createElement('h3');
      title.textContent = post.title;
      const summary = document.createElement('p');
      summary.className = 'recent-summary';
      summary.textContent = post.summary;
      copy.append(metaRow, title, summary);

      const arrow = document.createElement('b');
      arrow.className = 'recent-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      item.append(order, copy, arrow);
      recentList.appendChild(item);
    });
  };

  renderRecentPosts(fallbackPosts);

  fetch('/articulos/', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const sourceBase = new URL('/articulos/', window.location.origin);
      const posts = Array.from(doc.querySelectorAll('.hub-grid > a'))
        .filter((card) => !card.getAttribute('href')?.includes('/explainers/'))
        .slice(0, 5)
        .map((card) => ({
          href: new URL(card.getAttribute('href'), sourceBase).pathname,
          meta: card.querySelector('span')?.textContent?.trim() || '',
          title: card.querySelector('h2')?.textContent?.trim() || '',
          summary: card.querySelector('p')?.textContent?.trim() || '',
        }))
        .filter((post) => post.href && post.title);

      if (posts.length) renderRecentPosts(posts);
    })
    .catch(() => {
      // The current five-post fallback remains visible if the live index is unavailable.
    });
}

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
