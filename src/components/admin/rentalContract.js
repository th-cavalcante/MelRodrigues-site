const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const formatDateExtenso = (date) =>
  `${date.getDate()} de ${MONTHS_PT[date.getMonth()]} de ${date.getFullYear()}`;

const formatDataCurta = (isoDate) => {
  if (!isoDate) return '[data a definir]';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return '[data a definir]';
  return `${d}/${m}/${y}`;
};

const formatPeriodo = (hours) => (hours ? `${hours} horas` : '[período a definir]');

export const formatRentalEndereco = (rc) => {
  if (!rc) return '';
  const parts = [rc.street, rc.neighborhood, rc.city].filter(Boolean);
  return parts.join(', ');
};

/**
 * Monta o texto do Contrato de Locação de Equipamento de Estética (Hakon
 * 4D), a partir do modelo oficial em Word fornecido pela clínica — só os
 * dados da locatária, data/horário e valor são preenchidos dinamicamente,
 * o restante das cláusulas é fixo.
 */
export const buildRentalContractBody = (rc) => {
  const nome = (rc && rc.name) || '';
  const cpf = (rc && rc.cpf) || '';
  const endereco = formatRentalEndereco(rc);
  const dataLocacao = formatDataCurta(rc && rc.rental_date);
  const periodo = formatPeriodo(rc && rc.rental_period_hours);
  const valor = rc && rc.rental_value != null ? Number(rc.rental_value).toFixed(2).replace('.', ',') : '[valor a definir]';
  const dataExtenso = formatDateExtenso(new Date());

  return [
    'CONTRATO DE LOCAÇÃO DE EQUIPAMENTO DE ESTÉTICA',
    '1. DAS PARTES',
    [
      'LOCADORA: MR LASER, inscrita no CNPJ sob o nº 41.484.009/0001-00, com sede na R. Benjamin Constant, 61 - sala 515, 5º andar - Centro, São Vicente - SP, 11310500, representada por Melany Rodrigues dos Santos.',
      `LOCATÁRIA: ${nome}, inscrita no CPF sob o nº ${cpf}, com endereço situado à: ${endereco}.`,
    ].join('\n'),
    '2. DO OBJETO',
    '2.1. O objeto deste contrato é a locação do equipamento de depilação a laser HAKON 4D, marca Medical San, em perfeito estado de conservação e funcionamento, acompanhado de seus acessórios: 01 cabo de força, 01 par de óculos operador, 01 par de óculos paciente, 01 ponteira.',
    '3. DO PRAZO',
    [
      `3.1. A locação terá duração de ${periodo}, na data de ${dataLocacao}.`,
      '3.2. O atraso na devolução do equipamento implicará em multa de R$ 50,00 por hora excedente.',
    ].join('\n'),
    '4. DO VALOR E FORMA DE PAGAMENTO',
    [
      `4.1. Pela locação do equipamento, a LOCATÁRIA pagará o valor total de R$ ${valor}.`,
      '4.2. O pagamento será realizado da seguinte forma: À vista.',
      '4.3. Pagamentos via PIX deverão ser enviados para a chave: 41.484.009/0001-00.',
    ].join('\n'),
    '5. DO TRANSPORTE E ENTREGA',
    [
      '5.1. A entrega e a retirada do equipamento serão de responsabilidade da LOCADORA.',
      '5.2. Fica estipulada uma taxa de deslocamento/frete no valor de R$ 0,00, a ser paga junto com a primeira parcela da locação.',
    ].join('\n'),
    '6. DAS RESPONSABILIDADES DA LOCATÁRIA',
    [
      '6.1. A LOCATÁRIA declara possuir habilitação técnica e profissional para a operação do laser HAKON 4D, assumindo total responsabilidade civil e criminal por qualquer dano causado a pacientes durante o uso.',
      '6.2. O equipamento deverá ser utilizado exclusivamente nas dependências da LOCATÁRIA, sendo proibida a sublocação ou empréstimo a terceiros sem autorização prévia por escrito.',
    ].join('\n'),
    '7. DO SEGURO E SINISTROS',
    [
      '7.1. O equipamento possui cobertura de seguro contra roubo, furto qualificado e danos acidentais de grande monta.',
      '7.2. Em caso de sinistro coberto pela apólice, a LOCATÁRIA obriga-se ao pagamento imediato do valor da FRANQUIA, sem prejuízo das demais obrigações.',
      '7.3. Caso a seguradora recuse a indenização por comprovada negligência, mau uso intencional ou operação por pessoa não habilitada, a LOCATÁRIA responderá pelo valor integral de mercado do equipamento.',
      '7.4. Danos que não atinjam o valor mínimo da franquia (pequenas avarias) deverão ser custeados integralmente pela LOCATÁRIA em até 72 horas após a constatação.',
    ].join('\n'),
    '8. CANCELAMENTO',
    '8.1. O cancelamento da reserva por iniciativa da LOCATÁRIA com menos de 48 horas de antecedência resultará na retenção de 30% do valor total da locação a título de multa compensatória.',
    '9. DO FORO',
    '9.1. As partes elegem o Foro da Comarca de São Vicente/SP para dirimir quaisquer controvérsias oriundas deste instrumento.',
    `São Vicente, ${dataExtenso}.`,
  ].join('\n\n');
};
