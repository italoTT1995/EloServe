import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Printer,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Lock,
  Unlock,
  Store,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Download,
  X,
  CreditCard,
  Banknote,
  QrCode,
  FileSpreadsheet,
  Edit2,
  Lightbulb,
  Droplet,
  Flame,
  Users,
  Bike,
  Apple,
  Search,
  Check,
  Upload,
  FileText,
  Copy,
  Eye,
  Building2,
  FileCheck,
  Info,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useProductStore } from '../store/useProductStore';
import { useThemeStore } from '../store/useThemeStore';
import {
  DespesaOperacionalRestaurante,
  VendaRealizada,
  NotaFiscalRegistro,
  TipoNotaFiscal,
  ModeloDocumentoFiscal,
  StatusNotaFiscal,
} from '../types';
import { extrairDadosXmlNFe } from '../utils/nfeXmlParser';

type PeriodoFiltro = 'hoje' | '7dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'todos';
type SubAbaFinanceiro = 'notas_fiscais' | 'gastos' | 'dre' | 'indicadores';

// Configuração das Categorias que se Enquadram no DRE
export const CATEGORIAS_DRE: Record<
  DespesaOperacionalRestaurante['categoria'],
  {
    titulo: string;
    linhaDRE: string;
    descricao: string;
    corBadge: string;
    corIcone: string;
    icone: any;
  }
> = {
  ocupacao: {
    titulo: 'Ocupação & Utilidades',
    linhaDRE: '6.2 Despesas Fixas de Ocupação',
    descricao: 'Aluguel do imóvel, Energia elétrica (luz), Água/esgoto, Gás de cozinha, IPTU e condomínio.',
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    corIcone: 'text-amber-400',
    icone: Store,
  },
  pessoal: {
    titulo: 'Equipe & Pessoal',
    linhaDRE: '6.1 Despesas com Pessoal Operacional',
    descricao: 'Salários da equipe, diárias extras de garçom/cozinha, pró-labore dos sócios e vales.',
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    corIcone: 'text-blue-400',
    icone: Users,
  },
  servicos: {
    titulo: 'Serviços, Sistemas & Manutenção',
    linhaDRE: '6.4 Serviços, Manutenção & Gerais',
    descricao: 'Software de gestão eloGastrô, internet, contabilidade, produtos de limpeza e consertos.',
    corBadge: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30',
    corIcone: 'text-[#FF6B00]',
    icone: Sparkles,
  },
  insumos: {
    titulo: 'Insumos Avulsos & Feira',
    linhaDRE: '4.0 CMV - Custo Direto da Operação',
    descricao: 'Compras emergenciais na feira, hortifruti rápido, gelo, carvão e temperos frescos.',
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    corIcone: 'text-emerald-400',
    icone: Apple,
  },
  financeiro: {
    titulo: 'Comercial, Embalagens & Vendas',
    linhaDRE: '6.3 Despesas Comerciais & Tributárias',
    descricao: 'Embalagens para delivery, taxas de maquininha de cartão, taxas bancárias e impostos (DAS).',
    corBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    corIcone: 'text-purple-400',
    icone: Bike,
  },
  outros: {
    titulo: 'Outras Despesas Operacionais',
    linhaDRE: '6.5 Outras Despesas Administrativas',
    descricao: 'Imprevistos pontuais, uniformes, taxas municipais e despesas gerais diversas.',
    corBadge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    corIcone: 'text-slate-400',
    icone: Layers,
  },
};

// Map de Tipos de Notas Fiscais
export const MAPA_TIPO_NF: Record<
  TipoNotaFiscal,
  {
    rotulo: string;
    direcao: 'entrada' | 'saida';
    linhaDRE: string;
    cor: string;
    badgeCor: string;
  }
