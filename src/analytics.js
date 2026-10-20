const LIVE_HOSTNAME = 'www.canberraroofkind.com.au';
const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=G-EGMWJKX6M4';

export function isLiveAnalyticsHost(runtime = window) {
  return runtime?.location?.hostname === LIVE_HOSTNAME;
}

function ensureGtag(runtime) {
  runtime.dataLayer = runtime.dataLayer || [];
  if (typeof runtime.gtag !== 'function') {
    runtime.gtag = (...args) => runtime.dataLayer.push(args);
  }
  return runtime.gtag;
}

export function initialiseAnalytics(runtime = window, documentRef = document) {
  if (!isLiveAnalyticsHost(runtime)) return false;

  const gtag = ensureGtag(runtime);
  if (!documentRef.querySelector('script[data-analytics-loader="ga4"]')) {
    const script = documentRef.createElement('script');
    script.async = true;
    script.src = GTAG_SRC;
    script.dataset.analyticsLoader = 'ga4';
    documentRef.head.append(script);
    gtag('js', new Date());
    gtag('config', 'G-EGMWJKX6M4');
  }

  if (!runtime.__ellisAnalyticsClicks) {
    runtime.__ellisAnalyticsClicks = true;
    documentRef.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const breadcrumb = link.closest('nav.breadcrumbs[data-source-path]');
      if (breadcrumb) {
        try {
          const origin = 'https://' + LIVE_HOSTNAME;
          const target = new URL(href, origin);
          const source = new URL(breadcrumb.dataset.sourcePath, origin);
          const owner = breadcrumb.dataset.ownerId ? new URL(breadcrumb.dataset.ownerId, origin) : null;
          const position = Number(link.dataset.breadcrumbPosition);
          if (target.origin === origin && source.origin === origin && Number.isInteger(position) && position > 0) {
            gtag('event', 'breadcrumb_click', { source_path: source.pathname, target_path: target.pathname, locale: source.pathname.startsWith('/zh/') ? 'zh' : 'en', position, owner_id: owner?.origin === origin ? owner.pathname : '' });
          }
        } catch { /* Invalid navigation metadata must not interrupt a real link. */ }
      }
      if (href.startsWith('tel:')) gtag('event', 'phone_click', { contact_method: 'phone' });
      if (href.startsWith('mailto:')) gtag('event', 'email_click', { contact_method: 'email' });
      if (link.classList.contains('contactTop')) gtag('event', 'contact_cta_click', { contact_method: 'contact_cta' });
    });
  }
  return true;
}

export function trackSuccessfulEnquiry(formName, runtime = window) {
  if (!isLiveAnalyticsHost(runtime) || typeof runtime.gtag !== 'function') return false;
  runtime.gtag('event', 'generate_lead', { form_name: formName });
  return true;
}
