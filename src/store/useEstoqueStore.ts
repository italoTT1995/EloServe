import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ItemEstoque,
  CategoriaEstoque,
  RegistroCompra,
  FichaTecnica,
  Fornecedor,
  MovimentacaoEstoque,
  VendaRealizada,
  ItemComandaMesa,
} from '../types';
import { converterParaUnidadeEstoque } from '../utils/estoqueUtils';

export const CATEGORIAS_ESTOQUE_NOMES: Record<CategoriaEstoque, string> = {
  alimentos: 'Alimentos & Insumos',
  bebidas: 'Bebidas',
  higiene: 'Higiene & Proteção Individual',
  utensilios: 'Utensílios & Equipamentos de Cozinha',
  limpeza: 'Produtos & Utensílios de Limpeza',
  balcao: 'Materiais de Balcão & Atendimento',
};

const ITENS_ESTOQUE_INICIAIS: ItemEstoque[] = [
  // 1. Alimentos e Insumos (Recorrente / Ficha Técnica)
  {
    id: 'est-picanha',
    nome: 'Picanha Bovina Angus Resfriada',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 15.0,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 3.0,
    estoqueMinimo: 4.0,
    estoqueIdeal: 20.0,
    precoCusto: 58.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-sal',
    nome: 'Sal de Parrilla Grosso Especial',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 8.0,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 0.2,
    estoqueMinimo: 2.0,
    estoqueIdeal: 10.0,
    precoCusto: 8.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Atacadão Alimentos',
  },
  {
    id: 'est-farofa',
    nome: 'Farofa Especial da Casa na Manteiga',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 12.0,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 1.5,
    estoqueMinimo: 3.0,
    estoqueIdeal: 15.0,
    precoCusto: 7.2,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Supermercado BH',
  },
  {
    id: 'est-bacon',
    nome: 'Bacon Especial Fatiado',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 6.5,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 1.0,
    estoqueMinimo: 2.5,
    estoqueIdeal: 10.0,
    precoCusto: 28.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-carne-burger',
    nome: 'Blend de Carnes para Smash Burger',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 18.0,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 3.5,
    estoqueMinimo: 5.0,
    estoqueIdeal: 25.0,
    precoCusto: 26.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-pao-burger',
    nome: 'Pão de Brioche Artesanal para Burger',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 50,
    unidadeMedida: 'un',
    estoqueMinimo: 20,
    estoqueIdeal: 80,
    precoCusto: 1.8,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Padaria Modelo',
  },
  {
    id: 'est-queijo',
    nome: 'Queijo Mussarela Peça Especial',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 14.0,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 2.0,
    estoqueMinimo: 4.0,
    estoqueIdeal: 20.0,
    precoCusto: 34.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Laticínios da Serra',
  },
  {
    id: 'est-01',
    nome: 'Arroz Tipo 1 (Pacote 5kg)',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 18,
    unidadeMedida: 'pct',
    consumoDiarioPrevisto: 1,
    sobraDiaAnterior: 0,
    estoqueMinimo: 8,
    estoqueIdeal: 20,
    precoCusto: 20.99,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Supermercado Paranaíba',
  },
  {
    id: 'est-02',
    nome: 'Feijão Carioca Especial (1kg)',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 24,
    unidadeMedida: 'pct',
    consumoDiarioPrevisto: 2,
    sobraDiaAnterior: 0,
    estoqueMinimo: 10,
    estoqueIdeal: 30,
    precoCusto: 7.8,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Supermercado BH',
  },
  {
    id: 'est-03',
    nome: 'Batata Pré-Frita Congelada (1kg)',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 35,
    unidadeMedida: 'kg',
    estoqueMinimo: 12,
    estoqueIdeal: 40,
    precoCusto: 8.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Atacadão Alimentos',
  },
  {
    id: 'est-04',
    nome: 'Bife de Porco Selecionado (kg)',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 14.5,
    unidadeMedida: 'kg',
    consumoDiarioPrevisto: 3,
    estoqueMinimo: 5,
    estoqueIdeal: 20,
    precoCusto: 19.9,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Frigorífico Central',
  },

  // 2. Bebidas (Controle Individual por Unidade com Baixa Automática)
  {
    id: 'est-05',
    nome: 'Cerveja Amstel Lager 350ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 142,
    unidadeMedida: 'un',
    estoqueMinimo: 24,
    estoqueIdeal: 200,
    precoCusto: 3.5,
    precoVenda: 7.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Distribuidora de Bebidas BH',
  },
  {
    id: 'est-06',
    nome: 'Cerveja Heineken Long Neck 330ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 4,
    unidadeMedida: 'un',
    estoqueMinimo: 24,
    estoqueIdeal: 120,
    precoCusto: 5.2,
    precoVenda: 11.0,
    statusDisponibilidade: 'esgotado',
    fornecedorHabitual: 'Distribuidora de Bebidas BH',
  },
  {
    id: 'est-07',
    nome: 'Coca-Cola Lata 350ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 68,
    unidadeMedida: 'un',
    estoqueMinimo: 20,
    estoqueIdeal: 100,
    precoCusto: 3.2,
    precoVenda: 7.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Atacadão Alimentos',
  },
  {
    id: 'est-08',
    nome: 'Água Mineral sem Gás 500ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 55,
    unidadeMedida: 'un',
    estoqueMinimo: 24,
    estoqueIdeal: 80,
    precoCusto: 1.5,
    precoVenda: 5.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Distribuidora Fonte Pura',
  },

  // 3. Higiene e Proteção Individual
  {
    id: 'est-09',
    nome: 'Toucas Descartáveis Sanfonadas (pct 100un)',
    categoria: 'higiene',
    metodoControle: 'manual',
    quantidadeAtual: 6,
    unidadeMedida: 'pct',
    estoqueMinimo: 2,
    estoqueIdeal: 8,
    precoCusto: 14.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Dental & Descartáveis MG',
  },
  {
    id: 'est-10',
    nome: 'Luvas de Nitrila Tamanho M (cx 100un)',
    categoria: 'higiene',
    metodoControle: 'manual',
    quantidadeAtual: 4,
    unidadeMedida: 'cx',
    estoqueMinimo: 3,
    estoqueIdeal: 10,
    precoCusto: 28.0,
    statusDisponibilidade: 'esgotando',
    fornecedorHabitual: 'Dental & Descartáveis MG',
  },

  // 4. Utensílios e Equipamentos de Cozinha
  {
    id: 'est-11',
    nome: 'Panela de Pressão Industrial 10L',
    categoria: 'utensilios',
    metodoControle: 'manual',
    quantidadeAtual: 2,
    unidadeMedida: 'un',
    estoqueMinimo: 1,
    estoqueIdeal: 2,
    precoCusto: 189.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Bazar Gastronômico',
  },
  {
    id: 'est-12',
    nome: 'Colher de Madeira Tratada Grande',
    categoria: 'utensilios',
    metodoControle: 'manual',
    quantidadeAtual: 5,
    unidadeMedida: 'un',
    estoqueMinimo: 2,
    estoqueIdeal: 6,
    precoCusto: 12.0,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Bazar Gastronômico',
  },

  // 5. Produtos e Utensílios de Limpeza
  {
    id: 'est-13',
    nome: 'Desinfetante Floral Concentrado (Frasco 2L)',
    categoria: 'limpeza',
    metodoControle: 'manual',
    quantidadeAtual: 7,
    unidadeMedida: 'frasco',
    estoqueMinimo: 3,
    estoqueIdeal: 10,
    precoCusto: 9.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Limpeza Total Distribuidora',
  },
  {
    id: 'est-14',
    nome: 'Detergente Neutro Lava-Louças (500ml)',
    categoria: 'limpeza',
    metodoControle: 'manual',
    quantidadeAtual: 18,
    unidadeMedida: 'frasco',
    estoqueMinimo: 6,
    estoqueIdeal: 24,
    precoCusto: 2.3,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Supermercado BH',
  },

  // 6. Materiais de Balcão e Atendimento
  {
    id: 'est-15',
    nome: 'Bloco de Comandas de Mesa com Carbono (un)',
    categoria: 'balcao',
    metodoControle: 'manual',
    quantidadeAtual: 15,
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 20,
    precoCusto: 4.5,
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Papelaria & Gráfica Express',
  },
  {
    id: 'est-16',
    nome: 'Bobina Térmica 80mm para Impressora (cx 30un)',
    categoria: 'balcao',
    metodoControle: 'manual',
    quantidadeAtual: 2,
    unidadeMedida: 'cx',
    estoqueMinimo: 2,
    estoqueIdeal: 5,
    precoCusto: 65.0,
    statusDisponibilidade: 'esgotando',
    fornecedorHabitual: 'Papelaria & Gráfica Express',
  },
];

