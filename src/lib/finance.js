import { supabase } from './supabaseClient';
import { toISODate } from './agendaConstants';

const num = (v) => (v == null ? 0 : Number(v));

/** Quanto já entrou de fato num agendamento: o valor cheio se está "Pago",
 * metade se está "Pago Sinal 50%" (a Agenda Online só cobra o sinal), ou
 * zero se ainda não pagou nada. */
const collectedAmount = (b) => {
  if (b.payment_status === 'Pago') return num(b.valor);
  if (b.payment_status === 'Pago Sinal 50%') return num(b.valor) / 2;
  return 0;
};

/** Quanto ainda falta receber: o valor cheio se está "Pendente", só a
 * outra metade se já pagou o sinal de 50%. */
const owedAmount = (b) => (b.payment_status === 'Pago Sinal 50%' ? num(b.valor) / 2 : num(b.valor));

/** Busca os agendamentos do período + os que ainda têm saldo a receber (de
 * qualquer data, já que "a receber"/"em atraso" não é limitado ao período em
 * tela) e agrega tudo em JS — mesmo padrão de agregação client-side já usado
 * em getPatientAttendanceStats(). */
export const getFinancialData = async ({ from, to }) => {
  const [periodResult, pendingResult, recentResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, patient_id, service, valor, payment_status, payment_method, booking_date, booking_time, status, patients(name)')
      .gte('booking_date', from)
      .lte('booking_date', to)
      .neq('status', 'cancelado'),
    supabase
      .from('bookings')
      .select('id, valor, booking_date, payment_status')
      .in('payment_status', ['Pendente', 'Pago Sinal 50%'])
      .neq('status', 'cancelado'),
    // "Últimas Entradas" mostra os pagamentos mais recentes de verdade —
    // por criação do agendamento, não pela data do atendimento (que pode
    // ser futura, ex: sinal pago hoje pra uma sessão semana que vem), por
    // isso essa busca não é limitada ao período selecionado no dashboard.
    supabase
      .from('bookings')
      .select('id, service, valor, payment_status, payment_method, booking_date, booking_time, patients(name, phone)')
      .in('payment_status', ['Pago', 'Pago Sinal 50%'])
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  if (periodResult.error) throw periodResult.error;
  if (pendingResult.error) throw pendingResult.error;
  if (recentResult.error) throw recentResult.error;

  const periodBookings = periodResult.data;
  const paid = periodBookings.filter((b) => b.payment_status === 'Pago' || b.payment_status === 'Pago Sinal 50%');

  const faturamentoTotal = paid.reduce((sum, b) => sum + collectedAmount(b), 0);
  const clientesUnicos = new Set(paid.map((b) => b.patient_id)).size;
  const ticketMedio = clientesUnicos ? faturamentoTotal / clientesUnicos : 0;
  const sessoesRealizadas = periodBookings.filter((b) => b.status === 'concluido').length;
  const sessoesPagas = paid.length;

  const byDay = {};
  paid.forEach((b) => {
    byDay[b.booking_date] = (byDay[b.booking_date] || 0) + collectedAmount(b);
  });
  const dailyEntries = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const byMethod = {};
  paid.forEach((b) => {
    const key = b.payment_method || 'Não informado';
    byMethod[key] = (byMethod[key] || 0) + collectedAmount(b);
  });
  const paymentMethods = Object.entries(byMethod)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

  const byService = {};
  paid.forEach((b) => {
    byService[b.service] = (byService[b.service] || 0) + collectedAmount(b);
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

  const recentPayments = recentResult.data.map((b) => ({ ...b, valor: collectedAmount(b) }));

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
