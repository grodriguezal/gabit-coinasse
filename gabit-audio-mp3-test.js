(() => {
  const TARGET_PATH = '/dinero/tokenizacion-activos-agentes-liquidez/';
  const AUDIO_SRC = '/assets/audio/tokenizacion-activos-agentes-liquidez.mp3';
  const normalizedPath = `${window.location.pathname.replace(/\/+$/, '')}/`;
  if (normalizedPath !== TARGET_PATH) return;

  const heroCopy = document.querySelector('.article-hero-copy');
  if (!heroCopy || document.querySelector('[data-gabit-audio]')) return;

  const rates = [0.9, 1, 1.2, 1.5, 2];
  const STORAGE_KEY = 'gabit-audio:tokenizacion-activos-agentes-liquidez';

  const audio = new Audio(AUDIO_SRC);
  audio.preload = 'metadata';
  audio.playsInline = true;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const player = document.createElement('section');
  player.className = 'gabit-audio';
  player.dataset.gabitAudio = '';
  player.setAttribute('aria-label', 'Reproductor de audio del artículo');
  player.innerHTML = `
    <div class="gabit-audio__topline">
      <span class="gabit-audio__brand">GABIT COINASSE AUDIO</span>
      <span class="gabit-audio__duration" data-audio-duration>--:--</span>
    </div>
    <div class="gabit-audio__main">
      <button class="gabit-audio__play" type="button" aria-label="Escuchar artículo" data-audio-play>
        <span class="gabit-audio__play-icon" aria-hidden="true">▶</span>
        <span data-audio-play-label>ESCUCHAR ARTÍCULO</span>
      </button>
      <div class="gabit-audio__timeline">
        <input data-audio-progress class="gabit-audio__progress" type="range" min="0" max="1000" value="0" aria-label="Progreso del artículo">
        <div class="gabit-audio__status"><span data-audio-status>LISTO</span><span><span data-audio-current>0:00</span> / <span data-audio-total>--:--</span></span></div>
      </div>
      <div class="gabit-audio__controls">
        <button type="button" data-audio-back aria-label="Retroceder 15 segundos">−15</button>
        <button type="button" data-audio-rate aria-label="Cambiar velocidad">1×</button>
        <button type="button" data-audio-forward aria-label="Avanzar 15 segundos">+15</button>
      </div>
    </div>`;
  heroCopy.appendChild(player);

  const sticky = document.createElement('div');
  sticky.className = 'gabit-audio-sticky';
  sticky.hidden = true;
  sticky.setAttribute('aria-label', 'Controles flotantes de Gabit Coinasse Audio');
  sticky.innerHTML = `
    <div class="gabit-audio-sticky__head">
      <span class="gabit-audio-sticky__brand">GABIT COINASSE AUDIO</span>
      <span class="gabit-audio-sticky__status" data-audio-sticky-status>EN PAUSA</span>
      <span class="gabit-audio-sticky__time" data-audio-sticky-time>0:00 / --:--</span>
    </div>
    <div class="gabit-audio-sticky__controls">
      <button type="button" data-audio-sticky-back aria-label="Retroceder 15 segundos">−15</button>
      <button class="gabit-audio-sticky__play" type="button" data-audio-sticky-play aria-label="Reproducir o pausar"><span data-audio-sticky-icon>▶</span></button>
      <button type="button" data-audio-sticky-forward aria-label="Avanzar 15 segundos">+15</button>
      <input data-audio-sticky-progress class="gabit-audio-sticky__progress" type="range" min="0" max="1000" value="0" aria-label="Progreso del artículo">
      <button class="gabit-audio-sticky__rate" type="button" data-audio-sticky-rate aria-label="Cambiar velocidad">1×</button>
    </div>`;
  document.body.appendChild(sticky);

  const styles = document.createElement('style');
  styles.textContent = `
    .gabit-audio{margin-top:24px;border:2px solid var(--ink,#111);background:var(--paper,#f4f0e7);color:var(--ink,#111);font-family:"IBM Plex Mono",monospace}
    .gabit-audio__topline{display:flex;justify-content:space-between;gap:12px;padding:9px 12px;border-bottom:1px solid var(--ink,#111);font-size:10px;font-weight:700;letter-spacing:.075em}
    .gabit-audio__brand{background:var(--yellow,#ffd400);padding:3px 6px;margin:-3px 0;white-space:nowrap}
    .gabit-audio__main{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(170px,1.5fr) auto;gap:16px;align-items:center;padding:15px 12px}
    .gabit-audio button{appearance:none;border:0;background:transparent;color:inherit;font:700 11px/1 "IBM Plex Mono",monospace;cursor:pointer;border-radius:0}
    .gabit-audio button:focus-visible,.gabit-audio-sticky button:focus-visible,.gabit-audio__progress:focus-visible,.gabit-audio-sticky__progress:focus-visible{outline:3px solid var(--yellow,#ffd400);outline-offset:3px}
    .gabit-audio__play{display:flex;align-items:center;gap:9px;text-align:left;padding:7px 0!important}
    .gabit-audio__play-icon{display:grid;place-items:center;width:31px;height:31px;flex:0 0 31px;background:var(--ink,#111);color:var(--paper,#f4f0e7);font-size:11px}
    .gabit-audio__play:hover .gabit-audio__play-icon{background:var(--yellow,#ffd400);color:var(--ink,#111)}
    .gabit-audio__timeline{min-width:0}
    .gabit-audio__progress{width:100%;height:4px;margin:0;appearance:none;background:linear-gradient(to right,var(--yellow,#ffd400) 0,var(--yellow,#ffd400) var(--gc-audio-progress,0%),rgba(17,17,17,.18) var(--gc-audio-progress,0%),rgba(17,17,17,.18) 100%);cursor:pointer}
    .gabit-audio__progress::-webkit-slider-thumb{appearance:none;width:12px;height:12px;background:var(--ink,#111);border:0;border-radius:0}
    .gabit-audio__progress::-moz-range-thumb{width:12px;height:12px;background:var(--ink,#111);border:0;border-radius:0}
    .gabit-audio__status{display:flex;justify-content:space-between;gap:12px;margin-top:7px;font-size:9px;font-weight:600;letter-spacing:.06em}
    .gabit-audio__controls{display:flex;align-items:center;gap:4px}
    .gabit-audio__controls button{min-width:39px;padding:9px 7px!important;border:1px solid var(--ink,#111)}
    .gabit-audio__controls button:hover{background:var(--yellow,#ffd400)}

    .gabit-audio-sticky{position:fixed;z-index:1000;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(720px,calc(100vw - 24px));padding:10px 11px 11px;background:var(--ink,#111);color:var(--paper,#f4f0e7);border:1px solid rgba(244,240,231,.78);box-shadow:0 10px 30px rgba(0,0,0,.28);font:700 9px/1 "IBM Plex Mono",monospace;letter-spacing:.045em}
    .gabit-audio-sticky[hidden]{display:none}
    .gabit-audio-sticky__head{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding-bottom:8px;border-bottom:1px solid rgba(244,240,231,.18)}
    .gabit-audio-sticky__brand{color:var(--yellow,#ffd400);white-space:nowrap;letter-spacing:.06em}
    .gabit-audio-sticky__status{justify-self:start;color:rgba(244,240,231,.62);font-size:8px;white-space:nowrap}
    .gabit-audio-sticky__time{color:rgba(244,240,231,.78);font-size:8px;white-space:nowrap}
    .gabit-audio-sticky__controls{display:grid;grid-template-columns:40px 44px 40px minmax(90px,1fr) 44px;gap:7px;align-items:center;padding-top:9px}
    .gabit-audio-sticky button{appearance:none;border:1px solid rgba(244,240,231,.38);background:transparent;color:inherit;height:36px;min-width:0;padding:0 6px;font:700 10px/1 "IBM Plex Mono",monospace;cursor:pointer;border-radius:0}
    .gabit-audio-sticky button:hover{background:var(--yellow,#ffd400);color:var(--ink,#111);border-color:var(--yellow,#ffd400)}
    .gabit-audio-sticky__play{background:var(--yellow,#ffd400)!important;color:var(--ink,#111)!important;border-color:var(--yellow,#ffd400)!important;font-size:12px!important}
    .gabit-audio-sticky__progress{width:100%;height:5px;margin:0;appearance:none;background:linear-gradient(to right,var(--yellow,#ffd400) 0,var(--yellow,#ffd400) var(--gc-audio-progress,0%),rgba(244,240,231,.2) var(--gc-audio-progress,0%),rgba(244,240,231,.2) 100%);cursor:pointer}
    .gabit-audio-sticky__progress::-webkit-slider-thumb{appearance:none;width:13px;height:13px;background:var(--paper,#f4f0e7);border:2px solid var(--ink,#111);border-radius:0;box-shadow:0 0 0 1px var(--paper,#f4f0e7)}
    .gabit-audio-sticky__progress::-moz-range-thumb{width:13px;height:13px;background:var(--paper,#f4f0e7);border:2px solid var(--ink,#111);border-radius:0}
    .gabit-audio-sticky__rate{border-color:rgba(255,212,0,.65)!important;color:var(--yellow,#ffd400)!important}

    @media(max-width:760px){
      .gabit-audio{margin-top:20px}
      .gabit-audio__main{grid-template-columns:1fr auto;gap:13px}
      .gabit-audio__timeline{grid-column:1/-1;grid-row:2}
      .gabit-audio__controls{grid-column:2;grid-row:1}
      .gabit-audio-sticky{width:calc(100vw - 20px);padding:9px 10px 10px;bottom:max(10px,env(safe-area-inset-bottom))}
      .gabit-audio-sticky__controls{grid-template-columns:38px 44px 38px minmax(80px,1fr) 42px;gap:6px}
      .gabit-audio-sticky__head{gap:8px;padding-bottom:7px}
    }
    @media(max-width:420px){
      .gabit-audio__topline{padding:8px 10px;font-size:9px}
      .gabit-audio__main{padding:12px 10px;gap:10px}
      .gabit-audio__play{font-size:10px!important}
      .gabit-audio__controls button{min-width:34px;padding:8px 5px!important;font-size:10px}
      .gabit-audio__play-icon{width:28px;height:28px;flex-basis:28px}
      .gabit-audio-sticky{width:calc(100vw - 16px);padding:8px 8px 9px}
      .gabit-audio-sticky__brand{font-size:8px}
      .gabit-audio-sticky__status{font-size:7px}
      .gabit-audio-sticky__time{font-size:7px}
      .gabit-audio-sticky__controls{grid-template-columns:35px 42px 35px minmax(70px,1fr) 39px;gap:5px;padding-top:8px}
      .gabit-audio-sticky button{height:34px;padding:0 4px;font-size:9px}
    }
  `;
  document.head.appendChild(styles);

  const $ = (selector, root = document) => root.querySelector(selector);
  const playButton = $('[data-audio-play]', player);
  const playIcon = $('.gabit-audio__play-icon', player);
  const playLabel = $('[data-audio-play-label]', player);
  const progress = $('[data-audio-progress]', player);
  const status = $('[data-audio-status]', player);
  const current = $('[data-audio-current]', player);
  const total = $('[data-audio-total]', player);
  const duration = $('[data-audio-duration]', player);
  const backButton = $('[data-audio-back]', player);
  const forwardButton = $('[data-audio-forward]', player);
  const rateButton = $('[data-audio-rate]', player);

  const stickyPlay = $('[data-audio-sticky-play]', sticky);
  const stickyIcon = $('[data-audio-sticky-icon]', sticky);
  const stickyBack = $('[data-audio-sticky-back]', sticky);
  const stickyForward = $('[data-audio-sticky-forward]', sticky);
  const stickyProgress = $('[data-audio-sticky-progress]', sticky);
  const stickyTime = $('[data-audio-sticky-time]', sticky);
  const stickyStatus = $('[data-audio-sticky-status]', sticky);
  const stickyRate = $('[data-audio-sticky-rate]', sticky);

  let rateIndex = 1;
  let hasStarted = false;
  let seeking = false;

  const setProgressVisual = (value) => {
    const pct = Math.max(0, Math.min(100, value / 10));
    progress.value = value;
    stickyProgress.value = value;
    progress.style.setProperty('--gc-audio-progress', `${pct}%`);
    stickyProgress.style.setProperty('--gc-audio-progress', `${pct}%`);
  };

  const syncUI = () => {
    const playing = !audio.paused && !audio.ended;
    playIcon.textContent = playing ? 'Ⅱ' : '▶';
    stickyIcon.textContent = playing ? 'Ⅱ' : '▶';
    playLabel.textContent = playing ? 'PAUSAR' : (hasStarted ? 'CONTINUAR' : 'ESCUCHAR ARTÍCULO');
    status.textContent = audio.ended ? 'TERMINADO' : (playing ? 'REPRODUCIENDO' : (hasStarted ? 'EN PAUSA' : 'LISTO'));
    stickyStatus.textContent = audio.ended ? 'TERMINADO' : (playing ? 'REPRODUCIENDO' : 'EN PAUSA');

    const totalSeconds = Number.isFinite(audio.duration) ? audio.duration : 0;
    const value = totalSeconds > 0 ? Math.round((audio.currentTime / totalSeconds) * 1000) : 0;
    if (!seeking) setProgressVisual(value);
    current.textContent = formatTime(audio.currentTime);
    total.textContent = totalSeconds ? formatTime(totalSeconds) : '--:--';
    duration.textContent = totalSeconds ? formatTime(totalSeconds) : '--:--';
    stickyTime.textContent = `${formatTime(audio.currentTime)} / ${totalSeconds ? formatTime(totalSeconds) : '--:--'}`;
  };

  const persist = () => {
    if (!Number.isFinite(audio.currentTime)) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ time: audio.currentTime, rate: audio.playbackRate })); } catch (_) {}
  };

  const restore = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Number.isFinite(saved.rate) && rates.includes(saved.rate)) {
        audio.playbackRate = saved.rate;
        rateIndex = rates.indexOf(saved.rate);
      }
      if (Number.isFinite(saved.time) && saved.time > 5 && saved.time < audio.duration - 10) {
        audio.currentTime = saved.time;
        hasStarted = true;
      }
    } catch (_) {}
    const rateText = `${rates[rateIndex]}×`.replace('1×','1×');
    rateButton.textContent = rateText;
    stickyRate.textContent = rateText;
    syncUI();
  };

  const toggle = async () => {
    hasStarted = true;
    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      try { await audio.play(); } catch (_) {}
    } else {
      audio.pause();
    }
    syncUI();
  };

  const skip = (seconds) => {
    hasStarted = true;
    const max = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    audio.currentTime = Math.max(0, Math.min(max, audio.currentTime + seconds));
    syncUI();
    persist();
  };

  const cycleRate = () => {
    rateIndex = (rateIndex + 1) % rates.length;
    audio.playbackRate = rates[rateIndex];
    const label = `${rates[rateIndex]}×`;
    rateButton.textContent = label;
    stickyRate.textContent = label;
    persist();
  };

  const seekTo = (input) => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    hasStarted = true;
    audio.currentTime = (Number(input.value) / 1000) * audio.duration;
    seeking = false;
    syncUI();
    persist();
  };

  [playButton, stickyPlay].forEach((button) => button.addEventListener('click', toggle));
  [backButton, stickyBack].forEach((button) => button.addEventListener('click', () => skip(-15)));
  [forwardButton, stickyForward].forEach((button) => button.addEventListener('click', () => skip(15)));
  [rateButton, stickyRate].forEach((button) => button.addEventListener('click', cycleRate));

  [progress, stickyProgress].forEach((input) => {
    input.addEventListener('input', () => {
      seeking = true;
      const value = Number(input.value);
      setProgressVisual(value);
      if (Number.isFinite(audio.duration)) {
        const preview = (value / 1000) * audio.duration;
        if (input === progress) current.textContent = formatTime(preview);
        stickyTime.textContent = `${formatTime(preview)} / ${formatTime(audio.duration)}`;
      }
    });
    input.addEventListener('change', () => seekTo(input));
  });

  audio.addEventListener('loadedmetadata', () => {
    restore();
    syncUI();
  });
  audio.addEventListener('timeupdate', () => {
    syncUI();
    if (Math.floor(audio.currentTime) % 5 === 0) persist();
  });
  audio.addEventListener('play', syncUI);
  audio.addEventListener('pause', () => { syncUI(); persist(); });
  audio.addEventListener('ended', () => { syncUI(); persist(); });
  audio.addEventListener('ratechange', syncUI);
  audio.addEventListener('error', () => {
    status.textContent = 'AUDIO NO DISPONIBLE';
    stickyStatus.textContent = 'ERROR';
  });

  const observer = new IntersectionObserver(([entry]) => {
    sticky.hidden = !hasStarted || entry.isIntersecting;
  }, { threshold: 0.2 });
  observer.observe(player);

  const refreshSticky = () => {
    const rect = player.getBoundingClientRect();
    sticky.hidden = !hasStarted || (rect.bottom > 0 && rect.top < window.innerHeight);
  };
  window.addEventListener('scroll', refreshSticky, { passive: true });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: document.querySelector('.article-hero h1')?.textContent?.trim() || 'Gabit Coinasse Audio',
        artist: 'Gabit Coinasse',
        album: 'Gabit Coinasse Audio'
      });
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => skip(-(details.seekOffset || 15)));
      navigator.mediaSession.setActionHandler('seekforward', (details) => skip(details.seekOffset || 15));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
      });
    } catch (_) {}
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  window.addEventListener('beforeunload', persist);
  syncUI();
})();
