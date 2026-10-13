import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto, Categoria } from '../types';

const categoriasIniciais: Categoria[] = [
  { id: 'c1', nome: 'Burgers Artesanais' },
  { id: 'c2', nome: 'Pizzas & Calzones' },
  { id: 'c3', nome: 'Porções & Fritas' },
  { id: 'c4', nome: 'Bebidas & Chopp' },
  { id: 'c5', nome: 'Sobremesas' },
];

const produtosIniciais: Produto[] = [
  {
    id: 'p1',
    categoriaId: 'c1',
    nome: 'Smash Burguer Bacon Artesanal',
    descricao: 'Dois blends de 90g prensados, queijo cheddar inglês, fatias crocantes de bacon e maionese defumada.',
    precoVenda: 34.9,
    precoCusto: 11.2,
    setorPreparo: 'cozinha',
    disponivel: true,
    destaque: true,
  },
  {
    id: 'p2',
    categoriaId: 'c1',
    nome: 'Burger Clássico & Salada Fresca',
    descricao: 'Blend 160g, queijo prato derretido, alface americana, tomate fresco e picles artesanal.',
    precoVenda: 29.9,
    precoCusto: 9.8,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p3',
    categoriaId: 'c1',
    nome: 'Gorgonzola & Cebola Caramelizada',
    descricao: 'Blend 180g alto e suculento, creme de queijo gorgonzola e cebola caramelizada no pão brioche.',
    precoVenda: 38.0,
    precoCusto: 13.5,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p4',
    categoriaId: 'c2',
    nome: 'Pizza Margherita Especial',
    descricao: 'Molho pelati italiano, mussarela de búfala, manjericão fresco e azeite extravirgem.',
    precoVenda: 58.0,
    precoCusto: 16.0,
    setorPreparo: 'cozinha',
    disponivel: true,
    destaque: true,
  },
  {
    id: 'p5',
    categoriaId: 'c2',
    nome: 'Pizza Calabresa Artesanal',
    descricao: 'Calabresa curada defumada em fatias finas, cebola roxa e azeitonas pretas chilenas.',
    precoVenda: 52.0,
    precoCusto: 14.5,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p6',
    categoriaId: 'c3',
    nome: 'Batata Rústica com Alecrim',
    descricao: 'Batatas rústicas com casca, fritas na hora com sal grosso, alho confit e alecrim fresco.',
    precoVenda: 24.5,
    precoCusto: 4.8,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p7',
    categoriaId: 'c3',
    nome: 'Coxinha Cremosa sem Massa (6 un)',
    descricao: 'Recheio 100% de frango desfiado com muito requeijão cremoso, empanada na farinha panko.',
    precoVenda: 28.0,
    precoCusto: 7.0,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p8',
    categoriaId: 'c4',
    nome: 'Chopp IPA Artesanal 500ml',
    descricao: 'Chopp artesanal fresco, notas cítricas e amargor balanceado.',
    precoVenda: 18.0,
    precoCusto: 6.5,
    setorPreparo: 'bar',
    disponivel: true,
  },
  {
    id: 'p9',
    categoriaId: 'c4',
    nome: 'Coca-Cola Original 350ml',
    descricao: 'Lata gelada 350ml.',
    precoVenda: 7.5,
    precoCusto: 3.2,
    setorPreparo: 'bar',
    disponivel: true,
  },
  {
    id: 'p10',
    categoriaId: 'c4',
    nome: 'Suco Natural de Laranja 400ml',
    descricao: 'Feito na hora, 100% puro da fruta sem adição de água ou conservantes.',
    precoVenda: 12.0,
    precoCusto: 3.0,
    setorPreparo: 'bar',
    disponivel: true,
  },
  {
    id: 'p11',
    categoriaId: 'c5',
    nome: 'Pudim de Leite Condensado',
    descricao: 'Receita tradicional cremosa sem furinhos, com calda de caramelo dourado.',
    precoVenda: 14.0,
    precoCusto: 3.8,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
  {
    id: 'p12',
    categoriaId: 'c5',
    nome: 'Brownie de Chocolate com Sorvete',
    descricao: 'Brownie quente de chocolate 70% com nozes, acompanhado de sorvete de baunilha.',
    precoVenda: 22.0,
    precoCusto: 6.2,
    setorPreparo: 'cozinha',
    disponivel: true,
  },
];

interface ProductState {
  produtos: Produto[];
  categorias: Categoria[];
  adicionarProduto: (produto: Omit<Produto, 'id'>) => Produto;
  editarProduto: (id: string, dados: Partial<Produto>) => void;
  removerProduto: (id: string) => void;
  atualizarPreco: (id: string, novoPreco: number) => void;
  alternarDisponibilidade: (id: string) => void;
  adicionarCategoria: (nome: string) => Categoria;
  removerCategoria: (id: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      produtos: produtosIniciais,
      categorias: categoriasIniciais,

      adicionarProduto: (novo) => {
        const novoProduto: Produto = {
          ...novo,
          id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };
        set((state) => ({ produtos: [novoProduto, ...state.produtos] }));
        return novoProduto;
      },

      editarProduto: (id, dados) => {
        set((state) => ({
          produtos: state.produtos.map((p) => (p.id === id ? { ...p, ...dados } : p)),
        }));
      },

      removerProduto: (id) => {
        set((state) => ({
          produtos: state.produtos.filter((p) => p.id !== id),
        }));
      },

      atualizarPreco: (id, novoPreco) => {
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === id ? { ...p, precoVenda: Number(novoPreco.toFixed(2)) } : p
          ),
        }));
      },

      alternarDisponibilidade: (id) => {
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === id ? { ...p, disponivel: !p.disponivel } : p
          ),
        }));
      },

      adicionarCategoria: (nome) => {
        const novaCat: Categoria = {
          id: `c-${Date.now()}`,
          nome: nome.trim(),
        };
        set((state) => ({ categorias: [...state.categorias, novaCat] }));
        return novaCat;
      },

      removerCategoria: (id) => {
        set((state) => ({
          categorias: state.categorias.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: 'eloserve_produtos_v2',
    }
  )
);
