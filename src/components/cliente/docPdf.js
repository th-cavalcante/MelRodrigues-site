import jsPDF from 'jspdf';

/**
 * Builds a PDF of a signed document (contrato/termo) with its body text
 * and the patient's digital signature embedded, then triggers a download.
 * Returns the generated file name.
 */
export const downloadDocPdf = ({ title, body, signatureDataUrl, patientName, dateLabel }) => {
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
  ensureSpace(120);
  doc.setDrawColor(176, 141, 87);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Assinatura Digital', marginX, y);
  y += 10;

  if (signatureDataUrl) {
    ensureSpace(90);
    doc.addImage(signatureDataUrl, 'PNG', marginX, y, 200, 80);
    y += 90;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${patientName || ''} · assinado digitalmente em ${dateLabel || new Date().toLocaleDateString('pt-BR')}`, marginX, y);

  const safeName = (patientName || 'paciente').trim().replace(/\s+/g, '-').toLowerCase();
  const safeTitle = (title || 'documento').trim().replace(/\s+/g, '-').toLowerCase();
  const fileName = `${safeTitle}-${safeName}.pdf`;
  doc.save(fileName);
  return fileName;
};
