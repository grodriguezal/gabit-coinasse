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

// Reading-time labels: normalize long-form pieces to the editorial 5–9 minute scale.
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
  const selectors = ['.eyebrow', '.hub-grid span', '.feature-card span', '.story-list span', '.rabbit-list span', '.rabbit-list small', '.latest-grid span', '.meta'];
  document.querySelectorAll(selectors.join(',')).forEach((label) => {
    label.textContent = normalizeReadingTimeText(label.textContent);
  });
};
normalizeReadingTimeLabels();

// Home temporal feed. /articulos/ is the source of truth for publication order.
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
    { href: 'dinero/como-funciona-el-dinero-moderno/', meta: 'RABBIT HOLE · DINERO · ECONOMÍA · 22 MIN', title: 'TIENES DINERO. PERO ¿QUÉ COÑO TIENES REALMENTE?', summary: 'Del oro al fiat, los bancos, Bitcoin, stablecoins e inflación. Un mapa para entender qué promesa aceptas cada vez que dices “dinero”.' },
    { href: 'mercados/tesis-inversion-plata/', meta: 'MERCADOS · DINERO · ECONOMÍA · 15 MIN', title: 'LA PLATA TIENE UN PROBLEMA: EL MUNDO LA QUIERE PARA DOS COSAS A LA VEZ', summary: 'Es activo monetario y materia prima industrial. Su mayor atractivo nace de esa doble vida. El riesgo también.' },
    { href: 'economia/quien-paga-realmente-un-arancel/', meta: 'ECONOMÍA · PODER · MERCADOS · 14 MIN', title: '¿QUIÉN PAGA REALMENTE UN ARANCEL?', summary: 'El gobierno se lo cobra al importador. La factura termina repartiéndose entre empresas, consumidores, proveedores extranjeros y productores locales.' },
    { href: 'dinero/que-pasaria-si-separamos-dinero-del-estado/', meta: 'DINERO · PODER · 15 MIN', title: '¿QUÉ PASARÍA SI MAÑANA SEPARÁRAMOS EL DINERO DEL ESTADO?', summary: 'Quitar al Estado la capacidad de crear dinero cambia quién puede emitir, rescatar y financiar.' },
    { href: 'economia/quien-pagara-tu-pension/', meta: 'ECONOMÍA · DINERO · PODER · 15 MIN', title: '¿QUIÉN VA A PAGAR TU PENSIÓN CUANDO TE JUBILES?', summary: 'Las pensiones actuales se pagan con los ingresos actuales y la demografía está cambiando la factura.' },
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
    .catch(() => {});
}

// Hub search + category filters + progressive reveal.
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
  const filterButtons = Array.from(hub.querySelectorAll('[data-hub-filter]'));
  if (!grid || !controls || !input || !loadMore) return;

  const cards = Array.from(grid.children).filter((card) => card.matches('a'));
  const pageSize = Number.parseInt(hub.dataset.hubPageSize || '12', 10) || 12;
  let visibleCount = pageSize;
  let activeFilter = 'all';

  cards.forEach((card) => {
    const metaText = card.querySelector('span')?.textContent || '';
    card.dataset.hubHaystack = normalizeHubText([
      card.textContent,
      card.getAttribute('data-search') || '',
      card.getAttribute('href') || '',
    ].join(' '));
    card.dataset.hubCategories = normalizeHubText(metaText);
  });

  if (filterButtons.length) {
    const filterStyles = document.createElement('style');
    filterStyles.textContent = `
      .library-page .hub-filters{display:flex;gap:8px;flex-wrap:wrap}
      .library-page .hub-filters button{border:1px solid var(--ink);border-radius:0;background:transparent;color:var(--ink);padding:7px 12px;cursor:pointer;font:600 12px/1 "IBM Plex Mono",monospace;transition:background-color .18s ease,color .18s ease,transform .18s ease,border-width .18s ease}
      .library-page .hub-filters button:hover{background:#fff1a6;transform:translateY(-2px)}
      .library-page .hub-filters button[aria-pressed="true"],.library-page .hub-filters button.is-active{background:var(--yellow);border-width:2px;transform:translateY(-1px)}
      .library-page .hub-filters button:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}
      @media(prefers-reduced-motion:reduce){.library-page .hub-filters button{transition:none}.library-page .hub-filters button:hover,.library-page .hub-filters button[aria-pressed="true"]{transform:none}}
    `;
    document.head.appendChild(filterStyles);
  }

  const renderHub = () => {
    const query = normalizeHubText(input.value);
    const candidates = cards.filter((card) => {
      const matchesQuery = !query || card.dataset.hubHaystack.includes(query);
      const matchesFilter = activeFilter === 'all' || card.dataset.hubCategories.includes(activeFilter);
      return matchesQuery && matchesFilter;
    });

    cards.forEach((card) => { card.hidden = true; });
    const showing = (query || activeFilter !== 'all') ? candidates : candidates.slice(0, visibleCount);
    showing.forEach((card) => { card.hidden = false; });

    if (status) {
      if (query || activeFilter !== 'all') {
        status.textContent = candidates.length === 1 ? '1 resultado' : `${candidates.length} resultados`;
      } else {
        status.textContent = cards.length > pageSize ? `Mostrando ${Math.min(visibleCount, cards.length)} de ${cards.length}` : '';
      }
    }

    loadMore.hidden = Boolean(query) || activeFilter !== 'all' || visibleCount >= cards.length;
  };

  filterButtons.forEach((button) => {
    // Legacy markup used "todos". Treat both values as the no-filter state.
    const rawValue = normalizeHubText(button.dataset.hubFilter || '');
    const filterValue = rawValue === 'todos' ? 'all' : rawValue;
    if (button.getAttribute('aria-pressed') === 'true' || button.classList.contains('is-active')) {
      activeFilter = filterValue || 'all';
    }
    button.addEventListener('click', () => {
      activeFilter = filterValue || 'all';
      visibleCount = pageSize;
      filterButtons.forEach((candidate) => {
        const selected = candidate === button;
        candidate.setAttribute('aria-pressed', selected ? 'true' : 'false');
        candidate.classList.toggle('is-active', selected);
      });
      renderHub();
    });
  });

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
window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
const googleTagScript = document.createElement('script');
googleTagScript.async = true;
googleTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTagScript);

