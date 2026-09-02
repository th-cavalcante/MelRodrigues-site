import { supabase } from './supabaseClient';

const PHOTOS_BUCKET = 'patient-photos';

/**
 * Converts a DB patient row (English columns) into the Portuguese-keyed
 * anamnese shape used by fichaPdf.js / documentTemplates.js, which are
 * shared with the patient-facing forms and stay unchanged by this migration.
 */
export const mapDbPatientToAnamnese = (patient) => ({
  nome: patient.name,
  nascimento: patient.birthdate,
  cpf: patient.cpf,
  telefone: patient.phone,
  sexo: patient.sex,
  rua: patient.street,
  bairro: patient.neighborhood,
  cidade: patient.city,
  cep: patient.cep,
  obs: patient.notes,
  fototipo: patient.fototipo,
  answers: patient.clinical_answers,
});

const calcAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const born = new Date(birthdate);
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
};

export const listPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*, document_signatures(doc_key)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return data.map((p) => {
    const hasContrato = (p.document_signatures || []).some((d) => d.doc_key === 'contrato');
    const hasTermo = (p.document_signatures || []).some((d) => d.doc_key === 'termo');
    return { ...p, age: calcAge(p.birthdate), hasContrato, hasTermo };
  });
};

export const getPatient = async (patientId) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', patientId).single();
  if (error) throw error;
  return data;
};

export const createPatientStub = async () => {
  const { data, error } = await supabase.from('patients').insert({}).select().single();
  if (error) throw error;
  return data;
};

/** Cadastro rápido pelo admin — para pacientes que não vão preencher a ficha de anamnese. */
export const createPatient = async ({ nome, nascimento, telefone }) => {
  const { data, error } = await supabase
    .from('patients')
    .insert({ name: nome, birthdate: nascimento || null, phone: telefone })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePatientPhone = async (patientId, telefone) => {
  const { error } = await supabase.from('patients').update({ phone: telefone }).eq('id', patientId);
  if (error) throw error;
};

export const updatePatientFields = async (patientId, fields) => {
  const { error } = await supabase.from('patients').update(fields).eq('id', patientId);
  if (error) throw error;
};

export const deletePatient = async (patientId) => {
  const { error } = await supabase.from('patients').delete().eq('id', patientId);
  if (error) throw error;
};

export const listSessions = async (patientId) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('session_num', { ascending: true });
  if (error) throw error;
  return data;
};

export const createSession = async (patientId, sessionDate) => {
  const existing = await listSessions(patientId);
  const nextNum = existing.length ? Math.max(...existing.map((s) => s.session_num)) + 1 : 1;
  const { data, error } = await supabase
    .from('sessions')
    .insert({ patient_id: patientId, session_num: nextNum, session_date: sessionDate || null, obs: '' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSessionObs = async (sessionId, obs) => {
  const { error } = await supabase.from('sessions').update({ obs }).eq('id', sessionId);
  if (error) throw error;
};

export const deleteSession = async (sessionId) => {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  if (error) throw error;
};

/** RPC — página pública de confirmação busca os dados mínimos da sessão. */
export const getSessionForConfirmation = async (sessionId) => {
  const { data, error } = await supabase.rpc('get_session_for_confirmation', {
    p_session_id: sessionId,
  });
  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

/** RPC — paciente confirma a sessão pelo link público. */
export const confirmSession = async (sessionId) => {
  const { error } = await supabase.rpc('confirm_session', { p_session_id: sessionId });
  if (error) throw error;
};

/** RPC — chamado pela página pública do paciente ao salvar a Ficha de Anamnese. */
export const submitAnamnese = async (patientId, data) => {
  const { error } = await supabase.rpc('submit_anamnese', {
    p_patient_id: patientId,
    p_name: data.nome,
    p_birthdate: data.nascimento || null,
    p_cpf: data.cpf,
    p_phone: data.telefone,
    p_sex: data.sexo,
    p_street: data.rua,
    p_neighborhood: data.bairro,
    p_city: data.cidade,
    p_cep: data.cep,
    p_fototipo: data.fototipo || null,
    p_clinical_answers: data.answers || {},
    p_notes: data.obs,
  });
  if (error) throw error;
};

/** RPC — chamado pela página pública de assinatura pra montar o texto do contrato/termo. */
export const getPatientForDocs = async (patientId) => {
  const { data, error } = await supabase.rpc('get_patient_for_docs', { p_patient_id: patientId });
  if (error) throw error;
  return mapDbPatientToAnamnese(data && data[0] ? data[0] : {});
};

/** RPC — chamado pela página pública ao assinar contrato ou termo. */
export const submitSignature = async (patientId, docKey, signatureDataUrl, patientName) => {
  const { error } = await supabase.rpc('submit_signature', {
    p_patient_id: patientId,
    p_doc_key: docKey,
    p_signature_data_url: signatureDataUrl,
    p_patient_name_snapshot: patientName,
  });
  if (error) throw error;
};

export const listDocumentSignatures = async (patientId) => {
  const { data, error } = await supabase
    .from('document_signatures')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

export const listPatientPhotos = async (patientId) => {
  const { data, error } = await supabase.from('photos').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return data;
};

/** Sobe uma foto pro slot (kind + sessão + posição na galeria, se for o
 * caso) — apaga a foto antiga desse mesmo slot primeiro (storage + linha),
 * senão o app continuava mostrando a foto antiga (buscava a primeira
 * daquele slot, que ficava sendo sempre a original). */
export const uploadPatientPhoto = async (patientId, sessionId, kind, file, galleryIndex = null) => {
  let existingQuery = supabase
    .from('photos')
    .select('id, storage_path')
    .eq('patient_id', patientId)
    .eq('kind', kind);
  existingQuery = sessionId ? existingQuery.eq('session_id', sessionId) : existingQuery.is('session_id', null);
  existingQuery = galleryIndex != null ? existingQuery.eq('gallery_index', galleryIndex) : existingQuery.is('gallery_index', null);
  const { data: existing, error: existingError } = await existingQuery;
  if (existingError) throw existingError;

  if (existing && existing.length > 0) {
    const paths = existing.map((p) => p.storage_path);
    await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
    const { error: deleteError } = await supabase.from('photos').delete().in('id', existing.map((p) => p.id));
    if (deleteError) throw deleteError;
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = sessionId
    ? `${patientId}/sessions/${sessionId}/${kind}-${Date.now()}.${ext}`
    : `${patientId}/${kind}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('photos')
    .insert({ patient_id: patientId, session_id: sessionId || null, kind, storage_path: path, gallery_index: galleryIndex })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Chamado pela página pública, logo após salvar a ficha, pra enviar a selfie do paciente. */
export const uploadPatientSelfie = async (patientId, file) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${patientId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { error } = await supabase.rpc('submit_avatar_photo', {
    p_patient_id: patientId,
    p_storage_path: path,
  });
  if (error) throw error;
};

export const getSignedPhotoUrls = async (paths) => {
  if (!paths.length) return {};
  const { data, error } = await supabase.storage.from(PHOTOS_BUCKET).createSignedUrls(paths, 3600);
  if (error) throw error;
  const map = {};
  data.forEach((entry) => {
    if (entry.path) map[entry.path] = entry.signedUrl;
  });
  return map;
};
