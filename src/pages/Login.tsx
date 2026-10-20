import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Crown,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuthStore, USUARIOS_PADRAO } from '../store/useAuthStore';
import { CargoUsuario } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginRapidoPorCargo } = useAuthStore();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function redirecionarPorCargo(cargo?: CargoUsuario) {
    if (cargo === 'super_admin') {
      navigate('/saas');
    } else if (cargo === 'admin_restaurante') {
      navigate('/painel-dono');
    } else if (cargo === 'cozinha') {
      navigate('/kds');
    } else {
      navigate('/pdv');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    setTimeout(() => {
      const res = login(email, senha);
      setCarregando(false);
      if (res.sucesso) {
        redirecionarPorCargo(res.usuario?.cargo);
      } else {
        setErro(res.mensagem || 'Credenciais inválidas. Verifique seu e-mail e senha/PIN.');
      }
    }, 350);
  }

  function handlePreencherMaster() {
    const master = USUARIOS_PADRAO[0];
    setEmail(master.email);
    setSenha(master.senha || 'EloMaster@2026');
    setErro(null);
  }

  function handleEntrarMasterDireto() {
    const usuario = loginRapidoPorCargo('super_admin');
    redirecionarPorCargo(usuario.cargo);
  }

  const master = USUARIOS_PADRAO[0];

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

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
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  EloServe PDV
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    v2.4 Oficial
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  PDV Inteligente • Gestão Gastronômica & SaaS
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Acesse o Sistema</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Entre com seu e-mail cadastrado e senha ou PIN de segurança para acessar o seu ambiente de trabalho.
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
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: master@eloserve.com.br"
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
                    placeholder="Digite sua senha ou PIN de 4 dígitos"
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
                  <span>Lembrar meu acesso neste dispositivo</span>
                </label>
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
              EloServe SaaS v2.4 • Segurança RBAC, Multi-Tenancy & Criptografia Ativas
            </p>
          </div>
        </div>

        {/* Coluna Direita: Informações & Acesso do Admin Master */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Controle Central & Autenticação
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              O EloServe opera com modelo de governança centralizada. O Admin Master gerencia os estabelecimentos, vincula os planos e cadastra os acessos de cada colaborador.
            </p>

            {/* Card Destaque: ADMIN MASTER (Ítalo Silva) */}
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950 to-purple-950/40 border border-purple-500/50 shadow-xl shadow-purple-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-purple-200">
                      {master.nome}
                    </h4>
                    <span className="text-[10px] font-bold text-purple-400">
                      Super Admin Global • SaaS Master
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase">
                  Acesso Total
                </span>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-2.5 border border-purple-500/20 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>E-mail:</span>
                  <span className="text-white font-bold">{master.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Senha:</span>
                  <span className="text-white font-bold">{master.senha}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>PIN Rápido:</span>
                  <span className="text-white font-bold">{master.pin}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePreencherMaster}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preencher Login</span>
                </button>
                <button
                  type="button"
                  onClick={handleEntrarMasterDireto}
                  className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Entrar Direto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Informações de Governança */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold text-[11px]">Criação de Estabelecimentos & Planos:</strong>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                    O Admin Master provisiona cada restaurante, define limites de mesas, ativa o módulo de reservas e associa planos (Starter, Pro, Enterprise).
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold text-[11px]">Cadastro de Colaboradores & Cargos:</strong>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                    Os acessos de Gerentes, Caixas, Garçons, Cozinheiros e Entregadores são cadastrados pelo Administrador dentro do sistema com PIN e permissões sob medida.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold text-[11px]">Multi-Tenancy 100% Blindado:</strong>
                  <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                    Nenhum restaurante visualiza dados, estoque, comandas ou relatórios financeiros de outros estabelecimentos.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 text-center">
            🔐 EloServe Platform • Desenvolvido para Alta Performance Gastronômica
          </div>
        </div>
      </div>
    </div>
  );
}
