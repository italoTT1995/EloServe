import React, { useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Printer,
  AlertCircle,
  CheckCircle2,
  Store,
  Receipt,
  Package,
  Layers,
  Sparkles,
  ChevronDown,
  Download,
  X,
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
  Upload,
  FileText,
  Copy,
  Eye,
  Building2,
  FileCheck,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
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
type SubAbaFinanceiro = 'notas_fiscais' | 'gastos' | 'dre';

// Categorias que se enquadram no DRE
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
  insumos: {
    titulo: 'Insumos Avulsos & Feira',
    linhaDRE: '4.0 CMV - Custo Direto da Operação',
    descricao: 'Compras de insumos, hortifruti, gelo e temperos.',
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    corIcone: 'text-emerald-400',
    icone: Apple,
  },
  pessoal: {
    titulo: 'Equipe & Pessoal',
    linhaDRE: '6.1 Despesas com Pessoal Operacional',
    descricao: 'Salários, diárias extras de garçom/cozinha e vales.',
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    corIcone: 'text-blue-400',
    icone: Users,
  },
  ocupacao: {
    titulo: 'Ocupação & Utilidades',
    linhaDRE: '6.2 Despesas Fixas de Ocupação',
    descricao: 'Aluguel do imóvel, Energia elétrica (luz), Água/esgoto e Gás de cozinha.',
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    corIcone: 'text-amber-400',
    icone: Store,
  },
  financeiro: {
    titulo: 'Comercial & Embalagens',
    linhaDRE: '6.3 Despesas Comerciais & Embalagens',
    descricao: 'Embalagens para delivery e despesas de vendas.',
    corBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    corIcone: 'text-purple-400',
    icone: Bike,
  },
  servicos: {
    titulo: 'Serviços, Sistemas & Manutenção',
    linhaDRE: '6.4 Serviços, TI & Manutenção',
    descricao: 'Software de gestão eloGastrô, internet, limpeza e consertos.',
    corBadge: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30',
    corIcone: 'text-[#FF6B00]',
    icone: Sparkles,
  },
  outros: {
    titulo: 'Outras Despesas Operacionais',
    linhaDRE: '6.5 Outras Despesas Gerais',
    descricao: 'Imprevistos e despesas gerais diversas.',
    corBadge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    corIcone: 'text-slate-400',
    icone: Layers,
  },
};

export const MAPA_TIPO_NF: Record<
  TipoNotaFiscal,
  {
    rotulo: string;
    direcao: 'entrada' | 'saida';
    linhaDRE: string;
    badgeCor: string;
  }
