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

const articleVisuals = {
  '/mercados/invertir-en-bolsa-no-es-apostar-a-una-linea/': [1, 'Pantalla bursátil convertida en fábrica: la línea de precio tapa engranajes, caja y tiempo.', 'la línea no es el activo'],
  '/mercados/que-es-un-fondo-indexado/': [2, 'Cesta de mercado con muchas fichas, reglas de peso y una marca amarilla señalando concentración.', 'comprar una regla'],
  '/mercados/que-es-un-indice-bursatil/': [3, 'Promedio bursátil gigante con empresas pequeñas cayendo detrás.', 'el promedio esconde cosas'],
  '/mercados/que-es-un-etf/': [4, 'Envoltorio limpio de ETF con una cesta compleja dentro.', 'el envoltorio no es el riesgo'],
  '/mercados/por-que-diversificar-no-es-cobardia/': [5, 'Cajas de riesgo repartidas: una se rompe y las demás resisten.', 'una historia puede fallar'],
  '/mercados/por-que-las-comisiones-importan/': [6, 'Pequeñas comisiones mordiendo una curva compuesta durante años.', 'el coste también compone'],
  '/mercados/por-que-intentar-acertar-el-momento-es-tan-dificil/': [7, 'Dos puertas de mercado: salir antes de la caída y volver antes del rebote.', 'dos milagros'],
  '/mercados/que-son-los-dividendos/': [8, 'Empresa cortando una porción de caja para accionistas.', 'sale del balance'],
  '/mercados/que-es-la-renta-variable/': [9, 'Planta empresarial creciendo desde beneficios futuros con una etiqueta de propiedad.', 'propiedad incierta'],
  '/mercados/que-es-la-renta-fija/': [10, 'Promesa de pago atravesada por tipos, inflación y riesgo de crédito.', 'promesa no es seguridad'],
  '/mercados/renta-fija-vs-renta-variable/': [11, 'Dos contratos enfrentados: promesa de pago contra propiedad residual.', 'promesa vs propiedad'],
  '/mercados/que-es-la-volatilidad/': [12, 'Curva de precios moviendo una silla vacía y un café derramado.', 'el gráfico mueve decisiones'],
  '/mercados/que-es-el-riesgo-al-invertir/': [13, 'Mapa de riesgos con grietas: mercado, crédito, liquidez, inflación y conducta.', 'lo que puede romperse'],
  '/mercados/que-es-el-per/': [14, 'Etiqueta de precio barata sobre beneficios que se deshacen al fondo.', 'barato puede ser caro'],
  '/mercados/que-es-la-capitalizacion-bursatil/': [15, 'Pizza empresarial partida en muchas acciones: el precio por porción no cuenta todo.', 'precio × porciones'],
  '/mercados/que-es-un-broker/': [16, 'Dedo a punto de pulsar comprar mientras aparecen peajes e intermediarios.', 'el botón tiene trastienda'],
  '/dinero/que-es-el-interes-compuesto/': [17, 'Bola de nieve de dinero creciendo con el tiempo y una sombra de deuda creciendo al lado.', 'el tiempo amplifica'],
};

