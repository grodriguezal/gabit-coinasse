(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  const integrateSpaceX = () => {
    const path = `${window.location.pathname.replace(/\/+$/, '')}/`;
    if (path !== '/articulos/' && path !== '/mercados/') return;
    const grid = document.querySelector('[data-hub-grid]');
    if (!grid || grid.querySelector('a[href*="spacex-ipo-valuacion-starlink-starship"]')) return;

    const card = document.createElement('a');
    card.href = path === '/mercados/'
      ? 'spacex-ipo-valuacion-starlink-starship/'
      : '../mercados/spacex-ipo-valuacion-starlink-starship/';
    card.dataset.published = '2026-09-25';
    card.dataset.readingTime = '10';
    card.innerHTML = '<span>RABBIT HOLE · MERCADOS · ECONOMÍA · PODER · 10 MIN</span><h2>SPACEX VALE CASI $2 BILLONES. ¿QUÉ ESTÁS COMPRANDO REALMENTE?</h2><p>Starlink ya es una máquina de dinero. Starship sigue siendo una apuesta. La IA consume capital a una escala brutal. A casi $2 billones, el precio exige que varias cosas extraordinarias salgan bien a la vez.</p><b>→</b>';

    const cards = [...grid.querySelectorAll(':scope > a')];
    const before = cards.find((item) => (item.dataset.published || '') < '2026-09-25');
    grid.insertBefore(card, before || null);
  };

  loadScript('/script-core.js?v=20261005-spacex-integration')
    .then(() => {
      integrateSpaceX();
      const path = `${window.location.pathname.replace(/\/+$/, '')}/`;
      if (path === '/dinero/tokenizacion-activos-agentes-liquidez/') {
        return loadScript('/gabit-audio-mp3-test.js?v=20260927-1');
      }
      return null;
    })
    .catch(() => {});
})();
