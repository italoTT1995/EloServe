import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { CargoUsuario } from '../types';
import { EloGastroLogo, EloGastroClocheIcon } from '../components/common/EloGastroLogo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { selecionarTenant } = useSaaSStore();

  // Estados de Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Blindagem contra tema claro (garante visual dark/gourmet premium na tela de login)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const hadThemeLight = root.classList.contains('theme-light') || body.classList.contains('theme-light');

    root.classList.add('is-login-page');
    body.classList.add('is-login-page');

    if (hadThemeLight) {
      root.classList.remove('theme-light');
      body.classList.remove('theme-light');
    }

    return () => {
      root.classList.remove('is-login-page');
      body.classList.remove('is-login-page');
      if (hadThemeLight) {
        root.classList.add('theme-light');
        body.classList.add('theme-light');
      }
    };
  }, []);

  function redirecionarPorCargo(cargo?: CargoUsuario) {
    if (cargo === 'super_admin') {
      navigate('/saas');
    } else if (cargo === 'admin_restaurante') {
      navigate('/painel-dono');
    } else if (cargo === 'cozinha') {
      navigate('/kds');
    } else if (cargo === 'garcom') {
      navigate('/mesas');
    } else if (cargo === 'entregador') {
      navigate('/delivery');
    } else {
      navigate('/pdv');
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    setTimeout(() => {
      const res = login(email, senha);
      setCarregando(false);
      if (res.sucesso) {
        if (res.usuario?.tenantId && res.usuario.tenantId !== 'global') {
          selecionarTenant(res.usuario.tenantId);
        }
        redirecionarPorCargo(res.usuario?.cargo);
      } else {
        setErro(res.mensagem || 'Credenciais inválidas. Verifique seu e-mail e senha ou PIN.');
      }
    }, 350);
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden select-none bg-[#090D1A]">
      {/* 1. Imagem de Fundo Gourmet */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-100 transition-transform duration-1000"
        style={{ backgroundImage: "url('/images/elogastro-hero.png')" }}
      />

      {/* 2. Gradiente Vignette para Contraste e Imersão */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/90 z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-black/30 z-0 pointer-events-none" />

      {/* 3. Header Flutuante Minimalista */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="lg:hidden flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
            <EloGastroLogo variant="horizontal" size="sm" theme="dark" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-semibold text-white">Ambiente Seguro & Multi-Tenant</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-mono text-slate-300 text-[10px] hidden sm:inline">Controle de Acessos Ativo</span>
        </div>
      </header>

      {/* 4. Conteúdo Principal: Caixa Exclusiva de Login */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-end px-4 sm:px-8 lg:px-14 xl:px-20 py-6">
        <div className="w-full max-w-[430px] bg-slate-950/90 border border-slate-700/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 relative overflow-hidden transition-all duration-300">
          {/* Top Luminous Accent Line em Laranja Oficial #FF6B00 */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-95" />

          {/* Header do Card com o Logotipo Oficial */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2.5 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/images/elogastro-logo-transparent.png"
                alt="eloGastrô"
                className="h-24 sm:h-28 w-auto object-contain select-none drop-shadow-2xl"
              />
            </div>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Entre com suas credenciais corporativas ou PIN de segurança para acessar o sistema.
            </p>
          </div>

          {/* Mensagens de Feedback */}
          {erro && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{sucesso}</span>
            </div>
          )}

          {/* Formulário Oficial de Autenticação */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5 tracking-wide">
                E-mail de Acesso
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@restaurante.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 tracking-wide">
                  Senha ou PIN Rápido
                </label>
                <span className="text-[10px] font-mono text-slate-400">PIN 4 dígitos ou senha</span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-600 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                  title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white text-[11px]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-900 border-slate-700 text-[#FF6B00] focus:ring-0 accent-[#FF6B00]"
                />
                <span>Manter conectado neste terminal</span>
              </label>
            </div>

            {/* Botão de Entrada em Laranja Oficial #FF6B00 */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-2 group"
            >
              {carregando ? (
                <span>Validando Credenciais...</span>
              ) : (
                <>
                  <span>Entrar no eloGastrô</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Informação Corporativa: Acesso Centralizado */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Hierarquia Multi-Nível</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Isolamento por Loja</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-500 leading-relaxed">
              Novos acessos e permissões de funcionários são gerenciados exclusivamente pelo gestor do estabelecimento.
            </p>
          </div>
        </div>
      </main>

      {/* 5. Footer Corporativo */}
      <footer className="relative z-10 w-full py-3 text-center pointer-events-none px-4">
        <p className="text-[11px] text-slate-400/90 font-medium drop-shadow-md">
          © {new Date().getFullYear()} eloGastrô • Gestão completa para o seu restaurante. Tudo conectado à sua mesa.
        </p>
      </footer>
    </div>
  );
}
