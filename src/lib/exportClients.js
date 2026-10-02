const SEPARATOR = ';';

const formatBirthdate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

// Aspas duplas escapam o separador/quebra de linha. Texto livre digitado
// (nome) ganha um apóstrofo na frente se começar com =, +, - ou @, pra o
// Excel não interpretar como fórmula — telefone/CPF não passam por isso
// (um telefone "+55 13..." não pode ser alterado).
const csvCell = (value, { guardFormula = false } = {}) => {
  let text = String(value ?? '').trim();
  if (guardFormula && /^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** Gera e baixa um CSV (separador ";", UTF-8 com BOM — abre certo no Excel
 * em português) com Nome Completo, Data de Nascimento, CPF e Telefone.
 * Cadastros ainda sem nome (ficha não preenchida) ficam de fora. */
export const downloadClientsCsv = (clients) => {
  const rows = clients
    .filter((c) => (c.name || '').trim())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((c) => [c.name, formatBirthdate(c.birthdate), c.cpf, c.phone]);

  const header = ['Nome Completo', 'Data de Nascimento', 'CPF', 'Telefone'];
  const csv = [header, ...rows]
    .map((row) => row.map((cell, i) => csvCell(cell, { guardFormula: i === 0 })).join(SEPARATOR))
    .join('\r\n');

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clientes-mr-laser-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return rows.length;
};
