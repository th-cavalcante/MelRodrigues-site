const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const formatDateExtenso = (date) =>
  `${date.getDate()} de ${MONTHS_PT[date.getMonth()]} de ${date.getFullYear()}`;

const formatEndereco = (a) => {
  if (!a) return '';
  const parts = [a.rua, a.bairro, a.cidade].filter(Boolean);
  let endereco = parts.join(', ');
  if (a.cep) endereco += (endereco ? ', ' : '') + `CEP ${a.cep}`;
  return endereco;
};

export const buildContratoBody = (a) => {
  const nome = (a && a.nome) || '';
  const cpf = (a && a.cpf) || '';
  const telefone = (a && a.telefone) || '';
  const endereco = formatEndereco(a);
  const dataExtenso = formatDateExtenso(new Date());

  return [
    `Por este instrumento particular, de um lado Mel Rodrigues - Depilação a Laser, localizada no endereço Rua Benjamin Constant, 61- Centro, São Vicente-SP, inscrita no CNPJ 41.484.009-0001/00, neste ato representada na forma do seu contrato social, doravante denominado contratado e, do outro, ${nome}, inscrita(o) no CPF sob o nº ${cpf} residente no endereço: ${endereco} e telefone ${telefone} doravante denominado contratante, tem, entre si, justo e contratado a prestação de serviços que será regida pelas seguintes disposições:`,
    `Cláusula Primeira: O objeto da presente contratação é a prestação de serviços pelo contratado ao contratante ou, ainda, ao menor autorizado, especialmente para realização do tratamento estético já esclarecido e autorizado pela(o) contratante no termo de consentimento informado, documento que passa integrar este contrato.`,
    `Parágrafo Primeiro: O serviço objeto deste contrato será prestado pelo contratado ao contratante, de acordo com o número de sessões indicadas e desejadas, observando sua validade, sendo realizadas com intervalos, conforme estabelecido no termo de consentimento e de acordo com a disponibilidade de agenda do contratado, previamente estabelecida. Todas as sessões serão previamente agendadas a partir do dia da assinatura deste instrumento.`,
    `Parágrafo Segundo: Ao final das sessões contratadas, o contratante poderá fazer a aquisição das sessões subsequentes mediante a avaliação pelos profissionais do contratado, responsáveis pelo tratamento.`,
    `Cláusula Segunda: Os serviços prestados ao contratante serão realizados em dias e horários previamente agendados mediante o pagamento antecipado de 50% (cinquenta por cento) do valor total da sessão, e de acordo com a disponibilidade do contratado, conforme já apontado no parágrafo primeiro, da cláusula primeira.`,
    `Parágrafo Primeiro: Caso o contratante se atrase para o início da sessão, a aplicação durará apenas o tempo remanescente não avançando além do horário previamente estabelecido, sendo este o único responsável pelos resultados decorrentes, observado uma tolerância de 10 (dez) minutos. Em decorrência do tempo de duração do tratamento, não serão admitidos atrasos nos casos de procedimentos de depilação a laser.`,
    `Parágrafo Segundo: Caso o contratante não consiga comparecer no dia e horário previamente agendado da sessão, e a desmarque com antecedência mínima de 24 (vinte e quatro) horas, o valor de 50% (cinquenta por cento) pago antecipadamente no ato do agendamento, ficará como crédito para o reagendamento de uma nova sessão, considerando a disponibilidade do contratado.`,
    `Parágrafo Terceiro: Caso o contratante não compareça no dia e horário previamente agendado da sessão, nem a desmarque com antecedência mínima de 24 (vinte e quatro) horas, a sessão será considerada como realizada, não havendo qualquer tipo de reembolso, compensação ou reagendamento.`,
    `Parágrafo Quarto: Caso ocorra algum problema técnico com o equipamento utilizado na sessão, ou com o profissional responsável pela sua execução que impeça a sessão de ser realizada, a nova sessão será reagendada, preferencialmente, para a próxima data disponível.`,
    `Cláusula Terceira: Este "contrato" contém o acordo integral existente entre as partes quanto ao seu objeto, supera e substitui qualquer outro acordo anterior seja verbal ou escrito.`,
    `São Paulo, ${dataExtenso}.`,
  ].join('\n\n');
};

export const buildTermoBody = (a) => {
  const nome = (a && a.nome) || '';
  const cpf = (a && a.cpf) || '';
  const dataExtenso = formatDateExtenso(new Date());
  return [
    `CONTRATANTE: ${nome}, portador(a) do CPF nº ${cpf}.`,
    'Declaro estar ciente dos riscos, benefícios e cuidados necessários antes e após o procedimento estético a ser realizado, tendo recebido todas as orientações da equipe MR Laser de forma clara e satisfatória.',
    `São Paulo, ${dataExtenso}.`,
  ].join('\n\n');
};

export const docsMeta = {
  contrato: {
    icon: '✍️',
    title: 'Contrato de Prestação de Serviço',
    buildBody: buildContratoBody,
  },
  termo: {
    icon: '📄',
    title: 'Termo de Consentimento Livre e Esclarecido',
    buildBody: buildTermoBody,
  },
};
