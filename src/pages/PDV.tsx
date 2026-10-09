import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  X,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';


export default function PDV() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [formaSelecionada, setFormaSelecionada] = useState<'dinheiro' | 'pix' | 'debito' | 'credito'>('pix');
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [vendaSucesso, setVendaSucesso] = useState(false);

  const {
    itens,
    tipoPedido,
    mesaNumero,
    descontoReais,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    definirDesconto,
    definirTipoPedido,
    limparCarrinho,
    getTotalBruto,
    getTotalLiquido,
  } = useCartStore();

  const { registrarVendaCaixa } = useAppStore();
  const { produtos, categorias } = useProductStore();

  // Filtragem rápida
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((prod) => {
      if (prod.disponivel === false) return false;
      const matchCategoria = categoriaAtiva === 'todas' || prod.categoriaId === categoriaAtiva;
      const matchBusca =
        prod.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(busca.toLowerCase()));
      return matchCategoria && matchBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  const totalLiquido = getTotalLiquido();
  const valorRecebidoNum = parseFloat(valorRecebido) || 0;
  const troco = Math.max(0, valorRecebidoNum - totalLiquido);

  function finalizarVenda() {
    if (itens.length === 0) return;
    registrarVendaCaixa(totalLiquido);
    setVendaSucesso(true);
    setTimeout(() => {
      setVendaSucesso(false);
      setModalPagamentoAberto(false);
      limparCarrinho();
      setValorRecebido('');
    }, 1500);
  }

  // Atalhos de teclado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        if (itens.length > 0) setModalPagamentoAberto(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itens]);

  return (
    <div className="h-full flex gap-5 select-none">
      {/* Coluna Esquerda: Catálogo e Produtos */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior: Busca & Filtro de Categorias */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item pelo nome ou código de barras... (Pressione '/' para buscar)"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categorias em pílulas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoriaAtiva('todas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                categoriaAtiva === 'todas'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Todos os Itens
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  categoriaAtiva === cat.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {produtosFiltrados.map((prod) => (
              <div
                key={prod.id}
                onClick={() => adicionarItem(prod)}
                className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-xl hover:shadow-emerald-950/30 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase tracking-wider">
                      {prod.setorPreparo}
                    </span>
                    {prod.destaque && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Top
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {prod.nome}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {prod.descricao || 'Sem descrição cadastrada'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    R$ {prod.precoVenda.toFixed(2)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-500 text-slate-300 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna Direita: Carrinho & Fechamento de Venda */}
      <div className="w-96 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Topo do Carrinho */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Comanda Atual</h2>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
              {itens.reduce((acc, i) => acc + i.quantidade, 0)} itens
            </span>
          </div>

          {/* Tipo de Pedido Switcher */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => definirTipoPedido('balcao')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tipoPedido === 'balcao'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Balcão
            </button>
            <button
              onClick={() => definirTipoPedido('mesa', 1)}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tipoPedido === 'mesa'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mesa {mesaNumero ? `#${mesaNumero}` : ''}
            </button>
            <button
              onClick={() => definirTipoPedido('delivery')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tipoPedido === 'delivery'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Lista de Itens do Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {itens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShoppingCart className="w-12 h-12 mb-3 stroke-1 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Comanda vazia</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Clique nos produtos ao lado para adicionar ao pedido.
              </p>
            </div>
          ) : (
            itens.map((item) => (
              <div
                key={item.produto.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.produto.nome}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">
                      R$ {item.produto.precoVenda.toFixed(2)} cada
                    </p>
                  </div>
                  <button
                    onClick={() => removerItem(item.produto.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-white">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo Financeiro & Botão de Pagamento */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Bruto:</span>
              <span className="font-mono text-slate-200">R$ {getTotalBruto().toFixed(2)}</span>
            </div>
            {descontoReais > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Desconto:</span>
                <span className="font-mono">- R$ {descontoReais.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <span className="text-sm font-bold text-white">Total a Pagar:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                R$ {totalLiquido.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => {
                const desc = prompt('Informe o desconto em R$:', '0');
                if (desc) definirDesconto(parseFloat(desc) || 0);
              }}
              title="Aplicar Desconto"
              className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xs font-semibold"
            >
              <Percent className="w-4 h-4" />
            </button>
            <button
              onClick={limparCarrinho}
              title="Cancelar / Limpar Comanda"
              className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              disabled={itens.length === 0}
              onClick={() => setModalPagamentoAberto(true)}
              className="col-span-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Receber (F9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento & Liquidação */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">Finalizar Venda & Pagamento</h3>
                <p className="text-xs text-slate-400">Total a liquidar: <span className="font-mono text-emerald-400 font-bold">R$ {totalLiquido.toFixed(2)}</span></p>
              </div>
              <button
                onClick={() => setModalPagamentoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sucesso state */}
            {vendaSucesso ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-white">Venda Concluída com Sucesso!</h4>
                <p className="text-xs text-slate-400">Comprovante enviado para a fila de impressão e KDS atualizado.</p>
              </div>
            ) : (
              <>
                {/* Seletor de Formas de Pagamento */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setFormaSelecionada('pix')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      formaSelecionada === 'pix'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs">PIX</span>
                  </button>
                  <button
                    onClick={() => setFormaSelecionada('dinheiro')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      formaSelecionada === 'dinheiro'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs">Dinheiro</span>
                  </button>
                  <button
                    onClick={() => setFormaSelecionada('debito')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      formaSelecionada === 'debito'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Débito</span>
                  </button>
                  <button
                    onClick={() => setFormaSelecionada('credito')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      formaSelecionada === 'credito'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Crédito</span>
                  </button>
                </div>

                {/* Conteúdo Dinâmico por Meio de Pagamento */}
                {formaSelecionada === 'dinheiro' && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="text-xs text-slate-400 font-medium">Valor Recebido do Cliente:</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={valorRecebido}
                        onChange={(e) => setValorRecebido(e.target.value)}
                        placeholder={totalLiquido.toFixed(2)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {/* Botões de notas rápidas */}
                    <div className="flex gap-2">
                      {[10, 20, 50, 100].map((nota) => (
                        <button
                          key={nota}
                          onClick={() => setValorRecebido((valorRecebidoNum + nota).toString())}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          +{nota}
                        </button>
                      ))}
                    </div>
                    {valorRecebidoNum > 0 && (
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-semibold text-slate-300">Troco a Devolver:</span>
                        <span className="text-base font-black text-amber-400 font-mono">
                          R$ {troco.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {formaSelecionada === 'pix' && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      {/* Mock visual QR Code */}
                      <div className="w-36 h-36 border-4 border-slate-900 grid grid-cols-4 grid-rows-4 p-1 gap-1">
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                        <div className="bg-slate-950 rounded-sm"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Aguardando confirmação do PIX...</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">O cliente pode escanear o QR Code acima pelo app do banco.</p>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModalPagamentoAberto(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={finalizarVenda}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Venda</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
