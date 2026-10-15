import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto } from '../types';
import { tocarAlertaTransbordo } from '../utils/audioAlert';
import { useSaaSStore } from './useSaaSStore';

export interface MensagemWhatsApp {
  id: string;
  remetente: 'cliente' | 'bot' | 'humano' | 'sistema';
  texto: string;
  hora: string;
  statusEnvio?: 'enviando' | 'enviado' | 'entregue' | 'lido';
  tipo?: 'texto' | 'cardapio' | 'pedido' | 'pix' | 'aviso';
  cardapioItensDestaque?: Array<{ nome: string; preco: number; descricao?: string }>;
  resumoPedido?: {
    itens: Array<{ nome: string; quantidade: number; preco: number }>;
    subtotal: number;
    taxaEntrega: number;
    total: number;
    endereco?: string;
    formaPagamento?: string;
    pedidoId?: string;
    numeroPedido?: number;
    enviadoParaCozinha?: boolean;
    chavePix?: string;
  };
}

export interface PedidoRascunhoWhatsApp {
  itens: Array<{ nome: string; quantidade: number; preco: number }>;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  endereco?: string;
  formaPagamento?: 'pix' | 'cartao_entrega' | 'dinheiro';
  observacoes?: string;
  pedidoId?: string;
  numeroPedido?: number;
  enviadoParaCozinha?: boolean;
  chavePix?: string;
}

export interface ConversaWhatsApp {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteAvatar?: string;
  status: 'ia' | 'humano' | 'finalizado';
  ultimaMensagem: string;
  ultimaHora: string;
  naoLidas: number;
  mensagens: MensagemWhatsApp[];
  pedidoRascunho?: PedidoRascunhoWhatsApp | null;
  mesa?: string | null;
  tenantId?: string | null;
  nomeLoja?: string | null;
}

export interface ConfigEloBot {
  nomeAgente: string;
  tomDeVoz: 'acolhedor' | 'formal' | 'descontraido' | 'vendedor';
  instrucoesCustomizadas: string;
  modeloIA: 'gemini-1.5-flash' | 'gpt-4o-mini' | 'claude-3-haiku';
  temperatura: number;
  tempoMedioEntregaMin: number;
  taxaEntregaFixa: number;
  chavePix: string;
  chaveApiKeyPropria?: string;
  statusInstancia: 'conectado' | 'desconectado' | 'conectando' | 'qrcode';
  telefoneInstancia: string;
  nomeInstancia: string;
  bateriaPct: number;
  autoCriarPedido: boolean;
  notificarTrocaStatus: boolean;
  transbordoHumanoAtivo: boolean;
  horarioFuncionamento: string;
  totalMensagensHoje: number;
  tempoRespostaMedioSeg: number;
  qrCodeDataUrl?: string;
  isServidorRealAtivo?: boolean;

  // Palavras-chave padrão e gatilhos configuráveis por restaurante
  palavrasCardapio: string; // Palavras que acionam o cardápio
  palavrasAtendente: string; // Palavras que acionam transbordo humano
  palavrasPix: string; // Palavras que disparam a chave PIX
  mensagemBoasVindas?: string; // Saudação inicial customizada
  mensagemCardapio?: string; // Mensagem de apresentação do cardápio
  mensagemTransbordo?: string; // Mensagem ao chamar atendente humano
  mensagemPix?: string; // Mensagem com dados de pagamento PIX
}

interface EloBotState {
  configuracoes: Record<string, ConfigEloBot>;
  conversasPorTenant: Record<string, ConversaWhatsApp[]>;
  conversaAtivaId: string | null;

  // Ações de Configuração
  getConfig: (tenantId: string) => ConfigEloBot;
  atualizarConfig: (tenantId: string, dados: Partial<ConfigEloBot>, sincronizarServidor?: boolean) => void;
  sincronizarConfigComServidor: (tenantId: string, produtos?: Produto[], nomeLoja?: string) => Promise<boolean>;
  conectarInstancia: (tenantId: string) => void;
  desconectarInstancia: (tenantId: string) => void;
  gerarNovoQrCode: (tenantId: string) => void;
  concluirLeituraQrCode: (tenantId: string) => void;

  // Ações com o Servidor Baileys Real (WhatsApp Físico)
  conectarSSE: (tenantId: string) => void;
  iniciarConexaoBaileysReal: (tenantId: string) => Promise<void>;
  desconectarBaileysReal: (tenantId: string) => Promise<void>;
  sincronizarStatusBaileysReal: (tenantId: string) => Promise<void>;
  enviarMensagemRealWhatsApp: (telefone: string, texto: string) => Promise<boolean>;

  // Ações de Conversas
  getConversas: (tenantId: string) => ConversaWhatsApp[];
  selecionarConversa: (id: string | null) => void;
  atualizarNomeCliente: (tenantId: string, conversaId: string, novoNome: string) => Promise<boolean>;
  getConversaAtiva: (tenantId: string) => ConversaWhatsApp | undefined;
  enviarMensagemCliente: (tenantId: string, conversaId: string, texto: string, produtosLoja: Produto[], nomeLoja?: string) => void;
  enviarMensagemHumana: (tenantId: string, conversaId: string, texto: string) => void;
  alternarModoAtendimento: (tenantId: string, conversaId: string, novoModo: 'ia' | 'humano' | 'finalizado') => void;
  criarNovaConversa: (tenantId: string, nome: string, telefone: string, mensagemInicial?: string) => string;
  finalizarConversa: (tenantId: string, conversaId: string) => void;
  limparConversasTenant: (tenantId: string) => void;
  removerConversa: (tenantId: string, conversaId: string) => void;
  marcarComoLida: (tenantId: string, conversaId: string) => void;
  notificarStatusPedidoWhatsApp: (tenantId: string, telefone: string, clienteNome: string, numeroPedido: number, novoStatus: string) => void;
  marcarPedidoComoEnviado: (tenantId: string, conversaId: string, pedidoId: string, numeroPedido: number) => void;
  dispararCampanhaPromocional: (tenantId: string, clientes: Array<{ nome: string; telefone: string }>, mensagem: string, cupom?: string) => void;
  getTotalTransbordosPendentes: (tenantId: string) => number;
}

const CONFIG_PADRAO: ConfigEloBot = {
  nomeAgente: 'EloBot Atendente IA',
  tomDeVoz: 'acolhedor',
  instrucoesCustomizadas: 'Ofereça sempre bebida ou sobremesa ao final do pedido. Não cobramos taxa de entrega no primeiro pedido.',
  modeloIA: 'gemini-1.5-flash',
  temperatura: 0.7,
  tempoMedioEntregaMin: 40,
  taxaEntregaFixa: 5.0,
  chavePix: 'financeiro@eloserve.com.br',
  statusInstancia: 'conectado',
  telefoneInstancia: '+55 (31) 97182-6083',
  nomeInstancia: 'eloserve-evolution-oficial',
  bateriaPct: 98,
  autoCriarPedido: true,
  notificarTrocaStatus: true,
  transbordoHumanoAtivo: true,
  horarioFuncionamento: 'Terça a Domingo das 18h00 às 23h30',
  totalMensagensHoje: 47,
  tempoRespostaMedioSeg: 1.2,
  palavrasCardapio: 'A, a, opcao a, 1, cardapio, menu, pratos, opcoes',
  palavrasAtendente: 'B, b, opcao b, 2, atendente, humano, suporte, ajuda',
  palavrasPix: 'C, c, opcao c, 3, pix, chave pix, pagar, pagamento',
  mensagemBoasVindas: 'Olá {nome}! Seja muito bem-vindo ao {loja}! 😊\n\nComo posso te ajudar hoje? Digite apenas a letra da sua opção:\n👉 A - Ver Cardápio e Preços\n👉 B - Falar com Atendente Humano\n👉 C - Chave PIX do Restaurante\n\n_(Ou se preferir, digite seu pedido diretamente!)_',
  mensagemCardapio: 'Olá {nome}! 📋 Segue o Cardápio Selecionado do {loja}:\n\n(Para fazer seu pedido, digite o nome do prato ou digite B para falar com um atendente)',
  mensagemTransbordo: 'Com certeza, {nome}! 👨‍💼 Estou transferindo seu atendimento para nossa equipe do {loja} agora mesmo. Aguarde um instante!',
  mensagemPix: 'A chave PIX oficial do {loja} é:\n🔑 {chave}\n\nAssim que fizer o pagamento, envie o comprovante por aqui para prepararmos seu pedido!',
};