const HISTORICO_COMPRAS_INICIAIS: RegistroCompra[] = [
  {
    id: 'cmp-01',
    data: '12/10/2026',
    fornecedorOuLocal: 'Supermercado BH',
    produtoNome: 'Arroz Tipo 1 (Pacote 5kg)',
    categoria: 'alimentos',
    quantidade: 10,
    unidadeMedida: 'pct',
    precoTotal: 249.9,
    precoUnitario: 24.99,
  },
  {
    id: 'cmp-02',
    data: '13/10/2026',
    fornecedorOuLocal: 'Supermercado Paranaíba',
    produtoNome: 'Arroz Tipo 1 (Pacote 5kg)',
    categoria: 'alimentos',
    quantidade: 10,
    unidadeMedida: 'pct',
    precoTotal: 209.9,
    precoUnitario: 20.99,
  },
  {
    id: 'cmp-03',
    data: '11/10/2026',
    fornecedorOuLocal: 'Distribuidora de Bebidas BH',
    produtoNome: 'Cerveja Amstel Lager 350ml',
    categoria: 'bebidas',
    quantidade: 150,
    unidadeMedida: 'un',
    precoTotal: 525.0,
    precoUnitario: 3.5,
  },
  {
    id: 'cmp-04',
    data: '10/10/2026',
    fornecedorOuLocal: 'Limpeza Total Distribuidora',
    produtoNome: 'Desinfetante Floral Concentrado (Frasco 2L)',
    categoria: 'limpeza',
    quantidade: 10,
    unidadeMedida: 'frasco',
    precoTotal: 95.0,
    precoUnitario: 9.5,
  },
];

