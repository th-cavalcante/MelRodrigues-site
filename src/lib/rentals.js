import { supabase } from './supabaseClient';

export const listRentalClients = async () => {
  const { data, error } = await supabase
    .from('rental_clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createRentalClient = async ({
  nome, nascimento, cpf, rua, bairro, cidade, cep, email, telefone,
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
