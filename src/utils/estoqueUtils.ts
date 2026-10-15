/**
 * Utilitários para Conversão de Unidades e Cálculos de Ficha Técnica / Estoque do EloServe
 */

/**
 * Converte a quantidade informada na unidade da receita para a unidade em que o insumo está estocado.
 * Exemplo:
 * - 300 g de Picanha para estoque em kg => 0.3 kg
 * - 5 g de Sal para estoque em kg => 0.005 kg
 * - 250 ml de Molho para estoque em l => 0.25 l
 * - 1 un para estoque em un => 1 un
 */
export function converterParaUnidadeEstoque(
  qtdReceita: number,
  unidadeReceita: string,
  unidadeEstoque: string
): number {
  if (!qtdReceita || isNaN(qtdReceita) || qtdReceita <= 0) return 0;

  const uRec = (unidadeReceita || '').toLowerCase().trim();
  const uEst = (unidadeEstoque || '').toLowerCase().trim();

  if (uRec === uEst) {
    return Number(qtdReceita.toFixed(4));
  }

  // Peso: gramas (g) <-> quilogramas (kg)
  if (uRec === 'g' && uEst === 'kg') {
    return Number((qtdReceita / 1000).toFixed(4));
  }
  if (uRec === 'kg' && uEst === 'g') {
    return Number((qtdReceita * 1000).toFixed(4));
  }

  // Volume: mililitros (ml) <-> litros (l)
  if (uRec === 'ml' && (uEst === 'l' || uEst === 'litro' || uEst === 'litros')) {
    return Number((qtdReceita / 1000).toFixed(4));
  }
  if ((uRec === 'l' || uRec === 'litro' || uRec === 'litros') && uEst === 'ml') {
    return Number((qtdReceita * 1000).toFixed(4));
  }

  // Caso unidades sejam de mesma grandeza ou sem conversão direta cadastrada
  return Number(qtdReceita.toFixed(4));
}

/**
 * Calcula o custo monetário (R$) do ingrediente utilizado em uma porção do prato.
 * Baseado no preço de custo do item no estoque e na quantidade consumida na receita.
 */
export function calcularCustoIngrediente(
  qtdReceita: number,
  unidadeReceita: string,
  unidadeEstoque: string,
  precoCustoEstoque: number
): number {
  if (!qtdReceita || !precoCustoEstoque) return 0;
  const qtdEstoque = converterParaUnidadeEstoque(qtdReceita, unidadeReceita, unidadeEstoque);
  return Number((qtdEstoque * precoCustoEstoque).toFixed(2));
}

/**
 * Retorna as unidades compatíveis para seleção na ficha técnica com base na unidade do estoque.
 */
export function obterUnidadesCompativeis(unidadeEstoque: string): { valor: string; rotulo: string }[] {
  const uEst = (unidadeEstoque || '').toLowerCase().trim();

  if (uEst === 'kg' || uEst === 'g') {
    return [
      { valor: 'g', rotulo: 'Gramas (g)' },
      { valor: 'kg', rotulo: 'Quilogramas (kg)' },
    ];
  }

  if (uEst === 'l' || uEst === 'ml' || uEst === 'litro' || uEst === 'litros') {
    return [
      { valor: 'ml', rotulo: 'Mililitros (ml)' },
      { valor: 'l', rotulo: 'Litros (L)' },
    ];
  }

  if (uEst === 'un') {
    return [{ valor: 'un', rotulo: 'Unidade (un)' }];
  }

  if (uEst === 'pct') {
    return [
      { valor: 'un', rotulo: 'Unidade (un)' },
      { valor: 'g', rotulo: 'Gramas (g)' },
      { valor: 'pct', rotulo: 'Pacote (pct)' },
    ];
  }

  return [
    { valor: unidadeEstoque, rotulo: unidadeEstoque.toUpperCase() },
    { valor: 'un', rotulo: 'Unidade (un)' },
  ];
}

/**
 * Formata um valor numérico de estoque com a unidade correspondente.
 */
export function formatarQuantidadeComUnidade(qtd: number, unidade: string): string {
  const formatado = Number(qtd.toFixed(3)).toString().replace('.', ',');
  return `${formatado} ${unidade}`;
}
