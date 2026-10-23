import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  LancamentoRecorrente,
  CategoriaFinanceira,
  TipoLancamentoFinanceiro,
  FrequenciaRecorrencia,
  TipoValorRecorrente,
  FormaPagamentoFinanceiro,
} from '../../types';

interface ModalRecorrenciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (
    dados: Omit<LancamentoRecorrente, 'id' | 'criadoEm' | 'atualizadoEm'>,
    propagarParaFuturos?: boolean
  ) => void;
  recorrenciaEmEdicao?: LancamentoRecorrente | null;
  categorias: CategoriaFinanceira[];
  tenantId: string;
  usuarioNome?: string;
  isWhite: boolean;
}

export function ModalRecorrencia({
  isOpen,
  onClose,
  onSalvar,
  recorrenciaEmEdicao,
  categorias,
  tenantId,
  usuarioNome,
  isWhite,
}: ModalRecorrenciaProps) {
  const [tipo, setTipo] = useState<TipoLancamentoFinanceiro>('despesa');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [tipoValor, setTipoValor] = useState<TipoValorRecorrente>('fixo');
  const [frequencia, setFrequencia] = useState<FrequenciaRecorrencia>('mensal');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataTermino, setDataTermino] = useState('');
  const [diaVencimento, setDiaVencimento] = useState<number>(10);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoFinanceiro>('boleto');
  const [fornecedorBeneficiario, setFornecedorBeneficiario] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  // Opção ao editar recorrência existente
  const [propagarParaFuturos, setPropagarParaFuturos] = useState(true);

  // Categorias filtradas pelo tipo selecionado
  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  useEffect(() => {
    if (recorrenciaEmEdicao) {
      setTipo(recorrenciaEmEdicao.tipo);
      setDescricao(recorrenciaEmEdicao.descricao);
      setCategoriaId(recorrenciaEmEdicao.categoriaId);
      setValorEstimado(recorrenciaEmEdicao.valorEstimado.toString().replace('.', ','));
      setTipoValor(recorrenciaEmEdicao.tipoValor);
      setFrequencia(recorrenciaEmEdicao.frequencia);
      setDataInicio(recorrenciaEmEdicao.dataInicio.split('T')[0]);
      setDataTermino(recorrenciaEmEdicao.dataTermino ? recorrenciaEmEdicao.dataTermino.split('T')[0] : '');
      setDiaVencimento(recorrenciaEmEdicao.diaVencimento);
      setFormaPagamento(recorrenciaEmEdicao.formaPagamento);
      setFornecedorBeneficiario(recorrenciaEmEdicao.fornecedorBeneficiario || '');
      setAtivo(recorrenciaEmEdicao.ativo);
      setObservacoes(recorrenciaEmEdicao.observacoes || '');
      setPropagarParaFuturos(true);
    } else {
      setTipo('despesa');
      setDescricao('');
      setCategoriaId(categorias.find((c) => c.tipo === 'despesa')?.id || '');
      setValorEstimado('');
      setTipoValor('fixo');
      setFrequencia('mensal');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setDataTermino('');
      setDiaVencimento(10);
      setFormaPagamento('boleto');
      setFornecedorBeneficiario('');
      setAtivo(true);
      setObservacoes('');
      setPropagarParaFuturos(true);
    }
  }, [recorrenciaEmEdicao, isOpen, categorias]);

  // Se o tipo mudar e a categoria atual não pertencer ao novo tipo, ajusta para a primeira
  useEffect(() => {
    if (!categoriasDoTipo.some((c) => c.id === categoriaId)) {
      if (categoriasDoTipo.length > 0) {
        setCategoriaId(categoriasDoTipo[0].id);
      }
    }
  }, [tipo, categoriasDoTipo, categoriaId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valNum = parseFloat(valorEstimado.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valNum) || valNum <= 0) {
      alert('Informe um valor estimado válido maior que zero.');
      return;
    }
    if (!descricao.trim()) {
      alert('Informe a descrição da recorrência.');
      return;
    }

    const catObj = categorias.find((c) => c.id === categoriaId) || categorias[0];

    onSalvar(
      {
        tenantId,
        descricao: descricao.trim(),
        tipo,
        categoriaId: catObj?.id || 'outros',
        categoriaNome: catObj?.nome || 'Geral',
        valorEstimado: valNum,
        tipoValor,
        frequencia,
        dataInicio,
        dataTermino: dataTermino || undefined,
        diaVencimento: Number(diaVencimento) || 10,
        formaPagamento,
        fornecedorBeneficiario: fornecedorBeneficiario.trim() || undefined,
        ativo,
        observacoes: observacoes.trim() || undefined,
        cadastradoPor: usuarioNome || 'Gestor Financeiro',
      },
      recorrenciaEmEdicao ? propagarParaFuturos : false
    );

    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-auto ${
        isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-white'
      }`}>
        {/* Header do Modal */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isWhite ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-[#0F172A]'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00]">
              Lançamento Automático
            </span>
            <h2 className={`text-base font-extrabold flex items-center gap-2 ${
              isWhite ? 'text-slate-900' : 'text-white'
            }`}>
              <Repeat className="w-5 h-5 text-[#FF6B00]" />
              <span>{recorrenciaEmEdicao ? `Editar Recorrência: ${recorrenciaEmEdicao.descricao}` : 'Nova Despesa ou Receita Recorrente'}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isWhite
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Seletor Tipo: Despesa vs Receita Recorrente */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Tipo de Recorrência *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('despesa')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipo === 'despesa'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25'
                    : isWhite
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🔻 Despesa Fixa / Recorrente</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('receita')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipo === 'receita'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                    : isWhite
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🟢 Receita Recorrente</span>
              </button>
            </div>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Descrição da Recorrência *
              </label>
              <input
                type="text"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Aluguel Comercial, Internet Fibra, Salário Garçom"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:border-[#FF6B00] ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Valor Base (R$) *
              </label>
              <input
                type="text"
                required
                value={valorEstimado}
                onChange={(e) => setValorEstimado(e.target.value)}
                placeholder="0,00"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-black font-mono border focus:outline-none focus:border-[#FF6B00] ${
                  tipo === 'despesa' ? 'text-rose-500' : 'text-emerald-500'
                } ${
                  isWhite ? 'bg-slate-50 border-slate-300 placeholder:text-slate-400' : 'bg-[#0F172A] border-slate-700 placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Categoria e Fornecedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Categoria Contábil (DRE) *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                {categoriasDoTipo.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Fornecedor / Favorecido
              </label>
              <input
                type="text"
                value={fornecedorBeneficiario}
                onChange={(e) => setFornecedorBeneficiario(e.target.value)}
                placeholder="Ex: Imobiliária Ponto Nobre, Provedor Fibra"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:border-[#FF6B00] ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Frequência, Tipo de Valor e Dia de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Frequência *
              </label>
              <select
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value as FrequenciaRecorrencia)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                <option value="mensal">📅 Mensal (Todo Mês)</option>
                <option value="semanal">📅 Semanal (Toda Semana)</option>
                <option value="anual">📅 Anual (1x por Ano)</option>
              </select>
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Comportamento do Valor *
              </label>
              <select
                value={tipoValor}
                onChange={(e) => setTipoValor(e.target.value as TipoValorRecorrente)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                <option value="fixo">🔒 Fixo (Ex: Aluguel, Software)</option>
                <option value="variavel">📊 Variável (Ex: Luz, Água, Gás)</option>
              </select>
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Dia de Vencimento (1 a 31) *
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(parseInt(e.target.value, 10))}
                className={`w-full px-3 py-2 rounded-xl text-xs font-black font-mono border text-center focus:outline-none focus:border-[#FF6B00] ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* Vigência: Início e Fim (Opcional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Data de Início da Recorrência *
              </label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border focus:outline-none focus:border-[#FF6B00] ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Data de Término (Opcional)
              </label>
              <input
                type="date"
                value={dataTermino}
                onChange={(e) => setDataTermino(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border focus:outline-none focus:border-[#FF6B00] ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Deixe em branco se for indeterminado</span>
            </div>
          </div>

          {/* Forma de Pagamento e Status Ativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isWhite ? 'text-slate-700' : 'text-slate-400'
              }`}>
                Forma de Pagamento Padrão
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamentoFinanceiro)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                <option value="boleto">Boleto Bancário</option>
                <option value="pix">PIX Instantâneo</option>
                <option value="transferencia">Transferência / Débito em Conta</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="dinheiro">Dinheiro em Espécie</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
                />
                <span className={`text-xs font-bold ${ativo ? 'text-emerald-500' : isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  {ativo ? '🟢 Recorrência Ativa' : '⏸️ Recorrência Pausada'}
                </span>
              </label>
            </div>
          </div>

          {/* Se estiver editando, opção para propagar alterações para futuros pendentes */}
          {recorrenciaEmEdicao && (
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isWhite ? 'bg-purple-50 border-purple-200' : 'bg-purple-500/10 border-purple-500/30'
            }`}>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={propagarParaFuturos}
                  onChange={(e) => setPropagarParaFuturos(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                />
                <span className={`text-xs font-bold ${isWhite ? 'text-purple-900' : 'text-purple-300'}`}>
                  Atualizar lançamentos pendentes futuros já gerados com o novo valor e dados
                </span>
              </label>
              <p className={`text-[11px] pl-6 ${isWhite ? 'text-purple-700' : 'text-slate-400'}`}>
                Se desmarcado, as alterações afetarão apenas novas parcelas que forem geradas a partir de agora.
              </p>
            </div>
          )}

          {/* Nota importante sobre não marcar como pago automaticamente */}
          <div className={`p-3 rounded-2xl border text-[11px] flex items-start gap-2 ${
            isWhite ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-[#0F172A] border-slate-800 text-slate-400'
          }`}>
            <span className="text-amber-500 font-bold">ℹ️ Regra Contábil:</span>
            <span>
              Lançamentos recorrentes são gerados automaticamente com status <strong>Pendente</strong>. O sistema nunca os considera pagos automaticamente até que você confirme a liquidação no painel.
            </span>
          </div>

          {/* Botões do Rodapé */}
          <div className={`flex items-center justify-end gap-2.5 pt-4 border-t ${
            isWhite ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isWhite ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white text-xs font-extrabold shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{recorrenciaEmEdicao ? 'Salvar Recorrência' : 'Criar Recorrência Automática'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
