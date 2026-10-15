import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessaoCaixa, Mesa, PedidoKDS, VendaRealizada, ItemComandaMesa } from '../types';
import { useEstoqueStore } from './useEstoqueStore';
import { MESAS_POR_TENANT } from './initialMesas';

interface AppState {
  caixaAtual: SessaoCaixa;
  operadorAtivo: string;
  perfilAtivo: 'admin' | 'caixa' | 'garcom';
  pinAdmin: string;
  mesasPorTenant: Record<string, Mesa[]>;
  getMesasPorTenant: (tenantId?: string) => Mesa[];
  mesas: Mesa[];
  pedidosKDS: PedidoKDS[];
  vendas: VendaRealizada[];
  abrirCaixa: (saldoInicial: number) => void;
  fecharCaixa: () => void;
  registrarVendaCaixa: (valor: number) => void;
  registrarVenda: (venda: VendaRealizada) => void;
  cancelarVenda: (vendaId: string, motivo: string, operador: string) => { sucesso: boolean; mensagem?: string };
  limparVendasTurno: (modo: 'todas' | 'apenas_canceladas', zerarTotalVendasCaixa?: boolean) => { sucesso: boolean; removidas: number };
  atualizarStatusMesa: (numero: number, status: Mesa['status'], tenantId?: string) => void;
  adicionarMesa: (dados: { numero: number; capacidade: number; setor: string }, tenantId?: string) => { sucesso: boolean; mensagem?: string };
  removerMesa: (numero: number, tenantId?: string) => { sucesso: boolean; mensagem?: string };
  editarMesa: (numero: number, dados: Partial<Mesa>, tenantId?: string) => void;
  lancarItensComandaMesa: (
    numeroMesa: number,
    novosItens: Omit<ItemComandaMesa, 'id' | 'horario'>[],
    garcomNome?: string,
    tenantId?: string
  ) => { sucesso: boolean; pedidoKDSId: string; totalAdicionado: number };
  adicionarPedidoKDS: (pedido: PedidoKDS) => void;
  avancarStatusKDS: (pedidoId: string) => void;
  alternarPerfil: (perfil: 'admin' | 'caixa' | 'garcom') => void;
  validarPinAdmin: (pin: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      operadorAtivo: 'Italo Lemos (Administrador)',
      perfilAtivo: 'admin',
      pinAdmin: '1234',
      caixaAtual: {
        id: 'caixa-01',
        status: 'aberto',
        saldoInicial: 150.0,
        totalVendas: 1240.5,
        totalSangrias: 0,
        totalSuprimentos: 150.0,
        abertoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operador: 'Italo Lemos',
      },

      mesasPorTenant: MESAS_POR_TENANT,
      mesas: MESAS_POR_TENANT['tenant-01'],

      getMesasPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const map = state.mesasPorTenant || {};
        if (map[idAlvo] && map[idAlvo].length > 0) {
          return map[idAlvo];
        }
        if (MESAS_POR_TENANT[idAlvo] && MESAS_POR_TENANT[idAlvo].length > 0) {
          return MESAS_POR_TENANT[idAlvo];
        }
        // Novo restaurante registrado no SaaS: provisiona automaticamente 4 mesas limpas
        const mesasIniciais: Mesa[] = [
          {
            id: `m_${idAlvo}_1`,
            tenantId: idAlvo,
            numero: 1,
            capacidade: 4,
            setor: 'Salão Principal',
            status: 'livre',
            totalConsumo: 0,
            tempoOcupadaMin: 0,
            garcomResponsavel: 'Garçom',
          },
          {
            id: `m_${idAlvo}_2`,
            tenantId: idAlvo,
            numero: 2,
            capacidade: 4,
            setor: 'Salão Principal',
            status: 'livre',
            totalConsumo: 0,
            tempoOcupadaMin: 0,
            garcomResponsavel: 'Garçom',
          },
          {
            id: `m_${idAlvo}_3`,
            tenantId: idAlvo,
            numero: 3,
            capacidade: 2,
            setor: 'Varanda',
            status: 'livre',
            totalConsumo: 0,
            tempoOcupadaMin: 0,
            garcomResponsavel: 'Garçom',
          },
          {
            id: `m_${idAlvo}_4`,
            tenantId: idAlvo,
            numero: 4,
            capacidade: 6,
            setor: 'Salão Principal',
            status: 'livre',
            totalConsumo: 0,
            tempoOcupadaMin: 0,
            garcomResponsavel: 'Garçom',
          },
        ];
        return mesasIniciais;
      },

