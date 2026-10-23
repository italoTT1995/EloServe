import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Calendar,
  Layers,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Building2,
  FileCheck,
  Percent,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LancamentoFinanceiro,
  CategoriaFinanceira,
  VendaRealizada,
  NotaFiscalRegistro,
  DespesaOperacionalRestaurante,
} from '../../types';

export type RegimeContabil = 'competencia' | 'caixa';
export type VisualizacaoDRE = 'demonstrativo' | 'comparativo_meses';

interface DRESectionProps {
  lancamentos: LancamentoFinanceiro[];
  vendas: VendaRealizada[];
  notasFiscais: NotaFiscalRegistro[];
  despesasLegado: DespesaOperacionalRestaurante[];
  categorias: CategoriaFinanceira[];
  nomeRestaurante: string;
  documentoRestaurante?: string;
  isWhite: boolean;
  periodoFiltro: string;
}

export function DRESection({
  lancamentos,
  vendas,
  notasFiscais,
  despesasLegado,
  categorias,
  nomeRestaurante,
  documentoRestaurante,
  isWhite,
  periodoFiltro,
}: DRESectionProps) {
  const [regime, setRegime] = useState<RegimeContabil>('competencia');
  const [visualizacao, setVisualizacao] = useState<VisualizacaoDRE>('demonstrativo');

  // Controle de linhas expansíveis
  const [expandido, setExpandido] = useState<Record<string, boolean>>({
    receita: true,
    deducoes: true,
    cmv: true,
    pessoal: true,
    operacionais: true,
    financeiro: true,
  });

  function toggleExpansao(chave: string) {
    setExpandido((prev) => ({ ...prev, [chave]: !prev[chave] }));
  }

  // Helper de cálculo de DRE para um intervalo de tempo
  function calcularDREParaPeriodo(filtroMes?: { ano: number; mes: number }) {
    // 1. Filtra Vendas do PDV
    const vendasValidas = vendas.filter((v) => {
      if (v.status === 'cancelada') return false;
      const dt = v.dataHora || '';
      if (!dt) return false;

      let ano = 0, mes = 0;
      if (dt.includes('/')) {
        const p = dt.split(' ')[0].split('/');
        ano = parseInt(p[2]);
        mes = parseInt(p[1]) - 1;
      } else {
        const d = new Date(dt.split('T')[0] + 'T00:00:00');
        ano = d.getFullYear();
        mes = d.getMonth();
      }

      if (filtroMes) {
        return ano === filtroMes.ano && mes === filtroMes.mes;
      }
      return true;
    });

    let vendasSalao = 0;
    let vendasBalcao = 0;
    let vendasDelivery = 0;
    let taxaServicoGarcom = 0;
    let couvertArtistico = 0;
    let totalTaxasCartao = 0;
    let totalDescontos = 0;
    let totalCancelamentos = 0;

    vendasValidas.forEach((v) => {
      const valorBruto = v.subtotalBruto || (v.total + (v.desconto || 0));

      if (v.tipoOrigem === 'mesa' || v.mesaNumero) {
        vendasSalao += valorBruto;
      } else if (v.tipoOrigem === 'delivery') {
        vendasDelivery += valorBruto;
      } else {
        vendasBalcao += valorBruto;
      }

      if (v.taxaServico) taxaServicoGarcom += v.taxaServico;
      if (v.couvertArtistico) couvertArtistico += v.couvertArtistico;
      if (v.desconto) totalDescontos += v.desconto;

      // Estimativa das taxas de cartão
      if (v.formaPagamento === 'credito') {
        totalTaxasCartao += valorBruto * 0.035;
      } else if (v.formaPagamento === 'debito') {
        totalTaxasCartao += valorBruto * 0.019;
      }
    });

    // 2. Filtra Lançamentos Financeiros (SEM contar duas vezes o PDV)
    const lancamentosValidos = lancamentos.filter((l) => {
      if (l.status === 'cancelado') return false;
      if (l.origem === 'pdv') return false; // PDV já está contabilizado em vendasValidas acima!

      // Se for regime de caixa, considera apenas o que foi pago ou recebido
      if (regime === 'caixa' && l.status !== 'pago' && l.status !== 'recebido') {
        return false;
      }

      const dt = regime === 'caixa' && l.dataPagamento ? l.dataPagamento : (l.dataCompetencia || l.criadoEm);
      if (!dt) return false;

      let ano = 0, mes = 0;
      if (dt.includes('/')) {
        const p = dt.split(' ')[0].split('/');
        ano = parseInt(p[2]);
        mes = parseInt(p[1]) - 1;
      } else {
        const d = new Date(dt.split('T')[0] + 'T00:00:00');
        ano = d.getFullYear();
        mes = d.getMonth();
      }

      if (filtroMes) {
        return ano === filtroMes.ano && mes === filtroMes.mes;
      }
      return true;
    });

    // Mapeamento por Linha DRE dos lançamentos financeiros
    let receitasAdicionais = 0;
    let deducoesExtras = 0;
    let comprasCMV = 0;
    let despesasPessoal = 0;
    let despesasOcupacao = 0;
    let despesasComerciais = 0;
    let despesasServicos = 0;
    let resultadoFinanceiro = 0;
    let outrasDespesas = 0;

    lancamentosValidos.forEach((l) => {
      const cat = categorias.find((c) => c.id === l.categoriaId);
      const linhaDRE = cat?.linhaDRE || 'outros';

      if (l.tipo === 'receita') {
        if (linhaDRE === 'resultado_financeiro') {
          resultadoFinanceiro += l.valor; // Juros ativos
        } else {
          receitasAdicionais += l.valor;
        }
      } else {
        // Despesas
        switch (linhaDRE) {
          case 'cmv':
            comprasCMV += l.valor;
            break;
          case 'pessoal':
            despesasPessoal += l.valor;
            break;
          case 'ocupacao':
            despesasOcupacao += l.valor;
            break;
          case 'comercial':
            despesasComerciais += l.valor;
            break;
          case 'servicos':
            despesasServicos += l.valor;
            break;
          case 'deducoes':
            deducoesExtras += l.valor; // Ex: Impostos / DAS
            break;
          case 'resultado_financeiro':
            resultadoFinanceiro -= l.valor; // Taxas bancárias / adquirência
            break;
          default:
            outrasDespesas += l.valor;
            break;
        }
      }
    });

    // 3. Notas Fiscais de Entrada (SE não estiverem já lançadas como lançamento financeiro)
    const nfsValidas = notasFiscais.filter((nf) => {
      if (nf.status === 'cancelada') return false;
      const jaExisteLancamento = lancamentos.some((l) => l.origemId === nf.id || (l.observacoes && l.observacoes.includes(nf.numero)));
      if (jaExisteLancamento) return false; // Evita duplicação estrita!

      const dt = nf.dataEmissao || nf.criadoEm || '';
      if (!dt) return false;
      const d = new Date(dt.split('T')[0] + 'T00:00:00');
      if (filtroMes) {
        return d.getFullYear() === filtroMes.ano && d.getMonth() === filtroMes.mes;
      }
      return true;
    });

    let comprasInsumosNF = 0;
    let impostosFiscaisNF = 0;

    nfsValidas.forEach((nf) => {
      if (nf.direcao === 'entrada') {
        if (nf.linhaDRE === 'cmv') {
          comprasInsumosNF += nf.valorTotalProdutos || nf.valorTotalNota;
        } else if (nf.linhaDRE === 'ocupacao') {
          despesasOcupacao += nf.valorTotalNota;
        } else if (nf.linhaDRE === 'comercial_embalagens') {
          despesasComerciais += nf.valorTotalNota;
        } else if (nf.linhaDRE === 'servicos') {
          despesasServicos += nf.valorTotalNota;
        } else {
          outrasDespesas += nf.valorTotalNota;
        }
      }
      if (nf.valorIcms) impostosFiscaisNF += nf.valorIcms;
    });

    // 4. Totais e Cálculos Oficiais do DRE
    const receitaBrutaTotal =
      vendasSalao + vendasBalcao + vendasDelivery + taxaServicoGarcom + couvertArtistico + receitasAdicionais;

    const totalDeducoes = totalTaxasCartao + totalDescontos + totalCancelamentos + deducoesExtras + impostosFiscaisNF;

    const receitaLiquida = Math.max(0, receitaBrutaTotal - totalDeducoes);

    const cmvFinal = comprasCMV + comprasInsumosNF;

    const lucroBruto = receitaLiquida - cmvFinal;

    const totalDespesasOperacionais =
      despesasPessoal + despesasOcupacao + despesasComerciais + despesasServicos + outrasDespesas;

    const resultadoOperacional = lucroBruto - totalDespesasOperacionais;

    const lucroLiquidoFinal = resultadoOperacional + resultadoFinanceiro;

    // Percentuais sobre a ROL
    const rol = receitaLiquida > 0 ? receitaLiquida : 1;
    const margemBrutaPct = (lucroBruto / rol) * 100;
    const cmvPct = (cmvFinal / rol) * 100;
    const despesasOperacionaisPct = (totalDespesasOperacionais / rol) * 100;
    const margemLiquidaPct = (lucroLiquidoFinal / rol) * 100;

    const temDadosCompletos = cmvFinal > 0 && despesasPessoal > 0 && despesasOcupacao > 0;

    return {
      receitaBrutaTotal,
      vendasSalao,
      vendasBalcao,
      vendasDelivery,
      taxaServicoGarcom,
      couvertArtistico,
      receitasAdicionais,
      totalDeducoes,
      totalTaxasCartao,
      totalDescontos,
      totalCancelamentos,
      deducoesExtras,
      impostosFiscaisNF,
      receitaLiquida,
      cmvFinal,
      comprasCMV,
      comprasInsumosNF,
      lucroBruto,
      margemBrutaPct,
      cmvPct,
      despesasPessoal,
      despesasOcupacao,
      despesasComerciais,
      despesasServicos,
      outrasDespesas,
      totalDespesasOperacionais,
      despesasOperacionaisPct,
      resultadoOperacional,
      resultadoFinanceiro,
      lucroLiquidoFinal,
      margemLiquidaPct,
      temDadosCompletos,
    };
  }

  // DRE do período principal ativo
  const dadosDRE = useMemo(() => calcularDREParaPeriodo(), [lancamentos, vendas, notasFiscais, regime]);

  // Comparativo de Meses (Mês Atual vs Mês Anterior vs 2 Meses Atrás)
  const comparativoMeses = useMemo(() => {
    const agora = new Date();
    const meses = [];

    for (let i = 2; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const ano = d.getFullYear();
      const mes = d.getMonth();
      const nomeMes = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const dre = calcularDREParaPeriodo({ ano, mes });
      meses.push({ nomeMes, ano, mes, ...dre });
    }

    return meses;
  }, [lancamentos, vendas, notasFiscais, regime]);

  // Exportar para CSV
  function exportarCSV() {
    const linhas = [
      ['Demonstrativo do Resultado do Exercício (DRE) - EloServe PDV'],
      ['Padrão Contábil:', 'Abrasel / Regime de Competência'],
      ['Regime Selecionado:', regime === 'competencia' ? 'Regime de Competência' : 'Regime de Caixa'],
      ['Estabelecimento:', nomeRestaurante],
      ['CNPJ:', documentoRestaurante || 'Não informado'],
      ['Emissão:', new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')],
      [''],
      ['Linha Contábil DRE', 'Valor (R$)', '% ROL'],
      ['1. (+) RECEITA OPERACIONAL BRUTA DE VENDAS', dadosDRE.receitaBrutaTotal.toFixed(2), '-'],
      ['   ↳ Salão (Mesas & Comandas)', dadosDRE.vendasSalao.toFixed(2), ((dadosDRE.vendasSalao / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Balcão (Takeaway / PDV)', dadosDRE.vendasBalcao.toFixed(2), ((dadosDRE.vendasBalcao / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Delivery (Entregas Online)', dadosDRE.vendasDelivery.toFixed(2), ((dadosDRE.vendasDelivery / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Taxa de Serviço 10% (Garçom)', dadosDRE.taxaServicoGarcom.toFixed(2), ((dadosDRE.taxaServicoGarcom / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Couvert Artístico', dadosDRE.couvertArtistico.toFixed(2), ((dadosDRE.couvertArtistico / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Receitas Adicionais', dadosDRE.receitasAdicionais.toFixed(2), ((dadosDRE.receitasAdicionais / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['2. (-) DEDUÇÕES DA RECEITA BRUTA', (-dadosDRE.totalDeducoes).toFixed(2), ((dadosDRE.totalDeducoes / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['   ↳ Taxas de Cartão & Adquirência', (-dadosDRE.totalTaxasCartao).toFixed(2), '-'],
      ['   ↳ Descontos Concedidos', (-dadosDRE.totalDescontos).toFixed(2), '-'],
      ['   ↳ Cancelamentos / Estornos', (-dadosDRE.totalCancelamentos).toFixed(2), '-'],
      ['   ↳ Tributos e Impostos', (-(dadosDRE.deducoesExtras + dadosDRE.impostosFiscaisNF)).toFixed(2), '-'],
      ['3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)', dadosDRE.receitaLiquida.toFixed(2), '100.0%'],
      ['4. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)', (-dadosDRE.cmvFinal).toFixed(2), dadosDRE.cmvPct.toFixed(1) + '%'],
      ['   ↳ Insumos e Alimentos (Financeiro)', (-dadosDRE.comprasCMV).toFixed(2), '-'],
      ['   ↳ Notas Fiscais de Entrada (SEFAZ)', (-dadosDRE.comprasInsumosNF).toFixed(2), '-'],
      ['5. (=) LUCRO BRUTO / MARGEM DE CONTRIBUIÇÃO', dadosDRE.lucroBruto.toFixed(2), dadosDRE.margemBrutaPct.toFixed(1) + '%'],
      ['6. (-) DESPESAS COM PESSOAL & EQUIPE', (-dadosDRE.despesasPessoal).toFixed(2), ((dadosDRE.despesasPessoal / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1) + '%'],
      ['7. (-) DESPESAS OPERACIONAIS E ADMINISTRATIVAS', (-(dadosDRE.totalDespesasOperacionais - dadosDRE.despesasPessoal)).toFixed(2), '-'],
      ['   ↳ Ocupação & Utilidades (Luz, Água, Aluguel)', (-dadosDRE.despesasOcupacao).toFixed(2), '-'],
      ['   ↳ Comercial, Marketing & Embalagens', (-dadosDRE.despesasComerciais).toFixed(2), '-'],
      ['   ↳ Serviços, TI & Manutenção', (-dadosDRE.despesasServicos).toFixed(2), '-'],
      ['   ↳ Outras Despesas Gerais', (-dadosDRE.outrasDespesas).toFixed(2), '-'],
      ['8. (=) RESULTADO OPERACIONAL (EBITDA)', dadosDRE.resultadoOperacional.toFixed(2), '-'],
      ['9. (+/-) RESULTADO FINANCEIRO', dadosDRE.resultadoFinanceiro.toFixed(2), '-'],
      ['10. (=) LUCRO / PREJUÍZO LÍQUIDO FINAL', dadosDRE.lucroLiquidoFinal.toFixed(2), dadosDRE.margemLiquidaPct.toFixed(1) + '%'],
    ];

    const conteudoCSV = '\uFEFF' + linhas.map((l) => l.join(';')).join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dre_eloserve_${regime}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Header do DRE com Alternador de Regime e Exportações */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Padrão Contábil Abrasel
            </span>
            {dadosDRE.temDadosCompletos ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Base Contábil Completa
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Resultado Parcial / Estimativa
              </span>
            )}
          </div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#FF6B00]" />
            <span>Demonstrativo do Resultado do Exercício (DRE)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrado automaticamente com vendas do PDV, despesas do livro caixa e compras em notas fiscais sem duplicidade.
          </p>
        </div>

        {/* Toggles: Regime (Competência vs Caixa) e Visualização (Demonstrativo vs Comparativo) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Regime de Competência vs Caixa */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setRegime('competencia')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                regime === 'competencia'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regime de Competência (DRE)
            </button>
            <button
              type="button"
              onClick={() => setRegime('caixa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                regime === 'caixa'
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regime de Caixa (Fluxo)
            </button>
          </div>

          {/* Tipo de Visualização */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setVisualizacao('demonstrativo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                visualizacao === 'demonstrativo'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linhas Oficiais
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('comparativo_meses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                visualizacao === 'comparativo_meses'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comparativo Mensal
            </button>
          </div>

          {/* Exportar & Imprimir */}
          <button
            type="button"
            onClick={exportarCSV}
            title="Baixar Planilha DRE em CSV / Excel"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            title="Imprimir Demonstrativo DRE"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Explicação do Regime */}
      <div
        className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
          regime === 'competencia'
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        }`}
      >
        <Info className="w-4 h-4 shrink-0" />
        <span>
          {regime === 'competencia'
            ? '📌 Regime de Competência: As receitas e despesas são reconhecidas na data de realização do fato gerador, permitindo avaliar a real lucratividade da operação.'
            : '💵 Regime de Caixa (Fluxo Financeiro): As movimentações refletem apenas o dinheiro que efetivamente entrou e saiu da conta/gaveta (lançamentos pagos e recebidos).'}
        </span>
      </div>

      {/* VISUALIZAÇÃO 1: DEMONSTRATIVO DAS 10 LINHAS */}
      {visualizacao === 'demonstrativo' ? (
        <div
          className={`rounded-2xl border overflow-hidden ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          {/* Tabela de 10 Linhas Contábeis */}
          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {/* LINHA 1: RECEITA OPERACIONAL BRUTA */}
            <div className="p-4 bg-emerald-500/10 border-l-4 border-l-emerald-500">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpansao('receita')}
              >
                <div className="flex items-center gap-2">
                  {expandido.receita ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-black text-sm text-emerald-400 font-sans">
                    1. (+) RECEITA OPERACIONAL BRUTA DE VENDAS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">
                    Salão + Balcão + Delivery
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    R$ {dadosDRE.receitaBrutaTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {expandido.receita && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>↳ Salão (Mesas & Comandas Presenciais)</span>
                    <span className="font-bold">R$ {dadosDRE.vendasSalao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Balcão (Takeaway & Vendas Rápidas PDV)</span>
                    <span className="font-bold">R$ {dadosDRE.vendasBalcao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Delivery (Entregas Online & WhatsApp)</span>
                    <span className="font-bold">R$ {dadosDRE.vendasDelivery.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Taxa de Serviço 10% (Garçom)</span>
                    <span className="font-bold">R$ {dadosDRE.taxaServicoGarcom.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Couvert Artístico</span>
                    <span className="font-bold">R$ {dadosDRE.couvertArtistico.toFixed(2)}</span>
                  </div>
                  {dadosDRE.receitasAdicionais > 0 && (
                    <div className="flex justify-between text-emerald-300">
                      <span>↳ Receitas Adicionais / Outros Ganhos</span>
                      <span className="font-bold">R$ {dadosDRE.receitasAdicionais.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LINHA 2: DEDUÇÕES DA RECEITA BRUTA */}
            <div className="p-4 bg-rose-500/5 border-l-4 border-l-rose-500">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpansao('deducoes')}
              >
                <div className="flex items-center gap-2">
                  {expandido.deducoes ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-black text-sm text-rose-400 font-sans">
                    2. (-) DEDUÇÕES DA RECEITA BRUTA
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">
                    Taxas de cartão, cancelamentos e tributos
                  </span>
                  <span className="text-base font-black text-rose-400">
                    - R$ {dadosDRE.totalDeducoes.toFixed(2)}
                  </span>
                </div>
              </div>

              {expandido.deducoes && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-rose-500/20 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>↳ Taxas de Cartão & Adquirência</span>
                    <span className="font-bold text-rose-300">- R$ {dadosDRE.totalTaxasCartao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Descontos Comerciais Concedidos</span>
                    <span className="font-bold text-rose-300">- R$ {dadosDRE.totalDescontos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Cancelamentos & Estornos de Pedidos</span>
                    <span className="font-bold text-rose-300">- R$ {dadosDRE.totalCancelamentos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Impostos Fiscais & Tributos (DAS / ICMS)</span>
                    <span className="font-bold text-rose-300">
                      - R$ {(dadosDRE.deducoesExtras + dadosDRE.impostosFiscaisNF).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* LINHA 3: RECEITA OPERACIONAL LÍQUIDA (ROL) */}
            <div className="p-4 bg-blue-500/10 border-l-4 border-l-blue-500 flex items-center justify-between font-sans">
              <div>
                <span className="font-black text-sm text-blue-400 block">
                  3. (=) RECEITA OPERACIONAL LÍQUIDA (ROL)
                </span>
                <span className="text-[11px] text-slate-400">
                  Base 100% de comparação para todas as margens da operação
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-blue-400 font-mono block">
                  R$ {dadosDRE.receitaLiquida.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                  100,0%
                </span>
              </div>
            </div>

            {/* LINHA 4: CMV */}
            <div className="p-4 bg-amber-500/5 border-l-4 border-l-amber-500">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpansao('cmv')}
              >
                <div className="flex items-center gap-2">
                  {expandido.cmv ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-black text-sm text-amber-400 font-sans">
                    4. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-sans">
                    {dadosDRE.cmvPct.toFixed(1)}% ROL
                  </span>
                  <span className="text-base font-black text-amber-400">
                    - R$ {dadosDRE.cmvFinal.toFixed(2)}
                  </span>
                </div>
              </div>

              {expandido.cmv && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-amber-500/20 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>↳ Compras de Alimentos e Bebidas (Lançamentos)</span>
                    <span className="font-bold text-amber-300">- R$ {dadosDRE.comprasCMV.toFixed(2)}</span>
                  </div>
                  {dadosDRE.comprasInsumosNF > 0 && (
                    <div className="flex justify-between">
                      <span>↳ Compras Faturadas em Notas Fiscais (XML)</span>
                      <span className="font-bold text-amber-300">- R$ {dadosDRE.comprasInsumosNF.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LINHA 5: LUCRO BRUTO */}
            <div className="p-4 bg-emerald-500/10 border-l-4 border-l-emerald-400 flex items-center justify-between font-sans">
              <div>
                <span className="font-black text-sm text-emerald-400 block">
                  5. (=) LUCRO BRUTO / MARGEM DE CONTRIBUIÇÃO
                </span>
                <span className="text-[11px] text-slate-400">
                  Receita Líquida subtraída dos custos diretos com insumos
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 font-mono block">
                  R$ {dadosDRE.lucroBruto.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  {dadosDRE.margemBrutaPct.toFixed(1)}% ROL
                </span>
              </div>
            </div>

            {/* LINHA 6: DESPESAS COM PESSOAL */}
            <div className="p-4 bg-blue-500/5 border-l-4 border-l-blue-400">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpansao('pessoal')}
              >
                <div className="flex items-center gap-2">
                  {expandido.pessoal ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-black text-sm text-blue-400 font-sans">
                    6. (-) DESPESAS COM PESSOAL & EQUIPE
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded font-sans">
                    {((dadosDRE.despesasPessoal / (dadosDRE.receitaLiquida || 1)) * 100).toFixed(1)}% ROL
                  </span>
                  <span className="text-base font-black text-blue-400">
                    - R$ {dadosDRE.despesasPessoal.toFixed(2)}
                  </span>
                </div>
              </div>

              {expandido.pessoal && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-blue-500/20 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>↳ Salários, encargos, benefícios e vales</span>
                    <span className="font-bold text-blue-300">- R$ {dadosDRE.despesasPessoal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* LINHA 7: DESPESAS OPERACIONAIS E ADMINISTRATIVAS */}
            <div className="p-4 bg-purple-500/5 border-l-4 border-l-purple-400">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpansao('operacionais')}
              >
                <div className="flex items-center gap-2">
                  {expandido.operacionais ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-black text-sm text-purple-400 font-sans">
                    7. (-) DESPESAS OPERACIONAIS & ADMINISTRATIVAS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-purple-400">
                    - R${' '}
                    {(
                      dadosDRE.totalDespesasOperacionais - dadosDRE.despesasPessoal
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {expandido.operacionais && (
                <div className="mt-3 pl-6 space-y-1.5 pt-2 border-t border-purple-500/20 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>↳ Ocupação & Utilidades (Aluguel, Água, Energia, Gás)</span>
                    <span className="font-bold text-purple-300">- R$ {dadosDRE.despesasOcupacao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Comercial, Marketing & Embalagens Delivery</span>
                    <span className="font-bold text-purple-300">- R$ {dadosDRE.despesasComerciais.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Serviços, TI, Limpeza & Manutenção de Equipamentos</span>
                    <span className="font-bold text-purple-300">- R$ {dadosDRE.despesasServicos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↳ Outras Despesas Gerais & Administrativas</span>
                    <span className="font-bold text-purple-300">- R$ {dadosDRE.outrasDespesas.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* LINHA 8: RESULTADO OPERACIONAL */}
            <div className="p-4 bg-amber-500/10 border-l-4 border-l-amber-400 flex items-center justify-between font-sans">
              <div>
                <span className="font-black text-sm text-amber-400 block">
                  8. (=) RESULTADO OPERACIONAL (EBITDA OPERACIONAL)
                </span>
                <span className="text-[11px] text-slate-400">
                  Lucro gerado estritamente pela operação do restaurante
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-lg font-black font-mono block ${
                    dadosDRE.resultadoOperacional >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  R$ {dadosDRE.resultadoOperacional.toFixed(2)}
                </span>
              </div>
            </div>

            {/* LINHA 9: RESULTADO FINANCEIRO */}
            <div className="p-4 bg-slate-800/40 border-l-4 border-l-slate-500 flex items-center justify-between font-sans">
              <div>
                <span className="font-black text-sm text-slate-300 block">
                  9. (+/-) RESULTADO FINANCEIRO LÍQUIDO
                </span>
                <span className="text-[11px] text-slate-400">
                  Juros auferidos (-) Taxas de adquirência bancária e antecipação
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-200 font-mono">
                  {dadosDRE.resultadoFinanceiro >= 0 ? '+ ' : ''}
                  R$ {dadosDRE.resultadoFinanceiro.toFixed(2)}
                </span>
              </div>
            </div>

            {/* LINHA 10: LUCRO OU PREJUÍZO LÍQUIDO FINAL */}
            <div
              className={`p-5 border-l-4 flex items-center justify-between font-sans ${
                dadosDRE.lucroLiquidoFinal >= 0
                  ? 'bg-emerald-500/20 border-l-emerald-500 text-emerald-400'
                  : 'bg-rose-500/20 border-l-rose-500 text-rose-400'
              }`}
            >
              <div>
                <span className="font-black text-base uppercase tracking-tight block">
                  10. (=){' '}
                  {dadosDRE.lucroLiquidoFinal >= 0
                    ? 'LUCRO LÍQUIDO DO PERÍODO'
                    : 'PREJUÍZO OPERACIONAL APURADO'}
                </span>
                <span className="text-xs text-slate-300">
                  Resultado final líquido acumulado após todos os custos e despesas
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono block">
                  R$ {dadosDRE.lucroLiquidoFinal.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded inline-block mt-0.5 ${
                    dadosDRE.lucroLiquidoFinal >= 0
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/30 text-rose-300'
                  }`}
                >
                  Margem Líquida: {dadosDRE.margemLiquidaPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISUALIZAÇÃO 2: COMPARATIVO MULTI-MESES */
        <div
          className={`rounded-2xl border overflow-hidden ${
            isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-lg'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead
                className={`border-b text-[11px] uppercase tracking-wider font-black font-sans ${
                  isWhite ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Linha do DRE</th>
                  {comparativoMeses.map((m, idx) => (
                    <th key={idx} className="py-3 px-4 text-right capitalize">
                      {m.nomeMes}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Variação (Mês Atual vs Anterior)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {/* 1. Receita Bruta */}
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-200 font-sans">
                    1. Receita Operacional Bruta
                  </td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-emerald-400 font-black">
                      R$ {m.receitaBrutaTotal.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-bold text-slate-300">
                    {(() => {
                      const m0 = comparativoMeses[1]?.receitaBrutaTotal || 1;
                      const m1 = comparativoMeses[2]?.receitaBrutaTotal || 0;
                      const varPct = ((m1 - m0) / m0) * 100;
                      return (
                        <span className={varPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {varPct >= 0 ? '+' : ''}
                          {varPct.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </td>
                </tr>

                {/* 2. Deduções */}
                <tr>
                  <td className="py-3 px-4 text-slate-400 font-sans">2. (-) Deduções da Receita</td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-rose-400">
                      - R$ {m.totalDeducoes.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 3. Receita Líquida */}
                <tr className="bg-blue-500/10">
                  <td className="py-3 px-4 font-black text-blue-400 font-sans">
                    3. (=) Receita Líquida (ROL)
                  </td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-blue-400 font-black">
                      R$ {m.receitaLiquida.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-black text-blue-300">100%</td>
                </tr>

                {/* 4. CMV */}
                <tr>
                  <td className="py-3 px-4 text-amber-400 font-sans">4. (-) CMV (Insumos)</td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-amber-400 font-bold">
                      - R$ {m.cmvFinal.toFixed(2)} ({m.cmvPct.toFixed(0)}%)
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 5. Lucro Bruto */}
                <tr className="bg-emerald-500/10">
                  <td className="py-3 px-4 font-black text-emerald-400 font-sans">
                    5. (=) Lucro Bruto
                  </td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-emerald-400 font-black">
                      R$ {m.lucroBruto.toFixed(2)} ({m.margemBrutaPct.toFixed(0)}%)
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 6. Pessoal */}
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans">6. (-) Pessoal & Salários</td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-slate-300">
                      - R$ {m.despesasPessoal.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 7. Despesas Operacionais */}
                <tr>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    7. (-) Despesas Operacionais
                  </td>
                  {comparativoMeses.map((m, idx) => (
                    <td key={idx} className="py-3 px-4 text-right text-slate-300">
                      - R$ {(m.totalDespesasOperacionais - m.despesasPessoal).toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                </tr>

                {/* 10. Lucro Líquido */}
                <tr className="bg-slate-800/80">
                  <td className="py-3.5 px-4 font-black text-sm text-slate-100 font-sans">
                    10. (=) Resultado Líquido Final
                  </td>
                  {comparativoMeses.map((m, idx) => (
                    <td
                      key={idx}
                      className={`py-3.5 px-4 text-right font-black text-sm ${
                        m.lucroLiquidoFinal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      R$ {m.lucroLiquidoFinal.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                    {(() => {
                      const m0 = comparativoMeses[1]?.lucroLiquidoFinal || 1;
                      const m1 = comparativoMeses[2]?.lucroLiquidoFinal || 0;
                      const varPct = ((m1 - m0) / Math.abs(m0)) * 100;
                      return (
                        <span className={varPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {varPct >= 0 ? '+' : ''}
                          {varPct.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