const FICHAS_TECNICAS_INICIAIS: FichaTecnica[] = [
  {
    id: 'ft-01',
    produtoId: 'p_fg_1',
    nomePrato: 'Picanha Angus na Brasa (2 pessoas)',
    componentes: [
      { ingredienteId: 'est-picanha', ingredienteNome: 'Picanha Bovina Angus Resfriada', pesoGramas: 600, custoPorGrama: 0.058, custoTotalComponente: 34.8 },
      { ingredienteId: 'est-sal', ingredienteNome: 'Sal de Parrilla Grosso Especial', pesoGramas: 10, custoPorGrama: 0.0085, custoTotalComponente: 0.09 },
      { ingredienteId: 'est-farofa', ingredienteNome: 'Farofa Especial da Casa na Manteiga', pesoGramas: 150, custoPorGrama: 0.0072, custoTotalComponente: 1.08 },
    ],
    custoTotalEstimado: 35.97,
    precoVenda: 128.0,
    margemBrutaPercentual: 71.9,
  },
  {
    id: 'ft-02',
    produtoId: 'p_fg_11',
    nomePrato: 'Batata Rústica com Alecrim e Alho',
    componentes: [
      { ingredienteId: 'est-03', ingredienteNome: 'Batata Pré-Frita Congelada (1kg)', pesoGramas: 400, custoPorGrama: 0.0085, custoTotalComponente: 3.4 },
      { ingredienteId: 'est-sal', ingredienteNome: 'Sal de Parrilla Grosso Especial', pesoGramas: 5, custoPorGrama: 0.0085, custoTotalComponente: 0.04 },
    ],
    custoTotalEstimado: 3.44,
    precoVenda: 24.0,
    margemBrutaPercentual: 85.6,
  },
];

