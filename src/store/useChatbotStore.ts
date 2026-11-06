import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import QRCode from 'qrcode';
import { useProductStore } from './useProductStore';
import { useAppStore } from './useAppStore';
import { useDeliveryStore } from './useDeliveryStore';
import { supabaseService } from '../services/supabaseService';

export type ProvedorIA = 'gemini' | 'groq' | 'menu_guiado';

export interface MensagemSimulador {
  id: string;
  remetente: 'cliente' | 'bot' | 'humano';
  texto: string;
  horario: string;
  status?: 'enviado' | 'entregue' | 'lido';
  linkCardapio?: string;
  pedidoRascunho?: {
    itens: { nome: string; quantidade: number; preco: number }[];
    total: number;
    taxaEntrega: number;
  };
}

export interface ConfiguracaoChatbotTenant {
  tenantId: string;
  ativo: boolean;
  provedorIA: ProvedorIA;
  apiKeyIA?: string;
  nomeRobo: string;
  statusConexao: 'desconectado' | 'gerando_qr' | 'conectado';
  numeroConectado?: string;
  qrCodeBase64?: string;
  bateriaCelular?: number;

  // Mensagens Customizadas (Anota AI Style)
  mensagemBoasVindas: string;
  mensagemForaHorario: string;
  mensagemCardapio: string;
  mensagemChamarAtendente: string;
  mensagemConfirmacaoPedido: string;

  // Operação de Delivery & Pagamentos
  enviarLinkCardapioAutomatico: boolean;
  tempoMedioEntregaMin: number;
  taxaEntregaPadrao: number;
  chavePix: string;
  tipoChavePix: 'cnpj' | 'cpf' | 'telefone' | 'email' | 'aleatoria';
  formasPagamento: string[];
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: string[];
  palavrasChaveTransbordo: string[];

  // Métricas
  totalConversas: number;
  pedidosGerados: number;
  tempoEconomizadoHoras: number;
}

