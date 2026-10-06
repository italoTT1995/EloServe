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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Caixa() {
  const { caixaAtual, fecharCaixa, abrirCaixa } = useAppStore();
  const [modalSangria, setModalSangria] = useState(false);
  const [valorSangria, setValorSangria] = useState('');
  const [motivoSangria, setMotivoSangria] = useState('');

  const isAberto = caixaAtual.status === 'aberto';

  return (
    <div className="space-y-6 max-w-5xl select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Controle de Caixa & Turno</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isAberto
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isAberto ? 'Caixa Aberto' : 'Caixa Fechado'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operador responsável: <span className="text-white font-semibold">{caixaAtual.operador}</span> • Abertura às {caixaAtual.abertoEm}
          </p>
        </div>

        <div className="flex gap-2">
          {isAberto ? (
            <>
              <button
                onClick={() => setModalSangria(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Sangria (Retirada)</span>
              </button>
              <button
                onClick={fecharCaixa}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500 hover:text-white text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Fechamento Cego</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => abrirCaixa(150.0)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Novo Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Fundo de Troco Inicial</p>
          <p className="text-xl font-black text-white font-mono">
            R$ {caixaAtual.saldoInicial.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Suprimento de Abertura</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Vendas Realizadas Hoje</p>
          <p className="text-xl font-black text-emerald-400 font-mono">
            R$ {caixaAtual.totalVendas.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18 pedidos liquidados</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Total de Sangrias</p>
          <p className="text-xl font-black text-rose-400 font-mono">
            R$ {caixaAtual.totalSangrias.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold">Retiradas do caixa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <p className="text-xs text-slate-400 font-medium">Saldo em Caixa Esperado</p>
          <p className="text-xl font-black text-amber-400 font-mono">
            R$ {(caixaAtual.saldoInicial + caixaAtual.totalVendas - caixaAtual.totalSangrias).toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Dinheiro + Eletrônico</span>
        </div>
      </div>

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
