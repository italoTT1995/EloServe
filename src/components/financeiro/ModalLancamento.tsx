import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  Repeat,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  TipoLancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  FormaPagamentoFinanceiro,
  FrequenciaRecorrencia,
} from '../../types';

export const CATEGORIAS_SIMPLIFICADAS = {
  despesa: [
    { id: 'alimentos', nome: 'Alimentos', icone: '🥩', linhaDRE: 'cmv' as const },
    { id: 'funcionarios', nome: 'Funcionários', icone: '👥', linhaDRE: 'pessoal' as const },
    { id: 'aluguel', nome: 'Aluguel', icone: '🏠', linhaDRE: 'ocupacao' as const },
    { id: 'contas', nome: 'Contas (Água, Luz, Gás, Net)', icone: '💡', linhaDRE: 'ocupacao' as const },
    { id: 'fornecedores', nome: 'Fornecedores', icone: '📦', linhaDRE: 'cmv' as const },
    { id: 'outros', nome: 'Outros', icone: '📝', linhaDRE: 'outros' as const },
  ],
  receita: [
    { id: 'vendas', nome: 'Vendas & Entradas', icone: '💰', linhaDRE: 'receita_bruta' as const },
    { id: 'outras_receitas', nome: 'Outras Receitas', icone: '📈', linhaDRE: 'receita_bruta' as const },
  ],
};

interface ModalLancamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: {
    tipo: TipoLancamentoFinanceiro;
    descricao: string;
    categoriaId: string;
    categoriaNome: string;
    valor: number;
    data: string;
    recorrencia: 'nao_se_repete' | FrequenciaRecorrencia;
    fornecedorBeneficiario?: string;
    dataVencimento?: string;
    formaPagamento?: FormaPagamentoFinanceiro;
    status?: StatusLancamentoFinanceiro;
    observacoes?: string;
  }) => void;
  lancamentoEmEdicao?: LancamentoFinanceiro | null;
  tenantId: string;
  isWhite: boolean;
}

