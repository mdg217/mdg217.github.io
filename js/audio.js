/**
 * js/audio.js
 * Sintetizzatore Web Audio API:
 * - Suoni meccanici retrò per il lettore Floppy Disk (PC)
 * - Chime digitali moderni di connessione/disconnessione USB (Smartphone)
 */
window.RetroAudio = (function () {
  let ctx = null;
  let enabled = true;

  function ensureContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function isEnabled() {
    return enabled;
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  function playHover(mode = 'floppy') {
    if (!enabled) return;
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    if (mode === 'usb') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.035);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.045);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    }

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function playInsert(mode = 'floppy') {
    if (!enabled) return;
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime;

    if (mode === 'usb') {
      // Chime digitale ascendente di connessione dispositivo USB (Do5 -> Sol5)
      const notes = [523.25, 783.99];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.11;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.19);
      });
      return;
    }

    // Floppy meccanico: scatto + motore passo-passo
    const clickOsc = audio.createOscillator();
    const clickGain = audio.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(160, now);
    clickOsc.frequency.exponentialRampToValueAtTime(65, now + 0.07);
    clickGain.gain.setValueAtTime(0.09, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    clickOsc.connect(clickGain);
    clickGain.connect(audio.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.08);

    const seekNotes = [240, 310, 270, 340];
    seekNotes.forEach((freq, idx) => {
      const t = now + 0.12 + idx * 0.085;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.12, t + 0.06);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.075);
    });
  }

  function playEject(mode = 'floppy') {
    if (!enabled) return;
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime;

    if (mode === 'usb') {
      // Chime digitale discendente di rimozione sicura USB (Sol5 -> Do5)
      const notes = [783.99, 523.25];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.1;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      });
      return;
    }

    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.11);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.115);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  function playClick() {
    if (!enabled) return;
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  return {
    isEnabled,
    toggle,
    playHover,
    playInsert,
    playEject,
    playClick
  };
})();
