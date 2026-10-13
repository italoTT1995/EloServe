import { useState, useMemo, useEffect, useRef } from 'react';
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
  ScanBarcode,
  EyeOff,
  ChevronUp,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useWindowFocus } from '../hooks/useWindowFocus';
import { audio } from '../lib/audio';

export default function PDV() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [comandaMobileAberta, setComandaMobileAberta] = useState(false);
  const [formaSelecionada, setFormaSelecionada] = useState<'dinheiro' | 'pix' | 'debito' | 'credito'>('pix');
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [vendaSucesso, setVendaSucesso] = useState(false);
  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isFocused } = useWindowFocus();

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
  const { baixarEstoquePorVenda } = useEstoqueStore();

  // Filtragem rápida
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((prod) => {
      if (prod.disponivel === false) return false;
      const matchCategoria = categoriaAtiva === 'todas' || prod.categoriaId === categoriaAtiva;
      const matchBusca =
        prod.nome.toLowerCase().includes(busca.toLowerCase()) ||
        prod.id.toLowerCase().includes(busca.toLowerCase()) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(busca.toLowerCase()));
      return matchCategoria && matchBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  const totalLiquido = getTotalLiquido();
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const valorRecebidoNum = parseFloat(valorRecebido) || 0;
  const troco = Math.max(0, valorRecebidoNum - totalLiquido);

  // Adicionar produto ao carrinho com feedback sonoro e visual
  function handleAdicionarItem(prod: typeof produtos[0]) {
    adicionarItem(prod);
    audio.tocarBipItem();
    exibirToast(`+1 ${prod.nome}`);
  }

  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => {
      setToastNotificacao((current) => (current === msg ? null : current));
    }, 1800);
  }

  function finalizarVenda() {
    if (itens.length === 0) return;

    // Baixa automática no estoque para produtos vendidos (Seção 1.5 e 1.9 do documento)
    itens.forEach((it) => {
      baixarEstoquePorVenda(it.produto.nome, it.quantidade);
    });

    registrarVendaCaixa(totalLiquido);
    audio.tocarSucessoVenda();
    setVendaSucesso(true);
    setTimeout(() => {
      setVendaSucesso(false);
      setModalPagamentoAberto(false);
      setComandaMobileAberta(false);
      limparCarrinho();
      setValorRecebido('');
    }, 1500);
  }

  // Atalhos de teclado & Suporte automático a leitor de código de barras
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // F9 ou Ctrl+Enter para finalizar
      if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        if (itens.length > 0) setModalPagamentoAberto(true);
        return;
      }

      // Atalho '/' para focar a barra de busca
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Se o usuário estiver digitando letras/números e nenhum input estiver em foco,
      // direciona o foco para o leitor de código de barras / busca automaticamente
      const isTargetInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (!isTargetInput && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itens]);

  // Se o leitor de código de barras disparar "Enter" no input de busca
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (produtosFiltrados.length === 1) {
        handleAdicionarItem(produtosFiltrados[0]);
        setBusca('');
      } else if (produtosFiltrados.length > 1) {
        // Tenta achar match exato
        const matchExato = produtosFiltrados.find(
          (p) => p.nome.toLowerCase() === busca.trim().toLowerCase() || p.id === busca.trim()
        );
        if (matchExato) {
          handleAdicionarItem(matchExato);
          setBusca('');
        }
      }
    }
  }

  // Conteúdo do Carrinho / Comanda (reutilizado tanto no desktop quanto no drawer mobile)
  const renderCarrinhoConteudo = () => (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Topo do Carrinho */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Comanda Atual</h2>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
            {totalItens} {totalItens === 1 ? 'item' : 'itens'}
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
            onClick={() => definirTipoPedido('mesa', mesaNumero || 1)}
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
              Toque nos produtos ao lado ou bipe com o leitor para adicionar ao pedido.
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
                  title="Remover Item"
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
                    onClick={() => {
                      atualizarQuantidade(item.produto.id, item.quantidade + 1);
                      audio.tocarBipItem();
                    }}
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
            className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xs font-semibold cursor-pointer"
          >
            <Percent className="w-4 h-4" />
          </button>
          <button
            onClick={limparCarrinho}
            title="Cancelar / Limpar Comanda"
            className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center text-xs font-semibold cursor-pointer"
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
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-5 select-none relative">
      {/* Alerta de Janela Fora de Foco */}
      {!isFocused && (
        <div className="absolute top-0 inset-x-0 z-20 bg-amber-500/20 border border-amber-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center justify-between text-amber-300 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>
              <strong>Atenção:</strong> Sistema fora de foco. Clique na tela para reativar os atalhos e leitor de código de barras.
            </span>
          </div>
          <button
            onClick={() => window.focus()}
            className="px-2 py-0.5 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-[10px] font-bold uppercase tracking-wider"
          >
            Focar Tela
          </button>
        </div>
      )}

      {/* Toast flutuante de item adicionado */}
      {toastNotificacao && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastNotificacao}</span>
        </div>
      )}

      {/* Coluna Principal: Catálogo e Produtos */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Barra Superior: Busca & Filtro de Categorias */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar item pelo nome ou código de barras... (Atalho: '/')"
              className="w-full pl-11 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {busca ? (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <ScanBarcode className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:block" />
            )}
          </div>

          {/* Categorias em pílulas deslizáveis */}
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

        {/* Grid Responsivo de Produtos */}
        <div className="flex-1 overflow-y-auto pr-1">
          {produtosFiltrados.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <AlertCircle className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Nenhum item encontrado</p>
              <p className="text-xs text-slate-500 mt-0.5">Tente buscar por outro termo ou selecione outra categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {produtosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleAdicionarItem(prod)}
                  className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-3 sm:p-4 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:shadow-xl hover:shadow-emerald-950/30 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase tracking-wider">
                        {prod.setorPreparo}
                      </span>
                      {prod.destaque && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Top
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {prod.nome}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {prod.descricao || 'Item padrão do cardápio'}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                      R$ {prod.precoVenda.toFixed(2)}
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-500 text-slate-300 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coluna Direita (Desktop): Carrinho Fixo */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-slate-900 border border-slate-800 rounded-3xl flex-col h-full overflow-hidden shadow-2xl shrink-0">
        {renderCarrinhoConteudo()}
      </div>

      {/* Floating Bottom Bar (Mobile/Tablet < lg): Barra de Comanda */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-30 bg-slate-900/95 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center justify-between">
        <button
          onClick={() => setComandaMobileAberta(true)}
          className="flex items-center gap-2 sm:gap-3 text-left min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[11px] text-slate-400 font-semibold block truncate">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'} no pedido
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
              R$ {totalLiquido.toFixed(2)}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setComandaMobileAberta(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Ver Pedido
          </button>
          <button
            disabled={itens.length === 0}
            onClick={() => setModalPagamentoAberto(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Receber (F9)
          </button>
        </div>
      </div>

      {/* Drawer / Modal Mobile da Comanda */}
      {comandaMobileAberta && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Detalhes do Pedido
              </span>
              <button
                onClick={() => setComandaMobileAberta(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderCarrinhoConteudo()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento & Liquidação */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">Finalizar Venda & Pagamento</h3>
                <p className="text-xs text-slate-400">
                  Total a liquidar: <span className="font-mono text-emerald-400 font-bold">R$ {totalLiquido.toFixed(2)}</span>
                </p>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setFormaSelecionada('pix')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
                    <div className="flex gap-2 flex-wrap">
                      {[10, 20, 50, 100].map((nota) => (
                        <button
                          key={nota}
                          onClick={() => setValorRecebido((valorRecebidoNum + nota).toString())}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
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
                      <div className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-slate-900 grid grid-cols-4 grid-rows-4 p-1 gap-1">
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
                    className="flex-1 py-3 rounded-2xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
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
