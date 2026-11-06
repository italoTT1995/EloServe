import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Clock,
  Wifi,
  DollarSign,
  HelpCircle,
  Bell,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  Eye,
  EyeOff,
  Store,
  LogOut,
  Globe,
  Crown,
  TrendingUp,
  Sun,
  Moon,
  Activity,
  Headphones,
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSaaSStore } from '../../store/useSaaSStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useWindowFocus } from '../../hooks/useWindowFocus';
import { BotaoInstalarPWA } from '../common/BotaoInstalarPWA';
import { TenantRestaurante } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [menuTenantAberto, setMenuTenantAberto] = useState(false);
  const [modalAtalhosAberto, setModalAtalhosAberto] = useState(false);
  const [modalSuporteAberto, setModalSuporteAberto] = useState(false);
  const [formSuporte, setFormSuporte] = useState({
    categoria: 'duvida' as 'caixa' | 'kds' | 'pedidos' | 'duvida' | 'urgente',
    descricao: '',
    prioridade: 'normal' as 'normal' | 'urgente',
    telefoneWhatsApp: '',
  });
  const [toastSuporte, setToastSuporte] = useState<string | null>(null);

  const { caixaAtual } = useAppStore();
  const { getTenantAtivo, tenants, selecionarTenant, tenantAtivoId, getMRR } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const lojasClientes: TenantRestaurante[] = useMemo(() => tenants.filter((t: TenantRestaurante) => t.id !== 'global' && !t.naLixeira), [tenants]);
  const { isFocused } = useWindowFocus();
  const { usuarioLogado, logout, getDescricaoCargo } = useAuthStore();
  const infoCargo = getDescricaoCargo(usuarioLogado?.cargo);
  const isSuperAdmin = usuarioLogado?.cargo === 'super_admin';
  const isModoGlobal = tenantAtivoId === 'global';
  const mrr = getMRR();
  const { tema, alternarTema, setTema } = useThemeStore();
  const isWhite = tema === 'light';

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`h-16 px-4 sm:px-6 sticky top-0 z-30 transition-all ${
      isWhite ? 'bg-white/95 border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]' : 'bg-slate-900/95 border-b border-slate-800'
    } backdrop-blur-md flex items-center justify-between select-none`}>
      {/* Left: Mobile Menu Toggle & Store Switcher */}
      <div className="flex items-center gap-3">
        {/* Botão Menu Hambúrguer Mobile */}
        <button
          onClick={onToggleSidebar}
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            isWhite ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Seletor de Loja / Tenant */}
        {isSuperAdmin ? (
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setMenuTenantAberto(!menuTenantAberto)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isWhite
                  ? 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200 text-slate-800 shadow-xs'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-white'
              }`}
            >
              {isModoGlobal ? (
                <>
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-500/20">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                        <span className="text-[#FF6B00] italic">elo</span>Gastrô
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] border border-orange-200 dark:border-orange-500/30">
                        MASTER
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {lojasClientes.length === 0 ? '0 Restaurantes' : `${lojasClientes.length} ${lojasClientes.length === 1 ? 'Restaurante' : 'Restaurantes Assinantes'}`}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0 text-slate-400 ml-0.5" />
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight truncate max-w-[130px] sm:max-w-[180px] text-slate-900 dark:text-white">
                        {tenantAtual.nomeFantasia}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
                        tenantAtual.statusAssinatura === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-500/30'
                          : tenantAtual.statusAssinatura === 'trial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-500/30'
                          : 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-500/30'
                      }`}>
                        {tenantAtual.statusAssinatura}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Inspecionando Loja
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0 text-slate-400 ml-0.5" />
                </>
              )}
            </button>

            {/* Botão de Acesso Rápido para Operar a Loja diretamente */}
            {isModoGlobal && lojasClientes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  selecionarTenant(lojasClientes[0].id);
                  navigate('/painel-dono');
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isWhite
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                }`}
                title={`Acessar ${lojasClientes[0].nomeFantasia} no modo de gestão do restaurante`}
              >
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>Operar {lojasClientes[0].nomeFantasia}</span>
              </button>
            )}

            {menuTenantAberto && (
              <div className={`absolute left-0 mt-2 w-72 ${
                isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-700'
              } border rounded-2xl p-2 shadow-2xl z-50 space-y-1.5 animate-in fade-in duration-100`}>
                <p className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isWhite ? 'text-[#FF6B00]' : 'text-orange-400'
                }`}>
                  <Crown className="w-3 h-3 text-[#FF6B00]" />
                  <span>Ambiente Super Admin (Dono do SaaS)</span>
                </p>

                {/* Atalho Direto: Torre de Monitoramento & Suporte ao Vivo */}
                <button
                  type="button"
                  onClick={() => {
                    selecionarTenant('global');
                    setMenuTenantAberto(false);
                    navigate('/saas?aba=suporte_ao_vivo');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FF6B00] animate-pulse" />
                    <div>
                      <p className="font-bold text-white text-xs">Torre de Monitoramento & Suporte</p>
                      <p className="text-[10px] text-orange-300">Ver o que as lojas fazem e atender suporte</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 font-bold uppercase">
                    Ao Vivo
                  </span>
                </button>

                {/* Opção 1: Visão Global SaaS */}
                <button
                  onClick={() => {
                    selecionarTenant('global');
                    setMenuTenantAberto(false);
                    navigate('/saas');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isModoGlobal
                      ? 'bg-[#FF6B00] !text-white font-bold shadow-md shadow-[#FF6B00]/30'
                      : isWhite
                      ? 'text-slate-900 bg-orange-50 hover:bg-orange-100 border border-orange-200'
                      : 'text-slate-200 bg-[#0F172A] hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isModoGlobal
                        ? 'bg-white/20 !text-white'
                        : isWhite
                        ? 'bg-orange-100 text-[#FF6B00]'
                        : 'bg-[#FF6B00]/20 text-[#FF6B00]'
                    }`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold"><span className="text-[#FF6B00] font-black italic">elo</span>Gastrô</p>
                      <p className={`text-[10px] ${isModoGlobal ? '!text-white/80' : isWhite ? 'text-slate-600' : 'opacity-80'}`}>
                        Administração de todos os restaurantes
                      </p>
                    </div>
                  </div>
                  {isModoGlobal && <span className="text-xs font-bold !text-white">✓</span>}
                </button>

                <div className={`pt-2 pb-1 border-t ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
                  <p className={`px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                    isWhite ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <span>Inspecionar Loja Cliente</span>
                    <span className={`text-[9px] font-mono font-bold ${
                      isWhite ? 'text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded' : 'text-amber-400/90'
                    }`}>Modo Suporte</span>
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {lojasClientes.length === 0 ? (
                    <div className="py-4 px-3 text-center">
                      <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                        Nenhum restaurante cliente cadastrado ainda.
                      </p>
                    </div>
                  ) : (
                    lojasClientes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          selecionarTenant(t.id);
                          setMenuTenantAberto(false);
                          navigate('/painel-dono');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          t.id === tenantAtivoId
                            ? isWhite
                              ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                              : 'bg-amber-500 text-slate-950 font-bold'
                            : isWhite
                            ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold truncate">{t.nomeFantasia}</span>
                            <span
                              className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                t.statusAssinatura === 'ativo'
                                  ? isWhite
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : t.statusAssinatura === 'trial'
                                  ? isWhite
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                  : isWhite
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {t.statusAssinatura}
                            </span>
                          </div>
                          <p className={`text-[10px] font-mono ${isWhite ? 'text-slate-500' : 'opacity-75'}`}>
                            {t.cidadeUf} • {t.planoId.toUpperCase()}
                          </p>
                        </div>
                        {t.id === tenantAtivoId && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Usuário de restaurante (Gerente, Caixa, Garçom, Cozinha): Vê apenas a sua loja */
          <div className="flex items-center gap-2 text-left text-xs sm:text-sm font-bold p-1">
            <Store className={`w-4 h-4 ${isWhite ? 'text-emerald-700' : 'text-emerald-400'} shrink-0`} />
            <span className={`truncate max-w-[130px] sm:max-w-[220px] ${isWhite ? 'text-slate-900 font-bold' : 'text-white'}`}>{tenantAtual.nomeFantasia}</span>
            <span
              className={`hidden md:inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                tenantAtual.statusAssinatura === 'ativo'
                  ? isWhite
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : tenantAtual.statusAssinatura === 'trial'
                  ? isWhite
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  : isWhite
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
              }`}
            >
              {tenantAtual.statusAssinatura}
            </span>
          </div>
        )}
      </div>

      {/* Right Indicators & Toolbar Moderna */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Alerta de Chamados de Suporte para o Master */}
        {isSuperAdmin && useSaaSStore.getState().getChamadosAbertos().length > 0 && (
          <Link
            to="/saas?aba=suporte_ao_vivo"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 text-xs font-black shadow-md shadow-rose-600/25 animate-pulse transition-all"
            title="Clique para atender o chamado de suporte do restaurante!"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px]">{useSaaSStore.getState().getChamadosAbertos().length} Suporte</span>
          </Link>
        )}

        {/* Botão de Solicitar Suporte ao Admin Master para Restaurantes */}
        {usuarioLogado?.cargo !== 'super_admin' && (
          <button
            type="button"
            onClick={() => setModalSuporteAberto(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isWhite
                ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/50'
            }`}
            title="Precisa de suporte? Clique para chamar o Franqueador Master!"
          >
            <Headphones className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline text-[11px]">Suporte</span>
          </button>
        )}

        {/* Alternador Rápido de Visão: Painel do Dono vs Frente de Caixa */}
        {usuarioLogado?.cargo === 'admin_restaurante' && (
          <div className={`hidden md:flex items-center ${isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} p-0.5 rounded-xl border text-xs`}>
            <Link
              to="/painel-dono"
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/painel-dono' || location.pathname === '/'
                  ? 'bg-emerald-600 !text-white shadow-xs'
                  : isWhite
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir Painel de Gestão do Dono"
            >
              <span>📊</span>
              <span>Painel</span>
            </Link>
            <Link
              to="/pdv"
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/pdv'
                  ? 'bg-emerald-600 !text-white shadow-xs'
                  : isWhite
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir Frente de Caixa (PDV)"
            >
              <Store className="w-3.5 h-3.5" />
              <span>PDV</span>
            </Link>
          </div>
        )}

        {/* Métrica MRR do SaaS (Master) ou Total do Caixa (Restaurante) */}
        {isSuperAdmin && isModoGlobal ? (
          <div
            title="Receita Recorrente Mensal (MRR) de todos os restaurantes clientes"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isWhite
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-[10px] text-slate-500 dark:text-slate-400 font-medium">MRR:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-sans text-[10px] text-slate-400">/mês</span>
            </div>
          </div>
        ) : (
          <div
            title="Total de vendas do caixa atual"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isWhite
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-800/50 border-slate-700 text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-[10px] text-slate-500 font-medium">Caixa:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                R$ {caixaAtual.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Divisor vertical sutil */}
        <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Status de Foco (Ponto Moderno Pulsante) */}
        <div
          title={
            isFocused
              ? 'Sistema conectado e em foco: Teclado e leitor de código de barras ativos.'
              : 'Sistema em segundo plano.'
          }
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400"
        >
          <span className="relative flex h-2 w-2">
            {isFocused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isFocused ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[11px] font-medium hidden xl:inline">
            {isFocused ? 'Em Foco' : 'Segundo Plano'}
          </span>
        </div>

        {/* Relógio Digital Monospace */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium px-2 py-1 text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>

        {/* Divisor vertical sutil */}
        <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Botão de Instalação do App PWA */}
        <BotaoInstalarPWA />

        {/* Botão Tema Claro / Escuro Minimalista */}
        <button
          onClick={alternarTema}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 ${
            isWhite
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 shadow-xs'
              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
          }`}
          title={tema === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
        >
          {tema === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Botão Atalhos de Teclado */}
        <button
          onClick={() => setModalAtalhosAberto(true)}
          title="Ver Atalhos do Teclado"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer active:scale-95 ${
            isWhite
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 shadow-xs'
              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Divisor vertical antes do perfil */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Seletor de Perfil / Usuário Logado */}
        <div className="relative">
          <button
            onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
            className={`flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all text-xs cursor-pointer ${
              isWhite
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF6B00] to-purple-600 text-white flex items-center justify-center text-[11px] font-black shadow-xs shrink-0">
              {usuarioLogado?.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight truncate max-w-[110px] text-slate-900 dark:text-white">
                {usuarioLogado?.nome ? usuarioLogado.nome.split(' ')[0] : 'Usuário'}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                {isSuperAdmin ? 'Dono do SaaS' : infoCargo.titulo.split('(')[0].trim()}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {menuPerfilAberto && (
            <div className={`absolute right-0 mt-2 w-64 ${
              isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            } border rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100`}>
              <div className={`px-3 py-2 border-b ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
                <p className={`text-xs font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>{usuarioLogado?.nome}</p>
                <p className={`text-[10px] ${isWhite ? 'text-slate-500' : 'text-slate-400'} font-mono`}>{usuarioLogado?.email}</p>
                <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded font-bold border uppercase ${infoCargo.cor}`}>
                  {infoCargo.nivel}
                </span>
              </div>

              {/* Opção de White Color / Dark Mode dentro do menu */}
              <div className={`px-3 py-2 border-b ${isWhite ? 'border-slate-100' : 'border-slate-800'} flex items-center justify-between`}>
                <span className={`text-[11px] font-bold ${isWhite ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                  {tema === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Aparência</span>
                </span>
                <div className={`flex items-center ${isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} p-0.5 rounded-lg border text-[10px] font-bold`}>
                  <button
                    type="button"
                    onClick={() => setTema('light')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      tema === 'light' ? 'bg-white text-slate-900 shadow-sm' : isWhite ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setTema('dark')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      tema === 'dark' ? 'bg-slate-800 !text-white shadow-sm' : isWhite ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Gerenciamento de Logins (Dono / Super Admin) */}
              {(usuarioLogado?.cargo === 'admin_restaurante' || usuarioLogado?.cargo === 'super_admin') && (
                <div className={`px-2 py-1 border-b ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
                  <Link
                    to="/funcionarios?aba=logins"
                    onClick={() => setMenuPerfilAberto(false)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 font-bold transition-colors cursor-pointer ${
                      isWhite ? 'text-amber-800 hover:bg-amber-50' : 'text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Logins & Hierarquias</span>
                  </Link>
                </div>
              )}

              <div className={`pt-2 mt-1 border-t ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 font-bold transition-colors cursor-pointer ${
                    isWhite ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    {/* Modal de Atalhos do Teclado */}
      {modalAtalhosAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Atalhos Rápidos de Teclado</h3>
              <button
                onClick={() => setModalAtalhosAberto(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Frente de Caixa (PDV)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">F1</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Mesas & Salão</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">F2</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Cozinha (KDS)</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">F3</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Focar Barra de Busca</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">/</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">Finalizar / Receber Venda</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">F9</kbd>
              </div>
            </div>

            <button
              onClick={() => setModalAtalhosAberto(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    
      {/* Modal de Solicitação de Suporte ao Franqueador Master */}
      {modalSuporteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Solicitar Suporte ao Master</h3>
                  <p className="text-xs text-purple-300 font-semibold">{tenantAtual.nomeFantasia}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSuporteAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formSuporte.descricao.trim()) return;

                useSaaSStore.getState().abrirChamadoSuporte({
                  tenantId: tenantAtual.id,
                  tenantNome: tenantAtual.nomeFantasia,
                  solicitanteNome: usuarioLogado?.nome || 'Operador',
                  solicitanteCargo: usuarioLogado?.cargo || 'gerente',
                  telefoneContato: formSuporte.telefoneWhatsApp || tenantAtual.telefoneWhatsApp || '',
                  categoria: formSuporte.categoria,
                  descricao: formSuporte.descricao.trim(),
                  prioridade: formSuporte.prioridade,
                });

                setModalSuporteAberto(false);
                setFormSuporte({
                  categoria: 'duvida',
                  descricao: '',
                  prioridade: 'normal',
                  telefoneWhatsApp: '',
                });
                setToastSuporte('Chamado de suporte enviado com sucesso! O Admin Master foi notificado.');
                setTimeout(() => setToastSuporte(null), 5000);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-slate-300 font-bold block mb-1">Qual a área do problema ou dúvida?</label>
                <select
                  value={formSuporte.categoria}
                  onChange={(e) => setFormSuporte({ ...formSuporte, categoria: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:border-purple-500 focus:outline-none"
                >
                  <option value="duvida">❓ Dúvida de Operação / Treinamento</option>
                  <option value="caixa">🛒 Frente de Caixa / Fechamento de Venda</option>
                  <option value="kds">🍳 Cozinha & Bar (KDS) / Pedidos</option>
                  <option value="pedidos">🪑 Mesas, Comandas ou Delivery</option>
                  <option value="urgente">🚨 Problema Crítico / Travamento</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">WhatsApp para Contato / Retorno:</label>
                <input
                  type="text"
                  value={formSuporte.telefoneWhatsApp}
                  onChange={(e) => setFormSuporte({ ...formSuporte, telefoneWhatsApp: e.target.value })}
                  placeholder={tenantAtual.telefoneWhatsApp || "Ex: (DDD) 99999-9999"}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Descreva o que está acontecendo *</label>
                <textarea
                  rows={3}
                  required
                  value={formSuporte.descricao}
                  onChange={(e) => setFormSuporte({ ...formSuporte, descricao: e.target.value })}
                  placeholder="Explique o que precisa de ajuda para que o Franqueador Master possa te auxiliar..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="text-slate-300 font-bold">Nível de Urgência:</label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="prioridade"
                    checked={formSuporte.prioridade === 'normal'}
                    onChange={() => setFormSuporte({ ...formSuporte, prioridade: 'normal' })}
                    className="accent-purple-500"
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center gap-1.5 text-rose-400 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="prioridade"
                    checked={formSuporte.prioridade === 'urgente'}
                    onChange={() => setFormSuporte({ ...formSuporte, prioridade: 'urgente' })}
                    className="accent-rose-500"
                  />
                  <span>🚨 Urgente</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSuporteAberto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold shadow-lg shadow-[#FF6B00]/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Chamado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de Notificação de Suporte */}
      {toastSuporte && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastSuporte}</span>
        </div>
      )}
    </header>
  );
}
