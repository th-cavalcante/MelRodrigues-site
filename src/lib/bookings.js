import { supabase } from './supabaseClient';
import { priceForService } from './services';
import { deriveHealthAlert } from './agendaConstants';

export { priceForService };

export const listBookings = async ({ from, to }) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, patients(name, phone, status)')
    .gte('booking_date', from)
    .lte('booking_date', to)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true });
  if (error) throw error;
  return data;
};

export const createBooking = async ({ patient, room, professional, bookingDate, bookingTime, service, valor }) => {
  const existing = await supabase.from('bookings').select('id').eq('patient_id', patient.id);
  if (existing.error) throw existing.error;
  const sessionNum = (existing.data ? existing.data.length : 0) + 1;

  const { healthAlert, healthReason } = deriveHealthAlert(patient);

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      patient_id: patient.id,
      professional,
      room,
      booking_date: bookingDate,
      booking_time: bookingTime,
      service,
      equipment: room.includes('Laser') ? 'Hakon 4D' : '—',
      session_num: sessionNum,
      valor,
      health_alert: healthAlert,
      health_reason: healthReason,
    })
    .select('*, patients(name, phone, status)')
    .single();
  if (error) throw error;
  return data;
};

export const updateBooking = async (bookingId, fields) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(fields)
    .eq('id', bookingId)
    .select('*, patients(name, phone, status)')
    .single();
  if (error) throw error;
  return data;
};

export const getPatientAttendanceStats = async (patientId) => {
  const { data, error } = await supabase.from('bookings').select('status').eq('patient_id', patientId);
  if (error) throw error;
  return {
    faltas: data.filter((b) => b.status === 'faltou').length,
    presencas: data.filter((b) => b.status === 'confirmado' || b.status === 'concluido').length,
  };
};

/** RPC — link genérico da Agenda Online: cria o paciente a partir do nome
 * e celular informados no próprio fluxo (sem admin cadastrar antes). */
export const createPublicPatient = async ({ name, phone }) => {
  const { data, error } = await supabase.rpc('create_public_patient', {
    p_name: name,
    p_phone: phone,
  });
  if (error) throw error;
  return data;
};

/** RPC — tela de sucesso da Agenda Online reconsulta o status real do
 * pagamento (Pix não aprova na hora; a confirmação chega minutos depois
 * via webhook). */
export const getBookingPaymentStatus = async (bookingId) => {
  const { data, error } = await supabase.rpc('get_booking_payment_status', { p_booking_id: bookingId });
  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

/** RPC — página pública de agendamento busca o nome do paciente pro "Olá, ...". */
export const getPatientNameForBooking = async (patientId) => {
  const { data, error } = await supabase.rpc('get_patient_name', { p_patient_id: patientId });
  if (error) throw error;
  return data;
};

/** RPC — horários já ocupados num dia, pra não oferecer ao paciente um horário indisponível. */
export const getBookedTimes = async (date) => {
  const { data, error } = await supabase.rpc('get_booked_times', { p_date: date });
  if (error) throw error;
  return (data || []).map((t) => (typeof t === 'string' ? t.slice(0, 5) : t));
};

/** RPC — paciente confirma o próprio agendamento pelo link público. */
export const createPublicBooking = async ({ patientId, service, bookingDate, bookingTime, notes, paymentMethod }) => {
  const { data, error } = await supabase.rpc('create_public_booking', {
    p_patient_id: patientId,
    p_service: service,
    p_booking_date: bookingDate,
    p_booking_time: bookingTime,
    p_valor: await priceForService(service),
    p_notes: notes || null,
    p_payment_method: paymentMethod || null,
  });
  if (error) throw error;
  return data;
};
