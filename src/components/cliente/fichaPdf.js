import jsPDF from 'jspdf';

const fototipoLabels = {
  1: 'Pigmentação 1 — Sempre queima intensamente, nunca bronzeia',
  2: 'Pigmentação 2 — Geralmente queima, bronzeia minimamente',
  3: 'Pigmentação 3 — Às vezes queima, bronzeia moderadamente',
  4: 'Pigmentação 4 — Queima minimamente, sempre bronzeia',
  5: 'Pigmentação 5 — Raramente queima, bronzeia muito e fácil',
  6: 'Pigmentação 6 — Nunca queima, bronzeia intensamente',
};

const questions = [
  { num: 2, text: 'Você se expõe à luz solar por mais de 15 minutos ao dia?' },
  { num: 3, text: 'Quando se expõe à luz solar, faz uso de protetor solar?' },
  { num: 4, text: 'Possui manchas na pele?' },
  { num: 5, text: 'Faz ou fez algum tratamento à base de ácidos?' },
  { num: 6, text: 'Possui algum distúrbio dermatológico?' },
  { num: 7, text: 'Tem ou teve algum distúrbio hormonal e/ou déficit vitamínico diagnosticado?' },
  { num: 8, text: 'Possui hirsutismo?' },
  { num: 9, text: 'Faz uso contínuo de algum medicamento?' },
  { num: 10, text: 'Tem alergia a algum medicamento?' },
  { num: 11, text: 'Tem alergia a metais ou ao frio?' },
  { num: 12, text: 'Possui tatuagens na região de interesse da depilação?' },
  { num: 13, text: 'Está grávida ou amamentando?' },
];

/**
 * Builds a PDF from the filled Ficha de Anamnese data and triggers a download.
 * Returns the generated file name.
 */
export const downloadFichaPdf = (data) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 56;

  const ensureSpace = (lineHeight) => {
    if (y + lineHeight > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  };

  const addTitle = (text) => {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(text, marginX, y);
    y += 24;
  };

  const addSectionHeader = (text) => {
    ensureSpace(26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(text, marginX, y);
    y += 8;
    doc.setDrawColor(176, 141, 87);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;
  };

  const addField = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    const labelText = `${label}: `;
    doc.text(labelText, marginX, y);
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont('helvetica', 'normal');
    const maxWidth = pageWidth - marginX * 2 - labelWidth;
    const lines = doc.splitTextToSize(value || '—', maxWidth);
    doc.text(lines, marginX + labelWidth, y);
    y += 16 * lines.length;
    ensureSpace(16);
  };

  addTitle('MR Laser — Ficha de Anamnese');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, marginX, y);
  doc.setTextColor(0);
  y += 26;

  addSectionHeader('Dados Pessoais');
  addField('Nome Completo', data.nome);
  addField('Data de Nascimento', data.nascimento);
  addField('CPF', data.cpf);
  addField('Telefone', data.telefone);
  addField('Sexo', data.sexo);
  addField('Endereço', [data.rua, data.bairro, data.cidade].filter(Boolean).join(', '));
  addField('CEP', data.cep);
  y += 8;

  addSectionHeader('Questionário Clínico');
  addField('(1) Fototipo de pele', data.fototipo ? fototipoLabels[data.fototipo] : '—');
  questions.forEach((q) => {
    const answer = (data.answers && data.answers[q.num]) || '—';
    addField(`(${q.num}) ${q.text}`, answer);
  });

  if (data.obs) {
    y += 4;
    addSectionHeader('Observações');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(data.obs, pageWidth - marginX * 2);
    ensureSpace(16 * lines.length);
    doc.text(lines, marginX, y);
  }

  const safeName = (data.nome || 'paciente').trim().replace(/\s+/g, '-').toLowerCase();
  const fileName = `ficha-anamnese-${safeName}.pdf`;
  doc.save(fileName);
  return fileName;
};
