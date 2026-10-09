import { useState } from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  MessageSquare,
  Clock,
  Sparkles,
  Copy,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';

export default function MinhaAssinatura() {
  const { getTenantAtivo, planos, mudarPlanoTenant } = useSaaSStore();
  const tenant = getTenantAtivo();
  const planoAtual = planos.find((p) => p.id === tenant.planoId) || planos[1];

  const [copiado, setCopiado] = useState(false);
  const [modalPixAberto, setModalPixAberto] = useState(false);

  const chavePixSimulada = '00020126580014br.gov.bcb.pix0136financeiro@eloserve.com.br520400005303986540' + tenant.valorMensalidade.toFixed(2) + '5802BR5913ELOSERVE SAAS6009SAO PAULO62070503***6304';

  function copiarChavePix() {
    navigator.clipboard.writeText(chavePixSimulada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Top Banner de Status */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white">Minha Assinatura & Mensalidade</h2>
            {tenant.statusAssinatura === 'ativo' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                Plano Ativo
              </span>
            )}
            {tenant.statusAssinatura === 'trial' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-bold border border-amber-500/30 animate-pulse">
                Degustação Grátis ({tenant.diasRestantesTrial || 7} dias restantes)
              </span>
            )}
            {tenant.statusAssinatura === 'atrasado' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 font-bold border border-rose-500/30">
                Fatura Pendente
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Restaurante: <span className="text-white font-semibold">{tenant.nomeFantasia}</span> • CNPJ/CPF: {tenant.documento}
          </p>
        </div>

        <button
          onClick={() => setModalPixAberto(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Pagar Mensalidade com PIX</span>
        </button>
      </div>

      {/* Card da Fatura Atual */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Plano Contratado</span>
            <h3 className="text-xl font-black text-white mt-0.5">{planoAtual.nome}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{planoAtual.descricao}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Valor Mensal</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              R$ {tenant.valorMensalidade.toFixed(2)}
              <span className="text-xs text-slate-400 font-sans font-normal"> / mês</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Próxima renovação: <strong className="text-white">{tenant.proximoVencimento}</strong></p>
          </div>
        </div>

        {/* Recursos Inclusos no Plano Atual */}
        <div>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recursos inclusos no seu plano:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{planoAtual.limites.maxMesas > 100 ? 'Mesas Ilimitadas no Salão' : `Até ${planoAtual.limites.maxMesas} Mesas`}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{planoAtual.limites.maxCaixasSimultaneos > 10 ? 'PDVs & Caixas Ilimitados' : `Até ${planoAtual.limites.maxCaixasSimultaneos} Caixa(s) PDV`}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{planoAtual.limites.kdsIncluso ? 'Painel de Cozinha (KDS) Ativo' : 'KDS Cozinha Desabilitado'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{planoAtual.limites.whatsappIAIncluso ? 'EloBot WhatsApp IA 24h Incluso' : 'EloBot WhatsApp IA Opcional'}</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Relatórios Financeiros e DRE</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suporte e Atualizações Contínuas</span>
            </div>
          </div>
        </div>

        {/* Regras e Cláusulas Operacionais do Plano */}
        {planoAtual.regrasTexto && planoAtual.regrasTexto.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Regras & Termos de Uso Vigentes do Seu Plano:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {planoAtual.regrasTexto.map((regra, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{regra}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid de Comparativo & Upgrade de Planos */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-white">Compare os Planos de Assinatura EloServe</h3>
          <p className="text-xs text-slate-400">Faça upgrade a qualquer momento com ativação instantânea sem perder nenhum dado do restaurante.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planos.map((plano) => {
            const isAtual = plano.id === tenant.planoId;

            return (
              <div
                key={plano.id}
                className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                  isAtual
                    ? 'border-emerald-500 shadow-xl shadow-emerald-950/30 ring-2 ring-emerald-500/20'
                    : plano.destaque
                    ? 'border-slate-700 hover:border-emerald-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {plano.id.toUpperCase()}
                    </span>
                    {plano.destaque && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Mais Escolhido
                      </span>
                    )}
                    {isAtual && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                        Seu Plano
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-white">{plano.nome}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plano.descricao}</p>

                  <div className="my-4 pt-3 border-t border-slate-800">
                    <span className="text-2xl font-black text-white font-mono">
                      R$ {plano.precoMensal.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-sans"> / mês</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{plano.limites.maxMesas > 100 ? 'Mesas ilimitadas' : `Até ${plano.limites.maxMesas} mesas`}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{plano.limites.maxCaixasSimultaneos > 10 ? 'Caixas ilimitados' : `${plano.limites.maxCaixasSimultaneos} Caixa PDV`}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 ${plano.limites.kdsIncluso ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={plano.limites.kdsIncluso ? 'text-slate-200' : 'text-slate-500'}>Cozinha KDS em tempo real</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 ${plano.limites.whatsappIAIncluso ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={plano.limites.whatsappIAIncluso ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        EloBot WhatsApp IA 24h
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800">
                  {isAtual ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-default"
                    >
                      Plano em Uso
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        mudarPlanoTenant(tenant.id, plano.id);
                        alert(`Parabéns! Plano alterado com sucesso para ${plano.nome}.`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      Mudar para este Plano
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal PIX Copia e Cola / QR Code */}
      {modalPixAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <h3 className="text-base font-extrabold text-white">Pagamento da Mensalidade via PIX</h3>
            <p className="text-xs text-slate-400">
              Valor: <strong className="text-emerald-400 font-mono">R$ {tenant.valorMensalidade.toFixed(2)}</strong> (EloServe {planoAtual.nome})
            </p>

            {/* QR Code Mock */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
              <div className="w-36 h-36 border-4 border-slate-900 grid grid-cols-5 grid-rows-5 p-1 gap-1">
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
                <div></div>
                <div className="bg-slate-900"></div>
                <div className="bg-slate-900"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-semibold">Chave PIX Copia e Cola:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={chavePixSimulada.slice(0, 32) + '...'}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400"
                />
                <button
                  onClick={copiarChavePix}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalPixAberto(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
