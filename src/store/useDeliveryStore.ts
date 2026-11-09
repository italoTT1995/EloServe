import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PedidoDelivery, ClienteDelivery, FaixaTaxaEntrega, StatusDelivery } from '../types';
import { useAppStore } from './useAppStore';
import { useEstoqueStore } from './useEstoqueStore';

const FAIXAS_TAXA_PADRAO: FaixaTaxaEntrega[] = [
  { ateKm: 1.5, taxa: 3.0 },
  { ateKm: 2.5, taxa: 4.5 },
  { ateKm: 4.0, taxa: 6.5 },
  { ateKm: 6.0, taxa: 9.0 },
  { ateKm: 10.0, taxa: 14.0 },
];

const CLIENTES_INICIAIS: ClienteDelivery[] = [];

const PEDIDOS_DELIVERY_INICIAIS: PedidoDelivery[] = [];

interface DeliveryState {
  pedidos: PedidoDelivery[];
  clientes: ClienteDelivery[];
  faixasTaxa: FaixaTaxaEntrega[];
  raioMaximoKm: number;
  enderecoOrigem: string;
  
  // Ações
  adicionarPedidoDelivery: (pedido: Omit<PedidoDelivery, 'id' | 'numero' | 'horario'>) => PedidoDelivery;
  avancarStatusDelivery: (pedidoId: string) => void;
  marcarComoPago: (pedidoId: string) => void;
  atribuirEntregador: (pedidoId: string, entregador: string) => void;
  atualizarFaixasTaxa: (faixas: FaixaTaxaEntrega[]) => void;
  calcularTaxaPorDistancia: (distanciaKm: number) => number;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      pedidos: [],
      clientes: [],
      faixasTaxa: FAIXAS_TAXA_PADRAO,
      raioMaximoKm: 8.0,
      enderecoOrigem: '',

      calcularTaxaPorDistancia: (distanciaKm) => {
        const faixas = get().faixasTaxa.sort((a, b) => a.ateKm - b.ateKm);
        for (const faixa of faixas) {
          if (distanciaKm <= faixa.ateKm) {
            return faixa.taxa;
          }
        }
        return 15.0; // Padrão acima da última faixa
      },

      adicionarPedidoDelivery: (dados) => {
        const novoNumero = 200 + get().pedidos.length + 1;
        const novo: PedidoDelivery = {
          ...dados,
          id: `del-${Date.now().toString().slice(-4)}`,
          numero: novoNumero,
          horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          pedidos: [novo, ...state.pedidos],
        }));

        // 1. Integrar com KDS da Cozinha
        try {
          const { adicionarPedidoKDS } = useAppStore.getState();
          adicionarPedidoKDS({
            id: `kds-${novo.id}`,
            numero: novo.numero,
            tipo: 'delivery',
            nomeCliente: `${novo.clienteNome} (WhatsApp)`,
            status: 'novo',
            itens: novo.itens.map((it) => ({
              nome: it.nome,
              quantidade: it.quantidade,
              observacoes: novo.endereco?.obs || `Entrega WhatsApp (${novo.formaPagamento})`,
            })),
            minutosEspera: 0,
            criadoEm: novo.horario,
          });
        } catch (err) {
          console.warn('Erro ao integrar com KDS:', err);
        }

        // 2. Dar baixa no Estoque e Insumos respeitando ficha técnica e conversão de unidades
        try {
          const { processarBaixaVenda } = useEstoqueStore.getState();
          processarBaixaVenda({
            id: novo.id,
            tenantId: (novo as any).tenantId,
            tipoOrigem: 'delivery',
            dataHora: novo.horario,
            total: novo.total,
            subtotalBruto: novo.subtotal,
            taxaEntrega: novo.taxaEntrega,
            formaPagamento:
              novo.formaPagamento === 'dinheiro'
                ? 'dinheiro'
                : novo.formaPagamento === 'pix'
                ? 'pix'
                : 'credito',
            itens: novo.itens.map((it) => ({
              produtoId: it.nome,
              nome: it.nome,
              quantidade: it.quantidade,
              precoUnitario: it.preco,
              subtotal: it.preco * it.quantidade,
            })),
            operador: 'Delivery WhatsApp / Robô',
            status: 'concluida',
          });
        } catch (err) {
          console.warn('Erro ao processar baixa no estoque:', err);
        }

        // 3. Registrar entrada financeira no Caixa se pago (ex: PIX)
        if (novo.pago) {
          try {
            const { registrarVendaCaixa } = useAppStore.getState();
            registrarVendaCaixa(novo.total);
          } catch (err) {
            console.warn('Erro ao registrar no caixa:', err);
          }
        }

        return novo;
      },

      avancarStatusDelivery: (pedidoId) => {
        let pedidoAlterado: PedidoDelivery | undefined;
        let novoStatusCalc: StatusDelivery | undefined;

        set((state) => ({
          pedidos: state.pedidos.map((p) => {
            if (p.id !== pedidoId) return p;
            let prox: StatusDelivery = p.status;
            if (p.tipo === 'retirada') {
              prox = p.status === 'preparando' ? 'pronto' : 'retirado';
            } else {
              if (p.status === 'preparando') prox = 'pronto';
              else if (p.status === 'pronto') prox = 'retirado';
              else if (p.status === 'retirado') prox = 'a_caminho';
              else if (p.status === 'a_caminho') prox = 'entregue';
            }
            pedidoAlterado = p;
            novoStatusCalc = prox;
            return { ...p, status: prox };
          }),
        }));
      },

      marcarComoPago: (pedidoId) => {
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === pedidoId ? { ...p, pago: true } : p)),
        }));
      },

      atribuirEntregador: (pedidoId, entregador) => {
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, entregadorNome: entregador, status: 'retirado' } : p
          ),
        }));
      },

      atualizarFaixasTaxa: (faixas) => {
        set({ faixasTaxa: faixas });
      },
    }),
    {
      name: 'eloserve_delivery_store_v4',
    }
  )
);
