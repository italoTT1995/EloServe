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
  DollarSign,
  Gift,
  Beer,
  Pizza,
  Battery,
  X,
  Share2,
  Copy,
  Tag,
  Percent,
} from 'lucide-react';
import { useEloBotStore, ConversaWhatsApp, MensagemWhatsApp, ConfigEloBot } from '../store/useEloBotStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';

export default function EloBot() {
  const { tenantAtivoId, getTenantAtivo, planos } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const { getProdutosPorTenant } = useProductStore();
  const produtosLoja = getProdutosPorTenant(tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId);
  const { adicionarPedidoDelivery, clientes: clientesDelivery } = useDeliveryStore();

  const {
    getConfig,
    atualizarConfig,
    conectarInstancia,
    desconectarInstancia,
    gerarNovoQrCode,
    concluirLeituraQrCode,
    getConversas,
    selecionarConversa,
    conversaAtivaId,
    enviarMensagemCliente,
    enviarMensagemHumana,
    alternarModoAtendimento,
    criarNovaConversa,
    finalizarConversa,
    removerConversa,
    dispararCampanhaPromocional,
  } = useEloBotStore();

  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const config = getConfig(currentTenantId);
  const conversas = getConversas(currentTenantId);

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
  const [modoEnvio, setModoEnvio] = useState<'cliente' | 'humano'>('cliente');
  const [abaLateral, setAbaLateral] = useState<'instancia' | 'regras' | 'cardapio' | 'campanhas' | 'roi'>('instancia');
  const [modalNovoChat, setModalNovoChat] = useState(false);
  const [modalQrCode, setModalQrCode] = useState(false);
  const [novoClienteForm, setNovoClienteForm] = useState({
    nome: '',
    telefone: '',
    mensagemInicial: '',
  });

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

  // Filtrar clientes da campanha
  const clientesAlvoCampanha = useMemo(() => {
    const todos = clientesDelivery || [];
    if (filtroPublicoCampanha === 'inativos') {
      return todos.filter((c) => (c.totalPedidos || 0) < 10 || c.id === 'cli-02');
    }
    if (filtroPublicoCampanha === 'aniversariantes') {
      return todos.filter((c) => c.dataNascimento?.includes('/10/') || c.id === 'cli-01' || c.id === 'cli-03');
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

  // Sincronizar form de config com o tenant
  useEffect(() => {
    setFormConfig(config);
  }, [config.nomeAgente, config.statusInstancia, currentTenantId]);

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

  // Envio de mensagem
  function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMensagem.trim() || !conversaAtiva) return;

    if (modoEnvio === 'humano' || conversaAtiva.status === 'humano') {
      enviarMensagemHumana(currentTenantId, conversaAtiva.id, inputMensagem);
    } else {
      enviarMensagemCliente(
        currentTenantId,
        conversaAtiva.id,
        inputMensagem,
        produtosLoja,
        tenantAtual.nomeFantasia
      );
    }
    setInputMensagem('');
  }

  // Disparo de simulação rápida do cliente via chips
  function handleDispararChipRapido(texto: string) {
    if (!conversaAtiva) return;
    enviarMensagemCliente(
      currentTenantId,
      conversaAtiva.id,
      texto,
      produtosLoja,
      tenantAtual.nomeFantasia
    );
  }

  // Enviar Cardápio com 1 clique
  function handleEnviarCardapioRapido() {
    if (!conversaAtiva) return;
    enviarMensagemCliente(
      currentTenantId,
      conversaAtiva.id,
      'Por favor, pode me enviar o cardápio completo com opções e preços?',
      produtosLoja,
      tenantAtual.nomeFantasia
    );
  }

  // Enviar Chave PIX com 1 clique
  function handleEnviarPixRapido() {
    if (!conversaAtiva) return;
    enviarMensagemCliente(
      currentTenantId,
      conversaAtiva.id,
      'Qual a chave PIX de vocês para pagamento?',
      produtosLoja,
      tenantAtual.nomeFantasia
    );
  }

  // Salvar configurações do Robô
  function handleSalvarConfig(e: React.FormEvent) {
    e.preventDefault();
    atualizarConfig(currentTenantId, formConfig);
    setToastConfigSalva(true);
    setTimeout(() => setToastConfigSalva(false), 3000);
  }

  // Criar Pedido no Delivery a partir do Rascunho da Conversa
  function handleConfirmarPedidoNoDelivery() {
    if (!conversaAtiva || !conversaAtiva.pedidoRascunho) return;
    const rascunho = conversaAtiva.pedidoRascunho;

    adicionarPedidoDelivery({
      clienteNome: conversaAtiva.clienteNome,
      clienteTelefone: conversaAtiva.clienteTelefone,
      tipo: 'delivery',
      endereco: {
        rua: rascunho.endereco || 'Endereço informado via WhatsApp',
        numero: 'S/N',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        obs: 'Pedido feito automaticamente via EloBot WhatsApp',
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

    enviarMensagemHumana(
      currentTenantId,
      conversaAtiva.id,
      '✅ Pedido registrado com sucesso no sistema de Delivery! Nossa cozinha já recebeu a comanda e iniciou a preparação.'
    );

    setToastPedidoCriado(`Pedido de ${conversaAtiva.clienteNome} despachado para a Cozinha e Delivery!`);
    setTimeout(() => setToastPedidoCriado(null), 4000);
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

  // Simular conexão via QR Code
  function handleSimularLeituraQrCode() {
    concluirLeituraQrCode(currentTenantId);
    setModalQrCode(false);
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto select-none pb-10">
      {/* Top Banner do EloBot */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">EloBot — Atendente Inteligente 24h no WhatsApp</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{config.statusInstancia === 'conectado' ? 'IA Online' : 'Desconectado'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Atendimento autônomo com cardápio dinâmico do restaurante <strong className="text-white">{tenantAtual.nomeFantasia}</strong>, fechamento de pedidos e transbordo humano.
            </p>
          </div>
        </div>

        {/* Status da Instância & Ações Rápidas */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {config.statusInstancia === 'conectado' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-emerald-500/30 px-3.5 py-2 rounded-2xl">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">{config.telefoneInstancia}</span>
              <span className="text-[10px] text-slate-500">|</span>
              <Battery className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-mono text-slate-300">{config.bateriaPct}%</span>
            </div>
          ) : (
            <button
              onClick={() => {
                gerarNovoQrCode(currentTenantId);
                setModalQrCode(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Conectar WhatsApp (QR Code)</span>
            </button>
          )}

          <button
            onClick={() => setModalPlacaMesa(true)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            title="Gerar Display / Placa de Mesa e Balcão com QR Code para Impressão"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Placa QR Code de Mesa</span>
          </button>

          <button
            onClick={() => setModalCampanhas(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-amber-500/10"
            title="Disparar campanhas e cupons promocionais pelo WhatsApp"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>Campanhas no WhatsApp</span>
          </button>

          <button
            onClick={() => setModalNovoChat(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Chat de Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: 3 Colunas (Lista Conversas | Chat Ao Vivo | Painel IA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* COLUNA 1: Lista de Conversas do WhatsApp (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
          {/* Header e Busca */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Conversas WhatsApp</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {conversas.length} cliente{conversas.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={buscaConversa}
                onChange={(e) => setBuscaConversa(e.target.value)}
                placeholder="Buscar cliente, telefone ou texto..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filtros por tipo de atendimento */}
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl text-[11px] font-semibold text-center">
              <button
                onClick={() => setFiltroConversas('todas')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filtroConversas === 'todas' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroConversas('ia')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  filtroConversas === 'ia' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span>IA</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20">{totalIA}</span>
              </button>
              <button
                onClick={() => setFiltroConversas('humano')}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  filtroConversas === 'humano' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-amber-300'
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
                  filtroConversas === 'finalizado' ? 'bg-slate-800 text-slate-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Fim
              </button>
            </div>
          </div>

          {/* Lista com Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[520px]">
            {conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs">Nenhuma conversa encontrada neste filtro.</p>
                <button
                  onClick={() => setModalNovoChat(true)}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  + Iniciar um novo chat de teste
                </button>
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const isAtivo = conv.id === conversaAtiva?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selecionarConversa(conv.id)}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative hover:bg-slate-800/40 ${
                      isAtivo ? 'bg-slate-800/80 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                      {conv.clienteNome
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{conv.clienteNome}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{conv.ultimaHora}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mb-1.5">{conv.ultimaMensagem}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {conv.status === 'humano' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              <span>Transbordo Humano</span>
                            </span>
                          ) : conv.status === 'ia' ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                              <Bot className="w-2.5 h-2.5" />
                              <span>EloBot Atendendo</span>
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              Finalizado
                            </span>
                          )}

                          {conv.pedidoRascunho && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-0.5">
                              <ShoppingBag className="w-2.5 h-2.5" />
                              <span>Pedido em Rascunho</span>
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
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl h-[640px]">
          {conversaAtiva ? (
            <>
              {/* Header do Chat WhatsApp */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                    {conversaAtiva.clienteNome
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">{conversaAtiva.clienteNome}</h4>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        {conversaAtiva.clienteTelefone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {conversaAtiva.status === 'humano'
                          ? '👤 Aguardando Atendente Humano'
                          : '🤖 EloBot IA Respondendo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação do Chat */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {conversaAtiva.status === 'humano' ? (
                    <button
                      onClick={() => alternarModoAtendimento(currentTenantId, conversaAtiva.id, 'ia')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Devolver atendimento para o robô de IA responder automaticamente"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ativar IA</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alternarModoAtendimento(currentTenantId, conversaAtiva.id, 'humano')}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Pausar a IA e assumir a conversa como humano"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Assumir</span>
                    </button>
                  )}

                  <button
                    onClick={() => removerConversa(currentTenantId, conversaAtiva.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Excluir histórico de conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Feed de Mensagens (Estilo WhatsApp) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/70">
                {/* Linha de Criptografia / Conexão */}
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
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
                        <span className="text-[10px] text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full font-semibold">
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
                            ? 'bg-slate-800 border border-slate-700/60 text-white rounded-tl-none'
                            : isBot
                            ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-50 rounded-tr-none'
                            : 'bg-purple-950/90 border border-purple-500/40 text-purple-50 rounded-tr-none'
                        }`}
                      >
                        {/* Header do Balão com Tag */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-80 border-b border-white/10 pb-1">
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
                          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 space-y-1.5 mt-2">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                              Sugestões do Cardápio:
                            </span>
                            {msg.cardapioItensDestaque.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                                <span className="font-bold text-white">{item.nome}</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                  R$ {item.preco.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Card de Resumo de Pedido Delivery */}
                        {msg.resumoPedido && (
                          <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-3 space-y-2 mt-2">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="text-[11px] font-black text-purple-300 flex items-center gap-1">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Resumo do Pedido Delivery</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                                WhatsApp
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px]">
                              {msg.resumoPedido.itens.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-slate-300">
                                  <span>{it.quantidade}x {it.nome}</span>
                                  <span className="font-mono">R$ {(it.preco * it.quantidade).toFixed(2).replace('.', ',')}</span>
                                </div>
                              ))}
                              <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                                <span>Taxa de Entrega:</span>
                                <span>R$ {msg.resumoPedido.taxaEntrega.toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs font-black text-emerald-400 pt-1">
                                <span>Total do Pedido:</span>
                                <span>R$ {msg.resumoPedido.total.toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>

                            {/* Botão para Confirmar no Delivery Store */}
                            <button
                              type="button"
                              onClick={handleConfirmarPedidoNoDelivery}
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enviar Comanda para Cozinha & Delivery</span>
                            </button>
                          </div>
                        )}

                        {/* Status de Envio */}
                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-70">
                          <span>{msg.hora}</span>
                          <CheckCheck className="w-3 h-3 text-sky-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Barra de Sugestões de Teste Rápido (Chips do Cliente) */}
              <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Testar IA:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDispararChipRapido('Quais pratos vocês recomendam no cardápio de hoje?')}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  📋 Ver Cardápio
                </button>
                <button
                  type="button"
                  onClick={() => handleDispararChipRapido('Quero pedir o prato principal com uma bebida para entrega.')}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  🥩 Fazer Pedido
                </button>
                <button
                  type="button"
                  onClick={() => handleDispararChipRapido('Qual a chave PIX e quanto tempo demora a entrega?')}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  🔑 Chave PIX & Prazo
                </button>
                <button
                  type="button"
                  onClick={() => handleDispararChipRapido('Gostaria de falar com um atendente humano')}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-amber-950/40 text-amber-300 border border-amber-500/20 whitespace-nowrap transition-colors cursor-pointer"
                >
                  👤 Falar com Humano
                </button>
              </div>

              {/* Barra de Digitação */}
              <form onSubmit={handleEnviar} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                {/* Seletor de Modo de Envio (Cliente ou Humano) */}
                <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-800 text-[10px] font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setModoEnvio('cliente')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      modoEnvio === 'cliente'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Digitar como se fosse o cliente do WhatsApp"
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEnvio('humano')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      modoEnvio === 'humano'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Digitar como o atendente humano da loja"
                  >
                    Loja
                  </button>
                </div>

                <input
                  type="text"
                  value={inputMensagem}
                  onChange={(e) => setInputMensagem(e.target.value)}
                  placeholder={
                    modoEnvio === 'humano' || conversaAtiva.status === 'humano'
                      ? 'Responder cliente como Atendente Humano...'
                      : 'Simular mensagem do cliente (IA responderá)...'
                  }
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputMensagem.trim()}
                  className={`p-2.5 rounded-xl text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md ${
                    modoEnvio === 'humano' || conversaAtiva.status === 'humano'
                      ? 'bg-purple-600 hover:bg-purple-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
              <p className="text-xs">Selecione uma conversa para iniciar o atendimento.</p>
            </div>
          )}
        </div>

        {/* COLUNA 3: Painel de Controle da IA & Loja (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4 shadow-xl">
          {/* Navegação entre Abas Laterais */}
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-2xl text-[10px] sm:text-[11px] font-bold">
            <button
              onClick={() => setAbaLateral('instancia')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'instancia'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setAbaLateral('regras')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'regras'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regras
            </button>
            <button
              onClick={() => setAbaLateral('cardapio')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'cardapio'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Memória
            </button>
            <button
              onClick={() => setAbaLateral('roi')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                abaLateral === 'roi'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ROI & Lucro
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
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Gateway Ativo:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    Baileys / Evolution v2
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Status da Sessão:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {config.statusInstancia === 'conectado' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-emerald-400">Conectado Oficial</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        <span className="text-rose-400">Desconectado</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Número Conectado:</span>
                  <span className="font-mono font-bold text-slate-200">{config.telefoneInstancia}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Tempo Médio Resposta:</span>
                  <span className="font-mono text-emerald-400 font-bold">{config.tempoRespostaMedioSeg}s</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Mensagens Hoje:</span>
                  <span className="font-mono font-bold text-white">{config.totalMensagensHoje} envios</span>
                </div>
              </div>

              {/* Botões de Conexão */}
              <div className="space-y-2">
                {config.statusInstancia === 'conectado' ? (
                  <button
                    onClick={() => desconectarInstancia(currentTenantId)}
                    className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Desconectar Instância</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      gerarNovoQrCode(currentTenantId);
                      setModalQrCode(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Parear WhatsApp com QR Code</span>
                  </button>
                )}

                <button
                  onClick={handleEnviarCardapioRapido}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enviar Cardápio Atualizado</span>
                </button>

                <button
                  onClick={handleEnviarPixRapido}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Disparar Chave PIX</span>
                </button>
              </div>

              {/* Transbordo Humano Box */}
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Transbordo Humano Inteligente</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Quando o cliente digita "atendente", "falar com humano" ou relata um problema, a IA transfere o chat automaticamente para você assumir.
                </p>
              </div>
            </div>
          )}

          {/* CONTEÚDO 2: REGRAS E PERSONALIDADE DA IA */}
          {abaLateral === 'regras' && (
            <form onSubmit={handleSalvarConfig} className="space-y-3.5 text-xs overflow-y-auto max-h-[500px] pr-1">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Robô / Agente:</label>
                <input
                  type="text"
                  value={formConfig.nomeAgente}
                  onChange={(e) => setFormConfig({ ...formConfig, nomeAgente: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tom de Voz:</label>
                <select
                  value={formConfig.tomDeVoz}
                  onChange={(e) => setFormConfig({ ...formConfig, tomDeVoz: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="acolhedor">Acolhedor, caloroso e simpático</option>
                  <option value="formal">Formal e executivo</option>
                  <option value="descontraido">Descontraído e moderno</option>
                  <option value="vendedor">Foco em Vendas e Upsell de pratos</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Modelo de IA:</label>
                <select
                  value={formConfig.modeloIA}
                  onChange={(e) => setFormConfig({ ...formConfig, modeloIA: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultrarrápido • Padrão)</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                  <option value="claude-3-haiku">Anthropic Claude 3 Haiku</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Chave PIX do Restaurante:</label>
                <input
                  type="text"
                  value={formConfig.chavePix}
                  onChange={(e) => setFormConfig({ ...formConfig, chavePix: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Prazo Entrega (min):</label>
                  <input
                    type="number"
                    value={formConfig.tempoMedioEntregaMin}
                    onChange={(e) => setFormConfig({ ...formConfig, tempoMedioEntregaMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Taxa Fixa (R$):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formConfig.taxaEntregaFixa}
                    onChange={(e) => setFormConfig({ ...formConfig, taxaEntregaFixa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Instruções Customizadas do Restaurante:</label>
                <textarea
                  rows={3}
                  value={formConfig.instrucoesCustomizadas}
                  onChange={(e) => setFormConfig({ ...formConfig, instrucoesCustomizadas: e.target.value })}
                  placeholder="Ex: Ofereça sobremesa, destaque a promoção de chopp na quinta..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Configurações da IA</span>
              </button>
            </form>
          )}

          {/* CONTEÚDO 3: CARDÁPIO NA MEMÓRIA DA IA */}
          {abaLateral === 'cardapio' && (
            <div className="space-y-3 text-xs overflow-y-auto max-h-[500px] pr-1">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Cardápio em Tempo Real:
                </span>
                <p className="text-[11px] text-slate-300">
                  O EloBot lê em tempo real os <strong className="text-white">{produtosLoja.length} produtos</strong> da loja ativa (<strong>{tenantAtual.nomeFantasia}</strong>).
                </p>
              </div>

              <div className="space-y-2">
                {produtosLoja.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-white truncate block">{prod.nome}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{prod.descricao || 'Sem descrição'}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      R$ {prod.precoVenda.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTEÚDO 4: ROI & ECONOMIA DA IA */}
          {abaLateral === 'roi' && (
            <div className="space-y-3.5 text-xs overflow-y-auto max-h-[500px] pr-1">
              <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Economia Estimada:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    +R$ 1.940,00/mês
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">48,5h</span>
                  <span className="text-xs text-slate-400">poupadas de atendimento</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  O EloBot atende 24 horas por dia sem descanso nem erros, convertendo pedidos diretamente para a Cozinha e Delivery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Resolução Autônoma</span>
                  <span className="text-base font-black text-emerald-400 font-mono">95.8%</span>
                  <span className="text-[10px] text-slate-500 block">dos clientes sem fila</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Conversão em Vendas</span>
                  <span className="text-base font-black text-sky-400 font-mono">32.4%</span>
                  <span className="text-[10px] text-slate-500 block">viram comanda real</span>
                </div>
              </div>

              {/* Comparativo de Custos: Meta API vs Baileys / Evolution */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Custo por Mensagem no WhatsApp</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Meta Cloud API (Oficial):</span>
                    <span className="text-rose-400 font-mono font-bold">~R$ 0,38 / conversa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      EloServe (Evolution API):
                    </span>
                    <span className="text-emerald-300 font-mono font-black">R$ 0,00 (100% Grátis)</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Ao usar a conexão direta via QR Code do EloServe, o restaurante não paga taxas por conversa nem mensalidades abusivas de gateways terceiros.
                </p>
              </div>

              {/* Ações Rápidas */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalCampanhas(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Disparar Campanha de Vendas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPlacaMesa(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Imprimir Placas de Mesa (QR Code)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NOVO CHAT DE TESTE / CLIENTE */}
      {modalNovoChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Simular Novo Chat de Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoChat(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarNovoChat} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Cliente:</label>
                <input
                  type="text"
                  placeholder="Ex: Gabriela Duarte"
                  value={novoClienteForm.nome}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone:</label>
                <input
                  type="text"
                  placeholder="(31) 99888-7766"
                  value={novoClienteForm.telefone}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, telefone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Primeira Mensagem do Cliente:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Boa noite! Gostaria de saber quais são os pratos do dia."
                  value={novoClienteForm.mensagemInicial}
                  onChange={(e) => setNovoClienteForm({ ...novoClienteForm, mensagemInicial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoChat(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Iniciar Conversa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE EVOLUTION API */}
      {modalQrCode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Conexão WhatsApp Evolution</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalQrCode(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              {/* QR Code SVG / Visual realista */}
              <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center border-4 border-slate-900 rounded-xl relative p-2">
                <div className="grid grid-cols-6 gap-1 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i < 8 || i > 28
                          ? 'bg-slate-900'
                          : 'bg-emerald-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">1. Abra o WhatsApp no celular</p>
              <p>2. Vá em <strong>Aparelhos Conectados &gt; Conectar um Aparelho</strong></p>
              <p>3. Aponte a câmera para o QR Code acima</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSimularLeituraQrCode}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simular Leitura com o Celular</span>
              </button>

              <button
                type="button"
                onClick={() => setModalQrCode(false)}
                className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Gerador de Placa de Mesa & Balcão (QR Code)</h3>
                  <p className="text-xs text-slate-400">
                    Display para colocar em suportes de acrílico nas mesas para autoatendimento via WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPlacaMesa(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Controles à esquerda, Prévia do Display à direita */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              {/* Controles de Configuração da Placa */}
              <div className="md:col-span-5 space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Identificação do Ponto / Mesa:</label>
                  <select
                    value={mesaPlacaNumero}
                    onChange={(e) => setMesaPlacaNumero(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-indigo-500 focus:outline-none"
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
                  <label className="text-slate-300 font-semibold block mb-1">Tema Visual do Display:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTemaPlaca('dark')}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        temaPlaca === 'dark'
                          ? 'bg-slate-950 border-indigo-500 text-indigo-300 shadow-md'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
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
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Clean Minimalista
                    </button>
                  </div>
                </div>

                {/* Bloco Wi-Fi */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dados do Wi-Fi na Placa:</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirWifiPlaca}
                        onChange={(e) => setIncluirWifiPlaca(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {incluirWifiPlaca && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Nome da Rede Wi-Fi:</span>
                        <input
                          type="text"
                          value={redeWifi}
                          onChange={(e) => setRedeWifi(e.target.value)}
                          placeholder="Ex: Restaurante-Clientes"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Senha do Wi-Fi:</span>
                        <input
                          type="text"
                          value={senhaWifiPlaca}
                          onChange={(e) => setSenhaWifiPlaca(e.target.value)}
                          placeholder="Ex: senhacliente2026"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
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

                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto mb-4 border-2 border-slate-200">
                    <div className="w-40 h-40 bg-slate-50 flex flex-col items-center justify-center border-4 border-slate-900 rounded-xl relative p-2">
                      <div className="grid grid-cols-6 gap-1 w-full h-full">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i % 2 === 0 && i % 3 === 0) || i < 8 || i > 28
                                ? 'bg-slate-900'
                                : 'bg-emerald-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-md flex items-center justify-center">
                          <Bot className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </div>
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
                      <div className="flex items-center justify-center gap-1 font-bold text-indigo-400 mb-0.5">
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
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Campanhas & Promoções no WhatsApp</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      R$ 0,00 por envio
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dispare ofertas, cupons de fidelidade e reative clientes sem taxas de mensagens
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCampanhas(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-5 text-xs">
              {/* Notificação de Sucesso */}
              {sucessoCampanha && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{sucessoCampanha}</span>
                </div>
              )}

              {/* 1. Seleção do Público Alvo */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">1. Selecione o Público-Alvo:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltroPublicoCampanha('todos')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      filtroPublicoCampanha === 'todos'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-xs">Clientes VIPs</span>
                    <span className="text-[10px] text-slate-500">+5 pedidos</span>
                  </button>
                </div>
              </div>

              {/* 2. Templates Rápidos de Campanha */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">2. Escolha um Modelo Pré-pronto:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelecionarTemplate('desconto')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      templateCampanha === 'desconto'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
                    <label className="text-slate-300 font-semibold block mb-1">
                      Mensagem do WhatsApp (Variáveis: <code className="text-amber-400">{'{nome}'}</code>, <code className="text-amber-400">{'{cupom}'}</code>):
                    </label>
                    <textarea
                      rows={3}
                      value={textoCampanha}
                      onChange={(e) => setTextoCampanha(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Cupom de Desconto:</label>
                    <div className="relative">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                      <input
                        type="text"
                        value={cupomCampanha}
                        onChange={(e) => setCupomCampanha(e.target.value.toUpperCase())}
                        placeholder="Ex: ELO15OFF"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-xs uppercase focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                      <span>Destinatários selecionados: </span>
                      <strong className="text-white font-mono">{clientesAlvoCampanha.length} contatos</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso quando estiver enviando */}
              {progressoEnvio !== null && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>Disparando mensagens via WhatsApp...</span>
                    <span className="font-mono">{progressoEnvio}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${progressoEnvio}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botão de Disparo */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  <span>Custo total estimado desta campanha: </span>
                  <strong className="text-emerald-400 font-mono font-black">R$ 0,00</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalCampanhas(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    disabled={progressoEnvio !== null || clientesAlvoCampanha.length === 0}
                    onClick={handleDispararCampanha}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
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