> = {
  entrada_insumos: {
    rotulo: 'Entrada: Compras & Insumos',
    direcao: 'entrada',
    linhaDRE: '4.0 CMV (Custo das Mercadorias)',
    badgeCor: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  },
  entrada_embalagens: {
    rotulo: 'Entrada: Embalagens Delivery',
    direcao: 'entrada',
    linhaDRE: '6.3 Despesas Comerciais & Embalagens',
    badgeCor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  entrada_servicos: {
    rotulo: 'Entrada: NFS-e Serviços Tomados',
    direcao: 'entrada',
    linhaDRE: '6.4 Serviços, TI & Manutenção',
    badgeCor: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30',
  },
  entrada_utilidades: {
    rotulo: 'Entrada: Utilidades (Luz, Gás)',
    direcao: 'entrada',
    linhaDRE: '6.2 Ocupação & Utilidades',
    badgeCor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  entrada_equipamento: {
    rotulo: 'Entrada: Equipamentos & Ativo',
    direcao: 'entrada',
    linhaDRE: '6.5 Imobilizado / Outras',
    badgeCor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  saida_venda: {
    rotulo: 'Saída: NFC-e / Venda Consumidor',
    direcao: 'saida',
    linhaDRE: '1.0 Receita Operacional Bruta',
    badgeCor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  outros: {
    rotulo: 'Outros Documentos Fiscais',
    direcao: 'entrada',
    linhaDRE: '6.5 Outras Despesas',
    badgeCor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
};

const CATEGORIAS_PREENCHIMENTO_RAPIDO = [
  { rotulo: 'Luz (Energia)', descricao: 'Conta de Energia Elétrica', categoria: 'ocupacao' as const, tipo: 'variavel' as const, icone: Lightbulb, cor: 'text-amber-400' },
  { rotulo: 'Água / Esgoto', descricao: 'Conta de Água e Saneamento', categoria: 'ocupacao' as const, tipo: 'variavel' as const, icone: Droplet, cor: 'text-blue-400' },
  { rotulo: 'Aluguel do Ponto', descricao: 'Aluguel Comercial do Imóvel', categoria: 'ocupacao' as const, tipo: 'fixa' as const, icone: Store, cor: 'text-amber-400' },
  { rotulo: 'Gás de Cozinha', descricao: 'Botijão / Recarga de Gás', categoria: 'ocupacao' as const, tipo: 'variavel' as const, icone: Flame, cor: 'text-orange-400' },
  { rotulo: 'Diária Garçom / Free', descricao: 'Diária de Freelancer / Apoio de Turno', categoria: 'pessoal' as const, tipo: 'variavel' as const, icone: Users, cor: 'text-blue-400' },
  { rotulo: 'Embalagens Delivery', descricao: 'Embalagens térmicas e sacolas', categoria: 'financeiro' as const, tipo: 'variavel' as const, icone: Bike, cor: 'text-purple-400' },
  { rotulo: 'Feira & Hortifrúti', descricao: 'Legumes, Verduras e Temperos', categoria: 'insumos' as const, tipo: 'variavel' as const, icone: Apple, cor: 'text-emerald-400' },
  { rotulo: 'Limpeza & Higiene', descricao: 'Produtos de Limpeza e Sanitização', categoria: 'servicos' as const, tipo: 'variavel' as const, icone: Sparkles, cor: 'text-[#FF6B00]' },
];

interface FinanceiroProps {
  tenantIdInicial?: string;
  isEmbedded?: boolean;
}

export default function Financeiro({ tenantIdInicial, isEmbedded = false }: FinanceiroProps) {
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { usuarioLogado } = useAuthStore();
  const { tenants } = useSaaSStore();

  // O Admin Master pode escolher qualquer restaurante
  const [tenantSelecionadoId, setTenantSelecionadoId] = useState<string>(
    tenantIdInicial || (tenants.length > 0 ? tenants[0].id : 'tenant-01')
  );

  const restauranteAtual = useMemo(() => {
    return tenants.find((t) => t.id === tenantSelecionadoId) || {
      id: tenantSelecionadoId,
      nomeFantasia: 'Restaurante Selecionado',
      documento: '11.222.333/0001-44',
      cidadeUf: 'Brasil',
    };
  }, [tenants, tenantSelecionadoId]);

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

  // Estados locais
  const [subAba, setSubAba] = useState<SubAbaFinanceiro>('notas_fiscais');
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes_atual');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [filtroTipoNF, setFiltroTipoNF] = useState<string>('todas');

  // Modais
  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [gastoEmEdicaoId, setGastoEmEdicaoId] = useState<string | null>(null);
  const [modalNFAberto, setModalNFAberto] = useState(false);
  const [modalImportarXmlAberto, setModalImportarXmlAberto] = useState(false);
  const [modalDanfeAberto, setModalDanfeAberto] = useState(false);
  const [nfVisualizando, setNfVisualizando] = useState<NotaFiscalRegistro | null>(null);
  const [nfEmEdicaoId, setNfEmEdicaoId] = useState<string | null>(null);

  // XML Import
  const [xmlInputTexto, setXmlInputTexto] = useState('');
  const [nomeArquivoXmlSelecionado, setNomeArquivoXmlSelecionado] = useState('');
  const [erroXml, setErroXml] = useState<string | null>(null);
  const [xmlPrevia, setXmlPrevia] = useState<Omit<NotaFiscalRegistro, 'id' | 'criadoEm'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);

  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => setToastNotificacao(null), 4000);
  }

  // Form State: Despesa
  const [formDespesa, setFormDespesa] = useState<{
    descricao: string;
    categoria: DespesaOperacionalRestaurante['categoria'];
    valor: string;
    data: string;
    tipo: 'fixa' | 'variavel';
    formaPagamento: 'pix' | 'dinheiro' | 'boleto' | 'transferencia' | 'cartao';
    statusPagamento: 'pago' | 'pendente';
    observacoes?: string;
  }>({
    descricao: '',
    categoria: 'ocupacao',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'fixa',
    formaPagamento: 'pix',
    statusPagamento: 'pago',
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
    dataEmissao: string;
    valorTotalProdutos: string;
    valorFrete: string;
    valorTotalNota: string;
    valorIcms: string;
    status: StatusNotaFiscal;
    observacoes: string;
  }>({
    numero: '',
    serie: '1',
    chaveAcesso: '',
    modelo: 'NFe_55',
    tipo: 'entrada_insumos',
    emitenteRazaoSocial: '',
    emitenteCnpjCpf: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    valorTotalProdutos: '',
    valorFrete: '0',
    valorTotalNota: '',
    valorIcms: '0',
    status: 'autorizada',
    observacoes: '',
  });

  // Carrega vendas, despesas e notas fiscais reais do restaurante selecionado
  const todasVendasLoja = getVendasPorTenant(tenantSelecionadoId);
  const todasDespesasLoja = getDespesasPorTenant(tenantSelecionadoId);
  const todasNotasFiscaisLoja = getNotasFiscaisPorTenant(tenantSelecionadoId);

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

    if (filtro === 'hoje') return dia === hojeDia && mes === hojeMes && ano === hojeAno;
    if (filtro === '7dias') {
      const dataItem = new Date(ano, mes - 1, dia);
      const diffMs = agora.getTime() - dataItem.getTime();
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      return diffDias >= -1 && diffDias <= 7;
    }
    if (filtro === 'mes_atual') return mes === hojeMes && ano === hojeAno;
    if (filtro === 'mes_anterior') {
      const mesAnt = hojeMes === 1 ? 12 : hojeMes - 1;
      const anoAnt = hojeMes === 1 ? hojeAno - 1 : hojeAno;
      return mes === mesAnt && ano === anoAnt;
    }
    if (filtro === 'ano_atual') return ano === hojeAno;
    return true;
  }

  const vendasFiltradas = useMemo(() => {
    return todasVendasLoja.filter((v) => dataPertenceAoPeriodo(v.dataHora, periodo));
  }, [todasVendasLoja, periodo]);

  const despesasFiltradas = useMemo(() => {
    return todasDespesasLoja.filter((d) => dataPertenceAoPeriodo(d.data, periodo));
  }, [todasDespesasLoja, periodo]);

  const notasFiscaisFiltradas = useMemo(() => {
    return todasNotasFiscaisLoja.filter((n) => dataPertenceAoPeriodo(n.dataEmissao, periodo));
  }, [todasNotasFiscaisLoja, periodo]);

  // Despesas da visualização do Livro
  const despesasLivroExibicao = useMemo(() => {
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

  // Notas Fiscais com busca e filtro
  const notasFiscaisExibicao = useMemo(() => {
    return notasFiscaisFiltradas.filter((n) => {
      const matchBusca =
        !buscaTexto ||
        n.numero.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        n.emitenteRazaoSocial.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (n.chaveAcesso && n.chaveAcesso.toLowerCase().includes(buscaTexto.toLowerCase()));
      const matchTipo = filtroTipoNF === 'todas' || n.tipo === filtroTipoNF;
      return matchBusca && matchTipo;
    });
  }, [notasFiscaisFiltradas, buscaTexto, filtroTipoNF]);

  // CÁLCULO DIRETO E LIMPO DO DRE OFICIAL
  const dadosDRE = useMemo(() => {
    let receitaBrutaVendas = 0;
    let totalDescontos = 0;
    let totalCancelamentos = 0;
    let cmvFichaTecnica = 0;

    vendasFiltradas.forEach((venda) => {
      const valorBruto = venda.subtotalBruto || (venda.total + (venda.desconto || 0));
      receitaBrutaVendas += valorBruto;

      if (venda.status === 'cancelada') {
        totalCancelamentos += valorBruto;
        return;
      }

      totalDescontos += venda.desconto || 0;

      venda.itens.forEach((item) => {
        const ficha = fichasTecnicas.find(
          (f) => f.produtoId === item.produtoId || f.nomePrato.toLowerCase() === item.nome.toLowerCase()
        );
        let custoUn = ficha?.custoTotalEstimado || 0;
        if (!custoUn) {
          const itemEst = itensEstoque.find((e) => e.id === item.produtoId || e.nome.toLowerCase() === item.nome.toLowerCase());
          custoUn = itemEst?.precoCusto || (item.precoUnitario || 0) * 0.30;
        }
        cmvFichaTecnica += custoUn * item.quantidade;
      });
    });

    // Notas de Entrada de Insumos (Fornecedores de Carne, Hortifrúti, Bebidas)
    const totalComprasInsumosNF = notasFiscaisFiltradas
      .filter((n) => n.direcao === 'entrada' && (n.tipo === 'entrada_insumos' || n.linhaDRE === 'cmv') && n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Notas de Embalagens Delivery
    const totalEmbalagensNF = notasFiscaisFiltradas
      .filter((n) => n.direcao === 'entrada' && (n.tipo === 'entrada_embalagens' || n.linhaDRE === 'comercial_embalagens') && n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valorTotalNota, 0);

    // NFS-e de Serviços Tomados
    const totalServicosNF = notasFiscaisFiltradas
      .filter((n) => n.direcao === 'entrada' && (n.tipo === 'entrada_servicos' || n.linhaDRE === 'servicos') && n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Utilidades (Luz, Gás)
    const totalUtilidadesNF = notasFiscaisFiltradas
      .filter((n) => n.direcao === 'entrada' && (n.tipo === 'entrada_utilidades' || n.linhaDRE === 'ocupacao') && n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valorTotalNota, 0);

    // NFC-e de Saída (Vendas aos clientes)
    const totalVendasFiscaisNF = notasFiscaisFiltradas
      .filter((n) => (n.direcao === 'saida' || n.tipo === 'saida_venda') && n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valorTotalNota, 0);

    // Impostos das Notas Fiscais
    const totalImpostosNF = notasFiscaisFiltradas
      .filter((n) => n.status !== 'cancelada')
      .reduce((acc, n) => acc + (n.valorIcms || 0) + (n.valorPis || 0) + (n.valorCofins || 0) + (n.valorIss || 0), 0);

    // Insumos Avulsos do Livro de Gastos
    const despesasInsumosLivro = despesasFiltradas.filter((d) => d.categoria === 'insumos').reduce((acc, d) => acc + d.valor, 0);

    // CMV Total
    const cmvFinal = Math.max(cmvFichaTecnica, totalComprasInsumosNF) + despesasInsumosLivro;

    // Despesas Operacionais
    const despesasPessoal = despesasFiltradas.filter((d) => d.categoria === 'pessoal').reduce((acc, d) => acc + d.valor, 0);
    const despesasOcupacao = despesasFiltradas.filter((d) => d.categoria === 'ocupacao').reduce((acc, d) => acc + d.valor, 0) + totalUtilidadesNF;
    const despesasComerciais = despesasFiltradas.filter((d) => d.categoria === 'financeiro').reduce((acc, d) => acc + d.valor, 0) + totalEmbalagensNF;
    const despesasServicos = despesasFiltradas.filter((d) => d.categoria === 'servicos').reduce((acc, d) => acc + d.valor, 0) + totalServicosNF;
    const outrasDespesas = despesasFiltradas.filter((d) => d.categoria === 'outros').reduce((acc, d) => acc + d.valor, 0);

    const totalDespesasOperacionais = despesasPessoal + despesasOcupacao + despesasComerciais + despesasServicos + outrasDespesas;

    // Receita Bruta Total
    const receitaBrutaTotal = Math.max(receitaBrutaVendas, totalVendasFiscaisNF);

    // Deduções
    const impostosTotais = totalImpostosNF > 0 ? totalImpostosNF : receitaBrutaTotal * 0.045;
    const totalDeducoes = totalDescontos + totalCancelamentos + impostosTotais;

    // Receita Líquida
    const receitaLiquida = Math.max(0, receitaBrutaTotal - totalDeducoes);

    // Lucro Bruto
    const lucroBruto = receitaLiquida - cmvFinal;
    const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    // Resultado Líquido Real
    const resultadoLiquidoReal = lucroBruto - totalDespesasOperacionais;
    const margemLiquidaPct = receitaLiquida > 0 ? (resultadoLiquidoReal / receitaLiquida) * 100 : 0;

    return {
      receitaBrutaTotal,
      receitaBrutaVendas,
      totalVendasFiscaisNF,
      totalDeducoes,
      totalDescontos,
      impostosTotais,
      receitaLiquida,
      cmvFinal,
      totalComprasInsumosNF,
      lucroBruto,
      margemBrutaPct,
      despesasPessoal,
      despesasOcupacao,
      despesasComerciais,
      despesasServicos,
      outrasDespesas,
      totalDespesasOperacionais,
      resultadoLiquidoReal,
      margemLiquidaPct,
      qtdNotas: notasFiscaisFiltradas.length,
      qtdGastos: despesasFiltradas.length,
    };
  }, [vendasFiltradas, despesasFiltradas, notasFiscaisFiltradas, fichasTecnicas, itensEstoque]);

  // Handlers
  function handleSalvarGasto(e: React.FormEvent) {
    e.preventDefault();
    const vNum = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!vNum || vNum <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    if (gastoEmEdicaoId) {
      editarDespesaRestaurante(gastoEmEdicaoId, {
        descricao: formDespesa.descricao,
        categoria: formDespesa.categoria,
        valor: vNum,
        data: formDespesa.data,
        tipo: formDespesa.tipo,
        formaPagamento: formDespesa.formaPagamento,
        statusPagamento: formDespesa.statusPagamento,
        observacoes: formDespesa.observacoes,
      });
      exibirToast(`Gasto "${formDespesa.descricao}" atualizado.`);
    } else {
      adicionarDespesaRestaurante({
        tenantId: tenantSelecionadoId,
        descricao: formDespesa.descricao,
        categoria: formDespesa.categoria,
        valor: vNum,
        data: formDespesa.data,
        tipo: formDespesa.tipo,
        formaPagamento: formDespesa.formaPagamento,
        statusPagamento: formDespesa.statusPagamento,
        observacoes: formDespesa.observacoes,
        cadastradoPor: usuarioLogado?.nome || 'Admin Master',
      });
      exibirToast(`Gasto adicionado ao restaurante e integrado ao DRE!`);
    }
    setModalGastoAberto(false);
  }

  function handleSalvarNF(e: React.FormEvent) {
    e.preventDefault();
    const vTotal = parseFloat(formNF.valorTotalNota.replace(',', '.')) || 0;
    const vProd = parseFloat(formNF.valorTotalProdutos.replace(',', '.')) || vTotal;
    const vIcms = parseFloat(formNF.valorIcms.replace(',', '.')) || 0;

    if (!formNF.numero.trim() || vTotal <= 0) {
      alert('Informe o número e valor da Nota Fiscal.');
      return;
    }

    let linhaDRE: NotaFiscalRegistro['linhaDRE'] = 'cmv';
    if (formNF.tipo === 'entrada_embalagens') linhaDRE = 'comercial_embalagens';
    else if (formNF.tipo === 'entrada_servicos') linhaDRE = 'servicos';
    else if (formNF.tipo === 'entrada_utilidades') linhaDRE = 'ocupacao';
    else if (formNF.tipo === 'saida_venda') linhaDRE = 'receita_bruta';

    adicionarNotaFiscal({
      tenantId: tenantSelecionadoId,
      numero: formNF.numero,
      serie: formNF.serie,
      chaveAcesso: formNF.chaveAcesso || undefined,
      modelo: formNF.modelo,
      tipo: formNF.tipo,
      direcao: formNF.tipo === 'saida_venda' ? 'saida' : 'entrada',
      emitenteRazaoSocial: formNF.emitenteRazaoSocial || 'FORNECEDOR',
      emitenteCnpjCpf: formNF.emitenteCnpjCpf || '00.000.000/0001-00',
      destinatarioRazaoSocial: restauranteAtual.nomeFantasia,
      destinatarioCnpjCpf: restauranteAtual.documento,
      dataEmissao: formNF.dataEmissao,
      valorTotalProdutos: vProd,
      valorTotalNota: vTotal,
      valorIcms: vIcms,
      status: formNF.status,
      linhaDRE,
      observacoes: formNF.observacoes,
      cadastradoPor: usuarioLogado?.nome || 'Admin Master',
    });

    exibirToast(`Nota Fiscal #${formNF.numero} cadastrada e integrada ao DRE!`);
    setModalNFAberto(false);
  }

  function handleUploadXml(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivoXmlSelecionado(file.name);
    setErroXml(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const conteudo = ev.target?.result as string;
      setXmlInputTexto(conteudo);
      const res = extrairDadosXmlNFe(conteudo, tenantSelecionadoId);
      if (!res.sucesso || !res.nota) {
        setErroXml(res.erro || 'Falha ao ler XML.');
        setXmlPrevia(null);
      } else {
        setXmlPrevia(res.nota);
      }
    };
    reader.readAsText(file);
  }

  function confirmarXml() {
    if (!xmlPrevia) return;
    adicionarNotaFiscal({
      ...xmlPrevia,
      tenantId: tenantSelecionadoId,
      cadastradoPor: usuarioLogado?.nome || 'Admin Master',
    });
    exibirToast(`XML NF-e #${xmlPrevia.numero} importado e integrado ao DRE!`);
    setModalImportarXmlAberto(false);
    setXmlPrevia(null);
    setXmlInputTexto('');
  }

  function exportarDRECSV() {
    const linhas = [
      ['Demonstrativo do Resultado do Exercício (DRE)'],
      ['Restaurante:', restauranteAtual.nomeFantasia],
      ['CNPJ:', restauranteAtual.documento],
      ['Período:', periodo],
      [''],
      ['Linha do DRE', 'Valor (R$)', '% ROL'],
      ['1. (+) RECEITA OPERACIONAL BRUTA', dadosDRE.receitaBrutaTotal.toFixed(2), '-'],
      ['2. (-) DEDUÇÕES E TRIBUTOS', (-dadosDRE.totalDeducoes).toFixed(2), ((dadosDRE.totalDeducoes / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)', dadosDRE.receitaLiquida.toFixed(2), '100.0%'],
      ['4. (-) CMV (CUSTO DAS MERCADORIAS)', (-dadosDRE.cmvFinal).toFixed(2), ((dadosDRE.cmvFinal / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['5. (=) LUCRO BRUTO', dadosDRE.lucroBruto.toFixed(2), dadosDRE.margemBrutaPct.toFixed(1) + '%'],
      ['6.1 Pessoal & Equipe', (-dadosDRE.despesasPessoal).toFixed(2), ((dadosDRE.despesasPessoal / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['6.2 Ocupação & Utilidades', (-dadosDRE.despesasOcupacao).toFixed(2), ((dadosDRE.despesasOcupacao / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['6.3 Comercial & Embalagens', (-dadosDRE.despesasComerciais).toFixed(2), ((dadosDRE.despesasComerciais / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['6.4 Serviços & TI', (-dadosDRE.despesasServicos).toFixed(2), ((dadosDRE.despesasServicos / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['6.5 Outras Despesas', (-dadosDRE.outrasDespesas).toFixed(2), ((dadosDRE.outrasDespesas / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['7. (=) RESULTADO LÍQUIDO REAL', dadosDRE.resultadoLiquidoReal.toFixed(2), dadosDRE.margemLiquidaPct.toFixed(1) + '%'],
    ];

    const csvContent = '\uFEFF' + linhas.map((l) => l.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dre_${restauranteAtual.nomeFantasia.toLowerCase().replace(/\s+/g, '_')}_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exibirToast('DRE exportado com sucesso para CSV!');
  }

  return (
    <div className={`space-y-5 font-['Plus_Jakarta_Sans',sans-serif] ${isEmbedded ? '' : 'max-w-7xl mx-auto p-4 sm:p-6'}`}>
      {/* Toast */}
      {toastNotificacao && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastNotificacao}</span>
        </div>
      )}

      {/* Header da Central Financeira Exclusiva Admin Master */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
              Exclusivo Admin Master & Consultoria
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#FF6B00]" />
            <span>Financeiro, Notas Fiscais & DRE dos Restaurantes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione todos os gastos e notas fiscais de cada restaurante para gerar o DRE contábil oficial em tempo real.
          </p>
        </div>

        {/* Seletores: Restaurante + Período */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Seletor de Restaurante */}
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <select
              value={tenantSelecionadoId}
              onChange={(e) => setTenantSelecionadoId(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  🍽️ {t.nomeFantasia} ({t.documento})
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Período */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
            }`}
          >
            <option value="mes_atual">📅 Mês Atual</option>
            <option value="mes_anterior">📅 Mês Anterior</option>
            <option value="ano_atual">📅 Ano Atual</option>
            <option value="7dias">📅 Últimos 7 dias</option>
            <option value="todos">📅 Todos os Lançamentos</option>
          </select>
        </div>
      </div>

      {/* 3 Sub-Abas: Notas Fiscais vs Gastos vs DRE */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubAba('notas_fiscais')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'notas_fiscais'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. Notas Fiscais & XML SEFAZ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subAba === 'notas_fiscais' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {dadosDRE.qtdNotas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubAba('gastos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'gastos'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>2. Gastos & Despesas Operacionais</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subAba === 'gastos' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {dadosDRE.qtdGastos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubAba('dre')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'dre'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. DRE Demonstrativo Gerado</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#10B981] font-bold">
              Ao Vivo
            </span>
          </button>
        </div>

        {/* Botão de Exportação no DRE */}
        {subAba === 'dre' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportarDRECSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Baixar DRE (CSV/Excel)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. NOTAS FISCAIS & XML SEFAZ                                              */}
      {/* ========================================================================= */}
      {subAba === 'notas_fiscais' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Notas Fiscais de Compras, Serviços e Vendas</h3>
              <p className="text-xs text-slate-400">
                Cada nota lançada aqui abate diretamente do CMV (Insumos) ou compõe as despesas do DRE deste restaurante.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setErroXml(null);
                  setXmlPrevia(null);
                  setXmlInputTexto('');
                  setModalImportarXmlAberto(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Importar XML SEFAZ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNfEmEdicaoId(null);
                  setFormNF({
                    numero: '',
                    serie: '1',
                    chaveAcesso: '',
                    modelo: 'NFe_55',
                    tipo: 'entrada_insumos',
                    emitenteRazaoSocial: '',
                    emitenteCnpjCpf: '',
                    dataEmissao: new Date().toISOString().split('T')[0],
                    valorTotalProdutos: '',
                    valorFrete: '0',
                    valorTotalNota: '',
                    valorIcms: '0',
                    status: 'autorizada',
                    observacoes: '',
                  });
                  setModalNFAberto(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lançar NF Manual</span>
              </button>
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
                    <th className="py-3 px-4">Linha no DRE</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {notasFiscaisExibicao.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <QrCode className="w-8 h-8 text-slate-500 mx-auto" />
                          <p className="font-bold text-sm text-slate-300">Nenhuma Nota Fiscal cadastrada para este restaurante</p>
                          <p className="text-xs text-slate-400">
                            Clique em <strong>+ Importar XML SEFAZ</strong> ou <strong>Lançar NF Manual</strong> para alimentar o DRE.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    notasFiscaisExibicao.map((nf) => {
                      const cfg = MAPA_TIPO_NF[nf.tipo] || MAPA_TIPO_NF.outros;
                      return (
                        <tr key={nf.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-white block">#{nf.numero} (Série {nf.serie || '1'})</span>
                            <span className="text-[10px] text-slate-400 font-mono">{nf.modelo.replace('_', ' ')}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white truncate max-w-[200px]">{nf.emitenteRazaoSocial}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{nf.emitenteCnpjCpf}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300 text-[11px]">
                            {nf.dataEmissao.split('-').reverse().join('/')}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${cfg.badgeCor}`}>
                              {cfg.linhaDRE}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-sm text-white">
                            R$ {nf.valorTotalNota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold">
                              {nf.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remover Nota Fiscal #${nf.numero}?`)) removerNotaFiscal(nf.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      {/* 2. GASTOS & DESPESAS OPERACIONAIS                                         */}
      {/* ========================================================================= */}
      {subAba === 'gastos' && (
        <div className="space-y-4">
          {/* Categorias Rápidas de Gastos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CATEGORIAS_PREENCHIMENTO_RAPIDO.map((a, idx) => {
              const Icone = a.icone;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGastoEmEdicaoId(null);
                    setFormDespesa({
                      descricao: a.descricao,
                      categoria: a.categoria,
                      valor: '',
                      data: new Date().toISOString().split('T')[0],
                      tipo: a.tipo,
                      formaPagamento: 'pix',
                      statusPagamento: 'pago',
                      observacoes: a.rotulo,
                    });
                    setModalGastoAberto(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                    isWhite ? 'bg-slate-50 border-slate-200 hover:bg-orange-50' : 'bg-[#0F172A] border-slate-800 hover:border-[#FF6B00]/40'
                  }`}
                >
                  <Icone className={`w-4 h-4 ${a.cor}`} />
                  <span className="text-[11px] font-bold text-white line-clamp-1">{a.rotulo}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Livro de Gastos do Restaurante</h3>
            <button
              type="button"
              onClick={() => {
                setGastoEmEdicaoId(null);
                setFormDespesa({
                  descricao: '',
                  categoria: 'ocupacao',
                  valor: '',
                  data: new Date().toISOString().split('T')[0],
                  tipo: 'fixa',
                  formaPagamento: 'pix',
                  statusPagamento: 'pago',
                  observacoes: '',
                });
                setModalGastoAberto(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar Despesa</span>
            </button>
          </div>

          {/* Tabela de Despesas */}
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
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Categoria / Linha DRE</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Valor (R$)</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {despesasLivroExibicao.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhuma despesa cadastrada para este restaurante no período.
                      </td>
                    </tr>
                  ) : (
                    despesasLivroExibicao.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300 text-[11px]">
                          {d.data.split('-').reverse().join('/')}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{d.descricao}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${CATEGORIAS_DRE[d.categoria]?.corBadge}`}>
                            {CATEGORIAS_DRE[d.categoria]?.linhaDRE}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => alternarStatusPagamentoDespesa(d.id)}
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                              d.statusPagamento !== 'pendente' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {d.statusPagamento !== 'pendente' ? 'Pago ✅' : 'Pendente ⏳'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-rose-400 text-sm">
                          - R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Excluir despesa "${d.descricao}"?`)) removerDespesaRestaurante(d.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DRE DEMONSTRATIVO OFICIAL GERADO EM TEMPO REAL                         */}
      {/* ========================================================================= */}
      {subAba === 'dre' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                DRE Oficial — {restauranteAtual.nomeFantasia}
              </h3>
              <p className="text-xs text-slate-400">
                Apuração 100% real baseada nas vendas registradas no sistema, compras faturadas em notas fiscais e gastos operacionais.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Margem Líquida</span>
              <span className={`text-base font-black font-mono ${
                dadosDRE.resultadoLiquidoReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'
              }`}>
                {dadosDRE.margemLiquidaPct.toFixed(1)}% ROL
              </span>
            </div>
          </div>

          {/* Tabela do DRE */}
          <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                }`}>
                  <th className="py-3 px-4">Linha Contábil do DRE</th>
                  <th className="py-3 px-4">Origem / Composição</th>
                  <th className="py-3 px-4 text-right">Valor Acumulado</th>
                  <th className="py-3 px-4 text-right">% Receita Líquida</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${isWhite ? 'divide-slate-100' : 'divide-slate-800/70'}`}>
                {/* 1. Receita Bruta */}
                <tr className="bg-slate-900/40">
                  <td className="py-3 px-4 font-sans font-black text-white text-xs">
                    1. (+) RECEITA OPERACIONAL BRUTA
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                    Vendas registradas no PDV + Notas Fiscais NFC-e emitidas
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white text-xs">
                    R$ {dadosDRE.receitaBrutaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 2. Deduções */}
                <tr>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-300 pl-8">
                    2. (-) Deduções da Receita & Tributos
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                    Descontos concedidos + Impostos em Notas Fiscais
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-400">
                    - R$ {dadosDRE.totalDeducoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalDeducoes / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>

                {/* 3. Receita Líquida */}
                <tr className="bg-[#10B981]/10 border-y border-[#10B981]/20">
                  <td className="py-3 px-4 font-sans font-black text-[#10B981] text-xs">
                    3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                    Base contábil líquida da operação do restaurante
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#10B981] text-sm">
                    R$ {dadosDRE.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#10B981]">100.0%</td>
                </tr>

                {/* 4. CMV */}
                <tr>
                  <td className="py-3 px-4 font-sans font-semibold text-rose-400 pl-8">
                    4. (-) CMV (Custo das Mercadorias Vendidas)
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                    Notas Fiscais de Fornecedores de Insumos (R$ {dadosDRE.totalComprasInsumosNF.toFixed(2)}) + Ficha Técnica
                  </td>
                  <td className="py-3 px-4 text-right text-rose-400 font-bold">
                    - R$ {dadosDRE.cmvFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.cmvFinal / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>

                {/* 5. Lucro Bruto */}
                <tr className="bg-slate-900/50">
                  <td className="py-3 px-4 font-sans font-black text-white text-xs">
                    5. (=) LUCRO BRUTO (MARGEM DE CONTRIBUIÇÃO)
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                    Receita Líquida menos Custos Diretos de Mercadorias
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white text-sm">
                    R$ {dadosDRE.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#10B981]">
                    {dadosDRE.margemBrutaPct.toFixed(1)}%
                  </td>
                </tr>

                {/* 6. Despesas Operacionais */}
                <tr>
                  <td className="py-2.5 px-4 font-sans text-slate-300 pl-8">
                    6.1 Despesas com Pessoal & Equipe
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                    Salários e diárias de garçons/extras
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
                    Aluguel, Luz, Água e Gás de Cozinha
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
                    6.3 Comercial & Embalagens
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                    Embalagens térmicas e despesas comerciais
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
                    6.4 Serviços & TI
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                    NFS-e de Serviços Tomados, limpeza e sistema
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
                    6.5 Outras Despesas Gerais
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                    Despesas administrativas diversas
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
                  dadosDRE.resultadoLiquidoReal >= 0
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : 'bg-rose-500/15 text-rose-400'
                }`}>
                  <td className="py-4 px-4 font-sans text-sm">
                    7. (=) RESULTADO LÍQUIDO REAL DO RESTAURANTE
                  </td>
                  <td className="py-4 px-4 font-sans text-[11px]">
                    {dadosDRE.resultadoLiquidoReal >= 0 ? '🎉 Lucro Líquido Real Apurado' : '⚠️ Prejuízo Operacional Verificado'}
                  </td>
                  <td className="py-4 px-4 text-right text-base font-black">
                    R$ {dadosDRE.resultadoLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-black">
                    {dadosDRE.margemLiquidaPct.toFixed(1)}% ROL
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR XML SEFAZ */}
      {modalImportarXmlAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#FF6B00]" />
                <span>Importar Arquivo XML da SEFAZ</span>
              </h3>
              <button onClick={() => setModalImportarXmlAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-[#FF6B00] bg-[#0F172A] rounded-2xl p-6 text-center cursor-pointer"
            >
              <input ref={fileInputRef} type="file" accept=".xml" onChange={handleUploadXml} className="hidden" />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {nomeArquivoXmlSelecionado ? (
                  <span className="text-[#10B981]">{nomeArquivoXmlSelecionado}</span>
                ) : (
                  'Clique para selecionar o arquivo XML (.xml) da NF-e'
                )}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Ou cole o texto XML abaixo:</label>
              <textarea
                value={xmlInputTexto}
                onChange={(e) => {
                  setXmlInputTexto(e.target.value);
                  if (e.target.value.trim()) {
                    const res = extrairDadosXmlNFe(e.target.value, tenantSelecionadoId);
                    if (res.sucesso && res.nota) setXmlPrevia(res.nota);
                  }
                }}
                rows={3}
                placeholder="<nfeProc>...</nfeProc>"
                className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
              />
            </div>

            {erroXml && <p className="text-xs text-rose-400">{erroXml}</p>}

            {xmlPrevia && (
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#10B981]/30 text-xs space-y-1">
                <p className="text-[#10B981] font-bold">✓ NF-e #{xmlPrevia.numero} identificada</p>
                <p className="text-slate-300">Fornecedor: {xmlPrevia.emitenteRazaoSocial}</p>
                <p className="text-white font-mono font-bold">Valor: R$ {xmlPrevia.valorTotalNota.toFixed(2)}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setModalImportarXmlAberto(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!xmlPrevia}
                onClick={confirmarXml}
                className="flex-1 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs disabled:opacity-50"
              >
                Confirmar & Lançar no DRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LANÇAR NOTA FISCAL MANUAL */}
      {modalNFAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-white">Lançar Nota Fiscal Manualmente</h3>
              <button onClick={() => setModalNFAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNF} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tipo da Nota (Linha DRE) *</label>
                <select
                  value={formNF.tipo}
                  onChange={(e) => setFormNF({ ...formNF, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="entrada_insumos">🥩 Entrada: Insumos & Compras (CMV 4.0)</option>
                  <option value="entrada_embalagens">📦 Entrada: Embalagens Delivery (Comercial 6.3)</option>
                  <option value="entrada_servicos">🛠️ Entrada: NFS-e Serviços Tomados (Serviços 6.4)</option>
                  <option value="entrada_utilidades">💡 Entrada: Utilidades (Luz, Gás) (Ocupação 6.2)</option>
                  <option value="saida_venda">📤 Saída: Vendas NFC-e (Receita Bruta 1.0)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Número da NF *</label>
                  <input
                    type="text"
                    required
                    value={formNF.numero}
                    onChange={(e) => setFormNF({ ...formNF, numero: e.target.value })}
                    placeholder="Ex: 000185"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data Emissão *</label>
                  <input
                    type="date"
                    required
                    value={formNF.dataEmissao}
                    onChange={(e) => setFormNF({ ...formNF, dataEmissao: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Razão Social do Fornecedor *</label>
                <input
                  type="text"
                  required
                  value={formNF.emitenteRazaoSocial}
                  onChange={(e) => setFormNF({ ...formNF, emitenteRazaoSocial: e.target.value })}
                  placeholder="Nome da empresa fornecedora"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor Total da NF *</label>
                  <input
                    type="text"
                    required
                    value={formNF.valorTotalNota}
                    onChange={(e) => setFormNF({ ...formNF, valorTotalNota: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ICMS Destacado</label>
                  <input
                    type="text"
                    value={formNF.valorIcms}
                    onChange={(e) => setFormNF({ ...formNF, valorIcms: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalNFAberto(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs uppercase"
                >
                  Salvar & Lançar no DRE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR GASTO */}
      {modalGastoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-white">Lançar Despesa Operacional</h3>
              <button onClick={() => setModalGastoAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarGasto} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição do Gasto *</label>
                <input
                  type="text"
                  required
                  value={formDespesa.descricao}
                  onChange={(e) => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
                  placeholder="Ex: Aluguel do Mês / Conta de Luz"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Categoria Contábil (DRE) *</label>
                <select
                  value={formDespesa.categoria}
                  onChange={(e) => setFormDespesa({ ...formDespesa, categoria: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ocupacao">🏠 Ocupação & Utilidades (Aluguel, Luz, Água, Gás) ➔ Linha 6.2</option>
                  <option value="pessoal">👥 Equipe & Pessoal (Salários, Diárias) ➔ Linha 6.1</option>
                  <option value="servicos">✨ Serviços & TI (Sistema, Limpeza) ➔ Linha 6.4</option>
                  <option value="insumos">🥦 Insumos Avulsos & Feira ➔ Linha 4.0 CMV</option>
                  <option value="financeiro">🛵 Comercial & Embalagens ➔ Linha 6.3</option>
                  <option value="outros">📦 Outras Despesas ➔ Linha 6.5</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor (R$) *</label>
                  <input
                    type="text"
                    required
                    value={formDespesa.valor}
                    onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formDespesa.data}
                    onChange={(e) => setFormDespesa({ ...formDespesa, data: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalGastoAberto(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs uppercase"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
