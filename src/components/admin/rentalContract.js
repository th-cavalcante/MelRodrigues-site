const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const formatDateExtenso = (date) =>
  `${date.getDate()} de ${MONTHS_PT[date.getMonth()]} de ${date.getFullYear()}`;

const formatDataCurta = (isoDate) => {
  if (!isoDate) return 'a combinar';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return 'a combinar';
  return `${d}/${m}/${y}`;
};

export const formatRentalEndereco = (rc) => {
  if (!rc) return '';
  const parts = [rc.street, rc.neighborhood, rc.city].filter(Boolean);
  let endereco = parts.join(', ');
  if (rc.cep) endereco += (endereco ? ', ' : '') + `CEP ${rc.cep}`;
  return endereco;
};

/** Monta o texto do contrato de locação do equipamento Hakon 4D, pra gerar o PDF de registro do admin. */
export const buildRentalContractBody = (rc) => {
  const nome = (rc && rc.name) || '';
  const cpf = (rc && rc.cpf) || '';
  const telefone = (rc && rc.phone) || '';
  const endereco = formatRentalEndereco(rc);
  const dataLocacao = formatDataCurta(rc && rc.rental_date);
  const valor = rc && rc.rental_value != null ? Number(rc.rental_value).toFixed(2).replace('.', ',') : 'a combinar';
  const dataExtenso = formatDateExtenso(new Date());

  return [
    `Por este instrumento particular, de um lado Mel Rodrigues - Depilação a Laser, localizada no endereço Rua Benjamin Constant, 61 - Centro, São Vicente-SP, inscrita no CNPJ 41.484.009-0001/00, neste ato representada na forma do seu contrato social, doravante denominada locadora e, do outro, ${nome}, inscrita(o) no CPF sob o nº ${cpf}, residente no endereço: ${endereco} e telefone ${telefone}, doravante denominado(a) locatário(a), têm, entre si, justo e contratado a locação do equipamento a seguir descrito, que será regida pelas seguintes disposições:`,
    `Cláusula Primeira: O objeto da presente locação é o equipamento de estética Hakon 4D, de propriedade da locadora, cedido ao locatário para uso profissional pelo período e condições abaixo descritos.`,
    `Cláusula Segunda: Data da locação: ${dataLocacao}. Valor da locação: R$ ${valor}.`,
    `Cláusula Terceira: O locatário se compromete a zelar pela integridade do equipamento durante todo o período de locação, respondendo por quaisquer danos, avarias ou extravio ocorridos sob sua responsabilidade, ressalvado o desgaste natural de uso.`,
    `Cláusula Quarta: O equipamento deverá ser devolvido à locadora nas mesmas condições em que foi entregue, na data e local previamente combinados entre as partes.`,
    `Cláusula Quinta: Este contrato contém o acordo integral existente entre as partes quanto ao seu objeto, supera e substitui qualquer outro acordo anterior, seja verbal ou escrito.`,
    `São Vicente, ${dataExtenso}.`,
  ].join('\n\n');
};
