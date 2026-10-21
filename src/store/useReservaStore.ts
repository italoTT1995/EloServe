import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReservaMesa, StatusReserva } from '../types';
import { useAppStore } from './useAppStore';

const hoje = new Date().toISOString().split('T')[0];
const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const RESERVAS_INICIAIS: Record<string, ReservaMesa[]> = {
  'tenant-01': [
    {
      id: 'res-101',
      tenantId: 'tenant-01',
      clienteNome: 'Fernanda Martins',
      clienteTelefone: '(31) 99876-5432',
      data: hoje,
      horario: '20:30',
      quantidadePessoas: 6,
      mesaNumero: 4,
      status: 'confirmada',
      especiais: {
        aniversario: true,
        presencaBolo: true,
        decoracao: true,
        observacoes: 'Aniversário surpresa com bolo e velas.',
      },
      observacoes: 'Mesa próxima à área infantil se possível.',
      origem: 'elobot',
      criadoEm: `${hoje} 11:15`,
    },
    {
      id: 'res-102',
      tenantId: 'tenant-01',
      clienteNome: 'Carlos Eduardo Santos',
      clienteTelefone: '(31) 98711-2233',
      data: hoje,
      horario: '21:00',
      quantidadePessoas: 4,
      status: 'pendente',
      especiais: {
        aniversario: false,
        presencaBolo: false,
        observacoes: 'Jantar de negócios executivo.',
      },
      origem: 'elobot',
      criadoEm: `${hoje} 14:20`,
    },
    {
      id: 'res-103',
      tenantId: 'tenant-01',
      clienteNome: 'Juliana Alencar',
      clienteTelefone: '(31) 99422-7788',
      data: amanha,
      horario: '19:45',
      quantidadePessoas: 8,
      status: 'confirmada',
      especiais: {
        aniversario: true,
        presencaBolo: true,
        observacoes: 'Bolo será levado pela família na hora do jantar.',
      },
      origem: 'manual',
      criadoEm: `${hoje} 10:00`,
    },
  ],
};

interface ReservaState {
  reservasPorTenant: Record<string, ReservaMesa[]>;
  getReservas: (tenantId?: string) => ReservaMesa[];
  adicionarReserva: (dados: Omit<ReservaMesa, 'id' | 'criadoEm'>) => ReservaMesa;
  atualizarStatusReserva: (id: string, status: StatusReserva, tenantId?: string) => void;
  vincularMesaReserva: (id: string, mesaNumero: number, tenantId?: string) => void;
  cancelarReserva: (id: string, motivo?: string, tenantId?: string) => void;
  sentarReservaNaMesa: (id: string, mesaNumero: number, tenantId?: string) => { sucesso: boolean; mensagem: string };
}

