import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  QrCode,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bell,
  X,
  Split,
  Layers,
  Check,
  UserCheck,
  Smartphone,
  Sparkles,
  MoreVertical,
  Pencil,
  UtensilsCrossed,
  FileText,
  Trash2,
  Crown,
  AlertTriangle,
  ArrowUpRight,
  ArrowRightLeft,
  UserPlus,
  Search,
  ChefHat,
  Minus,
  Send,
  Printer,
  Download,
  Copy,
  ExternalLink,
  CreditCard,
  User,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Tag,
  Calendar,
  Music,
  Cake,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { AdminAuthModal } from '../components/common/AdminAuthModal';
import { useAppStore } from '../store/useAppStore';
import { useReservaStore } from '../store/useReservaStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { useSaaSStore, PLANOS_DISPONIVEIS } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { Mesa, Produto, FormaPagamento, VendaRealizada, ItemComandaMesa, ReservaMesa } from '../types';
import { MesaQRCodeThumbnail } from '../components/mesas/MesaQRCodeThumbnail';
import {
  gerarQrCodeMesaDataUrl,
  getUrlMesaCliente,
  baixarQrCodeMesaPng,
  imprimirDisplayMesaIndividual,
  imprimirTodosDisplaysMesas,
} from '../utils/qrCodeHelper';