const CONVERSAS_INICIAIS_TENANT_01: ConversaWhatsApp[] = [];

let sseConnection: EventSource | null = null;
const SERVER_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5174'
    ? 'http://localhost:3001'
    : typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3001');

export const useEloBotStore = create<EloBotState>()(
  persist(
    (set, get) => ({
      configuracoes: {
        'tenant-01': {
          ...CONFIG_PADRAO,
          nomeAgente: 'EloBot Fogo de Minas',
          instrucoesCustomizadas: 'Especialista em carnes nobres, ponto da carne (mal passado, ao ponto, bem passado) e chopp artesanal gelado.',
          chavePix: 'financeiro@fogodeminas.com.br',
          palavrasCardapio: 'cardapio, cardápio, menu, carnes, pratos, opcoes, precos, churrasco, cortes',
          palavrasAtendente: 'humano, atendente, garcom, garçom, ajuda, suporte, falar com atendente',
          palavrasPix: 'pix, chave, chave pix, pagar, conta, pagamento',
        },
        'tenant-02': {
          ...CONFIG_PADRAO,
          nomeAgente: 'EloBot Bella Napoli',
          instrucoesCustomizadas: 'Especialista em pizzas de fermentação lenta artesanal e vinhos italianos. Sugira borda recheada de catupiry.',
          chavePix: 'contato@bellanapoli.com.br',
          palavrasCardapio: 'cardapio, cardápio, menu, pizzas, sabores, massas, vinhos, precos',
          palavrasAtendente: 'humano, atendente, ajuda, suporte, falar com atendente',
          palavrasPix: 'pix, chave, chave pix, pagar, pagamento, conta',
        },
      },
      conversasPorTenant: {
        'tenant-01': CONVERSAS_INICIAIS_TENANT_01,
      },
      conversaAtivaId: null,

      getConfig: (tenantId: string) => {
        const state = get();
        if (state.configuracoes[tenantId]) {
          return state.configuracoes[tenantId];
        }

        let nomeLoja = 'Restaurante';
        let chavePix = 'financeiro@eloserve.com.br';
        try {
          const tenant = useSaaSStore.getState().tenants.find((t) => t.id === tenantId);
          if (tenant) {
            nomeLoja = tenant.nomeFantasia;
            if (tenant.documento) chavePix = tenant.documento;
          }
        } catch {}

        return {
          ...CONFIG_PADRAO,
          nomeLoja,
          nomeAgente: `EloBot ${nomeLoja.split(' ')[0]}`,
          chavePix,
          mensagemBoasVindas: `Olá {nome}! Seja muito bem-vindo ao ${nomeLoja}! 😊\n\nComo posso te ajudar hoje? Digite apenas a letra da sua opção:\n👉 A - Ver Cardápio e Preços\n👉 B - Falar com Atendente Humano\n👉 C - Chave PIX do Restaurante\n\n_(Ou se preferir, digite seu pedido diretamente!)_`,
          mensagemCardapio: `Olá {nome}! 📋 Segue o Cardápio Selecionado do ${nomeLoja}:\n\n(Para fazer seu pedido, digite o nome do prato ou digite B para falar com um atendente)`,
          mensagemTransbordo: `Com certeza, {nome}! 👨‍💼 Estou transferindo seu atendimento para nossa equipe do ${nomeLoja} agora mesmo. Aguarde um instante!`,
          mensagemPix: `A chave PIX oficial do ${nomeLoja} é:\n🔑 {chave}\n\nAssim que fizer o pagamento, envie o comprovante por aqui para prepararmos seu pedido!`,
        };
      },

      atualizarConfig: (tenantId: string, dados: Partial<ConfigEloBot>, sincronizarServidor = false) => {
        set((state) => ({
          configuracoes: {
            ...state.configuracoes,
            [tenantId]: {
              ...(state.configuracoes[tenantId] || CONFIG_PADRAO),
              ...dados,
            },
          },
        }));
        if (sincronizarServidor) {
          get().sincronizarConfigComServidor(tenantId).catch(() => {});
        }
      },

      sincronizarConfigComServidor: async (tenantId: string, produtos?: Produto[], nomeLoja?: string) => {
        try {
          const cfg = get().getConfig(tenantId);
          const saasStore = (await import('./useSaaSStore')).useSaaSStore.getState();
          const storeTenant = saasStore.tenants.find((t) => t.id === tenantId);
          const resolvedNomeLoja = nomeLoja || storeTenant?.nomeFantasia || (tenantId === 'tenant-01' ? 'Churrascaria & Parrilla Fogo de Minas' : 'Restaurante');

          const payload: any = {
            tenantId,
            nomeLoja: resolvedNomeLoja,
            nomeAgente: cfg.nomeAgente,
            tomDeVoz: cfg.tomDeVoz,
            modeloIA: cfg.modeloIA,
            chavePix: cfg.chavePix,
            taxaEntregaFixa: cfg.taxaEntregaFixa,
            tempoMedioEntregaMin: cfg.tempoMedioEntregaMin,
            instrucoesCustomizadas: cfg.instrucoesCustomizadas,
            palavrasCardapio: cfg.palavrasCardapio,
            palavrasAtendente: cfg.palavrasAtendente,
            palavrasPix: cfg.palavrasPix,
            mensagemBoasVindas: cfg.mensagemBoasVindas,
            mensagemCardapio: cfg.mensagemCardapio,
            mensagemTransbordo: cfg.mensagemTransbordo,
            mensagemPix: cfg.mensagemPix,
          };

          if (produtos && produtos.length > 0) {
            let catMap = new Map<string, string>();
            try {
              const productStore = (await import('./useProductStore')).useProductStore.getState();
              const categoriasDaLoja = productStore.getCategoriasPorTenant(tenantId);
              catMap = new Map(categoriasDaLoja.map((c) => [c.id, c.nome]));
            } catch (ce) {}

            payload.produtos = produtos.map((p) => ({
              id: p.id,
              nome: p.nome,
              preco: p.precoVenda,
              categoria: catMap.get(p.categoriaId) || p.categoriaId || 'Pratos Principais',
              descricao: p.descricao || '',
              disponivel: p.disponivel !== false,
            }));
          }

          const resp = await fetch(`${SERVER_URL}/api/whatsapp/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          return resp.ok;
        } catch (e) {
          console.warn('Falha ao sincronizar config com servidor:', e);
          return false;
        }
      },

      conectarInstancia: (tenantId: string) => {
        get().atualizarConfig(tenantId, {
          statusInstancia: 'conectado',
          bateriaPct: 99,
        });
      },

      desconectarInstancia: (tenantId: string) => {
        get().atualizarConfig(tenantId, {
          statusInstancia: 'desconectado',
        });
      },

      gerarNovoQrCode: (tenantId: string) => {
        get().atualizarConfig(tenantId, {
          statusInstancia: 'qrcode',
        });
      },

      concluirLeituraQrCode: (tenantId: string) => {
        get().atualizarConfig(tenantId, {
          statusInstancia: 'conectando',
        });
        setTimeout(() => {
          get().atualizarConfig(tenantId, {
            statusInstancia: 'conectado',
            bateriaPct: 100,
          });
        }, 1500);
      },

      // ==============================================================
      // CONEXÃO COM O SERVIDOR BAILEYS REAL (WHATSAPP FÍSICO DO RESTAURANTE)
      // ==============================================================
      conectarSSE: (tenantId: string) => {
        if (sseConnection && sseConnection.readyState !== EventSource.CLOSED) {
          return;
        }

        try {
          if (sseConnection) {
            sseConnection.close();
            sseConnection = null;
          }

          sseConnection = new EventSource(`${SERVER_URL}/api/whatsapp/eventos`);

          sseConnection.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              const { tipo, dados, connectionState } = data;

              if (connectionState?.qrCodeDataUrl) {
                get().atualizarConfig(tenantId, {
                  statusInstancia: 'qrcode',
                  qrCodeDataUrl: connectionState.qrCodeDataUrl,
                });
              }

              if (tipo === 'qrcode_gerado' && dados?.qrCodeDataUrl) {
                get().atualizarConfig(tenantId, {
                  statusInstancia: 'qrcode',
                  qrCodeDataUrl: dados.qrCodeDataUrl,
                });
              } else if (tipo === 'conectado') {
                get().atualizarConfig(tenantId, {
                  statusInstancia: 'conectado',
                  telefoneInstancia: dados.telefone || get().getConfig(tenantId).telefoneInstancia,
                  nomeInstancia: dados.nome || 'WhatsApp Oficial',
                  qrCodeDataUrl: '',
                  bateriaPct: 100,
                });
              } else if (tipo === 'status_change') {
                get().atualizarConfig(tenantId, {
                  statusInstancia: dados.status || 'desconectado',
                  qrCodeDataUrl: dados.qrCodeDataUrl || '',
                });
              } else if (tipo === 'nome_atualizado') {
                const { clienteTelefone, novoNome, mesa, tenantId: nTenantId, nomeLoja: nNomeLoja } = dados;
                set((state) => {
                  const conversas = state.conversasPorTenant[tenantId] || [];
                  const telLimpo = (clienteTelefone || '').replace(/\D/g, '');
                  const atualizadas = conversas.map((c) => {
                    const cTelLimpo = c.clienteTelefone.replace(/\D/g, '');
                    if (
                      c.id.includes(clienteTelefone) ||
                      (telLimpo && cTelLimpo.includes(telLimpo)) ||
                      (telLimpo && telLimpo.includes(cTelLimpo))
                    ) {
                      return {
                        ...c,
                        clienteNome: novoNome,
                        mesa: mesa || c.mesa,
                        tenantId: nTenantId || c.tenantId,
                        nomeLoja: nNomeLoja || c.nomeLoja,
                      };
                    }
                    return c;
                  });
                  return {
                    conversasPorTenant: {
                      ...state.conversasPorTenant,
                      [tenantId]: atualizadas,
                    },
                  };
                });
              } else if (tipo === 'nova_mensagem') {
                // Mensagem recebida de um cliente real ou do bot via WhatsApp
                const { clienteTelefone, clienteNome, mensagem, pedidoCriado, transbordoHumano, mesa, tenantId: msgTenantId, nomeLoja: msgNomeLoja } = dados;

                // Ignora canais/newsletters do WhatsApp
                if (clienteTelefone.includes('120363') || clienteTelefone.includes('newsletter')) {
                  return;
                }

                if (transbordoHumano) {
                  try {
                    tocarAlertaTransbordo();
                  } catch (e) {}
                }

                const telLegivel = clienteTelefone.startsWith('55')
                  ? `(${clienteTelefone.slice(2, 4)}) ${clienteTelefone.slice(4, 9)}-${clienteTelefone.slice(9)}`
                  : clienteTelefone;

                set((state) => {
                  const conversas = state.conversasPorTenant[tenantId] || [];
                  const idx = conversas.findIndex(
                    (c) =>
                      c.clienteTelefone.replace(/\D/g, '').includes(clienteTelefone) ||
                      clienteTelefone.includes(c.clienteTelefone.replace(/\D/g, ''))
                  );

                  let novaLista: ConversaWhatsApp[];

                  if (idx > -1) {
                    const convExistente = conversas[idx];
                    const msgJaExiste = convExistente.mensagens.some((m) => m.id === mensagem.id);
                    if (msgJaExiste) return state;

                    const nomeAtualEhRuim =
                      !convExistente.clienteNome ||
                      convExistente.clienteNome.startsWith('Cliente (') ||
                      convExistente.clienteNome.toLowerCase().includes('kkk') ||
                      convExistente.clienteNome.toLowerCase().includes('muito bom');

                    const nomeNovoEhValido =
                      clienteNome &&
                      !clienteNome.toLowerCase().includes('kkk') &&
                      !clienteNome.toLowerCase().includes('muito bom');

                    const clienteNomeFinal = nomeNovoEhValido
                      ? (nomeAtualEhRuim || !clienteNome.startsWith('Cliente (') ? clienteNome : convExistente.clienteNome)
                      : convExistente.clienteNome;

                    const atualizada: ConversaWhatsApp = {
                      ...convExistente,
                      clienteNome: clienteNomeFinal,
                      clienteTelefone: telLegivel,
                      ultimaMensagem: mensagem.texto,
                      ultimaHora: mensagem.hora,
                      status: transbordoHumano ? 'humano' : convExistente.status,
                      mensagens: [...convExistente.mensagens, mensagem],
                      mesa: mesa || convExistente.mesa || null,
                      tenantId: msgTenantId || convExistente.tenantId || null,
                      nomeLoja: msgNomeLoja || convExistente.nomeLoja || null,
                      pedidoRascunho: mensagem.resumoPedido || convExistente.pedidoRascunho,
                    };
                    novaLista = [...conversas];
                    novaLista[idx] = atualizada;
                  } else {
                    const nomeInicial =
                      clienteNome && !clienteNome.toLowerCase().includes('kkk')
                        ? clienteNome
                        : `Cliente (${clienteTelefone.slice(-4)})`;

                    const novaConv: ConversaWhatsApp = {
                      id: `conv-real-${clienteTelefone}`,
                      clienteNome: nomeInicial,
                      clienteTelefone: telLegivel,
                      status: transbordoHumano ? 'humano' : 'ia',
                      ultimaMensagem: mensagem.texto,
                      ultimaHora: mensagem.hora,
                      naoLidas: 1,
                      mensagens: [mensagem],
                      mesa: mesa || null,
                      tenantId: msgTenantId || null,
                      nomeLoja: msgNomeLoja || null,
                      pedidoRascunho: mensagem.resumoPedido || null,
                    };
                    novaLista = [novaConv, ...conversas];
                  }

                  return {
                    conversasPorTenant: {
                      ...state.conversasPorTenant,
                      [tenantId]: novaLista,
                    },
                    conversaAtivaId: state.conversaAtivaId || `conv-real-${clienteTelefone}`,
                  };
                });

                // Se gerou um pedido real via WhatsApp:
                if (pedidoCriado && mensagem.resumoPedido) {
                  const res = mensagem.resumoPedido;
                  const mesaAlvo = mesa || res.mesa;

                  if (mesaAlvo) {
                    // Lança na comanda da Mesa no Salão e no KDS da cozinha!
                    const numMatch = mesaAlvo.match(/\d+/);
                    const numeroMesa = numMatch ? parseInt(numMatch[0], 10) : 1;
                    try {
                      import('./useAppStore').then(({ useAppStore }) => {
                        const appState = useAppStore.getState();
                        const mesaExistente = appState.mesas.find((m) => m.numero === numeroMesa);
                        if (!mesaExistente) {
                          appState.adicionarMesa({
                            numero: numeroMesa,
                            capacidade: 4,
                            setor: 'Salão',
                          });
                        }
                        const itensComanda = (res.itens || []).map((it: any) => ({
                          produtoId: `prod-wa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          nome: it.nome,
                          quantidade: it.quantidade,
                          precoUnitario: it.preco,
                          subtotal: it.preco * it.quantidade,
                          observacoes: `Pedido WhatsApp Mesa (${clienteNome || 'Cliente'})`,
                        }));
                        appState.lancarItensComandaMesa(numeroMesa, itensComanda, 'EloBot WhatsApp');
                        appState.atualizarStatusMesa(numeroMesa, 'ocupada');
                        appState.editarMesa(numeroMesa, { responsavelNome: clienteNome || 'Cliente WhatsApp' });
                      });
                    } catch (err) {
                      console.warn('Erro ao lançar comanda da mesa pelo EloBot:', err);
                    }
                  } else {
                    // Pedido Delivery normal
                    try {
                      import('./useDeliveryStore').then(({ useDeliveryStore }) => {
                        useDeliveryStore.getState().adicionarPedidoDelivery({
                          clienteNome: clienteNome || `Cliente (${clienteTelefone.slice(-4)})`,
                          clienteTelefone: telLegivel,
                          tipo: 'delivery',
                          endereco: {
                            rua: res.endereco || 'Endereço informado no WhatsApp',
                            numero: 'S/N',
                            bairro: 'Delivery',
                            cidade: 'Belo Horizonte',
                          },
                          status: 'preparando',
                          formaPagamento: res.formaPagamento === 'PIX' ? 'pix' : 'maquininha_entrega',
                          pago: res.formaPagamento === 'PIX',
                          subtotal: res.subtotal,
                          taxaEntrega: res.taxaEntrega,
                          total: res.total,
                          itens: (res.itens || []).map((it: any) => ({
                            nome: it.nome,
                            quantidade: it.quantidade,
                            preco: it.preco,
                            observacoes: 'Pedido via EloBot WhatsApp',
                          })),
                        });
                      });
                    } catch (e) {
                      console.warn('Erro ao criar pedido via Baileys no Delivery:', e);
                    }
                  }
                }

                if (transbordoHumano) {
                  tocarAlertaTransbordo();
                }
              }
            } catch (err) {
              console.error('Erro ao processar evento SSE Baileys:', err);
            }
          };

          sseConnection.onerror = () => {
            console.warn('Conexão SSE com Baileys interrompida.');
          };
        } catch (e) {
          console.error('Erro ao conectar EventSource Baileys:', e);
        }
      },

      iniciarConexaoBaileysReal: async (tenantId: string) => {
        try {
          get().atualizarConfig(tenantId, {
            statusInstancia: 'conectando',
            isServidorRealAtivo: true,
          });

          // 1. Dispara início da sessão no servidor Baileys
          await fetch(`${SERVER_URL}/api/whatsapp/conectar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          // 2. Conecta SSE para ouvir eventos
          get().conectarSSE(tenantId);
        } catch (err) {
          console.error('Erro ao chamar iniciarConexaoBaileysReal:', err);
          get().atualizarConfig(tenantId, {
            statusInstancia: 'desconectado',
            isServidorRealAtivo: false,
          });
        }
      },

      desconectarBaileysReal: async (tenantId: string) => {
        try {
          if (sseConnection) {
            sseConnection.close();
            sseConnection = null;
          }
          await fetch(`${SERVER_URL}/api/whatsapp/desconectar`, { method: 'POST' });
        } catch (err) {
          console.warn('Erro ao desconectar no servidor:', err);
        }
        get().atualizarConfig(tenantId, {
          statusInstancia: 'desconectado',
          qrCodeDataUrl: '',
        });
      },

      sincronizarStatusBaileysReal: async (tenantId: string) => {
        try {
          const resp = await fetch(`${SERVER_URL}/api/whatsapp/status`);
          const data = await resp.json();
          if (data && data.sucesso) {
            get().atualizarConfig(tenantId, {
              statusInstancia: data.status,
              qrCodeDataUrl: data.qrCodeDataUrl || '',
              telefoneInstancia: data.telefone || get().getConfig(tenantId).telefoneInstancia,
              nomeInstancia: data.nome || get().getConfig(tenantId).nomeInstancia,
              isServidorRealAtivo: true,
            });

            // Conectar SSE para escutar em tempo real
            get().conectarSSE(tenantId);

            // Limpa canais/newsletters e conversas mock armazenadas anteriormente
            set((state) => {
              const conversasAtuais = state.conversasPorTenant[tenantId] || [];
              const filtradas = conversasAtuais.filter(
                (c) =>
                  !c.id.startsWith('conv-0') &&
                  !c.id.includes('120363') &&
                  !c.clienteTelefone.includes('120363') &&
                  !c.clienteTelefone.includes('newsletter')
              );
              return {
                conversasPorTenant: {
                  ...state.conversasPorTenant,
                  [tenantId]: filtradas,
                },
                conversaAtivaId: state.conversaAtivaId?.startsWith('conv-0') ? null : state.conversaAtivaId,
              };
            });

            // Sincronizar conversas existentes do servidor
            try {
              const cResp = await fetch(`${SERVER_URL}/api/whatsapp/conversas`);
              const cData = await cResp.json();
              if (cData && cData.sucesso && Array.isArray(cData.conversas) && cData.conversas.length > 0) {
                set((state) => {
                  const conversasAtuais = state.conversasPorTenant[tenantId] || [];
                  // Remove conversas corrompidas antigas (ex: "Kkk Muito Bom" ou LIDs antigos substituídos pelo número real)
                  const filtradas = conversasAtuais.filter(
                    (c) =>
                      !c.clienteNome.toLowerCase().includes('kkk') &&
                      !c.clienteNome.toLowerCase().includes('muito bom') &&
                      !c.id.includes('54735549776053')
                  );
                  const novas = [...filtradas];
                  for (const c of cData.conversas) {
                    if (c.id.includes('120363') || c.clienteTelefone.includes('120363') || c.clienteTelefone.includes('newsletter')) continue;
                    const cNumLimpo = c.clienteTelefone.replace(/\D/g, '');
                    const idx = novas.findIndex(
                      (n) => n.id === c.id || (cNumLimpo && n.clienteTelefone.replace(/\D/g, '') === cNumLimpo)
                    );
                    if (idx > -1) {
                      novas[idx] = c;
                    } else {
                      novas.unshift(c);
                    }
                  }
                  const primeiroReal = novas.find((c) => c.id.startsWith('conv-real-'));
                  return {
                    conversasPorTenant: {
                      ...state.conversasPorTenant,
                      [tenantId]: novas,
                    },
                    conversaAtivaId:
                      state.conversaAtivaId && !state.conversaAtivaId.startsWith('conv-0') && !state.conversaAtivaId.includes('54735549776053')
                        ? state.conversaAtivaId
                        : (primeiroReal ? primeiroReal.id : state.conversaAtivaId),
                  };
                });
              }
            } catch (ce) {}
          }
        } catch (e) {
          // Servidor local não está rodando no momento
          get().atualizarConfig(tenantId, { isServidorRealAtivo: false });
        }
      },

      enviarMensagemRealWhatsApp: async (telefone: string, texto: string) => {
        try {
          const resp = await fetch(`${SERVER_URL}/api/whatsapp/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone, texto }),
          });
          const data = await resp.json();
          return !!data.sucesso;
        } catch (e) {
          console.error('Erro ao enviar mensagem real:', e);
          return false;
        }
      },

      getConversas: (tenantId: string) => {
        const state = get();
        const lista = state.conversasPorTenant[tenantId] || [];
        return lista.filter(
          (c) =>
            !c.id.startsWith('conv-0') &&
            !c.id.includes('120363') &&
            !c.clienteTelefone.includes('120363') &&
            !c.clienteTelefone.includes('newsletter') &&
            !c.clienteNome.includes('Cliente (9480)') &&
            !c.clienteNome.includes('Cliente (3540)') &&
            !c.clienteNome.includes('Cliente (6536)')
        );
      },

      selecionarConversa: (id: string | null) => {
        set({ conversaAtivaId: id });
        if (id) {
          // Marcar como lida
          set((state) => {
            const novasPorTenant = { ...state.conversasPorTenant };
            for (const tId in novasPorTenant) {
              novasPorTenant[tId] = novasPorTenant[tId].map((c) =>
                c.id === id ? { ...c, naoLidas: 0 } : c
              );
            }
            return { conversasPorTenant: novasPorTenant };
          });
        }
      },

      atualizarNomeCliente: async (tenantId: string, conversaId: string, novoNome: string) => {
        const nomeLimpo = novoNome.trim();
        if (!nomeLimpo) return false;

        // Atualização otimista imediata no frontend
        set((state) => {
          const conversas = state.conversasPorTenant[tenantId] || [];
          const atualizadas = conversas.map((c) =>
            c.id === conversaId ? { ...c, clienteNome: nomeLimpo } : c
          );
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: atualizadas,
            },
          };
        });

        // Sincroniza com o servidor Baileys se for conversa real
        try {
          const conversa = (get().conversasPorTenant[tenantId] || []).find((c) => c.id === conversaId);
          const tel = conversa?.clienteTelefone || conversaId.replace('conv-real-', '');
          await fetch(`${SERVER_URL}/api/whatsapp/renomear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone: tel, novoNome: nomeLimpo }),
          });
          return true;
        } catch (e) {
          console.warn('Erro ao atualizar nome no servidor Baileys:', e);
          return true;
        }
      },

      getConversaAtiva: (tenantId: string) => {
        const state = get();
        const conversas = state.conversasPorTenant[tenantId] || [];
        return conversas.find((c) => c.id === state.conversaAtivaId) || conversas[0];
      },

      enviarMensagemHumana: (tenantId: string, conversaId: string, texto: string) => {
        if (!texto.trim()) return;
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const novaMsg: MensagemWhatsApp = {
          id: `msg-${Date.now().toString().slice(-5)}`,
          remetente: 'humano',
          texto: texto.trim(),
          hora: horaAtual,
          statusEnvio: 'entregue',
          tipo: 'texto',
        };

        set((state) => {
          const lista = state.conversasPorTenant[tenantId] || [];
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: lista.map((c) =>
                c.id === conversaId
                  ? {
                      ...c,
                      ultimaMensagem: texto.trim(),
                      ultimaHora: horaAtual,
                      mensagens: [...c.mensagens, novaMsg],
                    }
                  : c
              ),
            },
          };
        });

        // Se houver conexão Baileys ativa, despacha mensagem real para o WhatsApp do cliente
        const state = get();
        const conversa = (state.conversasPorTenant[tenantId] || []).find((c) => c.id === conversaId);
        if (conversa && conversa.clienteTelefone) {
          get().enviarMensagemRealWhatsApp(conversa.clienteTelefone, texto.trim());
        }
      },

      alternarModoAtendimento: (tenantId: string, conversaId: string, novoModo: 'ia' | 'humano' | 'finalizado') => {
        set((state) => {
          const lista = state.conversasPorTenant[tenantId] || [];
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: lista.map((c) =>
                c.id === conversaId
                  ? {
                      ...c,
                      status: novoModo,
                      mensagens: [
                        ...c.mensagens,
                        {
                          id: `msg-${Date.now().toString().slice(-4)}`,
                          remetente: 'sistema',
                          texto:
                            novoModo === 'humano'
                              ? '👤 Atendimento transferido para o Atendente Humano da loja.'
                              : novoModo === 'ia'
                              ? '🤖 Atendimento devolvido para a Inteligência Artificial EloBot.'
                              : '🏁 Atendimento encerrado.',
                          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          statusEnvio: 'lido',
                          tipo: 'aviso',
                        },
                      ],
                    }
                  : c
              ),
            },
          };
        });
      },

      criarNovaConversa: (tenantId: string, nome: string, telefone: string, mensagemInicial?: string) => {
        const idNova = `conv-${Date.now().toString().slice(-4)}`;
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const primeiraMsg: MensagemWhatsApp = {
          id: `msg-${Date.now()}`,
          remetente: 'cliente',
          texto: mensagemInicial || 'Olá! Gostaria de fazer um pedido.',
          hora,
          statusEnvio: 'lido',
          tipo: 'texto',
        };

        const novaConversa: ConversaWhatsApp = {
          id: idNova,
          clienteNome: nome,
          clienteTelefone: telefone,
          status: 'ia',
          ultimaMensagem: primeiraMsg.texto,
          ultimaHora: hora,
          naoLidas: 0,
          mensagens: [primeiraMsg],
        };

        set((state) => ({
          conversasPorTenant: {
            ...state.conversasPorTenant,
            [tenantId]: [novaConversa, ...(state.conversasPorTenant[tenantId] || [])],
          },
          conversaAtivaId: idNova,
        }));

        return idNova;
      },

      finalizarConversa: (tenantId: string, conversaId: string) => {
        get().alternarModoAtendimento(tenantId, conversaId, 'finalizado');
      },

      limparConversasTenant: (tenantId: string) => {
        set((state) => ({
          conversasPorTenant: {
            ...state.conversasPorTenant,
            [tenantId]: [],
          },
          conversaAtivaId: null,
        }));
      },

      removerConversa: (tenantId: string, conversaId: string) => {
        set((state) => ({
          conversasPorTenant: {
            ...state.conversasPorTenant,
            [tenantId]: (state.conversasPorTenant[tenantId] || []).filter((c) => c.id !== conversaId),
          },
          conversaAtivaId: state.conversaAtivaId === conversaId ? null : state.conversaAtivaId,
        }));
      },

      marcarComoLida: (tenantId: string, conversaId: string) => {
        set((state) => ({
          conversasPorTenant: {
            ...state.conversasPorTenant,
            [tenantId]: (state.conversasPorTenant[tenantId] || []).map((c) =>
              c.id === conversaId ? { ...c, naoLidas: 0 } : c
            ),
          },
        }));
      },

      notificarStatusPedidoWhatsApp: (tenantId: string, telefone: string, clienteNome: string, numeroPedido: number, novoStatus: string) => {
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let textoNotificacao = `Olá, ${clienteNome}! `;
        if (novoStatus === 'pronto') {
          textoNotificacao += `Seu pedido #${numeroPedido} acabou de ficar pronto na cozinha e já está sendo embalado! 🍱🔥`;
        } else if (novoStatus === 'a_caminho') {
          textoNotificacao += `🛵💨 Ótima notícia! Seu pedido #${numeroPedido} acabou de sair para entrega com o nosso motoboy. Fique atento ao interfone ou portão!`;
        } else if (novoStatus === 'entregue') {
          textoNotificacao += `🎉 Seu pedido #${numeroPedido} foi entregue com sucesso! Bom apetite! Se precisar de algo a mais, é só me chamar.`;
        } else {
          textoNotificacao += `Atualização do seu pedido #${numeroPedido}: ${novoStatus}.`;
        }

        set((state) => {
          const lista = state.conversasPorTenant[tenantId] || [];
          const conversaExistente = lista.find(
            (c) => c.clienteTelefone.replace(/\D/g, '') === telefone.replace(/\D/g, '')
          );

          const novaMsg: MensagemWhatsApp = {
            id: `msg-notif-${Date.now().toString().slice(-4)}`,
            remetente: 'bot',
            texto: textoNotificacao,
            hora: horaAtual,
            statusEnvio: 'entregue',
            tipo: 'aviso',
          };

          if (conversaExistente) {
            return {
              conversasPorTenant: {
                ...state.conversasPorTenant,
                [tenantId]: lista.map((c) =>
                  c.id === conversaExistente.id
                    ? {
                        ...c,
                        ultimaMensagem: textoNotificacao,
                        ultimaHora: horaAtual,
                        mensagens: [...c.mensagens, novaMsg],
                      }
                    : c
                ),
              },
            };
          }

          // Se não existir conversa prévia, cria uma rápida
          const idNova = `conv-auto-${Date.now().toString().slice(-4)}`;
          const novaConversa: ConversaWhatsApp = {
            id: idNova,
            clienteNome,
            clienteTelefone: telefone,
            status: 'ia',
            ultimaMensagem: textoNotificacao,
            ultimaHora: horaAtual,
            naoLidas: 0,
            mensagens: [novaMsg],
          };

          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: [novaConversa, ...lista],
            },
          };
        });
      },

      marcarPedidoComoEnviado: (tenantId: string, conversaId: string, pedidoId: string, numeroPedido: number) => {
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const config = get().getConfig(tenantId);
        const msgConfirmacao: MensagemWhatsApp = {
          id: `msg-conf-${Date.now().toString().slice(-4)}`,
          remetente: 'bot',
          texto: `🎉 *Pedido #${numeroPedido} confirmado e enviado para a Cozinha (KDS)!* 🍳🔥\n\nNossa equipe já recebeu a comanda e iniciou a preparação.\nTempo estimado de entrega: *${config.tempoMedioEntregaMin} minutos*.\nAssim que o motoboy sair para a entrega, você receberá o aviso em tempo real por aqui! 🛵💨`,
          hora: horaAtual,
          statusEnvio: 'entregue',
          tipo: 'aviso',
        };

        set((state) => {
          const lista = state.conversasPorTenant[tenantId] || [];
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: lista.map((c) => {
                if (c.id !== conversaId) return c;
                const rascunhoAtualizado: PedidoRascunhoWhatsApp | null = c.pedidoRascunho
                  ? {
                      ...c.pedidoRascunho,
                      enviadoParaCozinha: true,
                      pedidoId,
                      numeroPedido,
                    }
                  : null;

                const msgsAtualizadas = c.mensagens.map((m) =>
                  m.resumoPedido
                    ? {
                        ...m,
                        resumoPedido: {
                          ...m.resumoPedido,
                          enviadoParaCozinha: true,
                          pedidoId,
                          numeroPedido,
                        },
                      }
                    : m
                );

                return {
                  ...c,
                  pedidoRascunho: rascunhoAtualizado,
                  ultimaMensagem: msgConfirmacao.texto,
                  ultimaHora: horaAtual,
                  mensagens: [...msgsAtualizadas, msgConfirmacao],
                };
              }),
            },
          };
        });
      },

      enviarMensagemCliente: (tenantId: string, conversaId: string, texto: string, produtosLoja: Produto[], nomeLoja = 'Restaurante') => {
        if (!texto.trim()) return;
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const config = get().getConfig(tenantId);

        const novaMsgCliente: MensagemWhatsApp = {
          id: `msg-${Date.now().toString().slice(-5)}`,
          remetente: 'cliente',
          texto: texto.trim(),
          hora: horaAtual,
          statusEnvio: 'lido',
          tipo: 'texto',
        };

        // Adiciona a mensagem do cliente
        set((state) => {
          const lista = state.conversasPorTenant[tenantId] || [];
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: lista.map((c) =>
                c.id === conversaId
                  ? {
                      ...c,
                      ultimaMensagem: texto.trim(),
                      ultimaHora: horaAtual,
                      mensagens: [...c.mensagens, novaMsgCliente],
                    }
                  : c
              ),
            },
          };
        });

        // Verifica se está em atendimento humano
        const conversaAtual = (get().conversasPorTenant[tenantId] || []).find((c) => c.id === conversaId);
        if (conversaAtual?.status === 'humano') {
          // Em atendimento humano, a IA não responde automaticamente!
          set((state) => {
            const lista = state.conversasPorTenant[tenantId] || [];
            return {
              conversasPorTenant: {
                ...state.conversasPorTenant,
                [tenantId]: lista.map((c) =>
                  c.id === conversaId ? { ...c, naoLidas: c.naoLidas + 1 } : c
                ),
              },
            };
          });
          return;
        }

        // MOTOR DE INTELIGÊNCIA ARTIFICIAL DO ELOBOT
        setTimeout(() => {
          const lower = texto.toLowerCase();
          let respostaBot = '';
          let tipoResposta: MensagemWhatsApp['tipo'] = 'texto';
          let itensDestaque: MensagemWhatsApp['cardapioItensDestaque'] = undefined;
          let resumoPedidoGerado: MensagemWhatsApp['resumoPedido'] = undefined;
          let novoRascunho: PedidoRascunhoWhatsApp | null = conversaAtual?.pedidoRascunho || null;
          let transbordo = false;

          // Detecção de Mesa no simulador
          const matchMesa = texto.match(/\bmesa\s*#?\s*(\d{1,3})\b/i);
          const mesaDetectada = matchMesa
            ? `Mesa ${matchMesa[1].padStart(2, '0')}`
            : (lower.includes('balcao') || lower.includes('balcão') ? 'Balcão' : conversaAtual?.mesa || null);

          if (mesaDetectada && conversaAtual && conversaAtual.mesa !== mesaDetectada) {
            set((state) => {
              const list = state.conversasPorTenant[tenantId] || [];
              return {
                conversasPorTenant: {
                  ...state.conversasPorTenant,
                  [tenantId]: list.map((c) => c.id === conversaId ? { ...c, mesa: mesaDetectada, nomeLoja } : c),
                },
              };
            });
          }

          // 1. Detectar chamada de garçom ou atendente
          if (
            lower.includes('garcom') ||
            lower.includes('garçom') ||
            lower.includes('chamar garcom') ||
            lower.includes('chamar garçom') ||
            (mesaDetectada && lower.trim() === 'b')
          ) {
            respostaBot = `🔔 *GARÇOM ACIONADO PARA A ${mesaDetectada || 'SUA MESA'}!* 🙋‍♂️\n\nOlá, *${conversaAtual?.clienteNome || 'Cliente'}*! Já notificamos nossa equipe do *${nomeLoja}*.\nUm garçom está a caminho para te atender presencialmente!`;
            tipoResposta = 'aviso';
            transbordo = true;
            try {
              tocarAlertaTransbordo();
            } catch (e) {
              console.warn(e);
            }
          }
          else if (
            lower.includes('atendente') ||
            lower.includes('humano') ||
            lower.includes('pessoa') ||
            lower.includes('falar com alguem') ||
            lower.includes('falar com alguém') ||
            lower.includes('cancelar') ||
            lower.includes('reclamação') ||
            lower.includes('reclamaçao')
          ) {
            respostaBot = `Com certeza, ${conversaAtual?.clienteNome || 'amigo(a)'}! Estou transferindo o seu atendimento agora mesmo para a nossa equipe humana do *${nomeLoja}*. 👤🔔 Por favor, aguarde só um instante que um atendente irá te responder por aqui!`;
            tipoResposta = 'aviso';
            transbordo = true;
            try {
              tocarAlertaTransbordo();
            } catch (e) {
              console.warn(e);
            }
          }
          // 2. Consulta de Cardápio / Mesa QR Code / Opções
          else if (
            (mesaDetectada && (lower.includes('ver o cardapio') || lower.includes('fazer meu pedido') || lower.includes('estou na') || lower.includes('to na') || lower.startsWith('ola') || lower.startsWith('oi'))) ||
            lower.includes('cardapio') ||
            lower.includes('cardápio') ||
            lower.includes('menu') ||
            lower.includes('opcoes') ||
            lower.includes('opções') ||
            lower.includes('o que tem') ||
            lower.includes('quais pratos') ||
            lower.includes('recomenda')
          ) {
            const itensDisponiveis = produtosLoja.filter((p) => p.disponivel);
            itensDestaque = itensDisponiveis.slice(0, 5).map((p) => ({
              nome: p.nome,
              preco: p.precoVenda,
              descricao: p.descricao,
            }));

            if (mesaDetectada) {
              const listaTexto = itensDisponiveis
                .map((p) => `• *${p.nome}* — R$ ${p.precoVenda.toFixed(2).replace('.', ',')}${p.descricao ? `\n   _${p.descricao}_` : ''}`)
                .join('\n');

              respostaBot = `🍽️ *ATENDIMENTO NA ${mesaDetectada.toUpperCase()} — ${nomeLoja.toUpperCase()}* 🍽️\nOlá, *${conversaAtual?.clienteNome || 'você'}*! Que alegria ter você conosco aqui na *${mesaDetectada}*! ✨\n\n📋 *CARDÁPIO OFICIAL DA LOJA:*\n\n${listaTexto}\n\n🛎️ *Consumo Presencial na ${mesaDetectada}:*\n✅ *Taxa de Entrega:* R$ 0,00 (Grátis na Mesa)\n⚡ *Preparo:* Enviado diretamente para a Cozinha e Bar!\n\n👉 *Para pedir:* Basta digitar o prato ou bebida desejada (ex: "1x ${itensDisponiveis[0]?.nome || 'prato'}")\n🙋‍♂️ *Chamar Garçom:* Digite *Garçom* ou *B* para atendimento presencial na mesa.`;
            } else {
              const listaTexto = itensDisponiveis
                .slice(0, 6)
                .map((p) => `• *${p.nome}* — R$ ${p.precoVenda.toFixed(2).replace('.', ',')}`)
                .join('\n');

              respostaBot = `Aqui estão nossos pratos e bebidas no *${nomeLoja}*:\n\n${listaTexto}\n\n🛵 Taxa de entrega fixa: R$ ${(config.taxaEntregaFixa || 5).toFixed(2)}\n\nVocê pode pedir qualquer um desses itens diretamente por aqui! O que gostaria de pedir hoje? 🍽️`;
            }
            tipoResposta = 'cardapio';
          }
          // 3. Intenção de Pedido de item específico
          else if (
            lower.includes('quero') ||
            lower.includes('pedir') ||
            lower.includes('manda') ||
            lower.includes('vou querer') ||
            lower.includes('uma') ||
            lower.includes('um')
          ) {
            // Tenta encontrar produtos correspondentes
            const itensEncontrados = produtosLoja.filter((p) => {
              const palavrasItem = p.nome.toLowerCase().split(' ');
              return palavrasItem.some((palavra) => palavra.length > 3 && lower.includes(palavra));
            });

            if (itensEncontrados.length > 0) {
              const itensSelecionados = itensEncontrados.slice(0, 3).map((p) => ({
                nome: p.nome,
                quantidade: 1,
                preco: p.precoVenda,
              }));

              const subtotal = itensSelecionados.reduce((acc, it) => acc + it.preco * it.quantidade, 0);

              if (mesaDetectada) {
                const numeroPedido = Math.floor(100 + Math.random() * 900);
                novoRascunho = {
                  itens: itensSelecionados,
                  subtotal,
                  taxaEntrega: 0,
                  total: subtotal,
                  enviadoParaCozinha: true,
                  numeroPedido,
                  pedidoId: `CMD-${mesaDetectada.replace(/\s+/g, '')}-${numeroPedido}`,
                };
                resumoPedidoGerado = novoRascunho;

                const listaResumo = itensSelecionados
                  .map((it) => `• 1x ${it.nome} - R$ ${it.preco.toFixed(2).replace('.', ',')}`)
                  .join('\n');

                respostaBot = `🍽️ *PEDIDO REGISTRADO PARA A ${mesaDetectada}!* 👨‍🍳\n*Restaurante:* ${nomeLoja}\n\nItens Solicitados:\n${listaResumo}\n\n💰 *Total da Mesa: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n🛎️ *Local:* ${mesaDetectada} (Consumo Presencial • Taxa de Entrega: R$ 0,00)\n\n👨‍🍳 A comanda já foi enviada para a Cozinha e Bar (KDS)!\nEm instantes seus itens serão servidos quentinhos na mesa.`;
                tipoResposta = 'pedido';

                // Registra na comanda da Mesa no useAppStore
                const numMatch = mesaDetectada.match(/\d+/);
                const numeroMesa = numMatch ? parseInt(numMatch[0], 10) : 1;
                try {
                  import('./useAppStore').then(({ useAppStore }) => {
                    const appState = useAppStore.getState();
                    const mesaExistente = appState.mesas.find((m) => m.numero === numeroMesa);
                    if (!mesaExistente) {
                      appState.adicionarMesa({
                        numero: numeroMesa,
                        capacidade: 4,
                        setor: 'Salão',
                      });
                    }
                    const itensCmd = itensSelecionados.map((it) => ({
                      produtoId: `prod-sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      nome: it.nome,
                      quantidade: it.quantidade,
                      precoUnitario: it.preco,
                      subtotal: it.preco * it.quantidade,
                      observacoes: `Pedido WhatsApp Mesa (${conversaAtual?.clienteNome || 'Cliente'})`,
                    }));
                    appState.lancarItensComandaMesa(numeroMesa, itensCmd, 'EloBot WhatsApp');
                    appState.atualizarStatusMesa(numeroMesa, 'ocupada');
                    appState.editarMesa(numeroMesa, { responsavelNome: conversaAtual?.clienteNome || 'Cliente WhatsApp' });
                  });
                } catch (e) {}
              } else {
                const taxa = config.taxaEntregaFixa || 5.0;
                const total = subtotal + taxa;

                novoRascunho = {
                  itens: itensSelecionados,
                  subtotal,
                  taxaEntrega: taxa,
                  total,
                };

                const listaResumo = itensSelecionados
                  .map((it) => `• 1x ${it.nome} (R$ ${it.preco.toFixed(2).replace('.', ',')})`)
                  .join('\n');

                respostaBot = `Perfeito! Entendi seu pedido:\n\n${listaResumo}\n• Taxa de entrega estimada: R$ ${taxa.toFixed(2).replace('.', ',')}\n*Valor Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nPor favor, me informe o seu *endereço completo com bairro* e a *forma de pagamento* (PIX ou Cartão na entrega) para finalizarmos! 🛵`;
                tipoResposta = 'pedido';
                resumoPedidoGerado = {
                  itens: itensSelecionados,
                  subtotal,
                  taxaEntrega: taxa,
                  total,
                };
              }
            } else {
              respostaBot = `Excelente! Vi que você quer fazer um pedido no *${nomeLoja}*. Qual item você deseja? Se quiser, posso listar as opções do cardápio com preços para você escolher! 📋`;
            }
          }
          // 4. Endereço ou Forma de pagamento informada
          else if (
            lower.includes('rua') ||
            lower.includes('av') ||
            lower.includes('avenida') ||
            lower.includes('bairro') ||
            lower.includes('pix') ||
            lower.includes('cartao') ||
            lower.includes('cartão') ||
            lower.includes('dinheiro')
          ) {
            if (novoRascunho && novoRascunho.itens.length > 0) {
              const forma = lower.includes('pix') ? 'pix' : lower.includes('dinheiro') ? 'dinheiro' : 'cartao_entrega';
              novoRascunho.endereco = texto.trim();
              novoRascunho.formaPagamento = forma;
              novoRascunho.chavePix = config.chavePix;

              const chavePixAviso = forma === 'pix' ? `\n\nNossa chave PIX oficial é: *${config.chavePix}*` : '';

              respostaBot = `Sensacional, ${conversaAtual?.clienteNome || 'amigo(a)'}! Pedido 100% confirmado e já enviado para a nossa cozinha! 🍳🔥\n\nTempo estimado de entrega: *${config.tempoMedioEntregaMin} minutos*.${chavePixAviso}\n\nAssim que o motoboy sair com a sua entrega, eu te envio uma notificação por aqui com o aviso em tempo real!`;
              tipoResposta = 'pedido';
              resumoPedidoGerado = {
                itens: novoRascunho.itens,
                subtotal: novoRascunho.subtotal,
                taxaEntrega: novoRascunho.taxaEntrega,
                total: novoRascunho.total,
                endereco: novoRascunho.endereco,
                formaPagamento: forma.toUpperCase(),
                chavePix: config.chavePix,
                enviadoParaCozinha: false,
              };

              // Se autoCriarPedido estiver ativo, cria no Delivery e envia para KDS
              if (config.autoCriarPedido) {
                try {
                  import('./useDeliveryStore').then(({ useDeliveryStore }) => {
                    const novoPed = useDeliveryStore.getState().adicionarPedidoDelivery({
                      clienteNome: conversaAtual?.clienteNome || 'Cliente WhatsApp',
                      clienteTelefone: conversaAtual?.clienteTelefone || '',
                      tipo: 'delivery',
                      endereco: {
                        rua: novoRascunho?.endereco || texto.trim(),
                        numero: 'S/N',
                        bairro: 'Centro',
                        cidade: 'Belo Horizonte',
                        obs: `Pedido feito via WhatsApp EloBot (${forma.toUpperCase()})`,
                      },
                      itens: novoRascunho?.itens || [],
                      subtotal: novoRascunho?.subtotal || 0,
                      taxaEntrega: novoRascunho?.taxaEntrega || 0,
                      total: novoRascunho?.total || 0,
                      formaPagamento: forma as any,
                      status: 'preparando',
                      pago: forma === 'pix',
                    });
                    get().marcarPedidoComoEnviado(tenantId, conversaId, novoPed.id, novoPed.numero);
                  });
                } catch (e) {
                  console.warn('Erro ao criar pedido automático:', e);
                }
              }
            } else {
              respostaBot = `Anotado! Qual prato ou bebida você gostaria de incluir para entregarmos nesse endereço? Posso te sugerir nosso cardápio se desejar! 😋`;
            }
          }
          // 5. PIX
          else if (lower.includes('chave pix') || lower.includes('qual o pix') || lower.includes('chave')) {
            respostaBot = `Nossa chave PIX para pagamentos oficiais é:\n\n🔑 *${config.chavePix}*\n\nBasta realizar a transferência e me enviar o comprovante por aqui que já liberamos seu pedido na hora!`;
            tipoResposta = 'pix';
          }
          // 6. Horário de funcionamento
          else if (lower.includes('horario') || lower.includes('horário') || lower.includes('aberto') || lower.includes('fecha')) {
            respostaBot = `Nosso horário oficial de funcionamento e entregas é:\n🕒 *${config.horarioFuncionamento}*\n\nEstamos abertos e aceitando pedidos a todo vapor! O que gostaria de pedir hoje?`;
          }
          // 7. Saudação inicial
          else if (
            lower.includes('oi') ||
            lower.includes('ola') ||
            lower.includes('olá') ||
            lower.includes('boa noite') ||
            lower.includes('boa tarde') ||
            lower.includes('bom dia')
          ) {
            respostaBot = `Olá, ${conversaAtual?.clienteNome || 'amigo(a)'}! 👋 Seja muito bem-vindo(a) ao *${nomeLoja}*! Sou o ${config.nomeAgente}, seu atendente inteligente 24h.\n\nComo posso te ajudar hoje? Posso te enviar nosso cardápio completo, consultar promoções do dia ou registrar seu pedido de delivery! 🥩🍕`;
          }
          // 8. Resposta contextual padrão com conhecimento da loja
          else {
            const pratoExemplo = produtosLoja[0]?.nome || 'prato especial';
            respostaBot = `Entendido! Aqui no *${nomeLoja}* prezamos pela máxima agilidade e qualidade. Você pode me pedir itens como nosso(a) *${pratoExemplo}*, consultar o cardápio ou digitar *"falar com atendente"* a qualquer momento se precisar de suporte humano! Como posso te servir agora?`;
          }

          const horaResposta = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const novaMsgBot: MensagemWhatsApp = {
            id: `msg-bot-${Date.now().toString().slice(-5)}`,
            remetente: 'bot',
            texto: respostaBot,
            hora: horaResposta,
            statusEnvio: 'lido',
            tipo: tipoResposta,
            cardapioItensDestaque: itensDestaque,
            resumoPedido: resumoPedidoGerado,
          };

          set((state) => {
            const lista = state.conversasPorTenant[tenantId] || [];
            return {
              conversasPorTenant: {
                ...state.conversasPorTenant,
                [tenantId]: lista.map((c) =>
                  c.id === conversaId
                    ? {
                        ...c,
                        status: transbordo ? 'humano' : c.status,
                        ultimaMensagem: respostaBot,
                        ultimaHora: horaResposta,
                        pedidoRascunho: novoRascunho,
                        mensagens: [...c.mensagens, novaMsgBot],
                      }
                    : c
                ),
              },
            };
          });
        }, 800);
      },

      dispararCampanhaPromocional: (tenantId: string, clientes: Array<{ nome: string; telefone: string }>, mensagem: string, cupom?: string) => {
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        set((state) => {
          let lista = [...(state.conversasPorTenant[tenantId] || [])];
          for (const cli of clientes) {
            const limpo = cli.telefone.replace(/\D/g, '');
            const textoPersonalizado = mensagem
              .replace(/\{nome\}/g, cli.nome.split(' ')[0])
              .replace(/\{cupom\}/g, cupom || 'ELOPROMO10');

            const novaMsg: MensagemWhatsApp = {
              id: `msg-camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              remetente: 'bot',
              texto: textoPersonalizado,
              hora: horaAtual,
              statusEnvio: 'entregue',
              tipo: 'texto',
            };

            const idx = lista.findIndex((c) => c.clienteTelefone.replace(/\D/g, '') === limpo);
            if (idx >= 0) {
              lista[idx] = {
                ...lista[idx],
                ultimaMensagem: textoPersonalizado,
                ultimaHora: horaAtual,
                mensagens: [...lista[idx].mensagens, novaMsg],
              };
            } else {
              lista.unshift({
                id: `conv-camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                clienteNome: cli.nome,
                clienteTelefone: cli.telefone,
                status: 'ia',
                ultimaMensagem: textoPersonalizado,
                ultimaHora: horaAtual,
                naoLidas: 0,
                mensagens: [novaMsg],
              });
            }
          }
          return {
            conversasPorTenant: {
              ...state.conversasPorTenant,
              [tenantId]: lista,
            },
          };
        });
      },

      getTotalTransbordosPendentes: (tenantId: string) => {
        const conversas = get().conversasPorTenant[tenantId] || [];
        return conversas.filter((c) => c.status === 'humano').length;
      },
    }),
    {
      name: 'eloserve_elobot_store_v1',
    }
  )
);