const FORNECEDORES_INICIAIS: Fornecedor[] = [
  {
    id: 'forn-01',
    nomeOuEmpresa: 'Supermercado Paranaíba',
    pessoaContato: 'Roberto Santos',
    telefone: '(31) 98877-6655',
    email: 'pedidos@paranaiba.com.br',
    cnpj: '12.345.678/0001-99',
    endereco: 'Av. Amazonas, 1200 - Centro, BH',
    categoriaPrincipal: 'Alimentos e Insumos Gerais',
  },
  {
    id: 'forn-02',
    nomeOuEmpresa: 'Supermercado BH',
    pessoaContato: 'Marcio Vendas',
    telefone: '(31) 98765-4321',
    email: 'comercial@supermercadosbh.com.br',
    cnpj: '04.111.222/0001-33',
    endereco: 'Rua da Bahia, 500 - Lourdes, BH',
    categoriaPrincipal: 'Alimentos e Hortifruti',
  },
  {
    id: 'forn-03',
    nomeOuEmpresa: 'Distribuidora de Bebidas BH',
    pessoaContato: 'Eduardo Chopp',
    telefone: '(31) 99112-3344',
    email: 'atendimento@bebidasbh.com.br',
    cnpj: '19.888.777/0001-44',
    endereco: 'Via Expressa, 4500 - Contagem / MG',
    categoriaPrincipal: 'Cervejas, Chopp e Refrigerantes',
  },
  {
    id: 'forn-04',
    nomeOuEmpresa: 'Limpeza Total Distribuidora',
    pessoaContato: 'Clara Meireles',
    telefone: '(31) 99334-5566',
    email: 'vendas@limpezatotalmg.com.br',
    cnpj: '33.222.111/0001-05',
    endereco: 'Rua Tupis, 780 - Barro Preto, BH',
    categoriaPrincipal: 'Produtos Químicos e Limpeza',
  },
  {
    id: 'forn-05',
    nomeOuEmpresa: 'Frigorífico Central',
    pessoaContato: 'Carlos Açougue',
    telefone: '(31) 99222-1133',
    email: 'pedidos@frigorificocentral.com.br',
    cnpj: '11.222.333/0001-88',
    endereco: 'Ceasa Minas Pavilhão 4 - Contagem',
    categoriaPrincipal: 'Carnes Bovinas, Suínas e Cortes Nobres',
  },
];

const HISTORICO_MOVIMENTACOES_INICIAIS: MovimentacaoEstoque[] = [
  {
    id: 'mov-init-01',
    dataHora: '13/10/2026 19:42',
    itemId: 'est-05',
    itemNome: 'Cerveja Amstel Lager 350ml',
    tipo: 'saida_venda',
    quantidade: 8,
    unidadeMedida: 'un',
    motivo: 'Venda PDV #VD-1082: 8x Cerveja Amstel Lager 350ml',
    pedidoId: 'VD-1082',
    responsavel: 'Italo Lemos',
    saldoApos: 142,
  },
  {
    id: 'mov-init-02',
    dataHora: '13/10/2026 15:30',
    itemId: 'est-01',
    itemNome: 'Arroz Tipo 1 (Pacote 5kg)',
    tipo: 'entrada_compra',
    quantidade: 10,
    unidadeMedida: 'pct',
    motivo: 'Compra Fornecedor Supermercado Paranaíba NF #8492',
    responsavel: 'Italo Lemos',
    saldoApos: 18,
  },
];

interface EstoqueState {
  itens: ItemEstoque[];
  compras: RegistroCompra[];
  fichasTecnicas: FichaTecnica[];
  fornecedores: Fornecedor[];
  movimentacoes: MovimentacaoEstoque[];
  pedidosProcessados: string[];

  // Ações de Integração Cardápio / PDV / Vendas / Salão & Mesas
  processarBaixaVenda: (venda: VendaRealizada) => { sucesso: boolean; movimentacoesGeradas: number };
  processarBaixaItensMesa: (numeroMesa: number, itensComanda: ItemComandaMesa[], operador: string) => { sucesso: boolean; movimentacoesGeradas: number };
  estornarBaixaVenda: (venda: VendaRealizada, motivo: string, operador: string) => { sucesso: boolean; itensRestaurados: number };
  registrarMovimentacao: (mov: Omit<MovimentacaoEstoque, 'id' | 'dataHora'>) => void;

