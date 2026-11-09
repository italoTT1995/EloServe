/**
 * Utilitários para Conversão de Unidades e Cálculos de Ficha Técnica / Estoque do EloServe PDV
 */

export type GrandezaMedida = 'massa' | 'volume' | 'unidade' | 'desconhecido';

const UNIDADES_MASSA = ['kg', 'kilo', 'quilo', 'g', 'grama', 'gramas', 'mg', 'miligrama', 'miligramas'];
const UNIDADES_VOLUME = ['l', 'litro', 'litros', 'ml', 'mililitro', 'mililitros', 'cl', 'centilitro', 'centilitros'];
const UNIDADES_CONTAGEM = ['un', 'und', 'unidade', 'unidades', 'pc', 'peca', 'pecas'];

/**
 * Identifica a grandeza física da unidade de medida informada.
 */
export function identificarGrandeza(unidade: string): GrandezaMedida {
  const u = (unidade || '').toLowerCase().trim();
  if (UNIDADES_MASSA.includes(u)) return 'massa';
  if (UNIDADES_VOLUME.includes(u)) return 'volume';
  if (UNIDADES_CONTAGEM.includes(u)) return 'unidade';
  return 'desconhecido';
}

/**
 * Verifica se a unidade da receita e a unidade do estoque pertencem à mesma grandeza física.
 * Impede que conversões incompatíveis (ex: 160g de carne debitando 160 unidades ou 160 litros) corrompam o estoque.
 */
export function validarCompatibilidadeUnidades(
  unidadeReceita: string,
  unidadeEstoque: string
): { compativel: boolean; motivo?: string } {
  const uRec = (unidadeReceita || '').toLowerCase().trim();
  const uEst = (unidadeEstoque || '').toLowerCase().trim();

  if (!uRec || !uEst) {
    return { compativel: false, motivo: 'Unidades não informadas.' };
  }

  if (uRec === uEst) {
    return { compativel: true };
  }

  const gRec = identificarGrandeza(uRec);
  const gEst = identificarGrandeza(uEst);

  if (gRec !== 'desconhecido' && gEst !== 'desconhecido' && gRec !== gEst) {
    return {
      compativel: false,
      motivo: `Incompatibilidade de grandeza: a receita usa "${uRec.toUpperCase()}" (${gRec}), mas o insumo no estoque está em "${uEst.toUpperCase()}" (${gEst}). Não é possível converter massa para volume ou unidade sem densidade específica.`,
    };
  }

  return { compativel: true };
}

