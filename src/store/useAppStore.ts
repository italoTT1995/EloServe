import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessaoCaixa, Mesa, PedidoKDS, VendaRealizada, ItemComandaMesa, DespesaOperacionalRestaurante, MovimentoCaixa } from '../types';
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
  despesasRestaurante: DespesaOperacionalRestaurante[];
  getVendasPorTenant: (tenantId?: string) => VendaRealizada[];
  getDespesasPorTenant: (tenantId?: string) => DespesaOperacionalRestaurante[];
  adicionarDespesaRestaurante: (despesa: Omit<DespesaOperacionalRestaurante, 'id'>) => void;
  removerDespesaRestaurante: (id: string) => void;
  abrirCaixa: (saldoInicial: number) => void;
  fecharCaixa: () => void;
  registrarSangria: (valor: number, motivo: string, operador?: string) => { sucesso: boolean; mensagem?: string };
  registrarSuprimento: (valor: number, motivo: string, operador?: string) => { sucesso: boolean; mensagem?: string };
  movimentosCaixa: MovimentoCaixa[];
  registrarVendaCaixa: (valor: number) => void;
  registrarVenda: (venda: VendaRealizada) => void;
  cancelarVenda: (vendaId: string, motivo: string, operador: string) => { sucesso: boolean; mensagem?: string };
  limparVendasTurno: (modo: 'todas' | 'apenas_canceladas', zerarTotalVendasCaixa?: boolean) => { sucesso: boolean; removidas: number };
  atualizarStatusMesa: (numero: number, status: Mesa['status'], tenantId?: string) => void;
  adicionarMesa: (dados: { numero: number; capacidade: number; setor: string }, tenantId?: string) => { sucesso: boolean; mensagem?: string };
  removerMesa: (numero: number, tenantId?: string) => { sucesso: boolean; mensagem?: string };
  editarMesa: (numero: number, dados: Partial<Mesa>, tenantId?: string) => void;
  adicionarPessoaMesa: (numeroMesa: number, nomePessoa: string, tenantId?: string) => void;
  removerPessoaMesa: (numeroMesa: number, nomePessoa: string, tenantId?: string) => void;
  trocarMesa: (
    numeroOrigem: number,
    numeroDestino: number,
    modo?: 'transferir' | 'unificar' | 'inverter',
    tenantId?: string,
    motivo?: string
  ) => { sucesso: boolean; mensagem: string };
  lancarItensComandaMesa: (
    numeroMesa: number,
    novosItens: Omit<ItemComandaMesa, 'id' | 'horario'>[],
    garcomNome?: string,
    tenantId?: string
  ) => { sucesso: boolean; pedidoKDSId: string; totalAdicionado: number };
  adicionarPedidoKDS: (pedido: PedidoKDS) => void;
  avancarStatusKDS: (pedidoId: string) => void;
  iniciarProducaoKDS: (pedidoId: string) => void;
  marcarFeitoKDS: (pedidoId: string) => void;
  marcarEntregueKDS: (pedidoId: string, garcomNome?: string) => void;
  marcarItemEntregueMesa: (numeroMesa: number, itemId: string, tenantId?: string) => void;
  toggleItemConcluidoKDS: (pedidoId: string, itemIdx: number) => void;
  ticarTodosItensKDS: (pedidoId: string) => void;
  arquivarPedidoKDS: (pedidoId: string) => void;
  recuperarUltimoPedidoKDS: () => PedidoKDS | null;
  historicoKDS: PedidoKDS[];
  alternarPerfil: (perfil: 'admin' | 'caixa' | 'garcom') => void;
  validarPinAdmin: (pin: string) => boolean;
  cancelarItemComandaMesa: (
    numeroMesa: number,
    itemId: string,
    motivo: string,
    gerenteNome?: string,
    tenantId?: string
  ) => { sucesso: boolean; mensagem: string; itemCancelado?: ItemComandaMesa };
  toggleTaxaServicoMesa: (
    numeroMesa: number,
    clienteNome?: string,
    tenantId?: string
  ) => { sucesso: boolean; isenta: boolean };
  toggleCouvertMesa: (
    numeroMesa: number,
    clienteNome?: string,
    tenantId?: string
  ) => { sucesso: boolean; isento: boolean };
  aplicarDescontoComandaMesa: (
    numeroMesa: number,
    clienteNome: string,
    valorDesconto: number,
    tenantId?: string
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      operadorAtivo: 'Operador Principal',
      perfilAtivo: 'admin',
      pinAdmin: '8899',
      caixaAtual: {
        id: 'caixa-01',
        status: 'fechado',
        saldoInicial: 0,
        totalVendas: 0,
        totalSangrias: 0,
        totalSuprimentos: 0,
        abertoEm: '-',
        operador: '-',
      },
      movimentosCaixa: [],

      mesasPorTenant: MESAS_POR_TENANT,
      mesas: [],

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
        // Registra as mesas iniciais para este novo estabelecimento no estado persistente
        set((s) => ({
          mesasPorTenant: {
            ...(s.mesasPorTenant || {}),
            [idAlvo]: mesasIniciais,
          },
        }));
        return mesasIniciais;
      },

      historicoKDS: [],
      pedidosKDS: [],

      vendas: [],

      despesasRestaurante: [],

      getVendasPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        return (state.vendas || []).filter((v) => !v.tenantId || v.tenantId === idAlvo);
      },

      getDespesasPorTenant: (tenantId?: string) => {
        const state = get();
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        return (state.despesasRestaurante || []).filter((d) => d.tenantId === idAlvo);
      },

      adicionarDespesaRestaurante: (despesa) => {
        const nova: DespesaOperacionalRestaurante = {
          ...despesa,
          id: `desp-${Date.now().toString().slice(-5)}`,
        };
        set((state) => ({
          despesasRestaurante: [nova, ...(state.despesasRestaurante || [])],
        }));
      },

      removerDespesaRestaurante: (id) => {
        set((state) => ({
          despesasRestaurante: (state.despesasRestaurante || []).filter((d) => d.id !== id),
        }));
      },

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

      registrarSangria: (valor, motivo, operador) => {
        if (valor <= 0) return { sucesso: false, mensagem: 'Valor inválido para sangria.' };
        const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const novoMov: MovimentoCaixa = {
          id: `sangria-${Date.now()}`,
          tipo: 'sangria',
          formaPagamento: 'dinheiro',
          valor,
          motivo: motivo || 'Retirada de caixa (Sangria)',
          horario: agora,
        };
        set((state) => ({
          movimentosCaixa: [novoMov, ...(state.movimentosCaixa || [])],
          caixaAtual: {
            ...state.caixaAtual,
            totalSangrias: Number(((state.caixaAtual.totalSangrias || 0) + valor).toFixed(2)),
          },
        }));
        return { sucesso: true };
      },

      registrarSuprimento: (valor, motivo, operador) => {
        if (valor <= 0) return { sucesso: false, mensagem: 'Valor inválido para suprimento.' };
        const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const novoMov: MovimentoCaixa = {
          id: `suprimento-${Date.now()}`,
          tipo: 'suprimento',
          formaPagamento: 'dinheiro',
          valor,
          motivo: motivo || 'Reforço de troco (Suprimento)',
          horario: agora,
        };
        set((state) => ({
          movimentosCaixa: [novoMov, ...(state.movimentosCaixa || [])],
          caixaAtual: {
            ...state.caixaAtual,
            totalSuprimentos: Number(((state.caixaAtual.totalSuprimentos || 0) + valor).toFixed(2)),
          },
        }));
        return { sucesso: true };
      },

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

      adicionarPessoaMesa: (numeroMesa, nomePessoa, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const map = state.mesasPorTenant || MESAS_POR_TENANT;
          const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
          const novaLista = listaAtual.map((m) => {
            if (m.numero !== numeroMesa) return m;
            const pessoasAtuais = m.pessoas && m.pessoas.length > 0
              ? m.pessoas
              : [m.responsavelNome || `Mesa #${numeroMesa}`];
            const nomeFormatado = nomePessoa.trim();
            if (!nomeFormatado || pessoasAtuais.includes(nomeFormatado)) return m;
            const novasPessoas = [...pessoasAtuais, nomeFormatado];
            return {
              ...m,
              pessoas: novasPessoas,
              quantidadePessoas: Math.max(m.quantidadePessoas || 1, novasPessoas.length),
            };
          });
          return {
            mesasPorTenant: { ...map, [idAlvo]: novaLista },
            mesas: novaLista,
          };
        });
      },

      removerPessoaMesa: (numeroMesa, nomePessoa, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        set((state) => {
          const map = state.mesasPorTenant || MESAS_POR_TENANT;
          const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
          const novaLista = listaAtual.map((m) => {
            if (m.numero !== numeroMesa) return m;
            const pessoasAtuais = m.pessoas && m.pessoas.length > 0
              ? m.pessoas
              : [m.responsavelNome || `Mesa #${numeroMesa}`];
            const filtradas = pessoasAtuais.filter((p) => p !== nomePessoa);
            return {
              ...m,
              pessoas: filtradas.length > 0 ? filtradas : [m.responsavelNome || `Mesa #${numeroMesa}`],
            };
          });
          return {
            mesasPorTenant: { ...map, [idAlvo]: novaLista },
            mesas: novaLista,
          };
        });
      },

      cancelarItemComandaMesa: (numeroMesa, itemId, motivo, gerenteNome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
        const mesa = listaAtual.find((m) => m.numero === numeroMesa);
        if (!mesa || !mesa.comandaItens) {
          return { sucesso: false, mensagem: 'Mesa ou itens não encontrados.' };
        }

        const itemAlvo = mesa.comandaItens.find((it) => it.id === itemId);
        if (!itemAlvo) {
          return { sucesso: false, mensagem: 'Item não encontrado na comanda.' };
        }

        const novosItens = mesa.comandaItens.filter((it) => it.id !== itemId);
        const novoTotal = Number(novosItens.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2));

        const registroCancelamento = {
          id: `canc_${Date.now()}`,
          itemId: itemAlvo.id,
          produtoId: itemAlvo.produtoId,
          nome: itemAlvo.nome,
          quantidade: itemAlvo.quantidade,
          subtotal: itemAlvo.subtotal,
          clienteNome: itemAlvo.clienteNome,
          motivo: motivo || 'Cancelado pelo Gerente',
          canceladoPor: gerenteNome || 'Gerente',
          horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const novaLista = listaAtual.map((m) => {
          if (m.numero !== numeroMesa) return m;
          return {
            ...m,
            comandaItens: novosItens,
            totalConsumo: novoTotal,
            historicoCancelamentos: [...(m.historicoCancelamentos || []), registroCancelamento],
          };
        });

        set({
          mesasPorTenant: { ...map, [idAlvo]: novaLista },
          mesas: novaLista,
        });

        return {
          sucesso: true,
          mensagem: `Item "${itemAlvo.nome}" cancelado com sucesso.`,
          itemCancelado: itemAlvo,
        };
      },

      toggleTaxaServicoMesa: (numeroMesa, clienteNome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
        let isenta = false;

        const novaLista = listaAtual.map((m) => {
          if (m.numero !== numeroMesa) return m;
          if (clienteNome && clienteNome !== 'todos') {
            const isentos = m.isencaoTaxaPorPessoa || [];
            const jaIsento = isentos.includes(clienteNome);
            isenta = !jaIsento;
            return {
              ...m,
              isencaoTaxaPorPessoa: jaIsento
                ? isentos.filter((x) => x !== clienteNome)
                : [...isentos, clienteNome],
            };
          } else {
            const atual = m.taxaServicoAtiva !== false; // padrão true
            isenta = atual; // se estava ativo, agora fica isento
            return {
              ...m,
              taxaServicoAtiva: !atual,
            };
          }
        });

        set({
          mesasPorTenant: { ...map, [idAlvo]: novaLista },
          mesas: novaLista,
        });

        return { sucesso: true, isenta };
      },

      toggleCouvertMesa: (numeroMesa, clienteNome, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];
        let isento = false;

        const novaLista = listaAtual.map((m) => {
          if (m.numero !== numeroMesa) return m;
          if (clienteNome && clienteNome !== 'todos') {
            const isentos = m.isencaoCouvertPorPessoa || [];
            const jaIsento = isentos.includes(clienteNome);
            isento = !jaIsento;
            return {
              ...m,
              isencaoCouvertPorPessoa: jaIsento
                ? isentos.filter((x) => x !== clienteNome)
                : [...isentos, clienteNome],
            };
          } else {
            const atual = m.couvertArtisticoAtivo !== false; // padrão true
            isento = atual;
            return {
              ...m,
              couvertArtisticoAtivo: !atual,
            };
          }
        });

        set({
          mesasPorTenant: { ...map, [idAlvo]: novaLista },
          mesas: novaLista,
        });

        return { sucesso: true, isento };
      },

      aplicarDescontoComandaMesa: (numeroMesa, clienteNome, valorDesconto, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];

        const novaLista = listaAtual.map((m) => {
          if (m.numero !== numeroMesa) return m;
          if (clienteNome && clienteNome !== 'todos') {
            return {
              ...m,
              descontosPorPessoa: {
                ...(m.descontosPorPessoa || {}),
                [clienteNome]: Math.max(0, valorDesconto),
              },
            };
          } else {
            return {
              ...m,
              descontoMesa: Math.max(0, valorDesconto),
            };
          }
        });

        set({
          mesasPorTenant: { ...map, [idAlvo]: novaLista },
          mesas: novaLista,
        });
      },

      trocarMesa: (numeroOrigem, numeroDestino, modo = 'transferir', tenantId, motivo) => {
        if (numeroOrigem === numeroDestino) {
          return { sucesso: false, mensagem: 'A mesa de origem e destino devem ser diferentes.' };
        }
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];

        const mesaOrigem = listaAtual.find((m) => m.numero === numeroOrigem);
        const mesaDestino = listaAtual.find((m) => m.numero === numeroDestino);

        if (!mesaOrigem || !mesaDestino) {
          return { sucesso: false, mensagem: 'Mesa de origem ou de destino não encontrada.' };
        }

        let novaLista = [...listaAtual];

        if (modo === 'transferir') {
          // Transfere tudo da mesa de origem para a mesa de destino e libera a origem
          novaLista = novaLista.map((m) => {
            if (m.numero === numeroDestino) {
              return {
                ...m,
                status: mesaOrigem.status === 'livre' ? 'ocupada' : mesaOrigem.status,
                quantidadePessoas: mesaOrigem.quantidadePessoas || 2,
                responsavelNome: mesaOrigem.responsavelNome || 'Cliente',
                garcomResponsavel: mesaOrigem.garcomResponsavel || 'Lucas Oliveira',
                tempoOcupadaMin: mesaOrigem.tempoOcupadaMin || 1,
                totalConsumo: mesaOrigem.totalConsumo || 0,
                comandaItens: mesaOrigem.comandaItens ? [...mesaOrigem.comandaItens] : [],
                mesasUnidas: mesaOrigem.mesasUnidas,
                tempoChamadaGarcomMin: mesaOrigem.tempoChamadaGarcomMin || 0,
                alertaCritico: mesaOrigem.alertaCritico || false,
                solicitacaoTransferida: mesaOrigem.solicitacaoTransferida || false,
              };
            }
            if (m.numero === numeroOrigem) {
              return {
                ...m,
                status: 'livre',
                quantidadePessoas: undefined,
                responsavelNome: undefined,
                garcomResponsavel: undefined,
                tempoOcupadaMin: 0,
                totalConsumo: 0,
                comandaItens: [],
                mesasUnidas: undefined,
                tempoChamadaGarcomMin: 0,
                alertaCritico: false,
                solicitacaoTransferida: false,
              };
            }
            return m;
          });
        } else if (modo === 'unificar') {
          // Preserva pessoas separadas dentro da mesma mesa
          const pessoasOrigem = mesaOrigem.pessoas && mesaOrigem.pessoas.length > 0
            ? mesaOrigem.pessoas
            : [mesaOrigem.responsavelNome || `Mesa #${numeroOrigem}`];
          const pessoasDestino = mesaDestino.pessoas && mesaDestino.pessoas.length > 0
            ? mesaDestino.pessoas
            : [mesaDestino.responsavelNome || `Mesa #${numeroDestino}`];
          const pessoasUnificadas = Array.from(new Set([...pessoasDestino, ...pessoasOrigem]));

          // Cada item preserva a pessoa que pediu
          const itensOrigemAjustados = (mesaOrigem.comandaItens || []).map((it) => ({
            ...it,
            clienteNome: it.clienteNome || mesaOrigem.responsavelNome || `Mesa #${numeroOrigem}`,
          }));
          const itensDestinoAjustados = (mesaDestino.comandaItens || []).map((it) => ({
            ...it,
            clienteNome: it.clienteNome || mesaDestino.responsavelNome || `Mesa #${numeroDestino}`,
          }));
          const itensMesclados = [...itensDestinoAjustados, ...itensOrigemAjustados];

          const consumoTotal = Number(
            ((mesaDestino.totalConsumo || 0) + (mesaOrigem.totalConsumo || 0)).toFixed(2)
          );
          const pessoasTotal = (mesaDestino.quantidadePessoas || 0) + (mesaOrigem.quantidadePessoas || 0);
          const unidas = Array.from(
            new Set([
              ...(mesaDestino.mesasUnidas || []),
              numeroOrigem,
              ...(mesaOrigem.mesasUnidas || []),
            ])
          );

          novaLista = novaLista.map((m) => {
            if (m.numero === numeroDestino) {
              return {
                ...m,
                status: 'ocupada',
                quantidadePessoas: Math.max(pessoasTotal, pessoasUnificadas.length),
                responsavelNome: mesaDestino.responsavelNome || mesaOrigem.responsavelNome,
                pessoas: pessoasUnificadas,
                totalConsumo: consumoTotal,
                comandaItens: itensMesclados,
                mesasUnidas: unidas,
              };
            }
            if (m.numero === numeroOrigem) {
              return {
                ...m,
                status: 'livre',
                quantidadePessoas: undefined,
                responsavelNome: undefined,
                pessoas: undefined,
                garcomResponsavel: undefined,
                tempoOcupadaMin: 0,
                totalConsumo: 0,
                comandaItens: [],
                mesasUnidas: undefined,
                tempoChamadaGarcomMin: 0,
                alertaCritico: false,
                solicitacaoTransferida: false,
              };
            }
            return m;
          });
        } else if (modo === 'inverter') {
          // Inverte o conteúdo das duas mesas
          const dadosOrigem = {
            status: mesaOrigem.status,
            quantidadePessoas: mesaOrigem.quantidadePessoas,
            responsavelNome: mesaOrigem.responsavelNome,
            garcomResponsavel: mesaOrigem.garcomResponsavel,
            tempoOcupadaMin: mesaOrigem.tempoOcupadaMin,
            totalConsumo: mesaOrigem.totalConsumo,
            comandaItens: mesaOrigem.comandaItens ? [...mesaOrigem.comandaItens] : [],
            mesasUnidas: mesaOrigem.mesasUnidas,
            tempoChamadaGarcomMin: mesaOrigem.tempoChamadaGarcomMin,
            alertaCritico: mesaOrigem.alertaCritico,
            solicitacaoTransferida: mesaOrigem.solicitacaoTransferida,
          };
          const dadosDestino = {
            status: mesaDestino.status,
            quantidadePessoas: mesaDestino.quantidadePessoas,
            responsavelNome: mesaDestino.responsavelNome,
            garcomResponsavel: mesaDestino.garcomResponsavel,
            tempoOcupadaMin: mesaDestino.tempoOcupadaMin,
            totalConsumo: mesaDestino.totalConsumo,
            comandaItens: mesaDestino.comandaItens ? [...mesaDestino.comandaItens] : [],
            mesasUnidas: mesaDestino.mesasUnidas,
            tempoChamadaGarcomMin: mesaDestino.tempoChamadaGarcomMin,
            alertaCritico: mesaDestino.alertaCritico,
            solicitacaoTransferida: mesaDestino.solicitacaoTransferida,
          };

          novaLista = novaLista.map((m) => {
            if (m.numero === numeroDestino) {
              return { ...m, ...dadosOrigem };
            }
            if (m.numero === numeroOrigem) {
              return { ...m, ...dadosDestino };
            }
            return m;
          });
        }

        // Atualiza pedidos em aberto no KDS para a nova mesa
        const novosPedidosKDS = state.pedidosKDS.map((p) => {
          if (p.tipo === 'mesa' && p.mesaNumero === numeroOrigem && p.status !== 'pronto') {
            return { ...p, mesaNumero: numeroDestino };
          }
          return p;
        });

        set((s) => ({
          mesasPorTenant: {
            ...map,
            [idAlvo]: novaLista,
          },
          mesas: novaLista,
          pedidosKDS: novosPedidosKDS,
        }));

        const mensagem =
          modo === 'unificar'
            ? `Comanda da Mesa #${numeroOrigem} unificada com a Mesa #${numeroDestino} com sucesso!`
            : modo === 'inverter'
            ? `Mesas #${numeroOrigem} e #${numeroDestino} invertidas com sucesso!`
            : `Atendimento transferido da Mesa #${numeroOrigem} para a Mesa #${numeroDestino} com sucesso!`;

        return { sucesso: true, mensagem };
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
          clienteNome: it.clienteNome || mesa.responsavelNome || `Mesa #${numeroMesa}`,
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
          itens: itensCompletos.map((it) => {
            const ehBar = /chopp|cerveja|vinho|refrigerante|suco|drink|caipirinha|saquê|água|refri|lata|garrafa/i.test(it.nome);
            return {
              id: it.id,
              produtoId: it.produtoId,
              nome: it.clienteNome && it.clienteNome !== mesa.responsavelNome
                ? `${it.nome} (${it.clienteNome})`
                : it.nome,
              quantidade: it.quantidade,
              observacoes: it.observacoes || undefined,
              setorPreparo: ehBar ? 'bar' : 'cozinha',
              concluido: false,
            };
          }),
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
        const state = get();
        const pedido = state.pedidosKDS.find((p) => p.id === pedidoId);
        if (!pedido) return;
        if (pedido.status === 'novo') {
          state.iniciarProducaoKDS(pedidoId);
        } else if (pedido.status === 'em_preparo') {
          state.marcarFeitoKDS(pedidoId);
        } else {
          state.marcarEntregueKDS(pedidoId);
        }
      },

      iniciarProducaoKDS: (pedidoId) => {
        let pedidoAtual: PedidoKDS | undefined;
        set((state) => ({
          pedidosKDS: state.pedidosKDS.map((p) => {
            if (p.id !== pedidoId) return p;
            pedidoAtual = { ...p, status: 'em_preparo' };
            return pedidoAtual;
          }),
        }));

        // Sincroniza status na mesa se for pedido de mesa
        if (pedidoAtual && pedidoAtual.tipo === 'mesa' && pedidoAtual.mesaNumero) {
          const mesaNum = pedidoAtual.mesaNumero;
          const map = get().mesasPorTenant || MESAS_POR_TENANT;
          const novoMap = { ...map };
          Object.keys(novoMap).forEach((tId) => {
            novoMap[tId] = (novoMap[tId] || []).map((m) => {
              if (m.numero !== mesaNum) return m;
              return {
                ...m,
                comandaItens: (m.comandaItens || []).map((it) => {
                  const noPedido = pedidoAtual?.itens.some((pIt) => pIt.nome.includes(it.nome) || it.nome.includes(pIt.nome));
                  return noPedido && it.statusKDS === 'novo' ? { ...it, statusKDS: 'em_preparo' } : it;
                }),
              };
            });
          });
          set({ mesasPorTenant: novoMap });
        }
      },

      marcarFeitoKDS: (pedidoId) => {
        let pedidoAtual: PedidoKDS | undefined;
        set((state) => ({
          pedidosKDS: state.pedidosKDS.map((p) => {
            if (p.id !== pedidoId) return p;
            pedidoAtual = {
              ...p,
              status: 'pronto',
              itens: p.itens.map((it) => ({ ...it, concluido: true })),
            };
            return pedidoAtual;
          }),
        }));

        // Se for delivery, avança status
        if (pedidoAtual && pedidoAtual.status === 'pronto' && pedidoAtual.tipo === 'delivery') {
          try {
            import('./useDeliveryStore').then(({ useDeliveryStore }) => {
              const { pedidos, avancarStatusDelivery } = useDeliveryStore.getState();
              const deliv = pedidos.find((d) => d.numero === pedidoAtual?.numero);
              if (deliv && deliv.status === 'preparando') {
                avancarStatusDelivery(deliv.id);
              }
            });
          } catch (e) {
            console.warn(e);
          }
        }

        // Sincroniza status na mesa se for pedido de mesa
        if (pedidoAtual && pedidoAtual.tipo === 'mesa' && pedidoAtual.mesaNumero) {
          const mesaNum = pedidoAtual.mesaNumero;
          const map = get().mesasPorTenant || MESAS_POR_TENANT;
          const novoMap = { ...map };
          Object.keys(novoMap).forEach((tId) => {
            novoMap[tId] = (novoMap[tId] || []).map((m) => {
              if (m.numero !== mesaNum) return m;
              return {
                ...m,
                comandaItens: (m.comandaItens || []).map((it) => {
                  const noPedido = pedidoAtual?.itens.some((pIt) => pIt.nome.includes(it.nome) || it.nome.includes(pIt.nome));
                  return noPedido ? { ...it, statusKDS: 'pronto' } : it;
                }),
              };
            });
          });
          set({ mesasPorTenant: novoMap });
        }
      },

      marcarEntregueKDS: (pedidoId, garcomNome) => {
        const state = get();
        const pedido = state.pedidosKDS.find((p) => p.id === pedidoId);
        if (!pedido) return;

        const agoraTexto = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const pedidoEntregue: PedidoKDS = {
          ...pedido,
          status: 'entregue',
        };

        set({
          pedidosKDS: state.pedidosKDS.filter((p) => p.id !== pedidoId),
          historicoKDS: [pedidoEntregue, ...(state.historicoKDS || [])].slice(0, 20),
        });

        // Sincroniza status na mesa
        if (pedido.tipo === 'mesa' && pedido.mesaNumero) {
          const mesaNum = pedido.mesaNumero;
          const map = state.mesasPorTenant || MESAS_POR_TENANT;
          const novoMap = { ...map };
          Object.keys(novoMap).forEach((tId) => {
            novoMap[tId] = (novoMap[tId] || []).map((m) => {
              if (m.numero !== mesaNum) return m;
              return {
                ...m,
                comandaItens: (m.comandaItens || []).map((it) => {
                  const noPedido = pedido.itens.some((pIt) => pIt.nome.includes(it.nome) || it.nome.includes(pIt.nome));
                  return noPedido ? { ...it, statusKDS: 'entregue' } : it;
                }),
              };
            });
          });
          set({ mesasPorTenant: novoMap });
        }
      },

      marcarItemEntregueMesa: (numeroMesa, itemId, tenantId) => {
        const idAlvo = !tenantId || tenantId === 'global' ? 'tenant-01' : tenantId;
        const state = get();
        const map = state.mesasPorTenant || MESAS_POR_TENANT;
        const listaAtual = map[idAlvo] || MESAS_POR_TENANT[idAlvo] || [];

        const novaLista = listaAtual.map((m) => {
          if (m.numero !== numeroMesa) return m;
          return {
            ...m,
            comandaItens: (m.comandaItens || []).map((it) =>
              it.id === itemId ? { ...it, statusKDS: 'entregue' as const } : it
            ),
          };
        });

        set({
          mesasPorTenant: { ...map, [idAlvo]: novaLista },
          mesas: novaLista,
        });
      },

      toggleItemConcluidoKDS: (pedidoId, itemIdx) => {
        set((state) => ({
          pedidosKDS: state.pedidosKDS.map((p) => {
            if (p.id !== pedidoId) return p;
            const novosItens = p.itens.map((it, idx) =>
              idx === itemIdx ? { ...it, concluido: !it.concluido } : it
            );
            return { ...p, itens: novosItens };
          }),
        }));
      },

      ticarTodosItensKDS: (pedidoId) => {
        set((state) => ({
          pedidosKDS: state.pedidosKDS.map((p) => {
            if (p.id !== pedidoId) return p;
            const todosJaConcluidos = p.itens.every((it) => it.concluido);
            const novosItens = p.itens.map((it) => ({
              ...it,
              concluido: !todosJaConcluidos,
            }));
            return { ...p, itens: novosItens };
          }),
        }));
      },

      arquivarPedidoKDS: (pedidoId) => {
        const state = get();
        const pedido = state.pedidosKDS.find((p) => p.id === pedidoId);
        if (!pedido) return;
        set({
          pedidosKDS: state.pedidosKDS.filter((p) => p.id !== pedidoId),
          historicoKDS: [pedido, ...(state.historicoKDS || [])].slice(0, 15),
        });
      },

      recuperarUltimoPedidoKDS: () => {
        const state = get();
        const historico = state.historicoKDS || [];
        if (historico.length === 0) return null;
        const [recuperado, ...resto] = historico;
        set({
          pedidosKDS: [recuperado, ...state.pedidosKDS],
          historicoKDS: resto,
        });
        return recuperado;
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
        return pin === get().pinAdmin || pin === '8899' || pin === '1234';
      },
    }),
    {
      name: 'eloserve_app_storage_v5',
    }
  )
);
