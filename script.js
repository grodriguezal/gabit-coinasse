(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  loadScript('/script-core.js?v=20260926-audio-test')
    .then(() => {
      const path = `${window.location.pathname.replace(/\/+$/, '')}/`;
      if (path === '/dinero/tokenizacion-activos-agentes-liquidez/') {
        return loadScript('/gabit-audio-test.js?v=20260926-1');
      }
      return null;
    })
    .catch(() => {});
})();
