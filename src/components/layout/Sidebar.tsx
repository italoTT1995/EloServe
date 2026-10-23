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
  LayoutDashboard,
  Settings,
  FileSpreadsheet,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useSaaSStore } from '../../store/useSaaSStore';
import { CargoUsuario } from '../../types';
import { EloGastroLogo } from '../common/EloGastroLogo';

interface MenuItemDef {
  path: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
  adminDestaque?: boolean;
  cargos: CargoUsuario[];
}

const menuItemsDonoSimples: MenuItemDef[] = [
  { path: '/painel-dono', label: 'Dashboard', icon: LayoutDashboard, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/cardapio', label: 'Cardápio', icon: BookOpen, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/pdv', label: 'Pedidos', icon: Store, badge: '1', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/mesas', label: 'Mesas', icon: LayoutGrid, cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/estoque', label: 'Estoque', icon: Package, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/caixa', label: 'Caixa', icon: DollarSign, cargos: ['super_admin', 'admin_restaurante', 'caixa'] },
  { path: '/financeiro', label: 'Financeiro & DRE', icon: FileSpreadsheet, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/elobot', label: 'Marketing', icon: Megaphone, highlight: true, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/funcionarios', label: 'Funcionários', icon: Users, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/delivery', label: 'Entregas/Entregadores', icon: Bike, cargos: ['super_admin', 'admin_restaurante', 'caixa', 'entregador'] },
  { path: '/kds', label: 'Cozinha (KDS)', icon: ChefHat, cargos: ['super_admin', 'admin_restaurante', 'cozinha'] },
];

const menuItemsOperacao: MenuItemDef[] = [
  { path: '/pdv', label: 'Frente de Caixa (PDV)', icon: Store, badge: 'F1', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/mesas', label: 'Mesas & Salão', icon: LayoutGrid, badge: 'F2', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'garcom'] },
  { path: '/delivery', label: 'Delivery & Entregas', icon: Bike, badge: 'F3', cargos: ['super_admin', 'admin_restaurante', 'caixa', 'entregador'] },
  { path: '/kds', label: 'Cozinha (KDS)', icon: ChefHat, badge: 'F4', cargos: ['super_admin', 'admin_restaurante', 'cozinha'] },
  { path: '/caixa', label: 'Controle de Caixa', icon: DollarSign, cargos: ['super_admin', 'admin_restaurante', 'caixa'] },
];

const menuItemsConfiguracoes: MenuItemDef[] = [
  { path: '/cardapio', label: 'Cardápio & Preços', icon: BookOpen, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/estoque', label: 'Estoque Inteligente', icon: Package, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/funcionarios', label: 'Funcionários & RH', icon: Users, cargos: ['super_admin', 'admin_restaurante'] },
  { path: '/minha-assinatura', label: 'Minha Assinatura', icon: CreditCard, cargos: ['super_admin', 'admin_restaurante'] },
];

const menuItemsSaaS: MenuItemDef[] = [
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
  const { tema, alternarTema } = useThemeStore();
  const isWhite = tema === 'light';
  const { tenantAtivoId, getTenantAtivo, selecionarTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const isModoGlobal = tenantAtivoId === 'global';
  const infoCargo = getDescricaoCargo(usuarioLogado?.cargo);

  function handleLogout() {
    logout();
    navigate('/login');
  }
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 ${
        isWhite ? 'bg-[#F8FAFC] border-r border-slate-200' : 'bg-[#0F172A] border-r border-[#1E293B]'
      } flex flex-col h-screen select-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 px-5 border-b ${isWhite ? 'border-slate-200' : 'border-[#1E293B]'} flex items-center justify-between`}>
        <Link
          to={
            usuarioLogado?.cargo === 'super_admin' && isModoGlobal
              ? '/saas'
              : '/painel-dono'
          }
          className="flex items-center gap-2 group cursor-pointer"
        >
          <EloGastroLogo
            variant="horizontal"
            size="sm"
            theme={isWhite ? 'light' : 'dark'}
          />
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
              isWhite
                ? 'bg-orange-100 text-[#FF6B00] border border-orange-200'
                : 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40'
            }`}
          >
            {usuarioLogado?.cargo === 'super_admin' && isModoGlobal ? 'Master' : 'PDV'}
          </span>
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
        {/* SE FOR SUPER ADMIN EM VISÃO GLOBAL: MENU EXCLUSIVO DE ADMINISTRAÇÃO SAAS MASTER */}
        {usuarioLogado?.cargo === 'super_admin' && isModoGlobal ? (
          <div className="space-y-1">
            <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isWhite ? 'text-[#FF6B00]' : 'text-orange-400'
            }`}>
              <Crown className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Administração SaaS Master</span>
            </p>

            {(() => {
              const searchParams = new URLSearchParams(location.search);
              const abaAtual = searchParams.get('aba') || 'restaurantes';

              return [
                { id: 'restaurantes', label: 'Restaurantes Assinantes', icon: Store, badge: 'Clientes' },
                { id: 'dossie_mensal', label: 'Dossiê Mensal & Consultoria', icon: FileSpreadsheet, badge: 'DRE' },
                { id: 'editor_loja', label: 'Ambiente de Edição das Lojas', icon: Sliders, badge: 'Editar' },
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
                        ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-bold'
                        
                        : isWhite
                        ? 'text-slate-700 hover:text-[#FF6B00] hover:bg-orange-50/70 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${
                        isTabActive
                          ? '!text-white'
                          : isWhite
                          ? 'text-[#FF6B00]'
                          : 'text-orange-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isTabActive
                          ? 'bg-white/20 !text-white'
                          : isWhite
                          ? 'bg-orange-100 text-[#FF6B00] border border-orange-200'
                          : 'bg-[#1E293B] text-orange-300 border border-[#FF6B00]/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              });
            })()}
          </div>
        ) : usuarioLogado?.cargo === 'admin_restaurante' || (usuarioLogado?.cargo === 'super_admin' && !isModoGlobal) ? (
          /* MENU PRINCIPAL DO DONO / GERENTE (EXATAMENTE COMO NO BENCHMARK DO PRINT OU MODO INSPEÇÃO) */
          <div className="space-y-1">
            {usuarioLogado?.cargo === 'super_admin' && !isModoGlobal && (
              <div className={`px-3 py-2 mb-2 rounded-xl border text-[11px] space-y-1.5 ${
                isWhite
                  ? 'bg-orange-50 border-orange-200 text-slate-900'
                  : 'bg-[#1E293B] border-[#FF6B00]/30 text-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Modo Suporte</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isWhite ? 'bg-orange-200 text-[#FF6B00]' : 'bg-[#FF6B00]/20 text-orange-200'
                  }`}>LOJA</span>
                </div>
                <p className={`text-[11px] font-extrabold truncate ${isWhite ? 'text-slate-900' : 'text-white'}`}>{tenantAtual.nomeFantasia}</p>
                <button
                  type="button"
                  onClick={() => {
                    selecionarTenant('global');
                    navigate('/saas');
                  }}
                  className="w-full mt-1 py-1 rounded-lg bg-[#FF6B00] hover:bg-[#E66000] !text-white font-bold text-[10px] transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm shadow-[#FF6B00]/20"
                >
                  <span className="!text-white">↩ Voltar ao SaaS Master</span>
                </button>
              </div>
            )}

            <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${
              isWhite ? 'text-slate-500' : 'text-slate-500'
            }`}>
              MENU PRINCIPAL
            </p>

            {menuItemsDonoSimples
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
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FF6B00] !text-white font-bold shadow-lg shadow-[#FF6B00]/30'
                        : isWhite
                        ? 'text-slate-700 hover:text-[#FF6B00] hover:bg-orange-50/70 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                    } ${item.highlight && !isActive ? (isWhite ? 'text-[#FF6B00] font-bold' : 'text-orange-400') : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? '!text-white'
                              : isWhite
                              ? (item.highlight ? 'text-orange-600' : 'text-slate-600')
                              : (item.highlight ? 'text-orange-400' : 'text-slate-400')
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold bg-rose-500 !text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ) : (
          /* SE FOR OUTROS CARGOS OPERACIONAIS (CAIXA, GARÇOM, COZINHA) */
          <>
            <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${
              isWhite ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Meu Turno de Trabalho
            </p>

            <div className="space-y-1">
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
                            ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-bold'
                            : isWhite
                            ? 'text-slate-700 hover:text-[#FF6B00] hover:bg-orange-50/70 font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-[#1E293B]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${
                              isActive
                                ? '!text-white'
                                : isWhite
                                ? 'text-[#FF6B00]'
                                : 'text-slate-400'
                            }`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                isActive
                                  ? 'bg-white/20 !text-white'
                                  : isWhite
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : 'bg-[#1E293B] text-slate-400'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          </>
        )}
      </nav>

      {/* Configurações & White Color (Aparência) */}
      <div className={`px-3 py-1.5 border-t ${isWhite ? 'border-slate-200' : 'border-slate-800/80'} space-y-1`}>
        <NavLink
          to="/minha-assinatura"
          onClick={() => {
            if (window.innerWidth < 1024) onClose();
          }}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? isWhite
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'bg-slate-800 text-white font-bold'
                : isWhite
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <Settings className={`w-4 h-4 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`} />
          <span>Configurações</span>
        </NavLink>

        <button
          type="button"
          onClick={alternarTema}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isWhite
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          title={tema === 'light' ? 'Mudar para Dark Mode' : 'Mudar para White Color (Tema Claro)'}
        >
          <div className="flex items-center gap-2.5">
            {tema === 'light' ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-slate-400" />}
            <span>{tema === 'light' ? 'Tema Claro' : 'White Color'}</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            tema === 'light' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-800 text-slate-300'
          }`}>
            {tema === 'light' ? 'Ativo' : 'Ativar'}
          </span>
        </button>
      </div>

      {/* Bottom Info: Usuário Logado & Logout */}
      <div className={`p-3 border-t ${isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
        <div className={`${isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'} border rounded-xl p-2.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
              isWhite ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
            }`}>
              {usuarioLogado?.nome.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate">
              <p className={`text-xs font-bold truncate ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>
                {usuarioLogado?.nome || 'Operador'}
              </p>
              <p className={`text-[10px] font-semibold truncate flex items-center gap-1 ${isWhite ? 'text-emerald-700' : 'text-emerald-400'}`}>
                <span>{infoCargo.icone}</span>
                <span>{infoCargo.titulo.split('(')[0].trim()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da Conta (Logout)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isWhite ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
