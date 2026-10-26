import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RegistroFechamentoComissao, RateioGarcomDetalhe } from '../types';

interface ComissaoConfig {
  modeloPadrao: 'direto' | 'igualitario';
  retencaoCasaPercentual: number; // Ex: 15% para encargos conforme Lei da Gorjeta
}

interface ComissaoState {
  config: ComissaoConfig;
  fechamentos: RegistroFechamentoComissao[];

  salvarConfig: (novaConfig: Partial<ComissaoConfig>) => void;
  adicionarFechamento: (f: Omit<RegistroFechamentoComissao, 'id' | 'criadoEm'>) => RegistroFechamentoComissao;
  marcarComoPago: (fechamentoId: string, garcomId?: string) => void;
  excluirFechamento: (fechamentoId: string) => void;
  getFechamentosPorTenant: (tenantId?: string) => RegistroFechamentoComissao[];
}

export const useComissaoStore = create<ComissaoState>()(
  persist(
    (set, get) => ({
      config: {
        modeloPadrao: 'direto',
        retencaoCasaPercentual: 15,
      },
      fechamentos: [],

      salvarConfig: (novaConfig) => {
        set((state) => ({
          config: { ...state.config, ...novaConfig },
        }));
      },

      adicionarFechamento: (dados) => {
        const agora = new Date().toISOString();
        const novo: RegistroFechamentoComissao = {
          ...dados,
          id: `comissao_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          criadoEm: agora,
        };

        set((state) => ({
          fechamentos: [novo, ...(state.fechamentos || [])],
        }));

        return novo;
      },

      marcarComoPago: (fechamentoId, garcomId) => {
        const agora = new Date().toLocaleDateString('pt-BR');
        set((state) => ({
          fechamentos: (state.fechamentos || []).map((f) => {
            if (f.id !== fechamentoId) return f;
            const novosGarcons = f.garcons.map((g) => {
              if (!garcomId || g.garcomId === garcomId) {
                return {
                  ...g,
                  status: 'pago' as const,
                  pagoEm: agora,
                };
              }
              return g;
            });
            return {
              ...f,
              garcons: novosGarcons,
            };
          }),
        }));
      },

      excluirFechamento: (fechamentoId) => {
        set((state) => ({
          fechamentos: (state.fechamentos || []).filter((f) => f.id !== fechamentoId),
        }));
      },

      getFechamentosPorTenant: (tenantId) => {
        const state = get();
        if (!tenantId || tenantId === 'todos') {
          return state.fechamentos || [];
        }
        const idAlvo = tenantId === 'global' ? 'tenant-01' : tenantId;
        return (state.fechamentos || []).filter((f) => !f.tenantId || f.tenantId === idAlvo);
      },
    }),
    {
      name: 'eloserve_comissoes_store_v1',
    }
  )
);
