import { useState } from 'react';
import {
  ChefHat,
  Wine,
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
  RotateCcw,
  CheckCheck,
  BellRing,
  Sparkles,
  Printer,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSaaSStore, PLANOS_DISPONIVEIS } from '../store/useSaaSStore';
import { audio } from '../lib/audio';
import { PedidoKDS, ItemPedidoKDS } from '../types';
import { DoubleClickButton } from '../components/common/DoubleClickButton';
import { impressaoTermicaService } from '../services/impressaoTermicaService';
import { ModalConfiguracaoImpressao } from '../components/impressao/ModalConfiguracaoImpressao';

export default function KDS() {
  const {
    pedidosKDS,
    historicoKDS,
    iniciarProducaoKDS,
    marcarFeitoKDS,
    marcarEntregueKDS,
    toggleItemConcluidoKDS,
    ticarTodosItensKDS,
    recuperarUltimoPedidoKDS,
  } = useAppStore();

  const { getTenantAtivo, mudarPlanoTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const planoAtual = PLANOS_DISPONIVEIS.find((p) => p.id === tenantAtual?.planoId) || PLANOS_DISPONIVEIS[0];
  const kdsDisponivel = planoAtual.limites.kdsIncluso !== false;

  // Duas Abas Principais: Cozinha e Bar (com opção de Todas)
  const [abaAtiva, setAbaAtiva] = useState<'cozinha' | 'bar' | 'todas'>('cozinha');
  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);

  // Helper para verificar se um item pertence à aba selecionada
  function itemPertenceAba(item: ItemPedidoKDS, aba: 'cozinha' | 'bar' | 'todas'): boolean {
    if (aba === 'todas') return true;
    const ehBar = item.setorPreparo === 'bar';
    return aba === 'bar' ? ehBar : !ehBar;
  }

  // Helper para verificar se o pedido possui itens da aba selecionada
  function pedidoPertenceAba(pedido: PedidoKDS, aba: 'cozinha' | 'bar' | 'todas'): boolean {
    if (aba === 'todas') return true;
    return pedido.itens.some((it) => itemPertenceAba(it, aba));
  }

  // Filtragem dos pedidos ativos
  const pedidosFiltrados = pedidosKDS.filter((p) => pedidoPertenceAba(p, abaAtiva));

  const novos = pedidosFiltrados.filter((p) => p.status === 'novo');
  const emPreparo = pedidosFiltrados.filter((p) => p.status === 'em_preparo');
  const prontos = pedidosFiltrados.filter((p) => p.status === 'pronto');

  // Contadores para as abas
  const pendentesCozinha = pedidosKDS
    .filter((p) => p.status !== 'pronto')
    .filter((p) => p.itens.some((it) => it.setorPreparo !== 'bar')).length;

  const pendentesBar = pedidosKDS
    .filter((p) => p.status !== 'pronto')
    .filter((p) => p.itens.some((it) => it.setorPreparo === 'bar')).length;

  const prontosParaEntrega = pedidosKDS.filter((p) => p.status === 'pronto').length;

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
          <h2 className="text-xl font-black text-white mb-2">Painel de Produção KDS</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            O restaurante <strong className="text-slate-200">{tenantAtual?.nomeFantasia}</strong> está no plano{' '}
            <strong className="text-amber-400">Starter</strong>. O Painel KDS com abas de Cozinha e Bar e confirmação
            em 2 cliques está disponível a partir do <strong className="text-emerald-400">Plano Pro</strong>.
          </p>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-6 space-y-2.5">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Duas abas dedicadas: 🍳 Cozinha e 🍹 Bar</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Avanço seguro em 2 cliques (Produção ➔ Feito ➔ Entregue)</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Aviso automático de prato pronto para entrega pelo Garçom</span>
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
    <div className="h-full flex flex-col space-y-3.5 select-none">
      {/* Top Banner com as Duas Abas: Cozinha & Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Identificação e Duas Abas Centrais */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
                abaAtiva === 'bar'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              }`}
            >
              {abaAtiva === 'bar' ? <Wine className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Painel KDS ({abaAtiva === 'bar' ? 'Bar & Copa' : abaAtiva === 'cozinha' ? 'Cozinha Quente' : 'Visão Geral'})</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-500/20">
                  Tempo Real
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dê <strong>2 cliques</strong> para avançar: Produção ➔ Feito ➔ Garçom Entregou.
              </p>
            </div>
          </div>

          {/* DUAS ABAS EM DESTAQUE (COZINHA E BAR) */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl shrink-0">
            {/* Aba 1: Cozinha */}
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('cozinha');
                audio.tocarBipItem();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                abaAtiva === 'cozinha'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-slate-400 hover:text-orange-300'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>🍳 COZINHA</span>
              {pendentesCozinha > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    abaAtiva === 'cozinha'
                      ? 'bg-white text-orange-600'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}
                >
                  {pendentesCozinha}
                </span>
              )}
            </button>

            {/* Aba 2: Bar */}
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('bar');
                audio.tocarBipItem();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                abaAtiva === 'bar'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Wine className="w-4 h-4" />
              <span>🍹 BAR / COPA</span>
              {pendentesBar > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    abaAtiva === 'bar'
                      ? 'bg-white text-purple-700'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {pendentesBar}
                </span>
              )}
            </button>

            {/* Opção Secundária: Todas as Estações */}
            <button
              type="button"
              onClick={() => setAbaAtiva('todas')}
              title="Visualizar todas as estações integradas"
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaAtiva === 'todas'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>Todas</span>
            </button>
          </div>
        </div>

        {/* Lado Direito: Prontos / Recall / Som */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          {prontosParaEntrega > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
              <BellRing className="w-3.5 h-3.5" />
              <span>{prontosParaEntrega} feito(s) p/ entrega!</span>
            </div>
          )}

          {/* Desfazer / Recall */}
          {historicoKDS && historicoKDS.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const rec = recuperarUltimoPedidoKDS();
                if (rec) {
                  audio.tocarBipItem();
                }
              }}
              title="Desfazer e recuperar o último pedido marcado como entregue"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desfazer #{historicoKDS[0].numero}</span>
            </button>
          )}

          {/* Testar Alerta Sonoro */}
          <button
            type="button"
            onClick={() => audio.tocarAlertaNotificacao()}
            title="Testar alarme sonoro de novo pedido"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Som</span>
          </button>

          {/* Configurar Impressão Térmica */}
          <button
            type="button"
            onClick={() => setModalImpressaoAberto(true)}
            title="Configurações de Impressão Térmica (Cozinha & Bar)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#FF6B00] border border-[#FF6B00]/30 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FF6B00]" />
            <span className="hidden sm:inline">Impressoras</span>
          </button>
        </div>
      </div>

      {/* Faixa Explicativa da Regra dos 2 Cliques */}
      <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Fluxo Seguro de 2 Cliques:</strong> Cozinheiro/Barman dá 2 cliques para{' '}
            <strong className="text-blue-400">Em Produção</strong>, 2 cliques para{' '}
            <strong className="text-emerald-400">Marcar Feito</strong>, e o Garçom dá 2 cliques para{' '}
            <strong className="text-purple-300">Avisar que já foi Entregue</strong>.
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] text-slate-500">
          Aba ativa: <strong className="text-slate-200 uppercase">{abaAtiva}</strong>
        </span>
      </div>

      {/* Colunas do Kanban KDS */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-y-auto md:overflow-hidden pb-6 md:pb-0">
        {/* Coluna 1: A Fazer (Novo) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. A Fazer ({novos.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
              Aguardando
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {novos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <Utensils className="w-8 h-8 opacity-25 mb-2" />
                <span>Nenhum pedido novo nesta estação</span>
              </div>
            ) : (
              novos.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  abaAtiva={abaAtiva}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onConfirmarAvanco={() => {
                    iniciarProducaoKDS(pedido.id);
                    audio.tocarBipItem();
                  }}
                  etapa="a_fazer"
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Em Produção (No Fogo / Chapa / Coqueteleira) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Em Produção ({emPreparo.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {abaAtiva === 'bar' ? 'Na Coqueteleira' : 'No Fogo/Chapa'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {emPreparo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <Flame className="w-8 h-8 opacity-25 mb-2" />
                <span>Nenhum item sendo preparado agora</span>
              </div>
            ) : (
              emPreparo.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  abaAtiva={abaAtiva}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onConfirmarAvanco={() => {
                    marcarFeitoKDS(pedido.id);
                    audio.tocarSucessoVenda();
                  }}
                  etapa="em_producao"
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna 3: Feito / Pronto na Bancada (Garçom Entregou) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Feito / Na Bancada ({prontos.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Aguardando Garçom
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {prontos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs p-6 text-center">
                <CheckCircle2 className="w-8 h-8 opacity-25 mb-2" />
                <span>Nenhum prato na bancada aguardando entrega</span>
              </div>
            ) : (
              prontos.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  abaAtiva={abaAtiva}
                  onToggleItem={(idx) => {
                    toggleItemConcluidoKDS(pedido.id, idx);
                    audio.tocarCheckItem();
                  }}
                  onTicarTodos={() => {
                    ticarTodosItensKDS(pedido.id);
                    audio.tocarCheckItem();
                  }}
                  onConfirmarAvanco={() => {
                    marcarEntregueKDS(pedido.id);
                    audio.tocarBipItem();
                  }}
                  etapa="feito"
                  isDone
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuração de Impressão Térmica (Cozinha & Bar) */}
      <ModalConfiguracaoImpressao
        isOpen={modalImpressaoAberto}
        onClose={() => setModalImpressaoAberto(false)}
        nomeRestaurante={tenantAtual?.nomeFantasia || 'EloGastrô'}
      />
    </div>
  );
}

function KdsCard({
  pedido,
  abaAtiva,
  onToggleItem,
  onTicarTodos,
  onConfirmarAvanco,
  etapa,
  isDone = false,
}: {
  pedido: PedidoKDS;
  abaAtiva: 'cozinha' | 'bar' | 'todas';
  onToggleItem: (itemIdx: number) => void;
  onTicarTodos: () => void;
  onConfirmarAvanco: () => void;
  etapa: 'a_fazer' | 'em_producao' | 'feito';
  isDone?: boolean;
}) {
  const minutos = pedido.minutosEspera || 0;
  const isCritico = minutos >= 20;
  const isAtencao = minutos >= 10 && minutos < 20;

  // Filtragem dos itens exibidos no card de acordo com a aba selecionada
  const itensComIndices = pedido.itens.map((item, originalIdx) => ({ item, originalIdx }));
  const itensPertencentes = itensComIndices.filter(({ item }) => {
    if (abaAtiva === 'todas') return true;
    const ehBar = item.setorPreparo === 'bar';
    return abaAtiva === 'bar' ? ehBar : !ehBar;
  });

  const outrosItensQtd = totalItensDaOutraEstacao(pedido, abaAtiva);

  function totalItensDaOutraEstacao(p: PedidoKDS, aba: 'cozinha' | 'bar' | 'todas'): number {
    if (aba === 'todas') return 0;
    const buscaBar = aba === 'cozinha'; // na cozinha, os outros são bar
    return p.itens.filter((it) => (buscaBar ? it.setorPreparo === 'bar' : it.setorPreparo !== 'bar')).length;
  }

  // Progresso dos itens
  const totalItens = itensPertencentes.length > 0 ? itensPertencentes.length : pedido.itens.length;
  const concluidosCount = (itensPertencentes.length > 0 ? itensPertencentes : itensComIndices).filter(
    ({ item }) => item.concluido
  ).length;
  const porcentagem = totalItens > 0 ? Math.round((concluidosCount / totalItens) * 100) : 0;
  const todosConcluidos = totalItens > 0 && concluidosCount === totalItens;

  // Rótulos e Ícones para a Regra dos 2 Cliques
  let btnLabelDefault = '⚡ 2 Cliques: Iniciar Produção';
  let btnLabelConfirm = 'Dê +1 clique p/ Iniciar Produção';
  let btnIcon = <Play className="w-3.5 h-3.5" />;
  let btnClass = 'w-full py-2.5 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20';

  if (etapa === 'em_producao') {
    btnLabelDefault = '⚡ 2 Cliques: Marcar como Feito';
    btnLabelConfirm = 'Dê +1 clique p/ Marcar Feito';
    btnIcon = <Check className="w-3.5 h-3.5" />;
    btnClass = 'w-full py-2.5 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25';
  } else if (etapa === 'feito') {
    btnLabelDefault = '⚡ 2 Cliques: Garçom Entregou';
    btnLabelConfirm = 'Dê +1 clique p/ Confirmar Entrega';
    btnIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
    btnClass = 'w-full py-2.5 rounded-xl font-black text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25';
  }

  return (
    <div
      onDoubleClick={onConfirmarAvanco}
      className={`rounded-2xl border p-4 space-y-3 transition-all select-none ${
        isDone
          ? 'bg-slate-950/80 border-emerald-500/30 ring-1 ring-emerald-500/20'
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
            <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[100px]">
              {pedido.nomeCliente}
            </span>
          )}
        </div>

        {/* Ações e SLA / Tempo com Cores */}
        <div className="flex items-center gap-1.5">
          {/* Botão Imprimir / Reimprimir Ticket */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              impressaoTermicaService.imprimirTicketSetor({
                pedidoId: pedido.id,
                numeroPedido: pedido.numero,
                tipo: pedido.tipo as any,
                mesaNumero: pedido.mesaNumero,
                clienteNome: pedido.nomeCliente,
                setorAlvo: abaAtiva === 'bar' ? 'bar' : 'cozinha',
                itens: (itensPertencentes.length > 0 ? itensPertencentes : itensComIndices).map(({ item }) => ({
                  nome: item.nome,
                  quantidade: item.quantidade,
                  observacoes: item.observacoes,
                  setorPreparo: item.setorPreparo,
                })),
              });
            }}
            title="Imprimir / Reimprimir Ticket na Impressora Térmica"
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <div
            className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              isCritico
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : isAtencao
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-emerald-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{minutos} min</span>
          </div>
        </div>
      </div>

      {/* Indicador de Progresso e Aviso de Outra Estação */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            {outrosItensQtd > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-bold">
                +{outrosItensQtd} item(ns) no {abaAtiva === 'cozinha' ? '🍹 Bar' : '🍳 Cozinha'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold ${todosConcluidos ? 'text-emerald-400' : 'text-slate-400'}`}>
              {concluidosCount}/{totalItens} prontos
            </span>

            {/* Ticar Todos */}
            <button
              type="button"
              onClick={onTicarTodos}
              title={todosConcluidos ? 'Desmarcar todos' : 'Ticar todos os itens'}
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

      {/* Lista de Itens do Pedido */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        {(itensPertencentes.length > 0 ? itensPertencentes : itensComIndices).map(
          ({ item, originalIdx }) => {
            const ehDoSetorBar = item.setorPreparo === 'bar';

            return (
              <div
                key={originalIdx}
                onClick={() => onToggleItem(originalIdx)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  item.concluido
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90'
                }`}
                title="Clique para marcar prato pronto / pendente"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="pt-0.5 shrink-0">
                      {item.concluido ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </div>

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
                            item.concluido ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {item.nome}
                        </span>
                      </div>

                      {/* Observações com Destaque */}
                      {item.observacoes && (
                        <div className="mt-1 flex items-start gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{item.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>

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
                      <span className="text-[9px] font-black text-emerald-400 uppercase">✓ Feito</span>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* BOTÃO DA REGRA DOS 2 CLIQUES */}
      <DoubleClickButton
        onConfirm={onConfirmarAvanco}
        labelDefault={btnLabelDefault}
        labelConfirm={btnLabelConfirm}
        iconDefault={btnIcon}
        className={btnClass}
        title="Dê 2 cliques para avançar esta comanda com segurança"
      />
    </div>
  );
}