      pedidosKDS: [
        {
          id: 'k1',
          numero: 101,
          tipo: 'mesa',
          mesaNumero: 4,
          status: 'novo',
          minutosEspera: 3,
          criadoEm: '11:15',
          itens: [
            { nome: 'EloBurger Smash Bacon', quantidade: 2, observacoes: '1x sem picles' },
            { nome: 'Batata Rústica com Alecrim', quantidade: 1 },
          ],
        },
        {
          id: 'k2',
          numero: 102,
          tipo: 'balcao',
          nomeCliente: 'Lucas Silva',
          status: 'em_preparo',
          minutosEspera: 12,
          criadoEm: '11:06',
          itens: [
            { nome: 'Pizza Margherita Grande', quantidade: 1, observacoes: 'Massa fina bem tostada' },
            { nome: 'Coca-Cola Zero 350ml', quantidade: 2 },
          ],
        },
        {
          id: 'k3',
          numero: 103,
          tipo: 'delivery',
          nomeCliente: 'Mariana Costa',
          status: 'pronto',
          minutosEspera: 22,
          criadoEm: '10:56',
          itens: [
            { nome: 'Combo Família 4 Burgers + Fritas', quantidade: 1 },
          ],
        },
      ],

      vendas: [
        {
          id: 'VD-1082',
          dataHora: '13/10/2026 19:42',
          total: 56.0,
          formaPagamento: 'pix',
          itens: [
            {
              produtoId: 'p_fg_6',
              nome: 'Cerveja Amstel Lager 350ml',
              quantidade: 8,
              precoUnitario: 7.0,
              subtotal: 56.0,
            },
          ],
          operador: 'Italo Lemos',
          status: 'concluida',
        },
      ],

