(() => {
  const CONSENT_KEY = 'plastophage_analytics_consent_v1';

  function analyticsAllowed() {
    try {
      return localStorage.getItem(CONSENT_KEY) === 'granted';
    } catch (_) {
      return false;
    }
  }

  function sendEvent(name, params) {
    if (!analyticsAllowed() || typeof window.gtag !== 'function') return;
    window.gtag('event', name, params || {});
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-ga-event]');
    if (!link) return;

    const eventName = link.dataset.gaEvent;
    if (!eventName) return;

    sendEvent(eventName, {
      link_url: link.href,
      link_text: (link.textContent || '').trim().replace(/\s+/g, ' '),
      language: document.documentElement.lang || '',
      placement: link.dataset.gaPlacement || '',
      asin: link.dataset.gaAsin || '',
      format: link.dataset.gaFormat || '',
      marketplace: link.dataset.gaMarketplace || ''
    });
  });
})();
