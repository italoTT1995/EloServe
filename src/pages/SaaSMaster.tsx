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
import { useEloBotStore } from '../store/useEloBotStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { TipoPlanoSaaS, StatusAssinatura, Produto, PlanoAssinatura, TenantRestaurante } from '../types';
import { DREExecutivoSection } from '../components/financeiro/DREExecutivoSection';

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
    registrarLogAuditoria,
    codigoSegurancaMaster,
    masterDesbloqueado,
    tentativasFalhasMaster,
    bloqueadoAte,
    desbloquearMaster,
    bloquearMaster,
    alterarCodigoMaster,
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

  // Estados da Aba Dossiê Mensal & Consultoria Contábil
  const [dossieTenantId, setDossieTenantId] = useState<string>('todos');
  const [dossieMes, setDossieMes] = useState<number>(new Date().getMonth() + 1);
  const [dossieAno, setDossieAno] = useState<number>(new Date().getFullYear());
  const [dossieAbaInterna, setDossieAbaInterna] = useState<'dre' | 'vendas' | 'estoque' | 'equipe'>('dre');

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

  const {
    getConfig: getEloBotConfig,
    getConversas: getEloBotConversas,
    conectarInstancia: conectarEloBot,
    desconectarInstancia: desconectarEloBot,
  } = useEloBotStore();

  const [abaAtiva, setAbaAtiva] = useState<AbaMasterSaaS>(abaParam || 'restaurantes');

  useEffect(() => {
    if (abaParam && abaParam !== abaAtiva) {
      setAbaAtiva(abaParam);
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
  const [toastDRE, setToastDRE] = useState<string | null>(null);

  function handleToggleDRETenant(tenant: TenantRestaurante) {
    const novoStatus = !tenant.dreHabilitado;
    alternarPermissaoDRE(tenant.id, novoStatus, 'Italo Lemos (Super Admin)');
    setToastDRE(
      novoStatus
        ? `Módulo Financeiro & DRE LIBERADO com sucesso para "${tenant.nomeFantasia}"! O estabelecimento já pode consultar resultados contábeis e operacionais.`
        : `Acesso ao Financeiro & DRE BLOQUEADO para "${tenant.nomeFantasia}". O restaurante não poderá mais acessar o módulo.`
    );
    setTimeout(() => setToastDRE(null), 5000);
  }

  // Estados do Cofre de Segurança Master
  const [pinDigitado, setPinDigitado] = useState('');
  const [erroPin, setErroPin] = useState<string | null>(null);
  const [mostrarPin, setMostrarPin] = useState(false);
  const [cooldownSegundos, setCooldownSegundos] = useState(0);

  // Estados de alteração do PIN na aba Configurações
  const [formPin, setFormPin] = useState({
    codigoAtual: '',
    novoCodigo: '',
    confirmacao: '',
  });
  const [msgPinSucesso, setMsgPinSucesso] = useState<string | null>(null);
  const [msgPinErro, setMsgPinErro] = useState<string | null>(null);

  useEffect(() => {
    if (!bloqueadoAte) {
      setCooldownSegundos(0);
      return;
    }
    const interval = setInterval(() => {
      const agora = Date.now();
      if (agora >= bloqueadoAte) {
        setCooldownSegundos(0);
        clearInterval(interval);
      } else {
        setCooldownSegundos(Math.ceil((bloqueadoAte - agora) / 1000));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [bloqueadoAte]);

  function handleSubmeterPin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (cooldownSegundos > 0) return;
    if (!pinDigitado || pinDigitado.trim().length === 0) {
      setErroPin('Digite o Código de Segurança Master para continuar.');
      return;
    }
    const res = desbloquearMaster(pinDigitado.trim());
    if (res.sucesso) {
      setErroPin(null);
      setPinDigitado('');
    } else {
      setErroPin(res.mensagem || 'Código Master incorreto.');
      setPinDigitado('');
    }
  }

  function handleTecladoVirtual(num: string) {
    if (cooldownSegundos > 0) return;
    if (pinDigitado.length >= 8) return;
    const novo = pinDigitado + num;
    setPinDigitado(novo);
    setErroPin(null);
    if (novo.length === 6) {
      const res = desbloquearMaster(novo);
      if (res.sucesso) {
        setErroPin(null);
        setPinDigitado('');
      } else {
        setErroPin(res.mensagem || 'Código Master incorreto.');
        setPinDigitado('');
      }
    }
  }

  function handleBackspaceVirtual() {
    if (cooldownSegundos > 0) return;
    setPinDigitado((prev) => prev.slice(0, -1));
    setErroPin(null);
  }

  function handleLimparPin() {
    setPinDigitado('');
    setErroPin(null);
  }

  function handleSalvarNovoPin(e: React.FormEvent) {
    e.preventDefault();
    setMsgPinErro(null);
    setMsgPinSucesso(null);

    if (formPin.novoCodigo !== formPin.confirmacao) {
      setMsgPinErro('A confirmação do novo código não confere com o novo código digitado.');
      return;
    }

    const res = alterarCodigoMaster(formPin.codigoAtual, formPin.novoCodigo);
    if (res.sucesso) {
      setMsgPinSucesso(res.mensagem || 'Código Master alterado com sucesso!');
      setFormPin({ codigoAtual: '', novoCodigo: '', confirmacao: '' });
      setTimeout(() => setMsgPinSucesso(null), 4000);
    } else {
      setMsgPinErro(res.mensagem || 'Não foi possível alterar o código.');
    }
  }

  // Estados do Ambiente de Edição da Loja (editor_loja)
  const [subAbaEditor, setSubAbaEditor] = useState<'dados_loja' | 'cardapio_precos'>('dados_loja');
  const tenantEmEdicao = tenants.find((t) => t.id === (tenantEmEdicaoId || tenants[0]?.id)) || tenants[0];
  const produtos = getProdutosPorTenant(tenantEmEdicao?.id || 'tenant-01');
  const categorias = getCategoriasPorTenant(tenantEmEdicao?.id || 'tenant-01');

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
      const matchTenant = isTodos || (!v.tenantId && tenantAlvoId === 'tenant-01') || v.tenantId === tenantAlvoId;
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
      const matchTenant = isTodos || (!d.tenantId && tenantAlvoId === 'tenant-01') || d.tenantId === tenantAlvoId;
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
    csv += `DOSSIÊ FINANCEIRO MENSAL & DRE CONTÁBIL - PLATAFORMA eloGastrô (PADRÃO ABRASEL)\n`;
    csv += `Restaurante:;${tenantInfo.nomeFantasia}\n`;
    csv += `Documento (CNPJ/CPF):;${tenantInfo.documento || '-'}\n`;
    csv += `Cidade / UF:;${tenantInfo.cidadeUf || '-'}\n`;
    csv += `Mês de Referência:;${nomeMes} de ${anoAlvo}\n`;
    csv += `Data de Emissão do Relatório:;${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    csv += '=========================================================================\n\n';

    csv += '--- 1. DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE) ---\n';
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
    link.setAttribute('download', `dossie_mensal_${slug}_${anoAlvo}_${String(mesAlvo).padStart(2, '0')}.csv`);
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
    link.setAttribute('download', `dossie_mensal_${slug}_${anoAlvo}_${String(mesAlvo).padStart(2, '0')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
    const matchStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'dre_ativo' && t.dreHabilitado) ||
      (filtroStatus === 'dre_bloqueado' && !t.dreHabilitado) ||
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

  if (!masterDesbloqueado) {
    return (
      <div className={`min-h-[85vh] flex items-center justify-center p-4 select-none ${isWhite ? 'bg-slate-50' : ''}`}>
        <div className={`w-full max-w-md ${isWhite ? 'bg-white border-purple-200 shadow-2xl shadow-purple-500/10' : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-purple-500/30 shadow-2xl shadow-purple-950/50'} border rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl`}>
          {/* Luz de fundo decorativa */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 ${isWhite ? 'bg-purple-200/40' : 'bg-purple-600/20'} rounded-full blur-3xl pointer-events-none`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${isWhite ? 'bg-indigo-200/40' : 'bg-indigo-600/20'} rounded-full blur-3xl pointer-events-none`} />

          {/* Cabeçalho do Cofre */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl shadow-purple-500/30 mb-1">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="inline-block">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${isWhite ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'} border`}>
                Acesso Restrito Franqueador
              </span>
            </div>
            <h2 className={`text-2xl font-black ${isWhite ? 'text-slate-900' : 'text-white'} tracking-tight`}>
              Cofre de Segurança Master
            </h2>
            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'} max-w-xs mx-auto leading-relaxed`}>
              Autentique-se com o PIN executivo de 6 dígitos para acessar dados fiscais, DRE, métricas financeiras e assinantes.
            </p>
          </div>

          {/* Banner de erro ou cooldown */}
          {cooldownSegundos > 0 ? (
            <div className={`${isWhite ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'} border rounded-2xl p-3.5 text-center text-xs space-y-1 animate-pulse`}>
              <div className={`flex items-center justify-center gap-1.5 font-bold ${isWhite ? 'text-rose-800' : 'text-rose-200'}`}>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Cofre Bloqueado por Segurança</span>
              </div>
              <p className={`text-[11px] ${isWhite ? 'text-rose-600' : 'text-rose-300/90'}`}>
                Muitas tentativas incorretas. Aguarde <strong className={`font-mono text-sm ${isWhite ? 'text-rose-900 font-bold' : 'text-white'}`}>{cooldownSegundos}s</strong> para tentar novamente.
              </p>
            </div>
          ) : erroPin ? (
            <div className={`${isWhite ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'} border rounded-2xl p-3 text-center text-xs flex items-center justify-center gap-2 animate-in fade-in`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{erroPin}</span>
            </div>
          ) : null}

          {/* Mostrador de Dígitos PIN (Bolinhas) */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const preenchido = pinDigitado.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    preenchido
                      ? 'bg-purple-600 shadow-md shadow-purple-500/50 scale-110'
                      : isWhite
                      ? 'bg-slate-200 border border-slate-300'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Campo de Input nativo (para quem usa teclado físico) */}
          <form onSubmit={handleSubmeterPin} className="space-y-4">
            <div className="relative">
              <input
                type={mostrarPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={pinDigitado}
                disabled={cooldownSegundos > 0}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinDigitado(val);
                  setErroPin(null);
                  if (val.length === 6) {
                    const res = desbloquearMaster(val);
                    if (res.sucesso) {
                      setErroPin(null);
                      setPinDigitado('');
                    } else {
                      setErroPin(res.mensagem || 'Código Master incorreto.');
                      setPinDigitado('');
                    }
                  }
                }}
                placeholder="Ou digite o PIN aqui..."
                className={`w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 px-10 rounded-2xl focus:outline-none transition-all ${
                  isWhite
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:bg-white shadow-inner'
                    : 'bg-slate-950/80 border border-slate-800 focus:border-purple-500 text-white placeholder:text-slate-600'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrarPin(!mostrarPin)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${
                  isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                }`}
                title={mostrarPin ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {mostrarPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Teclado Virtual Numérico */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={cooldownSegundos > 0}
                  onClick={() => handleTecladoVirtual(num)}
                  className={`py-3 rounded-2xl font-mono text-lg font-bold shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isWhite
                      ? 'bg-slate-100 hover:bg-slate-200 active:bg-purple-600 active:text-white text-slate-800 border border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 active:bg-purple-600 text-white border border-slate-700/50'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={cooldownSegundos > 0 || !pinDigitado}
                onClick={handleLimparPin}
                className={`py-3 rounded-2xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isWhite
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40'
                }`}
              >
                Limpar
              </button>
              <button
                type="button"
                disabled={cooldownSegundos > 0}
                onClick={() => handleTecladoVirtual('0')}
                className={`py-3 rounded-2xl font-mono text-lg font-bold shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isWhite
                    ? 'bg-slate-100 hover:bg-slate-200 active:bg-purple-600 active:text-white text-slate-800 border border-slate-200'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 active:bg-purple-600 text-white border border-slate-700/50'
                }`}
              >
                0
              </button>
              <button
                type="button"
                disabled={cooldownSegundos > 0 || !pinDigitado}
                onClick={handleBackspaceVirtual}
                className={`py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${
                  isWhite
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40'
                }`}
                title="Apagar último dígito"
              >
                ⌫
              </button>
            </div>

            {/* Botão Principal Desbloquear */}
            <button
              type="submit"
              disabled={cooldownSegundos > 0 || !pinDigitado}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 !text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Unlock className="w-4 h-4 !text-white" />
              <span className="!text-white">Desbloquear Painel Master</span>
            </button>
          </form>

          {/* Dica de Código Padrão */}
          <div className={`pt-2 border-t flex items-center justify-between text-xs ${
            isWhite ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Código Padrão: <strong className={`font-mono ${isWhite ? 'text-purple-700 font-bold' : 'text-purple-300'}`}>889900</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPinDigitado('889900');
                const res = desbloquearMaster('889900');
                if (res.sucesso) {
                  setErroPin(null);
                  setPinDigitado('');
                }
              }}
              className={`text-[11px] font-bold hover:underline cursor-pointer ${
                isWhite ? 'text-purple-600 hover:text-purple-800' : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              Autopreencher & Entrar
            </button>
          </div>

          {/* Link para voltar ao PDV */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`text-xs transition-colors cursor-pointer ${
                isWhite ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ← Voltar ao Terminal de Atendimento (PDV)
            </button>
          </div>
        </div>
      </div>
    );
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

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={bloquearMaster}
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Bloquear o cofre de segurança executivo do SaaS Master"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Bloquear Painel</span>
          </button>

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
          <span>Restaurantes Assinantes ({tenants.length})</span>
        </button>

        <button
          onClick={() => handleMudarAba('dossie_mensal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === 'dossie_mensal'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-purple-300" />
          <span>Dossiê Mensal & DRE Lojas</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-black">
            Consultor
          </span>
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

        <Link
          to="/financeiro"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95"
          title="Abrir Central Financeira Completa das Lojas com DRE Padrão Abrasel"
        >
          <DollarSign className="w-4 h-4 text-white" />
          <span>Financeiro & DRE das Lojas</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase font-black">
            NOVA ABA
          </span>
        </Link>

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

                  const whatsappConfig = useEloBotStore.getState().getConfig(t.id);
                  const isWhatsappAtivo = whatsappConfig?.statusInstancia === 'conectado';

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
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">WhatsApp Robô</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isWhatsappAtivo ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-bold ${
                                isWhatsappAtivo ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {isWhatsappAtivo ? 'Online' : 'Desconectado'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">EloBot IA</span>
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
                { id: 'todos', label: `Todos (${tenants.length})` },
                { id: 'ativo', label: 'Ativos' },
                { id: 'dre_ativo', label: 'Com DRE Liberado' },
                { id: 'dre_bloqueado', label: 'DRE Bloqueado' },
                { id: 'trial', label: 'Em Teste' },
                { id: 'atrasado', label: 'Atrasados' },
                { id: 'bloqueado', label: 'Bloqueados' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFiltroStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filtroStatus === item.id
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback de Alteração de Permissão DRE */}
          {toastDRE && (
            <div className="p-3.5 rounded-2xl bg-purple-950/90 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{toastDRE}</span>
              </div>
              <button onClick={() => setToastDRE(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
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
                  <th className="py-3.5 px-4 text-center">Financeiro & DRE</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {tenantsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
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
                        </td>

                        {/* Financeiro & DRE (Feature Gating) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleDRETenant(tenant)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                tenant.dreHabilitado ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}
                              title={tenant.dreHabilitado ? 'Financeiro & DRE Liberado - Clique para Bloquear' : 'Financeiro & DRE Bloqueado - Clique para Liberar'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  tenant.dreHabilitado ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                tenant.dreHabilitado
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {tenant.dreHabilitado ? 'Liberado' : 'Bloqueado'}
                            </span>
                          </div>
                          {tenant.drePermissaoModificadoEm && (
                            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                              Mod: {tenant.drePermissaoModificadoEm.split(' ')[0]}
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

                            {/* Bloquear / Desbloquear */}
                            {tenant.statusAssinatura === 'bloqueado' ? (
                              <button
                                onClick={() => {
                                  atualizarStatusAssinatura(tenant.id, 'ativo');
                                  registrarLogAuditoria(
                                    'Desbloqueio de Restaurante',
                                    'seguranca',
                                    `Acesso do restaurante "${tenant.nomeFantasia}" foi reativado (Desbloqueado)`
                                  );
                                }}
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

      {/* CONTEÚDO DA ABA: DOSSIÊ MENSAL & CONSULTORIA FINANCEIRA (EXCLUSIVO SUPER ADMIN) */}
      {abaAtiva === 'dossie_mensal' && (() => {
        const dadosDossie = calcularDossieTenant(dossieTenantId, dossieMes, dossieAno);
        const tenantInfo = dossieTenantId === 'todos'
          ? { nomeFantasia: 'Todos os Restaurantes (Consolidado Multi-Loja)', documento: 'Multi-Tenant', cidadeUf: 'Brasil' }
          : tenants.find((t) => t.id === dossieTenantId) || { nomeFantasia: 'Restaurante', documento: '-', cidadeUf: '-' };

        const NOMES_MESES = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Banner Exclusivo */}
            <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/40 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-400" />
                    Exclusivo Super Admin Master
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider">
                    Auditoria & DRE Mensal
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                    Pacote para Consultoria
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <FileSpreadsheet className="w-6 h-6 text-purple-400 shrink-0" />
                  <span>Dossiê Mensal & Consultoria Financeira das Lojas</span>
                </h2>
                <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                  Ambiente exclusivo para o Administrador Master e consultores financeiros. Extraia todos os dados operacionais, faturamento, estoque, CMV, despesas e equipe de cada restaurante para elaborar relatórios contábeis e a DRE mensal definitiva.
                </p>
              </div>

              {/* Botões de Exportação Rápida */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                
                <button
                  type="button"
                  onClick={() => handleBaixarDossieCSV(dossieTenantId, dossieMes, dossieAno)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  title="Baixar planilha completa em formato CSV/Excel com todas as abas e cálculos"
                >
                  <Download className="w-4 h-4 text-purple-200" />
                  <span>Baixar Dossiê (CSV/Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBaixarDossieJSON(dossieTenantId, dossieMes, dossieAno)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Baixar estrutura bruta em JSON"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Imprimir visualização do Dossiê"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            {/* Barra de Seleção: Restaurante + Mês + Ano */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 flex-wrap flex-1">
                {/* Seletor de Restaurante */}
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-purple-400" />
                    Restaurante:
                  </label>
                  <select
                    value={dossieTenantId}
                    onChange={(e) => setDossieTenantId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="todos">🌐 Todos os Restaurantes (Consolidado Geral)</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        🍽️ {t.nomeFantasia} — {t.cidadeUf || 'Brasil'} ({t.statusAssinatura})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Mês */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Mês:
                  </label>
                  <select
                    value={dossieMes}
                    onChange={(e) => setDossieMes(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {NOMES_MESES.map((nome, i) => (
                      <option key={i + 1} value={i + 1}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Ano */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Ano:
                  </label>
                  <select
                    value={dossieAno}
                    onChange={(e) => setDossieAno(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                  </select>
                </div>
              </div>

              {/* Botões rápidos: Mês Atual / Mês Anterior */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => {
                    const agora = new Date();
                    setDossieMes(agora.getMonth() + 1);
                    setDossieAno(agora.getFullYear());
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-purple-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Mês Atual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const agora = new Date();
                    const mesAnt = agora.getMonth() === 0 ? 12 : agora.getMonth();
                    const anoAnt = agora.getMonth() === 0 ? agora.getFullYear() - 1 : agora.getFullYear();
                    setDossieMes(mesAnt);
                    setDossieAno(anoAnt);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Mês Anterior
                </button>
              </div>
            </div>

            {/* 6 Cards com KPIs Financeiros do Mês Selecionado */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Bruta</p>
                <p className="text-lg font-black text-white font-mono">R$ {dadosDossie.receitaBruta.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-medium">{dadosDossie.totalPedidos} pedidos faturados</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receita Líquida</p>
                <p className="text-lg font-black text-emerald-400 font-mono">R$ {dadosDossie.receitaLiquida.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-medium">Após deduções e descontos</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CMV Total (Insumos)</p>
                <p className="text-lg font-black text-amber-400 font-mono">R$ {dadosDossie.cmvTotal.toFixed(2)}</p>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  dadosDossie.cmvPct <= 35 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {dadosDossie.cmvPct.toFixed(1)}% da Receita
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margem Bruta</p>
                <p className="text-lg font-black text-purple-300 font-mono">R$ {dadosDossie.margemBruta.toFixed(2)}</p>
                <p className="text-[10px] text-purple-400 font-medium">{dadosDossie.margemBrutaPct.toFixed(1)}% de margem</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas + Sangrias</p>
                <p className="text-lg font-black text-rose-400 font-mono">R$ {dadosDossie.totalDespesasEOperacoes.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 font-medium">Fixas, vars. e sangrias</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resultado Operacional</p>
                <p className={`text-lg font-black font-mono ${
                  dadosDossie.resultadoOperacional >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  R$ {dadosDossie.resultadoOperacional.toFixed(2)}
                </p>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  dadosDossie.resultadoOperacional >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                }`}>
                  {dadosDossie.margemOperacionalPct.toFixed(1)}% Lucro
                </span>
              </div>
            </div>

            {/* Menu de Sub-Abas do Dossiê */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setDossieAbaInterna('dre')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  dossieAbaInterna === 'dre'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>1. DRE Contábil Mensal</span>
              </button>

              <button
                type="button"
                onClick={() => setDossieAbaInterna('vendas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  dossieAbaInterna === 'vendas'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>2. Mix de Canais & Pagamentos</span>
              </button>

              <button
                type="button"
                onClick={() => setDossieAbaInterna('estoque')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  dossieAbaInterna === 'estoque'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>3. Insumos & Posição de Estoque</span>
              </button>

              <button
                type="button"
                onClick={() => setDossieAbaInterna('equipe')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  dossieAbaInterna === 'equipe'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>4. Quadro de Colaboradores</span>
              </button>
            </div>

            {/* CONTEÚDO DAS SUB-ABAS */}
            {dossieAbaInterna === 'dre' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span>Demonstração do Resultado do Exercício — {NOMES_MESES[dossieMes - 1]} de {dossieAno}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Apuração contábil oficial para {tenantInfo.nomeFantasia}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBaixarDossieCSV(dossieTenantId, dossieMes, dossieAno)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Linha da DRE Contábil</th>
                        <th className="py-3 px-4 text-right">Valor em R$</th>
                        <th className="py-3 px-4 text-right">% Receita Líquida</th>
                        <th className="py-3 px-4 text-center">Classificação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      <tr className="bg-slate-950/40 font-bold">
                        <td className="py-3 px-4 text-white">(+) RECEITA OPERACIONAL BRUTA</td>
                        <td className="py-3 px-4 text-right font-mono text-white">R$ {dadosDossie.receitaBruta.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">-</td>
                        <td className="py-3 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">Faturamento</span></td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2.5 px-4 pl-8">↳ Vendas no Salão (Mesas & Comandas)</td>
                        <td className="py-2.5 px-4 text-right font-mono">R$ {dadosDossie.vendasSalao.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.vendasSalao / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Canal Presencial</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2.5 px-4 pl-8">↳ Vendas no Balcão (Takeaway / PDV)</td>
                        <td className="py-2.5 px-4 text-right font-mono">R$ {dadosDossie.vendasBalcao.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.vendasBalcao / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Canal Balcão</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2.5 px-4 pl-8">↳ Vendas no Delivery</td>
                        <td className="py-2.5 px-4 text-right font-mono">R$ {dadosDossie.vendasDelivery.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.vendasDelivery / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Canal Online</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2.5 px-4 pl-8">↳ Taxa de Serviço (10% Garçom)</td>
                        <td className="py-2.5 px-4 text-right font-mono">R$ {dadosDossie.totalTaxaServico.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.totalTaxaServico / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Gorjeta / Equipe</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2.5 px-4 pl-8">↳ Couvert Artístico Cobrado</td>
                        <td className="py-2.5 px-4 text-right font-mono">R$ {dadosDossie.totalCouvert.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.totalCouvert / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">Música Ao Vivo</td>
                      </tr>
                      <tr className="text-rose-400">
                        <td className="py-2.5 px-4 pl-8">(-) Deduções: Descontos e Cancelamentos</td>
                        <td className="py-2.5 px-4 text-right font-mono">- R$ {(dadosDossie.totalDescontos + dadosDossie.totalCancelamentos).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{dadosDossie.receitaLiquida > 0 ? (((dadosDossie.totalDescontos + dadosDossie.totalCancelamentos) / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">Dedução</span></td>
                      </tr>
                      <tr className="bg-purple-950/30 font-bold text-emerald-400 border-t border-b border-purple-500/30">
                        <td className="py-3 px-4">(=) RECEITA OPERACIONAL LÍQUIDA</td>
                        <td className="py-3 px-4 text-right font-mono text-base">R$ {dadosDossie.receitaLiquida.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono">100.0%</td>
                        <td className="py-3 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">Base 100%</span></td>
                      </tr>
                      <tr className="text-amber-400 font-semibold">
                        <td className="py-3 px-4 pl-8">(-) CUSTO DAS MERCADORIAS VENDIDAS (CMV)</td>
                        <td className="py-3 px-4 text-right font-mono">- R$ {dadosDossie.cmvTotal.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono">{dadosDossie.cmvPct.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">Custo Direto</span></td>
                      </tr>
                      <tr className="bg-slate-950/40 font-bold text-purple-300">
                        <td className="py-3 px-4">(=) MARGEM BRUTA / LUCRO BRUTO</td>
                        <td className="py-3 px-4 text-right font-mono text-base">R$ {dadosDossie.margemBruta.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono">{dadosDossie.margemBrutaPct.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">Margem</span></td>
                      </tr>
                      <tr className="text-rose-400 font-semibold bg-rose-950/20">
                        <td className="py-2.5 px-4 pl-8">(-) Despesas Operacionais Totais (Padrão Abrasel)</td>
                        <td className="py-2.5 px-4 text-right font-mono">- R$ {dadosDossie.totalDespesasCadastradas.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.totalDespesasCadastradas / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">Despesas</span></td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2 px-4 pl-12 text-[11px]">↳ 6.1 Pessoal & Equipe (Salários, Diárias Extras)</td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">- R$ {dadosDossie.despesasPessoal.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-slate-400 text-[11px]">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.despesasPessoal / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2 px-4 text-center text-slate-500 text-[10px]">Pessoal</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2 px-4 pl-12 text-[11px]">↳ 6.2 Ocupação & Utilidades (Aluguel, Luz, Água, Gás)</td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">- R$ {dadosDossie.despesasOcupacao.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-slate-400 text-[11px]">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.despesasOcupacao / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2 px-4 text-center text-slate-500 text-[10px]">Ocupação</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2 px-4 pl-12 text-[11px]">↳ 6.3 Comercial & Embalagens Delivery</td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">- R$ {dadosDossie.despesasComerciais.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-slate-400 text-[11px]">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.despesasComerciais / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2 px-4 text-center text-slate-500 text-[10px]">Comercial</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2 px-4 pl-12 text-[11px]">↳ 6.4 Serviços, TI & Manutenção (eloGastrô)</td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">- R$ {dadosDossie.despesasServicos.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-slate-400 text-[11px]">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.despesasServicos / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2 px-4 text-center text-slate-500 text-[10px]">Serviços / TI</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="py-2 px-4 pl-12 text-[11px]">↳ 6.5 Outras Despesas Gerais & Administrativas</td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">- R$ {dadosDossie.outrasDespesas.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right font-mono text-slate-400 text-[11px]">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.outrasDespesas / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2 px-4 text-center text-slate-500 text-[10px]">Gerais</td>
                      </tr>
                      <tr className="text-rose-400">
                        <td className="py-2.5 px-4 pl-8">(-) Sangrias e Retiradas Físicas de Caixa</td>
                        <td className="py-2.5 px-4 text-right font-mono">- R$ {dadosDossie.totalSangrias.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{dadosDossie.receitaLiquida > 0 ? ((dadosDossie.totalSangrias / dadosDossie.receitaLiquida) * 100).toFixed(1) : 0}%</td>
                        <td className="py-2.5 px-4 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">Caixa</span></td>
                      </tr>
                      <tr className={`font-black border-t-2 ${
                        dadosDossie.resultadoOperacional >= 0
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-950/40 text-rose-400 border-rose-500/40'
                      }`}>
                        <td className="py-4 px-4 text-sm uppercase">(=) RESULTADO OPERACIONAL DO MÊS (EBITDA ESTIMADO)</td>
                        <td className="py-4 px-4 text-right font-mono text-lg">R$ {dadosDossie.resultadoOperacional.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right font-mono text-sm">{dadosDossie.margemOperacionalPct.toFixed(1)}%</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-black ${
                            dadosDossie.resultadoOperacional >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {dadosDossie.resultadoOperacional >= 0 ? 'Lucro no Mês' : 'Prejuízo no Mês'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dossieAbaInterna === 'vendas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mix de Canais */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-400" />
                    <span>Faturamento por Canal de Venda</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Salão & Mesas</span>
                        <span className="font-mono text-white font-bold">R$ {dadosDossie.vendasSalao.toFixed(2)} ({dadosDossie.receitaBruta > 0 ? ((dadosDossie.vendasSalao / dadosDossie.receitaBruta) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${dadosDossie.receitaBruta > 0 ? (dadosDossie.vendasSalao / dadosDossie.receitaBruta) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Balcão / Takeaway</span>
                        <span className="font-mono text-white font-bold">R$ {dadosDossie.vendasBalcao.toFixed(2)} ({dadosDossie.receitaBruta > 0 ? ((dadosDossie.vendasBalcao / dadosDossie.receitaBruta) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${dadosDossie.receitaBruta > 0 ? (dadosDossie.vendasBalcao / dadosDossie.receitaBruta) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Delivery & Entregas</span>
                        <span className="font-mono text-white font-bold">R$ {dadosDossie.vendasDelivery.toFixed(2)} ({dadosDossie.receitaBruta > 0 ? ((dadosDossie.vendasDelivery / dadosDossie.receitaBruta) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dadosDossie.receitaBruta > 0 ? (dadosDossie.vendasDelivery / dadosDossie.receitaBruta) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meios de Pagamento */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Meios de Pagamento Utilizados</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-300">PIX Instantâneo</span>
                      <span className="font-mono text-emerald-400 font-bold">R$ {dadosDossie.pgtoPix.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-300">Cartão de Crédito</span>
                      <span className="font-mono text-purple-300 font-bold">R$ {dadosDossie.pgtoCredito.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-300">Cartão de Débito</span>
                      <span className="font-mono text-indigo-300 font-bold">R$ {dadosDossie.pgtoDebito.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-300">Dinheiro Físico</span>
                      <span className="font-mono text-amber-300 font-bold">R$ {dadosDossie.pgtoDinheiro.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dossieAbaInterna === 'estoque' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Insumos Cadastrados & Posição de Estoque</span>
                  </h3>
                  <span className="text-xs text-slate-400">{dadosDossie.estoqueItens.length} itens controlados</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="py-2.5 px-3">Insumo</th>
                        <th className="py-2.5 px-3">Categoria</th>
                        <th className="py-2.5 px-3">Unidade</th>
                        <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                        <th className="py-2.5 px-3 text-right">Mínimo</th>
                        <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                        <th className="py-2.5 px-3 text-right">Total Imobilizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dadosDossie.estoqueItens.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-500">Nenhum insumo registrado.</td>
                        </tr>
                      ) : (
                        dadosDossie.estoqueItens.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-white">{it.nome}</td>
                            <td className="py-2.5 px-3 text-slate-400 capitalize">{it.categoria}</td>
                            <td className="py-2.5 px-3 text-slate-400">{it.unidadeMedida}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-white">{it.quantidadeAtual}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">{it.estoqueMinimo}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-purple-300">R$ {(it.precoCusto || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">R$ {((it.quantidadeAtual || 0) * (it.precoCusto || 0)).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dossieAbaInterna === 'equipe' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Quadro de Colaboradores & Equipe</span>
                  </h3>
                  <span className="text-xs text-slate-400">{dadosDossie.colaboradores.length} colaboradores cadastrados</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="py-2.5 px-3">Nome</th>
                        <th className="py-2.5 px-3">Cargo / Função</th>
                        <th className="py-2.5 px-3">E-mail</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dadosDossie.colaboradores.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-500">Nenhum colaborador vinculado a esta loja.</td>
                        </tr>
                      ) : (
                        dadosDossie.colaboradores.map((colab) => (
                          <tr key={colab.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-white">{colab.nome}</td>
                            <td className="py-2.5 px-3 text-purple-300 capitalize">{colab.cargo.replace('_', ' ')}</td>
                            <td className="py-2.5 px-3 text-slate-400">{colab.email}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                colab.ativo ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                              }`}>
                                {colab.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* CONTEÚDO DA ABA: AMBIENTE DE EDIÇÃO DAS LOJAS */}
      {abaAtiva === 'editor_loja' && (
        !tenantEmEdicao ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Store className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-white">Nenhum restaurante cliente cadastrado ainda</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Para editar dados e cardápio de uma loja, cadastre o primeiro restaurante na aba "Restaurantes Assinantes".
            </p>
            <button
              onClick={() => {
                handleMudarAba('restaurantes');
                setModalNovoTenant(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              + Cadastrar Primeiro Restaurante
            </button>
          </div>
        ) : (
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
                  onClick={() => tenantEmEdicao && handleEntrarNaLoja(tenantEmEdicao.id)}
                  title="Abrir o PDV deste restaurante em Modo Suporte"
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspecionar PDV</span>
                </button>

                <button
                  onClick={() => tenantEmEdicao && setModalCobrancaWhatsApp(tenantEmEdicao)}
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

                    {/* Permissão Especial Financeiro & DRE */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                        <div className="space-y-0.5 pr-2">
                          <label className="text-white font-bold block text-xs flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            <span>Módulo Financeiro & DRE da Loja</span>
                          </label>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Permite aos gestores desta loja visualizar o módulo Financeiro, lançamentos, receitas e o DRE automatizado.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormEdicao({ ...formEdicao, dreHabilitado: !formEdicao.dreHabilitado })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formEdicao.dreHabilitado ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              formEdicao.dreHabilitado ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
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
        )
      )}

      {/* CONTEÚDO DA ABA: DRE EXECUTIVO & DASHBOARD DO SAAS MASTER */}
      {abaAtiva === 'dre_saas' && (
        <DREExecutivoSection
          tenants={tenants}
          mrr={mrr}
          custosInfra={custosInfra}
          onSalvarCustos={(novos) => {
            atualizarCustosInfra(novos);
            registrarLogAuditoria(
              'Atualização de Parâmetros de Custos',
              'financeiro',
              'Custos atualizados: VPS R$ ' + novos.cloudVps + ', WhatsApp R$ ' + novos.evolutionWhatsapp + ', Gateway ' + novos.taxaGatewayPct + '%, Impostos ' + novos.impostoSimplesPct + '%, Marketing R$ ' + novos.suporteMarketing
            );
          }}
          isWhite={isWhite}
        />
      )}

      {/* CONTEÚDO DA ABA 2: MÉTRICAS FINANCEIRAS & MRR */}
      {abaAtiva === 'financeiro' && (
        <div className="space-y-4">
          {/* BANNER DE ACESSO DIRETO À NOVA CENTRAL FINANCEIRA & DRE DAS LOJAS */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FF6B00]/25 via-emerald-600/20 to-purple-600/20 border border-[#FF6B00]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#FF6B00]/30 shrink-0">
                💰
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h4 className="text-sm font-black text-white">Central Financeira Completa & DRE Oficial das Lojas</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-400 font-bold border border-emerald-500/40">
                    NOVA ABA
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Cadastros de receitas, despesas manuais, regras recorrentes, fluxo de caixa e DRE contábil automatizado de cada restaurante ou de toda a rede consolidada.
                </p>
              </div>
            </div>
            <Link
              to="/financeiro"
              className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-lg shadow-[#FF6B00]/30 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <span>Abrir Central Financeira ➔</span>
            </Link>
          </div>
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
                      ? isWhite
                        ? 'bg-purple-50/90 border-purple-600 shadow-xl shadow-purple-500/10 ring-2 ring-purple-600/40'
                        : 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/40'
                      : isWhite
                      ? 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isWhite ? (isSelected ? 'text-purple-700' : 'text-slate-500') : (isSelected ? 'text-purple-300' : 'text-slate-400')
                    }`}>
                      Plano {p.id}
                    </span>
                    {p.destaque && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        isWhite ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        Mais Vendido
                      </span>
                    )}
                  </div>

                  <h4 className={`text-base font-black mt-1 ${isWhite ? (isSelected ? 'text-purple-950 font-black' : 'text-slate-900') : 'text-white'}`}>
                    {p.nome}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-2xl font-black font-mono ${isWhite ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      R$ {p.precoMensal.toFixed(2)}
                    </span>
                    <span className={`text-xs ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>/mês</span>
                  </div>

                  <div className={`mt-3 pt-3 border-t flex items-center justify-between text-[11px] ${
                    isWhite ? 'border-purple-200/80' : 'border-slate-800/80'
                  }`}>
                    <span className={isWhite ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>Assinantes Ativos:</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded-md border ${
                      isWhite
                        ? isSelected
                          ? 'bg-white text-purple-950 border-purple-300 font-bold'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                        : 'bg-slate-950 text-white border border-slate-800'
                    }`}>
                      {totalLojasNestePlano} restaurantes
                    </span>
                  </div>

                  {isSelected && (
                    <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${
                      isWhite ? 'text-purple-700' : 'text-purple-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isWhite ? 'bg-purple-600' : 'bg-purple-400'}`}></span>
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

      {/* CONTEÚDO DA ABA 4: INSTÂNCIAS WHATSAPP & IA */}
      {abaAtiva === 'whatsapp' && (
        <div className="space-y-6">
          {/* Header da aba e Gateway */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <span>Central de Instâncias WhatsApp & Atendentes IA (EloBot)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitore e controle a conexão dos robôs de atendimento em cada restaurante assinante.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Cluster Evolution API v2 Online</span>
                </span>
              </div>
            </div>

            {/* Métricas do Cluster IA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Instâncias Ativas</span>
                <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                  {tenants.filter((t) => t.instanciaWhatsAppConectada).length} / {tenants.length}
                </p>
                <span className="text-[10px] text-slate-500">Lojas com robô operando</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Motor de IA Padrão</span>
                <p className="text-sm font-black text-white font-mono mt-1">Google Gemini 1.5</p>
                <span className="text-[10px] text-purple-400">Latência média: 1.2s</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Atendimentos / Dia</span>
                <p className="text-xl font-black text-white font-mono mt-1">~148</p>
                <span className="text-[10px] text-emerald-400">95.8% resolvidos por IA</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transbordo Humano</span>
                <p className="text-xl font-black text-amber-400 font-mono mt-1">4.2%</p>
                <span className="text-[10px] text-slate-500">Casos que chamam garçom/caixa</span>
              </div>
            </div>
          </div>

          {/* Cards dos Restaurantes e suas Instâncias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => {
              const eloConfig = getEloBotConfig(t.id);
              const convs = getEloBotConversas(t.id);
              const isConectado = t.instanciaWhatsAppConectada;

              return (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-lg hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-white">{t.nomeFantasia}</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase">
                          {t.planoId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">{t.telefoneWhatsApp}</p>
                      <span className="text-xs text-emerald-400 font-medium block mt-0.5">
                        Agente: <strong>{eloConfig.nomeAgente || 'EloBot IA'}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      {isConectado ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>WhatsApp Conectado</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                          Desconectado
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                        {convs.length} conversa{convs.length !== 1 ? 's' : ''} no histórico
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        selecionarTenant(t.id);
                        navigate('/elobot');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Abrir Painel EloBot</span>
                    </button>

                    <button
                      onClick={() => {
                        const novoStatus = !isConectado;
                        atualizarDadosTenant(t.id, { instanciaWhatsAppConectada: novoStatus });
                        if (novoStatus) {
                          conectarEloBot(t.id);
                        } else {
                          desconectarEloBot(t.id);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isConectado
                          ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                          : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                      }`}
                    >
                      {isConectado ? 'Desconectar' : 'Conectar Bot'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 5: CONFIGURAÇÕES DO FRANQUEADOR */}
      {abaAtiva === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Configurações Globais do Franqueador</span>
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
                Salvar Configurações
              </button>
            </div>
          </div>

          {/* Card: Código de Segurança Master (PIN) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Segurança Executiva (PIN Master)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Altere o PIN de segurança que protege o painel geral do Franqueador.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Proteção Ativa
              </span>
            </div>

            {msgPinSucesso && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{msgPinSucesso}</span>
              </div>
            )}

            {msgPinErro && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{msgPinErro}</span>
              </div>
            )}

            <form onSubmit={handleSalvarNovoPin} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Código de Segurança Atual:</label>
                <input
                  type="password"
                  maxLength={8}
                  value={formPin.codigoAtual}
                  onChange={(e) => setFormPin({ ...formPin, codigoAtual: e.target.value.replace(/\D/g, '') })}
                  placeholder="Digite o PIN atual (padrão de fábrica: 889900)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Novo Código (4 a 8 dígitos):</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={formPin.novoCodigo}
                    onChange={(e) => setFormPin({ ...formPin, novoCodigo: e.target.value.replace(/\D/g, '') })}
                    placeholder="Novo PIN numérico"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest text-sm focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Confirmação do Novo PIN:</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={formPin.confirmacao}
                    onChange={(e) => setFormPin({ ...formPin, confirmacao: e.target.value.replace(/\D/g, '') })}
                    placeholder="Repita o novo PIN"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest text-sm focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500">
                  🔒 Cada alteração ou desbloqueio gera registro no Log de Auditoria.
                </span>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Atualizar Código Master</span>
                </button>
              </div>
            </form>
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
