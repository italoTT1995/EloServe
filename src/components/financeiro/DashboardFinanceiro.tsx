import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PieChart,
  BarChart3,
  Layers,
  Building2,
  Receipt,
  Plus,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CategoriaFinanceira,
  VendaRealizada,
  NotaFiscalRegistro,
  DespesaOperacionalRestaurante,
} from '../../types';

export type FiltroPeriodoDashboard = 'hoje' | '7dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'personalizado' | 'todos';

interface DashboardFinanceiroProps {
  lancamentos: LancamentoFinanceiro[];
  vendas: VendaRealizada[];
  notasFiscais: NotaFiscalRegistro[];
  despesasLegado: DespesaOperacionalRestaurante[];
  categorias: CategoriaFinanceira[];
  isWhite: boolean;
  onNovoLancamento: (tipo: 'receita' | 'despesa') => void;
  onNovaRecorrencia: () => void;
  onIrParaLancamentos: () => void;
  onIrParaDRE: () => void;
  onMarcarComoPago: (id: string) => void;
}

export function DashboardFinanceiro({
  lancamentos,
  vendas,
  notasFiscais,
  despesasLegado,
  categorias,
  isWhite,
  onNovoLancamento,
  onNovaRecorrencia,
  onIrParaLancamentos,
  onIrParaDRE,
  onMarcarComoPago,
}: DashboardFinanceiroProps) {
  const [periodo, setPeriodo] = useState<FiltroPeriodoDashboard>('mes_atual');
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState('');
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState('');

  // Helper de filtragem de data
  function pertenceAoPeriodo(dataStr: string, filtro: FiltroPeriodoDashboard): boolean {
    if (filtro === 'todos') return true;
    if (!dataStr) return false;

    let d: Date;
    if (dataStr.includes('/')) {
      const p = dataStr.split(' ')[0].split('/');
      d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    } else {
      d = new Date(dataStr.split('T')[0] + 'T00:00:00');
    }

    if (isNaN(d.getTime())) return true;

    const agora = new Date();
    const hojeAno = agora.getFullYear();
    const hojeMes = agora.getMonth();
    const hojeDia = agora.getDate();

    if (filtro === 'hoje') {
      return d.getFullYear() === hojeAno && d.getMonth() === hojeMes && d.getDate() === hojeDia;
    }
    if (filtro === '7dias') {
      const seteDiasAtras = new Date(hojeAno, hojeMes, hojeDia - 7);
      return d >= seteDiasAtras && d <= agora;
    }
    if (filtro === 'mes_atual') {
      return d.getFullYear() === hojeAno && d.getMonth() === hojeMes;
    }
    if (filtro === 'mes_anterior') {
      const mesAnt = hojeMes === 0 ? 11 : hojeMes - 1;
      const anoAnt = hojeMes === 0 ? hojeAno - 1 : hojeAno;
      return d.getFullYear() === anoAnt && d.getMonth() === mesAnt;
    }
    if (filtro === 'ano_atual') {
      return d.getFullYear() === hojeAno;
    }
    if (filtro === 'personalizado') {
      if (!dataInicioPersonalizada && !dataFimPersonalizada) return true;
      const ini = dataInicioPersonalizada ? new Date(dataInicioPersonalizada + 'T00:00:00') : new Date('1970-01-01');
      const fim = dataFimPersonalizada ? new Date(dataFimPersonalizada + 'T23:59:59') : new Date('2099-12-31');
      return d >= ini && d <= fim;
    }
    return true;
  }

  // Filtragem dos dados sem duplicidade
  const dados = useMemo(() => {
    // 1. Receitas do PDV filtradas
    const vendasFiltradas = vendas.filter((v) => {
      if (v.status === 'cancelada') return false;
      const dataVenda = v.dataHora || '';
      return pertenceAoPeriodo(dataVenda, periodo);
    });

    const totalVendasPDV = vendasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);

    // 2. Lançamentos Financeiros filtrados
    const lancamentosFiltrados = lancamentos.filter((l) => {
      if (l.status === 'cancelado') return false;
      const dt = l.dataCompetencia || l.dataPagamento || l.dataVencimento || l.criadoEm;
      return pertenceAoPeriodo(dt, periodo);
    });

    // Receitas manuais / extras (excluindo qualquer uma que já venha de PDV)
    const receitasManuais = lancamentosFiltrados.filter((l) => l.tipo === 'receita' && l.origem !== 'pdv');
    const totalReceitasManuais = receitasManuais.reduce((acc, l) => acc + l.valor, 0);
    const totalReceitasRecebidas =
      totalVendasPDV +
      receitasManuais.filter((l) => l.status === 'recebido' || l.status === 'pago').reduce((acc, l) => acc + l.valor, 0);
    const totalReceitasPendentes = receitasManuais
      .filter((l) => l.status === 'pendente')
      .reduce((acc, l) => acc + l.valor, 0);
    const totalReceitasGeral = totalVendasPDV + totalReceitasManuais;

    // Despesas financeiras
    const despesasFinanceiras = lancamentosFiltrados.filter((l) => l.tipo === 'despesa');
    const totalDespesasPagas = despesasFinanceiras
      .filter((l) => l.status === 'pago' || l.status === 'recebido')
      .reduce((acc, l) => acc + l.valor, 0);
    const totalDespesasPendentes = despesasFinanceiras
      .filter((l) => l.status === 'pendente')
      .reduce((acc, l) => acc + l.valor, 0);
    const totalDespesasGeral = despesasFinanceiras.reduce((acc, l) => acc + l.valor, 0);

    // Saldos
    const saldoEfetivoCaixa = totalReceitasRecebidas - totalDespesasPagas;
    const resultadoCompetencia = totalReceitasGeral - totalDespesasGeral;

    // Gastos por Categoria
    const mapaCategorias: Record<string, { nome: string; total: number; corBadge: string }> = {};
    despesasFinanceiras.forEach((d) => {
      const catId = d.categoriaId;
      const catObj = categorias.find((c) => c.id === catId);
      const catNome = catObj?.nome || d.categoriaNome || 'Outras Despesas';
      const catCor = catObj?.corBadge || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      if (!mapaCategorias[catNome]) {
        mapaCategorias[catNome] = { nome: catNome, total: 0, corBadge: catCor };
      }
      mapaCategorias[catNome].total += d.valor;
    });

    const categoriasOrdenadas = Object.values(mapaCategorias).sort((a, b) => b.total - a.total);

    // Top 5 Maiores Despesas
    const topDespesas = [...despesasFinanceiras].sort((a, b) => b.valor - a.valor).slice(0, 5);

    // Próximos Vencimentos (Contas a pagar pendentes)
    const contasPendentes = lancamentos
      .filter((l) => l.tipo === 'despesa' && l.status === 'pendente')
      .sort((a, b) => {
        const d1 = a.dataVencimento || '9999-12-31';
        const d2 = b.dataVencimento || '9999-12-31';
        return d1.localeCompare(d2);
      })
      .slice(0, 6);

    return {
      vendasFiltradas,
      totalVendasPDV,
      lancamentosFiltrados,
      totalReceitasGeral,
      totalReceitasRecebidas,
      totalReceitasPendentes,
      totalDespesasGeral,
      totalDespesasPagas,
      totalDespesasPendentes,
      saldoEfetivoCaixa,
      resultadoCompetencia,
      categoriasOrdenadas,
      topDespesas,
      contasPendentes,
    };
  }, [lancamentos, vendas, categorias, periodo, dataInicioPersonalizada, dataFimPersonalizada]);

  // Evolução Mensal dos últimos 6 meses
  const evolucaoUltimosMeses = useMemo(() => {
    const meses = [];
    const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const ano = d.getFullYear();
      const mes = d.getMonth();
      const nomeMes = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
      const chaveMes = `${ano}-${String(mes + 1).padStart(2, '0')}`;

      // Vendas do mês
      const vendasMes = vendas
        .filter((v) => {
          if (v.status === 'cancelada') return false;
          const dt = v.dataHora || '';
          if (!dt) return false;
          if (dt.includes('/')) {
            const p = dt.split(' ')[0].split('/');
            return parseInt(p[2]) === ano && parseInt(p[1]) - 1 === mes;
          }
          return dt.startsWith(chaveMes);
        })
        .reduce((acc, v) => acc + (v.total || 0), 0);

      // Receitas manuais do mês
      const recMes = lancamentos
        .filter((l) => {
          if (l.tipo !== 'receita' || l.origem === 'pdv' || l.status === 'cancelado') return false;
          const dt = l.dataCompetencia || l.dataPagamento || l.criadoEm;
          return dt.startsWith(chaveMes);
        })
        .reduce((acc, l) => acc + l.valor, 0);

      // Despesas do mês
      const despMes = lancamentos
        .filter((l) => {
          if (l.tipo !== 'despesa' || l.status === 'cancelado') return false;
          const dt = l.dataCompetencia || l.dataPagamento || l.criadoEm;
          return dt.startsWith(chaveMes);
        })
        .reduce((acc, l) => acc + l.valor, 0);

      meses.push({
        mesRotulo: `${nomeMes}/${String(ano).slice(2)}`,
        receitas: vendasMes + recMes,
        despesas: despMes,
        lucro: vendasMes + recMes - despMes,
      });
    }

    const maxValor = Math.max(...meses.map((m) => Math.max(m.receitas, m.despesas, 1)));

    return { meses, maxValor };
  }, [lancamentos, vendas]);

  function formatarVencimentoRelativo(dataIso?: string) {
    if (!dataIso) return { texto: 'Sem vencimento', status: 'normal' };
    const hojeStr = new Date().toISOString().split('T')[0];
    if (dataIso === hojeStr) return { texto: 'Vence HOJE!', status: 'alerta' };
    if (dataIso < hojeStr) return { texto: 'VENCIDO!', status: 'vencido' };

    const dVenc = new Date(dataIso + 'T00:00:00');
    const dHoje = new Date(hojeStr + 'T00:00:00');
    const diffDias = Math.ceil((dVenc.getTime() - dHoje.getTime()) / (1000 * 60 * 60 * 24));
    return { texto: `Em ${diffDias} dias`, status: 'normal' };
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros de Período & Ações Rápidas */}
      <div
        className={`p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Filtrar por:</span>
          </div>

          {[
            { id: 'hoje', rotulo: 'Hoje' },
            { id: '7dias', rotulo: '7 Dias' },
            { id: 'mes_atual', rotulo: 'Mês Atual' },
            { id: 'mes_anterior', rotulo: 'Mês Anterior' },
            { id: 'ano_atual', rotulo: 'Ano Atual' },
            { id: 'personalizado', rotulo: 'Personalizado' },
            { id: 'todos', rotulo: 'Todo o Período' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriodo(item.id as FiltroPeriodoDashboard)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodo === item.id
                  ? 'bg-[#FF6B00] !text-white shadow-md shadow-[#FF6B00]/30 font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>

        {/* Inputs de período personalizado */}
        {periodo === 'personalizado' && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <input
              type="date"
              value={dataInicioPersonalizada}
              onChange={(e) => setDataInicioPersonalizada(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
            <span className="text-slate-400 font-bold">até</span>
            <input
              type="date"
              value={dataFimPersonalizada}
              onChange={(e) => setDataFimPersonalizada(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
          </div>
        )}

        {/* Botões Rápidos */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNovoLancamento('receita')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Nova Receita</span>
          </button>
          <button
            type="button"
            onClick={() => onNovoLancamento('despesa')}
            className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>+ Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Principais de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Receitas */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Receitas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            R$ {dados.totalReceitasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Recebidas: R$ {dados.totalReceitasRecebidas.toFixed(2)}
            </span>
            {dados.totalReceitasPendentes > 0 && (
              <span className="text-amber-400 font-bold">
                A receber: R$ {dados.totalReceitasPendentes.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Total de Despesas */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Despesas</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 tracking-tight">
            R$ {dados.totalDespesasGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-rose-400" />
              Pagas: R$ {dados.totalDespesasPagas.toFixed(2)}
            </span>
            {dados.totalDespesasPendentes > 0 && (
              <span className="text-amber-400 font-bold">
                A pagar: R$ {dados.totalDespesasPendentes.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Saldo Efetivo em Caixa */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Efetivo Caixa</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                dados.saldoEfetivoCaixa >= 0 ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              dados.saldoEfetivoCaixa >= 0 ? 'text-[#10B981]' : 'text-rose-400'
            }`}
          >
            R$ {dados.saldoEfetivoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-3 pt-3 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Entradas realizadas (-) Saídas pagas
          </p>
        </div>

        {/* Card 4: Resultado por Competência (DRE) */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resultado do Período</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                dados.resultadoCompetencia >= 0 ? 'bg-[#FF6B00]/15 text-[#FF6B00]' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              dados.resultadoCompetencia >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            R$ {dados.resultadoCompetencia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-3 pt-3 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Regime de Competência</span>
            <button
              type="button"
              onClick={onIrParaDRE}
              className="text-[#FF6B00] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver DRE</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>

      {/* Grid Central: Gastos por Categoria + Evolução Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria com Barra Visual */}
        <div
          className={`p-5 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-sm font-black tracking-tight">Gastos por Categoria Financeira</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              {dados.categoriasOrdenadas.length} categorias ativas
            </span>
          </div>

          {dados.categoriasOrdenadas.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhuma despesa registrada para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {dados.categoriasOrdenadas.map((cat, idx) => {
                const pct = dados.totalDespesasGeral > 0 ? (cat.total / dados.totalDespesasGeral) * 100 : 0;
                return (
                  <div key={cat.nome + idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 truncate max-w-[240px]">{cat.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px]">{pct.toFixed(1)}%</span>
                        <span className="font-black text-slate-100">
                          R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    {/* Barra de Progresso */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Evolução Mensal (Últimos 6 meses) */}
        <div
          className={`p-5 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black tracking-tight">Evolução Mensal (Receitas vs Despesas)</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Receitas
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                Despesas
              </span>
            </div>
          </div>

          <div className="h-[280px] flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {evolucaoUltimosMeses.meses.map((m, idx) => {
              const altRec = (m.receitas / evolucaoUltimosMeses.maxValor) * 200;
              const altDesp = (m.despesas / evolucaoUltimosMeses.maxValor) * 200;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-center font-mono mb-1 pointer-events-none whitespace-nowrap bg-black/80 px-2 py-1 rounded text-white z-10">
                    <div>Rec: R$ {m.receitas.toFixed(0)}</div>
                    <div>Desp: R$ {m.despesas.toFixed(0)}</div>
                  </div>

                  {/* Barras lado a lado */}
                  <div className="w-full flex items-end justify-center gap-1.5 h-[200px]">
                    <div
                      className="w-full max-w-[20px] bg-emerald-500 rounded-t-md transition-all group-hover:brightness-125"
                      style={{ height: `${Math.max(altRec, 4)}px` }}
                      title={`Receitas: R$ ${m.receitas.toFixed(2)}`}
                    />
                    <div
                      className="w-full max-w-[20px] bg-rose-500 rounded-t-md transition-all group-hover:brightness-125"
                      style={{ height: `${Math.max(altDesp, 4)}px` }}
                      title={`Despesas: R$ ${m.despesas.toFixed(2)}`}
                    />
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 mt-2">{m.mesRotulo}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Visualização histórica consolidada de faturamento e custos.</span>
            <button
              type="button"
              onClick={onIrParaDRE}
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver comparativo detalhado</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Próximos Vencimentos + Principais Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos / Contas a Pagar */}
        <div
          className={`p-5 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black tracking-tight">Próximos Vencimentos a Pagar</h3>
                <p className="text-[11px] text-slate-400">Contas pendentes de liquidação</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onIrParaLancamentos}
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {dados.contasPendentes.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
              Excelente! Não há contas a pagar pendentes ou vencidas no momento.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dados.contasPendentes.map((item) => {
                const infoVenc = formatarVencimentoRelativo(item.dataVencimento);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      infoVenc.status === 'vencido'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : infoVenc.status === 'alerta'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isWhite
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-[#0F172A] border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 truncate">{item.descricao}</span>
                        {item.origem === 'recorrente' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                            Recorrente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.categoriaNome}</span>
                        {item.fornecedorBeneficiario && (
                          <span>• {item.fornecedorBeneficiario}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-black text-rose-400">
                          R$ {item.valor.toFixed(2)}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                            infoVenc.status === 'vencido'
                              ? 'bg-rose-500/20 text-rose-400'
                              : infoVenc.status === 'alerta'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {infoVenc.texto} ({item.dataVencimento || '-'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onMarcarComoPago(item.id)}
                        title="Marcar como Pago agora"
                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Principais Despesas do Estabelecimento */}
        <div
          className={`p-5 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-black tracking-tight">Top 5 Maiores Despesas do Período</h3>
                <p className="text-[11px] text-slate-400">Maiores custos identificados na operação</p>
              </div>
            </div>
          </div>

          {dados.topDespesas.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhuma despesa localizada neste período.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dados.topDespesas.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">{item.descricao}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.categoriaNome} {item.fornecedorBeneficiario ? `• ${item.fornecedorBeneficiario}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-100 block">R$ {item.valor.toFixed(2)}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        item.status === 'pago'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
