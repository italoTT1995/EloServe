import { useState, useMemo } from 'react';
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
  Sparkle,
  Search,
  Check,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useProductStore } from '../store/useProductStore';
import { useThemeStore } from '../store/useThemeStore';
import { DespesaOperacionalRestaurante, VendaRealizada } from '../types';

type PeriodoFiltro = 'hoje' | '7dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'todos';
type SubAbaFinanceiro = 'gastos' | 'dre' | 'indicadores';

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
    rotulo: 'Diária de Equipe',
    descricao: 'Diária Extra (Garçom / Cozinha)',
    categoria: 'pessoal' as const,
    tipo: 'variavel' as const,
    icone: Users,
    cor: 'text-blue-400',
  },
  {
    rotulo: 'Embalagens Delivery',
    descricao: 'Embalagens e Descartáveis Delivery',
    categoria: 'financeiro' as const,
    tipo: 'variavel' as const,
    icone: Bike,
    cor: 'text-[#FF6B00]',
  },
  {
    rotulo: 'Feira / Hortifruti',
    descricao: 'Compras de Hortifruti e Feira',
    categoria: 'insumos' as const,
    tipo: 'variavel' as const,
    icone: Apple,
    cor: 'text-emerald-400',
  },
  {
    rotulo: 'Produtos de Limpeza',
    descricao: 'Material de Limpeza e Higiene',
    categoria: 'servicos' as const,
    tipo: 'variavel' as const,
    icone: Sparkle,
    cor: 'text-purple-400',
  },
];

