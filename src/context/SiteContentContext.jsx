import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteContent } from '../lib/siteContent';

const SiteContentContext = createContext({ content: {}, loading: true });

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteContent()
      .then(setContent)
      .catch((err) => console.error('Erro ao carregar conteúdo do site:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
