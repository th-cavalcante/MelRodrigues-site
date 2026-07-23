import { supabase } from './supabaseClient';

const SITE_IMAGES_BUCKET = 'site-images';

/** Conteúdo editável do site (textos e URLs de imagem) em pares chave/valor,
 * gerenciados pelo painel administrativo em "Gerenciar Site". */
export const fetchSiteContent = async () => {
  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error) throw error;
  const map = {};
  data.forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
};

export const updateSiteContentBulk = async (entries) => {
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
};

export const uploadSiteImage = async (file, slug) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${slug}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/** Pacotes combinados exibidos na Tabela de Preço. */
export const fetchSiteCombos = async () => {
  const { data, error } = await supabase
    .from('site_combos')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createSiteCombo = async (combo) => {
  const { data, error } = await supabase.from('site_combos').insert(combo).select().single();
  if (error) throw error;
  return data;
};

export const updateSiteCombo = async (id, fields) => {
  const { error } = await supabase.from('site_combos').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteSiteCombo = async (id) => {
  const { error } = await supabase.from('site_combos').delete().eq('id', id);
  if (error) throw error;
};

/** Perguntas Frequentes (FAQ). */
export const fetchSiteFaq = async () => {
  const { data, error } = await supabase
    .from('site_faq')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createSiteFaqItem = async (item) => {
  const { data, error } = await supabase.from('site_faq').insert(item).select().single();
  if (error) throw error;
  return data;
};

export const updateSiteFaqItem = async (id, fields) => {
  const { error } = await supabase.from('site_faq').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteSiteFaqItem = async (id) => {
  const { error } = await supabase.from('site_faq').delete().eq('id', id);
  if (error) throw error;
};
