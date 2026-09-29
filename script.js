(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  loadScript('/script-core.js?v=20260929-home-feed-fix')
    .then(() => {
      // The home already has an editorially curated, server-rendered "Lo último".
      // Remove the legacy client-side feed so it cannot flash stale fallback posts
      // and then replace them after fetching /articulos/.
      document.querySelectorAll('[data-recent-feed]').forEach((feed) => feed.remove());

      const path = `${window.location.pathname.replace(/\/+$/, '')}/`;
      if (path === '/dinero/tokenizacion-activos-agentes-liquidez/') {
        return loadScript('/gabit-audio-mp3-test.js?v=20260927-1');
      }
      return null;
    })
    .catch(() => {});
})();
