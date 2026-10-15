import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Flame,
  Volume2,
  Lock,
  Crown,
  ArrowUpRight,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSaaSStore, PLANOS_DISPONIVEIS } from '../store/useSaaSStore';
import { audio } from '../lib/audio';
import { PedidoKDS } from '../types';

export default function KDS() {
  const { pedidosKDS, avancarStatusKDS } = useAppStore();
  const { getTenantAtivo, mudarPlanoTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const planoAtual = PLANOS_DISPONIVEIS.find((p) => p.id === tenantAtual?.planoId) || PLANOS_DISPONIVEIS[0];
  const kdsDisponivel = planoAtual.limites.kdsIncluso !== false;

  const novos = pedidosKDS.filter((p) => p.status === 'novo');
  const emPreparo = pedidosKDS.filter((p) => p.status === 'em_preparo');
  const prontos = pedidosKDS.filter((p) => p.status === 'pronto');

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
            O restaurante <strong className="text-slate-200">{tenantAtual?.nomeFantasia}</strong> está no plano <strong className="text-amber-400">Starter</strong> (ideal para operação essencial com cardápio QR Code e PDV). O Painel de Cozinha KDS sem papel em tempo real está disponível a partir do <strong className="text-emerald-400">Plano Pro</strong>.
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
              <span>Mesas ilimitadas e múltiplos setores de preparo</span>
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Painel da Cozinha (KDS)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-500/20">
                Tempo Real
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ordem de preparo sem papel e sem gritos na cozinha.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => audio.tocarAlertaNotificacao()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Testar Alerta Sonoro</span>
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
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {novos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                Nenhum pedido aguardando
              </div>
            ) : (
              novos.map((pedido) => (
                <KdsCard key={pedido.id} pedido={pedido} onAction={() => avancarStatusKDS(pedido.id)} actionLabel="Iniciar Preparo" actionIcon={Play} />
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Em Preparo */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">No Fogo / Chapa ({emPreparo.length})</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {emPreparo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                Nenhum prato sendo preparado
              </div>
            ) : (
              emPreparo.map((pedido) => (
                <KdsCard key={pedido.id} pedido={pedido} onAction={() => avancarStatusKDS(pedido.id)} actionLabel="Marcar Pronto" actionIcon={Check} />
              ))
            )}
          </div>
        </div>

        {/* Coluna 3: Pronto */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pronto p/ Entrega ({prontos.length})</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {prontos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                Nenhum prato aguardando retirada
              </div>
            ) : (
              prontos.map((pedido) => (
                <KdsCard key={pedido.id} pedido={pedido} onAction={() => alert(`Pedido #${pedido.numero} entregue e arquivado!`)} actionLabel="Entregar" actionIcon={CheckCircle2} isDone />
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
  onAction,
  actionLabel,
  actionIcon: Icon,
  isDone = false,
}: {
  pedido: PedidoKDS;
  onAction: () => void;
  actionLabel: string;
  actionIcon: any;
  isDone?: boolean;
}) {
  const isAtrasado = pedido.minutosEspera > 20;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all ${
        isDone
          ? 'bg-slate-950/40 border-slate-800 opacity-80'
          : isAtrasado
          ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
          : 'bg-slate-950 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white font-mono">
            #{pedido.numero}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase">
            {pedido.tipo === 'mesa' ? `Mesa #${pedido.mesaNumero}` : pedido.tipo}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
            isAtrasado
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>{pedido.minutosEspera} min</span>
        </div>
      </div>

      {/* Lista de Itens do Pedido */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        {pedido.itens.map((item, idx) => (
          <div key={idx} className="text-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-emerald-400 text-sm">
                {item.quantidade}x
              </span>
              <span className="font-bold text-slate-100">{item.nome}</span>
            </div>
            {item.observacoes && (
              <p className="text-[11px] text-amber-400 font-semibold pl-6 mt-0.5">
                Obs: {item.observacoes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Botão de Avanço */}
      <button
        onClick={onAction}
        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
          isDone
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
