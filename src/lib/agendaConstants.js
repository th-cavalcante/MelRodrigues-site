export const PROFESSIONALS = ['Dra. Marina Costa'];

export const ROOMS = ['Sala Laser Hakon 4D', 'Sala de Avaliação', 'Sala Toxina/Bioestimulador'];

export const STATUS_OPTIONS = [
  { value: 'confirmado', label: 'Confirmado', color: '#4C7A5C' },
  { value: 'pendente', label: 'Pendente', color: '#D9B54A' },
  { value: 'em_atendimento', label: 'Em Atendimento', color: '#B08D57' },
  { value: 'concluido', label: 'Concluído', color: '#7C8794' },
  { value: 'faltou', label: 'Faltou', color: '#B85450' },
  { value: 'cancelado', label: 'Cancelado', color: '#9B9B9B' },
];

export const PAYMENT_STATUS_OPTIONS = ['Pago Sinal 50%', 'Pago', 'Pendente'];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Cartão', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'Pix', label: 'Pix', icon: '⚡' },
  { value: 'Dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'Boleto', label: 'Boleto', icon: '📄' },
];

export const COMPLEMENTARY_SERVICE_OPTIONS = ['Limpeza de Pele', 'Drenagem Linfática'];

/** Horários bloqueados na grade da visão Dia — sem bloqueio fixo hoje. Usar
 * "Bloquear Horário" pra bloquear o horário do dia que for necessário. */
export const BLOCKED_SLOTS = [];

/** Data local em 'YYYY-MM-DD', nunca usar toISOString() (foto do UTC, não
 * do fuso local — no Brasil isso pode virar o dia errado antes das 3h/0h). */
export const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Monta o link wa.me a partir de um telefone livre (com ou sem DDI/máscara). */
export const buildWhatsAppLink = (phone, text) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${withCountryCode}${query}`;
};

/** Fototipos (escala de Fitzpatrick) usados na pergunta 1 da ficha de
 * anamnese — compartilhado entre FichaAnamneseModal e AgendaOnline. */
export const ANAMNESE_FOTOTIPOS = [
  { num: 1, desc: 'Sempre queima intensamente, nunca bronzeia', tone: '#f3d9bd' },
  { num: 2, desc: 'Geralmente queima, bronzeia minimamente', tone: '#e6bd94' },
  { num: 3, desc: 'Às vezes queima, bronzeia moderadamente', tone: '#c99568' },
  { num: 4, desc: 'Queima minimamente, sempre bronzeia', tone: '#a06f42' },
  { num: 5, desc: 'Raramente queima, bronzeia muito e fácil', tone: '#6b4527' },
  { num: 6, desc: 'Nunca queima, bronzeia intensamente', tone: '#3c2416' },
];

/** Perguntas do questionário clínico da ficha de anamnese — compartilhado
 * entre FichaAnamneseModal e AgendaOnline. */
export const ANAMNESE_QUESTIONS = [
  { num: 2, text: 'Você se expõe à luz solar por mais de 15 minutos ao dia?' },
  { num: 3, text: 'Quando se expõe à luz solar, faz uso de protetor solar?' },
  { num: 4, text: 'Possui manchas na pele?' },
  { num: 5, text: 'Faz ou fez algum tratamento à base de ácidos?' },
  { num: 6, text: 'Possui algum distúrbio dermatológico?' },
  { num: 7, text: 'Tem ou teve algum distúrbio hormonal e/ou déficit vitamínico diagnosticado?' },
  { num: 8, text: 'Possui hirsutismo?' },
  { num: 9, text: 'Faz uso contínuo de algum medicamento? (incluindo insulina e anticoncepcionais hormonais, seja oral, injetável, DIU, adesivo)' },
  { num: 10, text: 'Tem alergia a algum medicamento?' },
  { num: 11, text: 'Tem alergia a metais ou ao frio?' },
  { num: 12, text: 'Possui tatuagens na região de interesse da depilação?' },
  { num: 13, text: 'Está grávida ou amamentando?' },
];

/** Perguntas de risco da ficha de anamnese (ver ANAMNESE_QUESTIONS acima) que
 * disparam o alerta de saúde automático de um agendamento. */
const HEALTH_RISK_QUESTIONS = [
  { num: 13, reason: 'Grávida ou amamentando' },
  { num: 9, reason: 'Uso contínuo de medicamento' },
  { num: 10, reason: 'Alergia a medicamento' },
  { num: 11, reason: 'Alergia a metais ou frio' },
];

/** Deriva alerta de saúde + motivo a partir das respostas da ficha de
 * anamnese do paciente — calculado uma vez, na criação do agendamento. */
export const deriveHealthAlert = (patient) => {
  const answers = (patient && patient.clinical_answers) || {};
  const reasons = HEALTH_RISK_QUESTIONS.filter((q) => answers[q.num] === 'Sim').map((q) => q.reason);
  return { healthAlert: reasons.length > 0, healthReason: reasons.join(' · ') };
};
