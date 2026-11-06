import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  QrCode,
  Smartphone,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  CreditCard,
  Crown,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  ExternalLink,
  Sliders,
  Zap,
  Phone,
  Power,
  Trash2,
  HelpCircle,
  CheckCheck,
  Flame,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatbotStore, ProvedorIA } from '../store/useChatbotStore';
import { useProductStore } from '../store/useProductStore';
import { useThemeStore } from '../store/useThemeStore';

export default function ChatbotWhatsApp() {
  const { tenantAtivoId, getTenantAtivo, tenants, selecionarTenant, isWhatsAppIALiberado, alternarWhatsAppIA, atualizarDadosTenant } = useSaaSStore();
  const { usuarioLogado } = useAuthStore();
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';

  const idLoja =
    usuarioLogado?.tenantId && usuarioLogado.tenantId !== 'global' && usuarioLogado.tenantId !== 'tenant-01'
      ? usuarioLogado.tenantId
      : tenantAtivoId && tenantAtivoId !== 'global' && tenantAtivoId !== 'tenant-01'
      ? tenantAtivoId
      : tenants.find((t) => t.id !== 'global' && t.id !== 'tenant-01')?.id || '';
  const tenantAtual = tenants.find((t) => t.id === idLoja) || getTenantAtivo();
  const tenantId = idLoja;
  const isLiberado = isWhatsAppIALiberado(tenantId);
  const isMaster = usuarioLogado?.cargo === 'super_admin';

  const {
    getConfig,
    atualizarConfig,
    gerarQRCodeConexao,
    desconectarWhatsApp,
    simularConexaoSucesso,
    getMensagensSimulador,
    estaDigitandoSimulador,
    enviarMensagemSimulador,
    confirmarPedidoSimulador,
    limparConversaSimulador,
    transbordoAtivo,
  } = useChatbotStore();

  const config = getConfig(tenantId);
  const mensagensSimulador = getMensagensSimulador(tenantId);

  // Estados locais das abas e inputs
  const [abaAtiva, setAbaAtiva] = useState<'robo' | 'cardapio' | 'delivery' | 'transbordo' | 'conexao'>('robo');
  const [textoInputSimulador, setTextoInputSimulador] = useState('');
  const [numeroManualInput, setNumeroManualInput] = useState('');
  const [erroNumero, setErroNumero] = useState<string | null>(null);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucessoSalvar, setSucessoSalvar] = useState(false);

  function handleVincularNumeroManual() {
    const limpo = numeroManualInput.trim();
    if (!limpo || limpo.length < 8) {
      setErroNumero('Informe um número válido com DDD (ex: (31) 98765-4321).');
      return;
    }
    setErroNumero(null);
    simularConexaoSucesso(tenantId, limpo);
    atualizarDadosTenant(tenantId, {
      telefoneWhatsApp: limpo,
      instanciaWhatsAppConectada: true,
    });
    setNumeroManualInput('');
  }

  const fimChatRef = useRef<HTMLDivElement>(null);

  // Inicializa a conversa no simulador caso esteja vazia
  useEffect(() => {
    if (mensagensSimulador.length === 0) {
      limparConversaSimulador(tenantId);
    }
  }, [tenantId]);

  // Auto-scroll no simulador quando nova mensagem chega
  useEffect(() => {
    fimChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagensSimulador, estaDigitandoSimulador]);

  const linkCardapio = `${window.location.origin}/cardapio/${tenantId}`;

  function handleCopiarLink() {
    navigator.clipboard.writeText(linkCardapio);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  }

  function handleSalvarConfig() {
    setSalvando(true);
    setTimeout(() => {
      setSalvando(false);
      setSucessoSalvar(true);
      setTimeout(() => setSucessoSalvar(false), 2500);
    }, 400);
  }

  function handleEnviarSimulador(e: React.FormEvent) {
    e.preventDefault();
    if (!textoInputSimulador.trim()) return;
    const msg = textoInputSimulador;
    setTextoInputSimulador('');
    enviarMensagemSimulador(tenantId, msg);
  }

  // =========================================================================
  // TELA DE BLOQUEIO / UPGRADE SE O PLANO NÃO TIVER O MÓDULO LIBERADO
  // =========================================================================
  if (!isLiberado) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className={`p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden shadow-2xl ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          {/* Fundo decorativo */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Ícone de Cadeado & Bot */}
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-5 text-amber-500 shadow-inner">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            Módulo Exclusivo Enterprise & IA
          </div>

          <h1 className={`text-2xl md:text-3xl font-extrabold mb-3 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            Atendente WhatsApp Inteligente (Estratégia Anota AI)
          </h1>

          <p className={`max-w-2xl mx-auto text-sm md:text-base mb-8 ${isWhite ? 'text-slate-600' : 'text-slate-300'}`}>
            Automatize 100% dos pedidos do seu restaurante no WhatsApp oficial com Inteligência Artificial, envio automático do cardápio digital e integração direta com a cozinha (KDS).
          </p>

          {/* Benefícios Anota AI Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left mb-8">
            <div className={`p-4 rounded-2xl border ${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1 text-sm">
                <Sparkles className="w-4 h-4" /> Atendimento 24/7 com IA
              </div>
              <p className={`text-xs ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                Responde clientes em segundos usando IA gratuita (Google Gemini), tira dúvidas e anota pedidos sem fila de espera.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1 text-sm">
                <Zap className="w-4 h-4" /> Cardápio Digital no Zap
              </div>
              <p className={`text-xs ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                Envia o link interativo do cardápio na primeira mensagem, aumentando o ticket médio com fotos e combos apetitosos.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center gap-2 font-bold text-blue-400 mb-1 text-sm">
                <Truck className="w-4 h-4" /> Direto para a Cozinha (KDS)
              </div>
              <p className={`text-xs ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                O pedido cai instantaneamente na tela da cozinha e do entregador sem ninguém precisar redigitar nada.
              </p>
            </div>
          </div>

          {/* PAINEL ESPECIAL DE LIBERAÇÃO PARA O SUPER ADMIN MASTER */}
          {isMaster ? (
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Painel do Franqueador / Super Admin
              </div>
              <p className="text-xs text-amber-200/90 mb-4">
                Como Super Admin do sistema, você tem a permissão de liberar este módulo para <strong>{tenantAtual.nomeFantasia}</strong> diretamente sem restrição de plano.
              </p>
              <button
                type="button"
                onClick={() => alternarWhatsAppIA(tenantId, true, usuarioLogado?.nome)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-transform hover:scale-105"
              >
                <Unlock className="w-4 h-4" />
                Liberar Módulo WhatsApp IA para Esta Loja
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Seu plano atual é o <strong>{tenantAtual.planoId.toUpperCase()}</strong>. Para habilitar o EloBot WhatsApp, solicite o upgrade com o seu consultor.
              </p>
              <a
                href={`https://api.whatsapp.com/send?phone=5531971826083&text=Ol%C3%A1!%20Gostaria%20de%20ativar%20o%20M%C3%B3dulo%20WhatsApp%20IA%20do%20EloServe%20para%20o%20restaurante%20${encodeURIComponent(tenantAtual.nomeFantasia)}.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Falar com o Franqueador no WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAINEL COMPLETO DO ATENDENTE WHATSAPP (ANOTA AI STYLE)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 font-['Plus_Jakarta_Sans',sans-serif] space-y-6 select-none">
      {/* 1. TOPO & STATUS DA CONEXÃO */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
        isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                Atendente WhatsApp IA
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Anota AI Style
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Restaurante ativo: <strong className={isWhite ? 'text-slate-800' : 'text-slate-200'}>{tenantAtual?.nomeFantasia || 'Restaurante'}</strong> • Automação de Pedidos 24h
              </span>
              {isMaster && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ml-1">
                  <span className="text-[10px] font-bold">Trocar Loja:</span>
                  <select
                    value={tenantId}
                    onChange={(e) => selecionarTenant(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    {tenants.filter((t) => t.id !== 'global' && t.id !== 'tenant-01').map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.nomeFantasia || t.razaoSocial}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status de Conexão WhatsApp */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            config.statusConexao === 'conectado'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${config.statusConexao === 'conectado' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
            {config.statusConexao === 'conectado' && config.numeroConectado ? (
              <span>Conectado: {config.numeroConectado}</span>
            ) : (
              <span>WhatsApp Desconectado</span>
            )}
          </div>

          {/* Toggle do Robô Ativo/Pausado */}
          <button
            type="button"
            onClick={() => atualizarConfig(tenantId, { ativo: !config.ativo })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              config.ativo
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {config.ativo ? 'Robô Ativo' : 'Robô Pausado'}
          </button>
        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Conversas Atendidas</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            {config.totalConversas}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">+18% essa semana</span>
        </div>

        <div className={`p-4 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pedidos Gerados</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            {config.pedidosGerados}
          </div>
          <span className="text-[10px] text-amber-400 font-bold">100% direto no KDS</span>
        </div>

        <div className={`p-4 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Tempo Economizado</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`text-xl font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            {config.tempoEconomizadoHoras}h
          </div>
          <span className="text-[10px] text-blue-400 font-bold">Sem funcionário digitando</span>
        </div>

        <div className={`p-4 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Motor de IA</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-sm font-black truncate uppercase ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            {config.provedorIA === 'gemini' ? 'Google Gemini' : config.provedorIA === 'groq' ? 'Groq Llama' : 'Menu Guiado'}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Plano Gratuito Ativo</span>
        </div>
      </div>

      {/* 3. GRID PRINCIPAL: CONFIGURAÇÕES (ESQUERDA) + SIMULADOR WHATSAPP (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* COLUNA ESQUERDA: NAVEGAÇÃO DE ABAS & FORMULÁRIOS ANOTA AI */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Menu de Abas */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
            isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setAbaAtiva('robo')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                abaAtiva === 'robo'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              1. Robô & IA
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('cardapio')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                abaAtiva === 'cardapio'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              2. Cardápio Digital
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('delivery')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                abaAtiva === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              3. Delivery & Pix
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('transbordo')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                abaAtiva === 'transbordo'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              4. Chamar Atendente
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('conexao')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                abaAtiva === 'conexao'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              5. Conexão QR
            </button>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className={`p-5 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
          }`}>
            {/* ABA 1: ROBÔ & IA */}
            {abaAtiva === 'robo' && (
              <div className="space-y-4">
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    Configurações do Atendente Virtual
                  </h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Escolha a Inteligência Artificial e personalize as mensagens acolhedoras do seu restaurante.
                  </p>
                </div>

                {/* Seleção do Motor de IA Gratuito */}
                <div className="space-y-2">
                  <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Provedor de Inteligência Artificial:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => atualizarConfig(tenantId, { provedorIA: 'gemini' })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        config.provedorIA === 'gemini'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : isWhite ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-emerald-400">Google Gemini</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">Grátis</span>
                      </div>
                      <p className="text-[11px] text-slate-400">1.500 msgs/dia gratuitas. O melhor em português.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => atualizarConfig(tenantId, { provedorIA: 'groq' })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        config.provedorIA === 'groq'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : isWhite ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-blue-400">Groq (Llama 3.3)</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">Grátis</span>
                      </div>
                      <p className="text-[11px] text-slate-400">A mais rápida do mundo (respostas em 0.4s).</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => atualizarConfig(tenantId, { provedorIA: 'menu_guiado' })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        config.provedorIA === 'menu_guiado'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : isWhite ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-amber-400">Menu Guiado</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">100% Regras</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Sem IA externa. Menus de 1 a 4 simplificados.</p>
                    </button>
                  </div>
                </div>

                {/* Nome do Robô */}
                <div>
                  <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nome de Apresentação do Atendente:
                  </label>
                  <input
                    type="text"
                    value={config.nomeRobo}
                    onChange={(e) => atualizarConfig(tenantId, { nomeRobo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>

                {/* Mensagem de Boas-Vindas */}
                <div>
                  <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mensagem de Boas-Vindas (Primeira Mensagem do Cliente):
                  </label>
                  <textarea
                    rows={3}
                    value={config.mensagemBoasVindas}
                    onChange={(e) => atualizarConfig(tenantId, { mensagemBoasVindas: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 resize-none ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>

                {/* Mensagem Fora de Horário */}
                <div>
                  <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mensagem Quando o Restaurante Estiver Fechado:
                  </label>
                  <textarea
                    rows={2}
                    value={config.mensagemForaHorario}
                    onChange={(e) => atualizarConfig(tenantId, { mensagemForaHorario: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 resize-none ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ABA 2: CARDÁPIO DIGITAL & LINKS */}
            {abaAtiva === 'cardapio' && (
              <div className="space-y-4">
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    Estratégia Anota AI: Cardápio Digital Interativo
                  </h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    O robô envia o link direto para o cliente navegar pelos pratos com fotos e montar o pedido no WhatsApp.
                  </p>
                </div>

                {/* Box do Link Oficial */}
                <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
                  isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="w-full md:w-auto truncate">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Link do Cardápio desta Loja</span>
                    <span className={`text-xs font-mono select-all truncate block ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                      {linkCardapio}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleCopiarLink}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiadoLink ? 'Copiado!' : 'Copiar Link'}
                    </button>
                    <a
                      href={linkCardapio}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                        isWhite ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Switch de envio automático */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div>
                    <span className={`text-xs font-bold block ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                      Enviar Link do Cardápio Automaticamente
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dispara o cardápio interativo na primeira saudação do cliente no WhatsApp.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enviarLinkCardapioAutomatico}
                    onChange={(e) => atualizarConfig(tenantId, { enviarLinkCardapioAutomatico: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ABA 3: DELIVERY, TAXAS & PIX */}
            {abaAtiva === 'delivery' && (
              <div className="space-y-4">
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    Regras de Delivery e Pagamento
                  </h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Esses dados são usados pela IA para responder aos clientes sobre taxas, tempo e formas de pagamento.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      Tempo Médio de Entrega (Minutos):
                    </label>
                    <input
                      type="number"
                      value={config.tempoMedioEntregaMin}
                      onChange={(e) => atualizarConfig(tenantId, { tempoMedioEntregaMin: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                        isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      Taxa de Entrega Padrão (R$):
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      value={config.taxaEntregaPadrao}
                      onChange={(e) => atualizarConfig(tenantId, { taxaEntregaPadrao: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                        isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      Chave Pix Oficial para Pagamentos:
                    </label>
                    <input
                      type="text"
                      value={config.chavePix}
                      onChange={(e) => atualizarConfig(tenantId, { chavePix: e.target.value })}
                      placeholder="Ex: 59.474.915/0001-81 ou telefone"
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                        isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                      Horário de Funcionamento:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={config.horarioAbertura}
                        onChange={(e) => atualizarConfig(tenantId, { horarioAbertura: e.target.value })}
                        className={`w-full px-2 py-1.5 rounded-xl text-xs border ${
                          isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />
                      <span className="text-xs text-slate-400">até</span>
                      <input
                        type="time"
                        value={config.horarioFechamento}
                        onChange={(e) => atualizarConfig(tenantId, { horarioFechamento: e.target.value })}
                        className={`w-full px-2 py-1.5 rounded-xl text-xs border ${
                          isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: CHAMA ATENDENTE / TRANSBORDO HUMANO */}
            {abaAtiva === 'transbordo' && (
              <div className="space-y-4">
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    Transbordo Humano (Chamar Garçom / Atendente)
                  </h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Quando o cliente digita palavras como <em>"atendente"</em> ou <em>"quero falar com alguém"</em>, o robô pausa e alerta o restaurante.
                  </p>
                </div>

                <div>
                  <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Palavras-Chave de Ativação (Separadas por vírgula):
                  </label>
                  <input
                    type="text"
                    value={config.palavrasChaveTransbordo.join(', ')}
                    onChange={(e) =>
                      atualizarConfig(tenantId, {
                        palavrasChaveTransbordo: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mensagem de Resposta ao Chamar Atendente:
                  </label>
                  <textarea
                    rows={2}
                    value={config.mensagemChamarAtendente}
                    onChange={(e) => atualizarConfig(tenantId, { mensagemChamarAtendente: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 resize-none ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ABA 5: CONEXÃO WHATSAPP (QR CODE OU NÚMERO MANUAL) */}
            {abaAtiva === 'conexao' && (
              <div className="space-y-5">
                <div>
                  <h3 className={`text-sm font-bold mb-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    Conexão Individual do WhatsApp • {tenantAtual?.nomeFantasia || 'Restaurante'}
                  </h3>
                  <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    Cada restaurante possui sua própria conexão isolada. Nenhum número ou mensagem é compartilhado entre lojas.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl border text-center space-y-6 ${
                  isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  {config.statusConexao === 'conectado' && config.numeroConectado ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                        <CheckCheck className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          Instância WhatsApp Vinculada e Online
                        </h4>
                        <p className="text-base text-emerald-500 font-mono font-black">
                          {config.numeroConectado}
                        </p>
                        <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          O robô deste restaurante está escutando mensagens e enviando pedidos diretamente para a cozinha KDS.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            desconectarWhatsApp(tenantId);
                            atualizarDadosTenant(tenantId, { instanciaWhatsAppConectada: false });
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-bold text-xs border border-rose-500/30 cursor-pointer transition-all active:scale-95"
                        >
                          Desconectar este Número
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-2">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <h4 className={`font-bold text-sm ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                          Nenhum número vinculado a este restaurante
                        </h4>
                        <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                          Escolha abaixo como deseja vincular o WhatsApp oficial de {tenantAtual?.nomeFantasia}:
                        </p>
                      </div>

                      {/* Opção 1: Vincular Número do WhatsApp Diretamente */}
                      <div className={`p-4 rounded-2xl border text-left space-y-3 max-w-md mx-auto ${
                        isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <label className={`text-xs font-bold block ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                              Vincular Número de WhatsApp (Individual da Loja)
                            </label>
                            <p className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              Digite o número com DDD que atenderá os pedidos deste restaurante.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={numeroManualInput}
                            onChange={(e) => {
                              setNumeroManualInput(e.target.value);
                              if (erroNumero) setErroNumero(null);
                            }}
                            placeholder="Ex: (31) 98765-4321"
                            className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                              isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleVincularNumeroManual}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer shrink-0 active:scale-95 transition-all"
                          >
                            Salvar Número
                          </button>
                        </div>
                        {erroNumero && (
                          <p className="text-[11px] text-rose-500 font-bold">{erroNumero}</p>
                        )}
                      </div>

                      {/* Opção 2: QR Code */}
                      <div className="pt-2 border-t border-dashed border-slate-700/40">
                        {config.qrCodeBase64 ? (
                          <div className="space-y-4 pt-3">
                            <div className="p-3 bg-white inline-block rounded-2xl shadow-xl border border-slate-300">
                              <img src={config.qrCodeBase64} alt="QR Code WhatsApp" className="w-56 h-56 mx-auto" />
                            </div>
                            <div className="space-y-1">
                              <h5 className={`font-bold text-xs ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                                Aponte a câmera do WhatsApp para o QR Code acima
                              </h5>
                              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                No celular da loja, abra <strong>Aparelhos Conectados</strong> ➔ <strong>Conectar Aparelho</strong>.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const num = tenantAtual?.telefoneWhatsApp || '(31) 98888-0000';
                                simularConexaoSucesso(tenantId, num);
                                atualizarDadosTenant(tenantId, { instanciaWhatsAppConectada: true });
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                            >
                              ✓ Confirmar Leitura do QR Code
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs text-slate-400">
                              Ou se preferir, gere um QR Code para conectar direto pelo celular:
                            </p>
                            <button
                              type="button"
                              onClick={() => gerarQRCodeConexao(tenantId)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Gerar QR Code de Conexão</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOTÃO SALVAR ALTERAÇÕES */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                {sucessoSalvar && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Configurações salvas no sistema!
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSalvarConfig}
                disabled={salvando}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                {salvando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {salvando ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUNA DIREITA: SIMULADOR DE WHATSAPP AO VIVO (ANOTA AI) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            {/* Moldura do Celular */}
            <div className={`w-full max-w-[380px] mx-auto rounded-[36px] p-3.5 shadow-2xl relative border-4 transition-colors ${
              isWhite ? 'bg-slate-200 border-slate-300 shadow-slate-300/60' : 'bg-slate-950 border-slate-800'
            }`}>
              {/* Speaker / Notch */}
              <div className={`w-28 h-4 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isWhite ? 'bg-slate-300' : 'bg-slate-900'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isWhite ? 'bg-slate-400' : 'bg-slate-950'}`} />
              </div>

              {/* TELA DO WHATSAPP (Ajustada com Cores Claras e Nítidas no Tema Claro) */}
              <div className={`rounded-[24px] overflow-hidden flex flex-col h-[560px] border transition-colors ${
                isWhite
                  ? 'bg-[#EFEAE2] border-slate-300 text-slate-900'
                  : 'bg-[#0B141A] border-slate-900 text-white'
              }`}>
                {/* Header do WhatsApp */}
                <div className={`px-3.5 py-2.5 flex items-center justify-between border-b text-white ${
                  isWhite
                    ? 'bg-[#008069] border-[#00705B]'
                    : 'bg-[#1F2C34] border-slate-800'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${
                      isWhite ? 'bg-emerald-800 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      🍔
                    </div>
                    <div>
                      <h4 className="text-xs font-bold truncate max-w-[170px] leading-tight text-white">
                        {tenantAtual?.nomeFantasia || 'Restaurante'}
                      </h4>
                      <span className={`text-[10px] font-medium block ${
                        isWhite ? 'text-emerald-100' : 'text-emerald-400'
                      }`}>
                        {estaDigitandoSimulador ? 'digitando...' : 'online'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => limparConversaSimulador(tenantId)}
                    title="Reiniciar conversa de teste"
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isWhite ? 'text-emerald-100 hover:text-white hover:bg-emerald-800/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Mensagens do Chat (Fundo com padrão WhatsApp) */}
                <div
                  className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs"
                  style={{
                    backgroundImage: isWhite
                      ? `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`
                      : `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                >
                  {/* Aviso do WhatsApp de criptografia */}
                  <div className={`p-2 rounded-lg text-[10px] text-center max-w-[90%] mx-auto leading-tight shadow-sm border ${
                    isWhite
                      ? 'bg-[#FFF5C4] border-amber-300 text-amber-900 font-medium'
                      : 'bg-[#182229] border-amber-500/20 text-amber-200/80'
                  }`}>
                    🔒 Simulação Oficial: As mensagens são processadas pela IA usando o cardápio real do restaurante.
                  </div>

                  {mensagensSimulador.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.remetente === 'cliente' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                          msg.remetente === 'cliente'
                            ? isWhite
                              ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-none border border-emerald-200/60'
                              : 'bg-[#005C4B] text-white rounded-tr-none'
                            : msg.remetente === 'humano'
                            ? isWhite
                              ? 'bg-blue-50 text-blue-950 rounded-tl-none border border-blue-200'
                              : 'bg-blue-900/90 text-white rounded-tl-none border border-blue-500/30'
                            : isWhite
                            ? 'bg-white text-[#111B21] rounded-tl-none border border-slate-200/90'
                            : 'bg-[#202C33] text-white rounded-tl-none'
                        }`}
                      >
                        {/* Nome do emissor se for bot/humano */}
                        {msg.remetente === 'bot' && (
                          <div className={`text-[9.5px] font-extrabold mb-0.5 flex items-center gap-1 ${
                            isWhite ? 'text-emerald-700' : 'text-emerald-400'
                          }`}>
                            <Bot className="w-3 h-3" /> {config.nomeRobo}
                          </div>
                        )}
                        {msg.remetente === 'humano' && (
                          <div className={`text-[9.5px] font-extrabold mb-0.5 flex items-center gap-1 ${
                            isWhite ? 'text-blue-700' : 'text-blue-300'
                          }`}>
                            👤 Atendente Humano
                          </div>
                        )}

                        {/* Texto da mensagem com cor garantida 100% nítida e legível */}
                        <div
                          className="whitespace-pre-wrap font-medium"
                          style={{
                            color: msg.remetente === 'cliente'
                              ? isWhite ? '#111B21' : '#FFFFFF'
                              : isWhite ? '#111B21' : '#F8FAFC',
                          }}
                        >
                          {msg.texto}
                        </div>

                        {/* Botão de Link do Cardápio Interativo (Anota AI Style) */}
                        {msg.linkCardapio && (
                          <div className={`mt-2 pt-2 border-t ${isWhite ? 'border-slate-200' : 'border-slate-700/60'}`}>
                            <a
                              href={msg.linkCardapio}
                              target="_blank"
                              rel="noreferrer"
                              className={`w-full py-2 px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm text-center transition-all ${
                                isWhite
                                  ? 'bg-[#008069] hover:bg-[#00705B] text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              <span>📖 Abrir Cardápio Digital</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Card de Confirmação de Pedido Rascunho */}
                        {msg.pedidoRascunho && (
                          <div className={`mt-2 p-2.5 rounded-xl border space-y-1.5 ${
                            isWhite ? 'bg-slate-50 border-emerald-300' : 'bg-slate-900/80 border-emerald-500/30'
                          }`}>
                            <div className={`text-[10px] font-bold uppercase ${isWhite ? 'text-emerald-800' : 'text-emerald-400'}`}>
                              Resumo do Pedido
                            </div>
                            {msg.pedidoRascunho.itens.map((it, i) => (
                              <div key={i} className={`flex justify-between text-[11px] ${isWhite ? 'text-slate-800' : 'text-slate-200'}`}>
                                <span>{it.quantidade}x {it.nome}</span>
                                <strong>R$ {(it.quantidade * it.preco).toFixed(2).replace('.', ',')}</strong>
                              </div>
                            ))}
                            <div className={`flex justify-between text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                              <span>Taxa de Entrega</span>
                              <span>R$ {msg.pedidoRascunho.taxaEntrega.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className={`flex justify-between text-xs font-black pt-1 border-t ${
                              isWhite ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-white'
                            }`}>
                              <span>Total</span>
                              <span className={isWhite ? 'text-emerald-700' : 'text-emerald-400'}>
                                R$ {msg.pedidoRascunho.total.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => confirmarPedidoSimulador(tenantId, msg.pedidoRascunho!)}
                              className="w-full mt-1.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                            >
                              ✓ Confirmar & Enviar para Cozinha KDS
                            </button>
                          </div>
                        )}

                        {/* Horário e Check Azul */}
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isWhite ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          <span>{msg.horario}</span>
                          {msg.remetente === 'cliente' && (
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Indicador de digitando */}
                  {estaDigitandoSimulador && (
                    <div className={`flex items-center gap-1.5 p-2 rounded-2xl rounded-tl-none max-w-[100px] ${
                      isWhite ? 'bg-white border border-slate-200 text-slate-600 shadow-sm' : 'bg-[#202C33] text-slate-400'
                    }`}>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}

                  <div ref={fimChatRef} />
                </div>

                {/* Campo de Envio de Mensagem */}
                <form
                  onSubmit={handleEnviarSimulador}
                  className={`p-2 flex items-center gap-2 border-t ${
                    isWhite ? 'bg-[#F0F2F5] border-slate-200' : 'bg-[#1F2C34] border-slate-800'
                  }`}
                >
                  <input
                    type="text"
                    value={textoInputSimulador}
                    onChange={(e) => setTextoInputSimulador(e.target.value)}
                    placeholder="Envie uma mensagem de teste..."
                    className={`flex-1 text-xs px-3 py-2 rounded-xl focus:outline-none border ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#2A3942] border-slate-700 text-white placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`p-2 rounded-xl text-white cursor-pointer transition-colors shadow-md ${
                      isWhite ? 'bg-[#008069] hover:bg-[#00705B]' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Botão de Sugestões de Teste Rápido */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => enviarMensagemSimulador(tenantId, 'Olá, qual o cardápio de vocês?')}
                  className={`px-2 py-0.5 rounded-full border text-[10px] cursor-pointer transition-colors ${
                    isWhite
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  "Ver cardápio"
                </button>
                <button
                  type="button"
                  onClick={() => enviarMensagemSimulador(tenantId, 'Qual o valor da taxa de entrega?')}
                  className={`px-2 py-0.5 rounded-full border text-[10px] cursor-pointer transition-colors ${
                    isWhite
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  "Taxa de entrega"
                </button>
                <button
                  type="button"
                  onClick={() => enviarMensagemSimulador(tenantId, 'Quero falar com atendente')}
                  className={`px-2 py-0.5 rounded-full border text-[10px] cursor-pointer transition-colors ${
                    isWhite
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  "Chamar atendente"
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
