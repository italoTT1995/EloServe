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
  Split,
  Layers,
  Check,
  UserCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { Mesa } from '../types';

export default function Mesas() {
  const { mesas, atualizarStatusMesa } = useAppStore();
  const { funcionarios } = useFuncionarioStore();
  const garconsDisponiveis = funcionarios.filter((f) => f.cargo === 'garcom' && f.ativo);

  const [setorSelecionado, setSetorSelecionado] = useState<string>('todos');

  // Modais
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [formAbertura, setFormAbertura] = useState({
    quantidadePessoas: 2,
    responsavelNome: '',
    garcomResponsavel: 'Lucas Oliveira',
  });

  const [mesaParaFechar, setMesaParaFechar] = useState<Mesa | null>(null);
  const [pessoasDivisao, setPessoasDivisao] = useState(2);
  const [mesaModalQR, setMesaModalQR] = useState<Mesa | null>(null);
  const [mesaParaUnir, setMesaParaUnir] = useState<Mesa | null>(null);
  const [mesaDestinoUniao, setMesaDestinoUniao] = useState<number>(2);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const setores = ['todos', 'Salão', 'Varanda', 'Deck'];

  const mesasFiltradas = mesas.filter(
    (m) => setorSelecionado === 'todos' || m.setor === setorSelecionado
  );

  const totalOcupadas = mesas.filter((m) => m.status === 'ocupada').length;
  const totalLivres = mesas.filter((m) => m.status === 'livre').length;
  const totalChamados = mesas.filter((m) => m.status === 'chamar_garcom').length;
  const taxaOcupacao = Math.round((totalOcupadas / mesas.length) * 100);

  function handleConfirmarAberturaMesa(e: React.FormEvent) {
    e.preventDefault();
    if (!mesaParaAbrir) return;

    atualizarStatusMesa(mesaParaAbrir.numero, 'ocupada');
    mesaParaAbrir.quantidadePessoas = Number(formAbertura.quantidadePessoas);
    mesaParaAbrir.responsavelNome = formAbertura.responsavelNome || 'Cliente Salão';
    mesaParaAbrir.garcomResponsavel = formAbertura.garcomResponsavel;
    mesaParaAbrir.tempoOcupadaMin = 1;
    mesaParaAbrir.totalConsumo = 0;

    dispararToast(`Mesa #${mesaParaAbrir.numero} aberta com sucesso para ${formAbertura.responsavelNome || 'Cliente'} (${formAbertura.quantidadePessoas} pessoas)!`);
    setMesaParaAbrir(null);
  }

  function handleConfirmarAtendimentoChamado(mesa: Mesa) {
    mesa.status = 'ocupada';
    mesa.tempoChamadaGarcomMin = 0;
    mesa.alertaCritico = false;
    mesa.solicitacaoTransferida = false;
    atualizarStatusMesa(mesa.numero, 'ocupada');
    dispararToast(`Chamado da Mesa #${mesa.numero} atendido com sucesso pelo garçom!`);
  }

  function handleSimularChamarGarcom(mesa: Mesa, minutosEspera = 9) {
    mesa.status = 'chamar_garcom';
    mesa.tempoChamadaGarcomMin = minutosEspera;
    if (minutosEspera >= 10) {
      mesa.solicitacaoTransferida = true;
      mesa.alertaCritico = true;
      dispararToast(`🚨 Alerta 10 min: Chamado da Mesa #${mesa.numero} transferido automaticamente para outro garçom disponível!`);
    } else if (minutosEspera >= 8) {
      mesa.alertaCritico = true;
      dispararToast(`⚠️ Alerta Crítico: Mesa #${mesa.numero} aguardando garçom há mais de 8 minutos!`);
    } else {
      dispararToast(`Mesa #${mesa.numero} chamou o garçom! Notificação enviada.`);
    }
    atualizarStatusMesa(mesa.numero, 'chamar_garcom');
  }

  function handleConfirmarUniaoMesas() {
    if (!mesaParaUnir) return;
    mesaParaUnir.mesasUnidas = [mesaDestinoUniao];
    dispararToast(`Mesas #${mesaParaUnir.numero} e #${mesaDestinoUniao} unidas com comanda compartilhada!`);
    setMesaParaUnir(null);
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner & KPIs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Mapa de Mesas & Atendimento no Salão</span>
            {totalChamados > 0 && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                {totalChamados} Chamados Pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de comandas únicas, QR Code nas mesas, tempo de resposta de garçons e divisão igualitária da conta.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Livres</p>
              <p className="text-xs font-bold text-white font-mono">{totalLivres}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupadas</p>
              <p className="text-xs font-bold text-white font-mono">{totalOcupadas}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupação</p>
              <p className="text-xs font-bold text-amber-400 font-mono">{taxaOcupacao}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filtro de Setores com scroll horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {setores.map((setor) => (
          <button
            key={setor}
            onClick={() => setSetorSelecionado(setor)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => {
          const isLivre = mesa.status === 'livre';
          const isChamar = mesa.status === 'chamar_garcom';
          const isAguardando = mesa.status === 'aguardando_pagamento';
          const isCritico = mesa.alertaCritico || (mesa.tempoChamadaGarcomMin && mesa.tempoChamadaGarcomMin >= 8);

          return (
            <div
              key={mesa.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isLivre
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : isCritico
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/40'
                  : isChamar
                  ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                  : isAguardando
                  ? 'bg-blue-950/20 border-blue-500/40 ring-2 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-md'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {mesa.setor} {mesa.mesasUnidas ? `(Unida com #${mesa.mesasUnidas.join(', ')})` : ''}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Mesa #{mesa.numero}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMesaModalQR(mesa)}
                      title="Abrir QR Code da Mesa"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isLivre
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isCritico
                          ? 'bg-rose-500 text-white font-black animate-pulse'
                          : isChamar
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                          : isAguardando
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isLivre
                        ? 'Livre'
                        : isCritico
                        ? 'Alerta Crítico (>8m)'
                        : isChamar
                        ? 'Chamar Garçom'
                        : isAguardando
                        ? 'Conta Pedida'
                        : 'Ocupada'}
                    </span>
                  </div>
                </div>

                {/* Informações da Mesa */}
                <div className="my-4">
                  {isLivre ? (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacidade para até {mesa.capacidade} pessoas</span>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Responsável e Garçom */}
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Responsável:</span>
                          <strong className="text-white">{mesa.responsavelNome || 'Pedro Santos'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Garçom da Mesa:</span>
                          <span className="text-purple-300 font-semibold">{mesa.garcomResponsavel || 'Lucas Oliveira'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ocupantes:</span>
                          <span className="text-slate-200 font-bold">{mesa.quantidadePessoas || 2} pessoas</span>
                        </div>
                      </div>

                      {/* Alerta de Tempo Chamar Garçom (Seções 4.16 - 4.22) */}
                      {isChamar && (
                        <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span className="flex items-center gap-1">
                              <Bell className="w-3.5 h-3.5 animate-bounce" />
                              <span>Cliente Chamou Garçom</span>
                            </span>
                            <span className="font-mono">{mesa.tempoChamadaGarcomMin || 3} min</span>
                          </div>

                          {mesa.solicitacaoTransferida && (
                            <p className="text-[10px] text-rose-300 font-bold">
                              🚨 Passou de 10 min: redistribuído para equipe de apoio!
                            </p>
                          )}

                          <button
                            onClick={() => handleConfirmarAtendimentoChamado(mesa)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Atendimento</span>
                          </button>
                        </div>
                      )}

                      {/* Permanência e Total */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Permanência:
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {mesa.tempoOcupadaMin || 30} min
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          Consumo Acumulado:
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          R$ {mesa.totalConsumo ? mesa.totalConsumo.toFixed(2) : '0,00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações da Mesa */}
              <div className="pt-3 border-t border-slate-800/70 space-y-1.5">
                {isLivre ? (
                  <button
                    onClick={() => {
                      setMesaParaAbrir(mesa);
                      setFormAbertura({
                        quantidadePessoas: mesa.capacidade,
                        responsavelNome: '',
                        garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir Mesa no Salão</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setMesaParaFechar(mesa);
                        setPessoasDivisao(mesa.quantidadePessoas || 2);
                      }}
                      className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>Dividir Conta</span>
                    </button>

                    <button
                      onClick={() => handleSimularChamarGarcom(mesa, 9)}
                      title="Simular cliente chamando garçom"
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chamado</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ABERTURA DE MESA PELO GARÇOM (SEÇÃO 4.17)               */}
      {/* ============================================================== */}
      {mesaParaAbrir && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Abrir Mesa #{mesaParaAbrir.numero}</span>
              </h3>
              <button onClick={() => setMesaParaAbrir(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAberturaMesa} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  São quantas pessoas? (Obrigatório) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formAbertura.quantidadePessoas}
                  onChange={(e) => setFormAbertura({ ...formAbertura, quantidadePessoas: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-center text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Nome do Responsável pela Comanda *
                </label>
                <input
                  type="text"
                  required
                  value={formAbertura.responsavelNome}
                  onChange={(e) => setFormAbertura({ ...formAbertura, responsavelNome: e.target.value })}
                  placeholder="Ex: Pedro Santos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Garçom Responsável pelo Atendimento
                </label>
                <select
                  value={formAbertura.garcomResponsavel}
                  onChange={(e) => setFormAbertura({ ...formAbertura, garcomResponsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                >
                  {garconsDisponiveis.map((g) => (
                    <option key={g.id} value={`${g.nome} ${g.sobrenome}`}>
                      {g.nome} {g.sobrenome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaAbrir(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DIVISÃO IGUALITÁRIA DA CONTA (SEÇÃO 4.14 - 4.15)        */}
      {/* ============================================================== */}
      {mesaParaFechar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Split className="w-5 h-5 text-purple-400" />
                <span>Fechamento & Divisão da Conta — Mesa #{mesaParaFechar.numero}</span>
              </h3>
              <button onClick={() => setMesaParaFechar(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Total da Conta */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Consumido:</span>
                  <p className="text-white font-bold text-xs">{mesaParaFechar.responsavelNome || 'Cliente'}</p>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  R$ {(mesaParaFechar.totalConsumo || 120).toFixed(2)}
                </span>
              </div>

              {/* Ajuste de Pessoas para Divisão Igualitária (Seção 4.14) */}
              <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Dividir a conta entre quantas pessoas?</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={pessoasDivisao}
                    onChange={(e) => setPessoasDivisao(parseInt(e.target.value) || 1)}
                    className="w-16 px-2.5 py-1 bg-slate-950 border border-purple-500/40 rounded-xl text-white font-mono font-bold text-center"
                  />
                </div>

                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="text-purple-300 font-bold">Valor por pessoa (Divisão Igualitária):</span>
                  <span className="text-base font-black text-white font-mono bg-purple-900/50 px-3 py-1 rounded-xl">
                    R$ {((mesaParaFechar.totalConsumo || 120) / Math.max(1, pessoasDivisao)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                💡 Conforme a regra de fechamento (Seção 4.15), a divisão é sempre igualitária pelo total da comanda única, evitando filas e cálculo item a item.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaFechar(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    atualizarStatusMesa(mesaParaFechar.numero, 'livre');
                    mesaParaFechar.totalConsumo = 0;
                    dispararToast(`Conta da Mesa #${mesaParaFechar.numero} quitada e mesa liberada!`);
                    setMesaParaFechar(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Confirmar Pagamento & Liberar Mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: QR CODE DA MESA COM SIMULADOR DO CLIENTE (SEÇÃO 4.12)  */}
      {/* ============================================================== */}
      {mesaModalQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">QR Code — Mesa #{mesaModalQR.numero}</h4>
              <button onClick={() => setMesaModalQR(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <div className="w-44 h-44 border-4 border-slate-900 grid grid-cols-5 grid-rows-5 gap-1 p-1">
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

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <span className="text-[10px] text-purple-300 font-bold uppercase block">
                Experiência do Consumidor (Seção 4.12):
              </span>
              <p className="text-slate-300 text-[11px]">
                1. Cliente escaneia na mesa sem digitar número.
              </p>
              <p className="text-slate-300 text-[11px]">
                2. Pergunta única obrigatória: <strong>"São quantas pessoas?"</strong>
              </p>
              <p className="text-slate-300 text-[11px]">
                3. Cardápio abre com comanda única e botão <strong>"Chamar Garçom"</strong>.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleSimularChamarGarcom(mesaModalQR, 3);
                  setMesaModalQR(null);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Simular Chamado</span>
              </button>
              <button
                onClick={() => {
                  dispararToast(`Display QR Code da Mesa #${mesaModalQR.numero} enviado para impressão térmica!`);
                  setMesaModalQR(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs cursor-pointer"
              >
                Imprimir Display
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
