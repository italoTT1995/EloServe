import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Save,
  Trash2,
  Edit2,
  Pencil,
  UtensilsCrossed,
  Tag,
  Check,
  RotateCcw,
  ChefHat,
} from 'lucide-react';
import { useSaaSStore, AbaMasterSaaS } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { TipoPlanoSaaS, StatusAssinatura, Produto } from '../types';

export default function SaaSMaster() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get('aba') as AbaMasterSaaS | null;

  const {
    tenants,
    planos,
    tenantAtivoId,
    tenantEmEdicaoId,
    setTenantEmEdicaoId,
    selecionarTenant,
    adicionarTenant,
    atualizarDadosTenant,
    atualizarStatusAssinatura,
    mudarPlanoTenant,
    getMRR,
    getTotalAtivos,
    getTotalTrials,
    getTotalAtrasados,
  } = useSaaSStore();

  const {
    produtos,
    categorias,
    adicionarProduto,
    editarProduto,
    removerProduto,
    atualizarPreco,
    alternarDisponibilidade,
    adicionarCategoria,
  } = useProductStore();

  const [abaAtiva, setAbaAtiva] = useState<AbaMasterSaaS>(abaParam || 'restaurantes');

  useEffect(() => {
    if (abaParam && abaParam !== abaAtiva) {
      setAbaAtiva(abaParam);
    }
  }, [abaParam]);

  const handleMudarAba = (novaAba: AbaMasterSaaS) => {
    setAbaAtiva(novaAba);
    setSearchParams({ aba: novaAba });
  };

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [modalNovoTenant, setModalNovoTenant] = useState(false);
  const [modalCobrancaWhatsApp, setModalCobrancaWhatsApp] = useState<any | null>(null);

  // Estados do Ambiente de Edição da Loja (editor_loja)
  const [subAbaEditor, setSubAbaEditor] = useState<'dados_loja' | 'cardapio_precos'>('dados_loja');
  const tenantEmEdicao = tenants.find((t) => t.id === (tenantEmEdicaoId || tenants[0]?.id)) || tenants[0];

  const [formEdicao, setFormEdicao] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    documento: '',
    responsavelNome: '',
    telefoneWhatsApp: '',
    email: '',
    cidadeUf: '',
    planoId: 'pro' as TipoPlanoSaaS,
    statusAssinatura: 'ativo' as StatusAssinatura,
    valorMensalidade: 199,
    proximoVencimento: '',
    diasRestantesTrial: 7,
  });

  const [sucessoSalvarEdicao, setSucessoSalvarEdicao] = useState<string | null>(null);

  // Sincronizar form quando mudar o restaurante em edição
  useEffect(() => {
    if (tenantEmEdicao) {
      setFormEdicao({
        nomeFantasia: tenantEmEdicao.nomeFantasia || '',
        razaoSocial: tenantEmEdicao.razaoSocial || tenantEmEdicao.nomeFantasia || '',
        documento: tenantEmEdicao.documento || '',
        responsavelNome: tenantEmEdicao.responsavelNome || '',
        telefoneWhatsApp: tenantEmEdicao.telefoneWhatsApp || '',
        email: tenantEmEdicao.email || '',
        cidadeUf: tenantEmEdicao.cidadeUf || '',
        planoId: tenantEmEdicao.planoId,
        statusAssinatura: tenantEmEdicao.statusAssinatura,
        valorMensalidade: tenantEmEdicao.valorMensalidade,
        proximoVencimento: tenantEmEdicao.proximoVencimento || '',
        diasRestantesTrial: tenantEmEdicao.diasRestantesTrial || 7,
      });
    }
  }, [tenantEmEdicao?.id]);

  function handleSalvarEdicaoRestaurante(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantEmEdicao) return;

    atualizarDadosTenant(tenantEmEdicao.id, {
      nomeFantasia: formEdicao.nomeFantasia,
      razaoSocial: formEdicao.razaoSocial,
      documento: formEdicao.documento,
      responsavelNome: formEdicao.responsavelNome,
      telefoneWhatsApp: formEdicao.telefoneWhatsApp,
      email: formEdicao.email,
      cidadeUf: formEdicao.cidadeUf,
      planoId: formEdicao.planoId,
      statusAssinatura: formEdicao.statusAssinatura,
      valorMensalidade: Number(formEdicao.valorMensalidade),
      proximoVencimento: formEdicao.proximoVencimento,
      diasRestantesTrial: formEdicao.statusAssinatura === 'trial' ? Number(formEdicao.diasRestantesTrial) : undefined,
    });

    setSucessoSalvarEdicao('Dados cadastrais e assinatura do restaurante salvos com sucesso!');
    setTimeout(() => setSucessoSalvarEdicao(null), 4000);
  }

  // Estados do Cardápio & Preços no Editor
  const [buscaItemCardapio, setBuscaItemCardapio] = useState('');
  const [categoriaCardapioFiltro, setCategoriaCardapioFiltro] = useState('todas');
  const [modalNovoItemCardapio, setModalNovoItemCardapio] = useState(false);
  const [novoItemForm, setNovoItemForm] = useState({
    nome: '',
    categoriaId: '',
    descricao: '',
    precoVenda: '',
    precoCusto: '',
    setorPreparo: 'cozinha' as 'cozinha' | 'bar' | 'nenhum',
  });
  const [precosLocais, setPrecosLocais] = useState<Record<string, number>>({});
  const [feedbackPrecoSalvo, setFeedbackPrecoSalvo] = useState<string | null>(null);

  function handleSalvarPrecoItem(produtoId: string) {
    const preco = precosLocais[produtoId];
    if (preco !== undefined && !isNaN(preco) && preco >= 0) {
      atualizarPreco(produtoId, preco);
      setFeedbackPrecoSalvo(produtoId);
      setTimeout(() => setFeedbackPrecoSalvo(null), 2500);
    }
  }

  function handleCriarNovoItem(e: React.FormEvent) {
    e.preventDefault();
    if (!novoItemForm.nome || !novoItemForm.precoVenda) {
      alert('Preencha pelo menos o Nome e o Preço de Venda do item.');
      return;
    }

    const catId = novoItemForm.categoriaId || categorias[0]?.id || 'c1';
    adicionarProduto({
      nome: novoItemForm.nome,
      categoriaId: catId,
      descricao: novoItemForm.descricao || undefined,
      precoVenda: parseFloat(novoItemForm.precoVenda.replace(',', '.')) || 0,
      precoCusto: novoItemForm.precoCusto ? parseFloat(novoItemForm.precoCusto.replace(',', '.')) : undefined,
      setorPreparo: novoItemForm.setorPreparo,
      disponivel: true,
      destaque: false,
    });

    setModalNovoItemCardapio(false);
    setNovoItemForm({
      nome: '',
      categoriaId: '',
      descricao: '',
      precoVenda: '',
      precoCusto: '',
      setorPreparo: 'cozinha',
    });
  }

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
          onClick={() => handleMudarAba('restaurantes')}
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
          onClick={() => handleMudarAba('editor_loja')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'editor_loja'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Ambiente de Edição das Lojas</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-black">
            Modificar
          </span>
        </button>

        <button
          onClick={() => handleMudarAba('financeiro')}
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
          onClick={() => handleMudarAba('planos')}
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
          onClick={() => handleMudarAba('whatsapp')}
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
          onClick={() => handleMudarAba('config')}
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
                            {/* Botão Editar Loja & Cardápio */}
                            <button
                              onClick={() => {
                                setTenantEmEdicaoId(tenant.id);
                                handleMudarAba('editor_loja');
                              }}
                              title="Editar dados, plano e cardápio deste restaurante"
                              className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Editar Loja</span>
                            </button>

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

      {/* CONTEÚDO DA ABA: AMBIENTE DE EDIÇÃO DAS LOJAS */}
      {abaAtiva === 'editor_loja' && (
        <div className="space-y-6">
          {/* Seletor Superior e Resumo da Loja */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                  Ambiente Central Franqueador
                </span>
                <span className="text-xs text-slate-400">• ID: {tenantEmEdicao?.id}</span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Modificar Restaurante: {tenantEmEdicao?.nomeFantasia}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione a loja para alterar dados cadastrais, vigência da assinatura, planos de acesso ou ajustar pratos e preços do cardápio.
              </p>
            </div>

            {/* Dropdown Seletor de Loja */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                  Alternar Restaurante:
                </label>
                <select
                  value={tenantEmEdicao?.id || ''}
                  onChange={(e) => setTenantEmEdicaoId(e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 bg-slate-950 border border-purple-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-400 transition-colors"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nomeFantasia} ({t.planoId.toUpperCase()} • {t.statusAssinatura})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto pt-4 sm:pt-4">
                <button
                  onClick={() => handleEntrarNaLoja(tenantEmEdicao.id)}
                  title="Abrir o PDV deste restaurante em Modo Suporte"
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspecionar PDV</span>
                </button>

                <button
                  onClick={() => setModalCobrancaWhatsApp(tenantEmEdicao)}
                  title="Cobrança PIX via WhatsApp"
                  className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-navegação interna do Editor: Dados vs Cardápio & Preços */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setSubAbaEditor('dados_loja')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subAbaEditor === 'dados_loja'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Dados Cadastrais & Assinatura</span>
            </button>

            <button
              onClick={() => setSubAbaEditor('cardapio_precos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subAbaEditor === 'cardapio_precos'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 border border-purple-500/30 text-purple-300 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-purple-400" />
              <span>Cardápio, Itens & Preços da Loja</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-black">
                Autonomia Total
              </span>
            </button>
          </div>

          {/* SUB-ABA 1: DADOS CADASTRAIS & ASSINATURA */}
          {subAbaEditor === 'dados_loja' && (
            <form onSubmit={handleSalvarEdicaoRestaurante} className="space-y-6">
              {sucessoSalvarEdicao && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{sucessoSalvarEdicao}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloco 1: Informações Gerais da Empresa */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-purple-400" />
                      <span>Dados Gerais & Contato</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {tenantEmEdicao?.id}</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Nome Fantasia do Restaurante *</label>
                      <input
                        type="text"
                        required
                        value={formEdicao.nomeFantasia}
                        onChange={(e) => setFormEdicao({ ...formEdicao, nomeFantasia: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Razão Social Oficial</label>
                      <input
                        type="text"
                        value={formEdicao.razaoSocial}
                        onChange={(e) => setFormEdicao({ ...formEdicao, razaoSocial: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">CNPJ ou CPF</label>
                        <input
                          type="text"
                          value={formEdicao.documento}
                          onChange={(e) => setFormEdicao({ ...formEdicao, documento: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Cidade / Estado</label>
                        <input
                          type="text"
                          value={formEdicao.cidadeUf}
                          onChange={(e) => setFormEdicao({ ...formEdicao, cidadeUf: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Responsável / Proprietário</label>
                        <input
                          type="text"
                          value={formEdicao.responsavelNome}
                          onChange={(e) => setFormEdicao({ ...formEdicao, responsavelNome: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">WhatsApp de Contato</label>
                        <input
                          type="text"
                          value={formEdicao.telefoneWhatsApp}
                          onChange={(e) => setFormEdicao({ ...formEdicao, telefoneWhatsApp: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">E-mail de Contato & Faturamento</label>
                      <input
                        type="email"
                        value={formEdicao.email}
                        onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Gestão do Plano, Status e Mensalidade */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Plano SaaS & Status da Assinatura</span>
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      formEdicao.statusAssinatura === 'ativo'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : formEdicao.statusAssinatura === 'trial'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {formEdicao.statusAssinatura}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Seleção de Plano */}
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">Plano Contratado</label>
                      <div className="grid grid-cols-3 gap-2">
                        {planos.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              setFormEdicao({
                                ...formEdicao,
                                planoId: p.id,
                                valorMensalidade: p.precoMensal,
                              });
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              formEdicao.planoId === p.id
                                ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-md shadow-purple-500/10'
                                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <p className="font-bold text-xs">{p.nome.replace('EloServe ', '')}</p>
                            <p className="font-mono text-[11px] text-emerald-400 mt-1 font-bold">
                              R$ {p.precoMensal}/mês
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Status da Assinatura</label>
                        <select
                          value={formEdicao.statusAssinatura}
                          onChange={(e) => setFormEdicao({ ...formEdicao, statusAssinatura: e.target.value as StatusAssinatura })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-purple-500"
                        >
                          <option value="ativo">Ativo (Acesso Completo)</option>
                          <option value="trial">Degustação Grátis (Trial)</option>
                          <option value="atrasado">Atrasado (Alerta de Fatura)</option>
                          <option value="bloqueado">Bloqueado (Acesso Suspenso)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Valor da Mensalidade (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formEdicao.valorMensalidade}
                          onChange={(e) => setFormEdicao({ ...formEdicao, valorMensalidade: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {formEdicao.statusAssinatura === 'trial' && (
                      <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                        <label className="text-amber-300 font-bold block text-[11px]">
                          Dias Restantes de Teste (Trial):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formEdicao.diasRestantesTrial}
                            onChange={(e) => setFormEdicao({ ...formEdicao, diasRestantesTrial: parseInt(e.target.value) || 0 })}
                            className="w-24 px-3 py-1.5 bg-slate-950 border border-amber-500/40 rounded-xl text-white font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setFormEdicao({ ...formEdicao, diasRestantesTrial: (formEdicao.diasRestantesTrial || 0) + 7 })}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30"
                          >
                            +7 Dias Grátis
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormEdicao({ ...formEdicao, diasRestantesTrial: (formEdicao.diasRestantesTrial || 0) + 15 })}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30"
                          >
                            +15 Dias
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Próximo Vencimento / Fechamento</label>
                      <input
                        type="text"
                        value={formEdicao.proximoVencimento}
                        onChange={(e) => setFormEdicao({ ...formEdicao, proximoVencimento: e.target.value })}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Gravação Principal */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações de {tenantEmEdicao?.nomeFantasia}</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-ABA 2: CARDÁPIO, ITENS & PREÇOS DA LOJA (AUTONOMIA SUPER ADMIN) */}
          {subAbaEditor === 'cardapio_precos' && (
            <div className="space-y-4">
              {/* Banner de autonomia */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3">
                <Crown className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">
                    Autonomia de Modificação de Cardápio para: {tenantEmEdicao?.nomeFantasia}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Aqui você pode alterar diretamente o preço de venda de qualquer produto, ativar ou pausar itens indisponíveis na cozinha, remover itens indesejados e cadastrar novos pratos. Qualquer alteração tem efeito imediato na operação do restaurante.
                  </p>
                </div>
              </div>

              {/* Barra de Filtros do Cardápio & Botão Novo Item */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={buscaItemCardapio}
                      onChange={(e) => setBuscaItemCardapio(e.target.value)}
                      placeholder="Buscar item do cardápio..."
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={categoriaCardapioFiltro}
                    onChange={(e) => setCategoriaCardapioFiltro(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="todas">Todas Categorias</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setModalNovoItemCardapio(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Item ao Cardápio</span>
                </button>
              </div>

              {/* Tabela de Produtos com Edição Rápida de Preço e Autonomia */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Item / Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Setor</th>
                      <th className="py-3 px-4">Preço Custo</th>
                      <th className="py-3 px-5">Preço Venda (R$)</th>
                      <th className="py-3 px-4">Disponibilidade</th>
                      <th className="py-3 px-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {produtos
                      .filter((prod) => {
                        const matchBusca = prod.nome.toLowerCase().includes(buscaItemCardapio.toLowerCase());
                        const matchCat = categoriaCardapioFiltro === 'todas' || prod.categoriaId === categoriaCardapioFiltro;
                        return matchBusca && matchCat;
                      })
                      .map((prod) => {
                        const cat = categorias.find((c) => c.id === prod.categoriaId);
                        const precoValorLocal = precosLocais[prod.id] !== undefined ? precosLocais[prod.id] : prod.precoVenda;
                        const precoSalvoRecente = feedbackPrecoSalvo === prod.id;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Nome & Descrição */}
                            <td className="py-3 px-5">
                              <div>
                                <span className="font-bold text-white text-sm block">{prod.nome}</span>
                                {prod.descricao && (
                                  <span className="text-[11px] text-slate-400 line-clamp-1">{prod.descricao}</span>
                                )}
                              </div>
                            </td>

                            {/* Categoria */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-purple-300 text-[10px] font-bold">
                                {cat?.nome || 'Geral'}
                              </span>
                            </td>

                            {/* Setor */}
                            <td className="py-3 px-4">
                              <span className="text-[11px] text-slate-400 capitalize flex items-center gap-1 font-mono">
                                <ChefHat className="w-3.5 h-3.5 text-slate-500" />
                                <span>{prod.setorPreparo}</span>
                              </span>
                            </td>

                            {/* Preço de Custo */}
                            <td className="py-3 px-4 font-mono text-slate-400">
                              {prod.precoCusto ? `R$ ${prod.precoCusto.toFixed(2)}` : '—'}
                            </td>

                            {/* Preço de Venda com Edição Instantânea */}
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-xs font-mono">R$</span>
                                <input
                                  type="number"
                                  step="0.10"
                                  value={precoValorLocal}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setPrecosLocais({ ...precosLocais, [prod.id]: val });
                                  }}
                                  onBlur={() => handleSalvarPrecoItem(prod.id)}
                                  className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg text-emerald-400 font-mono font-bold text-xs"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleSalvarPrecoItem(prod.id)}
                                  title="Confirmar alteração de preço"
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    precoSalvoRecente
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-800 text-slate-300 hover:bg-purple-600 hover:text-white'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>

                                {precoSalvoRecente && (
                                  <span className="text-[10px] text-emerald-400 font-bold animate-in fade-in">
                                    Salvo!
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Disponibilidade / Pausar Item */}
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => alternarDisponibilidade(prod.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  prod.disponivel
                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 hover:bg-rose-950/70 hover:text-rose-400'
                                    : 'bg-rose-950/70 text-rose-400 border border-rose-500/30 hover:bg-emerald-950/70 hover:text-emerald-400'
                                }`}
                              >
                                {prod.disponivel ? '🟢 Disponível' : '🔴 Pausado (Esgotado)'}
                              </button>
                            </td>

                            {/* Remover Item */}
                            <td className="py-3 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja remover "${prod.nome}" do cardápio deste restaurante?`)) {
                                    removerProduto(prod.id);
                                  }
                                }}
                                title="Remover item do cardápio"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* Modal: Adicionar Novo Item ao Cardápio pelo Super Admin */}
      {modalNovoItemCardapio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-400" />
                <span>Novo Item para: {tenantEmEdicao?.nomeFantasia}</span>
              </h3>
              <button
                onClick={() => setModalNovoItemCardapio(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarNovoItem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Item / Prato *</label>
                <input
                  type="text"
                  required
                  value={novoItemForm.nome}
                  onChange={(e) => setNovoItemForm({ ...novoItemForm, nome: e.target.value })}
                  placeholder="Ex: Combo Smash Burger Bacon Especial"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Categoria *</label>
                <select
                  value={novoItemForm.categoriaId}
                  onChange={(e) => setNovoItemForm({ ...novoItemForm, categoriaId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="text"
                    required
                    value={novoItemForm.precoVenda}
                    onChange={(e) => setNovoItemForm({ ...novoItemForm, precoVenda: e.target.value })}
                    placeholder="34,90"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preço de Custo (R$)</label>
                  <input
                    type="text"
                    value={novoItemForm.precoCusto}
                    onChange={(e) => setNovoItemForm({ ...novoItemForm, precoCusto: e.target.value })}
                    placeholder="11,20"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Setor de Preparo</label>
                <select
                  value={novoItemForm.setorPreparo}
                  onChange={(e) => setNovoItemForm({ ...novoItemForm, setorPreparo: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="cozinha">Cozinha (KDS)</option>
                  <option value="bar">Bar / Copa de Bebidas</option>
                  <option value="nenhum">Nenhum / Pronta Entrega</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Descrição / Ingredientes</label>
                <textarea
                  rows={2}
                  value={novoItemForm.descricao}
                  onChange={(e) => setNovoItemForm({ ...novoItemForm, descricao: e.target.value })}
                  placeholder="Dois blends smash, cheddar inglês, bacon crocante..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoItemCardapio(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Salvar no Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