/**
 * Converte a quantidade informada na unidade da receita para a unidade em que o insumo está estocado.
 * Mantém precisão decimal e impede baixas em grandeza errada.
 *
 * Exemplos:
 * - 160 g de Picanha para estoque em kg => 0.160 kg
 * - 0.5 kg para estoque em g => 500 g
 * - 50 ml de Xarope para estoque em L => 0.050 L
 * - 2 L para estoque em ml => 2000 ml
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

  const validacao = validarCompatibilidadeUnidades(uRec, uEst);
  if (!validacao.compativel) {
    console.error(`[EloServe Estoque] Erro de conversão de unidades: ${validacao.motivo}`);
    return 0; // Retorna 0 para não realizar baixa incorreta e não gerar estoque negativo
  }

  // --- 1. CONVERSÕES DE MASSA (kg <-> g <-> mg) ---
  const isRecKg = uRec === 'kg' || uRec === 'kilo' || uRec === 'quilo';
  const isEstKg = uEst === 'kg' || uEst === 'kilo' || uEst === 'quilo';
  const isRecG = uRec === 'g' || uRec === 'grama' || uRec === 'gramas';
  const isEstG = uEst === 'g' || uEst === 'grama' || uEst === 'gramas';
  const isRecMg = uRec === 'mg' || uRec === 'miligrama' || uRec === 'miligramas';
  const isEstMg = uEst === 'mg' || uEst === 'miligrama' || uEst === 'miligramas';

  if (isRecG && isEstKg) {
    return Number((qtdReceita / 1000).toFixed(4));
  }
  if (isRecKg && isEstG) {
    return Number((qtdReceita * 1000).toFixed(4));
  }
  if (isRecMg && isEstG) {
    return Number((qtdReceita / 1000).toFixed(4));
  }
  if (isRecG && isEstMg) {
    return Number((qtdReceita * 1000).toFixed(4));
  }
  if (isRecMg && isEstKg) {
    return Number((qtdReceita / 1000000).toFixed(4));
  }
  if (isRecKg && isEstMg) {
    return Number((qtdReceita * 1000000).toFixed(4));
  }

  // --- 2. CONVERSÕES DE VOLUME (L <-> ml <-> cl) ---
  const isRecL = uRec === 'l' || uRec === 'litro' || uRec === 'litros';
  const isEstL = uEst === 'l' || uEst === 'litro' || uEst === 'litros';
  const isRecMl = uRec === 'ml' || uRec === 'mililitro' || uRec === 'mililitros';
  const isEstMl = uEst === 'ml' || uEst === 'mililitro' || uEst === 'mililitros';
  const isRecCl = uRec === 'cl' || uRec === 'centilitro' || uRec === 'centilitros';
  const isEstCl = uEst === 'cl' || uEst === 'centilitro' || uEst === 'centilitros';

  if (isRecMl && isEstL) {
    return Number((qtdReceita / 1000).toFixed(4));
  }
  if (isRecL && isEstMl) {
    return Number((qtdReceita * 1000).toFixed(4));
  }
  if (isRecCl && isEstL) {
    return Number((qtdReceita / 100).toFixed(4));
  }
  if (isRecL && isEstCl) {
    return Number((qtdReceita * 100).toFixed(4));
  }
  if (isRecCl && isEstMl) {
    return Number((qtdReceita * 10).toFixed(4));
  }
  if (isRecMl && isEstCl) {
    return Number((qtdReceita / 10).toFixed(4));
  }

  // Caso sejam unidades compatíveis ou genéricas de mesma escala
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
 * Retorna as unidades compatíveis para seleção na ficha técnica com base estrita na unidade do estoque.
 * Garante que o usuário não consiga escolher 'kg' para um item estocado em 'un', por exemplo.
 */
