import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Percent,
  Sliders,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Users,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TenantRestaurante } from '../../types';
import { CustosInfraSaaS } from '../../store/useSaaSStore';

export type PeriodoDREExecutivo = 'mensal' | 'trimestral' | 'anual';
export type VisualizacaoDREExecutivo = 'demonstrativo' | 'comparativo';

interface DREExecutivoSectionProps {
  tenants: TenantRestaurante[];
  mrr: number;
  custosInfra: CustosInfraSaaS;
  onEditarCustos: () => void;
  isWhite: boolean;
}

export function DREExecutivoSection({
  tenants,
  mrr,
  custosInfra,
  onEditarCustos,
  isWhite,
}: DREExecutivoSectionProps) {
  const [periodo, setPeriodo] = useState<PeriodoDREExecutivo>('mensal');
  const [visualizacao, setVisualizacao] = useState<VisualizacaoDREExecutivo>('demonstrativo');

  // Multiplicador de período
  const fator = periodo === 'anual' ? 12 : periodo === 'trimestral' ? 3 : 1;

  // Estatísticas Reais da Base de Assinantes
  const totalLojas = tenants.length;
  const assinantesAtivos = tenants.filter((t) => t.statusAssinatura === 'ativo').length;
  const assinantesTrial = tenants.filter((t) => t.statusAssinatura === 'trial').length;
  const assinantesAtrasados = tenants.filter((t) => t.statusAssinatura === 'atrasado').length;
  const ticketMedioReal = assinantesAtivos > 0 ? mrr / assinantesAtivos : 0;

  // Função pura de cálculo do DRE Corporativo do SaaS
  function calcularDRESaaS(fatorMultiplicador: number) {
    const receitaAssinaturas = mrr * fatorMultiplicador;
    const receitaSetup = (totalLojas > 0 ? 150 : 0) * (fatorMultiplicador === 12 ? 3 : 1);
    const receitaBruta = receitaAssinaturas + receitaSetup;

    const deducoesImpostos = receitaBruta * (custosInfra.impostoSimplesPct / 100);
    const receitaLiquida = Math.max(0, receitaBruta - deducoesImpostos);

    const custoCloud = custosInfra.cloudVps * fatorMultiplicador;
    const custoWhatsapp = custosInfra.evolutionWhatsapp * fatorMultiplicador;
    const custoGateway = receitaBruta * (custosInfra.taxaGatewayPct / 100);
    const cogsTecnologia = custoCloud + custoWhatsapp + custoGateway;

    const lucroBruto = Math.max(0, receitaLiquida - cogsTecnologia);
    const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    const despesasOpex = custosInfra.suporteMarketing * fatorMultiplicador;
    const lucroLiquidoEbitda = lucroBruto - despesasOpex;
    const margemLiquidaPct = receitaLiquida > 0 ? (lucroLiquidoEbitda / receitaLiquida) * 100 : 0;
    const custosTotais = cogsTecnologia + despesasOpex;

    return {
      receitaBruta,
      receitaAssinaturas,
      receitaSetup,
      deducoesImpostos,
      receitaLiquida,
      custoCloud,
      custoWhatsapp,
      custoGateway,
      cogsTecnologia,
      lucroBruto,
      margemBrutaPct,
      despesasOpex,
      custosTotais,
      lucroLiquidoEbitda,
      margemLiquidaPct,
    };
  }

  // Dados do período ativo
  const dadosAtivos = useMemo(() => calcularDRESaaS(fator), [mrr, fator, custosInfra, totalLojas]);

  // Comparativo de múltiplos períodos (Mês Vigente, Mês Anterior Est., Trimestre, Anual ARR)
  const comparativo = useMemo(() => {
    return [
      { titulo: 'Mês Vigente', fator: 1, ...calcularDRESaaS(1) },
      { titulo: 'Trimestre', fator: 3, ...calcularDRESaaS(3) },
      { titulo: 'Anual (ARR)', fator: 12, ...calcularDRESaaS(12) },
    ];
  }, [mrr, custosInfra, totalLojas]);

  // Exportar DRE Executivo para CSV
  function exportarCSV() {
    const linhas = [
      ['DRE Executivo Corporativo - Plataforma EloServe SaaS'],
      ['Padrão:', 'SaaS B2B Contábil e Gerencial'],
      ['Período:', periodo === 'anual' ? 'Anual (12 Meses - ARR)' : periodo === 'trimestral' ? 'Trimestral (3 Meses)' : 'Mensal Vigente'],
      ['MRR Atual:', `R$ ${mrr.toFixed(2)}`],
      ['Lojas Ativas:', assinantesAtivos.toString()],
      ['Emissão:', `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
      [''],
      ['Linha Contábil', 'Valor (R$)', '% ROL'],
      ['1. (+) RECEITA OPERACIONAL BRUTA DO SAAS', dadosAtivos.receitaBruta.toFixed(2), '-'],
      ['   ↳ Mensalidades Recorrentes de Software (MRR)', dadosAtivos.receitaAssinaturas.toFixed(2), '-'],
      ['   ↳ Taxas de Setup e Configuração Inicial', dadosAtivos.receitaSetup.toFixed(2), '-'],
      ['2. (-) DEDUÇÕES TRIBUTÁRIAS (Simples Nacional 6%)', (-dadosAtivos.deducoesImpostos).toFixed(2), `-${custosInfra.impostoSimplesPct.toFixed(1)}%`],
      ['3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)', dadosAtivos.receitaLiquida.toFixed(2), '100.0%'],
      ['4. (-) CUSTOS DOS SERVIÇOS PRESTADOS (COGS CLOUD)', (-dadosAtivos.cogsTecnologia).toFixed(2), `-${((dadosAtivos.cogsTecnologia / (dadosAtivos.receitaLiquida || 1)) * 100).toFixed(1)}%`],
      ['   ↳ Servidores Cloud VPS & Banco de Dados', (-dadosAtivos.custoCloud).toFixed(2), '-'],
      ['   ↳ Instâncias WhatsApp / Evolution API', (-dadosAtivos.custoWhatsapp).toFixed(2), '-'],
      ['   ↳ Taxas de Gateway de Pagamento', (-dadosAtivos.custoGateway).toFixed(2), '-'],
      ['5. (=) LUCRO BRUTO DO SAAS', dadosAtivos.lucroBruto.toFixed(2), `${dadosAtivos.margemBrutaPct.toFixed(1)}%`],
      ['6. (-) DESPESAS OPERACIONAIS GERAIS (OPEX)', (-dadosAtivos.despesasOpex).toFixed(2), `-${((dadosAtivos.despesasOpex / (dadosAtivos.receitaLiquida || 1)) * 100).toFixed(1)}%`],
      ['   ↳ Tráfego Pago, Suporte & Marketing', (-dadosAtivos.despesasOpex).toFixed(2), '-'],
      ['7. (=) RESULTADO OPERACIONAL LÍQUIDO / EBITDA', dadosAtivos.lucroLiquidoEbitda.toFixed(2), `${dadosAtivos.margemLiquidaPct.toFixed(1)}%`],
    ];

    const conteudoCSV = '\uFEFF' + linhas.map((l) => l.join(';')).join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dre_executivo_eloserve_${periodo}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER DA ABA DRE EXECUTIVO: SIMPLIFICADO & MODERNO */}
      <div
        className={`p-6 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl transition-colors ${
          isWhite
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30 text-white'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Inteligência Contábil Franqueador</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30 uppercase tracking-wider">
              SaaS B2B • Nível 1
            </span>
          </div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>DRE Executivo da Plataforma EloServe</span>
          </h3>
          <p className={`text-xs max-w-3xl ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
            Demonstração consolidada do resultado operacional da sua empresa fornecedora de software: receitas de assinaturas (MRR), custos reais de servidores/WhatsApp e margem líquida EBITDA.
          </p>
        </div>

        {/* CONTROLES RÁPIDOS: PERÍODO, VISUALIZAÇÃO E AÇÕES */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onEditarCustos}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
            }`}
            title="Configurar custos reais da sua VPS, WhatsApp e impostos"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Ajustar Custos</span>
          </button>

          {/* Toggle: Demonstrativo vs Comparativo */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <button
              type="button"
              onClick={() => setVisualizacao('demonstrativo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                visualizacao === 'demonstrativo'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isWhite
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demonstrativo
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('comparativo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                visualizacao === 'comparativo'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isWhite
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comparativo
            </button>
          </div>

          {/* Seletor de Período (Mensal, Trimestral, Anual) */}
          {visualizacao === 'demonstrativo' && (
            <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setPeriodo('mensal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  periodo === 'mensal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isWhite
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mês Atual
              </button>
              <button
                type="button"
                onClick={() => setPeriodo('trimestral')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  periodo === 'trimestral'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isWhite
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trimestre
              </button>
              <button
                type="button"
                onClick={() => setPeriodo('anual')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  periodo === 'anual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isWhite
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Anual (ARR)
              </button>
            </div>
          )}

          {/* Botões Exportar CSV e Imprimir */}
          <button
            type="button"
            onClick={exportarCSV}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Exportar DRE em CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Imprimir Relatório"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 CARDS KPIS EXECUTIVOS SIMPLIFICADOS (IDÊNTICOS AO PADRÃO DO FINANCEIRO & DRE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Receita Operacional Líquida */}
        <div
          className={`p-5 rounded-3xl border space-y-2 transition-all shadow-sm ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Receita Líquida (ROL)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono">
            R$ {dadosAtivos.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-purple-400 font-semibold block">
            Após Simples Nacional ({custosInfra.impostoSimplesPct}%)
          </span>
        </div>

        {/* 2. Margem Bruta do Software */}
        <div
          className={`p-5 rounded-3xl border space-y-2 transition-all shadow-sm ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Margem Bruta SaaS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-500 font-mono">
            {dadosAtivos.margemBrutaPct.toFixed(1)}%
          </p>
          <span className="text-[10px] text-emerald-500/80 font-semibold block">
            Lucro Bruto: R$ {dadosAtivos.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* 3. Custos de Infraestrutura & OPEX */}
        <div
          className={`p-5 rounded-3xl border space-y-2 transition-all shadow-sm ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Custos Totais (COGS + OPEX)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500 font-mono">
            R$ {dadosAtivos.custosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-500/80 font-semibold block">
            Cloud, WhatsApp, Gateway e Suporte
          </span>
        </div>

        {/* 4. Lucro Líquido / EBITDA */}
        <div
          className={`p-5 rounded-3xl border space-y-2 transition-all shadow-sm ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Lucro Líquido / EBITDA
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              dadosAtivos.lucroLiquidoEbitda >= 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono ${
            dadosAtivos.lucroLiquidoEbitda >= 0 ? 'text-blue-500' : 'text-rose-400'
          }`}>
            R$ {dadosAtivos.lucroLiquidoEbitda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className={`text-[10px] font-semibold block ${
            dadosAtivos.lucroLiquidoEbitda >= 0 ? 'text-blue-500/80' : 'text-rose-400/80'
          }`}>
            Margem Líquida Real: {dadosAtivos.margemLiquidaPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* PAINEL DINÂMICO DE CARTEIRA E SAÚDE DO SAAS */}
      <div
        className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>Saúde da Carteira de Clientes</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                {totalLojas} estabelecimentos
              </span>
            </h4>
            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Métricas reais vinculadas aos planos contratados dos restaurantes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isWhite ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Adimplentes: <strong>{assinantesAtivos}</strong></span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isWhite ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Em Trial: <strong>{assinantesTrial}</strong></span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isWhite ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Tolerância/Atraso: <strong>{assinantesAtrasados}</strong></span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            isWhite ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
          }`}>
            <span>Ticket Médio: <strong className="font-mono">R$ {ticketMedioReal.toFixed(2)}/mês</strong></span>
          </div>
        </div>
      </div>

      {/* VISUALIZAÇÃO 1: DEMONSTRATIVO CONTÁBIL OFICIAL */}
      {visualizacao === 'demonstrativo' && (
        <div
          className={`rounded-3xl border overflow-hidden shadow-xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'
          }`}>
            <div>
              <h4 className="text-sm font-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Demonstração do Resultado do Exercício — DRE Gerencial ({periodo === 'anual' ? 'Anual / ARR' : periodo === 'trimestral' ? 'Trimestral' : 'Mês Vigente'})</span>
              </h4>
              <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Estrutura oficial de resultado operacional para empresas de tecnologia SaaS
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[11px] block ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>Tributação:</span>
              <span className="text-xs font-bold text-purple-400 font-mono">Simples Nacional ({custosInfra.impostoSimplesPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isWhite ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-800 bg-slate-950/80 text-slate-400'
                }`}>
                  <th className="py-3 px-4">Conta Contábil / Descrição</th>
                  <th className="py-3 px-4">Natureza da Operação</th>
                  <th className="py-3 px-4 text-right">Valor ({periodo === 'anual' ? 'R$/ano' : 'R$/período'})</th>
                  <th className="py-3 px-4 text-right">Análise Vertical (AV%)</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isWhite ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {/* 1. Receita Operacional Bruta */}
                <tr className={isWhite ? 'bg-purple-50 text-purple-900 font-bold' : 'bg-purple-950/20 text-purple-200 font-bold'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-emerald-500 font-black">(+)</span>
                    <span>1. RECEITA OPERACIONAL BRUTA DO SAAS</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">Mensalidades + Taxas de Onboarding</td>
                  <td className="py-3 px-4 text-right text-emerald-500 font-mono text-sm">
                    R$ {dadosAtivos.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.receitaBruta / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 100}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-500">1.1. Mensalidades Recorrentes de Software (MRR)</td>
                  <td className="py-2.5 px-4 text-slate-400">Assinaturas de restaurantes ativos</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    R$ {dadosAtivos.receitaAssinaturas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.receitaAssinaturas / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-500">1.2. Taxas de Implantação & Setup Inicial</td>
                  <td className="py-2.5 px-4 text-slate-400">Configuração de cardápio e hardware</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    R$ {dadosAtivos.receitaSetup.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.receitaSetup / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* 2. Deduções da Receita */}
                <tr className={isWhite ? 'bg-slate-50 text-slate-700 font-semibold' : 'bg-slate-950/40 text-slate-300 font-semibold'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-rose-500 font-black">(-)</span>
                    <span>2. DEDUÇÕES DA RECEITA BRUTA & TRIBUTOS</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Impostos federais e municipais</td>
                  <td className="py-3 px-4 text-right text-rose-500 font-mono">
                    - R$ {dadosAtivos.deducoesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{custosInfra.impostoSimplesPct.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-400">2.1. Simples Nacional (Anexo V - Licenciamento de Software)</td>
                  <td className="py-2.5 px-4 text-slate-400">Alíquota configurada: {custosInfra.impostoSimplesPct}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-500">
                    - R$ {dadosAtivos.deducoesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">-{custosInfra.impostoSimplesPct.toFixed(1)}%</td>
                </tr>

                {/* 3. Receita Operacional Líquida */}
                <tr className={isWhite ? 'bg-purple-100 text-purple-900 font-black' : 'bg-purple-950/40 text-purple-200 font-black'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-purple-500 font-black">(=)</span>
                    <span>3. RECEITA OPERACIONAL LÍQUIDA (ROL)</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">Base de apuração 100%</td>
                  <td className="py-3 px-4 text-right font-mono text-sm">
                    R$ {dadosAtivos.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-purple-500">100.0%</td>
                </tr>

                {/* 4. Custos dos Serviços Prestados (COGS) */}
                <tr className={isWhite ? 'bg-slate-50 text-slate-700 font-semibold' : 'bg-slate-950/40 text-slate-300 font-semibold'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-amber-500 font-black">(-)</span>
                    <span>4. CUSTOS DOS SERVIÇOS PRESTADOS (COGS - INFRAESTRUTURA)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Tecnologia, Servidores e APIs</td>
                  <td className="py-3 px-4 text-right text-amber-500 font-mono">
                    - R$ {dadosAtivos.cogsTecnologia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.cogsTecnologia / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-400">4.1. Servidores Cloud VPS & Banco de Dados (AWS/Supabase)</td>
                  <td className="py-2.5 px-4 text-slate-400">Hospedagem e alta disponibilidade</td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    - R$ {dadosAtivos.custoCloud.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.custoCloud / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-400">4.2. Servidor WhatsApp Multi-Tenant (Evolution API / Baileys)</td>
                  <td className="py-2.5 px-4 text-slate-400">Instâncias dedicadas para cada restaurante</td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    - R$ {dadosAtivos.custoWhatsapp.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.custoWhatsapp / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 pl-8 text-slate-400">4.3. Taxas de Gateway de Pagamento ({custosInfra.taxaGatewayPct}%)</td>
                  <td className="py-2.5 px-4 text-slate-400">Processamento de PIX e faturas automáticas</td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    - R$ {dadosAtivos.custoGateway.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {custosInfra.taxaGatewayPct.toFixed(1)}%
                  </td>
                </tr>

                {/* 5. Lucro Bruto */}
                <tr className={isWhite ? 'bg-emerald-50 text-emerald-900 font-black' : 'bg-emerald-950/30 text-emerald-200 font-black'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-emerald-500 font-black">(=)</span>
                    <span>5. LUCRO BRUTO DO SAAS (MARGEM: {dadosAtivos.margemBrutaPct.toFixed(1)}%)</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-500 font-semibold">Rentabilidade primária do software</td>
                  <td className="py-3 px-4 text-right text-emerald-500 font-mono text-sm">
                    R$ {dadosAtivos.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-500 font-bold">
                    {dadosAtivos.margemBrutaPct.toFixed(1)}%
                  </td>
                </tr>

                {/* 6. Despesas Operacionais (OPEX) */}
                <tr className={isWhite ? 'bg-slate-50 text-slate-700 font-semibold' : 'bg-slate-950/40 text-slate-300 font-semibold'}>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="text-rose-500 font-black">(-)</span>
                    <span>6. DESPESAS OPERACIONAIS GERAIS (OPEX)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Suporte ao cliente, helpdesk e tráfego pago</td>
                  <td className="py-3 px-4 text-right text-rose-500 font-mono">
                    - R$ {dadosAtivos.despesasOpex.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    -{dadosAtivos.receitaLiquida > 0 ? ((dadosAtivos.despesasOpex / dadosAtivos.receitaLiquida) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* 7. EBITDA / Lucro Líquido Final */}
                <tr className={isWhite ? 'bg-emerald-100 text-emerald-950 font-black text-sm border-t-2 border-emerald-500' : 'bg-gradient-to-r from-emerald-950/60 to-purple-950/60 text-white font-black text-sm border-t-2 border-emerald-500'}>
                  <td className="py-4 px-4 flex items-center gap-2">
                    <span className="text-emerald-500 font-black text-base">(=)</span>
                    <span className="tracking-wide">7. RESULTADO OPERACIONAL LÍQUIDO / EBITDA (LUCRO FINAL)</span>
                  </td>
                  <td className="py-4 px-4 text-emerald-500 font-semibold text-xs">Sobra operacional da empresa SaaS</td>
                  <td className="py-4 px-4 text-right text-emerald-500 font-mono text-base font-black">
                    R$ {dadosAtivos.lucroLiquidoEbitda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-500 font-black text-sm">
                    {dadosAtivos.margemLiquidaPct.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO 2: COMPARATIVO DIRETO DE PERÍODOS (MÊS VIGENTE VS TRIMESTRE VS ANUAL) */}
      {visualizacao === 'comparativo' && (
        <div
          className={`rounded-3xl border overflow-hidden shadow-xl ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`p-5 border-b ${isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
            <h4 className="text-sm font-black flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Comparativo de Desempenho Operacional por Período</span>
            </h4>
            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Visualize a evolução das receitas recorrentes e a sustentabilidade das margens operacionais
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isWhite ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-800 bg-slate-950/80 text-slate-400'
                }`}>
                  <th className="py-3 px-4">Indicador Financeiro</th>
                  {comparativo.map((col, idx) => (
                    <th key={idx} className="py-3 px-4 text-right">
                      {col.titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isWhite ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                <tr>
                  <td className="py-3 px-4 font-bold text-emerald-500">1. (+) Receita Bruta Total</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono font-bold text-emerald-500">
                      R$ {c.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-rose-500">2. (-) Deduções & Impostos Simples</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono text-rose-500">
                      - R$ {c.deducoesImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isWhite ? 'bg-purple-50 font-bold' : 'bg-purple-950/20 font-bold'}>
                  <td className="py-3 px-4 text-purple-400">3. (=) Receita Líquida (ROL)</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono font-bold">
                      R$ {c.receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-amber-500">4. (-) Custos Cloud & Servidores (COGS)</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono text-amber-500">
                      - R$ {c.cogsTecnologia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isWhite ? 'bg-emerald-50 font-bold' : 'bg-emerald-950/20 font-bold'}>
                  <td className="py-3 px-4 text-emerald-500">5. (=) Lucro Bruto</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono text-emerald-500 font-bold">
                      R$ {c.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4">Margem Bruta (%)</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono font-bold text-emerald-500">
                      {c.margemBrutaPct.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-rose-500">6. (-) Despesas Operacionais (OPEX)</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3 px-4 text-right font-mono text-rose-500">
                      - R$ {c.despesasOpex.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isWhite ? 'bg-blue-50 font-black border-t-2 border-blue-500' : 'bg-blue-950/30 font-black border-t-2 border-blue-500'}>
                  <td className="py-3.5 px-4 text-blue-500 text-sm">7. (=) Lucro Líquido / EBITDA</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-3.5 px-4 text-right font-mono text-blue-500 font-black text-sm">
                      R$ {c.lucroLiquidoEbitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className={isWhite ? 'bg-blue-50/50' : 'bg-blue-950/15'}>
                  <td className="py-2.5 px-4 font-bold">Margem Líquida Real (%)</td>
                  {comparativo.map((c, i) => (
                    <td key={i} className="py-2.5 px-4 text-right font-mono font-bold text-blue-500">
                      {c.margemLiquidaPct.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPLIANCE DE GOVERNANÇA E LINK RÁPIDO PARA FINANCEIRO DAS LOJAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box de Governança EloServe */}
        <div
          className={`md:col-span-2 p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
            isWhite ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-emerald-400">Regra de Governança & Isolamento Multi-Tenancy</h5>
            <p className="text-[11px] leading-relaxed">
              O <strong>DRE Executivo Corporativo</strong> contabiliza exclusivamente os recebimentos de mensalidades e custos operacionais da empresa dona do software EloServe. O faturamento e pedidos dos restaurantes pertencem aos próprios estabelecimentos e estão isolados no Nível 2.
            </p>
          </div>
        </div>

        {/* Atalho para o Financeiro & DRE das Lojas */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-sm ${
            isWhite ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-white'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nível 2 • Lojas</span>
            </span>
            <h5 className="text-xs font-bold">Central Financeira & DRE das Lojas</h5>
            <p className={`text-[11px] ${isWhite ? 'text-emerald-800' : 'text-slate-300'}`}>
              Consulte despesas de compras, CMV de alimentos, livro caixa e DRE individual de cada restaurante.
            </p>
          </div>
          <Link
            to="/financeiro"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <span>Acessar Financeiro das Lojas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