const articleMotif = (id) => {
  const motifs = {
    1: '<path d="M120 600C220 560 270 640 365 540S540 460 610 500 710 620 790 430 930 360 1080 250" fill="none" stroke="#111" stroke-width="10"/><rect x="180" y="145" width="450" height="300" fill="#111" opacity=".82"/><circle cx="862" cy="290" r="95" fill="#FFD400"/>',
    2: '<g stroke="#111" stroke-width="6" fill="#F4F0E7"><rect x="130" y="230" width="850" height="360"/><rect x="190" y="290" width="120" height="110"/><rect x="340" y="290" width="190" height="190"/><rect x="560" y="290" width="300" height="250"/></g><path d="M115 205L1000 610" stroke="#FFD400" stroke-width="46" opacity=".8"/>',
    3: '<g fill="#111" opacity=".85"><rect x="120" y="180" width="130" height="420"/><rect x="290" y="250" width="130" height="350"/><rect x="460" y="350" width="130" height="250"/><rect x="630" y="110" width="260" height="490"/></g><path d="M90 540C260 500 350 610 500 565 650 520 770 395 960 250" stroke="#FFD400" stroke-width="40" fill="none"/>',
    4: '<rect x="135" y="155" width="650" height="470" fill="#F4F0E7" stroke="#111" stroke-width="7"/><path d="M135 245h650M245 155v470M425 155v470M610 155v470" stroke="#111" stroke-width="5"/><rect x="760" y="300" width="260" height="160" fill="#FFD400" stroke="#111" stroke-width="7" transform="rotate(-5 890 380)"/>',
    5: '<g fill="#F4F0E7" stroke="#111" stroke-width="7"><rect x="105" y="210" width="210" height="210"/><rect x="365" y="210" width="210" height="210"/><rect x="625" y="210" width="210" height="210"/><rect x="885" y="210" width="210" height="210"/></g><path d="M390 230L550 400M550 230L390 400" stroke="#D93A2F" stroke-width="13"/><circle cx="735" cy="315" r="58" fill="#39834A"/>',
    6: '<path d="M105 615C210 595 310 570 420 520 590 445 700 320 820 210 910 130 1010 100 1110 90" fill="none" stroke="#111" stroke-width="10"/><g fill="#D93A2F" stroke="#111" stroke-width="5"><circle cx="340" cy="548" r="34"/><circle cx="470" cy="492" r="38"/><circle cx="610" cy="392" r="44"/><circle cx="760" cy="255" r="53"/></g>',
    7: '<g fill="#F4F0E7" stroke="#111" stroke-width="8"><rect x="120" y="170" width="300" height="450"/><rect x="780" y="170" width="300" height="450"/></g><path d="M430 650L770 130" stroke="#FFD400" stroke-width="45"/><circle cx="280" cy="390" r="42" fill="#D93A2F"/><circle cx="930" cy="390" r="42" fill="#39834A"/>',
    8: '<rect x="170" y="145" width="520" height="350" fill="#111" opacity=".86"/><path d="M690 320C790 300 835 360 900 340 980 315 1010 250 1085 285" stroke="#FFD400" stroke-width="54" fill="none"/><circle cx="890" cy="510" r="82" fill="#F4F0E7" stroke="#111" stroke-width="7"/>',
    9: '<path d="M590 650C580 520 580 410 590 305" stroke="#111" stroke-width="14"/><path d="M590 390C470 330 365 335 275 400M590 330C710 250 820 250 930 305" stroke="#111" stroke-width="9" fill="none"/><circle cx="278" cy="402" r="75" fill="#39834A"/><circle cx="930" cy="305" r="100" fill="#FFD400"/>',
    10: '<rect x="185" y="160" width="660" height="430" fill="#F4F0E7" stroke="#111" stroke-width="7" transform="rotate(-2 515 375)"/><path d="M260 250h480M260 320h390M260 390h460" stroke="#111" stroke-width="5"/><path d="M790 130C860 240 820 355 905 460 945 510 1010 548 1090 580" stroke="#D93A2F" stroke-width="28" fill="none"/>',
    11: '<rect x="120" y="180" width="390" height="420" fill="#F4F0E7" stroke="#111" stroke-width="7"/><rect x="690" y="180" width="390" height="420" fill="#111" opacity=".86"/><path d="M200 300h230M200 380h190M200 460h230" stroke="#111" stroke-width="6"/><path d="M760 520C820 390 900 350 970 260" stroke="#FFD400" stroke-width="34" fill="none"/>',
    12: '<path d="M100 430C190 240 280 590 390 370S610 250 710 480 920 560 1080 250" stroke="#111" stroke-width="11" fill="none"/><rect x="720" y="520" width="230" height="40" fill="#111"/><ellipse cx="500" cy="610" rx="110" ry="34" fill="#D93A2F"/>',
    13: '<path d="M150 180h850v430h-850z" fill="#F4F0E7" stroke="#111" stroke-width="7"/><path d="M250 210L300 360 240 450 350 585M470 190L525 350 500 600M760 210L700 355 785 460 740 600" stroke="#111" stroke-width="5" fill="none"/><circle cx="520" cy="350" r="58" fill="#FFD400"/>',
    14: '<rect x="150" y="185" width="360" height="220" fill="#FFD400" stroke="#111" stroke-width="7" transform="rotate(-5 330 295)"/><path d="M610 170h400v340h-400z" fill="#111" opacity=".85"/><path d="M250 570C420 520 500 620 640 555 740 510 810 450 980 490" stroke="#D93A2F" stroke-width="31" fill="none"/>',
    15: '<circle cx="460" cy="410" r="260" fill="#F4F0E7" stroke="#111" stroke-width="8"/><path d="M460 410L460 150M460 410L680 545M460 410L260 585M460 410L225 300" stroke="#111" stroke-width="6"/><circle cx="850" cy="365" r="90" fill="#FFD400" stroke="#111" stroke-width="6"/>',
    16: '<rect x="180" y="155" width="500" height="420" fill="#111" opacity=".86"/><circle cx="430" cy="380" r="100" fill="#FFD400"/><path d="M760 210C855 275 930 355 1020 470" stroke="#111" stroke-width="28" fill="none"/><circle cx="1020" cy="470" r="54" fill="#F4F0E7" stroke="#111" stroke-width="7"/>',
    17: '<circle cx="320" cy="520" r="70" fill="#F4F0E7" stroke="#111" stroke-width="7"/><circle cx="470" cy="455" r="95" fill="#F4F0E7" stroke="#111" stroke-width="7"/><circle cx="665" cy="350" r="135" fill="#F4F0E7" stroke="#111" stroke-width="7"/><circle cx="910" cy="225" r="175" fill="#FFD400" stroke="#111" stroke-width="7"/><path d="M185 230C290 300 365 340 480 320" stroke="#D93A2F" stroke-width="32" fill="none"/>',
  };
  return motifs[id] || motifs[1];
};

(() => {
  const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
  const visual = articleVisuals[path];
  const hero = document.querySelector('.article-hero');
  if (!visual || !hero || hero.querySelector('.article-lead-art')) return;
  const [id, alt, caption] = visual;
  const figure = document.createElement('figure');
  figure.className = 'article-lead-art';
  figure.setAttribute('aria-label', alt);
  figure.innerHTML = `<svg viewBox="0 0 1200 820" role="img" aria-label="${alt}" style="display:block;width:100%;max-height:680px;border:2px solid var(--ink);border-bottom:0;background:#F4F0E7" xmlns="http://www.w3.org/2000/svg"><defs><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter><pattern id="h" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#111" opacity=".18"/></pattern></defs><rect width="1200" height="820" fill="#F4F0E7"/><rect x="35" y="35" width="1130" height="750" fill="url(#h)" opacity=".22"/><g>${articleMotif(id)}</g><rect width="1200" height="820" filter="url(#g)" opacity=".55"/><path d="M55 720C230 690 380 735 560 700 760 662 910 690 1130 635" fill="none" stroke="#FFD400" stroke-width="24" opacity=".82"/><rect x="42" y="42" width="1116" height="736" fill="none" stroke="#111" stroke-width="4"/></svg><figcaption>${caption}</figcaption>`;
  hero.appendChild(figure);
})();

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
    </div>
`;

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
