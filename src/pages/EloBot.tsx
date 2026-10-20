import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Phone,
  QrCode,
  ShieldCheck,
  User,
  Users,
  MessageSquare,
  AlertCircle,
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  Check,
  CheckCheck,
  RefreshCw,
  Cpu,
  Zap,
  Wifi,
  WifiOff,
  FileText,
  ExternalLink,
  Settings,
  CreditCard,
  MessageCircle,
  Printer,
  Megaphone,
  TrendingUp,
  Gift,
  Beer,
  Pizza,
  Battery,
  X,
  Share2,
  Copy,
  Tag,
  Percent,
  ChefHat,
  Edit2,
  Lock,
  Crown,
  ArrowUpRight,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEloBotStore, ConversaWhatsApp, MensagemWhatsApp, ConfigEloBot } from '../store/useEloBotStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';

export default function EloBot() {
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { tenantAtivoId, getTenantAtivo, planos, mudarPlanoTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const { getProdutosPorTenant } = useProductStore();
  const produtosLoja = getProdutosPorTenant(tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId);
  const { adicionarPedidoDelivery, clientes: clientesDelivery } = useDeliveryStore();

  const {
    getConfig,
    atualizarConfig,
    sincronizarConfigComServidor,
    conectarInstancia,
    desconectarInstancia,
    gerarNovoQrCode,
    concluirLeituraQrCode,
    iniciarConexaoBaileysReal,
    desconectarBaileysReal,
    sincronizarStatusBaileysReal,
    getConversas,
    selecionarConversa,
    atualizarNomeCliente,
    conversaAtivaId,
    enviarMensagemCliente,
    enviarMensagemHumana,
    alternarModoAtendimento,
    criarNovaConversa,
    finalizarConversa,
    removerConversa,
    marcarPedidoComoEnviado,
    dispararCampanhaPromocional,
  } = useEloBotStore();

  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const config = getConfig(currentTenantId);
  const conversas = getConversas(currentTenantId);

  // Sincronizar status com o servidor Baileys em background
  useEffect(() => {
    sincronizarStatusBaileysReal(currentTenantId);
    const interval = setInterval(() => {
      sincronizarStatusBaileysReal(currentTenantId);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentTenantId]);

  // Sincroniza a configuração completa do tenant ativo (regras da IA, tom de voz, gatilhos e cardápio) quando muda tenant ou produtos
  const produtosLojaHash = useMemo(() => {
    return produtosLoja.map((p) => `${p.id}-${p.nome}-${p.precoVenda}`).join('|');
  }, [produtosLoja]);

  useEffect(() => {
    sincronizarConfigComServidor(currentTenantId, produtosLoja, tenantAtual.nomeFantasia);
  }, [currentTenantId, produtosLojaHash, tenantAtual.nomeFantasia]);

  // Selecionar primeira conversa se nenhuma estiver ativa
  useEffect(() => {
    if (!conversaAtivaId && conversas.length > 0) {
      selecionarConversa(conversas[0].id);
    }
  }, [conversaAtivaId, conversas]);

  const conversaAtiva = conversas.find((c) => c.id === conversaAtivaId) || conversas[0];

  // Estados locais da UI
  const [filtroConversas, setFiltroConversas] = useState<'todas' | 'ia' | 'humano' | 'finalizado'>('todas');
  const [buscaConversa, setBuscaConversa] = useState('');
  const [inputMensagem, setInputMensagem] = useState('');
  const [abaLateral, setAbaLateral] = useState<'instancia' | 'regras'>('instancia');
  const [modalNovoChat, setModalNovoChat] = useState(false);
  const [modalQrCode, setModalQrCode] = useState(false);
  const [novoClienteForm, setNovoClienteForm] = useState({
    nome: '',
    telefone: '',
    mensagemInicial: '',
  });

  // Estado para renomear cliente diretamente no chat
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNomeTemp, setNovoNomeTemp] = useState('');

  const handleSalvarNome = async () => {
    if (!conversaAtiva || !novoNomeTemp.trim()) {
      setEditandoNome(false);
      return;
    }
    await atualizarNomeCliente(currentTenantId, conversaAtiva.id, novoNomeTemp.trim());
    setEditandoNome(false);
  };

  // Estados de Campanhas de WhatsApp
  const [modalCampanhas, setModalCampanhas] = useState(false);
  const [filtroPublicoCampanha, setFiltroPublicoCampanha] = useState<'todos' | 'inativos' | 'aniversariantes' | 'vips'>('todos');
  const [templateCampanha, setTemplateCampanha] = useState<'desconto' | 'chopp' | 'saudade' | 'aniversario'>('desconto');
  const [textoCampanha, setTextoCampanha] = useState(`Olá {nome}! Hoje temos uma promoção especial de 15% OFF no seu delivery aqui no ${tenantAtual.nomeFantasia}! Use o cupom {cupom} pelo WhatsApp.`);
  const [cupomCampanha, setCupomCampanha] = useState('ELO15OFF');
  const [progressoEnvio, setProgressoEnvio] = useState<number | null>(null);
  const [sucessoCampanha, setSucessoCampanha] = useState<string | null>(null);

  // Estados da Placa de Mesa / Balcão Imprimível com QR Code
  const [modalPlacaMesa, setModalPlacaMesa] = useState(false);
  const [temaPlaca, setTemaPlaca] = useState<'dark' | 'clean'>('dark');
  const [mesaPlacaNumero, setMesaPlacaNumero] = useState('Geral / Balcão');
  const [incluirWifiPlaca, setIncluirWifiPlaca] = useState(true);
  const [redeWifi, setRedeWifi] = useState('FogoDeMinas-Clientes');
  const [senhaWifiPlaca, setSenhaWifiPlaca] = useState('elo2026!');
  const [qrPlacaDataUrl, setQrPlacaDataUrl] = useState<string>('');
  const [qrInstanciaDataUrl, setQrInstanciaDataUrl] = useState<string>('');

  // Estados do Modal Ampliado de Regras da IA
  const [modalRegrasIA, setModalRegrasIA] = useState(false);
  const [abaModalRegras, setAbaModalRegras] = useState<'identidade' | 'gatilhos' | 'delivery' | 'mensagens'>('identidade');

  useEffect(() => {
    if (modalPlacaMesa) {
      const telefoneLimpo = config.telefoneInstancia.replace(/\D/g, '') || '5531998765432';
      const texto = `Olá! Estou na ${mesaPlacaNumero} do ${tenantAtual.nomeFantasia} e gostaria de ver o cardápio e fazer meu pedido.`;
      const urlWa = `https://wa.me/${telefoneLimpo}?text=${encodeURIComponent(texto)}`;
      QRCode.toDataURL(urlWa, { width: 400, margin: 2, errorCorrectionLevel: 'M' })
        .then((url) => setQrPlacaDataUrl(url))
        .catch((err) => console.error('Erro QR Placa:', err));
    }
  }, [modalPlacaMesa, mesaPlacaNumero, config.telefoneInstancia, tenantAtual.nomeFantasia]);

  useEffect(() => {
    if (modalQrCode) {
      if (config.statusInstancia === 'desconectado') {
        iniciarConexaoBaileysReal(currentTenantId);
      } else {
        sincronizarStatusBaileysReal(currentTenantId);
      }
    }
  }, [modalQrCode]);

  // Filtrar clientes da campanha
  const clientesAlvoCampanha = useMemo(() => {
    const todos = clientesDelivery || [];
    if (filtroPublicoCampanha === 'inativos') {
      return todos.filter((c) => (c.totalPedidos || 0) < 10 || c.id === 'cli-02');
    }
    if (filtroPublicoCampanha === 'aniversariantes') {
      const mesAtualStr = String(new Date().getMonth() + 1).padStart(2, '0');
      return todos.filter((c) => c.dataNascimento?.includes(`/${mesAtualStr}/`) || c.id === 'cli-01' || c.id === 'cli-03');
    }
    if (filtroPublicoCampanha === 'vips') {
      return todos.filter((c) => (c.totalPedidos || 0) >= 5);
    }
    return todos;
  }, [clientesDelivery, filtroPublicoCampanha]);

  function handleSelecionarTemplate(tipo: 'desconto' | 'chopp' | 'saudade' | 'aniversario') {
    setTemplateCampanha(tipo);
    if (tipo === 'desconto') {
      setTextoCampanha(`Olá {nome}! Hoje o ${tenantAtual.nomeFantasia} preparou uma condição especial: 15% de desconto no seu delivery! Use o cupom {cupom} direto por aqui.`);
      setCupomCampanha('ELO15OFF');
    } else if (tipo === 'chopp') {
      setTextoCampanha(`Fala {nome}! Hoje tem Rodada Dupla no ${tenantAtual.nomeFantasia}: na compra de qualquer prato, sua bebida sai em dobro! Peça agora com o cupom {cupom}.`);
      setCupomCampanha('DOBRO2026');
    } else if (tipo === 'saudade') {
      setTextoCampanha(`Oi {nome}! Faz tempo que não vemos você aqui no ${tenantAtual.nomeFantasia}. Preparamos R$ 15,00 de desconto no seu próximo pedido com o cupom {cupom}!`);
      setCupomCampanha('VOLTA15');
    } else if (tipo === 'aniversario') {
      setTextoCampanha(`Parabéns pelo seu aniversário, {nome}! 🎂 O ${tenantAtual.nomeFantasia} te presenteia hoje com uma sobremesa deliciosa grátis no seu pedido com o cupom {cupom}!`);
      setCupomCampanha('NIVERDOCE');
    }
  }

  function handleDispararCampanha() {
    if (clientesAlvoCampanha.length === 0) {
      alert('Nenhum cliente encontrado no público selecionado.');
      return;
    }
    setProgressoEnvio(15);
    const interval = setInterval(() => {
      setProgressoEnvio((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) {
          clearInterval(interval);
          dispararCampanhaPromocional(
            currentTenantId,
            clientesAlvoCampanha.map((c: any) => ({ nome: c.nome, telefone: c.telefone })),
            textoCampanha,
            cupomCampanha
          );
          setProgressoEnvio(100);
          setTimeout(() => {
            setProgressoEnvio(null);
            setSucessoCampanha(`Campanha disparada com sucesso para ${clientesAlvoCampanha.length} clientes via WhatsApp!`);
            setTimeout(() => setSucessoCampanha(null), 4000);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  }

  // Form de Configuração da IA
  const [formConfig, setFormConfig] = useState<ConfigEloBot>(config);
  const [toastConfigSalva, setToastConfigSalva] = useState(false);
  const [toastPedidoCriado, setToastPedidoCriado] = useState<string | null>(null);

  // Sincronizar form de config com o tenant ativo
  useEffect(() => {
    setFormConfig(config);
  }, [currentTenantId, config.nomeAgente, config.chavePix, config.palavrasCardapio, config.palavrasAtendente, config.palavrasPix]);

  // Inputs locais para adicionar palavras-chave personalizadas aos gatilhos
  const [inputNovoCardapio, setInputNovoCardapio] = useState('');
  const [inputNovoAtendente, setInputNovoAtendente] = useState('');
  const [inputNovoPix, setInputNovoPix] = useState('');

  // Funções utilitárias de Gatilhos e Palavras-chave
  const adicionarPalavraChave = (campo: 'palavrasCardapio' | 'palavrasAtendente' | 'palavrasPix', novaPalavra: string) => {
    const atual = formConfig[campo] || '';
    const lista = atual.split(',').map((p) => p.trim()).filter(Boolean);
    const palavraLimpa = novaPalavra.trim();
    if (!palavraLimpa) return;
    if (!lista.some((p) => p.toLowerCase() === palavraLimpa.toLowerCase())) {
      lista.push(palavraLimpa);
      setFormConfig({ ...formConfig, [campo]: lista.join(', ') });
    }
  };

  const removerPalavraChave = (campo: 'palavrasCardapio' | 'palavrasAtendente' | 'palavrasPix', palavraRemover: string) => {
    const atual = formConfig[campo] || '';
    const lista = atual.split(',').map((p) => p.trim()).filter(Boolean);
    const filtrada = lista.filter((p) => p.toLowerCase() !== palavraRemover.toLowerCase());
    setFormConfig({ ...formConfig, [campo]: filtrada.join(', ') });
  };

  // Modelos Rápidos Prontos (1-Clique) para o usuário final
  const aplicarModeloLetras = () => {
    setFormConfig({
      ...formConfig,
      palavrasCardapio: 'A, a, opcao a, 1, cardapio, menu',
      palavrasAtendente: 'B, b, opcao b, 2, atendente, humano, suporte',
      palavrasPix: 'C, c, opcao c, 3, pix, chave pix, pagar',
      mensagemBoasVindas: `Olá {nome}! Seja muito bem-vindo ao {loja}! 😊\n\nComo posso te ajudar hoje? Digite apenas a letra da sua opção:\n👉 A - Ver Cardápio e Preços\n👉 B - Falar com Atendente Humano\n👉 C - Chave PIX do Restaurante\n\n_(Ou se preferir, digite seu pedido diretamente!)_`,
      mensagemCardapio: `Olá {nome}! 📋 Segue o Cardápio Selecionado do {loja}:\n\n(Para fazer seu pedido, digite o nome do prato ou digite B para falar com um atendente)`,
      mensagemTransbordo: `Com certeza, {nome}! 👨‍💼 Estou transferindo seu atendimento para nossa equipe do {loja} agora mesmo. Aguarde um instante!`,
      mensagemPix: `A chave PIX do {loja} é:\n🔑 {chave}\n\nAssim que fizer o pagamento, envie o comprovante por aqui para prepararmos seu pedido!`,
    });
  };

  const aplicarModeloNumeros = () => {
    setFormConfig({
      ...formConfig,
      palavrasCardapio: '1, opcao 1, cardapio, menu, pratos',
      palavrasAtendente: '2, opcao 2, atendente, humano, suporte',
      palavrasPix: '3, opcao 3, pix, chave pix, pagar',
      mensagemBoasVindas: `Olá {nome}! Seja muito bem-vindo ao {loja}! 😊\n\nEscolha uma opção digitando o número correspondente:\n1️⃣ 1 - Ver Cardápio e Preços\n2️⃣ 2 - Falar com Atendente Humano\n3️⃣ 3 - Chave PIX do Restaurante`,
      mensagemCardapio: `Olá {nome}! 📋 Segue o Cardápio Selecionado do {loja}:\n\n(Digite o prato desejado ou digite 2 para falar com atendente)`,
      mensagemTransbordo: `Com certeza, {nome}! 👨‍💼 Transferindo para nossa equipe humana do {loja}. Em instantes você será atendido!`,
      mensagemPix: `A chave PIX do {loja} é:\n🔑 {chave}\n\nEnvie o comprovante aqui para liberarmos sua entrega!`,
    });
  };

  const aplicarModeloTextoLivre = () => {
    setFormConfig({
      ...formConfig,
      palavrasCardapio: 'cardapio, cardápio, menu, pratos, opcoes, precos',
      palavrasAtendente: 'humano, atendente, garçom, suporte, ajuda',
      palavrasPix: 'pix, chave, chave pix, pagar, conta',
      mensagemBoasVindas: '',
      mensagemCardapio: '',
      mensagemTransbordo: '',
      mensagemPix: '',
    });
  };

  const inserirVariavel = (campo: 'mensagemBoasVindas' | 'mensagemCardapio' | 'mensagemTransbordo' | 'mensagemPix', tag: string) => {
    const atual = formConfig[campo] || '';
    setFormConfig({ ...formConfig, [campo]: atual ? `${atual} ${tag}` : tag });
  };

  const renderPreviewWhatsapp = (textoTemplate: string, tipo: 'boasVindas' | 'cardapio' | 'transbordo' | 'pix') => {
    let preview = textoTemplate || '';
    if (!preview) {
      if (tipo === 'boasVindas') preview = `Olá Carlos! Que alegria ter você aqui no ${tenantAtual.nomeFantasia}! Como posso te ajudar hoje?`;
      else if (tipo === 'cardapio') preview = `Olá Carlos! 📋 Segue o Cardápio Selecionado do ${tenantAtual.nomeFantasia}:`;
      else if (tipo === 'transbordo') preview = `Com certeza, Carlos! Transferindo para nossa equipe humana agora mesmo.`;
      else if (tipo === 'pix') preview = `A chave PIX oficial do ${tenantAtual.nomeFantasia} é: ${formConfig.chavePix || 'financeiro@fogodeminas.com.br'}`;
    } else {
      preview = preview
        .replace(/\{nome\}/gi, 'Carlos')
        .replace(/\{loja\}/gi, tenantAtual.nomeFantasia)
        .replace(/\{agente\}/gi, formConfig.nomeAgente || 'EloBot')
        .replace(/\{chave\}/gi, formConfig.chavePix || 'financeiro@fogodeminas.com.br');
    }

    return (
      <div className={`mt-2 p-3 rounded-2xl border text-[11px] leading-relaxed relative ${
        isWhite ? 'bg-emerald-50/70 border-emerald-200/80 text-slate-800' : 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>Simulação WhatsApp (Como o cliente recebe)</span>
          </span>
          <span className="text-[9px] text-slate-400 font-mono">18:42</span>
        </div>
        <p className="whitespace-pre-line font-sans">{preview}</p>
        <div className="flex justify-end mt-1 text-emerald-600">
          <CheckCheck className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  };

  // Rolar automaticamente para o fim do chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversaAtiva?.mensagens?.length]);

  // Filtragem de conversas
  const conversasFiltradas = conversas.filter((c) => {
    const matchStatus = filtroConversas === 'todas' || c.status === filtroConversas;
    const matchBusca =
      c.clienteNome.toLowerCase().includes(buscaConversa.toLowerCase()) ||
      c.clienteTelefone.includes(buscaConversa) ||
      c.ultimaMensagem.toLowerCase().includes(buscaConversa.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalIA = conversas.filter((c) => c.status === 'ia').length;
  const totalHumano = conversas.filter((c) => c.status === 'humano').length;

  // Envio de mensagem pelo atendente da loja para o WhatsApp do cliente
  function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMensagem.trim() || !conversaAtiva) return;

    enviarMensagemHumana(currentTenantId, conversaAtiva.id, inputMensagem.trim());
    setInputMensagem('');
  }

  // Enviar Cardápio com 1 clique para o WhatsApp do cliente
  function handleEnviarCardapioRapido() {
    if (!conversaAtiva) return;
    let texto = `📋 *Cardápio Selecionado - ${tenantAtual.nomeFantasia}*\n\n`;
    produtosLoja.slice(0, 8).forEach((p) => {
      texto += `• ${p.nome} — R$ ${p.precoVenda.toFixed(2)}\n`;
    });
    texto += `\n🛵 Taxa de entrega fixa: R$ ${config.taxaEntregaFixa.toFixed(2)}`;
    texto += `\nQual prato você gostaria de pedir hoje?`;
    enviarMensagemHumana(currentTenantId, conversaAtiva.id, texto);
  }

  // Enviar Chave PIX com 1 clique para o WhatsApp do cliente
  function handleEnviarPixRapido() {
    if (!conversaAtiva) return;
    const texto = `🔑 Segue a nossa chave PIX oficial para pagamento:\n\n*${config.chavePix}*\n\nApós o pagamento, envie o comprovante aqui para agilizarmos a preparação!`;
    enviarMensagemHumana(currentTenantId, conversaAtiva.id, texto);
  }

  // Salvar configurações do Robô e sincronizar com o WhatsApp real
  async function handleSalvarConfig(e: React.FormEvent) {
    e.preventDefault();
    atualizarConfig(currentTenantId, formConfig);
    await sincronizarConfigComServidor(currentTenantId, produtosLoja, tenantAtual.nomeFantasia);
    setToastConfigSalva(true);
    setTimeout(() => setToastConfigSalva(false), 3000);
  }

  // Criar Pedido no Delivery ou Lançar na Comanda da Mesa a partir do Rascunho da Conversa
  function handleConfirmarPedidoNoDelivery() {
    if (!conversaAtiva || !conversaAtiva.pedidoRascunho) return;
    const rascunho = conversaAtiva.pedidoRascunho;

    // Se for consumo em mesa/salão
    if (conversaAtiva.mesa) {
      const matchMesa = conversaAtiva.mesa.match(/\d+/);
      const mesaNum = matchMesa ? parseInt(matchMesa[0], 10) : 1;

      const itensComanda = rascunho.itens.map((it, idx) => ({
        produtoId: `prod_wa_${idx}`,
        nome: it.nome,
        quantidade: it.quantidade,
        precoUnitario: it.preco,
        subtotal: it.preco * it.quantidade,
        observacoes: 'Pedido via EloBot WhatsApp',
      }));

      useAppStore.getState().lancarItensComandaMesa(mesaNum, itensComanda, 'EloBot WhatsApp', currentTenantId);
      marcarPedidoComoEnviado(currentTenantId, conversaAtiva.id, `MESA-${mesaNum}`, mesaNum);

      setToastPedidoCriado(
        `🍽️ Pedido da ${conversaAtiva.mesa} (${conversaAtiva.clienteNome}) lançado na Comanda do Salão e enviado à Cozinha!`
      );
      setTimeout(() => setToastPedidoCriado(null), 5000);
      return;
    }

    const novoPed = adicionarPedidoDelivery({
      clienteNome: conversaAtiva.clienteNome,
      clienteTelefone: conversaAtiva.clienteTelefone,
      tipo: 'delivery',
      endereco: {
        rua: rascunho.endereco || 'Endereço informado via WhatsApp',
        numero: 'S/N',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        obs: 'Pedido feito via EloBot WhatsApp',
      },
      itens: rascunho.itens.map((it) => ({
        nome: it.nome,
        quantidade: it.quantidade,
        preco: it.preco,
      })),
      subtotal: rascunho.subtotal,
      taxaEntrega: rascunho.taxaEntrega,
      total: rascunho.total,
      formaPagamento: (rascunho.formaPagamento as any) || 'pix',
      status: 'preparando',
      pago: rascunho.formaPagamento === 'pix',
    });

    marcarPedidoComoEnviado(currentTenantId, conversaAtiva.id, novoPed.id, novoPed.numero);

    setToastPedidoCriado(
      `🎉 Pedido #${novoPed.numero} (${conversaAtiva.clienteNome}) enviado para KDS Cozinha, Delivery e baixado no estoque!`
    );
    setTimeout(() => setToastPedidoCriado(null), 5000);
  }

  // Criar novo chat
  function handleCriarNovoChat(e: React.FormEvent) {
    e.preventDefault();
    if (!novoClienteForm.nome || !novoClienteForm.telefone) {
      alert('Informe o nome e telefone do cliente.');
      return;
    }
    const novoId = criarNovaConversa(
      currentTenantId,
      novoClienteForm.nome,
      novoClienteForm.telefone,
      novoClienteForm.mensagemInicial || 'Olá! Gostaria de fazer um pedido.'
    );
    setModalNovoChat(false);
    setNovoClienteForm({ nome: '', telefone: '', mensagemInicial: '' });

    // Resposta automática da IA
    setTimeout(() => {
      enviarMensagemCliente(
        currentTenantId,
        novoId,
        novoClienteForm.mensagemInicial || 'Olá! Gostaria de fazer um pedido.',
        produtosLoja,
        tenantAtual.nomeFantasia
      );
    }, 600);
  }

  const planoAtual = planos.find((p) => p.id === tenantAtual?.planoId) || planos[0];
  const iaDisponivel = tenantAtivoId === 'global' || planoAtual.limites.whatsappIAIncluso === true;

  if (!iaDisponivel) {
    return (
      <div className="h-full flex items-center justify-center p-6 min-h-[75vh]">
        <div className={`max-w-lg w-full rounded-3xl p-8 text-center shadow-2xl border ${
          isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 inline-block mb-3">
            Exclusivo Plano Enterprise & IA
          </span>
          <h2 className={`text-xl font-black mb-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            EloBot WhatsApp com IA 24h
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            O restaurante <strong className={isWhite ? 'text-slate-800' : 'text-slate-200'}>{tenantAtual?.nomeFantasia}</strong> está no plano <strong className="text-amber-400">{planoAtual.nome}</strong>. O Atendente 24h no WhatsApp oficial com Inteligência Artificial generativa, cardápio automático e transbordo humano é exclusivo do <strong className="text-purple-400">Plano Enterprise</strong>.
          </p>
          <div className={`p-4 rounded-2xl border text-left mb-6 space-y-2.5 ${
            isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className={`text-xs flex items-center gap-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Atendimento automático de clientes no WhatsApp oficial 24h por dia</span>
            </div>
            <div className={`text-xs flex items-center gap-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cardápio dinâmico automático e integração com chave PIX</span>
            </div>
            <div className={`text-xs flex items-center gap-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pedidos enviados automaticamente para a Comanda do Salão e Cozinha</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (tenantAtual) mudarPlanoTenant(tenantAtual.id, 'enterprise');
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Fazer Upgrade para o Plano Enterprise (R$ 299/mês)</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none pb-10">
      {/* Top Banner do EloBot */}
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl shadow-xl border ${
        isWhite
          ? 'bg-white border-slate-200'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                EloBot — Atendente Inteligente 24h no WhatsApp
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider flex items-center gap-1 ${
                isWhite
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-emerald-600' : 'bg-emerald-400'} animate-pulse`}></span>
                <span>{config.statusInstancia === 'conectado' ? 'IA Online' : 'Desconectado'}</span>
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
              Atendimento autônomo com cardápio dinâmico do restaurante <strong className={isWhite ? 'text-slate-900 font-extrabold' : 'text-white'}>{tenantAtual.nomeFantasia}</strong>, fechamento de pedidos e transbordo humano.
            </p>
          </div>
        </div>

        {/* Status da Instância & Ações Rápidas */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {config.statusInstancia === 'conectado' ? (
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border ${
              isWhite
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                : 'bg-slate-950/80 border-emerald-500/30'
            }`}>
              <Phone className={`w-3.5 h-3.5 ${isWhite ? 'text-emerald-700' : 'text-emerald-400'}`} />
              <span className={`text-xs font-mono font-bold ${isWhite ? 'text-emerald-900' : 'text-emerald-300'}`}>{config.telefoneInstancia}</span>
              <span className={isWhite ? 'text-emerald-400' : 'text-slate-500'}>|</span>
              <Battery className={`w-3.5 h-3.5 ${isWhite ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span className={`text-[11px] font-mono ${isWhite ? 'text-emerald-800' : 'text-slate-300'}`}>{config.bateriaPct}%</span>
            </div>
          ) : (
            <button
              onClick={() => {
                gerarNovoQrCode(currentTenantId);
                setModalQrCode(true);
              }}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isWhite
                  ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Conectar WhatsApp (QR Code)</span>
            </button>
          )}

          <button
            onClick={() => setModalPlacaMesa(true)}
            className={`px-3.5 py-2 rounded-2xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
              isWhite
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900'
                : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300'
            }`}
            title="Gerar Display / Placa de Mesa e Balcão com QR Code para Impressão"
          >
            <Printer className={`w-4 h-4 ${isWhite ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <span>Placa QR Code de Mesa</span>
          </button>

          <button
            onClick={() => setModalCampanhas(true)}
            className={`px-3.5 py-2 rounded-2xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
              isWhite
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/40 text-amber-300'
            }`}
            title="Disparar campanhas e cupons promocionais pelo WhatsApp"
          >
            <Megaphone className={`w-4 h-4 ${isWhite ? 'text-amber-700' : 'text-amber-400'}`} />
            <span>Campanhas no WhatsApp</span>
          </button>

          <button
            onClick={() => setModalNovoChat(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 !text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 !text-white" />
            <span className="!text-white">Novo Chat de Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: 3 Colunas (Lista Conversas | Chat Ao Vivo | Painel IA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* COLUNA 1: Lista de Conversas do WhatsApp (4 cols) */}
        <div className={`lg:col-span-4 rounded-3xl flex flex-col overflow-hidden shadow-xl border h-[calc(100vh-215px)] min-h-[580px] max-h-[820px] ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {/* Header e Busca */}
          <div className={`p-4 border-b space-y-3 shrink-0 ${isWhite ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/40'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>Conversas WhatsApp</h3>
              </div>
              <span className={`text-xs font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                {conversas.length} cliente{conversas.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={buscaConversa}
                onChange={(e) => setBuscaConversa(e.target.value)}
                placeholder="Buscar cliente, telefone ou texto..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs transition-colors border focus:outline-none focus:border-emerald-500 ${
                  isWhite
                    ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                }`}
              />
            </div>

            {/* Filtros por tipo de atendimento */}
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl text-[11px] font-semibold text-center ${
              isWhite ? 'bg-slate-100' : 'bg-slate-950'
            }`}>
              <button
                onClick={() => setFiltroConversas('todas')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filtroConversas === 'todas'
                    ? isWhite ? 'bg-white text-slate-900 shadow-sm font-bold' : 'bg-slate-800 text-white font-bold'
                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroConversas('ia')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  filtroConversas === 'ia'
                    ? isWhite ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30'
                    : isWhite ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span>IA</span>
                <span className={`text-[9px] px-1 rounded ${isWhite ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-500/20'}`}>{totalIA}</span>
              </button>
              <button
                onClick={() => setFiltroConversas('humano')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  filtroConversas === 'humano'
                    ? isWhite ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' : 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30'
                    : isWhite ? 'text-slate-600 hover:text-amber-800' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <span>Humano</span>
                {totalHumano > 0 && (
                  <span className="text-[9px] px-1 rounded bg-amber-500 text-black font-extrabold animate-pulse">{totalHumano}</span>
                )}
              </button>
              <button
                onClick={() => setFiltroConversas('finalizado')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filtroConversas === 'finalizado'
                    ? isWhite ? 'bg-white text-slate-800 font-bold shadow-sm' : 'bg-slate-800 text-slate-300 font-bold'
                    : isWhite ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Fim
              </button>
            </div>
          </div>

          {/* Lista com Scroll */}
          <div className={`flex-1 overflow-y-auto divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
            {conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs">Nenhuma conversa no momento.</p>
                <p className="text-[11px] text-slate-400">As mensagens recebidas no WhatsApp aparecerão aqui automaticamente.</p>
                <button
                  onClick={() => setModalNovoChat(true)}
                  className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer pt-2 block mx-auto"
                >
                  + Iniciar nova conversa
                </button>
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const isAtivo = conv.id === conversaAtiva?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selecionarConversa(conv.id)}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative ${
                      isWhite
                        ? isAtivo
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-500'
                          : 'hover:bg-slate-50'
                        : isAtivo
                        ? 'bg-slate-800/80 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      {conv.clienteNome
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('') || 'CL'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold truncate ${isWhite ? 'text-slate-900' : 'text-white'}`}>{conv.clienteNome}</span>
                        <span className={`text-[10px] font-mono shrink-0 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>{conv.ultimaHora}</span>
                      </div>

                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className={`text-[10px] font-mono truncate ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          {conv.clienteTelefone}
                        </span>
                      </div>

                      <p className={`text-[11px] truncate mb-1.5 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>{conv.ultimaMensagem}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {conv.status === 'humano' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              <span>Transbordo Humano</span>
                            </span>
                          ) : conv.status === 'ia' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold border border-emerald-500/20 flex items-center gap-1">
                              <Bot className="w-2.5 h-2.5" />
                              <span>EloBot Atendendo</span>
                            </span>
                          ) : (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isWhite ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
                              Finalizado
                            </span>
                          )}

                          {conv.pedidoRascunho && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold flex items-center gap-0.5 ${
                              conv.pedidoRascunho.enviadoParaCozinha
                                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                            }`}>
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>{conv.pedidoRascunho.enviadoParaCozinha ? `Pedido #${conv.pedidoRascunho.numeroPedido || 204} KDS` : 'Pedido em Rascunho'}</span>
                            </span>
                          )}

                          {conv.mesa && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 flex items-center gap-1">
                              <span>🍽️ {conv.mesa}</span>
                              {conv.nomeLoja && (
                                <span className="opacity-75 font-normal truncate max-w-[90px]">({conv.nomeLoja.split(' ')[0]})</span>
                              )}
                            </span>
                          )}
                        </div>

                        {conv.naoLidas > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] flex items-center justify-center shrink-0">
                            {conv.naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA 2: Janela de Atendimento do WhatsApp (5 cols) */}
        <div className={`lg:col-span-5 rounded-3xl flex flex-col overflow-hidden shadow-2xl border h-[calc(100vh-215px)] min-h-[580px] max-h-[820px] ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {conversaAtiva ? (
            <>
              {/* Header do Chat WhatsApp */}
              <div className={`p-3.5 border-b flex items-center justify-between gap-2 shrink-0 ${
                isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                    {conversaAtiva.clienteNome
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('') || 'CL'}
                  </div>
                  <div className="min-w-0">
                    {editandoNome ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={novoNomeTemp}
                          onChange={(e) => setNovoNomeTemp(e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none ${
                            isWhite
                              ? 'bg-white border-emerald-500 text-slate-900 shadow-sm'
                              : 'bg-slate-900 border-emerald-500 text-white shadow-sm'
                          }`}
                          autoFocus
                          placeholder="Nome do cliente..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSalvarNome();
                            if (e.key === 'Escape') setEditandoNome(false);
                          }}
                        />
                        <button
                          onClick={handleSalvarNome}
                          className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow transition-all cursor-pointer"
                          title="Salvar nome"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditandoNome(false)}
                          className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <h4 className={`text-xs font-bold truncate ${isWhite ? 'text-slate-900' : 'text-white'}`}>{conversaAtiva.clienteNome}</h4>
                        <button
                          onClick={() => {
                            setNovoNomeTemp(conversaAtiva.clienteNome.startsWith('Cliente (') ? '' : conversaAtiva.clienteNome);
                            setEditandoNome(true);
                          }}
                          className={`p-1 rounded-md opacity-70 hover:opacity-100 transition-all cursor-pointer ${
                            isWhite ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                          }`}
                          title="Editar/identificar nome do cliente"
                        >
                          <Edit2 className="w-3 h-3 text-emerald-500" />
                        </button>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isWhite ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Phone className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{conversaAtiva.clienteTelefone}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {conversaAtiva.status === 'humano'
                            ? '👤 Aguardando Atendente Humano'
                            : '🤖 EloBot IA Respondendo'}
                        </span>
                      </div>

                      {conversaAtiva.mesa && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 flex items-center gap-1">
                            <span>🍽️ Consumo Presencial: {conversaAtiva.mesa}</span>
                            {conversaAtiva.nomeLoja && (
                              <span className="opacity-80 font-medium">• {conversaAtiva.nomeLoja}</span>
                            )}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                            Taxa: Grátis (Mesa)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação do Chat */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {conversaAtiva.status === 'humano' ? (
                    <button
                      onClick={() => alternarModoAtendimento(currentTenantId, conversaAtiva.id, 'ia')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isWhite
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                      title="Devolver atendimento para o robô de IA responder automaticamente"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ativar IA</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alternarModoAtendimento(currentTenantId, conversaAtiva.id, 'humano')}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isWhite
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                      title="Pausar a IA e assumir a conversa como humano"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Assumir</span>
                    </button>
                  )}

                  <button
                    onClick={() => removerConversa(currentTenantId, conversaAtiva.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 transition-colors"
                    title="Excluir histórico de conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Barra de Status do Pedido Delivery Ativo (Se existir) */}
              {conversaAtiva.pedidoRascunho && (
                <div className={`px-4 py-2 border-b flex items-center justify-between text-xs shrink-0 ${
                  conversaAtiva.pedidoRascunho.enviadoParaCozinha
                    ? isWhite ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                    : isWhite ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-purple-950/50 border-purple-500/30 text-purple-300'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold truncate">
                      {conversaAtiva.pedidoRascunho.enviadoParaCozinha
                        ? `${conversaAtiva.mesa ? `Comanda ${conversaAtiva.mesa}` : `Pedido Delivery #${conversaAtiva.pedidoRascunho.numeroPedido || 204}`} • Na Cozinha (KDS)`
                        : conversaAtiva.mesa
                        ? `Comanda ${conversaAtiva.mesa} em Aberto`
                        : 'Pedido em Negociação no WhatsApp'}
                    </span>
                    <span className="font-mono font-extrabold text-emerald-600 shrink-0">
                      R$ {conversaAtiva.pedidoRascunho.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {conversaAtiva.pedidoRascunho.enviadoParaCozinha ? (
                      <>
                        <a
                          href="/kds"
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 flex items-center gap-1 shadow-sm"
                        >
                          <ChefHat className="w-3 h-3" />
                          <span>Ver no KDS</span>
                        </a>
                        {conversaAtiva.mesa ? (
                          <a
                            href="/salao"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-500 flex items-center gap-1 shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Salão / Mesas</span>
                          </a>
                        ) : (
                          <a
                            href="/delivery"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-500 flex items-center gap-1 shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Delivery</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmarPedidoNoDelivery}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{conversaAtiva.mesa ? 'Lançar na Mesa' : 'Aprovar p/ KDS'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Feed de Mensagens (Estilo WhatsApp) */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${
                isWhite ? 'bg-slate-50/80' : 'bg-slate-950/70'
              }`}>
                {/* Linha de Criptografia / Conexão */}
                <div className="text-center">
                  <span className={`text-[10px] px-3 py-1 rounded-full border inline-flex items-center gap-1 ${
                    isWhite ? 'bg-white border-slate-200 text-slate-600 shadow-sm' : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Mensagens sincronizadas via Evolution API WhatsApp Oficial</span>
                  </span>
                </div>

                {conversaAtiva.mensagens.map((msg) => {
                  const isCliente = msg.remetente === 'cliente';
                  const isBot = msg.remetente === 'bot';
                  const isHumano = msg.remetente === 'humano';
                  const isSistema = msg.remetente === 'sistema';

                  if (isSistema) {
                    return (
                      <div key={msg.id} className="text-center py-1">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-semibold border ${
                          isWhite ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                        }`}>
                          {msg.texto}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCliente ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md space-y-2 leading-relaxed ${
                          isCliente
                            ? isWhite
                              ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                              : 'bg-slate-800 border border-slate-700/60 text-white rounded-tl-none'
                            : isBot
                            ? isWhite
                              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-tr-none shadow-sm'
                              : 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-50 rounded-tr-none'
                            : isWhite
                            ? 'bg-purple-50 border border-purple-300 text-purple-950 rounded-tr-none shadow-sm'
                            : 'bg-purple-950/90 border border-purple-500/40 text-purple-50 rounded-tr-none'
                        }`}
                      >
                        {/* Header do Balão com Tag */}
                        <div className={`flex items-center justify-between gap-3 text-[10px] font-bold opacity-80 border-b pb-1 ${
                          isWhite ? 'border-slate-200' : 'border-white/10'
                        }`}>
                          <span>
                            {isCliente
                              ? conversaAtiva.clienteNome
                              : isBot
                              ? `🤖 ${config.nomeAgente}`
                              : '👤 Atendente da Loja'}
                          </span>
                          <span className="font-mono text-[9px]">{msg.hora}</span>
                        </div>

                        {/* Texto da Mensagem */}
                        <p className="whitespace-pre-line leading-relaxed">{msg.texto}</p>

                        {/* Card de Destaque de Cardápio */}
                        {msg.cardapioItensDestaque && msg.cardapioItensDestaque.length > 0 && (
                          <div className={`rounded-xl p-2.5 space-y-1.5 mt-2 border ${
                            isWhite
                              ? 'bg-white border-emerald-200 text-slate-800 shadow-sm'
                              : 'bg-slate-900/80 border-emerald-500/30'
                          }`}>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                              Sugestões do Cardápio:
                            </span>
                            {msg.cardapioItensDestaque.map((item, idx) => (
                              <div key={idx} className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                                isWhite ? 'border-slate-100' : 'border-slate-800'
                              }`}>
                                <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{item.nome}</span>
                                <span className="text-emerald-600 font-mono font-bold">
                                  R$ {item.preco.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Card de Resumo de Pedido Delivery */}
                        {msg.resumoPedido && (
                          <div className={`rounded-2xl p-3.5 space-y-2.5 mt-2 border-2 ${
                            isWhite
                              ? 'bg-white border-purple-200 text-slate-800 shadow-md'
                              : 'bg-slate-900/95 border-purple-500/40 text-slate-100'
                          }`}>
                            <div className={`flex items-center justify-between border-b pb-1.5 ${
                              isWhite ? 'border-slate-200' : 'border-slate-800'
                            }`}>
                              <span className="text-[11px] font-black text-purple-600 flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>
                                  {conversaAtiva.mesa
                                    ? `Comanda ${conversaAtiva.mesa} (Mesa)`
                                    : 'Resumo do Pedido Delivery'}
                                </span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 font-bold">
                                {conversaAtiva.mesa ? 'Salão / Presencial' : 'WhatsApp Delivery'}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[11px]">
                              {msg.resumoPedido.itens.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between font-medium">
                                  <span className={isWhite ? 'text-slate-800' : 'text-slate-200'}>
                                    {it.quantidade}x {it.nome}
                                  </span>
                                  <span className="font-mono font-semibold">
                                    R$ {(it.preco * it.quantidade).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              ))}

                              {conversaAtiva.mesa ? (
                                <div className={`text-[10px] p-2 rounded-lg flex items-center justify-between ${
                                  isWhite ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/20'
                                }`}>
                                  <span>🍽️ <strong>Local de Consumo:</strong></span>
                                  <span className="font-bold">{conversaAtiva.mesa} {conversaAtiva.nomeLoja ? `• ${conversaAtiva.nomeLoja}` : ''}</span>
                                </div>
                              ) : msg.resumoPedido.endereco ? (
                                <div className={`text-[10px] p-2 rounded-lg ${
                                  isWhite ? 'bg-slate-100 text-slate-700' : 'bg-slate-950 text-slate-400'
                                }`}>
                                  <strong>Entrega:</strong> {msg.resumoPedido.endereco}
                                </div>
                              ) : null}

                              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                                isWhite ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                              }`}>
                                <span>Taxa de Entrega:</span>
                                <span>
                                  {conversaAtiva.mesa || msg.resumoPedido.taxaEntrega === 0
                                    ? 'Grátis (Mesa)'
                                    : `R$ ${msg.resumoPedido.taxaEntrega.toFixed(2).replace('.', ',')}`}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs font-black text-emerald-600 pt-1">
                                <span>Total do Pedido:</span>
                                <span className="font-mono text-sm">
                                  R$ {msg.resumoPedido.total.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </div>

                            {/* Detalhe do PIX (se selecionado) */}
                            {msg.resumoPedido.formaPagamento?.toUpperCase().includes('PIX') && (
                              <div className={`p-2 rounded-xl text-xs space-y-1 border ${
                                isWhite ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-950 border-emerald-500/30 text-emerald-300'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase text-emerald-600">Chave PIX Oficial:</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.resumoPedido?.chavePix || config.chavePix);
                                      setToastPedidoCriado('Chave PIX copiada!');
                                      setTimeout(() => setToastPedidoCriado(null), 3000);
                                    }}
                                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar Chave</span>
                                  </button>
                                </div>
                                <p className="font-mono text-[11px] font-bold truncate">
                                  {msg.resumoPedido.chavePix || config.chavePix}
                                </p>
                              </div>
                            )}

                            {/* Ações do Pedido: Enviado vs. Pendente de Aprovação */}
                            {msg.resumoPedido.enviadoParaCozinha || conversaAtiva.pedidoRascunho?.enviadoParaCozinha ? (
                              <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 font-bold text-xs flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      PEDIDO #{msg.resumoPedido.numeroPedido || conversaAtiva.pedidoRascunho?.numeroPedido || 204} NA COZINHA (KDS)
                                    </span>
                                  </div>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black uppercase">
                                    Preparo
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <a
                                    href="/kds"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="py-1.5 px-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <ChefHat className="w-3.5 h-3.5" />
                                    <span>Ver no KDS</span>
                                  </a>
                                  <a
                                    href="/delivery"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Ver no Delivery</span>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleConfirmarPedidoNoDelivery}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>⚡ Aprovar & Enviar para Cozinha (KDS) & Delivery</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Status de Envio */}
                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-70">
                          <span>{msg.hora}</span>
                          <CheckCheck className="w-3 h-3 text-sky-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Barra de Digitação */}
              <form onSubmit={handleEnviar} className={`p-3 border-t flex items-center gap-2 shrink-0 ${
                isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <input
                  type="text"
                  value={inputMensagem}
                  onChange={(e) => setInputMensagem(e.target.value)}
                  placeholder="Digite uma mensagem para o cliente..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs transition-colors border focus:outline-none focus:border-emerald-500 ${
                    isWhite
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!inputMensagem.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  title="Enviar mensagem para o cliente"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <MessageCircle className="w-12 h-12 opacity-30 text-slate-400" />
              <h4 className={`text-sm font-bold ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>Nenhuma conversa selecionada</h4>
              <p className="text-xs max-w-sm">Quando um cliente enviar mensagem no WhatsApp, a conversa aparecerá aqui em tempo real.</p>
            </div>
          )}
        </div>

        {/* COLUNA 3: Painel de Controle da IA & Loja (3 cols) */}
        <div className={`lg:col-span-3 rounded-3xl p-5 flex flex-col space-y-4 shadow-xl border overflow-y-auto h-[calc(100vh-215px)] min-h-[580px] max-h-[820px] ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {/* Navegação entre Abas Laterais */}
          <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl text-xs font-bold ${
            isWhite ? 'bg-slate-100' : 'bg-slate-950'
          }`}>
            <button
              onClick={() => setAbaLateral('instancia')}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'instancia'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setAbaLateral('regras')}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'regras'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Regras da IA
            </button>
          </div>

          {/* Toast de Confirmação */}
          {toastConfigSalva && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Configurações do EloBot salvas com sucesso!</span>
            </div>
          )}

          {toastPedidoCriado && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2.5 text-xs text-purple-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{toastPedidoCriado}</span>
            </div>
          )}

          {/* CONTEÚDO 1: STATUS DA INSTÂNCIA WHATSAPP */}
          {abaLateral === 'instancia' && (
            <div className="space-y-4 text-xs">
              <div className={`border rounded-2xl p-4 space-y-3 ${
                isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Gateway Ativo:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    Baileys / Evolution v2
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Status da Sessão:</span>
                  <span className={`font-bold flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    {config.statusInstancia === 'conectado' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-600 font-bold">Conectado Oficial</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-rose-600 font-bold">Desconectado</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Número Conectado:</span>
                  <span className={`font-mono font-bold ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>{config.telefoneInstancia}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Tempo Médio Resposta:</span>
                  <span className="font-mono text-emerald-600 font-bold">{config.tempoRespostaMedioSeg}s</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Mensagens Hoje:</span>
                  <span className={`font-mono font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{config.totalMensagensHoje} envios</span>
                </div>
              </div>

              {/* Botões de Conexão */}
              <div className="space-y-2">
                {config.statusInstancia === 'conectado' ? (
                  <button
                    onClick={() => desconectarBaileysReal(currentTenantId)}
                    className="w-full py-2.5 rounded-xl border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Desconectar Instância WhatsApp</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      iniciarConexaoBaileysReal(currentTenantId);
                      setModalQrCode(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Parear Celular Real com QR Code</span>
                  </button>
                )}

                <button
                  onClick={handleEnviarCardapioRapido}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isWhite
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Enviar Cardápio Atualizado</span>
                </button>

                <button
                  onClick={handleEnviarPixRapido}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isWhite
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Disparar Chave PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalPlacaMesa(true)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 ${
                    isWhite
                      ? 'bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 border-indigo-200 shadow-sm'
                      : 'bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Imprimir Placas de Mesa (QR Code)</span>
                </button>
              </div>

              {/* Transbordo Humano Box */}
              <div className={`p-3.5 rounded-2xl space-y-1.5 border ${
                isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className={`flex items-center gap-2 font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Transbordo Humano Inteligente</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                  Quando o cliente digita "atendente", "falar com humano" ou relata um problema, a IA transfere o chat automaticamente para você assumir.
                </p>
              </div>
            </div>
          )}

          {/* CONTEÚDO 2: REGRAS E PERSONALIDADE DA IA */}
          {/* CONTEÚDO 2: REGRAS E PERSONALIDADE DA IA (VISÃO SIMPLIFICADA) */}
          {abaLateral === 'regras' && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              {/* Card Resumo do Robô */}
              <div className={`p-4 rounded-2xl border space-y-3 shadow-sm ${
                isWhite ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-tight ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                        {config.nomeAgente || 'EloBot Atendente'}
                      </h4>
                      <span className={`text-[10px] font-medium ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                        {tenantAtual.nomeFantasia}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    IA Ativa
                  </span>
                </div>

                {/* Grid de Informações Rápidas */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`block text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>Tom de Voz</span>
                    <span className={`font-bold capitalize ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                      {config.tomDeVoz === 'acolhedor' ? '🌟 Acolhedor' :
                       config.tomDeVoz === 'formal' ? '👔 Formal' :
                       config.tomDeVoz === 'descontraido' ? '🎉 Descontraído' : '🎯 Vendedor'}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className={`block text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>Motor de IA</span>
                    <span className={`font-bold ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                      {config.modeloIA === 'gemini-1.5-flash' ? '⚡ Gemini Flash' : config.modeloIA}
                    </span>
                  </div>
                </div>

                {/* Chave PIX e Delivery */}
                <div className={`p-2.5 rounded-xl border space-y-1.5 text-[11px] ${isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>Chave PIX:</span>
                    <span className="font-mono font-bold text-emerald-600 text-[10px] truncate max-w-[160px]">
                      {config.chavePix || 'Não configurada'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>Entrega:</span>
                    <span className={`font-semibold ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      {config.tempoMedioEntregaMin} min • R$ {Number(config.taxaEntregaFixa).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Dica da Casa / Instrução Atual */}
                {config.instrucoesCustomizadas && (
                  <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                    isWhite ? 'bg-amber-50/60 border-amber-200/80 text-amber-900' : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                  }`}>
                    <span className="font-bold flex items-center gap-1 text-[10px] text-amber-600">
                      <Sparkles className="w-3 h-3" />
                      <span>Dica da Casa:</span>
                    </span>
                    <p className="line-clamp-2 text-[10px] leading-relaxed opacity-90">
                      {config.instrucoesCustomizadas}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Resumo dos Gatilhos */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isWhite ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gatilhos de Palavras</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(config.palavrasCardapio?.split(',').filter(Boolean).length || 0) +
                     (config.palavrasAtendente?.split(',').filter(Boolean).length || 0) +
                     (config.palavrasPix?.split(',').filter(Boolean).length || 0)} ativas
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className={isWhite ? 'text-slate-600' : 'text-slate-400'}>📋 Cardápio:</span>
                    <span className={`font-mono text-[10px] truncate max-w-[150px] ${isWhite ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                      {config.palavrasCardapio || 'cardapio, menu...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isWhite ? 'text-slate-600' : 'text-slate-400'}>👨‍💼 Atendente:</span>
                    <span className={`font-mono text-[10px] truncate max-w-[150px] ${isWhite ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                      {config.palavrasAtendente || 'humano, atendente...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isWhite ? 'text-slate-600' : 'text-slate-400'}>🔑 PIX:</span>
                    <span className={`font-mono text-[10px] truncate max-w-[150px] ${isWhite ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                      {config.palavrasPix || 'pix, pagar, conta...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Abertura do Modal Completo */}
              <button
                type="button"
                onClick={() => {
                  setFormConfig(config);
                  setModalRegrasIA(true);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sliders className="w-4 h-4" />
                <span>Configurar Regras da IA</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AMPLIADO: REGRAS E INTELIGÊNCIA DA IA */}
      {modalRegrasIA && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6">
          <div className={`border rounded-3xl max-w-4xl w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* HEADER DO MODAL */}
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${
              isWhite ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                      Configuração das Regras da IA • EloBot
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isWhite ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {tenantAtual.nomeFantasia}
                    </span>
                  </div>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Personalize o comportamento, tom de voz, gatilhos de palavras-chave e templates de atendimento no WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalRegrasIA(false)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isWhite ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ABAS DO MODAL */}
            <div className={`px-6 pt-2 border-b flex items-center gap-2 shrink-0 overflow-x-auto ${
              isWhite ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
            }`}>
              <button
                type="button"
                onClick={() => setAbaModalRegras('identidade')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaModalRegras === 'identidade'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Identidade & Tom de Voz</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaModalRegras('gatilhos')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaModalRegras === 'gatilhos'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Gatilhos de Palavras-Chave</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaModalRegras('delivery')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaModalRegras === 'delivery'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Delivery & Chave PIX</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaModalRegras('mensagens')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  abaModalRegras === 'mensagens'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mensagens Customizadas</span>
              </button>
            </div>

            {/* FORM DO MODAL */}
            <form onSubmit={handleSalvarConfig} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
                {/* ABA 1: IDENTIDADE */}
                {abaModalRegras === 'identidade' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                          Nome do Robô / Agente Virtual:
                        </label>
                        <input
                          type="text"
                          value={formConfig.nomeAgente}
                          onChange={(e) => setFormConfig({ ...formConfig, nomeAgente: e.target.value })}
                          placeholder="Ex: EloBot Atendente"
                          className={`w-full px-3.5 py-2.5 border rounded-xl font-medium focus:border-emerald-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                          required
                        />
                        <p className={`text-[11px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          Usado nas saudações e quando o robô se apresenta aos clientes no WhatsApp.
                        </p>
                      </div>

                      <div>
                        <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                          Motor de Inteligência Artificial:
                        </label>
                        <select
                          value={formConfig.modeloIA}
                          onChange={(e) => setFormConfig({ ...formConfig, modeloIA: e.target.value as any })}
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-emerald-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        >
                          <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultrarrápido • Padrão)</option>
                          <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Equilibrado)</option>
                          <option value="claude-3-haiku">Anthropic Claude 3 Haiku (Respostas Concisas)</option>
                        </select>
                        <p className={`text-[11px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          Modelo responsável pelo processamento de linguagem natural e intenção.
                        </p>
                      </div>
                    </div>

                    {/* Tom de Voz Visual */}
                    <div>
                      <label className={`font-semibold block mb-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                        Personalidade & Tom de Voz da IA:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { id: 'acolhedor', titulo: '🌟 Acolhedor', desc: 'Simpático, caloroso e atencioso', exemplo: '"Que alegria ter você aqui! Fique à vontade para escolher seus pratos favoritos."' },
                          { id: 'formal', titulo: '👔 Formal', desc: 'Executivo, polido e respeitoso', exemplo: '"Prezado(a) cliente, seja bem-vindo ao restaurante. Em que posso auxiliá-lo hoje?"' },
                          { id: 'descontraido', titulo: '🎉 Descontraído', desc: 'Moderno, jovem e direto', exemplo: '"Fala aí! Tudo certo? Bora matar essa fome com o melhor pedido hoje?"' },
                          { id: 'vendedor', titulo: '🎯 Vendedor', desc: 'Foco em ofertas, upsell e combos', exemplo: '"Excelente pedida! Nossas opções exclusivas saem quentinhas agora com o melhor preço."' },
                        ].map((tom) => (
                          <div
                            key={tom.id}
                            onClick={() => setFormConfig({ ...formConfig, tomDeVoz: tom.id as any })}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              formConfig.tomDeVoz === tom.id
                                ? isWhite
                                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                  : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                                : isWhite
                                ? 'bg-white border-slate-200 hover:border-slate-300'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                                {tom.titulo}
                              </span>
                              <input
                                type="radio"
                                name="tomDeVoz"
                                checked={formConfig.tomDeVoz === tom.id}
                                onChange={() => setFormConfig({ ...formConfig, tomDeVoz: tom.id as any })}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                            </div>
                            <p className={`text-[11px] mb-2 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                              {tom.desc}
                            </p>
                            <p className={`text-[10px] italic p-2 rounded-xl border leading-relaxed ${
                              isWhite ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}>
                              {tom.exemplo}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instruções Customizadas */}
                    <div>
                      <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                        Instruções Customizadas da Casa (Dica Especial & Regras do Restaurante):
                      </label>
                      <textarea
                        rows={3}
                        value={formConfig.instrucoesCustomizadas}
                        onChange={(e) => setFormConfig({ ...formConfig, instrucoesCustomizadas: e.target.value })}
                        placeholder="Ex: Especialista em carnes nobres e chopp gelado. Sempre pergunte o ponto da carne e sugira nossa sobremesa mineira."
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-emerald-500 focus:outline-none leading-relaxed ${
                          isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      />
                      <p className={`text-[11px] mt-1.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                        💡 A inteligência artificial incorpora essa orientação diretamente nas conversas, sugerindo pratos específicos e regras da sua cozinha.
                      </p>
                    </div>
                  </div>
                )}

                {/* ABA 2: GATILHOS DE PALAVRAS-CHAVE */}
                {abaModalRegras === 'gatilhos' && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* BARRA DE PRESETS RÁPIDOS NO TOPO */}
                    <div className={`p-4 rounded-2xl border ${
                      isWhite ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200' : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border-emerald-800/40'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            Modelos de Menu Prontos (1 Clique para Simplificar)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Escolha Rápida
                        </span>
                      </div>
                      <p className={`text-[11px] mb-3 leading-relaxed ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                        Selecione como prefere que o cliente final navegue no WhatsApp. O robô responderá de acordo:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Opção A: Letras (Recomendado) */}
                        <button
                          type="button"
                          onClick={aplicarModeloLetras}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-emerald-50/50 border-emerald-300 shadow-sm hover:border-emerald-500 ring-2 ring-emerald-500/10' 
                              : 'bg-slate-900 hover:bg-emerald-950/40 border-emerald-700/50 hover:border-emerald-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-emerald-600 flex items-center gap-1.5">
                                <span>🅰️</span> Por Letras (A, B, C)
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                Recomendado
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Cliente digita apenas <strong>A</strong> (Cardápio), <strong>B</strong> (Atendente) ou <strong>C</strong> (PIX).
                            </p>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold mt-2 group-hover:underline flex items-center gap-1">
                            Aplicar este modelo →
                          </span>
                        </button>

                        {/* Opção B: Números */}
                        <button
                          type="button"
                          onClick={aplicarModeloNumeros}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-sm hover:border-slate-400' 
                              : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                                <span>🔢</span> Por Números (1, 2, 3)
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Cliente digita <strong>1</strong> (Cardápio), <strong>2</strong> (Atendente) ou <strong>3</strong> (PIX).
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold mt-2 group-hover:underline flex items-center gap-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                            Aplicar este modelo →
                          </span>
                        </button>

                        {/* Opção C: Texto Livre */}
                        <button
                          type="button"
                          onClick={aplicarModeloTextoLivre}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-sm hover:border-slate-400' 
                              : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                                <span>💬</span> Palavras Livres
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Cliente escreve termos completos como "cardápio", "atendente", "falar com pessoa".
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold mt-2 group-hover:underline flex items-center gap-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                            Aplicar este modelo →
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* GATILHO 1: CARDÁPIO */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            A
                          </span>
                          <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            📋 Ver Cardápio & Preços
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {(formConfig.palavrasCardapio || '').split(',').filter(Boolean).length} termos ativos
                        </span>
                      </div>

                      {/* Tags Ativas */}
                      <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        {(formConfig.palavrasCardapio || '').split(',').map((p) => p.trim()).filter(Boolean).map((palavra, idx) => (
                          <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            palavra.toLowerCase() === 'a' || palavra === '1'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : isWhite
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}>
                            <span>{palavra}</span>
                            <button
                              type="button"
                              onClick={() => removerPalavraChave('palavrasCardapio', palavra)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold leading-none"
                              title="Remover"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Sugestões Rápidas de 1 Clique */}
                      <div>
                        <span className={`text-[10px] font-semibold block mb-1.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          💡 Sugestões rápidas (clique para adicionar à lista):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '🅰️ Letra A', val: 'A' },
                            { label: '🔢 Número 1', val: '1' },
                            { label: 'cardápio', val: 'cardapio' },
                            { label: 'menu', val: 'menu' },
                            { label: 'ver pratos', val: 'ver pratos' },
                            { label: 'preços', val: 'precos' },
                            { label: 'opções', val: 'opcoes' },
                          ].map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => adicionarPalavraChave('palavrasCardapio', sug.val)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                isWhite
                                  ? 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                                  : 'bg-slate-900 hover:bg-emerald-950/40 text-slate-300 border-slate-800 hover:border-emerald-600 hover:text-emerald-300'
                              }`}
                            >
                              <Plus className="w-3 h-3 text-emerald-500" />
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input Opcional para adicionar novo termo */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={inputNovoCardapio}
                          onChange={(e) => setInputNovoCardapio(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              adicionarPalavraChave('palavrasCardapio', inputNovoCardapio);
                              setInputNovoCardapio('');
                            }
                          }}
                          placeholder="Ou digite outra palavra e tecle Enter..."
                          className={`flex-1 px-3 py-1.5 border rounded-xl text-xs focus:border-emerald-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            adicionarPalavraChave('palavrasCardapio', inputNovoCardapio);
                            setInputNovoCardapio('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>

                    {/* GATILHO 2: ATENDENTE HUMANO */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                            B
                          </span>
                          <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            👨‍💼 Falar com Atendente Humano
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {(formConfig.palavrasAtendente || '').split(',').filter(Boolean).length} termos ativos
                        </span>
                      </div>

                      {/* Tags Ativas */}
                      <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        {(formConfig.palavrasAtendente || '').split(',').map((p) => p.trim()).filter(Boolean).map((palavra, idx) => (
                          <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            palavra.toLowerCase() === 'b' || palavra === '2'
                              ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                              : isWhite
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}>
                            <span>{palavra}</span>
                            <button
                              type="button"
                              onClick={() => removerPalavraChave('palavrasAtendente', palavra)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold leading-none"
                              title="Remover"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Sugestões Rápidas de 1 Clique */}
                      <div>
                        <span className={`text-[10px] font-semibold block mb-1.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          💡 Sugestões rápidas (clique para adicionar à lista):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '🅱️ Letra B', val: 'B' },
                            { label: '🔢 Número 2', val: '2' },
                            { label: 'atendente', val: 'atendente' },
                            { label: 'humano', val: 'humano' },
                            { label: 'suporte', val: 'suporte' },
                            { label: 'garçom', val: 'garcom' },
                            { label: 'ajuda', val: 'ajuda' },
                            { label: 'falar com pessoa', val: 'falar com pessoa' },
                          ].map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => adicionarPalavraChave('palavrasAtendente', sug.val)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                isWhite
                                  ? 'bg-white hover:bg-blue-50 text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                                  : 'bg-slate-900 hover:bg-blue-950/40 text-slate-300 border-slate-800 hover:border-blue-600 hover:text-blue-300'
                              }`}
                            >
                              <Plus className="w-3 h-3 text-blue-500" />
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input Opcional para adicionar novo termo */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={inputNovoAtendente}
                          onChange={(e) => setInputNovoAtendente(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              adicionarPalavraChave('palavrasAtendente', inputNovoAtendente);
                              setInputNovoAtendente('');
                            }
                          }}
                          placeholder="Ou digite outra palavra e tecle Enter..."
                          className={`flex-1 px-3 py-1.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            adicionarPalavraChave('palavrasAtendente', inputNovoAtendente);
                            setInputNovoAtendente('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>

                    {/* GATILHO 3: CHAVE PIX */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                            C
                          </span>
                          <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            🔑 Chave PIX & Pagamento
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {(formConfig.palavrasPix || '').split(',').filter(Boolean).length} termos ativos
                        </span>
                      </div>

                      {/* Tags Ativas */}
                      <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        {(formConfig.palavrasPix || '').split(',').map((p) => p.trim()).filter(Boolean).map((palavra, idx) => (
                          <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            palavra.toLowerCase() === 'c' || palavra === '3'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : isWhite
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}>
                            <span>{palavra}</span>
                            <button
                              type="button"
                              onClick={() => removerPalavraChave('palavrasPix', palavra)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 text-xs font-bold leading-none"
                              title="Remover"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Sugestões Rápidas de 1 Clique */}
                      <div>
                        <span className={`text-[10px] font-semibold block mb-1.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          💡 Sugestões rápidas (clique para adicionar à lista):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '🅲 Letra C', val: 'C' },
                            { label: '🔢 Número 3', val: '3' },
                            { label: 'pix', val: 'pix' },
                            { label: 'chave pix', val: 'chave pix' },
                            { label: 'pagar', val: 'pagar' },
                            { label: 'conta', val: 'conta' },
                            { label: 'pagamento', val: 'pagamento' },
                            { label: 'dados bancários', val: 'dados bancarios' },
                          ].map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => adicionarPalavraChave('palavrasPix', sug.val)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                isWhite
                                  ? 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400 hover:text-amber-700'
                                  : 'bg-slate-900 hover:bg-amber-950/40 text-slate-300 border-slate-800 hover:border-amber-600 hover:text-amber-300'
                              }`}
                            >
                              <Plus className="w-3 h-3 text-amber-500" />
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input Opcional para adicionar novo termo */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={inputNovoPix}
                          onChange={(e) => setInputNovoPix(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              adicionarPalavraChave('palavrasPix', inputNovoPix);
                              setInputNovoPix('');
                            }
                          }}
                          placeholder="Ou digite outra palavra e tecle Enter..."
                          className={`flex-1 px-3 py-1.5 border rounded-xl text-xs focus:border-amber-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            adicionarPalavraChave('palavrasPix', inputNovoPix);
                            setInputNovoPix('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-600 hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 3: DELIVERY & CHAVE PIX */}
                {abaModalRegras === 'delivery' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                        Chave PIX Oficial do Restaurante:
                      </label>
                      <input
                        type="text"
                        value={formConfig.chavePix}
                        onChange={(e) => setFormConfig({ ...formConfig, chavePix: e.target.value })}
                        className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none ${
                          isWhite ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950 border-slate-800 text-emerald-400'
                        }`}
                        required
                      />
                      <p className={`text-[11px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                        Enviada ao cliente quando ele fecha o pedido via PIX ou pede os dados bancários no chat.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                          Prazo Médio de Entrega (minutos):
                        </label>
                        <input
                          type="number"
                          value={formConfig.tempoMedioEntregaMin}
                          onChange={(e) => setFormConfig({ ...formConfig, tempoMedioEntregaMin: Number(e.target.value) })}
                          className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`font-semibold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                          Taxa Fixa de Entrega (R$):
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={formConfig.taxaEntregaFixa}
                          onChange={(e) => setFormConfig({ ...formConfig, taxaEntregaFixa: Number(e.target.value) })}
                          className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <span className={`font-bold block ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                        Automação e Esteira de Pedidos:
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`font-semibold block ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                            Criar Pedido no KDS automaticamente
                          </span>
                          <p className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                            Quando o cliente informar pratos, endereço e forma de pagamento, a comanda é gerada.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formConfig.autoCriarPedido}
                          onChange={(e) => setFormConfig({ ...formConfig, autoCriarPedido: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t pt-3 border-slate-200/50">
                        <div>
                          <span className={`font-semibold block ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                            Transbordo Humano Inteligente ativo
                          </span>
                          <p className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                            Transfere a conversa para o atendente quando solicitado ou em caso de dúvida.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formConfig.transbordoHumanoAtivo}
                          onChange={(e) => setFormConfig({ ...formConfig, transbordoHumanoAtivo: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 4: MENSAGENS CUSTOMIZADAS */}
                {abaModalRegras === 'mensagens' && (
                  <div className="space-y-5 animate-in fade-in">
                    {/* BARRA DE PRESETS RÁPIDOS NO TOPO */}
                    <div className={`p-4 rounded-2xl border ${
                      isWhite ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-blue-200' : 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border-blue-800/40'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <span className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            Templates Prontos para o WhatsApp (1 Clique)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Preenchimento Automático
                        </span>
                      </div>
                      <p className={`text-[11px] mb-3 leading-relaxed ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                        Você não precisa escrever do zero. Escolha um dos modelos abaixo ou personalize como preferir:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={aplicarModeloLetras}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-blue-50/50 border-blue-300 shadow-sm hover:border-blue-500 ring-2 ring-blue-500/10' 
                              : 'bg-slate-900 hover:bg-blue-950/40 border-blue-700/50 hover:border-blue-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-blue-600 flex items-center gap-1.5">
                                <span>🅰️</span> Modelo com Letras (A, B, C)
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                Recomendado
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Menu ultra intuitivo orientando o cliente a digitar apenas A, B ou C.
                            </p>
                          </div>
                          <span className="text-[10px] text-blue-600 font-semibold mt-2 group-hover:underline flex items-center gap-1">
                            Usar este template →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={aplicarModeloNumeros}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-sm hover:border-slate-400' 
                              : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                                <span>🔢</span> Modelo com Números (1, 2, 3)
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Menu numérico tradicional rápido para o cliente escolher 1, 2 ou 3.
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold mt-2 group-hover:underline flex items-center gap-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                            Usar este template →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={aplicarModeloTextoLivre}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                            isWhite 
                              ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-sm hover:border-slate-400' 
                              : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                                <span>✨</span> Tom de Voz Nativo da IA
                              </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Deixa as mensagens livres para o modelo da IA gerar naturalmente.
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold mt-2 group-hover:underline flex items-center gap-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                            Usar tom da IA →
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* MENSAGEM 1: BOAS-VINDAS */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          <span>👋 Saudação & Boas-Vindas (Primeira Mensagem do Cliente)</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 mr-1">Inserir:</span>
                          {['{nome}', '{loja}', '{agente}'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => inserirVariavel('mensagemBoasVindas', tag)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold transition-all cursor-pointer"
                            >
                              +{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sugestões Rápidas de Texto para Boas-Vindas */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Sugestões de texto:</span>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemBoasVindas: `Olá {nome}! Seja muito bem-vindo ao {loja}! 😊\n\nComo posso te ajudar hoje? Digite apenas a letra da sua opção:\n👉 A - Ver Cardápio e Preços\n👉 B - Falar com Atendente Humano\n👉 C - Chave PIX do Restaurante\n\n_(Ou digite seu pedido diretamente!)_`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          🅰️ Menu com Letras (A, B, C)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemBoasVindas: `Olá {nome}! Bem-vindo ao {loja}! 😊\n\nEscolha uma opção digitando o número:\n1️⃣ 1 - Ver Cardápio e Preços\n2️⃣ 2 - Falar com Atendente Humano\n3️⃣ 3 - Chave PIX do Restaurante`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          🔢 Menu Numérico (1, 2, 3)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemBoasVindas: `Olá {nome}! Seja muito bem-vindo ao {loja}! Sou o {agente}, seu atendente virtual. Como posso te ajudar hoje?`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          ⚡ Curto e Direto
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={formConfig.mensagemBoasVindas || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, mensagemBoasVindas: e.target.value })}
                        placeholder="Deixe em branco para o tom de voz da IA ou cole seu texto aqui..."
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none leading-relaxed ${
                          isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />

                      {/* Preview WhatsApp ao Vivo */}
                      {renderPreviewWhatsapp(formConfig.mensagemBoasVindas || '', 'boasVindas')}
                    </div>

                    {/* MENSAGEM 2: APRESENTAÇÃO DO CARDÁPIO */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          <span>📋 Mensagem de Envio do Cardápio</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 mr-1">Inserir:</span>
                          {['{nome}', '{loja}'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => inserirVariavel('mensagemCardapio', tag)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold transition-all cursor-pointer"
                            >
                              +{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sugestões Rápidas */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Sugestões de texto:</span>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemCardapio: `Olá {nome}! 📋 Segue o Cardápio Selecionado do {loja}:\n\n(Para fazer seu pedido, digite o nome do prato ou digite B para falar com um atendente)`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          🅰️ Com Dica da Letra B
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemCardapio: `Olá {nome}! Segue o Cardápio Oficial do {loja}:`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          ⚡ Simples e Direto
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={formConfig.mensagemCardapio || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, mensagemCardapio: e.target.value })}
                        placeholder="Ex: Olá {nome}! Segue o Cardápio Selecionado do {loja}:"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none leading-relaxed ${
                          isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />

                      {/* Preview WhatsApp ao Vivo */}
                      {renderPreviewWhatsapp(formConfig.mensagemCardapio || '', 'cardapio')}
                    </div>

                    {/* MENSAGEM 3: TRANSBORDO PARA ATENDENTE */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          <span>👨‍💼 Aviso de Transferência para Atendente Humano</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 mr-1">Inserir:</span>
                          {['{nome}', '{loja}'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => inserirVariavel('mensagemTransbordo', tag)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold transition-all cursor-pointer"
                            >
                              +{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sugestões Rápidas */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Sugestões de texto:</span>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemTransbordo: `Com certeza, {nome}! 👨‍💼 Estou transferindo seu atendimento para nossa equipe do {loja} agora mesmo. Aguarde um instante!`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          👨‍💼 Padrão Atencioso
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemTransbordo: `Aguarde um momento, {nome}. Um dos nossos atendentes do {loja} já vai te responder!`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          ⚡ Rápido e Direto
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={formConfig.mensagemTransbordo || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, mensagemTransbordo: e.target.value })}
                        placeholder="Ex: Com certeza {nome}! Estou transferindo você para nossa equipe humana do {loja} agora mesmo."
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none leading-relaxed ${
                          isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />

                      {/* Preview WhatsApp ao Vivo */}
                      {renderPreviewWhatsapp(formConfig.mensagemTransbordo || '', 'transbordo')}
                    </div>

                    {/* MENSAGEM 4: CHAVE PIX */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isWhite ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className={`font-bold text-xs flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          <span>🔑 Instrução e Envio da Chave PIX</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 mr-1">Inserir:</span>
                          {['{chave}', '{loja}', '{nome}'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => inserirVariavel('mensagemPix', tag)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold transition-all cursor-pointer"
                            >
                              +{tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sugestões Rápidas */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Sugestões de texto:</span>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemPix: `A chave PIX oficial do {loja} é:\n🔑 {chave}\n\nAssim que pagar, envie o comprovante por aqui que seu pedido começará a ser preparado!`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          🔑 Com Instrução de Comprovante
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormConfig({
                            ...formConfig,
                            mensagemPix: `Nossa chave PIX é: {chave} ({loja}).`
                          })}
                          className="text-[10px] px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 font-medium cursor-pointer"
                        >
                          ⚡ Apenas Chave
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={formConfig.mensagemPix || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, mensagemPix: e.target.value })}
                        placeholder="Ex: A chave PIX do {loja} é: {chave}. Envie o comprovante aqui para liberarmos seu pedido!"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none leading-relaxed ${
                          isWhite ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />

                      {/* Preview WhatsApp ao Vivo */}
                      {renderPreviewWhatsapp(formConfig.mensagemPix || '', 'pix')}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER DO MODAL */}
              <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
                isWhite ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/60'
              }`}>
                <span className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  Restaurante ativo: <strong className={isWhite ? 'text-slate-800' : 'text-slate-200'}>{tenantAtual.nomeFantasia}</strong>
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalRegrasIA(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      isWhite
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar e Sincronizar Regras</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CONVERSA COM CLIENTE */}
      {modalNovoChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isWhite ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className={`text-sm font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>Nova Conversa com Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoChat(false)}
                className={`p-1 cursor-pointer ${isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarNovoChat} className="space-y-3.5 text-xs">
              <div>
                <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>Nome do Cliente:</label>
                <input
                  type="text"
                  placeholder="Ex: Gabriela Duarte"
                  value={novoClienteForm.nome}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, nome: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none ${
                    isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>WhatsApp / Telefone:</label>
                <input
                  type="text"
                  placeholder="(31) 99888-7766"
                  value={novoClienteForm.telefone}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, telefone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-xl font-mono focus:border-emerald-500 focus:outline-none ${
                    isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>Primeira Mensagem:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Boa noite! Gostaria de saber quais são os pratos do dia."
                  value={novoClienteForm.mensagemInicial}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, mensagemInicial: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none text-xs ${
                    isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoChat(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    isWhite ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Iniciar Conversa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE BAILEYS / WHATSAPP REAL */}
      {modalQrCode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-emerald-500/30 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isWhite ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-sm font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>Conectar Celular Real (WhatsApp)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalQrCode(false)}
                className={`p-1 cursor-pointer ${isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner de Conexão ou QR Code Real */}
            {config.statusInstancia === 'conectado' ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-extrabold text-sm">WhatsApp Conectado com Sucesso!</p>
                <p className="font-mono text-xs text-slate-600">Número: {config.telefoneInstancia}</p>
                <p className="text-[11px] text-slate-500">Agora você já pode enviar e receber mensagens reais!</p>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto border-2 border-slate-200">
                {config.qrCodeDataUrl || qrInstanciaDataUrl ? (
                  <img
                    src={config.qrCodeDataUrl || qrInstanciaDataUrl}
                    alt="QR Code WhatsApp Real"
                    className="w-48 h-48 block rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                    <span className="font-bold">Gerando QR Code Real...</span>
                    <span className="text-[10px] text-slate-400">Conectando ao WhatsApp Web</span>
                  </div>
                )}
              </div>
            )}

            <div className={`space-y-1 text-xs ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
              <p className={`font-semibold ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>1. Abra o WhatsApp no seu smartphone</p>
              <p>2. Vá em <strong>Aparelhos Conectados &gt; Conectar um Aparelho</strong></p>
              <p>3. Aponte a câmera para o QR Code acima</p>
            </div>

            <div className="space-y-2 pt-2">
              {config.statusInstancia !== 'conectado' && (
                <button
                  type="button"
                  onClick={() => iniciarConexaoBaileysReal(currentTenantId)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar / Recarregar QR Code</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setModalQrCode(false)}
                className={`text-xs cursor-pointer ${isWhite ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Fechar janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERADOR DE PLACA / DISPLAY DE MESA COM QR CODE IMPRIMÍVEL */}
      {modalPlacaMesa && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>Gerador de Placa de Mesa & Balcão (QR Code)</h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Display para colocar em suportes de acrílico nas mesas para autoatendimento via WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPlacaMesa(false)}
                className={`p-1.5 rounded-lg cursor-pointer ${isWhite ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Controles à esquerda, Prévia do Display à direita */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              {/* Controles de Configuração da Placa */}
              <div className="md:col-span-5 space-y-4 text-xs">
                <div>
                  <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>Identificação do Ponto / Mesa:</label>
                  <select
                    value={mesaPlacaNumero}
                    onChange={(e) => setMesaPlacaNumero(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl font-medium focus:border-indigo-500 focus:outline-none ${
                      isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="Geral / Balcão">Geral / Balcão de Atendimento</option>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <option key={i + 1} value={`Mesa ${String(i + 1).padStart(2, '0')}`}>
                        Mesa {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                    <option value="Área Externa">Área Externa / Lounge</option>
                    <option value="Área VIP">Espaço VIP</option>
                  </select>
                </div>

                <div>
                  <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>Tema Visual do Display:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTemaPlaca('dark')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        temaPlaca === 'dark'
                          ? 'bg-slate-950 border-indigo-500 text-indigo-300 shadow-md'
                          : isWhite ? 'border-slate-300 text-slate-600 hover:border-slate-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Dark Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemaPlaca('clean')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        temaPlaca === 'clean'
                          ? 'bg-slate-100 border-indigo-500 text-slate-900 shadow-md'
                          : isWhite ? 'border-slate-300 text-slate-600 hover:border-slate-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Clean Minimalista
                    </button>
                  </div>
                </div>

                {/* Bloco Wi-Fi */}
                <div className={`border rounded-2xl p-3.5 space-y-3 ${
                  isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold flex items-center gap-1.5 ${isWhite ? 'text-slate-800' : 'text-slate-300'}`}>
                      <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Dados do Wi-Fi na Placa:</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirWifiPlaca}
                        onChange={(e) => setIncluirWifiPlaca(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {incluirWifiPlaca && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <span className={`text-[10px] block mb-0.5 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>Nome da Rede Wi-Fi:</span>
                        <input
                          type="text"
                          value={redeWifi}
                          onChange={(e) => setRedeWifi(e.target.value)}
                          placeholder="Ex: Restaurante-Clientes"
                          className={`w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs focus:border-indigo-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                      <div>
                        <span className={`text-[10px] block mb-0.5 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>Senha do Wi-Fi:</span>
                        <input
                          type="text"
                          value={senhaWifiPlaca}
                          onChange={(e) => setSenhaWifiPlaca(e.target.value)}
                          placeholder="Ex: senhacliente2026"
                          className={`w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs focus:border-indigo-500 focus:outline-none ${
                            isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Display de Acrílico (Ctrl+P)</span>
                  </button>

                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    💡 Dica: Imprima em papel couchê ou cartão fotográfico A5/A6 para encaixar em displays acrílicos de mesa.
                  </p>
                </div>
              </div>

              {/* Prévia Realista da Placa (Acrílico A5/A6) */}
              <div className="md:col-span-7 flex flex-col items-center justify-center">
                <div
                  id="placa-mesa-imprimivel"
                  className={`w-full max-w-[340px] rounded-3xl p-6 shadow-2xl border text-center transition-all ${
                    temaPlaca === 'dark'
                      ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white border-slate-700/80'
                      : 'bg-white text-slate-900 border-slate-300'
                  }`}
                >
                  {/* Topo do Display */}
                  <div className="space-y-1 mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 mb-1 border border-emerald-500/30">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-wider">{tenantAtual.nomeFantasia}</h4>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {mesaPlacaNumero}
                    </span>
                  </div>

                  {/* QR Code Container Real */}
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto mb-4 border-2 border-slate-200">
                    {qrPlacaDataUrl ? (
                      <img
                        src={qrPlacaDataUrl}
                        alt={`QR Code ${mesaPlacaNumero}`}
                        className="w-44 h-44 block rounded-xl"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                        Gerando QR Code...
                      </div>
                    )}
                  </div>

                  {/* Instruções para o Cliente */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs font-black">Faça seu Pedido pelo WhatsApp</p>
                    <p className={`text-[10px] leading-tight ${temaPlaca === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      1. Aponte a câmera do seu celular para o QR Code
                    </p>
                    <p className={`text-[10px] leading-tight ${temaPlaca === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      2. Acesse o cardápio e faça pedidos com nosso EloBot 24h
                    </p>
                    <p className={`text-[10px] leading-tight ${temaPlaca === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      3. Sua comanda é enviada na hora para a nossa cozinha
                    </p>
                  </div>

                  {/* Bloco Wi-Fi na Placa */}
                  {incluirWifiPlaca && (
                    <div
                      className={`p-2.5 rounded-xl border text-[10px] font-mono mb-3 ${
                        temaPlaca === 'dark'
                          ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold text-indigo-500 mb-0.5">
                        <Wifi className="w-3 h-3" />
                        <span>WI-FI PARA CLIENTES</span>
                      </div>
                      <div>Rede: <strong>{redeWifi}</strong></div>
                      <div>Senha: <strong>{senhaWifiPlaca}</strong></div>
                    </div>
                  )}

                  {/* Rodapé da Placa */}
                  <div className={`text-[8px] font-semibold uppercase tracking-wider ${temaPlaca === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Tecnologia EloServe • Atendimento Inteligente 24h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CAMPANHAS & PROMOÇÕES DE WHATSAPP (REMARKETING) */}
      {modalCampanhas && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-amber-500/30 text-white'
          }`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              isWhite ? 'bg-amber-50/60 border-slate-200' : 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>Campanhas & Promoções no WhatsApp</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold border border-emerald-500/30">
                      R$ 0,00 por envio
                    </span>
                  </div>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dispare ofertas, cupons de fidelidade e reative clientes sem taxas de mensagens
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCampanhas(false)}
                className={`p-1.5 rounded-lg cursor-pointer ${isWhite ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-5 text-xs">
              {/* Notificação de Sucesso */}
              {sucessoCampanha && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{sucessoCampanha}</span>
                </div>
              )}

              {/* 1. Seleção do Público Alvo */}
              <div>
                <label className={`font-bold block mb-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>1. Selecione o Público-Alvo:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltroPublicoCampanha('todos')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      filtroPublicoCampanha === 'todos'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 font-bold shadow-md'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-xs">Todos Clientes</span>
                    <span className="text-[10px] text-slate-500">{clientesDelivery?.length || 4} clientes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroPublicoCampanha('inativos')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      filtroPublicoCampanha === 'inativos'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 font-bold shadow-md'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-xs">Inativos +7 dias</span>
                    <span className="text-[10px] text-slate-500">Reengajamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroPublicoCampanha('aniversariantes')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      filtroPublicoCampanha === 'aniversariantes'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 font-bold shadow-md'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-xs">Aniversariantes</span>
                    <span className="text-[10px] text-slate-500">Mês de Outubro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroPublicoCampanha('vips')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      filtroPublicoCampanha === 'vips'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 font-bold shadow-md'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-xs">Clientes VIPs</span>
                    <span className="text-[10px] text-slate-500">+5 pedidos</span>
                  </button>
                </div>
              </div>

              {/* 2. Templates Rápidos de Campanha */}
              <div>
                <label className={`font-bold block mb-2 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>2. Escolha um Modelo Pré-pronto:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelecionarTemplate('desconto')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      templateCampanha === 'desconto'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 font-bold'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>15% OFF Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelecionarTemplate('chopp')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      templateCampanha === 'chopp'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 font-bold'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Beer className="w-3.5 h-3.5" />
                    <span>Bebida em Dobro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelecionarTemplate('saudade')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      templateCampanha === 'saudade'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-600 font-bold'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sentimos sua Falta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelecionarTemplate('aniversario')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      templateCampanha === 'aniversario'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 font-bold'
                        : isWhite ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Aniversário (Sobremesa Grátis)</span>
                  </button>
                </div>
              </div>

              {/* 3. Editor de Mensagem e Cupom */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      Mensagem do WhatsApp (Variáveis: <code className="text-amber-500 font-bold">{'{nome}'}</code>, <code className="text-amber-500 font-bold">{'{cupom}'}</code>):
                    </label>
                    <textarea
                      rows={3}
                      value={textoCampanha}
                      onChange={(e) => setTextoCampanha(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs focus:border-amber-500 focus:outline-none leading-relaxed ${
                        isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-semibold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>Cupom de Desconto:</label>
                    <div className="relative">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                      <input
                        type="text"
                        value={cupomCampanha}
                        onChange={(e) => setCupomCampanha(e.target.value.toUpperCase())}
                        placeholder="Ex: ELO15OFF"
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl font-mono font-bold text-xs uppercase focus:border-amber-500 focus:outline-none ${
                          isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      />
                    </div>

                    <div className={`mt-2 p-2 rounded-xl border text-[10px] ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <span>Destinatários selecionados: </span>
                      <strong className={`font-mono ${isWhite ? 'text-slate-900' : 'text-white'}`}>{clientesAlvoCampanha.length} contatos</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso quando estiver enviando */}
              {progressoEnvio !== null && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Disparando mensagens via WhatsApp...</span>
                    <span className="font-mono">{progressoEnvio}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isWhite ? 'bg-slate-200' : 'bg-slate-800'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${progressoEnvio}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botão de Disparo */}
              <div className={`pt-2 flex items-center justify-between gap-3 border-t ${
                isWhite ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <div className={`text-[11px] ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Custo total estimado desta campanha: </span>
                  <strong className="text-emerald-600 font-mono font-black">R$ 0,00</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalCampanhas(false)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      isWhite ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    disabled={progressoEnvio !== null || clientesAlvoCampanha.length === 0}
                    onClick={handleDispararCampanha}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Disparar para {clientesAlvoCampanha.length} Clientes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
