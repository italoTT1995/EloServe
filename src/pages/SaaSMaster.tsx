import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  ShieldCheck,
  Search,
  ExternalLink,
  MessageSquare,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Crown,
  Calendar,
  X,
  Store,
  Bot,
  Sliders,
  Sparkles,
  CreditCard,
  QrCode,
  Layers,
  ArrowUpRight,
  Server,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { TipoPlanoSaaS, StatusAssinatura } from '../types';

export default function SaaSMaster() {
  const navigate = useNavigate();
  const {
    tenants,
    planos,
    tenantAtivoId,
    selecionarTenant,
    adicionarTenant,
    atualizarStatusAssinatura,
    mudarPlanoTenant,
    getMRR,
    getTotalAtivos,
    getTotalTrials,
    getTotalAtrasados,
  } = useSaaSStore();

  const [abaAtiva, setAbaAtiva] = useState<'restaurantes' | 'financeiro' | 'planos' | 'whatsapp' | 'config'>('restaurantes');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [modalNovoTenant, setModalNovoTenant] = useState(false);
  const [modalCobrancaWhatsApp, setModalCobrancaWhatsApp] = useState<any | null>(null);

  // Form novo restaurante
  const [form, setForm] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    documento: '',
    responsavelNome: '',
    telefoneWhatsApp: '',
    email: '',
    cidadeUf: 'Belo Horizonte / MG',
    planoId: 'pro' as TipoPlanoSaaS,
    statusAssinatura: 'trial' as StatusAssinatura,
  });

  const mrr = getMRR();
  const arr = mrr * 12;
  const totalAtivos = getTotalAtivos();
  const totalTrials = getTotalTrials();
  const totalAtrasados = getTotalAtrasados();

  const tenantsFiltrados = tenants.filter((t) => {
    const matchBusca =
      t.nomeFantasia.toLowerCase().includes(busca.toLowerCase()) ||
      t.responsavelNome.toLowerCase().includes(busca.toLowerCase()) ||
      t.documento.includes(busca) ||
      t.cidadeUf.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || t.statusAssinatura === filtroStatus;
    return matchBusca && matchStatus;
  });

  function handleSalvarTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeFantasia || !form.telefoneWhatsApp) {
      alert('Preencha pelo menos o Nome do Restaurante e o WhatsApp.');
      return;
    }

    const plano = planos.find((p) => p.id === form.planoId);
    const preco = plano ? plano.precoMensal : 199.0;

    const dataHoje = new Date();
    const proximoMes = new Date(dataHoje.setMonth(dataHoje.getMonth() + 1));

    adicionarTenant({
      nomeFantasia: form.nomeFantasia,
      razaoSocial: form.razaoSocial || form.nomeFantasia,
      documento: form.documento || '00.000.000/0001-00',
      responsavelNome: form.responsavelNome || 'Gerente',
      telefoneWhatsApp: form.telefoneWhatsApp,
      email: form.email || 'contato@restaurante.com.br',
      cidadeUf: form.cidadeUf,
      planoId: form.planoId,
      statusAssinatura: form.statusAssinatura,
      valorMensalidade: preco,
      dataInicio: new Date().toLocaleDateString('pt-BR'),
      proximoVencimento: proximoMes.toLocaleDateString('pt-BR'),
      diasRestantesTrial: form.statusAssinatura === 'trial' ? 7 : undefined,
      instanciaWhatsAppConectada: form.planoId === 'enterprise',
    });

    setModalNovoTenant(false);
    setForm({
      nomeFantasia: '',
      razaoSocial: '',
      documento: '',
      responsavelNome: '',
      telefoneWhatsApp: '',
      email: '',
      cidadeUf: 'Belo Horizonte / MG',
      planoId: 'pro',
      statusAssinatura: 'trial',
    });
  }

  function handleEntrarNaLoja(tenantId: string) {
    selecionarTenant(tenantId);
    navigate('/');
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner Master Administrativo */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-5 sm:p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Central de Gestão SaaS Master</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 uppercase tracking-wider">
                Exclusivo Franqueador / Dono
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Administre todo o ecossistema EloServe: restaurantes assinantes, faturamento recorrente (MRR), planos, cobranças e instâncias de IA.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalNovoTenant(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Restaurante</span>
        </button>
      </div>

      {/* Cards de Métricas SaaS no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">MRR (Faturamento Recorrente Mensal)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
            <span>ARR Anualizado:</span>
            <strong className="text-white font-mono">R$ {arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Assinantes Ativos */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Restaurantes Clientes Ativos</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalAtivos}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            100% com acesso liberado aos módulos
          </span>
        </div>

        {/* Em Teste / Trial */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Em Período de Teste (Trial 7d)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{totalTrials}</p>
          <span className="text-[10px] text-amber-400/80 font-semibold block">
            Oportunidades de conversão este mês
          </span>
        </div>

        {/* Atrasados / Inadimplentes */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Faturas em Atraso</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{totalAtrasados}</p>
          <span className="text-[10px] text-rose-400/80 font-semibold block">
            Disparar cobrança amigável via WhatsApp
          </span>
        </div>
      </div>

      {/* Abas Administrativas do Super Admin */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAbaAtiva('restaurantes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'restaurantes'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Restaurantes Assinantes ({tenants.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('financeiro')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'financeiro'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Métricas Financeiras & MRR</span>
        </button>

        <button
          onClick={() => setAbaAtiva('planos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'planos'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Planos & Limites ({planos.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'whatsapp'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Instâncias WhatsApp & IA</span>
        </button>

        <button
          onClick={() => setAbaAtiva('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'config'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuração do Franqueador</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: RESTAURANTES ASSINANTES */}
      {abaAtiva === 'restaurantes' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar restaurante, responsável, cidade ou CNPJ..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'todos', label: `Todos (${tenants.length})` },
                { id: 'ativo', label: 'Ativos' },
                { id: 'trial', label: 'Em Teste' },
                { id: 'atrasado', label: 'Atrasados' },
                { id: 'bloqueado', label: 'Bloqueados' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filtroStatus === item.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela de Assinantes SaaS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Restaurante / Razão Social</th>
                  <th className="py-3.5 px-4">Responsável & Contato</th>
                  <th className="py-3.5 px-4">Plano</th>
                  <th className="py-3.5 px-4">Mensalidade</th>
                  <th className="py-3.5 px-4">Status da Assinatura</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {tenantsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      Nenhum restaurante encontrado com o filtro atual.
                    </td>
                  </tr>
                ) : (
                  tenantsFiltrados.map((tenant) => {
                    const isTenantAtivo = tenant.id === tenantAtivoId;
                    const plano = planos.find((p) => p.id === tenant.planoId);

                    return (
                      <tr
                        key={tenant.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isTenantAtivo ? 'bg-purple-950/20 border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        {/* Restaurante */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                              <Store className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {tenant.nomeFantasia}
                                </span>
                                {isTenantAtivo && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                                    Loja Selecionada
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {tenant.documento} • {tenant.cidadeUf}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contato & WhatsApp */}
                        <td className="py-3.5 px-4">
                          <p className="text-white font-semibold">{tenant.responsavelNome}</p>
                          <a
                            href={`https://wa.me/${tenant.telefoneWhatsApp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono mt-0.5"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{tenant.telefoneWhatsApp}</span>
                          </a>
                        </td>

                        {/* Plano */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                              tenant.planoId === 'enterprise'
                                ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                                : tenant.planoId === 'pro'
                                ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {plano?.nome.replace('EloServe ', '') || tenant.planoId}
                          </span>
                        </td>

                        {/* Valor Mensal */}
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          R$ {tenant.valorMensalidade.toFixed(2)}
                          <span className="text-[10px] text-slate-500 block font-sans">/ mês</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {tenant.statusAssinatura === 'ativo' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </span>
                          )}
                          {tenant.statusAssinatura === 'trial' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                              Trial ({tenant.diasRestantesTrial || 7}d)
                            </span>
                          )}
                          {tenant.statusAssinatura === 'atrasado' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30 text-[11px] font-bold animate-pulse">
                              <AlertCircle className="w-3 h-3" /> Atrasado
                            </span>
                          )}
                          {tenant.statusAssinatura === 'bloqueado' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold">
                              <Lock className="w-3 h-3" /> Bloqueado
                            </span>
                          )}
                        </td>

                        {/* Vencimento */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                          {tenant.proximoVencimento}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão Entrar na Loja (Modo Suporte do Super Admin) */}
                            <button
                              onClick={() => handleEntrarNaLoja(tenant.id)}
                              title="Acessar o PDV deste restaurante em Modo Suporte"
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Inspecionar PDV</span>
                            </button>

                            {/* Botão Cobrança WhatsApp */}
                            <button
                              onClick={() => setModalCobrancaWhatsApp(tenant)}
                              title="Enviar Cobrança / PIX via WhatsApp"
                              className="p-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {/* Bloquear / Desbloquear */}
                            {tenant.statusAssinatura === 'bloqueado' ? (
                              <button
                                onClick={() => atualizarStatusAssinatura(tenant.id, 'ativo')}
                                title="Desbloquear Restaurante"
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm(`Deseja suspender temporariamente o acesso do restaurante ${tenant.nomeFantasia}?`)) {
                                    atualizarStatusAssinatura(tenant.id, 'bloqueado');
                                  }
                                }}
                                title="Bloquear Acesso por Falta de Pagamento"
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white transition-all cursor-pointer"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: MÉTRICAS FINANCEIRAS & MRR */}
      {abaAtiva === 'financeiro' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Ticket Médio por Assinante</span>
              <p className="text-2xl font-black text-white font-mono">
                R$ {(mrr / (tenants.length || 1)).toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold block">Média entre planos contratados</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Taxa de Adimplência</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {Math.round(((tenants.length - totalAtrasados) / (tenants.length || 1)) * 100)}%
              </p>
              <span className="text-[10px] text-slate-400 font-semibold block">Restaurantes com faturas em dia</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-medium">Projeção com 100 Restaurantes</span>
              <p className="text-2xl font-black text-purple-400 font-mono">
                R$ 19.900,00 <span className="text-xs font-normal text-slate-400">/mês</span>
              </p>
              <span className="text-[10px] text-purple-400/80 font-semibold block">Meta de expansão regional</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Distribuição de Receita por Plano de Assinatura</span>
            </h3>

            <div className="space-y-3">
              {planos.map((plano) => {
                const totalNestePlano = tenants.filter((t) => t.planoId === plano.id).length;
                const receitaPlano = totalNestePlano * plano.precoMensal;
                const percentual = mrr > 0 ? Math.round((receitaPlano / mrr) * 100) : 0;

                return (
                  <div key={plano.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{plano.nome}</strong>
                        <span className="text-slate-400 font-mono">({totalNestePlano} restaurantes)</span>
                      </div>
                      <div className="font-mono font-bold text-emerald-400">
                        R$ {receitaPlano.toFixed(2)}/mês ({percentual}%)
                      </div>
                    </div>
                    {/* Barra de progresso */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: PLANOS & LIMITES */}
      {abaAtiva === 'planos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {planos.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{p.id}</span>
                  {p.destaque && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      Mais Vendido
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-white">{p.nome}</h4>
                <p className="text-xs text-slate-400 mt-1">{p.descricao}</p>

                <div className="my-4 pt-3 border-t border-slate-800">
                  <span className="text-3xl font-black text-emerald-400 font-mono">R$ {p.precoMensal.toFixed(2)}</span>
                  <span className="text-xs text-slate-400"> / mês por restaurante</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Limites Operacionais:</p>
                  <p>• Mesas: <strong className="text-white">{p.limites.maxMesas > 100 ? 'Ilimitadas' : p.limites.maxMesas}</strong></p>
                  <p>• Caixas PDV simultâneos: <strong className="text-white">{p.limites.maxCaixasSimultaneos > 10 ? 'Ilimitados' : p.limites.maxCaixasSimultaneos}</strong></p>
                  <p>• Painel de Cozinha KDS: <strong className={p.limites.kdsIncluso ? 'text-emerald-400' : 'text-slate-500'}>{p.limites.kdsIncluso ? 'Habilitado' : 'Não incluso'}</strong></p>
                  <p>• Atendente EloBot IA: <strong className={p.limites.whatsappIAIncluso ? 'text-purple-400' : 'text-slate-500'}>{p.limites.whatsappIAIncluso ? 'Incluso 24h' : 'Opcional'}</strong></p>
                </div>
              </div>

              <button
                onClick={() => alert(`Para editar o plano ${p.nome}, você pode customizar os limites no arquivo useSaaSStore.ts.`)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Ajustar Limites do Plano
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: INSTÂNCIAS WHATSAPP & IA */}
      {abaAtiva === 'whatsapp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>Instâncias de WhatsApp IA Conectadas nos Restaurantes</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o status dos robôs de atendimento conectados por restaurante.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              Gateway Ativo (Baileys / Evolution)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => (
              <div key={t.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.nomeFantasia}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{t.telefoneWhatsApp}</p>
                  <span className="text-[10px] text-purple-400 font-semibold block mt-1">Plano: {t.planoId.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  {t.instanciaWhatsAppConectada ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Bot Conectado</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                      Desconectado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 5: CONFIGURAÇÕES DO FRANQUEADOR */}
      {abaAtiva === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              <span>Configurações Globais do Franqueador (Italo Lemos)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina os dados oficiais de cobrança para onde os restaurantes pagam as mensalidades.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Chave PIX Oficial para Recebimento das Mensalidades:</label>
              <input
                type="text"
                defaultValue="financeiro@eloserve.com.br"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">WhatsApp de Cobrança e Suporte:</label>
              <input
                type="text"
                defaultValue="+55 (31) 97182-6083"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Dias Padrão de Degustação Grátis (Trial):</label>
              <input
                type="number"
                defaultValue={7}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <button
              onClick={() => alert('Configurações do franqueador salvas com sucesso!')}
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Modal: Novo Restaurante Assinante */}
      {modalNovoTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Cadastrar Novo Restaurante Assinante</h3>
              <button
                onClick={() => setModalNovoTenant(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome Fantasia do Restaurante *</label>
                <input
                  type="text"
                  required
                  value={form.nomeFantasia}
                  onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                  placeholder="Ex: Hamburgueria Artesanal Prime"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    value={form.cidadeUf}
                    onChange={(e) => setForm({ ...form, cidadeUf: e.target.value })}
                    placeholder="Belo Horizonte / MG"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome do Responsável / Sócio</label>
                  <input
                    type="text"
                    value={form.responsavelNome}
                    onChange={(e) => setForm({ ...form, responsavelNome: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp para Cobrança *</label>
                  <input
                    type="text"
                    required
                    value={form.telefoneWhatsApp}
                    onChange={(e) => setForm({ ...form, telefoneWhatsApp: e.target.value })}
                    placeholder="+55 (31) 9..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Plano de Assinatura</label>
                <div className="grid grid-cols-3 gap-2">
                  {planos.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setForm({ ...form, planoId: p.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        form.planoId === p.id
                          ? 'border-purple-500 bg-purple-950/40 text-purple-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <p className="font-bold text-xs">{p.nome.replace('EloServe ', '')}</p>
                      <p className="font-mono text-[11px] text-emerald-400 mt-1">R$ {p.precoMensal}/mês</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Status Inicial</label>
                <select
                  value={form.statusAssinatura}
                  onChange={(e) => setForm({ ...form, statusAssinatura: e.target.value as StatusAssinatura })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="trial">Degustação Grátis (7 Dias de Teste)</option>
                  <option value="ativo">Ativo (Mensalidade Paga)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovoTenant(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/25"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enviar Cobrança PIX via WhatsApp */}
      {modalCobrancaWhatsApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Mensagem Automática de Cobrança PIX</span>
              </h3>
              <button
                onClick={() => setModalCobrancaWhatsApp(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300 font-mono">
              <p className="text-emerald-400 font-bold">Para: {modalCobrancaWhatsApp.nomeFantasia}</p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                "Olá {modalCobrancaWhatsApp.responsavelNome}! Aqui é da equipe EloServe. Segue a fatura mensal do seu sistema de PDV ({modalCobrancaWhatsApp.planoId.toUpperCase()}) no valor de R$ {modalCobrancaWhatsApp.valorMensalidade.toFixed(2)}. Chave PIX: financeiro@eloserve.com.br. O comprovante pode ser enviado aqui. Obrigado pela parceria!"
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalCobrancaWhatsApp(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
              <a
                href={`https://wa.me/${modalCobrancaWhatsApp.telefoneWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${modalCobrancaWhatsApp.responsavelNome}! Aqui é da equipe EloServe. Segue a fatura mensal do seu sistema de PDV no valor de R$ ${modalCobrancaWhatsApp.valorMensalidade.toFixed(2)}. Chave PIX: financeiro@eloserve.com.br. Qualquer dúvida estamos à disposição!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setModalCobrancaWhatsApp(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
