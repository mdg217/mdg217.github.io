/**
 * js/animations.js
 * Gestisce le animazioni fisiche sia per i Floppy Disk (modalità PC)
 * sia per le Pennette USB (modalità Smartphone).
 */
window.MediaAnimator = (function () {
  // Card anteprima condivisa
  const previewCard = document.getElementById('disk-preview');
  const previewFile = document.getElementById('preview-file');
  const previewSize = document.getElementById('preview-size');
  const previewTitle = document.getElementById('preview-title');
  const previewText = document.getElementById('preview-text');
  const previewActionBtn = document.getElementById('preview-action-btn');

  // Riferimenti Floppy Drive (PC)
  const driveSlot = document.getElementById('drive-slot');
  const insertedTab = document.getElementById('inserted-disk-tab');
  const driveLed = document.getElementById('drive-led');
  const lcdStatus = document.getElementById('lcd-status');
  const lcdSector = document.getElementById('lcd-sector');
  const lcdMessage = document.getElementById('lcd-message');

  // Riferimenti USB Hub (Smartphone)
  const usbPortSlot = document.getElementById('usb-port-slot');
  const pluggedUsbStick = document.getElementById('plugged-usb-stick');
  const pluggedUsbName = document.getElementById('plugged-usb-name');
  const usbLedBar = document.getElementById('usb-led-bar');
  const usbOledStatus = document.getElementById('usb-oled-status');
  const usbOledSpeed = document.getElementById('usb-oled-speed');
  const usbOledMessage = document.getElementById('usb-oled-message');

  let sectorTimer = null;

  /**
   * Mostra il riquadro di anteprima al passaggio del cursore (PC) o al primo tap (Smartphone).
   */
  function showPreview(itemEl, itemData, mode = 'floppy') {
    if (!previewCard || !itemEl || !itemData) return;

    previewFile.textContent = itemData.filename;
    previewSize.textContent = mode === 'usb' ? itemData.usbCapacity : itemData.size;
    previewTitle.textContent = itemData.previewTitle;
    previewText.textContent = itemData.previewText;
    previewActionBtn.textContent =
      mode === 'usb'
        ? 'Collega nella porta USB →'
        : 'Clicca per inserire nel lettore →';

    const rect = itemEl.getBoundingClientRect();
    const cardWidth = Math.min(290, window.innerWidth * 0.9);
    const margin = 12;

    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, left));

    const cardHeight = 148;
    const top = Math.max(46, rect.top - cardHeight - 10);

    previewCard.style.left = `${left}px`;
    previewCard.style.top = `${top}px`;
    previewCard.classList.add('visible');
    previewCard.setAttribute('aria-hidden', 'false');
  }

  function hidePreview() {
    if (!previewCard) return;
    previewCard.classList.remove('visible');
    previewCard.setAttribute('aria-hidden', 'true');
  }

  /**
   * Aggiorna i display e i LED di Floppy Drive e USB Hub.
   */
  function setHardwareState(state, itemData, mode = 'floppy') {
    clearInterval(sectorTimer);

    if (mode === 'usb') {
      if (state === 'idle') {
        usbLedBar.className = 'usb-hub-led-bar';
        pluggedUsbStick.classList.remove('visible');
        usbOledStatus.textContent = 'USB 3.2 READY';
        usbOledSpeed.textContent = '10 GBPS';
        usbOledMessage.textContent = 'COLLEGA UNA PENNETTA USB...';
        return;
      }

      if (state === 'reading' && itemData) {
        usbLedBar.className = 'usb-hub-led-bar reading';
        usbOledStatus.textContent = 'MOUNTING VOLUME';
        usbOledSpeed.textContent = itemData.usbCapacity;
        usbOledMessage.textContent = `LETTURA ${itemData.filename}...`;
        return;
      }

      if (state === 'active' && itemData) {
        usbLedBar.className = 'usb-hub-led-bar active';
        pluggedUsbStick.style.setProperty('--plugged-color', itemData.color);
        pluggedUsbName.textContent = itemData.shortName;
        pluggedUsbStick.classList.add('visible');
        usbOledStatus.textContent = 'CONNECTED // OTG';
        usbOledSpeed.textContent = itemData.usbCapacity;
        usbOledMessage.textContent = `USB0:\${itemData.filename}`;
      }
      return;
    }

    // Modalità Floppy (PC)
    if (state === 'idle') {
      driveLed.className = 'drive-led';
      driveSlot.classList.remove('is-open');
      insertedTab.classList.remove('visible');
      lcdStatus.textContent = 'READY';
      lcdSector.textContent = 'TRK:00 SEC:00';
      lcdMessage.textContent = 'INSERISCI UN DISCHETTO...';
      return;
    }

    if (state === 'reading' && itemData) {
      driveLed.className = 'drive-led reading';
      lcdStatus.textContent = 'LOADING';
      lcdMessage.textContent = `LETTURA ${itemData.filename}...`;

      let step = 1;
      sectorTimer = setInterval(() => {
        const trk = String(step * 12).padStart(2, '0');
        const sec = String((step * 7) % 18 + 1).padStart(2, '0');
        lcdSector.textContent = `TRK:${trk} SEC:${sec}`;
        step++;
      }, 90);
      return;
    }

    if (state === 'active' && itemData) {
      driveLed.className = 'drive-led active';
      driveSlot.classList.add('is-open');
      insertedTab.style.background = itemData.color;
      insertedTab.classList.add('visible');
      lcdStatus.textContent = 'MOUNTED';
      lcdSector.textContent = 'TRK:79 SEC:18';
      lcdMessage.textContent = `A:\>${itemData.filename}`;
    }
  }

  /**
   * Anima l'inserimento del Floppy Disk nel lettore PC.
   */
  async function animateFloppyInsert(diskEl, diskData) {
    hidePreview();

    const startRect = diskEl.getBoundingClientRect();
    const slotRect = driveSlot.getBoundingClientRect();

    const clone = diskEl.cloneNode(true);
    clone.classList.remove('is-previewed');
    clone.classList.add('flying-disk-clone');
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    document.body.appendChild(clone);

    diskEl.classList.add('is-inserted');

    const deltaX = (slotRect.left + slotRect.width / 2) - (startRect.left + startRect.width / 2);
    const deltaY = (slotRect.top + slotRect.height / 2) - (startRect.top + startRect.height / 2);

    const moveAnim = clone.animate(
      [
        {
          transform: 'translate3d(0, 0, 0) scale(1) perspective(700px) rotateX(0deg)',
          opacity: 1
        },
        {
          transform: `translate3d(${deltaX * 0.5}px, ${deltaY - 26}px, 0) scale(1.06) perspective(700px) rotateX(18deg)`,
          opacity: 1,
          offset: 0.55
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY + 14}px, 0) scale(0.92, 0.72) perspective(700px) rotateX(48deg)`,
          opacity: 1
        }
      ],
      {
        duration: 450,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    );

    await moveAnim.finished;

    driveSlot.classList.add('is-open');
    setHardwareState('reading', diskData, 'floppy');

    const slideInAnim = clone.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY + 14}px, 0) scale(0.92, 0.72) perspective(700px) rotateX(48deg)`,
          opacity: 1
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY - 18}px, 0) scale(0.88, 0.16) perspective(700px) rotateX(68deg)`,
          opacity: 0
        }
      ],
      {
        duration: 230,
        easing: 'ease-in',
        fill: 'forwards'
      }
    );

    await slideInAnim.finished;
    clone.remove();

    insertedTab.style.background = diskData.color;
    insertedTab.classList.add('visible');

    await new Promise((resolve) => setTimeout(resolve, 240));
    setHardwareState('active', diskData, 'floppy');
  }

  /**
   * Anima l'espulsione del Floppy Disk dal lettore PC.
   */
  async function animateFloppyEject(diskEl, diskData) {
    if (!diskEl || !diskData) {
      setHardwareState('idle', null, 'floppy');
      return;
    }

    insertedTab.classList.remove('visible');

    const targetRect = diskEl.getBoundingClientRect();
    const slotRect = driveSlot.getBoundingClientRect();

    const clone = diskEl.cloneNode(true);
    clone.classList.remove('is-inserted', 'is-previewed');
    clone.classList.add('flying-disk-clone');
    clone.style.left = `${targetRect.left}px`;
    clone.style.top = `${targetRect.top}px`;
    clone.style.width = `${targetRect.width}px`;
    clone.style.height = `${targetRect.height}px`;
    document.body.appendChild(clone);

    const deltaX = (slotRect.left + slotRect.width / 2) - (targetRect.left + targetRect.width / 2);
    const deltaY = (slotRect.top + slotRect.height / 2) - (targetRect.top + targetRect.height / 2);

    const ejectAnim = clone.animate(
      [
        {
          transform: `translate3d(${deltaX}px, ${deltaY - 12}px, 0) scale(0.88, 0.2) perspective(700px) rotateX(65deg)`,
          opacity: 0.2
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY + 24}px, 0) scale(0.95, 0.85) perspective(700px) rotateX(32deg)`,
          opacity: 1,
          offset: 0.35
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1) perspective(700px) rotateX(0deg)',
          opacity: 1
        }
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    );

    await ejectAnim.finished;
    clone.remove();
    diskEl.classList.remove('is-inserted');
    setHardwareState('idle', null, 'floppy');
  }

  /**
   * Anima l'innesto della Pennetta USB nella porta inferiore dell'Hub Smartphone.
   */
  async function animateUsbInsert(usbEl, usbData) {
    hidePreview();

    const startRect = usbEl.getBoundingClientRect();
    const portRect = usbPortSlot.getBoundingClientRect();

    const clone = usbEl.cloneNode(true);
    clone.classList.remove('is-previewed');
    clone.classList.add('flying-disk-clone');
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    document.body.appendChild(clone);

    usbEl.classList.add('is-inserted');

    // Il connettore metallico superiore deve allinearsi esattamente sotto la porta USB
    const deltaX = (portRect.left + portRect.width / 2) - (startRect.left + startRect.width / 2);
    const deltaYApproach = (portRect.bottom + 14) - startRect.top;
    const deltaYPlugged = (portRect.bottom - 18) - startRect.top;

    // Fase 1: Avvicinamento sotto la porta USB
    const approachAnim = clone.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { transform: `translate3d(${deltaX}px, ${deltaYApproach}px, 0) scale(0.92)`, opacity: 1 }
      ],
      {
        duration: 380,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    );

    await approachAnim.finished;

    // Fase 2: Innesto deciso del connettore nella porta USB
    setHardwareState('reading', usbData, 'usb');

    const plugAnim = clone.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaYApproach}px, 0) scale(0.92)`, opacity: 1 },
        { transform: `translate3d(${deltaX}px, ${deltaYPlugged}px, 0) scale(0.9)`, opacity: 0.1 }
      ],
      {
        duration: 180,
        easing: 'ease-out',
        fill: 'forwards'
      }
    );

    await plugAnim.finished;
    clone.remove();

    setHardwareState('active', usbData, 'usb');
    await new Promise((resolve) => setTimeout(resolve, 260));
  }

  /**
   * Anima la disconnessione della Pennetta USB dall'Hub verso il dock inferiore.
   */
  async function animateUsbEject(usbEl, usbData) {
    if (!usbEl || !usbData) {
      setHardwareState('idle', null, 'usb');
      return;
    }

    pluggedUsbStick.classList.remove('visible');

    const targetRect = usbEl.getBoundingClientRect();
    const portRect = usbPortSlot.getBoundingClientRect();

    const clone = usbEl.cloneNode(true);
    clone.classList.remove('is-inserted', 'is-previewed');
    clone.classList.add('flying-disk-clone');
    clone.style.left = `${targetRect.left}px`;
    clone.style.top = `${targetRect.top}px`;
    clone.style.width = `${targetRect.width}px`;
    clone.style.height = `${targetRect.height}px`;
    document.body.appendChild(clone);

    const deltaX = (portRect.left + portRect.width / 2) - (targetRect.left + targetRect.width / 2);
    const deltaYPlugged = (portRect.bottom - 14) - targetRect.top;
    const deltaYUnplug = (portRect.bottom + 18) - targetRect.top;

    const ejectAnim = clone.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaYPlugged}px, 0) scale(0.9)`, opacity: 0.4 },
        { transform: `translate3d(${deltaX}px, ${deltaYUnplug}px, 0) scale(0.94)`, opacity: 1, offset: 0.32 },
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 }
      ],
      {
        duration: 400,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    );

    await ejectAnim.finished;
    clone.remove();
    usbEl.classList.remove('is-inserted');
    setHardwareState('idle', null, 'usb');
  }

  return {
    showPreview,
    hidePreview,
    setHardwareState,
    animateInsert: (el, data, mode) =>
      mode === 'usb' ? animateUsbInsert(el, data) : animateFloppyInsert(el, data),
    animateEject: (el, data, mode) =>
      mode === 'usb' ? animateUsbEject(el, data) : animateFloppyEject(el, data)
  };
})();
