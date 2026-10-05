(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  loadScript('/script-core.js?v=20261005-diversificacion')
    .then(() => {
      const path = `${window.location.pathname.replace(/\/+$/, '')}/`;
      if (path === '/dinero/tokenizacion-activos-agentes-liquidez/') {
        return loadScript('/gabit-audio-mp3-test.js?v=20260927-1');
      }
      return null;
    })
    .catch(() => {});
})();