export function ModalLancamento({
  isOpen,
  onClose,
  onSalvar,
  lancamentoEmEdicao,
  tenantId,
  isWhite,
}: ModalLancamentoProps) {
  const [tipo, setTipo] = useState<TipoLancamentoFinanceiro>('despesa');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('alimentos');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [recorrencia, setRecorrencia] = useState<'nao_se_repete' | FrequenciaRecorrencia>('nao_se_repete');

  // Campos opcionais / secundários
  const [mostrarMaisOpcoes, setMostrarMaisOpcoes] = useState(false);
  const [fornecedor, setFornecedor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoFinanceiro>('pix');
  const [jaEstaPago, setJaEstaPago] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (lancamentoEmEdicao) {
      setTipo(lancamentoEmEdicao.tipo);
      setDescricao(lancamentoEmEdicao.descricao);
      setCategoriaId(lancamentoEmEdicao.categoriaId || (lancamentoEmEdicao.tipo === 'receita' ? 'vendas' : 'alimentos'));
      setValor(lancamentoEmEdicao.valor.toString().replace('.', ','));
      setData(lancamentoEmEdicao.dataCompetencia || new Date().toISOString().split('T')[0]);
      setRecorrencia(lancamentoEmEdicao.origem === 'recorrente' ? 'mensal' : 'nao_se_repete');
      setFornecedor(lancamentoEmEdicao.fornecedorBeneficiario || '');
      setDataVencimento(lancamentoEmEdicao.dataVencimento || '');
      setFormaPagamento(lancamentoEmEdicao.formaPagamento || 'pix');
      setJaEstaPago(lancamentoEmEdicao.status === 'pago' || lancamentoEmEdicao.status === 'recebido');
      setObservacoes(lancamentoEmEdicao.observacoes || '');
      setMostrarMaisOpcoes(!!(lancamentoEmEdicao.fornecedorBeneficiario || lancamentoEmEdicao.observacoes));
    } else {
      setTipo('despesa');
      setDescricao('');
      setCategoriaId('alimentos');
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
      setRecorrencia('nao_se_repete');
      setFornecedor('');
      setDataVencimento('');
      setFormaPagamento('pix');
      setJaEstaPago(true);
      setObservacoes('');
      setMostrarMaisOpcoes(false);
    }
  }, [lancamentoEmEdicao, isOpen]);

  if (!isOpen) return null;

  const listaCategorias = tipo === 'despesa' ? CATEGORIAS_SIMPLIFICADAS.despesa : CATEGORIAS_SIMPLIFICADAS.receita;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vNum = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(vNum) || vNum <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }
    if (!descricao.trim()) {
      alert('Por favor, informe a descrição do lançamento.');
      return;
    }

    const catObj = listaCategorias.find((c) => c.id === categoriaId) || listaCategorias[0];

    let statusFinal: StatusLancamentoFinanceiro = 'pendente';
    if (jaEstaPago) {
      statusFinal = tipo === 'receita' ? 'recebido' : 'pago';
    }

    onSalvar({
      tipo,
      descricao: descricao.trim(),
      categoriaId: catObj.id,
      categoriaNome: catObj.nome,
      valor: vNum,
      data,
      recorrencia,
      fornecedorBeneficiario: fornecedor.trim() || undefined,
      dataVencimento: dataVencimento || data,
      formaPagamento,
      status: statusFinal,
      observacoes: observacoes.trim() || undefined,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-white'
        }`}
      >
        {/* Header Simples */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isWhite ? 'border-slate-200 bg-slate-50/80' : 'border-slate-700/50 bg-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                tipo === 'despesa' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
              }`}
            >
              {tipo === 'despesa' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <h2 className={`text-base font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                {lancamentoEmEdicao ? 'Editar Lançamento' : '+ Adicionar Lançamento'}
              </h2>
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                {tipo === 'despesa' ? 'Registre um gasto ou custo do restaurante' : 'Registre uma receita ou entrada'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isWhite
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Rápido e Descomplicado */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* 1. Tipo: Despesa ou Receita */}
          <div
            className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
              isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setTipo('despesa');
                setCategoriaId('alimentos');
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tipo === 'despesa'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : isWhite
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Despesa (Gasto)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipo('receita');
                setCategoriaId('vendas');
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tipo === 'receita'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : isWhite
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Receita (Entrada)</span>
            </button>
          </div>

          {/* 2. Descrição */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              Descrição *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === 'despesa' ? 'Ex: Compra de carnes, Pagamento de garçom, Conta de luz...' : 'Ex: Vendas de eventos, Locação do espaço...'}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border focus:outline-none focus:border-[#FF6B00] ${
                isWhite
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* 3. Valor & Data (Lado a Lado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                Valor (R$) *
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-2.5 text-sm font-bold ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-base font-black font-mono border focus:outline-none focus:border-[#FF6B00] ${
                    isWhite
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                Data *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] ${
                    isWhite
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0F172A] border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 4. Categoria (6 opções simplificadas) */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              Categoria *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {listaCategorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaId(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    categoriaId === cat.id
                      ? 'bg-[#FF6B00] !text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/30 font-black scale-[1.02]'
                      : isWhite
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                      : 'bg-[#0F172A] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-base">{cat.icone}</span>
                  <span className="truncate">{cat.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Recorrência (Não se repete, Semanal, Mensal, Anual) */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 flex items-center justify-between ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Essa despesa é recorrente?</span>
              </span>
              {recorrencia !== 'nao_se_repete' && (
                <span className="text-[10px] text-amber-500 font-bold">
                  ⚡ O sistema gerará os próximos meses automaticamente
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'nao_se_repete', rotulo: 'Não se repete' },
                { id: 'semanal', rotulo: 'Semanal' },
                { id: 'mensal', rotulo: 'Mensal' },
                { id: 'anual', rotulo: 'Anual' },
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRecorrencia(rec.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    recorrencia === rec.id
                      ? 'bg-purple-600 !text-white border-purple-500 shadow-md font-black'
                      : isWhite
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {rec.rotulo}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Mais Opções (Opcional e recolhível) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setMostrarMaisOpcoes(!mostrarMaisOpcoes)}
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <span>{mostrarMaisOpcoes ? 'Ocultar detalhes adicionais' : '+ Adicionar fornecedor, forma de pagamento ou notas (opcional)'}</span>
              {mostrarMaisOpcoes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {mostrarMaisOpcoes && (
              <div
                className={`mt-3 p-3.5 rounded-2xl border space-y-3 animate-fadeIn text-xs ${
                  isWhite ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0F172A] border-slate-800 text-white'
                }`}
              >
                {/* Fornecedor / Beneficiário */}
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                    Fornecedor ou Beneficiário (Opcional)
                  </label>
                  <input
                    type="text"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    placeholder="Ex: Frigorífico Boi Gordo, Imobiliária, CPFL..."
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B00] ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Forma de Pagamento */}
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                      Forma de Pagamento
                    </label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border font-semibold focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                        isWhite
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="boleto">Boleto Bancário</option>
                      <option value="transferencia">Transferência / TED</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  {/* Status Pago / Pendente */}
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={jaEstaPago}
                        onChange={(e) => setJaEstaPago(e.target.checked)}
                        className="w-4 h-4 rounded text-[#FF6B00] focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs font-bold ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                        {tipo === 'despesa' ? 'Já foi pago (Quitado)' : 'Já foi recebido'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
                    Observações
                  </label>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Informações adicionais se desejar..."
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B00] ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div
            className={`pt-3 border-t flex items-center justify-end gap-2.5 ${
              isWhite ? 'border-slate-200' : 'border-slate-700/50'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-colors ${
                isWhite
                  ? 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lancamentoEmEdicao ? 'Salvar Alterações' : '+ Adicionar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
