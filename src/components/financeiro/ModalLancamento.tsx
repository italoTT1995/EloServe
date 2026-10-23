import React, { useState, useEffect } from 'react';
import { X, Upload, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Store, Lightbulb, Droplet, Flame, Users, Bike, Apple, Receipt } from 'lucide-react';
import {
  LancamentoFinanceiro,
  TipoLancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  FormaPagamentoFinanceiro,
  CategoriaFinanceira,
} from '../../types';

interface ModalLancamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: Omit<LancamentoFinanceiro, 'id' | 'criadoEm' | 'atualizadoEm' | 'historicoAlteracoes'>) => void;
  lancamentoEmEdicao?: LancamentoFinanceiro | null;
  categorias: CategoriaFinanceira[];
  tenantId: string;
  usuarioNome: string;
  isWhite: boolean;
}

export function ModalLancamento({
  isOpen,
  onClose,
  onSalvar,
  lancamentoEmEdicao,
  categorias,
  tenantId,
  usuarioNome,
  isWhite,
}: ModalLancamentoProps) {
  const [tipo, setTipo] = useState<TipoLancamentoFinanceiro>('despesa');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [valor, setValor] = useState('');
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [dataPagamento, setDataPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoFinanceiro>('pix');
  const [status, setStatus] = useState<StatusLancamentoFinanceiro>('pago');
  const [fornecedorBeneficiario, setFornecedorBeneficiario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [comprovanteNome, setComprovanteNome] = useState<string | undefined>();
  const [comprovanteUrl, setComprovanteUrl] = useState<string | undefined>();
  const [motivoEdicao, setMotivoEdicao] = useState('');

  // Sincroniza formulário ao abrir para edição ou novo
  useEffect(() => {
    if (lancamentoEmEdicao) {
      setTipo(lancamentoEmEdicao.tipo);
      setDescricao(lancamentoEmEdicao.descricao);
      setCategoriaId(lancamentoEmEdicao.categoriaId);
      setValor(lancamentoEmEdicao.valor.toString().replace('.', ','));
      setDataCompetencia(lancamentoEmEdicao.dataCompetencia || new Date().toISOString().split('T')[0]);
      setDataVencimento(lancamentoEmEdicao.dataVencimento || new Date().toISOString().split('T')[0]);
      setDataPagamento(lancamentoEmEdicao.dataPagamento || '');
      setFormaPagamento(lancamentoEmEdicao.formaPagamento);
      setStatus(lancamentoEmEdicao.status);
      setFornecedorBeneficiario(lancamentoEmEdicao.fornecedorBeneficiario || '');
      setObservacoes(lancamentoEmEdicao.observacoes || '');
      setComprovanteNome(lancamentoEmEdicao.comprovanteNome);
      setComprovanteUrl(lancamentoEmEdicao.comprovanteUrl);
      setMotivoEdicao('');
    } else {
      setTipo('despesa');
      setDescricao('');
      const catInicial = categorias.find((c) => c.tipo === 'despesa');
      setCategoriaId(catInicial ? catInicial.id : categorias[0]?.id || '');
      setValor('');
      const hoje = new Date().toISOString().split('T')[0];
      setDataCompetencia(hoje);
      setDataVencimento(hoje);
      setDataPagamento(hoje);
      setFormaPagamento('pix');
      setStatus('pago');
      setFornecedorBeneficiario('');
      setObservacoes('');
      setComprovanteNome(undefined);
      setComprovanteUrl(undefined);
      setMotivoEdicao('');
    }
  }, [lancamentoEmEdicao, isOpen, categorias]);

  // Filtra categorias pelo tipo selecionado (Receita ou Despesa)
  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  // Quando alterna o tipo (receita / despesa), reajusta categoria e status
  function handleAlternarTipo(novoTipo: TipoLancamentoFinanceiro) {
    setTipo(novoTipo);
    const cat = categorias.find((c) => c.tipo === novoTipo);
    if (cat) setCategoriaId(cat.id);
    if (novoTipo === 'receita' && status === 'pago') {
      setStatus('recebido');
    } else if (novoTipo === 'despesa' && status === 'recebido') {
      setStatus('pago');
    }
  }

  // Upload de comprovante
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setComprovanteNome(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setComprovanteUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valNum = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    if (!valNum || valNum <= 0) {
      alert('Informe um valor numérico válido maior que zero.');
      return;
    }

    if (!descricao.trim()) {
      alert('Informe a descrição do lançamento.');
      return;
    }

    const catObj = categorias.find((c) => c.id === categoriaId) || categorias[0];

    onSalvar({
      tenantId,
      descricao: descricao.trim(),
      tipo,
      categoriaId: catObj?.id || 'outros',
      categoriaNome: catObj?.nome || 'Geral',
      valor: valNum,
      dataCompetencia,
      dataVencimento: dataVencimento || dataCompetencia,
      dataPagamento: (status === 'pago' || status === 'recebido') ? (dataPagamento || dataCompetencia) : undefined,
      formaPagamento,
      status,
      fornecedorBeneficiario: fornecedorBeneficiario.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      comprovanteNome,
      comprovanteUrl,
      origem: lancamentoEmEdicao ? lancamentoEmEdicao.origem : 'manual',
      recorrenciaId: lancamentoEmEdicao?.recorrenciaId,
      parcelaInfo: lancamentoEmEdicao?.parcelaInfo,
      cadastradoPor: usuarioNome || 'Gestor Financeiro',
    });

    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto ${
        isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-700'
      }`}>
        {/* Header do Modal */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0F172A]'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00]">
              {lancamentoEmEdicao ? 'Editar Registro Financeiro' : 'Novo Lançamento Financeiro'}
            </span>
            <h2 className={`text-base font-extrabold flex items-center gap-2 ${
              isWhite ? 'text-slate-900' : 'text-white'
            }`}>
              <DollarSign className="w-5 h-5 text-[#FF6B00]" />
              <span>{lancamentoEmEdicao ? `Editar: ${lancamentoEmEdicao.descricao}` : 'Cadastrar Receita ou Despesa'}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Seletor Tipo: Despesa vs Receita */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Tipo de Operação *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAlternarTipo('despesa')}
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipo === 'despesa'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                    : isWhite
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🔻 Despesa (Saída de Caixa)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlternarTipo('receita')}
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipo === 'receita'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                    : isWhite
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>🟢 Receita (Entrada de Caixa)</span>
              </button>
            </div>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Descrição do Lançamento *
              </label>
              <input
                type="text"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder={tipo === 'despesa' ? 'Ex: Aluguel Comercial, Conta de Luz, Compra de Carnes' : 'Ex: Evento Corporativo, Locação de Espaço'}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  isWhite
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-[#FF6B00]'
                    : 'bg-[#0F172A] border-slate-700 text-white focus:border-[#FF6B00]'
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Valor (R$) *
              </label>
              <input
                type="text"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-black font-mono border transition-colors ${
                  tipo === 'despesa' ? 'text-rose-400' : 'text-[#10B981]'
                } ${
                  isWhite ? 'bg-slate-50 border-slate-300' : 'bg-[#0F172A] border-slate-700'
                }`}
              />
            </div>
          </div>

          {/* Categoria e Fornecedor/Beneficiário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Categoria Financeira (DRE) *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                {categoriasDoTipo.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome} ({cat.linhaDRE.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {tipo === 'despesa' ? 'Fornecedor / Beneficiário' : 'Cliente / Pagador'}
              </label>
              <input
                type="text"
                value={fornecedorBeneficiario}
                onChange={(e) => setFornecedorBeneficiario(e.target.value)}
                placeholder={tipo === 'despesa' ? 'Ex: Distribuidora Ambev, Enel, Imobiliária' : 'Ex: Empresa XYZ, Cliente Particular'}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* Datas: Competência, Vencimento, Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Data Competência (DRE) *
              </label>
              <input
                type="date"
                required
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Mês contábil do fato gerador</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Data Vencimento *
              </label>
              <input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Prazo limite de liquidação</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {tipo === 'despesa' ? 'Data Pagamento' : 'Data Recebimento'}
              </label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                disabled={status === 'pendente' || status === 'cancelado'}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                  status === 'pendente' || status === 'cancelado'
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600'
                    : isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Data do fluxo de caixa</span>
            </div>
          </div>

          {/* Forma de Pagamento e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Forma de Pagamento *
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamentoFinanceiro)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="dinheiro">Dinheiro em Espécie</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="transferencia">Transferência / TED</option>
                <option value="outros">Outros / Vouchers</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status da Operação *
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const novoStatus = e.target.value as StatusLancamentoFinanceiro;
                  setStatus(novoStatus);
                  if ((novoStatus === 'pago' || novoStatus === 'recebido') && !dataPagamento) {
                    setDataPagamento(new Date().toISOString().split('T')[0]);
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  status === 'pago' || status === 'recebido'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : status === 'pendente'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                <option value="pendente">⏳ Pendente (Aguardando Liquidação)</option>
                {tipo === 'despesa' ? (
                  <option value="pago">✅ Pago (Liquidado no Caixa)</option>
                ) : (
                  <option value="recebido">🎉 Recebido (Entrado no Caixa)</option>
                )}
                <option value="cancelado">❌ Cancelado / Estornado</option>
              </select>
            </div>
          </div>

          {/* Anexar Comprovante / Recibo */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Comprovante / Recibo / Fatura (Opcional)
            </label>
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-700'
            }`}>
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-5 h-5 text-[#FF6B00] shrink-0" />
                <span className="text-xs font-semibold text-slate-300 truncate">
                  {comprovanteNome || 'Nenhum comprovante anexado'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {comprovanteNome && (
                  <button
                    type="button"
                    onClick={() => {
                      setComprovanteNome(undefined);
                      setComprovanteUrl(undefined);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Remover
                  </button>
                )}
                <label className="px-3 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{comprovanteNome ? 'Trocar' : 'Anexar'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais, número de nota de compra, dados bancários ou observações internas..."
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Se estiver editando, solicita motivo para auditoria */}
          {lancamentoEmEdicao && (
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1">
                Motivo da Alteração (Histórico de Auditoria)
              </label>
              <input
                type="text"
                value={motivoEdicao}
                onChange={(e) => setMotivoEdicao(e.target.value)}
                placeholder="Ex: Correção de valor da nota, atualização de data de pagamento"
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#0F172A] border border-slate-700 text-white font-medium"
              />
            </div>
          )}

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
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
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white text-xs font-extrabold shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lancamentoEmEdicao ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
