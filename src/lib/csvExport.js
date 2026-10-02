const SEPARATOR = ';';

// Aspas duplas escapam o separador/quebra de linha. Texto livre digitado
// (nome) ganha um apóstrofo na frente se começar com =, +, - ou @, pra o
// Excel não interpretar como fórmula — telefone/CPF/preço não passam por
// isso (um telefone "+55 13..." não pode ser alterado).
const csvCell = (value, { guardFormula = false } = {}) => {
  let text = String(value ?? '').trim();
  if (guardFormula && /^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** Baixa um CSV (separador ";", UTF-8 com BOM — abre certo no Excel em
 * português). A coluna guardFormulaColumn (índice) recebe a proteção
 * contra fórmula. */
export const downloadCsv = (filename, header, rows, guardFormulaColumn = 0) => {
  const csv = [header, ...rows]
    .map((row) => row.map((cell, i) => csvCell(cell, { guardFormula: i === guardFormulaColumn })).join(SEPARATOR))
    .join('\r\n');

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Número -> "1200,50": decimal com vírgula e sem separador de milhar, pra
 * não ter ambiguidade ao importar em outro sistema. Vazio se não for número. */
export const formatDecimalBr = (value) => {
  if (value == null || value === '') return '';
  const n = Number(value);
  return Number.isNaN(n) ? '' : n.toFixed(2).replace('.', ',');
};

export const todayStamp = () => new Date().toISOString().slice(0, 10);