      abrirCaixa: (saldoInicial) =>
        set((state) => ({
          caixaAtual: {
            ...state.caixaAtual,
            status: 'aberto',
            saldoInicial,
            totalSuprimentos: saldoInicial,
            totalVendas: 0,
            abertoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        })),

      fecharCaixa: () =>
        set((state) => ({
          caixaAtual: { ...state.caixaAtual, status: 'fechado' },
        })),

      registrarVendaCaixa: (valor) =>
        set((state) => ({
          caixaAtual: {
            ...state.caixaAtual,
            totalVendas: Number((state.caixaAtual.totalVendas + valor).toFixed(2)),
          },
        })),

      registrarVenda: (venda) =>
        set((state) => ({
          vendas: [venda, ...state.vendas],
          caixaAtual: {
            ...state.caixaAtual,
            totalVendas: Number((state.caixaAtual.totalVendas + venda.total).toFixed(2)),
          },
        })),

      cancelarVenda: (vendaId, motivo, operador) => {
        const state = get();
        const venda = state.vendas.find((v) => v.id === vendaId);

        if (!venda) {
          return { sucesso: false, mensagem: 'Venda não localizada no sistema.' };
        }

        if (venda.status === 'cancelada') {
          return { sucesso: false, mensagem: 'Esta venda já se encontra cancelada e estornada.' };
        }

        // Estorna os insumos e itens diretamente no estoque
        useEstoqueStore.getState().estornarBaixaVenda(venda, motivo, operador);

        const agoraTexto =
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((s) => ({
          vendas: s.vendas.map((v) =>
            v.id === vendaId
              ? {
                  ...v,
                  status: 'cancelada',
                  motivoCancelamento: motivo,
                  canceladoEm: agoraTexto,
                  canceladoPor: operador,
                }
              : v
          ),
          caixaAtual: {
            ...s.caixaAtual,
            totalVendas: Math.max(0, Number((s.caixaAtual.totalVendas - venda.total).toFixed(2))),
          },
        }));

        return { sucesso: true };
      },

      limparVendasTurno: (modo, zerarTotalVendasCaixa = false) => {
        const state = get();
        let removidas = 0;

        if (modo === 'apenas_canceladas') {
          const canceladas = state.vendas.filter((v) => v.status === 'cancelada');
          removidas = canceladas.length;
          set({
            vendas: state.vendas.filter((v) => v.status !== 'cancelada'),
          });
        } else {
          removidas = state.vendas.length;
          set((s) => ({
            vendas: [],
            caixaAtual: zerarTotalVendasCaixa
              ? { ...s.caixaAtual, totalVendas: 0 }
              : s.caixaAtual,
          }));
        }

        return { sucesso: true, removidas };
      },

      atualizarStatusMesa: (numero, status, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const map = state.mesasPorTenant || MESAS_POR_TENANT;
          const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
          const novaLista = listaAtual.map((m) => (m.numero === numero ? { ...m, status } : m));
          return {
            mesasPorTenant: {
              ...map,
              [idAlvo]: novaLista,
            },
            mesas: novaLista,
          };
        });
      },

      adicionarMesa: (dados, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const estado = get();
        const map = estado.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];

        if (listaAtual.some((m) => m.numero === dados.numero)) {
          return { sucesso: false, mensagem: `Já existe uma mesa com o número #${dados.numero} nesta loja.` };
        }
        const novaMesa: Mesa = {
          id: `m_${idAlvo}_${Date.now()}_${dados.numero}`,
          tenantId: idAlvo,
          numero: dados.numero,
          capacidade: Number(dados.capacidade) || 4,
          setor: dados.setor || 'Salão',
          status: 'livre',
          totalConsumo: 0,
        };
        const novaLista = [...listaAtual, novaMesa].sort((a, b) => a.numero - b.numero);
        set({
          mesasPorTenant: {
            ...map,
            [idAlvo]: novaLista,
          },
          mesas: novaLista,
        });
        return { sucesso: true };
      },

      removerMesa: (numero, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const estado = get();
        const map = estado.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
        const mesa = listaAtual.find((m) => m.numero === numero);
        if (!mesa) {
          return { sucesso: false, mensagem: 'Mesa não encontrada.' };
        }
        if (mesa.status !== 'livre') {
          return {
            sucesso: false,
            mensagem: `Não é possível excluir a Mesa #${numero} porque ela está ocupada ou com comanda aberta. Feche a conta primeiro.`,
          };
        }
        const novaLista = listaAtual.filter((m) => m.numero !== numero);
        set({
          mesasPorTenant: {
            ...map,
            [idAlvo]: novaLista,
          },
          mesas: novaLista,
        });
        return { sucesso: true };
      },

      editarMesa: (numero, dados, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const map = state.mesasPorTenant || MESAS_POR_TENANT;
          const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
          const novaLista = listaAtual.map((m) => (m.numero === numero ? { ...m, ...dados } : m));
          return {
            mesasPorTenant: {
              ...map,
              [idAlvo]: novaLista,
            },
            mesas: novaLista,
          };
        });
      },

      lancarItensComandaMesa: (numeroMesa, novosItens, garcomNome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
        const mesa = listaAtual.find((m) => m.numero === numeroMesa);
        if (!mesa) {
          return { sucesso: false, pedidoKDSId: '', totalAdicionado: 0 };
        }

        const agoraHora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itensCompletos: ItemComandaMesa[] = novosItens.map((it) => ({
          ...it,
          id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          horario: agoraHora,
          garcomNome: garcomNome || mesa.garcomResponsavel || 'Garçom',
          statusKDS: 'novo',
        }));

        const totalAdicionado = Number(
          itensCompletos.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)
        );

        // 1. Gera pedido no KDS da cozinha
        const novoPedidoKDS: PedidoKDS = {
          id: `kds_${Date.now()}`,
          numero: Math.floor(100 + Math.random() * 900),
          tipo: 'mesa',
          mesaNumero: numeroMesa,
          nomeCliente: mesa.responsavelNome || `Mesa #${numeroMesa}`,
          status: 'novo',
          itens: itensCompletos.map((it) => ({
            nome: it.nome,
            quantidade: it.quantidade,
            observacoes: it.observacoes || undefined,
          })),
          minutosEspera: 0,
          criadoEm: agoraHora,
        };

        // 2. Abate ingredientes/produtos diretamente no Estoque
        useEstoqueStore
          .getState()
          .processarBaixaItensMesa(
            numeroMesa,
            itensCompletos,
            garcomNome || mesa.garcomResponsavel || 'Garçom'
          );

        // 3. Atualiza estado da mesa daquela loja isolada e KDS
        const novaLista = listaAtual.map((m) =>
          m.numero === numeroMesa
            ? {
                ...m,
                status: m.status === 'livre' ? ('ocupada' as const) : m.status,
                totalConsumo: Number(((m.totalConsumo || 0) + totalAdicionado).toFixed(2)),
                comandaItens: [...(m.comandaItens || []), ...itensCompletos],
              }
            : m
        );

        set((s) => ({
          mesasPorTenant: {
            ...map,
            [idAlvo]: novaLista,
          },
          mesas: novaLista,
          pedidosKDS: [novoPedidoKDS, ...s.pedidosKDS],
        }));

        return { sucesso: true, pedidoKDSId: novoPedidoKDS.id, totalAdicionado };
      },

      adicionarPedidoKDS: (pedido) =>
        set((state) => ({
          pedidosKDS: [pedido, ...state.pedidosKDS],
        })),

      avancarStatusKDS: (pedidoId) => {
        let pedidoAtualizado: PedidoKDS | undefined;
        set((state) => ({
          pedidosKDS: state.pedidosKDS.map((p) => {
            if (p.id !== pedidoId) return p;
            const prox = p.status === 'novo' ? 'em_preparo' : p.status === 'em_preparo' ? 'pronto' : 'pronto';
            pedidoAtualizado = { ...p, status: prox };
            return pedidoAtualizado;
          }),
        }));

        if (pedidoAtualizado && pedidoAtualizado.status === 'pronto' && pedidoAtualizado.tipo === 'delivery') {
          try {
            import('./useDeliveryStore').then(({ useDeliveryStore }) => {
              const { pedidos, avancarStatusDelivery } = useDeliveryStore.getState();
              const deliv = pedidos.find((d) => d.numero === pedidoAtualizado?.numero);
              if (deliv && deliv.status === 'preparando') {
                avancarStatusDelivery(deliv.id);
              }
            });
          } catch (e) {
            console.warn(e);
          }
        }
      },

      alternarPerfil: (perfil) =>
        set({
          perfilAtivo: perfil,
          operadorAtivo:
            perfil === 'admin'
              ? 'Italo Lemos (Administrador)'
              : perfil === 'caixa'
              ? 'Operador 01 (Caixa)'
              : 'Garçom Marcos (Salão)',
        }),

      validarPinAdmin: (pin) => {
        return pin === get().pinAdmin;
      },
    }),
    {
      name: 'eloserve_app_storage_v3',
    }
  )
);
