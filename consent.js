(() => {
  const MEASUREMENT_ID = 'G-7BGCGB2QS7';
  const STORAGE_KEY = 'plastophage_analytics_consent_v1';
  const lang = (document.documentElement.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';

  const copy = {
    it: {
      title: 'Privacy e statistiche',
      text: 'Usiamo Google Analytics per capire come viene utilizzato il sito. Analytics viene attivato solo se accetti. Puoi cambiare la tua scelta in qualsiasi momento.',
      reject: 'Rifiuta',
      accept: 'Accetta',
      settings: 'Cookie'
    },
    en: {
      title: 'Privacy and analytics',
      text: 'We use Google Analytics to understand how the site is used. Analytics is enabled only if you accept. You can change your choice at any time.',
      reject: 'Reject',
      accept: 'Accept',
      settings: 'Cookies'
    }
  }[lang];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  // Basic Consent Mode: Google tags are not loaded before consent.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(raw => {
      const name = raw.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + location.hostname + '; SameSite=Lax';
      }
    });
  }

  function setChoice(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (_) {}

    if (choice === 'granted') {
      loadAnalytics();
    } else {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      clearAnalyticsCookies();
      if (analyticsLoaded) {
        // Reload so the Google tag is completely removed after consent withdrawal.
        location.reload();
        return;
      }
    }
    hideBanner();
    showSettingsButton();
  }

  function ensureStyles() {
    if (document.getElementById('plst-consent-style')) return;
    const style = document.createElement('style');
    style.id = 'plst-consent-style';
    style.textContent = `
      #plst-consent{position:fixed;z-index:99999;left:18px;right:18px;bottom:18px;max-width:760px;margin:auto;padding:18px 18px 16px;background:rgba(5,13,16,.98);color:#eef7f6;border:1px solid rgba(156,232,228,.38);box-shadow:0 18px 60px rgba(0,0,0,.55);font-family:Inter,Arial,sans-serif;border-radius:8px}
      #plst-consent h2{margin:0 0 7px;font:700 1.15rem/1.2 Inter,Arial,sans-serif;text-transform:none;letter-spacing:0;color:#eef7f6}
      #plst-consent p{margin:0;color:#afbec0;font-size:.86rem;line-height:1.55;max-width:none}
      #plst-consent-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:15px}
      .plst-consent-btn{appearance:none;border:1px solid rgba(156,232,228,.55);border-radius:4px;padding:10px 17px;font:700 .76rem/1 Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
      #plst-consent-reject{background:transparent;color:#dcebea}
      #plst-consent-accept{background:#e4f8f6;color:#071013;border-color:#e4f8f6}
      #plst-cookie-settings{position:fixed;z-index:99998;left:12px;bottom:12px;appearance:none;border:1px solid rgba(156,232,228,.28);border-radius:999px;padding:7px 10px;background:rgba(5,13,16,.88);color:#9ce8e4;font:600 10px/1 Inter,Arial,sans-serif;letter-spacing:.06em;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.28)}
      @media(max-width:560px){#plst-consent{left:10px;right:10px;bottom:10px;padding:16px}#plst-consent-actions{display:grid;grid-template-columns:1fr 1fr}.plst-consent-btn{width:100%;padding:12px 10px}}
    `;
    document.head.appendChild(style);
  }

  function createBanner() {
    ensureStyles();
    if (document.getElementById('plst-consent')) return;
    const box = document.createElement('section');
    box.id = 'plst-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', copy.title);
    box.innerHTML = `
      <h2>${copy.title}</h2>
      <p>${copy.text}</p>
      <div id="plst-consent-actions">
        <button class="plst-consent-btn" id="plst-consent-reject" type="button">${copy.reject}</button>
        <button class="plst-consent-btn" id="plst-consent-accept" type="button">${copy.accept}</button>
      </div>`;
    document.body.appendChild(box);
    document.getElementById('plst-consent-reject').addEventListener('click', () => setChoice('denied'));
    document.getElementById('plst-consent-accept').addEventListener('click', () => setChoice('granted'));
  }

  function hideBanner() {
    const box = document.getElementById('plst-consent');
    if (box) box.remove();
  }

  function showSettingsButton() {
    ensureStyles();
    if (document.getElementById('plst-cookie-settings')) return;
    const btn = document.createElement('button');
    btn.id = 'plst-cookie-settings';
    btn.type = 'button';
    btn.textContent = copy.settings;
    btn.addEventListener('click', () => {
      btn.remove();
      createBanner();
    });
    document.body.appendChild(btn);
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
    if (saved === 'granted') {
      loadAnalytics();
      showSettingsButton();
    } else if (saved === 'denied') {
      showSettingsButton();
    } else {
      createBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
