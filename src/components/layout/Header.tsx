import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSaaSStore } from '../../store/useSaaSStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useWindowFocus } from '../../hooks/useWindowFocus';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [menuTenantAberto, setMenuTenantAberto] = useState(false);
  const [modalAtalhosAberto, setModalAtalhosAberto] = useState(false);

  const { caixaAtual, perfilAtivo, alternarPerfil } = useAppStore();
  const { getTenantAtivo, tenants, selecionarTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const { isFocused } = useWindowFocus();
  const { usuarioLogado, loginRapidoPorCargo, logout, getDescricaoCargo } = useAuthStore();
  const infoCargo = getDescricaoCargo(usuarioLogado?.cargo);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
      {/* Left: Mobile Menu Toggle & Store Switcher */}
      <div className="flex items-center gap-3">
        {/* Botão Menu Hambúrguer Mobile */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Seletor de Loja / Tenant */}
        <div className="relative">
          <button
            onClick={() => setMenuTenantAberto(!menuTenantAberto)}
            className="flex items-center gap-1.5 sm:gap-2 text-left text-xs sm:text-sm font-bold text-white hover:text-emerald-300 transition-colors p-1 rounded-lg"
          >
            <Store className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[220px]">{tenantAtual.nomeFantasia}</span>
            <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            <span
              className={`hidden md:inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                tenantAtual.statusAssinatura === 'ativo'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : tenantAtual.statusAssinatura === 'trial'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
              }`}
            >
              {tenantAtual.statusAssinatura}
            </span>
          </button>

          {menuTenantAberto && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Alternar Restaurante (Multi-Loja)
              </p>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    selecionarTenant(t.id);
                    setMenuTenantAberto(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    t.id === tenantAtual.id
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-semibold">{t.nomeFantasia}</p>
                    <p className="text-[10px] opacity-75 font-mono">{t.cidadeUf}</p>
                  </div>
                  {t.id === tenantAtual.id && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status de Foco do Sistema (Verifica se fica fora do foco) */}
        <div
          title={
            isFocused
              ? 'Sistema em foco: Teclado, atalhos e leitor de código de barras respondem imediatamente.'
              : 'Sistema fora de foco: Você está navegando em outra janela/aplicativo. O sistema continua ativo em segundo plano.'
          }
          className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
            isFocused
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-950/60 border-amber-500/30 text-amber-400 animate-pulse'
          }`}
        >
          {isFocused ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-semibold">
            {isFocused ? 'Em Foco' : 'Fora de Foco'}
          </span>
        </div>

        {/* Seletor de Perfil / Usuário Logado */}
        <div className="relative">
          <button
            onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${infoCargo.cor}`}
          >
            <span>{infoCargo.icone}</span>
            <span className="hidden sm:inline">
              {usuarioLogado?.nome.split(' ')[0]} ({infoCargo.titulo.split('(')[0].trim()})
            </span>
            <span className="sm:hidden uppercase text-[10px]">
              {usuarioLogado?.cargo.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {menuPerfilAberto && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{usuarioLogado?.nome}</p>
                <p className="text-[10px] text-slate-400 font-mono">{usuarioLogado?.email}</p>
                <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded font-bold border uppercase ${infoCargo.cor}`}>
                  {infoCargo.nivel}
                </span>
              </div>

              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simular Outro Cargo (Hierarquia)
              </p>

              {[
                { cargo: 'super_admin' as const, label: 'Dono do SaaS (Italo Lemos)', icone: '👑' },
                { cargo: 'admin_restaurante' as const, label: 'Gerente da Loja (Carlos)', icone: '👔' },
                { cargo: 'caixa' as const, label: 'Operador de Caixa (Juliana)', icone: '🛒' },
                { cargo: 'garcom' as const, label: 'Garçom / Salão (Lucas)', icone: '📱' },
                { cargo: 'cozinha' as const, label: 'Cozinha / KDS (Rodrigo)', icone: '🍳' },
              ].map((p) => (
                <button
                  key={p.cargo}
                  onClick={() => {
                    loginRapidoPorCargo(p.cargo);
                    setMenuPerfilAberto(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    usuarioLogado?.cargo === p.cargo
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{p.icone}</span>
                    <span>{p.label}</span>
                  </span>
                  {usuarioLogado?.cargo === p.cargo && <span className="text-[10px]">✓</span>}
                </button>
              ))}

              <div className="pt-2 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total do Caixa Atual */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Vendas:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              R$ {caixaAtual.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-200 text-xs font-mono font-medium bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/30">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>

        {/* Botão Atalhos */}
        <button
          onClick={() => setModalAtalhosAberto(true)}
          title="Ver Atalhos do Teclado"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
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
    </header>
  );
}