export function obterUnidadesCompativeis(unidadeEstoque: string): { valor: string; rotulo: string }[] {
  const uEst = (unidadeEstoque || '').toLowerCase().trim();
  const grandeza = identificarGrandeza(uEst);

  if (grandeza === 'massa') {
    return [
      { valor: 'g', rotulo: 'Gramas (g)' },
      { valor: 'kg', rotulo: 'Quilogramas (kg)' },
      { valor: 'mg', rotulo: 'Miligramas (mg)' },
    ];
  }

  if (grandeza === 'volume') {
    return [
      { valor: 'ml', rotulo: 'Mililitros (ml)' },
      { valor: 'l', rotulo: 'Litros (L)' },
      { valor: 'cl', rotulo: 'Centilitros (cl)' },
    ];
  }

  if (grandeza === 'unidade') {
    return [
      { valor: 'un', rotulo: 'Unidade (un)' },
      { valor: 'porcao', rotulo: 'Porção (porção)' },
    ];
  }

  if (uEst === 'pct' || uEst === 'pacote') {
    return [
      { valor: 'un', rotulo: 'Unidade (un)' },
      { valor: 'pct', rotulo: 'Pacote (pct)' },
      { valor: 'g', rotulo: 'Gramas (g)' },
    ];
  }

  return [
    { valor: unidadeEstoque || 'un', rotulo: (unidadeEstoque || 'un').toUpperCase() },
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

export interface DisponibilidadeProdutoResultado {
  disponivel: boolean;
  porcoesDisponiveis: number;
  motivo?: string;
  ingredientesInsuficientes?: {
    nome: string;
    restante: number;
    necessario: number;
    unidade: string;
  }[];
}

/**
 * 3.4 VERIFICAÇÃO RIGOROSA DE DISPONIBILIDADE DO PRATO CONFORME O ESTOQUE REAL
 * Calcula se o restaurante possui insumos suficientes para produzir o prato e quantas porções restam.
 */
export function verificarDisponibilidadeProduto(
  produto: {
    id: string;
    nome: string;
    disponivel?: boolean;
    itemEstoqueId?: string;
    fichaTecnica?: Array<{
      ingredienteId: string;
      ingredienteNome?: string;
      quantidade: number;
      unidadeMedida: string;
    }>;
  },
  itensEstoque: Array<{
    id: string;
    nome: string;
    quantidadeAtual: number;
    unidadeMedida: string;
    estoqueMinimo?: number;
  }>
): DisponibilidadeProdutoResultado {
  // 1. Verificação de trava manual do cardápio
  if (produto.disponivel === false) {
    return {
      disponivel: false,
      porcoesDisponiveis: 0,
      motivo: 'Item pausado manualmente no Cardápio.',
    };
  }

  // 2. Verificação de item com vínculo direto unitário no estoque (ex: cerveja, refrigerante, água)
  if (produto.itemEstoqueId) {
    const itemEst = itensEstoque.find((i) => i.id === produto.itemEstoqueId);
    if (!itemEst) {
      return {
        disponivel: true,
        porcoesDisponiveis: 999,
      };
    }

    if (itemEst.quantidadeAtual <= 0) {
      return {
        disponivel: false,
        porcoesDisponiveis: 0,
        motivo: `Estoque esgotado: ${itemEst.nome} (Saldo: ${itemEst.quantidadeAtual} ${itemEst.unidadeMedida})`,
        ingredientesInsuficientes: [
          {
            nome: itemEst.nome,
            restante: itemEst.quantidadeAtual,
            necessario: 1,
            unidade: itemEst.unidadeMedida,
          },
        ],
      };
    }

    return {
      disponivel: true,
      porcoesDisponiveis: Math.floor(itemEst.quantidadeAtual),
    };
  }

  // 3. Verificação de prato com Ficha Técnica (múltiplos ingredientes)
  if (produto.fichaTecnica && produto.fichaTecnica.length > 0) {
    let maxPorcoes = 999999;
    const faltantes: DisponibilidadeProdutoResultado['ingredientesInsuficientes'] = [];

    for (const ing of produto.fichaTecnica) {
      const itemEst = itensEstoque.find((i) => i.id === ing.ingredienteId);
      if (!itemEst) continue; // Insumo não localizado no estoque não bloqueia preventivamente

      const qtdConsumoEstoque = converterParaUnidadeEstoque(
        ing.quantidade,
        ing.unidadeMedida,
        itemEst.unidadeMedida
      );

      if (qtdConsumoEstoque <= 0) continue;

      if (itemEst.quantidadeAtual < qtdConsumoEstoque) {
        faltantes.push({
          nome: itemEst.nome || ing.ingredienteNome || 'Insumo',
          restante: itemEst.quantidadeAtual,
          necessario: qtdConsumoEstoque,
          unidade: itemEst.unidadeMedida,
        });
        maxPorcoes = 0;
      } else {
        const porcoesDesteIngrediente = Math.floor(itemEst.quantidadeAtual / qtdConsumoEstoque);
        if (porcoesDesteIngrediente < maxPorcoes) {
          maxPorcoes = porcoesDesteIngrediente;
        }
      }
    }

    if (faltantes.length > 0 || maxPorcoes === 0) {
      const nomesFaltantes = faltantes.map((f) => f.nome).join(', ');
      return {
        disponivel: false,
        porcoesDisponiveis: 0,
        motivo: `Insumo(s) esgotado(s) no estoque: ${nomesFaltantes}`,
        ingredientesInsuficientes: faltantes,
      };
    }

    return {
      disponivel: true,
      porcoesDisponiveis: maxPorcoes === 999999 ? 999 : maxPorcoes,
    };
  }

  // 4. Sem ficha técnica ou vínculo de estoque: disponível por padrão
  return {
    disponivel: true,
    porcoesDisponiveis: 999,
  };
}
