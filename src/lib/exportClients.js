import { downloadCsv, todayStamp } from './csvExport';

const formatBirthdate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

/** CSV com Nome Completo, Data de Nascimento, CPF e Telefone. Cadastros
 * ainda sem nome (ficha não preenchida) ficam de fora. Devolve quantos
 * clientes foram exportados. */
export const downloadClientsCsv = (clients) => {
  const rows = clients
    .filter((c) => (c.name || '').trim())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((c) => [c.name, formatBirthdate(c.birthdate), c.cpf, c.phone]);

  downloadCsv(
    `clientes-mr-laser-${todayStamp()}.csv`,
    ['Nome Completo', 'Data de Nascimento', 'CPF', 'Telefone'],
    rows
  );
  return rows.length;
};
