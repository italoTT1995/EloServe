import React from 'react';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LancamentoRecorrente, CategoriaFinanceira } from '../../types';

interface RecorrenciasSectionProps {
  recorrencias: LancamentoRecorrente[];
  categorias: CategoriaFinanceira[];
  isWhite: boolean;
  onNovaRecorrencia: () => void;
  onEditarRecorrencia: (recorrencia: LancamentoRecorrente) => void;
  onAlternarAtivo: (id: string) => void;
  onExcluirRecorrencia: (id: string) => void;
  onProcessarAgora: () => void;
}

export function RecorrenciasSection({
  recorrencias,
  categorias,
  isWhite,
  onNovaRecorrencia,
  onEditarRecorrencia,
  onAlternarAtivo,
  onExcluirRecorrencia,
  onProcessarAgora,
}: RecorrenciasSectionProps) {
  const ativas = recorrencias.filter((r) => r.ativo);
  const pausadas = recorrencias.filter((r) => !r.ativo);

  const totalMensalEstimadoDespesas = ativas
    .filter((r) => r.tipo === 'despesa')
    .reduce((acc, r) => {
      if (r.frequencia === 'mensal') return acc + r.valorEstimado;
      if (r.frequencia === 'semanal') return acc + r.valorEstimado * 4.33;
      if (r.frequencia === 'anual') return acc + r.valorEstimado / 12;
      return acc;
    }, 0);

  const totalMensalEstimadoReceitas = ativas
    .filter((r) => r.tipo === 'receita')
    .reduce((acc, r) => {
      if (r.frequencia === 'mensal') return acc + r.valorEstimado;
      if (r.frequencia === 'semanal') return acc + r.valorEstimado * 4.33;
      if (r.frequencia === 'anual') return acc + r.valorEstimado / 12;
      return acc;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header com Resumo e Ações */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-purple-500/15 text-purple-500 border border-purple-500/30">
              Automação Financeira
            </span>
          </div>
          <h2 className={`text-lg font-black flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            <Repeat className="w-5 h-5 text-[#FF6B00]" />
            <span>Despesas & Receitas Recorrentes</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure despesas fixas (aluguel, salários, internet, energia) e receitas periódicas para geração automática no DRE e Contas a Pagar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onProcessarAgora}
            title="Verificar e gerar lançamentos futuros pendentes agora"
            className={`px-3.5 py-2 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Gerar Lançamentos Futuros</span>
          </button>

          <button
            type="button"
            onClick={onNovaRecorrencia}
            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Regra Recorrente</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas de Recorrência */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Despesas Fixas Mensais */}
        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
            isWhite ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Custo Fixo Mensal Estimado
          </span>
          <div className="text-xl font-black text-rose-500">
            R$ {totalMensalEstimadoDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={`text-[10px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
            Soma proporcional das despesas recorrentes ativas.
          </p>
        </div>

        {/* Total Receitas Mensais Estimadas */}
        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
            isWhite ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Receita Recorrente Estimada
          </span>
          <div className="text-xl font-black text-emerald-500">
            R$ {totalMensalEstimadoReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={`text-[10px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
            Contratos fixos e receitas previsíveis.
          </p>
        </div>

        {/* Status das Regras */}
        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
            isWhite ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Regras Configuradas
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              {ativas.length} ativas
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isWhite ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-700 text-slate-300'
            }`}>
              {pausadas.length} pausadas
            </span>
          </div>
          <p className={`text-[10px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
            Total de {recorrencias.length} automações cadastradas.
          </p>
        </div>
      </div>

      {/* Alerta de Regra de Negócio: Não marcar como pago automaticamente */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
        isWhite ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}>
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Garantia de Integridade e Não-Duplicação do EloServe:
          </p>
          <p className={`text-[11px] leading-relaxed ${isWhite ? 'text-amber-800' : 'text-amber-200/90'}`}>
            As despesas e receitas recorrentes geram parcelas futuras com status <strong>"PENDENTE"</strong>. Elas nunca são marcadas como pagas automaticamente sem a sua confirmação, assegurando que o fluxo de caixa reflita a realidade exata das contas do restaurante.
          </p>
        </div>
      </div>

      {/* Tabela de Recorrências */}
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
                <th className="py-3 px-4">Regra / Descrição</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Frequência</th>
                <th className="py-3 px-4">Dia Venc.</th>
                <th className="py-3 px-4 text-right">Valor Estimado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isWhite ? 'divide-slate-200' : 'divide-slate-800/50'}`}>
              {recorrencias.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Repeat className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Nenhuma despesa ou receita recorrente cadastrada ainda.
                  </td>
                </tr>
              ) : (
                recorrencias.map((rec) => {
                  const isRec = rec.tipo === 'receita';
                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${
                        !rec.ativo
                          ? isWhite ? 'opacity-50 bg-slate-50' : 'opacity-50 bg-slate-900/30'
                          : isWhite
                          ? 'hover:bg-slate-50/80'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Descrição & Beneficiário */}
                      <td className="py-3 px-4">
                        <div className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>{rec.descricao}</div>
                        {rec.fornecedorBeneficiario && (
                          <div className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                            👤 {rec.fornecedorBeneficiario}
                          </div>
                        )}
                        <div className={`text-[10px] ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                          Início: {rec.dataInicio} {rec.dataTermino ? `| Término: ${rec.dataTermino}` : ''}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isRec
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                          }`}
                        >
                          {rec.tipo}
                        </span>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                          {rec.categoriaNome}
                        </span>
                      </td>

                      {/* Frequência */}
                      <td className={`py-3 px-4 whitespace-nowrap capitalize font-semibold ${
                        isWhite ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {rec.frequencia}
                      </td>

                      {/* Dia Vencimento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-500">
                          Dia {rec.diaVencimento}
                        </span>
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-black ${
                            isRec ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          R$ {rec.valorEstimado.toFixed(2)}
                        </span>
                        <div className={`text-[10px] capitalize ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                          {rec.tipoValor}
                        </div>
                      </td>

                      {/* Status Ativo/Inativo */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onAlternarAtivo(rec.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 mx-auto ${
                            rec.ativo
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : isWhite
                              ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {rec.ativo ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          <span>{rec.ativo ? 'Ativo' : 'Pausado'}</span>
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditarRecorrencia(rec)}
                            title="Editar Regra Recorrente"
                            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                              isWhite ? 'hover:text-slate-900 hover:bg-slate-100' : 'hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onExcluirRecorrencia(rec.id)}
                            title="Excluir Recorrência"
                            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                              isWhite ? 'hover:text-rose-500 hover:bg-rose-50' : 'hover:text-rose-400 hover:bg-slate-800'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
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
  );
}
