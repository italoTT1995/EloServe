import { useState, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Crown, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import { useSaaSStore } from '../../store/useSaaSStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const location = useLocation();
  const { usuarioLogado } = useAuthStore();
  const { getTenantAtivo } = useSaaSStore();

  const isSuperAdmin = usuarioLogado?.cargo === 'super_admin';
  const isNaTelaSaaS = location.pathname === '/saas';
  const tenantAtual = getTenantAtivo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
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
        {isSuperAdmin && !isNaTelaSaaS && (
          <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-slate-900 border-b border-purple-500/40 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-purple-200 animate-in fade-in duration-150 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
              <span>
                <strong>Modo Administrador Geral do SaaS:</strong> Inspecionando a operação da loja{' '}
                <strong className="text-white underline">{tenantAtual.nomeFantasia}</strong>.
              </span>
            </div>
            <Link
              to="/saas"
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 text-[11px] shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Painel SaaS Master</span>
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-950/70 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
