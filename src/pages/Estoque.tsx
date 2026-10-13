import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  ShoppingCart,
  ChefHat,
  Building2,
  CheckCircle2,
  DollarSign,
  Scale,
  MinusCircle,
  X,
  Save,
  ArrowRight,
} from 'lucide-react';
import { useEstoqueStore, CATEGORIAS_ESTOQUE_NOMES } from '../store/useEstoqueStore';
import { CategoriaEstoque, ItemEstoque, RegistroCompra, FichaTecnica, Fornecedor } from '../types';

export default function Estoque() {
  const {
    itens,
    compras,
    fichasTecnicas,
    fornecedores,
    registrarSaidaManual,
    adicionarCompra,
    adicionarItemEstoque,
    adicionarFornecedor,
  } = useEstoqueStore();

  const [abaAtiva, setAbaAtiva] = useState<'estoque' | 'compras' | 'fichas' | 'fornecedores'>('estoque');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [busca, setBusca] = useState('');

  // Modais
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [modalNovaCompra, setModalNovaCompra] = useState(false);
  const [modalSaidaManual, setModalSaidaManual] = useState<ItemEstoque | null>(null);
  const [modalNovoFornecedor, setModalNovoFornecedor] = useState(false);
  const [qtdSaidaManual, setQtdSaidaManual] = useState(1);
  const [motivoSaidaManual, setMotivoSaidaManual] = useState('Uso operacional na limpeza');

  // Formulário Nova Compra
  const [formCompra, setFormCompra] = useState({
    produtoNome: 'Arroz Tipo 1 (Pacote 5kg)',
    categoria: 'alimentos' as CategoriaEstoque,
    fornecedorOuLocal: 'Supermercado Paranaíba',
    quantidade: 10,
    unidadeMedida: 'pct',
    precoTotal: 209.9,
    precoUnitario: 20.99,
  });

  // Formulário Novo Item
  const [formItem, setFormItem] = useState({
    nome: '',
    categoria: 'alimentos' as CategoriaEstoque,
    metodoControle: 'recorrente' as 'recorrente' | 'individual' | 'manual',
    quantidadeAtual: 10,
    unidadeMedida: 'un' as ItemEstoque['unidadeMedida'],
    consumoDiarioPrevisto: 1,
    estoqueMinimo: 5,
    estoqueIdeal: 20,
    precoCusto: 10.0,
    fornecedorHabitual: '',
  });

  // Formulário Novo Fornecedor
  const [formForn, setFormForn] = useState({
    nomeOuEmpresa: '',
    pessoaContato: '',
    telefone: '',
    email: '',
    cnpj: '',
    endereco: '',
    categoriaPrincipal: 'Alimentos e Insumos Gerais',
  });

  // Feedback Toast
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  function dispararToast(msg: string) {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(null), 3500);
  }

  // Filtro de Itens
  const itensFiltrados = itens.filter((item) => {
    const matchCat = categoriaFiltro === 'todas' || item.categoria === categoriaFiltro;
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const totalEmAlerta = itens.filter(
    (i) => i.statusDisponibilidade === 'esgotado' || i.statusDisponibilidade === 'esgotando'
  ).length;

  function handleSalvarNovaCompra(e: React.FormEvent) {
    e.preventDefault();
    adicionarCompra({
      data: new Date().toLocaleDateString('pt-BR'),
      produtoNome: formCompra.produtoNome,
      categoria: formCompra.categoria,
      fornecedorOuLocal: formCompra.fornecedorOuLocal,
      quantidade: Number(formCompra.quantidade),
      unidadeMedida: formCompra.unidadeMedida,
      precoTotal: Number(formCompra.precoTotal),
      precoUnitario: Number(formCompra.precoUnitario),
    });
    setModalNovaCompra(false);
    dispararToast(`Compra de ${formCompra.quantidade}x ${formCompra.produtoNome} registrada e estoque atualizado!`);
  }

  function handleConfirmarSaidaManual() {
    if (!modalSaidaManual) return;
    registrarSaidaManual(modalSaidaManual.id, Number(qtdSaidaManual), motivoSaidaManual);
    dispararToast(`Baixa de ${qtdSaidaManual} ${modalSaidaManual.unidadeMedida} de "${modalSaidaManual.nome}" realizada!`);
    setModalSaidaManual(null);
    setQtdSaidaManual(1);
  }

  function handleSalvarNovoItem(e: React.FormEvent) {
    e.preventDefault();
    adicionarItemEstoque({
      nome: formItem.nome,
      categoria: formItem.categoria,
      metodoControle: formItem.metodoControle,
      quantidadeAtual: Number(formItem.quantidadeAtual),
      unidadeMedida: formItem.unidadeMedida,
      consumoDiarioPrevisto: formItem.metodoControle === 'recorrente' ? Number(formItem.consumoDiarioPrevisto) : undefined,
      estoqueMinimo: Number(formItem.estoqueMinimo),
      estoqueIdeal: Number(formItem.estoqueIdeal),
      precoCusto: Number(formItem.precoCusto),
      statusDisponibilidade: 'disponivel',
      fornecedorHabitual: formItem.fornecedorHabitual || undefined,
    });
    setModalNovoItem(false);
    dispararToast(`Item "${formItem.nome}" cadastrado com sucesso no estoque!`);
  }

  function handleSalvarNovoFornecedor(e: React.FormEvent) {
    e.preventDefault();
    adicionarFornecedor(formForn);
    setModalNovoFornecedor(false);
    dispararToast(`Fornecedor "${formForn.nomeOuEmpresa}" cadastrado com sucesso!`);
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Estoque Inteligente & Compras</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Gestão Interna
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle automatizado de insumos recorrentes, bebidas por unidade e materiais operacionais sem burocracia.
            </p>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Total de Itens</span>
            <span className="text-sm font-black text-white font-mono">{itens.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Alertas de Reposição</span>
            <span className={`text-sm font-black font-mono ${totalEmAlerta > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalEmAlerta} itens
            </span>
          </div>

          <button
            onClick={() => setModalNovaCompra(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Registrar Compra</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {mensagemSucesso && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAbaAtiva('estoque')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'estoque'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Estoque por Seções ({itens.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('compras')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'compras'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Compras & Histórico de Preços</span>
        </button>

        <button
          onClick={() => setAbaAtiva('fichas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'fichas'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fichas Técnicas & Custo dos Pratos ({fichasTecnicas.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('fornecedores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'fornecedores'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Fornecedores Cadastrados ({fornecedores.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: VISÃO GERAL DO ESTOQUE                                  */}
      {/* ============================================================== */}
      {abaAtiva === 'estoque' && (
        <div className="space-y-4">
          {/* Barra de Filtro e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produto, insumo ou material..."
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="todas">Todas as Seções do Estoque</option>
                {Object.entries(CATEGORIAS_ESTOQUE_NOMES).map(([chave, rotulo]) => (
                  <option key={chave} value={chave}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setModalNovoItem(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Item no Estoque</span>
            </button>
          </div>

          {/* Tabela de Itens de Estoque */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item / Produto</th>
                    <th className="py-3 px-4">Seção</th>
                    <th className="py-3 px-4">Método de Controle</th>
                    <th className="py-3 px-4">Qtd Atual</th>
                    <th className="py-3 px-4">Mínimo / Ideal</th>
                    <th className="py-3 px-4">Disponibilidade</th>
                    <th className="py-3 px-4 text-right">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {itensFiltrados.map((item) => {
                    const isCritico = item.statusDisponibilidade === 'esgotado';
                    const isAtencao = item.statusDisponibilidade === 'esgotando';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm">{item.nome}</span>
                          <span className="text-[11px] text-slate-400">
                            Custo: R$ {item.precoCusto.toFixed(2)} / {item.unidadeMedida}
                            {item.fornecedorHabitual && ` • ${item.fornecedorHabitual}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold">
                            {CATEGORIAS_ESTOQUE_NOMES[item.categoria]}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.metodoControle === 'recorrente' && (
                            <span className="text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md font-bold block w-fit">
                              Consumo Previsto: {item.consumoDiarioPrevisto} {item.unidadeMedida}/dia
                            </span>
                          )}
                          {item.metodoControle === 'individual' && (
                            <span className="text-[10px] text-blue-300 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-md font-bold block w-fit">
                              Baixa Automática na Venda
                            </span>
                          )}
                          {item.metodoControle === 'manual' && (
                            <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-bold block w-fit">
                              Consumo Interno (Manual)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-sm">
                          <span className={isCritico ? 'text-rose-400' : isAtencao ? 'text-amber-400' : 'text-emerald-400'}>
                            {item.quantidadeAtual} {item.unidadeMedida}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          Min: {item.estoqueMinimo} • Ideal: {item.estoqueIdeal}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isCritico
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                : isAtencao
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.statusDisponibilidade}
                          </span>
                          {item.metodoControle === 'individual' && item.quantidadeAtual <= 5 && (
                            <span className="text-[9px] text-slate-500 block mt-0.5">Margem de segurança retida</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {item.metodoControle === 'manual' ? (
                            <button
                              onClick={() => {
                                setModalSaidaManual(item);
                                setQtdSaidaManual(1);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-600/30 hover:text-rose-300 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Baixa de Uso</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">Automático</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: COMPRAS & HISTÓRICO DE PREÇOS (SEÇÃO 1.10)              */}
      {/* ============================================================== */}
      {abaAtiva === 'compras' && (
        <div className="space-y-5">
          {/* Card Comparativo de Preços em Destaque (Seção 1.10) */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                Inteligência de Compras: Comparação de Preços entre Fornecedores
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O sistema monitora a variação do preço pago pelo mesmo produto em diferentes locais para você negociar melhor e economizar no abastecimento:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Exemplo Real de Variação</span>
                <p className="text-white font-bold text-sm">Arroz Tipo 1 (Pacote 5kg)</p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Supermercado BH (12/10):</span>
                  <span className="font-mono text-white font-bold">R$ 24,99 / pct</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">Supermercado Paranaíba (13/10):</span>
                  <span className="font-mono text-emerald-400 font-bold">R$ 20,99 / pct</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-emerald-400 font-bold flex items-center justify-between text-[11px]">
                  <span>Economia detectada:</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded font-mono">R$ 4,00 a menos por pacote (-16%)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rentabilidade em Bebidas (Unitário)</span>
                <p className="text-white font-bold text-sm">Cerveja Amstel Lager 350ml</p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Custo de Aquisição:</span>
                  <span className="font-mono text-white">R$ 3,50 / un</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Preço de Venda no PDV:</span>
                  <span className="font-mono text-emerald-400 font-bold">R$ 7,00 / un</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-purple-300 font-bold flex items-center justify-between text-[11px]">
                  <span>Margem Bruta Unitária:</span>
                  <span className="bg-purple-500/20 px-2 py-0.5 rounded font-mono">R$ 3,50 de resultado bruto (50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico Geral de Compras */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Registro de Compras Recentes</span>
              </h4>
              <button
                onClick={() => setModalNovaCompra(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Entrada</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Produto Adquirido</th>
                    <th className="py-3 px-4">Local / Fornecedor</th>
                    <th className="py-3 px-4">Quantidade</th>
                    <th className="py-3 px-4">Custo Unitário</th>
                    <th className="py-3 px-4 text-right">Valor Total Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {compras.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{c.data}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.produtoNome}</td>
                      <td className="py-3 px-4 text-slate-300">{c.fornecedorOuLocal}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {c.quantidade} {c.unidadeMedida}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        R$ {c.precoUnitario.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        R$ {c.precoTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: FICHAS TÉCNICAS & CUSTO DOS PRATOS (SEÇÃO 11 E 19)       */}
      {/* ============================================================== */}
      {abaAtiva === 'fichas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <ChefHat className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-300">
              <h4 className="font-extrabold text-white">Composição por Pesagem & Ficha Técnica</h4>
              <p>
                Cada prato calcula o custo somando os pesos em gramas dos ingredientes cadastrados no estoque. A cada pedido vendido, a baixa é automática nos insumos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fichasTecnicas.map((ft) => (
              <div key={ft.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-black text-white">{ft.nomePrato}</h4>
                    <span className="text-[11px] text-slate-400">Ficha Técnica ID: {ft.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Preço Venda</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      R$ {ft.precoVenda.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tabela de Componentes */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Componentes & Pesagem:</p>
                  <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800/80 space-y-1.5">
                    {ft.componentes.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span className="font-medium">{comp.ingredienteNome}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400">{comp.pesoGramas}g</span>
                          <span className="text-emerald-400">R$ {comp.custoTotalComponente.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo de Lucro Bruto e Margem */}
                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Custo Estimado Insumos:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      R$ {ft.custoTotalEstimado.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-purple-300 block font-bold">Margem Bruta Estimada:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {ft.margemBrutaPercentual.toFixed(1)}% (R$ {(ft.precoVenda - ft.custoTotalEstimado).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 4: FORNECEDORES CADASTRADOS (SEÇÃO 12.1)                   */}
      {abaAtiva === 'fornecedores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Contatos de Fornecedores & Supermercados</span>
            </h3>
            <button
              onClick={() => setModalNovoFornecedor(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Fornecedor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fornecedores.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-black text-white">{f.nomeOuEmpresa}</h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">{f.categoriaPrincipal}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{f.cnpj}</span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <p>👤 Contato: <strong>{f.pessoaContato}</strong></p>
                  <p>📞 WhatsApp: <strong className="text-emerald-400 font-mono">{f.telefone}</strong></p>
                  <p>✉️ E-mail: <span className="font-mono text-slate-400">{f.email}</span></p>
                  <p>📍 Endereço: <span className="text-slate-400">{f.endereco}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR COMPRA                                         */}
      {/* ============================================================== */}
      {modalNovaCompra && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Registrar Compra / Entrada no Estoque</span>
              </h3>
              <button onClick={() => setModalNovaCompra(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaCompra} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Produto Comprado</label>
                <input
                  type="text"
                  required
                  value={formCompra.produtoNome}
                  onChange={(e) => setFormCompra({ ...formCompra, produtoNome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Local / Fornecedor</label>
                  <input
                    type="text"
                    required
                    value={formCompra.fornecedorOuLocal}
                    onChange={(e) => setFormCompra({ ...formCompra, fornecedorOuLocal: e.target.value })}
                    placeholder="Ex: Supermercado BH"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Seção do Estoque</label>
                  <select
                    value={formCompra.categoria}
                    onChange={(e) => setFormCompra({ ...formCompra, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.entries(CATEGORIAS_ESTOQUE_NOMES).map(([chave, rotulo]) => (
                      <option key={chave} value={chave}>{rotulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formCompra.quantidade}
                    onChange={(e) => {
                      const q = parseFloat(e.target.value) || 0;
                      const u = formCompra.precoUnitario;
                      setFormCompra({ ...formCompra, quantidade: q, precoTotal: Number((q * u).toFixed(2)) });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unidade</label>
                  <select
                    value={formCompra.unidadeMedida}
                    onChange={(e) => setFormCompra({ ...formCompra, unidadeMedida: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="pct">Pacote (pct)</option>
                    <option value="kg">Quilo (kg)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="cx">Caixa (cx)</option>
                    <option value="frasco">Frasco (frasco)</option>
                    <option value="l">Litro (l)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCompra.precoUnitario}
                    onChange={(e) => {
                      const u = parseFloat(e.target.value) || 0;
                      const q = formCompra.quantidade;
                      setFormCompra({ ...formCompra, precoUnitario: u, precoTotal: Number((q * u).toFixed(2)) });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-slate-300">Valor Total da Compra:</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  R$ {formCompra.precoTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaCompra(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BAIXA MANUAL DE USO (LIMPEZA/BALCÃO - SEÇÃO 1.4.3)       */}
      {/* ============================================================== */}
      {modalSaidaManual && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MinusCircle className="w-4 h-4 text-rose-400" />
              <span>Baixa de Uso Interno</span>
            </h3>
            <p className="text-xs text-slate-400">
              Registrar consumo manual de <strong>{modalSaidaManual.nome}</strong>. Sem necessidade de frações ou pesagem.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Quantidade a retirar ({modalSaidaManual.unidadeMedida}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={qtdSaidaManual}
                  onChange={(e) => setQtdSaidaManual(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Finalidade / Motivo:</label>
                <input
                  type="text"
                  value={motivoSaidaManual}
                  onChange={(e) => setMotivoSaidaManual(e.target.value)}
                  placeholder="Ex: Limpeza do salão, Reposição de comandas..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setModalSaidaManual(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarSaidaManual}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO ITEM NO ESTOQUE                                    */}
      {/* ============================================================== */}
      {modalNovoItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Cadastrar Novo Item no Estoque</h3>
              <button onClick={() => setModalNovoItem(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoItem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={formItem.nome}
                  onChange={(e) => setFormItem({ ...formItem, nome: e.target.value })}
                  placeholder="Ex: Açúcar Refinado, Cerveja IPA, Buchas de Limpeza..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Seção do Estoque *</label>
                  <select
                    value={formItem.categoria}
                    onChange={(e) => setFormItem({ ...formItem, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {Object.entries(CATEGORIAS_ESTOQUE_NOMES).map(([chave, rotulo]) => (
                      <option key={chave} value={chave}>{rotulo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Método de Controle *</label>
                  <select
                    value={formItem.metodoControle}
                    onChange={(e) => setFormItem({ ...formItem, metodoControle: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="recorrente">Consumo Diário Previsto (Insumos)</option>
                    <option value="individual">Individual por Unidade (Bebidas)</option>
                    <option value="manual">Manual por Unidade (Limpeza / Balcão)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Quantidade Inicial</label>
                  <input
                    type="number"
                    value={formItem.quantidadeAtual}
                    onChange={(e) => setFormItem({ ...formItem, quantidadeAtual: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unidade de Medida</label>
                  <select
                    value={formItem.unidadeMedida}
                    onChange={(e) => setFormItem({ ...formItem, unidadeMedida: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="kg">kg (Quilo)</option>
                    <option value="pct">pct (Pacote)</option>
                    <option value="un">un (Unidade)</option>
                    <option value="cx">cx (Caixa)</option>
                    <option value="frasco">frasco (Frasco)</option>
                    <option value="l">l (Litro)</option>
                    <option value="g">g (Grama)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formItem.precoCusto}
                    onChange={(e) => setFormItem({ ...formItem, precoCusto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    value={formItem.estoqueMinimo}
                    onChange={(e) => setFormItem({ ...formItem, estoqueMinimo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Estoque Ideal</label>
                  <input
                    type="number"
                    value={formItem.estoqueIdeal}
                    onChange={(e) => setFormItem({ ...formItem, estoqueIdeal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoItem(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Salvar no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO FORNECEDOR                                         */}
      {/* ============================================================== */}
      {modalNovoFornecedor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white">Cadastrar Fornecedor</h3>
              <button onClick={() => setModalNovoFornecedor(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoFornecedor} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa / Fornecedor *</label>
                <input
                  type="text"
                  required
                  value={formForn.nomeOuEmpresa}
                  onChange={(e) => setFormForn({ ...formForn, nomeOuEmpresa: e.target.value })}
                  placeholder="Ex: Frigorífico Central, Distribuidora XYZ..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Pessoa de Contato</label>
                  <input
                    type="text"
                    value={formForn.pessoaContato}
                    onChange={(e) => setFormForn({ ...formForn, pessoaContato: e.target.value })}
                    placeholder="Ex: João Vendas"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    value={formForn.telefone}
                    onChange={(e) => setFormForn({ ...formForn, telefone: e.target.value })}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Categoria Principal</label>
                <input
                  type="text"
                  value={formForn.categoriaPrincipal}
                  onChange={(e) => setFormForn({ ...formForn, categoriaPrincipal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={formForn.endereco}
                  onChange={(e) => setFormForn({ ...formForn, endereco: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoFornecedor(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
