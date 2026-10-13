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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { ContagemDinheiroFisico, QuestionarioFechamentoCaixa } from '../types';

export default function Caixa() {
  const { caixaAtual, fecharCaixa, abrirCaixa } = useAppStore();
  const { itens, processarAberturaDiaConsumoPrevisto, ajustarSobraDiaAnterior } = useEstoqueStore();

  const isAberto = caixaAtual.status === 'aberto';

  // Modais
  const [modalAbertura, setModalAbertura] = useState(false);
  const [modalFechamento, setModalFechamento] = useState(false);
  const [modalSangria, setModalSangria] = useState(false);
  const [comprovanteAbertura, setComprovanteAbertura] = useState<{ troco: number; horario: string; operador: string } | null>(null);
  const [comprovanteFechamento, setComprovanteFechamento] = useState<QuestionarioFechamentoCaixa | null>(null);

  // Estados de Sangria
  const [valorSangria, setValorSangria] = useState('');
  const [motivoSangria, setMotivoSangria] = useState('');

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
  const valorEsperadoDinheiro = caixaAtual.saldoInicial + (caixaAtual.totalVendas * 0.35) - caixaAtual.totalSangrias;
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
                  alert(`Sangria de R$ ${valorSangria} registrada com sucesso!`);
                  setModalSangria(false);
                  setValorSangria('');
                  setMotivoSangria('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
              >
                Confirmar Sangria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
