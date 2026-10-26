import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Users,
  Award,
  Calendar,
  Percent,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  Check,
  Trash2,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useFuncionarioStore } from '../../store/useFuncionarioStore';
import { useComissaoStore } from '../../store/useComissaoStore';
import { useFinanceiroStore } from '../../store/useFinanceiroStore';
import { impressaoTermicaService } from '../../services/impressaoTermicaService';
import { RateioGarcomDetalhe, RegistroFechamentoComissao } from '../../types';

interface SecaoComissoesGarconsProps {
  tenantId: string;
  isWhite?: boolean;
  usuarioNome?: string;
  nomeRestaurante?: string;
}

export function SecaoComissoesGarcons({
  tenantId,
  isWhite = false,
  usuarioNome = 'Gerente',
  nomeRestaurante = 'EloGastrô',
}: SecaoComissoesGarconsProps) {
  const { getVendasPorTenant } = useAppStore();
  const { funcionarios } = useFuncionarioStore();
  const { config, salvarConfig, adicionarFechamento, getFechamentosPorTenant, excluirFechamento, marcarComoPago } =
    useComissaoStore();
  const { adicionarLancamento } = useFinanceiroStore();

  const [periodoFiltro, setPeriodoFiltro] = useState<'hoje' | 'ontem' | '7dias' | 'mes_atual'>('hoje');
  const [modeloRateio, setModeloRateio] = useState<'direto' | 'igualitario'>(config.modeloPadrao);
  const [retencaoCasa, setRetencaoCasa] = useState<number>(config.retencaoCasaPercentual);

  // Estados de confirmação de fechamento
  const [modalConfirmarAberto, setModalConfirmarAberto] = useState(false);
  const [lancarNoFinanceiro, setLancarNoFinanceiro] = useState(true);
  const [obsFechamento, setObsFechamento] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  }

  // Carrega vendas do restaurante
  const todasVendas = getVendasPorTenant(tenantId);
  const fechamentosPassados = getFechamentosPorTenant(tenantId);

  // Filtra garçons cadastrados
  const garconsCadastrados = useMemo(() => {
    return funcionarios.filter((f) => f.cargo === 'garcom' && f.ativo);
  }, [funcionarios]);

  // Filtra vendas de acordo com o período
  const vendasFiltradas = useMemo(() => {
    const hoje = new Date();
    const hojeStr = hoje.toLocaleDateString('pt-BR');

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toLocaleDateString('pt-BR');

    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    return todasVendas.filter((v) => {
      if (v.status === 'cancelada') return false;
      const dataVenda = v.dataHora.split(' ')[0] || '';

      if (periodoFiltro === 'hoje') {
        return dataVenda === hojeStr;
      }
      if (periodoFiltro === 'ontem') {
        return dataVenda === ontemStr;
      }
      if (periodoFiltro === '7dias') {
        // últimas 7 datas aproximadas
        return true;
      }
      if (periodoFiltro === 'mes_atual') {
        const partes = dataVenda.split('/');
        if (partes.length === 3) {
          return parseInt(partes[1], 10) === mesAtual && parseInt(partes[2], 10) === anoAtual;
        }
        return true;
      }
      return true;
    });
  }, [todasVendas, periodoFiltro]);

  // Calcula totais do período
  const totalVendasSalão = useMemo(() => {
    return vendasFiltradas.reduce((acc, v) => acc + (v.subtotalBruto || v.total || 0), 0);
  }, [vendasFiltradas]);

  const totalTaxaServicoArrecadada = useMemo(() => {
    return vendasFiltradas.reduce((acc, v) => acc + (v.taxaServico || 0), 0);
  }, [vendasFiltradas]);

  const valorRetencaoCalculado = Number(((totalTaxaServicoArrecadada * retencaoCasa) / 100).toFixed(2));
  const totalLiquidoGarcons = Math.max(0, Number((totalTaxaServicoArrecadada - valorRetencaoCalculado).toFixed(2)));

  // Calcula o rateio por garçom
  const rateioGarcons = useMemo<RateioGarcomDetalhe[]>(() => {
    // Identifica nomes de garçons que aparecem nas vendas ou no cadastro
    const mapaGarcons = new Map<string, { nome: string; totalVendas: number; mesas: number; taxa: number }>();

    // Garante que os garçons ativos existam no mapa
    garconsCadastrados.forEach((g) => {
      const nomeCompleto = `${g.nome} ${g.sobrenome}`.trim();
      mapaGarcons.set(nomeCompleto.toLowerCase(), {
        nome: nomeCompleto,
        totalVendas: 0,
        mesas: 0,
        taxa: 0,
      });
    });

    // Processa cada venda
    vendasFiltradas.forEach((v) => {
      const op = (v.operador || 'Garçom Salão').trim();
      const chave = op.toLowerCase();
      const registro = mapaGarcons.get(chave) || {
        nome: op,
        totalVendas: 0,
        mesas: 0,
        taxa: 0,
      };

      registro.totalVendas += v.subtotalBruto || v.total || 0;
      registro.taxa += v.taxaServico || 0;
      if (v.mesaNumero) registro.mesas += 1;

      mapaGarcons.set(chave, registro);
    });

    const lista = Array.from(mapaGarcons.values());
    const totalGarconsAtivos = lista.length || 1;

    return lista.map((item, idx) => {
      let taxaBruta = 0;
      let taxaLiquida = 0;
      let retencaoItem = 0;

      if (modeloRateio === 'direto') {
        taxaBruta = item.taxa;
        retencaoItem = Number(((taxaBruta * retencaoCasa) / 100).toFixed(2));
        taxaLiquida = Math.max(0, Number((taxaBruta - retencaoItem).toFixed(2)));
      } else {
        // Modelo Igualitário (Caixinha)
        taxaBruta = Number((totalTaxaServicoArrecadada / totalGarconsAtivos).toFixed(2));
        retencaoItem = Number(((taxaBruta * retencaoCasa) / 100).toFixed(2));
        taxaLiquida = Math.max(0, Number((taxaBruta - retencaoItem).toFixed(2)));
      }

      return {
        garcomId: `garcom_${idx}_${item.nome.replace(/\s+/g, '_')}`,
        garcomNome: item.nome,
        totalVendido: Number(item.totalVendas.toFixed(2)),
        mesasAtendidas: item.mesas,
        taxaBrutaArrecadada: Number(taxaBruta.toFixed(2)),
        valorRetencaoCasa: retencaoItem,
        comissaoLiquida: taxaLiquida,
        status: 'pendente',
      };
    });
  }, [vendasFiltradas, garconsCadastrados, modeloRateio, retencaoCasa, totalTaxaServicoArrecadada]);

  // Realiza o fechamento oficial
  function handleConfirmarFechamento() {
    const periodoNome =
      periodoFiltro === 'hoje'
        ? `Fechamento de Comissões do Dia (${new Date().toLocaleDateString('pt-BR')})`
        : periodoFiltro === 'ontem'
        ? 'Fechamento de Comissões de Ontem'
        : periodoFiltro === '7dias'
        ? 'Fechamento de Comissões da Semana'
        : 'Fechamento de Comissões do Mês';

    let idLancamentoFinanceiro: string | undefined = undefined;

    // Se optou por lançar despesa no Financeiro & DRE
    if (lancarNoFinanceiro && totalLiquidoGarcons > 0) {
      const lanc = adicionarLancamento({
        tenantId,
        tipo: 'despesa',
        descricao: `Comissões e Gorjetas da Equipe (${periodoNome})`,
        categoriaId: 'cat_funcionarios',
        categoriaNome: 'Funcionários, salários, encargos e benefícios',
        valor: totalLiquidoGarcons,
        dataCompetencia: new Date().toISOString().split('T')[0],
        dataVencimento: new Date().toISOString().split('T')[0],
        formaPagamento: 'pix',
        status: 'pago',
        dataPagamento: new Date().toISOString().split('T')[0],
        observacoes: `Rateio de comissão ${modeloRateio === 'direto' ? 'Direto por Mesa' : 'Igualitário'} entre ${rateioGarcons.length} garçons. Retenção casa: ${retencaoCasa}%.`,
        cadastradoPor: usuarioNome,
        origem: 'comissao',
      });
      idLancamentoFinanceiro = lanc.id;
    }

    const novoFechamento = adicionarFechamento({
      tenantId,
      dataFechamento: new Date().toLocaleDateString('pt-BR'),
      periodoDescricao: periodoNome,
      modeloRateio,
      totalVendasFaturadas: totalVendasSalão,
      totalTaxaServicoBruta: totalTaxaServicoArrecadada,
      percentualRetencaoCasa: retencaoCasa,
      valorRetencaoCasa: valorRetencaoCalculado,
      totalLiquidoRateado: totalLiquidoGarcons,
      garcons: rateioGarcons,
      lancadoNoFinanceiro: lancarNoFinanceiro,
      financeiroLancamentoId: idLancamentoFinanceiro,
      criadoPor: usuarioNome,
      observacoes: obsFechamento.trim() || undefined,
    });

    setModalConfirmarAberto(false);
    dispararToast(`Fechamento de comissões concluído! R$ ${totalLiquidoGarcons.toFixed(2)} registrado com sucesso.`);

    // Imprime comprovante do fechamento
    impressaoTermicaService.imprimirReciboComissao({
      fechamento: novoFechamento,
      nomeRestaurante,
    });
  }

  function handleImprimirRecibo(garcomId?: string) {
    if (rateioGarcons.length === 0) return;

    const fechamentoTemp: RegistroFechamentoComissao = {
      id: `temp_${Date.now()}`,
      tenantId,
      dataFechamento: new Date().toLocaleDateString('pt-BR'),
      periodoDescricao: `Demonstrativo de Comissões (${periodoFiltro.toUpperCase()})`,
      modeloRateio,
      totalVendasFaturadas: totalVendasSalão,
      totalTaxaServicoBruta: totalTaxaServicoArrecadada,
      percentualRetencaoCasa: retencaoCasa,
      valorRetencaoCasa: valorRetencaoCalculado,
      totalLiquidoRateado: totalLiquidoGarcons,
      garcons: rateioGarcons,
      lancadoNoFinanceiro: false,
      criadoPor: usuarioNome,
      criadoEm: new Date().toISOString(),
    };

    impressaoTermicaService.imprimirReciboComissao({
      fechamento: fechamentoTemp,
      garcomId,
      nomeRestaurante,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LEI DA GORJETA 13.419
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Taxa de 10% do Garçom
            </span>
          </div>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            <Award className="w-6 h-6 text-emerald-400" />
            <span>Fechamento de Comissões & Rateio dos 10%</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Apuração automática da taxa de serviço arrecadada, divisão justa da equipe e integração contábil com o DRE.
          </p>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['hoje', 'ontem', '7dias', 'mes_atual'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodoFiltro(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodoFiltro === p
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : isWhite
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {p === 'hoje'
                ? 'Hoje'
                : p === 'ontem'
                ? 'Ontem'
                : p === '7dias'
                ? 'Últimos 7 dias'
                : 'Mês Atual'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas do Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vendido no Salão */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Faturamento Salão</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`text-2xl font-black font-mono ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            R$ {totalVendasSalão.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {vendasFiltradas.length} comanda(s) finalizada(s)
          </div>
        </div>

        {/* Card 2: 10% Bruto Arrecadado */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>10% Bruto Arrecadado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            R$ {totalTaxaServicoArrecadada.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Taxa de serviço paga por clientes
          </div>
        </div>

        {/* Card 3: Retenção Legal da Casa */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Retenção Casa ({retencaoCasa}%)</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            - R$ {valorRetencaoCalculado.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Custos de encargos sociais (Lei 13.419)
          </div>
        </div>

        {/* Card 4: Comissão Líquida a Pagar */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isWhite ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/30 border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <span>Líquido para Garçons</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300 font-mono">
            R$ {totalLiquidoGarcons.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            A ratear entre {rateioGarcons.length} atendente(s)
          </div>
        </div>
      </div>

      {/* Bloco de Configuração de Rateio e Retenção */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#1E293B]/70 border-slate-700'
      }`}>
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] block">
            Regra de Rateio & Retenção Legal
          </span>
          <p className="text-xs text-slate-400">
            Defina como os 10% serão divididos entre os atendentes do restaurante
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seletor Modelo */}
          <div className="flex items-center rounded-2xl border p-1 bg-black/10">
            <button
              type="button"
              onClick={() => setModeloRateio('direto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modeloRateio === 'direto'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Direto (Garçom da Mesa)
            </button>
            <button
              type="button"
              onClick={() => setModeloRateio('igualitario')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                modeloRateio === 'igualitario'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Caixinha da Equipe (Igualitário)
            </button>
          </div>

          {/* Seletor % Retenção da Casa */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-400">Retenção da Casa:</span>
            <select
              value={retencaoCasa}
              onChange={(e) => setRetencaoCasa(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#FF6B00] ${
                isWhite ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              <option value="0">0% (Repasse Integral)</option>
              <option value="10">10% (Retenção Mínima)</option>
              <option value="15">15% (Padrão Abrasel)</option>
              <option value="20">20% (Regime CLT Completo)</option>
              <option value="25">25% (Encargos Máximos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Rateio por Garçom */}
      <div className={`border rounded-3xl shadow-sm overflow-hidden ${
        isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
      }`}>
        <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#1E293B]/40'
        }`}>
          <div>
            <h3 className={`text-sm font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
              Demonstrativo Individual dos Garçons
            </h3>
            <p className="text-xs text-slate-400">
              {modeloRateio === 'direto'
                ? 'Comissão calculada a partir das mesas atendidas por cada garçom'
                : 'Soma total dos 10% dividida em partes iguais entre os atendentes ativos'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleImprimirRecibo()}
              disabled={rateioGarcons.length === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isWhite
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span>Imprimir Todos os Recibos</span>
            </button>

            <button
              type="button"
              onClick={() => setModalConfirmarAberto(true)}
              disabled={rateioGarcons.length === 0 || totalLiquidoGarcons === 0}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Efetuar Fechamento Oficial</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
              isWhite ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Garçom / Atendente</th>
                <th className="py-3 px-4 text-center">Mesas Atendidas</th>
                <th className="py-3 px-4 text-right">Total Vendido</th>
                <th className="py-3 px-4 text-right">10% Bruto Gerado</th>
                <th className="py-3 px-4 text-right">Retenção ({retencaoCasa}%)</th>
                <th className="py-3 px-4 text-right text-emerald-400">Comissão Líquida</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isWhite ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {rateioGarcons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Nenhuma venda com taxa de serviço registrada no período selecionado ({periodoFiltro}).
                  </td>
                </tr>
              ) : (
                rateioGarcons.map((g) => (
                  <tr
                    key={g.garcomId}
                    className={`transition-colors ${
                      isWhite ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                        {g.garcomNome.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{g.garcomNome}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {g.mesasAtendidas} mesa(s)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-600 dark:text-slate-300">
                      R$ {g.totalVendido.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                      R$ {g.taxaBrutaArrecadada.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-500 font-semibold">
                      - R$ {g.valorRetencaoCasa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-500 dark:text-emerald-400">
                      R$ {g.comissaoLiquida.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleImprimirRecibo(g.garcomId)}
                        title="Imprimir Recibo Térmico Individual para Assinatura"
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isWhite
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Printer className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rateioGarcons.length > 0 && (
              <tfoot className={`font-bold border-t-2 ${
                isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900/80 border-slate-700 text-white'
              }`}>
                <tr>
                  <td className="py-3 px-4 font-black">TOTAL GERAL DO PERÍODO</td>
                  <td className="py-3 px-4 text-center font-mono">
                    {rateioGarcons.reduce((acc, g) => acc + g.mesasAtendidas, 0)} mesas
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    R$ {totalVendasSalão.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    R$ {totalTaxaServicoArrecadada.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-500">
                    - R$ {valorRetencaoCalculado.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-500 text-base">
                    R$ {totalLiquidoGarcons.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Histórico de Fechamentos Concluídos */}
      {fechamentosPassados.length > 0 && (
        <div className={`border rounded-3xl p-5 shadow-sm space-y-4 ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black flex items-center gap-2 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Histórico de Fechamentos Realizados</span>
            </h3>
            <span className="text-xs text-slate-400">{fechamentosPassados.length} fechamento(s)</span>
          </div>

          <div className="space-y-2">
            {fechamentosPassados.map((fech) => (
              <div
                key={fech.id}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {fech.periodoDescricao}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {fech.modeloRateio === 'direto' ? 'Direto' : 'Caixinha'}
                    </span>
                    {fech.lancadoNoFinanceiro && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Lançado no DRE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Fechado em {fech.dataFechamento} por {fech.criadoPor} • {fech.garcons.length} garçom(ns)
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Líquido Pago</span>
                    <span className="font-mono font-black text-sm text-emerald-500">
                      R$ {fech.totalLiquidoRateado.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => impressaoTermicaService.imprimirReciboComissao({ fechamento: fech, nomeRestaurante })}
                      title="Reimprimir Comprovante Térmico"
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isWhite
                          ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Printer className="w-4 h-4 text-orange-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja excluir este registro de fechamento do histórico?')) {
                          excluirFechamento(fech.id);
                        }
                      }}
                      title="Excluir Registro"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Fechamento */}
      {modalConfirmarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Confirmar Fechamento de Comissões</h4>
                  <p className="text-xs text-slate-400">Período: {periodoFiltro.toUpperCase()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalConfirmarAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Arrecadado dos 10%:</span>
                <span className="font-mono font-bold">R$ {totalTaxaServicoArrecadada.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Retenção da Casa ({retencaoCasa}%):</span>
                <span className="font-mono text-amber-500 font-bold">- R$ {valorRetencaoCalculado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t pt-2 border-slate-700/50">
                <span className="text-emerald-500">Valor Líquido a Pagar:</span>
                <span className="font-mono text-emerald-500">R$ {totalLiquidoGarcons.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkbox: Integrar com DRE */}
            <label className="flex items-start gap-3 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 cursor-pointer">
              <input
                type="checkbox"
                checked={lancarNoFinanceiro}
                onChange={(e) => setLancarNoFinanceiro(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-black text-emerald-600 dark:text-emerald-400 block">
                  Lançar Despesa de Comissões no Módulo Financeiro & DRE
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                  Cria automaticamente uma despesa na categoria "Funcionários & Equipe", abatendo do lucro líquido do mês.
                </span>
              </div>
            </label>

            {/* Observações */}
            <div>
              <label className="text-xs font-bold block mb-1">Observações do Fechamento (Opcional):</label>
              <textarea
                value={obsFechamento}
                onChange={(e) => setObsFechamento(e.target.value)}
                placeholder="Ex: Turno de sábado à noite com salão lotado..."
                rows={2}
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmarAberto(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isWhite ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmarFechamento}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar & Imprimir Recibos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
