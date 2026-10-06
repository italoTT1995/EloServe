import { useState, useEffect } from 'react';
import {
  Clock,
  Wifi,
  DollarSign,
  Maximize2,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const { caixaAtual } = useAppStore();

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
      <div className="flex items-center gap-4">
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
