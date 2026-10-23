import React, { useState } from 'react';
import { X, Plus, Tag, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  CategoriaFinanceira,
  TipoLancamentoFinanceiro,
  LinhaDREContabil,
} from '../../types';

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (categoria: Omit<CategoriaFinanceira, 'id' | 'sistema'>) => void;
  tenantId: string;
  isWhite: boolean;
}

const LINHAS_DRE_OPCOES: { valor: LinhaDREContabil; rotulo: string; descricao: string }[] = [
  { valor: 'receita_bruta', rotulo: '1. (+) Receita Operacional Bruta', descricao: 'Vendas, entradas e receitas adicionais' },
  { valor: 'deducoes', rotulo: '2. (-) Deduções da Receita Bruta', descricao: 'Taxas, impostos fiscais e descontos' },
  { valor: 'cmv', rotulo: '4. (-) Custo das Mercadorias (CMV)', descricao: 'Alimentos, bebidas, insumos diretos e fornecedores' },
  { valor: 'pessoal', rotulo: '6.1 Despesas com Pessoal & Equipe', descricao: 'Salários, diárias extras, vales e encargos' },
  { valor: 'ocupacao', rotulo: '6.2 Ocupação & Utilidades', descricao: 'Aluguel, água, energia, gás e condomínio' },
  { valor: 'comercial', rotulo: '6.3 Comercial, Marketing & Embalagens', descricao: 'Embalagens de entrega, anúncios e promoções' },
  { valor: 'servicos', rotulo: '6.4 Serviços, Manutenção & TI', descricao: 'Software eloGastrô, internet e manutenções' },
  { valor: 'resultado_financeiro', rotulo: '7. Resultado Financeiro', descricao: 'Taxas de cartão/maquininha e despesas bancárias' },
  { valor: 'outros', rotulo: '6.5 Outras Despesas Operacionais', descricao: 'Contabilidade, consultoria e despesas gerais' },
];

export function ModalCategoria({
  isOpen,
  onClose,
  onSalvar,
  tenantId,
  isWhite,
}: ModalCategoriaProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoLancamentoFinanceiro>('despesa');
  const [linhaDRE, setLinhaDRE] = useState<LinhaDREContabil>('cmv');
  const [descricao, setDescricao] = useState('');
  const [corBadge, setCorBadge] = useState('bg-blue-500/15 text-blue-500 border-blue-500/30');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Informe o nome da categoria.');
      return;
    }

    onSalvar({
      nome: nome.trim(),
      tipo,
      linhaDRE,
      descricao: descricao.trim() || undefined,
      corBadge,
      icone: tipo === 'receita' ? 'TrendingUp' : 'Tag',
      tenantId: tenantId === 'todos' ? undefined : tenantId,
    });

    setNome('');
    setDescricao('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isWhite ? 'border-slate-200 bg-slate-50/80' : 'border-slate-700/50 bg-[#1E293B]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>Nova Categoria Financeira</h2>
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Personalize as categorias e vincule à linha correspondente no DRE oficial.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Tipo: Receita ou Despesa */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Tipo de Categoria *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipo('despesa');
                  setLinhaDRE('cmv');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tipo === 'despesa'
                    ? 'bg-rose-500 text-white border-rose-500 font-black shadow-md'
                    : isWhite
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                🔴 Despesa / Custo
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo('receita');
                  setLinhaDRE('receita_bruta');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tipo === 'receita'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-black shadow-md'
                    : isWhite
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                🟢 Receita / Entrada
              </button>
            </div>
          </div>

          {/* Nome da Categoria */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Embalagens Premium, Tráfego Pago, Manutenção de Freezers..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* Linha Contábil do DRE */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Linha Contábil no DRE *
            </label>
            <select
              value={linhaDRE}
              onChange={(e) => setLinhaDRE(e.target.value as LinhaDREContabil)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#FF6B00] cursor-pointer ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
              }`}
            >
              {LINHAS_DRE_OPCOES.map((opt) => (
                <option key={opt.valor} value={opt.valor}>
                  {opt.rotulo} — ({opt.descricao})
                </option>
              ))}
            </select>
            <p className={`text-[10px] mt-1 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Determina em qual grupo esta categoria somará nos relatórios contábeis e no DRE automatizado.
            </p>
          </div>

          {/* Descrição Opcional */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Descrição ou Finalidade (Opcional)
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva quando utilizar esta categoria..."
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF6B00] ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* Seletor de Estilo Visual / Cor */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isWhite ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Estilo Visual do Badge
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Azul', classe: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
                { label: 'Esmeralda', classe: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
                { label: 'Laranja', classe: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30' },
                { label: 'Âmbar', classe: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
                { label: 'Roxo', classe: 'bg-purple-500/15 text-purple-500 border-purple-500/30' },
                { label: 'Rosa', classe: 'bg-pink-500/15 text-pink-500 border-pink-500/30' },
                { label: 'Cinza', classe: 'bg-slate-500/15 text-slate-500 border-slate-500/30' },
              ].map((cor) => (
                <button
                  key={cor.classe}
                  type="button"
                  onClick={() => setCorBadge(cor.classe)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${cor.classe} ${
                    corBadge === cor.classe ? 'ring-2 ring-offset-1 ring-[#FF6B00] scale-105 font-black' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {cor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className={`pt-3 border-t flex items-center justify-end gap-2.5 ${
            isWhite ? 'border-slate-200' : 'border-slate-700/50'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                isWhite
                  ? 'border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cadastrar Categoria</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
