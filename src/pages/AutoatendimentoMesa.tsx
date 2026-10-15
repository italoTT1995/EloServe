import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Bell,
  CheckCircle2,
  DollarSign,
  Plus,
  Minus,
  Search,
  Users,
  ChefHat,
  ShoppingBag,
  X,
  Clock,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { Produto } from '../types';

interface ItemCarrinhoCliente {
  produto: Produto;
  quantidade: number;
  observacoes: string;
}

export default function AutoatendimentoMesa() {
  const { numero } = useParams<{ numero: string }>();
  const numeroMesa = Number(numero);
  const [searchParams] = useSearchParams();

  const { getMesasPorTenant, atualizarStatusMesa, lancarItensComandaMesa, editarMesa } = useAppStore();
  const { getProdutosPorTenant, getCategoriasPorTenant } = useProductStore();
  const { getTenantAtivo, tenants } = useSaaSStore();

  const tenantQuery = searchParams.get('tenant');
  const tenantAtual = getTenantAtivo();
  const targetTenantId = tenantQuery || (tenantAtual?.id && tenantAtual.id !== 'global' ? tenantAtual.id : 'tenant-01');

  const infoTenant = tenants.find((t) => t.id === targetTenantId) || tenantAtual;

  const mesas = getMesasPorTenant(targetTenantId);
  const produtos = getProdutosPorTenant(targetTenantId);
  const categorias = getCategoriasPorTenant(targetTenantId);

  const mesa = mesas.find((m) => m.numero === numeroMesa);

  // Estados locais
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<ItemCarrinhoCliente[]>([]);
  const [produtoModal, setProdutoModal] = useState<Produto | null>(null);
  const [qtdModal, setQtdModal] = useState(1);
  const [obsModal, setObsModal] = useState('');
  const [drawerCarrinhoAberto, setDrawerCarrinhoAberto] = useState(false);
  const [modalComandaAberto, setModalComandaAberto] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal obrigatório inicial: "São quantas pessoas?" (Seção 4.12)
  const [modalInicioAberto, setModalInicioAberto] = useState(
    mesa?.status === 'livre' || !mesa?.quantidadePessoas
  );
  const [pessoasEscolhidas, setPessoasEscolhidas] = useState<number>(mesa?.capacidade || 2);
  const [nomeCliente, setNomeCliente] = useState('');

  const dispararToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtro de produtos
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      if (!p.disponivel) return false;
      const matchCategoria = categoriaAtiva === 'todas' || p.categoriaId === categoriaAtiva;
      const matchBusca =
        !busca ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()));
      return matchCategoria && matchBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  // Se a mesa não existir
  if (!mesa) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Mesa #{numero} não encontrada</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Esta mesa não está cadastrada no sistema. Por favor, chame um atendente no restaurante.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  // Ações do Cliente
  const handleConfirmarInicio = () => {
    editarMesa(mesa.numero, {
      quantidadePessoas: pessoasEscolhidas,
      responsavelNome: nomeCliente.trim() || `Cliente da Mesa #${mesa.numero}`,
      status: 'ocupada',
    }, targetTenantId);
    setModalInicioAberto(false);
    dispararToast(`Bem-vindo! Comanda iniciada para ${pessoasEscolhidas} pessoa(s).`);
  };

  const handleChamarGarcom = () => {
    atualizarStatusMesa(mesa.numero, 'chamar_garcom', targetTenantId);
    dispararToast('🔔 Garçom chamado! A equipe de salão foi notificada e já está vindo até sua mesa.');
  };

  const handlePedirConta = () => {
    atualizarStatusMesa(mesa.numero, 'aguardando_pagamento', targetTenantId);
    dispararToast('💳 Conta solicitada! O garçom trará a maquininha ou fechamento à sua mesa.');
  };

  const handleAdicionarAoCarrinho = () => {
    if (!produtoModal) return;
    setCarrinho((prev) => {
      const index = prev.findIndex(
        (item) => item.produto.id === produtoModal.id && item.observacoes === obsModal
      );
      if (index >= 0) {
        const novo = [...prev];
        novo[index].quantidade += qtdModal;
        return novo;
      }
      return [...prev, { produto: produtoModal, quantidade: qtdModal, observacoes: obsModal }];
    });
    dispararToast(`${qtdModal}x ${produtoModal.nome} adicionado ao seu pedido!`);
    setProdutoModal(null);
    setQtdModal(1);
    setObsModal('');
  };

  const totalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.produto.precoVenda * item.quantidade,
    0
  );
  const totalItensCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const handleEnviarPedidoCozinha = () => {
    if (carrinho.length === 0) return;

    const itensParaLancar = carrinho.map((item) => ({
      produtoId: item.produto.id,
      nome: item.produto.nome,
      quantidade: item.quantidade,
      precoUnitario: item.produto.precoVenda,
      subtotal: item.produto.precoVenda * item.quantidade,
      observacoes: item.observacoes || undefined,
    }));

    lancarItensComandaMesa(
      mesa.numero,
      itensParaLancar,
      mesa.responsavelNome ? `Cliente: ${mesa.responsavelNome}` : `Cliente (Mesa #${mesa.numero})`,
      targetTenantId
    );

    setCarrinho([]);
    setDrawerCarrinhoAberto(false);
    dispararToast('🎉 Pedido enviado para a cozinha! Acompanhe o preparo em tempo real.');
  };

  const totalConsumoAtual =
    mesa.comandaItens?.reduce((acc, i) => acc + i.subtotal, 0) || mesa.totalConsumo || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast flutuante */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 max-w-sm w-[90%] justify-center">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-center">{toastMsg}</span>
        </div>
      )}

      {/* Header Mobile / Tablet da Mesa */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
              #{mesa.numero}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm text-white">Mesa #{mesa.numero}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold uppercase">
                  {mesa.setor}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {infoTenant?.nomeFantasia || 'Restaurante EloServe'}
              </p>
            </div>
          </div>

          {/* Ações Rápidas do Cabeçalho */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleChamarGarcom}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 ${
                mesa.status === 'chamar_garcom'
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40'
              }`}
              title="Chamar o garçom à mesa"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">
                {mesa.status === 'chamar_garcom' ? 'Garçom Chamado' : 'Chamar Garçom'}
              </span>
            </button>

            <button
              onClick={() => setModalComandaAberto(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-md active:scale-95"
              title="Ver comanda atual da mesa"
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Minha Comanda</span>
              <span className="font-mono text-emerald-400">
                R$ {totalConsumoAtual.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4 pb-28">
        {/* Banner de Boas-Vindas */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cardápio Digital & Autoatendimento</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Faça seu pedido diretamente na mesa!
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seu pedido vai direto para a cozinha e bar em tempo real.
            </p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar prato, lanche ou bebida..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categorias com scroll horizontal */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoriaAtiva === 'todas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            🍽️ Todos os Itens
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoriaAtiva === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {produtosFiltrados.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                setProdutoModal(prod);
                setQtdModal(1);
                setObsModal('');
              }}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 p-3.5 flex gap-3 transition-all cursor-pointer hover:shadow-lg group"
            >
              {prod.fotoUrl && (
                <img
                  src={prod.fotoUrl}
                  alt={prod.nome}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-800 group-hover:scale-105 transition-transform"
                />
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {prod.nome}
                  </h3>
                  {prod.descricao && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {prod.descricao}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-sm text-emerald-400 font-mono">
                    R$ {prod.precoVenda.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Barra Inferior Flutuante com Carrinho */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%]">
          <button
            onClick={() => setDrawerCarrinhoAberto(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm flex items-center justify-between shadow-2xl shadow-orange-500/40 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-xs font-black">
                {totalItensCarrinho}
              </div>
              <span>Ver Pedido da Mesa</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-base">
              <span>R$ {totalCarrinho.toFixed(2)}</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* Modal: Pergunta Obrigatória Inicial "São quantas pessoas?" (Seção 4.12) */}
      {modalInicioAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
              <Users className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">Bem-vindo à Mesa #{mesa.numero}!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Para um atendimento personalizado, responda:
              </p>
              <p className="text-sm font-extrabold text-orange-400 mt-2">
                "São quantas pessoas na mesa?"
              </p>
            </div>

            {/* Seleção de pessoas */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPessoasEscolhidas(num)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pessoasEscolhidas === num
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num} {num === 1 ? 'pessoa' : 'pessoas'}
                </button>
              ))}
            </div>

            {/* Nome do responsável (opcional) */}
            <div className="text-left pt-2">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Seu nome ou apelido (opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos, Ana..."
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleConfirmarInicio}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 cursor-pointer transition-all"
            >
              Acessar Cardápio Digital
            </button>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Produto & Quantidade */}
      {produtoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-base text-white">{produtoModal.nome}</h3>
              <button
                onClick={() => setProdutoModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {produtoModal.fotoUrl && (
              <img
                src={produtoModal.fotoUrl}
                alt={produtoModal.nome}
                className="w-full h-44 rounded-2xl object-cover border border-slate-800"
              />
            )}

            {produtoModal.descricao && (
              <p className="text-xs text-slate-400">{produtoModal.descricao}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-medium">Quantidade:</span>
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setQtdModal((q) => Math.max(1, q - 1))}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white font-mono">{qtdModal}</span>
                <button
                  type="button"
                  onClick={() => setQtdModal((q) => q + 1)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Observações para a cozinha (opcional):
              </label>
              <textarea
                value={obsModal}
                onChange={(e) => setObsModal(e.target.value)}
                placeholder="Ex: Ponto da carne mal passado, sem cebola, gelo e limão..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleAdicionarAoCarrinho}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 flex items-center justify-between px-4 cursor-pointer"
            >
              <span>Adicionar ao Pedido</span>
              <span className="font-mono font-extrabold">
                R$ {(produtoModal.precoVenda * qtdModal).toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Drawer: Carrinho de Pedidos do Cliente */}
      {drawerCarrinhoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Seu Pedido — Mesa #{mesa.numero}
                </h3>
              </div>
              <button
                onClick={() => setDrawerCarrinhoAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {carrinho.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">
                      {item.quantidade}x {item.produto.nome}
                    </h4>
                    {item.observacoes && (
                      <p className="text-[11px] text-amber-300 italic">"{item.observacoes}"</p>
                    )}
                    <span className="text-[10px] text-slate-500">
                      R$ {item.produto.precoVenda.toFixed(2)} un.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400">
                      R$ {(item.produto.precoVenda * item.quantidade).toFixed(2)}
                    </span>
                    <button
                      onClick={() =>
                        setCarrinho((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Subtotal a Enviar:</span>
                <span className="font-mono text-emerald-400 text-base">
                  R$ {totalCarrinho.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleEnviarPedidoCozinha}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ChefHat className="w-4 h-4" />
                <span>Confirmar & Enviar para a Cozinha</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Minha Comanda (Itens já pedidos na mesa) */}
      {modalComandaAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Comanda da Mesa #{mesa.numero}
                </h3>
              </div>
              <button
                onClick={() => setModalComandaAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!mesa.comandaItens || mesa.comandaItens.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum pedido lançado nesta comanda ainda.
                </div>
              ) : (
                mesa.comandaItens.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">
                          {item.quantidade}x {item.nome}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                          {item.horario}
                        </span>
                      </div>
                      {item.observacoes && (
                        <p className="text-[11px] text-amber-300 italic">"{item.observacoes}"</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      R$ {item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Total Consumido:</span>
                <span className="font-mono text-emerald-400 text-base">
                  R$ {totalConsumoAtual.toFixed(2)}
                </span>
              </div>

              {mesa.quantidadePessoas && mesa.quantidadePessoas > 1 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Divisão por pessoa ({mesa.quantidadePessoas}x):</span>
                  <span className="font-mono text-slate-200 font-bold">
                    R$ {(totalConsumoAtual / mesa.quantidadePessoas).toFixed(2)} cada
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleChamarGarcom();
                    setModalComandaAberto(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Chamar Garçom</span>
                </button>

                <button
                  onClick={() => {
                    handlePedirConta();
                    setModalComandaAberto(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Pedir a Conta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
