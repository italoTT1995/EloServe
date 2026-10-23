import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  History,
  Paperclip,
  Eye,
  Store,
  Users,
  Lightbulb,
  Droplet,
  Flame,
  Bike,
  Apple,
  Sparkles,
  Receipt,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CategoriaFinanceira,
  TipoLancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  FormaPagamentoFinanceiro,
} from '../../types';

interface LancamentosSectionProps {
  lancamentos: LancamentoFinanceiro[];
  categorias: CategoriaFinanceira[];
  isWhite: boolean;
  onNovoLancamento: (tipo?: TipoLancamentoFinanceiro, dadosPredefinidos?: Partial<LancamentoFinanceiro>) => void;
  onEditarLancamento: (lancamento: LancamentoFinanceiro) => void;
  onAlternarStatus: (id: string) => void;
  onCancelarLancamento: (id: string) => void;
  onExcluirLancamento: (id: string) => void;
  onAbrirHistorico: (lancamento: LancamentoFinanceiro) => void;
  onNovaCategoria: () => void;
}

const ATALHOS_LANCAMENTO_RAPIDO = [
  {
    rotulo: 'Luz (Energia)',
    descricao: 'Conta de Energia Elétrica',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_utilidades',
    icone: Lightbulb,
    corBadge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  {
    rotulo: 'Água / Saneamento',
    descricao: 'Conta de Água e Esgoto',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_utilidades',
    icone: Droplet,
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  {
    rotulo: 'Aluguel do Ponto',
    descricao: 'Aluguel Comercial do Imóvel',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_aluguel',
    icone: Store,
    corBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  {
    rotulo: 'Gás de Cozinha',
    descricao: 'Botijão / Recarga de Gás',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_utilidades',
    icone: Flame,
    corBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  {
    rotulo: 'Diária Garçom / Extra',
    descricao: 'Diária de Garçom / Cozinha Freelancer',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_funcionarios_rh',
    icone: Users,
    corBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  {
    rotulo: 'Embalagens Delivery',
    descricao: 'Embalagens térmicas e sacolas',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_embalagens_consumo',
    icone: Bike,
    corBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  {
    rotulo: 'Feira & Hortifrúti',
    descricao: 'Compras de Feira, Hortifrúti e Insumos',
    tipo: 'despesa' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_compras_alimentos_bebidas',
    icone: Apple,
    corBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    rotulo: 'Receita Adicional / Evento',
    descricao: 'Locação de Espaço / Evento Especial',
    tipo: 'receita' as TipoLancamentoFinanceiro,
    categoriaId: 'cat_receitas_adicionais',
    icone: TrendingUp,
    corBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
];

export function LancamentosSection({
  lancamentos,
  categorias,
  isWhite,
  onNovoLancamento,
  onEditarLancamento,
  onAlternarStatus,
  onCancelarLancamento,
  onExcluirLancamento,
  onAbrirHistorico,
  onNovaCategoria,
}: LancamentosSectionProps) {
  // Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroFormaPagto, setFiltroFormaPagto] = useState<string>('todas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Modal para Visualizar Comprovante
  const [comprovanteVisualizando, setComprovanteVisualizando] = useState<{
    nome?: string;
    url?: string;
    descricao: string;
  } | null>(null);

  // Filtragem
  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter((l) => {
      // Busca texto
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase();
        const bateuDesc = l.descricao?.toLowerCase().includes(termo);
        const bateuForn = l.fornecedorBeneficiario?.toLowerCase().includes(termo);
        const bateuCat = l.categoriaNome?.toLowerCase().includes(termo);
        const bateuObs = l.observacoes?.toLowerCase().includes(termo);
        if (!bateuDesc && !bateuForn && !bateuCat && !bateuObs) return false;
      }

      // Filtro Tipo
      if (filtroTipo !== 'todos' && l.tipo !== filtroTipo) return false;

      // Filtro Categoria
      if (filtroCategoria !== 'todas' && l.categoriaId !== filtroCategoria) return false;

      // Filtro Status
      if (filtroStatus !== 'todos' && l.status !== filtroStatus) return false;

      // Filtro Forma de Pagamento
      if (filtroFormaPagto !== 'todas' && l.formaPagamento !== filtroFormaPagto) return false;

      // Filtro Data (Competência)
      if (dataInicio && l.dataCompetencia && l.dataCompetencia < dataInicio) return false;
      if (dataFim && l.dataCompetencia && l.dataCompetencia > dataFim) return false;

      return true;
    });
  }, [lancamentos, buscaTexto, filtroTipo, filtroCategoria, filtroStatus, filtroFormaPagto, dataInicio, dataFim]);

  // Totais do filtro atual
  const totais = useMemo(() => {
    let totRec = 0;
    let totDesp = 0;
    let pendenteRec = 0;
    let pendenteDesp = 0;

    lancamentosFiltrados.forEach((l) => {
      if (l.status === 'cancelado') return;
      if (l.tipo === 'receita') {
        totRec += l.valor;
        if (l.status === 'pendente') pendenteRec += l.valor;
      } else {
        totDesp += l.valor;
        if (l.status === 'pendente') pendenteDesp += l.valor;
      }
    });

    return {
      totalReceitas: totRec,
      totalDespesas: totDesp,
      saldo: totRec - totDesp,
      pendenteReceitas: pendenteRec,
      pendenteDespesas: pendenteDesp,
      quantidade: lancamentosFiltrados.length,
    };
  }, [lancamentosFiltrados]);

  // Exportar para CSV
  function exportarCSV() {
    const cabecalho = [
      'ID',
      'Tipo',
      'Descrição',
      'Categoria',
      'Valor (R$)',
      'Data Competência',
      'Data Vencimento',
      'Data Pagamento',
      'Forma Pagamento',
      'Status',
      'Fornecedor / Beneficiário',
      'Origem',
      'Observações',
    ];

    const linhas = lancamentosFiltrados.map((l) => [
      `"${l.id}"`,
      `"${l.tipo.toUpperCase()}"`,
      `"${l.descricao.replace(/"/g, '""')}"`,
      `"${l.categoriaNome || ''}"`,
      l.valor.toFixed(2),
      `"${l.dataCompetencia || ''}"`,
      `"${l.dataVencimento || ''}"`,
      `"${l.dataPagamento || ''}"`,
      `"${l.formaPagamento}"`,
      `"${l.status.toUpperCase()}"`,
      `"${(l.fornecedorBeneficiario || '').replace(/"/g, '""')}"`,
      `"${l.origem}"`,
      `"${(l.observacoes || '').replace(/"/g, '""')}"`,
    ]);

    const conteudoCSV = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lancamentos_financeiros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleAtalhoRapido(atalho: (typeof ATALHOS_LANCAMENTO_RAPIDO)[0]) {
    const cat = categorias.find((c) => c.id === atalho.categoriaId) || categorias[0];
    onNovoLancamento(atalho.tipo, {
      descricao: atalho.descricao,
      tipo: atalho.tipo,
      categoriaId: cat?.id || atalho.categoriaId,
      categoriaNome: cat?.nome || atalho.rotulo,
    });
  }

  return (
    <div className="space-y-5">
      {/* Barra de Atalhos Rápidos */}
      <div
        className={`p-4 rounded-2xl border ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Lançamentos Rápidos de Restaurante
            </span>
          </div>
          <button
            type="button"
            onClick={onNovaCategoria}
            className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Categoria</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {ATALHOS_LANCAMENTO_RAPIDO.map((at, idx) => {
            const Icone = at.icone;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAtalhoRapido(at)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#FF6B00] hover:text-[#FF6B00]'
                    : 'bg-[#0F172A] border-slate-700 text-slate-300 hover:border-[#FF6B00] hover:text-white'
                }`}
              >
                <Icone className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>{at.rotulo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por descrição, fornecedor, categoria, observações..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:border-[#FF6B00] ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
            {buscaTexto && (
              <button
                type="button"
                onClick={() => setBuscaTexto('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Botões Principais de Lançamento */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNovoLancamento('receita')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ Receita</span>
            </button>
            <button
              type="button"
              onClick={() => onNovoLancamento('despesa')}
              className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all"
            >
              <TrendingDown className="w-4 h-4" />
              <span>+ Despesa</span>
            </button>
            <button
              type="button"
              onClick={exportarCSV}
              title="Exportar Lançamentos Filtrados para CSV"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Linha com Selects de Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Tipo */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-bold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              <option value="todos">Todos os Tipos</option>
              <option value="receita">🟢 Receitas</option>
              <option value="despesa">🔴 Despesas</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-bold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo === 'receita' ? '🟢' : '🔴'} {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-bold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">Pago</option>
              <option value="recebido">Recebido</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Forma Pagto */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Forma de Pagto</label>
            <select
              value={filtroFormaPagto}
              onChange={(e) => setFiltroFormaPagto(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-bold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              <option value="todas">Todas as Formas</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="transferencia">Transferência / TED</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">De (Competência)</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-semibold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Até (Competência)</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl border font-semibold ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[11px] uppercase tracking-wider font-black ${
                isWhite ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#0F172A] border-slate-800 text-slate-400'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Data / Competência</th>
                <th className="py-3 px-4">Descrição & Fornecedor</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Forma</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Valor (R$)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {lancamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Nenhum lançamento financeiro encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                lancamentosFiltrados.map((item) => {
                  const isRec = item.tipo === 'receita';
                  const isPagoOuRecebido = item.status === 'pago' || item.status === 'recebido';
                  const isCancelado = item.status === 'cancelado';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCancelado
                          ? 'opacity-40 bg-slate-900/30'
                          : isWhite
                          ? 'hover:bg-slate-50'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Datas */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200">
                          {item.dataCompetencia || item.criadoEm.split('T')[0]}
                        </div>
                        {item.dataVencimento && (
                          <div className="text-[10px] text-slate-400">
                            Venc: {item.dataVencimento}
                          </div>
                        )}
                      </td>

                      {/* Descrição & Fornecedor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{item.descricao}</span>
                          {item.comprovanteUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setComprovanteVisualizando({
                                  nome: item.comprovanteNome,
                                  url: item.comprovanteUrl,
                                  descricao: item.descricao,
                                })
                              }
                              title="Visualizar Comprovante / Anexo"
                              className="text-[#FF6B00] hover:text-[#FFA040]"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {item.fornecedorBeneficiario && (
                          <div className="text-[11px] text-slate-400">
                            👤 {item.fornecedorBeneficiario}
                          </div>
                        )}
                        {item.observacoes && (
                          <div className="text-[10px] text-slate-500 italic truncate max-w-xs">
                            {item.observacoes}
                          </div>
                        )}
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.categoriaNome || 'Categoria'}
                        </span>
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                          {item.origem}
                        </span>
                      </td>

                      {/* Forma de Pagamento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-300 uppercase">
                          {item.formaPagamento.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onAlternarStatus(item.id)}
                          title="Clique para alternar status (Pagar / Receber / Pendente)"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            isPagoOuRecebido
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : item.status === 'pendente'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status}</span>
                        </button>
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black font-mono text-sm ${
                            isRec ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isRec ? '+ ' : '- '}
                          R$ {item.valor.toFixed(2)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Histórico */}
                          <button
                            type="button"
                            onClick={() => onAbrirHistorico(item)}
                            title="Ver Histórico de Auditoria"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF6B00] hover:bg-slate-800 transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => onEditarLancamento(item)}
                            title="Editar Lançamento"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Cancelar ou Excluir */}
                          {!isCancelado ? (
                            <button
                              type="button"
                              onClick={() => onCancelarLancamento(item.id)}
                              title="Cancelar Lançamento"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onExcluirLancamento(item.id)}
                              title="Excluir Definitivamente"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Rodapé com Totais Consolidados */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
            isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
          }`}
        >
          <div className="text-slate-400">
            Exibindo <strong>{totais.quantidade}</strong> lançamentos no filtro ativo.
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Total Receitas</span>
              <span className="font-black text-emerald-400 text-sm">
                + R$ {totais.totalReceitas.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Total Despesas</span>
              <span className="font-black text-rose-400 text-sm">
                - R$ {totais.totalDespesas.toFixed(2)}
              </span>
            </div>
            <div className="pl-4 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">Saldo Filtrado</span>
              <span
                className={`font-black text-sm ${
                  totais.saldo >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                }`}
              >
                R$ {totais.saldo.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Visualizador de Comprovante */}
      {comprovanteVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-700'
            }`}
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Comprovante / Anexo</h3>
                <p className="text-xs text-slate-400">
                  {comprovanteVisualizando.descricao} ({comprovanteVisualizando.nome || 'Anexo'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComprovanteVisualizando(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-black/40">
              {comprovanteVisualizando.url?.startsWith('data:image') ? (
                <img
                  src={comprovanteVisualizando.url}
                  alt="Comprovante"
                  className="max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center p-8 text-slate-300">
                  <FileText className="w-16 h-16 mx-auto mb-3 text-[#FF6B00]" />
                  <p className="font-bold text-sm mb-2">{comprovanteVisualizando.nome || 'Documento Anexado'}</p>
                  <a
                    href={comprovanteVisualizando.url}
                    download={comprovanteVisualizando.nome || 'comprovante'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] text-white font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
