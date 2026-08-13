import { supabase } from './supabaseClient';

const PHOTOS_BUCKET = 'patient-photos';

export const listRentalClients = async () => {
  const [clientsRes, signaturesRes] = await Promise.all([
    supabase.from('rental_clients').select('*').order('created_at', { ascending: false }),
    supabase.from('rental_document_signatures').select('rental_client_id, signature_data_url, client_name_snapshot, signed_at'),
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (signaturesRes.error) throw signaturesRes.error;

  const signatureByClientId = {};
  (signaturesRes.data || []).forEach((s) => {
    signatureByClientId[s.rental_client_id] = s;
  });

  return clientsRes.data.map((c) => ({ ...c, signature: signatureByClientId[c.id] || null }));
};

export const createRentalClient = async ({
  nome, nascimento, cpf, rua, bairro, cidade, cep, email, telefone,
  dataLocacao, valor, horaInicio, horaFim,
}) => {
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

export const updateRentalClient = async (id, fields) => {
  const { error } = await supabase.from('rental_clients').update(fields).eq('id', id);
  if (error) throw error;
};

export const markRentalContractSent = async (id) => {
  const { error } = await supabase
    .from('rental_clients')
    .update({ contract_sent: true, contract_sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteRentalClient = async (id) => {
  const { error } = await supabase.from('rental_clients').delete().eq('id', id);
  if (error) throw error;
};

/** RPC — página pública de assinatura busca os dados do cliente de locação. */
export const getRentalClientForDocs = async (rentalClientId) => {
  const { data, error } = await supabase.rpc('get_rental_client_for_docs', {
    p_rental_client_id: rentalClientId,
  });
  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

/** RPC — chamado pela página pública ao assinar o contrato de locação. */
export const submitRentalSignature = async (rentalClientId, signatureDataUrl, clientName) => {
  const { error } = await supabase.rpc('submit_rental_signature', {
    p_rental_client_id: rentalClientId,
    p_signature_data_url: signatureDataUrl,
    p_client_name_snapshot: clientName,
  });
  if (error) throw error;
};

/** Chamado pela página pública, logo após assinar, pra enviar a selfie do cliente. */
export const uploadRentalSelfie = async (rentalClientId, file) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `rental/${rentalClientId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { error } = await supabase.rpc('submit_rental_selfie', {
    p_rental_client_id: rentalClientId,
    p_storage_path: path,
  });
  if (error) throw error;
};
