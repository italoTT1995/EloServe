import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  LayoutGrid,
  Bike,
  ChefHat,
  Bot,
  Store,
  Printer,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Tag,
  Check,
  X,
  Edit2,
  Search,
  Sun,
  Moon,
  Music,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useEloBotStore } from '../store/useEloBotStore';
import { useThemeStore } from '../store/useThemeStore';

export default function PainelDono() {
  const { tenantAtivoId, getTenantAtivo, atualizarDadosTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const { usuarioLogado } = useAuthStore();
  const { caixaAtual, getMesasPorTenant, pedidosKDS, getVendasPorTenant } = useAppStore();
  const mesas = getMesasPorTenant(currentTenantId);
  const todasVendas = getVendasPorTenant ? getVendasPorTenant(currentTenantId) : [];
  const { tema, alternarTema } = useThemeStore();
  const isWhite = tema === 'light';
  const { getProdutosPorTenant, alternarDisponibilidade, atualizarPreco } = useProductStore();
  const produtos = getProdutosPorTenant(currentTenantId);
  const { pedidos: pedidosDelivery } = useDeliveryStore();
  const { getConversas, getConfig } = useEloBotStore();
  const configEloBot = getConfig(currentTenantId);
  const conversasEloBot = getConversas(currentTenantId);

  // Estados locais
  const [lojaAberta, setLojaAberta] = useState(true);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);
  const [categoriaCardapio, setCategoriaCardapio] = useState<string>('todos');
  const [buscaItem, setBuscaItem] = useState<string>('');
  const [paginaPedidos, setPaginaPedidos] = useState<number>(1);
  const [modalImprimir, setModalImprimir] = useState<boolean>(false);

  // Edição rápida de preço
  const [editandoPrecoId, setEditandoPrecoId] = useState<string | null>(null);
  const [novoPrecoValor, setNovoPrecoValor] = useState<string>('');

  // Estados e Configurações de Couvert Artístico
  const [couvertAtivo, setCouvertAtivo] = useState(tenantAtual?.couvertArtisticoAtivo ?? false);
  const [valorCouvert, setValorCouvert] = useState<number>(tenantAtual?.valorCouvertPorPessoa ?? 12.0);
  const [diasAoVivo, setDiasAoVivo] = useState<string[]>(tenantAtual?.diasAoVivo ?? ['quinta', 'sexta', 'sabado', 'domingo']);

  // Cálculos dinâmicos em tempo real do restaurante
  const vendasHoje = useMemo(() => {
    const hojeStr = new Date().toLocaleDateString('pt-BR');
    return (todasVendas || []).filter((v) => v.dataHora.includes(hojeStr) && v.status === 'concluida');
  }, [todasVendas]);

  const totalVendasHoje = useMemo(() => {
    const soma = vendasHoje.reduce((acc, v) => acc + (v.total || 0), 0);
    if (soma > 0) return soma;
    if (caixaAtual.status === 'aberto' && caixaAtual.totalVendas > 0) return caixaAtual.totalVendas;
    return (todasVendas || []).reduce((acc, v) => acc + (v.total || 0), 0);
  }, [vendasHoje, caixaAtual, todasVendas]);

  const totalPedidosHoje = useMemo(() => {
    if (vendasHoje.length > 0) return vendasHoje.length;
    if (totalVendasHoje > 0 && todasVendas.length > 0) return todasVendas.length;
    return 0;
  }, [vendasHoje, totalVendasHoje, todasVendas]);

  const ticketMedioHoje = useMemo(() => {
    return totalPedidosHoje > 0 ? totalVendasHoje / totalPedidosHoje : 0;
  }, [totalVendasHoje, totalPedidosHoje]);

  const totalClientesHoje = useMemo(() => {
    const mesasOcupadas = mesas.filter((m) => m.status === 'ocupada').length;
    return Math.max(mesasOcupadas, totalPedidosHoje);
  }, [mesas, totalPedidosHoje]);

  function handleSalvarCouvert() {
    atualizarDadosTenant(currentTenantId, {
      couvertArtisticoAtivo: couvertAtivo,
      valorCouvertPorPessoa: Number(valorCouvert) || 0,
      valorCouvertPorComanda: Number(valorCouvert) || 0,
      diasAoVivo: diasAoVivo,
    });
    dispararToast(
      couvertAtivo
        ? `🎶 Couvert Artístico atualizado: R$ ${(Number(valorCouvert) || 0).toFixed(2)} por comanda aberta nos dias selecionados!`
        : `Couvert Artístico desativado no estabelecimento.`
    );
  }

  function dispararToast(msg: string) {
    setToastMensagem(msg);
    setTimeout(() => setToastMensagem(null), 3500);
  }

  function handleToggleLoja() {
    const novoStatus = !lojaAberta;
    setLojaAberta(novoStatus);
    dispararToast(
      novoStatus
        ? 'Restaurante ABERTO para pedidos no Balcão, Mesas e WhatsApp!'
        : 'Restaurante FECHADO! EloBot e PDV agora recusam novos pedidos.'
    );
  }

  function handleToggleProduto(id: string, nome: string, disponivel: boolean) {
    alternarDisponibilidade(id, currentTenantId);
    dispararToast(
      disponivel
        ? `"${nome}" pausado como ESGOTADO no cardápio e WhatsApp!`
        : `"${nome}" ativado como DISPONÍVEL no cardápio!`
    );
  }

  function handleSalvarPreco(id: string, nome: string) {
    const valor = parseFloat(novoPrecoValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor numérico válido.');
      return;
    }
    atualizarPreco(id, valor, currentTenantId);
    setEditandoPrecoId(null);
    setNovoPrecoValor('');
    dispararToast(`Preço de "${nome}" atualizado para R$ ${valor.toFixed(2).replace('.', ',')}!`);
  }

  // Filtrar produtos do cardápio express
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca = p.nome.toLowerCase().includes(buscaItem.toLowerCase());
      const matchCat =
        categoriaCardapio === 'todos' ||
        (categoriaCardapio === 'almoco' && p.setorPreparo === 'cozinha') ||
        (categoriaCardapio === 'bebidas' && p.setorPreparo === 'bar');
      return matchBusca && matchCat;
    });
  }, [produtos, buscaItem, categoriaCardapio]);

  // Lista de Pedidos Recentes (estilo Print 3)
  const pedidosRecentes = [
    {
      id: '#M24-2305',
      status: 'Concluído',
      statusCor: isWhite
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
      origem: 'Mesa 24 • 3 itens',
      valor: 'R$ 85,97',
      hora: '13:42',
    },
    {
      id: '#M4-9359',
      status: 'Concluído',
      statusCor: isWhite
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
      origem: 'Mesa 4 • 2 itens',
      valor: 'R$ 32,99',
      hora: '13:35',
    },
    {
      id: '#M26-2378',
      status: 'Concluído',
      statusCor: isWhite
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
      origem: 'Mesa 26 • 3 itens',
      valor: 'R$ 138,94',
      hora: '13:20',
    },
    {
      id: '#M21-2576',
      status: 'Novo',
      statusCor: isWhite
        ? 'bg-orange-100 text-orange-800 border border-orange-200'
        : 'bg-orange-950/80 text-orange-400 border border-orange-500/30',
      origem: 'Mesa 21 • 3 itens',
      valor: 'R$ 99,96',
      hora: '13:14',
    },
    {
      id: '##2607033RAJ',
      status: 'Concluído',
      statusCor: isWhite
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
      origem: 'Nuane Cabral Queiroz - Delivery • 1 item',
      valor: 'R$ 27,49',
      hora: '12:58',
    },
  ];

  // Itens Mais Vendidos (estilo Print 3)
  const itensMaisVendidos = [
    { nome: 'Prato com Churrasco', qtd: 160, barPct: 100 },
    { nome: 'Guaraná 1l', qtd: 25, barPct: 22 },
    { nome: 'Coca Cola KS 290ml', qtd: 24, barPct: 20 },
    { nome: 'Coca Cola 350ml', qtd: 20, barPct: 16 },
    { nome: 'Coca Cola 1,5l', qtd: 18, barPct: 14 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Toast Notificação */}
      {toastMensagem && (
        <div className="fixed top-20 right-6 z-50 bg-orange-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMensagem}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL (Exatamente como o Print 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão geral do seu negócio nos últimos 7 dias • <strong className="text-slate-200">{tenantAtual.nomeFantasia}</strong>
          </p>
        </div>

        {/* Ações Rápidas do Dono */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Loja Aberta/Fechada */}
          <button
            type="button"
            onClick={handleToggleLoja}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
              lojaAberta
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${lojaAberta ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{lojaAberta ? 'Loja Aberta' : 'Loja Fechada'}</span>
          </button>

          {/* Botão Ir para Caixa / PDV */}
          <Link
            to="/pdv"
            className="px-3.5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Frente de Caixa (PDV)</span>
          </Link>

          {/* Imprimir Resumo */}
          <button
            type="button"
            onClick={() => setModalImprimir(true)}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Imprimir Fechamento do Dia"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Alternar White Color / Dark Mode */}
          <button
            type="button"
            onClick={alternarTema}
            className={`px-3 py-2 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm ${
              tema === 'light'
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={tema === 'light' ? 'Mudar para Dark Mode' : 'Mudar para White Color (Tema Claro)'}
          >
            {tema === 'light' ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{tema === 'light' ? 'Tema Claro' : 'White Color'}</span>
          </button>
        </div>
      </div>

      {/* 1. OS 4 CARDS DE MÉTRICAS (Estilo Exato do Print 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: VENDAS HOJE */}
        <div className="bg-[#141416] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">VENDAS HOJE</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              R$ {totalVendasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Faturamento do dia</span>
          </div>
        </div>

        {/* Card 2: PEDIDOS */}
        <div className="bg-[#141416] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PEDIDOS</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">{totalPedidosHoje}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pedidos processados</span>
          </div>
        </div>

        {/* Card 3: TICKET MÉDIO */}
        <div className="bg-[#141416] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TICKET MÉDIO</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              R$ {ticketMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Média por comanda</span>
          </div>
        </div>

        {/* Card 4: CLIENTES */}
        <div className="bg-[#141416] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CLIENTES ATENDIDOS</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">{totalClientesHoje}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mesas e clientes no dia</span>
          </div>
        </div>
      </div>

      {/* 2. LINHA DO MEIO: VENDAS (ÚLTIMOS 7 DIAS) & POR CATEGORIA (Estilo Exato do Print 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfico de Vendas 7 Dias (8 cols) */}
        <div className="lg:col-span-8 bg-[#141416] border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Vendas (últimos 7 dias)</h3>

          <div className="relative h-64 w-full">
            {/* Eixo Y */}
            <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-[10px] text-slate-500 font-mono">
              <span>R$1.6k</span>
              <span>R$1.2k</span>
              <span>R$800</span>
              <span>R$400</span>
              <span>R$0</span>
            </div>

            {/* Linhas de Grade e Curva SVG */}
            <div className="ml-14 h-full flex flex-col justify-between relative pb-6">
              <div className="w-full border-b border-slate-800/60 h-0" />
              <div className="w-full border-b border-slate-800/60 h-0" />
              <div className="w-full border-b border-slate-800/60 h-0" />
              <div className="w-full border-b border-slate-800/60 h-0" />
              <div className="w-full border-b border-slate-800/60 h-0" />

              {/* Curva SVG com Gradiente Laranja */}
              <svg
                viewBox="0 0 700 200"
                className="absolute inset-0 w-full h-[85%] overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="laranjaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Área preenchida */}
                <path
                  d="M 0 145 C 50 150, 100 185, 150 180 C 200 130, 250 120, 300 120 C 350 120, 400 95, 450 70 C 500 45, 550 40, 600 55 C 650 75, 680 90, 700 95 L 700 200 L 0 200 Z"
                  fill="url(#laranjaGradient)"
                />
                {/* Linha da curva */}
                <path
                  d="M 0 145 C 50 150, 100 185, 150 180 C 200 130, 250 120, 300 120 C 350 120, 400 95, 450 70 C 500 45, 550 40, 600 55 C 650 75, 680 90, 700 95"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Eixo X: Dias da Semana */}
              <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Sáb</span>
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico Por Categoria (4 cols) */}
        <div className="lg:col-span-4 bg-[#141416] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white">Por Categoria</h3>

          {/* Gráfico Donut SVG */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background do círculo */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-800"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Segmento Mesa (89%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#ea580c"
                strokeWidth="14"
                strokeDasharray="251.2"
                strokeDashoffset="27.6"
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Segmento Delivery (11%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#fdba74"
                strokeWidth="14"
                strokeDasharray="251.2"
                strokeDashoffset="223.5"
                fill="transparent"
              />
            </svg>

            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400">Total 7d</span>
              <span className="text-base font-black text-white font-mono">R$ 6.1k</span>
            </div>
          </div>

          {/* Legenda */}
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                <span>Mesa</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-300"></span>
                <span>Delivery</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">11%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span>Retirada</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LINHA INFERIOR: ITENS MAIS VENDIDOS & PEDIDOS RECENTES (Estilo Exato dos Prints 1 e 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Itens mais vendidos (7 dias) (7 cols) */}
        <div className="lg:col-span-7 bg-[#141416] border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Itens mais vendidos (7 dias)</h3>

          <div className="space-y-3 pt-2">
            {itensMaisVendidos.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium truncate">{item.nome}</span>
                  <span className="font-mono font-bold text-orange-400 shrink-0">{item.qtd} un</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800/70 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0</span>
            <span>45</span>
            <span>90</span>
            <span>135</span>
            <span>180</span>
          </div>
        </div>

        {/* Pedidos Recentes (5 cols) */}
        <div className="lg:col-span-5 bg-[#141416] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Pedidos Recentes</h3>
            {/* Paginação < 1/6 > */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <button
                type="button"
                onClick={() => setPaginaPedidos((p) => Math.max(1, p - 1))}
                className="p-1 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>{paginaPedidos}/6</span>
              <button
                type="button"
                onClick={() => setPaginaPedidos((p) => Math.min(6, p + 1))}
                className="p-1 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/70 text-xs">
            {pedidosRecentes.map((ped, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{ped.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${ped.statusCor}`}>
                      {ped.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{ped.origem}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white font-mono block">{ped.valor}</span>
                  <span className="text-[9px] text-slate-500">{ped.hora}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/mesas"
            className="text-center text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors pt-1"
          >
            Ver Todas as Mesas & Comandas &rarr;
          </Link>
        </div>
      </div>

      {/* 3.5 CONFIGURAÇÃO DE COUVERT ARTÍSTICO & MÚSICA AO VIVO */}
      <div className={`border rounded-2xl p-6 shadow-lg space-y-4 transition-all ${
        isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141416] border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-black flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                <span>Couvert Artístico & Música ao Vivo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Gestão do Salão
                </span>
              </h3>
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure o valor cobrado por comanda aberta e os dias de apresentação ao vivo para aplicação automática nas comandas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${couvertAtivo ? 'text-purple-400' : isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
              {couvertAtivo ? 'Couvert Ativo' : 'Couvert Inativo'}
            </span>
            <button
              type="button"
              onClick={() => setCouvertAtivo(!couvertAtivo)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer shrink-0 ${
                couvertAtivo ? 'bg-purple-600' : isWhite ? 'bg-slate-300' : 'bg-slate-700'
              }`}
              title={couvertAtivo ? 'Desativar cobrança de couvert' : 'Ativar cobrança de couvert'}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${
                  couvertAtivo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Valor por comanda */}
          <div className="md:col-span-4 space-y-1.5">
            <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              Valor do Couvert por Comanda Aberta (R$):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
                R$
              </span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={valorCouvert}
                onChange={(e) => setValorCouvert(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 12.00"
                className={`w-full pl-9 pr-3 py-2 border rounded-xl font-mono font-bold text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-[#0e0e10] border-slate-800 text-white'
                }`}
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              {[10.0, 12.0, 15.0, 20.0].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValorCouvert(v)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border cursor-pointer font-mono font-bold transition-colors ${
                    valorCouvert === v
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : isWhite
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/50'
                  }`}
                >
                  R$ {v.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Dias com Música ao Vivo */}
          <div className="md:col-span-5 space-y-1.5">
            <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
              Dias de Música ao Vivo / Cobrança:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'quinta', label: 'Qui' },
                { id: 'sexta', label: 'Sex' },
                { id: 'sabado', label: 'Sáb' },
                { id: 'domingo', label: 'Dom' },
                { id: 'todos_os_dias', label: 'Todos os Dias' },
              ].map((dia) => {
                const isSelected = diasAoVivo.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => {
                      if (dia.id === 'todos_os_dias') {
                        setDiasAoVivo(isSelected ? [] : ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo', 'todos_os_dias']);
                      } else {
                        setDiasAoVivo(
                          isSelected ? diasAoVivo.filter((d) => d !== dia.id) : [...diasAoVivo, dia.id]
                        );
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : isWhite
                        ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
                        : 'bg-[#0e0e10] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
            <p className={`text-[11px] ${isWhite ? 'text-slate-500' : 'text-slate-500'}`}>
              A cobrança será sugerida automaticamente nas comandas e contas nos dias marcados.
            </p>
          </div>

          {/* Botão Salvar */}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={handleSalvarCouvert}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Regras de Couvert</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. CARDÁPIO EXPRESS: COM TOGGLE DE DISPONIBILIDADE (Exatamente como o Print 2) */}
      <div className={`border rounded-2xl p-6 shadow-lg space-y-5 transition-all ${
        isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141416] border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-black flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
              <Tag className="w-4 h-4 text-orange-500" />
              <span>Cardápio & Controle de Disponibilidade</span>
            </h3>
            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Clique no toggle para pausar itens esgotados instantaneamente no PDV e WhatsApp.
            </p>
          </div>

          <Link
            to="/cardapio"
            className={`text-xs font-bold transition-colors ${
              isWhite ? 'text-orange-600 hover:text-orange-500' : 'text-orange-400 hover:text-orange-300'
            }`}
          >
            Abrir Gestor de Cardápio Completo &rarr;
          </Link>
        </div>

        {/* Barra de Filtros e Busca (Estilo Print 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={buscaItem}
              onChange={(e) => setBuscaItem(e.target.value)}
              placeholder="Buscar item..."
              className={`w-full pl-8 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors ${
                isWhite
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#0e0e10] border-slate-800 text-white placeholder:text-slate-600'
              }`}
            />
          </div>

          {/* Chips de Categorias (Pills estilo Print 2) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'almoco', label: 'Cozinha & Pratos' },
              { id: 'bebidas', label: 'Bebidas & Bar' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaCardapio(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  categoriaCardapio === cat.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : isWhite
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'
                    : 'bg-[#0e0e10] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Cards de Itens (Estilo Print 2 com Toggle Verde/Cinza) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {produtosFiltrados.slice(0, 8).map((prod) => (
            <div
              key={prod.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                isWhite
                  ? 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 shadow-sm'
                  : 'bg-[#0e0e10] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Imagem Thumbnail e Nome */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                    isWhite
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {prod.fotoUrl ? (
                    <img src={prod.fotoUrl} alt={prod.nome} className="w-full h-full object-cover" />
                  ) : (
                    prod.nome.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-bold truncate block ${
                      isWhite ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {prod.nome}
                  </span>
                  {/* Preço editável */}
                  {editandoPrecoId === prod.id ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-slate-400 text-[10px]">R$</span>
                      <input
                        type="text"
                        autoFocus
                        value={novoPrecoValor}
                        onChange={(e) => setNovoPrecoValor(e.target.value)}
                        className={`w-14 px-1 py-0.5 border border-orange-500 rounded font-mono text-[10px] ${
                          isWhite ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleSalvarPreco(prod.id, prod.nome)}
                        className="p-0.5 text-emerald-500 hover:text-emerald-600"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoPrecoId(null)}
                        className="p-0.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoPrecoId(prod.id);
                        setNovoPrecoValor(prod.precoVenda.toFixed(2).replace('.', ','));
                      }}
                      className={`text-[11px] font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                        isWhite ? 'text-orange-600' : 'text-orange-400'
                      }`}
                    >
                      <span>R$ {prod.precoVenda.toFixed(2).replace('.', ',')}</span>
                      <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Toggle Switch Estilo Print 2 (Verde: Disponível / Cinza: Indisponível) */}
              <button
                type="button"
                onClick={() => handleToggleProduto(prod.id, prod.nome, prod.disponivel)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer shrink-0 ${
                  prod.disponivel
                    ? 'bg-emerald-500'
                    : isWhite
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
                title={prod.disponivel ? 'Item disponível para venda' : 'Item esgotado / pausado'}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${
                    prod.disponivel ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: RESUMO / CUPOM DE FECHAMENTO DO DIA */}
      {modalImprimir && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 ${
            isWhite ? 'bg-white border-slate-200' : 'bg-[#141416] border-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isWhite ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-orange-500" />
                <h3 className={`text-sm font-bold ${isWhite ? 'text-slate-900' : 'text-white'}`}>Resumo do Dia (Fechamento)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalImprimir(false)}
                className={`p-1 ${isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cupom Térmico */}
            <div className="p-4 bg-white text-slate-950 font-mono text-xs rounded-2xl shadow-inner space-y-2">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <p className="font-black text-sm uppercase">{tenantAtual.nomeFantasia}</p>
                <p className="text-[10px] text-slate-600">DEMONSTRATIVO DIÁRIO</p>
                <p className="text-[9px] text-slate-500">
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>

              <div className="space-y-1 text-[11px] py-1">
                <div className="flex justify-between">
                  <span>Vendas Hoje:</span>
                  <strong>R$ 1.046,11</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Pedidos:</span>
                  <strong>20 pedidos</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Médio:</span>
                  <strong>R$ 52,31</strong>
                </div>
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>CLIENTES HOJE:</span>
                  <span>17</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[8px] text-slate-500">
                EloServe • Sistema PDV
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Resumo (Ctrl+P)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalImprimir(false)}
                className={`w-full py-2 rounded-xl text-xs font-semibold text-center cursor-pointer transition-colors ${
                  isWhite ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fechar janela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
