import { supabase } from './supabaseClient';
import { toISODate } from './agendaConstants';

const num = (v) => (v == null ? 0 : Number(v));

/** Busca os agendamentos do período + os pendentes de pagamento (de qualquer
 * data, já que "a receber"/"em atraso" não é limitado ao período em tela) e
 * agrega tudo em JS — mesmo padrão de agregação client-side já usado em
 * getPatientAttendanceStats(). */
export const getFinancialData = async ({ from, to }) => {
  const [periodResult, pendingResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, patient_id, service, valor, payment_status, payment_method, booking_date, booking_time, status, patients(name)')
      .gte('booking_date', from)
      .lte('booking_date', to)
      .neq('status', 'cancelado'),
    supabase
      .from('bookings')
      .select('id, valor, booking_date')
      .eq('payment_status', 'Pendente')
      .neq('status', 'cancelado'),
  ]);

  if (periodResult.error) throw periodResult.error;
  if (pendingResult.error) throw pendingResult.error;

  const periodBookings = periodResult.data;
  const paid = periodBookings.filter((b) => b.payment_status === 'Pago');

  const faturamentoTotal = paid.reduce((sum, b) => sum + num(b.valor), 0);
  const clientesUnicos = new Set(paid.map((b) => b.patient_id)).size;
  const ticketMedio = clientesUnicos ? faturamentoTotal / clientesUnicos : 0;
  const sessoesRealizadas = periodBookings.filter((b) => b.status === 'concluido').length;
  const sessoesPagas = paid.length;

  const byDay = {};
  paid.forEach((b) => {
    byDay[b.booking_date] = (byDay[b.booking_date] || 0) + num(b.valor);
  });
  const dailyEntries = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const byMethod = {};
  paid.forEach((b) => {
    const key = b.payment_method || 'Não informado';
    byMethod[key] = (byMethod[key] || 0) + num(b.valor);
  });
  const paymentMethods = Object.entries(byMethod)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

  const byService = {};
  paid.forEach((b) => {
    byService[b.service] = (byService[b.service] || 0) + num(b.valor);
  });
  const topServices = Object.entries(byService)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const today = toISODate(new Date());
  const pending = pendingResult.data;
  const receivables = pending
    .filter((b) => b.booking_date >= today)
    .reduce((sum, b) => sum + num(b.valor), 0);
  const overdue = pending
    .filter((b) => b.booking_date < today)
    .reduce((sum, b) => sum + num(b.valor), 0);

  const recentPayments = paid
    .slice()
    .sort((a, b) => `${b.booking_date}${b.booking_time}`.localeCompare(`${a.booking_date}${a.booking_time}`))
    .slice(0, 10);

  return {
    faturamentoTotal,
    ticketMedio,
    sessoesRealizadas,
    sessoesPagas,
    dailyEntries,
    paymentMethods,
    topServices,
    receivables,
    overdue,
    recentPayments,
  };
};
