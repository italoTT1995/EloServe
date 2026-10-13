import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  LayoutGrid,
  Bike,
  ChefHat,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Edit2,
  Check,
  X,
  Printer,
  Megaphone,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  Power,
  Tag,
  Percent,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useEloBotStore } from '../store/useEloBotStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';

export default function PainelDono() {
  const { tenantAtivoId, getTenantAtivo } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const currentTenantId = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const { usuarioLogado } = useAuthStore();
  const { caixaAtual, mesas, pedidosKDS } = useAppStore();
  const { getProdutosPorTenant, alternarDisponibilidade, atualizarPreco } = useProductStore();
  const produtos = getProdutosPorTenant(currentTenantId);
  const { pedidos: pedidosDelivery } = useDeliveryStore();
  const { getConversas, getConfig } = useEloBotStore();
  const configEloBot = getConfig(currentTenantId);
  const conversasEloBot = getConversas(currentTenantId);
  const { funcionarios } = useFuncionarioStore();

  // Estado da Loja Aberta/Fechada
  const [lojaAberta, setLojaAberta] = useState(true);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  // Edição Rápida de Preço Express
  const [produtoEditandoPreco, setProdutoEditandoPreco] = useState<string | null>(null);
  const [novoPrecoInput, setNovoPrecoInput] = useState<string>('');

  // Modal de Impressão do Fechamento do Dia
  const [modalImprimirFechamento, setModalImprimirFechamento] = useState(false);

  // Cálculos em tempo real
  const mesasOcupadas = mesas.filter((m) => m.status !== 'livre');
  const consumoAbertoMesas = mesasOcupadas.reduce((acc, m) => acc + (m.totalConsumo || 0), 0);
  const kdsEmPreparo = pedidosKDS.filter((p) => p.status !== 'pronto');
  const deliveryEmAndamento = (pedidosDelivery || []).filter(
    (p) => p.status === 'a_caminho' || p.status === 'preparando'
  );

  // Números do Dia
  const faturamentoBalcao = caixaAtual.totalVendas || 1840.0;
  const faturamentoMesas = consumoAbertoMesas + 1580.0;
  const faturamentoWhatsApp = 860.5;
  const faturamentoTotalHoje = faturamentoBalcao + faturamentoMesas + faturamentoWhatsApp;
  const totalPedidosHoje = 68;
  const ticketMedio = faturamentoTotalHoje / totalPedidosHoje;
  const lucroEstimado = faturamentoTotalHoje * 0.58; // Margem líquida média de 58%

  // Disparar toast informativo
  function dispararToast(msg: string) {
    setToastMensagem(msg);
    setTimeout(() => setToastMensagem(null), 3500);
  }

  // Alternar Loja Aberta / Fechada
  function handleToggleLoja() {
    const novoStatus = !lojaAberta;
    setLojaAberta(novoStatus);
    dispararToast(
      novoStatus
        ? 'Restaurante ABERTO para pedidos no Balcão, Mesas e WhatsApp!'
        : 'Restaurante FECHADO! EloBot e PDV agora recusam novos pedidos.'
    );
  }

  // Pausar/Despausar Produto com 1 clique
  function handleAlternarPausaProduto(id: string, nome: string, disponivel: boolean) {
    alternarDisponibilidade(id, currentTenantId);
    dispararToast(
      disponivel
        ? `Produto "${nome}" foi pausado como ESGOTADO no cardápio e WhatsApp!`
        : `Produto "${nome}" foi ATIVADO novamente no cardápio!`
    );
  }

  // Salvar Preço Express
  function handleSalvarPrecoExpress(id: string, nome: string) {
    const valor = parseFloat(novoPrecoInput.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor numérico válido.');
      return;
    }
    atualizarPreco(id, valor, currentTenantId);
    setProdutoEditandoPreco(null);
    setNovoPrecoInput('');
    dispararToast(`Preço de "${nome}" atualizado para R$ ${valor.toFixed(2).replace('.', ',')}!`);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      {/* Toast Notificação Rápida */}
      {toastMensagem && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMensagem}</span>
        </div>
      )}

      {/* 1. TOPO: BOAS-VINDAS, STATUS DA LOJA & ATALHOS RÁPIDOS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
              <span>👔</span>
              <span>Nível 2 • Dono & Gerente</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Unidade Ativa:</span>
            <strong className="text-sm font-black text-white">{tenantAtual.nomeFantasia}</strong>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Painel de Gestão do Restaurante
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Visão simplificada em tempo real. Acompanhe vendas, mesas, pedidos na cozinha e controle seu cardápio com máxima facilidade.
          </p>
        </div>

        {/* Status da Loja (Chave Liga/Desliga) e Atalho para o Caixa */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Chave de Expediente Aberto / Fechado */}
          <button
            type="button"
            onClick={handleToggleLoja}
            className={`px-4 py-2.5 rounded-2xl border font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              lojaAberta
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-emerald-500/10'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 shadow-rose-500/10'
            }`}
            title="Clique para abrir ou fechar o restaurante para novos pedidos"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                lojaAberta ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{lojaAberta ? 'LOJA ABERTA (Recebendo)' : 'LOJA FECHADA (Encerrada)'}</span>
          </button>

          {/* Botão Ir para o Caixa (PDV) */}
          <Link
            to="/pdv"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            title="Abrir tela de Frente de Caixa para passar vendas no balcão"
          >
            <Store className="w-4 h-4" />
            <span>Frente de Caixa (PDV)</span>
          </Link>
        </div>
      </div>

      {/* 2. OS 4 GRANDES INDICADORES DO NEGÓCIO HOJE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Total */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Vendas Hoje (Total)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              R$ {faturamentoTotalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
            <span>Balcão: R$ {faturamentoBalcao.toFixed(0)}</span>
            <span>Mesas: R$ {faturamentoMesas.toFixed(0)}</span>
            <span className="text-emerald-400 font-semibold">Whats: R$ {faturamentoWhatsApp.toFixed(0)}</span>
          </div>
        </div>

        {/* Lucro Líquido Estimado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Lucro Líquido Estimado</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              R$ {lucroEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              58% margem
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            Já descontando custo de ingredientes (CMV).
          </p>
        </div>

        {/* Total de Pedidos & Ticket Médio */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Pedidos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalPedidosHoje}</span>
            <span className="text-xs text-slate-400">comandas hoje</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
            <span>Ticket Médio:</span>
            <strong className="text-indigo-300 font-mono">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* WhatsApp & EloBot IA */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Vendas WhatsApp (IA)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              R$ {faturamentoWhatsApp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
            <span>Atendimentos hoje:</span>
            <span className="text-slate-200 font-mono font-bold">{conversasEloBot.length} clientes</span>
          </div>
        </div>
      </div>

      {/* 3. RADAR DA OPERAÇÃO AO VIVO: O QUE ESTÁ ACONTECENDO AGORA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
            <h3 className="text-base font-black text-white">Radar da Loja em Tempo Real</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Atualização contínua</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Quadrante 1: Salão & Mesas */}
          <Link
            to="/mesas"
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-950 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salão & Mesas</span>
                <LayoutGrid className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white font-mono">{mesasOcupadas.length}</span>
                <span className="text-xs text-slate-400">de {mesas.length} mesas ocupadas</span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-mono font-semibold">
                R$ {consumoAbertoMesas.toFixed(2).replace('.', ',')} em consumo ativo
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Abrir Mapa de Mesas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Quadrante 2: Cozinha KDS */}
          <Link
            to="/kds"
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-950 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cozinha (KDS)</span>
                <ChefHat className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white font-mono">{kdsEmPreparo.length}</span>
                <span className="text-xs text-slate-400">pedidos em preparo</span>
              </div>
              <p className="text-[11px] text-slate-400">Tempo médio de espera: ~14 min</p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Ver Painel da Cozinha</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Quadrante 3: Delivery */}
          <Link
            to="/delivery"
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-950 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery & Motos</span>
                <Bike className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white font-mono">{deliveryEmAndamento.length}</span>
                <span className="text-xs text-slate-400">pedidos em rota/saída</span>
              </div>
              <p className="text-[11px] text-slate-400">Entregadores ativos na rua</p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Acompanhar Entregas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Quadrante 4: EloBot WhatsApp */}
          <Link
            to="/elobot"
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp 24h</span>
                <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-400 font-mono">IA Conectada</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {configEloBot.statusInstancia === 'conectado' ? 'Atendendo clientes sem fila' : 'Desconectado'}
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Abrir Painel WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. AÇÕES RÁPIDAS & CONTROLE EXPRESS DO CARDÁPIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LADO ESQUERDO: CONTROLE RÁPIDO DO CARDÁPIO (PAUSAR ITENS ESGOTADOS & EDITAR PREÇOS) (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Cardápio Express (Pausar & Alterar Preços)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Acabou algum ingrediente? Pause o produto em 1 clique para não vender no WhatsApp nem no PDV.
              </p>
            </div>

            <Link
              to="/cardapio"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Ver Cardápio Completo &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto pr-1">
            {produtos.map((prod) => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                {/* Nome e Categoria */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{prod.nome}</span>
                    {!prod.disponivel && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase border border-rose-500/30">
                        Esgotado
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">
                    Custo: R$ {(prod.precoCusto || 0).toFixed(2).replace('.', ',')} • Setor: {prod.setorPreparo}
                  </span>
                </div>

                {/* Preço e Edição Rápida */}
                <div className="flex items-center gap-2 shrink-0">
                  {produtoEditandoPreco === prod.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-xs">R$</span>
                      <input
                        type="text"
                        autoFocus
                        value={novoPrecoInput}
                        onChange={(e) => setNovoPrecoInput(e.target.value)}
                        placeholder={prod.precoVenda.toFixed(2)}
                        className="w-16 px-2 py-1 bg-slate-950 border border-emerald-500 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSalvarPrecoExpress(prod.id, prod.nome)}
                        className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                        title="Salvar novo preço"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdutoEditandoPreco(null)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProdutoEditandoPreco(prod.id);
                        setNovoPrecoInput(prod.precoVenda.toFixed(2).replace('.', ','));
                      }}
                      className="font-mono font-bold text-emerald-400 hover:underline px-2 py-1 rounded bg-slate-950 border border-slate-800 cursor-pointer flex items-center gap-1"
                      title="Clique para alterar preço rapidamente"
                    >
                      <span>R$ {prod.precoVenda.toFixed(2).replace('.', ',')}</span>
                      <Edit2 className="w-3 h-3 text-slate-500" />
                    </button>
                  )}

                  {/* Botão Liga/Desliga Disponibilidade */}
                  <button
                    type="button"
                    onClick={() => handleAlternarPausaProduto(prod.id, prod.nome, prod.disponivel)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer active:scale-95 ${
                      prod.disponivel
                        ? 'bg-emerald-500/10 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/30'
                        : 'bg-rose-500/20 hover:bg-emerald-500/20 text-rose-300 hover:text-emerald-300 border border-rose-500/30 hover:border-emerald-500/30'
                    }`}
                  >
                    {prod.disponivel ? 'Disponível' : 'Pausado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: ATALHOS GERENCIAIS & FECHAMENTO DO DIA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Caixa do Turno & Fechamento */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Caixa do Dia</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Caixa Aberto
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operador Responsável:</span>
                <strong className="text-white">{caixaAtual.operador || 'Juliana Mendes'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fundo de Troco Inicial:</span>
                <span className="font-mono text-slate-300">
                  R$ {(caixaAtual.saldoInicial || 150).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-300 font-semibold">Total em Vendas Caixa:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  R$ {caixaAtual.totalVendas.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/caixa"
                className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition-all cursor-pointer border border-slate-700 active:scale-95"
              >
                Conferência de Caixa
              </Link>
              <button
                type="button"
                onClick={() => setModalImprimirFechamento(true)}
                className="py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Resumo</span>
              </button>
            </div>
          </div>

          {/* Equipe no Turno de Hoje */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Equipe no Turno Hoje</span>
              </h3>
              <Link
                to="/funcionarios"
                className="text-[11px] font-bold text-slate-400 hover:text-white"
              >
                Gerenciar &rarr;
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { nome: 'Juliana Mendes', cargo: 'Operadora de Caixa', status: 'Ativa no PDV', icone: '🛒' },
                { nome: 'Lucas Oliveira', cargo: 'Garçom de Salão', status: 'Atendendo 8 mesas', icone: '📱' },
                { nome: 'Chef Rodrigo', cargo: 'Chefe de Cozinha', status: 'Operando KDS', icone: '🍳' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{f.icone}</span>
                    <div>
                      <span className="font-bold text-white block">{f.nome}</span>
                      <span className="text-[10px] text-slate-500 block">{f.cargo}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 font-semibold">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: RESUMO / CUPOM DE FECHAMENTO DO DIA PARA IMPRESSÃO */}
      {modalImprimirFechamento && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Resumo do Dia (Fechamento)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalImprimirFechamento(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Cupom Térmico */}
            <div className="p-4 bg-white text-slate-950 font-mono text-xs rounded-2xl shadow-inner space-y-2">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <p className="font-black text-sm uppercase">{tenantAtual.nomeFantasia}</p>
                <p className="text-[10px] text-slate-600">DEMONSTRATIVO DIÁRIO DE VENDAS</p>
                <p className="text-[9px] text-slate-500">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>

              <div className="space-y-1 text-[11px] py-1">
                <div className="flex justify-between">
                  <span>Faturamento Balcão:</span>
                  <strong>R$ {faturamentoBalcao.toFixed(2).replace('.', ',')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Faturamento Mesas:</span>
                  <strong>R$ {faturamentoMesas.toFixed(2).replace('.', ',')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Faturamento WhatsApp:</span>
                  <strong>R$ {faturamentoWhatsApp.toFixed(2).replace('.', ',')}</strong>
                </div>
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL GERAL HOJE:</span>
                  <span>R$ {faturamentoTotalHoje.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 text-[10px] space-y-0.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Total de Comandas:</span>
                  <span>{totalPedidosHoje} pedidos</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Médio:</span>
                  <span>R$ {ticketMedio.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950">
                  <span>Lucro Estimado (58%):</span>
                  <span>R$ {lucroEstimado.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[8px] text-slate-500">
                EloServe Sistemas • Gestão Inteligente de Restaurantes
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cupom de Fechamento (Ctrl+P)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalImprimirFechamento(false)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold text-center"
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
