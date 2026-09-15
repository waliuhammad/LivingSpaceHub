import { useEffect } from 'react';

const SITE_NAME = 'Living Space Hub';
const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const DEFAULT_DESCRIPTION =
  'Living Space Hub — Curated premium home decor and lifestyle pieces. Elegant furniture, artisanal accents, and sustainable design for modern homes.';

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-page title, description, canonical URL, social share tags and optional JSON-LD.
 * Google renders JavaScript, so these are picked up when the page is indexed.
 */
export default function useSeo({ title, description, image, path, noindex = false, jsonLd } = {}) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Premium Home Decor`;
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').slice(0, 160);
    const url = SITE_URL ? `${SITE_URL}${path ?? window.location.pathname}` : '';

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', jsonLdString.includes('"Product"') ? 'product' : 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image || '');
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setLink('canonical', noindex ? '' : url);

    let script = document.getElementById('page-jsonld');
    if (jsonLdString) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdString;
    } else {
      script?.remove();
    }
  }, [title, description, image, path, noindex, jsonLdString]);
}
