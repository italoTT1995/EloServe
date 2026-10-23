import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  PieChart,
  Plus,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Layers,
  Repeat,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CategoriaFinanceira,
  VendaRealizada,
  NotaFiscalRegistro,
  DespesaOperacionalRestaurante,
} from '../../types';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface DashboardFinanceiroProps {
  lancamentos: LancamentoFinanceiro[];
  vendas: VendaRealizada[];
  notasFiscais?: NotaFiscalRegistro[];
  despesasLegado?: DespesaOperacionalRestaurante[];
  categorias: CategoriaFinanceira[];
  isWhite: boolean;
  onNovoLancamento: (tipo?: 'receita' | 'despesa') => void;
  onEditarLancamento?: (lancamento: LancamentoFinanceiro) => void;
  onExcluirLancamento?: (id: string) => void;
  onAlternarStatus: (id: string) => void;
  onNovaRecorrencia?: () => void;
  onIrParaLancamentos?: () => void;
  onIrParaDRE: () => void;
  onMarcarComoPago?: (id: string) => void;
}

export function DashboardFinanceiro({
  lancamentos,
  vendas,
  categorias,
  isWhite,
  onNovoLancamento,
  onEditarLancamento,
  onExcluirLancamento,
  onAlternarStatus,
  onNovaRecorrencia,
  onIrParaDRE,
  onMarcarComoPago,
}: DashboardFinanceiroProps) {
  const agora = new Date();
  const [mesSelecionado, setMesSelecionado] = useState<number | 'todos'>(agora.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState<number>(agora.getFullYear());

  // Filtros da Tabela de Lançamentos
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'despesa' | 'receita' | 'pendente'>('todos');

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>([agora.getFullYear() - 1, agora.getFullYear(), agora.getFullYear() + 1]);
    lancamentos.forEach((l) => {
      const dt = l.dataCompetencia || l.dataPagamento || l.dataVencimento;
      if (dt) {
        const a = parseInt(dt.split('-')[0]);
        if (!isNaN(a)) anos.add(a);
      }
    });
    return Array.from(anos).sort((a, b) => b - a);
  }, [lancamentos]);

  // Helper para verificar se a data pertence ao mês e ano selecionados
  function pertenceAoPeriodo(dataStr?: string): boolean {
    if (!dataStr) return false;
    let ano = 0;
    let mes = 0;

    if (dataStr.includes('/')) {
      const partes = dataStr.split(' ')[0].split('/');
      ano = parseInt(partes[2]);
      mes = parseInt(partes[1]) - 1;
    } else {
      const p = dataStr.split('T')[0].split('-');
      ano = parseInt(p[0]);
      mes = parseInt(p[1]) - 1;
    }

    if (isNaN(ano) || isNaN(mes)) return false;
    if (ano !== anoSelecionado) return false;
    if (mesSelecionado !== 'todos' && mes !== mesSelecionado) return false;

    return true;
  }

  // Cálculos do Período (100% reais, sem números fictícios)
  const dados = useMemo(() => {
    // 1. Vendas do PDV
    const vendasFiltradas = vendas.filter((v) => {
      if (v.status === 'cancelada') return false;
      return pertenceAoPeriodo(v.dataHora);
    });
    const totalVendasPDV = vendasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);

    // 2. Lançamentos manuais/recorrentes
    const lancamentosFiltrados = lancamentos.filter((l) => {
      if (l.status === 'cancelado') return false;
      const dt = l.dataCompetencia || l.dataPagamento || l.dataVencimento || l.criadoEm;
      return pertenceAoPeriodo(dt);
    });

    // Receitas
    const receitasManuais = lancamentosFiltrados.filter((l) => l.tipo === 'receita' && l.origem !== 'pdv');
    const totalReceitasManuais = receitasManuais.reduce((acc, l) => acc + l.valor, 0);
    const totalReceitas = totalVendasPDV + totalReceitasManuais;

    const totalReceitasRecebidas =
      totalVendasPDV +
      receitasManuais.filter((l) => l.status === 'recebido' || l.status === 'pago').reduce((acc, l) => acc + l.valor, 0);

    const totalReceitasPendentes = receitasManuais
      .filter((l) => l.status === 'pendente')
      .reduce((acc, l) => acc + l.valor, 0);

    // Despesas
    const despesas = lancamentosFiltrados.filter((l) => l.tipo === 'despesa');
    const totalDespesas = despesas.reduce((acc, l) => acc + l.valor, 0);

    const totalDespesasPagas = despesas
      .filter((l) => l.status === 'pago' || l.status === 'recebido')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalDespesasPendentes = despesas
      .filter((l) => l.status === 'pendente')
      .reduce((acc, l) => acc + l.valor, 0);

    // Resultado estimado
    const resultadoEstimado = totalReceitas - totalDespesas;
    const saldoEfetivoCaixa = totalReceitasRecebidas - totalDespesasPagas;

    // Contas pendentes a pagar
    const contasPendentes = despesas.filter((l) => l.status === 'pendente');

    // Gastos por categoria
    const mapaCategorias: Record<string, { nome: string; total: number; icone?: string }> = {};
    despesas.forEach((d) => {
      const catObj = categorias.find((c) => c.id === d.categoriaId);
      const catNome = catObj?.nome || d.categoriaNome || 'Outros';
      if (!mapaCategorias[catNome]) {
        mapaCategorias[catNome] = { nome: catNome, total: 0 };
      }
      mapaCategorias[catNome].total += d.valor;
    });

    const categoriasOrdenadas = Object.values(mapaCategorias).sort((a, b) => b.total - a.total);

    // Tem algum dado no período?
    const temDados = totalReceitas > 0 || totalDespesas > 0 || lancamentosFiltrados.length > 0;

    return {
      totalReceitas,
      totalReceitasRecebidas,
      totalReceitasPendentes,
      totalDespesas,
      totalDespesasPagas,
      totalDespesasPendentes,
      resultadoEstimado,
      saldoEfetivoCaixa,
      contasPendentes,
      categoriasOrdenadas,
      lancamentosFiltrados,
      temDados,
      totalVendasPDV,
    };
  }, [lancamentos, vendas, categorias, mesSelecionado, anoSelecionado]);

  // Lançamentos filtrados para a tabela
  const lancamentosTabela = useMemo(() => {
    return dados.lancamentosFiltrados.filter((l) => {
      // Filtro de tipo
      if (filtroTipo === 'despesa' && l.tipo !== 'despesa') return false;
      if (filtroTipo === 'receita' && l.tipo !== 'receita') return false;
      if (filtroTipo === 'pendente' && l.status !== 'pendente') return false;

      // Busca texto
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase();
        const desc = (l.descricao || '').toLowerCase();
        const cat = (l.categoriaNome || '').toLowerCase();
        const forn = (l.fornecedorBeneficiario || '').toLowerCase();
        if (!desc.includes(termo) && !cat.includes(termo) && !forn.includes(termo)) {
          return false;
        }
      }

      return true;
    });
  }, [dados.lancamentosFiltrados, filtroTipo, buscaTexto]);

  const nomePeriodoExibicao =
    mesSelecionado === 'todos' ? `Ano ${anoSelecionado}` : `${MESES[mesSelecionado]} de ${anoSelecionado}`;

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR: FILTROS SIMPLES POR MÊS/ANO & BOTÃO DESTACADO */}
      <div
        className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-bold uppercase tracking-wider">Período:</span>
          </div>

          {/* Seletor de Mês */}
          <select
            value={mesSelecionado}
            onChange={(e) => {
              const val = e.target.value;
              setMesSelecionado(val === 'todos' ? 'todos' : parseInt(val));
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
              isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
            }`}
          >
            {MESES.map((nome, idx) => (
              <option key={idx} value={idx}>
                {nome}
              </option>
            ))}
            <option value="todos">Todos os Meses</option>
          </select>

          {/* Seletor de Ano */}
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
              isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
            }`}
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        {/* Botão em Grande Destaque: "+ Adicionar lançamento" */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNovoLancamento('despesa')}
            className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-sm shadow-lg shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Adicionar lançamento</span>
          </button>
        </div>
      </div>

      {/* 2. SE NÃO HOUVER DADOS NO PERÍODO: TELA VAZIA CLARA E DIRETA */}
      {!dados.temDados ? (
        <div
          className={`p-12 rounded-3xl border text-center ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
          }`}
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-100">
            Nenhum lançamento encontrado em {nomePeriodoExibicao}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Seus indicadores começam zerados. Cadastre os gastos do seu restaurante (alimentos, contas, salários, aluguel) ou novas receitas para acompanhar os resultados automaticamente.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNovoLancamento('despesa')}
              className="px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-lg shadow-[#FF6B00]/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Primeiro Lançamento</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. OS 4 CARDS ESSENCIAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Receitas do Período */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Receitas</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                R$ {dados.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Recebidas: R$ {dados.totalReceitasRecebidas.toFixed(2)}</span>
                {dados.totalReceitasPendentes > 0 && (
                  <span className="text-amber-400 font-bold">
                    Pendente: R$ {dados.totalReceitasPendentes.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Despesas do Período */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Despesas</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 tracking-tight">
                R$ {dados.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Pagas: R$ {dados.totalDespesasPagas.toFixed(2)}</span>
                {dados.totalDespesasPendentes > 0 && (
                  <span className="text-rose-400 font-bold">
                    A pagar: R$ {dados.totalDespesasPendentes.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Resultado Estimado */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resultado Estimado</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    dados.resultadoEstimado >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-black tracking-tight ${
                  dados.resultadoEstimado >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                R$ {dados.resultadoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>{dados.resultadoEstimado >= 0 ? 'Lucro estimado' : 'Déficit no período'}</span>
                <button
                  type="button"
                  onClick={onIrParaDRE}
                  className="text-[#FF6B00] font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>Ver DRE</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 4: Contas Pendentes */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contas Pendentes</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400 tracking-tight">
                R$ {dados.totalDespesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>{dados.contasPendentes.length} conta(s) a pagar</span>
                <span className="text-slate-500 font-mono">Aguardando baixa</span>
              </div>
            </div>
          </div>

          {/* 4. GRÁFICO SIMPLES (RECEITAS VS DESPESAS) + RESUMO POR CATEGORIA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Simples de Receitas versus Despesas */}
            <div
              className={`p-5 rounded-3xl border ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Comparativo: Receitas vs Despesas</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visão consolidada do período selecionado</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  {nomePeriodoExibicao}
                </span>
              </div>

              {/* Barra Visual Proporcional Simples */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Receitas (R$ {dados.totalReceitas.toFixed(2)})
                    </span>
                    <span className="text-rose-400 flex items-center gap-1.5">
                      Despesas (R$ {dados.totalDespesas.toFixed(2)})
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    </span>
                  </div>

                  {/* Barra Dupla Simples */}
                  {(() => {
                    const totalGeral = dados.totalReceitas + dados.totalDespesas;
                    const pctReceita = totalGeral > 0 ? (dados.totalReceitas / totalGeral) * 100 : 50;
                    const pctDespesa = totalGeral > 0 ? (dados.totalDespesas / totalGeral) * 100 : 50;

                    return (
                      <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pctReceita}%` }}
                          title={`Receitas: ${pctReceita.toFixed(1)}%`}
                        />
                        <div
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${pctDespesa}%` }}
                          title={`Despesas: ${pctDespesa.toFixed(1)}%`}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Resumo Numérico Limpo */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Vendas no PDV</span>
                    <span className="text-sm font-black text-emerald-400">
                      R$ {dados.totalVendasPDV.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Saldo Real em Caixa</span>
                    <span className={`text-sm font-black ${dados.saldoEfetivoCaixa >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                      R$ {dados.saldoEfetivoCaixa.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo dos Gastos por Categoria */}
            <div
              className={`p-5 rounded-3xl border ${
                isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#FF6B00]" />
                    <span>Gastos por Categoria</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Onde o dinheiro está sendo gasto</p>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {dados.categoriasOrdenadas.length} categorias
                </span>
              </div>

              {dados.categoriasOrdenadas.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma despesa lançada neste período.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {dados.categoriasOrdenadas.map((cat, idx) => {
                    const pct = dados.totalDespesas > 0 ? (cat.total / dados.totalDespesas) * 100 : 0;
                    return (
                      <div key={cat.nome + idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 truncate max-w-[200px]">{cat.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                            <span className="font-black text-slate-100">
                              R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
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
          </div>

          {/* 5. TABELA DE LANÇAMENTOS DO PERÍODO COM AÇÕES RÁPIDAS */}
          <div
            className={`p-5 rounded-3xl border ${
              isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
            }`}
          >
            {/* Header da Tabela com Filtros Rápidos & Busca */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <span>Lançamentos de {nomePeriodoExibicao}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {lancamentosTabela.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clique no status para alternar rapidamente entre Pago e Pendente
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Campo de Busca */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar lançamento..."
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    className={`pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:border-[#FF6B00] ${
                      isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
                    }`}
                  />
                </div>

                {/* Filtros de Tipo */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {(
                    [
                      { id: 'todos', label: 'Todos' },
                      { id: 'despesa', label: 'Despesas' },
                      { id: 'receita', label: 'Receitas' },
                      { id: 'pendente', label: 'Pendentes' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFiltroTipo(item.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        filtroTipo === item.id
                          ? 'bg-[#FF6B00] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Listagem em Tabela */}
            {lancamentosTabela.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhum lançamento correspondente ao filtro aplicado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-[11px] font-black uppercase text-slate-400">
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Descrição</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3 text-right">Valor</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {lancamentosTabela.map((item) => {
                      const isDespesa = item.tipo === 'despesa';
                      const isPago = item.status === 'pago' || item.status === 'recebido';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Data */}
                          <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                            {item.dataCompetencia || item.dataVencimento || '-'}
                          </td>

                          {/* Descrição */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-200">{item.descricao}</div>
                            {item.fornecedorBeneficiario && (
                              <div className="text-[11px] text-slate-400">
                                {item.fornecedorBeneficiario}
                              </div>
                            )}
                          </td>

                          {/* Categoria */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">
                              {item.categoriaNome || 'Geral'}
                            </span>
                          </td>

                          {/* Tipo */}
                          <td className="py-3 px-3">
                            <span
                              className={`text-[11px] font-bold ${
                                isDespesa ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isDespesa ? 'Despesa' : 'Receita'}
                            </span>
                          </td>

                          {/* Valor */}
                          <td className="py-3 px-3 text-right font-black font-mono">
                            <span className={isDespesa ? 'text-rose-400' : 'text-emerald-400'}>
                              {isDespesa ? '-' : '+'} R$ {item.valor.toFixed(2)}
                            </span>
                          </td>

                          {/* Status com Alternância em 1 clique */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onAlternarStatus(item.id)}
                              title="Clique para alternar o status"
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 mx-auto ${
                                isPago
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                              }`}
                            >
                              {isPago ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>{isDespesa ? 'Pago' : 'Recebido'}</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>Pendente</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {onEditarLancamento && (
                                <button
                                  type="button"
                                  onClick={() => onEditarLancamento(item)}
                                  title="Editar"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onExcluirLancamento && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Deseja excluir o lançamento "${item.descricao}"?`)) {
                                      onExcluirLancamento(item.id);
                                    }
                                  }}
                                  title="Excluir"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
