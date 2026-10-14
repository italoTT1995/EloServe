import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ItemEstoque,
  CategoriaEstoque,
  RegistroCompra,
  FichaTecnica,
  Fornecedor,
  Produto,
} from '../types';
import { useProductStore } from './useProductStore';

export const CATEGORIAS_ESTOQUE_NOMES: Record<CategoriaEstoque, string> = {
  alimentos: 'Alimentos & Insumos',
  bebidas: 'Bebidas',
  higiene: 'Higiene & Proteção Individual',
  utensilios: 'Utensílios & Equipamentos de Cozinha',
  limpeza: 'Produtos & Utensílios de Limpeza',
  balcao: 'Materiais de Balcão & Atendimento',
};

const ITENS_ESTOQUE_INICIAIS: ItemEstoque[] = [
  // =========================================================================
  // 1. Pratos e Bebidas do Cardápio Fogo de Minas (Sincronizados e Vinculados)
  // =========================================================================
  {
    id: 'est-card-p_fg_1',
    produtoId: 'p_fg_1',
    nome: 'Picanha Angus na Brasa (2 pessoas)',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 18,
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 30,
    precoCusto: 46.0,
    precoVenda: 128.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-card-p_fg_2',
    produtoId: 'p_fg_2',
    nome: 'Bife Ancho com Chimichurri Uruguaio',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 14,
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 25,
    precoCusto: 28.0,
    precoVenda: 79.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-card-p_fg_9',
    produtoId: 'p_fg_9',
    nome: 'Filé Mignon com Manteiga de Ervas',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 12,
    unidadeMedida: 'un',
    estoqueMinimo: 4,
    estoqueIdeal: 20,
    precoCusto: 32.0,
    precoVenda: 89.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-card-p_fg_3',
    produtoId: 'p_fg_3',
    nome: 'Costela no Bafo com Mandioca na Manteiga',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 0, // Zerado no cardápio -> indisponível
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 20,
    precoCusto: 30.0,
    precoVenda: 84.0,
    statusDisponibilidade: 'esgotado',
    fotoUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-card-p_fg_4',
    produtoId: 'p_fg_4',
    nome: 'Linguiça Artesanal de Pernil na Brasa',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 22,
    unidadeMedida: 'un',
    estoqueMinimo: 6,
    estoqueIdeal: 35,
    precoCusto: 10.0,
    precoVenda: 34.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Frigorífico Central',
  },
  {
    id: 'est-card-p_fg_10',
    produtoId: 'p_fg_10',
    nome: 'Frango Grelhado na Brasa com Limão',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 16,
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 25,
    precoCusto: 14.0,
    precoVenda: 42.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Avícola Santa Rita',
  },
  {
    id: 'est-card-p_fg_5',
    produtoId: 'p_fg_5',
    nome: 'Farofa de Ovos com Bacon & Couve Crocante',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 0, // Zerado no cardápio -> indisponível
    unidadeMedida: 'un',
    estoqueMinimo: 4,
    estoqueIdeal: 20,
    precoCusto: 4.5,
    precoVenda: 19.0,
    statusDisponibilidade: 'esgotado',
    fotoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Supermercado BH',
  },
  {
    id: 'est-card-p_fg_11',
    produtoId: 'p_fg_11',
    nome: 'Batata Rústica com Alecrim e Alho',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 15,
    unidadeMedida: 'un',
    estoqueMinimo: 5,
    estoqueIdeal: 25,
    precoCusto: 5.5,
    precoVenda: 24.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Atacadão Alimentos',
  },
  {
    id: 'est-card-p_fg_6',
    produtoId: 'p_fg_6',
    nome: 'Chopp Brahma 500ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 58,
    unidadeMedida: 'un',
    estoqueMinimo: 20,
    estoqueIdeal: 100,
    precoCusto: 5.5,
    precoVenda: 15.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1608270546103-976214151a56?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Distribuidora de Bebidas BH',
  },
  {
    id: 'est-card-p_fg_12',
    produtoId: 'p_fg_12',
    nome: 'Cerveja Heineken 600ml Garrafa',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 42,
    unidadeMedida: 'un',
    estoqueMinimo: 15,
    estoqueIdeal: 80,
    precoCusto: 8.5,
    precoVenda: 18.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1618886614638-80e3c153d31a?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Distribuidora de Bebidas BH',
  },
  {
    id: 'est-card-p_fg_7',
    produtoId: 'p_fg_7',
    nome: 'Vinho Tinto Malbec Reserva 750ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 11,
    unidadeMedida: 'un',
    estoqueMinimo: 6,
    estoqueIdeal: 24,
    precoCusto: 42.0,
    precoVenda: 95.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Adega & Vinhos Nobres',
  },
  {
    id: 'est-card-p_fg_13',
    produtoId: 'p_fg_13',
    nome: 'Refrigerante Lata 350ml',
    categoria: 'bebidas',
    metodoControle: 'individual',
    quantidadeAtual: 68,
    unidadeMedida: 'un',
    estoqueMinimo: 20,
    estoqueIdeal: 100,
    precoCusto: 3.0,
    precoVenda: 8.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Atacadão Alimentos',
  },
  {
    id: 'est-card-p_fg_8',
    produtoId: 'p_fg_8',
    nome: 'Pudim de Leite com Calda de Queijo Canastra',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 9,
    unidadeMedida: 'un',
    estoqueMinimo: 4,
    estoqueIdeal: 15,
    precoCusto: 4.0,
    precoVenda: 16.0,
    statusDisponibilidade: 'disponivel',
    fotoUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Confeitaria da Vovó',
  },
  {
    id: 'est-card-p_fg_14',
    produtoId: 'p_fg_14',
    nome: 'Petit Gâteau de Chocolate com Sorvete',
    categoria: 'alimentos',
    metodoControle: 'individual',
    quantidadeAtual: 0, // Zerado no cardápio -> indisponível
    unidadeMedida: 'un',
    estoqueMinimo: 4,
    estoqueIdeal: 15,
    precoCusto: 7.0,
    precoVenda: 24.0,
    statusDisponibilidade: 'esgotado',
    fotoUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80',
    fornecedorHabitual: 'Confeitaria da Vovó',
  },

  // =========================================================================
  // 2. Alimentos e Insumos Gerais (Recorrente / Ficha Técnica)
  // =========================================================================
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

  // =========================================================================
  // 3. Bebidas Adicionais
  // =========================================================================
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

  // =========================================================================
  // 4. Higiene e Proteção Individual
  // =========================================================================
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

  // =========================================================================
  // 5. Utensílios e Equipamentos de Cozinha
  // =========================================================================
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

  // =========================================================================
  // 6. Produtos e Utensílios de Limpeza
  // =========================================================================
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

  // =========================================================================
  // 7. Materiais de Balcão e Atendimento
  // =========================================================================
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
  baixarEstoquePorVenda: (produtoNomeOuId: string, quantidade: number) => void;
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

  // Ações de Sincronização Bidirecional com o Cardápio
  sincronizarProdutoDoCardapio: (prod: Produto) => void;
  removerDoCardapio: (produtoId: string) => void;
  abastecerRapido: (idOuProdutoId: string, quantidadeAdicional: number, motivo?: string) => void;
  ajustarQuantidadeEstoque: (idOuProdutoId: string, novaQuantidade: number) => void;
  obterItemPorProdutoId: (produtoId: string) => ItemEstoque | undefined;
  sincronizarTodosOsProdutosDoCardapio: (produtos: Produto[]) => void;
}

