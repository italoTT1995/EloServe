import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ItemEstoque,
  CategoriaEstoque,
  RegistroCompra,
  FichaTecnica,
  Fornecedor,
} from '../types';

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
    id: 'est-01',
    nome: 'Arroz Tipo 1 (Pacote 5kg)',
    categoria: 'alimentos',
    metodoControle: 'recorrente',
    quantidadeAtual: 18,
    unidadeMedida: 'pct',
    consumoDiarioPrevisto: 1, // 1 pacote de 5kg por dia
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
    quantidadeAtual: 142, // Iniciou com 150, saíram 8
    unidadeMedida: 'un',
    estoqueMinimo: 24,
    estoqueIdeal: 200,
    precoCusto: 3.5,
    precoVenda: 7.0, // Margem bruta 50%
    statusDisponibilidade: 'disponivel',
    fornecedorHabitual: 'Distribuidora de Bebidas BH',
  },
  {
    id: 'est-06',
    nome: 'Cerveja Heineken Long Neck 330ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 4, // Menos de 5 = Esgotado conforme regra de segurança!
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
    precoUnitario: 20.99, // Economia de R$ 4,00 por pacote comprovada!
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
    produtoId: 'pf-01',
    nomePrato: 'Prato Feito Tradicional (PF Mineiro)',
    componentes: [
      { ingredienteId: 'est-01', ingredienteNome: 'Arroz Branco', pesoGramas: 150, custoPorGrama: 0.0042, custoTotalComponente: 0.63 },
      { ingredienteId: 'est-02', ingredienteNome: 'Feijão Carioca', pesoGramas: 100, custoPorGrama: 0.0078, custoTotalComponente: 0.78 },
      { ingredienteId: 'est-mac', ingredienteNome: 'Macarrão Alho e Óleo', pesoGramas: 100, custoPorGrama: 0.0055, custoTotalComponente: 0.55 },
      { ingredienteId: 'est-far', ingredienteNome: 'Farofa Especial', pesoGramas: 50, custoPorGrama: 0.006, custoTotalComponente: 0.3 },
      { ingredienteId: 'est-sal', ingredienteNome: 'Salada de Tomate e Alface', pesoGramas: 50, custoPorGrama: 0.008, custoTotalComponente: 0.4 },
      { ingredienteId: 'est-04', ingredienteNome: 'Bife de Porco Grelhado', pesoGramas: 180, custoPorGrama: 0.0199, custoTotalComponente: 3.58 },
    ],
    custoTotalEstimado: 6.24,
    precoVenda: 25.0,
    margemBrutaPercentual: 75.04,
  },
  {
    id: 'ft-02',
    produtoId: 'p6',
    nomePrato: 'Batata Rústica com Alecrim (Porção 500g)',
    componentes: [
      { ingredienteId: 'est-03', ingredienteNome: 'Batata Pré-Frita Congelada', pesoGramas: 500, custoPorGrama: 0.0085, custoTotalComponente: 4.25 },
      { ingredienteId: 'est-tem', ingredienteNome: 'Alecrim, Sal Grosso e Alho Confit', pesoGramas: 20, custoPorGrama: 0.0275, custoTotalComponente: 0.55 },
    ],
    custoTotalEstimado: 4.8,
    precoVenda: 24.5,
    margemBrutaPercentual: 80.4,
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
];

interface EstoqueState {
  itens: ItemEstoque[];
  compras: RegistroCompra[];
  fichasTecnicas: FichaTecnica[];
  fornecedores: Fornecedor[];
  
  // Ações de Estoque
  baixarEstoquePorVenda: (produtoNome: string, quantidade: number) => void;
  registrarSaidaManual: (itemId: string, quantidade: number, motivo: string) => void;
  ajustarSobraDiaAnterior: (itemId: string, sobra: number) => void;
  adicionarItemEstoque: (item: Omit<ItemEstoque, 'id'>) => void;
  editarItemEstoque: (id: string, dados: Partial<ItemEstoque>) => void;
  
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

      baixarEstoquePorVenda: (produtoNome, quantidade) => {
        set((state) => ({
          itens: state.itens.map((item) => {
            // Verifica se é o produto direto ou componente
            if (item.nome.toLowerCase().includes(produtoNome.toLowerCase()) || produtoNome.toLowerCase().includes(item.nome.toLowerCase())) {
              const novaQtd = Math.max(0, Number((item.quantidadeAtual - quantidade).toFixed(2)));
              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              // Regra de segurança: 5 ou menos = esgotado
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

      registrarSaidaManual: (itemId, quantidade, _motivo) => {
        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.id === itemId) {
              const novaQtd = Math.max(0, item.quantidadeAtual - quantidade);
              let novoStatus = item.statusDisponibilidade;
              if (novaQtd <= 5 && (item.unidadeMedida === 'un' || item.categoria === 'bebidas')) novoStatus = 'esgotado';
              else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';
              return { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            }
            return item;
          }),
        }));
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

      adicionarCompra: (compra) => {
        const novoId = `cmp-${Date.now().toString().slice(-4)}`;
        const novoRegistro: RegistroCompra = { ...compra, id: novoId };

        set((state) => {
          // Atualiza estoque automaticamente com a entrada de compra (Seção 1.10.3 / 20.4)
          const itensAtualizados = state.itens.map((item) => {
            if (item.nome.toLowerCase() === compra.produtoNome.toLowerCase()) {
              const qtdAdicionada = compra.quantidade;
              const novaQtd = item.quantidadeAtual + qtdAdicionada;
              let novoStatus = item.statusDisponibilidade;
              if (novaQtd > item.estoqueMinimo) novoStatus = 'disponivel';
              return {
                ...item,
                quantidadeAtual: novaQtd,
                precoCusto: compra.precoUnitario,
                statusDisponibilidade: novoStatus,
              };
            }
            return item;
          });

          return {
            compras: [novoRegistro, ...state.compras],
            itens: itensAtualizados,
          };
        });
      },

      salvarFichaTecnica: (ficha) => {
        set((state) => {
          const existe = state.fichasTecnicas.some((f) => f.id === ficha.id);
          if (existe) {
            return {
              fichasTecnicas: state.fichasTecnicas.map((f) => (f.id === ficha.id ? ficha : f)),
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
              // Se teve sobra, desconta apenas o necessário para completar a média
              const descontoEfetivo = Math.max(0, item.consumoDiarioPrevisto - (item.sobraDiaAnterior || 0));
              const novaQtd = Math.max(0, item.quantidadeAtual - descontoEfetivo);
              return {
                ...item,
                quantidadeAtual: Number(novaQtd.toFixed(2)),
                sobraDiaAnterior: 0, // Reset da sobra para o novo expediente
              };
            }
            return item;
          }),
        }));
      },
    }),
    {
      name: 'eloserve_estoque_store_v1',
    }
  )
);
