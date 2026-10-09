import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  DollarSign,
  UtensilsCrossed,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  Tag,
  ChefHat,
  Star,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useAppStore } from '../store/useAppStore';
import { AdminAuthModal } from '../components/common/AdminAuthModal';
import { Produto } from '../types';

export default function Cardapio() {
  const {
    produtos,
    categorias,
    adicionarProduto,
    editarProduto,
    removerProduto,
    atualizarPreco,
    alternarDisponibilidade,
    adicionarCategoria,
    removerCategoria,
  } = useProductStore();

  const { perfilAtivo } = useAppStore();

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  // Modais de Controle
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<(() => void) | null>(null);

  // Modal Produto (Novo ou Editar)
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formProduto, setFormProduto] = useState({
    nome: '',
    categoriaId: '',
    descricao: '',
    precoVenda: '',
    precoCusto: '',
    setorPreparo: 'cozinha' as 'cozinha' | 'bar' | 'nenhum',
    destaque: false,
  });

  // Modal Ajuste Rápido de Preço
  const [modalPrecoAberto, setModalPrecoAberto] = useState(false);
  const [produtoAjustePreco, setProdutoAjustePreco] = useState<Produto | null>(null);
  const [novoPrecoInput, setNovoPrecoInput] = useState('');

  // Modal Categorias
  const [modalCategoriasAberto, setModalCategoriasAberto] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  // Verificador de Permissão Admin
  function executarComAdmin(acao: () => void) {
    if (perfilAtivo === 'admin') {
      acao();
    } else {
      setAcaoPendente(() => acao);
      setModalAuthAberto(true);
    }
  }

  // Abertura de Modais
  function abrirNovoProduto() {
    executarComAdmin(() => {
      setProdutoEditando(null);
      setFormProduto({
        nome: '',
        categoriaId: categorias[0]?.id || '',
        descricao: '',
        precoVenda: '',
        precoCusto: '',
        setorPreparo: 'cozinha',
        destaque: false,
      });
      setModalProdutoAberto(true);
    });
  }

  function abrirEditarProduto(prod: Produto) {
    executarComAdmin(() => {
      setProdutoEditando(prod);
      setFormProduto({
        nome: prod.nome,
        categoriaId: prod.categoriaId,
        descricao: prod.descricao || '',
        precoVenda: prod.precoVenda.toString(),
        precoCusto: (prod.precoCusto || 0).toString(),
        setorPreparo: prod.setorPreparo,
        destaque: !!prod.destaque,
      });
      setModalProdutoAberto(true);
    });
  }

  function abrirAjustePreco(prod: Produto) {
    executarComAdmin(() => {
      setProdutoAjustePreco(prod);
      setNovoPrecoInput(prod.precoVenda.toString());
      setModalPrecoAberto(true);
    });
  }

  function confirmarExclusao(prod: Produto) {
    executarComAdmin(() => {
      if (confirm(`Tem certeza que deseja EXCLUIR o item "${prod.nome}" do cardápio e do PDV?`)) {
        removerProduto(prod.id);
      }
    });
  }

  function salvarProduto(e: React.FormEvent) {
    e.preventDefault();
    if (!formProduto.nome.trim() || !formProduto.precoVenda) return;

    const precoVendaNum = parseFloat(formProduto.precoVenda);
    const precoCustoNum = parseFloat(formProduto.precoCusto) || 0;

    if (produtoEditando) {
      editarProduto(produtoEditando.id, {
        nome: formProduto.nome.trim(),
        categoriaId: formProduto.categoriaId,
        descricao: formProduto.descricao.trim(),
        precoVenda: precoVendaNum,
        precoCusto: precoCustoNum,
        setorPreparo: formProduto.setorPreparo,
        destaque: formProduto.destaque,
      });
    } else {
      adicionarProduto({
        nome: formProduto.nome.trim(),
        categoriaId: formProduto.categoriaId || categorias[0]?.id || 'c1',
        descricao: formProduto.descricao.trim(),
        precoVenda: precoVendaNum,
        precoCusto: precoCustoNum,
        setorPreparo: formProduto.setorPreparo,
        disponivel: true,
        destaque: formProduto.destaque,
      });
    }

    setModalProdutoAberto(false);
  }

  function salvarNovoPreco(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoAjustePreco || !novoPrecoInput) return;
    const preco = parseFloat(novoPrecoInput);
    if (!isNaN(preco) && preco >= 0) {
      atualizarPreco(produtoAjustePreco.id, preco);
      setModalPrecoAberto(false);
    }
  }

  function salvarNovaCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;
    adicionarCategoria(novaCategoriaNome.trim());
    setNovaCategoriaNome('');
  }

  // Filtragem
  const produtosFiltrados = produtos.filter((prod) => {
    const matchCat = categoriaFiltro === 'todas' || prod.categoriaId === categoriaFiltro;
    const matchBusca =
      prod.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (prod.descricao && prod.descricao.toLowerCase().includes(busca.toLowerCase()));
    return matchCat && matchBusca;
  });

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-white">Engenharia de Cardápio & Autonomia de Preços</h2>
            {perfilAtivo === 'admin' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Permissão de Administrador Ativa
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                Modo Restrito (Exige PIN Admin)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre novos itens, altere preços e pause pratos. Todas as alterações refletem instantaneamente na Frente de Caixa (PDV).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => executarComAdmin(() => setModalCategoriasAberto(true))}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-slate-400" />
            <span>Categorias ({categorias.length})</span>
          </button>

          <button
            onClick={abrirNovoProduto}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item no Cardápio</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prato, bebida ou ingrediente..."
            className="w-full pl-11 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoriaFiltro('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              categoriaFiltro === 'todas'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({produtos.length})
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoriaFiltro === cat.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-5">Produto</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4">Preço de Venda</th>
              <th className="py-3.5 px-4">Custo Est.</th>
              <th className="py-3.5 px-4">Setor KDS</th>
              <th className="py-3.5 px-4">Disponibilidade</th>
              <th className="py-3.5 px-5 text-right">Ações de Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                  Nenhum produto encontrado com o filtro atual.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((item) => {
                const categoriaNome =
                  categorias.find((c) => c.id === item.categoriaId)?.nome || 'Geral';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{item.nome}</span>
                            {item.destaque && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            )}
                          </div>
                          {item.descricao && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                              {item.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold text-[11px]">
                        {categoriaNome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => abrirAjustePreco(item)}
                        title="Clique para ajustar o preço"
                        className="group flex items-center gap-1.5 font-mono font-black text-emerald-400 text-sm hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <span>R$ {item.precoVenda.toFixed(2)}</span>
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      R$ {(item.precoCusto || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 uppercase tracking-wider text-slate-300">
                        {item.setorPreparo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => executarComAdmin(() => alternarDisponibilidade(item.id))}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          item.disponivel
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.disponivel ? 'Ativo no PDV' : 'Pausado'}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => abrirEditarProduto(item)}
                        title="Editar Produto Completo"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmarExclusao(item)}
                        title="Excluir Item do Cardápio"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Criar ou Editar Produto */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {produtoEditando ? 'Editar Item do Cardápio' : 'Novo Item no Cardápio'}
                </h3>
                <p className="text-xs text-slate-400">
                  {produtoEditando
                    ? 'As atualizações refletirão imediatamente na Frente de Caixa.'
                    : 'Cadastre o prato ou bebida para começar a vender.'}
                </p>
              </div>
              <button
                onClick={() => setModalProdutoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarProduto} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={formProduto.nome}
                  onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                  placeholder="Ex: EloBurger Trufado com Queijo Brie"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Categoria *</label>
                  <select
                    value={formProduto.categoriaId}
                    onChange={(e) => setFormProduto({ ...formProduto, categoriaId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Setor de Preparo (KDS)</label>
                  <select
                    value={formProduto.setorPreparo}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        setorPreparo: e.target.value as 'cozinha' | 'bar' | 'nenhum',
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cozinha">Cozinha (Chapa / Forno)</option>
                    <option value="bar">Bar (Drinks / Bebidas)</option>
                    <option value="nenhum">Nenhum (Balcão / Pronta Entrega)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Preço de Venda (R$) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formProduto.precoVenda}
                      onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Preço de Custo (R$)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={formProduto.precoCusto}
                      onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Descrição / Ingredientes</label>
                <textarea
                  rows={2}
                  value={formProduto.descricao}
                  onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                  placeholder="Descreva os ingredientes para ajudar o atendente e o cliente..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={formProduto.destaque}
                  onChange={(e) => setFormProduto({ ...formProduto, destaque: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="destaque" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Destacar este produto no topo do PDV
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalProdutoAberto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Cadastrar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ajuste Rápido de Preço */}
      {modalPrecoAberto && produtoAjustePreco && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Ajustar Preço de Venda</h3>
              <button
                onClick={() => setModalPrecoAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvarNovoPreco} className="space-y-4">
              <div>
                <p className="text-xs text-slate-300 font-bold mb-1">{produtoAjustePreco.nome}</p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Preço atual: <span className="font-mono text-emerald-400 font-bold">R$ {produtoAjustePreco.precoVenda.toFixed(2)}</span>
                </p>

                <label className="text-xs text-slate-300 block mb-1">Novo Preço de Venda (R$):</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    required
                    value={novoPrecoInput}
                    onChange={(e) => setNovoPrecoInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-base text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalPrecoAberto(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Atualizar Preço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Gerenciar Categorias */}
      {modalCategoriasAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Gerenciar Categorias</h3>
              <button
                onClick={() => setModalCategoriasAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nova Categoria Form */}
            <form onSubmit={salvarNovaCategoria} className="flex gap-2">
              <input
                type="text"
                value={novaCategoriaNome}
                onChange={(e) => setNovaCategoriaNome(e.target.value)}
                placeholder="Nome da nova categoria (ex: Petiscos)..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl"
              >
                Adicionar
              </button>
            </form>

            {/* Lista de Categorias */}
            <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {categorias.map((cat) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat.nome}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remover categoria "${cat.nome}"?`)) {
                        removerCategoria(cat.id);
                      }
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autenticação Admin */}
      <AdminAuthModal
        isOpen={modalAuthAberto}
        onClose={() => setModalAuthAberto(false)}
        onSuccess={() => {
          if (acaoPendente) {
            acaoPendente();
            setAcaoPendente(null);
          }
        }}
        actionTitle="Somente o Administrador do produto tem permissão para cadastrar, editar itens ou alterar preços."
      />
    </div>
  );
}
