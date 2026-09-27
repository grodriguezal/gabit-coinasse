(() => {
  const TARGET_PATH = '/dinero/tokenizacion-activos-agentes-liquidez/';
  const normalizedPath = `${window.location.pathname.replace(/\/+$/, '')}/`;
  if (normalizedPath !== TARGET_PATH || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

  const articleBody = document.querySelector('.article-body');
  const heroCopy = document.querySelector('.article-hero-copy');
  if (!articleBody || !heroCopy || document.querySelector('[data-gabit-audio]')) return;

  const cleanText = (value = '') => value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

  const readableNodes = Array.from(articleBody.querySelectorAll('h2, p, .takeaway h3'))
    .filter((node) => !node.closest('.article-sources, .article-thread, .content-diagram'))
    .filter((node) => !node.matches('.block-label, .article-disclaimer'));

  const title = cleanText(document.querySelector('.article-hero h1')?.textContent || document.title);
  const deck = cleanText(document.querySelector('.article-deck')?.textContent || '');
  const sections = [title, deck, ...readableNodes.map((node) => cleanText(node.textContent))].filter(Boolean);

  const sentenceChunks = [];
  const MAX_WORDS = 34;
  const splitIntoSentences = (text) => {
    const parts = text.match(/[^.!?¿¡]+[.!?]+|[^.!?¿¡]+$/g) || [text];
    return parts.map(cleanText).filter(Boolean);
  };

  sections.forEach((section) => {
    let buffer = '';
    splitIntoSentences(section).forEach((sentence) => {
      const next = cleanText(`${buffer} ${sentence}`);
      const wordCount = next.split(/\s+/).filter(Boolean).length;
      if (buffer && wordCount > MAX_WORDS) {
        sentenceChunks.push(buffer);
        buffer = sentence;
      } else {
        buffer = next;
      }
    });
    if (buffer) sentenceChunks.push(buffer);
  });

  if (!sentenceChunks.length) return;

  const wordCounts = sentenceChunks.map((chunk) => chunk.split(/\s+/).filter(Boolean).length);
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
  const estimateMinutes = Math.max(1, Math.round(totalWords / 155));
  const rates = [0.9, 1, 1.2, 1.5, 2];

  const player = document.createElement('section');
  player.className = 'gabit-audio';
  player.dataset.gabitAudio = '';
  player.setAttribute('aria-label', 'Reproductor de audio del artículo');
  player.innerHTML = `
    <div class="gabit-audio__topline">
      <span class="gabit-audio__brand">GABIT AUDIO</span>
      <span class="gabit-audio__duration">≈ ${estimateMinutes} MIN</span>
    </div>
    <div class="gabit-audio__main">
      <button class="gabit-audio__play" type="button" aria-label="Escuchar artículo" data-audio-play>
        <span class="gabit-audio__play-icon" aria-hidden="true">▶</span>
        <span data-audio-play-label>ESCUCHAR ARTÍCULO</span>
      </button>
      <div class="gabit-audio__timeline">
        <input data-audio-progress class="gabit-audio__progress" type="range" min="0" max="1000" value="0" aria-label="Progreso del artículo">
        <div class="gabit-audio__status"><span data-audio-status>LISTO</span><span data-audio-percent>0%</span></div>
      </div>
      <div class="gabit-audio__controls">
        <button type="button" data-audio-back aria-label="Retroceder aproximadamente 15 segundos">−15</button>
        <button type="button" data-audio-rate aria-label="Cambiar velocidad">1×</button>
        <button type="button" data-audio-forward aria-label="Avanzar aproximadamente 15 segundos">+15</button>
      </div>
    </div>
    <p class="gabit-audio__note">La voz depende de tu dispositivo. Esta versión de prueba no usa servicios externos.</p>`;

  heroCopy.appendChild(player);

  const sticky = document.createElement('div');
  sticky.className = 'gabit-audio-sticky';
  sticky.hidden = true;
  sticky.innerHTML = `
    <span class="gabit-audio-sticky__brand">GABIT AUDIO</span>
    <button type="button" data-audio-sticky-play aria-label="Reproducir o pausar"><span data-audio-sticky-icon>▶</span></button>
    <div class="gabit-audio-sticky__track"><span data-audio-sticky-bar></span></div>
    <span data-audio-sticky-percent>0%</span>
    <button type="button" data-audio-sticky-rate aria-label="Cambiar velocidad">1×</button>`;
  document.body.appendChild(sticky);

  const styles = document.createElement('style');
  styles.textContent = `
    .gabit-audio{margin-top:24px;border:2px solid var(--ink,#111);background:var(--paper,#f4f0e7);color:var(--ink,#111);font-family:"IBM Plex Mono",monospace}
    .gabit-audio__topline{display:flex;justify-content:space-between;gap:12px;padding:9px 12px;border-bottom:1px solid var(--ink,#111);font-size:10px;font-weight:700;letter-spacing:.09em}
    .gabit-audio__brand{background:var(--yellow,#ffd400);padding:3px 6px;margin:-3px 0}
    .gabit-audio__main{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(170px,1.5fr) auto;gap:16px;align-items:center;padding:15px 12px}
    .gabit-audio button{appearance:none;border:0;background:transparent;color:inherit;font:700 11px/1 "IBM Plex Mono",monospace;cursor:pointer;border-radius:0}
    .gabit-audio button:focus-visible,.gabit-audio-sticky button:focus-visible,.gabit-audio__progress:focus-visible{outline:3px solid var(--yellow,#ffd400);outline-offset:3px}
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
    .gabit-audio__note{margin:0;padding:8px 12px;border-top:1px solid rgba(17,17,17,.2);font:500 9px/1.35 "IBM Plex Mono",monospace;letter-spacing:.02em}
    .gabit-audio-sticky{position:fixed;z-index:1000;left:50%;bottom:14px;transform:translateX(-50%);width:min(640px,calc(100vw - 24px));display:grid;grid-template-columns:auto 38px minmax(90px,1fr) auto auto;gap:10px;align-items:center;padding:9px 10px;background:var(--ink,#111);color:var(--paper,#f4f0e7);border:1px solid var(--paper,#f4f0e7);box-shadow:0 8px 28px rgba(0,0,0,.25);font:700 9px/1 "IBM Plex Mono",monospace;letter-spacing:.04em}
    .gabit-audio-sticky[hidden]{display:none}
    .gabit-audio-sticky__brand{color:var(--yellow,#ffd400);white-space:nowrap}
    .gabit-audio-sticky button{appearance:none;border:1px solid rgba(244,240,231,.5);background:transparent;color:inherit;height:30px;min-width:34px;font:700 10px/1 "IBM Plex Mono",monospace;cursor:pointer;border-radius:0}
    .gabit-audio-sticky button:hover{background:var(--yellow,#ffd400);color:var(--ink,#111);border-color:var(--yellow,#ffd400)}
    .gabit-audio-sticky__track{height:3px;background:rgba(244,240,231,.25);overflow:hidden}
    .gabit-audio-sticky__track span{display:block;height:100%;width:0;background:var(--yellow,#ffd400)}
    @media(max-width:760px){.gabit-audio{margin-top:20px}.gabit-audio__main{grid-template-columns:1fr auto;gap:13px}.gabit-audio__timeline{grid-column:1/-1;grid-row:2}.gabit-audio__controls{grid-column:2;grid-row:1}.gabit-audio__note{font-size:8px}.gabit-audio-sticky{grid-template-columns:auto 36px minmax(70px,1fr) auto}.gabit-audio-sticky__brand{display:none}.gabit-audio-sticky button[data-audio-sticky-rate]{display:none}}
    @media(max-width:420px){.gabit-audio__topline{padding:8px 10px}.gabit-audio__main{padding:12px 10px;gap:10px}.gabit-audio__play{font-size:10px!important}.gabit-audio__controls button{min-width:34px;padding:8px 5px!important;font-size:10px}.gabit-audio__play-icon{width:28px;height:28px;flex-basis:28px}}
  `;
  document.head.appendChild(styles);

  const synth = window.speechSynthesis;
  const playButton = player.querySelector('[data-audio-play]');
  const playIcon = player.querySelector('.gabit-audio__play-icon');
  const playLabel = player.querySelector('[data-audio-play-label]');
  const progress = player.querySelector('[data-audio-progress]');
  const status = player.querySelector('[data-audio-status]');
  const percent = player.querySelector('[data-audio-percent]');
  const backButton = player.querySelector('[data-audio-back]');
  const forwardButton = player.querySelector('[data-audio-forward]');
  const rateButton = player.querySelector('[data-audio-rate]');
  const stickyPlay = sticky.querySelector('[data-audio-sticky-play]');
  const stickyIcon = sticky.querySelector('[data-audio-sticky-icon]');
  const stickyBar = sticky.querySelector('[data-audio-sticky-bar]');
  const stickyPercent = sticky.querySelector('[data-audio-sticky-percent]');
  const stickyRate = sticky.querySelector('[data-audio-sticky-rate]');

  let chunkIndex = 0;
  let rateIndex = 1;
  let isPlaying = false;
  let isPaused = false;
  let generation = 0;
  let selectedVoice = null;
  let hasStarted = false;

  const chooseVoice = () => {
    const voices = synth.getVoices();
    if (!voices.length) return null;
    const preferred = voices.find((voice) => /^es-ES$/i.test(voice.lang) && voice.localService)
      || voices.find((voice) => /^es-ES$/i.test(voice.lang))
      || voices.find((voice) => /^es[-_]/i.test(voice.lang) && voice.localService)
      || voices.find((voice) => /^es[-_]/i.test(voice.lang));
    selectedVoice = preferred || voices[0];
    return selectedVoice;
  };
  chooseVoice();
  if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', chooseVoice, { once: false });

  const progressForIndex = () => Math.round((chunkIndex / sentenceChunks.length) * 1000);
  const updateUi = () => {
    const raw = Math.min(1000, progressForIndex());
    const pct = Math.round(raw / 10);
    progress.value = String(raw);
    progress.style.setProperty('--gc-audio-progress', `${pct}%`);
    percent.textContent = `${pct}%`;
    stickyPercent.textContent = `${pct}%`;
    stickyBar.style.width = `${pct}%`;
    const rateLabel = `${rates[rateIndex]}×`;
    rateButton.textContent = rateLabel;
    stickyRate.textContent = rateLabel;
    playIcon.textContent = isPlaying && !isPaused ? 'Ⅱ' : '▶';
    stickyIcon.textContent = isPlaying && !isPaused ? 'Ⅱ' : '▶';
    playLabel.textContent = hasStarted ? (isPlaying && !isPaused ? 'PAUSAR' : 'CONTINUAR') : 'ESCUCHAR ARTÍCULO';
    status.textContent = !hasStarted ? 'LISTO' : isPaused ? 'EN PAUSA' : isPlaying ? 'REPRODUCIENDO' : chunkIndex >= sentenceChunks.length ? 'TERMINADO' : 'LISTO';
  };

  const speakCurrent = (token = generation) => {
    if (token !== generation || !isPlaying) return;
    if (chunkIndex >= sentenceChunks.length) {
      isPlaying = false;
      isPaused = false;
      chunkIndex = sentenceChunks.length;
      updateUi();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(sentenceChunks[chunkIndex]);
    utterance.lang = selectedVoice?.lang || 'es-ES';
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rates[rateIndex];
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (token !== generation || !isPlaying) return;
      chunkIndex += 1;
      updateUi();
      speakCurrent(token);
    };
    utterance.onerror = (event) => {
      if (token !== generation || event.error === 'canceled' || event.error === 'interrupted') return;
      isPlaying = false;
      isPaused = false;
      status.textContent = 'NO DISPONIBLE';
      updateUi();
    };
    synth.speak(utterance);
  };

  const startFromCurrent = () => {
    generation += 1;
    synth.cancel();
    if (chunkIndex >= sentenceChunks.length) chunkIndex = 0;
    isPlaying = true;
    isPaused = false;
    hasStarted = true;
    chooseVoice();
    updateUi();
    const token = generation;
    window.setTimeout(() => speakCurrent(token), 60);
  };

  const togglePlayback = () => {
    if (!hasStarted || (!isPlaying && !isPaused) || chunkIndex >= sentenceChunks.length) {
      startFromCurrent();
      return;
    }
    if (isPaused) {
      synth.resume();
      isPaused = false;
      isPlaying = true;
    } else {
      synth.pause();
      isPaused = true;
    }
    updateUi();
  };

  const jumpBySeconds = (seconds) => {
    const currentRate = rates[rateIndex];
    const targetWords = Math.round((155 / 60) * Math.abs(seconds) * currentRate);
    let remaining = targetWords;
    let nextIndex = chunkIndex;
    const direction = seconds >= 0 ? 1 : -1;
    while (remaining > 0) {
      const candidate = nextIndex + direction;
      if (candidate < 0 || candidate >= sentenceChunks.length) break;
      nextIndex = candidate;
      remaining -= wordCounts[nextIndex] || 1;
    }
    chunkIndex = Math.max(0, Math.min(sentenceChunks.length - 1, nextIndex));
    if (hasStarted) startFromCurrent();
    else updateUi();
  };

  playButton.addEventListener('click', togglePlayback);
  stickyPlay.addEventListener('click', togglePlayback);
  backButton.addEventListener('click', () => jumpBySeconds(-15));
  forwardButton.addEventListener('click', () => jumpBySeconds(15));
  progress.addEventListener('input', () => {
    const ratio = Number(progress.value) / 1000;
    chunkIndex = Math.min(sentenceChunks.length - 1, Math.floor(ratio * sentenceChunks.length));
    if (hasStarted) startFromCurrent();
    else updateUi();
  });

  const cycleRate = () => {
    rateIndex = (rateIndex + 1) % rates.length;
    if (isPlaying || isPaused) startFromCurrent();
    else updateUi();
  };
  rateButton.addEventListener('click', cycleRate);
  stickyRate.addEventListener('click', cycleRate);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      sticky.hidden = !(hasStarted && !entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(player);
    const revealSticky = () => {
      if (!hasStarted) return;
      const rect = player.getBoundingClientRect();
      sticky.hidden = rect.bottom >= 0 && rect.top <= window.innerHeight;
    };
    playButton.addEventListener('click', () => window.setTimeout(revealSticky, 0));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying && !isPaused) updateUi();
  });
  window.addEventListener('pagehide', () => {
    generation += 1;
    synth.cancel();
  });

  updateUi();
})();
