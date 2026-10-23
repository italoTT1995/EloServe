import React from 'react';
import { X, History, User, Clock, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { LancamentoFinanceiro } from '../../types';

interface ModalHistoricoProps {
  isOpen: boolean;
  onClose: () => void;
  lancamento: LancamentoFinanceiro | null;
  isWhite: boolean;
}

export function ModalHistorico({
  isOpen,
  onClose,
  lancamento,
  isWhite,
}: ModalHistoricoProps) {
  if (!isOpen || !lancamento) return null;

  const historico = lancamento.historicoAlteracoes || [];

  function formatarDataHora(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <span>Histórico de Auditoria & Alterações</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Rastreabilidade Total
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lancamento.descricao} • R$ {lancamento.valor.toFixed(2)} ({lancamento.tipo.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info do Lançamento */}
        <div className={`p-4 mx-5 mt-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
          isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Categoria</span>
            <span className="font-semibold text-slate-300">{lancamento.categoriaNome}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Status Atual</span>
            <span className="font-semibold capitalize text-amber-400">{lancamento.status}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Origem</span>
            <span className="font-semibold uppercase text-slate-300">{lancamento.origem}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Criado Em</span>
            <span className="font-semibold text-slate-300">{formatarDataHora(lancamento.criadoEm)}</span>
          </div>
        </div>

        {/* Linha do Tempo / Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {historico.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum evento registrado ainda para este lançamento.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
              {historico.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  {/* Ponto na timeline */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#FF6B00] border-2 border-[#1E293B]" />

                  <div
                    className={`p-3.5 rounded-xl border text-xs ${
                      isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="font-black text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                        {formatarDataHora(item.dataHora)}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.usuarioNome || 'Usuário do Sistema'}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-300 mb-1">
                      {item.campoAlterado}
                    </div>

                    {(item.valorAntigo !== undefined || item.valorNovo !== undefined) && (
                      <div className="flex items-center gap-2 text-[11px] font-mono bg-black/20 p-2 rounded-lg my-1.5 flex-wrap">
                        {item.valorAntigo !== undefined && (
                          <span className="line-through text-rose-400">
                            {String(item.valorAntigo)}
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-emerald-400 font-bold">
                          {String(item.valorNovo)}
                        </span>
                      </div>
                    )}

                    {item.motivo && (
                      <p className="text-[11px] text-slate-400 italic mt-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        <strong>Motivo:</strong> {item.motivo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
