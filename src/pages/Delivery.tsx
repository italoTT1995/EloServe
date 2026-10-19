import { useState, useMemo } from 'react';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  DollarSign,
  User,
  ShoppingBag,
  ExternalLink,
  Plus,
  Sliders,
  Users,
  Search,
  Check,
  Send,
  Sparkles,
  X,
  Minus,
  Trash2,
} from 'lucide-react';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { useProductStore } from '../store/useProductStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { StatusDelivery, PedidoDelivery, Produto } from '../types';

export default function Delivery() {
  const {
    pedidos,
    clientes,
    faixasTaxa,
    raioMaximoKm,
    enderecoOrigem,
    avancarStatusDelivery,
    marcarComoPago,
    atribuirEntregador,
    atualizarFaixasTaxa,
    calcularTaxaPorDistancia,
    adicionarPedidoDelivery,
  } = useDeliveryStore();

  const { tenantAtivoId } = useSaaSStore();
  const { getProdutosPorTenant } = useProductStore();
  const idLoja = tenantAtivoId === 'global' ? 'tenant-03' : tenantAtivoId;
  const produtos = getProdutosPorTenant(idLoja);

  const { funcionarios } = useFuncionarioStore();
  const entregadoresDisponiveis = funcionarios.filter((f) => f.cargo === 'entregador' && f.ativo);

  const [abaAtiva, setAbaAtiva] = useState<'pedidos' | 'taxas' | 'clientes'>('pedidos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'delivery' | 'retirada'>('todos');
  const [buscaCliente, setBuscaCliente] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Estados do Modal Novo Pedido Delivery
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);
  const [novoTipo, setNovoTipo] = useState<'delivery' | 'retirada'>('delivery');
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');
  const [novoRua, setNovoRua] = useState('');
  const [novoNumero, setNovoNumero] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoCidade, setNovoCidade] = useState('Belo Horizonte');
  const [novoComplemento, setNovoComplemento] = useState('');
  const [novoPontoReferencia, setNovoPontoReferencia] = useState('');
  const [novoDistanciaKm, setNovoDistanciaKm] = useState(2.0);
  const [novoObs, setNovoObs] = useState('');
  const [novoFormaPagamento, setNovoFormaPagamento] = useState<'pix' | 'maquininha_entrega' | 'dinheiro'>('pix');
  const [itensNovoPedido, setItensNovoPedido] = useState<{ produto: Produto; quantidade: number }[]>([]);
  const [buscaProdutoNovo, setBuscaProdutoNovo] = useState('');

  const subtotalNovoPedido = useMemo(() => {
    return itensNovoPedido.reduce((acc, i) => acc + i.produto.precoVenda * i.quantidade, 0);
  }, [itensNovoPedido]);

  const taxaEntregaNovoPedido = useMemo(() => {
    if (novoTipo === 'retirada') return 0;
    return calcularTaxaPorDistancia(novoDistanciaKm);
  }, [novoTipo, novoDistanciaKm, calcularTaxaPorDistancia]);

  const totalNovoPedido = subtotalNovoPedido + taxaEntregaNovoPedido;

  const produtosFiltradosBusca = useMemo(() => {
    return produtos.filter((p) => {
      if (p.disponivel === false) return false;
      if (!buscaProdutoNovo.trim()) return true;
      return (
        p.nome.toLowerCase().includes(buscaProdutoNovo.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(buscaProdutoNovo.toLowerCase()))
      );
    });
  }, [produtos, buscaProdutoNovo]);

  function handleAdicionarItemNovoPedido(prod: Produto) {
    setItensNovoPedido((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === prod.id);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], quantidade: copia[idx].quantidade + 1 };
        return copia;
      }
      return [...prev, { produto: prod, quantidade: 1 }];
    });
  }

  function handleAlterarQtdItemNovoPedido(prodId: string, delta: number) {
    setItensNovoPedido((prev) => {
      return prev
        .map((i) => {
          if (i.produto.id === prodId) {
            const novaQtd = i.quantidade + delta;
            return novaQtd > 0 ? { ...i, quantidade: novaQtd } : null;
          }
          return i;
        })
        .filter(Boolean) as { produto: Produto; quantidade: number }[];
    });
  }

  function handleCriarPedidoDelivery() {
    if (!novoClienteNome.trim()) {
      dispararToast('Informe o nome do cliente!');
      return;
    }
    if (!novoClienteTelefone.trim()) {
      dispararToast('Informe o telefone do cliente!');
      return;
    }
    if (novoTipo === 'delivery' && (!novoRua.trim() || !novoNumero.trim())) {
      dispararToast('Informe a rua e o número para entrega em domicílio!');
      return;
    }
    if (itensNovoPedido.length === 0) {
      dispararToast('Adicione pelo menos 1 item ao pedido!');
      return;
    }

    adicionarPedidoDelivery({
      tipo: novoTipo,
      clienteNome: novoClienteNome.trim(),
      clienteTelefone: novoClienteTelefone.trim(),
      endereco:
        novoTipo === 'delivery'
          ? {
              rua: novoRua.trim(),
              numero: novoNumero.trim(),
              bairro: novoBairro.trim() || 'Savassi',
              cidade: novoCidade.trim() || 'Belo Horizonte',
              complemento: novoComplemento.trim() || undefined,
              pontoReferencia: novoPontoReferencia.trim() || undefined,
              distanciaKm: novoDistanciaKm,
              obs: novoObs.trim() || undefined,
            }
          : undefined,
      itens: itensNovoPedido.map((it) => ({
        nome: it.produto.nome,
        quantidade: it.quantidade,
        preco: it.produto.precoVenda,
        observacoes: it.produto.descricao,
      })),
      subtotal: subtotalNovoPedido,
      taxaEntrega: taxaEntregaNovoPedido,
      total: totalNovoPedido,
      formaPagamento: novoFormaPagamento,
      status: 'preparando',
      pago: false,
    });

    dispararToast(`Pedido Delivery para ${novoClienteNome} criado e enviado à cozinha com sucesso!`);
    setModalNovoPedidoAberto(false);

    // Resetar campos
    setNovoClienteNome('');
    setNovoClienteTelefone('');
    setNovoRua('');
    setNovoNumero('');
    setNovoBairro('');
    setNovoComplemento('');
    setNovoPontoReferencia('');
    setNovoDistanciaKm(2.0);
    setNovoObs('');
    setItensNovoPedido([]);
  }

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroTipo === 'todos') return true;
    return p.tipo === filtroTipo;
  });

  const pedidosEmPreparo = pedidosFiltrados.filter((p) => p.status === 'preparando');
  const pedidosProntos = pedidosFiltrados.filter((p) => p.status === 'pronto');
  const pedidosACaminho = pedidosFiltrados.filter((p) => p.status === 'a_caminho' || p.status === 'retirado');
  const pedidosEntregues = pedidosFiltrados.filter((p) => p.status === 'entregue');

  function abrirRotaMaps(endereco: PedidoDelivery['endereco']) {
    if (!endereco) return;
    const enderecoFormatado = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoFormatado)}`;
    window.open(url, '_blank');
  }

  function abrirWhatsApp(telefone: string, texto: string) {
    const limpo = telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${limpo}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Central de Delivery & Entregas</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Operação Ágil
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhamento de rotas, despacho de entregadores, taxas por raio em km e histórico de clientes.
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Na Cozinha</span>
            <span className="text-sm font-black text-amber-400 font-mono">{pedidosEmPreparo.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Aguardando Saída</span>
            <span className="text-sm font-black text-blue-400 font-mono">{pedidosProntos.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Em Rota</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{pedidosACaminho.length}</span>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navegação entre Abas & Ação Novo Pedido */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setAbaAtiva('pedidos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'pedidos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Painel de Despacho & Pedidos ({pedidos.length})</span>
          </button>

          <button
            onClick={() => setAbaAtiva('taxas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'taxas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Taxas por Raio em Km</span>
          </button>

          <button
            onClick={() => setAbaAtiva('clientes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              abaAtiva === 'clientes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes do Delivery & Histórico ({clientes.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setModalNovoPedidoAberto(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Pedido Delivery</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: PAINEL DE PEDIDOS EM TEMPO REAL                         */}
      {/* ============================================================== */}
      {abaAtiva === 'pedidos' && (
        <div className="space-y-4">
          {/* Filtro Rápido */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Exibir:</span>
            {(['todos', 'delivery', 'retirada'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filtroTipo === tipo
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {tipo === 'todos' ? 'Todos os Pedidos' : tipo === 'delivery' ? '🛵 Somente Delivery' : '🛍️ Somente Retirada'}
              </button>
            ))}
          </div>

          {/* Grid de Pedidos por Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosFiltrados.map((p) => {
              const isDelivery = p.tipo === 'delivery';

              return (
                <div
                  key={p.id}
                  className={`bg-slate-900 border rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                    p.status === 'a_caminho'
                      ? 'border-indigo-500/50 shadow-indigo-950/20'
                      : p.status === 'pronto'
                      ? 'border-emerald-500/50 shadow-emerald-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header do Pedido */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-black text-white">#{p.numero}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              isDelivery
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {p.tipo}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white mt-1">{p.clienteNome}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{p.clienteTelefone}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase block ${
                            p.status === 'preparando'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : p.status === 'pronto'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 animate-pulse'
                              : p.status === 'a_caminho'
                              ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.status === 'preparando'
                            ? 'Cozinha Preparando'
                            : p.status === 'pronto'
                            ? 'Pronto para Saída'
                            : p.status === 'a_caminho'
                            ? 'Entregador em Rota'
                            : 'Entregue'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Às {p.horario}</span>
                      </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Itens:</p>
                      <div className="bg-slate-950/70 rounded-2xl p-2.5 border border-slate-800 space-y-1">
                        {p.itens.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                            <span>{item.quantidade}x {item.nome}</span>
                            <span className="font-mono text-slate-400">R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Endereço de Entrega (se for delivery) */}
                    {isDelivery && p.endereco && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-white text-[11px]">
                                {p.endereco.rua}, {p.endereco.numero} {p.endereco.complemento && `(${p.endereco.complemento})`}
                              </p>
                              <p className="text-slate-400 text-[10px]">{p.endereco.bairro} • {p.endereco.cidade}</p>
                              {p.endereco.obs && (
                                <p className="text-amber-400 text-[10px] mt-0.5 font-medium">⚠️ {p.endereco.obs}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => abrirRotaMaps(p.endereco)}
                            title="Abrir no Google Maps"
                            className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Rota</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Entregador Designado */}
                    {isDelivery && (
                      <div className="flex items-center justify-between text-xs p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Entregador:</span>
                        </span>
                        {p.entregadorNome ? (
                          <span className="font-bold text-white text-xs">{p.entregadorNome}</span>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                atribuirEntregador(p.id, e.target.value);
                                dispararToast(`Pedido #${p.numero} despachado com ${e.target.value}!`);
                              }
                            }}
                            className="px-2 py-1 bg-slate-900 border border-indigo-500/40 rounded-lg text-[10px] text-indigo-300 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="">Atribuir Entregador...</option>
                            {entregadoresDisponiveis.map((e) => (
                              <option key={e.id} value={`${e.nome} ${e.sobrenome} (${e.veiculo?.modelo || 'Moto'})`}>
                                {e.nome} - {e.veiculo?.placa || 'Sem Placa'}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* Total & Pagamento */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Total com Entrega:</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          R$ {p.total.toFixed(2)}
                        </span>
                        {p.taxaEntrega > 0 && (
                          <span className="text-[10px] text-slate-500 block font-mono">Taxa: R$ {p.taxaEntrega.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="text-right">
                        {p.pago ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            ✓ Pago ({p.formaPagamento === 'pix' ? 'Pix Online' : 'Cartão'})
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              marcarComoPago(p.id);
                              dispararToast(`Pagamento do Pedido #${p.numero} confirmado!`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-emerald-500 hover:text-white border border-amber-500/40 text-[10px] font-bold cursor-pointer transition-all"
                          >
                            Pendente (Confirmar Recebimento)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ação de Avançar Status */}
                  <div className="pt-2">
                    {p.status !== 'entregue' && (
                      <button
                        onClick={() => {
                          avancarStatusDelivery(p.id);
                          dispararToast(`Status do Pedido #${p.numero} atualizado!`);
                        }}
                        className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {p.status === 'preparando'
                            ? 'Marcar como Pronto'
                            : p.status === 'pronto'
                            ? (isDelivery ? 'Despachar para Entrega' : 'Cliente Retirou no Balcão')
                            : 'Confirmar Entrega Concluída'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: CONFIGURAÇÃO DE TAXAS POR RAIO EM KM (SEÇÃO 8.4 - 8.6)  */}
      {/* ============================================================== */}
      {abaAtiva === 'taxas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Configuração da Área de Entrega & Taxas por Distância</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Defina o raio circular de atendimento do restaurante e os valores cobrados por cada faixa de quilômetros.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Endereço Central de Origem:</span>
            <p className="text-white font-bold text-sm">{enderecoOrigem}</p>
            <p className="text-[11px] text-slate-400">Raio Máximo Circular de Cobertura: <strong className="text-white">{raioMaximoKm} km</strong></p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tabela de Faixas & Preços Configuradas:
            </p>

            <div className="space-y-2 text-xs">
              {faixasTaxa.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Navigation className="w-4 h-4 text-indigo-400" />
                    <span>Entregas em até {f.ateKm} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Taxa cobrada:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      R$ {f.taxa.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: HISTÓRICO DE CLIENTES DE DELIVERY (SEÇÃO 8.2 - 8.3)     */}
      {/* ============================================================== */}
      {abaAtiva === 'clientes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder="Buscar cliente por nome ou WhatsApp..."
                className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientes
              .filter((c) => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) || c.telefone.includes(buscaCliente))
              .map((c) => {
                const isAniversarioPerto = c.dataNascimento.includes('/10/');
                const isSemPedir7Dias = c.dataUltimoPedido === '06/10/2026';

                return (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                    <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-base font-black text-white">{c.nome}</h4>
                        <p className="text-xs text-emerald-400 font-mono">{c.telefone}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Nasc: {c.dataNascimento}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Último Pedido ({c.dataUltimoPedido}):</span>
                        <p className="font-semibold text-white text-[11px]">{c.descricaoUltimoPedido}</p>
                        <p className="font-mono text-emerald-400 font-bold">R$ {c.valorUltimoPedido.toFixed(2)}</p>
                      </div>

                      <div className="flex justify-between pt-1 text-[11px]">
                        <span className="text-slate-400">Total de Pedidos Feitos:</span>
                        <strong className="text-white font-mono">{c.totalPedidos} pedidos</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Total Consumido:</span>
                        <strong className="text-emerald-400 font-mono">R$ {c.totalGasto.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Alertas Automáticos de Marketing & Fidelidade */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      {isAniversarioPerto && (
                        <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Aniversário Próximo</span>
                          </span>
                          <button
                            onClick={() => abrirWhatsApp(c.telefone, `Olá ${c.nome}! O EloServe viu que seu aniversário está chegando! Temos um presente especial para você em seu próximo pedido!`)}
                            className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                          >
                            Enviar Cupom
                          </button>
                        </div>
                      )}

                      {isSemPedir7Dias && (
                        <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-amber-300 font-bold">7 dias sem pedir</span>
                          <button
                            onClick={() => abrirWhatsApp(c.telefone, `Oi ${c.nome}! Saudades de você no EloServe! Ganhe frete grátis usando o cupom VOLTEI hoje!`)}
                            className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold"
                          >
                            Remarketing
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO PEDIDO DE DELIVERY / BALCÃO                        */}
      {/* ============================================================== */}
      {modalNovoPedidoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Novo Pedido Delivery</h3>
                  <p className="text-xs text-slate-400">
                    Cadastre o pedido, vincule o endereço, calcule a taxa por km e despache para a cozinha.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoPedidoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador: Tipo de Pedido */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setNovoTipo('delivery')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  novoTipo === 'delivery'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Entrega em Domicílio</span>
              </button>
              <button
                type="button"
                onClick={() => setNovoTipo('retirada')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  novoTipo === 'retirada'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Retirada no Balcão</span>
              </button>
            </div>

            {/* Seleção rápida de cliente */}
            {clientes.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Puxar Cliente Cadastrado (Opcional):
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const cli = clientes.find((c) => c.id === e.target.value);
                    if (cli) {
                      setNovoClienteNome(cli.nome);
                      setNovoClienteTelefone(cli.telefone);
                      if (cli.enderecos[0]) {
                        const endStr = cli.enderecos[0];
                        const partesVirgula = endStr.split(',');
                        const rua = partesVirgula[0] || '';
                        const numParte = partesVirgula[1]?.trim() || '';
                        const restoTraco = endStr.split('-');
                        const bairroParte = restoTraco[1]?.split(',')[0]?.trim() || 'Savassi';
                        setNovoRua(rua.trim());
                        setNovoNumero(numParte);
                        setNovoBairro(bairroParte);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Selecionar cliente frequente --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} - {c.telefone} ({c.enderecos[0]?.slice(0, 35)}...)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Identificação do Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Nome do Cliente <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  placeholder="Ex: Mariana Costa"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Telefone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={novoClienteTelefone}
                  onChange={(e) => setNovoClienteTelefone(e.target.value)}
                  placeholder="(31) 98765-4321"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Endereço (se for delivery) */}
            {novoTipo === 'delivery' && (
              <div className="space-y-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Endereço de Entrega & Taxa por Distância</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Logradouro / Rua <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={novoRua}
                      onChange={(e) => setNovoRua(e.target.value)}
                      placeholder="Ex: Rua Paraíba"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Número <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={novoNumero}
                      onChange={(e) => setNovoNumero(e.target.value)}
                      placeholder="420"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Bairro</label>
                    <input
                      type="text"
                      value={novoBairro}
                      onChange={(e) => setNovoBairro(e.target.value)}
                      placeholder="Savassi"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Complemento</label>
                    <input
                      type="text"
                      value={novoComplemento}
                      onChange={(e) => setNovoComplemento(e.target.value)}
                      placeholder="Apto 501"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Distância e taxa calculada */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Distância do Restaurante:</span>
                    <span className="font-mono font-bold text-indigo-400">
                      Taxa calculada: R$ {taxaEntregaNovoPedido.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="40"
                      value={novoDistanciaKm}
                      onChange={(e) => setNovoDistanciaKm(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white text-center"
                    />
                    <span className="text-xs text-slate-400">km</span>
                    <div className="flex gap-1.5 flex-1 flex-wrap">
                      {[1.0, 2.5, 4.0, 6.0, 8.0].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setNovoDistanciaKm(km)}
                          className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            Math.abs(novoDistanciaKm - km) < 0.05
                              ? 'bg-indigo-600 text-white font-black'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {km} km
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seleção de Produtos / Itens do Pedido */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Itens do Pedido <span className="text-rose-400">*</span>
              </label>

              {/* Busca de Produtos */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaProdutoNovo}
                  onChange={(e) => setBuscaProdutoNovo(e.target.value)}
                  placeholder="Pesquisar prato, hambúrguer, bebida ou sobremesa..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Lista compacta de sugestões */}
              <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
                {produtosFiltradosBusca.slice(0, 10).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAdicionarItemNovoPedido(prod)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>{prod.nome}</span>
                    <span className="font-mono text-emerald-400 font-bold">R$ {prod.precoVenda.toFixed(2)}</span>
                  </button>
                ))}
              </div>

              {/* Itens adicionados ao pedido */}
              {itensNovoPedido.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {itensNovoPedido.map((it) => (
                    <div
                      key={it.produto.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block truncate">{it.produto.nome}</span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          R$ {it.produto.precoVenda.toFixed(2)} unit.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAlterarQtdItemNovoPedido(it.produto.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-1">{it.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleAlterarQtdItemNovoPedido(it.produto.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-extrabold text-white text-xs w-16 text-right">
                          R$ {(it.produto.precoVenda * it.quantidade).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAlterarQtdItemNovoPedido(it.produto.id, -999)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic p-1">
                  Nenhum item adicionado ainda. Clique nos produtos acima para montar o pedido.
                </p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="grid grid-cols-3 gap-2">
              {(['pix', 'maquininha_entrega', 'dinheiro'] as const).map((forma) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() => setNovoFormaPagamento(forma)}
                  className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    novoFormaPagamento === forma
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-extrabold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {forma === 'pix' ? 'PIX' : forma === 'dinheiro' ? 'Dinheiro' : 'Cartão / Maquininha'}
                </button>
              ))}
            </div>

            {/* Observações */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Observações do Pedido (opcional):</label>
              <input
                type="text"
                value={novoObs}
                onChange={(e) => setNovoObs(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne ao ponto, troco para 50..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Resumo Financeiro */}
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Itens:</span>
                <span className="font-mono text-slate-200">R$ {subtotalNovoPedido.toFixed(2)}</span>
              </div>
              {novoTipo === 'delivery' && (
                <div className="flex justify-between text-indigo-300">
                  <span>Taxa de Entrega ({novoDistanciaKm} km):</span>
                  <span className="font-mono font-semibold">+ R$ {taxaEntregaNovoPedido.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-800">
                <span className="text-sm font-bold text-white">Total a Receber:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  R$ {totalNovoPedido.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalNovoPedidoAberto(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCriarPedidoDelivery}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Enviar à Cozinha</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
