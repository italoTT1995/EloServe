import { useState, ReactNode } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Crown, ArrowLeft, Megaphone, X, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import { useSaaSStore } from '../../store/useSaaSStore';
import { useThemeStore } from '../../store/useThemeStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [avisosDispensados, setAvisosDispensados] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioLogado } = useAuthStore();
  const { getTenantAtivo, getAvisosAtivosParaTenant, tenantAtivoId, selecionarTenant } = useSaaSStore();
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';

  const isSuperAdmin = usuarioLogado?.cargo === 'super_admin';
  const isNaTelaSaaS = location.pathname === '/saas';
  const tenantAtual = getTenantAtivo();
  const avisosAtivos = getAvisosAtivosParaTenant ? getAvisosAtivosParaTenant(tenantAtual.id).filter(a => !avisosDispensados.includes(a.id)) : [];

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isWhite ? 'bg-slate-50' : 'bg-slate-950'} font-['Plus_Jakarta_Sans',sans-serif]`}>
      {/* Backdrop para mobile quando a sidebar estiver aberta */}
      {sidebarAberta && (
        <div
          onClick={() => setSidebarAberta(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarAberta} onClose={() => setSidebarAberta(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarAberta((prev) => !prev)} />

        {/* Banner de Aviso de Modo Suporte do Super Admin */}
        {isSuperAdmin && tenantAtivoId !== 'global' && (
          <div className={`${
            isWhite
              ? 'bg-purple-100 border-b border-purple-200 text-purple-950 font-medium'
              : 'bg-gradient-to-r from-purple-950 via-purple-900 to-slate-900 border-b border-purple-500/40 text-purple-200'
          } px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-in fade-in duration-150 z-20 shrink-0`}>
            <div className="flex items-center gap-2">
              <Crown className={`w-4 h-4 ${isWhite ? 'text-purple-700' : 'text-purple-400'} shrink-0 animate-pulse`} />
              <span>
                <strong className={isWhite ? 'text-purple-900 font-extrabold' : 'text-purple-200'}>Modo Suporte / Inspeção de Loja:</strong> Você está visualizando o sistema como o restaurante{' '}
                <strong className={`${isWhite ? 'text-purple-950 font-black' : 'text-white'} underline`}>{tenantAtual.nomeFantasia}</strong> ({tenantAtual.cidadeUf}).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isNaTelaSaaS && (
                <Link
                  to="/saas"
                  className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 !text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 text-[11px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 !text-white" />
                  <span className="!text-white">Painel SaaS</span>
                </Link>
              )}
              <button
                onClick={() => {
                  selecionarTenant('global');
                  navigate('/saas');
                }}
                className={`px-3 py-1 rounded-xl ${
                  isWhite
                    ? 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30'
                } font-bold transition-all text-[11px] cursor-pointer`}
              >
                <span>Voltar para Visão Global</span>
              </button>
            </div>
          </div>
        )}

        {/* Avisos Globais / Broadcast da Plataforma para as Lojas */}
        {!isNaTelaSaaS && avisosAtivos.length > 0 && (
          <div className="space-y-1 z-10 shrink-0">
            {avisosAtivos.map((aviso) => (
              <div
                key={aviso.id}
                className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 ${
                  aviso.tipo === 'novidade'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    : aviso.tipo === 'urgente'
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                    : aviso.tipo === 'alerta'
                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                    : 'bg-blue-950/80 border-blue-500/40 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0">
                    {aviso.tipo === 'novidade' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                    {aviso.tipo === 'urgente' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {aviso.tipo === 'alerta' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {aviso.tipo === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="truncate">
                    <strong className="text-white mr-1.5">{aviso.titulo}:</strong>
                    <span>{aviso.mensagem}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAvisosDispensados((prev) => [...prev, aviso.id])}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
                  title="Dispensar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-950/70 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
