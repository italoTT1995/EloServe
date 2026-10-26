import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ChefHat,
  Coffee,
  Crown,
  UserPlus,
  LogIn,
  Store,
  Bike,
  Shield,
  Building2,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { CargoUsuario } from '../types';
import { EloGastroLogo, EloGastroClocheIcon } from '../components/common/EloGastroLogo';

export default function Login() {
  const navigate = useNavigate();
  const { login, cadastrarNovoUsuario, getDescricaoCargo } = useAuthStore();
  const { tenants, adicionarTenant, selecionarTenant } = useSaaSStore();

  const [abaModo, setAbaModo] = useState<'login' | 'cadastro'>('login');

  // Estados de Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Estados de Cadastro de Login / Usuário
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadCargo, setCadCargo] = useState<CargoUsuario>('admin_restaurante');
  const [cadTenantId, setCadTenantId] = useState<string>('tenant-01');
  const [cadCriarNovoRestaurante, setCadCriarNovoRestaurante] = useState(false);
  const [cadNomeRestaurante, setCadNomeRestaurante] = useState('');
  const [cadCidadeRestaurante, setCadCidadeRestaurante] = useState('São Paulo - SP');
  const [cadSenha, setCadSenha] = useState('');
  const [cadPin, setCadPin] = useState('');
  const [mostrarCadSenha, setMostrarCadSenha] = useState(false);

  // Blindagem contra tema claro (evita quebra de contraste no modo luz)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const hadThemeLight = root.classList.contains('theme-light') || body.classList.contains('theme-light');

    root.classList.add('is-login-page');
    body.classList.add('is-login-page');

    if (hadThemeLight) {
      root.classList.remove('theme-light');
      body.classList.remove('theme-light');
    }

    return () => {
      root.classList.remove('is-login-page');
      body.classList.remove('is-login-page');
      if (hadThemeLight) {
        root.classList.add('theme-light');
        body.classList.add('theme-light');
      }
    };
  }, []);

  function redirecionarPorCargo(cargo?: CargoUsuario) {
    if (cargo === 'super_admin') {
      navigate('/saas');
    } else if (cargo === 'admin_restaurante') {
      navigate('/painel-dono');
    } else if (cargo === 'cozinha') {
      navigate('/kds');
    } else if (cargo === 'garcom') {
      navigate('/mesas');
    } else if (cargo === 'entregador') {
      navigate('/delivery');
    } else {
      navigate('/pdv');
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    setTimeout(() => {
      const res = login(email, senha);
      setCarregando(false);
      if (res.sucesso) {
        if (res.usuario?.tenantId && res.usuario.tenantId !== 'global') {
          selecionarTenant(res.usuario.tenantId);
        }
        redirecionarPorCargo(res.usuario?.cargo);
      } else {
        setErro(res.mensagem || 'Credenciais inválidas. Verifique seu e-mail e senha/PIN.');
      }
    }, 350);
  }

  function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    setTimeout(() => {
      let finalTenantId = cadTenantId;

      // Se for Dono/Gerente e optou por criar novo restaurante
      if (cadCargo === 'admin_restaurante' && cadCriarNovoRestaurante) {
        const nomeRestLimpo = cadNomeRestaurante.trim();
        if (!nomeRestLimpo) {
          setErro('Informe o nome do novo restaurante.');
          setCarregando(false);
          return;
        }

        const novoRestaurante = adicionarTenant({
          nomeFantasia: nomeRestLimpo,
          razaoSocial: `${nomeRestLimpo} Gastronomia LTDA`,
          documento: '12.345.678/0001-90',
          responsavelNome: cadNome.trim(),
          telefoneWhatsApp: '+55 (11) 99999-8888',
          email: cadEmail.trim().toLowerCase(),
          cidadeUf: cadCidadeRestaurante.trim() || 'São Paulo - SP',
          planoId: 'pro',
          statusAssinatura: 'ativo',
          valorMensalidade: 199.90,
          dataInicio: new Date().toLocaleDateString('pt-BR'),
          proximoVencimento: 'Mensal',
          instanciaWhatsAppConectada: false,
          couvertArtisticoAtivo: false,
          valorCouvertPorPessoa: 10.0,
          valorCouvertPorComanda: 10.0,
          diasAoVivo: [],
        });

        finalTenantId = novoRestaurante.id;
        selecionarTenant(finalTenantId);
      } else if (cadCargo === 'super_admin') {
        finalTenantId = 'global';
        selecionarTenant('global');
      } else {
        selecionarTenant(finalTenantId);
      }

      const res = cadastrarNovoUsuario({
        nome: cadNome,
        email: cadEmail,
        cargo: cadCargo,
        tenantId: finalTenantId,
        pin: cadPin,
        senha: cadSenha || cadPin,
        fazerLoginAposCadastro: true,
      });

      setCarregando(false);

      if (res.sucesso && res.usuario) {
        setSucesso(`Login criado com sucesso! Entrando como ${res.usuario.nome}...`);
        setTimeout(() => {
          redirecionarPorCargo(res.usuario?.cargo);
        }, 600);
      } else {
        setErro(res.mensagem || 'Não foi possível criar o login. Verifique os dados informados.');
      }
    }, 450);
  }

  function preencherAcessoRapido(emailDemo: string, senhaDemo: string) {
    setEmail(emailDemo);
    setSenha(senhaDemo);
    setErro(null);
    setSucesso(null);
  }

  function gerarPinAleatorio() {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setCadPin(pin);
  }

  // Lista de cargos para o seletor visual de hierarquias
  const CARGOS_HIERARQUIA: { cargo: CargoUsuario; icone: string; cor: string }[] = [
    { cargo: 'super_admin', icone: '👑', cor: 'purple' },
    { cargo: 'admin_restaurante', icone: '👔', cor: 'emerald' },
    { cargo: 'caixa', icone: '🛒', cor: 'blue' },
    { cargo: 'garcom', icone: '📱', cor: 'amber' },
    { cargo: 'cozinha', icone: '🍳', cor: 'rose' },
    { cargo: 'entregador', icone: '🛵', cor: 'cyan' },
  ];

  const infoCargoSelecionado = getDescricaoCargo(cadCargo);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden select-none bg-[#090D1A]">
      {/* 1. Imagem de Fundo Gourmet */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-100 transition-transform duration-1000"
        style={{ backgroundImage: "url('/images/elogastro-hero.png')" }}
      />

      {/* 2. Gradiente Vignette para Contraste e Imersão */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/90 z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* 3. Header Flutuante Minimalista */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="lg:hidden flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
            <EloGastroLogo variant="horizontal" size="sm" theme="dark" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-semibold text-white">Ambiente Seguro & Multi-Tenant</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-mono text-slate-300 text-[10px] hidden sm:inline">Controle de Hierarquias Ativo</span>
        </div>
      </header>

      {/* 4. Conteúdo Principal: Caixa de Login / Cadastro */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-end px-4 sm:px-8 lg:px-14 xl:px-20 py-6">
        <div
          className={`w-full ${
            abaModo === 'cadastro' ? 'max-w-[540px]' : 'max-w-[440px]'
          } bg-slate-950/90 border border-slate-700/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 relative overflow-hidden transition-all duration-300`}
        >
          {/* Top Luminous Accent Line em Laranja Oficial #FF6B00 */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-95" />

          {/* Header do Card com o Cloche Oficial */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center mb-2 transform hover:scale-105 transition-transform duration-300">
              <EloGastroClocheIcon size={46} color="#FF6B00" />
            </div>

            <div className="flex items-baseline justify-center font-black tracking-tight leading-none mb-1">
              <span
                className="text-[#FF6B00] font-black text-2xl select-none italic mr-0.5"
                style={{ letterSpacing: '-0.03em' }}
              >
                elo
              </span>
              <span className="text-white font-extrabold text-2xl tracking-tight select-none">
                Gastrô
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {abaModo === 'login'
                ? 'Entre com suas credenciais ou PIN de segurança para acessar.'
                : 'Crie um novo login com nível de acesso e hierarquia no sistema.'}
            </p>
          </div>

          {/* Seletor de Modo: [Entrar] x [Criar Novo Login] */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAbaModo('login');
                setErro(null);
                setSucesso(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaModo === 'login'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white shadow-md shadow-[#FF6B00]/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acessar Conta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAbaModo('cadastro');
                setErro(null);
                setSucesso(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaModo === 'cadastro'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white shadow-md shadow-[#FF6B00]/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Novo Login</span>
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {erro && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{sucesso}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODO 1: LOGIN TRADICIONAL                                       */}
          {/* ============================================================== */}
          {abaModo === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1 tracking-wide">
                  E-mail de Acesso
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gerente@eloserve.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-200 tracking-wide">
                    Senha ou PIN Rápido
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">PIN 4 dígitos ou senha</span>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-600 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white text-[11px]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-900 border-slate-700 text-[#FF6B00] focus:ring-0 accent-[#FF6B00]"
                  />
                  <span>Manter conectado neste terminal</span>
                </label>
              </div>

              {/* Botão de Entrada em Laranja Oficial #FF6B00 */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-2 group"
              >
                {carregando ? (
                  <span>Validando Credenciais...</span>
                ) : (
                  <>
                    <span>Entrar no eloGastrô</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Atalhos Rápidos para Testar as 6 Hierarquias */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                    Testar Hierarquias com 1 Clique
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Simulador</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('master@eloserve.com.br', '8899')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">👑</span>
                      <span className="text-[9px] font-mono text-purple-400 font-bold">Nível 1</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-purple-300 truncate">Admin Master</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 8899</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('gerente@eloserve.com.br', '1234')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">👔</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Nível 2</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-emerald-300 truncate">Dono / Gerente</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 1234</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('caixa@eloserve.com.br', '2233')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">🛒</span>
                      <span className="text-[9px] font-mono text-blue-400 font-bold">Nível 3</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-blue-300 truncate">Caixa (PDV)</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 2233</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('garcom@eloserve.com.br', '3344')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">📱</span>
                      <span className="text-[9px] font-mono text-amber-400 font-bold">Nível 4</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">Garçom (Salão)</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 3344</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('cozinha@eloserve.com.br', '5566')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">🍳</span>
                      <span className="text-[9px] font-mono text-rose-400 font-bold">Nível 5</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-rose-300 truncate">Cozinha (KDS)</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 5566</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => preencherAcessoRapido('entregador@eloserve.com.br', '7788')}
                    className="flex flex-col p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-xs">🛵</span>
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">Nível 5</span>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate">Entregador</span>
                    <span className="text-[9px] text-slate-500 font-mono">PIN: 7788</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ============================================================== */
            /* MODO 2: CRIAR NOVO LOGIN / CADASTRO COM HIERARQUIAS             */
            /* ============================================================== */
            <form onSubmit={handleCadastro} className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1 scrollbar-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Nome Completo <span className="text-[#FF6B00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cadNome}
                    onChange={(e) => setCadNome(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    E-mail Corporativo <span className="text-[#FF6B00]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                    placeholder="carlos@restaurante.com"
                    className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {/* Seletor de Hierarquia / Cargo */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5 flex items-center justify-between">
                  <span>Hierarquia de Acesso & Cargo <span className="text-[#FF6B00]">*</span></span>
                  <span className="text-[10px] font-mono text-amber-400">Definição de Permissões</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CARGOS_HIERARQUIA.map((item) => {
                    const desc = getDescricaoCargo(item.cargo);
                    const ativo = cadCargo === item.cargo;
                    return (
                      <button
                        key={item.cargo}
                        type="button"
                        onClick={() => {
                          setCadCargo(item.cargo);
                          if (item.cargo === 'super_admin') {
                            setCadTenantId('global');
                            setCadCriarNovoRestaurante(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          ativo
                            ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white ring-1 ring-[#FF6B00]/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-sm">{item.icone}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            ativo ? 'bg-[#FF6B00] text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {desc.nivel.split(' ')[0]} {desc.nivelNumero}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold leading-tight block truncate">
                          {desc.titulo.split('/')[0].split('(')[0].trim()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Card explicativo do cargo selecionado */}
                <div className={`mt-2 p-2.5 rounded-xl border text-xs ${infoCargoSelecionado.cor} space-y-1`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>{infoCargoSelecionado.icone}</span>
                      <span>{infoCargoSelecionado.titulo}</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-80">{infoCargoSelecionado.nivel}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {infoCargoSelecionado.descricao}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {infoCargoSelecionado.modulosPermitidos.map((m) => (
                      <span key={m} className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-mono text-slate-300">
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vínculo de Estabelecimento / Restaurante */}
              {cadCargo !== 'super_admin' && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Estabelecimento / Restaurante</span>
                    </label>

                    {cadCargo === 'admin_restaurante' && (
                      <button
                        type="button"
                        onClick={() => setCadCriarNovoRestaurante(!cadCriarNovoRestaurante)}
                        className="text-[10px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                      >
                        {cadCriarNovoRestaurante ? 'Usar Restaurante Existente' : '+ Cadastrar Novo Restaurante'}
                      </button>
                    )}
                  </div>

                  {cadCriarNovoRestaurante && cadCargo === 'admin_restaurante' ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        required
                        value={cadNomeRestaurante}
                        onChange={(e) => setCadNomeRestaurante(e.target.value)}
                        placeholder="Nome Fantasia (ex: Cantina di Napoli)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
                      />
                      <input
                        type="text"
                        value={cadCidadeRestaurante}
                        onChange={(e) => setCadCidadeRestaurante(e.target.value)}
                        placeholder="Cidade - UF (ex: Belo Horizonte - MG)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  ) : (
                    <select
                      value={cadTenantId}
                      onChange={(e) => setCadTenantId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nomeFantasia} ({t.cidadeUf})
                        </option>
                      ))}
                      {tenants.length === 0 && (
                        <option value="tenant-01">Restaurante Principal (Matriz)</option>
                      )}
                    </select>
                  )}
                </div>
              )}

              {/* Credenciais: Senha e PIN de 4 dígitos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-200">
                      PIN Rápido (4 dígitos) <span className="text-[#FF6B00]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={gerarPinAleatorio}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Gerar
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={cadPin}
                      onChange={(e) => setCadPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={mostrarCadSenha ? 'text' : 'password'}
                      value={cadSenha}
                      onChange={(e) => setCadSenha(e.target.value)}
                      placeholder="Opcional (ou usa o PIN)"
                      className="w-full pl-9 pr-9 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarCadSenha(!mostrarCadSenha)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {mostrarCadSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão de Cadastro */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-3 group"
              >
                {carregando ? (
                  <span>Criando Acesso e Configurando...</span>
                ) : (
                  <>
                    <span>Criar Login & Entrar Imediatamente</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Selos de Segurança e Confiabilidade */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Hierarquia Multi-Nível</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Isolamento por Loja</span>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer Corporativo */}
      <footer className="relative z-10 w-full py-3 text-center pointer-events-none px-4">
        <p className="text-[11px] text-slate-400/90 font-medium drop-shadow-md">
          © {new Date().getFullYear()} eloGastrô • Gestão completa para o seu restaurante. Tudo conectado à sua mesa.
        </p>
      </footer>
    </div>
  );
}
