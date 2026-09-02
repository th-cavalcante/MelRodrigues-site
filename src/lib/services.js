import { supabase } from './supabaseClient';

/** Tabela de Preço (sessões avulsas de Depilação a Laser), editável pelo
 * painel administrativo ("Gerenciar Site") e compartilhada pela Tabela de
 * Valores (site público) e pelo agendamento (Agenda Online). */
export const fetchLaserServices = async () => {
  const { data, error } = await supabase
    .from('site_services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const priceForService = async (serviceName) => {
  const { data, error } = await supabase
    .from('site_services')
    .select('price')
    .eq('name', serviceName)
    .maybeSingle();
  if (error) throw error;
  return data ? Number(data.price) : null;
};

export const createLaserService = async (service) => {
  const { data, error } = await supabase.from('site_services').insert(service).select().single();
  if (error) throw error;
  return data;
};

export const updateLaserService = async (id, fields) => {
  const { error } = await supabase.from('site_services').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteLaserService = async (id) => {
  const { error } = await supabase.from('site_services').delete().eq('id', id);
  if (error) throw error;
};

/** Serviços Complementares (Limpeza de Pele, Drenagem Linfática etc.), com
 * preço próprio — editável pelo painel ("Tabela de Preço") e usado no
 * agendamento pra entrar na conta junto com os serviços de laser. */
export const fetchComplementaryServices = async () => {
  const { data, error } = await supabase
    .from('complementary_services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createComplementaryService = async (service) => {
  const { data, error } = await supabase.from('complementary_services').insert(service).select().single();
  if (error) throw error;
  return data;
};

export const updateComplementaryService = async (id, fields) => {
  const { error } = await supabase.from('complementary_services').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteComplementaryService = async (id) => {
  const { error } = await supabase.from('complementary_services').delete().eq('id', id);
  if (error) throw error;
};

/** Formata um número (100) como preço em reais no padrão brasileiro ("100,00"). */
export const formatPrice = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? '0,00' : n.toFixed(2).replace('.', ',');
};
