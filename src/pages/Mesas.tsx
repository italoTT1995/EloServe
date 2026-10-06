import { useState } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  QrCode,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bell,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Mesa } from '../types';

export default function Mesas() {
  const { mesas, atualizarStatusMesa } = useAppStore();
  const [setorSelecionado, setSetorSelecionado] = useState<string>('todos');
  const [mesaModalQR, setMesaModalQR] = useState<Mesa | null>(null);

  const setores = ['todos', 'Salão', 'Varanda', 'Deck'];

  const mesasFiltradas = mesas.filter(
    (m) => setorSelecionado === 'todos' || m.setor === setorSelecionado
  );

  const totalOcupadas = mesas.filter((m) => m.status === 'ocupada').length;
  const totalLivres = mesas.filter((m) => m.status === 'livre').length;
  const taxaOcupacao = Math.round((totalOcupadas / mesas.length) * 100);

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & KPIs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-lg font-extrabold text-white">Mapa de Mesas & Salão</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o consumo, tempo de permanência e chamadas de garçom em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Livres</p>
              <p className="text-xs font-bold text-white font-mono">{totalLivres}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupadas</p>
              <p className="text-xs font-bold text-white font-mono">{totalOcupadas}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupação</p>
              <p className="text-xs font-bold text-amber-400 font-mono">{taxaOcupacao}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro de Setores */}
      <div className="flex items-center gap-2">
        {setores.map((setor) => (
          <button
            key={setor}
            onClick={() => setSetorSelecionado(setor)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              setorSelecionado === setor
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {setor === 'todos' ? 'Todos os Setores' : setor}
          </button>
        ))}
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => {
          const isLivre = mesa.status === 'livre';
          const isChamar = mesa.status === 'chamar_garcom';
          const isAguardando = mesa.status === 'aguardando_pagamento';

          return (
            <div
              key={mesa.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isLivre
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : isChamar
                  ? 'bg-amber-950/20 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-950/30'
                  : isAguardando
                  ? 'bg-blue-950/20 border-blue-500/40 ring-2 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-md'
              }`}
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {mesa.setor}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    Mesa #{mesa.numero}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMesaModalQR(mesa)}
                    title="Ver QR Code da Mesa"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isLivre
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isChamar
                        ? 'bg-amber-500 text-slate-950 font-extrabold animate-pulse'
                        : isAguardando
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isLivre
                      ? 'Livre'
                      : isChamar
                      ? 'Chamar Garçom'
                      : isAguardando
                      ? 'Conta Pedida'
                      : 'Ocupada'}
                  </span>
                </div>
              </div>

              {/* Informações de consumo / tempo */}
              <div className="my-5">
                {isLivre ? (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Capacidade para até {mesa.capacidade} pessoas</span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Permanência:
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {mesa.tempoOcupadaMin} min
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        Total Parcial:
                      </span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">
                        R$ {mesa.totalConsumo?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações da Mesa */}
              <div className="pt-3 border-t border-slate-800/70 flex gap-2">
                {isLivre ? (
                  <button
                    onClick={() => atualizarStatusMesa(mesa.numero, 'ocupada')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir Mesa</span>
                  </button>
                ) : (
                  <button
                    onClick={() => atualizarStatusMesa(mesa.numero, 'livre')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                  >
                    Fechar / Liberar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal QR Code da Mesa */}
      {mesaModalQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">QR Code — Mesa #{mesaModalQR.numero}</h4>
              <button
                onClick={() => setMesaModalQR(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <div className="w-48 h-48 border-4 border-slate-900 grid grid-cols-5 grid-rows-5 gap-1 p-1">
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
                <div></div>
                <div className="bg-slate-950"></div>
                <div className="bg-slate-950"></div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              O cliente escaneia com a câmera do celular para abrir o cardápio digital e fazer pedidos na Mesa #{mesaModalQR.numero}.
            </p>

            <button
              onClick={() => alert(`Imprimindo etiqueta QR Code para a Mesa #${mesaModalQR.numero}`)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all"
            >
              Imprimir Display da Mesa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