  // Ações de Estoque
  baixarEstoquePorVenda: (produtoNome: string, quantidade: number) => void;
  registrarSaidaManual: (itemId: string, quantidade: number, motivo: string) => void;
  ajustarSobraDiaAnterior: (itemId: string, sobra: number) => void;
  adicionarItemEstoque: (item: Omit<ItemEstoque, 'id'>) => void;
  editarItemEstoque: (id: string, dados: Partial<ItemEstoque>) => void;
  removerItemEstoque: (id: string) => void;

  // Ações de Compras
  adicionarCompra: (compra: Omit<RegistroCompra, 'id'>) => void;

  // Ações de Fichas Técnicas
  salvarFichaTecnica: (ficha: FichaTecnica) => void;

  // Ações de Fornecedores
  adicionarFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => void;

  // Consumo diário automático na abertura
  processarAberturaDiaConsumoPrevisto: () => void;
}

export const useEstoqueStore = create<EstoqueState>()(
  persist(
    (set, get) => ({
      itens: ITENS_ESTOQUE_INICIAIS,
      compras: HISTORICO_COMPRAS_INICIAIS,
      fichasTecnicas: FICHAS_TECNICAS_INICIAIS,
      fornecedores: FORNECEDORES_INICIAIS,
      movimentacoes: HISTORICO_MOVIMENTACOES_INICIAIS,
      pedidosProcessados: ['VD-1082'],

      // ==============================================================
      // BAIXA AUTOMÁTICA EM VENDAS COM FICHA TÉCNICA (SEÇÃO 2 E 4)
      // ==============================================================
      processarBaixaVenda: (venda) => {
        const state = get();
        // Proteção contra baixas duplicadas para o mesmo pedido (idempotência)
        if (state.pedidosProcessados.includes(venda.id)) {
          return { sucesso: false, movimentacoesGeradas: 0 };
        }

        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const itensAtuais = state.itens.map((item) => ({ ...item }));
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        venda.itens.forEach((itemVendido) => {
          // 1. Caso o item do prato possua Ficha Técnica / Ingredientes vinculados
          if (itemVendido.fichaTecnica && itemVendido.fichaTecnica.length > 0) {
            itemVendido.fichaTecnica.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === ing.ingredienteId);
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  ing.quantidade,
                  ing.unidadeMedida,
                  itemEst.unidadeMedida
                );
                const totalConsumo = Number((qtdPorPorcaoNaUnidadeEstoque * itemVendido.quantidade).toFixed(4));
                const novoSaldo = Math.max(0, Number((itemEst.quantidadeAtual - totalConsumo).toFixed(4)));

                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (itemEst.unidadeMedida === 'un' || itemEst.categoria === 'bebidas') {
                  if (novoSaldo <= 5) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                } else {
                  if (novoSaldo <= 0.05) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                }
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.push({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  dataHora: agoraTexto,
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  tipo: 'saida_venda',
                  quantidade: totalConsumo,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Venda #${venda.id}: ${itemVendido.quantidade}x ${itemVendido.nome}`,
                  pedidoId: venda.id,
                  responsavel: venda.operador || 'Operador Caixa',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else {
            // 2. Se o prato não possui ficha técnica mas é um produto de controle individual (ex: cerveja/refrigerante)
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemVendido.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemVendido.nome.toLowerCase()) ||
                  itemVendido.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemVendido.quantidade;
              const novoSaldo = Math.max(0, itemEst.quantidadeAtual - totalConsumo);
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'saida_venda',
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Venda #${venda.id}: ${itemVendido.quantidade}x ${itemVendido.nome} (Item Direto)`,
                pedidoId: venda.id,
                responsavel: venda.operador || 'Operador Caixa',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
          pedidosProcessados: [venda.id, ...state.pedidosProcessados],
        });

        return { sucesso: true, movimentacoesGeradas: novasMovimentacoes.length };
      },

      // ==============================================================
      // BAIXA AUTOMÁTICA EM ITENS LANÇADOS NA MESA (FICHA TÉCNICA / DIRETO)
      // ==============================================================
      processarBaixaItensMesa: (numeroMesa, itensComanda, operador) => {
        const state = get();
        const itensAtuais = state.itens.map((it) => ({ ...it }));
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        itensComanda.forEach((itemLancado) => {
          // 1. Caso o prato possua Ficha Técnica cadastrada
          const ficha = state.fichasTecnicas.find((f) => f.produtoId === itemLancado.produtoId);

          if (ficha && ficha.componentes && ficha.componentes.length > 0) {
            ficha.componentes.forEach((comp) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === comp.ingredienteId);
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  comp.pesoGramas,
                  'g',
                  itemEst.unidadeMedida
                );
                const totalConsumo = Number((qtdPorPorcaoNaUnidadeEstoque * itemLancado.quantidade).toFixed(4));
                const novoSaldo = Math.max(0, Number((itemEst.quantidadeAtual - totalConsumo).toFixed(4)));

                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (itemEst.unidadeMedida === 'un' || itemEst.categoria === 'bebidas') {
                  if (novoSaldo <= 5) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                } else {
                  if (novoSaldo <= 0.05) novoStatus = 'esgotado';
                  else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
                  else novoStatus = 'disponivel';
                }
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.unshift({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  dataHora: agoraTexto,
                  tipo: 'saida_venda',
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  quantidade: totalConsumo,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Mesa #${numeroMesa}: ${itemLancado.quantidade}x ${itemLancado.nome} (Ficha Técnica)`,
                  pedidoId: `Mesa-${numeroMesa}`,
                  responsavel: operador || 'Garçom',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else {
            // 2. Se não possui ficha técnica mas é um produto de controle individual (ex: cerveja/refrigerante)
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemLancado.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemLancado.nome.toLowerCase()) ||
                  itemLancado.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalConsumo = itemLancado.quantidade;
              const novoSaldo = Math.max(0, itemEst.quantidadeAtual - totalConsumo);
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo <= 5) novoStatus = 'esgotado';
              else if (novoSaldo <= itemEst.estoqueMinimo) novoStatus = 'esgotando';
              else novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.unshift({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                dataHora: agoraTexto,
                tipo: 'saida_venda',
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                quantidade: totalConsumo,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Mesa #${numeroMesa}: ${itemLancado.quantidade}x ${itemLancado.nome} (Item Direto)`,
                pedidoId: `Mesa-${numeroMesa}`,
                responsavel: operador || 'Garçom',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
        });

        return { sucesso: true, movimentacoesGeradas: novasMovimentacoes.length };
      },

      // ==============================================================
      // ESTORNO / CANCELAMENTO DE VENDA COM RESTITUIÇÃO AO ESTOQUE
      // ==============================================================
      estornarBaixaVenda: (venda, motivo, operador) => {
        const state = get();
        const novasMovimentacoes: MovimentacaoEstoque[] = [];
        const itensAtuais = state.itens.map((item) => ({ ...item }));
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        venda.itens.forEach((itemVendido) => {
          if (itemVendido.fichaTecnica && itemVendido.fichaTecnica.length > 0) {
            itemVendido.fichaTecnica.forEach((ing) => {
              const itemIdx = itensAtuais.findIndex((it) => it.id === ing.ingredienteId);
              if (itemIdx > -1) {
                const itemEst = itensAtuais[itemIdx];
                const qtdPorPorcaoNaUnidadeEstoque = converterParaUnidadeEstoque(
                  ing.quantidade,
                  ing.unidadeMedida,
                  itemEst.unidadeMedida
                );
                const totalDevolvido = Number((qtdPorPorcaoNaUnidadeEstoque * itemVendido.quantidade).toFixed(4));
                const novoSaldo = Number((itemEst.quantidadeAtual + totalDevolvido).toFixed(4));
                itemEst.quantidadeAtual = novoSaldo;
                let novoStatus = itemEst.statusDisponibilidade;
                if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
                else if (novoSaldo > 0) novoStatus = 'esgotando';
                itemEst.statusDisponibilidade = novoStatus;

                novasMovimentacoes.push({
                  id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  dataHora: agoraTexto,
                  itemId: itemEst.id,
                  itemNome: itemEst.nome,
                  tipo: 'estorno_cancelamento',
                  quantidade: totalDevolvido,
                  unidadeMedida: itemEst.unidadeMedida,
                  motivo: `Estorno Venda #${venda.id}: ${motivo || 'Cancelamento'} (${itemVendido.quantidade}x ${itemVendido.nome})`,
                  pedidoId: venda.id,
                  responsavel: operador || 'Operador / Admin',
                  saldoApos: novoSaldo,
                });
              }
            });
          } else {
            const itemIdx = itensAtuais.findIndex(
              (it) =>
                it.metodoControle === 'individual' &&
                (it.nome.toLowerCase() === itemVendido.nome.toLowerCase() ||
                  it.nome.toLowerCase().includes(itemVendido.nome.toLowerCase()) ||
                  itemVendido.nome.toLowerCase().includes(it.nome.toLowerCase()))
            );

            if (itemIdx > -1) {
              const itemEst = itensAtuais[itemIdx];
              const totalDevolvido = itemVendido.quantidade;
              const novoSaldo = itemEst.quantidadeAtual + totalDevolvido;
              itemEst.quantidadeAtual = novoSaldo;
              let novoStatus = itemEst.statusDisponibilidade;
              if (novoSaldo > itemEst.estoqueMinimo) novoStatus = 'disponivel';
              itemEst.statusDisponibilidade = novoStatus;

              novasMovimentacoes.push({
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                dataHora: agoraTexto,
                itemId: itemEst.id,
                itemNome: itemEst.nome,
                tipo: 'estorno_cancelamento',
                quantidade: totalDevolvido,
                unidadeMedida: itemEst.unidadeMedida,
                motivo: `Estorno Venda #${venda.id}: ${motivo || 'Cancelamento'} (Item Direto)`,
                pedidoId: venda.id,
                responsavel: operador || 'Operador / Admin',
                saldoApos: novoSaldo,
              });
            }
          }
        });

        set({
          itens: itensAtuais,
          movimentacoes: [...novasMovimentacoes, ...state.movimentacoes],
          pedidosProcessados: state.pedidosProcessados.filter((id) => id !== venda.id),
        });

        return { sucesso: true, itensRestaurados: novasMovimentacoes.length };
      },

      registrarMovimentacao: (mov) => {
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const novaMov: MovimentacaoEstoque = {
          ...mov,
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dataHora: agoraTexto,
        };
        set((state) => ({ movimentacoes: [novaMov, ...state.movimentacoes] }));
      },

      baixarEstoquePorVenda: (produtoNome, quantidade) => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (
              item.nome.toLowerCase().includes(produtoNome.toLowerCase()) ||
              produtoNome.toLowerCase().includes(item.nome.toLowerCase())
            ) {
              const novaQtd = Math.max(0, Number((item.quantidadeAtual - quantidade).toFixed(2)));
              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              if (item.unidadeMedida === 'un' || item.categoria === 'bebidas') {
                if (novaQtd <= 5) novoStatus = 'esgotado';
                else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
              } else {
                if (novaQtd <= 0) novoStatus = 'esgotado';
                else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
              }
              return { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            }
            return item;
          }),
        }));
      },

      registrarSaidaManual: (itemId, quantidade, motivo) => {
        const state = get();
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let itemModificado: ItemEstoque | null = null;
        const itensAtualizados = state.itens.map((item) => {
          if (item.id === itemId) {
            const novaQtd = Math.max(0, item.quantidadeAtual - quantidade);
            let novoStatus = item.statusDisponibilidade;
            if (novaQtd <= 5 && (item.unidadeMedida === 'un' || item.categoria === 'bebidas')) novoStatus = 'esgotado';
            else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
            itemModificado = { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            return itemModificado;
          }
          return item;
        });

        const novasMovimentacoes = [...state.movimentacoes];
        if (itemModificado) {
          const itemCast = itemModificado as ItemEstoque;
          novasMovimentacoes.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            dataHora: agoraTexto,
            itemId: itemCast.id,
            itemNome: itemCast.nome,
            tipo: 'saida_manual',
            quantidade,
            unidadeMedida: itemCast.unidadeMedida,
            motivo: motivo || 'Uso operacional / descarte interno',
            responsavel: 'Operador / Cozinha',
            saldoApos: itemCast.quantidadeAtual,
          });
        }

        set({
          itens: itensAtualizados,
          movimentacoes: novasMovimentacoes,
        });
      },

      ajustarSobraDiaAnterior: (itemId, sobra) => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.id === itemId) {
              return { ...item, sobraDiaAnterior: sobra };
            }
            return item;
          }),
        }));
      },

      adicionarItemEstoque: (item) => {
        const novo: ItemEstoque = {
          ...item,
          id: `est-${Date.now().toString().slice(-4)}`,
        };
        set((state) => ({ itens: [novo, ...state.itens] }));
      },

      editarItemEstoque: (id, dados) => {
        set((state) => ({
          itens: state.itens.map((item) => (item.id === id ? { ...item, ...dados } : item)),
        }));
      },

      removerItemEstoque: (id) => {
        set((state) => ({
          itens: state.itens.filter((item) => item.id !== id),
        }));
      },

      adicionarCompra: (compra) => {
        const novoId = `cmp-${Date.now().toString().slice(-4)}`;
        const novoRegistro: RegistroCompra = { ...compra, id: novoId };
        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => {
          let itemComprado: ItemEstoque | null = null;
          const itensAtualizados = state.itens.map((item) => {
            if (item.nome.toLowerCase() === compra.produtoNome.toLowerCase()) {
              const qtdAdicionada = compra.quantidade;
              const novaQtd = item.quantidadeAtual + qtdAdicionada;
              let novoStatus = item.statusDisponibilidade;
              if (novaQtd > item.estoqueMinimo) novoStatus = 'disponivel';
              itemComprado = {
                ...item,
                quantidadeAtual: novaQtd,
                precoCusto: compra.precoUnitario,
                statusDisponibilidade: novoStatus,
              };
              return itemComprado;
            }
            return item;
          });

          const novasMovimentacoes = [...state.movimentacoes];
          if (itemComprado) {
            const itemCast = itemComprado as ItemEstoque;
            novasMovimentacoes.unshift({
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              dataHora: agoraTexto,
              itemId: itemCast.id,
              itemNome: itemCast.nome,
              tipo: 'entrada_compra',
              quantidade: compra.quantidade,
              unidadeMedida: compra.unidadeMedida,
              motivo: `Compra NF / Fornecedor: ${compra.fornecedorOuLocal}`,
              responsavel: 'Compras / Almoxarifado',
              saldoApos: itemCast.quantidadeAtual,
            });
          }

          return {
            compras: [novoRegistro, ...state.compras],
            itens: itensAtualizados,
            movimentacoes: novasMovimentacoes,
          };
        });
      },

      salvarFichaTecnica: (ficha) => {
        set((state) => {
          const existe = state.fichasTecnicas.some((f) => f.id === ficha.id || f.produtoId === ficha.produtoId);
          if (existe) {
            return {
              fichasTecnicas: state.fichasTecnicas.map((f) =>
                f.id === ficha.id || f.produtoId === ficha.produtoId ? ficha : f
              ),
            };
          }
          return { fichasTecnicas: [...state.fichasTecnicas, ficha] };
        });
      },

      adicionarFornecedor: (fornecedor) => {
        const novo: Fornecedor = {
          ...fornecedor,
          id: `forn-${Date.now().toString().slice(-4)}`,
        };
        set((state) => ({ fornecedores: [...state.fornecedores, novo] }));
      },

      processarAberturaDiaConsumoPrevisto: () => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.metodoControle === 'recorrente' && item.consumoDiarioPrevisto) {
              const descontoEfetivo = Math.max(0, item.consumoDiarioPrevisto - (item.sobraDiaAnterior || 0));
              const novaQtd = Math.max(0, item.quantidadeAtual - descontoEfetivo);
              return {
                ...item,
                quantidadeAtual: Number(novaQtd.toFixed(2)),
                sobraDiaAnterior: 0,
              };
            }
            return item;
          }),
        }));
      },
    }),
    {
      name: 'eloserve_estoque_store_v2',
    }
  )
);
