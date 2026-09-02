import { supabase } from './supabaseClient';
import { toISODate, bookingServiceLabel } from './agendaConstants';

const num = (v) => (v == null ? 0 : Number(v));

/** Quanto ainda falta receber: o valor cheio se está "Pendente", só a
 * outra metade se já pagou o sinal de 50%. */
const owedAmount = (b) => (b.payment_status === 'Pago Sinal 50%' ? num(b.valor) / 2 : num(b.valor));

/** Busca os agendamentos do período + os que ainda têm saldo a receber (de
 * qualquer data, já que "a receber"/"em atraso" não é limitado ao período em
 * tela) e agrega tudo em JS — mesmo padrão de agregação client-side já usado
 * em getPatientAttendanceStats(). Todo agendamento não cancelado entra no
 * faturamento, pago ou não — depilação a laser ou serviço complementar. */
export const getFinancialData = async ({ from, to }) => {
  const [periodResult, pendingResult, recentResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, patient_id, service, complementary_service, valor, payment_status, payment_method, booking_date, booking_time, status, patients(name)')
      .gte('booking_date', from)
      .lte('booking_date', to)
      .neq('status', 'cancelado'),
    supabase
      .from('bookings')
      .select('id, valor, booking_date, payment_status')
      .in('payment_status', ['Pendente', 'Pago Sinal 50%'])
      .neq('status', 'cancelado'),
    // "Últimas Entradas" mostra os agendamentos mais recentes — por
    // criação, não pela data do atendimento (que pode ser futura) — sem
    // filtrar por período nem por status de pagamento.
    supabase
      .from('bookings')
      .select('id, service, complementary_service, valor, payment_status, payment_method, booking_date, booking_time, patients(name, phone)')
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  if (periodResult.error) throw periodResult.error;
  if (pendingResult.error) throw pendingResult.error;
  if (recentResult.error) throw recentResult.error;

  const periodBookings = periodResult.data;
  const paid = periodBookings.filter((b) => b.payment_status === 'Pago' || b.payment_status === 'Pago Sinal 50%');

  const faturamentoTotal = periodBookings.reduce((sum, b) => sum + num(b.valor), 0);
  const clientesUnicos = new Set(periodBookings.map((b) => b.patient_id)).size;
  const ticketMedio = clientesUnicos ? faturamentoTotal / clientesUnicos : 0;
  const sessoesRealizadas = periodBookings.filter((b) => b.status === 'concluido').length;
  const sessoesPagas = paid.length;

  const byDay = {};
  periodBookings.forEach((b) => {
    byDay[b.booking_date] = (byDay[b.booking_date] || 0) + num(b.valor);
  });
  const dailyEntries = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const byMethod = {};
  periodBookings.forEach((b) => {
    const key = b.payment_method || 'Não informado';
    byMethod[key] = (byMethod[key] || 0) + num(b.valor);
  });
  const paymentMethods = Object.entries(byMethod)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

  const byService = {};
  periodBookings.forEach((b) => {
    const key = bookingServiceLabel(b);
    byService[key] = (byService[key] || 0) + num(b.valor);
  });
  const topServices = Object.entries(byService)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const today = toISODate(new Date());
  const pending = pendingResult.data;
  const receivables = pending
    .filter((b) => b.booking_date >= today)
    .reduce((sum, b) => sum + owedAmount(b), 0);
  const overdue = pending
    .filter((b) => b.booking_date < today)
    .reduce((sum, b) => sum + owedAmount(b), 0);

  const recentPayments = recentResult.data.map((b) => ({ ...b, service: bookingServiceLabel(b), valor: num(b.valor) }));

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
