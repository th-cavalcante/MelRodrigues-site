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

const formatDataNasc = (nascimento) => {
  if (!nascimento) return '';
  const [y, m, d] = nascimento.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

const formatSexoLine = (sexo) => {
  const f = sexo === 'Feminino' ? 'X' : ' ';
  const m = sexo === 'Masculino' ? 'X' : ' ';
  return `Sexo: F(${f})  M(${m})  Outro( )`;
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
  const telefone = (a && a.telefone) || '';
  const endereco = formatEndereco(a);
  const dataNasc = formatDataNasc(a && a.nascimento);
  const sexoLine = formatSexoLine(a && a.sexo);
  const dataExtenso = formatDateExtenso(new Date());

  return [
    'TERMO DE CIÊNCIA',
    [
      `Nome: ${nome}`,
      `Data Nasc: ${dataNasc}   ${sexoLine}   Telefone: ${telefone}`,
      `Endereço: ${endereco}`,
      `CPF: ${cpf}`,
    ].join('\n'),
    'Fui informado sobre as contraindicações do tratamento:',
    [
      'Gravidez',
      'Aparecimento de transtornos imunossupressores',
      'Infecções ativas na pele como Herpes zoster ou simples',
      'Varicela ou outras alergias',
      'Administração de isotretinoína (Roacutan, Tigason, Neotigason) nos últimos 6 meses',
      'Administração de retinol, ácido retinóico ou outro tratamento com ácido na pele',
      'Administração de produtos fotossensibilizantes ou aplicação de produtos de auto bronzeamento e clareadores de pelos',
    ].map((s) => `• ${s}`).join('\n'),
    'Também me foi explicado sobre os cuidados que devo seguir para o sucesso do tratamento e para evitar os efeitos secundários:',
    [
      'Evitar bronzeamento em no mínimo 10 dias antes das sessões de depilação, pois as peles bronzeadas reagem menos eficientemente ao tratamento do que as peles não bronzeadas. Em caso de exposição solar, avisar antes de cada sessão para ajuste dos parâmetros de tratamento.',
      'Não depilar a região tratada com cera ou arrancar com pinça o pelo, para não prejudicar o tratamento, mas sempre utilizar lâminas de depilação ou cremes depilatórios.',
      'Evitar fontes de calor e atrito na região.',
      'Não descolorir os pelos no período de tratamento.',
      'Evitar o uso de maquiagem sobre o rosto ou desodorante nas axilas, pois esses produtos podem conter substâncias que provocam inflamação na pele quando reagem com a luz do laser.',
      'Não utilizar cosméticos que contenham ácido glicólico ou ácido retinóico três dias antes do procedimento.',
    ].map((s) => `• ${s}`).join('\n'),
    'Dias depois de uma sessão, alguns pelos deverão ir se desprendendo facilmente dos seus folículos e nesse período, é interessante aplicação de gel ou hidratante com ativos calmantes e sempre utilizar protetor solar de no mínimo 30 FPS na área tratada.',
    'TERMO DE CONSENTIMENTO',
    [
      '1. Autorizo a profissional Mel Rodrigues a fazer a realização do procedimento de depilação definitiva por meio de equipamento de laser de diodo.',
      '2. Declaro estar ciente que: poderá haver alteração da coloração cutânea transitória (hipercromia – manchas escuras, ou hipocromia – manchas brancas), que poderá perdurar durante semanas ou meses e que devo buscar amparo da profissional imediatamente ao perceber este tipo de alteração. O resultado do tratamento poderá não ser permanente devido às alterações hormonais, seja por uso de medicações ou por distúrbios endócrinos como síndrome de ovário policístico, por exemplo, ou uso de medicação que induza a produção de testosterona ou tratamento para queda de pelos e cabelos e que devo relatar caso esse seja meu caso. Todos os pacientes terão ardor, vermelhidão e edema durante a sessão de tratamento e pode perdurar por até 24h após.',
      '3. Fui esclarecido sobre a duração média entre seis e dez sessões para se obter a depilação permanente de 70 a 90% dos pelos (podendo variar devido a fatores individuais de cada paciente). E nos pelos brancos ou loiros claros o método de laser não tem ação comprovada. Fui orientado a evitar a exposição solar no mínimo 10 dias antes e depois de cada sessão.',
      '4. Autorizo o registro fotográfico do(s) procedimento(s) e sua exposição em mídias desde que minha identidade seja preservada e tal registro não seja utilizado de forma ofensiva ou pejorativamente.',
      '5. Declaro que nada omiti em relação à minha saúde e respondi com sinceridade a todos os questionamentos a mim feitos no momento da avaliação.',
      '6. Assim, afirmo por meio deste documento que todas as minhas dúvidas a respeito do procedimento foram esclarecidas neste ato, tendo-o lido e compreendido antes de assiná-lo.',
    ].join('\n\n'),
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
