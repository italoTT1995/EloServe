import { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Play,
  Check,
  Flame,
  Volume2,
  Lock,
  Crown,
  ArrowUpRight,
  Utensils,
  Wine,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSaaSStore, PLANOS_DISPONIVEIS } from '../store/useSaaSStore';
import { audio } from '../lib/audio';
import { PedidoKDS, EstacaoKDS, ItemPedidoKDS } from '../types';

export default function KDS() {
  const {
    pedidosKDS,
    historicoKDS,
    avancarStatusKDS,
    toggleItemConcluidoKDS,
    ticarTodosItensKDS,
    arquivarPedidoKDS,
    recuperarUltimoPedidoKDS,
  } = useAppStore();

  const { getTenantAtivo, mudarPlanoTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const planoAtual = PLANOS_DISPONIVEIS.find((p) => p.id === tenantAtual?.planoId) || PLANOS_DISPONIVEIS[0];
  const kdsDisponivel = planoAtual.limites.kdsIncluso !== false;

  // Filtro por Estação de Preparo (Cozinha vs Bar)
  const [estacaoFiltro, setEstacaoFiltro] = useState<EstacaoKDS>('todas');

  // Helper para verificar se um item pertence à estação ativa
  function itemPertenceEstacao(item: ItemPedidoKDS, estacao: EstacaoKDS): boolean {
    if (estacao === 'todas') return true;
    const ehBar = item.setorPreparo === 'bar';
    if (estacao === 'bar') return ehBar;
    return !ehBar; // 'cozinha'
  }

  // Helper para verificar se o pedido possui itens da estação selecionada
  function pedidoPertenceEstacao(pedido: PedidoKDS, estacao: EstacaoKDS): boolean {
    if (estacao === 'todas') return true;
    return pedido.itens.some((it) => itemPertenceEstacao(it, estacao));
  }

  // Filtragem dos pedidos por estação
  const pedidosFiltrados = pedidosKDS.filter((p) => pedidoPertenceEstacao(p, estacaoFiltro));

  const novos = pedidosFiltrados.filter((p) => p.status === 'novo');
  const emPreparo = pedidosFiltrados.filter((p) => p.status === 'em_preparo');
  const prontos = pedidosFiltrados.filter((p) => p.status === 'pronto');

  // Contadores para as abas de estação
  const qtdTodas = pedidosKDS.filter((p) => p.status !== 'pronto').length;
  const qtdCozinha = pedidosKDS
    .filter((p) => p.status !== 'pronto')
    .filter((p) => p.itens.some((it) => it.setorPreparo !== 'bar')).length;
  const qtdBar = pedidosKDS
    .filter((p) => p.status !== 'pronto')
    .filter((p) => p.itens.some((it) => it.setorPreparo === 'bar')).length;

  if (!kdsDisponivel) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 inline-block mb-3">
            Plano Starter Detectado
          </span>
          <h2 className="text-xl font-black text-white mb-2">Painel KDS da Cozinha</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            O restaurante <strong className="text-slate-200">{tenantAtual?.nomeFantasia}</strong> está no plano{' '}
            <strong className="text-amber-400">Starter</strong> (ideal para operação essencial com cardápio QR Code e
            PDV). O Painel de Cozinha KDS sem papel em tempo real está disponível a partir do{' '}
            <strong className="text-emerald-400">Plano Pro</strong>.
          </p>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-6 space-y-2.5">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ordem de preparo automática sem comandas de papel</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Alertas sonoros para novos pedidos do salão e delivery</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Filtro por Estações (Cozinha Quente vs Bar/Copa)</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Checklist de preparo prato por prato com barra de progresso</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (tenantAtual) mudarPlanoTenant(tenantAtual.id, 'pro');
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Fazer Upgrade para o Plano Pro (R$ 199/mês)</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 select-none">
      {/* Top Banner com Filtro de Estações */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Painel de Produção (KDS)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-500/20">
                Tempo Real
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a fila de preparo, tique itens individualmente e filtre por estação.
            </p>
          </div>
        </div>

        {/* Barra de Filtros de Estação (Cozinha vs Bar) & Ações */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Pills de Estação */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setEstacaoFiltro('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                estacaoFiltro === 'todas'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              <span>Todas ({qtdTodas})</span>
            </button>

            <button
              type="button"
              onClick={() => setEstacaoFiltro('cozinha')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                estacaoFiltro === 'cozinha'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-orange-300'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>🍳 Cozinha ({qtdCozinha})</span>
            </button>

            <button
              type="button"
              onClick={() => setEstacaoFiltro('bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                estacaoFiltro === 'bar'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Wine className="w-3.5 h-3.5 text-purple-400" />
              <span>🍹 Bar / Copa ({qtdBar})</span>
            </button>
          </div>

          {/* Botão Desfazer / Recall de Pedido Arquivado */}
          {historicoKDS && historicoKDS.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const rec = recuperarUltimoPedidoKDS();
                if (rec) {
                  audio.tocarBipItem();
                }
              }}
              title="Recuperar o último pedido entregue para a tela de KDS"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desfazer #{historicoKDS[0].numero}</span>
            </button>
          )}

          {/* Testar Alerta Sonoro */}
          <button
            type="button"
            onClick={() => audio.tocarAlertaNotificacao()}
            title="Testar alarme sonoro de novos pedidos"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Som</span>
          </button>
        </div>
      </div>

      {/* Colunas do Kanban KDS */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-y-auto md:overflow-hidden pb-6 md:pb-0">
        {/* Coluna 1: A Fazer (Novo) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">A Fazer ({novos.length})</h3>
            </div>
            {estacaoFiltro !== 'todas' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase">
                {estacaoFiltro}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {novos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <Utensils className="w-8 h-8 opacity-30 mb-2" />
                <span>Nenhum pedido aguardando nesta estação</span>
              </div>
            ) : (
              novos.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  estacaoFiltro={estacaoFiltro}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onAction={() => {
                    avancarStatusKDS(pedido.id);
                    audio.tocarBipItem();
                  }}
                  actionLabel="Iniciar Preparo"
                  actionIcon={Play}
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Em Preparo */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                No Fogo / Chapa ({emPreparo.length})
              </h3>
            </div>
            {estacaoFiltro !== 'todas' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase">
                {estacaoFiltro}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {emPreparo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <Flame className="w-8 h-8 opacity-30 mb-2" />
                <span>Nenhum prato em preparo agora</span>
              </div>
            ) : (
              emPreparo.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  estacaoFiltro={estacaoFiltro}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onAction={() => {
                    avancarStatusKDS(pedido.id);
                    audio.tocarSucessoVenda();
                  }}
                  actionLabel="Marcar Pronto"
                  actionIcon={Check}
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna 3: Pronto */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Pronto p/ Entrega ({prontos.length})
              </h3>
            </div>
            {estacaoFiltro !== 'todas' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase">
                {estacaoFiltro}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {prontos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <CheckCircle2 className="w-8 h-8 opacity-30 mb-2" />
                <span>Nenhum prato aguardando retirada</span>
              </div>
            ) : (
              prontos.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  estacaoFiltro={estacaoFiltro}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onAction={() => {
                    arquivarPedidoKDS(pedido.id);
                    audio.tocarBipItem();
                  }}
                  actionLabel="Entregar e Finalizar"
                  actionIcon={CheckCircle2}
                  isDone
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KdsCard({
  pedido,
  estacaoFiltro,
  onToggleItem,
  onTicarTodos,
  onAction,
  actionLabel,
  actionIcon: Icon,
  isDone = false,
}: {
  pedido: PedidoKDS;
  estacaoFiltro: EstacaoKDS;
  onToggleItem: (itemIdx: number) => void;
  onTicarTodos: () => void;
  onAction: () => void;
  actionLabel: string;
  actionIcon: any;
  isDone?: boolean;
}) {
  // SLA Visual por tempo
  const minutos = pedido.minutosEspera || 0;
  const isCritico = minutos >= 20;
  const isAtencao = minutos >= 10 && minutos < 20;

  // Itens relevantes conforme filtro
  const itensVisiveis = pedido.itens.map((item, originalIdx) => ({ item, originalIdx }));

  // Contagem de progresso
  const totalItens = pedido.itens.length;
  const concluidosCount = pedido.itens.filter((it) => it.concluido).length;
  const porcentagem = totalItens > 0 ? Math.round((concluidosCount / totalItens) * 100) : 0;
  const todosConcluidos = totalItens > 0 && concluidosCount === totalItens;

  // Detecção de Estação do Pedido
  const temCozinha = pedido.itens.some((it) => it.setorPreparo !== 'bar');
  const temBar = pedido.itens.some((it) => it.setorPreparo === 'bar');
  const estacaoPedido = temCozinha && temBar ? 'misto' : temBar ? 'bar' : 'cozinha';

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all ${
        isDone
          ? 'bg-slate-950/40 border-slate-800 opacity-80'
          : isCritico
          ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
          : isAtencao
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-slate-950 border-slate-800'
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white font-mono">
            #{pedido.numero}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase">
            {pedido.tipo === 'mesa' ? `Mesa #${pedido.mesaNumero}` : pedido.tipo}
          </span>
          {pedido.nomeCliente && pedido.tipo !== 'mesa' && (
            <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[110px]">
              {pedido.nomeCliente}
            </span>
          )}
        </div>

        {/* SLA / Tempo de Espera com Cores */}
        <div
          className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
            isCritico
              ? 'bg-rose-500/20 text-rose-400 animate-pulse'
              : isAtencao
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800 text-emerald-400'
          }`}
          title={
            isCritico
              ? 'Urgente: mais de 20 minutos de espera'
              : isAtencao
              ? 'Atenção: entre 10 e 20 minutos de espera'
              : 'Dentro do prazo'
          }
        >
          <Clock className="w-3 h-3" />
          <span>{minutos} min</span>
        </div>
      </div>

      {/* Indicador de Estação e Barra de Progresso */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            {estacaoPedido === 'misto' ? (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20 flex items-center gap-1">
                <Utensils className="w-2.5 h-2.5" />
                <span>Misto (Cozinha + Bar)</span>
              </span>
            ) : estacaoPedido === 'bar' ? (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 flex items-center gap-1">
                <Wine className="w-2.5 h-2.5" />
                <span>Estação Bar / Copa</span>
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 font-bold border border-orange-500/20 flex items-center gap-1">
                <ChefHat className="w-2.5 h-2.5" />
                <span>Estação Cozinha</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold ${todosConcluidos ? 'text-emerald-400' : 'text-slate-400'}`}>
              {concluidosCount}/{totalItens} prontos
            </span>

            {/* Botão de Ticar Todos */}
            <button
              type="button"
              onClick={onTicarTodos}
              title={todosConcluidos ? 'Desmarcar todos os itens' : 'Marcar todos os itens como concluídos'}
              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>{todosConcluidos ? 'Desmarcar' : 'Todos'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              todosConcluidos ? 'bg-emerald-500' : 'bg-orange-500'
            }`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>

      {/* Lista de Itens com Checklist Individual */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        {itensVisiveis.map(({ item, originalIdx }) => {
          const ehDoSetorBar = item.setorPreparo === 'bar';
          const pertenceAoFiltro =
            estacaoFiltro === 'todas' ||
            (estacaoFiltro === 'bar' && ehDoSetorBar) ||
            (estacaoFiltro === 'cozinha' && !ehDoSetorBar);

          return (
            <div
              key={originalIdx}
              onClick={() => onToggleItem(originalIdx)}
              className={`p-2 rounded-xl border transition-all cursor-pointer select-none ${
                item.concluido
                  ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90'
              } ${!pertenceAoFiltro ? 'opacity-40 grayscale-[50%]' : ''}`}
              title="Clique para marcar este prato como pronto / pendente"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Checkbox Visual Interativo */}
                  <div className="pt-0.5 shrink-0">
                    {item.concluido ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </div>

                  {/* Nome e Quantidade do Item */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`font-mono font-black text-xs ${
                          item.concluido ? 'text-slate-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.quantidade}x
                      </span>
                      <span
                        className={`text-xs font-bold leading-tight ${
                          item.concluido
                            ? 'line-through text-slate-400'
                            : 'text-slate-100'
                        }`}
                      >
                        {item.nome}
                      </span>
                    </div>

                    {/* Observações de 1 Toque com Destaque Forte */}
                    {item.observacoes && (
                      <div className="mt-1 flex items-start gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item.observacoes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge de Estação e Status */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      ehDoSetorBar
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                    }`}
                  >
                    {ehDoSetorBar ? '🍹 Bar' : '🍳 Cozinha'}
                  </span>

                  {item.concluido && (
                    <span className="text-[9px] font-black text-emerald-400 uppercase">
                      ✓ Pronto
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão de Avanço do Pedido */}
      <button
        onClick={onAction}
        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
          isDone
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : todosConcluidos
            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
