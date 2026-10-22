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
  Users,
  BarChart3,
  Heart,
  TrendingUp,
  Sparkles,
  UtensilsCrossed,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { CargoUsuario } from '../types';
import { EloGastroLogo, EloGastroClocheIcon } from '../components/common/EloGastroLogo';

/**
 * Os 4 Pilares Oficiais do Manual de Identidade Visual do eloGastrô
 * (Slide 3: Prática, Eficiência, Proximidade e Crescimento)
 */
const PILARES_ELOGASTRO = [
  {
    id: 'pratica',
    tag: 'CONECTA OPERAÇÃO',
    titulo: 'PRÁTICA',
    slogan: 'Simplifica a rotina e facilita a gestão.',
    descricao:
      'Do pedido na mesa ao fechamento do caixa: comanda digital, autoatendimento por QR Code e frente de caixa (PDV) ágil e intuitiva sem complicação.',
    icone: Users,
    corBadge: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40',
    corIcone: 'from-[#FF6B00] to-orange-600',
    corRing: 'ring-[#FF6B00]/20',
    detalhe: 'Mesas • Comandas • QR Code • Caixa F1',
  },
  {
    id: 'eficiencia',
    tag: 'CONECTA RESULTADOS',
    titulo: 'EFICIÊNCIA',
    slogan: 'Organiza, otimiza e gera resultados.',
    descricao:
      'Comunicação em tempo real entre salão e cozinha via KDS, controle rigoroso de estoque por ficha técnica e apuração automática de DRE e CMV.',
    icone: BarChart3,
    corBadge: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
    corIcone: 'from-[#10B981] to-emerald-600',
    corRing: 'ring-[#10B981]/20',
    detalhe: 'KDS Cozinha • Ficha Técnica • Baixa de Insumos • DRE',
  },
  {
    id: 'proximidade',
    tag: 'CONECTA PESSOAS',
    titulo: 'PROXIMIDADE',
    slogan: 'Feito para quem vive a gastronomia de verdade.',
    descricao:
      'Mais do que um sistema, é o elo entre pessoas, processos e boas experiências. Suporte humanizado ao vivo, helpdesk integrado e estabilidade total.',
    icone: Heart,
    corBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    corIcone: 'from-rose-500 to-pink-600',
    corRing: 'ring-rose-500/20',
    detalhe: 'Suporte 1-Click • Atendimento ao Vivo • Modo Consultor',
  },
  {
    id: 'crescimento',
    tag: 'DO PEDIDO AO RESULTADO',
    titulo: 'CRESCIMENTO',
    slogan: 'Acompanha o seu negócio em todas as fases.',
    descricao:
      'Escalabilidade completa: controle delivery com rastreamento por raio, integração WhatsApp com IA e gestão centralizada para redes e franquias.',
    icone: TrendingUp,
    corBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    corIcone: 'from-amber-500 to-orange-500',
    corRing: 'ring-amber-500/20',
    detalhe: 'Delivery • WhatsApp IA • Multi-Lojas • Métricas ARR',
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

  // Transição cíclica dos pilares de marca do eloGastrô
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideAtivo((prev) => (prev + 1) % PILARES_ELOGASTRO.length);
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

  const pilarAtual = PILARES_ELOGASTRO[slideAtivo];
  const IconePilar = pilarAtual.icone;

  return (
    <div className="min-h-screen w-screen bg-[#0F172A] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans',sans-serif] select-none relative overflow-x-hidden">
      {/* Background Visual com Cores Oficiais: Laranja #FF6B00 e Azul Escuro #1E293B */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[650px] h-[350px] bg-gradient-to-b from-[#FF6B00]/15 via-amber-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#10B981]/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Header Corporativo Superior */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3">
          <EloGastroLogo variant="horizontal" size="md" theme="dark" />
          <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
            Enterprise
          </span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="hidden sm:inline font-medium">Ambiente Corporativo Seguro</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-mono text-slate-300 text-[10px]">TLS 1.3 / 256-bit</span>
        </div>
      </header>

      {/* Seção Principal 2 Colunas */}
      <main className="w-full max-w-6xl my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Coluna Esquerda: Apresentação da Marca eloGastrô (Diretrizes dos Prints) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
              <span className="uppercase">Gestão completa para o seu restaurante</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Tudo conectado <span className="text-[#FF6B00]">à sua mesa.</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              O <strong className="text-white font-bold">eloGastrô</strong> é a solução completa de gestão para bares e restaurantes que conecta todas as etapas da operação, do pedido ao resultado. Mais do que um sistema, é o elo entre pessoas, processos e boas experiências.
            </p>

            {/* Badges de Conexão (Slide 2) */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-bold">
              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80">
                CONECTA OPERAÇÃO
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80">
                CONECTA PESSOAS
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80">
                CONECTA RESULTADOS
              </span>
            </div>
          </div>

          {/* Card Dinâmico Animado (Pilares Oficiais: Slide 3) */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* Linha de brilho dinâmico na cor Laranja Oficial */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00]/70 to-transparent" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pilarAtual.corIcone} flex items-center justify-center text-white shadow-lg ring-4 ${pilarAtual.corRing} transition-all duration-500 transform group-hover:scale-105`}
                >
                  <IconePilar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${pilarAtual.corBadge}`}
                  >
                    {pilarAtual.tag}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-lg sm:text-xl font-black text-white transition-all duration-300">
                      {pilarAtual.titulo}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">— {pilarAtual.slogan}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                  Ao Vivo
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans min-h-[48px] transition-all duration-300">
              {pilarAtual.descricao}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF6B00]" />
                {pilarAtual.detalhe}
              </span>

              {/* Seletor Manual e Barras de Progresso */}
              <div className="flex items-center gap-1.5">
                {PILARES_ELOGASTRO.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSlideAtivo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      slideAtivo === idx
                        ? 'w-8 bg-[#FF6B00] shadow-sm shadow-[#FF6B00]/50'
                        : 'w-2 bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={p.titulo}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cards Rápidos dos 4 Pilares */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PILARES_ELOGASTRO.map((p, idx) => {
              const IconeItem = p.icone;
              const isSelected = slideAtivo === idx;
              return (
                <div
                  key={p.id}
                  onClick={() => setSlideAtivo(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-[#FF6B00]/60 shadow-md shadow-[#FF6B00]/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconeItem className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                    <h4 className="text-xs font-bold text-white">{p.titulo}</h4>
                  </div>
                  <p className="text-[9px] text-slate-400 line-clamp-2 leading-snug">
                    {p.slogan}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tagline do Rodapé do Manual (Slide 1) */}
          <div className="pt-2 text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              PEDIDO &bull; ESTOQUE &bull; ATENDIMENTO &bull; DELIVERY &bull; RESULTADOS
            </p>
          </div>
        </div>

        {/* Coluna Direita: Caixa de Login Corporativa */}
        <div className="lg:col-span-5 w-full">
          <div className="relative bg-slate-900/95 border border-slate-800 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10 overflow-hidden">
            {/* Top Luminous Accent Line em Laranja Oficial */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-90" />

            {/* Header do Card com a Cloche Oficial do eloGastrô */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <EloGastroClocheIcon size={52} color="#FF6B00" />
              </div>

              <div className="flex items-baseline justify-center font-black tracking-tight leading-none mb-1.5">
                <span
                  className="text-[#FF6B00] font-black text-2xl select-none italic mr-0.5"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  elo
                </span>
                <span className="text-white font-extrabold text-2xl tracking-tight select-none">
                  Gastrô
                </span>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
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

            {/* Formulário de Acesso */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 tracking-wide">
                  E-mail Corporativo
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@empresa.com.br"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-700"
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
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B00] transition-colors" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/15 transition-all font-medium hover:border-slate-700 tracking-wider"
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
                    className="rounded bg-slate-950 border-slate-800 text-[#FF6B00] focus:ring-0 accent-[#FF6B00]"
                  />
                  <span>Manter conectado neste terminal</span>
                </label>
              </div>

              {/* Botão de Entrada em Laranja Oficial #FF6B00 */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-3 group"
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

            {/* Selos de Segurança e Confiabilidade */}
            <div className="mt-7 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Multi-Tenant Isolado</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>SOC-2 / LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Corporativo */}
      <footer className="w-full max-w-6xl py-4 text-center z-10">
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} eloGastrô • Gestão completa para o seu restaurante. Tudo conectado à sua mesa.
        </p>
      </footer>
    </div>
  );
}
