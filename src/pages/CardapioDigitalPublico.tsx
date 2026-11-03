import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  X,
  Share2,
  Check,
  ChefHat,
  MessageSquare,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { Produto } from '../types';

export default function CardapioDigitalPublico() {
  const { tenantId } = useParams<{ tenantId?: string }>();
  const [searchParams] = useSearchParams();
  const queryTenant = searchParams.get('loja') || searchParams.get('tenant') || tenantId;

  const { getTenantAtivo, tenants } = useSaaSStore();
  const { getProdutosPorTenant, getCategoriasPorTenant } = useProductStore();

  const idAlvo = queryTenant || (getTenantAtivo()?.id && getTenantAtivo()?.id !== 'global' ? getTenantAtivo()?.id : 'tenant-01') || 'tenant-01';
  const tenantAtual = tenants.find((t) => t.id === idAlvo) || getTenantAtivo();

  const produtos = getProdutosPorTenant(idAlvo);
  const categorias = getCategoriasPorTenant(idAlvo);

  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [produtoModal, setProdutoModal] = useState<Produto | null>(null);
  const [copiadoLink, setCopiadoLink] = useState(false);

  // Filtro de produtos
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      if (!p.disponivel) return false;
      const matchCategoria = categoriaAtiva === 'todas' || p.categoriaId === categoriaAtiva;
      const matchBusca =
        !busca ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()));
      return matchCategoria && matchBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  const produtosDestaque = useMemo(() => {
    return produtos.filter((p) => p.destaque && p.disponivel);
  }, [produtos]);

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: `Cardápio Digital — ${tenantAtual?.nomeFantasia || 'EloServe'}`,
        text: 'Confira nosso cardápio completo e faça seu pedido!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 3000);
    }
  };

  const handlePedirWhatsApp = (produto: Produto) => {
    const tel = (tenantAtual?.telefoneWhatsApp || '').replace(/\D/g, '');
    const msg = `Olá! Vi o prato *${produto.nome}* (R$ ${produto.precoVenda.toFixed(2)}) no cardápio digital e gostaria de fazer um pedido!`;
    const url = tel
      ? `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Header Institucional do Restaurante */}
      <header className="relative bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-950 border-b border-slate-800/80 pt-6 pb-5 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-orange-500/20">
                {tenantAtual?.nomeFantasia ? tenantAtual.nomeFantasia.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">
                  {tenantAtual?.nomeFantasia || 'Cardápio Digital Oficial'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{tenantAtual?.cidadeUf || 'Brasil'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCompartilhar}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Compartilhar Cardápio"
            >
              {copiadoLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiadoLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>

          {/* Badges de Destaque */}
          <div className="flex items-center gap-2 text-[11px] flex-wrap pt-1">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Aberto Agora</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Cardápio 100% Digital</span>
            </span>
            {tenantAtual?.telefoneWhatsApp && (
              <a
                href={`https://wa.me/55${tenantAtual.telefoneWhatsApp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp: {tenantAtual.telefoneWhatsApp}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4 pb-24">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar pratos, bebidas, porções..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barra de Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              categoriaAtiva === 'todas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🍽️ Todos os Itens
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                categoriaAtiva === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Destaques (se não estiver filtrando por busca) */}
        {!busca && categoriaAtiva === 'todas' && produtosDestaque.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Destaques da Casa</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {produtosDestaque.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setProdutoModal(p)}
                  className="p-3 bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                >
                  {p.fotoUrl ? (
                    <img
                      src={p.fotoUrl}
                      alt={p.nome}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mb-2">
                      <ChefHat className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-xs text-white line-clamp-1">{p.nome}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.descricao}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400 font-mono mt-2">
                    R$ {p.precoVenda.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listagem Completa de Produtos */}
        <div className="space-y-2.5 pt-1">
          {produtosFiltrados.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <UtensilsCrossed className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-bold">Nenhum item encontrado.</p>
              <p className="text-xs text-slate-500">Tente buscar por outro termo ou categoria.</p>
            </div>
          ) : (
            produtosFiltrados.map((p) => (
              <div
                key={p.id}
                onClick={() => setProdutoModal(p)}
                className="p-3 bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-xs text-white truncate">{p.nome}</h3>
                    {p.destaque && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                        Top
                      </span>
                    )}
                  </div>
                  {p.descricao && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {p.descricao}
                    </p>
                  )}
                  <span className="text-xs font-black text-emerald-400 font-mono mt-1 block">
                    R$ {p.precoVenda.toFixed(2)}
                  </span>
                </div>

                {p.fotoUrl ? (
                  <img
                    src={p.fotoUrl}
                    alt={p.nome}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <ChefHat className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal de Detalhes do Produto */}
      {produtoModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-black text-base text-white">{produtoModal.nome}</h3>
              <button
                onClick={() => setProdutoModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {produtoModal.fotoUrl && (
              <img
                src={produtoModal.fotoUrl}
                alt={produtoModal.nome}
                className="w-full h-44 object-cover rounded-2xl border border-slate-800"
              />
            )}

            <div className="space-y-1">
              <span className="text-2xl font-black text-emerald-400 font-mono block">
                R$ {produtoModal.precoVenda.toFixed(2)}
              </span>
              {produtoModal.descricao ? (
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {produtoModal.descricao}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic pt-1">
                  Prato preparado com ingredientes frescos selecionados da casa.
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProdutoModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handlePedirWhatsApp(produtoModal)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Pedir no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Fixo */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 text-center">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Powered by <strong className="text-orange-400">EloServe</strong>
          </span>
          <Link
            to="/login"
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-semibold"
          >
            Acesso da Equipe
          </Link>
        </div>
      </footer>
    </div>
  );
}
