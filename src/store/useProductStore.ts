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
  sincronizarProdutoIndividual: (produto: Produto, tenantId?: string) => void;
  removerProdutoRealtime: (id: string) => void;
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
          const tId = (p as any).tenantId || (p as any).tenant_id;
          if (tId && tId !== 'global' && tId !== 'tenant-01') {
            if (!agrupadoProd[tId]) agrupadoProd[tId] = [];
            agrupadoProd[tId].push(p);
          }
        }
        const agrupadoCat: Record<string, Categoria[]> = {};
        for (const c of categoriasNovas) {
          const tId = (c as any).tenantId || (c as any).tenant_id;
          if (tId && tId !== 'global' && tId !== 'tenant-01') {
            if (!agrupadoCat[tId]) agrupadoCat[tId] = [];
            agrupadoCat[tId].push(c);
          }
        }
        set({
          produtosPorTenant: agrupadoProd,
          categoriasPorTenant: agrupadoCat,
          produtos: produtosNovos,
          categorias: categoriasNovas,
        });
      },

      sincronizarProdutoIndividual: (produto, tenantId) => {
        if (!produto) return;
        const tId = tenantId || (produto as any).tenantId || (produto as any).tenant_id;
        if (!tId || tId === 'global' || tId === 'tenant-01') return;
        set((state) => {
          const map = state.produtosPorTenant || {};
          const listaAtual = map[tId] || [];
          const existe = listaAtual.some((p) => p.id === produto.id);
          const novaLista = existe
            ? listaAtual.map((p) => (p.id === produto.id ? produto : p))
            : [produto, ...listaAtual];

          return {
            produtosPorTenant: {
              ...map,
              [tId]: novaLista,
            },
            produtos: novaLista,
          };
        });
      },

      removerProdutoRealtime: (id) => {
        set((state) => {
          const map = { ...state.produtosPorTenant };
          Object.keys(map).forEach((tId) => {
            map[tId] = map[tId].filter((p) => p.id !== id);
          });
          return {
            produtosPorTenant: map,
            produtos: state.produtos.filter((p) => p.id !== id),
          };
        });
      },

      getProdutosPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global' || tenantId === 'tenant-01') {
          return [];
        }
        if (state.produtosPorTenant && state.produtosPorTenant[tenantId]) {
          return state.produtosPorTenant[tenantId];
        }
        if (PRODUTOS_POR_TENANT[tenantId]) {
          return PRODUTOS_POR_TENANT[tenantId];
        }
        return [];
      },

      getCategoriasPorTenant: (tenantId?: string) => {
        const state = get();
        if (!tenantId || tenantId === 'global' || tenantId === 'tenant-01') {
          return [];
        }
        if (state.categoriasPorTenant && state.categoriasPorTenant[tenantId] && state.categoriasPorTenant[tenantId].length > 0) {
          return state.categoriasPorTenant[tenantId];
        }
        if (CATEGORIAS_POR_TENANT[tenantId] && CATEGORIAS_POR_TENANT[tenantId].length > 0) {
          return CATEGORIAS_POR_TENANT[tenantId];
        }
        return [
          { id: `c-${tenantId}-pratos`, nome: 'Pratos Principais', icone: 'Utensils', cor: '#FF6B00' },
          { id: `c-${tenantId}-bebidas`, nome: 'Bebidas & Drinks', icone: 'Wine', cor: '#00A3FF' },
          { id: `c-${tenantId}-sobremesas`, nome: 'Sobremesas', icone: 'Cake', cor: '#E040FB' },
        ];
      },

      adicionarProduto: (novo, tenantId) => {
        const idAlvo = (!tenantId || tenantId === 'global' || tenantId === 'tenant-01') ? '' : tenantId;
        if (!idAlvo) {
          console.error('Tentativa de adicionar produto sem restaurante válido vinculado:', tenantId);
          throw new Error('Identificador do restaurante não definido');
        }
        const novoProduto: Produto = {
          ...novo,
          id: `p-${idAlvo}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          tenantId: idAlvo,
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
        supabaseService.removerProduto(id);
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
        supabaseService.atualizarProduto(id, { precoVenda: Number(novoPreco.toFixed(2)) });
        sincronizarComWhatsAppServer(tenantId);
      },

      alternarDisponibilidade: (id, tenantId) => {
        let novoStatus = true;
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
            novosPorTenant[tenantAlvo] = novosPorTenant[tenantAlvo].map((p) => {
              if (p.id === id) {
                novoStatus = !p.disponivel;
                return { ...p, disponivel: novoStatus };
              }
              return p;
            });
          }

          return {
            produtosPorTenant: novosPorTenant,
            produtos: tenantAlvo ? novosPorTenant[tenantAlvo] : state.produtos,
          };
        });
        supabaseService.atualizarProduto(id, { disponivel: novoStatus });
        sincronizarComWhatsAppServer(tenantId);
      },

      adicionarCategoria: (nome, tenantId) => {
        const idAlvo = (!tenantId || tenantId === 'global' || tenantId === 'tenant-01') ? '' : tenantId;
        if (!idAlvo) {
          console.error('Tentativa de adicionar categoria sem restaurante válido');
          throw new Error('Identificador do restaurante não definido');
        }
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
        const idAlvo = (!tenantId || tenantId === 'global' || tenantId === 'tenant-01') ? '' : tenantId;
        if (!idAlvo) return;
        set((state) => {
          const novasPorTenant: Record<string, Categoria[]> = { ...state.categoriasPorTenant };
          if (novasPorTenant[idAlvo]) {
            novasPorTenant[idAlvo] = novasPorTenant[idAlvo].filter((c) => c.id !== id);
          }

          return {
            categoriasPorTenant: novasPorTenant,
          };
        });
        supabaseService.removerCategoria(id);
      },
    }),
    {
      name: 'eloserve_produtos_multi_tenant_v5',
    }
  )
);
