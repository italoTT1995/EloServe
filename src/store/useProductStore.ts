import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto, Categoria } from '../types';
import { supabaseService } from '../services/supabaseService';

export const CATEGORIAS_POR_TENANT: Record<string, Categoria[]> = {};

export const PRODUTOS_POR_TENANT: Record<string, Produto[]> = {};

interface ProductState {
  produtosPorTenant: Record<string, Produto[]>;
  categoriasPorTenant: Record<string, Categoria[]>;
  getProdutosPorTenant: (tenantId?: string) => Produto[];
  getCategoriasPorTenant: (tenantId?: string) => Categoria[];
  produtos: Produto[];
  categorias: Categoria[];
  sincronizarComSupabase: (produtos: Produto[], categorias: Categoria[]) => void;
  adicionarProduto: (produto: Omit<Produto, 'id'>, tenantId?: string) => Produto;
  editarProduto: (id: string, dados: Partial<Produto>, tenantId?: string) => void;
  removerProduto: (id: string, tenantId?: string) => void;
  atualizarPreco: (id: string, novoPreco: number, tenantId?: string) => void;
  alternarDisponibilidade: (id: string, tenantId?: string) => void;
  adicionarCategoria: (nome: string, tenantId?: string) => Categoria;
  removerCategoria: (id: string, tenantId?: string) => void;
}

function sincronizarComWhatsAppServer(_tenantId?: string) {}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      produtosPorTenant: PRODUTOS_POR_TENANT,
      categoriasPorTenant: CATEGORIAS_POR_TENANT,

      // Fallbacks globais para retrocompatibilidade
      produtos: [],
      categorias: [],

      sincronizarComSupabase: (produtosNovos, categoriasNovas) => {
        if (!produtosNovos || !categoriasNovas) return;
        const agrupadoProd: Record<string, Produto[]> = {};
        for (const p of produtosNovos) {
          const tId = (p as any).tenantId || 'tenant-01';
          if (!agrupadoProd[tId]) agrupadoProd[tId] = [];
          agrupadoProd[tId].push(p);
        }
        const agrupadoCat: Record<string, Categoria[]> = {};
        for (const c of categoriasNovas) {
          const tId = (c as any).tenantId || 'tenant-01';
          if (!agrupadoCat[tId]) agrupadoCat[tId] = [];
          agrupadoCat[tId].push(c);
        }
        set({
          produtosPorTenant: agrupadoProd,
          categoriasPorTenant: agrupadoCat,
          produtos: produtosNovos,
          categorias: categoriasNovas,
        });
      },

      getProdutosPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        if (state.produtosPorTenant && state.produtosPorTenant[idAlvo]) {
          return state.produtosPorTenant[idAlvo];
        }
        if (PRODUTOS_POR_TENANT[idAlvo]) {
          return PRODUTOS_POR_TENANT[idAlvo];
        }
        return [];
      },

      getCategoriasPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        if (state.categoriasPorTenant && state.categoriasPorTenant[idAlvo]) {
          return state.categoriasPorTenant[idAlvo];
        }
        if (CATEGORIAS_POR_TENANT[idAlvo]) {
          return CATEGORIAS_POR_TENANT[idAlvo];
        }
        return [
          { id: `c-${idAlvo}-pratos`, nome: 'Pratos Principais' },
          { id: `c-${idAlvo}-bebidas`, nome: 'Bebidas' },
          { id: `c-${idAlvo}-sobremesas`, nome: 'Sobremesas' },
        ];
      },

      adicionarProduto: (novo, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const novoProduto: Produto = {
          ...novo,
          id: `p-${idAlvo}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };

        set((state) => {
          const listaAtual = state.produtosPorTenant[idAlvo] || PRODUTOS_POR_TENANT[idAlvo] || [];
          const novaLista = [novoProduto, ...listaAtual];
          return {
            produtosPorTenant: {
              ...state.produtosPorTenant,
              [idAlvo]: novaLista,
            },
            produtos: novaLista,
          };
        });
        supabaseService.salvarProduto(novoProduto, idAlvo);
        sincronizarComWhatsAppServer(idAlvo);
        return novoProduto;
      },

      editarProduto: (id, dados, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, ...dados } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        supabaseService.atualizarProduto(id, dados);
        sincronizarComWhatsAppServer(tenantId);
      },

      removerProduto: (id, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].filter((p) => p.id !== id);
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      atualizarPreco: (id, novoPreco, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, precoVenda: Number(novoPreco.toFixed(2)) } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      alternarDisponibilidade: (id, tenantId) => {
        set((state) => {
          const novosPorTenant: Record<string, Produto[]> = { ...state.produtosPorTenant };
          let tenantAlvo = tenantId && tenantId !== 'global' ? tenantId : null;

          if (!tenantAlvo) {
            for (const tId of Object.keys(novosPorTenant)) {
              if (novosPorTenant[tId]?.some((p) => p.id === id)) {
                tenantAlvo = tId;
                break;
              }
            }
          }

          if (tenantAlvo && novosPorTenant[tenantAlvo]) {
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) =>
              p.id === id ? { ...p, disponivel: !p.disponivel } : p
            );
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        sincronizarComWhatsAppServer(tenantId);
      },

      adicionarCategoria: (nome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const novaCat: Categoria = {
          id: `c-${idAlvo}-${Date.now()}`,
          nome: nome.trim(),
        };

        set((state) => {
          const listaAtual = state.categoriasPorTenant[idAlvo] || CATEGORIAS_POR_TENANT[idAlvo] || [];
          return {
            categoriasPorTenant: {
              ...state.categoriasPorTenant,
              [idAlvo]: [...listaAtual, novaCat],
            },
          };
        });
        supabaseService.salvarCategoria(novaCat, idAlvo);
        return novaCat;
      },

      removerCategoria: (id, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const novasPorTenant: Record<string, Categoria[]> = { ...state.categoriasPorTenant };
          if (novasPorTenant[idAlvo]) {
            novasPorTenant[idAlvo] = novasPorTenant[idAlvo].filter((c) => c.id !== id);
          }

          return {
            categoriasPorTenant: novasPorTenant,
          };
        });
      },
    }),
    {
      name: 'eloserve_produtos_multi_tenant_v5',
    }
  )
);
