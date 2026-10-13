import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto } from '../types';

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
}

interface EloBotState {
  configuracoes: Record<string, ConfigEloBot>;
  conversasPorTenant: Record<string, ConversaWhatsApp[]>;
  conversaAtivaId: string | null;

  // Ações de Configuração
  getConfig: (tenantId: string) => ConfigEloBot;
  atualizarConfig: (tenantId: string, dados: Partial<ConfigEloBot>) => void;
  conectarInstancia: (tenantId: string) => void;
  desconectarInstancia: (tenantId: string) => void;
  gerarNovoQrCode: (tenantId: string) => void;
  concluirLeituraQrCode: (tenantId: string) => void;

  // Ações de Conversas
  getConversas: (tenantId: string) => ConversaWhatsApp[];
  selecionarConversa: (id: string | null) => void;
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
};

const CONVERSAS_INICIAIS_TENANT_01: ConversaWhatsApp[] = [
  {
    id: 'conv-01',
    clienteNome: 'Mariana Costa',
    clienteTelefone: '(31) 98765-4321',
    status: 'ia',
    ultimaMensagem: 'Perfeito! Já confirmamos seu pedido de Picanha na Brasa.',
    ultimaHora: '19:44',
    naoLidas: 0,
    mensagens: [
      {
        id: 'm1',
        remetente: 'cliente',
        texto: 'Boa noite! Vocês têm opções de carnes nobres para 2 pessoas no cardápio de hoje?',
        hora: '19:40',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
      {
        id: 'm2',
        remetente: 'bot',
        texto: 'Olá, Mariana! Seja muito bem-vinda à Churrascaria & Parrilla Fogo de Minas! 🥩🔥 Temos sim! Nossa *Picanha na Brasa Premium (600g)* e a *Costela Bovina no Bafo 12h* acompanham arroz biro-biro, farofa de ovos e vinagrete. Deseja que eu envie o cardápio completo ou anote o seu pedido?',
        hora: '19:41',
        statusEnvio: 'lido',
        tipo: 'texto',
        cardapioItensDestaque: [
          { nome: 'Picanha na Brasa Premium (600g)', preco: 89.9, descricao: 'Grelhada na brasa com chimichurri da casa' },
          { nome: 'Costela Bovina no Bafo 12h (700g)', preco: 79.9, descricao: 'Derretendo com mandioca na manteiga' },
        ],
      },
      {
        id: 'm3',
        remetente: 'cliente',
        texto: 'Quero pedir uma Picanha na Brasa com 2 Chopps para a Rua Paraíba, 420 Savassi. Pode ser no PIX?',
        hora: '19:43',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
      {
        id: 'm4',
        remetente: 'bot',
        texto: 'Excelente escolha! 🥩🍺 Anotei seu pedido:\n\n• 1x Picanha na Brasa Premium (R$ 89,90)\n• 2x Chopp Artesanal 500ml (R$ 29,80)\n• Taxa de entrega Savassi: R$ 4,50\n*Total: R$ 124,20*\n\nNossa chave PIX é: *financeiro@eloserve.com.br*. O tempo de entrega estimado é de 35 a 45 minutos. Já enviamos direto para a grelha!',
        hora: '19:44',
        statusEnvio: 'lido',
        tipo: 'pedido',
        resumoPedido: {
          itens: [
            { nome: 'Picanha na Brasa Premium (600g)', quantidade: 1, preco: 89.9 },
            { nome: 'Chopp Artesanal Pilsen 500ml', quantidade: 2, preco: 14.9 },
          ],
          subtotal: 119.7,
          taxaEntrega: 4.5,
          total: 124.2,
          endereco: 'Rua Paraíba, 420 - Savassi',
          formaPagamento: 'PIX',
        },
      },
    ],
    pedidoRascunho: {
      itens: [
        { nome: 'Picanha na Brasa Premium (600g)', quantidade: 1, preco: 89.9 },
        { nome: 'Chopp Artesanal Pilsen 500ml', quantidade: 2, preco: 14.9 },
      ],
      subtotal: 119.7,
      taxaEntrega: 4.5,
      total: 124.2,
      endereco: 'Rua Paraíba, 420 - Savassi',
      formaPagamento: 'pix',
    },
  },
  {
    id: 'conv-02',
    clienteNome: 'Carlos Eduardo Mendes',
    clienteTelefone: '(31) 99344-7711',
    status: 'humano',
    ultimaMensagem: 'Olá Carlos, aqui é o Rodrigo da gerência! Em que posso te ajudar?',
    ultimaHora: '20:12',
    naoLidas: 1,
    mensagens: [
      {
        id: 'm21',
        remetente: 'cliente',
        texto: 'Preciso trocar o endereço de entrega do meu pedido que fiz há 5 minutos! Por favor me ajuda.',
        hora: '20:10',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
      {
        id: 'm22',
        remetente: 'cliente',
        texto: 'Quero falar com um atendente humano urgente',
        hora: '20:10',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
      {
        id: 'm23',
        remetente: 'bot',
        texto: 'Com certeza, Carlos! Estou transferindo seu atendimento para a nossa equipe humana agora mesmo. Um atendente entrará no chat em instantes. 👤🔔',
        hora: '20:11',
        statusEnvio: 'lido',
        tipo: 'aviso',
      },
      {
        id: 'm24',
        remetente: 'humano',
        texto: 'Olá Carlos! Aqui é o Rodrigo da gerência. Qual o novo endereço e complemento? Vou avisar o motoboy antes da saída.',
        hora: '20:12',
        statusEnvio: 'entregue',
        tipo: 'texto',
      },
    ],
  },
  {
    id: 'conv-03',
    clienteNome: 'Ana Paula Rezende',
    clienteTelefone: '(31) 98822-3344',
    status: 'ia',
    ultimaMensagem: 'Qual é o horário de almoço de vocês aos domingos?',
    ultimaHora: '20:18',
    naoLidas: 0,
    mensagens: [
      {
        id: 'm31',
        remetente: 'cliente',
        texto: 'Olá! Vocês abrem para almoço no domingo com música ao vivo?',
        hora: '20:17',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
      {
        id: 'm32',
        remetente: 'bot',
        texto: 'Olá, Ana Paula! Sim! Aos domingos abrimos das 11h30 às 17h00 com nosso clássico Rodízio & Parrilla de Cortes Nobres e música ao vivo a partir das 13h. 🎸🥩 Recomendamos fazer reserva de mesa antecipada. Gostaria de reservar para quantas pessoas?',
        hora: '20:18',
        statusEnvio: 'lido',
        tipo: 'texto',
      },
    ],
  },
];

export const useEloBotStore = create<EloBotState>()(
  persist(
    (set, get) => ({
      configuracoes: {
        'tenant-01': {
          ...CONFIG_PADRAO,
          nomeAgente: 'EloBot Fogo de Minas',
          instrucoesCustomizadas: 'Especialista em carnes nobres, ponto da carne (mal passado, ao ponto, bem passado) e chopp artesanal gelado.',
          chavePix: 'financeiro@fogodeminas.com.br',
        },
        'tenant-02': {
          ...CONFIG_PADRAO,
          nomeAgente: 'EloBot Bella Napoli',
          instrucoesCustomizadas: 'Especialista em pizzas de fermentação lenta artesanal e vinhos italianos.',
          chavePix: 'contato@bellanapoli.com.br',
        },
      },
      conversasPorTenant: {
        'tenant-01': CONVERSAS_INICIAIS_TENANT_01,
      },
      conversaAtivaId: 'conv-01',

      getConfig: (tenantId: string) => {
        const state = get();
        return state.configuracoes[tenantId] || { ...CONFIG_PADRAO, nomeAgente: `EloBot Atendente` };
      },

      atualizarConfig: (tenantId: string, dados: Partial<ConfigEloBot>) => {
        set((state) => ({
          configuracoes: {
            ...state.configuracoes,
            [tenantId]: {
              ...(state.configuracoes[tenantId] || CONFIG_PADRAO),
              ...dados,
            },
          },
        }));
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

      getConversas: (tenantId: string) => {
        const state = get();
        return state.conversasPorTenant[tenantId] || [];
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

          // 1. Detectar solicitação de atendente humano
          if (
            lower.includes('atendente') ||
            lower.includes('humano') ||
            lower.includes('pessoa') ||
            lower.includes('falar com alguem') ||
            lower.includes('falar com alguém') ||
            lower.includes('cancelar') ||
            lower.includes('reclamação') ||
            lower.includes('reclamaçao')
          ) {
            respostaBot = `Com certeza, ${conversaAtual?.clienteNome || 'amigo(a)'}! Estou transferindo o seu atendimento agora mesmo para a nossa equipe humana da loja. 👤🔔 Por favor, aguarde só um instante que um atendente irá te responder por aqui!`;
            tipoResposta = 'aviso';
            transbordo = true;
          }
          // 2. Consulta de Cardápio / Preço / Opções
          else if (
            lower.includes('cardapio') ||
            lower.includes('cardápio') ||
            lower.includes('menu') ||
            lower.includes('opcoes') ||
            lower.includes('opções') ||
            lower.includes('o que tem') ||
            lower.includes('quais pratos') ||
            lower.includes('recomenda')
          ) {
            const itensDisponiveis = produtosLoja.filter((p) => p.disponivel).slice(0, 4);
            itensDestaque = itensDisponiveis.map((p) => ({
              nome: p.nome,
              preco: p.precoVenda,
              descricao: p.descricao,
            }));

            const listaTexto = itensDisponiveis
              .map((p) => `• *${p.nome}* — R$ ${p.precoVenda.toFixed(2).replace('.', ',')}`)
              .join('\n');

            respostaBot = `Aqui estão alguns dos nossos pratos mais pedidos hoje no *${nomeLoja}*:\n\n${listaTexto}\n\nVocê pode pedir qualquer um desses itens diretamente por aqui! Deseja que eu monte o seu pedido agora? 🍽️`;
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

              const chavePixAviso = forma === 'pix' ? `\n\nNossa chave PIX oficial é: *${config.chavePix}*` : '';

              respostaBot = `Sensacional, ${conversaAtual?.clienteNome}! Pedido 100% confirmado e já enviado para a nossa cozinha! 🍳🔥\n\nTempo estimado de entrega: *${config.tempoMedioEntregaMin} minutos*.${chavePixAviso}\n\nAssim que o motoboy sair com a sua entrega, eu te envio uma notificação por aqui com o aviso em tempo real!`;
              tipoResposta = 'pedido';
              resumoPedidoGerado = {
                itens: novoRascunho.itens,
                subtotal: novoRascunho.subtotal,
                taxaEntrega: novoRascunho.taxaEntrega,
                total: novoRascunho.total,
                endereco: novoRascunho.endereco,
                formaPagamento: forma.toUpperCase(),
              };
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
    }),
    {
      name: 'eloserve_elobot_store_v1',
    }
  )
);
