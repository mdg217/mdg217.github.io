/**
 * js/mascot.js
 * Gestisce la mascotte interattiva Game Boy (Marco Boy) e il suo fumetto guida:
 * - Adatta automaticamente i consigli tra modalità PC (Floppy) e Smartphone (USB)
 * - Reagisce all'inserimento ed espulsione dei supporti
 * - Supporta bottoni fisici (A = avanti, D-Pad = indietro, B / _ = riduci/espandi).
 */
window.GameBoyMascot = (function () {
  const audio = window.RetroAudio;

  const mascotEl = document.getElementById('gb-mascot');
  const deviceEl = document.getElementById('gb-device');
  const bubbleEl = document.getElementById('gb-bubble');
  const bubbleTag = document.getElementById('gb-bubble-tag');
  const bubbleText = document.getElementById('gb-bubble-text');
  const btnNext = document.getElementById('gb-bubble-next');
  const btnHide = document.getElementById('gb-bubble-hide');
  const btnA = document.getElementById('gb-btn-a');
  const btnB = document.getElementById('gb-btn-b');
  const btnDpad = document.getElementById('gb-dpad');

  const TIPS_BY_MODE = {
    floppy: [
      'Ciao! Clicca su un floppy disk qui sotto per inserirlo nel lettore e aprire le sezioni.',
      'Passa il cursore su un dischetto per vedere l’anteprima, oppure premi i tasti 1-5 da tastiera.',
      'Usa i 3 bottoni nella finestra per ridurre (_), ingrandire (□) o chiudere ed espellere (×).',
      'Puoi anche cliccare il tasto EJECT sul lettore o premere ESC per estrarre il floppy!'
    ],
    usb: [
      'Ciao! Tocca una pennetta USB qui sotto per collegarla all’hub e aprire le sezioni.',
      'Fai un primo tap su una pennetta USB per l’anteprima, poi un secondo tap per collegarla!',
      'Usa i 3 bottoni della finestra per ridurre (_), ingrandire (□) o chiudere ed espellere (×).',
      'Puoi scollegare la pennetta in ogni momento con il pulsante EJECT sull’hub USB.'
    ]
  };

  let currentMode = 'floppy';
  let tipIndex = 0;
  let typingTimer = null;
  let fullCurrentMessage = '';
  let isTyping = false;
  let isCollapsed = false;

  /**
   * Scrive il testo nel fumetto con effetto macchina da scrivere e animazione bocca.
   */
  function speak(text, tagLabel, excited) {
    if (!mascotEl || !bubbleText) return;

    clearInterval(typingTimer);
    fullCurrentMessage = text;
    isTyping = true;

    if (tagLabel && bubbleTag) {
      bubbleTag.textContent = tagLabel;
    }

    mascotEl.classList.add('is-talking');
    mascotEl.classList.toggle('is-excited', Boolean(excited));

    if (excited) {
      setTimeout(() => {
        mascotEl.classList.remove('is-excited');
      }, 950);
    }

    bubbleText.textContent = '';
    let charIdx = 0;

    typingTimer = setInterval(() => {
      charIdx++;
      bubbleText.textContent = fullCurrentMessage.slice(0, charIdx);

      if (charIdx >= fullCurrentMessage.length) {
        finishTyping();
      }
    }, 20);
  }

  function finishTyping() {
    clearInterval(typingTimer);
    isTyping = false;
    if (bubbleText) {
      bubbleText.textContent = fullCurrentMessage;
    }
    if (mascotEl) {
      mascotEl.classList.remove('is-talking');
    }
  }

  function showTip(index, withSound) {
    const tips = TIPS_BY_MODE[currentMode] || TIPS_BY_MODE.floppy;
    tipIndex = ((index % tips.length) + tips.length) % tips.length;
    const label = `GUIDE // TIP ${tipIndex + 1}/${tips.length}`;
    if (withSound && audio && audio.playGameBoyBlip) {
      audio.playGameBoyBlip('next');
    }
    speak(tips[tipIndex], label, false);
  }

  function nextTip() {
    if (isCollapsed) {
      setCollapsed(false);
    }
    if (isTyping) {
      finishTyping();
      return;
    }
    showTip(tipIndex + 1, true);
  }

  function prevTip() {
    if (isCollapsed) {
      setCollapsed(false);
    }
    if (isTyping) {
      finishTyping();
      return;
    }
    if (audio && audio.playGameBoyBlip) {
      audio.playGameBoyBlip('prev');
    }
    const tips = TIPS_BY_MODE[currentMode] || TIPS_BY_MODE.floppy;
    tipIndex = ((tipIndex - 1) % tips.length + tips.length) % tips.length;
    speak(tips[tipIndex], `GUIDE // TIP ${tipIndex + 1}/${tips.length}`, false);
  }

  function setCollapsed(collapsed) {
    isCollapsed = collapsed;
    if (!mascotEl) return;
    mascotEl.classList.toggle('is-collapsed', isCollapsed);
    if (!isCollapsed && audio && audio.playGameBoyBlip) {
      audio.playGameBoyBlip('boot');
    } else if (audio) {
      audio.playClick();
    }
  }

  function setMode(mode) {
    currentMode = mode === 'usb' ? 'usb' : 'floppy';
    tipIndex = 0;
    const tips = TIPS_BY_MODE[currentMode];
    speak(tips[0], `GUIDE // TIP 1/${tips.length}`, true);
  }

  function onMediaInserted(item, mode) {
    if (!item) return;
    const medium = mode === 'usb' ? 'la pennetta USB' : 'il floppy';
    speak(
      `Ottimo! Ho caricato ${medium} «${item.shortName}» (${item.filename}).`,
      'STATUS // LOADED',
      true
    );
  }

  function onMediaEjected(mode) {
    const medium = mode === 'usb' ? 'una pennetta USB' : 'un floppy disk';
    speak(
      `Supporto espulso! Clicca su ${medium} qui sotto per aprire un'altra sezione.`,
      'STATUS // READY',
      false
    );
  }

  function init(initialMode) {
    if (!mascotEl) return;

    currentMode = initialMode === 'usb' ? 'usb' : 'floppy';

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextTip();
      });
    }

    if (btnA) {
      btnA.addEventListener('click', (e) => {
        e.stopPropagation();
        nextTip();
      });
    }

    if (btnDpad) {
      btnDpad.addEventListener('click', (e) => {
        e.stopPropagation();
        prevTip();
      });
    }

    if (btnB) {
      btnB.addEventListener('click', (e) => {
        e.stopPropagation();
        setCollapsed(!isCollapsed);
      });
    }

    if (btnHide) {
      btnHide.addEventListener('click', (e) => {
        e.stopPropagation();
        setCollapsed(true);
      });
    }

    if (bubbleText) {
      bubbleText.addEventListener('click', (e) => {
        e.stopPropagation();
        nextTip();
      });
    }

    if (deviceEl) {
      deviceEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isCollapsed) {
          setCollapsed(false);
        }
      });
    }

    if (bubbleEl) {
      bubbleEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    showTip(0, false);
  }

  return {
    init,
    setMode,
    onMediaInserted,
    onMediaEjected,
    nextTip
  };
})();