const CONFIG_PADRAO: Omit<ConfiguracaoChatbotTenant, 'tenantId'> = {
  ativo: true,
  provedorIA: 'gemini',
  apiKeyIA: '',
  nomeRobo: 'EloBot Atendente',
  statusConexao: 'desconectado',
  numeroConectado: undefined,
  bateriaCelular: undefined,
  mensagemBoasVindas:
    'Olá! Seja muito bem-vindo! 🍔\nEu sou o atendente virtual inteligente. Como posso te ajudar hoje?\n\nVocê pode pedir diretamente pelo nosso cardápio digital ou me dizer por aqui mesmo o que você gostaria de comer!',
  mensagemForaHorario:
    'Olá! No momento estamos fechados. Nosso horário de funcionamento para pedidos é das 18:00 às 23:30. Deixe sua mensagem que te responderemos assim que abrirmos!',
  mensagemCardapio:
    'Confira nosso cardápio interativo completo, com fotos, descrições e combos exclusivos!',
  mensagemChamarAtendente:
    'Entendido! Já avisei a nossa equipe de atendimento. Um de nossos colaboradores vai assumir a conversa aqui com você em instantes! ⏳',
  mensagemConfirmacaoPedido:
    'Seu pedido foi confirmado com sucesso e já foi enviado direto para a nossa cozinha! 🚀\nVocê pode acompanhar o preparo e a entrega por aqui.',
  enviarLinkCardapioAutomatico: true,
  tempoMedioEntregaMin: 40,
  taxaEntregaPadrao: 7.0,
  chavePix: '',
  tipoChavePix: 'cnpj',
  formasPagamento: ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro'],
  horarioAbertura: '18:00',
  horarioFechamento: '23:30',
  diasFuncionamento: ['ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
  palavrasChaveTransbordo: ['atendente', 'humano', 'falar com humano', 'ajuda', 'reclamação', 'garçom', 'moça'],
  totalConversas: 0,
  pedidosGerados: 0,
  tempoEconomizadoHoras: 0,
};

interface ChatbotState {
  configuracoes: Record<string, ConfiguracaoChatbotTenant>;
  mensagensSimulador: MensagemSimulador[];
  mensagensPorTenant: Record<string, MensagemSimulador[]>;
  getMensagensSimulador: (tenantId: string) => MensagemSimulador[];
  estaDigitandoSimulador: boolean;
  transbordoAtivo: boolean;

  // Ações de Configuração
  getConfig: (tenantId: string) => ConfiguracaoChatbotTenant;
  atualizarConfig: (tenantId: string, dados: Partial<ConfiguracaoChatbotTenant>) => void;
  gerarQRCodeConexao: (tenantId: string) => Promise<string>;
  desconectarWhatsApp: (tenantId: string) => void;
  simularConexaoSucesso: (tenantId: string, numero?: string) => void;

  // Ações do Simulador
  enviarMensagemSimulador: (tenantId: string, textoCliente: string) => Promise<void>;
  confirmarPedidoSimulador: (tenantId: string, rascunho: NonNullable<MensagemSimulador['pedidoRascunho']>) => void;
  limparConversaSimulador: (tenantId: string) => void;
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set, get) => ({
      configuracoes: {},
      mensagensSimulador: [],
      mensagensPorTenant: {},
      estaDigitandoSimulador: false,
      transbordoAtivo: false,

      getMensagensSimulador: (tenantId: string) => {
        const { mensagensPorTenant } = get();
        if (mensagensPorTenant && mensagensPorTenant[tenantId] && mensagensPorTenant[tenantId].length > 0) {
          return mensagensPorTenant[tenantId];
        }
        const config = get().getConfig(tenantId);
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const mensagemInicial: MensagemSimulador = {
          id: `msg-init-${tenantId}`,
          remetente: 'bot',
          texto: config.mensagemBoasVindas,
          horario: agora,
          status: 'lido',
          linkCardapio: `${window.location.origin}/cardapio/${tenantId}`,
        };
        return [mensagemInicial];
      },

      getConfig: (tenantId: string) => {
        const { configuracoes } = get();
        if (configuracoes[tenantId]) {
          return configuracoes[tenantId];
        }
        const nova: ConfiguracaoChatbotTenant = {
          ...CONFIG_PADRAO,
          tenantId,
          statusConexao: 'desconectado',
          numeroConectado: undefined,
          bateriaCelular: undefined,
        };
        set((state) => ({
          configuracoes: { ...state.configuracoes, [tenantId]: nova },
        }));
        return nova;
      },

      atualizarConfig: (tenantId, dados) => {
        set((state) => {
          const atual = state.configuracoes[tenantId] || { ...CONFIG_PADRAO, tenantId };
          return {
            configuracoes: {
              ...state.configuracoes,
              [tenantId]: { ...atual, ...dados },
            },
          };
        });
      },

      gerarQRCodeConexao: async (tenantId) => {
        get().atualizarConfig(tenantId, {
          statusConexao: 'gerando_qr',
          qrCodeBase64: undefined,
        });

        // Gera código de autenticação simulado estilo Evolution API / Baileys
        const payloadQr = `2@${Date.now()},${Math.random().toString(36).substring(2)},${tenantId},EloServe-WhatsApp-Bridge`;
        try {
          const qrCodeUrl = await QRCode.toDataURL(payloadQr, {
            margin: 2,
            width: 280,
            color: { dark: '#0F172A', light: '#FFFFFF' },
          });

          get().atualizarConfig(tenantId, {
            statusConexao: 'desconectado',
            qrCodeBase64: qrCodeUrl,
          });

          return qrCodeUrl;
        } catch (e) {
          console.error('Falha ao gerar QR Code:', e);
          return '';
        }
      },

      desconectarWhatsApp: (tenantId) => {
        get().atualizarConfig(tenantId, {
          statusConexao: 'desconectado',
          qrCodeBase64: undefined,
          numeroConectado: undefined,
        });
      },

      simularConexaoSucesso: (tenantId, numero) => {
        const config = get().getConfig(tenantId);
        const numeroFinal = numero || config.numeroConectado || '';
        get().atualizarConfig(tenantId, {
          statusConexao: 'conectado',
          numeroConectado: numeroFinal || undefined,
          qrCodeBase64: undefined,
          bateriaCelular: 95,
        });
      },

      limparConversaSimulador: (tenantId) => {
        const config = get().getConfig(tenantId);
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const mensagemInicial: MensagemSimulador = {
          id: `msg-${Date.now()}`,
          remetente: 'bot',
          texto: config.mensagemBoasVindas,
          horario: agora,
          status: 'lido',
          linkCardapio: `${window.location.origin}/cardapio/${tenantId}`,
        };
        set((state) => ({
          mensagensPorTenant: {
            ...state.mensagensPorTenant,
            [tenantId]: [mensagemInicial],
          },
          mensagensSimulador: [mensagemInicial],
          transbordoAtivo: false,
        }));
      },

      enviarMensagemSimulador: async (tenantId, textoCliente) => {
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const msgCliente: MensagemSimulador = {
          id: `msg-${Date.now()}`,
          remetente: 'cliente',
          texto: textoCliente,
          horario: agora,
          status: 'lido',
        };

        set((s) => {
          const listaAtual = s.mensagensPorTenant?.[tenantId] || s.getMensagensSimulador(tenantId);
          const novaLista = [...listaAtual, msgCliente];
          return {
            mensagensPorTenant: {
              ...s.mensagensPorTenant,
              [tenantId]: novaLista,
            },
            mensagensSimulador: novaLista,
            estaDigitandoSimulador: true,
          };
        });

        const config = get().getConfig(tenantId);
        const textoLower = textoCliente.toLowerCase();

        // 1. Verifica se o transbordo humano já está ativo
        if (get().transbordoAtivo) {
          setTimeout(() => {
            const respostaHumano: MensagemSimulador = {
              id: `msg-${Date.now()}`,
              remetente: 'humano',
              texto: 'Olá! Sou o atendente humano da equipe. Estou com seu atendimento aberto aqui na tela!',
              horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'lido',
            };
            set((s) => ({
              mensagensSimulador: [...s.mensagensSimulador, respostaHumano],
              estaDigitandoSimulador: false,
            }));
          }, 1200);
          return;
        }

        // 2. Verifica palavras-chave de transbordo (chamar atendente humano)
        const querAtendente = config.palavrasChaveTransbordo.some((kw) =>
          textoLower.includes(kw.toLowerCase())
        );

        if (querAtendente) {
          setTimeout(() => {
            set((s) => ({
              mensagensSimulador: [
                ...s.mensagensSimulador,
                {
                  id: `msg-${Date.now()}`,
                  remetente: 'bot',
                  texto: config.mensagemChamarAtendente,
                  horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  status: 'lido',
                },
              ],
              estaDigitandoSimulador: false,
              transbordoAtivo: true,
            }));
          }, 1000);
          return;
        }

        // 3. Consulta produtos reais do cardápio do restaurante
        const produtosLoja = useProductStore.getState().produtos.filter(
          (p) => p.disponivel !== false
        );

        // 4. Detecção de intenção do cliente (Estratégia Híbrida Anota AI)
        setTimeout(() => {
          let respostaTexto = '';
          let linkCardapio: string | undefined = undefined;
          let rascunho: MensagemSimulador['pedidoRascunho'] | undefined = undefined;

          // Se perguntar sobre Cardápio / Menu / O que tem para comer
          if (
            textoLower.includes('cardapio') ||
            textoLower.includes('cardápio') ||
            textoLower.includes('menu') ||
            textoLower.includes('pratos') ||
            textoLower.includes('comer')
          ) {
            respostaTexto = `Aqui está o nosso cardápio digital completo! 📖✨\nVocê pode ver fotos de alta qualidade, detalhes e promoções de hoje:\n`;
            linkCardapio = `${window.location.origin}/cardapio/${tenantId}`;
          }
          // Se perguntar sobre taxa de entrega / tempo / endereço
          else if (
            textoLower.includes('taxa') ||
            textoLower.includes('entrega') ||
            textoLower.includes('frete') ||
            textoLower.includes('tempo') ||
            textoLower.includes('demora')
          ) {
            respostaTexto = `🛵 Informações de Delivery:\n• Tempo estimado de entrega: ~${config.tempoMedioEntregaMin} minutos.\n• Taxa padrão: R$ ${config.taxaEntregaPadrao.toFixed(2).replace('.', ',')}.\n• Formas de pagamento: Pix, Cartão na maquininha ou Dinheiro.`;
          }
          // Se perguntar sobre Chave Pix
          else if (textoLower.includes('pix') || textoLower.includes('pagar')) {
            respostaTexto = `💳 Nossa Chave Pix oficial (${config.tipoChavePix.toUpperCase()}):\n👉 ${config.chavePix}\n\nVocê também pode pagar no cartão ou dinheiro na entrega!`;
          }
          // Se cliente está tentando pedir um item do cardápio
          else {
            // Procura se algum produto do cardápio foi mencionado no texto
            const produtoEncontrado = produtosLoja.find((p) =>
              textoLower.includes(p.nome.toLowerCase()) ||
              p.nome.toLowerCase().split(' ').some((palavra) => palavra.length > 3 && textoLower.includes(palavra))
            );

            if (produtoEncontrado) {
              const preco = Number(produtoEncontrado.precoVenda || 0);
              const taxa = config.taxaEntregaPadrao;
              const total = preco + taxa;

              respostaTexto = `Excelente escolha! Encontrei no cardápio:\n🍽️ *${produtoEncontrado.nome}* — R$ ${preco.toFixed(2).replace('.', ',')}\n\nDeseja confirmar esse pedido para entrega?`;
              rascunho = {
                itens: [{ nome: produtoEncontrado.nome, quantidade: 1, preco }],
                taxaEntrega: taxa,
                total,
              };
            } else if (
              textoLower.includes('sim') ||
              textoLower.includes('quero') ||
              textoLower.includes('confirma') ||
              textoLower.includes('pode mandar')
            ) {
              respostaTexto = `Perfeito! ${config.mensagemConfirmacaoPedido}`;
            } else {
              // Resposta acolhedora padrão com IA / Menu
              const exemplos = produtosLoja.slice(0, 3).map((p) => `• ${p.nome} (R$ ${Number(p.precoVenda).toFixed(2)})`).join('\n');
              respostaTexto = `Olá! Que bom falar com você! 😊\n\nNossos destaques de hoje são:\n${exemplos}\n\nVocê pode pedir pelo nosso cardápio digital ou me dizer exatamente o que deseja!`;
              linkCardapio = `${window.location.origin}/cardapio/${tenantId}`;
            }
          }

          const respostaBot: MensagemSimulador = {
            id: `msg-${Date.now()}`,
            remetente: 'bot',
            texto: respostaTexto,
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'lido',
            linkCardapio,
            pedidoRascunho: rascunho,
          };

          set((s) => {
            const listaAtual = s.mensagensPorTenant?.[tenantId] || s.getMensagensSimulador(tenantId);
            const novaLista = [...listaAtual, respostaBot];
            return {
              mensagensPorTenant: {
                ...s.mensagensPorTenant,
                [tenantId]: novaLista,
              },
              mensagensSimulador: novaLista,
              estaDigitandoSimulador: false,
            };
          });
        }, 1100);
      },

      confirmarPedidoSimulador: (tenantId, rascunho) => {
        const config = get().getConfig(tenantId);
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Cria o pedido diretamente no Delivery e na Cozinha KDS!
        const novoPedidoDelivery = {
          id: `deliv-${Date.now().toString().slice(-6)}`,
          tenantId,
          numero: Math.floor(100 + Math.random() * 900),
          tipo: 'delivery' as const,
          clienteNome: 'Cliente WhatsApp (Simulação)',
          clienteTelefone: config.numeroConectado || '',
          status: 'pendente' as const,
          statusKDS: 'novo' as const,
          itens: rascunho.itens.map((it, idx) => ({
            id: `item-${idx}`,
            produtoId: `prod-${idx}`,
            nome: it.nome,
            quantidade: it.quantidade,
            precoUnitario: it.preco,
            subtotal: it.quantidade * it.preco,
            statusKDS: 'novo' as const,
          })),
          total: rascunho.total,
          taxaEntrega: rascunho.taxaEntrega,
          formaPagamento: 'Pix',
          enderecoEntrega: 'Av. Principal, 1000 - Apto 302',
          horario: agora,
        };

        // Envia para o Delivery Store
        try {
          useDeliveryStore.getState().adicionarPedidoDelivery?.({
            clienteNome: novoPedidoDelivery.clienteNome,
            clienteTelefone: novoPedidoDelivery.clienteTelefone,
            itens: novoPedidoDelivery.itens.map((i) => ({
              nome: i.nome,
              quantidade: i.quantidade,
              preco: i.precoUnitario,
            })),
            tipo: 'delivery',
            status: 'preparando',
            subtotal: rascunho.total - rascunho.taxaEntrega,
            taxaEntrega: rascunho.taxaEntrega,
            total: rascunho.total,
            formaPagamento: 'pix',
            pago: true,
            endereco: {
              rua: 'Av. Principal',
              numero: '1000',
              bairro: 'Centro',
              cidade: 'Belo Horizonte',
              obs: 'Pedido recebido via WhatsApp EloBot',
            },
          });
        } catch (e) {
          console.warn('Erro ao inserir no delivery store local:', e);
        }

        // Incrementa métricas de conversão
        get().atualizarConfig(tenantId, {
          pedidosGerados: config.pedidosGerados + 1,
          totalConversas: config.totalConversas + 1,
        });

        // Adiciona mensagem de sucesso ao chat
        const msgSucesso: MensagemSimulador = {
          id: `msg-${Date.now()}`,
          remetente: 'bot',
          texto: `🎉 *PEDIDO CONFIRMADO!*\n\n• Número: #${novoPedidoDelivery.numero}\n• Total: R$ ${rascunho.total.toFixed(2).replace('.', ',')}\n• Endereço: Av. Principal, 1000 - Apto 302\n\nO pedido já caiu na tela da *Cozinha (KDS)* e nos pedidos de *Delivery*! 🚀`,
          horario: agora,
          status: 'lido',
        };

        set((s) => ({
          mensagensSimulador: [...s.mensagensSimulador, msgSucesso],
        }));
      },
    }),
    {
      name: 'eloserve-chatbot-store-v4',
    }
  )
);
