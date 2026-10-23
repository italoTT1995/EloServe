import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Printer,
  AlertCircle,
  CheckCircle2,
  Store,
  Receipt,
  Package,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Download,
  X,
  QrCode,
  FileSpreadsheet,
  Edit2,
  Lightbulb,
  Droplet,
  Flame,
  Users,
  Bike,
  Apple,
  Search,
  Upload,
  FileText,
  Copy,
  Eye,
  Building2,
  FileCheck,
  Repeat,
  LayoutDashboard,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useSaaSStore } from '../store/useSaaSStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useThemeStore } from '../store/useThemeStore';
import { useFinanceiroStore } from '../store/useFinanceiroStore';
import {
  DespesaOperacionalRestaurante,
  VendaRealizada,
  NotaFiscalRegistro,
  TipoNotaFiscal,
  ModeloDocumentoFiscal,
  StatusNotaFiscal,
  LancamentoFinanceiro,
  LancamentoRecorrente,
  CategoriaFinanceira,
  TipoLancamentoFinanceiro,
} from '../types';
import { extrairDadosXmlNFe } from '../utils/nfeXmlParser';

// Componentes Modulares da Central Financeira
import { DashboardFinanceiro, FiltroPeriodoDashboard } from '../components/financeiro/DashboardFinanceiro';
import { LancamentosSection } from '../components/financeiro/LancamentosSection';
import { RecorrenciasSection } from '../components/financeiro/RecorrenciasSection';
import { DRESection } from '../components/financeiro/DRESection';
import { ModalLancamento } from '../components/financeiro/ModalLancamento';
import { ModalRecorrencia } from '../components/financeiro/ModalRecorrencia';
import { ModalHistorico } from '../components/financeiro/ModalHistorico';
import { ModalCategoria } from '../components/financeiro/ModalCategoria';

export type SubAbaFinanceiro = 'dashboard' | 'lancamentos' | 'recorrencias' | 'dre' | 'notas_fiscais';

interface FinanceiroProps {
  tenantIdInicial?: string;
  isEmbedded?: boolean;
}

