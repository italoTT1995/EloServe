import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Activity,
  Headphones,
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
  XCircle,
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
  Package,
  FileText,
  BarChart3,
  PieChart,
  Calculator,
  LineChart,
  Percent,
  Download,
  Megaphone,
  History,
  Send,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  FileSpreadsheet,
} from 'lucide-react';
import { useSaaSStore, AbaMasterSaaS } from '../store/useSaaSStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useProductStore } from '../store/useProductStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { SecaoLoginsEquipe } from '../components/funcionarios/SecaoLoginsEquipe';
import { TipoPlanoSaaS, StatusAssinatura, Produto, PlanoAssinatura, TenantRestaurante } from '../types';

export default function SaaSMaster() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get('aba') as AbaMasterSaaS | null;
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';

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
    moverTenantParaLixeira,
    restaurarTenant,
    removerTenantDefinitivo,
    esvaziarLixeiraTenants,
    mudarPlanoTenant,
    atualizarPlano,
    getMRR,
    getTotalAtivos,
    getTotalTrials,
    getTotalAtrasados,
    custosInfra,
    avisos,
    logsAuditoria,
    atualizarCustosInfra,
    adicionarAviso,
    alternarStatusAviso,
    removerAviso,
    alternarPermissaoDRE,
    alternarWhatsAppIA,
    isWhatsAppIALiberado,
    registrarLogAuditoria,
    chamadosSuporte,
    getChamadosAbertos,
    atualizarStatusChamado,
  } = useSaaSStore();

  const {
    getMesasPorTenant,
    getVendasPorTenant,
    pedidosKDS,
    vendas: todasVendasApp,
    despesasRestaurante: todasDespesasApp,
    movimentosCaixa,
  } = useAppStore();
  const { itens: itensEstoqueGeral, fichasTecnicas: fichasTecnicasGeral } = useEstoqueStore();
  const { usuarios: todosUsuarios, usuarioLogado } = useAuthStore();
  const { pedidos: pedidosDelivery } = useDeliveryStore();
  const chamadosAbertos = getChamadosAbertos ? getChamadosAbertos() : [];

  // Estados de Métricas & Relatório Operacional por Loja (integrado na Aba de Restaurantes)
  const [modalMetricasLoja, setModalMetricasLoja] = useState<TenantRestaurante | null>(null);
  const [metricasMes, setMetricasMes] = useState<number>(new Date().getMonth() + 1);
  const [metricasAno, setMetricasAno] = useState<number>(new Date().getFullYear());

  const {
    getProdutosPorTenant,
    getCategoriasPorTenant,
    adicionarProduto,
    editarProduto,
    removerProduto,
    atualizarPreco,
    alternarDisponibilidade,
    adicionarCategoria,
  } = useProductStore();
  const abaInicial: AbaMasterSaaS =
    abaParam === 'planos' || abaParam === 'regras_planos' ? 'config' : (abaParam || 'restaurantes');
  const [abaAtiva, setAbaAtiva] = useState<AbaMasterSaaS>(abaInicial);
  const [subAbaConfig, setSubAbaConfig] = useState<'planos_mensalidades' | 'dados_cobranca'>('planos_mensalidades');

  useEffect(() => {
    if (abaParam) {
      if (abaParam === 'planos' || abaParam === 'regras_planos') {
        setAbaAtiva('config');
        setSubAbaConfig('planos_mensalidades');
      } else if (abaParam !== abaAtiva) {
        setAbaAtiva(abaParam);
      }
    }
  }, [abaParam]);

  useEffect(() => {
    if (tenantAtivoId !== 'global') {
      navigate('/painel-dono', { replace: true });
    }
  }, [tenantAtivoId, navigate]);

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
  const fallbackTenantId = tenants.find((t) => t.id !== 'global' && t.id !== 'tenant-01')?.id || '';
  const produtos = getProdutosPorTenant(tenantEmEdicao?.id || fallbackTenantId);
  const categorias = getCategoriasPorTenant(tenantEmEdicao?.id || fallbackTenantId);

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
    dreHabilitado: false,
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
        dreHabilitado: Boolean(tenantEmEdicao.dreHabilitado),
      });
    }
  }, [tenantEmEdicao?.id]);

  function handleSalvarEdicaoRestaurante(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantEmEdicao) return;

    if (formEdicao.dreHabilitado !== tenantEmEdicao.dreHabilitado) {
      alternarPermissaoDRE(tenantEmEdicao.id, formEdicao.dreHabilitado, 'Italo Lemos (Super Admin via Editor)');
    }

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
      dreHabilitado: formEdicao.dreHabilitado,
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
    registrarLogAuditoria(
      'Migração de Plano',
      'plano',
      `Restaurante "${modalMigrarLoja.nomeFantasia}" migrado para o plano ${planoNovo?.nome || novoPlanoSelecionado}`
    );
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
    registrarLogAuditoria(
      'Alteração Rápida de Plano',
      'plano',
      `Restaurante "${t.nomeFantasia}" alterado para o plano ${planoNovo?.nome || novoPlano}`
    );
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

  const REGRAS_CATALOGO_SUGESTOES = [
  'Mesas ilimitadas no salão e até 5 caixas PDV simultâneos',
  'Gestão e Controle de Reserva de Mesas integrado',
  'Painel KDS de Cozinha e Bar habilitado em tempo real',
  'Comanda Mobile para Garçons atenderem direto nas mesas',
  'Controle de Estoque e Ficha Técnica de insumos e pratos',
  'Relatórios gerenciais avançados de faturamento e vendas',
  'Tolerância de 5 dias de atraso na fatura com aviso amigável no WhatsApp',
  'Período padrão de degustação: 7 dias grátis',
  'EloBot Inteligência Artificial no WhatsApp oficial 24 horas por dia',
  'Cardápio digital via QR Code interativo nas mesas',
  'Operação 100% digital e sem papel com telas interativas',
  'Limite de 1 terminal PDV frente de caixa por estabelecimento',
  'Até 10 mesas simultâneas com controle no salão',
  'Relatórios DRE completos e cálculo de lucratividade em tempo real',
  'Suporte VIP Prioritário 24/7 com canal direto com o Franqueador',
  'Treinamento operacional remoto de equipe incluso sem taxa adicional',
  'Sem taxa percentual sobre pedidos ou faturamento',
  'Backup diário automático e segurança dos dados em nuvem',
  'Impressão térmica automática para cozinha, bar e balcão (80mm/58mm)',
  'Cancelamento sem fidelidade ou carência a qualquer momento',
];

  const [bancoRegras, setBancoRegras] = useState<string[]>(() => {
    try {
      const salvas = localStorage.getItem('eloserve_catalogo_regras');
      if (salvas) {
        const parsed = JSON.parse(salvas);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const conjunto = new Set<string>();
    planos.forEach((p) => (p.regrasTexto || []).forEach((r) => conjunto.add(r)));
    REGRAS_CATALOGO_SUGESTOES.forEach((r) => conjunto.add(r));
    return Array.from(conjunto);
  });

  const [filtroRegras, setFiltroRegras] = useState<'todas' | 'selecionadas' | 'nao_selecionadas'>('todas');
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

  function handleAlternarSelecaoRegra(regra: string) {
    setFormRegrasPlano((prev) => {
      const jaExiste = prev.regrasTexto.includes(regra);
      const novas = jaExiste
        ? prev.regrasTexto.filter((r) => r !== regra)
        : [...prev.regrasTexto, regra];
      return { ...prev, regrasTexto: novas };
    });
  }

  function handleMarcarTodasRegras() {
    setFormRegrasPlano((prev) => ({
      ...prev,
      regrasTexto: [...bancoRegras],
    }));
  }

  function handleDesmarcarTodasRegras() {
    setFormRegrasPlano((prev) => ({
      ...prev,
      regrasTexto: [],
    }));
  }

  function handleAdicionarRegraTexto() {
    const textoLimpo = novaRegraInput.trim();
    if (!textoLimpo) return;

    if (!bancoRegras.includes(textoLimpo)) {
      const novoBanco = [textoLimpo, ...bancoRegras];
      setBancoRegras(novoBanco);
      try {
        localStorage.setItem('eloserve_catalogo_regras', JSON.stringify(novoBanco));
      } catch {}
    }

    if (!formRegrasPlano.regrasTexto.includes(textoLimpo)) {
      setFormRegrasPlano((prev) => ({
        ...prev,
        regrasTexto: [...prev.regrasTexto, textoLimpo],
      }));
    }

    setNovaRegraInput('');
  }

  function handleRemoverRegraDefinitiva(regraParaRemover: string) {
    if (confirm(`Deseja excluir a regra "${regraParaRemover}" do catálogo definitivo de regras?`)) {
      const novoBanco = bancoRegras.filter((r) => r !== regraParaRemover);
      setBancoRegras(novoBanco);
      try {
        localStorage.setItem('eloserve_catalogo_regras', JSON.stringify(novoBanco));
      } catch {}
      setFormRegrasPlano((prev) => ({
        ...prev,
        regrasTexto: prev.regrasTexto.filter((r) => r !== regraParaRemover),
      }));
    }
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

  // Form novo restaurante (com credenciais criadas pelo Admin Master)
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
    loginEmail: '',
    loginSenha: '',
    loginPin: '1234',
  });

  // Modal de Credenciais do Restaurante (Gestão pelo Admin Master)
  const [modalCredenciaisTenant, setModalCredenciaisTenant] = useState<TenantRestaurante | null>(null);
  const [formCredencial, setFormCredencial] = useState({
    email: '',
    senha: '',
    pin: '',
    nomeGestor: '',
  });
  const [msgCredencialSucesso, setMsgCredencialSucesso] = useState<string | null>(null);

  function handleAbrirCredenciais(tenant: TenantRestaurante) {
    const usuarios = useAuthStore.getState().usuarios;
    const gestor = usuarios.find((u) => u.tenantId === tenant.id && u.cargo === 'admin_restaurante') ||
                   usuarios.find((u) => u.email.toLowerCase() === tenant.email?.toLowerCase());

    setModalCredenciaisTenant(tenant);
    setFormCredencial({
      email: gestor?.email || tenant.email || `${tenant.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '')}@eloserve.com.br`,
      senha: gestor?.senha || 'loja@2026',
      pin: gestor?.pin || '1234',
      nomeGestor: gestor?.nome || tenant.responsavelNome || 'Gerente',
    });
    setMsgCredencialSucesso(null);
  }

  function handleSalvarCredenciais(e: React.FormEvent) {
    e.preventDefault();
    if (!modalCredenciaisTenant) return;

    const { usuarios, adicionarUsuario, editarUsuario } = useAuthStore.getState();
    const gestorExistente = usuarios.find(
      (u) => u.tenantId === modalCredenciaisTenant.id && u.cargo === 'admin_restaurante'
    ) || usuarios.find((u) => u.email.toLowerCase() === formCredencial.email.toLowerCase());

    if (gestorExistente) {
      editarUsuario(gestorExistente.id, {
        nome: formCredencial.nomeGestor,
        email: formCredencial.email,
        senha: formCredencial.senha,
        pin: formCredencial.pin,
        tenantId: modalCredenciaisTenant.id,
      });
    } else {
      adicionarUsuario({
        nome: formCredencial.nomeGestor,
        email: formCredencial.email,
        cargo: 'admin_restaurante',
        tenantId: modalCredenciaisTenant.id,
        senha: formCredencial.senha,
        pin: formCredencial.pin,
        ativo: true,
      });
    }

    setMsgCredencialSucesso('Credenciais de login do restaurante salvas com sucesso!');
    setTimeout(() => setMsgCredencialSucesso(null), 3500);
  }

  function handleCompartilharWhatsAppCredencial() {
    if (!modalCredenciaisTenant) return;
    const tel = modalCredenciaisTenant.telefoneWhatsApp.replace(/\D/g, '');
    const plano = planos.find((p) => p.id === modalCredenciaisTenant.planoId)?.nome || modalCredenciaisTenant.planoId;
    const msg = `🍽️ *Olá, ${formCredencial.nomeGestor}!*\nSeu restaurante *${modalCredenciaisTenant.nomeFantasia}* foi configurado com sucesso no *EloServe PDV & SaaS*.\n\nSegue seu acesso oficial configurado pelo Administrador Master:\n🔗 *Link de Acesso:* https://eloserve-pdv.onrender.com/login\n📧 *E-mail:* ${formCredencial.email}\n🔑 *Senha:* ${formCredencial.senha}\n🔢 *PIN Rápido:* ${formCredencial.pin}\n⭐ *Plano:* ${plano}\n\nAo acessar, você terá controle de cardápio, mesas, comandas e relatórios da sua filial. Seja bem-vindo!`;

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  }



  // Modal e Formulário de Ajuste de Custos Reais da Infraestrutura
  const [modalEditarCustos, setModalEditarCustos] = useState(false);
  const [formCustos, setFormCustos] = useState({
    cloudVps: custosInfra.cloudVps,
    evolutionWhatsapp: custosInfra.evolutionWhatsapp,
    taxaGatewayPct: custosInfra.taxaGatewayPct,
    impostoSimplesPct: custosInfra.impostoSimplesPct,
    suporteMarketing: custosInfra.suporteMarketing,
  });

  // Modal e Formulário de Novo Comunicado / Aviso Global
  const [modalNovoAviso, setModalNovoAviso] = useState(false);
  const [formAviso, setFormAviso] = useState<{
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'alerta' | 'urgente' | 'novidade';
    destinoTenantId: string;
  }>({
    titulo: '',
    mensagem: '',
    tipo: 'novidade',
    destinoTenantId: 'todos',
  });

  // Filtro da Aba de Auditoria
  const [filtroAuditoria, setFiltroAuditoria] = useState<string>('todos');

  function handleSalvarCustosInfra(e: React.FormEvent) {
    e.preventDefault();
    atualizarCustosInfra(formCustos);
    registrarLogAuditoria(
      'Atualização de Parâmetros de Custos',
      'financeiro',
      `Custos atualizados: VPS R$ ${formCustos.cloudVps}, WhatsApp R$ ${formCustos.evolutionWhatsapp}, Gateway ${formCustos.taxaGatewayPct}%, Impostos ${formCustos.impostoSimplesPct}%`
    );
    setModalEditarCustos(false);
  }

  function handleCriarAviso(e: React.FormEvent) {
    e.preventDefault();
    if (!formAviso.titulo || !formAviso.mensagem) {
      alert('Preencha título e mensagem do comunicado.');
      return;
    }
    adicionarAviso({
      titulo: formAviso.titulo,
      mensagem: formAviso.mensagem,
      tipo: formAviso.tipo,
      destinoTenantId: formAviso.destinoTenantId,
      ativo: true,
    });
    registrarLogAuditoria(
      'Publicação de Comunicado Global',
      'sistema',
      `Aviso publicado: "${formAviso.titulo}" para ${formAviso.destinoTenantId === 'todos' ? 'todos os restaurantes' : 'restaurante específico'}`
    );
    setFormAviso({ titulo: '', mensagem: '', tipo: 'novidade', destinoTenantId: 'todos' });
    setModalNovoAviso(false);
  }

  function handleExportarRestaurantesCSV() {
    const cabecalho = 'ID,Nome Fantasia,Razao Social,Documento,Responsavel,WhatsApp,Email,Cidade/UF,Plano,Status,Mensalidade (R$),Vencimento\n';
    const linhas = tenants
      .map(
        (t) =>
          `"${t.id}","${t.nomeFantasia}","${t.razaoSocial}","${t.documento}","${t.responsavelNome}","${t.telefoneWhatsApp}","${t.email}","${t.cidadeUf}","${t.planoId}","${t.statusAssinatura}",${t.valorMensalidade},"${t.proximoVencimento}"`
      )
      .join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eloserve_restaurantes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportarLogsCSV() {
    const cabecalho = 'ID,Data/Hora,Usuario,Acao,Categoria,Detalhes\n';
    const linhas = logsAuditoria
      .map(
        (l) =>
          `"${l.id}","${l.dataHora}","${l.usuarioNome}","${l.acao}","${l.categoria}","${l.detalhes.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eloserve_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function parseDataItem(dataStr?: string): { dia: number; mes: number; ano: number } {
    if (!dataStr) return { dia: 0, mes: 0, ano: 0 };
    if (dataStr.includes('/')) {
      const partes = dataStr.split(' ')[0].split('/');
      return {
        dia: parseInt(partes[0], 10) || 0,
        mes: parseInt(partes[1], 10) || 0,
        ano: parseInt(partes[2], 10) || 0,
      };
    } else if (dataStr.includes('-')) {
      const partes = dataStr.split('T')[0].split('-');
      return {
        ano: parseInt(partes[0], 10) || 0,
        mes: parseInt(partes[1], 10) || 0,
        dia: parseInt(partes[2], 10) || 0,
      };
    }
    return { dia: 0, mes: 0, ano: 0 };
  }

  function calcularDossieTenant(tenantAlvoId: string, mes: number, ano: number) {
    const isTodos = tenantAlvoId === 'todos';

    const vendasPeriodo = (todasVendasApp || []).filter((v) => {
      const matchTenant = isTodos || v.tenantId === tenantAlvoId;
      if (!matchTenant) return false;
      const d = parseDataItem(v.dataHora);
      if (d.ano === 0 && d.mes === 0) return true;
      return d.mes === mes && d.ano === ano;
    });

    const vendasConcluidas = vendasPeriodo.filter((v) => v.status === 'concluida');
    const vendasCanceladas = vendasPeriodo.filter((v) => v.status === 'cancelada');

    let receitaBruta = 0;
    let vendasSalao = 0;
    let vendasBalcao = 0;
    let vendasDelivery = 0;
    let totalTaxaServico = 0;
    let totalCouvert = 0;
    let totalTaxaEntrega = 0;
    let totalDescontos = 0;

    let pgtoDinheiro = 0;
    let pgtoPix = 0;
    let pgtoCredito = 0;
    let pgtoDebito = 0;
    let pgtoOutros = 0;

    let cmvTotal = 0;

    vendasConcluidas.forEach((v) => {
      receitaBruta += v.total || 0;
      totalDescontos += v.desconto || 0;
      totalTaxaServico += v.taxaServico || 0;
      totalCouvert += v.couvertArtistico || 0;
      totalTaxaEntrega += v.taxaEntrega || 0;

      if (v.tipoOrigem === 'mesa' || v.mesaNumero) {
        vendasSalao += v.total || 0;
      } else if (v.tipoOrigem === 'delivery') {
        vendasDelivery += v.total || 0;
      } else {
        vendasBalcao += v.total || 0;
      }

      const fp = v.formaPagamento;
      if (fp === 'dinheiro') pgtoDinheiro += v.total || 0;
      else if (fp === 'pix') pgtoPix += v.total || 0;
      else if (fp === 'credito') pgtoCredito += v.total || 0;
      else if (fp === 'debito') pgtoDebito += v.total || 0;
      else pgtoOutros += v.total || 0;

      (v.itens || []).forEach((it) => {
        let custoItem = 0;
        if (it.fichaTecnica && it.fichaTecnica.length > 0) {
          custoItem = it.fichaTecnica.reduce((acc, ing) => acc + (ing.quantidade * (ing.custoUnitarioEstimado || 0)), 0);
        } else {
          custoItem = (it.precoUnitario || 0) * 0.32;
        }
        cmvTotal += custoItem * (it.quantidade || 1);
      });
    });

    const totalCancelamentos = vendasCanceladas.reduce((acc, v) => acc + (v.total || 0), 0);
    const receitaLiquida = Math.max(0, receitaBruta - totalDescontos - totalCancelamentos);

    const despesasPeriodo = (todasDespesasApp || []).filter((d) => {
      const matchTenant = isTodos || d.tenantId === tenantAlvoId;
      if (!matchTenant) return false;
      const dataD = parseDataItem(d.data);
      if (dataD.ano === 0 && dataD.mes === 0) return true;
      return dataD.mes === mes && dataD.ano === ano;
    });

    const despesasInsumos = despesasPeriodo.filter((d) => d.categoria === 'insumos').reduce((acc, d) => acc + (d.valor || 0), 0);
    const despesasPessoal = despesasPeriodo.filter((d) => d.categoria === 'pessoal').reduce((acc, d) => acc + (d.valor || 0), 0);
    const despesasOcupacao = despesasPeriodo.filter((d) => d.categoria === 'ocupacao').reduce((acc, d) => acc + (d.valor || 0), 0);
    const despesasComerciais = despesasPeriodo.filter((d) => d.categoria === 'financeiro').reduce((acc, d) => acc + (d.valor || 0), 0);
    const despesasServicos = despesasPeriodo.filter((d) => d.categoria === 'servicos').reduce((acc, d) => acc + (d.valor || 0), 0);
    const outrasDespesas = despesasPeriodo.filter((d) => d.categoria === 'outros').reduce((acc, d) => acc + (d.valor || 0), 0);

    const cmvFinal = cmvTotal + despesasInsumos;
    const margemBruta = Math.max(0, receitaLiquida - cmvFinal);
    const margemBrutaPct = receitaLiquida > 0 ? (margemBruta / receitaLiquida) * 100 : 0;
    const cmvPct = receitaLiquida > 0 ? (cmvFinal / receitaLiquida) * 100 : 0;

    const totalDespesasOperacionais = despesasPessoal + despesasOcupacao + despesasComerciais + despesasServicos + outrasDespesas;
    const sangriasPeriodo = (movimentosCaixa || []).filter((m) => m.tipo === 'sangria');
    const totalSangrias = isTodos ? sangriasPeriodo.reduce((acc, s) => acc + (s.valor || 0), 0) : (sangriasPeriodo.reduce((acc, s) => acc + (s.valor || 0), 0));
    const totalDespesasEOperacoes = totalDespesasOperacionais + totalSangrias;

    const resultadoOperacional = margemBruta - totalDespesasEOperacoes;
    const margemOperacionalPct = receitaLiquida > 0 ? (resultadoOperacional / receitaLiquida) * 100 : 0;

    const colaboradores = (todosUsuarios || []).filter((u) => {
      if (isTodos) return u.cargo !== 'super_admin';
      return u.tenantId === tenantAlvoId;
    });

    const estoqueItens = (itensEstoqueGeral || []);

    return {
      receitaBruta,
      vendasSalao,
      vendasBalcao,
      vendasDelivery,
      totalTaxaServico,
      totalCouvert,
      totalTaxaEntrega,
      totalDescontos,
      totalCancelamentos,
      receitaLiquida,
      cmvTotal: cmvFinal,
      cmvPct,
      margemBruta,
      margemBrutaPct,
      despesasInsumos,
      despesasPessoal,
      despesasOcupacao,
      despesasComerciais,
      despesasServicos,
      outrasDespesas,
      totalDespesasCadastradas: totalDespesasOperacionais,
      totalSangrias,
      totalDespesasEOperacoes,
      resultadoOperacional,
      margemOperacionalPct,
      totalPedidos: vendasConcluidas.length,
      ticketMedio: vendasConcluidas.length > 0 ? receitaBruta / vendasConcluidas.length : 0,
      vendasPeriodo,
      vendasConcluidas,
      vendasCanceladas,
      despesasPeriodo,
      pgtoDinheiro,
      pgtoPix,
      pgtoCredito,
      pgtoDebito,
      pgtoOutros,
      colaboradores,
      estoqueItens,
    };
  }

  function handleBaixarDossieCSV(tenantIdAlvo: string, mesAlvo: number, anoAlvo: number) {
    const nomeMes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][mesAlvo - 1];
    const tenantInfo = tenantIdAlvo === 'todos' 
      ? { nomeFantasia: 'Todos os Restaurantes (Consolidado)', documento: 'Multi-Tenant', cidadeUf: 'Brasil' }
      : tenants.find((t) => t.id === tenantIdAlvo) || { nomeFantasia: 'Restaurante', documento: '-', cidadeUf: '-' };

    const dados = calcularDossieTenant(tenantIdAlvo, mesAlvo, anoAlvo);

    let csv = '\uFEFF';
    csv += '=========================================================================\n';
    csv += `RELATÓRIO MENSAL DE OPERAÇÕES E VENDAS - PLATAFORMA eloGastrô\n`;
    csv += `Restaurante:;${tenantInfo.nomeFantasia}\n`;
    csv += `Documento (CNPJ/CPF):;${tenantInfo.documento || '-'}\n`;
    csv += `Cidade / UF:;${tenantInfo.cidadeUf || '-'}\n`;
    csv += `Mês de Referência:;${nomeMes} de ${anoAlvo}\n`;
    csv += `Data de Emissão do Relatório:;${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    csv += '=========================================================================\n\n';

    csv += '--- 1. DEMONSTRATIVO FINANCEIRO E OPERACIONAL DO MÊS ---\n';
    csv += 'Linha Contábil;Valor (R$);% sobre Receita Líquida\n';
    csv += `1. (+) Receita Bruta Total;R$ ${dados.receitaBruta.toFixed(2)};-\n`;
    csv += `    - Vendas no Salão (Mesas);R$ ${dados.vendasSalao.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.vendasSalao / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Vendas no Balcão;R$ ${dados.vendasBalcao.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.vendasBalcao / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Vendas no Delivery;R$ ${dados.vendasDelivery.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.vendasDelivery / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Taxa de Serviço 10% (Garçom);R$ ${dados.totalTaxaServico.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalTaxaServico / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Couvert Artístico;R$ ${dados.totalCouvert.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalCouvert / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `2. (-) Deduções da Receita Bruta;R$ ${(dados.totalDescontos + dados.totalCancelamentos).toFixed(2)};${dados.receitaLiquida > 0 ? (((dados.totalDescontos + dados.totalCancelamentos) / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Descontos Concedidos;R$ ${dados.totalDescontos.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalDescontos / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Cancelamentos e Estornos;R$ ${dados.totalCancelamentos.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalCancelamentos / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL);R$ ${dados.receitaLiquida.toFixed(2)};100.0%\n`;
    csv += `4. (-) Custo da Mercadoria Vendida (CMV / Insumos);R$ ${dados.cmvTotal.toFixed(2)};${dados.cmvPct.toFixed(1)}%\n`;
    csv += `5. (=) MARGEM BRUTA / LUCRO BRUTO;R$ ${dados.margemBruta.toFixed(2)};${dados.margemBrutaPct.toFixed(1)}%\n`;
    csv += `6. (-) Despesas Operacionais Totais;R$ ${dados.totalDespesasCadastradas.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalDespesasCadastradas / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - 6.1 Pessoal & Equipe;R$ ${dados.despesasPessoal.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.despesasPessoal / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - 6.2 Ocupação & Utilidades;R$ ${dados.despesasOcupacao.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.despesasOcupacao / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - 6.3 Comercial & Embalagens;R$ ${dados.despesasComerciais.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.despesasComerciais / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - 6.4 Serviços, TI & Manutenção;R$ ${dados.despesasServicos.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.despesasServicos / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - 6.5 Outras Despesas Gerais;R$ ${dados.outrasDespesas.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.outrasDespesas / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `    - Sangrias e Retiradas de Caixa;R$ ${dados.totalSangrias.toFixed(2)};${dados.receitaLiquida > 0 ? ((dados.totalSangrias / dados.receitaLiquida) * 100).toFixed(1) : 0}%\n`;
    csv += `7. (=) RESULTADO OPERACIONAL DO MÊS (LUCRO/PREJUÍZO);R$ ${dados.resultadoOperacional.toFixed(2)};${dados.margemOperacionalPct.toFixed(1)}%\n\n`;

    csv += '--- 2. RECEBIMENTOS POR MEIO DE PAGAMENTO ---\n';
    csv += 'Forma de Pagamento;Total Recebido (R$);Participação %\n';
    csv += `Dinheiro em Espécie;R$ ${dados.pgtoDinheiro.toFixed(2)};${dados.receitaBruta > 0 ? ((dados.pgtoDinheiro / dados.receitaBruta) * 100).toFixed(1) : 0}%\n`;
    csv += `PIX Instantâneo;R$ ${dados.pgtoPix.toFixed(2)};${dados.receitaBruta > 0 ? ((dados.pgtoPix / dados.receitaBruta) * 100).toFixed(1) : 0}%\n`;
    csv += `Cartão de Crédito;R$ ${dados.pgtoCredito.toFixed(2)};${dados.receitaBruta > 0 ? ((dados.pgtoCredito / dados.receitaBruta) * 100).toFixed(1) : 0}%\n`;
    csv += `Cartão de Débito;R$ ${dados.pgtoDebito.toFixed(2)};${dados.receitaBruta > 0 ? ((dados.pgtoDebito / dados.receitaBruta) * 100).toFixed(1) : 0}%\n`;
    csv += `Outros / Vouchers;R$ ${dados.pgtoOutros.toFixed(2)};${dados.receitaBruta > 0 ? ((dados.pgtoOutros / dados.receitaBruta) * 100).toFixed(1) : 0}%\n\n`;

    csv += '--- 3. DESPESAS OPERACIONAIS REGISTRADAS NO MÊS ---\n';
    csv += 'Data;Descrição;Categoria;Tipo;Valor (R$)\n';
    if (dados.despesasPeriodo.length === 0) {
      csv += 'Nenhuma despesa operacional cadastrada neste mês.;-;-;-;-\n';
    } else {
      dados.despesasPeriodo.forEach((d) => {
        csv += `${d.data};"${d.descricao.replace(/"/g, '""')}";${d.categoria};${d.tipo};R$ ${d.valor.toFixed(2)}\n`;
      });
    }
    csv += '\n';

    csv += '--- 4. POSIÇÃO DE ESTOQUE E CUSTO UNITÁRIO DOS INSUMOS ---\n';
    csv += 'Insumo;Categoria;Unidade;Estoque Atual;Estoque Mínimo;Preço de Custo (R$);Valor Imobilizado (R$)\n';
    dados.estoqueItens.forEach((it) => {
      const valTotal = (it.quantidadeAtual || 0) * (it.precoCusto || 0);
      csv += `"${it.nome.replace(/"/g, '""')}";${it.categoria};${it.unidadeMedida};${it.quantidadeAtual};${it.estoqueMinimo};R$ ${(it.precoCusto || 0).toFixed(2)};R$ ${valTotal.toFixed(2)}\n`;
    });
    csv += '\n';

    csv += '--- 5. QUADRO DE COLABORADORES E EQUIPE ---\n';
    csv += 'Nome;Cargo;E-mail;Status\n';
    if (dados.colaboradores.length === 0) {
      csv += 'Nenhum funcionário cadastrado.;-;-;-\n';
    } else {
      dados.colaboradores.forEach((colab) => {
        csv += `"${colab.nome.replace(/"/g, '""')}";${colab.cargo};${colab.email};${colab.ativo ? 'Ativo' : 'Inativo'}\n`;
      });
    }
    csv += '\n';

    csv += '--- 6. EXTRATO ANALÍTICO DE PEDIDOS E VENDAS ---\n';
    csv += 'ID Pedido;Data/Hora;Canal;Forma Pgto;Itens;Subtotal (R$);Taxa 10% (R$);Couvert (R$);Desconto (R$);Total Pago (R$);Operador;Status\n';
    dados.vendasPeriodo.forEach((v) => {
      const itensStr = (v.itens || []).map((i) => `${i.quantidade}x ${i.nome}`).join(' | ');
      csv += `"${v.id}";"${v.dataHora}";"${v.tipoOrigem || 'balcao'}";"${v.formaPagamento}";"${itensStr.replace(/"/g, '""')}";${(v.subtotalBruto || v.total).toFixed(2)};${(v.taxaServico || 0).toFixed(2)};${(v.couvertArtistico || 0).toFixed(2)};${(v.desconto || 0).toFixed(2)};${(v.total || 0).toFixed(2)};"${v.operador || 'Caixa'}";"${v.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = tenantInfo.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `relatorio_operacoes_${slug}_${anoAlvo}_${String(mesAlvo).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleBaixarDossieJSON(tenantIdAlvo: string, mesAlvo: number, anoAlvo: number) {
    const tenantInfo = tenantIdAlvo === 'todos' 
      ? { nomeFantasia: 'Todos os Restaurantes (Consolidado)' }
      : tenants.find((t) => t.id === tenantIdAlvo) || { nomeFantasia: 'Restaurante' };

    const dados = calcularDossieTenant(tenantIdAlvo, mesAlvo, anoAlvo);
    const payload = {
      geradoEm: new Date().toISOString(),
      restaurante: tenantInfo,
      mesReferencia: mesAlvo,
      anoReferencia: anoAlvo,
      resumoDRE: {
        receitaBruta: dados.receitaBruta,
        vendasSalao: dados.vendasSalao,
        vendasBalcao: dados.vendasBalcao,
        vendasDelivery: dados.vendasDelivery,
        taxaServico: dados.totalTaxaServico,
        couvertArtistico: dados.totalCouvert,
        descontos: dados.totalDescontos,
        cancelamentos: dados.totalCancelamentos,
        receitaLiquida: dados.receitaLiquida,
        cmvTotal: dados.cmvTotal,
        cmvPct: dados.cmvPct,
        margemBruta: dados.margemBruta,
        margemBrutaPct: dados.margemBrutaPct,
        despesasOperacionais: dados.totalDespesasCadastradas,
        sangriasCaixa: dados.totalSangrias,
        resultadoOperacional: dados.resultadoOperacional,
        margemOperacionalPct: dados.margemOperacionalPct,
        totalPedidos: dados.totalPedidos,
        ticketMedio: dados.ticketMedio,
      },
      meiosPagamento: {
        dinheiro: dados.pgtoDinheiro,
        pix: dados.pgtoPix,
        credito: dados.pgtoCredito,
        debito: dados.pgtoDebito,
        outros: dados.pgtoOutros,
      },
      despesas: dados.despesasPeriodo,
      estoque: dados.estoqueItens,
      colaboradores: dados.colaboradores,
      vendas: dados.vendasPeriodo,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = tenantInfo.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `relatorio_operacoes_${slug}_${anoAlvo}_${String(mesAlvo).padStart(2, '0')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const mrr = getMRR();
  const arr = mrr * 12;
  const totalAtivos = getTotalAtivos();
  const totalTrials = getTotalTrials();
  const totalAtrasados = getTotalAtrasados();

  const lojasClientes = tenants.filter((t) => t.id !== 'global');
  const tenantsNaLixeira = lojasClientes.filter((t) => t.naLixeira);
  const tenantsAtivos = lojasClientes.filter((t) => !t.naLixeira);
  const tenantsCancelados = lojasClientes.filter((t) => t.statusAssinatura === 'cancelado' || Boolean(t.naLixeira));

  const tenantsFiltrados = lojasClientes.filter((t) => {
    const matchBusca =
      t.nomeFantasia.toLowerCase().includes(busca.toLowerCase()) ||
      t.responsavelNome.toLowerCase().includes(busca.toLowerCase()) ||
      t.documento.includes(busca) ||
      t.cidadeUf.toLowerCase().includes(busca.toLowerCase());

    if (filtroStatus === 'lixeira') {
      return matchBusca && Boolean(t.naLixeira);
    }

    if (filtroStatus === 'cancelado') {
      return matchBusca && (t.statusAssinatura === 'cancelado' || Boolean(t.naLixeira));
    }

    if (t.naLixeira) return false;

    const matchStatus =
      filtroStatus === 'todos' ||
      t.statusAssinatura === filtroStatus;
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

    const emailOficial = (form.loginEmail || form.email || `${form.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '')}@eloserve.com.br`).trim().toLowerCase();
    const senhaOficial = form.loginSenha || `${form.planoId}@2026`;
    const pinOficial = form.loginPin || '1234';

    const novoTenant = adicionarTenant({
      nomeFantasia: form.nomeFantasia,
      razaoSocial: form.razaoSocial || form.nomeFantasia,
      documento: form.documento || '00.000.000/0001-00',
      responsavelNome: form.responsavelNome || 'Gerente',
      telefoneWhatsApp: form.telefoneWhatsApp,
      email: emailOficial,
      cidadeUf: form.cidadeUf,
      planoId: form.planoId,
      statusAssinatura: form.statusAssinatura,
      valorMensalidade: preco,
      dataInicio: new Date().toLocaleDateString('pt-BR'),
      proximoVencimento: proximoMes.toLocaleDateString('pt-BR'),
      diasRestantesTrial: form.statusAssinatura === 'trial' ? 7 : undefined,
      instanciaWhatsAppConectada: form.planoId === 'enterprise',
    });

    // O Administrador Master cria imediatamente o login deste restaurante
    useAuthStore.getState().adicionarUsuario({
      nome: `${form.responsavelNome || 'Gestor'} (${form.nomeFantasia})`,
      email: emailOficial,
      cargo: 'admin_restaurante',
      tenantId: novoTenant.id,
      senha: senhaOficial,
      pin: pinOficial,
      ativo: true,
    });

    registrarLogAuditoria(
      'Cadastro de Novo Restaurante',
      'restaurante',
      `Restaurante "${form.nomeFantasia}" cadastrado no plano ${form.planoId.toUpperCase()} (${form.statusAssinatura})`
    );

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
      loginEmail: '',
      loginSenha: '',
      loginPin: '1234',
    });
  }

  function handleEntrarNaLoja(tenantId: string) {
    selecionarTenant(tenantId);
    navigate('/');
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Banner de Atalho para o Dono Operar sua Loja */}
      {lojasClientes.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-950/40 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  Loja Vinculada
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {lojasClientes[0].cidadeUf} • {lojasClientes[0].planoId.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {lojasClientes[0].nomeFantasia}
              </h3>
              <p className="text-xs text-slate-300">
                Você está no painel do <strong>Franqueador (SaaS Master)</strong>. Deseja gerenciar o <strong>Cardápio, Mesas, PDV e Estoque</strong> desta loja?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              selecionarTenant(lojasClientes[0].id);
              navigate('/painel-dono');
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>Operar {lojasClientes[0].nomeFantasia} como Dono</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Abas Administrativas do Super Admin */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleMudarAba('central_master')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'central_master'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <Crown className="w-4 h-4 text-purple-400" />
          <span>Central Master</span>
        </button>
        <button
          type="button"
          onClick={() => handleMudarAba('suporte_ao_vivo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'suporte_ao_vivo'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Monitoramento & Suporte ao Vivo</span>
          {chamadosAbertos.length > 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-black animate-bounce shadow-sm">
              🚨 {chamadosAbertos.length} {chamadosAbertos.length === 1 ? 'Chamado' : 'Chamados'}
            </span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Ao Vivo
            </span>
          )}
        </button>

        <button
          onClick={() => handleMudarAba('restaurantes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'restaurantes'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Restaurantes Assinantes ({lojasClientes.length})</span>
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
          onClick={() => handleMudarAba('faturamento')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'faturamento'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Faturamento & MRR</span>
        </button>

        <button
          type="button"
          onClick={() => handleMudarAba('logins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'logins'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <KeyRound className="w-4 h-4 text-purple-400" />
          <span>Gestão de Logins & Acessos</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 uppercase font-black">
            Lojas
          </span>
        </button>

        <button
          onClick={() => handleMudarAba('avisos_globais')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'avisos_globais'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-400" />
          <span>Avisos Globais</span>
          {avisos.filter((a) => a.ativo).length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 uppercase font-black">
              {avisos.filter((a) => a.ativo).length} ativos
            </span>
          )}
        </button>

        <button
          onClick={() => handleMudarAba('auditoria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'auditoria'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-purple-400" />
          <span>Logs de Auditoria ({logsAuditoria.length})</span>
        </button>

        <button
          onClick={() => handleMudarAba('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'config' || abaAtiva === 'planos' || abaAtiva === 'regras_planos'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Configurações & Planos</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-black">
            Master
          </span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA EXCLUSIVA: CENTRAL DE GESTÃO SAAS MASTER */}
      {abaAtiva === 'central_master' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card Executivo Principal (De acordo com o print) */}
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

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={handleExportarRestaurantesCSV}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Baixar planilha de todos os restaurantes em formato CSV"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Exportar Clientes (CSV)</span>
              </button>

              <button
                onClick={() => setModalNovoTenant(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Restaurante</span>
              </button>
            </div>
          </div>

          {/* Atalhos Executivos para cada Módulo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleMudarAba('restaurantes')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Restaurantes Assinantes
                </h4>
                <p className="text-xs text-slate-400">
                  Gerencie clientes, planos, credenciais de acesso e status de assinatura.
                </p>
                <span className="text-[11px] font-mono text-purple-400 font-semibold block pt-1">
                  {tenants.length} estabelecimentos cadastrados
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-1" />
            </button>

            <button
              onClick={() => handleMudarAba('faturamento')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Faturamento & MRR
                </h4>
                <p className="text-xs text-slate-400">
                  Acompanhe receita recorrente, faturas em atraso e projeções de receita.
                </p>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold block pt-1">
                  R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês (MRR)
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-1" />
            </button>

            <button
              onClick={() => handleMudarAba('editor_loja')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Ambiente de Edição das Lojas
                </h4>
                <p className="text-xs text-slate-400">
                  Modifique cardápios, pratos, categorias e dados cadastrais de qualquer restaurante.
                </p>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold block pt-1">
                  Editor multi-tenant completo
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-1" />
            </button>

            <button
              onClick={() => handleMudarAba('suporte_ao_vivo')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Monitoramento & Helpdesk
                </h4>
                <p className="text-xs text-slate-400">
                  Atenda chamados de suporte dos restaurantes e monitore a infraestrutura em tempo real.
                </p>
                <span className="text-[11px] font-mono text-amber-400 font-semibold block pt-1">
                  {chamadosAbertos.length} chamados em aberto
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mt-1" />
            </button>

            <button
              onClick={() => {
                handleMudarAba('config');
                setSubAbaConfig('planos_mensalidades');
              }}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Configurações & Planos
                </h4>
                <p className="text-xs text-slate-400">
                  Configure preços das assinaturas, limites de mesas/caixas e recursos inclusos.
                </p>
                <span className="text-[11px] font-mono text-purple-400 font-semibold block pt-1">
                  {planos.length} planos • Controle Master
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-1" />
            </button>

            <button
              onClick={() => handleMudarAba('config')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-500/50 p-5 rounded-3xl text-left transition-all group flex items-start justify-between shadow-lg cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                  Parâmetros de Custos & Infraestrutura
                </h4>
                <p className="text-xs text-slate-400">
                  Gerencie custos e estimativas de infraestrutura em nuvem.
                </p>
                <span className="text-[11px] font-mono text-slate-400 font-semibold block pt-1">
                  Infraestrutura em Nuvem
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all mt-1" />
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: MONITORAMENTO & SUPORTE AO VIVO */}
      {abaAtiva === 'suporte_ao_vivo' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner da Torre de Controle */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  Torre de Controle Operacional
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Ao Vivo
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Monitoramento das Operações & Helpdesk Master
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Visualize em tempo real o status operacional de cada restaurante parceiro, acompanhe mesas ocupadas, vendas do dia e atenda prontamente chamados de suporte dos gerentes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalNovoTenant(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Restaurante</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas em Tempo Real */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-bold">Restaurantes na Rede</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{tenants.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {tenants.filter((t) => t.statusAssinatura === 'ativo').length} ativos • {tenants.filter((t) => t.statusAssinatura === 'trial').length} em teste
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-bold">Vendas de Hoje (Rede)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              {(() => {
                const todasVendas = tenants.flatMap((t) => getVendasPorTenant(t.id));
                const totalValor = todasVendas.reduce((acc, v) => acc + (v.total || 0), 0);
                return (
                  <>
                    <p className="text-2xl font-black text-emerald-400">
                      R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {todasVendas.length} pedidos faturados
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-bold">Mesas Ocupadas Agora</span>
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              </div>
              {(() => {
                const todasMesas = tenants.flatMap((t) => getMesasPorTenant(t.id));
                const ocupadas = todasMesas.filter((m) => m.status === 'ocupada').length;
                return (
                  <>
                    <p className="text-2xl font-black text-amber-400">{ocupadas}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      De {todasMesas.length} mesas distribuídas
                    </p>
                  </>
                );
              })()}
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm transition-all ${
              chamadosAbertos.length > 0
                ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-900/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-bold ${chamadosAbertos.length > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                  Chamados de Suporte
                </span>
                <Headphones className={`w-4 h-4 ${chamadosAbertos.length > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
              </div>
              <p className={`text-2xl font-black ${chamadosAbertos.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {chamadosAbertos.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {chamadosAbertos.length > 0 ? '🚨 Requer atenção Master' : 'Nenhum chamado pendente'}
              </p>
            </div>
          </div>

          {/* Central de Chamados de Suporte (Helpdesk do Franqueador) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Central de Chamados dos Restaurantes
                    {chamadosAbertos.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                        {chamadosAbertos.length} ABERTO(S)
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Chamados abertos diretamente pelo botão "Suporte Master" no sistema de cada restaurante.
                  </p>
                </div>
              </div>
            </div>

            {chamadosAbertos.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-white">Todos os Restaurantes Estão Operando com Sucesso!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Não há chamados de suporte em aberto no momento. Quando um restaurante solicitar auxílio técnico ou operacional, o chamado aparecerá aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chamadosAbertos.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ch.prioridade === 'urgente'
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/40'
                        : 'bg-slate-950 border-purple-500/40 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{ch.tenantNome}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                              ch.prioridade === 'urgente'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {ch.prioridade === 'urgente' ? '🚨 Urgente' : 'Normal'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Solicitante: <strong className="text-purple-300">{ch.solicitanteNome}</strong> ({ch.solicitanteCargo}) • Aberto às {ch.criadoEm}
                        </p>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 font-bold uppercase">
                        {ch.categoria === 'caixa'
                          ? '🛒 Caixa'
                          : ch.categoria === 'kds'
                          ? '🍳 Cozinha'
                          : ch.categoria === 'pedidos'
                          ? '🪑 Mesas/Delivery'
                          : ch.categoria === 'whatsapp'
                          ? '🤖 WhatsApp'
                          : '❓ Dúvida'}
                      </span>
                    </div>

                    <div className="py-3">
                      <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                        "{ch.descricao}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      {ch.telefoneContato && (
                        <a
                          href={`https://wa.me/55${ch.telefoneContato.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(
                            ch.solicitanteNome
                          )}%2C%20aqui%20%C3%A9%20o%20Suporte%20Master%20do%20EloServe.%20Recebi%20seu%20chamado%20sobre%3A%20${encodeURIComponent(
                            ch.descricao
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 text-[11px] transition-all shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp ({ch.telefoneContato})</span>
                        </a>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            selecionarTenant(ch.tenantId);
                            navigate(ch.categoria === 'kds' ? '/kds' : ch.categoria === 'pedidos' ? '/mesas' : '/pdv');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 text-[11px] transition-all shadow-sm cursor-pointer"
                          title="Entrar no sistema do restaurante para ver o que está acontecendo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Modo Suporte</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => atualizarStatusChamado(ch.id, 'resolvido', 'Ítalo Silva (Master)')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 text-[11px] transition-all cursor-pointer"
                          title="Marcar este chamado como resolvido"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Concluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Torre de Controle ao Vivo de Cada Restaurante */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Operações ao Vivo por Restaurante
                </h3>
                <p className="text-xs text-slate-400">
                  Acompanhe exatamente o que está acontecendo nas mesas, balcão, cozinha e caixa de cada cliente em tempo real.
                </p>
              </div>
            </div>

            {tenants.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <Store className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Nenhum Restaurante Cadastrado no Momento</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  A base foi inicializada limpa para o lançamento comercial. Cadastre os novos restaurantes clientes para iniciar o monitoramento.
                </p>
                <button
                  type="button"
                  onClick={() => setModalNovoTenant(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeiro Restaurante</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tenants.map((t) => {
                  const mesas = getMesasPorTenant(t.id);
                  const mesasOcupadas = mesas.filter((m) => m.status === 'ocupada');
                  const totalConsumoMesas = mesasOcupadas.reduce((acc, m) => acc + (m.totalConsumo || 0), 0);

                  const vendas = getVendasPorTenant(t.id);
                  const totalVendasValor = vendas.reduce((acc, v) => acc + (v.total || 0), 0);

                  const chamadosLoja = (chamadosSuporte || []).filter(
                    (ch) => ch.tenantId === t.id && ch.status !== 'resolvido'
                  );

                  const emoji =
                    t.id === 'tenant-05'
                      ? '🍣'
                      : t.id === 'tenant-02'
                      ? '🍕'
                      : t.id === 'tenant-03'
                      ? '🍔'
                      : t.id === 'tenant-04'
                      ? '🍢'
                      : '🥩';

                  return (
                    <div
                      key={t.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-purple-500/40 transition-all space-y-4"
                    >
                      {/* Topo do Card do Restaurante */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                            {emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-white">{t.nomeFantasia}</h4>
                              {chamadosLoja.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-bounce">
                                  🚨 {chamadosLoja.length} Suporte
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {t.documento || 'CNPJ não informado'} • Responsável: <strong className="text-slate-300">{t.responsavelNome}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              t.statusAssinatura === 'ativo'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : t.statusAssinatura === 'trial'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {t.statusAssinatura}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30 font-bold uppercase">
                            Plano {t.planoId}
                          </span>
                        </div>
                      </div>

                      {/* Grade de Indicadores em Tempo Real da Loja */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Vendas Hoje</span>
                          <span className="text-emerald-400 font-extrabold text-xs block truncate">
                            R$ {totalVendasValor.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500">{vendas.length} pedidos</span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Mesas Salão</span>
                          <span className="text-amber-400 font-extrabold text-xs block">
                            {mesasOcupadas.length} / {mesas.length} ocupadas
                          </span>
                          <span className="text-[10px] text-slate-500">
                            R$ {totalConsumoMesas.toFixed(2)} aberto
                          </span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Terminal PDV</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-400">Ativo</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Operação em nuvem</span>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Status Suporte</span>
                          <span
                            className={`text-[11px] font-bold block ${
                              chamadosLoja.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {chamadosLoja.length > 0 ? `🚨 ${chamadosLoja.length} Pendente` : '✅ Estável'}
                          </span>
                          <span className="text-[10px] text-slate-500">Operação Normal</span>
                        </div>
                      </div>

                      {/* Barra de Ações Rápidas do Master */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        {t.telefoneWhatsApp ? (
                          <a
                            href={`https://wa.me/55${t.telefoneWhatsApp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(
                              t.responsavelNome
                            )}%2C%20aqui%20%C3%A9%20o%20Suporte%20Master%20EloServe.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-700/80 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp Gerente</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">Sem telefone cadastrado</span>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setTenantEmEdicaoId(t.id);
                              handleMudarAba('editor_loja');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Editar cardápio, dados e configurações desta loja"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Configurar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              selecionarTenant(t.id);
                              navigate('/pdv');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                            title="Acessar o sistema como este restaurante para prestar suporte"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Modo Suporte (Entrar)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 1: RESTAURANTES ASSINANTES */}
      {abaAtiva === 'restaurantes' && (
        <div className="space-y-4">
          {/* Card de Destaque / Raio-X do Restaurante Selecionado */}
          {tenantAtivoId !== 'global' && (() => {
            const tFoco = tenants.find((t) => t.id === tenantAtivoId);
            if (!tFoco) return null;
            const emoji = tFoco.id === 'tenant-05' ? '🍣' : tFoco.id === 'tenant-02' ? '🍕' : tFoco.id === 'tenant-03' ? '🍔' : tFoco.id === 'tenant-04' ? '🍢' : '🥩';

            return (
              <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950 border border-purple-500/50 p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    {emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                        Restaurante Selecionado para Inspeção
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          tFoco.statusAssinatura === 'ativo'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : tFoco.statusAssinatura === 'trial'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tFoco.statusAssinatura}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      {tFoco.nomeFantasia}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {tFoco.cidadeUf} • CNPJ: {tFoco.documento} • Responsável: <strong className="text-white">{tFoco.responsavelNome}</strong> ({tFoco.telefoneWhatsApp})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => handleEntrarNaLoja(tFoco.id)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95 transition-all"
                    title="Abrir o PDV com o cardápio real deste restaurante"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Inspecionar PDV (Ver Cardápio)</span>
                  </button>

                  <button
                    onClick={() => {
                      setTenantEmEdicaoId(tFoco.id);
                      handleMudarAba('editor_loja');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    title="Editar os pratos, preços e dados desta loja"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Editar Cardápio & Loja</span>
                  </button>

                  <button
                    onClick={() => setModalMetricasLoja(tFoco)}
                    className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    title="Ver resumo de vendas, canais e exportar relatório"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Métricas da Loja</span>
                  </button>

                  <button
                    onClick={() => selecionarTenant('global')}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-bold text-xs transition-all cursor-pointer"
                  >
                    <span>Voltar p/ Visão Global</span>
                  </button>
                </div>
              </div>
            );
          })()}

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
                { id: 'todos', label: `Todos (${tenantsAtivos.length})` },
                { id: 'ativo', label: 'Ativos' },
                { id: 'trial', label: 'Em Teste' },
                { id: 'atrasado', label: 'Atrasados' },
                { id: 'bloqueado', label: 'Bloqueados' },
                { id: 'cancelado', label: `Cancelados (${tenantsCancelados.length})` },
                { id: 'lixeira', label: `🗑️ Lixeira (${tenantsNaLixeira.length})` },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filtroStatus === item.id
                      ? (item.id === 'lixeira' || item.id === 'cancelado')
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'bg-purple-600 text-white shadow-sm font-bold'
                      : item.id === 'lixeira' || item.id === 'cancelado'
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setModalMetricasLoja({ id: 'todos', nomeFantasia: 'Todos os Restaurantes (Consolidado Geral)' } as any)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Ver métricas consolidadas de todas as lojas"
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Métricas Consolidadas</span>
              </button>

              <button
                type="button"
                onClick={handleExportarRestaurantesCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Exportar planilha de clientes em formato CSV"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setModalNovoTenant(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Restaurante</span>
              </button>
            </div>
          </div>

          {filtroStatus === 'cancelado' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-rose-200 text-xs shadow-lg animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Restaurantes Cancelados ({tenantsCancelados.length}):</strong> Lojas com assinatura cancelada ou suspensa. Clique no botão verde <strong>"Reativar Loja"</strong> para reabri-las imediatamente em modo Ativo.
                </span>
              </div>
            </div>
          )}

          {filtroStatus === 'lixeira' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-rose-200 text-xs shadow-lg animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Lixeira de Restaurantes ({tenantsNaLixeira.length}):</strong> Estabelecimentos na lixeira estão suspensos e não geram faturamento. Você pode restaurá-los com 1 clique ou excluí-los permanentemente.
                </span>
              </div>
              {tenantsNaLixeira.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Atenção: Deseja esvaziar a lixeira e EXCLUIR DEFINITIVAMENTE todos os ${tenantsNaLixeira.length} restaurante(s) da lixeira?\n\nEsta ação apagará permanentemente esses dados e não poderá ser desfeita.`)) {
                      esvaziarLixeiraTenants();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Esvaziar Lixeira</span>
                </button>
              )}
            </div>
          )}

          {/* Tabela de Assinantes SaaS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Restaurante / Razão Social</th>
                  <th className="py-3.5 px-4">Responsável & Contato</th>
                  <th className="py-3.5 px-4">Plano</th>
                  <th className="py-3.5 px-4">Mensalidade</th>
                  <th className="py-3.5 px-4">Status Assinatura</th>
                  <th className="py-3.5 px-4 text-center">Relatório & Métricas</th>
                  <th className="py-3.5 px-4 text-center">WhatsApp IA</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {tenantsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
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
                          <button
                            type="button"
                            onClick={() => handleAbrirCredenciais(tenant)}
                            className="mt-1 px-2 py-0.5 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-[10px] text-purple-300 hover:text-white font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Gerenciar credenciais de acesso do restaurante"
                          >
                            <KeyRound className="w-3 h-3 text-purple-400" />
                            <span>Login & Acesso</span>
                          </button>
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
                          {tenant.statusAssinatura === 'cancelado' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                              <XCircle className="w-3 h-3 text-rose-400" /> Cancelado
                            </span>
                          )}
                        </td>

                        {/* Relatório & Métricas */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setModalMetricasLoja(tenant)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                            title="Abrir Raio-X com vendas, canais e métricas desta loja"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Ver Métricas</span>
                          </button>
                        </td>

                        {/* Controle de WhatsApp IA (Anota AI Style) */}
                        <td className="py-3.5 px-4 text-center">
                          {isWhatsAppIALiberado(tenant.id) ? (
                            <button
                              type="button"
                              onClick={() => alternarWhatsAppIA(tenant.id, false, 'Ítalo Silva (Super Admin)')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold cursor-pointer hover:bg-rose-950/80 hover:text-rose-400 hover:border-rose-500/40 transition-colors shadow-sm"
                              title="WhatsApp IA Liberado! Clique para bloquear."
                            >
                              <Bot className="w-3 h-3 text-emerald-400" />
                              <span>Liberado</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => alternarWhatsAppIA(tenant.id, true, 'Ítalo Silva (Super Admin)')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold cursor-pointer hover:bg-emerald-950/80 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors shadow-sm"
                              title="Bloqueado pelo plano. Clique para liberar este módulo para o restaurante."
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Bloqueado</span>
                            </button>
                          )}
                        </td>

                        {/* Vencimento */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                          {tenant.proximoVencimento}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-5 text-right">
                          {tenant.naLixeira ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const res = restaurarTenant(tenant.id);
                                  if (res.sucesso) {
                                    alert(res.mensagem || 'Restaurante restaurado com sucesso!');
                                  } else {
                                    alert(res.mensagem || 'Erro ao restaurar.');
                                  }
                                }}
                                title="Restaurar Restaurante para Ativo"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restaurar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o restaurante "${tenant.nomeFantasia}"?\n\nEsta ação apagará permanentemente o cadastro e não poderá ser desfeita.`)) {
                                    const res = removerTenantDefinitivo(tenant.id);
                                    if (res.sucesso) {
                                      alert(res.mensagem || 'Restaurante excluído definitivamente.');
                                    } else {
                                      alert(res.mensagem || 'Erro ao excluir.');
                                    }
                                  }
                                }}
                                title="Excluir Definitivamente da Base"
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Definitivo</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botão Ver Métricas */}
                              <button
                                type="button"
                                onClick={() => setModalMetricasLoja(tenant)}
                                title="Ver resumo de vendas e métricas operacionais"
                                className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                                <span className="hidden lg:inline">Métricas</span>
                              </button>
                              {/* Botão Credenciais & Login Criado pelo Master */}
                              <button
                                type="button"
                                onClick={() => handleAbrirCredenciais(tenant)}
                                title="Gerenciar Login & Senha do Restaurante"
                                className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                                <span className="hidden lg:inline">Acesso</span>
                              </button>

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

                              {/* Bloquear / Desbloquear / Reativar */}
                              {tenant.statusAssinatura === 'cancelado' || tenant.statusAssinatura === 'bloqueado' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    atualizarStatusAssinatura(tenant.id, 'ativo');
                                    if (tenant.naLixeira) {
                                      restaurarTenant(tenant.id);
                                    }
                                    registrarLogAuditoria(
                                      'Reativação de Restaurante',
                                      'seguranca',
                                      `Acesso do restaurante "${tenant.nomeFantasia}" foi reativado para Ativo (Deixado em Aberto) pelo Franqueador Master.`
                                    );
                                  }}
                                  title="Reativar Restaurante / Deixar em Aberto (Status Ativo)"
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Reativar Loja</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Deseja suspender temporariamente o acesso do restaurante ${tenant.nomeFantasia}?`)) {
                                      atualizarStatusAssinatura(tenant.id, 'bloqueado');
                                      registrarLogAuditoria(
                                        'Bloqueio de Restaurante',
                                        'seguranca',
                                        `Acesso do restaurante "${tenant.nomeFantasia}" foi bloqueado temporariamente por inadimplência/administrativo`
                                      );
                                    }
                                  }}
                                  title="Bloquear Acesso por Falta de Pagamento"
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              )}

                              {/* Botão Mover para a Lixeira */}
                              <button
                                onClick={() => {
                                  if (confirm(`Deseja mover o restaurante "${tenant.nomeFantasia}" para a lixeira?\n\nEle não aparecerá mais nos relatórios ativos e o acesso ao sistema será suspenso.`)) {
                                    const res = moverTenantParaLixeira(tenant.id);
                                    if (!res.sucesso && res.mensagem) {
                                      alert(res.mensagem);
                                    }
                                  }
                                }}
                                title="Mover Restaurante para a Lixeira"
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
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
                          <option value="ativo">Ativo (Acesso Completo / Em Aberto)</option>
                          <option value="trial">Degustação Grátis (Trial)</option>
                          <option value="atrasado">Atrasado (Alerta de Fatura)</option>
                          <option value="bloqueado">Bloqueado (Acesso Suspenso)</option>
                          <option value="cancelado">Cancelado (Acesso Encerrado)</option>
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

      {/* CONTEÚDO DA ABA EXCLUSIVA: FATURAMENTO & MRR */}
      {abaAtiva === 'faturamento' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header da aba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-3xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                  Visão Executiva Franqueador
                </span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Métricas de Faturamento Recorrente (MRR)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe o faturamento mensal das assinaturas dos restaurantes, taxa de adimplência, períodos de teste e faturas em atraso.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportarRestaurantesCSV}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dados</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas SaaS */}
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
                Restaurantes com pendência financeira
              </span>
            </div>
          </div>

          {/* Métricas Adicionais e Distribuição por Plano */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Indicadores Chave do SaaS</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Ticket Médio por Assinante</span>
                  <strong className="text-sm font-mono text-white">
                    R$ {(mrr / (tenants.length || 1)).toFixed(2)} /mês
                  </strong>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Taxa de Adimplência</span>
                  <strong className="text-sm font-mono text-emerald-400">
                    {Math.round(((tenants.length - totalAtrasados) / (tenants.length || 1)) * 100)}%
                  </strong>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Meta para 100 Restaurantes</span>
                  <strong className="text-sm font-mono text-purple-400">
                    R$ 19.900,00 /mês
                  </strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Receita por Plano de Assinatura</span>
              </h4>
              <div className="space-y-3">
                {planos.map((plano) => {
                  const totalNestePlano = tenants.filter((t) => t.planoId === plano.id).length;
                  const receitaPlano = totalNestePlano * plano.precoMensal;
                  const percentual = mrr > 0 ? Math.round((receitaPlano / mrr) * 100) : 0;

                  return (
                    <div key={plano.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-white">{plano.nome}</strong>
                          <span className="text-slate-400 font-mono">({totalNestePlano} lojas)</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {receitaPlano.toFixed(2)}/mês ({percentual}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
        </div>
      )}

      {/* CONTEÚDO DA ABA: GESTÃO DE LOGINS & ACESSOS (SAAS MASTER & LOJAS) */}
      {abaAtiva === 'logins' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SecaoLoginsEquipe
            tenantId="global"
            isWhite={isWhite}
            onCadastrarRestauranteComLogin={() => setModalNovoTenant(true)}
          />
        </div>
      )}

      {/* CONTEÚDO DA ABA: CENTRAL DE AVISOS GLOBAIS (BROADCAST) */}
      {abaAtiva === 'avisos_globais' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast Multi-Tenant</span>
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                  {avisos.filter((a) => a.ativo).length} no ar
                </span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-amber-400" />
                <span>Central de Avisos Globais & Notificações</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                Publique mensagens que aparecem instantaneamente no topo da tela dos restaurantes clientes (manutenções, novidades de recursos, avisos comerciais ou feriados).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalNovoAviso(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Novo Comunicado</span>
            </button>
          </div>

          {/* Lista de Comunicados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avisos.length === 0 ? (
              <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhum comunicado cadastrado</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Crie comunicados informativos para manter seus clientes atualizados sobre novidades e manutenções do sistema.
                </p>
              </div>
            ) : (
              avisos.map((aviso) => {
                const tenantAlvo = tenants.find((t) => t.id === aviso.destinoTenantId);
                return (
                  <div
                    key={aviso.id}
                    className={`bg-slate-900 border rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all ${
                      aviso.ativo
                        ? aviso.tipo === 'novidade'
                          ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/20'
                          : aviso.tipo === 'urgente'
                          ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/20'
                          : aviso.tipo === 'alerta'
                          ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/20'
                          : 'border-blue-500/40 bg-gradient-to-br from-slate-900 to-blue-950/20'
                        : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                            aviso.tipo === 'novidade'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : aviso.tipo === 'urgente'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : aviso.tipo === 'alerta'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {aviso.tipo}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">{aviso.criadoEm}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{aviso.titulo}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{aviso.mensagem}</p>
                      </div>

                      <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-purple-400" />
                        <span>Destino:</span>
                        <strong className="text-purple-300">
                          {aviso.destinoTenantId === 'todos'
                            ? 'Todos os Restaurantes da Base'
                            : tenantAlvo?.nomeFantasia || 'Restaurante Específico'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                      <button
                        type="button"
                        onClick={() => alternarStatusAviso(aviso.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          aviso.ativo
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {aviso.ativo ? '🟢 No Ar (Ativo)' : '⏸️ Pausado'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja excluir o comunicado "${aviso.titulo}"?`)) {
                            removerAviso(aviso.id);
                            registrarLogAuditoria(
                              'Remoção de Comunicado',
                              'sistema',
                              `Comunicado "${aviso.titulo}" excluído`
                            );
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Excluir comunicado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: LOGS DE AUDITORIA SAAS */}
      {abaAtiva === 'auditoria' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  <span>Governança & Rastreabilidade</span>
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700 font-mono">
                  {logsAuditoria.length} registros gravados
                </span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <History className="w-6 h-6 text-purple-400" />
                <span>Logs de Auditoria e Atividades da Plataforma</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                Histórico imutável com data, hora, responsável e detalhes de todas as alterações feitas no SaaS (bloqueios, migração de planos, novos cadastros e mudanças financeiras).
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportarLogsCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
              title="Baixar planilha de logs em formato CSV"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Exportar Logs (CSV)</span>
            </button>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'todos', label: 'Todas as Ações' },
              { id: 'restaurante', label: 'Restaurantes' },
              { id: 'plano', label: 'Planos & Limites' },
              { id: 'financeiro', label: 'Financeiro & Custos' },
              { id: 'sistema', label: 'Sistema & Broadcast' },
              { id: 'cobranca', label: 'Cobranças WhatsApp' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFiltroAuditoria(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroAuditoria === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tabela de Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Data & Horário</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Ação Realizada</th>
                    <th className="py-3 px-4">Detalhes da Operação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {logsAuditoria
                    .filter((l) => filtroAuditoria === 'todos' || l.categoria === filtroAuditoria)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{log.dataHora}</td>
                        <td className="py-3 px-4 text-white font-semibold flex items-center gap-1.5 whitespace-nowrap">
                          <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{log.usuarioNome}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              log.categoria === 'restaurante'
                                ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                : log.categoria === 'plano'
                                ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                                : log.categoria === 'financeiro'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : log.categoria === 'cobranca'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{log.acao}</td>
                        <td className="py-3 px-4 text-slate-300 leading-relaxed max-w-md">{log.detalhes}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

            {/* CONTEÚDO DA ABA EXCLUSIVA DO ADMIN MASTER: CONFIGURAÇÕES & PLANOS */}
      {abaAtiva === 'config' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Superior */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    Configurações & Planos do Sistema (Painel Master)
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                    Exclusivo Super Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Configure os valores de mensalidade, módulos inclusos (WhatsApp IA, KDS, Garçom, Estoque) e dados oficiais de cobrança para todas as lojas.
                </p>
              </div>
            </div>

            {/* Sub-Abas de Navegação */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setSubAbaConfig('planos_mensalidades')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  subAbaConfig === 'planos_mensalidades'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Planos & Mensalidades</span>
              </button>

              <button
                type="button"
                onClick={() => setSubAbaConfig('dados_cobranca')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  subAbaConfig === 'dados_cobranca'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>2. Dados do Franqueador (PIX & Custos)</span>
              </button>
            </div>
          </div>

          {/* Feedback de sucesso */}
          {sucessoSalvarRegras && (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-xl animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{sucessoSalvarRegras}</span>
            </div>
          )}

          {/* SUB-ABA 1: PLANOS & MENSALIDADES (COMPLETA, TRANSPARENTE E TOTALMENTE CONFIGURÁVEL) */}
          {subAbaConfig === 'planos_mensalidades' && (
            <div className="space-y-6">
              {/* Seletor dos 3 Planos Oficiais */}
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
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isSelected ? 'text-purple-300' : 'text-slate-400'
                        }`}>
                          Plano {p.id}
                        </span>
                        {p.destaque && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Mais Vendido
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black mt-1 text-white">
                        {p.nome}
                      </h4>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black font-mono text-emerald-400">
                          R$ {p.precoMensal.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/mês</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Assinantes Atuais:</span>
                        <span className="font-bold text-white font-mono bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                          {totalLojasNestePlano} lojas
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Formulário Completo de Configuração das Regras do Plano */}
              <form onSubmit={handleSalvarRegrasPlano} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* COLUNA ESQUERDA (2 colunas): BLOCOS DE DADOS, MÓDULOS E LIMITES */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* BLOCO 1: IDENTIFICAÇÃO E VALORES COMERCIAIS */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>Identificação Comercial & Mensalidades</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Valores cobrados pelo franqueador para liberação e manutenção da licença SaaS.
                        </p>
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
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formRegrasPlano.precoMensal}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, precoMensal: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1">Preço Anual com Desconto (R$/ano)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formRegrasPlano.precoAnual}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, precoAnual: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1">Taxa de Adesão / Setup (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formRegrasPlano.taxaAdesao}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, taxaAdesao: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-slate-300 font-bold block mb-1 text-xs">Descrição Comercial do Plano</label>
                          <input
                            type="text"
                            value={formRegrasPlano.descricao}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, descricao: e.target.value })}
                            placeholder="Ex: Ideal para bares e restaurantes de médio e grande porte com alto volume..."
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                          <input
                            type="checkbox"
                            id="checkDestaque"
                            checked={formRegrasPlano.destaque}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, destaque: e.target.checked })}
                            className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                          />
                          <label htmlFor="checkDestaque" className="text-xs text-slate-300 font-medium cursor-pointer">
                            Marcar este plano como <strong className="text-amber-400">"Mais Vendido / Recomendado"</strong> no painel de contratação
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* BLOCO 2: REGRAS DE MÓDULOS TECNOLÓGICOS (FEATURE FLAGS) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span>Módulos Tecnológicos & Inteligência Artificial</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ligue ou desligue módulos para este plano. O robô de WhatsApp e funções premium só funcionam para quem tiver o módulo habilitado.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* 1. WhatsApp IA */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.whatsappIAIncluso
                            ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <Bot className="w-4 h-4 text-purple-400" />
                              <span>Atendente WhatsApp IA (EloBot)</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Atendimento 24h, cardápio e pedidos com IA estilo Anota AI</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.whatsappIAIncluso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, whatsappIAIncluso: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 2. Cozinha KDS */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.kdsIncluso
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <ChefHat className="w-4 h-4 text-emerald-400" />
                              <span>Painel Cozinha & KDS em Tempo Real</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Comandas digitais nas telas da cozinha e copa</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.kdsIncluso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, kdsIncluso: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 3. Garçom Mobile */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.garcomMobileIncluso
                            ? 'bg-blue-950/30 border-blue-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-blue-400" />
                              <span>Comanda Mobile para Garçons</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Atendimento e lançamento direto nas mesas pelo celular</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.garcomMobileIncluso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, garcomMobileIncluso: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 4. Estoque & Ficha Técnica */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.controleEstoqueIncluso
                            ? 'bg-amber-950/30 border-amber-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-amber-400" />
                              <span>Controle de Estoque & Ficha Técnica</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Baixa automática de insumos e alerta de estoque mínimo</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.controleEstoqueIncluso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, controleEstoqueIncluso: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 5. Cardápio Digital QR Code */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.cardapioQrCodeIncluso
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-emerald-400" />
                              <span>Cardápio Digital via QR Code</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Clientes visualizam e pedem pelo próprio celular</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.cardapioQrCodeIncluso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, cardapioQrCodeIncluso: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 6. DRE & Relatórios Avançados */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.relatoriosAvancados
                            ? 'bg-purple-950/30 border-purple-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <BarChart3 className="w-4 h-4 text-purple-400" />
                              <span>DRE Financeiro & Relatórios Avançados</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Demonstrativo de resultado, lucro líquido e CMV</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.relatoriosAvancados}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, relatoriosAvancados: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 7. Impressão Térmica de Comandas */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.impressaoTermicaInclusa
                            ? 'bg-cyan-950/30 border-cyan-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              <span>Impressão Térmica de Comandas</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Suporte a impressoras de 80mm e 58mm (balcão/cozinha)</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.impressaoTermicaInclusa}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, impressaoTermicaInclusa: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>

                        {/* 8. Suporte Prioritário VIP */}
                        <label className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formRegrasPlano.suportePrioritario
                            ? 'bg-amber-950/30 border-amber-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}>
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold block text-white flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-400" />
                              <span>Suporte Prioritário VIP 24/7</span>
                            </span>
                            <p className="text-[10px] text-slate-400">Canal direto via WhatsApp com tempo de resposta prioritário</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formRegrasPlano.suportePrioritario}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, suportePrioritario: e.target.checked })}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* BLOCO 3: LIMITES OPERACIONAIS DO RESTAURANTE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-purple-400" />
                          <span>Limites Operacionais & Capacidade do Sistema</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Defina a capacidade máxima de salão, equipe, cardápio e volume mensal permitida neste plano.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Máximo de Mesas no Salão</label>
                          <input
                            type="number"
                            value={formRegrasPlano.maxMesas}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxMesas: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Acima de 100 = Ilimitadas</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Caixas PDV Simultâneos</label>
                          <input
                            type="number"
                            value={formRegrasPlano.maxCaixasSimultaneos}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxCaixasSimultaneos: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Acima de 10 = Ilimitados</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Usuários / Garçons</label>
                          <input
                            type="number"
                            value={formRegrasPlano.maxUsuarios}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxUsuarios: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Acima de 50 = Ilimitados</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Máximo de Itens no Cardápio</label>
                          <input
                            type="number"
                            value={formRegrasPlano.maxItensCardapio}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxItensCardapio: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Acima de 300 = Ilimitados</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Pedidos / Mês Inclusos</label>
                          <input
                            type="number"
                            value={formRegrasPlano.maxPedidosMes}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, maxPedidosMes: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Acima de 5.000 = Ilimitados</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <label className="text-slate-300 font-bold block">Tolerância Atraso (Dias)</label>
                          <input
                            type="number"
                            value={formRegrasPlano.diasToleranciaAtraso}
                            onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, diasToleranciaAtraso: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block">Antes do bloqueio automático</span>
                        </div>
                      </div>
                    </div>

                    {/* BLOCO 4: REGRAS & TERMOS DE USO DO PLANO (SELEÇÃO INTELIGENTE DE REGRAS) */}
                    <div className={`${isWhite ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800 shadow-xl'} border rounded-3xl p-6 space-y-4`}>
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
                        <div>
                          <h4 className={`text-sm font-extrabold flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                            <FileText className="w-4 h-4 text-purple-500" />
                            <span>Cláusulas & Regras de Uso Visíveis para o Restaurante</span>
                          </h4>
                          <p className={`text-xs mt-0.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                            Selecione as regras e benefícios contratuais que estarão ativos para o <strong>Plano {formRegrasPlano.nome}</strong>. Clique na regra para marcar ou desmarcar.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                            isWhite
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                          }`}>
                            {formRegrasPlano.regrasTexto.length} regras selecionadas
                          </span>
                        </div>
                      </div>

                      {/* Barra de Filtros e Ações Rápidas */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                        {/* Filtros por status */}
                        <div className="flex items-center gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setFiltroRegras('todas')}
                            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                              filtroRegras === 'todas'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : isWhite
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Todas ({bancoRegras.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroRegras('selecionadas')}
                            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                              filtroRegras === 'selecionadas'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : isWhite
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Selecionadas ({formRegrasPlano.regrasTexto.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroRegras('nao_selecionadas')}
                            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                              filtroRegras === 'nao_selecionadas'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : isWhite
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Não Selecionadas ({bancoRegras.length - formRegrasPlano.regrasTexto.length})
                          </button>
                        </div>

                        {/* Botões Marcar/Desmarcar todas */}
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={handleMarcarTodasRegras}
                            className={`font-bold transition-colors cursor-pointer ${
                              isWhite ? 'text-purple-700 hover:text-purple-900' : 'text-purple-400 hover:text-purple-300'
                            }`}
                          >
                            Selecionar Todas
                          </button>
                          <span className="text-slate-400">•</span>
                          <button
                            type="button"
                            onClick={handleDesmarcarTodasRegras}
                            className={`font-bold transition-colors cursor-pointer ${
                              isWhite ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Desmarcar Todas
                          </button>
                        </div>
                      </div>

                      {/* Input para cadastrar nova regra no catálogo */}
                      <div className="flex gap-2 pt-1">
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
                          className={`flex-1 px-4 py-2.5 rounded-2xl text-xs focus:outline-none transition-colors ${
                            isWhite
                              ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                              : 'bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleAdicionarRegraTexto}
                          className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/25 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Adicionar Regra</span>
                        </button>
                      </div>

                      {/* Lista de Regras Interativas (Checklist Selecionável) */}
                      <div className="space-y-2 pt-2 max-h-[500px] overflow-y-auto pr-1">
                        {(() => {
                          const regrasFiltradas = bancoRegras.filter((regra) => {
                            const isChecked = formRegrasPlano.regrasTexto.includes(regra);
                            if (filtroRegras === 'selecionadas') return isChecked;
                            if (filtroRegras === 'nao_selecionadas') return !isChecked;
                            return true;
                          });

                          if (regrasFiltradas.length === 0) {
                            return (
                              <div className={`p-6 text-center rounded-2xl border text-xs italic ${
                                isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}>
                                Nenhuma regra encontrada para o filtro selecionado. Digite acima para adicionar novas regras.
                              </div>
                            );
                          }

                          return regrasFiltradas.map((regra, idx) => {
                            const isChecked = formRegrasPlano.regrasTexto.includes(regra);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleAlternarSelecaoRegra(regra)}
                                className={`group flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? isWhite
                                      ? 'bg-purple-50/70 border-purple-400/80 shadow-sm ring-1 ring-purple-500/20'
                                      : 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-500/50 shadow-md shadow-purple-500/10'
                                    : isWhite
                                    ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {/* Checkbox circular / arredondado com efeito visual */}
                                  <div
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                      isChecked
                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                        : isWhite
                                        ? 'border-2 border-slate-300 group-hover:border-purple-400 bg-white'
                                        : 'border-2 border-slate-700 group-hover:border-purple-500 bg-slate-900'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>

                                  <span
                                    className={`text-xs leading-relaxed ${
                                      isChecked
                                        ? isWhite
                                          ? 'text-slate-900 font-bold'
                                          : 'text-white font-bold'
                                        : isWhite
                                        ? 'text-slate-500 line-through opacity-70'
                                        : 'text-slate-500 line-through opacity-70'
                                    }`}
                                  >
                                    {regra}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      isChecked
                                        ? isWhite
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : isWhite
                                        ? 'bg-slate-100 text-slate-500'
                                        : 'bg-slate-900 text-slate-600'
                                    }`}
                                  >
                                    {isChecked ? 'Selecionada' : 'Não Selecionada'}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoverRegraDefinitiva(regra);
                                    }}
                                    title="Remover regra permanentemente do catálogo"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: SALVAMENTO & PREVIEW AO VIVO */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 sticky top-6">
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                        <Save className="w-4 h-4 text-purple-400" />
                        <span>Publicar Alterações do Plano</span>
                      </h4>

                      <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="checkPropagar"
                          checked={formRegrasPlano.atualizarAssinantes}
                          onChange={(e) => setFormRegrasPlano({ ...formRegrasPlano, atualizarAssinantes: e.target.checked })}
                          className="w-5 h-5 accent-purple-600 rounded cursor-pointer mt-0.5 shrink-0"
                        />
                        <label htmlFor="checkPropagar" className="text-xs text-slate-300 cursor-pointer">
                          <strong className="text-white block font-bold">Atualizar Assinantes Atuais</strong>
                          Aplica os novos valores e módulos imediatamente a todos os {tenants.filter((t) => t.planoId === planoIdRegrasEmEdicao).length} restaurantes cadastrados neste plano.
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl shadow-purple-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Save className="w-5 h-5" />
                        <span>Salvar Regras do Plano</span>
                      </button>

                      {/* Preview do Plano */}
                      <div className="pt-4 border-t border-slate-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Como o Restaurante Enxerga:
                        </span>
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{formRegrasPlano.nome}</span>
                            {formRegrasPlano.destaque && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                Mais Escolhido
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-black font-mono text-emerald-400">
                            R$ {Number(formRegrasPlano.precoMensal).toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-normal">/mês</span>
                          </div>
                          {formRegrasPlano.descricao && (
                            <p className="text-[11px] text-slate-400 italic">
                              "{formRegrasPlano.descricao}"
                            </p>
                          )}
                          <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{formRegrasPlano.maxMesas > 100 ? 'Mesas Ilimitadas' : `Até ${formRegrasPlano.maxMesas} mesas`}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{formRegrasPlano.maxCaixasSimultaneos > 10 ? 'Caixas PDV Ilimitados' : `Até ${formRegrasPlano.maxCaixasSimultaneos} caixa(s)`}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{formRegrasPlano.maxUsuarios > 50 ? 'Usuários Ilimitados' : `Até ${formRegrasPlano.maxUsuarios} usuários/garçons`}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{formRegrasPlano.maxItensCardapio > 300 ? 'Cardápio Ilimitado' : `Até ${formRegrasPlano.maxItensCardapio} itens no cardápio`}</span>
                            </div>
                            {formRegrasPlano.kdsIncluso && (
                              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Painel Cozinha (KDS) em tempo real</span>
                              </div>
                            )}
                            {formRegrasPlano.whatsappIAIncluso ? (
                              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                                <Bot className="w-3 h-3 text-purple-400" />
                                <span>Robô WhatsApp IA Atendente 24h</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-500 line-through">
                                <X className="w-3 h-3 text-slate-600" />
                                <span>Robô WhatsApp IA (Não incluso)</span>
                              </div>
                            )}
                            {formRegrasPlano.garcomMobileIncluso && (
                              <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                                <Check className="w-3 h-3 text-blue-400" />
                                <span>Comanda Garçom Mobile</span>
                              </div>
                            )}
                            {formRegrasPlano.controleEstoqueIncluso && (
                              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                                <Check className="w-3 h-3 text-amber-400" />
                                <span>Estoque & Ficha Técnica Automática</span>
                              </div>
                            )}
                            {formRegrasPlano.cardapioQrCodeIncluso && (
                              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Cardápio QR Code para mesas</span>
                              </div>
                            )}
                            {formRegrasPlano.relatoriosAvancados && (
                              <div className="flex items-center gap-1.5 text-purple-300 font-medium">
                                <Check className="w-3 h-3 text-purple-400" />
                                <span>DRE Financeiro & Relatórios Avançados</span>
                              </div>
                            )}
                            {formRegrasPlano.impressaoTermicaInclusa && (
                              <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                                <Check className="w-3 h-3 text-cyan-400" />
                                <span>Impressão Térmica de Comandas</span>
                              </div>
                            )}
                            {formRegrasPlano.suportePrioritario && (
                              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>Suporte Prioritário VIP</span>
                              </div>
                            )}

                            {/* Bullets textuais */}
                            {formRegrasPlano.regrasTexto.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                {formRegrasPlano.regrasTexto.map((r, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-slate-300 text-[10px]">
                                    <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                    <span>{r}</span>
                                  </div>
                                ))}
                              </div>
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

          {/* SUB-ABA 2: DADOS DE COBRANÇA DO FRANQUEADOR & CUSTOS */}
          {subAbaConfig === 'dados_cobranca' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span>Dados de Cobrança Oficiais do Franqueador</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Defina onde os restaurantes pagam suas mensalidades e o canal oficial de suporte.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Chave PIX Oficial para Recebimento das Mensalidades:</label>
                    <input
                      type="text"
                      defaultValue="financeiro@eloserve.com.br"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Exibida no botão "Pagar com PIX" das lojas</span>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">WhatsApp Oficial de Suporte & Cobrança:</label>
                    <input
                      type="text"
                      defaultValue={tenants.find((t) => t.id === 'global')?.telefoneWhatsApp || ''}
                      placeholder="Ex: +55 (DDD) 99999-9999"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Dias Padrão de Degustação Grátis (Trial para novos clientes):</label>
                    <input
                      type="number"
                      defaultValue={7}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => alert('Configurações do Franqueador salvas com sucesso!')}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Salvar Dados de Cobrança
                  </button>
                </div>
              </div>

              {/* Custos Operacionais do Franqueador */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-400" />
                    <span>Custos de Infraestrutura SaaS (DRE Master)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Custos fixos e percentuais abatidos do faturamento bruto para cálculo do lucro líquido.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Servidor Cloud VPS (R$/mês)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={custosInfra.cloudVps}
                      onChange={(e) => atualizarCustosInfra({ cloudVps: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Evolution WhatsApp API (R$/mês)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={custosInfra.evolutionWhatsapp}
                      onChange={(e) => atualizarCustosInfra({ evolutionWhatsapp: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Taxa Gateway Pagamento (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={custosInfra.taxaGatewayPct}
                      onChange={(e) => atualizarCustosInfra({ taxaGatewayPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Impostos Simples Nacional (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={custosInfra.impostoSimplesPct}
                      onChange={(e) => atualizarCustosInfra({ impostoSimplesPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                  💡 Esses valores são deduzidos automaticamente na aba <strong>Faturamento & MRR</strong> para exibir a margem líquida real da sua franquia SaaS.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
{/* Modal: Métricas & Raio-X Operacional da Loja */}
      {modalMetricasLoja && (() => {
        const isTodos = modalMetricasLoja.id === 'todos';
        const dados = calcularDossieTenant(modalMetricasLoja.id, metricasMes, metricasAno);
        const NOMES_MESES = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-6 shadow-2xl relative text-left">
              {/* Header do Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xl shrink-0 font-bold">
                    📊
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                        {isTodos ? 'Visão Multi-Loja' : 'Raio-X Operacional'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {NOMES_MESES[metricasMes - 1]} de {metricasAno}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {modalMetricasLoja.nomeFantasia}
                    </h3>
                  </div>
                </div>

                {/* Filtro Mês / Ano & Fechar */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={metricasMes}
                    onChange={(e) => setMetricasMes(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    {NOMES_MESES.map((nome, idx) => (
                      <option key={idx + 1} value={idx + 1}>{nome}</option>
                    ))}
                  </select>
                  <select
                    value={metricasAno}
                    onChange={(e) => setMetricasAno(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                  <button
                    onClick={() => setModalMetricasLoja(null)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Cards de KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Receita Bruta Total</span>
                  <p className="text-xl font-black text-white font-mono mt-1">R$ {dados.receitaBruta.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Líquida: R$ {dados.receitaLiquida.toFixed(2)}</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pedidos Concluídos</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">{dados.vendasConcluidas.length}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">{dados.totalCancelamentos > 0 ? `R$ ${dados.totalCancelamentos.toFixed(2)} cancelados` : 'Sem cancelamentos'}</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Médio</span>
                  <p className="text-xl font-black text-purple-400 font-mono mt-1">
                    R$ {(dados.receitaBruta / (dados.vendasConcluidas.length || 1)).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Por atendimento</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Serviço 10%</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-1">R$ {dados.totalTaxaServico.toFixed(2)}</p>
                  <span className="text-[10px] text-amber-400/80 block mt-1">Rateio / Garçom</span>
                </div>
              </div>

              {/* Distribuição: Canais e Formas de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mix de Canais */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-purple-400" />
                    <span>Canais de Atendimento</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Salão (Mesas)</span>
                      <span className="font-mono font-bold text-white">R$ {dados.vendasSalao.toFixed(2)} ({dados.receitaBruta > 0 ? Math.round((dados.vendasSalao / dados.receitaBruta) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${dados.receitaBruta > 0 ? (dados.vendasSalao / dados.receitaBruta) * 100 : 0}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-300">Balcão / PDV</span>
                      <span className="font-mono font-bold text-white">R$ {dados.vendasBalcao.toFixed(2)} ({dados.receitaBruta > 0 ? Math.round((dados.vendasBalcao / dados.receitaBruta) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dados.receitaBruta > 0 ? (dados.vendasBalcao / dados.receitaBruta) * 100 : 0}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-300">Delivery</span>
                      <span className="font-mono font-bold text-white">R$ {dados.vendasDelivery.toFixed(2)} ({dados.receitaBruta > 0 ? Math.round((dados.vendasDelivery / dados.receitaBruta) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dados.receitaBruta > 0 ? (dados.vendasDelivery / dados.receitaBruta) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Formas de Pagamento */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Formas de Pagamento</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">PIX Instantâneo</span>
                      <span className="font-mono font-bold text-emerald-400">R$ {dados.pgtoPix.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Cartão de Crédito</span>
                      <span className="font-mono font-bold text-white">R$ {dados.pgtoCredito.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Cartão de Débito</span>
                      <span className="font-mono font-bold text-white">R$ {dados.pgtoDebito.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Dinheiro em Espécie</span>
                      <span className="font-mono font-bold text-amber-400">R$ {dados.pgtoDinheiro.toFixed(2)}</span>
                    </div>
                    {dados.pgtoOutros > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-300">Outros / Vouchers</span>
                        <span className="font-mono font-bold text-slate-400">R$ {dados.pgtoOutros.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recursos: Equipe e Estoque */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Colaboradores Vinculados</span>
                    <strong className="text-white">{dados.colaboradores.length} funcionários cadastrados</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Posição de Insumos/Estoque</span>
                    <strong className="text-white">{dados.estoqueItens.length} itens monitorados</strong>
                  </div>
                </div>
              </div>

              {/* Ações do Rodapé */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBaixarDossieCSV(modalMetricasLoja.id, metricasMes, metricasAno)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Baixar Relatório (CSV)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalMetricasLoja(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

              {/* Seção Exclusiva: Credenciais de Login Criadas pelo Admin Master */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/50 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Credenciais de Acesso do Restaurante (Definidas pelo Master)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Defina o e-mail, senha e PIN com os quais o gestor deste restaurante irá logar no EloServe.
                </p>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">E-mail de Login do Restaurante *</label>
                  <input
                    type="email"
                    required
                    value={form.loginEmail}
                    onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                    placeholder="ex: gerente@restaurante.com.br"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      value={form.loginSenha}
                      onChange={(e) => setForm({ ...form, loginSenha: e.target.value })}
                      placeholder="ex: Loja@2026"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">PIN Rápido (4 dígitos) *</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={form.loginPin}
                      onChange={(e) => setForm({ ...form, loginPin: e.target.value })}
                      placeholder="1234"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
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

      {/* Modal: Visualizar e Gerenciar Credenciais do Restaurante (Admin Master) */}
      {modalCredenciaisTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Login do Restaurante
                  </h3>
                  <p className="text-[11px] text-purple-400 font-semibold truncate">
                    {modalCredenciaisTenant.nomeFantasia}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCredenciaisTenant(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {msgCredencialSucesso && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{msgCredencialSucesso}</span>
              </div>
            )}

            <form onSubmit={handleSalvarCredenciais} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                ℹ️ Como Administrador Master, você tem autoridade exclusiva para criar, visualizar ou redefinir as credenciais de acesso de cada estabelecimento assinante.
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Nome do Gestor / Responsável
                </label>
                <input
                  type="text"
                  required
                  value={formCredencial.nomeGestor}
                  onChange={(e) => setFormCredencial({ ...formCredencial, nomeGestor: e.target.value })}
                  placeholder="Nome do gerente"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  E-mail de Login Oficial
                </label>
                <input
                  type="email"
                  required
                  value={formCredencial.email}
                  onChange={(e) => setFormCredencial({ ...formCredencial, email: e.target.value })}
                  placeholder="login@restaurante.com.br"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    type="text"
                    required
                    value={formCredencial.senha}
                    onChange={(e) => setFormCredencial({ ...formCredencial, senha: e.target.value })}
                    placeholder="Senha"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    PIN Rápido (4 dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={formCredencial.pin}
                    onChange={(e) => setFormCredencial({ ...formCredencial, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações de Acesso</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompartilharWhatsAppCredencial}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Credenciais via WhatsApp</span>
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

      {/* MODAL: AJUSTAR CUSTOS REAIS DA INFRAESTRUTURA SAAS */}
      {modalEditarCustos && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ajustar Custos Reais do SaaS</h3>
                  <p className="text-xs text-slate-400">Personalize com base nas notas fiscais e faturas reais da sua infraestrutura</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarCustos(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarCustosInfra} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Custo Servidor Cloud VPS & Banco de Dados (R$/mês):
                  </label>
                  <input
                    type="number"
                    step="5.0"
                    value={formCustos.cloudVps}
                    onChange={(e) => setFormCustos({ ...formCustos, cloudVps: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-white font-mono text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Ex: Hetzner, DigitalOcean, AWS ou Supabase</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Custo Servidor de Conexão WhatsApp / Evolution API (R$/mês):
                  </label>
                  <input
                    type="number"
                    step="5.0"
                    value={formCustos.evolutionWhatsapp}
                    onChange={(e) => setFormCustos({ ...formCustos, evolutionWhatsapp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-white font-mono text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Hospedagem das instâncias e conexões de WhatsApp</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Taxa do Gateway (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCustos.taxaGatewayPct}
                      onChange={(e) => setFormCustos({ ...formCustos, taxaGatewayPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-white font-mono text-sm"
                      required
                    />
                    <span className="text-[10px] text-slate-400">Asaas, Stripe ou Mercado Pago</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Alíquota Impostos (%):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formCustos.impostoSimplesPct}
                      onChange={(e) => setFormCustos({ ...formCustos, impostoSimplesPct: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-white font-mono text-sm"
                      required
                    />
                    <span className="text-[10px] text-slate-400">Simples Nacional (padrão 6%)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Despesas de Suporte & Marketing Digital / CAC (R$/mês):
                  </label>
                  <input
                    type="number"
                    step="10.0"
                    value={formCustos.suporteMarketing}
                    onChange={(e) => setFormCustos({ ...formCustos, suporteMarketing: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-white font-mono text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Verba de anúncios no Google/Meta e ferramentas de suporte</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarCustos(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar & Recalcular DRE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVO COMUNICADO / AVISO GLOBAL */}
      {modalNovoAviso && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Novo Comunicado para Restaurantes</h3>
                  <p className="text-xs text-slate-400">Aparecerá instantaneamente no topo do painel das lojas selecionadas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAviso(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarAviso} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Título do Comunicado:</label>
                  <input
                    type="text"
                    placeholder="Ex: Manutenção Programada nesta Madrugada"
                    value={formAviso.titulo}
                    onChange={(e) => setFormAviso({ ...formAviso, titulo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Mensagem Completa:</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o comunicado com clareza para os operadores dos restaurantes..."
                    value={formAviso.mensagem}
                    onChange={(e) => setFormAviso({ ...formAviso, mensagem: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Tipo de Comunicado:</label>
                    <select
                      value={formAviso.tipo}
                      onChange={(e) => setFormAviso({ ...formAviso, tipo: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="novidade">🟢 Novidade / Recurso</option>
                      <option value="info">🔵 Informativo</option>
                      <option value="alerta">🟡 Alerta / Manutenção</option>
                      <option value="urgente">🔴 Urgente / Atenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Destinatário:</label>
                    <select
                      value={formAviso.destinoTenantId}
                      onChange={(e) => setFormAviso({ ...formAviso, destinoTenantId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="todos">Todos os Restaurantes</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nomeFantasia}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoAviso(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Comunicado Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
