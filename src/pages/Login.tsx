import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Shield,
  Layers,
  Sparkles,
  Server,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CargoUsuario } from '../types';

const RECURSOS_CORPORATIVOS = [
  {
    id: 'multitenancy',
    tag: 'ISOLAMENTO DE DADOS',
    titulo: 'Multi-Tenancy 100% Blindado',
    descricao:
      'Nenhum restaurante visualiza dados, estoque, comandas ou relatórios financeiros de outros estabelecimentos. Segurança de ponta a ponta com particionamento rígido.',
    icone: Layers,
    corBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    corIcone: 'from-cyan-500 to-blue-600',
    corRing: 'ring-cyan-500/20',
    detalhe: 'Isolamento de Base • Zero Vazamento • Criptografia TLS 1.3',
  },
  {
    id: 'planos',
    tag: 'PROVISIONAMENTO SAAS',
    titulo: 'Criação de Estabelecimentos & Planos',
    descricao:
      'O Admin Master provisiona cada restaurante, define limites de mesas, ativa o módulo de reservas e associa planos sob medida (Starter, Pro, Enterprise).',
    icone: Building2,
    corBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    corIcone: 'from-emerald-500 to-teal-600',
    corRing: 'ring-emerald-500/20',
    detalhe: 'Controle de Licenças • Ativação Imediata • Cobrança Centralizada',
  },
  {
    id: 'cargos',
    tag: 'GOVERNANÇA & RBAC',
    titulo: 'Cadastro de Colaboradores & Cargos',
    descricao:
      'Os acessos de Gerentes, Caixas, Garçons, Cozinheiros e Entregadores são cadastrados pelo Administrador dentro do sistema com PIN e permissões sob medida.',
    icone: Shield,
    corBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    corIcone: 'from-purple-500 to-indigo-600',
    corRing: 'ring-purple-500/20',
    detalhe: 'Perfis Auditados • PIN Rápido 4 Dígitos • Logs em Tempo Real',
  },
  {
    id: 'governanca',
    tag: 'CONTROLE CENTRALIZADO',
    titulo: 'Controle Central & Autenticação',
    descricao:
      'O EloServe opera com modelo de governança centralizada. O Admin Master gerencia os estabelecimentos, vincula os planos e cadastra os acessos com governança total.',
    icone: ShieldCheck,
    corBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    corIcone: 'from-amber-500 to-orange-600',
    corRing: 'ring-amber-500/20',
    detalhe: 'Torre de Monitoramento • Helpdesk ao Vivo • Suporte 1-Click',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [slideAtivo, setSlideAtivo] = useState(0);

  // Animação cíclica automática do showcase corporativo
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideAtivo((prev) => (prev + 1) % RECURSOS_CORPORATIVOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  const slideAtual = RECURSOS_CORPORATIVOS[slideAtivo];
  const IconeSlide = slideAtual.icone;

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans',sans-serif] select-none relative overflow-x-hidden">
      {/* Background Grid Pattern & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[650px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Top Corporate Status Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                EloServe
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Plataforma de Gestão Gastronômica & SaaS Multi-Empresas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline font-medium">Ambiente Corporativo Seguro</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300 text-[10px]">TLS 1.3 / 256-bit</span>
        </div>
      </header>

      {/* Main 2-Column Section */}
      <main className="w-full max-w-6xl my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Coluna Esquerda: Animação e Palavras Corporativas */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>GOVERNANÇA & INFRAESTRUTURA EMPRESARIAL</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Gestão Gastronômica Inteligente, Multi-Tenancy & Alta Confiabilidade
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              O EloServe opera com modelo de governança centralizada. O Admin Master gerencia os estabelecimentos, vincula os planos e cadastra os acessos de cada colaborador.
            </p>
          </div>

          {/* Card Dinâmico Animado (Showcase em Transição) */}
          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* Linha de brilho dinâmico */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${slideAtual.corIcone} flex items-center justify-center text-white shadow-lg ring-4 ${slideAtual.corRing} transition-all duration-500 transform group-hover:scale-105`}
                >
                  <IconeSlide className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${slideAtual.corBadge}`}
                  >
                    {slideAtual.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1 transition-all duration-300">
                    {slideAtual.titulo}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Ao Vivo
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans min-h-[50px] transition-all duration-300">
              {slideAtual.descricao}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                {slideAtual.detalhe}
              </span>

              {/* Seletor Manual e Barras de Progresso */}
              <div className="flex items-center gap-1.5">
                {RECURSOS_CORPORATIVOS.map((rec, idx) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSlideAtivo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      slideAtivo === idx
                        ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'w-2 bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={rec.titulo}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Os 3 Pilares Corporativos Anteriores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setSlideAtivo(1)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                slideAtivo === 1
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className={`w-4 h-4 ${slideAtivo === 1 ? 'text-emerald-400' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-white">Planos & Lojas</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Provisionamento de restaurantes, limites de mesas e associação de planos Starter, Pro e Enterprise.
              </p>
            </div>

            <div
              onClick={() => setSlideAtivo(2)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                slideAtivo === 2
                  ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className={`w-4 h-4 ${slideAtivo === 2 ? 'text-purple-400' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-white">Cargos & PINs</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Gerentes, Caixas, Garçons, Cozinheiros e Entregadores com permissões sob medida e PIN rápido.
              </p>
            </div>

            <div
              onClick={() => setSlideAtivo(0)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                slideAtivo === 0
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className={`w-4 h-4 ${slideAtivo === 0 ? 'text-cyan-400' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-white">Multi-Tenancy</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Nenhum restaurante visualiza dados, comandas ou relatórios financeiros de outros estabelecimentos.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Caixa de Login Corporativa */}
        <div className="lg:col-span-5 w-full">
          <div className="relative bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10 overflow-hidden">
            {/* Top Luminous Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

            {/* Header do Card */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-slate-950 shadow-xl shadow-emerald-500/25 mb-3 ring-4 ring-emerald-500/10">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight">
                Acesse sua Conta
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Entre com seu e-mail cadastrado e senha ou PIN de segurança para acessar o sistema.
              </p>
            </div>

            {/* Alerta de Erro */}
            {erro && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{erro}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 tracking-wide">
                  E-mail Corporativo
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@empresa.com.br"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/15 transition-all font-medium hover:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 tracking-wide">
                    Senha ou PIN Rápido
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">PIN 4 dígitos</span>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/15 transition-all font-medium hover:border-slate-700 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 accent-emerald-500"
                  />
                  <span>Manter conectado neste terminal</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-3 group"
              >
                {carregando ? (
                  <span>Validando Credenciais...</span>
                ) : (
                  <>
                    <span>Entrar no EloServe</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Selos de Segurança Corporativa */}
            <div className="mt-7 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Tenant Isolado</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SOC-2 / LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Corporativo */}
      <footer className="w-full max-w-6xl py-4 text-center z-10">
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} EloServe Tecnologias S.A. • Plataforma de Gestão Gastronômica & SaaS Multi-Empresas
        </p>
      </footer>
    </div>
  );
}
