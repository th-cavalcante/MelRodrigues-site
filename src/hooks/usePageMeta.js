import { useEffect } from 'react';

const SITE_URL = 'https://www.melrodrigues.com.br';

const upsertTag = (selector, tagName, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
};

/** Título, descrição e URL canônica próprios de cada página pública — o site
 * é um SPA, então sem isso todas as páginas apareceriam no Google com o
 * mesmo título/descrição do index.html. */
export const usePageMeta = ({ title, description, path }) => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertTag('meta[name="description"]', 'meta', { name: 'description', content: description });
    upsertTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: url });
    upsertTag('meta[property="og:title"]', 'meta', { property: 'og:title', content: title });
    upsertTag('meta[property="og:description"]', 'meta', { property: 'og:description', content: description });
    upsertTag('meta[property="og:url"]', 'meta', { property: 'og:url', content: url });
  }, [title, description, path]);
};
