/**
 * js/main.js
 * Controller principale:
 * - Passa automaticamente tra modalità PC (Floppy Disk) e Smartphone (Pennette USB)
 * - Gestisce anteprime hover/tap, animazioni di inserimento, finestra OS con i 3 bottoni e scorciatoie.
 */
(function () {
  const items = window.PORTFOLIO_DATA || [];
  const audio = window.RetroAudio;
  const animator = window.MediaAnimator;

  // Riferimenti DOM generali
  const body = document.body;
  const diskRack = document.getElementById('disk-rack');
  const usbRack = document.getElementById('usb-rack');
  const floppyEjectBtn = document.getElementById('eject-btn');
  const usbEjectBtn = document.getElementById('usb-eject-btn');
  const minimizedBar = document.getElementById('minimized-bar');
  const osHint = document.getElementById('os-hint');
  const modeToggle = document.getElementById('mode-toggle');
  const modeIcon = document.getElementById('mode-icon');
  const modeLabel = document.getElementById('mode-label');
  const sfxToggle = document.getElementById('sfx-toggle');
  const sfxDot = document.getElementById('sfx-dot');
  const sfxLabel = document.getElementById('sfx-label');
  const clockEl = document.getElementById('os-clock');
  const previewActionBtn = document.getElementById('preview-action-btn');

  // Finestra OS
  const backdrop = document.getElementById('window-backdrop');
  const osWindow = document.getElementById('os-window');
  const windowDiskDot = document.getElementById('window-disk-dot');
  const windowFilename = document.getElementById('window-filename');
  const windowTitle = document.getElementById('window-title');
  const windowPath = document.getElementById('window-path');
  const windowMeta = document.getElementById('window-meta');
  const windowBody = document.getElementById('window-body');
  const btnMinimize = document.getElementById('btn-minimize');
  const btnMaximize = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');

  // Stato applicativo
  const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
  let currentMode = mobileMediaQuery.matches ? 'usb' : 'floppy';
  let activeItem = null;
  let previewedItemId = null;
  let isBusy = false;
  let isMinimized = false;
  let isMaximized = false;

  /**
   * Aggiorna l'orologio nella barra superiore.
   */
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Imposta la modalità attiva ('floppy' per PC, 'usb' per Smartphone).
   */
  function applyMode(newMode) {
    currentMode = newMode;
    body.classList.toggle('mode-usb', newMode === 'usb');
    body.classList.toggle('mode-floppy', newMode === 'floppy');

    if (newMode === 'usb') {
      modeIcon.textContent = '🔌';
      modeLabel.textContent = 'USB';
      osHint.textContent = 'Tocca una pennetta USB per collegarla';
    } else {
      modeIcon.textContent = '💾';
      modeLabel.textContent = 'PC';
      osHint.textContent = 'Seleziona un floppy disk o premi 1-5';
    }

    clearPreviewState();
    animator.setHardwareState('idle', null, newMode);
  }

  /**
   * Genera sia i Floppy Disk (PC) sia le Pennette USB (Smartphone).
   */
  function renderMediaRacks() {
    diskRack.innerHTML = '';
    usbRack.innerHTML = '';

    items.forEach((item, index) => {
      // 1. Floppy Disk (Desktop)
      const floppyBtn = document.createElement('button');
      floppyBtn.type = 'button';
      floppyBtn.className = 'floppy-disk';
      floppyBtn.dataset.itemId = item.id;
      floppyBtn.style.setProperty('--disk-color', item.color);
      floppyBtn.style.setProperty('--disk-accent', item.accent);
      floppyBtn.setAttribute('aria-label', `${item.shortName} (${item.filename})`);

      floppyBtn.innerHTML = `
        <div class="disk-shutter" aria-hidden="true">
          <div class="disk-shutter-hole"></div>
        </div>
        <div class="disk-label">
          <div class="disk-label-stripe"></div>
          <div class="disk-label-body">
            <span class="disk-code">${item.code} // [${index + 1}]</span>
            <span class="disk-name">${item.shortName}</span>
            <span class="disk-tag">${item.tag}</span>
          </div>
        </div>
      `;

      floppyBtn.addEventListener('mouseenter', () => {
        if (isBusy || floppyBtn.classList.contains('is-inserted')) return;
        audio.playHover('floppy');
        setPreviewItem(floppyBtn, item);
      });

      floppyBtn.addEventListener('mouseleave', () => {
        clearPreviewState();
      });

      floppyBtn.addEventListener('click', () => {
        handleItemSelect(item);
      });

      diskRack.appendChild(floppyBtn);

      // 2. Pennetta USB (Smartphone)
      const usbBtn = document.createElement('button');
      usbBtn.type = 'button';
      usbBtn.className = 'usb-stick';
      usbBtn.dataset.itemId = item.id;
      usbBtn.style.setProperty('--disk-color', item.color);
      usbBtn.style.setProperty('--disk-accent', item.accent);
      usbBtn.setAttribute('aria-label', `Pennetta USB ${item.shortName} (${item.filename})`);

      usbBtn.innerHTML = `
        <div class="usb-connector" aria-hidden="true">
          <span class="usb-connector-hole"></span>
          <span class="usb-connector-hole"></span>
        </div>
        <div class="usb-body">
          <span class="usb-stick-led" aria-hidden="true"></span>
          <span class="usb-stick-label">${item.shortName}</span>
          <span class="usb-stick-cap">${item.usbCapacity}</span>
        </div>
      `;

      // Su desktop (mouse): hover mostra anteprima, clic inserisce
      usbBtn.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (isBusy || usbBtn.classList.contains('is-inserted')) return;
        audio.playHover('usb');
        setPreviewItem(usbBtn, item);
      });

      usbBtn.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearPreviewState();
      });

      // Su touch (smartphone): primo tap alza la pennetta e mostra anteprima; secondo tap collega
      usbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isBusy || usbBtn.classList.contains('is-inserted')) return;

        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch && previewedItemId !== item.id) {
          audio.playHover('usb');
          setPreviewItem(usbBtn, item);
          return;
        }

        handleItemSelect(item);
      });

      usbRack.appendChild(usbBtn);
    });
  }

  function getActiveMediaElement(itemId) {
    const selector =
      currentMode === 'usb'
        ? `.usb-stick[data-item-id="${itemId}"]`
        : `.floppy-disk[data-item-id="${itemId}"]`;
    return document.querySelector(selector);
  }

  function setPreviewItem(el, item) {
    clearPreviewState();
    previewedItemId = item.id;
    el.classList.add('is-previewed');
    animator.showPreview(el, item, currentMode);
  }

  function clearPreviewState() {
    previewedItemId = null;
    document.querySelectorAll('.is-previewed').forEach((el) => {
      el.classList.remove('is-previewed');
    });
    animator.hidePreview();
  }

  function setAllMediaDisabled(disabled) {
    document.querySelectorAll('.floppy-disk, .usb-stick').forEach((el) => {
      el.classList.toggle('is-disabled', disabled);
    });
  }

  function setEjectButtonsDisabled(disabled) {
    floppyEjectBtn.disabled = disabled;
    usbEjectBtn.disabled = disabled;
  }

  /**
   * Costruisce il contenuto HTML interno della finestra per la sezione scelta.
   */
  function buildWindowContent(item) {
    const c = item.content;

    if (item.type === 'profile') {
      const eduHtml = c.education
        .map(
          (edu) => `
          <div class="timeline-item">
            <div class="timeline-top">
              <span class="timeline-role">${edu.role}</span>
              <span class="timeline-period">${edu.period}</span>
            </div>
            <div class="timeline-org">${edu.org}</div>
            <p class="timeline-desc">${edu.desc}</p>
          </div>`
        )
        .join('');

      return `
        <div class="hero-card">
          <span class="hero-badge">${c.badge}</span>
          <h3 class="hero-name">${c.name}</h3>
          <p class="hero-bio">${c.bio}</p>
        </div>
        <h4 class="section-heading">Formazione Accademica</h4>
        <div class="timeline-list">${eduHtml}</div>
      `;
    }

    if (item.type === 'experience') {
      const expHtml = c.items
        .map(
          (exp) => `
          <div class="timeline-item">
            <div class="timeline-top">
              <span class="timeline-role">${exp.role}</span>
              <span class="timeline-period">${exp.period}</span>
            </div>
            <div class="timeline-org">${exp.org}</div>
            <p class="timeline-desc">${exp.desc}</p>
          </div>`
        )
        .join('');

      return `
        <h4 class="section-heading" style="margin-top:0;">Esperienze Professionali & Ricerca</h4>
        <div class="timeline-list">${expHtml}</div>
      `;
    }

    if (item.type === 'skills') {
      const groupsHtml = c.groups
        .map(
          (group) => `
          <div class="skill-group">
            <h4 class="skill-group-title">${group.title}</h4>
            <div class="skill-tags">
              ${group.tags.map((tag) => `<span class="skill-tag">${tag}</span>`).join('')}
            </div>
          </div>`
        )
        .join('');

      return `
        <h4 class="section-heading" style="margin-top:0;">Competenze Tecniche & Lingue</h4>
        <div class="skills-grid">${groupsHtml}</div>
      `;
    }

    if (item.type === 'publications') {
      const pubsHtml = c.publications
        .map(
          (pub) => `
          <article class="pub-card">
            <div class="pub-meta">
              <span class="pub-venue">${pub.venue}</span>
              <span class="pub-year">${pub.year}</span>
            </div>
            <h4 class="pub-title">${pub.title}</h4>
            <p class="pub-desc">${pub.desc}</p>
          </article>`
        )
        .join('');

      return `
        <h4 class="section-heading" style="margin-top:0;">Ultime Pubblicazioni</h4>
        ${pubsHtml}
        <div style="margin-top:16px;">
          <a href="${c.scholarUrl}" target="_blank" rel="noopener noreferrer" class="action-btn">
            Apri profilo Google Scholar ↗
          </a>
        </div>
      `;
    }

    if (item.type === 'contacts') {
      const contactsHtml = c.contacts
        .map((contact) => {
          let actionHtml = '';
          if (contact.actionType === 'copy') {
            actionHtml = `<button type="button" class="action-btn" data-copy="${contact.copyValue}">Copia</button>`;
          } else if (contact.actionType === 'link') {
            actionHtml = `<a href="${contact.url}" target="_blank" rel="noopener noreferrer" class="action-btn">Apri ↗</a>`;
          }

          return `
            <div class="contact-card">
              <div class="contact-info">
                <div class="contact-label">${contact.label}</div>
                <div class="contact-value" title="${contact.value}">${contact.value}</div>
              </div>
              ${actionHtml}
            </div>`;
        })
        .join('');

      return `
        <h4 class="section-heading" style="margin-top:0;">Canali Diretti & Link</h4>
        <div class="contact-grid">${contactsHtml}</div>
      `;
    }

    return '';
  }

  /**
   * Popola e apre la finestra pop-up interna.
   */
  function openWindow(item) {
    const drivePrefix = currentMode === 'usb' ? 'USB0:\MARCO_DE_GREGORIO\' : 'A:\MARCO_DE_GREGORIO\';
    const fsType = currentMode === 'usb' ? `exFAT // ${item.usbCapacity}` : 'READ-ONLY // FAT12';

    windowDiskDot.style.background = item.color;
    windowFilename.textContent = item.filename;
    windowTitle.textContent = item.previewTitle;
    windowPath.textContent = `${drivePrefix}${item.filename}`;
    windowMeta.textContent = fsType;
    windowBody.innerHTML = buildWindowContent(item);
    windowBody.scrollTop = 0;

    isMinimized = false;
    minimizedBar.innerHTML = '';
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    setEjectButtonsDisabled(false);
  }

  /**
   * Gestisce l'inserimento del Floppy Disk o della Pennetta USB.
   */
  async function handleItemSelect(item) {
    if (isBusy) return;
    if (activeItem && activeItem.id === item.id) {
      if (isMinimized) restoreWindow();
      return;
    }

    isBusy = true;
    clearPreviewState();
    setAllMediaDisabled(true);
    setEjectButtonsDisabled(true);

    // Se un altro supporto è già inserito, lo espelle prima
    if (activeItem) {
      backdrop.classList.remove('is-open');
      minimizedBar.innerHTML = '';
      isMinimized = false;
      const prevEl = getActiveMediaElement(activeItem.id);
      audio.playEject(currentMode);
      await animator.animateEject(prevEl, activeItem, currentMode);
      activeItem = null;
    }

    const mediaEl = getActiveMediaElement(item.id);
    audio.playInsert(currentMode);
    await animator.animateInsert(mediaEl, item, currentMode);

    activeItem = item;
    openWindow(item);

    isBusy = false;
    setAllMediaDisabled(false);
  }

  function minimizeWindow() {
    if (!activeItem) return;
    audio.playClick();
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    isMinimized = true;

    minimizedBar.innerHTML = `
      <button type="button" class="minimized-pill" id="restore-pill" title="Ripristina finestra">
        <span>▣ ${activeItem.filename}</span>
      </button>
    `;

    const restorePill = document.getElementById('restore-pill');
    if (restorePill) {
      restorePill.addEventListener('click', restoreWindow);
    }
  }

  function restoreWindow() {
    if (!activeItem) return;
    audio.playClick();
    isMinimized = false;
    minimizedBar.innerHTML = '';
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function toggleMaximizeWindow() {
    audio.playClick();
    isMaximized = !isMaximized;
    osWindow.classList.toggle('is-maximized', isMaximized);
    btnMaximize.querySelector('span').textContent = isMaximized ? '❐' : '□';
  }

  async function closeAndEject() {
    if (isBusy || !activeItem) return;

    isBusy = true;
    setAllMediaDisabled(true);
    setEjectButtonsDisabled(true);

    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    minimizedBar.innerHTML = '';
    isMinimized = false;

    const itemToEject = activeItem;
    const mediaEl = getActiveMediaElement(itemToEject.id);
    activeItem = null;

    audio.playEject(currentMode);
    await animator.animateEject(mediaEl, itemToEject, currentMode);

    isBusy = false;
    setAllMediaDisabled(false);
  }

  // Pulsante nella card anteprima (comodo su smartphone)
  previewActionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!previewedItemId || isBusy) return;
    const item = items.find((entry) => entry.id === previewedItemId);
    if (item) handleItemSelect(item);
  });

  // Tocco sullo sfondo chiude l'anteprima su smartphone
  document.addEventListener('click', () => {
    if (previewedItemId) {
      clearPreviewState();
    }
  });

  // Eventi finestra e pulsanti Eject
  btnMinimize.addEventListener('click', minimizeWindow);
  btnMaximize.addEventListener('click', toggleMaximizeWindow);
  btnClose.addEventListener('click', closeAndEject);
  floppyEjectBtn.addEventListener('click', closeAndEject);
  usbEjectBtn.addEventListener('click', closeAndEject);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      minimizeWindow();
    }
  });

  // Copia rapida nei contatti
  windowBody.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('button[data-copy]');
    if (!copyBtn) return;

    const text = copyBtn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      audio.playClick();
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copiato!';
      copyBtn.style.background = '#16a34a';
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.style.background = '';
      }, 1500);
    } catch (_) {
      copyBtn.textContent = text;
    }
  });

  // Switch manuale/automatico tra PC (Floppy) e Smartphone (USB)
  modeToggle.addEventListener('click', async () => {
    if (isBusy) return;
    audio.playClick();
    if (activeItem) {
      backdrop.classList.remove('is-open');
      minimizedBar.innerHTML = '';
      isMinimized = false;
      document.querySelectorAll('.is-inserted').forEach((el) => el.classList.remove('is-inserted'));
      activeItem = null;
      setEjectButtonsDisabled(true);
    }
    applyMode(currentMode === 'floppy' ? 'usb' : 'floppy');
  });

  mobileMediaQuery.addEventListener('change', (e) => {
    if (isBusy) return;
    if (activeItem) {
      backdrop.classList.remove('is-open');
      minimizedBar.innerHTML = '';
      isMinimized = false;
      document.querySelectorAll('.is-inserted').forEach((el) => el.classList.remove('is-inserted'));
      activeItem = null;
      setEjectButtonsDisabled(true);
    }
    applyMode(e.matches ? 'usb' : 'floppy');
  });

  // Toggle audio SFX
  sfxToggle.addEventListener('click', () => {
    const isOn = audio.toggle();
    sfxToggle.setAttribute('aria-pressed', String(isOn));
    sfxDot.classList.toggle('muted', !isOn);
    sfxLabel.textContent = isOn ? 'SFX: ON' : 'SFX: OFF';
    if (isOn) audio.playClick();
  });

  // Scorciatoie da tastiera (1-5 ed ESC)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeItem && !isBusy) {
      closeAndEject();
      return;
    }

    if (['1', '2', '3', '4', '5'].includes(e.key) && !isBusy) {
      const idx = Number(e.key) - 1;
      if (items[idx]) {
        handleItemSelect(items[idx]);
      }
    }
  });

  // Inizializzazione
  updateClock();
  setInterval(updateClock, 1000);
  renderMediaRacks();
  applyMode(currentMode);
})();
