import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Users,
} from 'lucide-react';
import { useAuthStore, USUARIOS_PADRAO } from '../store/useAuthStore';
import { CargoUsuario } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginRapidoPorCargo, getDescricaoCargo } = useAuthStore();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    setTimeout(() => {
      const res = login(email, senha);
      setCarregando(false);
      if (res.sucesso) {
        if (res.usuario?.cargo === 'super_admin') {
          navigate('/saas');
        } else if (res.usuario?.cargo === 'cozinha') {
          navigate('/kds');
        } else {
          navigate('/');
        }
      } else {
        setErro(res.mensagem || 'Credenciais inválidas.');
      }
    }, 400);
  }

  function handleLoginRapido(cargo: CargoUsuario) {
    const usuario = loginRapidoPorCargo(cargo);
    if (usuario.cargo === 'super_admin') {
      navigate('/saas');
    } else if (usuario.cargo === 'cozinha') {
      navigate('/kds');
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        {/* Coluna Esquerda: Formulário de Login */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Logo & Marca */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">EloServe</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  PDV Inteligente & Gestão SaaS
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Acesse sua conta</h2>
              <p className="text-xs text-slate-400 mt-1">
                Entre com seu e-mail e senha cadastrados ou use o PIN de 4 dígitos.
              </p>
            </div>

            {/* Alerta de Erro */}
            {erro && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  E-mail do Operador ou Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: italo@eloserve.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Senha ou PIN Rápido
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite seu PIN ou senha (padrão: 1234)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
                <span className="text-emerald-400 font-semibold cursor-pointer hover:underline text-[11px]">
                  Esqueci minha senha
                </span>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
              >
                {carregando ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Entrar no EloServe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              EloServe SaaS v2.4 • Segurança RBAC e Multi-Tenancy Ativos
            </p>
          </div>
        </div>

        {/* Coluna Direita: Hierarquia de Acesso & Demonstração Rápida */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Hierarquia de Cargos do Sistema
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              O EloServe possui níveis de permissão que limitam cada operador estritamente às suas funções. Clique em qualquer cargo abaixo para <strong>testar o sistema instantaneamente</strong> com aquele perfil:
            </p>

            {/* Lista dos 5 Cargos com botão de login de 1 clique */}
            <div className="space-y-2">
              {USUARIOS_PADRAO.map((u) => {
                const info = getDescricaoCargo(u.cargo);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleLoginRapido(u.cargo)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{info.icone}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {u.nome}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${info.cor}`}
                          >
                            {u.cargo.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {info.nivel}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-[10px] text-emerald-400 font-bold group-hover:underline">
                        Entrar →
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono">
                        PIN: {u.pin}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-white font-bold block">🔒 Como funciona a hierarquia:</span>
            <p>
              • <strong>Super Admin</strong> acessa a Central SaaS, métricas globais e todos os restaurantes.
            </p>
            <p>
              • <strong>Gerente</strong> gerencia seu cardápio, preços, mesas e DRE da sua loja.
            </p>
            <p>
              • <strong>Caixa / Garçom / Cozinha</strong> acessam apenas suas respectivas telas de operação diária.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