export const useEstoqueStore = create<EstoqueState>()(
  persist(
    (set, get) => ({
      itens: ITENS_ESTOQUE_INICIAIS,
      compras: HISTORICO_COMPRAS_INICIAIS,
      fichasTecnicas: FICHAS_TECNICAS_INICIAIS,
      fornecedores: FORNECEDORES_INICIAIS,

      obterItemPorProdutoId: (produtoId: string) => {
        return get().itens.find(
          (it) => it.produtoId === produtoId || it.id === `est-card-${produtoId}`
        );
      },

      sincronizarProdutoDoCardapio: (prod: Produto) => {
        set((state) => {
          const itemIndex = state.itens.findIndex(
            (it) =>
              it.produtoId === prod.id ||
              it.id === `est-card-${prod.id}` ||
              it.nome.trim().toLowerCase() === prod.nome.trim().toLowerCase()
          );

          const qtdAtual =
            prod.quantidadeEstoque !== undefined
              ? prod.quantidadeEstoque
              : itemIndex >= 0
              ? state.itens[itemIndex].quantidadeAtual
              : 20;

          const estMinimo =
            prod.estoqueMinimo !== undefined
              ? prod.estoqueMinimo
              : itemIndex >= 0
              ? state.itens[itemIndex].estoqueMinimo
              : 5;

          let status: ItemEstoque['statusDisponibilidade'] = 'disponivel';
          if (qtdAtual <= 0) {
            status = 'esgotado';
          } else if (qtdAtual <= estMinimo) {
            status = 'esgotando';
          }

          if (itemIndex >= 0) {
            const itensAtualizados = [...state.itens];
            itensAtualizados[itemIndex] = {
              ...itensAtualizados[itemIndex],
              produtoId: prod.id,
              nome: prod.nome,
              precoVenda: prod.precoVenda,
              precoCusto: prod.precoCusto !== undefined ? prod.precoCusto : itensAtualizados[itemIndex].precoCusto,
              fotoUrl: prod.fotoUrl || itensAtualizados[itemIndex].fotoUrl,
              quantidadeAtual: qtdAtual,
              estoqueMinimo: estMinimo,
              unidadeMedida: (prod.unidadeEstoque as any) || itensAtualizados[itemIndex].unidadeMedida || 'un',
              statusDisponibilidade: status,
            };
            return { itens: itensAtualizados };
          } else {
            const novoItem: ItemEstoque = {
              id: `est-card-${prod.id}`,
              produtoId: prod.id,
              nome: prod.nome,
              categoria: prod.setorPreparo === 'bar' ? 'bebidas' : 'alimentos',
              metodoControle: 'individual',
              quantidadeAtual: qtdAtual,
              unidadeMedida: (prod.unidadeEstoque as any) || 'un',
              estoqueMinimo: estMinimo,
              estoqueIdeal: estMinimo * 4,
              precoCusto: prod.precoCusto || 0,
              precoVenda: prod.precoVenda,
              statusDisponibilidade: status,
              fotoUrl: prod.fotoUrl,
            };
            return { itens: [novoItem, ...state.itens] };
          }
        });
      },

      removerDoCardapio: (produtoId: string) => {
        set((state) => ({
          itens: state.itens.filter(
            (it) => it.produtoId !== produtoId && it.id !== `est-card-${produtoId}`
          ),
        }));
      },

      abastecerRapido: (idOuProdutoId: string, quantidadeAdicional: number, _motivo?: string) => {
        let produtoIdVinculado: string | undefined;
        let novaQtdFinal = 0;

        set((state) => {
          const itensAtualizados = state.itens.map((it) => {
            if (it.id === idOuProdutoId || it.produtoId === idOuProdutoId) {
              const novaQtd = Math.max(0, Number((it.quantidadeAtual + quantidadeAdicional).toFixed(2)));
              novaQtdFinal = novaQtd;
              produtoIdVinculado = it.produtoId;

              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              if (novaQtd <= 0) novoStatus = 'esgotado';
              else if (novaQtd <= it.estoqueMinimo) novoStatus = 'esgotando';

              return {
                ...it,
                quantidadeAtual: novaQtd,
                statusDisponibilidade: novoStatus,
              };
            }
            return it;
          });

          return { itens: itensAtualizados };
        });

        // Sincroniza em tempo real com o Cardápio (useProductStore)
        if (produtoIdVinculado) {
          try {
            const prodStore = useProductStore.getState();
            prodStore.editarProduto(produtoIdVinculado, {
              quantidadeEstoque: novaQtdFinal,
              disponivel: novaQtdFinal > 0,
            });
          } catch (e) {
            console.error('Erro ao refletir abastecimento no Cardapio:', e);
          }
        }
      },

      ajustarQuantidadeEstoque: (idOuProdutoId: string, novaQuantidade: number) => {
        let produtoIdVinculado: string | undefined;
        const qtdAjustada = Math.max(0, Number(novaQuantidade.toFixed(2)));

        set((state) => {
          const itensAtualizados = state.itens.map((it) => {
            if (it.id === idOuProdutoId || it.produtoId === idOuProdutoId) {
              produtoIdVinculado = it.produtoId;

              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              if (qtdAjustada <= 0) novoStatus = 'esgotado';
              else if (qtdAjustada <= it.estoqueMinimo) novoStatus = 'esgotando';

              return {
                ...it,
                quantidadeAtual: qtdAjustada,
                statusDisponibilidade: novoStatus,
              };
            }
            return it;
          });

          return { itens: itensAtualizados };
        });

        // Sincroniza em tempo real com o Cardápio
        if (produtoIdVinculado) {
          try {
            const prodStore = useProductStore.getState();
            prodStore.editarProduto(produtoIdVinculado, {
              quantidadeEstoque: qtdAjustada,
              disponivel: qtdAjustada > 0,
            });
          } catch (e) {
            console.error('Erro ao ajustar quantidade no Cardapio:', e);
          }
        }
      },

      sincronizarTodosOsProdutosDoCardapio: (produtos: Produto[]) => {
        produtos.forEach((p) => {
          get().sincronizarProdutoDoCardapio(p);
        });
      },

      baixarEstoquePorVenda: (produtoNomeOuId, quantidade) => {
        const produtosZerados: string[] = [];

        set((state) => ({
          itens: state.itens.map((item) => {
            const match =
              item.produtoId === produtoNomeOuId ||
              item.id === produtoNomeOuId ||
              item.nome.toLowerCase() === produtoNomeOuId.toLowerCase() ||
              item.nome.toLowerCase().includes(produtoNomeOuId.toLowerCase()) ||
              produtoNomeOuId.toLowerCase().includes(item.nome.toLowerCase());

            if (match) {
              const novaQtd = Math.max(0, Number((item.quantidadeAtual - quantidade).toFixed(2)));
              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';

              // Regra de segurança: 0 ou menos = esgotado
              if (novaQtd <= 0) {
                novoStatus = 'esgotado';
                if (item.produtoId) {
                  produtosZerados.push(item.produtoId);
                }
              } else if (novaQtd <= item.estoqueMinimo) {
                novoStatus = 'esgotando';
              }

              return { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            }
            return item;
          }),
        }));

        // Se o produto zerou no estoque, pausa automaticamente a venda no Cardápio!
        if (produtosZerados.length > 0) {
          try {
            const prodStore = useProductStore.getState();
            produtosZerados.forEach((pId) => {
              prodStore.editarProduto(pId, { disponivel: false, quantidadeEstoque: 0 });
            });
          } catch (e) {
            console.error('Erro ao pausar prato zerado no Cardapio:', e);
          }
        }
      },

      registrarSaidaManual: (itemId, quantidade, _motivo) => {
        let produtoIdVinculado: string | undefined;
        let novaQtdFinal = 0;

        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.id === itemId) {
              const novaQtd = Math.max(0, Number((item.quantidadeAtual - quantidade).toFixed(2)));
              novaQtdFinal = novaQtd;
              produtoIdVinculado = item.produtoId;

              let novoStatus = item.statusDisponibilidade;
              if (novaQtd <= 0) novoStatus = 'esgotado';
              else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';

              return { ...item, quantidadeAtual: novaQtd, statusDisponibilidade: novoStatus };
            }
            return item;
          }),
        }));

        if (produtoIdVinculado) {
          try {
            const prodStore = useProductStore.getState();
            prodStore.editarProduto(produtoIdVinculado, {
              quantidadeEstoque: novaQtdFinal,
              disponivel: novaQtdFinal > 0,
            });
          } catch (e) {
            console.error('Erro ao refletir saída no Cardapio:', e);
          }
        }
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
        let produtoIdVinculado: string | undefined;
        let novaQtdFinal: number | undefined;

        set((state) => ({
          itens: state.itens.map((item) => {
            if (item.id === id) {
              const atualizado = { ...item, ...dados };
              produtoIdVinculado = atualizado.produtoId;
              novaQtdFinal = atualizado.quantidadeAtual;
              return atualizado;
            }
            return item;
          }),
        }));

        if (produtoIdVinculado && novaQtdFinal !== undefined) {
          try {
            const prodStore = useProductStore.getState();
            prodStore.editarProduto(produtoIdVinculado, {
              quantidadeEstoque: novaQtdFinal,
              disponivel: novaQtdFinal > 0,
            });
          } catch (e) {
            console.error('Erro ao sincronizar edicao com Cardapio:', e);
          }
        }
      },

      adicionarCompra: (compra) => {
        const novoId = `cmp-${Date.now().toString().slice(-4)}`;
        const novoRegistro: RegistroCompra = { ...compra, id: novoId };
        const produtosReposto: { id: string; qtd: number }[] = [];

        set((state) => {
          const itensAtualizados = state.itens.map((item) => {
            if (
              item.nome.trim().toLowerCase() === compra.produtoNome.trim().toLowerCase() ||
              item.id === compra.produtoNome
            ) {
              const qtdAdicionada = compra.quantidade;
              const novaQtd = Number((item.quantidadeAtual + qtdAdicionada).toFixed(2));
              let novoStatus: ItemEstoque['statusDisponibilidade'] = 'disponivel';
              if (novaQtd <= 0) novoStatus = 'esgotado';
              else if (novaQtd <= item.estoqueMinimo) novoStatus = 'esgotando';

              if (item.produtoId && novaQtd > 0) {
                produtosReposto.push({ id: item.produtoId, qtd: novaQtd });
              }

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

        // Se uma compra repôs o estoque de um prato vinculado, reativa automaticamente no Cardápio!
        if (produtosReposto.length > 0) {
          try {
            const prodStore = useProductStore.getState();
            produtosReposto.forEach((p) => {
              prodStore.editarProduto(p.id, {
                disponivel: true,
                quantidadeEstoque: p.qtd,
              });
            });
          } catch (e) {
            console.error('Erro ao reativar prato abastecido no Cardapio:', e);
          }
        }
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
