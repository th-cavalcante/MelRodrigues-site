import { supabase } from './supabaseClient';
import { toISODate } from './agendaConstants';
import { getFinancialData } from './finance';

const ACTIVITY_COLORS = {
  Agendamento: '#4C7A5C',
  Documento: '#B08D57',
  Formulário: '#5B6EA6',
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const formatRelativeTime = (isoString) => {
  const then = new Date(isoString);
  const diffMs = Date.now() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} hora${diffH > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffH / 24);
  if (diffDays === 1) return 'ontem';
  return `${diffDays} dias atrás`;
};

const formatTime = (t) => (t ? t.slice(0, 5).replace(':', 'h') : '');

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const formatWhen = (bookingDate, bookingTime) => {
  const today = toISODate(new Date());
  const tomorrow = toISODate(addDays(new Date(), 1));
  const time = formatTime(bookingTime);
  if (bookingDate === today) return `Hoje, ${time}`;
  if (bookingDate === tomorrow) return `Amanhã, ${time}`;
  const weekday = WEEKDAYS[new Date(`${bookingDate}T00:00:00`).getDay()];
  return `${weekday}, ${time}`;
};

const monthPercentTrend = (current, previous) => {
  if (previous === 0) {
    return { trend: current > 0 ? `${current} este mês` : 'Sem dados do mês anterior', positive: current >= 0 };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct >= 0 ? '+' : '';
  return { trend: `${sign}${pct}% vs. mês anterior`, positive: pct >= 0 };
};

export const getDashboardStats = async () => {
  const now = new Date();
  const today = toISODate(now);
  const yesterday = toISODate(addDays(now, -1));
  const in7Days = toISODate(addDays(now, 7));
  const thisMonthStart = toISODate(startOfMonth(now));
  const thisMonthEnd = toISODate(endOfMonth(now));
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = toISODate(startOfMonth(lastMonthDate));
  const lastMonthEnd = toISODate(endOfMonth(lastMonthDate));

  const [
    windowBookings,
    todayBookingsResult,
    recentBookings,
    upcomingBookings,
    recentSignatures,
    recentAnamnese,
    patientsThisMonth,
    patientsLastMonth,
    financeThisMonth,
    financeLastMonth,
  ] = await Promise.all([
    supabase.from('bookings').select('booking_date, status').gte('booking_date', yesterday).lte('booking_date', in7Days),
    supabase
      .from('bookings')
      .select('booking_time, service, patients(name)')
      .eq('booking_date', today)
      .neq('status', 'cancelado')
      .order('booking_time', { ascending: true }),
    supabase.from('bookings').select('created_at, service, patients(name)').order('created_at', { ascending: false }).limit(5),
    supabase
      .from('bookings')
      .select('booking_date, booking_time, service, patients(name)')
      .gte('booking_date', today)
      .not('status', 'in', '("cancelado","concluido")')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })
      .limit(4),
    supabase.from('document_signatures').select('doc_key, signed_at, patients(name)').order('signed_at', { ascending: false }).limit(5),
    supabase
      .from('patients')
      .select('name, updated_at')
      .in('status', ['anamnese_completed', 'active'])
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase.from('patients').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart).lte('created_at', `${thisMonthEnd}T23:59:59`),
    supabase.from('patients').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lte('created_at', `${lastMonthEnd}T23:59:59`),
    getFinancialData({ from: thisMonthStart, to: thisMonthEnd }),
    getFinancialData({ from: lastMonthStart, to: lastMonthEnd }),
  ]);

  if (windowBookings.error) throw windowBookings.error;
  if (todayBookingsResult.error) throw todayBookingsResult.error;
  if (recentBookings.error) throw recentBookings.error;
  if (upcomingBookings.error) throw upcomingBookings.error;
  if (recentSignatures.error) throw recentSignatures.error;
  if (recentAnamnese.error) throw recentAnamnese.error;
  if (patientsThisMonth.error) throw patientsThisMonth.error;
  if (patientsLastMonth.error) throw patientsLastMonth.error;

  const activeBookings = windowBookings.data.filter((b) => b.status !== 'cancelado');
  const proximos7Dias = activeBookings.filter((b) => b.booking_date >= today).length;

  const todayBookings = todayBookingsResult.data.map((b) => ({
    name: b.patients?.name || 'Paciente',
    time: formatTime(b.booking_time),
    service: b.service,
  }));

  const metrics = [
    {
      label: 'Novos Clientes (mês)',
      value: String(patientsThisMonth.count || 0),
      ...monthPercentTrend(patientsThisMonth.count || 0, patientsLastMonth.count || 0),
    },
    {
      label: 'Faturamento do Mês',
      value: `R$ ${financeThisMonth.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ...monthPercentTrend(financeThisMonth.faturamentoTotal, financeLastMonth.faturamentoTotal),
    },
    { label: 'Agendamentos (7 dias)', value: String(proximos7Dias), trend: 'próximos 7 dias', positive: false },
  ];

  const activity = [
    ...recentBookings.data.map((b) => ({
      text: `Novo agendamento — ${b.patients?.name || 'Paciente'}`,
      timestamp: b.created_at,
      badge: 'Agendamento',
    })),
    ...recentSignatures.data.map((s) => ({
      text: `${s.doc_key === 'contrato' ? 'Contrato assinado' : 'Termo assinado'} — ${s.patients?.name || 'Paciente'}`,
      timestamp: s.signed_at,
      badge: 'Documento',
    })),
    ...recentAnamnese.data.map((p) => ({
      text: `Ficha de anamnese preenchida — ${p.name || 'Paciente'}`,
      timestamp: p.updated_at,
      badge: 'Formulário',
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
    .map((a) => ({ ...a, time: formatRelativeTime(a.timestamp), color: ACTIVITY_COLORS[a.badge] }));

  const upcoming = upcomingBookings.data.map((b) => ({
    name: b.patients?.name || 'Paciente',
    when: formatWhen(b.booking_date, b.booking_time),
    service: b.service,
  }));

  return { metrics, activity, upcoming, todayBookings };
};
