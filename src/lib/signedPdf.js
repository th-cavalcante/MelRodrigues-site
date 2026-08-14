import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/** "123.456.789-01" -> "123.***.**9-01" — nunca expõe o CPF completo no PDF. */
export const maskCpf = (cpf) => {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf || '';
  return `${digits.slice(0, 3)}.***.**${digits.slice(9, 10)}-${digits.slice(9)}`;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

/**
 * Monta o PDF final de um documento assinado, com o bloco "ASSINATURA
 * ELETRÔNICA" (nome, CPF mascarado, data/hora, ID da assinatura e QR Code
 * pra página pública de validação). Devolve o jsPDF (pra download local) e
 * os bytes em base64 (pra mandar pro finalize-signature calcular o hash).
 */
export const buildSignedPdf = async ({
  title,
  body,
  signatureDataUrl,
  signerName,
  cpf,
  signedAtLabel,
  signatureId,
  validationUrl,
}) => {
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MR Laser', marginX, y);
  y += 22;
  doc.setFontSize(13);
  doc.text(title, marginX, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, marginX, y);
  doc.setTextColor(0);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const paragraphs = (body || '').split('\n\n');
  paragraphs.forEach((p) => {
    const lines = doc.splitTextToSize(p, pageWidth - marginX * 2);
    ensureSpace(15 * lines.length);
    doc.text(lines, marginX, y);
    y += 15 * lines.length + 10;
  });

  y += 10;
  ensureSpace(170);
  doc.setDrawColor(176, 141, 87);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ASSINATURA ELETRÔNICA', marginX, y);
  y += 14;

  const qrSize = 78;
  const textWidth = pageWidth - marginX * 2 - (validationUrl ? qrSize + 16 : 0);
  const blockStartY = y;

  if (signatureDataUrl) {
    doc.addImage(signatureDataUrl, 'PNG', marginX, y, 180, 70);
    y += 78;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const lines = [
    `Assinado eletronicamente por: ${signerName || ''}`,
    `CPF: ${maskCpf(cpf)}`,
    `Data e hora: ${signedAtLabel || ''}`,
    `ID da assinatura: ${signatureId || ''}`,
    'Documento assinado eletronicamente. Este não é um certificado ICP-Brasil — trata-se de',
    'assinatura eletrônica simples, com evidências técnicas registradas no sistema.',
    'Para validar autenticidade e integridade, consulte:',
  ];
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, textWidth);
    doc.text(wrapped, marginX, y);
    y += 12 * wrapped.length;
  });

  if (validationUrl) {
    doc.setTextColor(30, 90, 180);
    const urlLines = doc.splitTextToSize(validationUrl, textWidth);
    doc.textWithLink(urlLines.join(' '), marginX, y, { url: validationUrl });
    doc.setTextColor(0);
    y += 12;

    try {
      const qrDataUrl = await QRCode.toDataURL(validationUrl, { margin: 0, width: 200 });
      doc.addImage(qrDataUrl, 'PNG', pageWidth - marginX - qrSize, blockStartY, qrSize, qrSize);
    } catch (err) {
      console.error('Erro ao gerar QR Code de validação:', err);
    }
  }

  const safeName = (signerName || 'cliente').trim().replace(/\s+/g, '-').toLowerCase();
  const safeTitle = (title || 'documento').trim().replace(/\s+/g, '-').toLowerCase();
  const fileName = `${safeTitle}-${safeName}.pdf`;

  const base64 = arrayBufferToBase64(doc.output('arraybuffer'));

  return { doc, base64, fileName };
};
