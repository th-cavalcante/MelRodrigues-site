import { fetchLaserServices } from './services';
import { fetchSiteCombos, fetchComplementaryCards, parseComplementaryPrice } from './siteContent';
import { downloadCsv, formatDecimalBr, todayStamp } from './csvExport';

/** Busca o catálogo salvo (não o que está só digitado na tela) e baixa um
 * CSV único: Categoria, Serviço, Observação, Preço, Preço "de" e Parcela 2x.
 * Devolve quantos serviços foram exportados. */
export const downloadServicesCsv = async () => {
  const [laser, combos, cards] = await Promise.all([
    fetchLaserServices(),
    fetchSiteCombos(),
    fetchComplementaryCards(),
  ]);

  const rows = [
    ...laser.map((s) => [
      'Sessão Avulsa',
      s.name,
      s.note || '',
      formatDecimalBr(s.price),
      formatDecimalBr(s.original),
      formatDecimalBr(s.installment),
    ]),
    ...combos.map((c) => ['Combo', c.title, c.label, formatDecimalBr(c.price_to), formatDecimalBr(c.price_from), '']),
    ...cards.flatMap((card) =>
      card.items.map((item) => [
        'Serviço Complementar',
        card.items.length === 1 ? card.title : `${card.title} — ${item.label}`,
        // sobra do texto livre do preço, ex: "(3x sem juros)"
        item.price.replace(/R\$\s*[\d.,]+/, '').trim(),
        /\d/.test(item.price) ? formatDecimalBr(parseComplementaryPrice(item.price)) : '',
        '',
        '',
      ])
    ),
  ];

  downloadCsv(
    `servicos-mr-laser-${todayStamp()}.csv`,
    ['Categoria', 'Serviço', 'Observação', 'Preço (R$)', 'Preço "de" (R$)', 'Parcela 2x (R$)'],
    rows,
    1
  );
  return rows.length;
};