export default function Financeiro({ tenantIdInicial, isEmbedded = false }: FinanceiroProps) {
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';
  const { usuarioLogado } = useAuthStore();
  const { tenants } = useSaaSStore();
  const location = useLocation();

  const isMasterUser = usuarioLogado?.cargo === 'super_admin';
  const isRestauranteUser = usuarioLogado?.cargo === 'admin_restaurante';

  // Garante que o restaurante logado acesse exclusivamente sua loja
  const defaultTenant = isRestauranteUser
    ? (usuarioLogado?.tenantId || 'tenant-01')
    : (tenantIdInicial || (tenants.length > 0 ? tenants[0].id : 'tenant-01'));

  const [tenantSelecionadoId, setTenantSelecionadoId] = useState<string>(defaultTenant);

  // Tenant efetivo garantido por regra de segurança
  const tenantEfetivoId = isRestauranteUser
    ? (usuarioLogado?.tenantId || 'tenant-01')
    : tenantSelecionadoId;

  const restauranteAtual = useMemo(() => {
    if (tenantEfetivoId === 'todos') {
      return {
        id: 'todos',
        nomeFantasia: 'Todas as Lojas (Consolidado Multi-Tenant)',
        documento: 'Consolidado Rede',
        cidadeUf: 'Brasil',
      };
    }
    return (
      tenants.find((t) => t.id === tenantEfetivoId) || {
        id: tenantEfetivoId,
        nomeFantasia: 'Restaurante Selecionado',
        documento: '11.222.333/0001-44',
        cidadeUf: 'Brasil',
      }
    );
  }, [tenants, tenantEfetivoId]);

  // Stores
  const {
    getVendasPorTenant,
    getDespesasPorTenant,
    getNotasFiscaisPorTenant,
    adicionarNotaFiscal,
    removerNotaFiscal,
  } = useAppStore();

  const {
    getLancamentosPorTenant,
    getRecorrenciasPorTenant,
    getCategorias,
    adicionarLancamento,
    editarLancamento,
    alternarStatusLancamento,
    cancelarLancamento,
    excluirLancamento,
    adicionarRecorrencia,
    editarRecorrencia,
    alternarAtivoRecorrencia,
    excluirRecorrencia,
    processarRecorrencias,
    adicionarCategoriaCustom,
  } = useFinanceiroStore();

  // Sub-Aba ativa
  const searchParams = new URLSearchParams(location.search);
  const paramAba = searchParams.get('aba');
  const [subAba, setSubAba] = useState<SubAbaFinanceiro>(() => {
    if (paramAba === 'dashboard' || paramAba === 'lancamentos' || paramAba === 'recorrencias' || paramAba === 'dre' || paramAba === 'notas_fiscais') {
      return paramAba as SubAbaFinanceiro;
    }
    if (location.pathname === '/notas-fiscais') return 'notas_fiscais';
    if (location.pathname === '/dre') return 'dre';
    if (location.pathname === '/gastos') return 'lancamentos';
    return 'dashboard';
  });

  // Atualiza sub-aba se a URL mudar
  useEffect(() => {
    if (paramAba && ['dashboard', 'lancamentos', 'recorrencias', 'dre', 'notas_fiscais'].includes(paramAba)) {
      setSubAba(paramAba as SubAbaFinanceiro);
    }
  }, [paramAba]);

  // Toast Notificações
  const [toastNotificacao, setToastNotificacao] = useState<string | null>(null);
  function exibirToast(msg: string) {
    setToastNotificacao(msg);
    setTimeout(() => setToastNotificacao(null), 4000);
  }

  // Tenant alvo para salvamento de novos registros
  const tenantParaSalvar = isRestauranteUser
    ? (usuarioLogado?.tenantId || 'tenant-01')
    : (tenantSelecionadoId === 'todos' ? (tenants[0]?.id || 'tenant-01') : tenantSelecionadoId);

  // Executa processamento de lançamentos recorrentes futuros ao carregar a página
  useEffect(() => {
    try {
      const novos = processarRecorrencias(tenantParaSalvar);
      if (novos > 0) {
        exibirToast(`⚡ ${novos} lançamentos recorrentes futuros foram gerados automaticamente como Pendentes.`);
      }
    } catch (e) {
      console.error('Erro ao processar lançamentos recorrentes:', e);
    }
  }, [tenantParaSalvar, processarRecorrencias]);

  // Dados carregados para o tenant selecionado
  const todasVendas = getVendasPorTenant(tenantEfetivoId);
  const todasNotasFiscais = getNotasFiscaisPorTenant(tenantEfetivoId);
  const todasDespesasLegado = getDespesasPorTenant(tenantEfetivoId);
  const todosLancamentos = getLancamentosPorTenant(tenantEfetivoId);
  const todasRecorrencias = getRecorrenciasPorTenant(tenantEfetivoId);
  const categoriasAtivas = getCategorias(tenantEfetivoId);

  // Modais de Gestão Financeira
  const [modalLancamentoAberto, setModalLancamentoAberto] = useState(false);
  const [lancamentoEmEdicao, setLancamentoEmEdicao] = useState<LancamentoFinanceiro | null>(null);

  const [modalRecorrenciaAberto, setModalRecorrenciaAberto] = useState(false);
  const [recorrenciaEmEdicao, setRecorrenciaEmEdicao] = useState<LancamentoRecorrente | null>(null);

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [lancamentoHistorico, setLancamentoHistorico] = useState<LancamentoFinanceiro | null>(null);

  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);

  // Modais de Notas Fiscais & XML SEFAZ
  const [modalNFAberto, setModalNFAberto] = useState(false);
  const [modalImportarXmlAberto, setModalImportarXmlAberto] = useState(false);
  const [modalDanfeAberto, setModalDanfeAberto] = useState(false);
  const [nfVisualizando, setNfVisualizando] = useState<NotaFiscalRegistro | null>(null);
  const [xmlInputTexto, setXmlInputTexto] = useState('');
  const [nomeArquivoXmlSelecionado, setNomeArquivoXmlSelecionado] = useState('');
  const [erroXml, setErroXml] = useState<string | null>(null);
  const [xmlPrevia, setXmlPrevia] = useState<Omit<NotaFiscalRegistro, 'id' | 'criadoEm'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State: Nota Fiscal Manual
  const [formNF, setFormNF] = useState<{
    numero: string;
    serie: string;
    chaveAcesso: string;
    modelo: ModeloDocumentoFiscal;
    tipo: TipoNotaFiscal;
    emitenteRazaoSocial: string;
    emitenteCnpjCpf: string;
    dataEmissao: string;
    valorTotalProdutos: string;
    valorFrete: string;
    valorTotalNota: string;
    valorIcms: string;
    status: StatusNotaFiscal;
    observacoes: string;
  }>({
    numero: '',
    serie: '1',
    chaveAcesso: '',
    modelo: 'NFe_55',
    tipo: 'entrada_insumos',
    emitenteRazaoSocial: '',
    emitenteCnpjCpf: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    valorTotalProdutos: '',
    valorFrete: '0',
    valorTotalNota: '',
    valorIcms: '0',
    status: 'autorizada',
    observacoes: '',
  });

  // Handlers: Lançamentos
  function handleSalvarLancamento(dados: Omit<LancamentoFinanceiro, 'id' | 'criadoEm' | 'atualizadoEm' | 'historicoAlteracoes'>) {
    if (lancamentoEmEdicao) {
      editarLancamento(
        lancamentoEmEdicao.id,
        dados,
        usuarioLogado?.nome || (isRestauranteUser ? 'Gestor da Loja' : 'Admin Master'),
        'Atualização dos dados pelo formulário financeiro'
      );
      exibirToast(`Lançamento "${dados.descricao}" atualizado com sucesso!`);
    } else {
      adicionarLancamento(dados);
      exibirToast(`Novo lançamento "${dados.descricao}" registrado no financeiro!`);
    }
    setModalLancamentoAberto(false);
    setLancamentoEmEdicao(null);
  }

  function handleSalvarRecorrencia(dados: Omit<LancamentoRecorrente, 'id' | 'criadoEm' | 'atualizadoEm'>, propagarParaFuturos?: boolean) {
    if (recorrenciaEmEdicao) {
      editarRecorrencia(recorrenciaEmEdicao.id, dados, propagarParaFuturos);
      exibirToast(`Regra recorrente "${dados.descricao}" atualizada!`);
    } else {
      const nova = adicionarRecorrencia(dados);
      processarRecorrencias(tenantParaSalvar);
      exibirToast(`Regra recorrente "${dados.descricao}" criada e processada para os próximos meses!`);
    }
    setModalRecorrenciaAberto(false);
    setRecorrenciaEmEdicao(null);
  }

  function handleSalvarCategoria(cat: Omit<CategoriaFinanceira, 'id' | 'sistema'>) {
    adicionarCategoriaCustom(cat);
    exibirToast(`Categoria "${cat.nome}" criada com sucesso!`);
  }

  // Handlers: Notas Fiscais
  function handleSalvarNF(e: React.FormEvent) {
    e.preventDefault();
    const vTotal = parseFloat(formNF.valorTotalNota.replace(',', '.')) || 0;
    const vProd = parseFloat(formNF.valorTotalProdutos.replace(',', '.')) || vTotal;
    const vIcms = parseFloat(formNF.valorIcms.replace(',', '.')) || 0;

    if (!formNF.numero.trim() || vTotal <= 0) {
      alert('Informe o número e valor da Nota Fiscal.');
      return;
    }

    let linhaDRE: NotaFiscalRegistro['linhaDRE'] = 'cmv';
    if (formNF.tipo === 'entrada_embalagens') linhaDRE = 'comercial_embalagens';
    else if (formNF.tipo === 'entrada_servicos') linhaDRE = 'servicos';
    else if (formNF.tipo === 'entrada_utilidades') linhaDRE = 'ocupacao';
    else if (formNF.tipo === 'saida_venda') linhaDRE = 'receita_bruta';

    adicionarNotaFiscal({
      tenantId: tenantParaSalvar,
      numero: formNF.numero,
      serie: formNF.serie,
      chaveAcesso: formNF.chaveAcesso || undefined,
      modelo: formNF.modelo,
      tipo: formNF.tipo,
      direcao: formNF.tipo === 'saida_venda' ? 'saida' : 'entrada',
      emitenteRazaoSocial: formNF.emitenteRazaoSocial || 'FORNECEDOR',
      emitenteCnpjCpf: formNF.emitenteCnpjCpf || '00.000.000/0001-00',
      destinatarioRazaoSocial: restauranteAtual.nomeFantasia,
      destinatarioCnpjCpf: restauranteAtual.documento,
      dataEmissao: formNF.dataEmissao,
      valorTotalProdutos: vProd,
      valorTotalNota: vTotal,
      valorIcms: vIcms,
      status: formNF.status,
      linhaDRE,
      observacoes: formNF.observacoes,
      cadastradoPor: usuarioLogado?.nome || (isRestauranteUser ? 'Gestor da Loja' : 'Admin Master'),
    });

    exibirToast(`Nota Fiscal #${formNF.numero} cadastrada e integrada ao DRE!`);
    setModalNFAberto(false);
  }

  function handleUploadXml(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivoXmlSelecionado(file.name);
    setErroXml(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const conteudo = ev.target?.result as string;
      setXmlInputTexto(conteudo);
      const res = extrairDadosXmlNFe(conteudo, tenantParaSalvar);
      if (!res.sucesso || !res.nota) {
        setErroXml(res.erro || 'Falha ao ler XML.');
        setXmlPrevia(null);
      } else {
        setXmlPrevia(res.nota);
      }
    };
    reader.readAsText(file);
  }

  function confirmarXml() {
    if (!xmlPrevia) return;
    adicionarNotaFiscal({
      ...xmlPrevia,
      tenantId: tenantParaSalvar,
      cadastradoPor: usuarioLogado?.nome || (isRestauranteUser ? 'Gestor da Loja' : 'Admin Master'),
    });
    exibirToast(`XML NF-e #${xmlPrevia.numero} importado e integrado ao DRE!`);
    setModalImportarXmlAberto(false);
    setXmlPrevia(null);
    setXmlInputTexto('');
  }

  return (
    <div className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] ${isEmbedded ? '' : 'max-w-7xl mx-auto p-4 sm:p-6'}`}>
      {/* Toast Notificação */}
      {toastNotificacao && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastNotificacao}</span>
        </div>
      )}

      {/* Header Central de Gestão Financeira */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isWhite ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1E293B] border-slate-800 shadow-xl'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
              {isRestauranteUser ? '🍽️ Nível 2 • Gestão Financeira da Unidade' : '👑 Nível 1 • Franqueador & Admin Master'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              EloServe Financeiro v2.0
            </span>
          </div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
              isWhite ? 'text-slate-900' : 'text-white'
            }`}
          >
            <DollarSign className="w-6 h-6 text-[#FF6B00]" />
            <span>{isRestauranteUser ? 'Gestão Financeira & DRE' : 'Central Financeira & DRE Multi-Lojas'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRestauranteUser
              ? `Acompanhamento de receitas, despesas, lançamentos recorrentes, fluxo de caixa e DRE contábil do restaurante.`
              : 'Auditoria consolidada de receitas, custos, despesas recorrentes e DRE em tempo real de toda a rede.'}
          </p>
        </div>

        {/* Seletor de Estabelecimento */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isMasterUser ? (
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <select
                value={tenantSelecionadoId}
                onChange={(e) => setTenantSelecionadoId(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isWhite ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0F172A] border-slate-700 text-white'
                }`}
              >
                <option value="todos">🌐 Todas as Lojas (Consolidado Multi-Tenant)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    🍽️ {t.nomeFantasia} ({t.documento || 'Sem CNPJ'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${
                isWhite ? 'bg-orange-50 border-orange-200 text-slate-800' : 'bg-[#0F172A] border-slate-700 text-slate-200'
              }`}
            >
              <Store className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{restauranteAtual.nomeFantasia}</span>
              {restauranteAtual.documento && (
                <span className="text-[10px] text-slate-400 font-mono">({restauranteAtual.documento})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de 5 Sub-Abas do Módulo Financeiro */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Sub-Aba 1: Dashboard */}
          <button
            type="button"
            onClick={() => setSubAba('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'dashboard'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>

          {/* Sub-Aba 2: Lançamentos & Livro Caixa */}
          <button
            type="button"
            onClick={() => setSubAba('lancamentos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'lancamentos'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>2. Lançamentos & Movimentações</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                subAba === 'lancamentos' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {todosLancamentos.length}
            </span>
          </button>

          {/* Sub-Aba 3: Despesas & Receitas Recorrentes */}
          <button
            type="button"
            onClick={() => setSubAba('recorrencias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'recorrencias'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>3. Lançamentos Recorrentes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                subAba === 'recorrencias' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {todasRecorrencias.length}
            </span>
          </button>

          {/* Sub-Aba 4: DRE Automático & Fluxo */}
          <button
            type="button"
            onClick={() => setSubAba('dre')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'dre'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>4. DRE Automático & Fluxo</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#10B981] font-bold">
              Ao Vivo
            </span>
          </button>

          {/* Sub-Aba 5: Notas Fiscais & XML SEFAZ */}
          <button
            type="button"
            onClick={() => setSubAba('notas_fiscais')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subAba === 'notas_fiscais'
                ? 'bg-[#FF6B00] !text-white shadow-lg shadow-[#FF6B00]/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>5. Notas Fiscais & XML</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                subAba === 'notas_fiscais' ? 'bg-white/20 !text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {todasNotasFiscais.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD FINANCEIRO                                                   */}
      {/* ========================================================================= */}
      {subAba === 'dashboard' && (
        <DashboardFinanceiro
          lancamentos={todosLancamentos}
          vendas={todasVendas}
          notasFiscais={todasNotasFiscais}
          despesasLegado={todasDespesasLegado}
          categorias={categoriasAtivas}
          isWhite={isWhite}
          onNovoLancamento={(tipo) => {
            setLancamentoEmEdicao(null);
            setModalLancamentoAberto(true);
          }}
          onNovaRecorrencia={() => {
            setRecorrenciaEmEdicao(null);
            setModalRecorrenciaAberto(true);
          }}
          onIrParaLancamentos={() => setSubAba('lancamentos')}
          onIrParaDRE={() => setSubAba('dre')}
          onMarcarComoPago={(id) => {
            alternarStatusLancamento(id, usuarioLogado?.nome);
            exibirToast('Status do lançamento atualizado com sucesso!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. LANÇAMENTOS & MOVIMENTAÇÕES FINANCEIRAS                                */}
      {/* ========================================================================= */}
      {subAba === 'lancamentos' && (
        <LancamentosSection
          lancamentos={todosLancamentos}
          categorias={categoriasAtivas}
          isWhite={isWhite}
          onNovoLancamento={(tipo, dadosPredefinidos) => {
            setLancamentoEmEdicao(
              dadosPredefinidos
                ? ({
                    id: '',
                    tenantId: tenantParaSalvar,
                    descricao: dadosPredefinidos.descricao || '',
                    tipo: dadosPredefinidos.tipo || tipo || 'despesa',
                    categoriaId: dadosPredefinidos.categoriaId || '',
                    categoriaNome: dadosPredefinidos.categoriaNome || '',
                    valor: 0,
                    dataCompetencia: new Date().toISOString().split('T')[0],
                    formaPagamento: 'pix',
                    status: 'pago',
                    origem: 'manual',
                    cadastradoPor: usuarioLogado?.nome || 'Admin',
                    criadoEm: '',
                    atualizadoEm: '',
                  } as LancamentoFinanceiro)
                : null
            );
            setModalLancamentoAberto(true);
          }}
          onEditarLancamento={(item) => {
            setLancamentoEmEdicao(item);
            setModalLancamentoAberto(true);
          }}
          onAlternarStatus={(id) => {
            alternarStatusLancamento(id, usuarioLogado?.nome);
            exibirToast('Status de pagamento alternado com sucesso!');
          }}
          onCancelarLancamento={(id) => {
            cancelarLancamento(id, usuarioLogado?.nome, 'Cancelamento solicitado pelo gestor');
            exibirToast('Lançamento cancelado.');
          }}
          onExcluirLancamento={(id) => {
            if (confirm('Deseja realmente excluir este lançamento financeiro definitivamente?')) {
              excluirLancamento(id);
              exibirToast('Lançamento excluído.');
            }
          }}
          onAbrirHistorico={(item) => {
            setLancamentoHistorico(item);
            setModalHistoricoAberto(true);
          }}
          onNovaCategoria={() => setModalCategoriaAberto(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. LANÇAMENTOS RECORRENTES                                                */}
      {/* ========================================================================= */}
      {subAba === 'recorrencias' && (
        <RecorrenciasSection
          recorrencias={todasRecorrencias}
          categorias={categoriasAtivas}
          isWhite={isWhite}
          onNovaRecorrencia={() => {
            setRecorrenciaEmEdicao(null);
            setModalRecorrenciaAberto(true);
          }}
          onEditarRecorrencia={(rec) => {
            setRecorrenciaEmEdicao(rec);
            setModalRecorrenciaAberto(true);
          }}
          onAlternarAtivo={(id) => {
            alternarAtivoRecorrencia(id);
            exibirToast('Status da recorrência atualizado!');
          }}
          onExcluirRecorrencia={(id) => {
            if (confirm('Deseja excluir esta regra de recorrência? Lançamentos passados serão preservados.')) {
              excluirRecorrencia(id, false);
              exibirToast('Recorrência removida.');
            }
          }}
          onProcessarAgora={() => {
            const qtd = processarRecorrencias(tenantParaSalvar);
            exibirToast(`⚡ Processamento concluído! ${qtd} novas parcelas pendentes geradas.`);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. DRE AUTOMÁTICO & FLUXO DE CAIXA                                        */}
      {/* ========================================================================= */}
      {subAba === 'dre' && (
        <DRESection
          lancamentos={todosLancamentos}
          vendas={todasVendas}
          notasFiscais={todasNotasFiscais}
          despesasLegado={todasDespesasLegado}
          categorias={categoriasAtivas}
          nomeRestaurante={restauranteAtual.nomeFantasia}
          documentoRestaurante={restauranteAtual.documento}
          isWhite={isWhite}
          periodoFiltro="mes_atual"
        />
      )}

      {/* ========================================================================= */}
      {/* 5. NOTAS FISCAIS & XML SEFAZ                                              */}
      {/* ========================================================================= */}
      {subAba === 'notas_fiscais' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Notas Fiscais de Compras, Serviços e Vendas</h3>
              <p className="text-xs text-slate-400">
                Cada nota lançada aqui abate diretamente do CMV (Insumos) ou compõe as despesas do DRE deste restaurante.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setErroXml(null);
                  setXmlPrevia(null);
                  setXmlInputTexto('');
                  setModalImportarXmlAberto(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs shadow-md shadow-[#FF6B00]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Importar XML SEFAZ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormNF({
                    numero: '',
                    serie: '1',
                    chaveAcesso: '',
                    modelo: 'NFe_55',
                    tipo: 'entrada_insumos',
                    emitenteRazaoSocial: '',
                    emitenteCnpjCpf: '',
                    dataEmissao: new Date().toISOString().split('T')[0],
                    valorTotalProdutos: '',
                    valorFrete: '0',
                    valorTotalNota: '',
                    valorIcms: '0',
                    status: 'autorizada',
                    observacoes: '',
                  });
                  setModalNFAberto(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Lançar NF Manual</span>
              </button>
            </div>
          </div>

          {/* Tabela de Notas Fiscais */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isWhite ? 'bg-white border-slate-200' : 'bg-[#1E293B] border-slate-800'
            }`}
          >
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b text-[11px] uppercase tracking-wider font-black ${
                  isWhite ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#0F172A] border-slate-800 text-slate-400'
                }`}
              >
                <tr>
                  <th className="py-3 px-4">Número / Modelo</th>
                  <th className="py-3 px-4">Fornecedor / Emitente</th>
                  <th className="py-3 px-4">Data Emissão</th>
                  <th className="py-3 px-4">Destino no DRE</th>
                  <th className="py-3 px-4 text-right">Valor Total (R$)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {todasNotasFiscais.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <QrCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Nenhuma Nota Fiscal importada ou lançada para este restaurante.
                    </td>
                  </tr>
                ) : (
                  todasNotasFiscais.map((nf) => (
                    <tr
                      key={nf.id}
                      className={isWhite ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        #{nf.numero} <span className="text-[10px] text-slate-400">({nf.modelo})</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{nf.emitenteRazaoSocial}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{nf.emitenteCnpjCpf}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">{nf.dataEmissao}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {nf.linhaDRE}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-sm text-slate-100">
                        R$ {nf.valorTotalNota.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {nf.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setNfVisualizando(nf);
                              setModalDanfeAberto(true);
                            }}
                            title="Visualizar DANFE"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remover nota fiscal #${nf.numero}?`)) {
                                removerNotaFiscal(nf.id);
                                exibirToast(`Nota fiscal #${nf.numero} removida.`);
                              }
                            }}
                            title="Excluir Nota Fiscal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAIS DO MÓDULO FINANCEIRO                                              */}
      {/* ========================================================================= */}

      {/* Modal Lançamento Financeiro (Receita / Despesa Manual com Anexo e Auditoria) */}
      <ModalLancamento
        isOpen={modalLancamentoAberto}
        onClose={() => {
          setModalLancamentoAberto(false);
          setLancamentoEmEdicao(null);
        }}
        onSalvar={handleSalvarLancamento}
        lancamentoEmEdicao={lancamentoEmEdicao}
        categorias={categoriasAtivas}
        tenantId={tenantParaSalvar}
        usuarioNome={usuarioLogado?.nome || (isRestauranteUser ? 'Gestor da Loja' : 'Admin Master')}
        isWhite={isWhite}
      />

      {/* Modal Lançamento Recorrente */}
      <ModalRecorrencia
        isOpen={modalRecorrenciaAberto}
        onClose={() => {
          setModalRecorrenciaAberto(false);
          setRecorrenciaEmEdicao(null);
        }}
        onSalvar={handleSalvarRecorrencia}
        recorrenciaEmEdicao={recorrenciaEmEdicao}
        categorias={categoriasAtivas}
        tenantId={tenantParaSalvar}
        usuarioNome={usuarioLogado?.nome || (isRestauranteUser ? 'Gestor da Loja' : 'Admin Master')}
        isWhite={isWhite}
      />

      {/* Modal Histórico de Auditoria */}
      <ModalHistorico
        isOpen={modalHistoricoAberto}
        onClose={() => {
          setModalHistoricoAberto(false);
          setLancamentoHistorico(null);
        }}
        lancamento={lancamentoHistorico}
        isWhite={isWhite}
      />

      {/* Modal Criar Nova Categoria */}
      <ModalCategoria
        isOpen={modalCategoriaAberto}
        onClose={() => setModalCategoriaAberto(false)}
        onSalvar={handleSalvarCategoria}
        tenantId={tenantParaSalvar}
        isWhite={isWhite}
      />

      {/* Modal Importar XML SEFAZ */}
      {modalImportarXmlAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#FF6B00]" />
                <span>Importar Arquivo XML da SEFAZ</span>
              </h3>
              <button onClick={() => setModalImportarXmlAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-[#FF6B00] bg-[#0F172A] rounded-2xl p-6 text-center cursor-pointer"
            >
              <input ref={fileInputRef} type="file" accept=".xml" onChange={handleUploadXml} className="hidden" />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {nomeArquivoXmlSelecionado ? (
                  <span className="text-[#10B981]">{nomeArquivoXmlSelecionado}</span>
                ) : (
                  'Clique para selecionar o arquivo XML (.xml) da NF-e'
                )}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Ou cole o texto XML abaixo:</label>
              <textarea
                value={xmlInputTexto}
                onChange={(e) => {
                  setXmlInputTexto(e.target.value);
                  if (e.target.value.trim()) {
                    const res = extrairDadosXmlNFe(e.target.value, tenantSelecionadoId);
                    if (res.sucesso && res.nota) setXmlPrevia(res.nota);
                  }
                }}
                rows={3}
                placeholder="<nfeProc>...</nfeProc>"
                className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
              />
            </div>

            {erroXml && <p className="text-xs text-rose-400">{erroXml}</p>}

            {xmlPrevia && (
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#10B981]/30 text-xs space-y-1">
                <p className="text-[#10B981] font-bold">✓ NF-e #{xmlPrevia.numero} identificada</p>
                <p className="text-slate-300">Fornecedor: {xmlPrevia.emitenteRazaoSocial}</p>
                <p className="text-white font-mono font-bold">Valor: R$ {xmlPrevia.valorTotalNota.toFixed(2)}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setModalImportarXmlAberto(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!xmlPrevia}
                onClick={confirmarXml}
                className="flex-1 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs disabled:opacity-50"
              >
                Confirmar & Lançar no DRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lançar Nota Fiscal Manual */}
      {modalNFAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-white">Lançar Nota Fiscal Manualmente</h3>
              <button onClick={() => setModalNFAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNF} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tipo da Nota (Linha DRE) *</label>
                <select
                  value={formNF.tipo}
                  onChange={(e) => setFormNF({ ...formNF, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="entrada_insumos">🥩 Entrada: Insumos & Compras (CMV 4.0)</option>
                  <option value="entrada_embalagens">📦 Entrada: Embalagens Delivery (Comercial 6.3)</option>
                  <option value="entrada_servicos">🛠️ Entrada: NFS-e Serviços Tomados (Serviços 6.4)</option>
                  <option value="entrada_utilidades">💡 Entrada: Utilidades (Luz, Gás) (Ocupação 6.2)</option>
                  <option value="saida_venda">📤 Saída: Vendas NFC-e (Receita Bruta 1.0)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Número da NF *</label>
                  <input
                    type="text"
                    required
                    value={formNF.numero}
                    onChange={(e) => setFormNF({ ...formNF, numero: e.target.value })}
                    placeholder="Ex: 000185"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data Emissão *</label>
                  <input
                    type="date"
                    required
                    value={formNF.dataEmissao}
                    onChange={(e) => setFormNF({ ...formNF, dataEmissao: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Razão Social do Fornecedor *</label>
                <input
                  type="text"
                  required
                  value={formNF.emitenteRazaoSocial}
                  onChange={(e) => setFormNF({ ...formNF, emitenteRazaoSocial: e.target.value })}
                  placeholder="Nome da empresa fornecedora"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor Total da NF *</label>
                  <input
                    type="text"
                    required
                    value={formNF.valorTotalNota}
                    onChange={(e) => setFormNF({ ...formNF, valorTotalNota: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ICMS Destacado</label>
                  <input
                    type="text"
                    value={formNF.valorIcms}
                    onChange={(e) => setFormNF({ ...formNF, valorIcms: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalNFAberto(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-xs uppercase"
                >
                  Salvar & Lançar no DRE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar DANFE */}
      {modalDanfeAberto && nfVisualizando && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-sm font-extrabold text-white">
                  DANFE Simplificado — NF-e #{nfVisualizando.numero}
                </h3>
              </div>
              <button onClick={() => setModalDanfeAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">EMITENTE</span>
                  <span className="text-white font-bold">{nfVisualizando.emitenteRazaoSocial}</span>
                  <span className="text-slate-400 block text-[10px]">{nfVisualizando.emitenteCnpjCpf}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">DATA DE EMISSÃO</span>
                  <span className="text-white font-bold">{nfVisualizando.dataEmissao}</span>
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                    ✓ {nfVisualizando.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">VALOR DOS PRODUTOS</span>
                  <span className="text-white font-bold">R$ {nfVisualizando.valorTotalProdutos.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">VALOR TOTAL DA NOTA</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    R$ {nfVisualizando.valorTotalNota.toFixed(2)}
                  </span>
                </div>
              </div>

              {nfVisualizando.chaveAcesso && (
                <div>
                  <span className="text-slate-500 block text-[10px]">CHAVE DE ACESSO (SEFAZ)</span>
                  <span className="text-slate-300 text-[10px] break-all">{nfVisualizando.chaveAcesso}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setModalDanfeAberto(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
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
