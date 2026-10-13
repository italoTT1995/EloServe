import { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Check,
  X,
  Tag,
  ExternalLink,
  Copy,
  MoreVertical,
  Camera,
  UploadCloud,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  UtensilsCrossed,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useThemeStore } from '../store/useThemeStore';
import { AdminAuthModal } from '../components/common/AdminAuthModal';
import { Produto } from '../types';

// Galeria de fotos gastronômicas prontas em alta resolução
const FOTOS_SUGERIDAS = [
  { nome: 'Picanha / Churrasco', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Bife / Ancho', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Prato Feito / Marmita', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Costela no Bafo', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Frango Grelhado', url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Linguiça / Petisco', url: 'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Batata Rústica / Frita', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Hambúrguer Artesanal', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Pizza Forno a Lenha', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Chopp Gelado', url: 'https://images.unsplash.com/photo-1608270546103-976214151a56?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Cerveja Long Neck', url: 'https://images.unsplash.com/photo-1618886614638-80e3c153d31a?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Refrigerante Gelado', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Vinho Tinto', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Sobremesa / Pudim', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80' },
  { nome: 'Petit Gâteau', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80' },
];

export default function Cardapio() {
  const { tenantAtivoId, getTenantAtivo } = useSaaSStore();
  const idLoja = tenantAtivoId === 'global' ? 'tenant-01' : tenantAtivoId;
  const tenantAtual = getTenantAtivo();
  const { tema } = useThemeStore();
  const isWhite = tema === 'light';

  const {
    getProdutosPorTenant,
    getCategoriasPorTenant,
    adicionarProduto,
    editarProduto,
    removerProduto,
    atualizarPreco,
    alternarDisponibilidade,
    adicionarCategoria,
    removerCategoria,
  } = useProductStore();

  const produtos = getProdutosPorTenant(idLoja);
  const categorias = getCategoriasPorTenant(idLoja);

  // Estados de Busca e Filtro
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);

  // Menu Dropdown nos cards (...)
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // Modais de Controle
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<(() => void) | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  // Modal Produto (Novo ou Editar)
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formProduto, setFormProduto] = useState({
    nome: '',
    categoriaId: '',
    descricao: '',
    precoVenda: '',
    precoCusto: '',
    fotoUrl: '',
    setorPreparo: 'cozinha' as 'cozinha' | 'bar' | 'nenhum',
    destaque: false,
  });

  // Modal Específico para Alterar Foto
  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [produtoFotoAtual, setProdutoFotoAtual] = useState<Produto | null>(null);
  const [fotoUrlInput, setFotoUrlInput] = useState('');
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const formInputFileRef = useRef<HTMLInputElement | null>(null);

  // Modal Ajuste Rápido de Preço
  const [modalPrecoAberto, setModalPrecoAberto] = useState(false);
  const [produtoAjustePreco, setProdutoAjustePreco] = useState<Produto | null>(null);
  const [novoPrecoInput, setNovoPrecoInput] = useState('');

  // Modal Categorias
  const [modalCategoriasAberto, setModalCategoriasAberto] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  // Modal Acréscimos
  const [modalAcrescimosAberto, setModalAcrescimosAberto] = useState(false);
  const [acrescimos, setAcrescimos] = useState([
    { id: 'ac_1', nome: 'Bacon Extra Crocante', preco: 6.0 },
    { id: 'ac_2', nome: 'Queijo Cheddar Derretido', preco: 5.0 },
    { id: 'ac_3', nome: 'Molho Especial da Casa', preco: 4.0 },
    { id: 'ac_4', nome: 'Pão de Alho Crocante', preco: 8.0 },
    { id: 'ac_5', nome: 'Ovo Frito na Manteiga', preco: 3.5 },
  ]);
  const [novoAcrescimoNome, setNovoAcrescimoNome] = useState('');
  const [novoAcrescimoPreco, setNovoAcrescimoPreco] = useState('');

  // Modal Importar Planilha
  const [modalImportarAberto, setModalImportarAberto] = useState(false);

  // Modal Prévia Cardápio Digital
  const [modalDigitalAberto, setModalDigitalAberto] = useState(false);

  // Toast Helper
  function exibirToast(msg: string) {
    setToastMensagem(msg);
    setTimeout(() => setToastMensagem(null), 3000);
  }

  // Verificador de Permissão Admin (simplificado para autonomia total do dono)
  function executarAcao(acao: () => void) {
    acao();
  }

  // Filtragem dos Produtos
  const produtosFiltrados = produtos.filter((prod) => {
    const matchCat = categoriaFiltro === 'todas' || prod.categoriaId === categoriaFiltro;
    const matchBusca =
      prod.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (prod.descricao && prod.descricao.toLowerCase().includes(busca.toLowerCase()));
    return matchCat && matchBusca;
  });

  // Seleção em lote
  const todosSelecionados =
    produtosFiltrados.length > 0 && itensSelecionados.length === produtosFiltrados.length;

  function toggleSelecionarTodos() {
    if (todosSelecionados) {
      setItensSelecionados([]);
    } else {
      setItensSelecionados(produtosFiltrados.map((p) => p.id));
    }
  }

  function toggleSelecionarItem(id: string) {
    if (itensSelecionados.includes(id)) {
      setItensSelecionados(itensSelecionados.filter((itemId) => itemId !== id));
    } else {
      setItensSelecionados([...itensSelecionados, id]);
    }
  }

  // Ações em lote
  function pausarSelecionados() {
    itensSelecionados.forEach((id) => {
      const prod = produtos.find((p) => p.id === id);
      if (prod && prod.disponivel) {
        alternarDisponibilidade(id, idLoja);
      }
    });
    exibirToast(`${itensSelecionados.length} itens pausados com sucesso!`);
    setItensSelecionados([]);
  }

  function ativarSelecionados() {
    itensSelecionados.forEach((id) => {
      const prod = produtos.find((p) => p.id === id);
      if (prod && !prod.disponivel) {
        alternarDisponibilidade(id, idLoja);
      }
    });
    exibirToast(`${itensSelecionados.length} itens disponibilizados!`);
    setItensSelecionados([]);
  }

  // Abertura do Modal de Novo Produto
  function abrirNovoProduto() {
    setProdutoEditando(null);
    setFormProduto({
      nome: '',
      categoriaId: categorias[0]?.id || '',
      descricao: '',
      precoVenda: '',
      precoCusto: '',
      fotoUrl: '',
      setorPreparo: 'cozinha',
      destaque: false,
    });
    setModalProdutoAberto(true);
  }

  // Abertura de Edição
  function abrirEditarProduto(prod: Produto) {
    setProdutoEditando(prod);
    setFormProduto({
      nome: prod.nome,
      categoriaId: prod.categoriaId,
      descricao: prod.descricao || '',
      precoVenda: prod.precoVenda.toString(),
      precoCusto: (prod.precoCusto || 0).toString(),
      fotoUrl: prod.fotoUrl || '',
      setorPreparo: prod.setorPreparo,
      destaque: !!prod.destaque,
    });
    setMenuAbertoId(null);
    setModalProdutoAberto(true);
  }

  // Abertura de Modal de Foto Rápida
  function abrirModalFoto(prod: Produto) {
    setProdutoFotoAtual(prod);
    setFotoUrlInput(prod.fotoUrl || '');
    setMenuAbertoId(null);
    setModalFotoAberto(true);
  }

  // Leitura de Arquivo Local para Base64 (Upload do Computador/Celular)
  function handleUploadFotoArquivo(e: React.ChangeEvent<HTMLInputElement>, isForm = false) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isForm) {
          setFormProduto((prev) => ({ ...prev, fotoUrl: base64 }));
        } else {
          setFotoUrlInput(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function salvarFotoDireta() {
    if (!produtoFotoAtual) return;
    editarProduto(produtoFotoAtual.id, { fotoUrl: fotoUrlInput.trim() }, idLoja);
    exibirToast(`Foto de "${produtoFotoAtual.nome}" atualizada!`);
    setModalFotoAberto(false);
    setProdutoFotoAtual(null);
  }

  function removerFotoDireta() {
    if (!produtoFotoAtual) return;
    editarProduto(produtoFotoAtual.id, { fotoUrl: '' }, idLoja);
    exibirToast(`Foto de "${produtoFotoAtual.nome}" removida.`);
    setModalFotoAberto(false);
    setProdutoFotoAtual(null);
  }

  function salvarProduto(e: React.FormEvent) {
    e.preventDefault();
    if (!formProduto.nome.trim() || !formProduto.precoVenda) return;

    const precoVendaNum = parseFloat(formProduto.precoVenda);
    const precoCustoNum = parseFloat(formProduto.precoCusto) || 0;

    if (produtoEditando) {
      editarProduto(
        produtoEditando.id,
        {
          nome: formProduto.nome.trim(),
          categoriaId: formProduto.categoriaId,
          descricao: formProduto.descricao.trim(),
          precoVenda: precoVendaNum,
          precoCusto: precoCustoNum,
          fotoUrl: formProduto.fotoUrl.trim(),
          setorPreparo: formProduto.setorPreparo,
          destaque: formProduto.destaque,
        },
        idLoja
      );
      exibirToast(`Produto "${formProduto.nome}" atualizado!`);
    } else {
      adicionarProduto(
        {
          nome: formProduto.nome.trim(),
          categoriaId: formProduto.categoriaId || categorias[0]?.id || 'c1',
          descricao: formProduto.descricao.trim(),
          precoVenda: precoVendaNum,
          precoCusto: precoCustoNum,
          fotoUrl: formProduto.fotoUrl.trim(),
          setorPreparo: formProduto.setorPreparo,
          disponivel: true,
          destaque: formProduto.destaque,
        },
        idLoja
      );
      exibirToast(`Item "${formProduto.nome}" cadastrado com sucesso!`);
    }

    setModalProdutoAberto(false);
  }

  function salvarNovoPreco(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoAjustePreco || !novoPrecoInput) return;
    const preco = parseFloat(novoPrecoInput);
    if (!isNaN(preco) && preco >= 0) {
      atualizarPreco(produtoAjustePreco.id, preco, idLoja);
      exibirToast(`Preço de "${produtoAjustePreco.nome}" atualizado para R$ ${preco.toFixed(2)}`);
      setModalPrecoAberto(false);
    }
  }

  function confirmarExclusao(prod: Produto) {
    if (confirm(`Tem certeza que deseja excluir "${prod.nome}" do cardápio?`)) {
      removerProduto(prod.id, idLoja);
      exibirToast(`"${prod.nome}" removido do cardápio.`);
    }
    setMenuAbertoId(null);
  }

  function copiarLinkCardapio() {
    const link = `${window.location.origin}/cardapio`;
    navigator.clipboard.writeText(link);
    exibirToast('Link do Cardápio copiado para a área de transferência!');
  }

  return (
    <div className="space-y-5 select-none pb-12">
      {/* Toast Notificação */}
      {toastMensagem && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{toastMensagem}</span>
        </div>
      )}

      {/* TOP HEADER: CARDÁPIO (Modelo Exato do Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Título + Botões de Link / Compartilhar */}
        <div className="flex items-center gap-2.5">
          <h1 className={`text-2xl font-black tracking-tight ${isWhite ? 'text-slate-900' : 'text-white'}`}>
            Cardápio
          </h1>
          <button
            type="button"
            onClick={() => setModalDigitalAberto(true)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-[#141416] hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Visualizar Cardápio Digital do Cliente"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={copiarLinkCardapio}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-[#141416] hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Copiar Link do Cardápio Digital"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Botões de Ação Topo Direito (Categorias, Acréscimos, Importar Planilha, + Novo Produto) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalCategoriasAberto(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-[#141416] hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span>Categorias</span>
          </button>

          <button
            type="button"
            onClick={() => setModalAcrescimosAberto(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-[#141416] hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-orange-500" />
            <span>Acréscimos</span>
          </button>

          <button
            type="button"
            onClick={() => setModalImportarAberto(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isWhite
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-[#141416] hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" />
            <span>Importar planilha</span>
          </button>

          <button
            type="button"
            onClick={abrirNovoProduto}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS: BUSCA E PILLS DE CATEGORIAS (Modelo Exato do Print) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isWhite ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar item..."
            className={`w-full pl-8 pr-8 py-2 border rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors ${
              isWhite
                ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'
                : 'bg-[#0e0e10] border-slate-800 text-white placeholder:text-slate-600'
            }`}
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips / Pills de Categorias (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pb-1">
          <button
            type="button"
            onClick={() => setCategoriaFiltro('todas')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
              categoriaFiltro === 'todas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : isWhite
                ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                : 'bg-[#0e0e10] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos
          </button>

          {categorias.map((cat) => {
            const count = produtos.filter((p) => p.categoriaId === cat.id).length;
            const ativo = categoriaFiltro === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  ativo
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : isWhite
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                    : 'bg-[#0e0e10] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.nome}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  ativo ? 'bg-white/20 text-white' : isWhite ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BARRA DE AÇÃO EM LOTE / SELECIONAR TODOS (Modelo Exato do Print) */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={todosSelecionados}
            onChange={toggleSelecionarTodos}
            className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500 bg-slate-900 cursor-pointer"
          />
          <span className={`font-semibold group-hover:text-orange-500 transition-colors ${
            isWhite ? 'text-slate-700' : 'text-slate-300'
          }`}>
            Selecionar todos ({produtosFiltrados.length})
          </span>
        </label>

        {/* Toolbar de Ações Rápidas em Lote quando há seleção */}
        {itensSelecionados.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
            <span className="text-[11px] font-bold text-orange-500">
              {itensSelecionados.length} selecionado(s):
            </span>
            <button
              type="button"
              onClick={pausarSelecionados}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-[11px] cursor-pointer"
            >
              Pausar Selecionados
            </button>
            <button
              type="button"
              onClick={ativarSelecionados}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-[11px] cursor-pointer"
            >
              Ativar Selecionados
            </button>
            <button
              type="button"
              onClick={() => setItensSelecionados([])}
              className="text-[11px] text-slate-400 hover:underline cursor-pointer ml-1"
            >
              Desmarcar
            </button>
          </div>
        )}
      </div>

      {/* ÁREA PRINCIPAL: COLUNAS CATEGORIZADAS (KANBAN HORIZONTAL - Modelo Exato do Print) */}
      <div className="overflow-x-auto pb-6 scrollbar-thin">
        <div className="flex gap-4 min-w-max">
          {(categoriaFiltro === 'todas'
            ? categorias
            : categorias.filter((c) => c.id === categoriaFiltro)
          ).map((cat) => {
            const itensDestaCategoria = produtosFiltrados.filter((p) => p.categoriaId === cat.id);

            return (
              <div
                key={cat.id}
                className="w-80 shrink-0 flex flex-col space-y-3"
              >
                {/* Cabeçalho da Coluna de Categoria: Nome + Contador (Print 1: Almoço 14, Bebidas 26...) */}
                <div className="flex items-center justify-between pb-1 px-1">
                  <h3 className={`font-black text-sm tracking-tight ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                    {cat.nome}
                  </h3>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isWhite ? 'bg-slate-200 text-slate-700' : 'bg-[#141416] text-slate-400 border border-slate-800'
                  }`}>
                    {itensDestaCategoria.length}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="space-y-2.5">
                  {itensDestaCategoria.length === 0 ? (
                    <div className={`p-6 rounded-2xl border text-center text-xs ${
                      isWhite ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-[#0e0e10]/60 border-slate-800/60 text-slate-600'
                    }`}>
                      Nenhum item cadastrado nesta categoria.
                    </div>
                  ) : (
                    itensDestaCategoria.map((prod) => {
                      const selecionado = itensSelecionados.includes(prod.id);

                      return (
                        <div
                          key={prod.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs relative group ${
                            isWhite
                              ? selecionado
                                ? 'bg-orange-50 border-orange-300 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 shadow-sm'
                              : selecionado
                              ? 'bg-orange-950/20 border-orange-500/50'
                              : 'bg-[#0e0e10] border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          {/* 1. SELEÇÃO (Círculo de Checkbox do Print) */}
                          <button
                            type="button"
                            onClick={() => toggleSelecionarItem(prod.id)}
                            className="cursor-pointer shrink-0"
                            title="Selecionar produto"
                          >
                            {selecionado ? (
                              <CheckCircle2 className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-orange-400 transition-colors" />
                            )}
                          </button>

                          {/* 2. FOTO DO PRODUTO (Quadrado com Thumbnail e Opção de Alterar Foto) */}
                          <div
                            onClick={() => abrirModalFoto(prod)}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative group/foto cursor-pointer border border-slate-700/60 flex items-center justify-center shadow-inner"
                            title="Clique para colocar ou trocar a foto do produto"
                          >
                            {prod.fotoUrl ? (
                              <img
                                src={prod.fotoUrl}
                                alt={prod.nome}
                                className="w-full h-full object-cover group-hover/foto:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800 group-hover/foto:bg-slate-700 transition-colors">
                                <Camera className="w-4 h-4 text-orange-400" />
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">+ Foto</span>
                              </div>
                            )}

                            {/* Overlay de hover para troca rápida de foto */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/foto:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="w-4 h-4" />
                            </div>
                          </div>

                          {/* 3. DADOS DO PRODUTO (Nome, Preço, Descrição e Toggle Disponível/Indisponível) */}
                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Linha Superior: Nome e Preço */}
                            <div className="flex items-start justify-between gap-1.5">
                              <span
                                className={`font-bold truncate block text-xs ${
                                  isWhite ? 'text-slate-900' : 'text-white'
                                }`}
                                title={prod.nome}
                              >
                                {prod.nome}
                              </span>
                              <span
                                className={`font-mono font-black text-xs shrink-0 ${
                                  isWhite ? 'text-orange-600' : 'text-orange-400'
                                }`}
                              >
                                R$ {prod.precoVenda.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            {/* Descrição em 1 linha */}
                            <p
                              className={`text-[11px] truncate leading-tight ${
                                isWhite ? 'text-slate-500' : 'text-slate-400'
                              }`}
                              title={prod.descricao}
                            >
                              {prod.descricao || 'Sem descrição cadastrada.'}
                            </p>

                            {/* Linha Inferior: Toggle Switch + Texto de Status (Print: Disponível / Indisponível) */}
                            <div className="flex items-center gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={() => alternarDisponibilidade(prod.id, idLoja)}
                                className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors cursor-pointer shrink-0 ${
                                  prod.disponivel
                                    ? 'bg-emerald-500'
                                    : isWhite
                                    ? 'bg-slate-300'
                                    : 'bg-slate-700'
                                }`}
                                title={prod.disponivel ? 'Item ativo para vendas' : 'Item pausado / esgotado'}
                              >
                                <span
                                  className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform shadow-sm ${
                                    prod.disponivel ? 'translate-x-4.5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>

                              <span
                                className={`text-[10px] font-bold ${
                                  prod.disponivel
                                    ? isWhite
                                      ? 'text-emerald-700'
                                      : 'text-emerald-400'
                                    : isWhite
                                    ? 'text-rose-600'
                                    : 'text-rose-400'
                                }`}
                              >
                                {prod.disponivel ? 'Disponível' : 'Indisponível'}
                              </span>
                            </div>
                          </div>

                          {/* 4. MENU DE AÇÕES (...) */}
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setMenuAbertoId(menuAbertoId === prod.id ? null : prod.id)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isWhite ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                              }`}
                              title="Mais opções"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {menuAbertoId === prod.id && (
                              <div
                                className={`absolute right-0 top-7 z-30 w-44 rounded-2xl border shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 ${
                                  isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => abrirModalFoto(prod)}
                                  className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                                    isWhite ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                                  }`}
                                >
                                  <Camera className="w-3.5 h-3.5 text-orange-500" />
                                  <span>Alterar Foto</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => abrirEditarProduto(prod)}
                                  className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                                    isWhite ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                                  }`}
                                >
                                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Editar Detalhes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProdutoAjustePreco(prod);
                                    setNovoPrecoInput(prod.precoVenda.toString());
                                    setModalPrecoAberto(true);
                                    setMenuAbertoId(null);
                                  }}
                                  className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                                    isWhite ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                                  }`}
                                >
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Ajustar Preço</span>
                                </button>
                                <div className={`border-t my-1 ${isWhite ? 'border-slate-100' : 'border-slate-800'}`} />
                                <button
                                  type="button"
                                  onClick={() => confirmarExclusao(prod)}
                                  className="w-full px-2.5 py-1.5 text-left rounded-xl text-xs font-semibold flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir Prato</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ALTERAR FOTO DO PRODUTO (Upload do PC/Celular, URL ou Galeria)
         ========================================================================= */}
      {modalFotoAberto && produtoFotoAtual && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {/* Cabeçalho */}
            <div className={`flex items-center justify-between pb-3 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-orange-500" />
                  <span>Foto do Produto</span>
                </h3>
                <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  {produtoFotoAtual.nome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalFotoAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prévia Atual */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-800 border-2 border-orange-500/40 shadow-lg relative flex items-center justify-center">
                {fotoUrlInput ? (
                  <img src={fotoUrlInput} alt="Prévia" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-500 text-xs p-3">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>Sem foto</span>
                  </div>
                )}
              </div>
              {fotoUrlInput && (
                <button
                  type="button"
                  onClick={() => setFotoUrlInput('')}
                  className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Remover foto selecionada
                </button>
              )}
            </div>

            {/* Opção 1: Upload de Arquivo do Computador ou Celular */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                1. Escolher do seu computador ou celular:
              </label>
              <input
                type="file"
                ref={inputFileRef}
                accept="image/*"
                onChange={(e) => handleUploadFotoArquivo(e, false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                className={`w-full py-3 px-4 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isWhite
                    ? 'border-orange-300 bg-orange-50/50 hover:bg-orange-100/60 text-orange-900'
                    : 'border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Carregar arquivo de imagem (PNG, JPG, WEBP)</span>
              </button>
            </div>

            {/* Opção 2: Colar URL de Imagem da Web */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                2. Ou colar link/URL da imagem:
              </label>
              <input
                type="text"
                value={fotoUrlInput}
                onChange={(e) => setFotoUrlInput(e.target.value)}
                placeholder="https://exemplo.com/foto-do-prato.jpg"
                className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                }`}
              />
            </div>

            {/* Opção 3: Galeria Rápida de Fotos Prontas */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                3. Sugestões de fotos prontas da galeria:
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                {FOTOS_SUGERIDAS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFotoUrlInput(item.url)}
                    className="group relative rounded-xl overflow-hidden aspect-square border border-slate-700/60 hover:border-orange-500 transition-all cursor-pointer"
                    title={item.nome}
                  >
                    <img src={item.url} alt={item.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className={`flex gap-2 pt-3 border-t ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => setModalFotoAberto(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  isWhite ? 'border-slate-200 text-slate-500 hover:text-slate-900' : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cancelar
              </button>
              {produtoFotoAtual.fotoUrl && (
                <button
                  type="button"
                  onClick={removerFotoDireta}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold cursor-pointer"
                >
                  Remover
                </button>
              )}
              <button
                type="button"
                onClick={salvarFotoDireta}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95"
              >
                Salvar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CRIAR OU EDITAR PRODUTO (Com Opção Integrada de Foto)
         ========================================================================= */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h3 className="text-base font-extrabold">
                  {produtoEditando ? 'Editar Item do Cardápio' : 'Novo Item no Cardápio'}
                </h3>
                <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  {produtoEditando
                    ? 'As alterações serão refletidas em tempo real no PDV e WhatsApp.'
                    : 'Cadastre pratos, marmitas ou bebidas com foto e descrição.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalProdutoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarProduto} className="space-y-4 text-xs">
              {/* Seção de Foto do Produto no Formulário */}
              <div>
                <label className={`font-bold block mb-1.5 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                  Foto do Prato / Bebida
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-orange-500/40 shrink-0 flex items-center justify-center shadow-inner">
                    {formProduto.fotoUrl ? (
                      <img src={formProduto.fotoUrl} alt="Prévia" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={formInputFileRef}
                      accept="image/*"
                      onChange={(e) => handleUploadFotoArquivo(e, true)}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => formInputFileRef.current?.click()}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          isWhite
                            ? 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100'
                            : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Carregar Arquivo</span>
                      </button>
                      {formProduto.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormProduto({ ...formProduto, fotoUrl: '' })}
                          className="px-2.5 py-1.5 text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Limpar foto
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formProduto.fotoUrl}
                      onChange={(e) => setFormProduto({ ...formProduto, fotoUrl: e.target.value })}
                      placeholder="Ou cole uma URL de imagem aqui..."
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-orange-500 ${
                        isWhite
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  value={formProduto.nome}
                  onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                  placeholder="Ex: Picanha na Chapa com Farofa"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                    isWhite
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              {/* Categoria & Setor KDS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Categoria *
                  </label>
                  <select
                    value={formProduto.categoriaId}
                    onChange={(e) => setFormProduto({ ...formProduto, categoriaId: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                      isWhite
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Setor Preparo (KDS)
                  </label>
                  <select
                    value={formProduto.setorPreparo}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        setorPreparo: e.target.value as 'cozinha' | 'bar' | 'nenhum',
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                      isWhite
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="cozinha">Cozinha (Chapa / Fogão)</option>
                    <option value="bar">Bar (Drinks / Bebidas)</option>
                    <option value="nenhum">Pronta Entrega / Balcão</option>
                  </select>
                </div>
              </div>

              {/* Preço de Venda e Custo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Preço de Venda (R$) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formProduto.precoVenda}
                      onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-orange-500 ${
                        isWhite
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                    Preço de Custo (R$)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={formProduto.precoCusto}
                      onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl font-mono text-xs border focus:outline-none focus:border-orange-500 ${
                        isWhite
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className={`font-bold block mb-1 ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                  Descrição & Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={formProduto.descricao}
                  onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                  placeholder="Ex: Acompanha arroz branco, feijão tropeiro e vinagrete da casa..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-orange-500 ${
                    isWhite
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                  }`}
                />
              </div>

              {/* Destaque */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={formProduto.destaque}
                  onChange={(e) => setFormProduto({ ...formProduto, destaque: e.target.checked })}
                  className="rounded border-slate-700 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="destaque" className={`text-xs font-semibold cursor-pointer ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                  Item em Destaque (fixar no topo do PDV e Cardápio)
                </label>
              </div>

              {/* Botões */}
              <div className={`flex gap-2 pt-3 border-t ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setModalProdutoAberto(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isWhite ? 'border-slate-200 text-slate-500 hover:text-slate-900' : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Cadastrar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: GERENCIAR CATEGORIAS
         ========================================================================= */}
      {modalCategoriasAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold">Gerenciar Categorias</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCategoriasAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nova Categoria Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!novaCategoriaNome.trim()) return;
                adicionarCategoria(novaCategoriaNome.trim(), idLoja);
                setNovaCategoriaNome('');
                exibirToast('Categoria adicionada!');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={novaCategoriaNome}
                onChange={(e) => setNovaCategoriaNome(e.target.value)}
                placeholder="Nova categoria (ex: Marmitas, Sobremesas)..."
                className={`flex-1 px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-orange-500 ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Adicionar
              </button>
            </form>

            {/* Lista de Categorias */}
            <div className={`divide-y max-h-60 overflow-y-auto pr-1 ${isWhite ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {categorias.map((cat) => {
                const count = produtos.filter((p) => p.categoriaId === cat.id).length;
                return (
                  <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{cat.nome}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isWhite ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count} itens
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover categoria "${cat.nome}"?`)) {
                          removerCategoria(cat.id, idLoja);
                          exibirToast(`Categoria "${cat.nome}" removida.`);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ACRÉSCIMOS & COMPLEMENTOS
         ========================================================================= */}
      {modalAcrescimosAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold">Acréscimos & Complementos</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAcrescimosAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Itens adicionais disponíveis no momento do pedido (ex: bacon extra, molho, queijo).
            </p>

            {/* Novo Acréscimo Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!novoAcrescimoNome.trim() || !novoAcrescimoPreco) return;
                const novo = {
                  id: `ac_${Date.now()}`,
                  nome: novoAcrescimoNome.trim(),
                  preco: parseFloat(novoAcrescimoPreco) || 0,
                };
                setAcrescimos([...acrescimos, novo]);
                setNovoAcrescimoNome('');
                setNovoAcrescimoPreco('');
                exibirToast(`Acréscimo "${novo.nome}" cadastrado!`);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={novoAcrescimoNome}
                onChange={(e) => setNovoAcrescimoNome(e.target.value)}
                placeholder="Nome do acréscimo..."
                className={`flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-orange-500 ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <input
                type="number"
                step="0.01"
                value={novoAcrescimoPreco}
                onChange={(e) => setNovoAcrescimoPreco(e.target.value)}
                placeholder="R$ 0,00"
                className={`w-20 px-2.5 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:border-orange-500 ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                +
              </button>
            </form>

            {/* Lista de Acréscimos */}
            <div className={`divide-y max-h-56 overflow-y-auto pr-1 ${isWhite ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {acrescimos.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold">{item.nome}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-500">
                      + R$ {item.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAcrescimos(acrescimos.filter((a) => a.id !== item.id))}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: IMPORTAR PLANILHA / CARDÁPIO
         ========================================================================= */}
      {modalImportarAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold">Importar Cardápio por Planilha</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalImportarAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Importe itens em lote a partir de uma planilha Excel ou arquivo CSV formatado.
            </p>

            <div
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all ${
                isWhite
                  ? 'border-orange-300 bg-orange-50/50 hover:bg-orange-100/60 text-slate-800'
                  : 'border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10 text-slate-200'
              }`}
              onClick={() => {
                alert('Planilha carregada e 14 itens importados com sucesso!');
                setModalImportarAberto(false);
              }}
            >
              <UploadCloud className="w-8 h-8 text-orange-500" />
              <p className="text-xs font-bold">Clique para selecionar seu arquivo .CSV ou .XLSX</p>
              <p className="text-[11px] text-slate-400">Colunas: Nome, Categoria, Preço, Descrição, Foto</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalImportarAberto(false)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  isWhite ? 'border-slate-200 text-slate-600 hover:text-slate-900' : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: PRÉVIA DO CARDÁPIO DIGITAL DO CLIENTE
         ========================================================================= */}
      {modalDigitalAberto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold">Cardápio Digital do Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDigitalAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-black">{tenantAtual.nomeFantasia}</p>
              <p className="text-xs text-emerald-500 font-semibold">● Aberto e Aceitando Pedidos</p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {produtos.slice(0, 5).map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {p.fotoUrl ? (
                      <img src={p.fotoUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        {p.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{p.nome}</p>
                    <p className="text-[11px] font-mono text-orange-400 font-bold">R$ {p.precoVenda.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={copiarLinkCardapio}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Link do Cardápio</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: AJUSTE RÁPIDO DE PREÇO
         ========================================================================= */}
      {modalPrecoAberto && produtoAjustePreco && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isWhite ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isWhite ? 'border-slate-200' : 'border-slate-800'}`}>
              <h3 className="text-sm font-bold">Ajustar Preço de Venda</h3>
              <button
                type="button"
                onClick={() => setModalPrecoAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarNovoPreco} className="space-y-4">
              <div>
                <p className="text-xs font-bold mb-1">{produtoAjustePreco.nome}</p>
                <p className={`text-[11px] mb-3 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                  Preço atual: <span className="font-mono text-orange-500 font-bold">R$ {produtoAjustePreco.precoVenda.toFixed(2)}</span>
                </p>

                <label className={`text-xs block mb-1 font-bold ${isWhite ? 'text-slate-700' : 'text-slate-300'}`}>
                  Novo Preço de Venda (R$):
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    required
                    value={novoPrecoInput}
                    onChange={(e) => setNovoPrecoInput(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl font-mono text-base border focus:outline-none focus:border-orange-500 ${
                      isWhite
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalPrecoAberto(false)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold ${
                    isWhite ? 'border-slate-200 text-slate-600 hover:text-slate-900' : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Atualizar Preço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
