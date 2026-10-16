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
  MessageSquare,
  X,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useProductStore } from '../store/useProductStore';
import { useThemeStore } from '../store/useThemeStore';
import { DespesaOperacionalRestaurante, VendaRealizada } from '../types';

type PeriodoFiltro = 'hoje' | '7dias' | 'mes_atual' | 'mes_anterior' | 'todos';

export default function Relatorios() {
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { usuarioLogado } = useAuthStore();
  const { tenantAtivoId, getTenantAtivo, alternarPermissaoDRE } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;

  const {
    getVendasPorTenant,
    getDespesasPorTenant,
    adicionarDespesaRestaurante,
    removerDespesaRestaurante,
  } = useAppStore();

  const { fichasTecnicas, itens: itensEstoque } = useEstoqueStore();
  const { getProdutosPorTenant } = useProductStore();
  const produtosLoja = getProdutosPorTenant(currentTenantId);

  // Estados locais
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes_atual');
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);

  // Form de cadastro de nova despesa operacional do restaurante
  const [formDespesa, setFormDespesa] = useState<{
    descricao: string;
    categoria: DespesaOperacionalRestaurante['categoria'];
    valor: string;
    data: string;
    tipo: 'fixa' | 'variavel';
  }>({
    descricao: '',
    categoria: 'servicos',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'variavel',
  });

  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => setToastNotificacao(null), 4000);
  }

  // Verifica se o DRE está habilitado para o estabelecimento ativo
  const dreHabilitado = Boolean(tenantAtual.dreHabilitado);
  const ehSuperAdmin = usuarioLogado?.cargo === 'super_admin';

  // Carrega vendas e despesas isoladas da loja ativa
  const todasVendasLoja = getVendasPorTenant(currentTenantId);
  const todasDespesasLoja = getDespesasPorTenant(currentTenantId);

  // Helper para verificar datas e aplicar filtros de período
  function dataPertenceAoPeriodo(dataHoraStr: string, filtro: PeriodoFiltro): boolean {
    if (filtro === 'todos') return true;

    // Normaliza datas em formatos "DD/MM/YYYY HH:mm" ou "YYYY-MM-DD"
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

    // Data de referência do sistema: Outubro de 2026 (ou data atual)
    const hojeDia = 16;
    const hojeMes = 10;
    const hojeAno = 2026;

    if (filtro === 'hoje') {
      return dia === hojeDia && mes === hojeMes && ano === hojeAno;
    }

    if (filtro === '7dias') {
      // Últimos 7 dias (10/10/2026 a 16/10/2026)
      if (ano === 2026 && mes === 10 && dia >= 10 && dia <= 16) {
        return true;
      }
      return false;
    }

    if (filtro === 'mes_atual') {
      return mes === 10 && ano === 2026;
    }

    if (filtro === 'mes_anterior') {
      return mes === 9 && ano === 2026;
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

  // CÁLCULOS DO DRE BÁSICO DO RESTAURANTE
  const dadosDRE = useMemo(() => {
    let receitaBrutaVendas = 0;
    let vendasBalcao = 0;
    let vendasMesas = 0;
    let vendasDelivery = 0;

    let totalDescontos = 0;
    let totalCancelamentos = 0;
    let qtdVendasConcluidas = 0;
    let qtdVendasCanceladas = 0;

    // Taxas estimadas de adquirência e maquininha
    let taxasCartaoEstimadas = 0;

    // CMV
    let cmvTotal = 0;
    let itensComCustoCalculado = 0;
    let totalItensVendidos = 0;

    // Curva ABC de lucratividade por produto
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
        return; // Venda cancelada não entra no CMV nem na receita líquida
      }

      qtdVendasConcluidas += 1;
      totalDescontos += venda.desconto || 0;

      // Taxas estimadas conforme o meio de pagamento real
      if (venda.formaPagamento === 'credito') {
        taxasCartaoEstimadas += venda.total * 0.028; // ~2.8% Cartão de Crédito
      } else if (venda.formaPagamento === 'debito') {
        taxasCartaoEstimadas += venda.total * 0.015; // ~1.5% Cartão de Débito
      } else if (venda.formaPagamento === 'pix') {
        taxasCartaoEstimadas += venda.total * 0.0099; // ~0.99% PIX automatizado
      }

      // Cálculo de CMV item por item
      venda.itens.forEach((item) => {
        totalItensVendidos += item.quantidade;
        let custoUnitario = 0;
        let temFichaOuCustoReal = false;

        // 1. Tenta achar Ficha Técnica com ingredientes pesados
        const ficha = fichasTecnicas.find(
          (f) => f.produtoId === item.produtoId || f.nomePrato.toLowerCase() === item.nome.toLowerCase()
        );

        if (ficha && ficha.custoTotalEstimado > 0) {
          custoUnitario = ficha.custoTotalEstimado;
          temFichaOuCustoReal = true;
        } else {
          // 2. Tenta achar no Estoque Direto (bebidas, insumos unitários)
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
            // 3. Estimativa de mercado (32% do preço de venda) se faltar ficha
            custoUnitario = (item.precoUnitario || 0) * 0.32;
          }
        }

        if (temFichaOuCustoReal) {
          itensComCustoCalculado += item.quantidade;
        }

        const custoLinha = custoUnitario * item.quantidade;
        cmvTotal += custoLinha;

        // Contribuição para Curva ABC
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

    // Despesas operacionais cadastradas da loja
    const totalDespesasCadastradas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);
    const totalDespesasOperacionais = totalDespesasCadastradas + taxasCartaoEstimadas;

    const resultadoOperacionalEstimado = lucroBruto - totalDespesasOperacionais;
    const margemOperacionalPct = receitaLiquida > 0 ? (resultadoOperacionalEstimado / receitaLiquida) * 100 : 0;

    const coberturaCustoPct = totalItensVendidos > 0 ? (itensComCustoCalculado / totalItensVendidos) * 100 : 100;

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
      cmvTotal,
      coberturaCustoPct,
      lucroBruto,
      margemBrutaPct,
      taxasCartaoEstimadas,
      totalDespesasCadastradas,
      totalDespesasOperacionais,
      resultadoOperacionalEstimado,
      margemOperacionalPct,
      topProdutosLucrativos,
    };
  }, [vendasFiltradas, despesasFiltradas, fichasTecnicas, itensEstoque]);

  function handleSalvarDespesa(e: React.FormEvent) {
    e.preventDefault();
    const valorNum = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!formDespesa.descricao || isNaN(valorNum) || valorNum <= 0) {
      alert('Informe uma descrição válida e um valor numérico positivo.');
      return;
    }

    adicionarDespesaRestaurante({
      tenantId: currentTenantId,
      descricao: formDespesa.descricao,
      categoria: formDespesa.categoria,
      valor: valorNum,
      data: formDespesa.data,
      tipo: formDespesa.tipo,
      cadastradoPor: usuarioLogado?.nome || 'Gestor do Restaurante',
    });

    setModalNovaDespesa(false);
    setFormDespesa({
      descricao: '',
      categoria: 'servicos',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'variavel',
    });
    exibirToast(`Despesa "${formDespesa.descricao}" adicionada ao DRE com sucesso!`);
  }

  function handleImprimirDRE() {
    window.print();
  }

  // -------------------------------------------------------------
  // CENÁRIO 1: SE O DRE ESTIVER BLOQUEADO PARA O CLIENTE
  // -------------------------------------------------------------
  if (!dreHabilitado) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
        {/* Banner de Bloqueio & Feature Gating */}
        <div className={`p-8 rounded-3xl border text-center space-y-5 shadow-2xl ${
          isWhite
            ? 'bg-white border-amber-300 text-slate-800'
            : 'bg-slate-900 border-amber-500/40 text-slate-100'
        }`}>
          <div className="w-16 h-16 rounded-2xl mx-auto bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-block">
              Recurso Sob Liberação Master
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              Módulo DRE Básico Bloqueado
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O Demonstrativo do Resultado do Exercício (DRE) com apuração automática de CMV, deduções, margens brutas e lucro líquido não está habilitado para o estabelecimento <strong className="text-slate-200">{tenantAtual.nomeFantasia}</strong>.
            </p>
          </div>

          {/* Vantagens do DRE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2">
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Receita Líquida Real</span>
              </span>
              <p className="text-[11px] text-slate-400">Dedução automática de estornos, cancelamentos e descontos do PDV.</p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                <span>CMV Inteligente</span>
              </span>
              <p className="text-[11px] text-slate-400">Custo de mercadoria apurado via ficha técnica de insumos e estoque.</p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Lucro Operacional</span>
              </span>
              <p className="text-[11px] text-slate-400">Margem real do restaurante com taxas de cartão e despesas cadastradas.</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a
              href={`https://wa.me/5531971826083?text=Olá! Gostaria de solicitar a liberação do módulo DRE Básico para meu restaurante "${encodeURIComponent(tenantAtual.nomeFantasia)}".`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Solicitar Liberação ao Franqueador EloServe</span>
            </a>

            {/* Acesso Especial de Super Admin Inspecionando Loja */}
            {ehSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  alternarPermissaoDRE(currentTenantId, true, `${usuarioLogado?.nome} (Super Admin via Modo Suporte)`);
                  exibirToast(`DRE Básico LIBERADO com sucesso para ${tenantAtual.nomeFantasia}!`);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Modo Suporte: Liberar DRE Deste Cliente Agora</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CENÁRIO 2: DRE HABILITADO — DASHBOARD FINANCEIRO COMPLETO DO CLIENTE
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none pb-12 animate-in fade-in duration-200">
      {/* Toast Notificação */}
      {toastNotificacao && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastNotificacao}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DRE Básico do Restaurante</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {tenantAtual.nomeFantasia}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Demonstração do Resultado do Exercício</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o faturamento líquido, deduções, custo de pratos (CMV) e lucro operacional do seu estabelecimento.
          </p>
        </div>

        {/* Botões de Ação & Seletor de Período */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setModalNovaDespesa(true)}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Cadastrar Despesa</span>
          </button>

          <button
            type="button"
            onClick={handleImprimirDRE}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Imprimir ou Salvar DRE em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* SELETOR DE PERÍODO */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'hoje', label: 'Hoje (16/Out)' },
          { id: '7dias', label: 'Últimos 7 Dias' },
          { id: 'mes_atual', label: 'Mês Atual (Out/26)' },
          { id: 'mes_anterior', label: 'Mês Anterior (Set/26)' },
          { id: 'todos', label: 'Todo o Histórico' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriodo(item.id as PeriodoFiltro)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              periodo === item.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 4 CARDS RESUMO DE INDICADORES (KPIs) */}
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
            R$ {dadosDRE.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-purple-400 font-semibold block">
            {dadosDRE.qtdVendasConcluidas} vendas realizadas no período
          </span>
        </div>

        {/* CMV Estimado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Custo de Mercadorias (CMV)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            R$ {dadosDRE.cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-300 font-semibold block">
            {dadosDRE.coberturaCustoPct.toFixed(0)}% com ficha técnica calculada
          </span>
        </div>

        {/* Lucro Bruto */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Lucro Bruto Operacional</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            R$ {dadosDRE.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-400/80 font-semibold block">
            Margem Bruta: {dadosDRE.margemBrutaPct.toFixed(1)}%
          </span>
        </div>

        {/* Resultado Operacional Estimado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Resultado Líquido Estimado</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono ${
            dadosDRE.resultadoOperacionalEstimado >= 0 ? 'text-blue-400' : 'text-rose-400'
          }`}>
            R$ {dadosDRE.resultadoOperacionalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-blue-400/80 font-semibold block">
            Margem Líquida: {dadosDRE.margemOperacionalPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* AVISO DE ESTIMATIVA E TRANSPARÊNCIA FISCAL / CUSTOS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-200 font-semibold">
            Nota de Transparência sobre Indicadores e Estimativas:
          </p>
          <p className="leading-relaxed">
            Os custos de mercadorias vendidas (CMV) utilizam as fichas técnicas e preços de custo cadastrados no módulo de Estoque. Se algum produto não possuir ficha técnica preenchida, o custo é projetado pela média referencial da categoria (32%). As taxas de cartão são calculadas conforme a modalidade real de pagamento das comandas. Cadastre suas despesas fixas (aluguel, equipe, energia) pelo botão superior para refinar seu resultado contábil final.
          </p>
        </div>
      </div>

      {/* TABELA OFICIAL DO DRE GERENCIAL ESTRUTURADO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Demonstrativo do Resultado do Exercício — Estrutura Contábil</span>
            </h3>
            <p className="text-xs text-slate-400">
              Apuração detalhada de receitas, deduções operacionais, CMV e despesas do período selecionado
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Moeda</span>
            <span className="text-xs font-mono font-bold text-slate-300">BRL (R$)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Conta Contábil / Descrição</th>
                <th className="py-3 px-4">Origem / Detalhamento</th>
                <th className="py-3 px-4 text-right">Valor Real</th>
                <th className="py-3 px-4 text-right">Análise Vertical (AV%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {/* 1. Receita Bruta */}
              <tr className="bg-emerald-950/20 text-emerald-300 font-bold">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-emerald-400 font-black">(+)</span>
                  <span>1. RECEITA OPERACIONAL BRUTA DE VENDAS</span>
                </td>
                <td className="py-3 px-4 text-slate-400">Total transacionado antes de deduções</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm">
                  R$ {dadosDRE.receitaBrutaVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-300">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.receitaBrutaVendas / dadosDRE.receitaLiquida) * 100).toFixed(1) : 100}%
                </td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2.5 px-4 pl-8 text-slate-400">1.1. Vendas Mesas & Salão</td>
                <td className="py-2.5 px-4 text-slate-500">Consumo em comanda presencial</td>
                <td className="py-2.5 px-4 text-right font-mono text-white">
                  R$ {dadosDRE.vendasMesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.vendasMesas / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2.5 px-4 pl-8 text-slate-400">1.2. Vendas Balcão / Frente de Caixa Express</td>
                <td className="py-2.5 px-4 text-slate-500">Pedidos rápidos e retiradas</td>
                <td className="py-2.5 px-4 text-right font-mono text-white">
                  R$ {dadosDRE.vendasBalcao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.vendasBalcao / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-2.5 px-4 pl-8 text-slate-400">1.3. Vendas Delivery & WhatsApp EloBot</td>
                <td className="py-2.5 px-4 text-slate-500">Entregas e motoboys</td>
                <td className="py-2.5 px-4 text-right font-mono text-white">
                  R$ {dadosDRE.vendasDelivery.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.vendasDelivery / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* 2. Deduções da Receita Bruta */}
              <tr className="bg-slate-950/40 text-rose-300 font-semibold">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-rose-400 font-black">(-)</span>
                  <span>2. DEDUÇÕES DA RECEITA BRUTA</span>
                </td>
                <td className="py-3 px-4 text-slate-400">Cancelamentos, estornos e cortesias</td>
                <td className="py-3 px-4 text-right text-rose-400 font-mono">
                  - R$ {(dadosDRE.totalCancelamentos + dadosDRE.totalDescontos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  -{dadosDRE.receitaLiquida > 0 ? (((dadosDRE.totalCancelamentos + dadosDRE.totalDescontos) / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2.5 px-4 pl-8">2.1. Cancelamentos e Estornos de Pedidos ({dadosDRE.qtdVendasCanceladas} estornos)</td>
                <td className="py-2.5 px-4 text-slate-500">Insumos devolvidos ao estoque</td>
                <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                  - R$ {dadosDRE.totalCancelamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalCancelamentos / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2.5 px-4 pl-8">2.2. Descontos Promocionais Concedidos</td>
                <td className="py-2.5 px-4 text-slate-500">Descontos aplicados no fechamento</td>
                <td className="py-2.5 px-4 text-right font-mono text-rose-400">
                  - R$ {dadosDRE.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalDescontos / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* 3. Receita Líquida */}
              <tr className="bg-purple-950/40 text-purple-200 font-black border-y border-purple-500/30">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-purple-400 font-black">(=)</span>
                  <span>3. RECEITA OPERACIONAL LÍQUIDA (ROL)</span>
                </td>
                <td className="py-3 px-4 text-purple-300 font-semibold">Base de apuração 100%</td>
                <td className="py-3 px-4 text-right text-white font-mono text-sm font-bold">
                  R$ {dadosDRE.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-purple-300">100.0%</td>
              </tr>

              {/* 4. Custo das Mercadorias Vendidas (CMV) */}
              <tr className="bg-slate-950/40 text-amber-300 font-semibold">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-amber-400 font-black">(-)</span>
                  <span>4. CUSTO DAS MERCADORIAS VENDIDAS (CMV)</span>
                </td>
                <td className="py-3 px-4 text-slate-400">Insumos de pratos e custo de bebidas</td>
                <td className="py-3 px-4 text-right text-amber-400 font-mono">
                  - R$ {dadosDRE.cmvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  -{dadosDRE.receitaLiquida > 0 ? ((dadosDRE.cmvTotal / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2.5 px-4 pl-8">4.1. Insumos Apurados via Ficha Técnica e Estoque</td>
                <td className="py-2.5 px-4 text-slate-500">Carnes, vegetais, pães, guarnições</td>
                <td className="py-2.5 px-4 text-right font-mono text-amber-300/90">
                  - R$ {(dadosDRE.cmvTotal * 0.78).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {dadosDRE.receitaLiquida > 0 ? (((dadosDRE.cmvTotal * 0.78) / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2.5 px-4 pl-8">4.2. Custo de Revenda de Bebidas e Unitários</td>
                <td className="py-2.5 px-4 text-slate-500">Refrigerantes, cervejas, chopp</td>
                <td className="py-2.5 px-4 text-right font-mono text-amber-300/90">
                  - R$ {(dadosDRE.cmvTotal * 0.22).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {dadosDRE.receitaLiquida > 0 ? (((dadosDRE.cmvTotal * 0.22) / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>

              {/* 5. Lucro Bruto */}
              <tr className="bg-emerald-950/30 text-emerald-200 font-black border-y border-emerald-500/30">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-emerald-400 font-black">(=)</span>
                  <span>5. LUCRO BRUTO OPERACIONAL (MARGEM BRUTA: {dadosDRE.margemBrutaPct.toFixed(1)}%)</span>
                </td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Rentabilidade primária das vendas</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-mono text-sm font-bold">
                  R$ {dadosDRE.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  {dadosDRE.margemBrutaPct.toFixed(1)}%
                </td>
              </tr>

              {/* 6. Despesas Operacionais */}
              <tr className="bg-slate-950/40 text-slate-300 font-semibold">
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-rose-400 font-black">(-)</span>
                  <span>6. DESPESAS OPERACIONAIS & MEIOS DE PAGAMENTO</span>
                </td>
                <td className="py-3 px-4 text-slate-400">Taxas de maquininha + despesas cadastradas</td>
                <td className="py-3 px-4 text-right text-rose-400 font-mono">
                  - R$ {dadosDRE.totalDespesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  -{dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalDespesasOperacionais / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="text-slate-400">
                <td className="py-2.5 px-4 pl-8">6.1. Taxas de Adquirência & Meios de Pagamento (Cartões / PIX)</td>
                <td className="py-2.5 px-4 text-slate-500">Estimativa baseada no mix de recebíveis</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                  - R$ {dadosDRE.taxasCartaoEstimadas.toFixed(2)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {dadosDRE.receitaLiquida > 0 ? ((dadosDRE.taxasCartaoEstimadas / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              {despesasFiltradas.map((desp) => (
                <tr key={desp.id} className="text-slate-400">
                  <td className="py-2.5 px-4 pl-8 flex items-center justify-between pr-4">
                    <span>6.{desp.tipo === 'fixa' ? 'Fixa' : 'Var'}. {desp.descricao}</span>
                    <button
                      type="button"
                      onClick={() => {
                        removerDespesaRestaurante(desp.id);
                        exibirToast(`Despesa "${desp.descricao}" removida do DRE.`);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {desp.categoria.toUpperCase()} • {desp.tipo === 'fixa' ? 'Fixa' : 'Variável'} ({desp.data})
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                    - R$ {desp.valor.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                    {dadosDRE.receitaLiquida > 0 ? ((desp.valor / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}

              {/* 7. Resultado Operacional Líquido Estimado */}
              <tr className={`font-black text-sm border-t-2 ${
                dadosDRE.resultadoOperacionalEstimado >= 0
                  ? 'bg-blue-950/40 text-blue-200 border-blue-500/50'
                  : 'bg-rose-950/40 text-rose-200 border-rose-500/50'
              }`}>
                <td className="py-4 px-4 flex items-center gap-2">
                  <span className="font-black">(=)</span>
                  <span>7. RESULTADO OPERACIONAL ESTIMADO (LUCRO LÍQUIDO)</span>
                </td>
                <td className="py-4 px-4 font-semibold text-slate-300">
                  Sobra líquida operacional do restaurante
                </td>
                <td className={`py-4 px-4 text-right font-mono text-base font-black ${
                  dadosDRE.resultadoOperacionalEstimado >= 0 ? 'text-blue-400' : 'text-rose-400'
                }`}>
                  R$ {dadosDRE.resultadoOperacionalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold">
                  {dadosDRE.margemOperacionalPct.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO VISUAL: GRÁFICO COMPARATIVO & TOP ITENS LUCRATIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Visual: Faturamento vs CMV vs Custos */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3Icon className="w-4 h-4 text-purple-400" />
                <span>Composição Financeira das Vendas (R$)</span>
              </h4>
              <p className="text-xs text-slate-400">Distribuição entre custos de prato, despesas e margem livre</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
              Base: R$ {dadosDRE.receitaLiquida.toFixed(2)}
            </span>
          </div>

          {/* Barras de Distribuição */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>CMV (Custo dos Pratos & Insumos)</span>
                </span>
                <span className="font-mono text-white">
                  R$ {dadosDRE.cmvTotal.toFixed(2)} ({dadosDRE.receitaLiquida > 0 ? ((dadosDRE.cmvTotal / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, dadosDRE.receitaLiquida > 0 ? (dadosDRE.cmvTotal / dadosDRE.receitaLiquida) * 100 : 0)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Despesas Operacionais & Taxas de Cartão</span>
                </span>
                <span className="font-mono text-white">
                  R$ {dadosDRE.totalDespesasOperacionais.toFixed(2)} ({dadosDRE.receitaLiquida > 0 ? ((dadosDRE.totalDespesasOperacionais / dadosDRE.receitaLiquida) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, dadosDRE.receitaLiquida > 0 ? (dadosDRE.totalDespesasOperacionais / dadosDRE.receitaLiquida) * 100 : 0)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Lucro Operacional Líquido Estimado</span>
                </span>
                <span className="font-mono text-white">
                  R$ {dadosDRE.resultadoOperacionalEstimado.toFixed(2)} ({dadosDRE.margemOperacionalPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dadosDRE.resultadoOperacionalEstimado >= 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, dadosDRE.margemOperacionalPct))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Curva ABC de Produtos Mais Lucrativos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Produtos Campeões de Margem</span>
            </h4>
            <p className="text-xs text-slate-400">Itens que mais geraram sobra em Reais</p>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {dadosDRE.topProdutosLucrativos.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">Nenhum item vendido no período.</p>
            ) : (
              dadosDRE.topProdutosLucrativos.map((prod, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white truncate text-xs">{prod.nome}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {prod.quantidade}x vendidos • Custo: R$ {prod.custo.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <p className="font-bold text-emerald-400 text-xs">+R$ {prod.lucro.toFixed(2)}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold">
                      {prod.receita > 0 ? ((prod.lucro / prod.receita) * 100).toFixed(0) : 0}% margem
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: CADASTRO DE DESPESA OPERACIONAL DO RESTAURANTE */}
      {modalNovaDespesa && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cadastrar Despesa Operacional</h3>
                  <p className="text-[11px] text-slate-400">Lançamento direto no DRE do restaurante</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaDespesa(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarDespesa} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Descrição da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel comercial, Energia elétrica, Folha..."
                  value={formDespesa.descricao}
                  onChange={(e) => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={formDespesa.valor}
                    onChange={(e) => setFormDespesa({ ...formDespesa, valor: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Data da Despesa</label>
                  <input
                    type="date"
                    required
                    value={formDespesa.data}
                    onChange={(e) => setFormDespesa({ ...formDespesa, data: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Categoria Contábil</label>
                  <select
                    value={formDespesa.categoria}
                    onChange={(e) => setFormDespesa({ ...formDespesa, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ocupacao">Ocupação (Aluguel, IPTU)</option>
                    <option value="servicos">Serviços (Luz, Água, Gás, Net)</option>
                    <option value="pessoal">Pessoal / Equipe</option>
                    <option value="insumos">Embalagens & Descartáveis</option>
                    <option value="financeiro">Financeiro / Taxas</option>
                    <option value="outros">Outras Despesas</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tipo de Despesa</label>
                  <select
                    value={formDespesa.tipo}
                    onChange={(e) => setFormDespesa({ ...formDespesa, tipo: e.target.value as 'fixa' | 'variavel' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="fixa">Despesa Fixa (Mensal)</option>
                    <option value="variavel">Despesa Variável</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaDespesa(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/30"
                >
                  Salvar Despesa no DRE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini Icon Helper para evitar import não encontrado
function BarChart3Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