export const useReservaStore = create<ReservaState>()(
  persist(
    (set, get) => ({
      reservasPorTenant: {},

      getReservas: (tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        return get().reservasPorTenant[idAlvo] || [];
      },

      adicionarReserva: (dados) => {
        const idAlvo = !dados.tenantId || dados.tenantId === 'global' ? 'tenant-01' : dados.tenantId;
        const agora = new Date();
        const novaReserva: ReservaMesa = {
          ...dados,
          tenantId: idAlvo,
          id: `res-${Date.now().toString().slice(-5)}`,
          criadoEm: `${agora.toISOString().split('T')[0]} ${agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        };

        set((state) => {
          const listaAtual = state.reservasPorTenant[idAlvo] || [];
          return {
            reservasPorTenant: {
              ...state.reservasPorTenant,
              [idAlvo]: [novaReserva, ...listaAtual],
            },
          };
        });

        // Se uma mesa foi pré-atribuída, atualiza status da mesa para 'reservada'
        if (novaReserva.mesaNumero) {
          try {
            const { editarMesa } = useAppStore.getState();
            editarMesa(
              novaReserva.mesaNumero,
              {
                status: 'reservada',
                reservaId: novaReserva.id,
                responsavelNome: `${novaReserva.clienteNome} (Reserva)`,
                quantidadePessoas: novaReserva.quantidadePessoas,
              },
              idAlvo
            );
          } catch (e) {
            console.warn('Erro ao atualizar mesa para reservada:', e);
          }
        }

        return novaReserva;
      },

      atualizarStatusReserva: (id, status, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const lista = state.reservasPorTenant[idAlvo] || [];
          return {
            reservasPorTenant: {
              ...state.reservasPorTenant,
              [idAlvo]: lista.map((r) => (r.id === id ? { ...r, status } : r)),
            },
          };
        });
      },

      vincularMesaReserva: (id, mesaNumero, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const reserva = (get().reservasPorTenant[idAlvo] || []).find((r) => r.id === id);

        set((state) => {
          const lista = state.reservasPorTenant[idAlvo] || [];
          return {
            reservasPorTenant: {
              ...state.reservasPorTenant,
              [idAlvo]: lista.map((r) =>
                r.id === id ? { ...r, mesaNumero, status: 'confirmada' } : r
              ),
            },
          };
        });

        if (reserva) {
          try {
            const { editarMesa } = useAppStore.getState();
            editarMesa(
              mesaNumero,
              {
                status: 'reservada',
                reservaId: id,
                responsavelNome: `${reserva.clienteNome} (Reserva)`,
                quantidadePessoas: reserva.quantidadePessoas,
              },
              idAlvo
            );
          } catch (e) {
            console.warn('Erro ao vincular mesa à reserva:', e);
          }
        }
      },

      cancelarReserva: (id, motivo, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const reserva = (get().reservasPorTenant[idAlvo] || []).find((r) => r.id === id);

        set((state) => {
          const lista = state.reservasPorTenant[idAlvo] || [];
          return {
            reservasPorTenant: {
              ...state.reservasPorTenant,
              [idAlvo]: lista.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      status: 'cancelada',
                      observacoes: motivo
                        ? `${r.observacoes || ''} [Cancelado: ${motivo}]`.trim()
                        : r.observacoes,
                    }
                  : r
              ),
            },
          };
        });

        // Se a mesa estava marcada como reservada por esta reserva, libera a mesa
        if (reserva && reserva.mesaNumero) {
          try {
            const { getMesasPorTenant, editarMesa } = useAppStore.getState();
            const mesa = getMesasPorTenant(idAlvo).find((m) => m.numero === reserva.mesaNumero);
            if (mesa && mesa.status === 'reservada') {
              editarMesa(
                reserva.mesaNumero,
                {
                  status: 'livre',
                  reservaId: undefined,
                  responsavelNome: undefined,
                },
                idAlvo
              );
            }
          } catch (e) {
            console.warn('Erro ao liberar mesa da reserva cancelada:', e);
          }
        }
      },

      sentarReservaNaMesa: (id, mesaNumero, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const reserva = (get().reservasPorTenant[idAlvo] || []).find((r) => r.id === id);
        if (!reserva) {
          return { sucesso: false, mensagem: 'Reserva não encontrada.' };
        }

        // Conclui a reserva
        set((state) => {
          const lista = state.reservasPorTenant[idAlvo] || [];
          return {
            reservasPorTenant: {
              ...state.reservasPorTenant,
              [idAlvo]: lista.map((r) =>
                r.id === id ? { ...r, status: 'concluida', mesaNumero } : r
              ),
            },
          };
        });

        // Ocupa a mesa no salão com os dados do cliente
        try {
          const { editarMesa } = useAppStore.getState();
          editarMesa(
            mesaNumero,
            {
              status: 'ocupada',
              responsavelNome: reserva.clienteNome,
              quantidadePessoas: reserva.quantidadePessoas,
              pessoas: [reserva.clienteNome],
              reservaId: id,
            },
            idAlvo
          );
          return {
            sucesso: true,
            mensagem: `Clientes da reserva de "${reserva.clienteNome}" acomodados com sucesso na Mesa #${mesaNumero}!`,
          };
        } catch (e) {
          console.warn('Erro ao sentar clientes na mesa:', e);
          return { sucesso: false, mensagem: 'Erro ao ocupar mesa.' };
        }
      },
    }),
    {
      name: 'eloserve_reservas_store_v3',
    }
  )
);
