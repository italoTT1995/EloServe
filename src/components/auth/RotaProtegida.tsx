import { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { CargoUsuario } from '../../types';

interface RotaProtegidaProps {
  children: ReactNode;
  cargosPermitidos?: CargoUsuario[];
}

export function RotaProtegida({ children, cargosPermitidos }: RotaProtegidaProps) {
  const { isAuthenticated, usuarioLogado, temPermissao, getDescricaoCargo } = useAuthStore();

  // Se não estiver logado, redireciona para a tela de login
  if (!isAuthenticated || !usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige cargos específicos e o usuário atual não tem permissão
  if (cargosPermitidos && !temPermissao(cargosPermitidos)) {
    const cargoAtualInfo = getDescricaoCargo(usuarioLogado.cargo);

    return (
      <div className="h-full flex items-center justify-center p-4 select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Acesso Restrito por Hierarquia</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Seu perfil atual (<strong className="text-white">{cargoAtualInfo.titulo}</strong>) não tem permissão para acessar este módulo.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs text-left space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Cargos com permissão para esta tela:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cargosPermitidos.map((c) => {
                const info = getDescricaoCargo(c);
                return (
                  <span
                    key={c}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${info.cor}`}
                  >
                    {info.icone} {info.titulo}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o PDV</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
