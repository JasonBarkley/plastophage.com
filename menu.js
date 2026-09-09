(() => {
  const LANG = (document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
  const LABEL = {
    it: { open: 'Apri il menu di navigazione', close: 'Chiudi il menu di navigazione' },
    en: { open: 'Open navigation menu', close: 'Close navigation menu' }
  }[LANG];

  function init() {
    const header = document.querySelector('header.nav');
    if (!header || header.dataset.menuReady) return;

    const nav = header.querySelector('nav');
    if (!nav) return;

    // Solo i link di sezione/pagina: le pill IT/EN (.lang) restano nella barra.
    const links = Array.from(nav.children).filter(el => el.tagName === 'A');
    if (!links.length) return;

    header.dataset.menuReady = '1';

    // Raggruppa i link in un pannello a tendina.
    // Su desktop il wrapper è display:contents, quindi il layout non cambia.
    const panel = document.createElement('div');
    panel.className = 'nav-links';
    panel.id = 'nav-menu';
    nav.insertBefore(panel, nav.firstChild);
    links.forEach(a => panel.appendChild(a));

    // Pulsante hamburger.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-controls', 'nav-menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', LABEL.open);
    btn.innerHTML = '<span class="nav-toggle-box" aria-hidden="true"><span></span><span></span><span></span></span>';
    nav.insertBefore(btn, panel);

    let open = false;

    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') setOpen(false, true);
    }

    function onOutside(e) {
      if (!header.contains(e.target)) setOpen(false, false);
    }

    function setOpen(next, restoreFocus) {
      if (next === open) return;
      open = next;
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? LABEL.close : LABEL.open);

      if (open) {
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onOutside, true);
      } else {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('click', onOutside, true);
        if (restoreFocus) btn.focus();
      }
    }

    btn.addEventListener('click', () => setOpen(!open, false));

    // Chiudi dopo aver scelto una voce (es. ancore in homepage).
    panel.addEventListener('click', e => {
      if (e.target.closest('a')) setOpen(false, false);
    });

    // Chiudi tornando al layout desktop.
    const desktop = window.matchMedia('(min-width: 981px)');
    const onChange = e => { if (e.matches) setOpen(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
