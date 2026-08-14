import { supabase } from './supabaseClient';

const PHOTOS_BUCKET = 'patient-photos';

/** Lista clientes de locação, cada um já com a lista de locações (rental_bookings)
 * e a assinatura de cada uma anexadas, mais recentes primeiro. */
export const listRentalClients = async () => {
  const [clientsRes, bookingsRes, signaturesRes] = await Promise.all([
    supabase.from('rental_clients').select('*').order('created_at', { ascending: false }),
    supabase.from('rental_bookings').select('*').order('rental_date', { ascending: false, nullsFirst: false }),
    supabase
      .from('rental_document_signatures')
      .select('rental_booking_id, signature_data_url, client_name_snapshot, signed_at, signature_id, document_hash, pdf_storage_path')
      .eq('status', 'valid'),
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (signaturesRes.error) throw signaturesRes.error;

  const signatureByBookingId = {};
  (signaturesRes.data || []).forEach((s) => {
    signatureByBookingId[s.rental_booking_id] = s;
  });

  const bookingsByClientId = {};
  (bookingsRes.data || []).forEach((b) => {
    const booking = { ...b, signature: signatureByBookingId[b.id] || null };
    (bookingsByClientId[b.rental_client_id] = bookingsByClientId[b.rental_client_id] || []).push(booking);
  });

  return clientsRes.data.map((c) => ({ ...c, bookings: bookingsByClientId[c.id] || [] }));
};

export const createRentalClient = async ({ nome, nascimento, cpf, rua, bairro, cidade, cep, email, telefone }) => {
  const { data, error } = await supabase
    .from('rental_clients')
    .insert({
      name: nome,
      birthdate: nascimento || null,
      cpf,
      street: rua,
      neighborhood: bairro,
      city: cidade,
      cep,
      email,
      phone: telefone,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRentalClient = async (id, fields) => {
  const { error } = await supabase.from('rental_clients').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteRentalClient = async (id) => {
  const { error } = await supabase.from('rental_clients').delete().eq('id', id);
  if (error) throw error;
};

/** Cria uma nova locação (um mês) pra um cliente já cadastrado. */
export const createRentalBooking = async (rentalClientId, { dataLocacao, valor, horaInicio, horaFim }) => {
  const { data, error } = await supabase
    .from('rental_bookings')
    .insert({
      rental_client_id: rentalClientId,
      rental_date: dataLocacao || null,
      rental_value: valor ? Number(valor) : null,
      rental_start_time: horaInicio || null,
      rental_end_time: horaFim || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRentalBooking = async (id, fields) => {
  const { error } = await supabase.from('rental_bookings').update(fields).eq('id', id);
  if (error) throw error;
};

export const markRentalBookingContractSent = async (id) => {
  const { error } = await supabase
    .from('rental_bookings')
    .update({ contract_sent: true, contract_sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteRentalBooking = async (id) => {
  const { error } = await supabase.from('rental_bookings').delete().eq('id', id);
  if (error) throw error;
};

/** RPC — página pública de assinatura busca os dados da locação (+ cliente). */
export const getRentalBookingForDocs = async (rentalBookingId) => {
  const { data, error } = await supabase.rpc('get_rental_booking_for_docs', {
    p_rental_booking_id: rentalBookingId,
  });
  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

/** URL temporária (60s) pra baixar o PDF assinado guardado no Storage privado. */
export const getSignedDocumentUrl = async (storagePath) => {
  const { data, error } = await supabase.storage.from('signed-documents').createSignedUrl(storagePath, 60);
  if (error) throw error;
  return data.signedUrl;
};

/** Chamado pela página pública, logo após assinar, pra enviar a selfie do cliente. */
export const uploadRentalSelfie = async (rentalBookingId, file) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `rental/${rentalBookingId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { error } = await supabase.rpc('submit_rental_selfie', {
    p_rental_booking_id: rentalBookingId,
    p_storage_path: path,
  });
  if (error) throw error;
};
