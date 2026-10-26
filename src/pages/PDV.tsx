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
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageSquare,
  RotateCcw,
  History,
  Bike,
  MapPin,
  Phone,
  Pencil,
  Printer,
} from 'lucide-react';
import { impressaoTermicaService } from '../services/impressaoTermicaService';
import { ModalConfiguracaoImpressao } from '../components/impressao/ModalConfiguracaoImpressao';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useEloBotStore } from '../store/useEloBotStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useWindowFocus } from '../hooks/useWindowFocus';
import { audio } from '../lib/audio';
import { VendaRealizada } from '../types';

export default function PDV() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [modalImpressaoConfigAberto, setModalImpressaoConfigAberto] = useState(false);
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

  const { registrarVenda, vendas, cancelarVenda, operadorAtivo } = useAppStore();
  const { tenantAtivoId, getTenantAtivo } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const { getProdutosPorTenant, getCategoriasPorTenant } = useProductStore();
  const idLoja = !tenantAtivoId || tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const produtos = getProdutosPorTenant(idLoja);
  const categorias = getCategoriasPorTenant(idLoja);
  const { processarBaixaVenda } = useEstoqueStore();
  const { getTotalTransbordosPendentes } = useEloBotStore();
  const pendentesTransbordo = getTotalTransbordosPendentes(idLoja);

  // Integração com Módulo de Delivery & Taxas
  const { calcularTaxaPorDistancia, adicionarPedidoDelivery, clientes: clientesCadastrados } = useDeliveryStore();

  const [modalDadosDeliveryAberto, setModalDadosDeliveryAberto] = useState(false);
  const [dadosEntrega, setDadosEntrega] = useState<{
    clienteNome: string;
    clienteTelefone: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep?: string;
    complemento?: string;
    pontoReferencia?: string;
    distanciaKm: number;
    taxaEntrega: number;
    obs?: string;
  }>({
    clienteNome: '',
    clienteTelefone: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: 'Belo Horizonte',
    distanciaKm: 2.0,
    taxaEntrega: 4.5,
    obs: '',
  });

  function handleAtualizarDistancia(km: number) {
    const kmValido = Math.max(0.1, km);
    const taxa = calcularTaxaPorDistancia(kmValido);
    setDadosEntrega((prev) => ({
      ...prev,
      distanciaKm: kmValido,
      taxaEntrega: taxa,
    }));
  }

  // Estados de Histórico / Estorno de Vendas no PDV
  const [modalEstornoAberto, setModalEstornoAberto] = useState(false);
  const [vendaParaEstorno, setVendaParaEstorno] = useState<VendaRealizada | null>(null);
  const [motivoEstorno, setMotivoEstorno] = useState('Desistência do cliente');

  // Navegação horizontal / Arrastar Categorias com o mouse (Drag-to-Scroll)
  const categoriasBarRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDownCat, setIsMouseDownCat] = useState(false);
  const [startXCat, setStartXCat] = useState(0);
  const [scrollLeftCat, setScrollLeftCat] = useState(0);
  const [arrastouCat, setArrastouCat] = useState(false);

  function handleMouseDownCategorias(e: React.MouseEvent) {
    if (e.button !== 0 || !categoriasBarRef.current) return;
    setIsMouseDownCat(true);
    setArrastouCat(false);
    setStartXCat(e.pageX - categoriasBarRef.current.offsetLeft);
    setScrollLeftCat(categoriasBarRef.current.scrollLeft);
  }

  function handleMouseMoveCategorias(e: React.MouseEvent) {
    if (!isMouseDownCat || !categoriasBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriasBarRef.current.offsetLeft;
    const walk = (x - startXCat) * 1.5;
    if (Math.abs(walk) > 4) {
      setArrastouCat(true);
    }
    categoriasBarRef.current.scrollLeft = scrollLeftCat - walk;
  }

  function handleMouseUpCategorias() {
    setIsMouseDownCat(false);
    setTimeout(() => setArrastouCat(false), 60);
  }

  function rolarCategorias(direcao: 'esq' | 'dir') {
    if (!categoriasBarRef.current) return;
    const offset = direcao === 'esq' ? -220 : 220;
    categoriasBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }

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

  const taxaEntregaCalculada = tipoPedido === 'delivery' ? dadosEntrega.taxaEntrega : 0;
  const totalLiquido = getTotalLiquido();
  const totalComEntrega = totalLiquido + taxaEntregaCalculada;
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const valorRecebidoNum = parseFloat(valorRecebido) || 0;
  const troco = Math.max(0, valorRecebidoNum - totalComEntrega);

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

    const vendaId = `VD-${Date.now().toString().slice(-6)}`;
    const agoraDataHora =
      new Date().toLocaleDateString('pt-BR') +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalBruto = getTotalBruto();
    const novaVenda: VendaRealizada = {
      id: vendaId,
      tenantId: idLoja,
      tipoOrigem: tipoPedido,
      mesaNumero: tipoPedido === 'mesa' ? mesaNumero || undefined : undefined,
      dataHora: agoraDataHora,
      total: totalComEntrega,
      subtotalBruto: totalBruto,
      desconto: descontoReais,
      taxaEntrega: tipoPedido === 'delivery' ? taxaEntregaCalculada : undefined,
      formaPagamento: formaSelecionada,
      itens: itens.map((it) => ({
        produtoId: it.produto.id,
        nome: it.produto.nome,
        quantidade: it.quantidade,
        precoUnitario: it.produto.precoVenda,
        subtotal: it.subtotal,
        fichaTecnica: it.produto.fichaTecnica,
      })),
      operador: operadorAtivo || 'Operador Caixa',
      status: 'concluida',
    };

    // Baixa automática no estoque calculada pelas fichas técnicas dos pratos vendidos
    processarBaixaVenda(novaVenda);

    // Registra a venda no fluxo do caixa
    registrarVenda(novaVenda);

    // Se for Delivery, registra o pedido no Kanban de Entregas e KDS
    if (tipoPedido === 'delivery') {
      const formaDelivery: 'pix' | 'maquininha_entrega' | 'dinheiro' =
        formaSelecionada === 'dinheiro'
          ? 'dinheiro'
          : formaSelecionada === 'pix'
          ? 'pix'
          : 'maquininha_entrega';

      adicionarPedidoDelivery({
        tipo: 'delivery',
        clienteNome: dadosEntrega.clienteNome || 'Cliente Delivery',
        clienteTelefone: dadosEntrega.clienteTelefone || '(31) 99999-9999',
        endereco: {
          rua: dadosEntrega.rua,
          numero: dadosEntrega.numero,
          bairro: dadosEntrega.bairro,
          cidade: dadosEntrega.cidade,
          complemento: dadosEntrega.complemento,
          pontoReferencia: dadosEntrega.pontoReferencia,
          distanciaKm: dadosEntrega.distanciaKm,
          obs: dadosEntrega.obs,
        },
        itens: itens.map((it) => ({
          nome: it.produto.nome,
          quantidade: it.quantidade,
          preco: it.produto.precoVenda,
          observacoes: it.produto.descricao,
        })),
        subtotal: totalBruto,
        taxaEntrega: taxaEntregaCalculada,
        total: totalComEntrega,
        formaPagamento: formaDelivery,
        status: 'preparando',
        pago: true,
      });
    }

    audio.tocarSucessoVenda();
    setVendaSucesso(true);

    // Dispara Impressão Automática e Silenciosa na Cozinha e no Bar se houver itens
    impressaoTermicaService.imprimirTicketCozinhaEBar({
      pedidoId: novaVenda.id,
      numeroPedido: novaVenda.id.slice(-4),
      tipo: tipoPedido === 'delivery' ? 'delivery' : 'balcao',
      clienteNome: dadosEntrega.clienteNome || (tipoPedido === 'delivery' ? 'Cliente Delivery' : 'Balcão'),
      garcomNome: operadorAtivo || 'Caixa',
      itens: itens.map((it) => ({
        nome: it.produto.nome,
        quantidade: it.quantidade,
        observacoes: it.produto.descricao,
      })),
      nomeRestaurante: tenantAtual?.nomeFantasia || 'EloGastrô',
    });
    setTimeout(() => {
      setVendaSucesso(false);
      setModalPagamentoAberto(false);
      setComandaMobileAberta(false);
      limparCarrinho();
      setValorRecebido('');
    }, 1500);
  }

  function handleConfirmarEstorno() {
    if (!vendaParaEstorno) return;
    const res = cancelarVenda(vendaParaEstorno.id, motivoEstorno, operadorAtivo);
    if (res.sucesso) {
      exibirToast(`Venda #${vendaParaEstorno.id} cancelada e insumos devolvidos ao estoque!`);
      setVendaParaEstorno(null);
    } else {
      exibirToast(res.mensagem || 'Erro ao estornar venda.');
    }
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
            onClick={() => {
              definirTipoPedido('delivery');
              if (!dadosEntrega.rua.trim()) {
                setModalDadosDeliveryAberto(true);
              }
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tipoPedido === 'delivery'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Resumo de Dados de Entrega para Pedidos Delivery */}
        {tipoPedido === 'delivery' && (
          <div className="mt-2.5 p-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 text-xs space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Bike className="w-3.5 h-3.5" />
                <span>Dados de Entrega</span>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosDeliveryAberto(true)}
                className="px-2 py-0.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>{dadosEntrega.rua ? 'Alterar' : 'Preencher'}</span>
              </button>
            </div>
            {dadosEntrega.rua ? (
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p className="font-semibold text-white truncate">
                  {dadosEntrega.clienteNome || 'Cliente'} • {dadosEntrega.clienteTelefone}
                </p>
                <p className="text-slate-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                  {dadosEntrega.rua}, {dadosEntrega.numero} {dadosEntrega.bairro && `- ${dadosEntrega.bairro}`}
                </p>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-400">Distância: {dadosEntrega.distanciaKm} km</span>
                  <span className="font-bold text-sky-400 font-mono">Taxa: R$ {dadosEntrega.taxaEntrega.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModalDadosDeliveryAberto(true)}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] text-left hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-amber-400 font-bold">⚠️</span>
                <span>Endereço não informado. Clique para calcular a taxa.</span>
              </button>
            )}
          </div>
        )}
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
          {tipoPedido === 'delivery' && (
            <div className="flex justify-between text-sky-400">
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5" />
                <span>Taxa de Entrega ({dadosEntrega.distanciaKm} km):</span>
              </span>
              <span className="font-mono font-semibold">+ R$ {taxaEntregaCalculada.toFixed(2)}</span>
            </div>
          )}
          {descontoReais > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Desconto:</span>
              <span className="font-mono">- R$ {descontoReais.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
            <span className="text-sm font-bold text-white">Total a Pagar:</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              R$ {totalComEntrega.toFixed(2)}
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
            onClick={() => {
              if (tipoPedido === 'delivery' && !dadosEntrega.rua.trim()) {
                exibirToast('Por favor, informe o endereço de entrega do cliente!');
                setModalDadosDeliveryAberto(true);
                return;
              }
              setModalPagamentoAberto(true);
            }}
            className="col-span-2 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold text-xs shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
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
        {/* Alerta de Transbordo Humano no WhatsApp */}
        {pendentesTransbordo > 0 && (
          <div className="mb-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg shadow-amber-950/30 animate-pulse">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-amber-300 block truncate">
                  {pendentesTransbordo} Cliente{pendentesTransbordo > 1 ? 's' : ''} aguardando Atendimento Humano no WhatsApp!
                </span>
                <p className="text-[11px] text-amber-200/80 truncate">
                  O EloBot pausou a IA para você responder diretamente da loja.
                </p>
              </div>
            </div>
            <Link
              to="/elobot"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Atender no WhatsApp</span>
            </Link>
          </div>
        )}

        {/* Barra Superior: Busca & Filtro de Categorias */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
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

            <button
              type="button"
              onClick={() => setModalEstornoAberto(true)}
              className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              title="Consultar vendas recentes e realizar estorno de estoque"
            >
              <RotateCcw className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Vendas & Estorno ({vendas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setModalImpressaoConfigAberto(true)}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[#FF6B00] rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
              title="Configurações de Impressão Térmica Automática"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Categorias em pílulas deslizáveis com suporte a arrastar com o mouse e setas */}
          <div className="relative flex items-center gap-1.5">
            {/* Botão Rolar Esquerda */}
            <button
              type="button"
              onClick={() => rolarCategorias('esq')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
              title="Rolar categorias para a esquerda (ou arraste com o mouse)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Container Deslizável / Arrastável */}
            <div
              ref={categoriasBarRef}
              onMouseDown={handleMouseDownCategorias}
              onMouseMove={handleMouseMoveCategorias}
              onMouseUp={handleMouseUpCategorias}
              onMouseLeave={handleMouseUpCategorias}
              className={`flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none transition-colors ${
                isMouseDownCat ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (arrastouCat) return;
                  setCategoriaAtiva('todas');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
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
                  type="button"
                  onClick={() => {
                    if (arrastouCat) return;
                    setCategoriaAtiva(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    categoriaAtiva === cat.id
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.nome}
                </button>
              ))}
            </div>

            {/* Botão Rolar Direita */}
            <button
              type="button"
              onClick={() => rolarCategorias('dir')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
              title="Rolar categorias para a direita (ou arraste com o mouse)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
                    {prod.fotoUrl && (
                      <div className="w-full h-24 mb-2.5 rounded-xl overflow-hidden bg-slate-800">
                        <img src={prod.fotoUrl} alt={prod.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      </div>
                    )}
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
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white text-xs font-extrabold shadow-lg shadow-[#FF6B00]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                  Total a liquidar: <span className="font-mono text-emerald-400 font-bold">R$ {totalComEntrega.toFixed(2)}</span>
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
                        placeholder={totalComEntrega.toFixed(2)}
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
      {/* ============================================================== */}
      {/* MODAL: VENDAS DO TURNO & ESTORNO DE ESTOQUE (REQUISITO 2 E 4)   */}
      {/* ============================================================== */}
      {modalEstornoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Vendas do Turno & Estorno de Estoque
                  </h3>
                  <p className="text-xs text-slate-400">
                    Estorne pedidos para devolver automaticamente os insumos da ficha técnica ao estoque.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalEstornoAberto(false);
                  setVendaParaEstorno(null);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tela: Confirmação do Estorno */}
            {vendaParaEstorno ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Confirmar Cancelamento & Estorno da Venda #{vendaParaEstorno.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ao confirmar, os ingredientes vinculados às fichas técnicas dos pratos desta venda retornarão imediatamente ao estoque e o valor de{' '}
                    <strong className="text-white">R$ {vendaParaEstorno.total.toFixed(2)}</strong> será deduzido do caixa.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Itens que serão restituídos:
                  </span>
                  <div className="space-y-1">
                    {vendaParaEstorno.itens.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold">
                          {it.quantidade}x {it.nome}
                        </span>
                        <span className="font-mono text-emerald-400">R$ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Motivo do Cancelamento / Estorno:
                  </label>
                  <input
                    type="text"
                    required
                    value={motivoEstorno}
                    onChange={(e) => setMotivoEstorno(e.target.value)}
                    placeholder="Ex: Desistência do cliente, prato digitado incorretamente..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVendaParaEstorno(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarEstorno}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
                  >
                    Confirmar Estorno no Estoque
                  </button>
                </div>
              </div>
            ) : (
              /* Lista Geral de Vendas */
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {vendas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Nenhuma venda registrada neste turno ainda.
                  </div>
                ) : (
                  vendas.map((v) => {
                    const isCancelada = v.status === 'cancelada';
                    return (
                      <div
                        key={v.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          isCancelada
                            ? 'bg-rose-950/20 border-rose-500/30 opacity-75'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">#{v.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{v.dataHora}</span>
                            {isCancelada ? (
                              <span className="px-2 py-0.2 rounded-md bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                                Estornada / Cancelada
                              </span>
                            ) : (
                              <span className="px-2 py-0.2 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                Concluída
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">
                            {v.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}
                          </p>
                          {v.motivoCancelamento && (
                            <p className="text-[10px] text-rose-300 italic">
                              Motivo: {v.motivoCancelamento}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className="text-sm font-black font-mono text-emerald-400 block">
                            R$ {v.total.toFixed(2)}
                          </span>
                          {!isCancelada && (
                            <button
                              type="button"
                              onClick={() => {
                                setVendaParaEstorno(v);
                                setMotivoEstorno('Desistência do cliente');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Estornar Pedido
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {!vendaParaEstorno && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalEstornoAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DADOS DE ENTREGA & CÁLCULO DE TAXA POR DISTÂNCIA         */}
      {/* ============================================================== */}
      {modalDadosDeliveryAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Dados de Entrega & Taxa</h3>
                  <p className="text-xs text-slate-400">Preencha o endereço completo para calcular a taxa e despachar o motoboy.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosDeliveryAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Atalho: Clientes frequentes */}
            {clientesCadastrados.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Puxar Cliente Cadastrado (Opcional):
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const cli = clientesCadastrados.find((c) => c.id === e.target.value);
                    if (cli) {
                      const endStr = cli.enderecos[0] || '';
                      const partesVirgula = endStr.split(',');
                      const rua = partesVirgula[0] || '';
                      const numParte = partesVirgula[1]?.trim() || '';
                      const restoTraco = endStr.split('-');
                      const bairroParte = restoTraco[1]?.split(',')[0]?.trim() || 'Savassi';
                      
                      setDadosEntrega((prev) => {
                        const dist = prev.distanciaKm || 2.5;
                        return {
                          ...prev,
                          clienteNome: cli.nome,
                          clienteTelefone: cli.telefone,
                          rua: rua.trim(),
                          numero: numParte || '100',
                          bairro: bairroParte,
                          distanciaKm: dist,
                          taxaEntrega: calcularTaxaPorDistancia(dist),
                        };
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Selecione ou digite manualmente abaixo --</option>
                  {clientesCadastrados.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} - {c.telefone} ({c.enderecos[0]?.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campos do Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Nome do Cliente <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={dadosEntrega.clienteNome}
                  onChange={(e) => setDadosEntrega({ ...dadosEntrega, clienteNome: e.target.value })}
                  placeholder="Ex: Mariana Costa"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Telefone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={dadosEntrega.clienteTelefone}
                  onChange={(e) => setDadosEntrega({ ...dadosEntrega, clienteTelefone: e.target.value })}
                  placeholder="(31) 98888-7777"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Endereço Completo */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Logradouro / Rua <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dadosEntrega.rua}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, rua: e.target.value })}
                    placeholder="Ex: Rua Paraíba"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Número <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dadosEntrega.numero}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, numero: e.target.value })}
                    placeholder="420"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={dadosEntrega.bairro}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, bairro: e.target.value })}
                    placeholder="Ex: Savassi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={dadosEntrega.cidade}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, cidade: e.target.value })}
                    placeholder="Belo Horizonte"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Complemento</label>
                  <input
                    type="text"
                    value={dadosEntrega.complemento || ''}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, complemento: e.target.value })}
                    placeholder="Ex: Apto 302, Bloco B"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    value={dadosEntrega.pontoReferencia || ''}
                    onChange={(e) => setDadosEntrega({ ...dadosEntrega, pontoReferencia: e.target.value })}
                    placeholder="Ex: Próximo à Praça da Savassi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Distância e Cálculo Automático da Taxa */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>Distância do Restaurante (Km):</span>
                  </label>
                  <span className="font-mono text-xs font-black text-sky-400">
                    Taxa: R$ {dadosEntrega.taxaEntrega.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={dadosEntrega.distanciaKm}
                    onChange={(e) => handleAtualizarDistancia(parseFloat(e.target.value) || 0.1)}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white text-center focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex gap-1.5 flex-1 flex-wrap">
                    {[1.0, 2.5, 4.0, 6.0, 8.0].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => handleAtualizarDistancia(km)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          Math.abs(dadosEntrega.distanciaKm - km) < 0.05
                            ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Calculado automaticamente pelas faixas configuradas nas regras do estabelecimento.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Observações para Entrega (opcional)
                </label>
                <input
                  type="text"
                  value={dadosEntrega.obs || ''}
                  onChange={(e) => setDadosEntrega({ ...dadosEntrega, obs: e.target.value })}
                  placeholder="Ex: Tocar o interfone 3 vezes, troco para R$ 100..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Resumo de Valores Atualizados */}
            <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Itens:</span>
                <span className="font-mono text-slate-200">R$ {totalLiquido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sky-400">
                <span>Taxa de Entrega ({dadosEntrega.distanciaKm} km):</span>
                <span className="font-mono font-semibold">+ R$ {dadosEntrega.taxaEntrega.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                <span>Total com Entrega:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">
                  R$ {(totalLiquido + dadosEntrega.taxaEntrega).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalDadosDeliveryAberto(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!dadosEntrega.clienteNome.trim() || !dadosEntrega.rua.trim()) {
                    exibirToast('Informe o nome do cliente e a rua da entrega!');
                    return;
                  }
                  setModalDadosDeliveryAberto(false);
                  exibirToast('Dados de entrega e taxa vinculados ao pedido!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar e Vincular</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Impressão Térmica */}
      <ModalConfiguracaoImpressao
        isOpen={modalImpressaoConfigAberto}
        onClose={() => setModalImpressaoConfigAberto(false)}
        nomeRestaurante={tenantAtual?.nomeFantasia || 'EloGastrô'}
      />
    </div>
  );
}
