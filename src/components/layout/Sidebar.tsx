import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Store,
  LayoutGrid,
  ChefHat,
  BookOpen,
  DollarSign,
  TrendingUp,
  Bot,
  Zap,
  LogOut,
  X,
  CreditCard,
  Crown,
  Sliders,
  Layers,
  ShieldCheck,
  Bike,
  Package,
  Users,
  BarChart3,
  Megaphone,
  History,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { CargoUsuario } from '../../types';

interface MenuItemDef {
  path: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
  adminDestaque?: boolean;
  cargos: CargoUsuario[];
}

const menuItemsOperacao: MenuItemDef[] = [
  { path: '/', label: 'Frente de Caixa (PDV)', icon: Store, badge: 'F1', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/mesas', label: 'Mesas & Salão', icon: LayoutGrid, badge: 'F2', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/delivery', label: 'Delivery & Entregas', icon: Bike, badge: 'F3', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'entregador'] },
  { path: '/kds', label: 'Cozinha (KDS)', icon: ChefHat, badge: 'F4', cargos: ['super_admin', 'admin_restaurante', 'cozinha'] },
  { path: '/estoque', label: 'Estoque Inteligente', icon: Package, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/cardapio', label: 'Cardápio & Itens', icon: BookOpen, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/funcionarios', label: 'Funcionários & RH', icon: Users, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/caixa', label: 'Controle de Caixa', icon: DollarSign, cargos: ['super_admin', 'admin_restaurante', 'caixa'] },
  { path: '/relatorios', label: 'Faturamento & DRE', icon: TrendingUp, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/elobot', label: 'EloBot (WhatsApp IA)', icon: Bot, highlight: true, cargos: ['super_admin', 'admin_restaurante'] },
];

const menuItemsSaaS: MenuItemDef[] = [
  { path: '/minha-assinatura', label: 'Minha Assinatura', icon: CreditCard, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/saas', label: 'Gestão SaaS Master', icon: Crown, badge: 'SaaS', adminDestaque: true, cargos: ['super_admin'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioLogado, logout, temPermissao, getDescricaoCargo } = useAuthStore();
  const infoCargo = getDescricaoCargo(usuarioLogado?.cargo);

  function handleLogout() {
    logout();
    navigate('/login');
  }
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <Link
          to={usuarioLogado?.cargo === 'super_admin' ? '/saas' : '/'}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 ${
              usuarioLogado?.cargo === 'super_admin'
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/25'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-emerald-500/20'
            }`}
          >
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              EloServe
            </h1>
            <p
              className={`text-[10px] font-semibold tracking-wider uppercase ${
                usuarioLogado?.cargo === 'super_admin' ? 'text-purple-400' : 'text-emerald-400'
              }`}
            >
              {usuarioLogado?.cargo === 'super_admin' ? 'Gestão SaaS Master' : 'PDV Inteligente'}
            </p>
          </div>
        </Link>

        {/* Botão fechar apenas no mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* SE FOR SUPER ADMIN (DONO DO SAAS): MENU EXCLUSIVO DE ADMINISTRAÇÃO */}
        {usuarioLogado?.cargo === 'super_admin' ? (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Administração SaaS Master</span>
            </p>

            {(() => {
              const searchParams = new URLSearchParams(location.search);
              const abaAtual = searchParams.get('aba') || 'restaurantes';

              return [
                { id: 'restaurantes', label: 'Restaurantes Assinantes', icon: Store, badge: 'Clientes' },
                { id: 'editor_loja', label: 'Ambiente de Edição das Lojas', icon: Sliders, badge: 'Editar', highlight: true },
                { id: 'dre_saas', label: 'DRE Executivo & Gráficos', icon: BarChart3, badge: 'DRE' },
                { id: 'financeiro', label: 'Métricas Financeiras & MRR', icon: TrendingUp },
                { id: 'planos', label: 'Planos & Mensalidades', icon: Layers },
                { id: 'avisos_globais', label: 'Central de Avisos (Broadcast)', icon: Megaphone, badge: 'Avisos' },
                { id: 'auditoria', label: 'Logs de Auditoria SaaS', icon: History, badge: 'Logs' },
                { id: 'whatsapp', label: 'Instâncias WhatsApp & IA', icon: Bot },
                { id: 'config', label: 'Configuração Franqueador', icon: ShieldCheck },
              ].map((item) => {
                const isTabActive = location.pathname === '/saas' && abaAtual === item.id;
                return (
                  <NavLink
                    key={item.id}
                    to={`/saas?aba=${item.id}`}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isTabActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                        : item.highlight
                        ? 'text-purple-300 bg-purple-950/30 border border-purple-500/30 hover:bg-purple-900/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-purple-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              });
            })()}
          </div>
        ) : (
          /* SE FOR FUNCIONÁRIO DO RESTAURANTE (GERENTE, CAIXA, GARÇOM, COZINHA) */
          <>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Operação do Restaurante
            </p>

            {menuItemsOperacao
              .filter((item) => temPermissao(item.cargos))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      } ${item.highlight && !isActive ? 'border border-emerald-500/30 text-emerald-300 bg-emerald-950/20' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
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

            {/* Minha Assinatura para Gerente do Restaurante */}
            {menuItemsSaaS.some((item) => temPermissao(item.cargos)) && (
              <div className="pt-3 mt-3 border-t border-slate-800/80">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Minha Assinatura
                </p>

                {menuItemsSaaS
                  .filter((item) => item.path === '/minha-assinatura')
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-purple-400" />
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Bottom Info: Usuário Logado & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
              {usuarioLogado?.nome.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {usuarioLogado?.nome || 'Operador'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <span>{infoCargo.icone}</span>
                <span>{infoCargo.titulo.split('(')[0].trim()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da Conta (Logout)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
