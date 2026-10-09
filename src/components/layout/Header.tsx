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
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const { caixaAtual, perfilAtivo, operadorAtivo, alternarPerfil } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
      {/* Left: Store Name & Terminal ID */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Restaurante & Bar EloServe</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold">
              PDV Balcão #01
            </span>
          </h2>
        </div>
      </div>

      {/* Right Indicators */}
      <div className="flex items-center gap-3.5">
        {/* Seletor de Perfil / Permissão */}
        <div className="relative">
          <button
            onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              perfilAtivo === 'admin'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : perfilAtivo === 'caixa'
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {perfilAtivo === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>
              {perfilAtivo === 'admin'
                ? 'Modo Admin'
                : perfilAtivo === 'caixa'
                ? 'Modo Caixa'
                : 'Modo Garçom'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {menuPerfilAberto && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Alternar Perfil de Acesso
              </p>
              <button
                onClick={() => {
                  alternarPerfil('admin');
                  setMenuPerfilAberto(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  perfilAtivo === 'admin'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Administrador (Total)</span>
                {perfilAtivo === 'admin' && <span className="text-[10px]">✓</span>}
              </button>

              <button
                onClick={() => {
                  alternarPerfil('caixa');
                  setMenuPerfilAberto(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  perfilAtivo === 'caixa'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Operador de Caixa</span>
                {perfilAtivo === 'caixa' && <span className="text-[10px]">✓</span>}
              </button>

              <button
                onClick={() => {
                  alternarPerfil('garcom');
                  setMenuPerfilAberto(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  perfilAtivo === 'garcom'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>Garçom (Salão)</span>
                {perfilAtivo === 'garcom' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Total do Caixa Atual */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-slate-300 font-medium">Vendas Hoje:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              R$ {caixaAtual.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Realtime Status */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[11px]">Online</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 text-slate-200 text-xs font-mono font-medium bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/30">
          <Clock className="w-3.5 h-3.5 text-slate-300" />
          <span>{time}</span>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            title="Atalhos do Teclado (F1-F12)"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            title="Notificações"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
