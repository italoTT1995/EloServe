import { NavLink } from 'react-router-dom';
import {
  Store,
  LayoutGrid,
  ChefHat,
  BookOpen,
  DollarSign,
  TrendingUp,
  Bot,
  Zap,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Frente de Caixa (PDV)', icon: Store, badge: 'F1' },
  { path: '/mesas', label: 'Mesas & Salão', icon: LayoutGrid, badge: 'F2' },
  { path: '/kds', label: 'Cozinha (KDS)', icon: ChefHat, badge: 'F3' },
  { path: '/cardapio', label: 'Cardápio & Itens', icon: BookOpen },
  { path: '/caixa', label: 'Controle de Caixa', icon: DollarSign },
  { path: '/relatorios', label: 'Faturamento & DRE', icon: TrendingUp },
  { path: '/elobot', label: 'EloBot (WhatsApp IA)', icon: Bot, highlight: true },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              EloServe
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              PDV Inteligente
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
          Operação
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                } ${item.highlight && !isActive ? 'border border-emerald-500/30 text-emerald-300 bg-emerald-950/20' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
              IT
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">Italo Lemos</p>
              <p className="text-[10px] text-emerald-400 font-medium">Caixa Aberto</p>
            </div>
          </div>
          <button
            title="Sair do Caixa"
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
