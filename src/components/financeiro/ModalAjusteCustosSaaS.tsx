import React, { useState } from 'react';
import {
  Sliders,
  X,
  Server,
  Bot,
  CreditCard,
  Building2,
  Megaphone,
  CheckCircle2,
  Trash2,
  TrendingUp,
  DollarSign,
  Percent,
  Sparkles,
  Info,
} from 'lucide-react';
import { CustosInfraSaaS } from '../../store/useSaaSStore';

interface ModalAjusteCustosSaaSProps {
  custosAtuais: CustosInfraSaaS;
  mrrAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (novosCustos: CustosInfraSaaS) => void;
  isWhite: boolean;
}

export function ModalAjusteCustosSaaS({
  custosAtuais,
  mrrAtual,
  isOpen,
  onClose,
  onSalvar,
  isWhite,
}: ModalAjusteCustosSaaSProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState<CustosInfraSaaS>({ ...custosAtuais });

  // Recálculo do impacto em tempo real (Preview ao vivo)
  const receitaBruta = mrrAtual;
  const impostos = receitaBruta * (form.impostoSimplesPct / 100);
  const rol = Math.max(0, receitaBruta - impostos);
  const gateway = receitaBruta * (form.taxaGatewayPct / 100);
  const cogs = form.cloudVps + form.evolutionWhatsapp + gateway;
  const lucroBruto = Math.max(0, rol - cogs);
  const opex = form.suporteMarketing;
  const ebitda = lucroBruto - opex;
  const margemLiquidaPct = rol > 0 ? (ebitda / rol) * 100 : 0;
  const custosTotais = cogs + opex + impostos;

  function handleZerarCustosTeste() {
    setForm({
      ...form,
      cloudVps: 0,
      evolutionWhatsapp: 0,
      suporteMarketing: 0,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSalvar(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl border max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8 ${
          isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-purple-500/40 text-white'
        }`}
      >
        {/* Header do Modal */}
        <div className={`flex items-center justify-between border-b pb-4 ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>Ajustar Custos & Parâmetros do SaaS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                  Ao Vivo
                </span>
              </h3>
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Defina custos reais de infraestrutura para obter uma apuração de lucros 100% fidedigna.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isWhite ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card de Impacto em Tempo Real (Preview ao Vivo) */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner ${
            isWhite ? 'bg-purple-50/60 border-purple-200' : 'bg-purple-950/25 border-purple-500/30'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Impacto Projetado no DRE Mensal</span>
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black font-mono">
                R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-bold font-mono ${ebitda >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {margemLiquidaPct.toFixed(1)}% Margem
              </span>
            </div>
            <p className={`text-[11px] ${isWhite ? 'text-slate-600' : 'text-slate-400'}`}>
              Receita: R$ {receitaBruta.toFixed(2)} | Custos Totais: R$ {custosTotais.toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleZerarCustosTeste}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer border ${
              isWhite
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/30'
            }`}
            title="Limpa todos os custos fixos definindo-os como R$ 0,00"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Zerar Custos de Teste</span>
          </button>
        </div>

        {/* Formulário de Custos Detalhado */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Servidor Cloud VPS & Banco de Dados */}
            <div className="space-y-1.5">
              <label className="font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Servidor Cloud VPS & Banco (R$/mês)</span>
              </label>
              <input
                type="number"
                step="1.0"
                min="0"
                value={form.cloudVps}
                onChange={(e) => setForm({ ...form, cloudVps: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Hospedagem da aplicação, VPS e banco PostgreSQL/Supabase
              </span>
            </div>

            {/* 2. Servidor WhatsApp / Evolution API */}
            <div className="space-y-1.5">
              <label className="font-bold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Servidor WhatsApp / Baileys (R$/mês)</span>
              </label>
              <input
                type="number"
                step="1.0"
                min="0"
                value={form.evolutionWhatsapp}
                onChange={(e) => setForm({ ...form, evolutionWhatsapp: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Instâncias multi-tenant conectadas para disparos do EloBot
              </span>
            </div>

            {/* 3. Taxa Gateway de Pagamento (%) */}
            <div className="space-y-1.5">
              <label className="font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Taxa do Gateway de Pagamento (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={form.taxaGatewayPct}
                onChange={(e) => setForm({ ...form, taxaGatewayPct: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="2.9"
              />
              <span className={`text-[10px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Taxa média por cobrança processada (Asaas, Stripe ou Mercado Pago)
              </span>
            </div>

            {/* 4. Alíquota Imposto Simples Nacional (%) */}
            <div className="space-y-1.5">
              <label className="font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Alíquota Tributária Simples (%)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                value={form.impostoSimplesPct}
                onChange={(e) => setForm({ ...form, impostoSimplesPct: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="6.0"
              />
              <span className={`text-[10px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Simples Nacional (Anexo V - Licenciamento de Software padrão 6%)
              </span>
            </div>

            {/* 5. Despesas com Suporte & Marketing Digital / CAC */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-rose-400" />
                <span>Despesas de Suporte & Marketing Digital / CAC (R$/mês)</span>
              </label>
              <input
                type="number"
                step="10.0"
                min="0"
                value={form.suporteMarketing}
                onChange={(e) => setForm({ ...form, suporteMarketing: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Investimento mensal em tráfego pago (Google/Meta Ads) e softwares de CRM/atendimento
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                isWhite ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Custos Oficiais</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