export default function Financeiro() {
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { usuarioLogado } = useAuthStore();
  const { tenantAtivoId, getTenantAtivo } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;

  const {
    getVendasPorTenant,
    getDespesasPorTenant,
    adicionarDespesaRestaurante,
    editarDespesaRestaurante,
    alternarStatusPagamentoDespesa,
    removerDespesaRestaurante,
  } = useAppStore();

  const { fichasTecnicas, itens: itensEstoque } = useEstoqueStore();
  const { getProdutosPorTenant } = useProductStore();

  // Estados locais
  const [subAba, setSubAba] = useState<SubAbaFinanceiro>('gastos');
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes_atual');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [gastoEmEdicaoId, setGastoEmEdicaoId] = useState<string | null>(null);
  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);

  // Form State
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

  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => setToastNotificacao(null), 4000);
  }

  // Carrega vendas e despesas isoladas da loja ativa
  const todasVendasLoja = getVendasPorTenant(currentTenantId);
  const todasDespesasLoja = getDespesasPorTenant(currentTenantId);

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

  // Vendas e Despesas filtradas pelo período selecionado
  const vendasFiltradas = useMemo(() => {
    return todasVendasLoja.filter((v) => dataPertenceAoPeriodo(v.dataHora, periodo));
  }, [todasVendasLoja, periodo]);

  const despesasFiltradas = useMemo(() => {
    return todasDespesasLoja.filter((d) => dataPertenceAoPeriodo(d.data, periodo));
  }, [todasDespesasLoja, periodo]);

  // Despesas da visualização do Livro Caixa (com busca e filtro de categoria)
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

  // CÁLCULOS DO DRE COMPLETO DO RESTAURANTE
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
        mapaLucroProdutos[chaveProd].receita += item.subtotal;
        mapaLucroProdutos[chaveProd].custo += custoLinha;
        mapaLucroProdutos[chaveProd].lucro += (item.subtotal - custoLinha);
      });
    });

    const receitaLiquida = Math.max(0, receitaBrutaVendas - totalCancelamentos - totalDescontos);
    const lucroBruto = Math.max(0, receitaLiquida - cmvTotal);
    const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    // Despesas cadastradas agrupadas pelas contas do DRE
    const despesasPorCategoria: Record<DespesaOperacionalRestaurante['categoria'], number> = {
      ocupacao: 0,
      pessoal: 0,
      servicos: 0,
      insumos: 0,
      financeiro: 0,
      outros: 0,
    };

    let totalGastosCadastrados = 0;
    let totalGastosPendentes = 0;

    despesasFiltradas.forEach((d) => {
      despesasPorCategoria[d.categoria] = (despesasPorCategoria[d.categoria] || 0) + d.valor;
      totalGastosCadastrados += d.valor;
      if (d.statusPagamento === 'pendente') {
        totalGastosPendentes += d.valor;
      }
    });

    // Insumos avulsos lançados no financeiro se somam ao CMV
    const cmvFinalApurado = cmvTotal + despesasPorCategoria.insumos;

    // Total de Despesas Operacionais (excluindo insumos já no CMV, e somando taxas de maquininha)
    const despesasOperacionaisSemInsumos =
      despesasPorCategoria.ocupacao +
      despesasPorCategoria.pessoal +
      despesasPorCategoria.servicos +
      despesasPorCategoria.financeiro +
      despesasPorCategoria.outros +
      taxasCartaoEstimadas;

    const resultadoOperacionalReal = lucroBruto - despesasOperacionaisSemInsumos - despesasPorCategoria.insumos;
    const margemLiquidaPct = receitaLiquida > 0 ? (resultadoOperacionalReal / receitaLiquida) * 100 : 0;

    // Ponto de Equilíbrio (Break-Even)
    // Custos Fixos / Margem de Contribuição %
    const despesasFixas = despesasFiltradas.filter((d) => d.tipo === 'fixa').reduce((acc, d) => acc + d.valor, 0);
    const pontoEquilibrio = margemBrutaPct > 0 ? (despesasFixas / (margemBrutaPct / 100)) : 0;

    const topProdutosLucrativos = Object.values(mapaLucroProdutos)
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 5);

    return {
      receitaBrutaVendas,
      vendasBalcao,
      vendasMesas,
      vendasDelivery,
      totalDescontos,
      totalCancelamentos,
      qtdVendasConcluidas,
      qtdVendasCanceladas,
      receitaLiquida,
      cmvTotal: cmvFinalApurado,
      lucroBruto,
      margemBrutaPct,
      taxasCartaoEstimadas,
      despesasPorCategoria,
      totalGastosCadastrados,
      totalGastosPendentes,
      despesasOperacionaisSemInsumos,
      resultadoOperacionalReal,
      margemLiquidaPct,
      despesasFixas,
      pontoEquilibrio,
      topProdutosLucrativos,
    };
  }, [vendasFiltradas, despesasFiltradas, fichasTecnicas, itensEstoque]);

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
      observacoes: '',
    });
    setModalGastoAberto(true);
  }

  function abrirModalEditarGasto(gasto: DespesaOperacionalRestaurante) {
    setGastoEmEdicaoId(gasto.id);
    setFormDespesa({
      descricao: gasto.descricao,
      categoria: gasto.categoria,
      valor: gasto.valor.toString(),
      data: gasto.data,
      tipo: gasto.tipo,
      formaPagamento: gasto.formaPagamento || 'pix',
      statusPagamento: gasto.statusPagamento || 'pago',
      dataVencimento: gasto.dataVencimento || gasto.data,
      observacoes: gasto.observacoes || '',
    });
    setModalGastoAberto(true);
  }

  function handleSalvarGasto(e: React.FormEvent) {
    e.preventDefault();
    const valorNum = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!formDespesa.descricao || isNaN(valorNum) || valorNum <= 0) {
      alert('Informe uma descrição válida e um valor numérico positivo.');
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

      {/* 1. Header Principal: Gestão Financeira & DRE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
              Controle de Entradas, Saídas & DRE
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
            Registre todos os gastos do restaurante de forma simplificada. Cada despesa é categorizada automaticamente e se enquadra nas linhas oficiais do DRE em tempo real.
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

          {/* Exportar CSV */}
          <button
            type="button"
            onClick={exportarGastosCSV}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Exportar planilha formatada para análise de dados do consultor"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Imprimir DRE */}
          <button
            type="button"
            onClick={() => window.print()}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Imprimir relatório DRE limpo"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Imprimir DRE</span>
          </button>

          {/* Botão Primário: Lançar Gasto em Laranja Oficial #FF6B00 */}
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

      {/* 2. Cards Executivos de Resumo Financeiro (Visão Geral em Tempo Real) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Faturamento Líquido (Entradas) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Receita Líquida (Vendas)
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
            <span>{dadosDRE.qtdVendasConcluidas} vendas realizadas</span>
            <span>Salão + Delivery</span>
          </div>
        </div>

        {/* Card 2: CMV (Custo de Alimentos & Insumos) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CMV (Insumos/Estoque)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              R$ {dadosDRE.cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>
              {dadosDRE.receitaLiquida > 0
                ? `${((dadosDRE.cmvTotal / dadosDRE.receitaLiquida) * 100).toFixed(1)}% da receita`
                : '0% da receita'}
            </span>
            <span className="text-amber-400/90 font-semibold">Ficha Técnica</span>
          </div>
        </div>

        {/* Card 3: Gastos Operacionais Cadastrados */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total de Gastos (Saídas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">
              R$ {dadosDRE.totalGastosCadastrados.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>{despesasFiltradas.length} lançamentos</span>
            {dadosDRE.totalGastosPendentes > 0 ? (
              <span className="text-amber-400 font-bold">
                R$ {dadosDRE.totalGastosPendentes.toFixed(0)} pendentes
              </span>
            ) : (
              <span className="text-[#10B981] font-semibold">Tudo em dia</span>
            )}
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
              Resultado Líquido (DRE)
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
            <span>Lançamento Rápido Simplificado (1 Clique)</span>
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

      {/* 4. Sub-Abas de Navegação (Livro de Gastos vs DRE vs Indicadores) */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
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
            <span>Livro de Gastos & Despesas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              subAba === 'gastos' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {despesasLivroCaixa.length}
            </span>
          </button>

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
              Ao Vivo
            </span>
          </button>

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
            <span>Distribuição & Ponto de Equilíbrio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: LIVRO DE GASTOS & DESPESAS (LANÇAMENTOS)                            */}
      {/* ========================================================================= */}
      {subAba === 'gastos' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Buscar por descrição (ex: Cemig, Aluguel, Diária)..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-[#FF6B00] transition-colors ${
                  isWhite
                    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#1E293B] border-slate-800 text-white placeholder:text-slate-500'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro por Categoria */}
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#1E293B] border-slate-800 text-slate-200'
                }`}
              >
                <option value="todas">Todas as Categorias DRE</option>
                <option value="ocupacao">🏢 Ocupação & Contas</option>
                <option value="pessoal">👥 Equipe & Diárias</option>
                <option value="servicos">✨ Serviços & Manutenção</option>
                <option value="insumos">🥬 Insumos Avulsos (CMV)</option>
                <option value="financeiro">🛵 Comercial & Embalagens</option>
                <option value="outros">📦 Outras Despesas</option>
              </select>

              {/* Filtro por Status */}
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#1E293B] border-slate-800 text-slate-200'
                }`}
              >
                <option value="todos">Todos os Status</option>
                <option value="pago">✅ Pagos</option>
                <option value="pendente">⏳ Pendentes</option>
              </select>
            </div>
          </div>

          {/* Tabela de Lançamentos */}
          <div className={`rounded-2xl border overflow-hidden ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isWhite ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição do Gasto</th>
                    <th className="py-3 px-4">Enquadramento no DRE</th>
                    <th className="py-3 px-4">Forma</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isWhite ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {despesasLivroCaixa.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-500 opacity-60" />
                          <p className="font-bold">Nenhum gasto encontrado para os filtros selecionados.</p>
                          <p className="text-[11px] text-slate-500">
                            Clique em "+ Lançar Gasto" ou utilize os atalhos rápidos acima para registrar.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    despesasLivroCaixa.map((desp) => {
                      const catInfo = CATEGORIAS_DRE[desp.categoria] || CATEGORIAS_DRE.outros;
                      const IconeCat = catInfo.icone;
                      const isPago = desp.statusPagamento !== 'pendente';

                      return (
                        <tr
                          key={desp.id}
                          className={`transition-colors ${
                            isWhite ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {desp.data.split('-').reverse().join('/')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-200 block text-xs">
                              {desp.descricao}
                            </span>
                            {desp.cadastradoPor && (
                              <span className="text-[10px] text-slate-500">
                                Por {desp.cadastradoPor}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${catInfo.corBadge}`}
                              title={catInfo.descricao}
                            >
                              <IconeCat className="w-3 h-3" />
                              <span>{catInfo.titulo}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-400 whitespace-nowrap">
                            {desp.formaPagamento || 'PIX'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              desp.tipo === 'fixa'
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-800/50 text-slate-400'
                            }`}>
                              {desp.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => alternarStatusPagamentoDespesa(desp.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                isPago
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/25'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                              }`}
                              title="Clique para alternar status entre Pago e Pendente"
                            >
                              {isPago ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>{isPago ? 'Pago' : 'Pendente'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-xs text-rose-400 whitespace-nowrap">
                            R$ {desp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {despesasLivroCaixa.length > 0 && (
                  <tfoot>
                    <tr className={`border-t font-black text-xs ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#0F172A] border-slate-800 text-white'
                    }`}>
                      <td colSpan={6} className="py-3.5 px-4 text-right uppercase tracking-wider text-[11px] text-slate-400">
                        Total dos Lançamentos Filtrados ({despesasLivroCaixa.length}):
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400 text-sm">
                        R${' '}
                        {despesasLivroCaixa
                          .reduce((acc, d) => acc + d.valor, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: DRE DEMONSTRATIVO OFICIAL LINHA A LINHA                             */}
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
                <h3 className="text-sm font-extrabold text-white">
                  DRE Operacional — {tenantAtual.nomeFantasia}
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
                    <th className="py-3 px-4">Origem / Composição</th>
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
                      Salão (R$ {dadosDRE.vendasMesas.toFixed(0)}) • Delivery (R$ {dadosDRE.vendasDelivery.toFixed(0)}) • Balcão (R$ {dadosDRE.vendasBalcao.toFixed(0)})
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white text-xs">
                      R$ {dadosDRE.receitaBrutaVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      -
                    </td>
                  </tr>

                  {/* 2. Deduções */}
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-300 pl-8">
                      2. (-) Deduções da Receita & Cancelamentos
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      Descontos no Caixa (R$ {dadosDRE.totalDescontos.toFixed(2)}) + Estornos
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      - R$ {(dadosDRE.totalDescontos + dadosDRE.totalCancelamentos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? (((dadosDRE.totalDescontos + dadosDRE.totalCancelamentos) / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 3. Receita Líquida */}
                  <tr className="bg-[#10B981]/5 border-y border-[#10B981]/20">
                    <td className="py-3 px-4 font-sans font-black text-[#10B981] text-xs">
                      3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Base de apuração para todos os indicadores de margem
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
                    <td className="py-3 px-4 font-sans font-bold text-amber-300 pl-8">
                      4. (-) CMV — Custo das Mercadorias Vendidas
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Ficha Técnica dos Pratos + Baixas de Estoque + Insumos de Feira
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-400">
                      - R$ {dadosDRE.cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.cmvTotal / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 5. Lucro Bruto */}
                  <tr className="bg-slate-900/40">
                    <td className="py-3 px-4 font-sans font-black text-white text-xs">
                      5. (=) MARGEM DE CONTRIBUIÇÃO / LUCRO BRUTO
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      Receita Líquida menos o Custo de Mercadorias (CMV)
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white text-xs">
                      R$ {dadosDRE.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {dadosDRE.margemBrutaPct.toFixed(1)}%
                    </td>
                  </tr>

                  {/* 6. Despesas Operacionais (Registros do Financeiro) */}
                  <tr className="bg-slate-950/40 font-bold text-slate-300">
                    <td colSpan={4} className="py-2.5 px-4 font-sans text-xs uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>6. (-) GASTOS OPERACIONAIS (Registrados na Aba Financeiro)</span>
                    </td>
                  </tr>

                  {/* 6.1 Pessoal */}
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-300 pl-12 flex items-center gap-2">
                      <Users className="w-3 h-3 text-blue-400" />
                      <span>6.1 Despesas com Pessoal & Diárias</span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-400 text-[11px]">
                      Salários, garçons extras, pró-labore e vales
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasPorCategoria.pessoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasPorCategoria.pessoal / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 6.2 Ocupação */}
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-300 pl-12 flex items-center gap-2">
                      <Store className="w-3 h-3 text-amber-400" />
                      <span>6.2 Despesas de Ocupação & Utilidades</span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-400 text-[11px]">
                      Aluguel, Luz (Cemig), Água, Gás de cozinha, IPTU
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasPorCategoria.ocupacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasPorCategoria.ocupacao / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 6.3 Comercial & Vendas */}
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-300 pl-12 flex items-center gap-2">
                      <Bike className="w-3 h-3 text-purple-400" />
                      <span>6.3 Despesas Comerciais, Vendas & Embalagens</span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-400 text-[11px]">
                      Embalagens delivery + Taxas Maquininha (R$ {dadosDRE.taxasCartaoEstimadas.toFixed(0)})
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400">
                      - R$ {(dadosDRE.despesasPorCategoria.financeiro + dadosDRE.taxasCartaoEstimadas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? (((dadosDRE.despesasPorCategoria.financeiro + dadosDRE.taxasCartaoEstimadas) / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 6.4 Serviços & Manutenção */}
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-300 pl-12 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                      <span>6.4 Serviços, Sistemas & Manutenção</span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-400 text-[11px]">
                      Software SaaS eloGastrô, internet, limpeza, manutenção
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasPorCategoria.servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasPorCategoria.servicos / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 6.5 Outras Despesas */}
                  <tr>
                    <td className="py-2 px-4 font-sans text-slate-300 pl-12 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>6.5 Outras Despesas Operacionais</span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-400 text-[11px]">
                      Despesas diversas e eventuais
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400">
                      - R$ {dadosDRE.despesasPorCategoria.outros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.despesasPorCategoria.outros / dadosDRE.receitaLiquida) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>

                  {/* 7. RESULTADO OPERACIONAL LÍQUIDO */}
                  <tr className={`border-t-2 ${
                    dadosDRE.resultadoOperacionalReal >= 0
                      ? 'bg-[#10B981]/15 border-[#10B981]'
                      : 'bg-rose-500/15 border-rose-500'
                  }`}>
                    <td className={`py-4 px-4 font-sans font-black text-sm ${
                      dadosDRE.resultadoOperacionalReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                    }`}>
                      7. (=) RESULTADO OPERACIONAL LÍQUIDO (LUCRO REAL)
                    </td>
                    <td className="py-4 px-4 font-sans text-slate-300 text-xs font-semibold">
                      Sobra final no bolso do restaurante após todas as saídas
                    </td>
                    <td className={`py-4 px-4 text-right font-black text-base ${
                      dadosDRE.resultadoOperacionalReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                    }`}>
                      R$ {dadosDRE.resultadoOperacionalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-4 px-4 text-right font-black text-sm ${
                      dadosDRE.resultadoOperacionalReal >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                    }`}>
                      {dadosDRE.margemLiquidaPct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: DISTRIBUIÇÃO DE CUSTOS & PONTO DE EQUILÍBRIO                        */}
      {/* ========================================================================= */}
      {subAba === 'indicadores' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card: Ponto de Equilíbrio (Break-Even) */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Ponto de Equilíbrio Operacional
                </h3>
                <p className="text-xs text-slate-400">
                  Quanto seu restaurante precisa faturar para não ter prejuízo
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Custos Fixos do Mês:</span>
                <span className="font-mono font-bold text-white">
                  R$ {dadosDRE.despesasFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Margem de Contribuição Média:</span>
                <span className="font-mono font-bold text-[#FF6B00]">
                  {dadosDRE.margemBrutaPct.toFixed(1)}%
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Faturamento Mínimo Necessário:</span>
                <span className="font-mono font-black text-[#10B981] text-sm">
                  R$ {dadosDRE.pontoEquilibrio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Com o faturamento atual de <strong className="text-white">R$ {dadosDRE.receitaLiquida.toFixed(2)}</strong>, seu restaurante está{' '}
              {dadosDRE.receitaLiquida >= dadosDRE.pontoEquilibrio ? (
                <span className="text-[#10B981] font-bold">
                  acima do ponto de equilíbrio (operando no lucro)
                </span>
              ) : (
                <span className="text-rose-400 font-bold">
                  abaixo do ponto de equilíbrio (necessário aumentar vendas ou reduzir despesas fixas)
                </span>
              )}.
            </p>
          </div>

          {/* Card: Produtos Mais Lucrativos da Casa */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Top 5 Pratos Mais Lucrativos
                </h3>
                <p className="text-xs text-slate-400">
                  Pratos que mais deixam dinheiro no caixa após descontar o CMV
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {dadosDRE.topProdutosLucrativos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Nenhuma venda com cálculo de lucro registrada neste período.
                </p>
              ) : (
                dadosDRE.topProdutosLucrativos.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-200 block">{prod.nome}</span>
                        <span className="text-[10px] text-slate-400">
                          {prod.quantidade} unidades vendidas
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-[#10B981] block">
                        + R$ {prod.lucro.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Receita: R$ {prod.receita.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LANÇAR / EDITAR GASTO SIMPLIFICADO                                 */}
      {/* ========================================================================= */}
      {modalGastoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Linha de acento laranja */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-90" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {gastoEmEdicaoId ? 'Editar Gasto do Restaurante' : 'Lançar Novo Gasto no Financeiro'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    O valor é deduzido automaticamente no DRE da loja.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalGastoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarGasto} className="space-y-4 pt-4">
              {/* Descrição */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Descrição do Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={formDespesa.descricao}
                  onChange={(e) => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
                  placeholder="Ex: Conta de Luz CEMIG, Aluguel Outubro, Diária Garçom..."
                  className="w-full px-3 py-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {/* Categoria com Enquadramento no DRE */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Categoria & Enquadramento no DRE *
                </label>
                <select
                  value={formDespesa.categoria}
                  onChange={(e) => setFormDespesa({ ...formDespesa, categoria: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="ocupacao">🏢 Ocupação & Utilidades (Aluguel, Luz, Água, Gás) ➔ DRE: Linha 6.2</option>
                  <option value="pessoal">👥 Equipe & Pessoal (Salários, Diárias Extras, Pró-Labore) ➔ DRE: Linha 6.1</option>
                  <option value="servicos">✨ Serviços & Manutenção (Sistemas SaaS, Limpeza, Contabilidade) ➔ DRE: Linha 6.4</option>
                  <option value="insumos">🥬 Insumos Avulsos & Feira (Compras Rápidas de Emergência) ➔ DRE: Linha 4.0 CMV</option>
                  <option value="financeiro">🛵 Comercial & Vendas (Embalagens Delivery, Taxas de Cartão) ➔ DRE: Linha 6.3</option>
                  <option value="outros">📦 Outras Despesas Administrativas & Eventuais ➔ DRE: Linha 6.5</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Linha no DRE:{' '}
                  <strong className="text-[#FF6B00]">
                    {CATEGORIAS_DRE[formDespesa.categoria]?.linhaDRE}
                  </strong>
                </p>
              </div>

              {/* Valor e Data */}
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

              {/* Forma de Pagamento, Tipo e Status */}
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

              {/* Botões do Modal */}
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