export default function Mesas() {
  const {
    getMesasPorTenant,
    atualizarStatusMesa,
    adicionarMesa,
    removerMesa,
    editarMesa,
    adicionarPessoaMesa,
    removerPessoaMesa,
    lancarItensComandaMesa,
    trocarMesa,
    registrarVenda,
    cancelarItemComandaMesa,
    toggleTaxaServicoMesa,
    toggleCouvertMesa,
    aplicarDescontoComandaMesa,
  } = useAppStore();
  const { funcionarios } = useFuncionarioStore();
  const { getProdutosPorTenant, getCategoriasPorTenant } = useProductStore();
  const { fichasTecnicas } = useEstoqueStore();
  const { getTenantAtivo, mudarPlanoTenant, atualizarDadosTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const idLoja = (!tenantAtual || tenantAtual.id === 'global') ? 'tenant-01' : tenantAtual.id;
  const mesas = getMesasPorTenant(idLoja);
  const produtos = getProdutosPorTenant(idLoja);
  const categorias = getCategoriasPorTenant(idLoja);

  const planoAtual = PLANOS_DISPONIVEIS.find((p) => p.id === tenantAtual?.planoId) || PLANOS_DISPONIVEIS[0];
  const maxMesasPermitidas = planoAtual.limites.maxMesas || 10;
  const isPlanoIlimitado = maxMesasPermitidas >= 999;
  const totalMesasAtuais = mesas.length;
  const limiteAtingido = !isPlanoIlimitado && totalMesasAtuais >= maxMesasPermitidas;
  const isPlanoPermiteReservas = planoAtual.limites.reservaMesasIncluso ?? false;

  const garconsDisponiveis = funcionarios.filter((f) => f.cargo === 'garcom' && f.ativo);

  const [setorSelecionado, setSetorSelecionado] = useState<string>('todos');
  const [menuAcoesMesaId, setMenuAcoesMesaId] = useState<number | null>(null);

  // Estados de Couvert Artístico no Salão
  const [modalCouvertAberto, setModalCouvertAberto] = useState(false);
  const [formCouvert, setFormCouvert] = useState<{
    ativo: boolean;
    valorPorPessoa: number;
    diasAoVivo: string[];
  }>({
    ativo: tenantAtual?.couvertArtisticoAtivo ?? true,
    valorPorPessoa: tenantAtual?.valorCouvertPorPessoa ?? 12.0,
    diasAoVivo: tenantAtual?.diasAoVivo || ['quinta', 'sexta', 'sabado', 'domingo'],
  });

  function handleSalvarCouvert() {
    const targetId = tenantAtual?.id === 'global' ? 'tenant-01' : (tenantAtual?.id || 'tenant-01');
    atualizarDadosTenant(targetId, {
      couvertArtisticoAtivo: formCouvert.ativo,
      valorCouvertPorPessoa: formCouvert.valorPorPessoa,
      valorCouvertPorComanda: formCouvert.valorPorPessoa,
      diasAoVivo: formCouvert.diasAoVivo,
    });
    dispararToast(
      formCouvert.ativo
        ? `🎵 Couvert Artístico configurado (R$ ${formCouvert.valorPorPessoa.toFixed(2)}/comanda aberta)!`
        : 'Couvert Artístico desativado no salão.'
    );
    setModalCouvertAberto(false);
  }

  // Modais de Criação e Limite do Plano
  const [modalCriarMesaAberto, setModalCriarMesaAberto] = useState(false);
  const [formNovaMesa, setFormNovaMesa] = useState({
    numero: 1,
    capacidade: 4,
    setor: 'Salão',
  });
  const [modalUpgradeAberto, setModalUpgradeAberto] = useState(false);

  // Modais
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [formAbertura, setFormAbertura] = useState({
    quantidadePessoas: 2,
    responsavelNome: '',
    garcomResponsavel: 'Lucas Oliveira',
  });

  const [mesaParaFechar, setMesaParaFechar] = useState<Mesa | null>(null);
  const [pessoasDivisao, setPessoasDivisao] = useState(2);
  const [mesaModalQR, setMesaModalQR] = useState<Mesa | null>(null);
  const [modalQrDataUrl, setModalQrDataUrl] = useState<string>('');
  const [copiadoLink, setCopiadoLink] = useState(false);

  useEffect(() => {
    if (mesaModalQR) {
      let ativo = true;
      gerarQrCodeMesaDataUrl(mesaModalQR.numero, mesaModalQR.setor, 500, idLoja)
        .then((url) => {
          if (ativo) setModalQrDataUrl(url);
        })
        .catch((err) => console.error('Erro gerando QR:', err));
      return () => {
        ativo = false;
      };
    } else {
      setModalQrDataUrl('');
      setCopiadoLink(false);
    }
  }, [mesaModalQR, idLoja]);

  const handleCopiarLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiadoLink(true);
    dispararToast('Link copiado para a área de transferência!');
    setTimeout(() => setCopiadoLink(false), 2500);
  };

  const [mesaParaUnir, setMesaParaUnir] = useState<Mesa | null>(null);
  const [mesaDestinoUniao, setMesaDestinoUniao] = useState<number>(2);

  // Estados de Troca e Transferência de Mesa
  const [mesaParaTrocar, setMesaParaTrocar] = useState<Mesa | null>(null);
  const [mesaDestinoTroca, setMesaDestinoTroca] = useState<number | null>(null);
  const [modoTrocaMesa, setModoTrocaMesa] = useState<'transferir' | 'unificar' | 'inverter'>('transferir');
  const [motivoTrocaMesa, setMotivoTrocaMesa] = useState<string>('');

  function handleAbrirModalTroca(mesa: Mesa) {
    setMesaParaTrocar(mesa);
    setMotivoTrocaMesa('');
    if (mesa.status !== 'livre') {
      const livres = mesas.filter((m) => m.numero !== mesa.numero && m.status === 'livre');
      const outras = mesas.filter((m) => m.numero !== mesa.numero);
      setMesaDestinoTroca(livres.length > 0 ? livres[0].numero : outras.length > 0 ? outras[0].numero : null);
      setModoTrocaMesa('transferir');
    } else {
      const ocupadas = mesas.filter((m) => m.status !== 'livre');
      setMesaDestinoTroca(ocupadas.length > 0 ? ocupadas[0].numero : null);
      setModoTrocaMesa('transferir');
    }
  }

  function handleConfirmarTrocaMesa(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!mesaParaTrocar || mesaDestinoTroca === null) return;

    let numOrigem = mesaParaTrocar.numero;
    let numDestino = mesaDestinoTroca;

    // Se abriu a partir de uma mesa livre, a origem é a mesa ocupada e o destino é a mesa livre
    if (mesaParaTrocar.status === 'livre') {
      numOrigem = mesaDestinoTroca;
      numDestino = mesaParaTrocar.numero;
    }

    const res = trocarMesa(numOrigem, numDestino, modoTrocaMesa, idLoja, motivoTrocaMesa);
    if (res.sucesso) {
      dispararToast(`🔄 ${res.mensagem}`);
      setMesaParaTrocar(null);
      setMesaDestinoTroca(null);
    } else {
      dispararToast(`⚠️ ${res.mensagem}`);
    }
  }

  // Estados para Edição Rápida do Nome do Responsável da Comanda
  const [mesaParaEditarNome, setMesaParaEditarNome] = useState<Mesa | null>(null);
  const [novoNomeResponsavel, setNovoNomeResponsavel] = useState<string>('');

  function abrirModalEditarResponsavel(mesa: Mesa) {
    setMesaParaEditarNome(mesa);
    setNovoNomeResponsavel(mesa.responsavelNome || `Mesa #${mesa.numero}`);
  }

  function handleSalvarNomeResponsavel(e: React.FormEvent) {
    e.preventDefault();
    if (!mesaParaEditarNome) return;
    const nomeAtualizado = novoNomeResponsavel.trim() || `Mesa #${mesaParaEditarNome.numero}`;
    editarMesa(mesaParaEditarNome.numero, { responsavelNome: nomeAtualizado }, idLoja);

    if (mesaParaLancar && mesaParaLancar.numero === mesaParaEditarNome.numero) {
      setMesaParaLancar({ ...mesaParaLancar, responsavelNome: nomeAtualizado });
    }

    dispararToast(`Responsável da Mesa #${mesaParaEditarNome.numero} atualizado para "${nomeAtualizado}"!`);
    setMesaParaEditarNome(null);
  }

  // Helper para obter todas as pessoas da mesa
  function getPessoasDaMesa(mesa: Mesa | null): string[] {
    if (!mesa) return [];
    const lista: string[] = [];
    if (mesa.responsavelNome) lista.push(mesa.responsavelNome);
    if (mesa.pessoas && mesa.pessoas.length > 0) {
      mesa.pessoas.forEach((p) => {
        if (!lista.includes(p)) lista.push(p);
      });
    }
    if (mesa.comandaItens && mesa.comandaItens.length > 0) {
      mesa.comandaItens.forEach((it) => {
        if (
          it.clienteNome &&
          it.clienteNome !== 'Geral (Mesa)' &&
          it.clienteNome !== 'Mesa (Compartilhado)' &&
          !lista.includes(it.clienteNome)
        ) {
          lista.push(it.clienteNome);
        }
      });
    }
    return lista.length > 0 ? lista : [mesa.responsavelNome || `Mesa #${mesa.numero}`];
  }

  // Helper para identificar a quem pertence cada item da comanda
  function getDonoDoItem(it: ItemComandaMesa, mesa: Mesa | null): string {
    if (!mesa) return 'Cliente';
    const pessoas = getPessoasDaMesa(mesa);
    if (it.clienteNome && pessoas.includes(it.clienteNome)) {
      return it.clienteNome;
    }
    return mesa.responsavelNome || pessoas[0] || `Mesa #${mesa.numero}`;
  }

  // Helper para cálculo dos totais da comanda (Subtotal, 10% Serviço, Couvert Artístico, Desconto e Total Final)
  function getTotaisComanda(mesa: Mesa | null, nomePessoa: string) {
    if (!mesa) {
      return {
        subtotal: 0,
        taxaServico: 0,
        taxaAtiva: true,
        couvertTotal: 0,
        couvertAtivo: false,
        valorCouvertBase: 0,
        qtdPessoasComCouvert: 0,
        desconto: 0,
        total: 0,
        itens: [],
      };
    }
    const todosItens = (mesa.comandaItens || []).filter((it) => !it.cancelado);
    const isTodos = nomePessoa === 'todos';
    const itens = isTodos
      ? todosItens
      : todosItens.filter((it) => getDonoDoItem(it, mesa) === nomePessoa);

    const subtotal = Number(itens.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2));

    // Regra: 10% de taxa de serviço SEMPRE INCLUSO por padrão
    // Somente o gerente pode isentar/retirar
    const taxaAtiva = isTodos
      ? mesa.taxaServicoAtiva !== false
      : (mesa.taxaServicoAtiva !== false && !(mesa.isencaoTaxaPorPessoa || []).includes(nomePessoa));

    const taxaServico = taxaAtiva ? Number((subtotal * 0.10).toFixed(2)) : 0;

    // Regra: Couvert Artístico
    // ATENÇÃO: Cobrança realizada POR COMANDA ABERTA e NÃO por pessoa física na mesa!
    const valorCouvertBase = mesa.valorCouvertPorComanda ?? mesa.valorCouvertPorPessoa ?? tenantAtual?.valorCouvertPorComanda ?? tenantAtual?.valorCouvertPorPessoa ?? 12.0;
    const couvertAtivo = mesa.couvertArtisticoAtivo !== undefined
      ? mesa.couvertArtisticoAtivo
      : (tenantAtual?.couvertArtisticoAtivo ?? false);

    let couvertTotal = 0;
    let qtdComandasComCouvert = 0;

    if (couvertAtivo) {
      if (isTodos) {
        // Se a mesa foi dividida em comandas individuais por pessoa (mesa.pessoas > 1):
        if (mesa.pessoas && mesa.pessoas.length > 1) {
          const isentos = mesa.isencaoCouvertPorPessoa || [];
          const comandasCobrar = mesa.pessoas.filter((p) => !isentos.includes(p));
          qtdComandasComCouvert = comandasCobrar.length;
          couvertTotal = Number((qtdComandasComCouvert * valorCouvertBase).toFixed(2));
        } else {
          // Comanda única da mesa: cobra exatamente 1x couvert pela comanda aberta (NÃO multiplica por quantidade de pessoas na mesa!)
          const isentoMesa = (mesa.isencaoCouvertPorPessoa || []).includes('todos');
          qtdComandasComCouvert = isentoMesa ? 0 : 1;
          couvertTotal = isentoMesa ? 0 : valorCouvertBase;
        }
      } else {
        // Sub-comanda individual aberta para uma pessoa específica
        const isento = (mesa.isencaoCouvertPorPessoa || []).includes(nomePessoa);
        qtdComandasComCouvert = isento ? 0 : 1;
        couvertTotal = isento ? 0 : valorCouvertBase;
      }
    }

    // Desconto concedido pelo gerente
    const desconto = isTodos
      ? Number((mesa.descontoMesa || 0).toFixed(2))
      : Number(((mesa.descontosPorPessoa && mesa.descontosPorPessoa[nomePessoa]) || 0).toFixed(2));

    const total = Math.max(0, Number((subtotal + taxaServico + couvertTotal - desconto).toFixed(2)));

    return {
      subtotal,
      taxaServico,
      taxaAtiva,
      couvertTotal,
      couvertAtivo,
      valorCouvertBase,
      qtdPessoasComCouvert: qtdComandasComCouvert,
      qtdComandasComCouvert,
      desconto,
      total,
      itens,
    };
  }

  // Hook e Estados de Reserva de Mesas (Exclusivo Pro e Enterprise)
  const {
    getReservas,
    adicionarReserva,
    atualizarStatusReserva,
    vincularMesaReserva,
    cancelarReserva,
    sentarReservaNaMesa,
  } = useReservaStore();

  const reservas = getReservas(idLoja);
  const hojeStr = new Date().toISOString().split('T')[0];
  const reservasHoje = reservas.filter((r) => r.data === hojeStr);
  const reservasHojePendentes = reservasHoje.filter((r) => r.status === 'pendente' || r.status === 'confirmada');

  const [modalReservasAberto, setModalReservasAberto] = useState(false);
  const [filtroStatusReserva, setFiltroStatusReserva] = useState<'todas' | 'hoje' | 'pendentes' | 'confirmadas'>('hoje');
  const [modalNovaReservaAberto, setModalNovaReservaAberto] = useState(false);
  const [mesaSelecionadaParaSentar, setMesaSelecionadaParaSentar] = useState<number | null>(null);
  const [formNovaReserva, setFormNovaReserva] = useState<{
    clienteNome: string;
    clienteTelefone: string;
    data: string;
    horario: string;
    quantidadePessoas: number;
    mesaNumero: number | undefined;
    aniversario: boolean;
    presencaBolo: boolean;
    decoracao: boolean;
    observacoes: string;
  }>({
    clienteNome: '',
    clienteTelefone: '',
    data: hojeStr,
    horario: '20:00',
    quantidadePessoas: 4,
    mesaNumero: undefined,
    aniversario: false,
    presencaBolo: false,
    decoracao: false,
    observacoes: '',
  });

  function handleCriarReservaManual(e: React.FormEvent) {
    e.preventDefault();
    if (!formNovaReserva.clienteNome.trim() || !formNovaReserva.clienteTelefone.trim()) {
      dispararToast('Por favor, preencha o nome e o telefone do cliente.');
      return;
    }

    const novaReserva = adicionarReserva({
      tenantId: idLoja,
      clienteNome: formNovaReserva.clienteNome.trim(),
      clienteTelefone: formNovaReserva.clienteTelefone.trim(),
      data: formNovaReserva.data,
      horario: formNovaReserva.horario,
      quantidadePessoas: formNovaReserva.quantidadePessoas,
      mesaNumero: formNovaReserva.mesaNumero,
      especiais: {
        aniversario: formNovaReserva.aniversario,
        presencaBolo: formNovaReserva.presencaBolo,
        decoracao: formNovaReserva.decoracao,
        observacoes: formNovaReserva.observacoes.trim() || undefined,
      },
      origem: 'manual',
      status: 'confirmada',
    });

    if (formNovaReserva.mesaNumero) {
      editarMesa(formNovaReserva.mesaNumero, { status: 'reservada', reservaId: novaReserva.id }, idLoja);
    }

    dispararToast(`📅 Reserva de ${novaReserva.clienteNome} registrada e confirmada com sucesso!`);
    setModalNovaReservaAberto(false);
    setFormNovaReserva({
      clienteNome: '',
      clienteTelefone: '',
      data: hojeStr,
      horario: '20:00',
      quantidadePessoas: 4,
      mesaNumero: undefined,
      aniversario: false,
      presencaBolo: false,
      decoracao: false,
      observacoes: '',
    });
  }

  function handleSentarReserva(reserva: ReservaMesa, mesaNum?: number) {
    const numeroMesaFinal = mesaNum || reserva.mesaNumero;
    if (!numeroMesaFinal) {
      dispararToast('Selecione uma mesa disponível para sentar os convidados.');
      return;
    }

    sentarReservaNaMesa(reserva.id, numeroMesaFinal, idLoja);
    editarMesa(
      numeroMesaFinal,
      {
        status: 'ocupada',
        responsavelNome: reserva.clienteNome,
        quantidadePessoas: reserva.quantidadePessoas,
        reservaId: reserva.id,
        comandaItens: [],
        totalConsumo: 0,
      },
      idLoja
    );

    dispararToast(`🎉 Mesa #${numeroMesaFinal} aberta para ${reserva.clienteNome}! Atendimento iniciado.`);
    setModalReservasAberto(false);
  }

  function handleVincularMesaReserva(reservaId: string, mesaNumero: number) {
    vincularMesaReserva(reservaId, mesaNumero, idLoja);
    editarMesa(mesaNumero, { status: 'reservada', reservaId }, idLoja);
    dispararToast(`Mesa #${mesaNumero} vinculada e reservada para esta reserva.`);
  }

  function handleCancelarReserva(reserva: ReservaMesa) {
    if (confirm(`Deseja realmente cancelar a reserva de ${reserva.clienteNome}?`)) {
      cancelarReserva(reserva.id, idLoja);
      if (reserva.mesaNumero) {
        const mesaLigada = mesas.find((m) => m.numero === reserva.mesaNumero);
        if (mesaLigada && mesaLigada.status === 'reservada') {
          editarMesa(reserva.mesaNumero, { status: 'livre', reservaId: undefined }, idLoja);
        }
      }
      dispararToast(`Reserva de ${reserva.clienteNome} foi cancelada.`);
    }
  }

  function handleConfirmarStatusReserva(reservaId: string, novoStatus: 'confirmada' | 'pendente') {
    atualizarStatusReserva(reservaId, novoStatus, idLoja);
    dispararToast(`Status da reserva atualizado para ${novoStatus.toUpperCase()}!`);
  }

  // Estados de Múltiplas Pessoas e Sub-comandas na Mesa
  const [modalAdicionarPessoa, setModalAdicionarPessoa] = useState<Mesa | null>(null);
  const [nomeNovaPessoa, setNomeNovaPessoa] = useState<string>('');
  const [pessoaSelecionadaLancamento, setPessoaSelecionadaLancamento] = useState<string>('');
  const [pessoaAtivaComanda, setPessoaAtivaComanda] = useState<string>('todos');
  const [modalPagamentoComanda, setModalPagamentoComanda] = useState<{
    mesa: Mesa;
    nomePessoa: string;
    valor: number;
    itens: ItemComandaMesa[];
  } | null>(null);
  const [formaPagamentoComanda, setFormaPagamentoComanda] = useState<FormaPagamento>('pix');
  const [tipoDivisaoConta, setTipoDivisaoConta] = useState<'por_pessoa' | 'igualitaria'>('por_pessoa');

  // Estados para Autorização de Gerente e Ações Restritas (10%, Desconto e Cancelamento)
  const [modalAuth, setModalAuth] = useState<{
    isOpen: boolean;
    actionTitle: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    actionTitle: '',
    onSuccess: () => {},
  });

  function solicitarAutorizacaoGerente(titulo: string, callback: () => void) {
    setModalAuth({
      isOpen: true,
      actionTitle: titulo,
      onSuccess: callback,
    });
  }

  // Estado e Modal de Desconto do Gerente
  const [modalDescontoGerente, setModalDescontoGerente] = useState<{
    mesa: Mesa;
    nomePessoa: string;
    valorAtual: number;
    subtotalComanda: number;
  } | null>(null);
  const [formDesconto, setFormDesconto] = useState<{
    tipo: 'reais' | 'porcentagem';
    valor: number;
    motivo: string;
  }>({
    tipo: 'reais',
    valor: 0,
    motivo: 'Cortesia do Gerente',
  });

  // Estado e Modal de Cancelamento de Item (Gerente)
  const [modalCancelarItem, setModalCancelarItem] = useState<{
    mesa: Mesa;
    item: ItemComandaMesa;
  } | null>(null);
  const [motivoCancelamentoItem, setMotivoCancelamentoItem] = useState<string>('Cliente desistiu');

  // Sincroniza qualquer alteração das mesas nos modais abertos
  function sincronizarMesasAbertas(numeroMesa: number) {
    const mesaAtualizada = useAppStore
      .getState()
      .getMesasPorTenant(idLoja)
      .find((m) => m.numero === numeroMesa);
    if (!mesaAtualizada) return;

    if (mesaParaLancar && mesaParaLancar.numero === numeroMesa) {
      setMesaParaLancar({ ...mesaAtualizada });
    }
    if (mesaParaFechar && mesaParaFechar.numero === numeroMesa) {
      setMesaParaFechar({ ...mesaAtualizada });
    }
    if (modalPagamentoComanda && modalPagamentoComanda.mesa.numero === numeroMesa) {
      const novosTot = getTotaisComanda(mesaAtualizada, modalPagamentoComanda.nomePessoa);
      setModalPagamentoComanda({
        ...modalPagamentoComanda,
        mesa: mesaAtualizada,
        valor: novosTot.total,
        itens: novosTot.itens,
      });
    }
  }

  // Ação 1 (Gerente): Retirar ou Restaurar 10%
  function handleSolicitarToggle10(mesa: Mesa, nomePessoa: string) {
    const tot = getTotaisComanda(mesa, nomePessoa);
    const isRetirar = tot.taxaAtiva;
    const alvoLabel = nomePessoa === 'todos' ? `Toda a Mesa #${mesa.numero}` : `comanda de "${nomePessoa}"`;

    solicitarAutorizacaoGerente(
      isRetirar
        ? `Autorização do Gerente necessária para RETIRAR os 10% de serviço da ${alvoLabel}`
        : `Autorização do Gerente necessária para RESTAURAR os 10% de serviço da ${alvoLabel}`,
      () => {
        const res = toggleTaxaServicoMesa(mesa.numero, nomePessoa, idLoja);
        dispararToast(
          res.isenta
            ? `Taxa de 10% removida com sucesso para ${alvoLabel} (autorizado pelo Gerente).`
            : `Taxa de 10% restaurada com sucesso para ${alvoLabel}.`
        );
        sincronizarMesasAbertas(mesa.numero);
      }
    );
  }

  // Ação 1.5 (Gerente): Retirar ou Ativar Couvert Artístico
  function handleSolicitarToggleCouvert(mesa: Mesa, nomePessoa: string) {
    const tot = getTotaisComanda(mesa, nomePessoa);
    const isRetirar = tot.couvertAtivo && tot.couvertTotal > 0;
    const alvoLabel = nomePessoa === 'todos' ? `Toda a Mesa #${mesa.numero}` : `comanda de "${nomePessoa}"`;

    solicitarAutorizacaoGerente(
      isRetirar
        ? `Autorização do Gerente necessária para ISENTAR o Couvert Artístico da ${alvoLabel}`
        : `Autorização do Gerente necessária para ATIVAR o Couvert Artístico da ${alvoLabel}`,
      () => {
        const res = toggleCouvertMesa(mesa.numero, nomePessoa, idLoja);
        dispararToast(
          res.isento
            ? `Couvert Artístico isentado para ${alvoLabel} (autorizado pelo Gerente).`
            : `Couvert Artístico ativado para ${alvoLabel}.`
        );
        sincronizarMesasAbertas(mesa.numero);
      }
    );
  }

  // Ação 2 (Gerente): Conceder Desconto na Comanda
  function handleAbrirDescontoGerente(mesa: Mesa, nomePessoa: string) {
    const alvoLabel = nomePessoa === 'todos' ? `Toda a Mesa #${mesa.numero}` : `comanda de "${nomePessoa}"`;
    solicitarAutorizacaoGerente(
      `Autorização do Gerente necessária para APLICAR DESCONTO na ${alvoLabel}`,
      () => {
        const tot = getTotaisComanda(mesa, nomePessoa);
        setModalDescontoGerente({
          mesa,
          nomePessoa,
          valorAtual: tot.desconto,
          subtotalComanda: tot.subtotal + tot.taxaServico,
        });
        setFormDesconto({
          tipo: 'reais',
          valor: tot.desconto > 0 ? tot.desconto : 0,
          motivo: 'Cortesia do Gerente',
        });
      }
    );
  }

  function handleConfirmarDescontoGerente(e: React.FormEvent) {
    e.preventDefault();
    if (!modalDescontoGerente) return;
    const { mesa, nomePessoa, subtotalComanda } = modalDescontoGerente;

    let valorFinal = 0;
    if (formDesconto.tipo === 'reais') {
      valorFinal = Math.min(subtotalComanda, Math.max(0, Number(formDesconto.valor) || 0));
    } else {
      const pct = Math.min(100, Math.max(0, Number(formDesconto.valor) || 0));
      valorFinal = Number(((subtotalComanda * pct) / 100).toFixed(2));
    }

    aplicarDescontoComandaMesa(mesa.numero, nomePessoa, valorFinal, idLoja);
    dispararToast(
      valorFinal > 0
        ? `Desconto de R$ ${valorFinal.toFixed(2)} concedido com sucesso pelo Gerente!`
        : `Desconto removido da comanda.`
    );
    setModalDescontoGerente(null);
    sincronizarMesasAbertas(mesa.numero);
  }

  // Ação 3 (Gerente): Cancelar Item da Comanda
  function handleSolicitarCancelarItem(mesa: Mesa, item: ItemComandaMesa) {
    solicitarAutorizacaoGerente(
      `Autorização do Gerente necessária para CANCELAR o item "${item.nome}" (R$ ${item.subtotal.toFixed(2)}) da Mesa #${mesa.numero}`,
      () => {
        setModalCancelarItem({ mesa, item });
        setMotivoCancelamentoItem('Cliente desistiu');
      }
    );
  }

  function handleConfirmarCancelarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!modalCancelarItem) return;
    const { mesa, item } = modalCancelarItem;

    const res = cancelarItemComandaMesa(
      mesa.numero,
      item.id,
      motivoCancelamentoItem,
      'Gerente',
      idLoja
    );

    if (res.sucesso) {
      dispararToast(`🚨 ${res.mensagem}`);
      setModalCancelarItem(null);
      sincronizarMesasAbertas(mesa.numero);
    } else {
      dispararToast(`⚠️ ${res.mensagem}`);
    }
  }

  function handleConfirmarAdicionarPessoa(e: React.FormEvent) {
    e.preventDefault();
    if (!modalAdicionarPessoa) return;
    const nome = nomeNovaPessoa.trim();
    if (!nome) return;

    adicionarPessoaMesa(modalAdicionarPessoa.numero, nome, idLoja);
    dispararToast(`👤 "${nome}" adicionado(a) à Mesa #${modalAdicionarPessoa.numero}!`);

    if (mesaParaLancar && mesaParaLancar.numero === modalAdicionarPessoa.numero) {
      const pessoasAtuais = getPessoasDaMesa(mesaParaLancar);
      if (!pessoasAtuais.includes(nome)) {
        setMesaParaLancar({
          ...mesaParaLancar,
          pessoas: [...pessoasAtuais, nome],
          quantidadePessoas: Math.max(mesaParaLancar.quantidadePessoas || 1, pessoasAtuais.length + 1),
        });
      }
      setPessoaSelecionadaLancamento(nome);
      setPessoaAtivaComanda(nome);
    }

    setNomeNovaPessoa('');
    setModalAdicionarPessoa(null);
  }

  // Transferência rápida de item entre pessoas da mesma mesa
  function handleReatribuirItem(itemId: string, novoDono: string) {
    if (!mesaParaLancar) return;
    const novosItens = (mesaParaLancar.comandaItens || []).map((it) =>
      it.id === itemId ? { ...it, clienteNome: novoDono } : it
    );
    editarMesa(mesaParaLancar.numero, { comandaItens: novosItens }, idLoja);
    setMesaParaLancar({ ...mesaParaLancar, comandaItens: novosItens });
    dispararToast(`Item transferido para a comanda de "${novoDono}"!`);
  }

  // Pagamento da comanda individual ou de toda a mesa com 10% e desconto aplicados
  function handleConfirmarPagamentoComanda(
    mesaAlvo: Mesa,
    nomePessoa: string,
    forma: FormaPagamento
  ) {
    const todosItens = mesaAlvo.comandaItens || [];
    const isTodos = nomePessoa === 'todos';
    const totais = getTotaisComanda(mesaAlvo, nomePessoa);

    if (totais.total <= 0 && totais.subtotal <= 0 && !isTodos) {
      dispararToast(`A comanda de "${nomePessoa}" não possui valor pendente.`);
      setModalPagamentoComanda(null);
      return;
    }

    const valorPago = totais.total;
    const itensPagos = totais.itens;

    // 1. Registra venda no caixa do sistema
    const agoraTexto =
      new Date().toLocaleDateString('pt-BR') +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const novaVenda: VendaRealizada = {
      id: `venda_${Date.now()}`,
      tenantId: idLoja,
      tipoOrigem: 'mesa',
      mesaNumero: mesaAlvo.numero,
      dataHora: agoraTexto,
      total: valorPago,
      subtotalBruto: totais.subtotal,
      taxaServico: totais.taxaServico,
      couvertArtistico: totais.couvertTotal,
      quantidadeCouvert: totais.qtdPessoasComCouvert,
      desconto: totais.desconto,
      formaPagamento: forma,
      itens: itensPagos.map((it) => ({
        produtoId: it.produtoId,
        nome: `${it.nome} (${isTodos ? getDonoDoItem(it, mesaAlvo) : nomePessoa})`,
        quantidade: it.quantidade,
        precoUnitario: it.precoUnitario,
        subtotal: it.subtotal,
      })),
      operador: mesaAlvo.garcomResponsavel || 'Caixa Salão',
      status: 'concluida',
    };
    registrarVenda(novaVenda);

    // 2. Atualiza os itens e o saldo da mesa
    const itensRestantes = isTodos
      ? []
      : todosItens.filter((it) => getDonoDoItem(it, mesaAlvo) !== nomePessoa);

    const novoTotalMesa = Number(
      itensRestantes.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2)
    );

    // Limpa descontos e isenções dessa pessoa
    const novosDescontos = { ...(mesaAlvo.descontosPorPessoa || {}) };
    delete novosDescontos[nomePessoa];
    const novasIsencoes = (mesaAlvo.isencaoTaxaPorPessoa || []).filter((x) => x !== nomePessoa);
    const novasIsencoesCouvert = (mesaAlvo.isencaoCouvertPorPessoa || []).filter((x) => x !== nomePessoa);

    if (itensRestantes.length === 0 || novoTotalMesa <= 0) {
      // Todas as comandas foram pagas: libera a mesa
      editarMesa(
        mesaAlvo.numero,
        {
          status: 'livre',
          totalConsumo: 0,
          comandaItens: [],
          pessoas: undefined,
          responsavelNome: undefined,
          descontoMesa: undefined,
          descontosPorPessoa: undefined,
          isencaoTaxaPorPessoa: undefined,
          taxaServicoAtiva: undefined,
          couvertArtisticoAtivo: undefined,
          isencaoCouvertPorPessoa: undefined,
          quantidadeCouvert: undefined,
          reservaId: undefined,
        },
        idLoja
      );
      dispararToast(
        `🎉 Comanda de "${isTodos ? 'todos' : nomePessoa}" (R$ ${valorPago.toFixed(2)}) quitada via ${forma.toUpperCase()}! Todas as contas pagas, Mesa #${mesaAlvo.numero} liberada.`
      );
      setModalPagamentoComanda(null);
      if (mesaParaLancar && mesaParaLancar.numero === mesaAlvo.numero) {
        setMesaParaLancar(null);
      }
      if (mesaParaFechar && mesaParaFechar.numero === mesaAlvo.numero) {
        setMesaParaFechar(null);
      }
    } else {
      // Outras pessoas continuam na mesa com seus consumos
      editarMesa(
        mesaAlvo.numero,
        {
          totalConsumo: novoTotalMesa,
          comandaItens: itensRestantes,
          descontosPorPessoa: novosDescontos,
          isencaoTaxaPorPessoa: novasIsencoes,
        },
        idLoja
      );
      dispararToast(
        `✅ Comanda de "${nomePessoa}" (R$ ${valorPago.toFixed(2)}) quitada via ${forma.toUpperCase()}! Restam R$ ${novoTotalMesa.toFixed(2)} na Mesa #${mesaAlvo.numero}.`
      );
      setModalPagamentoComanda(null);
      sincronizarMesasAbertas(mesaAlvo.numero);
      setPessoaAtivaComanda('todos');
    }
  }

  // Abertura centralizada da comanda
  function abrirComandaMesa(mesa: Mesa, aba: 'cardapio' | 'itens_consumidos' = 'cardapio', pessoaAlvo?: string) {
    const pessoas = getPessoasDaMesa(mesa);
    const alvo = pessoaAlvo || pessoas[0] || mesa.responsavelNome || `Mesa #${mesa.numero}`;
    setPessoaSelecionadaLancamento(alvo);
    setPessoaAtivaComanda(aba === 'itens_consumidos' && pessoas.length > 1 ? 'todos' : alvo);
    setAbaModalComanda(aba);
    setCarrinhoMesa([]);
    setMesaParaLancar(mesa);
  }

  // Estados de Lançamento de Pedidos e Comanda da Mesa
  const [mesaParaLancar, setMesaParaLancar] = useState<Mesa | null>(null);
  const [abaModalComanda, setAbaModalComanda] = useState<'cardapio' | 'itens_consumidos'>('cardapio');
  const [categoriaCardapioMesa, setCategoriaCardapioMesa] = useState<string>('todas');
  const [buscaPratoMesa, setBuscaPratoMesa] = useState<string>('');
  const [carrinhoMesa, setCarrinhoMesa] = useState<{
    produto: Produto;
    quantidade: number;
    observacoes: string;
    clienteNome?: string;
  }[]>([]);

  function handleAdicionarItemCarrinhoMesa(produto: Produto, paraPessoa?: string) {
    const pessoas = getPessoasDaMesa(mesaParaLancar);
    const alvo = paraPessoa !== undefined ? paraPessoa : (pessoaSelecionadaLancamento || pessoas[0] || 'Cliente');
    setCarrinhoMesa((prev) => {
      const existente = prev.find(
        (it) => it.produto.id === produto.id && (it.clienteNome || pessoas[0] || 'Cliente') === alvo
      );
      if (existente) {
        return prev.map((it) =>
          it.produto.id === produto.id && (it.clienteNome || pessoas[0] || 'Cliente') === alvo
            ? { ...it, quantidade: it.quantidade + 1 }
            : it
        );
      }
      return [...prev, { produto, quantidade: 1, observacoes: '', clienteNome: alvo }];
    });
  }

  function handleAlterarQtdItemCarrinhoMesa(produtoId: string, delta: number, clienteNome?: string) {
    setCarrinhoMesa((prev) =>
      prev
        .map((it) => {
          if (it.produto.id === produtoId && it.clienteNome === clienteNome) {
            const novaQtd = it.quantidade + delta;
            return novaQtd > 0 ? { ...it, quantidade: novaQtd } : null;
          }
          return it;
        })
        .filter(Boolean) as { produto: Produto; quantidade: number; observacoes: string; clienteNome?: string }[]
    );
  }

  function handleAlterarObsItemCarrinhoMesa(produtoId: string, observacoes: string, clienteNome?: string) {
    setCarrinhoMesa((prev) =>
      prev.map((it) => (it.produto.id === produtoId && it.clienteNome === clienteNome ? { ...it, observacoes } : it))
    );
  }

  function handleEnviarPedidoKDS(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!mesaParaLancar || carrinhoMesa.length === 0) return;

    const defaultPessoa = getPessoasDaMesa(mesaParaLancar)[0] || mesaParaLancar.responsavelNome || `Mesa #${mesaParaLancar.numero}`;
    const novosItens = carrinhoMesa.map((it) => ({
      produtoId: it.produto.id,
      nome: it.produto.nome,
      quantidade: it.quantidade,
      precoUnitario: it.produto.precoVenda,
      subtotal: Number((it.produto.precoVenda * it.quantidade).toFixed(2)),
      observacoes: it.observacoes.trim() || undefined,
      garcomNome: mesaParaLancar.garcomResponsavel || 'Lucas Oliveira',
      clienteNome: it.clienteNome || defaultPessoa,
    }));

    const res = lancarItensComandaMesa(
      mesaParaLancar.numero,
      novosItens,
      mesaParaLancar.garcomResponsavel || 'Lucas Oliveira',
      idLoja
    );

    if (res.sucesso) {
      dispararToast(
        `Pedido #${res.pedidoKDSId.replace('kds_', '')} da Mesa #${mesaParaLancar.numero} enviado com sucesso ao KDS da Cozinha! R$ ${res.totalAdicionado.toFixed(2)} lançado e estoque atualizado.`
      );
      setCarrinhoMesa([]);
      // Atualiza a mesa no modal para refletir os novos itens
      const mesaAtualizada = useAppStore.getState().getMesasPorTenant(idLoja).find((m) => m.numero === mesaParaLancar.numero);
      if (mesaAtualizada) {
        setMesaParaLancar({ ...mesaAtualizada });
      }
      setAbaModalComanda('itens_consumidos');
    }
  }

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const setoresCadastrados = Array.from(new Set(mesas.map((m) => m.setor).filter(Boolean)));
  const setores = ['todos', ...(setoresCadastrados.length > 0 ? setoresCadastrados : ['Salão', 'Varanda', 'Deck'])];

  const mesasFiltradas = mesas.filter(
    (m) => setorSelecionado === 'todos' || m.setor === setorSelecionado
  );

  const produtosFiltradosMesa = produtos.filter((p) => {
    if (!p.disponivel) return false;
    const matchCat = categoriaCardapioMesa === 'todas' || p.categoriaId === categoriaCardapioMesa;
    const matchBusca =
      !buscaPratoMesa ||
      p.nome.toLowerCase().includes(buscaPratoMesa.toLowerCase()) ||
      (p.descricao && p.descricao.toLowerCase().includes(buscaPratoMesa.toLowerCase()));
    return matchCat && matchBusca;
  });

  const totalLoteCarrinho = carrinhoMesa.reduce(
    (acc, it) => acc + it.produto.precoVenda * it.quantidade,
    0
  );

  const totalOcupadas = mesas.filter((m) => m.status === 'ocupada').length;
  const totalLivres = mesas.filter((m) => m.status === 'livre').length;
  const totalChamados = mesas.filter((m) => m.status === 'chamar_garcom').length;
  const taxaOcupacao = mesas.length > 0 ? Math.round((totalOcupadas / mesas.length) * 100) : 0;

  function handleConfirmarAberturaMesa(e: React.FormEvent) {
    e.preventDefault();
    if (!mesaParaAbrir) return;

    const nomeFinal = formAbertura.responsavelNome.trim() || `Mesa #${mesaParaAbrir.numero}`;
    const qtdPessoas = Number(formAbertura.quantidadePessoas) || 2;
    const garcom = formAbertura.garcomResponsavel || garconsDisponiveis[0]?.nome || 'Lucas Oliveira';

    editarMesa(mesaParaAbrir.numero, {
      status: 'ocupada',
      quantidadePessoas: qtdPessoas,
      responsavelNome: nomeFinal,
      garcomResponsavel: garcom,
      tempoOcupadaMin: 1,
      totalConsumo: 0,
      comandaItens: [],
    }, idLoja);

    dispararToast(`Mesa #${mesaParaAbrir.numero} aberta com sucesso! Responsável: ${nomeFinal} (${qtdPessoas} pessoas)`);
    setMesaParaAbrir(null);
  }

  function handleConfirmarAtendimentoChamado(mesa: Mesa) {
    mesa.status = 'ocupada';
    mesa.tempoChamadaGarcomMin = 0;
    mesa.alertaCritico = false;
    mesa.solicitacaoTransferida = false;
    atualizarStatusMesa(mesa.numero, 'ocupada', idLoja);
    dispararToast(`Chamado da Mesa #${mesa.numero} atendido com sucesso pelo garçom!`);
  }

  function handleSimularChamarGarcom(mesa: Mesa, minutosEspera = 9) {
    mesa.status = 'chamar_garcom';
    mesa.tempoChamadaGarcomMin = minutosEspera;
    if (minutosEspera >= 10) {
      mesa.solicitacaoTransferida = true;
      mesa.alertaCritico = true;
      dispararToast(`🚨 Alerta 10 min: Chamado da Mesa #${mesa.numero} transferido automaticamente para outro garçom disponível!`);
    } else if (minutosEspera >= 8) {
      mesa.alertaCritico = true;
      dispararToast(`⚠️ Alerta Crítico: Mesa #${mesa.numero} aguardando garçom há mais de 8 minutos!`);
    } else {
      dispararToast(`Mesa #${mesa.numero} chamou o garçom! Notificação enviada.`);
    }
    atualizarStatusMesa(mesa.numero, 'chamar_garcom', idLoja);
  }

  function handleConfirmarUniaoMesas() {
    if (!mesaParaUnir) return;
    mesaParaUnir.mesasUnidas = [mesaDestinoUniao];
    dispararToast(`Mesas #${mesaParaUnir.numero} e #${mesaDestinoUniao} unidas com comanda compartilhada!`);
    setMesaParaUnir(null);
  }

  function abrirModalCriarMesa() {
    if (limiteAtingido) {
      setModalUpgradeAberto(true);
      return;
    }
    const proximoNumero = mesas.length > 0 ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1;
    setFormNovaMesa({
      numero: proximoNumero,
      capacidade: 4,
      setor: setorSelecionado === 'todos' ? 'Salão' : setorSelecionado,
    });
    setModalCriarMesaAberto(true);
  }

  function handleCriarMesa(e: React.FormEvent) {
    e.preventDefault();
    if (limiteAtingido) {
      setModalCriarMesaAberto(false);
      setModalUpgradeAberto(true);
      return;
    }
    const num = Number(formNovaMesa.numero);
    if (!num || num <= 0) {
      dispararToast('⚠️ Informe um número de mesa válido.');
      return;
    }
    const res = adicionarMesa({
      numero: num,
      capacidade: Number(formNovaMesa.capacidade) || 4,
      setor: formNovaMesa.setor || 'Salão',
    }, idLoja);
    if (res.sucesso) {
      dispararToast(`✅ Mesa #${num} criada com sucesso no ${formNovaMesa.setor}!`);
      setModalCriarMesaAberto(false);
    } else {
      dispararToast(`⚠️ ${res.mensagem || 'Erro ao criar mesa'}`);
    }
  }

  function handleExcluirMesa(mesa: Mesa) {
    if (mesa.status !== 'livre') {
      dispararToast(`⚠️ Não é possível excluir a Mesa #${mesa.numero} enquanto ela estiver ocupada ou com comanda aberta. Feche a conta ou libere a mesa primeiro.`);
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir permanentemente a Mesa #${mesa.numero} (${mesa.setor})?`)) {
      const res = removerMesa(mesa.numero, idLoja);
      if (res.sucesso) {
        dispararToast(`🗑️ Mesa #${mesa.numero} excluída com sucesso!`);
      } else {
        dispararToast(`⚠️ ${res.mensagem}`);
      }
    }
  }

  function handleFazerUpgradeParaPro() {
    if (tenantAtual) {
      mudarPlanoTenant(tenantAtual.id, 'pro');
      setModalUpgradeAberto(false);
      dispararToast('🎉 Parabéns! Sua assinatura foi atualizada para o Plano Pro com Mesas Ilimitadas!');
    }
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner & KPIs com Controle de Limite de Plano */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Mapa de Mesas & Atendimento no Salão</span>
            {totalChamados > 0 && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                {totalChamados} Chamados Pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de comandas únicas, QR Code nas mesas, tempo de resposta de garçons e criação de mesas por plano.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Card Indicador do Plano e Limite de Mesas */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${isPlanoIlimitado ? 'bg-amber-500/10 text-amber-400' : limiteAtingido ? 'bg-rose-500/10 text-rose-400' : 'bg-orange-500/10 text-orange-400'}`}>
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">{planoAtual.nome}</span>
                {limiteAtingido ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    Limite Atingido
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {isPlanoIlimitado ? 'Ilimitado' : `${maxMesasPermitidas - totalMesasAtuais} livres`}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white font-mono">
                {totalMesasAtuais} {isPlanoIlimitado ? 'Mesas (Ilimitadas)' : `/ ${maxMesasPermitidas} Mesas`}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Livres</p>
              <p className="text-xs font-bold text-white font-mono">{totalLivres}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupadas</p>
              <p className="text-xs font-bold text-white font-mono">{totalOcupadas}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupação</p>
              <p className="text-xs font-bold text-amber-400 font-mono">{taxaOcupacao}%</p>
            </div>
          </div>

          {/* Botão de Central de Reservas de Mesas */}
          <button
            type="button"
            onClick={() => setModalReservasAberto(true)}
            title="Gerenciar reservas de mesas (Integrado ao WhatsApp EloBot)"
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservas</span>
            {reservasHojePendentes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-indigo-700 font-black text-[10px]">
                {reservasHojePendentes.length}
              </span>
            )}
          </button>

          {/* Botão de Gestão de Couvert Artístico no Salão */}
          <button
            type="button"
            onClick={() => {
              setFormCouvert({
                ativo: tenantAtual?.couvertArtisticoAtivo ?? true,
                valorPorPessoa: tenantAtual?.valorCouvertPorPessoa ?? 12.0,
                diasAoVivo: tenantAtual?.diasAoVivo || ['quinta', 'sexta', 'sabado', 'domingo'],
              });
              setModalCouvertAberto(true);
            }}
            title="Gerenciar e configurar Couvert Artístico do Salão (Música ao Vivo)"
            className="px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 transition-all active:scale-95"
          >
            <Music className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>Couvert: {tenantAtual?.couvertArtisticoAtivo ? `R$ ${(tenantAtual?.valorCouvertPorComanda ?? tenantAtual?.valorCouvertPorPessoa ?? 12).toFixed(2)}/comanda` : 'Inativo'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white text-purple-700 font-black text-[10px]">
              {tenantAtual?.couvertArtisticoAtivo ? 'Ativo' : 'Ativar'}
            </span>
          </button>

          {/* Botão Imprimir Todos os QRs */}
          <button
            onClick={() =>
              imprimirTodosDisplaysMesas(
                mesas.map((m) => ({
                  numero: m.numero,
                  setor: m.setor,
                  capacidade: m.capacidade,
                  tenantId: idLoja,
                })),
                tenantAtual?.nomeFantasia || 'Restaurante EloServe',
                'Cliente_Wifi',
                'eloserve2026',
                idLoja
              )
            }
            title="Imprimir displays e totens com QR Code de todas as mesas cadastradas"
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Imprimir Todos os QRs</span>
          </button>

          {/* Botão + Nova Mesa */}
          <button
            onClick={abrirModalCriarMesa}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              limiteAtingido
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Mesa</span>
            {limiteAtingido && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase font-black">
                Upgrade
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filtro de Setores com scroll horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {setores.map((setor) => (
          <button
            key={setor}
            onClick={() => setSetorSelecionado(setor)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              setorSelecionado === setor
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {setor === 'todos' ? 'Todos os Setores' : setor}
          </button>
        ))}
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => {
          const isReservada = mesa.status === 'reservada';
          const isLivre = mesa.status === 'livre';
          const isChamar = mesa.status === 'chamar_garcom';
          const isAguardando = mesa.status === 'aguardando_pagamento';
          const isCritico = mesa.alertaCritico || (mesa.tempoChamadaGarcomMin && mesa.tempoChamadaGarcomMin >= 8);

          return (
            <div
              key={mesa.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isReservada
                  ? 'bg-indigo-950/40 border-indigo-500/60 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                  : isLivre
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : isCritico
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/40'
                  : isChamar
                  ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                  : isAguardando
                  ? 'bg-blue-950/20 border-blue-500/40 ring-2 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-md'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MesaQRCodeThumbnail
                      numero={mesa.numero}
                      setor={mesa.setor}
                      size={44}
                      tenantId={idLoja}
                      onClick={() => setMesaModalQR(mesa)}
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        {mesa.setor} {mesa.mesasUnidas ? `(Unida com #${mesa.mesasUnidas.join(', ')})` : ''}
                      </span>
                      <h3 className="text-xl font-black text-white mt-0.5">
                        Mesa #{mesa.numero}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 relative">
                    <button
                      onClick={() => setMesaModalQR(mesa)}
                      title="Ampliar QR Code Real da Mesa"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-orange-400" />
                    </button>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isReservada
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                          : isLivre
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isCritico
                          ? 'bg-rose-500 text-white font-black animate-pulse'
                          : isChamar
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                          : isAguardando
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isReservada
                        ? 'Reservada'
                        : isLivre
                        ? 'Livre'
                        : isCritico
                        ? 'Alerta Crítico (>8m)'
                        : isChamar
                        ? 'Chamar Garçom'
                        : isAguardando
                        ? 'Conta Pedida'
                        : 'Ocupada'}
                    </span>

                    {/* Botão 3 Pontos com Menu de Contexto (Idêntico ao Print 4) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAcoesMesaId(menuAcoesMesaId === mesa.numero ? null : mesa.numero);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Opções da Mesa"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuAcoesMesaId === mesa.numero && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-9 w-48 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold animate-in fade-in zoom-in-95 space-y-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              if (isLivre) {
                                setMesaParaAbrir(mesa);
                                setFormAbertura({
                                  quantidadePessoas: mesa.capacidade,
                                  responsavelNome: '',
                                  garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                                });
                              } else {
                                setMesaParaLancar(mesa);
                                setAbaModalComanda('cardapio');
                                setCarrinhoMesa([]);
                              }
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-600" />
                            <span>Novo Pedido / Cardápio</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaLancar(mesa);
                              setAbaModalComanda('itens_consumidos');
                            }}
                            className="w-full px-3 py-1.5 text-left bg-slate-100 hover:bg-slate-200 flex items-center gap-2.5 text-slate-900 font-bold cursor-pointer"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5 text-slate-700" />
                            <span>Ver Comanda & Pedidos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              handleAbrirModalTroca(mesa);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-orange-50 flex items-center gap-2.5 text-orange-600 font-bold cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-500" />
                            <span>Trocar de Mesa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              abrirModalEditarResponsavel(mesa);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                            <span>Editar Nome / Responsável</span>
                          </button>

                          {!isLivre && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuAcoesMesaId(null);
                                setModalAdicionarPessoa(mesa);
                                setNomeNovaPessoa('');
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-cyan-50 flex items-center gap-2.5 text-cyan-700 font-bold cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Pessoas / Sub-comandas</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaLancar(mesa);
                              setAbaModalComanda('itens_consumidos');
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Visualizar Comanda Completa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              atualizarStatusMesa(mesa.numero, 'chamar_garcom', idLoja);
                              dispararToast(`Atenção marcada para Mesa #${mesa.numero}!`);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            <span>Marcar Atenção</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaFechar(mesa);
                              setPessoasDivisao(mesa.quantidadePessoas || 2);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fechar Conta</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              atualizarStatusMesa(mesa.numero, 'livre', idLoja);
                              dispararToast(`Mesa #${mesa.numero} liberada com sucesso!`);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 flex items-center gap-2.5 text-emerald-600 font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Liberar Mesa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaModalQR(mesa);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ver QR Code</span>
                          </button>

                          <div className="border-t border-slate-100 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuAcoesMesaId(null);
                                handleExcluirMesa(mesa);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Excluir Mesa</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações da Mesa */}
                <div className="my-4">
                  {isLivre ? (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacidade para até {mesa.capacidade} pessoas</span>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Responsável e Garçom */}
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Responsável:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-white truncate max-w-[130px]">
                              {mesa.responsavelNome || `Mesa #${mesa.numero}`}
                            </strong>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalEditarResponsavel(mesa);
                              }}
                              title="Alterar identificação / responsável desta comanda"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Garçom da Mesa:</span>
                          <span className="text-purple-300 font-semibold">{mesa.garcomResponsavel || 'Lucas Oliveira'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ocupantes:</span>
                          <span className="text-slate-200 font-bold">{mesa.quantidadePessoas || 2} pessoas</span>
                        </div>
                      </div>

                      {/* Pessoas / Sub-comandas na Mesa */}
                      <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Users className="w-3 h-3 text-cyan-400" />
                            Pessoas na mesa ({getPessoasDaMesa(mesa).length}):
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalAdicionarPessoa(mesa);
                              setNomeNovaPessoa('');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                            title="Adicionar outra pessoa/comanda individual a esta mesa"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>+ Pessoa</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-0.5">
                          {getPessoasDaMesa(mesa).map((p, pIdx) => {
                            const totP = getTotaisComanda(mesa, p);
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirComandaMesa(mesa, 'itens_consumidos', p);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 flex items-center gap-1 cursor-pointer transition-all"
                                title={`Abrir comanda de ${p}: R$ ${totP.total.toFixed(2)} (${totP.itens.length} itens - 10% incluso)`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                <span className="font-semibold truncate max-w-[80px]">{p}</span>
                                {totP.total > 0 ? (
                                  <span className="text-[9px] text-emerald-400 font-mono font-bold">
                                    R${totP.total.toFixed(0)}
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-500">R$0</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Alerta de Tempo Chamar Garçom (Seções 4.16 - 4.22) */}
                      {isChamar && (
                        <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span className="flex items-center gap-1">
                              <Bell className="w-3.5 h-3.5 animate-bounce" />
                              <span>Cliente Chamou Garçom</span>
                            </span>
                            <span className="font-mono">{mesa.tempoChamadaGarcomMin || 3} min</span>
                          </div>

                          {mesa.solicitacaoTransferida && (
                            <p className="text-[10px] text-rose-300 font-bold">
                              🚨 Passou de 10 min: redistribuído para equipe de apoio!
                            </p>
                          )}

                          <button
                            onClick={() => handleConfirmarAtendimentoChamado(mesa)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Atendimento</span>
                          </button>
                        </div>
                      )}

                      {/* Permanência e Total */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Permanência:
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {mesa.tempoOcupadaMin || 30} min
                        </span>
                      </div>

                      {/* Prévia dos itens da comanda */}
                      {mesa.comandaItens && mesa.comandaItens.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold flex items-center gap-1 text-slate-300">
                              <UtensilsCrossed className="w-3 h-3 text-orange-400" />
                              Comanda ({mesa.comandaItens.length} {mesa.comandaItens.length === 1 ? 'item' : 'itens'}):
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMesaParaLancar(mesa);
                                setAbaModalComanda('itens_consumidos');
                              }}
                              className="text-emerald-400 hover:underline cursor-pointer font-bold text-[10px]"
                            >
                              Ver comanda
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                            {mesa.comandaItens.slice(-3).map((it, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                              >
                                <span className="font-bold text-orange-400">{it.quantidade}x</span>
                                <span className="truncate max-w-[110px]">{it.nome}</span>
                              </span>
                            ))}
                            {mesa.comandaItens.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-bold">
                                +{mesa.comandaItens.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const totMesaCard = getTotaisComanda(mesa, 'todos');
                        return (
                          <div className="pt-1.5 border-t border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                Total da Mesa:
                              </span>
                              <span className="font-mono font-black text-emerald-400 text-sm">
                                R$ {totMesaCard.total.toFixed(2)}
                              </span>
                            </div>
                            {totMesaCard.taxaServico > 0 && (
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Itens: R$ {totMesaCard.subtotal.toFixed(2)}</span>
                                <span className="text-emerald-400/90 font-medium">+10% Serviço: R$ {totMesaCard.taxaServico.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Music className="w-3 h-3 text-purple-400" />
                                <span>Couvert Artístico:</span>
                              </span>
                              {totMesaCard.couvertTotal > 0 ? (
                                <span className="font-medium font-mono text-purple-300">
                                  {totMesaCard.qtdPessoasComCouvert} comanda(s) x R$ {totMesaCard.valorCouvertBase.toFixed(2)} (+R$ {totMesaCard.couvertTotal.toFixed(2)})
                                </span>
                              ) : (
                                <span className="text-slate-500 italic text-[9px]">
                                  {totMesaCard.couvertAtivo ? 'Isento (Gerente)' : 'Inativo no Salão'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações da Mesa */}
              <div className="pt-3 border-t border-slate-800/70 space-y-1.5">
                {isReservada ? (
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs space-y-1">
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Mesa Reservada</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {mesa.quantidadePessoas || 2} pessoas
                        </span>
                      </div>
                      <p className="text-white font-bold text-[11px] truncate">
                        {mesa.responsavelNome || 'Cliente'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const resAlvo = reservas.find((r) => r.id === mesa.reservaId || r.mesaNumero === mesa.numero);
                        if (resAlvo) {
                          const resSentar = sentarReservaNaMesa(resAlvo.id, mesa.numero, idLoja);
                          dispararToast(`🎉 ${resSentar.mensagem}`);
                        } else {
                          editarMesa(mesa.numero, { status: 'ocupada' }, idLoja);
                          dispararToast(`Mesa #${mesa.numero} ocupada!`);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acomodar Clientes (Ocupar)</span>
                    </button>
                  </div>
                ) : isLivre ? (
                  <button
                    onClick={() => {
                      setMesaParaAbrir(mesa);
                      setFormAbertura({
                        quantidadePessoas: mesa.capacidade,
                        responsavelNome: '',
                        garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir Mesa no Salão</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {/* Botão Principal de Lançamento de Pedidos */}
                    <button
                      type="button"
                      onClick={() => abrirComandaMesa(mesa, 'cardapio')}
                      className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Lançar Pedidos na Mesa</span>
                      {mesa.comandaItens && mesa.comandaItens.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/40 text-white font-mono font-bold">
                          {mesa.comandaItens.length}
                        </span>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => abrirComandaMesa(mesa, 'itens_consumidos')}
                        className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Comanda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMesaParaFechar(mesa);
                          setPessoasDivisao(mesa.quantidadePessoas || 2);
                        }}
                        className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Split className="w-3.5 h-3.5" />
                        <span>Fechar Conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ABERTURA DE MESA PELO GARÇOM (SEÇÃO 4.17)               */}
      {/* ============================================================== */}
      {mesaParaAbrir && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Abrir Mesa #{mesaParaAbrir.numero}</span>
              </h3>
              <button onClick={() => setMesaParaAbrir(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAberturaMesa} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  São quantas pessoas? (Obrigatório) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formAbertura.quantidadePessoas}
                  onChange={(e) => setFormAbertura({ ...formAbertura, quantidadePessoas: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-center text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold block">
                    Nome do Responsável / Identificação (Opcional)
                  </label>
                  <span className="text-[10px] text-slate-500">Pode deixar em branco</span>
                </div>
                <input
                  type="text"
                  value={formAbertura.responsavelNome}
                  onChange={(e) => setFormAbertura({ ...formAbertura, responsavelNome: e.target.value })}
                  placeholder={`Ex: Mesa #${mesaParaAbrir.numero} ou Nome do Cliente`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 mr-0.5">Preenchimento rápido:</span>
                  {[
                    `Mesa #${mesaParaAbrir.numero}`,
                    'Cliente Balcão',
                    'Casal',
                    'Família',
                    'Anônimo',
                  ].map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => setFormAbertura({ ...formAbertura, responsavelNome: sugestao })}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 hover:border-orange-500 transition-colors cursor-pointer"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Garçom Responsável pelo Atendimento
                </label>
                <select
                  value={formAbertura.garcomResponsavel}
                  onChange={(e) => setFormAbertura({ ...formAbertura, garcomResponsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                >
                  {garconsDisponiveis.map((g) => (
                    <option key={g.id} value={`${g.nome} ${g.sobrenome}`}>
                      {g.nome} {g.sobrenome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaAbrir(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FECHAMENTO DA CONTA (POR COMANDA OU QUITAÇÃO TOTAL)   */}
      {/* ============================================================== */}
      {mesaParaFechar && (() => {
        const pessoasMesa = getPessoasDaMesa(mesaParaFechar);
        const totaisMesa = getTotaisComanda(mesaParaFechar, 'todos');

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Split className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Fechar Conta — Mesa #{mesaParaFechar.numero}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {mesaParaFechar.setor} • {pessoasMesa.length} {pessoasMesa.length === 1 ? 'pessoa' : 'pessoas com comanda'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMesaParaFechar(null)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Total da Conta e Resumo Financeiro da Mesa */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a Pagar da Mesa:</span>
                      <p className="text-white font-bold text-xs">{mesaParaFechar.responsavelNome || 'Cliente'}</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      R$ {totaisMesa.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Detalhamento dos 10% e Desconto com Ações de Gerente */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Subtotal dos itens consumidos:</span>
                      <span className="font-mono text-slate-200 font-semibold">R$ {totaisMesa.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">10% Serviço (Garçom):</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          totaisMesa.taxaAtiva
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {totaisMesa.taxaAtiva ? 'Incluso por Padrão' : 'Isento pelo Gerente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">
                          {totaisMesa.taxaAtiva ? `+ R$ ${totaisMesa.taxaServico.toFixed(2)}` : 'R$ 0,00'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSolicitarToggle10(mesaParaFechar, 'todos')}
                          className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all hover:border-amber-500/50"
                          title="Apenas o Gerente pode retirar ou restaurar os 10%"
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          <span>{totaisMesa.taxaAtiva ? 'Retirar 10%' : 'Restaurar 10%'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Couvert Artístico */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Couvert Artístico:</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          totaisMesa.couvertAtivo && totaisMesa.couvertTotal > 0
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {totaisMesa.couvertAtivo && totaisMesa.couvertTotal > 0
                            ? `${totaisMesa.qtdPessoasComCouvert} comanda(s) x R$ ${totaisMesa.valorCouvertBase.toFixed(2)}`
                            : 'Isento / Inativo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-400 font-bold">
                          {totaisMesa.couvertTotal > 0 ? `+ R$ ${totaisMesa.couvertTotal.toFixed(2)}` : 'R$ 0,00'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSolicitarToggleCouvert(mesaParaFechar, 'todos')}
                          className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all hover:border-purple-500/50"
                          title="Apenas o Gerente pode isentar ou aplicar o couvert artístico"
                        >
                          <Music className="w-3 h-3 text-purple-400" />
                          <span>{totaisMesa.couvertAtivo && totaisMesa.couvertTotal > 0 ? 'Isentar Couvert' : 'Cobrar Couvert'}</span>
                        </button>
                      </div>
                    </div>

                    {totaisMesa.desconto > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Desconto do Gerente:</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                            Aplicado
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-rose-400 font-bold">
                            - R$ {totaisMesa.desconto.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAbrirDescontoGerente(mesaParaFechar, 'todos')}
                            className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 cursor-pointer hover:border-purple-500/50"
                            title="Alterar ou remover desconto do gerente"
                          >
                            <Tag className="w-3 h-3 text-purple-400" />
                            <span>Alterar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleAbrirDescontoGerente(mesaParaFechar, 'todos')}
                          className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer hover:border-purple-500/50"
                          title="Conceder desconto geral na mesa (Requer PIN do Gerente)"
                        >
                          <Tag className="w-3 h-3 text-purple-400" />
                          <span>+ Dar Desconto Geral (Gerente)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seleção do Modo de Divisão */}
                <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 gap-1">
                  <button
                    type="button"
                    onClick={() => setTipoDivisaoConta('por_pessoa')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      tipoDivisaoConta === 'por_pessoa'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Comandas por Pessoa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoDivisaoConta('igualitaria')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      tipoDivisaoConta === 'igualitaria'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Divisão Igualitária</span>
                  </button>
                </div>

                {/* Modo 1: Por Consumo de Cada Pessoa */}
                {tipoDivisaoConta === 'por_pessoa' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Comandas individuais dos clientes na mesa (10% incluso):</span>
                      <span className="font-bold text-slate-300">
                        {pessoasMesa.length} {pessoasMesa.length === 1 ? 'cliente' : 'clientes'}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {pessoasMesa.map((p) => {
                        const totPessoa = getTotaisComanda(mesaParaFechar, p);
                        const itensPessoa = totPessoa.itens;
                        const subtotalPessoa = totPessoa.subtotal;

                        return (
                          <div
                            key={p}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              totPessoa.total === 0 && subtotalPessoa === 0
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-[11px] font-bold">
                                    {p.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-extrabold text-xs text-white truncate">{p}</span>
                                </div>

                                <div className="text-[10px] text-slate-400 pl-8 space-y-0.5">
                                  {itensPessoa.length === 0 ? (
                                    <span className="text-slate-500 italic block">Nenhum item pendente</span>
                                  ) : (
                                    <span className="block truncate max-w-[220px]">
                                      {itensPessoa.map((it) => `${it.quantidade}x ${it.nome}`).join(', ')}
                                    </span>
                                  )}
                                </div>

                                {/* Resumo de Valores da Comanda da Pessoa */}
                                {subtotalPessoa > 0 && (
                                  <div className="pl-8 pt-1 space-y-0.5 text-[10px]">
                                    <div className="text-slate-400">
                                      Consumo: <span className="font-mono text-slate-200">R$ {subtotalPessoa.toFixed(2)}</span>
                                      {' • '}
                                      10%: <span className="font-mono text-emerald-400 font-bold">{totPessoa.taxaAtiva ? `R$ ${totPessoa.taxaServico.toFixed(2)}` : 'Isento'}</span>
                                      {totPessoa.couvertTotal > 0 && (
                                        <>
                                          {' • '}
                                          Couvert: <span className="font-mono text-purple-400 font-bold">+R$ {totPessoa.couvertTotal.toFixed(2)}</span>
                                        </>
                                      )}
                                      {totPessoa.desconto > 0 && (
                                        <>
                                          {' • '}
                                          Desc: <span className="font-mono text-rose-400 font-bold">-R$ {totPessoa.desconto.toFixed(2)}</span>
                                        </>
                                      )}
                                    </div>

                                    {/* Ações de Gerente para esta Comanda */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSolicitarToggle10(mesaParaFechar, p)}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-0.5 cursor-pointer"
                                        title="Retirar ou restaurar 10% desta comanda (Requer Gerente)"
                                      >
                                        <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                                        <span>{totPessoa.taxaAtiva ? 'Retirar 10%' : 'Restaurar 10%'}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleSolicitarToggleCouvert(mesaParaFechar, p)}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-purple-300 flex items-center gap-0.5 cursor-pointer"
                                        title="Isentar ou cobrar couvert artístico desta comanda"
                                      >
                                        <Music className="w-2.5 h-2.5 text-purple-400" />
                                        <span>{totPessoa.couvertTotal > 0 ? 'Isentar Couvert' : 'Cobrar Couvert'}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleAbrirDescontoGerente(mesaParaFechar, p)}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-purple-300 flex items-center gap-0.5 cursor-pointer"
                                        title="Dar desconto nesta comanda (Requer Gerente)"
                                      >
                                        <Tag className="w-2.5 h-2.5 text-purple-400" />
                                        <span>{totPessoa.desconto > 0 ? 'Editar Desc.' : '+ Desconto'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Total a Pagar</span>
                                <span className="font-mono font-black text-emerald-400 text-base">
                                  R$ {totPessoa.total.toFixed(2)}
                                </span>
                                {totPessoa.total > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModalPagamentoComanda({
                                        mesa: mesaParaFechar,
                                        nomePessoa: p,
                                        valor: totPessoa.total,
                                        itens: itensPessoa,
                                      });
                                    }}
                                    className="text-[10px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    <span>Receber deste</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Modo 2: Divisão Igualitária */
                  <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold">Dividir a conta entre quantas pessoas?</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={pessoasDivisao}
                        onChange={(e) => setPessoasDivisao(parseInt(e.target.value) || 1)}
                        className="w-16 px-2.5 py-1 bg-slate-950 border border-purple-500/40 rounded-xl text-white font-mono font-bold text-center"
                      />
                    </div>

                    <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                      <span className="text-purple-300 font-bold">Valor por pessoa (Divisão Igualitária com 10%):</span>
                      <span className="text-base font-black text-white font-mono bg-purple-900/50 px-3 py-1 rounded-xl">
                        R$ {(totaisMesa.total / Math.max(1, pessoasDivisao)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMesaParaFechar(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalPagamentoComanda({
                        mesa: mesaParaFechar,
                        nomePessoa: 'todos',
                        valor: totaisMesa.total,
                        itens: totaisMesa.itens,
                      });
                    }}
                    disabled={totaisMesa.total <= 0 && totaisMesa.itens.length === 0}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Quitar Toda a Mesa & Liberar (R$ {totaisMesa.total.toFixed(2)})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL: QR CODE DA MESA COM SIMULADOR DO CLIENTE (SEÇÃO 4.12)  */}
      {/* ============================================================== */}
      {mesaModalQR && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    QR Code Real — Mesa #{mesaModalQR.numero}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Setor: {mesaModalQR.setor} • {mesaModalQR.capacidade} lugares
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMesaModalQR(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem do QR Code Real Gerado */}
            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-slate-800 mx-auto">
              {modalQrDataUrl ? (
                <img
                  src={modalQrDataUrl}
                  alt={`QR Code Real Mesa #${mesaModalQR.numero}`}
                  className="w-56 h-56 block rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {/* URL e Copiar Link */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-left">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Link de Acesso do Cliente:
                </span>
                <span className="text-xs text-orange-400 font-mono font-medium truncate block">
                  {getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleCopiarLink(getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja))
                  }
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copiar link da mesa"
                >
                  {copiadoLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-orange-500/20"
                  title="Abrir autoatendimento do cliente em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Ações de Impressão e Download */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (modalQrDataUrl) {
                    baixarQrCodeMesaPng(modalQrDataUrl, mesaModalQR.numero);
                    dispararToast(`QR Code da Mesa #${mesaModalQR.numero} baixado em PNG de alta definição!`);
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Baixar PNG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (modalQrDataUrl) {
                    imprimirDisplayMesaIndividual({
                      numero: mesaModalQR.numero,
                      setor: mesaModalQR.setor,
                      capacidade: mesaModalQR.capacidade,
                      nomeRestaurante: tenantAtual?.nomeFantasia || 'Restaurante EloServe',
                      qrDataUrl: modalQrDataUrl,
                      tenantId: idLoja,
                    });
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Display</span>
              </button>
            </div>

            {/* Painel Experiência do Consumidor (Seção 4.12) */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <span className="text-[10px] text-purple-300 font-bold uppercase block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Experiência do Consumidor (Seção 4.12):</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                1. Cliente escaneia na mesa sem digitar número.
              </p>
              <p className="text-slate-300 text-[11px]">
                2. Pergunta única obrigatória: <strong>"São quantas pessoas?"</strong>
              </p>
              <p className="text-slate-300 text-[11px]">
                3. Cardápio abre com comanda única e botão <strong>"Chamar Garçom"</strong>.
              </p>
            </div>

            {/* Simulação rápida */}
            <div className="pt-1">
              <button
                onClick={() => {
                  handleSimularChamarGarcom(mesaModalQR, 3);
                  setMesaModalQR(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Simular Chamado do Garçom nesta Mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Nova Mesa (com validação de limites do plano) */}
      {modalCriarMesaAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Criar Nova Mesa</h3>
                  <p className="text-[11px] text-slate-400">
                    Plano {planoAtual.nome} • {isPlanoIlimitado ? 'Mesas Ilimitadas' : `${totalMesasAtuais + 1} de ${maxMesasPermitidas} permitidas`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCriarMesaAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarMesa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Número da Mesa:
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formNovaMesa.numero}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, numero: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Número exclusivo da mesa para controle no salão e exibição no QR Code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Capacidade de Pessoas (Lugares):
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[2, 4, 6, 8].map((lugares) => (
                    <button
                      key={lugares}
                      type="button"
                      onClick={() => setFormNovaMesa({ ...formNovaMesa, capacidade: lugares })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formNovaMesa.capacidade === lugares
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lugares} lugares
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formNovaMesa.capacidade}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, capacidade: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  placeholder="Ou digite outra capacidade de lugares..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Setor / Ambiente:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Salão', 'Varanda', 'Deck', 'Área Externa', 'Mezanino', 'VIP'].map((setor) => (
                    <button
                      key={setor}
                      type="button"
                      onClick={() => setFormNovaMesa({ ...formNovaMesa, setor })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        formNovaMesa.setor === setor
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {setor}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formNovaMesa.setor}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, setor: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  placeholder="Nome do setor (ex: Salão, Varanda...)"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalCriarMesaAberto(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95"
                >
                  Confirmar e Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Limite do Plano Atingido & Upgrade para Pro */}
      {modalUpgradeAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Limite de Mesas Atingido
                  </h3>
                  <p className="text-[11px] text-amber-400 font-semibold">
                    Plano Atual: {planoAtual.nome} ({totalMesasAtuais}/{maxMesasPermitidas} mesas)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalUpgradeAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              O seu plano <strong>{planoAtual.nome}</strong> permite até <strong>{maxMesasPermitidas} mesas cadastradas</strong> no salão. Você já atingiu a capacidade máxima deste plano.
            </div>

            {/* Destaque do Plano Pro */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-orange-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400">
                    Recomendado para Expansão
                  </span>
                  <h4 className="text-lg font-black text-white">EloServe Pro</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">R$ 199</span>
                  <span className="text-xs text-slate-400"> / mês</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Mesas 100% Ilimitadas</strong> no Salão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Painel KDS de Cozinha e Bar em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Comanda Mobile para Garçons atenderem nas mesas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Controle de Estoque e Ficha Técnica dos pratos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalUpgradeAberto(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFazerUpgradeParaPro}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Fazer Upgrade para o Pro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TROCA & TRANSFERÊNCIA DE MESA                           */}
      {/* ============================================================== */}
      {mesaParaTrocar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Troca & Transferência de Mesa
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {mesaParaTrocar.status === 'livre'
                      ? `Mesa #${mesaParaTrocar.numero} (${mesaParaTrocar.setor}) está Livre`
                      : `Mesa #${mesaParaTrocar.numero} (${mesaParaTrocar.setor}) • ${mesaParaTrocar.responsavelNome || 'Cliente'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMesaParaTrocar(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CASO 1: A mesa onde clicou nos 3 pontos está OCUPADA (vamos transferir ELA para outra) */}
            {mesaParaTrocar.status !== 'livre' ? (
              <form onSubmit={handleConfirmarTrocaMesa} className="space-y-4 text-xs">
                {/* Card Mesa Origem */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Mesa de Origem (Atual)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      Ocupada
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white">
                        Mesa #{mesaParaTrocar.numero}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {mesaParaTrocar.setor} • {mesaParaTrocar.quantidadePessoas || 2} pessoas
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Consumo Atual:</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        R$ {(mesaParaTrocar.totalConsumo || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Cliente: <strong className="text-white">{mesaParaTrocar.responsavelNome || 'Cliente'}</strong></span>
                    <span>Garçom: <strong className="text-purple-300">{mesaParaTrocar.garcomResponsavel || 'Lucas Oliveira'}</strong></span>
                    <span>Itens Comanda: <strong className="text-orange-400">{mesaParaTrocar.comandaItens?.length || 0}</strong></span>
                  </div>
                </div>

                {/* Seta indicativa */}
                <div className="flex justify-center -my-1">
                  <div className="p-1.5 rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>

                {/* Seletor Mesa Destino */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Selecione a Mesa de Destino:
                  </label>

                  {/* Grid de Mesas Destino Disponíveis */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {mesas
                      .filter((m) => m.numero !== mesaParaTrocar.numero)
                      .map((m) => {
                        const isDestLivre = m.status === 'livre';
                        const isSelecionada = mesaDestinoTroca === m.numero;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setMesaDestinoTroca(m.numero);
                              if (isDestLivre) {
                                setModoTrocaMesa('transferir');
                              } else {
                                setModoTrocaMesa('unificar');
                              }
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelecionada
                                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 text-white'
                                : isDestLivre
                                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-300'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-amber-500/40 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-white">#{m.numero}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  isDestLivre
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {isDestLivre ? 'Livre' : 'Ocupada'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 truncate mt-1">{m.setor}</span>
                            <span className="text-[9px] text-slate-500">{m.capacidade} lugares</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Exibição da Ação Selecionada */}
                {mesaDestinoTroca !== null && (() => {
                  const mDestino = mesas.find((m) => m.numero === mesaDestinoTroca);
                  if (!mDestino) return null;
                  const isDestLivre = mDestino.status === 'livre';

                  return (
                    <div className="space-y-3">
                      {isDestLivre ? (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Mesa #{mDestino.numero} está 100% Livre</span>
                          </p>
                          <p className="text-emerald-400/90">
                            O atendimento, cliente <strong>{mesaParaTrocar.responsavelNome || 'Cliente'}</strong>, pedidos da comanda e pedidos no KDS serão movidos para a <strong>Mesa #{mDestino.numero}</strong>. A <strong>Mesa #{mesaParaTrocar.numero}</strong> será liberada automaticamente.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                          <div className="text-[11px] text-amber-300">
                            <p className="font-bold flex items-center gap-1.5 text-amber-200">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Mesa #{mDestino.numero} já está Ocupada</span>
                            </p>
                            <p className="text-slate-300 mt-0.5">
                              Cliente atual: <strong>{mDestino.responsavelNome || 'Cliente'}</strong> • Consumo atual: <strong>R$ {(mDestino.totalConsumo || 0).toFixed(2)}</strong>. Como deseja prosseguir?
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setModoTrocaMesa('unificar')}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                modoTrocaMesa === 'unificar'
                                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="font-bold text-xs block text-amber-300">
                                👥 Juntar Pessoas na Mesma Mesa
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Agrupa os clientes e preserva as comandas individuais ({mesaParaTrocar.responsavelNome || 'Cliente'} e {mDestino.responsavelNome || 'Cliente'}) na Mesa #{mDestino.numero}.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setModoTrocaMesa('inverter')}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                modoTrocaMesa === 'inverter'
                                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="font-bold text-xs block text-purple-300">
                                Inverter Mesas
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Troca as posições e comandas entre as Mesas #{mesaParaTrocar.numero} e #{mDestino.numero}.
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Motivo Opcional */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Motivo da Troca (Opcional):
                        </label>
                        <input
                          type="text"
                          value={motivoTrocaMesa}
                          onChange={(e) => setMotivoTrocaMesa(e.target.value)}
                          placeholder="Ex: Cliente solicitou mesa na varanda / ar-condicionado..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Botões do Rodapé */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMesaParaTrocar(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mesaDestinoTroca === null}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Confirmar Troca de Mesa</span>
                  </button>
                </div>
              </form>
            ) : (
              /* CASO 2: A mesa onde clicou nos 3 pontos está LIVRE (como no print enviado!) */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">
                      Mesa #{mesaParaTrocar.numero}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Livre no Salão
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Esta mesa está desocupada. Você pode <strong>trazer e transferir</strong> um atendimento em andamento de outra mesa ocupada para cá:
                  </p>
                </div>

                {(() => {
                  const mesasOcupadas = mesas.filter((m) => m.status !== 'livre');
                  if (mesasOcupadas.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <p className="font-semibold text-slate-300">
                          Não há mesas ocupadas no momento no salão.
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Todas as mesas estão livres. Para iniciar um atendimento nesta mesa:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const mesaAlvo = mesaParaTrocar;
                            setMesaParaTrocar(null);
                            setMesaParaAbrir(mesaAlvo);
                            setFormAbertura({
                              quantidadePessoas: mesaAlvo.capacidade,
                              responsavelNome: '',
                              garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                            });
                          }}
                          className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Abrir Mesa #{mesaParaTrocar.numero}</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <form onSubmit={handleConfirmarTrocaMesa} className="space-y-3.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Qual mesa ocupada deseja transferir para a Mesa #{mesaParaTrocar.numero}?
                      </label>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {mesasOcupadas.map((m) => {
                          const isSelecionada = mesaDestinoTroca === m.numero;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setMesaDestinoTroca(m.numero);
                                setModoTrocaMesa('transferir');
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelecionada
                                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30'
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-white">
                                    Mesa #{m.numero}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                    {m.setor}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">
                                  Cliente: <strong className="text-white">{m.responsavelNome || 'Cliente'}</strong> • Garçom: <strong className="text-purple-300">{m.garcomResponsavel || 'Lucas'}</strong>
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-black text-emerald-400 block">
                                  R$ {(m.totalConsumo || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {m.comandaItens?.length || 0} itens
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Motivo Opcional */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Motivo da Troca (Opcional):
                        </label>
                        <input
                          type="text"
                          value={motivoTrocaMesa}
                          onChange={(e) => setMotivoTrocaMesa(e.target.value)}
                          placeholder="Ex: Mudança de ambiente / melhor acomodação..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Botões */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMesaParaTrocar(null)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={mesaDestinoTroca === null}
                          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Trazer Atendimento para Cá</span>
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: COMANDA & LANÇAMENTO DE PEDIDOS NA MESA (KDS & ESTOQUE) */}
      {/* ============================================================== */}
      {mesaParaLancar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header da Comanda */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Mesa #{mesaParaLancar.numero}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {mesaParaLancar.setor}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ocupada
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1.5">
                      <span>Cliente:</span>
                      <strong className="text-white">{mesaParaLancar.responsavelNome || `Mesa #${mesaParaLancar.numero}`}</strong>
                      <button
                        type="button"
                        onClick={() => abrirModalEditarResponsavel(mesaParaLancar)}
                        title="Alterar nome do cliente / responsável desta comanda"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </span>
                    <span>
                      Garçom: <strong className="text-purple-300">{mesaParaLancar.garcomResponsavel || 'Lucas Oliveira'}</strong>
                    </span>
                    <span>
                      Pessoas: <strong className="text-slate-200">{mesaParaLancar.quantidadePessoas || 2}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Consumido:</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    R$ {(mesaParaLancar.totalConsumo || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMesaParaLancar(null);
                    setCarrinhoMesa([]);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navegação de Abas do Modal */}
            <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 sm:px-5 shrink-0">
              <button
                type="button"
                onClick={() => setAbaModalComanda('cardapio')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
                  abaModalComanda === 'cardapio'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Lançar Pedidos do Cardápio</span>
                {carrinhoMesa.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-mono font-bold">
                    {carrinhoMesa.reduce((acc, it) => acc + it.quantidade, 0)}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAbaModalComanda('itens_consumidos')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
                  abaModalComanda === 'itens_consumidos'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Comanda da Mesa & KDS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {mesaParaLancar.comandaItens?.length || 0}
                </span>
              </button>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {abaModalComanda === 'cardapio' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                  {/* Coluna Esquerda: Catálogo do Cardápio (7 cols) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Barra de Atribuição: Lançar item para quem? */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            Lançar para quem na mesa?
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalAdicionarPessoa(mesaParaLancar);
                            setNomeNovaPessoa('');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Adicionar Pessoa</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {getPessoasDaMesa(mesaParaLancar).map((p) => {
                          const pessoas = getPessoasDaMesa(mesaParaLancar);
                          const isSelecionada = (pessoaSelecionadaLancamento || pessoas[0]) === p;
                          const itensPessoa = (mesaParaLancar.comandaItens || []).filter(
                            (it) => getDonoDoItem(it, mesaParaLancar) === p
                          );
                          const totalPessoa = itensPessoa.reduce((sum, it) => sum + it.subtotal, 0);

                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPessoaSelecionadaLancamento(p)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                isSelecionada
                                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              <User className="w-3 h-3" />
                              <span>{p}</span>
                              {totalPessoa > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelecionada ? 'bg-slate-950/25 text-slate-950 font-black' : 'bg-slate-800 text-emerald-400 font-bold'}`}>
                                  R$ {totalPessoa.toFixed(0)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Barra de Busca e Filtros de Categoria */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={buscaPratoMesa}
                          onChange={(e) => setBuscaPratoMesa(e.target.value)}
                          placeholder="Buscar pratos, cortes, porções, bebidas..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Chips de Categorias */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setCategoriaCardapioMesa('todas')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                            categoriaCardapioMesa === 'todas'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Todas
                        </button>
                        {categorias.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoriaCardapioMesa(cat.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                              categoriaCardapioMesa === cat.id
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat.nome}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lista / Grid de Pratos do Cardápio */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {produtosFiltradosMesa.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800">
                          Nenhum prato encontrado com o filtro aplicado.
                        </div>
                      ) : (
                        produtosFiltradosMesa.map((prod) => {
                          const temFicha = fichasTecnicas.some(
                            (f) => f.produtoId === prod.id && f.componentes && f.componentes.length > 0
                          );
                          const pessoas = getPessoasDaMesa(mesaParaLancar);
                          const pessoaAtiva = pessoaSelecionadaLancamento || pessoas[0] || 'Cliente';
                          const noCarrinho = carrinhoMesa.find(
                            (it) => it.produto.id === prod.id && (it.clienteNome || pessoas[0] || 'Cliente') === pessoaAtiva
                          );

                          return (
                            <div
                              key={prod.id}
                              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                                    {prod.nome}
                                  </span>
                                  {temFicha ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                                      🥗 Ficha Técnica (Baixa Estoque)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-semibold shrink-0">
                                      Item Direto
                                    </span>
                                  )}
                                </div>
                                {prod.descricao && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1">
                                    {prod.descricao}
                                  </p>
                                )}
                                <span className="text-xs font-black font-mono text-emerald-400 block">
                                  R$ {prod.precoVenda.toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAdicionarItemCarrinhoMesa(prod)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                  noCarrinho
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-orange-500/50'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{noCarrinho ? `${noCarrinho.quantidade}x` : 'Adicionar'}</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Coluna Direita: Lote a Enviar para a Cozinha / KDS (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <h4 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4" />
                          <span>Lote a Enviar à Cozinha</span>
                        </h4>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {carrinhoMesa.reduce((acc, it) => acc + it.quantidade, 0)} itens
                        </span>
                      </div>

                      {carrinhoMesa.length === 0 ? (
                        <div className="py-12 px-4 text-center text-slate-500 text-xs rounded-xl border border-dashed border-slate-800/80 space-y-2">
                          <UtensilsCrossed className="w-7 h-7 mx-auto text-slate-600 opacity-60" />
                          <p className="font-semibold text-slate-400">Nenhum prato adicionado ao lote.</p>
                          <p className="text-[11px] text-slate-500">
                            Selecione para quem é o item acima e clique em Adicionar no cardápio.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                          {carrinhoMesa.map((it, cIdx) => (
                            <div
                              key={`${it.produto.id}_${it.clienteNome || 'mesa'}_${cIdx}`}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {it.produto.nome}
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                                  R$ {(it.produto.precoVenda * it.quantidade).toFixed(2)}
                                </span>
                              </div>

                              {/* Atribuição de Pessoa no Card do Item do Carrinho */}
                              <div className="flex items-center justify-between text-[11px] bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/60">
                                <span className="text-slate-400 text-[10px]">Para comanda de:</span>
                                <span className="text-[10px] font-bold text-cyan-300">
                                  {it.clienteNome || getPessoasDaMesa(mesaParaLancar)[0] || 'Cliente'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, -1, it.clienteNome)}
                                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 font-mono font-bold text-white text-xs">
                                    {it.quantidade}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, 1, it.clienteNome)}
                                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={it.observacoes}
                                  onChange={(e) =>
                                    handleAlterarObsItemCarrinhoMesa(it.produto.id, e.target.value, it.clienteNome)
                                  }
                                  placeholder="Obs: sem gelo, ponto..."
                                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, -it.quantidade, it.clienteNome)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resumo do Lote e Envio */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Subtotal deste Lote:</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          R$ {totalLoteCarrinho.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Ao confirmar, os ingredientes serão <strong>baixados do estoque automaticamente</strong> e o pedido entrará em tempo real na tela do <strong>KDS da Cozinha</strong>.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnviarPedidoKDS()}
                        disabled={carrinhoMesa.length === 0}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Pedido para a Cozinha (KDS)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Aba 2: Comanda Completa da Mesa & KDS */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Histórico de Consumo da Mesa #{mesaParaLancar.numero}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Todos os pedidos lançados até o momento para este atendimento.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAbaModalComanda('cardapio')}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lançar Mais Pedidos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Conferência</span>
                      </button>
                    </div>
                  </div>

                  {/* Navegação de Comandas por Pessoa */}
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                      <button
                        type="button"
                        onClick={() => setPessoaAtivaComanda('todos')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          pessoaAtivaComanda === 'todos'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>👥 Todas as Comandas</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-slate-950/40 text-emerald-400 font-black">
                          R$ {getTotaisComanda(mesaParaLancar, 'todos').total.toFixed(0)}
                        </span>
                      </button>

                      {getPessoasDaMesa(mesaParaLancar).map((p) => {
                        const totP = getTotaisComanda(mesaParaLancar, p);
                        const isAtiva = pessoaAtivaComanda === p;

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPessoaAtivaComanda(p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                              isAtiva
                                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>{p}</span>
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                                isAtiva
                                  ? 'bg-slate-950/20 text-slate-950 font-black'
                                  : 'bg-slate-950 text-emerald-400'
                              }`}
                            >
                              R$ {totP.total.toFixed(0)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setModalAdicionarPessoa(mesaParaLancar);
                        setNomeNovaPessoa('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Pessoa</span>
                    </button>
                  </div>

                  {!mesaParaLancar.comandaItens || mesaParaLancar.comandaItens.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                      <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="font-semibold text-slate-400">Nenhum pedido lançado nesta comanda até o momento.</p>
                      <button
                        type="button"
                        onClick={() => setAbaModalComanda('cardapio')}
                        className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Abrir Cardápio e Lançar Itens</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* VISTA 1: TODAS AS COMANDAS */}
                      {pessoaAtivaComanda === 'todos' ? (
                        <div className="space-y-4">
                          {/* Cards Individuais de Cada Pessoa com botão direto de pagamento */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {getPessoasDaMesa(mesaParaLancar).map((p, idx) => {
                              const totP = getTotaisComanda(mesaParaLancar, p);
                              const itensPessoa = totP.itens;
                              const subtotalPessoa = totP.subtotal;

                              return (
                                <div
                                  key={idx}
                                  className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
                                >
                                  <div>
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs border border-cyan-500/30 shrink-0">
                                          {p.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <h5 className="font-extrabold text-white text-xs truncate">{p}</h5>
                                          <span className="text-[10px] text-slate-400">
                                            {itensPessoa.length} {itensPessoa.length === 1 ? 'item' : 'itens'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Total a Pagar:</span>
                                        <span className="font-mono font-black text-emerald-400 text-sm">
                                          R$ {totP.total.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>

                                    {itensPessoa.length === 0 ? (
                                      <p className="text-[11px] text-slate-500 italic py-3 text-center">
                                        Nenhum item lançado ainda.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto pr-1">
                                        {itensPessoa.map((it, itIdx) => (
                                          <div
                                            key={it.id || itIdx}
                                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]"
                                          >
                                            <div className="min-w-0 pr-1 truncate">
                                              <span className="text-orange-400 font-bold mr-1">{it.quantidade}x</span>
                                              <span className="text-white font-medium">{it.nome}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="font-mono font-bold text-slate-200">
                                                R$ {it.subtotal.toFixed(2)}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleSolicitarCancelarItem(mesaParaLancar, it)}
                                                className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                                                title="Cancelar item (Requer Gerente)"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Discriminação de 10% e Desconto para esta Pessoa */}
                                    {subtotalPessoa > 0 && (
                                      <div className="pt-2 border-t border-slate-900 space-y-1 text-[10px]">
                                        <div className="flex justify-between text-slate-400">
                                          <span>Consumo: R$ {subtotalPessoa.toFixed(2)}</span>
                                          <span className="text-emerald-400 font-semibold">
                                            10%: {totP.taxaAtiva ? `+R$ ${totP.taxaServico.toFixed(2)}` : 'Isento'}
                                          </span>
                                        </div>
                                        {totP.couvertTotal > 0 && (
                                          <div className="flex justify-between text-purple-400 font-semibold">
                                            <span>Couvert Artístico:</span>
                                            <span>+R$ {totP.couvertTotal.toFixed(2)}</span>
                                          </div>
                                        )}
                                        {totP.desconto > 0 && (
                                          <div className="flex justify-between text-rose-400 font-semibold">
                                            <span>Desconto Gerente:</span>
                                            <span>-R$ {totP.desconto.toFixed(2)}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                          <button
                                            type="button"
                                            onClick={() => handleSolicitarToggle10(mesaParaLancar, p)}
                                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-0.5 cursor-pointer"
                                            title="Retirar ou restaurar os 10% (Gerente)"
                                          >
                                            <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                                            <span>{totP.taxaAtiva ? 'Retirar 10%' : 'Restaurar 10%'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSolicitarToggleCouvert(mesaParaLancar, p)}
                                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-purple-300 flex items-center gap-0.5 cursor-pointer"
                                            title="Isentar ou cobrar couvert artístico desta comanda"
                                          >
                                            <Music className="w-2.5 h-2.5 text-purple-400" />
                                            <span>{totP.couvertTotal > 0 ? 'Isentar Couvert' : 'Cobrar Couvert'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAbrirDescontoGerente(mesaParaLancar, p)}
                                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-purple-300 flex items-center gap-0.5 cursor-pointer"
                                            title="Conceder desconto do gerente nesta comanda"
                                          >
                                            <Tag className="w-2.5 h-2.5 text-purple-400" />
                                            <span>{totP.desconto > 0 ? 'Editar Desc.' : '+ Desconto'}</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                                    {subtotalPessoa > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setModalPagamentoComanda({
                                            mesa: mesaParaLancar,
                                            nomePessoa: p,
                                            valor: totP.total,
                                            itens: itensPessoa,
                                          });
                                        }}
                                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                      >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Pagar Comanda (R$ {totP.total.toFixed(2)})</span>
                                      </button>
                                    )}
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setPessoaAtivaComanda(p)}
                                        className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 cursor-pointer text-center"
                                      >
                                        Ver Detalhes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPessoaSelecionadaLancamento(p);
                                          setAbaModalComanda('cardapio');
                                        }}
                                        className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 cursor-pointer text-center"
                                      >
                                        + Lançar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Tabela Unificada de Pedidos com Seletor de Troca de Dono e Cancelamento Gerente */}
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-bold text-slate-300">Todos os pedidos detalhados no salão:</span>
                              <span className="text-[11px] text-slate-500">
                                Você pode transferir itens entre pessoas ou solicitar cancelamento ao Gerente.
                              </span>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold bg-slate-900/60">
                                    <th className="py-2.5 px-3">Horário</th>
                                    <th className="py-2.5 px-3">Pessoa / Comanda</th>
                                    <th className="py-2.5 px-3">Item / Prato</th>
                                    <th className="py-2.5 px-3">Qtd</th>
                                    <th className="py-2.5 px-3">Unitário</th>
                                    <th className="py-2.5 px-3">Subtotal</th>
                                    <th className="py-2.5 px-3">KDS Cozinha</th>
                                    <th className="py-2.5 px-3 text-right">Gerente</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {mesaParaLancar.comandaItens.map((item, idx) => {
                                    const dono = getDonoDoItem(item, mesaParaLancar);
                                    const pessoasDisponiveis = getPessoasDaMesa(mesaParaLancar);

                                    return (
                                      <tr key={item.id || idx} className="hover:bg-slate-900/40 transition-colors">
                                        <td className="py-2.5 px-3 font-mono text-slate-400">{item.horario}</td>
                                        <td className="py-2.5 px-3">
                                          {pessoasDisponiveis.length > 1 ? (
                                            <select
                                              value={dono}
                                              onChange={(e) => handleReatribuirItem(item.id, e.target.value)}
                                              title="Clique para transferir este item para outra pessoa da mesa"
                                              className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-cyan-500/40 text-cyan-300 cursor-pointer focus:outline-none focus:border-cyan-400"
                                            >
                                              {pessoasDisponiveis.map((p) => (
                                                <option key={p} value={p}>
                                                  👤 {p}
                                                </option>
                                              ))}
                                            </select>
                                          ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-900 border border-slate-800 text-cyan-300">
                                              {dono}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="font-bold text-white block">{item.nome}</span>
                                          {item.observacoes && (
                                            <span className="text-[11px] text-amber-300 italic block mt-0.5">
                                              "{item.observacoes}"
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono font-bold text-orange-400">
                                          {item.quantidade}x
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-300">
                                          R$ {item.precoUnitario.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                          R$ {item.subtotal.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase inline-block ${
                                              item.statusKDS === 'pronto'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : item.statusKDS === 'em_preparo'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}
                                          >
                                            {item.statusKDS === 'pronto'
                                              ? 'Pronto / Servido'
                                              : item.statusKDS === 'em_preparo'
                                              ? 'Em Preparo'
                                              : 'Fila da Cozinha'}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          <button
                                            type="button"
                                            onClick={() => handleSolicitarCancelarItem(mesaParaLancar, item)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                            title="Cancelar item da comanda (Requer Gerente)"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Cancelar</span>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* VISTA 2: COMANDA FOCADA NA PESSOA SELECIONADA */
                        (() => {
                          const p = pessoaAtivaComanda;
                          const totP = getTotaisComanda(mesaParaLancar, p);
                          const itensPessoa = totP.itens;
                          const subtotalPessoa = totP.subtotal;
                          const pessoasDisponiveis = getPessoasDaMesa(mesaParaLancar);

                          return (
                            <div className="space-y-4">
                              {/* Header da Comanda Individual */}
                              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 font-black text-base flex items-center justify-center border border-cyan-500/40 shrink-0">
                                    {p.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-base font-black text-white">Comanda de {p}</h4>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                                        Mesa #{mesaParaLancar.numero}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                      {itensPessoa.length} {itensPessoa.length === 1 ? 'item consumido' : 'itens consumidos'} nesta comanda
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap justify-end">
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total a Pagar (+10%):</span>
                                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                                      R$ {totP.total.toFixed(2)}
                                    </span>
                                  </div>

                                  {totP.total > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setModalPagamentoComanda({
                                          mesa: mesaParaLancar,
                                          nomePessoa: p,
                                          valor: totP.total,
                                          itens: itensPessoa,
                                        });
                                      }}
                                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      <span>Pagar Comanda (R$ {totP.total.toFixed(2)})</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPessoaSelecionadaLancamento(p);
                                      setAbaModalComanda('cardapio');
                                    }}
                                    className="px-3 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Lançar Itens</span>
                                  </button>
                                </div>
                              </div>

                              {/* Barra de Detalhamento de Taxa de Serviço e Desconto do Gerente para esta Comanda */}
                              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400">Consumo: <strong className="text-white">R$ {subtotalPessoa.toFixed(2)}</strong></span>
                                  <span className="text-slate-500">•</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">10% Serviço:</span>
                                    <strong className={totP.taxaAtiva ? 'text-emerald-400' : 'text-amber-400'}>
                                      {totP.taxaAtiva ? `+ R$ ${totP.taxaServico.toFixed(2)} (Incluso)` : 'Isento'}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarToggle10(mesaParaLancar, p)}
                                      className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                                      title="Apenas o Gerente pode retirar/restaurar 10%"
                                    >
                                      <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                                      <span>{totP.taxaAtiva ? 'Retirar 10%' : 'Restaurar 10%'}</span>
                                    </button>
                                  </div>
                                  <span className="text-slate-500">•</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Couvert:</span>
                                    <strong className={totP.couvertTotal > 0 ? 'text-purple-400' : 'text-slate-400'}>
                                      {totP.couvertTotal > 0 ? `+ R$ ${totP.couvertTotal.toFixed(2)}` : 'Isento'}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarToggleCouvert(mesaParaLancar, p)}
                                      className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-0.5 cursor-pointer ml-1"
                                      title="Isentar ou cobrar couvert artístico (Gerente)"
                                    >
                                      <Music className="w-2.5 h-2.5 text-purple-400" />
                                      <span>{totP.couvertTotal > 0 ? 'Isentar' : 'Cobrar'}</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {totP.desconto > 0 ? (
                                    <>
                                      <span className="text-rose-400 font-bold">
                                        Desconto: - R$ {totP.desconto.toFixed(2)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAbrirDescontoGerente(mesaParaLancar, p)}
                                        className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Tag className="w-2.5 h-2.5 text-purple-400" />
                                        <span>Alterar Desconto</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAbrirDescontoGerente(mesaParaLancar, p)}
                                      className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Tag className="w-2.5 h-2.5 text-purple-400" />
                                      <span>+ Desconto (Gerente)</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Tabela de Itens desta Pessoa */}
                              {itensPessoa.length === 0 ? (
                                <div className="p-10 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                                  <UtensilsCrossed className="w-7 h-7 mx-auto text-slate-600" />
                                  <p className="font-semibold text-slate-400">Nenhum item lançado para {p} ainda.</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPessoaSelecionadaLancamento(p);
                                      setAbaModalComanda('cardapio');
                                    }}
                                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Lançar Pedidos para {p}</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold bg-slate-900/60">
                                        <th className="py-2.5 px-3">Horário</th>
                                        <th className="py-2.5 px-3">Item / Prato</th>
                                        <th className="py-2.5 px-3">Qtd</th>
                                        <th className="py-2.5 px-3">Unitário</th>
                                        <th className="py-2.5 px-3">Subtotal</th>
                                        <th className="py-2.5 px-3">KDS Cozinha</th>
                                        {pessoasDisponiveis.length > 1 && (
                                          <th className="py-2.5 px-3 text-right">Mover Item</th>
                                        )}
                                        <th className="py-2.5 px-3 text-right">Gerente</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                      {itensPessoa.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-slate-900/40 transition-colors">
                                          <td className="py-2.5 px-3 font-mono text-slate-400">{item.horario}</td>
                                          <td className="py-2.5 px-3">
                                            <span className="font-bold text-white block">{item.nome}</span>
                                            {item.observacoes && (
                                              <span className="text-[11px] text-amber-300 italic block mt-0.5">
                                                "{item.observacoes}"
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono font-bold text-orange-400">
                                            {item.quantidade}x
                                          </td>
                                          <td className="py-2.5 px-3 font-mono text-slate-300">
                                            R$ {item.precoUnitario.toFixed(2)}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                            R$ {item.subtotal.toFixed(2)}
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase inline-block ${
                                                item.statusKDS === 'pronto'
                                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                  : item.statusKDS === 'em_preparo'
                                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                              }`}
                                            >
                                              {item.statusKDS === 'pronto'
                                                ? 'Pronto'
                                                : item.statusKDS === 'em_preparo'
                                                ? 'Em Preparo'
                                                : 'Fila Cozinha'}
                                            </span>
                                          </td>
                                          {pessoasDisponiveis.length > 1 && (
                                            <td className="py-2.5 px-3 text-right">
                                              <select
                                                value={p}
                                                onChange={(e) => handleReatribuirItem(item.id, e.target.value)}
                                                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-400"
                                                title="Mover este item para outra pessoa da mesa"
                                              >
                                                {pessoasDisponiveis.map((outro) => (
                                                  <option key={outro} value={outro}>
                                                    {outro === p ? `Pertence a ${p}` : `Mover para ${outro}`}
                                                  </option>
                                                ))}
                                              </select>
                                            </td>
                                          )}
                                          <td className="py-2.5 px-3 text-right">
                                            <button
                                              type="button"
                                              onClick={() => handleSolicitarCancelarItem(mesaParaLancar, item)}
                                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                              title="Cancelar este item da comanda (Requer Gerente)"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span className="hidden sm:inline">Cancelar</span>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}

                      {/* Totais e Fechamento */}
                      {(() => {
                        const totMesa = getTotaisComanda(mesaParaLancar, 'todos');
                        return (
                          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                            <div className="space-y-1 text-xs text-slate-400">
                              <p>
                                Total de pratos/bebidas servidos:{' '}
                                <strong className="text-white">
                                  {totMesa.itens.reduce((acc, it) => acc + it.quantidade, 0)} unidades
                                </strong>
                              </p>
                              <p>
                                Subtotal Consumo: <strong className="text-slate-300">R$ {totMesa.subtotal.toFixed(2)}</strong>
                              </p>
                              <div className="flex items-center gap-2">
                                <span>
                                  10% Serviço (Garçom):{' '}
                                  <strong className={totMesa.taxaAtiva ? 'text-emerald-400' : 'text-amber-400'}>
                                    {totMesa.taxaAtiva ? `+ R$ ${totMesa.taxaServico.toFixed(2)} (Incluso por Padrão)` : 'Isento pelo Gerente'}
                                  </strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSolicitarToggle10(mesaParaLancar, 'todos')}
                                  className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer"
                                  title="Apenas o Gerente pode retirar/restaurar 10%"
                                >
                                  <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{totMesa.taxaAtiva ? 'Retirar 10%' : 'Restaurar 10%'}</span>
                                </button>
                              </div>
                              {totMesa.desconto > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-rose-400 font-bold">
                                    Desconto Gerente: - R$ {totMesa.desconto.toFixed(2)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAbrirDescontoGerente(mesaParaLancar, 'todos')}
                                    className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-purple-400" />
                                    <span>Alterar Desconto</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-semibold">Total Geral a Pagar:</span>
                                <span className="text-2xl font-black font-mono text-emerald-400">
                                  R$ {totMesa.total.toFixed(2)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const mesaAlvo = mesaParaLancar;
                                  setMesaParaLancar(null);
                                  setMesaParaFechar(mesaAlvo);
                                  setPessoasDivisao(mesaAlvo.quantidadePessoas || 2);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Split className="w-4 h-4" />
                                <span>Fechar Conta / Checkout</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR NOME DO RESPONSÁVEL / CLIENTE DA MESA           */}
      {/* ============================================================== */}
      {mesaParaEditarNome && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-orange-400" />
                <span>Identificação da Mesa #{mesaParaEditarNome.numero}</span>
              </h3>
              <button
                onClick={() => setMesaParaEditarNome(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNomeResponsavel} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Nome do Cliente / Responsável pela Comanda:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={novoNomeResponsavel}
                  onChange={(e) => setNovoNomeResponsavel(e.target.value)}
                  placeholder={`Ex: Mesa #${mesaParaEditarNome.numero} ou Nome do Cliente`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-orange-500"
                />
                {/* Sugestões rápidas */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 mr-0.5">Sugestões:</span>
                  {[
                    `Mesa #${mesaParaEditarNome.numero}`,
                    'Cliente Balcão',
                    'Casal',
                    'Família',
                    'Anônimo',
                  ].map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => setNovoNomeResponsavel(sugestao)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 hover:border-orange-500 transition-colors cursor-pointer"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaEditarNome(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  Salvar Nome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR PESSOA / SUB-COMANDA À MESA                  */}
      {/* ============================================================== */}
      {modalAdicionarPessoa && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Pessoas na Mesa #{modalAdicionarPessoa.numero}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Gerencie comandas individuais e pessoas nesta mesa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAdicionarPessoa(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista das pessoas atuais */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Pessoas já registradas nesta mesa:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {getPessoasDaMesa(modalAdicionarPessoa).map((p, idx) => {
                  const itensDaPessoa = (modalAdicionarPessoa.comandaItens || []).filter(
                    (it) => (it.clienteNome || modalAdicionarPessoa.responsavelNome || `Mesa #${modalAdicionarPessoa.numero}`) === p
                  );
                  const subtotalPessoa = itensDaPessoa.reduce((sum, it) => sum + it.subtotal, 0);

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </div>
                        <div>
                          <strong className="text-white block">{p}</strong>
                          <span className="text-[10px] text-slate-400">
                            {itensDaPessoa.length} {itensDaPessoa.length === 1 ? 'item lançado' : 'itens lançados'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          R$ {subtotalPessoa.toFixed(2)}
                        </span>
                        {itensDaPessoa.length === 0 && getPessoasDaMesa(modalAdicionarPessoa).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              removerPessoaMesa(modalAdicionarPessoa.numero, p, idLoja);
                              dispararToast(`"${p}" removido(a) da mesa.`);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remover pessoa sem pedidos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form para adicionar nova pessoa */}
            <form onSubmit={handleConfirmarAdicionarPessoa} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Nome da Nova Pessoa:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={nomeNovaPessoa}
                  onChange={(e) => setNomeNovaPessoa(e.target.value)}
                  placeholder="Ex: Mariana, Lucas, Amigo 1..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />

                {/* Sugestões rápidas de nomes */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 mr-0.5">Sugestões:</span>
                  {[
                    `Pessoa ${getPessoasDaMesa(modalAdicionarPessoa).length + 1}`,
                    'Amigo',
                    'Convidado',
                    'Criança',
                  ].map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => setNomeNovaPessoa(sugestao)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAdicionarPessoa(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={!nomeNovaPessoa.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-cyan-600/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar à Mesa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PAGAMENTO DE COMANDA INDIVIDUAL OU TOTAL DA MESA       */}
      {/* ============================================================== */}
      {modalPagamentoComanda && (() => {
        const totPagamento = getTotaisComanda(modalPagamentoComanda.mesa, modalPagamentoComanda.nomePessoa);

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {modalPagamentoComanda.nomePessoa === 'todos'
                        ? `Quitar Toda a Mesa #${modalPagamentoComanda.mesa.numero}`
                        : `Pagar Comanda — ${modalPagamentoComanda.nomePessoa}`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Mesa #{modalPagamentoComanda.mesa.numero} • {modalPagamentoComanda.mesa.setor}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalPagamentoComanda(null)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Valor do Pagamento e Discriminação Financeira */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total a Receber (+10% Incluso)
                  </span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    R$ {totPagamento.total.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {totPagamento.itens.length} {totPagamento.itens.length === 1 ? 'item a liquidar' : 'itens a liquidar'}
                  </span>
                </div>

                {/* Detalhamento: Subtotal, 10% Serviço, Desconto */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal de consumo:</span>
                    <span className="font-mono text-slate-200 font-bold">R$ {totPagamento.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">10% Serviço (Garçom):</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        totPagamento.taxaAtiva
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {totPagamento.taxaAtiva ? 'Incluso por Padrão' : 'Isento pelo Gerente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">
                        {totPagamento.taxaAtiva ? `+ R$ ${totPagamento.taxaServico.toFixed(2)}` : 'R$ 0,00'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSolicitarToggle10(modalPagamentoComanda.mesa, modalPagamentoComanda.nomePessoa)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Retirar ou restaurar 10% (Requer Gerente)"
                      >
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                        <span>{totPagamento.taxaAtiva ? 'Retirar' : 'Restaurar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Couvert Artístico */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Couvert Artístico:</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        totPagamento.couvertAtivo && totPagamento.couvertTotal > 0
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {totPagamento.couvertAtivo && totPagamento.couvertTotal > 0
                          ? `${totPagamento.qtdPessoasComCouvert} comanda(s) x R$ ${totPagamento.valorCouvertBase.toFixed(2)}`
                          : 'Isento / Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-400 font-bold">
                        {totPagamento.couvertTotal > 0 ? `+ R$ ${totPagamento.couvertTotal.toFixed(2)}` : 'R$ 0,00'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSolicitarToggleCouvert(modalPagamentoComanda.mesa, modalPagamentoComanda.nomePessoa)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Isentar ou aplicar couvert (Requer Gerente)"
                      >
                        <Music className="w-2.5 h-2.5 text-purple-400" />
                        <span>{totPagamento.couvertTotal > 0 ? 'Isentar' : 'Cobrar'}</span>
                      </button>
                    </div>
                  </div>

                  {totPagamento.desconto > 0 ? (
                    <div className="flex items-center justify-between text-rose-400">
                      <div className="flex items-center gap-1.5">
                        <span>Desconto Gerente:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">- R$ {totPagamento.desconto.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleAbrirDescontoGerente(modalPagamentoComanda.mesa, modalPagamentoComanda.nomePessoa)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Tag className="w-2.5 h-2.5 text-purple-400" />
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleAbrirDescontoGerente(modalPagamentoComanda.mesa, modalPagamentoComanda.nomePessoa)}
                        className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Tag className="w-2.5 h-2.5 text-purple-400" />
                        <span>+ Aplicar Desconto (Gerente)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista resumida de itens sendo pagos */}
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto space-y-1">
                {totPagamento.itens.map((it, idx) => (
                  <div key={it.id || idx} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 truncate pr-2">
                      <span className="text-orange-400 font-bold mr-1">{it.quantidade}x</span>
                      {it.nome}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      R$ {it.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Seleção da Forma de Pagamento */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Forma de Pagamento do Cliente:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pix', label: 'PIX', icon: '⚡' },
                    { id: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' },
                    { id: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
                    { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
                  ].map((fp) => (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => setFormaPagamentoComanda(fp.id as FormaPagamento)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        formaPagamentoComanda === fp.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{fp.icon}</span>
                      <span>{fp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPagamentoComanda(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleConfirmarPagamentoComanda(
                      modalPagamentoComanda.mesa,
                      modalPagamentoComanda.nomePessoa,
                      formaPagamentoComanda
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Confirmar Recebimento (R$ {totPagamento.total.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL 1: AUTORIZAÇÃO POR PIN DE GERENTE / ADMIN                */}
      {/* ============================================================== */}
      <AdminAuthModal
        isOpen={modalAuth.isOpen}
        onClose={() => setModalAuth({ ...modalAuth, isOpen: false })}
        onSuccess={modalAuth.onSuccess}
        actionTitle={modalAuth.actionTitle}
      />

      {/* ============================================================== */}
      {/* MODAL 2: APLICAR DESCONTO DO GERENTE                           */}
      {/* ============================================================== */}
      {modalDescontoGerente && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Desconto Autorizado — Gerente</h3>
                  <p className="text-[11px] text-slate-400">
                    {modalDescontoGerente.nomePessoa === 'todos'
                      ? `Toda a Mesa #${modalDescontoGerente.mesa.numero}`
                      : `Comanda de ${modalDescontoGerente.nomePessoa}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDescontoGerente(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarDescontoGerente} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-bold">Subtotal + 10% da Comanda:</span>
                <span className="font-mono font-black text-white text-sm">
                  R$ {modalDescontoGerente.subtotalComanda.toFixed(2)}
                </span>
              </div>

              {/* Tipo de Desconto: R$ ou % */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Formato do Desconto:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormDesconto({ ...formDesconto, tipo: 'reais' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                      formDesconto.tipo === 'reais'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>R$ Valor Fixo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormDesconto({ ...formDesconto, tipo: 'porcentagem' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                      formDesconto.tipo === 'porcentagem'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Porcentagem (%)</span>
                  </button>
                </div>
              </div>

              {/* Valor do Desconto */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  {formDesconto.tipo === 'reais' ? 'Valor do Desconto em Reais (R$):' : 'Porcentagem do Desconto (%):'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formDesconto.tipo === 'reais' ? modalDescontoGerente.subtotalComanda : 100}
                  value={formDesconto.valor || ''}
                  onChange={(e) => setFormDesconto({ ...formDesconto, valor: parseFloat(e.target.value) || 0 })}
                  placeholder={formDesconto.tipo === 'reais' ? 'Ex: 15.00' : 'Ex: 10'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                  required
                  autoFocus
                />
              </div>

              {/* Motivo do Desconto */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Motivo do Desconto:</label>
                <select
                  value={formDesconto.motivo}
                  onChange={(e) => setFormDesconto({ ...formDesconto, motivo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Cortesia do Gerente">Cortesia do Gerente</option>
                  <option value="Fidelidade / Amigo da Casa">Fidelidade / Amigo da Casa</option>
                  <option value="Compensação por Atraso">Compensação por Atraso / Atendimento</option>
                  <option value="Promoção / Parceria">Promoção / Parceria Comercial</option>
                  <option value="Outro motivo aprovado">Outro motivo aprovado</option>
                </select>
              </div>

              {/* Resumo do Valor Final */}
              <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex justify-between items-center">
                <span className="text-purple-300 font-bold">Total Após Desconto:</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  R${' '}
                  {Math.max(
                    0,
                    modalDescontoGerente.subtotalComanda -
                      (formDesconto.tipo === 'reais'
                        ? Number(formDesconto.valor) || 0
                        : ((modalDescontoGerente.subtotalComanda * (Number(formDesconto.valor) || 0)) / 100))
                  ).toFixed(2)}
                </span>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-2">
                {modalDescontoGerente.valorAtual > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      aplicarDescontoComandaMesa(modalDescontoGerente.mesa.numero, modalDescontoGerente.nomePessoa, 0, idLoja);
                      dispararToast('Desconto removido com sucesso!');
                      setModalDescontoGerente(null);
                      sincronizarMesasAbertas(modalDescontoGerente.mesa.numero);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold cursor-pointer"
                  >
                    Remover Desconto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalDescontoGerente(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  Confirmar Desconto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CANCELAMENTO DE ITEM DA COMANDA (GERENTE)             */}
      {/* ============================================================== */}
      {modalCancelarItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Cancelar Item da Comanda</h3>
                  <p className="text-[11px] text-slate-400">
                    Mesa #{modalCancelarItem.mesa.numero} • Ação Exclusiva do Gerente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCancelarItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarCancelarItem} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-white text-sm block">
                      {modalCancelarItem.item.nome}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Pertence a: <strong>{getDonoDoItem(modalCancelarItem.item, modalCancelarItem.mesa)}</strong> • Lançado às {modalCancelarItem.item.horario}
                    </span>
                  </div>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    R$ {modalCancelarItem.item.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                  <span>Quantidade a estornar:</span>
                  <span className="font-bold text-orange-400">{modalCancelarItem.item.quantidade}x</span>
                </div>
              </div>

              {/* Motivo do Cancelamento */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Selecione o Motivo Obrigatório do Cancelamento:
                </label>
                <select
                  value={motivoCancelamentoItem}
                  onChange={(e) => setMotivoCancelamentoItem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
                  required
                >
                  <option value="Cliente desistiu">Cliente desistiu</option>
                  <option value="Erro de digitação / Lançamento indevido">Erro de digitação / Lançamento indevido</option>
                  <option value="Demora excessiva na cozinha">Demora excessiva na cozinha</option>
                  <option value="Prato servido com avaria / reclamação">Prato servido com avaria / reclamação</option>
                  <option value="Falta de ingrediente no estoque">Falta de ingrediente no estoque</option>
                  <option value="Outro motivo aprovado pela gerência">Outro motivo aprovado pela gerência</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  O item será <strong>removido da comanda</strong>, o saldo da mesa e os 10% recalculados, e o cancelamento ficará registrado no histórico da gerência com o motivo selecionado.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCancelarItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: GESTÃO RÁPIDA DE COUVERT ARTÍSTICO NO SALÃO             */}
      {/* ============================================================== */}
      {modalCouvertAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Couvert Artístico & Música ao Vivo</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina o valor por pessoa e ative a cobrança automática nas comandas do salão.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCouvertAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Principal de Ativação */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white block">
                  Cobrança de Couvert Artístico no Salão
                </span>
                <p className="text-[11px] text-slate-400">
                  {formCouvert.ativo
                    ? 'Ativo: adiciona o couvert automaticamente por comanda aberta nas mesas ocupadas.'
                    : 'Inativo: nenhuma comanda será cobrada por couvert artístico.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormCouvert({ ...formCouvert, ativo: !formCouvert.ativo })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer shrink-0 ${
                  formCouvert.ativo ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${
                    formCouvert.ativo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Configuração do Valor do Couvert */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Valor Cobrado por Comanda Aberta (R$)
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formCouvert.valorPorPessoa}
                    onChange={(e) =>
                      setFormCouvert({
                        ...formCouvert,
                        valorPorPessoa: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {[10, 12, 15, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormCouvert({ ...formCouvert, valorPorPessoa: val })}
                      className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        formCouvert.valorPorPessoa === val
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dias com Música ao Vivo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Dias de Apresentação / Música ao Vivo
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[
                  { id: 'segunda', label: 'Seg' },
                  { id: 'terca', label: 'Ter' },
                  { id: 'quarta', label: 'Qua' },
                  { id: 'quinta', label: 'Qui' },
                  { id: 'sexta', label: 'Sex' },
                  { id: 'sabado', label: 'Sáb' },
                  { id: 'domingo', label: 'Dom' },
                ].map((d) => {
                  const sel = formCouvert.diasAoVivo.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        const novos = sel
                          ? formCouvert.diasAoVivo.filter((x) => x !== d.id)
                          : [...formCouvert.diasAoVivo, d.id];
                        setFormCouvert({ ...formCouvert, diasAoVivo: novos });
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sel
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Indicador ao Vivo do Salão */}
            {(() => {
              const mesasOcupadas = mesas.filter((m) => m.status !== 'livre' && m.status !== 'reservada');
              const totalComandasAbertas = mesasOcupadas.reduce(
                (acc, m) => acc + ((m.pessoas && m.pessoas.length > 1) ? m.pessoas.length : 1),
                0
              );
              const totalArrecadadoEstimado = formCouvert.ativo
                ? totalComandasAbertas * formCouvert.valorPorPessoa
                : 0;

              return (
                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Mesas ocupadas agora:</span>
                    <span className="font-bold text-white">{mesasOcupadas.length} mesa(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Comandas abertas no salão:</span>
                    <span className="font-bold text-white">{totalComandasAbertas} comanda(s)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-800">
                    <span className="font-bold text-purple-300">Estimativa Couvert Salão:</span>
                    <span className="font-mono text-purple-400 font-black text-sm">
                      R$ {totalArrecadadoEstimado.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalCouvertAberto(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarCouvert}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar e Aplicar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CENTRAL DE RESERVAS DE MESAS (EXCLUSIVO PRO/ENTERPRISE) */}
      {/* ============================================================== */}
      {modalReservasAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">Central de Reservas de Mesas</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      Pro & Enterprise
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Integrado ao WhatsApp IA (ELOBOT) • Reconhece aniversários, bolos e preferências especiais
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPlanoPermiteReservas && (
                  <button
                    type="button"
                    onClick={() => setModalNovaReservaAberto(true)}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nova Reserva</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalReservasAberto(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            {!isPlanoPermiteReservas ? (
              /* Banner de Bloqueio por Plano Starter */
              <div className="p-6 sm:p-8 text-center space-y-5 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                  <Crown className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-lg font-black text-white">
                    Recurso Exclusivo dos Planos Pro e Enterprise
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O módulo avançado de <strong>Reserva de Mesas com integração ao WhatsApp IA (ELOBOT)</strong> não está incluso no plano <strong>{planoAtual.nome}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Com o Pro ou Enterprise, o robô atende seus clientes no WhatsApp 24h por dia, registra a data, horário, quantidade de pessoas, aniversários e reservas de bolo, e vincula automaticamente às mesas do salão!
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalReservasAberto(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      mudarPlanoTenant(idLoja, 'pro');
                      dispararToast('🎉 Parabéns! Upgrade para o Plano Pro realizado com sucesso. Módulo de reservas liberado!');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Fazer Upgrade para o Pro (R$ 199/mês)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Painel de Gestão de Reservas Ativas */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Filtros de Status */}
                <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                      { id: 'hoje', label: `Hoje (${reservasHoje.length})` },
                      { id: 'pendentes', label: `Pendentes (${reservas.filter((r) => r.status === 'pendente').length})` },
                      { id: 'confirmadas', label: `Confirmadas (${reservas.filter((r) => r.status === 'confirmada').length})` },
                      { id: 'todas', label: `Todas (${reservas.length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFiltroStatusReserva(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          filtroStatusReserva === f.id
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {reservas.filter((r) => r.origem === 'elobot').length} via WhatsApp IA (ELOBOT)
                  </span>
                </div>

                {/* Lista de Reservas */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(() => {
                    const listaExibicao = reservas.filter((r) => {
                      if (filtroStatusReserva === 'hoje') return r.data === hojeStr;
                      if (filtroStatusReserva === 'pendentes') return r.status === 'pendente';
                      if (filtroStatusReserva === 'confirmadas') return r.status === 'confirmada';
                      return true;
                    });

                    if (listaExibicao.length === 0) {
                      return (
                        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                          <Calendar className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="font-semibold text-slate-400">Nenhuma reserva encontrada para este filtro.</p>
                          <p className="text-[11px] text-slate-500">
                            Novas reservas recebidas pelo WhatsApp do ELOBOT aparecerão aqui em tempo real.
                          </p>
                        </div>
                      );
                    }

                    return listaExibicao.map((r) => {
                      const mesasLivres = mesas.filter((m) => m.status === 'livre');

                      return (
                        <div
                          key={r.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            r.status === 'concluida'
                              ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                              : r.status === 'cancelada'
                              ? 'bg-rose-950/10 border-rose-500/20 opacity-60'
                              : r.status === 'confirmada'
                              ? 'bg-slate-950 border-emerald-500/30 shadow-md'
                              : 'bg-slate-950 border-amber-500/30'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center shrink-0">
                                {r.clienteNome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-extrabold text-white">{r.clienteNome}</h4>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      r.status === 'confirmada'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : r.status === 'concluida'
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : r.status === 'cancelada'
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {r.status === 'concluida' ? 'Clientes Sentados' : r.status}
                                  </span>
                                  {r.origem === 'elobot' && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      <span>ELOBOT</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                  <a
                                    href={`https://wa.me/55${r.clienteTelefone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                                    title="Abrir WhatsApp com o cliente"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{r.clienteTelefone}</span>
                                  </a>
                                  <span>•</span>
                                  <span>{r.quantidadePessoas} pessoas</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:text-right">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Data & Horário:</span>
                                <span className="font-mono text-xs font-bold text-white">
                                  {r.data.split('-').reverse().join('/')} às {r.horario}
                                </span>
                              </div>

                              <div className="pl-3 border-l border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mesa:</span>
                                {r.mesaNumero ? (
                                  <span className="text-xs font-black text-amber-400 font-mono">
                                    Mesa #{r.mesaNumero}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic">Sem mesa</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badges de Ocasiões Especiais (Aniversário, Bolo, Decoração) */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {r.especiais?.aniversario && (
                              <span className="px-2.5 py-1 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 font-bold flex items-center gap-1 text-[11px]">
                                <span>🎂</span>
                                <span>Aniversário</span>
                              </span>
                            )}
                            {r.especiais?.presencaBolo && (
                              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1 text-[11px]">
                                <Cake className="w-3.5 h-3.5 text-amber-400" />
                                <span>Vai Trazer Bolo</span>
                              </span>
                            )}
                            {r.especiais?.decoracao && (
                              <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1 text-[11px]">
                                <span>🎈</span>
                                <span>Decoração Solicitada</span>
                              </span>
                            )}
                            {r.especiais?.observacoes && (
                              <span className="text-[11px] text-slate-300 italic bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                                "{r.especiais.observacoes}"
                              </span>
                            )}
                          </div>

                          {/* Ações da Reserva */}
                          {r.status !== 'concluida' && r.status !== 'cancelada' && (
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 text-xs">
                              {/* Vincular Mesa Dropdown se não tiver */}
                              {!r.mesaNumero ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[11px]">Vincular Mesa:</span>
                                  <select
                                    onChange={(e) => {
                                      const num = parseInt(e.target.value);
                                      if (num) handleVincularMesaReserva(r.id, num);
                                    }}
                                    defaultValue=""
                                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    <option value="" disabled>Selecione uma mesa livre...</option>
                                    {mesasLivres.map((m) => (
                                      <option key={m.numero} value={m.numero}>
                                        Mesa #{m.numero} ({m.setor} - {m.capacidade} lug)
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400">
                                  Vinculada à <strong className="text-white">Mesa #{r.mesaNumero}</strong>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 ml-auto">
                                {r.status === 'pendente' && (
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmarStatusReserva(r.id, 'confirmada')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Confirmar Reserva
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleSentarReserva(r)}
                                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>Sentar na Mesa {r.mesaNumero ? `#${r.mesaNumero}` : ''}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCancelarReserva(r)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                  title="Cancelar Reserva"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVA RESERVA MANUAL DE MESA (GERÊNCIA)                 */}
      {/* ============================================================== */}
      {modalNovaReservaAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Criar Nova Reserva</h3>
                  <p className="text-[11px] text-slate-400">
                    Preencha os dados do cliente e ocasiões especiais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalNovaReservaAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarReservaManual} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nome do Cliente:</label>
                  <input
                    type="text"
                    required
                    value={formNovaReserva.clienteNome}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, clienteNome: e.target.value })}
                    placeholder="Ex: Beatriz Albuquerque"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Telefone / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={formNovaReserva.clienteTelefone}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, clienteTelefone: e.target.value })}
                    placeholder="(31) 99999-8888"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Data:</label>
                  <input
                    type="date"
                    required
                    value={formNovaReserva.data}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, data: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Horário:</label>
                  <input
                    type="time"
                    required
                    value={formNovaReserva.horario}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, horario: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Pessoas:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formNovaReserva.quantidadePessoas}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, quantidadePessoas: parseInt(e.target.value) || 1 })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Mesa Sugerida */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Vincular a uma Mesa (Opcional):</label>
                <select
                  value={formNovaReserva.mesaNumero || ''}
                  onChange={(e) =>
                    setFormNovaReserva({
                      ...formNovaReserva,
                      mesaNumero: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">A definir na chegada dos convidados</option>
                  {mesas.map((m) => (
                    <option key={m.numero} value={m.numero}>
                      Mesa #{m.numero} ({m.setor} - {m.capacidade} lugares) — {m.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informações Especiais */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                  Informações Especiais & Celebrações:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-pink-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNovaReserva.aniversario}
                      onChange={(e) => setFormNovaReserva({ ...formNovaReserva, aniversario: e.target.checked })}
                      className="rounded accent-pink-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-pink-300">🎂 Aniversário</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNovaReserva.presencaBolo}
                      onChange={(e) => setFormNovaReserva({ ...formNovaReserva, presencaBolo: e.target.checked })}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-300">🍰 Trazer Bolo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formNovaReserva.decoracao}
                      onChange={(e) => setFormNovaReserva({ ...formNovaReserva, decoracao: e.target.checked })}
                      className="rounded accent-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-purple-300">🎈 Decoração</span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Observações da Reserva:</label>
                  <textarea
                    rows={2}
                    value={formNovaReserva.observacoes}
                    onChange={(e) => setFormNovaReserva({ ...formNovaReserva, observacoes: e.target.value })}
                    placeholder="Ex: Preferem mesa próxima à janela; convidados chegam juntos..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaReservaAberto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Reserva</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
