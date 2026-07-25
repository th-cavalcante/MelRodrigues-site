import { supabase } from './supabaseClient';

/** Painel admin — lista os bloqueios (dia inteiro ou horário específico)
 * num intervalo de datas, mesmo padrão de listBookings(). */
export const listBlockedSlots = async ({ from, to }) => {
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .gte('blocked_date', from)
    .lte('blocked_date', to);
  if (error) throw error;
  return data;
};

export const createBlockedSlot = async ({ date, time, reason }) => {
  const { data, error } = await supabase
    .from('blocked_slots')
    .insert({ blocked_date: date, blocked_time: time || null, reason: reason || null })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBlockedSlot = async (id) => {
  const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
  if (error) throw error;
};

/** RPC pública — Agenda Online consulta os horários bloqueados de um dia
 * (um item com blocked_time null significa que o dia inteiro está bloqueado). */
export const getPublicBlockedSlots = async (date) => {
  const { data, error } = await supabase.rpc('get_blocked_slots', { p_date: date });
  if (error) throw error;
  return data || [];
};

/** RPC pública — dias inteiramente bloqueados num intervalo, pra desabilitar
 * esses dias no seletor de data da Agenda Online. */
export const getPublicBlockedDays = async (from, to) => {
  const { data, error } = await supabase.rpc('get_blocked_days', { p_from: from, p_to: to });
  if (error) throw error;
  return data || [];
};