// Mobile colour feedback: quiet, persistent underline; no touch or card flashes.
(() => {
  const touch = window.matchMedia('(hover: none) and (pointer: coarse)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const styles = document.createElement('style');
  styles.id = 'gabit-mobile-colour';
  styles.textContent = `
    @media (hover:none) and (pointer:coarse) {
      a[href],button{-webkit-tap-highlight-color:rgba(17,17,17,.08)}
      body .path-card:hover:not(:focus-visible),
      body .recent-item:not(.is-latest):hover:not(:focus-visible),
      body .hub-grid>a:hover:not(:focus-visible),
      body .explainer-grid a:hover:not(:focus-visible),
      body .territory-grid a:hover:not(:focus-visible),
      body .article-thread a:hover:not(:focus-visible),
      body .route-links a:hover:not(:focus-visible),
      body .connection-map a:hover:not(:focus-visible),
      body .feature-card .feature-link:hover:not(:focus-visible),
      body .recent-feed-all:hover:not(:focus-visible),
      body .site-header nav a:hover:not(:focus-visible),
      body .button:not(.button-dark):hover:not(:focus-visible){background-color:transparent;outline:none}
      body .story-list article:not(:has(:focus-visible)):is(:hover,:focus-within){background-color:transparent}
      body .story-list article:not(:has(:focus-visible)):is(:hover,:focus-within)>a,
      body .recent-item:hover:not(:focus-visible) .recent-arrow{transform:none}
      body .button-dark:hover:not(:focus-visible),
      body .hub-load-more:hover:not(:focus-visible){background-color:var(--ink);color:var(--paper);outline:none}
      body .rabbit-list a:hover:not(:focus-visible){color:inherit}
      body .library-page .hub-filters button:not([aria-pressed="true"]):not(.is-active):hover:not(:focus-visible){background-color:transparent;transform:none}
      body .feature-card h3 .feature-title-link:hover:not(:focus-visible):not(.gc-mobile-underlined){background-size:0 32%}
      body .feature-card h3 .feature-title-link.gc-mobile-underlined{background-size:100% 32%;transition:background-size 900ms ease-out}
    }
    @media (prefers-reduced-motion:reduce) {
      body .feature-card h3 .feature-title-link.gc-mobile-underlined{transition:none}
    }
  `;
  document.head.appendChild(styles);
  let observer = null;
  const syncMotion = () => {
    observer?.disconnect();
    observer = null;
    if (!touch.matches || reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      if (!observer || !touch.matches || reduced.matches) return;
      entries.forEach(({target, isIntersecting, intersectionRatio}) => {
        if (!isIntersecting || intersectionRatio < 0.5) return;
        target.classList.add('gc-mobile-underlined');
        observer.unobserve(target);
      });
    }, {threshold: 0.5});
    document.querySelectorAll('.feature-title-link:not(.gc-mobile-underlined)').forEach((element) => observer.observe(element));
  };
  touch.addEventListener('change', syncMotion);
  reduced.addEventListener('change', syncMotion);
  syncMotion();
})();
