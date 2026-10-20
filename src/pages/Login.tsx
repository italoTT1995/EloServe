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
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore, USUARIOS_PADRAO } from '../store/useAuthStore';
import { CargoUsuario, Usuario } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginRapidoPorCargo, getDescricaoCargo } = useAuthStore();

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

  function handleLoginRapido(cargo: CargoUsuario) {
    const usuario = loginRapidoPorCargo(cargo);
    redirecionarPorCargo(usuario.cargo);
  }

  function handlePreencherCredenciais(u: Usuario) {
    setEmail(u.email);
    setSenha(u.senha || u.pin);
    setErro(null);
  }

  const usuarioMaster = USUARIOS_PADRAO.find((u) => u.cargo === 'super_admin') || USUARIOS_PADRAO[0];
  const usuariosEquipe = USUARIOS_PADRAO.filter((u) => u.cargo !== 'super_admin');

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
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
              <p className="text-xs text-slate-400 mt-1">
                Informe suas credenciais oficiais ou selecione um perfil ao lado para entrar.
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
                    placeholder="ex: master@eloserve.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Senha ou PIN de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha ou PIN numérico"
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

        {/* Coluna Direita: Credenciais & Acesso por Perfil */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Perfis & Credenciais de Acesso
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Clique em <strong>Preencher</strong> para carregar os dados no formulário ou em <strong>Entrar →</strong> para login direto:
            </p>

            {/* Card Destaque: ADMIN MASTER (Ítalo Silva) */}
            <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-950 to-purple-950/40 border border-purple-500/50 shadow-lg shadow-purple-500/10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-purple-200 truncate">
                        {usuarioMaster.nome}
                      </p>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase">
                        Admin Master
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                      {usuarioMaster.email}
                    </p>
                    <p className="text-[10px] text-purple-300/80 font-mono">
                      Senha: <span className="text-white font-bold">{usuarioMaster.senha}</span> • PIN: <span className="text-white font-bold">{usuarioMaster.pin}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePreencherCredenciais(usuarioMaster)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    Preencher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoginRapido('super_admin')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-500/20 flex items-center gap-1"
                  >
                    Entrar →
                  </button>
                </div>
              </div>
            </div>

            {/* Lista dos demais perfis operacionais */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {usuariosEquipe.map((u) => {
                const info = getDescricaoCargo(u.cargo);
                return (
                  <div
                    key={u.id}
                    className="w-full p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{info.icone}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {u.nome}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${info.cor}`}
                          >
                            {u.cargo.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {u.email} • PIN: <span className="text-slate-300 font-bold">{u.pin}</span> • Senha: <span className="text-slate-300 font-bold">{u.senha}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <button
                        type="button"
                        onClick={() => handlePreencherCredenciais(u)}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                      >
                        Preencher
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoginRapido(u.cargo)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors"
                      >
                        Entrar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-white font-bold block flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              Hierarquia e Acesso Isolado:
            </span>
            <p>
              • <strong>Admin Master (Ítalo Silva):</strong> Gestão SaaS global, controle de assinaturas, MRR e DRE Corporativo.
            </p>
            <p>
              • <strong>Gerente:</strong> Cardápio, mesas, suprimentos, funcionários e DRE da sua filial.
            </p>
            <p>
              • <strong>Caixa, Garçom, Cozinha e Delivery:</strong> Telas operacionais estritas ao seu posto de trabalho.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
