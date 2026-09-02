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

/** Cards de "Serviços Complementares" da Tabela de Preço pública (ex:
 * Limpeza de Pele, Dreno Relaxante) — cada card tem um título e uma lista
 * de linhas de preço, editáveis pelo painel administrativo. */
export const fetchComplementaryCards = async () => {
  const [cardsRes, itemsRes] = await Promise.all([
    supabase.from('site_complementary_cards').select('*').order('sort_order', { ascending: true }),
    supabase.from('site_complementary_card_items').select('*').order('sort_order', { ascending: true }),
  ]);
  if (cardsRes.error) throw cardsRes.error;
  if (itemsRes.error) throw itemsRes.error;
  return cardsRes.data.map((card) => ({
    ...card,
    items: itemsRes.data.filter((item) => item.card_id === card.id),
  }));
};

export const createComplementaryCard = async (card) => {
  const { data, error } = await supabase.from('site_complementary_cards').insert(card).select().single();
  if (error) throw error;
  return { ...data, items: [] };
};

export const updateComplementaryCard = async (id, fields) => {
  const { error } = await supabase.from('site_complementary_cards').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteComplementaryCard = async (id) => {
  const { error } = await supabase.from('site_complementary_cards').delete().eq('id', id);
  if (error) throw error;
};

export const createComplementaryCardItem = async (item) => {
  const { data, error } = await supabase.from('site_complementary_card_items').insert(item).select().single();
  if (error) throw error;
  return data;
};

export const updateComplementaryCardItem = async (id, fields) => {
  const { error } = await supabase.from('site_complementary_card_items').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteComplementaryCardItem = async (id) => {
  const { error } = await supabase.from('site_complementary_card_items').delete().eq('id', id);
  if (error) throw error;
};

/** O preço de uma linha de card é texto livre ("R$ 480,00 (3x sem juros)")
 * — extrai o valor numérico (primeiro "R$ X,XX" encontrado) pra poder somar
 * no total de um agendamento. */
export const parseComplementaryPrice = (priceText) => {
  const match = String(priceText || '').match(/([\d.]+),(\d{2})/);
  if (!match) return 0;
  return Number(`${match[1].replace(/\./g, '')}.${match[2]}`) || 0;
};

/** Achata os cards de Serviços Complementares em opções de agendamento — uma
 * opção por linha de preço, rotulada só com o título do card quando ele tem
 * uma única linha (ex: "Limpeza de Pele"), ou "Card — Linha" quando tem
 * várias (ex: "Dreno Relaxante — Pacote com 4 sessões"). */
export const flattenComplementaryOptions = (cards) =>
  cards.flatMap((card) =>
    card.items.map((item) => ({
      value: card.items.length === 1 ? card.title : `${card.title} — ${item.label}`,
      price: parseComplementaryPrice(item.price),
    }))
  );
