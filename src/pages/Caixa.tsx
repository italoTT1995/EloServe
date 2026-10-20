import { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Lock,
  Unlock,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Coins,
  FileText,
  Printer,
  X,
  Check,
  MessageSquare,
  HelpCircle,
  RotateCcw,
  History,
  AlertCircle,
  Package,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { AdminAuthModal } from '../components/common/AdminAuthModal';
import { ContagemDinheiroFisico, QuestionarioFechamentoCaixa, VendaRealizada } from '../types';

export default function Caixa() {
  const {
    caixaAtual,
    fecharCaixa,
    abrirCaixa,
    vendas,
    cancelarVenda,
    limparVendasTurno,
    operadorAtivo,
    registrarSangria,
    registrarSuprimento,
    movimentosCaixa,
  } = useAppStore();
  const { itens, processarAberturaDiaConsumoPrevisto, ajustarSobraDiaAnterior } = useEstoqueStore();
  const { usuarioLogado, temPermissao } = useAuthStore();
  const ehAdminOuGerente = temPermissao(['super_admin', 'admin_restaurante']);

  const isAberto = caixaAtual.status === 'aberto';

  // Modais
  const [modalAbertura, setModalAbertura] = useState(false);
  const [modalFechamento, setModalFechamento] = useState(false);
  const [comprovanteAbertura, setComprovanteAbertura] = useState<{ troco: number; horario: string; operador: string } | null>(null);
  const [comprovanteFechamento, setComprovanteFechamento] = useState<QuestionarioFechamentoCaixa | null>(null);

  // Estados de Estorno & Histórico de Vendas
  const [vendaParaEstorno, setVendaParaEstorno] = useState<VendaRealizada | null>(null);
  const [motivoEstorno, setMotivoEstorno] = useState('');
  const [sucessoEstorno, setSucessoEstorno] = useState<string | null>(null);
  const [filtroVendas, setFiltroVendas] = useState<'todas' | 'concluidas' | 'canceladas'>('todas');

  // Estados de Limpeza do Histórico de Vendas (Exclusivo Gerente/Admin)
  const [modalAuthLimpeza, setModalAuthLimpeza] = useState(false);
  const [modalConfirmarLimpeza, setModalConfirmarLimpeza] = useState(false);
  const [modoLimpeza, setModoLimpeza] = useState<'apenas_canceladas' | 'todas'>('apenas_canceladas');
  const [zerarTotalCaixa, setZerarTotalCaixa] = useState(false);
  const [sucessoLimpeza, setSucessoLimpeza] = useState<string | null>(null);

  // Estados de Sangria e Suprimento
  const [modalSangria, setModalSangria] = useState(false);
  const [valorSangria, setValorSangria] = useState('');
  const [motivoSangria, setMotivoSangria] = useState('');

  const [modalSuprimento, setModalSuprimento] = useState(false);
  const [valorSuprimento, setValorSuprimento] = useState('');
  const [motivoSuprimento, setMotivoSuprimento] = useState('');

  // Estados da Abertura: Contagem de Moedas e Cédulas (Seção 6.2)
  const [contagemAbertura, setContagemAbertura] = useState<ContagemDinheiroFisico>({
    moedas050: 20, // R$ 10,00
    moedas100: 30, // R$ 30,00
    cedulas002: 10, // R$ 20,00
    cedulas005: 10, // R$ 50,00
    cedulas010: 4,  // R$ 40,00
    cedulas020: 0,
    cedulas050: 0,
    cedulas100: 0,
  });

  // Conferência de Sobras do Último Funcionamento (Seção 1.7)
  const [sobrouArroz, setSobrouArroz] = useState(false);
  const [qtdSobraArroz, setQtdSobraArroz] = useState(0.5);

  const totalTrocoAbertura =
    contagemAbertura.moedas050 * 0.5 +
    contagemAbertura.moedas100 * 1.0 +
    contagemAbertura.cedulas002 * 2.0 +
    contagemAbertura.cedulas005 * 5.0 +
    contagemAbertura.cedulas010 * 10.0 +
    contagemAbertura.cedulas020 * 20.0 +
    contagemAbertura.cedulas050 * 50.0 +
    contagemAbertura.cedulas100 * 100.0;

  // Estados do Fechamento (Seções 6.4, 6.5, 14.4)
  const [dinheiroContadoFechamento, setDinheiroContadoFechamento] = useState<number>(150);
  const [justificativaDivergencia, setJustificativaDivergencia] = useState('');
  const [questionario, setQuestionario] = useState<{
    avaliacaoDia: 'otimo' | 'bom' | 'regular' | 'dificil';
    fluxoClientes: 'alto' | 'medio' | 'baixo';
    teveOcorrencia: boolean;
    descricaoOcorrencia: string;
  }>({
    avaliacaoDia: 'bom',
    fluxoClientes: 'medio',
    teveOcorrencia: false,
    descricaoOcorrencia: '',
  });

  // Cálculos de Vendas e Fechamento
  const totalVendasDinheiro = (vendas || [])
    .filter((v) => v.status === 'concluida' && v.formaPagamento === 'dinheiro')
    .reduce((acc, v) => acc + (v.total || 0), 0);

  const valorEsperadoDinheiro = Number(
    (
      (caixaAtual.saldoInicial || 0) +
      (totalVendasDinheiro > 0 ? totalVendasDinheiro : (caixaAtual.totalVendas || 0) * 0.35) +
      (caixaAtual.totalSuprimentos || 0) -
      (caixaAtual.totalSangrias || 0)
    ).toFixed(2)
  );
  const diferencaFechamento = Number((dinheiroContadoFechamento - valorEsperadoDinheiro).toFixed(2));

  function handleConfirmarAbertura(e: React.FormEvent) {
    e.preventDefault();
    if (sobrouArroz) {
      const itemArroz = itens.find((i) => i.nome.toLowerCase().includes('arroz'));
      if (itemArroz) {
        ajustarSobraDiaAnterior(itemArroz.id, qtdSobraArroz);
      }
    }
    // Desconta o consumo diário previsto ajustado com sobras
    processarAberturaDiaConsumoPrevisto();

    abrirCaixa(totalTrocoAbertura);
    setModalAbertura(false);
    setComprovanteAbertura({
      troco: totalTrocoAbertura,
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operador: caixaAtual.operador,
    });
  }

  function handleConfirmarFechamento(e: React.FormEvent) {
    e.preventDefault();
    const fechamento: QuestionarioFechamentoCaixa = {
      avaliacaoDia: questionario.avaliacaoDia,
      fluxoClientes: questionario.fluxoClientes,
      teveOcorrencia: questionario.teveOcorrencia,
      descricaoOcorrencia: questionario.descricaoOcorrencia || undefined,
      valorEsperadoDinheiro,
      valorContadoDinheiro: dinheiroContadoFechamento,
      divergencia: diferencaFechamento,
      justificativaDivergencia: justificativaDivergencia || undefined,
      fechadoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsavel: caixaAtual.operador,
    };

    fecharCaixa();
    setModalFechamento(false);
    setComprovanteFechamento(fechamento);
  }

  function handleConfirmarEstorno() {
    if (!vendaParaEstorno) return;
    const res = cancelarVenda(
      vendaParaEstorno.id,
      motivoEstorno || 'Estorno solicitado pelo operador de caixa',
      operadorAtivo || caixaAtual.operador
    );
    if (res.sucesso) {
      setSucessoEstorno(`Venda #${vendaParaEstorno.id} cancelada com sucesso! Os insumos foram repostos no estoque.`);
      setTimeout(() => setSucessoEstorno(null), 5000);
      setVendaParaEstorno(null);
      setMotivoEstorno('');
    } else {
      alert(res.mensagem || 'Erro ao estornar venda.');
    }
  }

  function handleSolicitarLimpeza() {
    if (ehAdminOuGerente) {
      setModalConfirmarLimpeza(true);
    } else {
      // Requer autorização por PIN de Gerente / Administrador
      setModalAuthLimpeza(true);
    }
  }

  function handleAuthLimpezaSucesso() {
    setModalConfirmarLimpeza(true);
  }

  function handleConfirmarLimpeza() {
    const res = limparVendasTurno(modoLimpeza, modoLimpeza === 'todas' && zerarTotalCaixa);
    setModalConfirmarLimpeza(false);
    setSucessoLimpeza(
      modoLimpeza === 'apenas_canceladas'
        ? `Limpeza concluída! ${res.removidas} venda(s) cancelada(s) foram removidas do histórico.`
        : `Limpeza geral concluída! O histórico do turno foi reiniciado (${res.removidas} registros removidos).`
    );
    setTimeout(() => {
      setSucessoLimpeza(null);
    }, 6000);
  }

  const vendasFiltradas = vendas.filter((v) => {
    if (filtroVendas === 'concluidas') return v.status === 'concluida';
    if (filtroVendas === 'canceladas') return v.status === 'cancelada';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl select-none mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Gestão de Caixa & Fechamento Diário</span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isAberto
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isAberto ? 'Caixa em Operação' : 'Caixa Encerrado'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operador responsável: <span className="text-white font-semibold">{caixaAtual.operador}</span>
            {isAberto && ` • Aberto às ${caixaAtual.abertoEm}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isAberto ? (
            <>
              <button
                onClick={() => setModalSuprimento(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Reforço (Suprimento)</span>
              </button>
              <button
                onClick={() => setModalSangria(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Sangria (Despesa)</span>
              </button>
              <button
                onClick={() => {
                  setDinheiroContadoFechamento(Number(valorEsperadoDinheiro.toFixed(2)));
                  setModalFechamento(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Fechamento Diário</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setModalAbertura(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>Abertura de Caixa & Contagem de Troco</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Troco Inicial Físico</p>
          <p className="text-2xl font-black text-white font-mono">
            R$ {caixaAtual.saldoInicial.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium block">
            Separado do faturamento
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Vendas do Dia (Total)</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            R$ {caixaAtual.totalVendas.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            Pix, Cartões e Dinheiro
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Despesas & Retiradas</p>
          <p className="text-2xl font-black text-rose-400 font-mono">
            R$ {caixaAtual.totalSangrias.toFixed(2)}
          </p>
          <span className="text-[10px] text-rose-400/80 font-semibold block">
            Saídas documentadas
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Dinheiro Esperado na Gaveta</p>
          <p className="text-2xl font-black text-amber-400 font-mono">
            R$ {valorEsperadoDinheiro.toFixed(2)}
          </p>
          <span className="text-[10px] text-amber-400/80 font-semibold block">
            Troco + Vendas em espécie
          </span>
        </div>
      </div>

      {/* Comprovante de Abertura emitido recentemente */}
      {comprovanteAbertura && (
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Via de Abertura do Caixa (Impressão Emitida)</span>
            </h4>
            <button onClick={() => setComprovanteAbertura(null)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <p className="text-slate-400">Horário: <strong className="text-white">{comprovanteAbertura.horario}</strong></p>
            <p className="text-slate-400">Operador: <strong className="text-white">{comprovanteAbertura.operador}</strong></p>
            <p className="text-slate-400">Troco Inicial: <strong className="text-emerald-400">R$ {comprovanteAbertura.troco.toFixed(2)}</strong></p>
            <p className="text-slate-400">Vendas Iniciais: <strong className="text-white">R$ 0,00</strong></p>
          </div>
        </div>
      )}

      {/* Comprovante de Fechamento Emitido */}
      {comprovanteFechamento && (
        <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Resumo & Comprovante de Fechamento Diário</span>
            </h4>
            <button onClick={() => setComprovanteFechamento(null)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Avaliação do Dia:</span>
              <p className="text-white font-bold capitalize mt-0.5">{comprovanteFechamento.avaliacaoDia}</p>
              <span className="text-[10px] text-slate-400 block mt-1">Fluxo: {comprovanteFechamento.fluxoClientes}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Conferência Física:</span>
              <p className="text-emerald-400 font-mono font-bold mt-0.5">
                Contado: R$ {comprovanteFechamento.valorContadoDinheiro.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Esperado: R$ {comprovanteFechamento.valorEsperadoDinheiro.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Situação da Gaveta:</span>
              <p className={`font-mono font-bold mt-0.5 ${comprovanteFechamento.divergencia === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comprovanteFechamento.divergencia === 0 ? '✓ Caixa Exato' : `Divergência: R$ ${comprovanteFechamento.divergencia.toFixed(2)}`}
              </p>
              {comprovanteFechamento.justificativaDivergencia && (
                <span className="text-[10px] text-slate-400 block mt-1">Obs: {comprovanteFechamento.justificativaDivergencia}</span>
              )}
            </div>
          </div>

          {comprovanteFechamento.teveOcorrencia && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-300">
              <strong>Ocorrência Registrada:</strong> {comprovanteFechamento.descricaoOcorrencia}
            </div>
          )}
        </div>
      )}

      {/* Feedback de Sucesso no Estorno */}
      {sucessoEstorno && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sucessoEstorno}</span>
          </div>
          <button onClick={() => setSucessoEstorno(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Feedback de Sucesso na Limpeza */}
      {sucessoLimpeza && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sucessoLimpeza}</span>
          </div>
          <button onClick={() => setSucessoLimpeza(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Histórico de Vendas do Turno & Estorno de Estoque */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              <span>Vendas do Turno & Estorno de Estoque</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {vendas.length} {vendas.length === 1 ? 'venda' : 'vendas'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe as vendas realizadas no PDV, o consumo de receitas e realize estornos com devolução automática aos insumos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFiltroVendas('todas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filtroVendas === 'todas'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({vendas.length})
              </button>
              <button
                onClick={() => setFiltroVendas('concluidas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filtroVendas === 'concluidas'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Concluídas ({vendas.filter((v) => v.status === 'concluida').length})
              </button>
              <button
                onClick={() => setFiltroVendas('canceladas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filtroVendas === 'canceladas'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Estornadas ({vendas.filter((v) => v.status === 'cancelada').length})
              </button>
            </div>

            <button
              onClick={handleSolicitarLimpeza}
              disabled={vendas.length === 0}
              title={
                ehAdminOuGerente
                  ? 'Limpar histórico de vendas do turno (Gerente/Admin)'
                  : 'Requer PIN de Gerente / Administrador para efetuar a limpeza'
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-800 bg-slate-950 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Limpar</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                Gerente/Admin
              </span>
            </button>
          </div>
        </div>

        {vendasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-950/50 border border-dashed border-slate-800">
            Nenhuma venda encontrada para o filtro selecionado.
          </div>
        ) : (
          <div className="space-y-2.5">
            {vendasFiltradas.map((v) => {
              const isCancelada = v.status === 'cancelada';
              return (
                <div
                  key={v.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCancelada
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">#{v.id}</span>
                        <span className="text-xs text-slate-400 font-mono">{v.dataHora}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-semibold">
                          {v.formaPagamento}
                        </span>
                        {isCancelada ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
                            Cancelada & Estornada
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                            Concluída
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Operador: <strong className="text-white">{v.operador}</strong>
                        </span>
                      </div>

                      {/* Itens da Venda */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {v.itens.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                          >
                            <span className="font-bold text-orange-400">{it.quantidade}x</span>
                            <span>{it.nome}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (R$ {it.subtotal.toFixed(2)})
                            </span>
                            {it.fichaTecnica && it.fichaTecnica.length > 0 && (
                              <span
                                title={`${it.fichaTecnica.length} ingrediente(s) baixado(s) do estoque`}
                                className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded ml-1"
                              >
                                🥗 Ficha Técnica
                              </span>
                            )}
                          </span>
                        ))}
                      </div>

                      {isCancelada && v.motivoCancelamento && (
                        <p className="text-xs text-rose-300 pt-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Cancelado em {v.canceladoEm}: <strong className="italic">"{v.motivoCancelamento}"</strong> (Insumos devolvidos ao estoque)
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Valor Total:</span>
                        <span
                          className={`text-lg font-black font-mono ${
                            isCancelada ? 'text-slate-500 line-through' : 'text-emerald-400'
                          }`}
                        >
                          R$ {v.total.toFixed(2)}
                        </span>
                      </div>

                      {!isCancelada && (
                        <button
                          onClick={() => {
                            setVendaParaEstorno(v);
                            setMotivoEstorno('Cancelamento solicitado no Caixa');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Estornar Venda</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação do Estorno de Venda no Caixa */}
      {vendaParaEstorno && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <span>Estornar Venda #{vendaParaEstorno.id}</span>
              </h3>
              <button
                onClick={() => setVendaParaEstorno(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs space-y-2 text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Devolução Automática de Estoque e Ajuste de Caixa</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ao estornar esta venda, todos os insumos e ingredientes previstos nas fichas técnicas dos pratos serão{' '}
                <strong className="text-white">repostos imediatamente ao Estoque</strong> com movimentação auditável, e o valor de{' '}
                <strong className="text-emerald-400">R$ {vendaParaEstorno.total.toFixed(2)}</strong> será deduzido do total de vendas deste caixa.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Itens a serem estornados:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {vendaParaEstorno.itens.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/60 last:border-0">
                    <div>
                      <span className="font-bold text-white">{it.quantidade}x {it.nome}</span>
                      {it.fichaTecnica && it.fichaTecnica.length > 0 && (
                        <p className="text-[10px] text-emerald-400">
                          {it.fichaTecnica.map((ft) => `${ft.ingredienteNome} (${ft.quantidade * it.quantidade} ${ft.unidadeMedida})`).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">R$ {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Motivo da Devolução / Estorno:
              </label>
              <input
                type="text"
                required
                value={motivoEstorno}
                onChange={(e) => setMotivoEstorno(e.target.value)}
                placeholder="Ex: Cliente desistiu antes do preparo, erro de digitação..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVendaParaEstorno(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEstorno}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
              >
                Confirmar Estorno & Repor Estoque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ABERTURA DETALHADA COM CONTAGEM DE TROCO E SOBRAS (1.7) */}
      {/* ============================================================== */}
      {modalAbertura && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <span>Abertura de Caixa & Contagem de Troco</span>
              </h3>
              <button onClick={() => setModalAbertura(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAbertura} className="space-y-4 text-xs">
              {/* Contagem de Moedas e Cédulas (Seção 6.2) */}
              <div>
                <p className="text-slate-300 font-bold mb-2">Informe as Moedas e Cédulas para o Fundo de Troco:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Moedas R$ 0,50:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.moedas050}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, moedas050: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Moedas R$ 1,00:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.moedas100}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, moedas100: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Notas R$ 2,00:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.cedulas002}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, cedulas002: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Notas R$ 5,00:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.cedulas005}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, cedulas005: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Notas R$ 10,00:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.cedulas010}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, cedulas010: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Notas R$ 20,00:</span>
                    <input
                      type="number"
                      min="0"
                      value={contagemAbertura.cedulas020}
                      onChange={(e) => setContagemAbertura({ ...contagemAbertura, cedulas020: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Total do Fundo de Troco Calculado:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    R$ {totalTrocoAbertura.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pop-up de Sobras do Último Funcionamento (Seção 1.7) */}
              <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Conferência de Sobras do Dia Anterior (Seção 1.7)</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  "Sobrou arroz ou insumo preparado do último funcionamento?"
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sobra"
                      checked={!sobrouArroz}
                      onChange={() => setSobrouArroz(false)}
                      className="accent-purple-600"
                    />
                    <span className="text-slate-300">Não, iniciar previsão integral</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sobra"
                      checked={sobrouArroz}
                      onChange={() => setSobrouArroz(true)}
                      className="accent-purple-600"
                    />
                    <span className="text-purple-300 font-bold">Sim, registrar sobra</span>
                  </label>
                </div>

                {sobrouArroz && (
                  <div className="pt-2 flex items-center gap-2">
                    <label className="text-[11px] text-slate-300">Quantidade aproveitável de sobra (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={qtdSobraArroz}
                      onChange={(e) => setQtdSobraArroz(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-slate-950 border border-purple-500/40 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbertura(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Abertura & Emitir Via
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FECHAMENTO DIÁRIO COM QUESTIONÁRIO OBRIGATÓRIO (14.4)    */}
      {/* ============================================================== */}
      {modalFechamento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>Fechamento Diário do Caixa</span>
              </h3>
              <button onClick={() => setModalFechamento(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarFechamento} className="space-y-4 text-xs">
              {/* Conferência Física */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Esperado em Dinheiro:</span>
                  <span className="font-mono font-bold text-white">R$ {valorEsperadoDinheiro.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Valor Efetivamente Contado na Gaveta:</label>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={dinheiroContadoFechamento}
                      onChange={(e) => setDinheiroContadoFechamento(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {diferencaFechamento !== 0 && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 space-y-1.5">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Divergência Apurada: R$ {diferencaFechamento.toFixed(2)}</span>
                    </p>
                    <input
                      type="text"
                      required
                      value={justificativaDivergencia}
                      onChange={(e) => setJustificativaDivergencia(e.target.value)}
                      placeholder="Justificativa da diferença (obrigatório)..."
                      className="w-full px-2.5 py-1 bg-slate-900 border border-rose-500/40 rounded-lg text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Questionário Obrigatório de Fechamento (Seção 14.4) */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Questionário do Funcionamento do Dia (Seção 14.4)</span>
                </p>

                {/* Pergunta 1 */}
                <div>
                  <label className="text-slate-300 block mb-1">Como foi o funcionamento do dia de hoje?</label>
                  <select
                    value={questionario.avaliacaoDia}
                    onChange={(e) => setQuestionario({ ...questionario, avaliacaoDia: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="otimo">Excelente / Sem problemas</option>
                    <option value="bom">Bom / Operação fluida</option>
                    <option value="regular">Regular / Pequenos contratempos</option>
                    <option value="dificil">Difícil / Sobrecarga de pedidos</option>
                  </select>
                </div>

                {/* Pergunta 2 */}
                <div>
                  <label className="text-slate-300 block mb-1">O fluxo de clientes foi:</label>
                  <div className="flex gap-4">
                    {(['baixo', 'medio', 'alto'] as const).map((fl) => (
                      <label key={fl} className="flex items-center gap-1.5 cursor-pointer capitalize">
                        <input
                          type="radio"
                          name="fluxo"
                          checked={questionario.fluxoClientes === fl}
                          onChange={() => setQuestionario({ ...questionario, fluxoClientes: fl })}
                          className="accent-purple-600"
                        />
                        <span className="text-slate-300">{fl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pergunta 3 */}
                <div>
                  <label className="text-slate-300 block mb-1">Houve alguma ocorrência durante o funcionamento?</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="ocorrencia"
                        checked={!questionario.teveOcorrencia}
                        onChange={() => setQuestionario({ ...questionario, teveOcorrencia: false })}
                        className="accent-purple-600"
                      />
                      <span className="text-slate-300">Não, tudo normal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="ocorrencia"
                        checked={questionario.teveOcorrencia}
                        onChange={() => setQuestionario({ ...questionario, teveOcorrencia: true })}
                        className="accent-purple-600"
                      />
                      <span className="text-amber-400 font-bold">Sim, registrar ocorrência</span>
                    </label>
                  </div>

                  {questionario.teveOcorrencia && (
                    <textarea
                      rows={2}
                      required
                      value={questionario.descricaoOcorrencia}
                      onChange={(e) => setQuestionario({ ...questionario, descricaoOcorrencia: e.target.value })}
                      placeholder="Descreva a ocorrência (ex: prato devolvido, troca de chopp, falta de troco)..."
                      className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-white resize-none"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalFechamento(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  Encerrar Caixa & Emitir Comprovante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {modalSangria && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Registrar Sangria (Retirada de Dinheiro)</h3>
            <p className="text-xs text-slate-400">
              Informe o valor que está sendo retirado da gaveta e a justificativa para o relatório.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Valor em R$:</label>
                <input
                  type="number"
                  value={valorSangria}
                  onChange={(e) => setValorSangria(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Motivo da Retirada:</label>
                <input
                  type="text"
                  value={motivoSangria}
                  onChange={(e) => setMotivoSangria(e.target.value)}
                  placeholder="Ex: Pagamento fornecedor hortifruti"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalSangria(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const num = parseFloat(valorSangria.replace(',', '.'));
                  if (!isNaN(num) && num > 0) {
                    registrarSangria(num, motivoSangria || 'Sangria de Caixa', operadorAtivo);
                    setSucessoEstorno(`Sangria de R$ ${num.toFixed(2)} registrada no caixa com sucesso!`);
                    setTimeout(() => setSucessoEstorno(null), 4000);
                    setModalSangria(false);
                    setValorSangria('');
                    setMotivoSangria('');
                  } else {
                    alert('Informe um valor válido maior que zero para a sangria.');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
              >
                Confirmar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suprimento (Reforço de Caixa) */}
      {modalSuprimento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Registrar Reforço / Suprimento (Entrada de Troco)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Informe o valor em dinheiro adicionado à gaveta para troco e sua justificativa.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Valor em R$:</label>
                <input
                  type="number"
                  value={valorSuprimento}
                  onChange={(e) => setValorSuprimento(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Motivo / Origem do Troco:</label>
                <input
                  type="text"
                  value={motivoSuprimento}
                  onChange={(e) => setMotivoSuprimento(e.target.value)}
                  placeholder="Ex: Troca de notas no cofre para abertura da noite"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalSuprimento(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const num = parseFloat(valorSuprimento.replace(',', '.'));
                  if (!isNaN(num) && num > 0) {
                    registrarSuprimento(num, motivoSuprimento || 'Reforço de Caixa', operadorAtivo);
                    setSucessoEstorno(`Reforço de R$ ${num.toFixed(2)} registrado com sucesso no caixa!`);
                    setTimeout(() => setSucessoEstorno(null), 4000);
                    setModalSuprimento(false);
                    setValorSuprimento('');
                    setMotivoSuprimento('');
                  } else {
                    alert('Informe um valor válido maior que zero para o suprimento.');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Confirmar Suprimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Limpeza do Histórico (Exclusivo Gerente / Admin) */}
      {modalConfirmarLimpeza && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Limpeza de Histórico de Vendas</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {ehAdminOuGerente
                        ? `Autorizado: ${usuarioLogado?.nome || 'Gestor'} (${
                            usuarioLogado?.cargo === 'super_admin' ? 'Super Admin' : 'Gerente'
                          })`
                        : 'Autorizado via PIN de Gerente / Administrador'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalConfirmarLimpeza(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta ferramenta permite limpar o histórico de vendas do turno para despoluir a visualização ou reiniciar o ciclo de atendimentos do caixa.
            </p>

            {/* Opções de Limpeza */}
            <div className="space-y-3">
              {/* Opção 1: Apenas Canceladas/Estornadas */}
              <div
                onClick={() => setModoLimpeza('apenas_canceladas')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  modoLimpeza === 'apenas_canceladas'
                    ? 'bg-orange-500/10 border-orange-500/50 shadow-md shadow-orange-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="opt-canceladas"
                    name="modoLimpeza"
                    checked={modoLimpeza === 'apenas_canceladas'}
                    onChange={() => setModoLimpeza('apenas_canceladas')}
                    className="mt-1 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="opt-canceladas" className="space-y-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Limpar Apenas Vendas Canceladas / Estornadas</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Remove apenas os registros de vendas canceladas ({vendas.filter((v) => v.status === 'cancelada').length} registro(s)). As vendas concluídas e o faturamento do caixa continuam intactos.
                    </p>
                  </label>
                </div>
              </div>

              {/* Opção 2: Todas as Vendas */}
              <div
                onClick={() => setModoLimpeza('todas')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  modoLimpeza === 'todas'
                    ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="opt-todas"
                    name="modoLimpeza"
                    checked={modoLimpeza === 'todas'}
                    onChange={() => setModoLimpeza('todas')}
                    className="mt-1 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="opt-todas" className="space-y-1.5 cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Limpar Todo o Histórico do Turno ({vendas.length})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Limpeza Geral
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Remove todas as {vendas.length} vendas listadas neste turno. Indicado ao iniciar um novo expediente ou após fechamento formal do caixa.
                    </p>

                    {modoLimpeza === 'todas' && (
                      <div className="pt-2">
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={zerarTotalCaixa}
                            onChange={(e) => setZerarTotalCaixa(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                          />
                          <span>Zerar também o total acumulado deste caixa (R$ {caixaAtual.totalVendas.toFixed(2)} → R$ 0,00)</span>
                        </label>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Aviso de Segurança */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Importante:</strong> Esta ação limpa a lista de visualização do turno. O consumo de ingredientes e o saldo dos produtos no estoque continuam devidamente contabilizados.
              </span>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmarLimpeza(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLimpeza}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Limpeza</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autenticação Administrativa para Operadores Caixa / Salão */}
      <AdminAuthModal
        isOpen={modalAuthLimpeza}
        onClose={() => setModalAuthLimpeza(false)}
        onSuccess={handleAuthLimpezaSucesso}
        actionTitle="Apenas o Gerente ou Administrador pode autorizar a limpeza do histórico de vendas."
      />
    </div>
  );
}
