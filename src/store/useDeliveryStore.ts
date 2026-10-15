import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PedidoDelivery, ClienteDelivery, FaixaTaxaEntrega, StatusDelivery } from '../types';
import { useEloBotStore } from './useEloBotStore';
import { useAppStore } from './useAppStore';
import { useEstoqueStore } from './useEstoqueStore';

const FAIXAS_TAXA_PADRAO: FaixaTaxaEntrega[] = [
  { ateKm: 1.5, taxa: 3.0 },
  { ateKm: 2.5, taxa: 4.5 },
  { ateKm: 4.0, taxa: 6.5 },
  { ateKm: 6.0, taxa: 9.0 },
  { ateKm: 10.0, taxa: 14.0 },
];

const CLIENTES_INICIAIS: ClienteDelivery[] = [
  {
    id: 'cli-01',
    nome: 'Mariana Costa',
    telefone: '(31) 98765-4321',
    dataNascimento: '18/10/1992', // Próxima ao aniversário!
    dataUltimoPedido: '12/10/2026',
    descricaoUltimoPedido: 'Combo Família 4 Burgers + Fritas',
    valorUltimoPedido: 119.0,
    totalPedidos: 14, // Quase liberando a recompensa de 15 pedidos do plano de fidelidade!
    totalGasto: 1140.0,
    enderecos: ['Rua Paraíba, 420, Apto 501 - Savassi, Belo Horizonte'],
  },
  {
    id: 'cli-02',
    nome: 'Lucas Silva',
    telefone: '(31) 99123-8899',
    dataNascimento: '05/04/1988',
    dataUltimoPedido: '06/10/2026', // Exatamente 7 dias atrás (alvo perfeito de Remarketing por inatividade!)
    descricaoUltimoPedido: 'Pizza Margherita Especial + Coca-Cola',
    valorUltimoPedido: 65.5,
    totalPedidos: 8,
    totalGasto: 520.0,
    enderecos: ['Av. Getúlio Vargas, 1450 - Funcionários, Belo Horizonte'],
  },
  {
    id: 'cli-03',
    nome: 'Camila Fernandes',
    telefone: '(31) 99455-2211',
    dataNascimento: '15/10/1995', // Aniversário esta semana!
    dataUltimoPedido: '10/10/2026',
    descricaoUltimoPedido: '2x EloBurger Smash Bacon + Chopp',
    valorUltimoPedido: 87.8,
    totalPedidos: 5,
    totalGasto: 412.0,
    enderecos: ['Rua Sergipe, 980 - Boa Viagem, Belo Horizonte'],
  },
];

const PEDIDOS_DELIVERY_INICIAIS: PedidoDelivery[] = [
  {
    id: 'del-101',
    numero: 201,
    clienteNome: 'Mariana Costa',
    clienteTelefone: '(31) 98765-4321',
    tipo: 'delivery',
    endereco: {
      cep: '30130-140',
      rua: 'Rua Paraíba',
      numero: '420',
      complemento: 'Apto 501',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte',
      pontoReferencia: 'Próximo à Praça da Savassi',
      distanciaKm: 1.8,
      obs: 'Interfone quebrado, favor chamar no WhatsApp',
    },
    itens: [
      { nome: 'EloBurger Smash Bacon', quantidade: 2, preco: 34.9 },
      { nome: 'Batata Rústica com Alecrim', quantidade: 1, preco: 24.5 },
      { nome: 'Coca-Cola Lata 350ml', quantidade: 2, preco: 7.5 },
    ],
    subtotal: 109.3,
    taxaEntrega: 4.5,
    total: 113.8,
    formaPagamento: 'pix',
    status: 'pronto',
    horario: '11:20',
    entregadorNome: 'Thiago Silva (Moto 1)',
    pago: true,
  },
  {
    id: 'del-102',
    numero: 202,
    clienteNome: 'Lucas Silva',
    clienteTelefone: '(31) 99123-8899',
    tipo: 'delivery',
    endereco: {
      cep: '30112-021',
      rua: 'Av. Getúlio Vargas',
      numero: '1450',
      bairro: 'Funcionários',
      cidade: 'Belo Horizonte',
      distanciaKm: 2.4,
    },
    itens: [
      { nome: 'Pizza Margherita Especial', quantidade: 1, preco: 58.0 },
      { nome: 'Cerveja Heineken Long Neck', quantidade: 2, preco: 11.0 },
    ],
    subtotal: 80.0,
    taxaEntrega: 4.5,
    total: 84.5,
    formaPagamento: 'maquininha_entrega',
    status: 'a_caminho',
    horario: '11:05',
    entregadorNome: 'Thiago Silva (Moto 1)',
    pago: false,
  },
  {
    id: 'del-103',
    numero: 203,
    clienteNome: 'Gabriel Rocha',
    clienteTelefone: '(31) 99887-1122',
    tipo: 'retirada',
    itens: [
      { nome: 'EloBurger Clássico Salada', quantidade: 1, preco: 29.9 },
      { nome: 'Suco Natural Laranja 400ml', quantidade: 1, preco: 12.0 },
    ],
    subtotal: 41.9,
    taxaEntrega: 0,
    total: 41.9,
    formaPagamento: 'pix',
    status: 'preparando',
    horario: '11:35',
    pago: true,
  },
];

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
      pedidos: PEDIDOS_DELIVERY_INICIAIS,
      clientes: CLIENTES_INICIAIS,
      faixasTaxa: FAIXAS_TAXA_PADRAO,
      raioMaximoKm: 8.0,
      enderecoOrigem: 'Rua Pernambuco, 1000 - Savassi, Belo Horizonte / MG',

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

        // 2. Dar baixa no Estoque e Insumos
        try {
          const { baixarEstoquePorVenda } = useEstoqueStore.getState();
          novo.itens.forEach((it) => {
            baixarEstoquePorVenda(it.nome, it.quantidade);
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

        if (pedidoAlterado && novoStatusCalc) {
          try {
            const { notificarStatusPedidoWhatsApp } = useEloBotStore.getState();
            notificarStatusPedidoWhatsApp(
              'tenant-01',
              pedidoAlterado.clienteTelefone,
              pedidoAlterado.clienteNome,
              pedidoAlterado.numero,
              novoStatusCalc
            );
          } catch (e) {
            console.error('Erro ao disparar notificação WhatsApp:', e);
          }
        }
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
      name: 'eloserve_delivery_store_v1',
    }
  )
);
