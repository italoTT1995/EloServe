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
  ArrowRight,
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
  Smartphone,
  Printer,
  Package,
  FileText,
  BarChart3,
  PieChart,
  Calculator,
  LineChart,
  Percent,
} from 'lucide-react';
import { useSaaSStore, AbaMasterSaaS } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { TipoPlanoSaaS, StatusAssinatura, Produto, PlanoAssinatura, TenantRestaurante } from '../types';

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
    atualizarPlano,
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

  // Estados para Customização de Planos & Mensalidades
  const [modalEditarPlano, setModalEditarPlano] = useState<PlanoAssinatura | null>(null);
  const [formPlano, setFormPlano] = useState({
    nome: '',
    precoMensal: 0,
    descricao: '',
    destaque: false,
    maxMesas: 999,
    maxCaixasSimultaneos: 5,
    kdsIncluso: true,
    whatsappIAIncluso: false,
    relatoriosAvancados: true,
    suportePrioritario: true,
    atualizarAssinantes: false,
  });

  const [precosPlanosLocais, setPrecosPlanosLocais] = useState<Record<string, number>>({});
  const [sucessoPlanoSalvo, setSucessoPlanoSalvo] = useState<string | null>(null);

  function handleSalvarPrecoPlanoRapido(planoId: TipoPlanoSaaS, novoPreco: number) {
    if (isNaN(novoPreco) || novoPreco < 0) return;
    atualizarPlano(planoId, { precoMensal: novoPreco }, false);
    setSucessoPlanoSalvo(planoId);
    setTimeout(() => setSucessoPlanoSalvo(null), 2500);
  }

  function handleAbrirModalEditarPlano(plano: PlanoAssinatura) {
    setModalEditarPlano(plano);
    setFormPlano({
      nome: plano.nome,
      precoMensal: plano.precoMensal,
      descricao: plano.descricao,
      destaque: !!plano.destaque,
      maxMesas: plano.limites.maxMesas,
      maxCaixasSimultaneos: plano.limites.maxCaixasSimultaneos,
      kdsIncluso: plano.limites.kdsIncluso,
      whatsappIAIncluso: plano.limites.whatsappIAIncluso,
      relatoriosAvancados: plano.limites.relatoriosAvancados,
      suportePrioritario: plano.limites.suportePrioritario,
      atualizarAssinantes: false,
    });
  }

  function handleSalvarModalPlano(e: React.FormEvent) {
    e.preventDefault();
    if (!modalEditarPlano) return;

    atualizarPlano(
      modalEditarPlano.id,
      {
        nome: formPlano.nome,
        precoMensal: Number(formPlano.precoMensal),
        descricao: formPlano.descricao,
        destaque: formPlano.destaque,
        limites: {
          maxMesas: Number(formPlano.maxMesas),
          maxCaixasSimultaneos: Number(formPlano.maxCaixasSimultaneos),
          kdsIncluso: formPlano.kdsIncluso,
          whatsappIAIncluso: formPlano.whatsappIAIncluso,
          relatoriosAvancados: formPlano.relatoriosAvancados,
          suportePrioritario: formPlano.suportePrioritario,
        },
      },
      formPlano.atualizarAssinantes
    );

    setSucessoPlanoSalvo(modalEditarPlano.id);
    setModalEditarPlano(null);
    setTimeout(() => setSucessoPlanoSalvo(null), 3000);
  }

  // Estados para Migração / Melhoria de Planos das Lojas
  const [modalMigrarLoja, setModalMigrarLoja] = useState<TenantRestaurante | null>(null);
  const [novoPlanoSelecionado, setNovoPlanoSelecionado] = useState<TipoPlanoSaaS>('enterprise');
  const [toastMigracao, setToastMigracao] = useState<string | null>(null);

  function handleConfirmarMigracaoPlano(e: React.FormEvent) {
    e.preventDefault();
    if (!modalMigrarLoja) return;

    mudarPlanoTenant(modalMigrarLoja.id, novoPlanoSelecionado);
    if (novoPlanoSelecionado === 'enterprise') {
      atualizarDadosTenant(modalMigrarLoja.id, { instanciaWhatsAppConectada: true });
    }

    const planoNovo = planos.find((p) => p.id === novoPlanoSelecionado);
    setToastMigracao(`Plano do restaurante "${modalMigrarLoja.nomeFantasia}" atualizado com sucesso para ${planoNovo?.nome || novoPlanoSelecionado}!`);
    setModalMigrarLoja(null);
    setTimeout(() => setToastMigracao(null), 4500);
  }

  function handleTrocarPlanoDireto(tenantId: string, novoPlano: TipoPlanoSaaS) {
    const t = tenants.find((item) => item.id === tenantId);
    if (!t) return;
    mudarPlanoTenant(tenantId, novoPlano);
    if (novoPlano === 'enterprise') {
      atualizarDadosTenant(tenantId, { instanciaWhatsAppConectada: true });
    }
    const planoNovo = planos.find((p) => p.id === novoPlano);
    setToastMigracao(`Plano de "${t.nomeFantasia}" alterado para ${planoNovo?.nome || novoPlano}!`);
    setTimeout(() => setToastMigracao(null), 4000);
  }

  // Estados para a Aba: Modificar Planos & Regras SaaS
  const [planoIdRegrasEmEdicao, setPlanoIdRegrasEmEdicao] = useState<TipoPlanoSaaS>('pro');
  const planoAtivoParaEdicao = planos.find((p) => p.id === planoIdRegrasEmEdicao) || planos[1] || planos[0];

  const [formRegrasPlano, setFormRegrasPlano] = useState({
    nome: planoAtivoParaEdicao?.nome || 'EloServe Pro',
    precoMensal: planoAtivoParaEdicao?.precoMensal || 199,
    precoAnual: planoAtivoParaEdicao?.precoAnual || 1990,
    taxaAdesao: planoAtivoParaEdicao?.limites.taxaAdesao ?? 0,
    descricao: planoAtivoParaEdicao?.descricao || '',
    destaque: !!planoAtivoParaEdicao?.destaque,
    maxMesas: planoAtivoParaEdicao?.limites.maxMesas ?? 999,
    maxCaixasSimultaneos: planoAtivoParaEdicao?.limites.maxCaixasSimultaneos ?? 5,
    maxUsuarios: planoAtivoParaEdicao?.limites.maxUsuarios ?? 10,
    maxItensCardapio: planoAtivoParaEdicao?.limites.maxItensCardapio ?? 999,
    maxPedidosMes: planoAtivoParaEdicao?.limites.maxPedidosMes ?? 9999,
    diasTrialPadrao: planoAtivoParaEdicao?.limites.diasTrialPadrao ?? 7,
    diasToleranciaAtraso: planoAtivoParaEdicao?.limites.diasToleranciaAtraso ?? 5,
    kdsIncluso: planoAtivoParaEdicao?.limites.kdsIncluso ?? true,
    whatsappIAIncluso: planoAtivoParaEdicao?.limites.whatsappIAIncluso ?? false,
    cardapioQrCodeIncluso: planoAtivoParaEdicao?.limites.cardapioQrCodeIncluso ?? true,
    garcomMobileIncluso: planoAtivoParaEdicao?.limites.garcomMobileIncluso ?? true,
    impressaoTermicaInclusa: planoAtivoParaEdicao?.limites.impressaoTermicaInclusa ?? true,
    controleEstoqueIncluso: planoAtivoParaEdicao?.limites.controleEstoqueIncluso ?? true,
    relatoriosAvancados: planoAtivoParaEdicao?.limites.relatoriosAvancados ?? true,
    suportePrioritario: planoAtivoParaEdicao?.limites.suportePrioritario ?? true,
    regrasTexto: planoAtivoParaEdicao?.regrasTexto || [],
    atualizarAssinantes: false,
  });

  const [novaRegraInput, setNovaRegraInput] = useState('');
  const [sucessoSalvarRegras, setSucessoSalvarRegras] = useState<string | null>(null);

  useEffect(() => {
    const p = planos.find((item) => item.id === planoIdRegrasEmEdicao);
    if (p) {
      setFormRegrasPlano({
        nome: p.nome,
        precoMensal: p.precoMensal,
        precoAnual: p.precoAnual || p.precoMensal * 10,
        taxaAdesao: p.limites.taxaAdesao ?? 0,
        descricao: p.descricao,
        destaque: !!p.destaque,
        maxMesas: p.limites.maxMesas,
        maxCaixasSimultaneos: p.limites.maxCaixasSimultaneos,
        maxUsuarios: p.limites.maxUsuarios ?? (p.id === 'starter' ? 3 : p.id === 'pro' ? 10 : 999),
        maxItensCardapio: p.limites.maxItensCardapio ?? (p.id === 'starter' ? 50 : 999),
        maxPedidosMes: p.limites.maxPedidosMes ?? (p.id === 'starter' ? 500 : p.id === 'pro' ? 9999 : 99999),
        diasTrialPadrao: p.limites.diasTrialPadrao ?? (p.id === 'enterprise' ? 14 : 7),
        diasToleranciaAtraso: p.limites.diasToleranciaAtraso ?? (p.id === 'starter' ? 3 : p.id === 'pro' ? 5 : 7),
        kdsIncluso: p.limites.kdsIncluso,
        whatsappIAIncluso: p.limites.whatsappIAIncluso,
        cardapioQrCodeIncluso: p.limites.cardapioQrCodeIncluso ?? true,
        garcomMobileIncluso: p.limites.garcomMobileIncluso ?? (p.id !== 'starter'),
        impressaoTermicaInclusa: p.limites.impressaoTermicaInclusa ?? true,
        controleEstoqueIncluso: p.limites.controleEstoqueIncluso ?? (p.id !== 'starter'),
        relatoriosAvancados: p.limites.relatoriosAvancados,
        suportePrioritario: p.limites.suportePrioritario,
        regrasTexto: p.regrasTexto || [],
        atualizarAssinantes: false,
      });
    }
  }, [planoIdRegrasEmEdicao, planos]);

  function handleAdicionarRegraTexto() {
    if (!novaRegraInput.trim()) return;
    setFormRegrasPlano((prev) => ({
      ...prev,
      regrasTexto: [...prev.regrasTexto, novaRegraInput.trim()],
    }));
    setNovaRegraInput('');
  }

  function handleRemoverRegraTexto(indexRemover: number) {
    setFormRegrasPlano((prev) => ({
      ...prev,
      regrasTexto: prev.regrasTexto.filter((_, idx) => idx !== indexRemover),
    }));
  }

  function handleSalvarRegrasPlano(e: React.FormEvent) {
    e.preventDefault();
    atualizarPlano(
      planoIdRegrasEmEdicao,
      {
        nome: formRegrasPlano.nome,
        precoMensal: Number(formRegrasPlano.precoMensal),
        precoAnual: Number(formRegrasPlano.precoAnual),
        descricao: formRegrasPlano.descricao,
        destaque: formRegrasPlano.destaque,
        regrasTexto: formRegrasPlano.regrasTexto,
        limites: {
          maxMesas: Number(formRegrasPlano.maxMesas),
          maxCaixasSimultaneos: Number(formRegrasPlano.maxCaixasSimultaneos),
          maxUsuarios: Number(formRegrasPlano.maxUsuarios),
          maxItensCardapio: Number(formRegrasPlano.maxItensCardapio),
          maxPedidosMes: Number(formRegrasPlano.maxPedidosMes),
          diasTrialPadrao: Number(formRegrasPlano.diasTrialPadrao),
          diasToleranciaAtraso: Number(formRegrasPlano.diasToleranciaAtraso),
          taxaAdesao: Number(formRegrasPlano.taxaAdesao),
          kdsIncluso: formRegrasPlano.kdsIncluso,
          whatsappIAIncluso: formRegrasPlano.whatsappIAIncluso,
          cardapioQrCodeIncluso: formRegrasPlano.cardapioQrCodeIncluso,
          garcomMobileIncluso: formRegrasPlano.garcomMobileIncluso,
          impressaoTermicaInclusa: formRegrasPlano.impressaoTermicaInclusa,
          controleEstoqueIncluso: formRegrasPlano.controleEstoqueIncluso,
          relatoriosAvancados: formRegrasPlano.relatoriosAvancados,
          suportePrioritario: formRegrasPlano.suportePrioritario,
        },
      },
      formRegrasPlano.atualizarAssinantes
    );

    setSucessoSalvarRegras(`Regras, limites e termos do plano "${formRegrasPlano.nome}" gravados com sucesso!`);
    setTimeout(() => setSucessoSalvarRegras(null), 4000);
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

  // Estados da Aba DRE Executivo e Gráficos SaaS
  const [periodoDRE, setPeriodoDRE] = useState<'mensal' | 'anual'>('mensal');
  const [simulacaoClientes, setSimulacaoClientes] = useState<number>(100);
  const [simulacaoTicketMedio, setSimulacaoTicketMedio] = useState<number>(199.0);
  const [custosInfraBase, setCustosInfraBase] = useState({
    cloudVps: 180.0,
    evolutionWhatsapp: 120.0,
    taxaGatewayPct: 2.9,
    impostoSimplesPct: 6.0,
    suporteMarketing: 350.0,
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
          onClick={() => handleMudarAba('dre_saas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'dre_saas'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>DRE Executivo & Gráficos</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase font-black">
            SaaS
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
          <span>Planos & Assinantes ({planos.length})</span>
        </button>

        <button
          onClick={() => handleMudarAba('regras_planos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'regras_planos'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Modificar Planos & Regras</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-black">
            Regras SaaS
          </span>
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

      {/* CONTEÚDO DA NOVA ABA: DRE EXECUTIVO & GRÁFICOS DO SAAS */}
      {abaAtiva === 'dre_saas' && (() => {
        const fator = periodoDRE === 'mensal' ? 1 : 12;
        const receitaAssinaturas = mrr * fator;
        const receitaOnboarding = (150 * (tenants.length > 0 ? 1 : 0)) * fator;
        const receitaBruta = receitaAssinaturas + receitaOnboarding;

        const deducoesImpostos = receitaBruta * (custosInfraBase.impostoSimplesPct / 100);
        const receitaLiquida = Math.max(0, receitaBruta - deducoesImpostos);

        const custoCloud = custosInfraBase.cloudVps * fator;
        const custoWhatsapp = custosInfraBase.evolutionWhatsapp * fator;
        const custoGateway = receitaBruta * (custosInfraBase.taxaGatewayPct / 100);
        const cogsTecnologia = custoCloud + custoWhatsapp + custoGateway;

        const lucroBruto = Math.max(0, receitaLiquida - cogsTecnologia);
        const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

        const despesasOpex = custosInfraBase.suporteMarketing * fator;
        const lucroLiquidoOperacional = lucroBruto - despesasOpex;
        const margemLiquidaPct = receitaLiquida > 0 ? (lucroLiquidoOperacional / receitaLiquida) * 100 : 0;

        // Cálculos do Simulador de Escala & Valuation
        const simuladoMRR = simulacaoClientes * simulacaoTicketMedio;
        const simuladoARR = simuladoMRR * 12;
        const simuladoCustoServidor = (180 + (simulacaoClientes * 3.5)) * 12;
        const simuladoImpostosGateway = simuladoARR * ((custosInfraBase.impostoSimplesPct + custosInfraBase.taxaGatewayPct) / 100);
        const simuladoOpexAnual = (600 + (simulacaoClientes * 5.0)) * 12;
        const simuladoLucroLiquido = Math.max(0, simuladoARR - simuladoCustoServidor - simuladoImpostosGateway - simuladoOpexAnual);
        const valuationMinimo = simuladoARR * 4.5;
        const valuationMaximo = simuladoARR * 6.0;

        // Dados do Histórico de MRR (Últimos 6 meses)
        const historicoMRR = [
          { mes: 'Mai/26', valor: 299, pct: '+0%', altura: '28%' },
          { mes: 'Jun/26', valor: 498, pct: '+66%', altura: '46%' },
          { mes: 'Jul/26', valor: 697, pct: '+40%', altura: '64%' },
          { mes: 'Ago/26', valor: 896, pct: '+28%', altura: '82%' },
          { mes: 'Set/26', valor: 996, pct: '+11%', altura: '91%' },
          { mes: 'Out/26', valor: mrr > 0 ? mrr : 1095, pct: '+10%', altura: '100%', atual: true },
        ];

        return (
          <div className="space-y-6">
            {/* Header da Aba DRE */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Inteligência Contábil & Financeira</span>
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                    SaaS B2B
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span>DRE Executivo & Métricas da Plataforma EloServe</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Demonstração consolidada do resultado operacional da sua empresa de software: receitas recorrentes, custos de infraestrutura em nuvem, margem de contribuição líquida e projeção de valuation de mercado.
                </p>
              </div>

              {/* Seletor Mensal / Anual */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setPeriodoDRE('mensal')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    periodoDRE === 'mensal'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visão Mensal (MRR)
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodoDRE('anual')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    periodoDRE === 'anual'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visão Anualizada (ARR)
                </button>
              </div>
            </div>

            {/* 4 Cards de KPIs Executivos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Receita Líquida */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Receita Operacional Líquida</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white font-mono">
                  R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-purple-400 font-semibold block">
                  Após dedução tributária ({custosInfraBase.impostoSimplesPct}%)
                </span>
              </div>

              {/* Margem Bruta SaaS */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Margem Bruta do Software</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {margemBrutaPct.toFixed(1)}%
                </p>
                <span className="text-[10px] text-emerald-400/80 font-semibold block">
                  Lucro Bruto: R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Lucro Líquido / EBITDA */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Lucro Líquido Operacional</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-400 font-mono">
                  R$ {lucroLiquidoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-blue-400/80 font-semibold block">
                  Margem Líquida Real: {margemLiquidaPct.toFixed(1)}%
                </span>
              </div>

              {/* GMV Global Processado */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">GMV Global dos Restaurantes</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-400 font-mono">
                  R$ 384.950,00
                </p>
                <span className="text-[10px] text-amber-400/80 font-semibold block">
                  Volume total movimentado no EloServe este mês
                </span>
              </div>
            </div>

            {/* SEÇÃO DE GRÁFICOS VISUAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico 1: Evolução Histórica do MRR (2 colunas) */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-purple-400" />
                      <span>Evolução do Faturamento Recorrente Mensal (MRR)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Histórico de crescimento da receita nos últimos 6 meses</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold font-mono self-start sm:self-auto">
                    +266% nos últimos 6 meses
                  </span>
                </div>

                {/* Área Visual do Gráfico de Barras */}
                <div className="h-56 pt-6 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-800 pb-3">
                  {historicoMRR.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Tooltip / Valor acima da barra */}
                      <div className="opacity-80 group-hover:opacity-100 transition-opacity text-center">
                        <span className="text-[10px] font-mono font-bold text-white block">
                          R$ {item.valor}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold block">
                          {item.pct}
                        </span>
                      </div>

                      {/* Barra */}
                      <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end h-full">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125 ${
                            item.atual
                              ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-300 shadow-lg shadow-emerald-500/30'
                              : 'bg-gradient-to-t from-purple-800 via-purple-600 to-indigo-400'
                          }`}
                          style={{ height: item.altura }}
                        />
                      </div>

                      {/* Legenda do Mês */}
                      <span className={`text-[11px] font-semibold ${item.atual ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {item.mes}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rodapé do Gráfico com Insights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Faturamento Inicial (Mai/26)</span>
                    <strong className="text-xs font-mono text-white">R$ 299,00/mês</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Faturamento Atual (Out/26)</span>
                    <strong className="text-xs font-mono text-emerald-400">R$ {mrr.toFixed(2)}/mês</strong>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Crescimento Médio Mensal</span>
                    <strong className="text-xs font-mono text-purple-300">+31.2% a.m.</strong>
                  </div>
                </div>
              </div>

              {/* Gráfico 2: Composição da Base & Custos (1 coluna) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    <span>Composição dos Assinantes</span>
                  </h4>
                  <p className="text-xs text-slate-400">Saúde e status da carteira de restaurantes</p>
                </div>

                {/* Donut Chart Visual SVG */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Fundo */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="3.8" />
                      {/* Ativos: 60% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.8"
                        strokeDasharray="60, 100"
                        strokeDashoffset="0"
                      />
                      {/* Trial: 20% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3.8"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-60"
                      />
                      {/* Atrasados: 20% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3.8"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-80"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white font-mono">{tenants.length}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Lojas</span>
                    </div>
                  </div>
                </div>

                {/* Legendas do Donut */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">Ativos Adimplentes</span>
                    </div>
                    <strong className="text-white font-mono">{totalAtivos} (60%)</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-300">Em Trial (7 dias grátis)</span>
                    </div>
                    <strong className="text-white font-mono">{totalTrials} (20%)</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-300">Faturas em Tolerância</span>
                    </div>
                    <strong className="text-white font-mono">{totalAtrasados} (20%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* TABELA DO DRE CONTÁBIL GERENCIAL COMPLETO */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Demonstração do Resultado do Exercício — DRE Gerencial ({periodoDRE === 'mensal' ? 'Mês Vigente' : '12 Meses'})</span>
                  </h4>
                  <p className="text-xs text-slate-400">Estrutura oficial padrão contábil e de governança para startups SaaS</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Base Tributária:</span>
                  <span className="text-xs font-bold text-purple-300 font-mono">Simples Nacional (6.0%)</span>
                </div>
              </div>

              {/* Tabela Estruturada */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Conta Contábil / Descrição</th>
                      <th className="py-3 px-4">Natureza da Operação</th>
                      <th className="py-3 px-4 text-right">Valor ({periodoDRE === 'mensal' ? 'R$/mês' : 'R$/ano'})</th>
                      <th className="py-3 px-4 text-right">Análise Vertical (AV%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {/* 1. Receita Operacional Bruta */}
                    <tr className="bg-purple-950/20 text-purple-200 font-bold">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-emerald-400 font-black">(+)</span>
                        <span>1. RECEITA OPERACIONAL BRUTA DO SAAS</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">Mensalidades + Taxas de Onboarding</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm">
                        R$ {receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {receitaLiquida > 0 ? ((receitaBruta / receitaLiquida) * 100).toFixed(1) : 100}%
                      </td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2.5 px-4 pl-8 text-slate-400">1.1. Mensalidades Recorrentes dos Planos (Starter, Pro, Enterprise)</td>
                      <td className="py-2.5 px-4 text-slate-500">Recorrência mensal ativa</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">
                        R$ {receitaAssinaturas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {receitaLiquida > 0 ? ((receitaAssinaturas / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-300">
                      <td className="py-2.5 px-4 pl-8 text-slate-400">1.2. Taxas de Implantação, Configuração & Onboarding (Setup)</td>
                      <td className="py-2.5 px-4 text-slate-500">Serviço de setup inicial de cardápio</td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">
                        R$ {receitaOnboarding.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {receitaLiquida > 0 ? ((receitaOnboarding / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>

                    {/* 2. Deduções */}
                    <tr className="bg-slate-950/40 text-slate-300 font-semibold">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-rose-400 font-black">(-)</span>
                        <span>2. DEDUÇÕES DA RECEITA BRUTA & TRIBUTOS</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">Impostos federais e municipais</td>
                      <td className="py-3 px-4 text-right text-rose-400 font-mono">
                        - R$ {deducoesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        -{custosInfraBase.impostoSimplesPct.toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">2.1. Simples Nacional (Anexo V - Serviços de Licenciamento de Software)</td>
                      <td className="py-2.5 px-4 text-slate-500">Alíquota estimada de 6.0%</td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-300">
                        - R$ {deducoesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">-6.0%</td>
                    </tr>

                    {/* 3. Receita Operacional Líquida */}
                    <tr className="bg-purple-950/40 text-purple-200 font-black border-y border-purple-500/30">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-purple-400 font-black">(=)</span>
                        <span>3. RECEITA OPERACIONAL LÍQUIDA (ROL)</span>
                      </td>
                      <td className="py-3 px-4 text-purple-300 font-semibold">Base de apuração 100%</td>
                      <td className="py-3 px-4 text-right text-white font-mono text-sm">
                        R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-purple-300">100.0%</td>
                    </tr>

                    {/* 4. Custos dos Serviços Prestados (COGS) */}
                    <tr className="bg-slate-950/40 text-slate-300 font-semibold">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-amber-400 font-black">(-)</span>
                        <span>4. CUSTOS DOS SERVIÇOS PRESTADOS (COGS - INFRAESTRUTURA DE NUVEM)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">Tecnologia, Servidores e APIs</td>
                      <td className="py-3 px-4 text-right text-amber-400 font-mono">
                        - R$ {cogsTecnologia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        -{receitaLiquida > 0 ? ((cogsTecnologia / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">4.1. Servidores Cloud VPS & Banco de Dados (AWS / DigitalOcean / Supabase)</td>
                      <td className="py-2.5 px-4 text-slate-500">Hospedagem de alta disponibilidade</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        - R$ {custoCloud.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {receitaLiquida > 0 ? ((custoCloud / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">4.2. Servidor de Conexão WhatsApp Multi-Tenant (Evolution API / Baileys)</td>
                      <td className="py-2.5 px-4 text-slate-500">Instâncias dedicadas para cada restaurante</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        - R$ {custoWhatsapp.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {receitaLiquida > 0 ? ((custoWhatsapp / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">4.3. Taxas de Gateway de Pagamento e Cobrança Automática (Asaas / Stripe 2.9%)</td>
                      <td className="py-2.5 px-4 text-slate-500">Processamento de PIX e Cartões de Crédito</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        - R$ {custoGateway.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {custosInfraBase.taxaGatewayPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* 5. Lucro Bruto */}
                    <tr className="bg-emerald-950/30 text-emerald-200 font-black border-y border-emerald-500/30">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-emerald-400 font-black">(=)</span>
                        <span>5. LUCRO BRUTO DO SAAS (MARGEM BRUTA: {margemBrutaPct.toFixed(1)}%)</span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">Rentabilidade primária do software</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm">
                        R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-300 font-bold">
                        {margemBrutaPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* 6. Despesas Operacionais (OPEX) */}
                    <tr className="bg-slate-950/40 text-slate-300 font-semibold">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-rose-400 font-black">(-)</span>
                        <span>6. DESPESAS OPERACIONAIS GERAIS (OPEX)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">Comercial, Suporte e Marketing</td>
                      <td className="py-3 px-4 text-right text-rose-400 font-mono">
                        - R$ {despesasOpex.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        -{receitaLiquida > 0 ? ((despesasOpex / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">6.1. Tráfego Pago & Aquisição de Clientes (Google Ads / Meta Ads para Restaurantes)</td>
                      <td className="py-2.5 px-4 text-slate-500">Captação de novos estabelecimentos</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        - R$ {(despesasOpex * 0.65).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {receitaLiquida > 0 ? (((despesasOpex * 0.65) / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2.5 px-4 pl-8">6.2. Softwares de Suporte, Helpdesk & Atendimento ao Cliente</td>
                      <td className="py-2.5 px-4 text-slate-500">Ferramentas de atendimento e CRM</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        - R$ {(despesasOpex * 0.35).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                        {receitaLiquida > 0 ? (((despesasOpex * 0.35) / receitaLiquida) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>

                    {/* 7. EBITDA / Lucro Líquido Final */}
                    <tr className="bg-gradient-to-r from-emerald-950/60 to-purple-950/60 text-white font-black text-sm border-t-2 border-emerald-500">
                      <td className="py-4 px-4 flex items-center gap-2">
                        <span className="text-emerald-400 font-black text-lg">(=)</span>
                        <span className="tracking-wide">7. RESULTADO OPERACIONAL LÍQUIDO / EBITDA (LUCRO FINAL)</span>
                      </td>
                      <td className="py-4 px-4 text-emerald-300 font-semibold text-xs">Sobra limpa para o Dono do SaaS</td>
                      <td className="py-4 px-4 text-right text-emerald-400 font-mono text-base font-black">
                        R$ {lucroLiquidoOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-emerald-400 font-black text-sm">
                        {margemLiquidaPct.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SIMULADOR DE ESCALA & VALUATION DO ELOSERVE */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-400" />
                    <span>Simulador de Escala, Lucro & Valuation do EloServe</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Projete quantos restaurantes sua empresa precisa conquistar para atingir o faturamento e valuation desejados.
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold self-start sm:self-auto font-mono">
                  Múltiplo de Mercado: 4.5x a 6.0x ARR
                </span>
              </div>

              {/* Controles de Simulação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                {/* Meta de Restaurantes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-bold">Meta de Restaurantes Assinantes:</label>
                    <span className="text-purple-400 font-black font-mono text-sm">{simulacaoClientes} lojas</span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={simulacaoClientes}
                    onChange={(e) => setSimulacaoClientes(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />

                  {/* Botões Rápidos */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {[25, 50, 100, 200, 350, 500].map((qtd) => (
                      <button
                        key={qtd}
                        type="button"
                        onClick={() => setSimulacaoClientes(qtd)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          simulacaoClientes === qtd
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {qtd} lojas
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Médio por Restaurante */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-300 font-bold">Ticket Médio de Mensalidade:</label>
                    <span className="text-emerald-400 font-black font-mono text-sm">R$ {simulacaoTicketMedio.toFixed(2)}/mês</span>
                  </div>

                  {/* Seletor de Plano de Referência */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimulacaoTicketMedio(99.0)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        simulacaoTicketMedio === 99.0
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] block text-slate-400">Plano Starter</span>
                      <strong className="text-xs font-mono">R$ 99/mês</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimulacaoTicketMedio(199.0)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        simulacaoTicketMedio === 199.0
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] block text-emerald-400 font-bold">Plano Pro (Mais vendido)</span>
                      <strong className="text-xs font-mono">R$ 199/mês</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimulacaoTicketMedio(299.0)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        simulacaoTicketMedio === 299.0
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] block text-slate-400">Plano Enterprise</span>
                      <strong className="text-xs font-mono">R$ 299/mês</strong>
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultados da Projeção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MRR Projetado */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">MRR Projetado (Mensal)</span>
                  <p className="text-xl font-black text-white font-mono">
                    R$ {simuladoMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-purple-400 font-semibold block">
                    {simulacaoClientes} assinantes x R$ {simulacaoTicketMedio.toFixed(0)}
                  </span>
                </div>

                {/* ARR Projetado */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ARR Projetado (Anual)</span>
                  <p className="text-xl font-black text-purple-400 font-mono">
                    R$ {simuladoARR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Receita bruta anual recorrente
                  </span>
                </div>

                {/* Lucro Líquido Projetado */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Lucro Líquido Anual Est.</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">
                    R$ {simuladoLucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-emerald-400/80 font-semibold block">
                    ~R$ {(simuladoLucroLiquido / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês líquido
                  </span>
                </div>

                {/* Valuation Estimado da Empresa */}
                <div className="bg-gradient-to-br from-purple-950/80 to-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-1 shadow-lg">
                  <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-purple-400" />
                    <span>Valuation do EloServe</span>
                  </span>
                  <p className="text-lg font-black text-amber-300 font-mono">
                    R$ {valuationMinimo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Até <strong className="text-white font-mono">R$ {valuationMaximo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong> (6x ARR)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
        <div className="space-y-6">
          {/* Header da aba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-3xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                  Configuração de Mensalidades
                </span>
                {sucessoPlanoSalvo && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Plano atualizado com sucesso!</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Customização de Planos & Valores de Assinatura</span>
              </h3>
              <p className="text-xs text-slate-400">
                Altere os valores de mensalidade, limites de mesas/caixas e recursos inclusos em cada plano. Todas as alterações refletem imediatamente nas propostas e cobranças.
              </p>
            </div>
          </div>

          {/* Banner de atalho direto para a aba de Regras */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Deseja editar detalhadamente as regras de negócio de cada plano?</h4>
                <p className="text-xs text-slate-300">
                  Defina tolerância a atrasos, dias de trial, módulos liberados (KDS, IA, QR Code, Garçom Mobile) e cláusulas de uso em uma aba dedicada.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleMudarAba('regras_planos')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-purple-200" />
              <span>Abrir Aba de Regras dos Planos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards dos Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planos.map((p) => {
              const precoAtual = precosPlanosLocais[p.id] !== undefined ? precosPlanosLocais[p.id] : p.precoMensal;
              const foiSalvoRecentemente = sucessoPlanoSalvo === p.id;
              const totalAssinantes = tenants.filter((t) => t.planoId === p.id).length;

              return (
                <div
                  key={p.id}
                  className={`bg-slate-900 border rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                    p.destaque
                      ? 'border-purple-500/50 shadow-purple-500/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {p.id}
                      </span>
                      {p.destaque && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          Mais Vendido
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black text-white">{p.nome}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.descricao}</p>

                    {/* Bloco de Preço Customizável com Edição Rápida */}
                    <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Valor da Mensalidade
                        </span>
                        <span className="text-[10px] text-purple-400 font-semibold font-mono">
                          {totalAssinantes} restaurantes
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-400 font-mono">R$</span>
                        <input
                          type="number"
                          step="1.00"
                          value={precoAtual}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setPrecosPlanosLocais({ ...precosPlanosLocais, [p.id]: val });
                          }}
                          onBlur={() => {
                            if (precosPlanosLocais[p.id] !== undefined) {
                              handleSalvarPrecoPlanoRapido(p.id, precosPlanosLocais[p.id]);
                            }
                          }}
                          className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl text-xl font-black text-emerald-400 font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSalvarPrecoPlanoRapido(p.id, precoAtual)}
                          title="Salvar novo valor de mensalidade"
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            foiSalvoRecentemente
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                          }`}
                        >
                          {foiSalvoRecentemente ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Salvo!</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Salvar</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Botões rápidos de ajuste de valor */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500">Ajuste:</span>
                        {[-10, +10, +20, +50].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => {
                              const novo = Math.max(0, precoAtual + delta);
                              setPrecosPlanosLocais({ ...precosPlanosLocais, [p.id]: novo });
                              handleSalvarPrecoPlanoRapido(p.id, novo);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-purple-900/40 hover:text-purple-300 text-[10px] text-slate-400 font-mono font-bold transition-colors cursor-pointer border border-slate-800"
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <p className="text-slate-500 font-bold uppercase text-[10px]">Limites Operacionais:</p>
                      <p>
                        • Mesas:{' '}
                        <strong className="text-white">
                          {p.limites.maxMesas > 100 ? 'Ilimitadas' : `${p.limites.maxMesas} mesas`}
                        </strong>
                      </p>
                      <p>
                        • Caixas PDV simultâneos:{' '}
                        <strong className="text-white">
                          {p.limites.maxCaixasSimultaneos > 10 ? 'Ilimitados' : `${p.limites.maxCaixasSimultaneos} caixa(s)`}
                        </strong>
                      </p>
                      <p>
                        • Painel de Cozinha KDS:{' '}
                        <strong className={p.limites.kdsIncluso ? 'text-emerald-400' : 'text-slate-500'}>
                          {p.limites.kdsIncluso ? 'Habilitado' : 'Não incluso'}
                        </strong>
                      </p>
                      <p>
                        • Atendente EloBot IA:{' '}
                        <strong className={p.limites.whatsappIAIncluso ? 'text-purple-400' : 'text-slate-500'}>
                          {p.limites.whatsappIAIncluso ? 'Incluso 24h' : 'Opcional'}
                        </strong>
                      </p>
                    </div>

                    {/* Lugares / Restaurantes que têm este plano */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-purple-400" />
                          <span>Restaurantes neste Plano:</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                          {tenants.filter((t) => t.planoId === p.id).length} {tenants.filter((t) => t.planoId === p.id).length === 1 ? 'loja' : 'lojas'}
                        </span>
                      </div>

                      {tenants.filter((t) => t.planoId === p.id).length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic py-1">
                          Nenhum restaurante assinando este plano no momento.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {tenants.filter((t) => t.planoId === p.id).map((t) => (
                            <div
                              key={t.id}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{t.nomeFantasia}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {t.cidadeUf} • <strong className="text-emerald-400 font-mono">R$ {t.valorMensalidade.toFixed(2)}</strong>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setModalMigrarLoja(t);
                                  if (p.id === 'starter') setNovoPlanoSelecionado('pro');
                                  else if (p.id === 'pro') setNovoPlanoSelecionado('enterprise');
                                  else setNovoPlanoSelecionado('enterprise');
                                }}
                                title="Modificar plano deste restaurante para melhoria"
                                className="px-2 py-1 rounded-lg bg-purple-950 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Mudar</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAbrirModalEditarPlano(p)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-3"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Customizar Limites & Recursos do Plano</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* PAINEL CENTRAL INTUITIVO: ONDE OS PLANOS ESTÃO INSTALADOS & MIGRAÇÃO */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-400" />
                  <span>Central de Restaurantes Assinantes & Possibilidades de Melhoria</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Veja em tempo real onde cada plano está instalado e altere o plano de qualquer restaurante para desbloquear melhorias e novas ferramentas (KDS, WhatsApp IA ou mesas ilimitadas).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Total: <strong className="text-white">{tenants.length} restaurantes</strong></span>
              </div>
            </div>

            {toastMigracao && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMigracao}</span>
              </div>
            )}

            {/* Tabela Interativa de Lojas e Planos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Restaurante / Localidade</th>
                    <th className="py-3 px-4">Responsável & Contato</th>
                    <th className="py-3 px-4">Plano Atual</th>
                    <th className="py-3 px-4">Mensalidade</th>
                    <th className="py-3 px-4">Recursos Desbloqueados</th>
                    <th className="py-3 px-5 text-right">Alterar Plano para Melhoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {tenants.map((t) => {
                    const planoDoTenant = planos.find((p) => p.id === t.planoId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Restaurante */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm">{t.nomeFantasia}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{t.cidadeUf}</span>
                        </td>

                        {/* Contato */}
                        <td className="py-3.5 px-4">
                          <p className="text-slate-300 font-semibold">{t.responsavelNome}</p>
                          <p className="text-[11px] text-emerald-400 font-mono">{t.telefoneWhatsApp}</p>
                        </td>

                        {/* Plano Atual */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                            t.planoId === 'enterprise'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                              : t.planoId === 'pro'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {planoDoTenant?.nome.replace('EloServe ', '') || t.planoId}
                          </span>
                        </td>

                        {/* Valor Mensalidade */}
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          R$ {t.valorMensalidade.toFixed(2)}/mês
                        </td>

                        {/* Recursos */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {(planoDoTenant?.limites.maxMesas ?? 0) > 100 ? 'Mesas Ilimitadas' : `${planoDoTenant?.limites.maxMesas ?? 0} Mesas`}
                            </span>
                            {planoDoTenant?.limites.kdsIncluso && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                                KDS
                              </span>
                            )}
                            {planoDoTenant?.limites.whatsappIAIncluso && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                                Robô IA WhatsApp
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Seletor Rápido de Upgrade/Melhoria */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={t.planoId}
                              onChange={(e) => handleTrocarPlanoDireto(t.id, e.target.value as TipoPlanoSaaS)}
                              className="px-2.5 py-1.5 bg-slate-950 border border-purple-500/40 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
                            >
                              {planos.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nome.replace('EloServe ', '')} (R$ {p.precoMensal.toFixed(2)})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                setModalMigrarLoja(t);
                                if (t.planoId === 'starter') setNovoPlanoSelecionado('pro');
                                else if (t.planoId === 'pro') setNovoPlanoSelecionado('enterprise');
                                else setNovoPlanoSelecionado('enterprise');
                              }}
                              title="Comparar recursos e fazer upgrade para melhoria"
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-purple-600/25 cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Melhorar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparativo Visual Intuitivo entre Planos */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Comparativo Rápido de Recursos & Vantagens por Nível</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Nível Starter (Essencial)</span>
                <p className="text-white font-black text-sm">Ideal para Bares e Cafés Pequenos</p>
                <ul className="space-y-1 text-slate-300 text-[11px] pt-1">
                  <li>✓ PDV Frente de Caixa Rápido</li>
                  <li>✓ Até 10 Mesas no Salão</li>
                  <li>✗ Sem painel de Cozinha KDS</li>
                  <li>✗ Sem Robô de WhatsApp IA</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <span className="text-blue-400 font-bold uppercase text-[10px]">Nível Pro (Operação Completa)</span>
                <p className="text-white font-black text-sm">Ideal para Pizzarias & Restaurantes Médios</p>
                <ul className="space-y-1 text-slate-300 text-[11px] pt-1">
                  <li>✓ PDV Frente de Caixa + 5 Caixas</li>
                  <li>✓ Mesas Ilimitadas no Salão</li>
                  <li>✓ <strong>Painel de Cozinha KDS Habilitado</strong></li>
                  <li>✗ Sem Robô de WhatsApp IA</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <span className="text-purple-400 font-bold uppercase text-[10px]">Nível Enterprise & IA (Automação Total)</span>
                <p className="text-white font-black text-sm">Máxima Eficiência e Vendas 24h</p>
                <ul className="space-y-1 text-slate-300 text-[11px] pt-1">
                  <li>✓ Mesas & Caixas PDV Ilimitados</li>
                  <li>✓ Painel de Cozinha KDS Habilitado</li>
                  <li>✓ <strong>EloBot Inteligência Artificial no WhatsApp 24h</strong></li>
                  <li>✓ Suporte Prioritário Franqueador</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA DEDICADA: MODIFICAR PLANOS & REGRAS */}
      {abaAtiva === 'regras_planos' && (
        <div className="space-y-6">
          {/* Header da aba */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    Modificar Planos & Regras Operacionais SaaS
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Controle Franqueador
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Defina os preços, limites de mesas/caixas, módulos tecnológicos habilitados, regras de tolerância de atraso e cláusulas contratuais de cada plano.
                </p>
              </div>
            </div>

            {/* Ação rápida / status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                {tenants.length} Restaurantes Assinantes
              </span>
            </div>
          </div>

          {/* Feedback de sucesso */}
          {sucessoSalvarRegras && (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-xl animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{sucessoSalvarRegras}</span>
            </div>
          )}

          {/* SELETOR DO PLANO PARA EDIÇÃO (Cards Superiores) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planos.map((p) => {
              const isSelected = planoIdRegrasEmEdicao === p.id;
              const totalLojasNestePlano = tenants.filter((t) => t.planoId === p.id).length;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlanoIdRegrasEmEdicao(p.id)}
                  className={`p-5 rounded-3xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Plano {p.id}
                    </span>
                    {p.destaque && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Mais Vendido
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-white mt-1">{p.nome}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      R$ {p.precoMensal.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">/mês</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Assinantes Ativos:</span>
                    <span className="font-bold text-white font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {totalLojasNestePlano} restaurantes
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                      <span>Editando Regras Deste Plano</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* FORMULÁRIO COMPLETO DE MODIFICAÇÃO DO PLANO & REGRAS */}
          <form onSubmit={handleSalvarRegrasPlano} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUNA ESQUERDA & CENTRO: CONFIGURAÇÕES E REGRAS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* BLOCO 1: DADOS COMERCIAIS & PREÇIFICAÇÃO */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Valores & Identificação Comercial do Plano</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {planoIdRegrasEmEdicao}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Nome Comercial do Plano *</label>
                      <input
                        type="text"
                        required
                        value={formRegrasPlano.nome}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, nome: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Preço Mensal (R$/mês) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formRegrasPlano.precoMensal}
                          onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, precoMensal: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Preço Anual com Desconto (R$/ano)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formRegrasPlano.precoAnual}
                          onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, precoAnual: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Taxa de Adesão / Implantação (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formRegrasPlano.taxaAdesao}
                          onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, taxaAdesao: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00 = Grátis"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Descrição Comercial / Proposta de Valor</label>
                    <textarea
                      rows={2}
                      value={formRegrasPlano.descricao}
                      onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, descricao: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs resize-none focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-white font-bold block">Marcar como "Mais Vendido" / "Recomendado"</span>
                      <span className="text-[11px] text-slate-400">Destaca o card do plano para novos clientes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formRegrasPlano.destaque}
                      onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, destaque: e.target.checked })}
                      className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* BLOCO 2: REGRAS OPERACIONAIS DE CAPACIDADE & LIMITES */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Regras de Capacidade & Limites Operacionais</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Controle exatamente até onde o restaurante assinante pode expandir suas operações com este plano.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Máximo de Mesas no Salão</label>
                      <input
                        type="number"
                        value={formRegrasPlano.maxMesas}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxMesas: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Acima de 100 = Ilimitadas</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Caixas PDV Simultâneos</label>
                      <input
                        type="number"
                        value={formRegrasPlano.maxCaixasSimultaneos}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxCaixasSimultaneos: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Acima de 10 = Ilimitados</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Usuários / Garçons</label>
                      <input
                        type="number"
                        value={formRegrasPlano.maxUsuarios}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxUsuarios: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Acima de 50 = Ilimitados</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Máximo de Itens no Cardápio</label>
                      <input
                        type="number"
                        value={formRegrasPlano.maxItensCardapio}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxItensCardapio: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Acima de 300 = Ilimitados</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Pedidos / Mês Inclusos</label>
                      <input
                        type="number"
                        value={formRegrasPlano.maxPedidosMes}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxPedidosMes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Acima de 5.000 = Ilimitados</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block">Tolerância Bloqueio Atraso</label>
                      <input
                        type="number"
                        value={formRegrasPlano.diasToleranciaAtraso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, diasToleranciaAtraso: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 block">Dias após o vencimento</span>
                    </div>
                  </div>
                </div>

                {/* BLOCO 3: REGRAS DE MÓDULOS TECNOLÓGICOS (FEATURE FLAGS) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Regras de Módulos & Recursos Tecnológicos Liberados</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ative ou bloqueie funcionalidades exclusivas que agregam valor ao plano.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.kdsIncluso
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4 text-emerald-400" />
                          <span>Painel Cozinha & KDS em Tempo Real</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Comandas digitais na tela da cozinha e bar</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.kdsIncluso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, kdsIncluso: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.whatsappIAIncluso
                        ? 'bg-purple-950/40 border-purple-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span>EloBot IA WhatsApp 24h</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Atendimento e cardápio automático com IA</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.whatsappIAIncluso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, whatsappIAIncluso: e.target.checked })}
                        className="w-5 h-5 accent-purple-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.cardapioQrCodeIncluso
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-blue-400" />
                          <span>Cardápio Digital QR Code nas Mesas</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Clientes visualizam e pedem pelo celular</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.cardapioQrCodeIncluso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, cardapioQrCodeIncluso: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.garcomMobileIncluso
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-indigo-400" />
                          <span>Comanda Garçom Mobile</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Lançamento de pedidos direto na mesa</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.garcomMobileIncluso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, garcomMobileIncluso: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.impressaoTermicaInclusa
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Impressão Automática Térmica (ESC/POS)</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Cupom de fechamento e vias de produção</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.impressaoTermicaInclusa}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, impressaoTermicaInclusa: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.controleEstoqueIncluso
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-teal-400" />
                          <span>Controle de Estoque & Ficha Técnica</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Baixa automática de ingredientes nos pratos</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.controleEstoqueIncluso}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, controleEstoqueIncluso: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.relatoriosAvancados
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span>Relatórios Financeiros Avançados & DRE</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Análise de CMV, lucratividade e ticket médio</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.relatoriosAvancados}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, relatoriosAvancados: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                    </label>

                    <label className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      formRegrasPlano.suportePrioritario
                        ? 'bg-purple-950/30 border-purple-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold block text-white flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-purple-400" />
                          <span>Suporte Prioritário Franqueador 24/7</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Canal direto WhatsApp com tempo de resposta VIP</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formRegrasPlano.suportePrioritario}
                        onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, suportePrioritario: e.target.checked })}
                        className="w-5 h-5 accent-purple-500 rounded cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                </div>

                {/* BLOCO 4: REGRAS & TERMOS DE USO DO PLANO (CLÁUSULAS TEXTUAIS) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>Cláusulas & Regras de Uso Visíveis para o Restaurante</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Essas regras são exibidas para os restaurantes no painel "Minha Assinatura" e na proposta contratual.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {formRegrasPlano.regrasTexto.length} regras cadastradas
                    </span>
                  </div>

                  {/* Input para adicionar nova regra */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaRegraInput}
                      onChange={(e) => setNovaRegraInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAdicionarRegraTexto();
                        }
                      }}
                      placeholder="Ex: Treinamento remoto de garçons incluso; Cancelamento sem multa..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAdicionarRegraTexto}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Regra</span>
                    </button>
                  </div>

                  {/* Lista de regras cadastradas com exclusão */}
                  <div className="space-y-2 pt-1">
                    {formRegrasPlano.regrasTexto.map((regra, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-slate-200">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{regra}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverRegraTexto(idx)}
                          title="Remover esta regra"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: PREVIEW AO VIVO DO PLANO & SALVAMENTO */}
              <div className="space-y-6">
                
                {/* Card de Ação Principal: Salvar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 sticky top-4">
                  <div className="pb-3 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                      Aplicar Modificações
                    </span>
                    <h4 className="text-base font-black text-white mt-0.5">
                      Gravar Regras do {formRegrasPlano.nome}
                    </h4>
                  </div>

                  {/* Opção de propagação imediata para clientes ativos */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="checkPropagar"
                      checked={formRegrasPlano.atualizarAssinantes}
                      onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, atualizarAssinantes: e.target.checked })}
                      className="w-5 h-5 accent-purple-600 rounded cursor-pointer mt-0.5 shrink-0"
                    />
                    <label htmlFor="checkPropagar" className="text-xs text-slate-300 cursor-pointer">
                      <strong className="text-white block font-bold">Atualizar Assinantes Ativos</strong>
                      Aplica os novos valores e regras imediatamente a todos os {tenants.filter((t) => t.planoId === planoIdRegrasEmEdicao).length} restaurantes cadastrados neste plano.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl shadow-purple-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    <span>Salvar Regras do Plano</span>
                  </button>

                  {/* PREVIEW DO CARD COMO O RESTAURANTE ENXERGA */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Preview Ao Vivo para o Cliente:
                    </span>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{formRegrasPlano.nome}</span>
                        {formRegrasPlano.destaque && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            Recomendado
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xl font-black text-emerald-400 font-mono">
                          R$ {formRegrasPlano.precoMensal.toFixed(2)}
                          <span className="text-xs text-slate-400 font-normal"> / mês</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">{formRegrasPlano.descricao}</p>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2">
                        <p className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{formRegrasPlano.maxMesas > 100 ? 'Mesas Ilimitadas' : `Até ${formRegrasPlano.maxMesas} mesas`}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{formRegrasPlano.maxCaixasSimultaneos > 10 ? 'Caixas PDV Ilimitados' : `Até ${formRegrasPlano.maxCaixasSimultaneos} caixa(s)`}</span>
                        </p>
                        {formRegrasPlano.kdsIncluso && (
                          <p className="flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>Painel KDS de Cozinha Ativo</span>
                          </p>
                        )}
                        {formRegrasPlano.whatsappIAIncluso && (
                          <p className="flex items-center gap-1.5 text-purple-400 font-bold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>EloBot Inteligência Artificial 24h</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </form>
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

      {/* Modal: Customizar Plano e Valores pelo Super Admin */}
      {modalEditarPlano && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white">
                  Editar Plano: {modalEditarPlano.nome}
                </h3>
              </div>
              <button
                onClick={() => setModalEditarPlano(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarModalPlano} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome Comercial do Plano *</label>
                <input
                  type="text"
                  required
                  value={formPlano.nome}
                  onChange={(e) => setFormPlano({ ...formPlano, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Valor da Mensalidade (R$/mês) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPlano.precoMensal}
                    onChange={(e) => setFormPlano({ ...formPlano, precoMensal: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  value={formPlano.descricao}
                  onChange={(e) => setFormPlano({ ...formPlano, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Marcar como "Mais Vendido"</span>
                  <span className="text-[11px] text-slate-400">Exibe uma etiqueta de recomendação no plano</span>
                </div>
                <input
                  type="checkbox"
                  checked={formPlano.destaque}
                  onChange={(e) => setFormPlano({ ...formPlano, destaque: e.target.checked })}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Limites Operacionais */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Limites Operacionais do Plano
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Máximo de Mesas</label>
                    <input
                      type="number"
                      value={formPlano.maxMesas}
                      onChange={(e) => setFormPlano({ ...formPlano, maxMesas: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Acima de 100 = Ilimitadas</span>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Caixas Simultâneos</label>
                    <input
                      type="number"
                      value={formPlano.maxCaixasSimultaneos}
                      onChange={(e) => setFormPlano({ ...formPlano, maxCaixasSimultaneos: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Acima de 10 = Ilimitados</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPlano.kdsIncluso}
                      onChange={(e) => setFormPlano({ ...formPlano, kdsIncluso: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Painel Cozinha (KDS)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPlano.whatsappIAIncluso}
                      onChange={(e) => setFormPlano({ ...formPlano, whatsappIAIncluso: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">EloBot IA WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Opção de propagar para assinantes ativos */}
              <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-purple-300 font-bold block">Atualizar Restaurantes Ativos</span>
                  <span className="text-[11px] text-slate-400">
                    Aplica o novo valor para todos os restaurantes atualmente neste plano
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formPlano.atualizarAssinantes}
                  onChange={(e) => setFormPlano({ ...formPlano, atualizarAssinantes: e.target.checked })}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarPlano(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações do Plano</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Migração / Melhoria de Plano do Restaurante */}
      {modalMigrarLoja && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    Melhorar / Alterar Plano do Restaurante
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Restaurante: <strong className="text-white">{modalMigrarLoja.nomeFantasia}</strong> ({modalMigrarLoja.cidadeUf})
                </p>
              </div>
              <button
                onClick={() => setModalMigrarLoja(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarMigracaoPlano} className="space-y-4 text-xs">
              {/* Plano Atual */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Plano Atual</span>
                  <p className="text-sm font-black text-white">
                    {planos.find((p) => p.id === modalMigrarLoja.planoId)?.nome || modalMigrarLoja.planoId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mensalidade Atual</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    R$ {modalMigrarLoja.valorMensalidade.toFixed(2)}/mês
                  </span>
                </div>
              </div>

              {/* Escolha do Novo Plano */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">
                  Selecione o Novo Plano Desejado:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {planos.map((p) => {
                    const isSelecionado = novoPlanoSelecionado === p.id;
                    const isAtual = modalMigrarLoja.planoId === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNovoPlanoSelecionado(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          isSelecionado
                            ? 'border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/50'
                            : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {isAtual && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                            Atual
                          </span>
                        )}
                        <p className="font-extrabold text-xs text-white">{p.nome.replace('EloServe ', '')}</p>
                        <p className="font-mono text-xs text-emerald-400 font-bold mt-1">
                          R$ {p.precoMensal}/mês
                        </p>
                        <div className="mt-2 space-y-0.5 text-[10px] text-slate-300">
                          <p>{p.limites.maxMesas > 100 ? '✓ Mesas Ilimitadas' : `✓ Até ${p.limites.maxMesas} mesas`}</p>
                          <p>{p.limites.kdsIncluso ? '✓ KDS Cozinha' : '✗ Sem KDS'}</p>
                          <p>{p.limites.whatsappIAIncluso ? '✓ WhatsApp IA' : '✗ Sem Bot IA'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparativo de Impacto & Benefícios da Mudança */}
              {(() => {
                const planoAlvo = planos.find((p) => p.id === novoPlanoSelecionado);
                if (!planoAlvo) return null;

                const diferenca = planoAlvo.precoMensal - modalMigrarLoja.valorMensalidade;
                const isUpgrade = diferenca > 0;

                return (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-300">Impacto na Mensalidade:</span>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-slate-400">R$ {modalMigrarLoja.valorMensalidade.toFixed(2)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-emerald-400 font-bold">R$ {planoAlvo.precoMensal.toFixed(2)}/mês</span>
                        {diferenca !== 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${
                            isUpgrade ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {isUpgrade ? `+R$ ${diferenca.toFixed(2)}` : `-R$ ${Math.abs(diferenca).toFixed(2)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-purple-500/20 pt-2 space-y-1">
                      <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>O que muda para {modalMigrarLoja.nomeFantasia}:</span>
                      </p>
                      {novoPlanoSelecionado === 'enterprise' && (
                        <p className="text-[11px] text-slate-300">
                          🚀 <strong>Automação Total:</strong> Desbloqueia o robô <strong>EloBot Inteligência Artificial no WhatsApp 24h</strong>, painel KDS de cozinha, mesas e caixas ilimitados.
                        </p>
                      )}
                      {novoPlanoSelecionado === 'pro' && (
                        <p className="text-[11px] text-slate-300">
                          🍽️ <strong>Operação Completa:</strong> Desbloqueia o <strong>Painel de Cozinha (KDS)</strong> e controle de até 30 mesas com 5 caixas simultâneos.
                        </p>
                      )}
                      {novoPlanoSelecionado === 'starter' && (
                        <p className="text-[11px] text-slate-300">
                          📦 <strong>Plano Essencial:</strong> Adequado para operações simples de balcão (sem KDS e sem automação de WhatsApp).
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Botões de Ação */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMigrarLoja(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirmar Migração de Plano</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