> = {
  entrada_insumos: {
    rotulo: 'Entrada: Compras & Insumos',
    direcao: 'entrada',
    linhaDRE: '4.0 CMV (Custo das Mercadorias)',
    cor: 'text-[#10B981]',
    badgeCor: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  },
  entrada_embalagens: {
    rotulo: 'Entrada: Embalagens Delivery',
    direcao: 'entrada',
    linhaDRE: '6.3 Despesas Comerciais & Embalagens',
    cor: 'text-purple-400',
    badgeCor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  entrada_servicos: {
    rotulo: 'Entrada: NFS-e Serviços Tomados',
    direcao: 'entrada',
    linhaDRE: '6.4 Serviços, TI & Manutenção',
    cor: 'text-[#FF6B00]',
    badgeCor: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30',
  },
  entrada_utilidades: {
    rotulo: 'Entrada: Contas / Ocupação (Luz, Gás)',
    direcao: 'entrada',
    linhaDRE: '6.2 Ocupação & Utilidades',
    cor: 'text-amber-400',
    badgeCor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  entrada_equipamento: {
    rotulo: 'Entrada: Equipamentos & Ativo',
    direcao: 'entrada',
    linhaDRE: '6.5 Imobilizado / Outras',
    cor: 'text-blue-400',
    badgeCor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  saida_venda: {
    rotulo: 'Saída: NFC-e / Venda Consumidor',
    direcao: 'saida',
    linhaDRE: '1.0 Receita Operacional Bruta',
    cor: 'text-emerald-400',
    badgeCor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  outros: {
    rotulo: 'Outros Documentos Fiscais',
    direcao: 'entrada',
    linhaDRE: '6.5 Outras Despesas',
    cor: 'text-slate-400',
    badgeCor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
};

// Templates de Lançamento Rápido em 1 Clique
const ATALHOS_LANCAMENTO_RAPIDO = [
  {
    rotulo: 'Conta de Luz (Energia)',
    descricao: 'Conta de Energia Elétrica',
    categoria: 'ocupacao' as const,
    tipo: 'variavel' as const,
    icone: Lightbulb,
    cor: 'text-amber-400',
  },
  {
    rotulo: 'Conta de Água',
    descricao: 'Conta de Água e Saneamento',
    categoria: 'ocupacao' as const,
    tipo: 'variavel' as const,
    icone: Droplet,
    cor: 'text-blue-400',
  },
  {
    rotulo: 'Aluguel do Salão',
    descricao: 'Aluguel do Ponto Comercial',
    categoria: 'ocupacao' as const,
    tipo: 'fixa' as const,
    icone: Store,
    cor: 'text-amber-400',
  },
  {
    rotulo: 'Gás de Cozinha',
    descricao: 'Botijão / Recarga de Gás P45',
    categoria: 'ocupacao' as const,
    tipo: 'variavel' as const,
    icone: Flame,
    cor: 'text-orange-400',
  },
  {
    rotulo: 'Diária Garçom / Free',
    descricao: 'Diária de Freelancer / Apoio de Turno',
    categoria: 'pessoal' as const,
    tipo: 'variavel' as const,
    icone: Users,
    cor: 'text-blue-400',
  },
  {
    rotulo: 'Embalagens Delivery',
    descricao: 'Embalagens térmicas e sacolas kraft',
    categoria: 'financeiro' as const,
    tipo: 'variavel' as const,
    icone: Bike,
    cor: 'text-purple-400',
  },
  {
    rotulo: 'Feira & Hortifrúti',
    descricao: 'Compra de Legumes, Verduras e Temperos',
    categoria: 'insumos' as const,
    tipo: 'variavel' as const,
    icone: Apple,
    cor: 'text-emerald-400',
  },
  {
    rotulo: 'Limpeza & Higiene',
    descricao: 'Produtos de Limpeza e Sanitização',
    categoria: 'servicos' as const,
    tipo: 'variavel' as const,
    icone: Sparkles,
    cor: 'text-[#FF6B00]',
  },
];

export default function Financeiro() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { usuarioLogado } = useAuthStore();
  const { tenantAtivoId, getTenantAtivo } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;

  // Stores
  const {
    getVendasPorTenant,
    getDespesasPorTenant,
    adicionarDespesaRestaurante,
    editarDespesaRestaurante,
    alternarStatusPagamentoDespesa,
    removerDespesaRestaurante,
    getNotasFiscaisPorTenant,
    adicionarNotaFiscal,
    editarNotaFiscal,
    removerNotaFiscal,
  } = useAppStore();

  const { fichasTecnicas, itens: itensEstoque } = useEstoqueStore();

  // Estados locais de navegação e filtros
  const [subAba, setSubAba] = useState<SubAbaFinanceiro>(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('aba') === 'notas_fiscais' || location.pathname === '/notas-fiscais') {
      return 'notas_fiscais';
    }
    if (searchParams.get('aba') === 'dre') return 'dre';
    if (searchParams.get('aba') === 'indicadores') return 'indicadores';
    return 'gastos';
  });

  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes_atual');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [filtroTipoNF, setFiltroTipoNF] = useState<string>('todas');
  const [filtroStatusNF, setFiltroStatusNF] = useState<string>('todas');

  // Modais de Despesas
  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [gastoEmEdicaoId, setGastoEmEdicaoId] = useState<string | null>(null);

  // Modais de Notas Fiscais
  const [modalNFAberto, setModalNFAberto] = useState(false);
  const [modalImportarXmlAberto, setModalImportarXmlAberto] = useState(false);
  const [modalDanfeAberto, setModalDanfeAberto] = useState(false);
  const [nfVisualizando, setNfVisualizando] = useState<NotaFiscalRegistro | null>(null);
  const [nfEmEdicaoId, setNfEmEdicaoId] = useState<string | null>(null);

  // XML Import State
  const [xmlInputTexto, setXmlInputTexto] = useState('');
  const [nomeArquivoXmlSelecionado, setNomeArquivoXmlSelecionado] = useState('');
  const [erroXml, setErroXml] = useState<string | null>(null);
  const [xmlPrevia, setXmlPrevia] = useState<Omit<NotaFiscalRegistro, 'id' | 'criadoEm'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);

  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => setToastNotificacao(null), 4000);
  }

  // Sincronizar sub-aba com URL se mudar via histórico
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const abaParam = searchParams.get('aba');
    if (location.pathname === '/notas-fiscais' || abaParam === 'notas_fiscais') {
      setSubAba('notas_fiscais');
    }
  }, [location]);

  // Form State: Despesa
  const [formDespesa, setFormDespesa] = useState<{
    descricao: string;
    categoria: DespesaOperacionalRestaurante['categoria'];
    valor: string;
    data: string;
    tipo: 'fixa' | 'variavel';
    formaPagamento: 'pix' | 'dinheiro' | 'boleto' | 'transferencia' | 'cartao';
    statusPagamento: 'pago' | 'pendente';
    dataVencimento?: string;
    observacoes?: string;
    notaFiscalId?: string;
    numeroNotaFiscal?: string;
  }>({
    descricao: '',
    categoria: 'ocupacao',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'fixa',
    formaPagamento: 'pix',
    statusPagamento: 'pago',
    dataVencimento: new Date().toISOString().split('T')[0],
    observacoes: '',
  });

  // Form State: Nota Fiscal
  const [formNF, setFormNF] = useState<{
    numero: string;
    serie: string;
    chaveAcesso: string;
    modelo: ModeloDocumentoFiscal;
    tipo: TipoNotaFiscal;
    emitenteRazaoSocial: string;
    emitenteCnpjCpf: string;
    destinatarioRazaoSocial: string;
    destinatarioCnpjCpf: string;
    dataEmissao: string;
    valorTotalProdutos: string;
    valorFrete: string;
    valorTotalNota: string;
    valorIcms: string;
    valorPis: string;
    valorCofins: string;
    valorIss: string;
    status: StatusNotaFiscal;
    observacoes: string;
    lancarNoLivroCaixa: boolean;
  }>({
    numero: '',
    serie: '1',
    chaveAcesso: '',
    modelo: 'NFe_55',
    tipo: 'entrada_insumos',
    emitenteRazaoSocial: '',
    emitenteCnpjCpf: '',
    destinatarioRazaoSocial: tenantAtual.nomeFantasia,
    destinatarioCnpjCpf: tenantAtual.documento || '11.222.333/0001-44',
    dataEmissao: new Date().toISOString().split('T')[0],
    valorTotalProdutos: '',
    valorFrete: '0',
    valorTotalNota: '',
    valorIcms: '0',
    valorPis: '0',
    valorCofins: '0',
    valorIss: '0',
    status: 'autorizada',
    observacoes: '',
    lancarNoLivroCaixa: true,
  });

  // Carrega vendas, despesas e notas fiscais isoladas da loja ativa
  const todasVendasLoja = getVendasPorTenant(currentTenantId);
  const todasDespesasLoja = getDespesasPorTenant(currentTenantId);
  const todasNotasFiscaisLoja = getNotasFiscaisPorTenant(currentTenantId);

  // Helper para verificar datas e aplicar filtros de período
  function dataPertenceAoPeriodo(dataHoraStr: string, filtro: PeriodoFiltro): boolean {
    if (filtro === 'todos') return true;

    let dia = 0;
    let mes = 0;
    let ano = 0;

    if (dataHoraStr.includes('/')) {
      const partes = dataHoraStr.split(' ')[0].split('/');
      dia = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10);
      ano = parseInt(partes[2], 10);
    } else if (dataHoraStr.includes('-')) {
      const partes = dataHoraStr.split('T')[0].split('-');
      ano = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10);
      dia = parseInt(partes[2], 10);
    }

    if (!dia || !mes || !ano) return true;

    const agora = new Date();
    const hojeDia = agora.getDate();
    const hojeMes = agora.getMonth() + 1;
    const hojeAno = agora.getFullYear();

    if (filtro === 'hoje') {
      return dia === hojeDia && mes === hojeMes && ano === hojeAno;
    }

    if (filtro === '7dias') {
      const dataItem = new Date(ano, mes - 1, dia);
      const diffMs = agora.getTime() - dataItem.getTime();
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      return diffDias >= -1 && diffDias <= 7;
    }

    if (filtro === 'mes_atual') {
      return mes === hojeMes && ano === hojeAno;
    }

    if (filtro === 'mes_anterior') {
      const mesAnt = hojeMes === 1 ? 12 : hojeMes - 1;
      const anoAnt = hojeMes === 1 ? hojeAno - 1 : hojeAno;
      return mes === mesAnt && ano === anoAnt;
    }

    if (filtro === 'ano_atual') {
      return ano === hojeAno;
    }

    return true;
  }

  // Filtragens pelo período selecionado
  const vendasFiltradas = useMemo(() => {
    return todasVendasLoja.filter((v) => dataPertenceAoPeriodo(v.dataHora, periodo));
  }, [todasVendasLoja, periodo]);

  const despesasFiltradas = useMemo(() => {
    return todasDespesasLoja.filter((d) => dataPertenceAoPeriodo(d.data, periodo));
  }, [todasDespesasLoja, periodo]);

  const notasFiscaisFiltradas = useMemo(() => {
    return todasNotasFiscaisLoja.filter((n) => dataPertenceAoPeriodo(n.dataEmissao, periodo));
  }, [todasNotasFiscaisLoja, periodo]);

  // Despesas da visualização do Livro Caixa
  const despesasLivroCaixa = useMemo(() => {
    return despesasFiltradas.filter((d) => {
      const matchBusca =
        !buscaTexto ||
        d.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        CATEGORIAS_DRE[d.categoria]?.titulo.toLowerCase().includes(buscaTexto.toLowerCase());

      const matchCat = filtroCategoria === 'todas' || d.categoria === filtroCategoria;
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'pago' && d.statusPagamento !== 'pendente') ||
        (filtroStatus === 'pendente' && d.statusPagamento === 'pendente');

      return matchBusca && matchCat && matchStatus;
    });
  }, [despesasFiltradas, buscaTexto, filtroCategoria, filtroStatus]);

  // Notas Fiscais com busca e filtros de tipo/status
  const notasFiscaisExibicao = useMemo(() => {
    return notasFiscaisFiltradas.filter((n) => {
      const matchBusca =
        !buscaTexto ||
        n.numero.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        n.emitenteRazaoSocial.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (n.chaveAcesso && n.chaveAcesso.toLowerCase().includes(buscaTexto.toLowerCase())) ||
        n.emitenteCnpjCpf.toLowerCase().includes(buscaTexto.toLowerCase());

      const matchTipo = filtroTipoNF === 'todas' || n.tipo === filtroTipoNF;
      const matchStatus = filtroStatusNF === 'todas' || n.status === filtroStatusNF;

      return matchBusca && matchTipo && matchStatus;
    });
  }, [notasFiscaisFiltradas, buscaTexto, filtroTipoNF, filtroStatusNF]);

  // CÁLCULOS DO DRE COMPLETO DO RESTAURANTE (INTEGRADO COM NOTAS FISCAIS)
  const dadosDRE = useMemo(() => {
    let receitaBrutaVendas = 0;
    let vendasBalcao = 0;
    let vendasMesas = 0;
    let vendasDelivery = 0;

    let totalDescontos = 0;
    let totalCancelamentos = 0;
    let qtdVendasConcluidas = 0;
    let qtdVendasCanceladas = 0;

    // Taxas de maquininha estimadas
    let taxasCartaoEstimadas = 0;

    // CMV
    let cmvTotal = 0;
    let itensComCustoCalculado = 0;
    let totalItensVendidos = 0;

    const mapaLucroProdutos: Record<string, { nome: string; quantidade: number; receita: number; custo: number; lucro: number }> = {};

    vendasFiltradas.forEach((venda) => {
      const valorBrutoVenda = venda.subtotalBruto || (venda.total + (venda.desconto || 0));
      receitaBrutaVendas += valorBrutoVenda;

      if (venda.tipoOrigem === 'mesa') vendasMesas += valorBrutoVenda;
      else if (venda.tipoOrigem === 'delivery') vendasDelivery += valorBrutoVenda;
      else vendasBalcao += valorBrutoVenda;

      if (venda.status === 'cancelada') {
        qtdVendasCanceladas += 1;
        totalCancelamentos += valorBrutoVenda;
        return;
      }

      qtdVendasConcluidas += 1;
      totalDescontos += venda.desconto || 0;

      // Taxas estimadas por meio de pagamento
      if (venda.formaPagamento === 'credito') {
        taxasCartaoEstimadas += venda.total * 0.028;
      } else if (venda.formaPagamento === 'debito') {
        taxasCartaoEstimadas += venda.total * 0.015;
      } else if (venda.formaPagamento === 'pix') {
        taxasCartaoEstimadas += venda.total * 0.0099;
      }

      // Cálculo de CMV item a item
      venda.itens.forEach((item) => {
        totalItensVendidos += item.quantidade;
        let custoUnitario = 0;
        let temFichaOuCustoReal = false;

        const ficha = fichasTecnicas.find(
          (f) => f.produtoId === item.produtoId || f.nomePrato.toLowerCase() === item.nome.toLowerCase()
        );

        if (ficha && ficha.custoTotalEstimado > 0) {
          custoUnitario = ficha.custoTotalEstimado;
          temFichaOuCustoReal = true;
        } else {
          const itemEst = itensEstoque.find(
            (e) =>
              e.id === item.produtoId ||
              e.nome.toLowerCase() === item.nome.toLowerCase() ||
              item.nome.toLowerCase().includes(e.nome.toLowerCase().slice(0, 10))
          );
          if (itemEst && itemEst.precoCusto > 0) {
            custoUnitario = itemEst.precoCusto;
            temFichaOuCustoReal = true;
          } else {
            custoUnitario = (item.precoUnitario || 0) * 0.32;
          }
        }

        if (temFichaOuCustoReal) {
          itensComCustoCalculado += item.quantidade;
        }

        const custoLinha = custoUnitario * item.quantidade;
        cmvTotal += custoLinha;

        const chaveProd = item.produtoId || item.nome;
        if (!mapaLucroProdutos[chaveProd]) {
          mapaLucroProdutos[chaveProd] = {
            nome: item.nome,
            quantidade: 0,
            receita: 0,
            custo: 0,
            lucro: 0,
          };
        }
        mapaLucroProdutos[chaveProd].quantidade += item.quantidade;
        mapaLucroProdutos[chaveProd].receita += (item.precoUnitario || 0) * item.quantidade;
        mapaLucroProdutos[chaveProd].custo += custoLinha;
        mapaLucroProdutos[chaveProd].lucro += (item.precoUnitario || 0) * item.quantidade - custoLinha;
      });
    });

    // -------------------------------------------------------------
    // INTEGRAÇÃO COM NOTAS FISCAIS
    // -------------------------------------------------------------
    // Compras de Insumos Faturadas com NF-e (Carne, Bebidas, Hortifrúti)
    const nfsInsumos = notasFiscaisFiltradas.filter(
      (n) => n.direcao === 'entrada' && (n.tipo === 'entrada_insumos' || n.linhaDRE === 'cmv') && n.status !== 'cancelada'
    );
    const totalComprasInsumosNF = nfsInsumos.reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Embalagens Faturadas com NF-e
    const nfsEmbalagens = notasFiscaisFiltradas.filter(
      (n) => n.direcao === 'entrada' && (n.tipo === 'entrada_embalagens' || n.linhaDRE === 'comercial_embalagens') && n.status !== 'cancelada'
    );
    const totalEmbalagensNF = nfsEmbalagens.reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Serviços Tomados com NFS-e (TI, Manutenção, Limpeza)
    const nfsServicos = notasFiscaisFiltradas.filter(
      (n) => n.direcao === 'entrada' && (n.tipo === 'entrada_servicos' || n.linhaDRE === 'servicos') && n.status !== 'cancelada'
    );
    const totalServicosNF = nfsServicos.reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Utilidades / Ocupação com NF (Energia, Gás)
    const nfsOcupacao = notasFiscaisFiltradas.filter(
      (n) => n.direcao === 'entrada' && (n.tipo === 'entrada_utilidades' || n.linhaDRE === 'ocupacao') && n.status !== 'cancelada'
    );
    const totalOcupacaoNF = nfsOcupacao.reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Vendas Fiscais emitidas ao consumidor (NFC-e de Saída)
    const nfsSaidaVendas = notasFiscaisFiltradas.filter(
      (n) => (n.direcao === 'saida' || n.tipo === 'saida_venda') && n.status !== 'cancelada'
    );
    const totalVendasFiscaisNF = nfsSaidaVendas.reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Impostos destacados em notas fiscais (ICMS + PIS + COFINS + ISS)
    const totalImpostosNF = notasFiscaisFiltradas
      .filter((n) => n.status !== 'cancelada')
      .reduce((acc, n) => acc + (n.valorIcms || 0) + (n.valorPis || 0) + (n.valorCofins || 0) + (n.valorIss || 0), 0);

    // CUSTO DOS INSUMOS AVULSOS DO LIVRO DE GASTOS
    const despesasInsumosLivro = despesasFiltradas
      .filter((d) => d.categoria === 'insumos')
      .reduce((acc, d) => acc + d.valor, 0);

    // CMV TOTAL UNIFICADO = CMV da Ficha Técnica + Insumos de NFs de Fornecedores + Feira Avulsa do Livro
    // Para não duplicar se a ficha técnica já calculou o insumo, usamos o maior entre o CMV teórico e as NFs de insumos, ou somamos as compras extras.
    const cmvFinalDRE = Math.max(cmvTotal, totalComprasInsumosNF) + despesasInsumosLivro;

    // Despesas Operacionais por Categoria
    const despesasPessoal = despesasFiltradas.filter((d) => d.categoria === 'pessoal').reduce((acc, d) => acc + d.valor, 0);
    const despesasOcupacao = despesasFiltradas.filter((d) => d.categoria === 'ocupacao').reduce((acc, d) => acc + d.valor, 0) + totalOcupacaoNF;
    const despesasComerciais = despesasFiltradas.filter((d) => d.categoria === 'financeiro').reduce((acc, d) => acc + d.valor, 0) + taxasCartaoEstimadas + totalEmbalagensNF;
    const despesasServicos = despesasFiltradas.filter((d) => d.categoria === 'servicos').reduce((acc, d) => acc + d.valor, 0) + totalServicosNF;
    const outrasDespesas = despesasFiltradas.filter((d) => d.categoria === 'outros').reduce((acc, d) => acc + d.valor, 0);

    const totalDespesasOperacionais = despesasPessoal + despesasOcupacao + despesasComerciais + despesasServicos + outrasDespesas;

    // RECEITA OPERACIONAL BRUTA INTEGRADA (PDV + Vendas Faturadas em NFC-e que não foram no PDV)
    const receitaBrutaTotal = Math.max(receitaBrutaVendas, totalVendasFiscaisNF) + (receitaBrutaVendas > 0 && totalVendasFiscaisNF > 0 && totalVendasFiscaisNF > receitaBrutaVendas ? totalVendasFiscaisNF - receitaBrutaVendas : 0);

    // DEDUÇÕES DA RECEITA (Impostos das Notas Fiscais + Estornos + Descontos)
    const impostosSobreVenda = totalImpostosNF > 0 ? totalImpostosNF : receitaBrutaTotal * 0.045; // Estimativa Simples Nacional 4.5% se não tiver NF
    const totalDeducoesReceita = totalDescontos + totalCancelamentos + impostosSobreVenda;

    // RECEITA OPERACIONAL LÍQUIDA (ROL)
    const receitaLiquida = Math.max(0, receitaBrutaTotal - totalDeducoesReceita);

    // LUCRO BRUTO / MARGEM DE CONTRIBUIÇÃO
    const lucroBruto = receitaLiquida - cmvFinalDRE;
    const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    // RESULTADO LÍQUIDO REAL DO RESTAURANTE
    const resultadoOperacionalReal = lucroBruto - totalDespesasOperacionais;
    const margemLiquidaPct = receitaLiquida > 0 ? (resultadoOperacionalReal / receitaLiquida) * 100 : 0;

    // PONTO DE EQUILÍBRIO (BREAK-EVEN)
    const custosFixosTotais =
      despesasFiltradas.filter((d) => d.tipo === 'fixa').reduce((acc, d) => acc + d.valor, 0) +
      despesasPessoal +
      despesasOcupacao;

    const indiceMargemContribuicao = receitaLiquida > 0 ? lucroBruto / receitaLiquida : 0.65;
    const pontoEquilibrioFinanceiro =
      indiceMargemContribuicao > 0 ? custosFixosTotais / indiceMargemContribuicao : custosFixosTotais * 1.5;

    // Top Produtos Rentáveis
    const topProdutosRentaveis = Object.values(mapaLucroProdutos)
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 5);

    return {
      receitaBrutaVendas,
      receitaBrutaTotal,
      vendasBalcao,
      vendasMesas,
      vendasDelivery,
      totalDescontos,
      totalCancelamentos,
      impostosSobreVenda,
      totalDeducoesReceita,
      receitaLiquida,
      cmvTotal,
      totalComprasInsumosNF,
      totalEmbalagensNF,
      totalServicosNF,
      totalOcupacaoNF,
      totalVendasFiscaisNF,
      totalImpostosNF,
      cmvFinalDRE,
      lucroBruto,
      margemBrutaPct,
      despesasPessoal,
      despesasOcupacao,
      despesasComerciais,
      despesasServicos,
      outrasDespesas,
      totalDespesasOperacionais,
      taxasCartaoEstimadas,
      resultadoOperacionalReal,
      margemLiquidaPct,
      pontoEquilibrioFinanceiro,
      custosFixosTotais,
      qtdVendasConcluidas,
      qtdVendasCanceladas,
      totalItensVendidos,
      itensComCustoCalculado,
      topProdutosRentaveis,
      qtdNotasFiscais: notasFiscaisFiltradas.length,
    };
  }, [vendasFiltradas, despesasFiltradas, notasFiscaisFiltradas, fichasTecnicas, itensEstoque]);

  // -------------------------------------------------------------
  // HANDLERS DE NOTAS FISCAIS
  // -------------------------------------------------------------
  function abrirModalNovaNF() {
    setNfEmEdicaoId(null);
    setFormNF({
      numero: '',
      serie: '1',
      chaveAcesso: '',
      modelo: 'NFe_55',
      tipo: 'entrada_insumos',
      emitenteRazaoSocial: '',
      emitenteCnpjCpf: '',
      destinatarioRazaoSocial: tenantAtual.nomeFantasia,
      destinatarioCnpjCpf: tenantAtual.documento || '11.222.333/0001-44',
      dataEmissao: new Date().toISOString().split('T')[0],
      valorTotalProdutos: '',
      valorFrete: '0',
      valorTotalNota: '',
      valorIcms: '0',
      valorPis: '0',
      valorCofins: '0',
      valorIss: '0',
      status: 'autorizada',
      observacoes: '',
      lancarNoLivroCaixa: true,
    });
    setModalNFAberto(true);
  }

  function abrirModalEditarNF(nf: NotaFiscalRegistro) {
    setNfEmEdicaoId(nf.id);
    setFormNF({
      numero: nf.numero,
      serie: nf.serie || '1',
      chaveAcesso: nf.chaveAcesso || '',
      modelo: nf.modelo,
      tipo: nf.tipo,
      emitenteRazaoSocial: nf.emitenteRazaoSocial,
      emitenteCnpjCpf: nf.emitenteCnpjCpf,
      destinatarioRazaoSocial: nf.destinatarioRazaoSocial || tenantAtual.nomeFantasia,
      destinatarioCnpjCpf: nf.destinatarioCnpjCpf || '',
      dataEmissao: nf.dataEmissao,
      valorTotalProdutos: nf.valorTotalProdutos.toString(),
      valorFrete: (nf.valorFrete || 0).toString(),
      valorTotalNota: nf.valorTotalNota.toString(),
      valorIcms: (nf.valorIcms || 0).toString(),
      valorPis: (nf.valorPis || 0).toString(),
      valorCofins: (nf.valorCofins || 0).toString(),
      valorIss: (nf.valorIss || 0).toString(),
      status: nf.status,
      observacoes: nf.observacoes || '',
      lancarNoLivroCaixa: false,
    });
    setModalNFAberto(true);
  }

  function handleSalvarNF(e: React.FormEvent) {
    e.preventDefault();
    const vTotal = parseFloat(formNF.valorTotalNota.replace(',', '.')) || 0;
    const vProd = parseFloat(formNF.valorTotalProdutos.replace(',', '.')) || vTotal;
    const vFrete = parseFloat(formNF.valorFrete.replace(',', '.')) || 0;
    const vIcms = parseFloat(formNF.valorIcms.replace(',', '.')) || 0;
    const vPis = parseFloat(formNF.valorPis.replace(',', '.')) || 0;
    const vCofins = parseFloat(formNF.valorCofins.replace(',', '.')) || 0;
    const vIss = parseFloat(formNF.valorIss.replace(',', '.')) || 0;

    if (!formNF.numero.trim()) {
      alert('Por favor, informe o número da Nota Fiscal.');
      return;
    }
    if (vTotal <= 0) {
      alert('O valor da Nota Fiscal deve ser maior que zero.');
      return;
    }

    const mapaDRE = MAPA_TIPO_NF[formNF.tipo];
    let linhaDRE: NotaFiscalRegistro['linhaDRE'] = 'cmv';
    if (formNF.tipo === 'entrada_embalagens') linhaDRE = 'comercial_embalagens';
    else if (formNF.tipo === 'entrada_servicos') linhaDRE = 'servicos';
    else if (formNF.tipo === 'entrada_utilidades') linhaDRE = 'ocupacao';
    else if (formNF.tipo === 'saida_venda') linhaDRE = 'receita_bruta';
    else if (formNF.tipo === 'entrada_insumos') linhaDRE = 'cmv';
    else linhaDRE = 'outros';

    if (nfEmEdicaoId) {
      editarNotaFiscal(nfEmEdicaoId, {
        numero: formNF.numero,
        serie: formNF.serie,
        chaveAcesso: formNF.chaveAcesso || undefined,
        modelo: formNF.modelo,
        tipo: formNF.tipo,
        direcao: formNF.tipo === 'saida_venda' ? 'saida' : 'entrada',
        emitenteRazaoSocial: formNF.emitenteRazaoSocial,
        emitenteCnpjCpf: formNF.emitenteCnpjCpf,
        destinatarioRazaoSocial: formNF.destinatarioRazaoSocial,
        destinatarioCnpjCpf: formNF.destinatarioCnpjCpf,
        dataEmissao: formNF.dataEmissao,
        dataCompetencia: formNF.dataEmissao.slice(0, 7),
        valorTotalProdutos: vProd,
        valorFrete: vFrete,
        valorTotalNota: vTotal,
        valorIcms: vIcms,
        valorPis: vPis,
        valorCofins: vCofins,
        valorIss: vIss,
        status: formNF.status,
        linhaDRE,
        observacoes: formNF.observacoes,
      });
      exibirToast(`Nota Fiscal #${formNF.numero} atualizada e integrada ao DRE!`);
    } else {
      adicionarNotaFiscal({
        tenantId: currentTenantId,
        numero: formNF.numero,
        serie: formNF.serie,
        chaveAcesso: formNF.chaveAcesso || undefined,
        modelo: formNF.modelo,
        tipo: formNF.tipo,
        direcao: formNF.tipo === 'saida_venda' ? 'saida' : 'entrada',
        emitenteRazaoSocial: formNF.emitenteRazaoSocial || 'FORNECEDOR DIVERSOS',
        emitenteCnpjCpf: formNF.emitenteCnpjCpf || '00.000.000/0001-00',
        destinatarioRazaoSocial: formNF.destinatarioRazaoSocial,
        destinatarioCnpjCpf: formNF.destinatarioCnpjCpf,
        dataEmissao: formNF.dataEmissao,
        dataCompetencia: formNF.dataEmissao.slice(0, 7),
        valorTotalProdutos: vProd,
        valorFrete: vFrete,
        valorTotalNota: vTotal,
        valorIcms: vIcms,
        valorPis: vPis,
        valorCofins: vCofins,
        valorIss: vIss,
        status: formNF.status,
        linhaDRE,
        observacoes: formNF.observacoes,
        cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
      });

      // Se solicitado, lança também no Livro Caixa
      if (formNF.lancarNoLivroCaixa && formNF.tipo !== 'saida_venda') {
        let catGasto: DespesaOperacionalRestaurante['categoria'] = 'insumos';
        if (formNF.tipo === 'entrada_embalagens') catGasto = 'financeiro';
        else if (formNF.tipo === 'entrada_servicos') catGasto = 'servicos';
        else if (formNF.tipo === 'entrada_utilidades') catGasto = 'ocupacao';

        adicionarDespesaRestaurante({
          tenantId: currentTenantId,
          descricao: `NF-e #${formNF.numero} - ${formNF.emitenteRazaoSocial || 'Compra Fornecedor'}`,
          categoria: catGasto,
          valor: vTotal,
          data: formNF.dataEmissao,
          tipo: 'variavel',
          formaPagamento: 'boleto',
          statusPagamento: 'pago',
          observacoes: `Integrado via Nota Fiscal #${formNF.numero}. Chave: ${formNF.chaveAcesso || 'N/I'}`,
          numeroNotaFiscal: formNF.numero,
          cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
        });
      }

      exibirToast(`Nota Fiscal #${formNF.numero} lançada com sucesso! DRE atualizado.`);
    }

    setModalNFAberto(false);
  }

  function handleExcluirNF(id: string, numero: string) {
    if (confirm(`Deseja realmente remover a Nota Fiscal #${numero}? Isso afetará o cálculo do DRE.`)) {
      removerNotaFiscal(id);
      exibirToast(`Nota Fiscal #${numero} removida do sistema.`);
    }
  }

  function abrirDanfe(nf: NotaFiscalRegistro) {
    setNfVisualizando(nf);
    setModalDanfeAberto(true);
  }

  function gerarChaveAcessoAleatoria() {
    let chave = '352610';
    for (let i = 0; i < 38; i++) {
      chave += Math.floor(Math.random() * 10).toString();
    }
    setFormNF((prev) => ({ ...prev, chaveAcesso: chave }));
    exibirToast('Chave de acesso de 44 dígitos simulada!');
  }

  function copiarChave(chave?: string) {
    if (!chave) return;
    navigator.clipboard.writeText(chave);
    exibirToast('Chave de acesso copiada para a área de transferência!');
  }

  // XML Import Handlers
  function handleUploadArquivoXml(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setNomeArquivoXmlSelecionado(file.name);
    setErroXml(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      setXmlInputTexto(conteudo);
      processarXmlTexto(conteudo);
    };
    reader.readAsText(file);
  }

  function processarXmlTexto(conteudo: string) {
    setErroXml(null);
    const resultado = extrairDadosXmlNFe(conteudo, currentTenantId);
    if (!resultado.sucesso || !resultado.nota) {
      setErroXml(resultado.erro || 'Falha ao decodificar a Nota Fiscal.');
      setXmlPrevia(null);
      return;
    }
    setXmlPrevia(resultado.nota);
  }

  function confirmarImportacaoXml() {
    if (!xmlPrevia) return;

    adicionarNotaFiscal({
      ...xmlPrevia,
      tenantId: currentTenantId,
      cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
    });

    // Se for entrada de insumos ou embalagens, já cria despesa correspondente para o fluxo de caixa
    if (xmlPrevia.direcao === 'entrada') {
      let cat: DespesaOperacionalRestaurante['categoria'] = 'insumos';
      if (xmlPrevia.tipo === 'entrada_embalagens') cat = 'financeiro';
      else if (xmlPrevia.tipo === 'entrada_servicos') cat = 'servicos';
      else if (xmlPrevia.tipo === 'entrada_utilidades') cat = 'ocupacao';

      adicionarDespesaRestaurante({
        tenantId: currentTenantId,
        descricao: `XML NF-e #${xmlPrevia.numero} - ${xmlPrevia.emitenteRazaoSocial}`,
        categoria: cat,
        valor: xmlPrevia.valorTotalNota,
        data: xmlPrevia.dataEmissao,
        tipo: 'variavel',
        formaPagamento: 'boleto',
        statusPagamento: 'pago',
        observacoes: `Importado via arquivo XML. Chave: ${xmlPrevia.chaveAcesso || 'N/I'}`,
        numeroNotaFiscal: xmlPrevia.numero,
        cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
      });
    }

    exibirToast(`XML da NF-e #${xmlPrevia.numero} importado com sucesso! DRE atualizado.`);
    setModalImportarXmlAberto(false);
    setXmlInputTexto('');
    setXmlPrevia(null);
    setNomeArquivoXmlSelecionado('');
  }

  function exportarNotasFiscaisCSV() {
    const cabecalho = [
      'ID',
      'Modelo',
      'Número',
      'Série',
      'Chave de Acesso',
      'Data Emissão',
      'Tipo / DRE',
      'Emitente / Razão Social',
      'CNPJ / CPF',
      'Valor Produtos (R$)',
      'Valor Frete (R$)',
      'ICMS (R$)',
      'PIS/COFINS (R$)',
      'Valor Total NF (R$)',
      'Status SEFAZ',
    ];

    const linhas = notasFiscaisExibicao.map((n) => [
      n.id,
      n.modelo,
      n.numero,
      n.serie || '1',
      n.chaveAcesso || '',
      n.dataEmissao,
      `"${MAPA_TIPO_NF[n.tipo]?.rotulo || n.tipo}"`,
      `"${n.emitenteRazaoSocial.replace(/"/g, '""')}"`,
      `"${n.emitenteCnpjCpf}"`,
      n.valorTotalProdutos.toFixed(2),
      (n.valorFrete || 0).toFixed(2),
      (n.valorIcms || 0).toFixed(2),
      ((n.valorPis || 0) + (n.valorCofins || 0)).toFixed(2),
      n.valorTotalNota.toFixed(2),
      n.status,
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(','), ...linhas.map((l) => l.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `notas_fiscais_${tenantAtual.nomeFantasia.toLowerCase().replace(/\s+/g, '_')}_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exibirToast('Planilha de Notas Fiscais exportada com sucesso para CSV!');
  }

  // -------------------------------------------------------------
  // HANDLERS DO LIVRO DE GASTOS
  // -------------------------------------------------------------
  function abrirModalNovoGasto() {
    setGastoEmEdicaoId(null);
    setFormDespesa({
      descricao: '',
      categoria: 'ocupacao',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'fixa',
      formaPagamento: 'pix',
      statusPagamento: 'pago',
      dataVencimento: new Date().toISOString().split('T')[0],
      observacoes: '',
    });
    setModalGastoAberto(true);
  }

  function aplicarAtalhoRapido(atalho: (typeof ATALHOS_LANCAMENTO_RAPIDO)[0]) {
    setGastoEmEdicaoId(null);
    setFormDespesa({
      descricao: atalho.descricao,
      categoria: atalho.categoria,
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: atalho.tipo,
      formaPagamento: 'pix',
      statusPagamento: 'pago',
      dataVencimento: new Date().toISOString().split('T')[0],
      observacoes: `Lançamento rápido: ${atalho.rotulo}`,
    });
    setModalGastoAberto(true);
  }

  function abrirModalEditarGasto(desp: DespesaOperacionalRestaurante) {
    setGastoEmEdicaoId(desp.id);
    setFormDespesa({
      descricao: desp.descricao,
      categoria: desp.categoria,
      valor: desp.valor.toString(),
      data: desp.data,
      tipo: desp.tipo,
      formaPagamento: desp.formaPagamento || 'pix',
      statusPagamento: desp.statusPagamento || 'pago',
      dataVencimento: desp.dataVencimento || desp.data,
      observacoes: desp.observacoes || '',
      notaFiscalId: desp.notaFiscalId,
      numeroNotaFiscal: desp.numeroNotaFiscal,
    });
    setModalGastoAberto(true);
  }

  function handleSalvarGasto(e: React.FormEvent) {
    e.preventDefault();
    const valorNum = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!valorNum || valorNum <= 0) {
      alert('Por favor, informe um valor monetário válido maior que zero.');
      return;
    }

    if (gastoEmEdicaoId) {
      editarDespesaRestaurante(gastoEmEdicaoId, {
        descricao: formDespesa.descricao,
        categoria: formDespesa.categoria,
        valor: valorNum,
        data: formDespesa.data,
        tipo: formDespesa.tipo,
        formaPagamento: formDespesa.formaPagamento,
        statusPagamento: formDespesa.statusPagamento,
        dataVencimento: formDespesa.dataVencimento,
        observacoes: formDespesa.observacoes,
      });
      exibirToast(`Gasto "${formDespesa.descricao}" atualizado com sucesso!`);
    } else {
      adicionarDespesaRestaurante({
        tenantId: currentTenantId,
        descricao: formDespesa.descricao,
        categoria: formDespesa.categoria,
        valor: valorNum,
        data: formDespesa.data,
        tipo: formDespesa.tipo,
        formaPagamento: formDespesa.formaPagamento,
        statusPagamento: formDespesa.statusPagamento,
        dataVencimento: formDespesa.dataVencimento,
        observacoes: formDespesa.observacoes,
        cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
      });
      exibirToast(`Gasto "${formDespesa.descricao}" cadastrado e integrado ao DRE!`);
    }

    setModalGastoAberto(false);
  }

  function handleExcluirGasto(id: string, descricao: string) {
    if (confirm(`Deseja realmente excluir o lançamento "${descricao}"?`)) {
      removerDespesaRestaurante(id);
      exibirToast(`Gasto "${descricao}" removido com sucesso.`);
    }
  }

  function exportarGastosCSV() {
    const cabecalho = ['ID', 'Data', 'Descrição', 'Categoria DRE', 'Linha DRE', 'Tipo', 'Forma Pagamento', 'Status', 'Valor (R$)', 'Cadastrado Por'];
    const linhas = despesasLivroCaixa.map((d) => [
      d.id,
      d.data,
      `"${d.descricao.replace(/"/g, '""')}"`,
      `"${CATEGORIAS_DRE[d.categoria]?.titulo || d.categoria}"`,
      `"${CATEGORIAS_DRE[d.categoria]?.linhaDRE || ''}"`,
      d.tipo,
      d.formaPagamento || 'pix',
      d.statusPagamento || 'pago',
      d.valor.toFixed(2),
      `"${d.cadastradoPor || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(','), ...linhas.map((l) => l.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gastos_financeiro_${tenantAtual.nomeFantasia.toLowerCase().replace(/\s+/g, '_')}_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exibirToast('Relatório de gastos exportado com sucesso para CSV!');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200 pb-12">
      {/* Toast Notification */}
      {toastNotificacao && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastNotificacao}</span>
        </div>
      )}

      {/* 1. Header Principal: Gestão Financeira, Notas Fiscais & DRE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
              Controle Financeiro, Fiscal & DRE
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Estabelecimento: <strong className={isWhite ? 'text-slate-900' : 'text-white'}>{tenantAtual.nomeFantasia}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-[#FF6B00]" />
            <span>Financeiro & DRE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            Central completa onde você adiciona tudo que é financeiro — de despesas diárias até <strong>Notas Fiscais (NF-e/NFC-e/XML)</strong> — com geração automática do DRE em tempo real.
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Seletor de Período */}
          <div className="relative">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer appearance-none pr-8 ${
                isWhite
                  ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  : 'bg-[#1E293B] border-slate-700 text-slate-200 hover:border-[#FF6B00]/50'
              }`}
            >
              <option value="hoje">📅 Hoje</option>
              <option value="7dias">📅 Últimos 7 dias</option>
              <option value="mes_atual">📅 Mês Atual</option>
              <option value="mes_anterior">📅 Mês Anterior</option>
              <option value="ano_atual">📅 Ano Atual</option>
              <option value="todos">📅 Todos os lançamentos</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Importar XML NF-e */}
          <button
            type="button"
            onClick={() => {
              setErroXml(null);
              setXmlPrevia(null);
              setXmlInputTexto('');
              setModalImportarXmlAberto(true);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-orange-50 border-orange-200 text-[#FF6B00] hover:bg-orange-100'
                : 'bg-[#FF6B00]/15 border-[#FF6B00]/40 text-orange-300 hover:bg-[#FF6B00]/25'
            }`}
            title="Importar arquivo XML da SEFAZ para alimentar o DRE instantaneamente"
          >
            <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Importar XML</span>
          </button>

          {/* Nova Nota Fiscal */}
          <button
            type="button"
            onClick={abrirModalNovaNF}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Lançar Nota Fiscal de Fornecedor ou Serviço"
          >
            <QrCode className="w-3.5 h-3.5 text-[#10B981]" />
            <span>+ Nota Fiscal</span>
          </button>

          {/* Botão Primário: Lançar Gasto */}
          <button
            type="button"
            onClick={abrirModalNovoGasto}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Lançar Gasto</span>
          </button>
        </div>
      </div>

      {/* 2. Cards Executivos de Resumo Financeiro & Fiscal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Faturamento Líquido (Entradas) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Receita Líquida (ROL)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#10B981]">
              R$ {dadosDRE.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>{dadosDRE.qtdVendasConcluidas} vendas PDV</span>
            <span>R$ {dadosDRE.totalVendasFiscaisNF.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em NFC-e</span>
          </div>
        </div>

        {/* Card 2: CMV e Compras com Nota Fiscal */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CMV & Insumos em NF
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              R$ {dadosDRE.cmvFinalDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="text-amber-400 font-bold">
              R$ {dadosDRE.totalComprasInsumosNF.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em NF-e Fornecedores
            </span>
            <span>Linha 4.0 DRE</span>
          </div>
        </div>

        {/* Card 3: Despesas Operacionais & NFS-e */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Gastos & Notas de Serviços
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-400">
              R$ {dadosDRE.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>Fixas + Variáveis</span>
            <span>R$ {dadosDRE.totalServicosNF.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em NFS-e</span>
          </div>
        </div>

        {/* Card 4: Lucro Líquido Real (Resultado DRE) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          dadosDRE.resultadoOperacionalReal >= 0
            ? isWhite
              ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
              : 'bg-emerald-950/20 border-emerald-500/40 text-white shadow-lg'
            : isWhite
            ? 'bg-rose-50/60 border-rose-300 text-slate-900 shadow-sm'
            : 'bg-rose-950/20 border-rose-500/40 text-white shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Resultado Líquido Real
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              dadosDRE.resultadoOperacionalReal >= 0
                ? 'bg-[#10B981]/20 text-[#10B981]'
                : 'bg-rose-500/20 text-rose-400'
            }`}>
              {dadosDRE.resultadoOperacionalReal >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-black font-mono ${
              dadosDRE.resultadoOperacionalReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'
            }`}>
              R$ {dadosDRE.resultadoOperacionalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-semibold">
            <span className={dadosDRE.resultadoOperacionalReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'}>
              Margem Líquida: {dadosDRE.margemLiquidaPct.toFixed(1)}%
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300">
              {dadosDRE.resultadoOperacionalReal >= 0 ? 'Lucro' : 'Prejuízo'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Atalhos Rápidos de Lançamento Simplificado em 1 Clique */}
      <div className={`p-4 rounded-2xl border ${
        isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Lançamento Rápido em 1 Clique</span>
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Clique no gasto frequente para abrir o formulário já pré-preenchido
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ATALHOS_LANCAMENTO_RAPIDO.map((atalho, idx) => {
            const Icone = atalho.icone;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => aplicarAtalhoRapido(atalho)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 group ${
                  isWhite
                    ? 'bg-slate-50 hover:bg-orange-50 border-slate-200 hover:border-orange-300'
                    : 'bg-[#0F172A] hover:bg-slate-800 border-slate-800 hover:border-[#FF6B00]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icone className={`w-4 h-4 ${atalho.cor} group-hover:scale-110 transition-transform`} />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">+ R$</span>
                </div>
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-white line-clamp-1">
                  {atalho.rotulo}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Sub-Abas de Navegação (Notas Fiscais vs Livro Caixa vs DRE vs Indicadores) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-Aba 1: Notas Fiscais */}
          <button
            type="button"
            onClick={() => setSubAba('notas_fiscais')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'notas_fiscais'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/25'
                : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Notas Fiscais & XML</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subAba === 'notas_fiscais' ? 'bg-white/20 !text-white' : 'bg-orange-500/20 text-[#FF6B00]'
            }`}>
              {notasFiscaisFiltradas.length}
            </span>
          </button>

          {/* Sub-Aba 2: Livro de Gastos */}
          <button
            type="button"
            onClick={() => setSubAba('gastos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'gastos'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/25'
                : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Livro Caixa & Gastos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subAba === 'gastos' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {despesasLivroCaixa.length}
            </span>
          </button>

          {/* Sub-Aba 3: DRE */}
          <button
            type="button"
            onClick={() => setSubAba('dre')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'dre'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/25'
                : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>DRE Demonstrativo Oficial</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#10B981] font-bold">
              Integrado
            </span>
          </button>

          {/* Sub-Aba 4: Indicadores */}
          <button
            type="button"
            onClick={() => setSubAba('indicadores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'indicadores'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/25'
                : isWhite
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Ponto de Equilíbrio & Top Produtos</span>
          </button>
        </div>

        {/* Ações Rápidas por Sub-aba */}
        <div className="flex items-center gap-2">
          {subAba === 'notas_fiscais' && (
            <button
              type="button"
              onClick={exportarNotasFiscaisCSV}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isWhite ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1E293B] border-slate-700 text-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Exportar NFs (CSV)</span>
            </button>
          )}

          {subAba === 'gastos' && (
            <button
              type="button"
              onClick={exportarGastosCSV}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                isWhite ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1E293B] border-slate-700 text-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Exportar Gastos (CSV)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              isWhite ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1E293B] border-slate-700 text-slate-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CENTRAL DE NOTAS FISCAIS & XML SEFAZ                                */}
      {/* ========================================================================= */}
      {subAba === 'notas_fiscais' && (
        <div className="space-y-4">
          {/* Banner Informativo de Integração com o DRE */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isWhite ? 'bg-orange-50/60 border-orange-200' : 'bg-[#FF6B00]/10 border-[#FF6B00]/30'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 font-bold shadow-lg shadow-[#FF6B00]/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Central Fiscal Inteligente • NF-e, NFC-e & NFS-e</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 uppercase font-mono">
                    Gera DRE Automático
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Importe XMLs da SEFAZ ou cadastre as notas fiscais de compras de fornecedores. O sistema extrai itens, valores e impostos, alimentando instantaneamente a <strong>Linha 4.0 (CMV)</strong> e as despesas do DRE.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSubAba('dre')}
                className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Ver Impacto no DRE</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setErroXml(null);
                  setXmlPrevia(null);
                  setXmlInputTexto('');
                  setModalImportarXmlAberto(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Importar XML SEFAZ</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas Fiscais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                🥩 Compras de Insumos (NF-e ➔ CMV)
              </span>
              <span className="text-lg font-black font-mono text-[#10B981]">
                R$ {dadosDRE.totalComprasInsumosNF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Alimenta Linha 4.0 do DRE</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                📦 Embalagens Delivery em NF
              </span>
              <span className="text-lg font-black font-mono text-purple-400">
                R$ {dadosDRE.totalEmbalagensNF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Alimenta Linha 6.3 Comercial</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                🛠️ Serviços Tomados (NFS-e)
              </span>
              <span className="text-lg font-black font-mono text-[#FF6B00]">
                R$ {dadosDRE.totalServicosNF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Alimenta Linha 6.4 Serviços</p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                ⚖️ Impostos Destacados em Notas
              </span>
              <span className="text-lg font-black font-mono text-amber-400">
                R$ {dadosDRE.totalImpostosNF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">ICMS, PIS, COFINS & ISS</p>
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Buscar por número da NF, fornecedor, CNPJ ou chave de acesso..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FF6B00]'
                    : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#FF6B00]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro por Tipo de NF */}
              <select
                value={filtroTipoNF}
                onChange={(e) => setFiltroTipoNF(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-slate-200'
                }`}
              >
                <option value="todas">Todos os Tipos de NF</option>
                <option value="entrada_insumos">🥩 Insumos / Compras (CMV)</option>
                <option value="entrada_embalagens">📦 Embalagens Delivery</option>
                <option value="entrada_servicos">🛠️ NFS-e Serviços Tomados</option>
                <option value="entrada_utilidades">💡 Utilidades (Luz, Gás)</option>
                <option value="saida_venda">📤 Saída: Vendas NFC-e</option>
              </select>

              {/* Filtro por Status */}
              <select
                value={filtroStatusNF}
                onChange={(e) => setFiltroStatusNF(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-slate-200'
                }`}
              >
                <option value="todas">Todos os Status</option>
                <option value="autorizada">Autorizadas SEFAZ</option>
                <option value="cancelada">Canceladas</option>
                <option value="pendente">Pendentes</option>
              </select>
            </div>
          </div>

          {/* Tabela de Notas Fiscais */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-4">Modelo / N° NF</th>
                    <th className="py-3 px-4">Emitente / Fornecedor</th>
                    <th className="py-3 px-4">Data Emissão</th>
                    <th className="py-3 px-4">Enquadramento DRE</th>
                    <th className="py-3 px-4">Impostos</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {notasFiscaisExibicao.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <QrCode className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
                          <p className="font-bold text-sm text-slate-300">Nenhuma Nota Fiscal encontrada</p>
                          <p className="text-xs text-slate-400">
                            Importe um arquivo XML da SEFAZ ou cadastre uma nova nota manualmente para alimentar o DRE.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    notasFiscaisExibicao.map((nf) => {
                      const cfgTipo = MAPA_TIPO_NF[nf.tipo] || MAPA_TIPO_NF.outros;
                      return (
                        <tr key={nf.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black font-mono border ${
                                nf.modelo === 'NFe_55'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : nf.modelo === 'NFCe_65'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                              }`}>
                                {nf.modelo.replace('_', ' ')}
                              </span>
                              <div>
                                <span className="font-mono font-bold text-white block">
                                  #{nf.numero} <span className="text-[10px] text-slate-500">Série {nf.serie || '1'}</span>
                                </span>
                                {nf.chaveAcesso && (
                                  <button
                                    type="button"
                                    onClick={() => copiarChave(nf.chaveAcesso)}
                                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono group"
                                    title="Clique para copiar os 44 dígitos da chave"
                                  >
                                    <span>{nf.chaveAcesso.slice(0, 6)}...{nf.chaveAcesso.slice(-4)}</span>
                                    <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-white text-xs truncate max-w-[220px]">
                              {nf.emitenteRazaoSocial}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              CNPJ: {nf.emitenteCnpjCpf}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                            {nf.dataEmissao.split('-').reverse().join('/')}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border inline-block ${cfgTipo.badgeCor}`}>
                              {cfgTipo.linhaDRE}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                            {nf.valorIcms ? (
                              <span className="text-slate-300">
                                ICMS: <strong className="text-amber-400">R$ {nf.valorIcms.toFixed(2)}</strong>
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-sm text-white">
                            R$ {nf.valorTotalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              nf.status === 'autorizada'
                                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                                : nf.status === 'cancelada'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {nf.status === 'autorizada' ? 'Autorizada' : nf.status === 'cancelada' ? 'Cancelada' : 'Pendente'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirDanfe(nf)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Visualizar DANFE & Detalhes da Nota"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirModalEditarNF(nf)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Editar Nota Fiscal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirNF(nf.id, nf.numero)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remover Nota Fiscal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: LIVRO DE GASTOS & DESPESAS                                          */}
      {/* ========================================================================= */}
      {subAba === 'gastos' && (
        <div className="space-y-4">
          {/* Filtros e Busca de Despesas */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Buscar por descrição da despesa ou categoria contábil..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#FF6B00]'
                    : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#FF6B00]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-slate-200'
                }`}
              >
                <option value="todas">Todas as Categorias</option>
                <option value="ocupacao">🏠 Ocupação & Utilidades (6.2)</option>
                <option value="pessoal">👥 Equipe & Pessoal (6.1)</option>
                <option value="servicos">✨ Serviços & Sistemas (6.4)</option>
                <option value="insumos">🥦 Insumos Avulsos (CMV 4.0)</option>
                <option value="financeiro">🛵 Comercial & Embalagens (6.3)</option>
                <option value="outros">📦 Outras Despesas (6.5)</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-slate-200'
                }`}
              >
                <option value="todos">Status: Todos</option>
                <option value="pago">✅ Pagos</option>
                <option value="pendente">⏳ Pendentes (A Pagar)</option>
              </select>
            </div>
          </div>

          {/* Tabela do Livro de Despesas */}
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição do Gasto</th>
                    <th className="py-3 px-4">Categoria / Linha DRE</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Pagamento</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Valor (R$)</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {despesasLivroCaixa.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        Nenhum lançamento de gasto encontrado para o filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    despesasLivroCaixa.map((desp) => {
                      const catInfo = CATEGORIAS_DRE[desp.categoria] || CATEGORIAS_DRE.outros;
                      const IconeCat = catInfo.icone;
                      const isPago = desp.statusPagamento !== 'pendente';

                      return (
                        <tr key={desp.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                            {desp.data.split('-').reverse().join('/')}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{desp.descricao}</span>
                              {desp.numeroNotaFiscal && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono font-bold">
                                  NF #{desp.numeroNotaFiscal}
                                </span>
                              )}
                            </div>
                            {desp.observacoes && (
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{desp.observacoes}</p>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <IconeCat className={`w-3.5 h-3.5 ${catInfo.corIcone}`} />
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${catInfo.corBadge}`}>
                                {catInfo.linhaDRE}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              desp.tipo === 'fixa'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {desp.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px] uppercase">
                            {desp.formaPagamento || 'pix'}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => alternarStatusPagamentoDespesa(desp.id)}
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                isPago
                                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                              }`}
                              title="Clique para alternar entre Pago e Pendente"
                            >
                              {isPago ? 'Pago ✅' : 'Pendente ⏳'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-rose-400 text-sm">
                            - R$ {desp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirModalEditarGasto(desp)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Editar Lançamento"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirGasto(desp.id, desp.descricao)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: DRE DEMONSTRATIVO OFICIAL INTEGRADO COM NOTAS FISCAIS              */}
      {/* ========================================================================= */}
      {subAba === 'dre' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>DRE Operacional — {tenantAtual.nomeFantasia}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono font-bold">
                    Integrado com {dadosDRE.qtdNotasFiscais} Notas Fiscais
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Período: <strong className="text-slate-200 uppercase">{periodo.replace('_', ' ')}</strong> • Apuração contábil em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono hidden sm:inline">
                Margem Líquida:
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono border ${
                dadosDRE.resultadoOperacionalReal >= 0
                  ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {dadosDRE.margemLiquidaPct.toFixed(1)}% ROL
              </span>
            </div>
          </div>

          {/* Tabela do DRE Linha a Linha */}
          <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-4">Linha do DRE</th>
                    <th className="py-3 px-4">Origem / Composição Fiscal & Caixa</th>
                    <th className="py-3 px-4 text-right">Valor Acumulado</th>
                    <th className="py-3 px-4 text-right">% Receita (ROL)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${isWhite ? 'divide-slate-100' : 'divide-slate-800/70'}`}>
                  {/* 1. Receita Bruta */}
                  <tr className="bg-slate-900/30">
                    <td className="py-3 px-4 font-sans font-black text-white text-xs">
                      1. (+) RECEITA OPERACIONAL BRUTA
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Salão (R$ {dadosDRE.vendasMesas.toFixed(0)}) • Delivery (R$ {dadosDRE.vendasDelivery.toFixed(0)}) • Balcão (R$ {dadosDRE.vendasBalcao.toFixed(0)}) + NFC-e Emitidas
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white text-xs">
                      R$ {dadosDRE.receitaBrutaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      -
                    </td>
                  </tr>

                  {/* 2. Deduções e Impostos Fiscais */}
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-300 pl-8">
                      2. (-) Deduções da Receita & Tributos
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Descontos/Estornos (R$ {dadosDRE.totalDescontos.toFixed(2)}) + Impostos em Notas (R$ {dadosDRE.impostosSobreVenda.toFixed(2)})
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.totalDeducoesReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalDeducoesReceita / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 3. Receita Líquida */}
                  <tr className="bg-[#10B981]/5 border-y border-[#10B981]/20">
                    <td className="py-3 px-4 font-sans font-black text-[#10B981] text-xs">
                      3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Base contábil líquida para apuração de todos os indicadores
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#10B981] text-sm">
                      R$ {dadosDRE.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#10B981]">
                      100.0%
                    </td>
                  </tr>

                  {/* 4. CMV */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-rose-400 pl-8">
                      4. (-) CMV (Custo das Mercadorias Vendidas)
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      <span className="font-bold text-amber-400">
                        🏷️ Inclui R$ {dadosDRE.totalComprasInsumosNF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em Compras com NF-e de Fornecedores
                      </span> + Ficha Técnica de pratos
                    </td>
                    <td className="py-3 px-4 text-right text-rose-400 font-bold">
                      - R$ {dadosDRE.cmvFinalDRE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.cmvFinalDRE / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 5. Lucro Bruto */}
                  <tr className="bg-slate-900/40">
                    <td className="py-3 px-4 font-sans font-black text-white text-xs">
                      5. (=) LUCRO BRUTO (MARGEM DE CONTRIBUIÇÃO)
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Sobra operacional para pagamento de todas as despesas fixas da casa
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white text-sm">
                      R$ {dadosDRE.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#10B981]">
                      {dadosDRE.margemBrutaPct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* 6. Despesas Operacionais */}
                  <tr className="bg-slate-950/20">
                    <td colSpan={4} className="py-2 px-4 font-sans font-black text-slate-400 uppercase text-[10px] tracking-wider">
                      6. (-) DESPESAS OPERACIONAIS FIXAS & VARIÁVEIS
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                      6.1 Despesas com Pessoal & Equipe
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Salários, diárias de garçons/extras e adiantamentos
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasPessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasPessoal / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                      6.2 Ocupação & Utilidades
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Aluguel, Luz, Água e Gás de Cozinha (inclui faturas e NFs)
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasOcupacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasOcupacao / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                      6.3 Comercial, Embalagens & Vendas
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Embalagens delivery (R$ {dadosDRE.totalEmbalagensNF.toFixed(2)} em NF) + Taxas de Cartão
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasComerciais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasComerciais / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                      6.4 Serviços, TI & Manutenção
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      NFS-e de Serviços Tomados (R$ {dadosDRE.totalServicosNF.toFixed(2)}) + Sistema eloGastrô e limpeza
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasServicos / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                      6.5 Outras Despesas Operacionais
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Imprevistos gerais, taxas de alvará e material de escritório
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.outrasDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.outrasDespesas / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 7. Resultado Líquido Final */}
                  <tr className={`border-t-2 font-black ${
                    dadosDRE.resultadoOperacionalReal >= 0
                      ? 'bg-[#10B981]/15 text-[#10B981]'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    <td className="py-4 px-4 font-sans text-sm">
                      7. (=) RESULTADO LÍQUIDO REAL DO RESTAURANTE
                    </td>
                    <td className="py-4 px-4 font-sans text-[11px]">
                      {dadosDRE.resultadoOperacionalReal >= 0
                        ? '🎉 Lucro Líquido Real gerado pela operação no período'
                        : '⚠️ Prejuízo Operacional verificado no período'}
                    </td>
                    <td className="py-4 px-4 text-right text-base font-black">
                      R$ {dadosDRE.resultadoOperacionalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-black">
                      {dadosDRE.margemLiquidaPct.toFixed(1)}% ROL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: DISTRIBUIÇÃO & PONTO DE EQUILÍBRIO                                  */}
      {/* ========================================================================= */}
      {subAba === 'indicadores' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ponto de Equilíbrio (Break-Even) */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ponto de Equilíbrio Operacional</h3>
                  <p className="text-xs text-slate-400">Meta mínima de faturamento para cobrir todos os custos</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Faturamento Mínimo Necessário:</span>
                <p className="text-2xl font-black font-mono text-[#FF6B00]">
                  R$ {dadosDRE.pontoEquilibrioFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Custos Fixos Mensais:</span>
                  <strong className="text-slate-200 font-mono">
                    R$ {dadosDRE.custosFixosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Meta Atingida no Período:</span>
                  <span className="font-mono text-[#10B981]">
                    {dadosDRE.pontoEquilibrioFinanceiro > 0
                      ? ((dadosDRE.receitaLiquida / dadosDRE.pontoEquilibrioFinanceiro) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-[#10B981] transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        dadosDRE.pontoEquilibrioFinanceiro > 0
                          ? (dadosDRE.receitaLiquida / dadosDRE.pontoEquilibrioFinanceiro) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Top 5 Produtos Mais Lucrativos */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Top 5 Produtos Mais Rentáveis</h3>
                  <p className="text-xs text-slate-400">Itens com maior margem de contribuição no caixa</p>
                </div>
              </div>

              <div className="space-y-2">
                {dadosDRE.topProdutosRentaveis.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Nenhuma venda registrada no período selecionado.</p>
                ) : (
                  dadosDRE.topProdutosRentaveis.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] font-black text-[10px] flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{prod.nome}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{prod.quantidade} unidades vendidas</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-[#10B981] block">
                          + R$ {prod.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Margem: {prod.receita > 0 ? ((prod.lucro / prod.receita) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: IMPORTAR ARQUIVO XML DA SEFAZ                                     */}
      {/* ========================================================================= */}
      {modalImportarXmlAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Importar XML de Nota Fiscal (SEFAZ)</h3>
                  <p className="text-[11px] text-slate-400">Leitura instantânea de NF-e (Modelo 55) e NFC-e para o DRE</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalImportarXmlAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Área de Seleção de Arquivo XML */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-[#FF6B00] bg-[#0F172A] rounded-2xl p-6 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleUploadArquivoXml}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-[#FF6B00] mx-auto mb-2 transition-colors" />
              <p className="text-xs font-bold text-white">
                {nomeArquivoXmlSelecionado ? (
                  <span className="text-[#10B981] font-mono">Arquivo: {nomeArquivoXmlSelecionado}</span>
                ) : (
                  'Clique ou arraste um arquivo XML de NF-e (.xml)'
                )}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Compatível com notas fiscais de fornecedores emitidas pela SEFAZ</p>
            </div>

            {/* Ou Colar Conteúdo do XML */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Ou cole o texto XML da Nota Fiscal abaixo:
              </label>
              <textarea
                value={xmlInputTexto}
                onChange={(e) => {
                  setXmlInputTexto(e.target.value);
                  if (e.target.value.trim()) processarXmlTexto(e.target.value);
                }}
                rows={4}
                placeholder="<nfeProc xmlns=...><NFe>...</NFe></nfeProc>"
                className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Mensagem de Erro se houver */}
            {erroXml && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroXml}</span>
              </div>
            )}

            {/* Pré-visualização da Nota Decodificada */}
            {xmlPrevia && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#10B981]/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Nota Fiscal Decodificada com Sucesso!</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    NF #{xmlPrevia.numero} • Série {xmlPrevia.serie || '1'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Emitente:</span>
                    <strong className="text-white font-sans text-xs truncate block">{xmlPrevia.emitenteRazaoSocial}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Data Emissão:</span>
                    <strong className="text-white font-mono">{xmlPrevia.dataEmissao}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Linha DRE:</span>
                    <strong className="text-[#10B981] font-sans text-xs">{MAPA_TIPO_NF[xmlPrevia.tipo]?.linhaDRE}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Valor Total:</span>
                    <strong className="text-lg font-black font-mono text-[#10B981]">
                      R$ {xmlPrevia.valorTotalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Itens da NF se houver */}
                {xmlPrevia.itens && xmlPrevia.itens.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Itens extraídos: <strong>{xmlPrevia.itens.length} produto(s)</strong> (ex: {xmlPrevia.itens[0].descricao})</span>
                  </div>
                )}
              </div>
            )}

            {/* Botões do Modal */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setModalImportarXmlAberto(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!xmlPrevia}
                onClick={confirmarImportacaoXml}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer"
              >
                Confirmar & Alimentar DRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LANÇAR / EDITAR NOTA FISCAL MANUALMENTE                          */}
      {/* ========================================================================= */}
      {modalNFAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {nfEmEdicaoId ? 'Editar Nota Fiscal' : 'Lançar Nota Fiscal Manualmente'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Preencha os dados da nota fiscal de compra, serviço ou venda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNFAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNF} className="space-y-3.5">
              {/* Modelo e Tipo / Enquadramento DRE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Modelo do Documento Fiscal *
                  </label>
                  <select
                    value={formNF.modelo}
                    onChange={(e) => setFormNF({ ...formNF, modelo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="NFe_55">NF-e (Mod. 55 - Compra de Fornecedor / Atacado)</option>
                    <option value="NFCe_65">NFC-e (Mod. 65 - Venda Consumidor Final)</option>
                    <option value="NFSe_servico">NFS-e (Nota de Serviços Tomados)</option>
                    <option value="CF_e_SAT">CF-e SAT / Cupom Fiscal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tipo & Linha no DRE *
                  </label>
                  <select
                    value={formNF.tipo}
                    onChange={(e) => setFormNF({ ...formNF, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="entrada_insumos">🥩 Entrada: Compras de Insumos & Carnes (CMV 4.0)</option>
                    <option value="entrada_embalagens">📦 Entrada: Embalagens Delivery (Comercial 6.3)</option>
                    <option value="entrada_servicos">🛠️ Entrada: NFS-e Serviços Tomados (Serviços 6.4)</option>
                    <option value="entrada_utilidades">💡 Entrada: Contas / Utilidades (Ocupação 6.2)</option>
                    <option value="entrada_equipamento">🍳 Entrada: Equipamentos & Ativo Imobilizado</option>
                    <option value="saida_venda">📤 Saída: Vendas Fiscais (Receita Bruta 1.0)</option>
                  </select>
                </div>
              </div>

              {/* Número, Série e Chave de Acesso */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Número da NF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNF.numero}
                    onChange={(e) => setFormNF({ ...formNF, numero: e.target.value })}
                    placeholder="Ex: 000184"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Série
                  </label>
                  <input
                    type="text"
                    value={formNF.serie}
                    onChange={(e) => setFormNF({ ...formNF, serie: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Data Emissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={formNF.dataEmissao}
                    onChange={(e) => setFormNF({ ...formNF, dataEmissao: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Chave de Acesso (44 dígitos) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Chave de Acesso da NF-e (44 Dígitos)
                  </label>
                  <button
                    type="button"
                    onClick={gerarChaveAcessoAleatoria}
                    className="text-[10px] text-[#FF6B00] hover:underline font-bold"
                  >
                    Gerar Chave de Teste
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={44}
                  value={formNF.chaveAcesso}
                  onChange={(e) => setFormNF({ ...formNF, chaveAcesso: e.target.value.replace(/\D/g, '') })}
                  placeholder="35261012345678000195550010000001841000001840"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white tracking-widest focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* Fornecedor / Razão Social e CNPJ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Razão Social do Emitente / Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNF.emitenteRazaoSocial}
                    onChange={(e) => setFormNF({ ...formNF, emitenteRazaoSocial: e.target.value })}
                    placeholder="Ex: FRIGORIFICO BOI GORDO ALIMENTOS S/A"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    CNPJ ou CPF do Emitente *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNF.emitenteCnpjCpf}
                    onChange={(e) => setFormNF({ ...formNF, emitenteCnpjCpf: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Valores e Impostos */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Valor Total da NF *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                    <input
                      type="text"
                      required
                      value={formNF.valorTotalNota}
                      onChange={(e) => setFormNF({ ...formNF, valorTotalNota: e.target.value })}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    ICMS Destacado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">R$</span>
                    <input
                      type="text"
                      value={formNF.valorIcms}
                      onChange={(e) => setFormNF({ ...formNF, valorIcms: e.target.value })}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Status na SEFAZ
                  </label>
                  <select
                    value={formNF.status}
                    onChange={(e) => setFormNF({ ...formNF, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="autorizada">✅ Autorizada</option>
                    <option value="pendente">⏳ Pendente</option>
                    <option value="cancelada">❌ Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Checkbox inteligente: Lançar no Livro Caixa */}
              {!nfEmEdicaoId && formNF.tipo !== 'saida_venda' && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNF.lancarNoLivroCaixa}
                    onChange={(e) => setFormNF({ ...formNF, lancarNoLivroCaixa: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B00] rounded focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Lançar também como despesa no <strong>Livro Caixa</strong> (Contas Pagas)
                  </span>
                </label>
              )}

              {/* Botões do Modal */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalNFAberto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer"
                >
                  {nfEmEdicaoId ? 'Salvar Alterações' : 'Confirmar & Lançar no DRE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VISUALIZADOR DE DANFE / DETALHES DA NOTA FISCAL                  */}
      {/* ========================================================================= */}
      {modalDanfeAberto && nfVisualizando && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    DANFE Simplificado • Documento Fiscal Eletrônico
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {nfVisualizando.modelo.replace('_', ' ')} — N° {nfVisualizando.numero} (Série {nfVisualizando.serie || '1'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDanfeAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chave de Acesso Formatada */}
            {nfVisualizando.chaveAcesso && (
              <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Chave de Acesso SEFAZ (44 Dígitos):</span>
                  <p className="font-mono text-xs font-bold text-[#10B981] tracking-widest break-all">
                    {nfVisualizando.chaveAcesso}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copiarChave(nfVisualizando.chaveAcesso)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            )}

            {/* Dados do Emitente e Destinatário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#FF6B00]" />
                  <span>Emitente / Fornecedor:</span>
                </span>
                <p className="font-bold text-white text-sm">{nfVisualizando.emitenteRazaoSocial}</p>
                <p className="text-slate-400 font-mono text-[11px]">CNPJ: {nfVisualizando.emitenteCnpjCpf}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Store className="w-3 h-3 text-[#10B981]" />
                  <span>Destinatário:</span>
                </span>
                <p className="font-bold text-white text-sm">{nfVisualizando.destinatarioRazaoSocial || tenantAtual.nomeFantasia}</p>
                <p className="text-slate-400 font-mono text-[11px]">CNPJ: {nfVisualizando.destinatarioCnpjCpf || tenantAtual.documento || '11.222.333/0001-44'}</p>
              </div>
            </div>

            {/* Tabela de Itens da NF se houver */}
            {nfVisualizando.itens && nfVisualizando.itens.length > 0 ? (
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-[#0F172A] px-3.5 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-300">
                  Produtos / Mercadorias da Nota Fiscal ({nfVisualizando.itens.length})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800">
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3">Qtd</th>
                        <th className="py-2 px-3 text-right">Preço Unit</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {nfVisualizando.itens.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-sans text-white font-medium">
                            {item.descricao}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {item.quantidade} {item.unidade}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">
                            R$ {item.valorUnitario.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-[#10B981]">
                            R$ {item.valorTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#0F172A] text-xs text-slate-400">
                Nenhum detalhamento individual de itens gravado para esta nota.
              </div>
            )}

            {/* Totais do DANFE */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Enquadramento Contábil:</span>
                <strong className="text-[#10B981] font-bold text-sm block">
                  {MAPA_TIPO_NF[nfVisualizando.tipo]?.linhaDRE}
                </strong>
                {nfVisualizando.valorIcms ? (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ICMS destacado: R$ {nfVisualizando.valorIcms.toFixed(2)}
                  </span>
                ) : null}
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-xs block">Valor Total do Documento:</span>
                <span className="text-2xl font-black font-mono text-[#10B981]">
                  R$ {nfVisualizando.valorTotalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Fechar */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setModalDanfeAberto(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LANÇAR / EDITAR GASTO SIMPLIFICADO NO LIVRO CAIXA                */}
      {/* ========================================================================= */}
      {modalGastoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {gastoEmEdicaoId ? 'Editar Despesa' : 'Novo Lançamento de Gasto'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Classificação simplificada que se enquadra no DRE</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalGastoAberto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarGasto} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Descrição do Gasto / Fornecedor *
                </label>
                <input
                  type="text"
                  required
                  value={formDespesa.descricao}
                  onChange={(e) => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
                  placeholder="Ex: Conta de Energia Elétrica (Luz) - Cemig"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Categoria Contábil (Linha DRE) *
                </label>
                <select
                  value={formDespesa.categoria}
                  onChange={(e) => setFormDespesa({ ...formDespesa, categoria: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="ocupacao">🏠 Ocupação & Utilidades (Aluguel, Luz, Água, Gás) ➔ Linha 6.2</option>
                  <option value="pessoal">👥 Equipe & Pessoal (Salários, Diárias, Pró-Labore) ➔ Linha 6.1</option>
                  <option value="servicos">✨ Serviços, Sistemas & Limpeza (eloGastrô, Internet) ➔ Linha 6.4</option>
                  <option value="insumos">🥦 Insumos Avulsos & Feira (Carvão, Feira, Gelo) ➔ Linha 4.0 CMV</option>
                  <option value="financeiro">🛵 Comercial & Embalagens (Embalagens delivery) ➔ Linha 6.3</option>
                  <option value="outros">📦 Outras Despesas Operacionais ➔ Linha 6.5</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Valor do Gasto (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={formDespesa.valor}
                      onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Data da Despesa *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDespesa.data}
                    onChange={(e) => setFormDespesa({ ...formDespesa, data: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Forma Pagamento
                  </label>
                  <select
                    value={formDespesa.formaPagamento}
                    onChange={(e) => setFormDespesa({ ...formDespesa, formaPagamento: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="cartao">Cartão</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="transferencia">TED / DOC</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Tipo de Custo
                  </label>
                  <select
                    value={formDespesa.tipo}
                    onChange={(e) => setFormDespesa({ ...formDespesa, tipo: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="fixa">Fixa (Mensal)</option>
                    <option value="variavel">Variável (Eventual)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Status Atual
                  </label>
                  <select
                    value={formDespesa.statusPagamento}
                    onChange={(e) => setFormDespesa({ ...formDespesa, statusPagamento: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="pago">✅ Já Pago</option>
                    <option value="pendente">⏳ A Pagar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalGastoAberto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/30 transition-all cursor-pointer"
                >
                  {gastoEmEdicaoId ? 'Salvar Alterações' : 'Confirmar & Lançar no DRE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
