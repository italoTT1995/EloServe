import { create } from 'zustand';
import { ItemCarrinho, Produto } from '../types';

interface CartState {
  itens: ItemCarrinho[];
  descontoReais: number;
  tipoPedido: 'balcao' | 'mesa' | 'delivery';
  mesaNumero: number | null;
  adicionarItem: (produto: Produto, quantidade?: number, observacoes?: string) => void;
  removerItem: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  definirDesconto: (valor: number) => void;
  definirTipoPedido: (tipo: 'balcao' | 'mesa' | 'delivery', mesa?: number) => void;
  limparCarrinho: () => void;
  getTotalBruto: () => number;
  getTotalLiquido: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  itens: [],
  descontoReais: 0,
  tipoPedido: 'balcao',
  mesaNumero: null,

  adicionarItem: (produto, quantidade = 1, observacoes = '') => {
    set((state) => {
      const indexExistente = state.itens.findIndex((i) => i.produto.id === produto.id && (i.observacoes || '') === observacoes);

      if (indexExistente > -1) {
        const novosItens = [...state.itens];
        const item = novosItens[indexExistente];
        const novaQtd = item.quantidade + quantidade;
        novosItens[indexExistente] = {
          ...item,
          quantidade: novaQtd,
          subtotal: Number((novaQtd * item.produto.precoVenda).toFixed(2)),
        };
        return { itens: novosItens };
      }

      const novoItem: ItemCarrinho = {
        produto,
        quantidade,
        observacoes,
        subtotal: Number((quantidade * produto.precoVenda).toFixed(2)),
      };

      return { itens: [...state.itens, novoItem] };
    });
  },

  removerItem: (produtoId) => {
    set((state) => ({
      itens: state.itens.filter((i) => i.produto.id !== produtoId),
    }));
  },

  atualizarQuantidade: (produtoId, quantidade) => {
    if (quantidade <= 0) {
      get().removerItem(produtoId);
      return;
    }

    set((state) => ({
      itens: state.itens.map((item) =>
        item.produto.id === produtoId
          ? {
              ...item,
              quantidade,
              subtotal: Number((quantidade * item.produto.precoVenda).toFixed(2)),
            }
          : item
      ),
    }));
  },

  definirDesconto: (valor) => set({ descontoReais: Math.max(0, valor) }),

  definirTipoPedido: (tipo, mesa) => set({ tipoPedido: tipo, mesaNumero: mesa || null }),

  limparCarrinho: () => set({ itens: [], descontoReais: 0, mesaNumero: null }),

  getTotalBruto: () => {
    return Number(get().itens.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  },

  getTotalLiquido: () => {
    const bruto = get().getTotalBruto();
    return Number(Math.max(0, bruto - get().descontoReais).toFixed(2));
  },
}));
