import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  QrCode,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bell,
  X,
  Split,
  Layers,
  Check,
  UserCheck,
  Smartphone,
  Sparkles,
  MoreVertical,
  Pencil,
  UtensilsCrossed,
  FileText,
  Trash2,
  Crown,
  AlertTriangle,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  ChefHat,
  Minus,
  Send,
  Printer,
  Download,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { useSaaSStore, PLANOS_DISPONIVEIS } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { Mesa, Produto } from '../types';
import { MesaQRCodeThumbnail } from '../components/mesas/MesaQRCodeThumbnail';
import {
  gerarQrCodeMesaDataUrl,
  getUrlMesaCliente,
  baixarQrCodeMesaPng,
  imprimirDisplayMesaIndividual,
  imprimirTodosDisplaysMesas,
} from '../utils/qrCodeHelper';

export default function Mesas() {
  const { getMesasPorTenant, atualizarStatusMesa, adicionarMesa, removerMesa, lancarItensComandaMesa, trocarMesa } = useAppStore();
  const { funcionarios } = useFuncionarioStore();
  const { getProdutosPorTenant, getCategoriasPorTenant } = useProductStore();
  const { fichasTecnicas } = useEstoqueStore();
  const { getTenantAtivo, mudarPlanoTenant } = useSaaSStore();
  const tenantAtual = getTenantAtivo();
  const idLoja = (!tenantAtual || tenantAtual.id === 'global') ? 'tenant-01' : tenantAtual.id;
  const mesas = getMesasPorTenant(idLoja);
  const produtos = getProdutosPorTenant(idLoja);
  const categorias = getCategoriasPorTenant(idLoja);

  const planoAtual = PLANOS_DISPONIVEIS.find((p) => p.id === tenantAtual?.planoId) || PLANOS_DISPONIVEIS[0];
  const maxMesasPermitidas = planoAtual.limites.maxMesas || 10;
  const isPlanoIlimitado = maxMesasPermitidas >= 999;
  const totalMesasAtuais = mesas.length;
  const limiteAtingido = !isPlanoIlimitado && totalMesasAtuais >= maxMesasPermitidas;

  const garconsDisponiveis = funcionarios.filter((f) => f.cargo === 'garcom' && f.ativo);

  const [setorSelecionado, setSetorSelecionado] = useState<string>('todos');
  const [menuAcoesMesaId, setMenuAcoesMesaId] = useState<number | null>(null);

  // Modais de Criação e Limite do Plano
  const [modalCriarMesaAberto, setModalCriarMesaAberto] = useState(false);
  const [formNovaMesa, setFormNovaMesa] = useState({
    numero: 1,
    capacidade: 4,
    setor: 'Salão',
  });
  const [modalUpgradeAberto, setModalUpgradeAberto] = useState(false);

  // Modais
  const [mesaParaAbrir, setMesaParaAbrir] = useState<Mesa | null>(null);
  const [formAbertura, setFormAbertura] = useState({
    quantidadePessoas: 2,
    responsavelNome: '',
    garcomResponsavel: 'Lucas Oliveira',
  });

  const [mesaParaFechar, setMesaParaFechar] = useState<Mesa | null>(null);
  const [pessoasDivisao, setPessoasDivisao] = useState(2);
  const [mesaModalQR, setMesaModalQR] = useState<Mesa | null>(null);
  const [modalQrDataUrl, setModalQrDataUrl] = useState<string>('');
  const [copiadoLink, setCopiadoLink] = useState(false);

  useEffect(() => {
    if (mesaModalQR) {
      let ativo = true;
      gerarQrCodeMesaDataUrl(mesaModalQR.numero, mesaModalQR.setor, 500, idLoja)
        .then((url) => {
          if (ativo) setModalQrDataUrl(url);
        })
        .catch((err) => console.error('Erro gerando QR:', err));
      return () => {
        ativo = false;
      };
    } else {
      setModalQrDataUrl('');
      setCopiadoLink(false);
    }
  }, [mesaModalQR, idLoja]);

  const handleCopiarLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiadoLink(true);
    dispararToast('Link copiado para a área de transferência!');
    setTimeout(() => setCopiadoLink(false), 2500);
  };

  const [mesaParaUnir, setMesaParaUnir] = useState<Mesa | null>(null);
  const [mesaDestinoUniao, setMesaDestinoUniao] = useState<number>(2);

  // Estados de Troca e Transferência de Mesa
  const [mesaParaTrocar, setMesaParaTrocar] = useState<Mesa | null>(null);
  const [mesaDestinoTroca, setMesaDestinoTroca] = useState<number | null>(null);
  const [modoTrocaMesa, setModoTrocaMesa] = useState<'transferir' | 'unificar' | 'inverter'>('transferir');
  const [motivoTrocaMesa, setMotivoTrocaMesa] = useState<string>('');

  function handleAbrirModalTroca(mesa: Mesa) {
    setMesaParaTrocar(mesa);
    setMotivoTrocaMesa('');
    if (mesa.status !== 'livre') {
      const livres = mesas.filter((m) => m.numero !== mesa.numero && m.status === 'livre');
      const outras = mesas.filter((m) => m.numero !== mesa.numero);
      setMesaDestinoTroca(livres.length > 0 ? livres[0].numero : outras.length > 0 ? outras[0].numero : null);
      setModoTrocaMesa('transferir');
    } else {
      const ocupadas = mesas.filter((m) => m.status !== 'livre');
      setMesaDestinoTroca(ocupadas.length > 0 ? ocupadas[0].numero : null);
      setModoTrocaMesa('transferir');
    }
  }

  function handleConfirmarTrocaMesa(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!mesaParaTrocar || mesaDestinoTroca === null) return;

    let numOrigem = mesaParaTrocar.numero;
    let numDestino = mesaDestinoTroca;

    // Se abriu a partir de uma mesa livre, a origem é a mesa ocupada e o destino é a mesa livre
    if (mesaParaTrocar.status === 'livre') {
      numOrigem = mesaDestinoTroca;
      numDestino = mesaParaTrocar.numero;
    }

    const res = trocarMesa(numOrigem, numDestino, modoTrocaMesa, idLoja, motivoTrocaMesa);
    if (res.sucesso) {
      dispararToast(`🔄 ${res.mensagem}`);
      setMesaParaTrocar(null);
      setMesaDestinoTroca(null);
    } else {
      dispararToast(`⚠️ ${res.mensagem}`);
    }
  }

  // Estados de Lançamento de Pedidos e Comanda da Mesa
  const [mesaParaLancar, setMesaParaLancar] = useState<Mesa | null>(null);
  const [abaModalComanda, setAbaModalComanda] = useState<'cardapio' | 'itens_consumidos'>('cardapio');
  const [categoriaCardapioMesa, setCategoriaCardapioMesa] = useState<string>('todas');
  const [buscaPratoMesa, setBuscaPratoMesa] = useState<string>('');
  const [carrinhoMesa, setCarrinhoMesa] = useState<{
    produto: Produto;
    quantidade: number;
    observacoes: string;
  }[]>([]);

  function handleAdicionarItemCarrinhoMesa(produto: Produto) {
    setCarrinhoMesa((prev) => {
      const existente = prev.find((it) => it.produto.id === produto.id);
      if (existente) {
        return prev.map((it) =>
          it.produto.id === produto.id ? { ...it, quantidade: it.quantidade + 1 } : it
        );
      }
      return [...prev, { produto, quantidade: 1, observacoes: '' }];
    });
  }

  function handleAlterarQtdItemCarrinhoMesa(produtoId: string, delta: number) {
    setCarrinhoMesa((prev) =>
      prev
        .map((it) => {
          if (it.produto.id === produtoId) {
            const novaQtd = it.quantidade + delta;
            return novaQtd > 0 ? { ...it, quantidade: novaQtd } : null;
          }
          return it;
        })
        .filter(Boolean) as { produto: Produto; quantidade: number; observacoes: string }[]
    );
  }

  function handleAlterarObsItemCarrinhoMesa(produtoId: string, observacoes: string) {
    setCarrinhoMesa((prev) =>
      prev.map((it) => (it.produto.id === produtoId ? { ...it, observacoes } : it))
    );
  }

  function handleEnviarPedidoKDS(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!mesaParaLancar || carrinhoMesa.length === 0) return;

    const novosItens = carrinhoMesa.map((it) => ({
      produtoId: it.produto.id,
      nome: it.produto.nome,
      quantidade: it.quantidade,
      precoUnitario: it.produto.precoVenda,
      subtotal: Number((it.produto.precoVenda * it.quantidade).toFixed(2)),
      observacoes: it.observacoes.trim() || undefined,
      garcomNome: mesaParaLancar.garcomResponsavel || 'Lucas Oliveira',
    }));

    const res = lancarItensComandaMesa(
      mesaParaLancar.numero,
      novosItens,
      mesaParaLancar.garcomResponsavel || 'Lucas Oliveira',
      idLoja
    );

    if (res.sucesso) {
      dispararToast(
        `Pedido #${res.pedidoKDSId.replace('kds_', '')} da Mesa #${mesaParaLancar.numero} enviado com sucesso ao KDS da Cozinha! R$ ${res.totalAdicionado.toFixed(2)} lançado e estoque atualizado.`
      );
      setCarrinhoMesa([]);
      // Atualiza a mesa no modal para refletir os novos itens
      const mesaAtualizada = useAppStore.getState().getMesasPorTenant(idLoja).find((m) => m.numero === mesaParaLancar.numero);
      if (mesaAtualizada) {
        setMesaParaLancar({ ...mesaAtualizada });
      }
      setAbaModalComanda('itens_consumidos');
    }
  }

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const setoresCadastrados = Array.from(new Set(mesas.map((m) => m.setor).filter(Boolean)));
  const setores = ['todos', ...(setoresCadastrados.length > 0 ? setoresCadastrados : ['Salão', 'Varanda', 'Deck'])];

  const mesasFiltradas = mesas.filter(
    (m) => setorSelecionado === 'todos' || m.setor === setorSelecionado
  );

  const produtosFiltradosMesa = produtos.filter((p) => {
    if (!p.disponivel) return false;
    const matchCat = categoriaCardapioMesa === 'todas' || p.categoriaId === categoriaCardapioMesa;
    const matchBusca =
      !buscaPratoMesa ||
      p.nome.toLowerCase().includes(buscaPratoMesa.toLowerCase()) ||
      (p.descricao && p.descricao.toLowerCase().includes(buscaPratoMesa.toLowerCase()));
    return matchCat && matchBusca;
  });

  const totalLoteCarrinho = carrinhoMesa.reduce(
    (acc, it) => acc + it.produto.precoVenda * it.quantidade,
    0
  );

  const totalOcupadas = mesas.filter((m) => m.status === 'ocupada').length;
  const totalLivres = mesas.filter((m) => m.status === 'livre').length;
  const totalChamados = mesas.filter((m) => m.status === 'chamar_garcom').length;
  const taxaOcupacao = mesas.length > 0 ? Math.round((totalOcupadas / mesas.length) * 100) : 0;

  function handleConfirmarAberturaMesa(e: React.FormEvent) {
    e.preventDefault();
    if (!mesaParaAbrir) return;

    atualizarStatusMesa(mesaParaAbrir.numero, 'ocupada', idLoja);
    mesaParaAbrir.quantidadePessoas = Number(formAbertura.quantidadePessoas);
    mesaParaAbrir.responsavelNome = formAbertura.responsavelNome || 'Cliente Salão';
    mesaParaAbrir.garcomResponsavel = formAbertura.garcomResponsavel;
    mesaParaAbrir.tempoOcupadaMin = 1;
    mesaParaAbrir.totalConsumo = 0;

    dispararToast(`Mesa #${mesaParaAbrir.numero} aberta com sucesso para ${formAbertura.responsavelNome || 'Cliente'} (${formAbertura.quantidadePessoas} pessoas)!`);
    setMesaParaAbrir(null);
  }

  function handleConfirmarAtendimentoChamado(mesa: Mesa) {
    mesa.status = 'ocupada';
    mesa.tempoChamadaGarcomMin = 0;
    mesa.alertaCritico = false;
    mesa.solicitacaoTransferida = false;
    atualizarStatusMesa(mesa.numero, 'ocupada', idLoja);
    dispararToast(`Chamado da Mesa #${mesa.numero} atendido com sucesso pelo garçom!`);
  }

  function handleSimularChamarGarcom(mesa: Mesa, minutosEspera = 9) {
    mesa.status = 'chamar_garcom';
    mesa.tempoChamadaGarcomMin = minutosEspera;
    if (minutosEspera >= 10) {
      mesa.solicitacaoTransferida = true;
      mesa.alertaCritico = true;
      dispararToast(`🚨 Alerta 10 min: Chamado da Mesa #${mesa.numero} transferido automaticamente para outro garçom disponível!`);
    } else if (minutosEspera >= 8) {
      mesa.alertaCritico = true;
      dispararToast(`⚠️ Alerta Crítico: Mesa #${mesa.numero} aguardando garçom há mais de 8 minutos!`);
    } else {
      dispararToast(`Mesa #${mesa.numero} chamou o garçom! Notificação enviada.`);
    }
    atualizarStatusMesa(mesa.numero, 'chamar_garcom', idLoja);
  }

  function handleConfirmarUniaoMesas() {
    if (!mesaParaUnir) return;
    mesaParaUnir.mesasUnidas = [mesaDestinoUniao];
    dispararToast(`Mesas #${mesaParaUnir.numero} e #${mesaDestinoUniao} unidas com comanda compartilhada!`);
    setMesaParaUnir(null);
  }

  function abrirModalCriarMesa() {
    if (limiteAtingido) {
      setModalUpgradeAberto(true);
      return;
    }
    const proximoNumero = mesas.length > 0 ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1;
    setFormNovaMesa({
      numero: proximoNumero,
      capacidade: 4,
      setor: setorSelecionado === 'todos' ? 'Salão' : setorSelecionado,
    });
    setModalCriarMesaAberto(true);
  }

  function handleCriarMesa(e: React.FormEvent) {
    e.preventDefault();
    if (limiteAtingido) {
      setModalCriarMesaAberto(false);
      setModalUpgradeAberto(true);
      return;
    }
    const num = Number(formNovaMesa.numero);
    if (!num || num <= 0) {
      dispararToast('⚠️ Informe um número de mesa válido.');
      return;
    }
    const res = adicionarMesa({
      numero: num,
      capacidade: Number(formNovaMesa.capacidade) || 4,
      setor: formNovaMesa.setor || 'Salão',
    }, idLoja);
    if (res.sucesso) {
      dispararToast(`✅ Mesa #${num} criada com sucesso no ${formNovaMesa.setor}!`);
      setModalCriarMesaAberto(false);
    } else {
      dispararToast(`⚠️ ${res.mensagem || 'Erro ao criar mesa'}`);
    }
  }

  function handleExcluirMesa(mesa: Mesa) {
    if (mesa.status !== 'livre') {
      dispararToast(`⚠️ Não é possível excluir a Mesa #${mesa.numero} enquanto ela estiver ocupada ou com comanda aberta. Feche a conta ou libere a mesa primeiro.`);
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir permanentemente a Mesa #${mesa.numero} (${mesa.setor})?`)) {
      const res = removerMesa(mesa.numero, idLoja);
      if (res.sucesso) {
        dispararToast(`🗑️ Mesa #${mesa.numero} excluída com sucesso!`);
      } else {
        dispararToast(`⚠️ ${res.mensagem}`);
      }
    }
  }

  function handleFazerUpgradeParaPro() {
    if (tenantAtual) {
      mudarPlanoTenant(tenantAtual.id, 'pro');
      setModalUpgradeAberto(false);
      dispararToast('🎉 Parabéns! Sua assinatura foi atualizada para o Plano Pro com Mesas Ilimitadas!');
    }
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner & KPIs com Controle de Limite de Plano */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Mapa de Mesas & Atendimento no Salão</span>
            {totalChamados > 0 && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                {totalChamados} Chamados Pendentes
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de comandas únicas, QR Code nas mesas, tempo de resposta de garçons e criação de mesas por plano.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Card Indicador do Plano e Limite de Mesas */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${isPlanoIlimitado ? 'bg-amber-500/10 text-amber-400' : limiteAtingido ? 'bg-rose-500/10 text-rose-400' : 'bg-orange-500/10 text-orange-400'}`}>
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">{planoAtual.nome}</span>
                {limiteAtingido ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    Limite Atingido
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {isPlanoIlimitado ? 'Ilimitado' : `${maxMesasPermitidas - totalMesasAtuais} livres`}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white font-mono">
                {totalMesasAtuais} {isPlanoIlimitado ? 'Mesas (Ilimitadas)' : `/ ${maxMesasPermitidas} Mesas`}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Livres</p>
              <p className="text-xs font-bold text-white font-mono">{totalLivres}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupadas</p>
              <p className="text-xs font-bold text-white font-mono">{totalOcupadas}</p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Ocupação</p>
              <p className="text-xs font-bold text-amber-400 font-mono">{taxaOcupacao}%</p>
            </div>
          </div>

          {/* Botão Imprimir Todos os QRs */}
          <button
            onClick={() =>
              imprimirTodosDisplaysMesas(
                mesas.map((m) => ({
                  numero: m.numero,
                  setor: m.setor,
                  capacidade: m.capacidade,
                  tenantId: idLoja,
                })),
                tenantAtual?.nomeFantasia || 'Restaurante EloServe',
                'Cliente_Wifi',
                'eloserve2026',
                idLoja
              )
            }
            title="Imprimir displays e totens com QR Code de todas as mesas cadastradas"
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Imprimir Todos os QRs</span>
          </button>

          {/* Botão + Nova Mesa */}
          <button
            onClick={abrirModalCriarMesa}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
              limiteAtingido
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Mesa</span>
            {limiteAtingido && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase font-black">
                Upgrade
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filtro de Setores com scroll horizontal */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {setores.map((setor) => (
          <button
            key={setor}
            onClick={() => setSetorSelecionado(setor)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              setorSelecionado === setor
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {setor === 'todos' ? 'Todos os Setores' : setor}
          </button>
        ))}
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesasFiltradas.map((mesa) => {
          const isLivre = mesa.status === 'livre';
          const isChamar = mesa.status === 'chamar_garcom';
          const isAguardando = mesa.status === 'aguardando_pagamento';
          const isCritico = mesa.alertaCritico || (mesa.tempoChamadaGarcomMin && mesa.tempoChamadaGarcomMin >= 8);

          return (
            <div
              key={mesa.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isLivre
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : isCritico
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/40'
                  : isChamar
                  ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                  : isAguardando
                  ? 'bg-blue-950/20 border-blue-500/40 ring-2 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 shadow-md'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MesaQRCodeThumbnail
                      numero={mesa.numero}
                      setor={mesa.setor}
                      size={44}
                      tenantId={idLoja}
                      onClick={() => setMesaModalQR(mesa)}
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        {mesa.setor} {mesa.mesasUnidas ? `(Unida com #${mesa.mesasUnidas.join(', ')})` : ''}
                      </span>
                      <h3 className="text-xl font-black text-white mt-0.5">
                        Mesa #{mesa.numero}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 relative">
                    <button
                      onClick={() => setMesaModalQR(mesa)}
                      title="Ampliar QR Code Real da Mesa"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-orange-400" />
                    </button>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isLivre
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isCritico
                          ? 'bg-rose-500 text-white font-black animate-pulse'
                          : isChamar
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                          : isAguardando
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isLivre
                        ? 'Livre'
                        : isCritico
                        ? 'Alerta Crítico (>8m)'
                        : isChamar
                        ? 'Chamar Garçom'
                        : isAguardando
                        ? 'Conta Pedida'
                        : 'Ocupada'}
                    </span>

                    {/* Botão 3 Pontos com Menu de Contexto (Idêntico ao Print 4) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAcoesMesaId(menuAcoesMesaId === mesa.numero ? null : mesa.numero);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Opções da Mesa"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuAcoesMesaId === mesa.numero && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-9 w-48 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold animate-in fade-in zoom-in-95 space-y-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              if (isLivre) {
                                setMesaParaAbrir(mesa);
                                setFormAbertura({
                                  quantidadePessoas: mesa.capacidade,
                                  responsavelNome: '',
                                  garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                                });
                              } else {
                                setMesaParaLancar(mesa);
                                setAbaModalComanda('cardapio');
                                setCarrinhoMesa([]);
                              }
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-600" />
                            <span>Novo Pedido / Cardápio</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaLancar(mesa);
                              setAbaModalComanda('itens_consumidos');
                            }}
                            className="w-full px-3 py-1.5 text-left bg-slate-100 hover:bg-slate-200 flex items-center gap-2.5 text-slate-900 font-bold cursor-pointer"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5 text-slate-700" />
                            <span>Ver Comanda & Pedidos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              handleAbrirModalTroca(mesa);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-orange-50 flex items-center gap-2.5 text-orange-600 font-bold cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-500" />
                            <span>Trocar de Mesa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaLancar(mesa);
                              setAbaModalComanda('itens_consumidos');
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Visualizar Comanda Completa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              atualizarStatusMesa(mesa.numero, 'chamar_garcom', idLoja);
                              dispararToast(`Atenção marcada para Mesa #${mesa.numero}!`);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-600" />
                            <span>Marcar Atenção</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaParaFechar(mesa);
                              setPessoasDivisao(mesa.quantidadePessoas || 2);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fechar Conta</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              atualizarStatusMesa(mesa.numero, 'livre', idLoja);
                              dispararToast(`Mesa #${mesa.numero} liberada com sucesso!`);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 flex items-center gap-2.5 text-emerald-600 font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Liberar Mesa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAcoesMesaId(null);
                              setMesaModalQR(mesa);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ver QR Code</span>
                          </button>

                          <div className="border-t border-slate-100 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuAcoesMesaId(null);
                                handleExcluirMesa(mesa);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Excluir Mesa</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações da Mesa */}
                <div className="my-4">
                  {isLivre ? (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacidade para até {mesa.capacidade} pessoas</span>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Responsável e Garçom */}
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Responsável:</span>
                          <strong className="text-white">{mesa.responsavelNome || 'Pedro Santos'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Garçom da Mesa:</span>
                          <span className="text-purple-300 font-semibold">{mesa.garcomResponsavel || 'Lucas Oliveira'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ocupantes:</span>
                          <span className="text-slate-200 font-bold">{mesa.quantidadePessoas || 2} pessoas</span>
                        </div>
                      </div>

                      {/* Alerta de Tempo Chamar Garçom (Seções 4.16 - 4.22) */}
                      {isChamar && (
                        <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span className="flex items-center gap-1">
                              <Bell className="w-3.5 h-3.5 animate-bounce" />
                              <span>Cliente Chamou Garçom</span>
                            </span>
                            <span className="font-mono">{mesa.tempoChamadaGarcomMin || 3} min</span>
                          </div>

                          {mesa.solicitacaoTransferida && (
                            <p className="text-[10px] text-rose-300 font-bold">
                              🚨 Passou de 10 min: redistribuído para equipe de apoio!
                            </p>
                          )}

                          <button
                            onClick={() => handleConfirmarAtendimentoChamado(mesa)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Atendimento</span>
                          </button>
                        </div>
                      )}

                      {/* Permanência e Total */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Permanência:
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {mesa.tempoOcupadaMin || 30} min
                        </span>
                      </div>

                      {/* Prévia dos itens da comanda */}
                      {mesa.comandaItens && mesa.comandaItens.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold flex items-center gap-1 text-slate-300">
                              <UtensilsCrossed className="w-3 h-3 text-orange-400" />
                              Comanda ({mesa.comandaItens.length} {mesa.comandaItens.length === 1 ? 'item' : 'itens'}):
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMesaParaLancar(mesa);
                                setAbaModalComanda('itens_consumidos');
                              }}
                              className="text-emerald-400 hover:underline cursor-pointer font-bold text-[10px]"
                            >
                              Ver comanda
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                            {mesa.comandaItens.slice(-3).map((it, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                              >
                                <span className="font-bold text-orange-400">{it.quantidade}x</span>
                                <span className="truncate max-w-[110px]">{it.nome}</span>
                              </span>
                            ))}
                            {mesa.comandaItens.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-bold">
                                +{mesa.comandaItens.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          Consumo Acumulado:
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          R$ {mesa.totalConsumo ? mesa.totalConsumo.toFixed(2) : '0,00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações da Mesa */}
              <div className="pt-3 border-t border-slate-800/70 space-y-1.5">
                {isLivre ? (
                  <button
                    onClick={() => {
                      setMesaParaAbrir(mesa);
                      setFormAbertura({
                        quantidadePessoas: mesa.capacidade,
                        responsavelNome: '',
                        garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir Mesa no Salão</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {/* Botão Principal de Lançamento de Pedidos */}
                    <button
                      type="button"
                      onClick={() => {
                        setMesaParaLancar(mesa);
                        setAbaModalComanda('cardapio');
                        setCarrinhoMesa([]);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Lançar Pedidos na Mesa</span>
                      {mesa.comandaItens && mesa.comandaItens.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/40 text-white font-mono font-bold">
                          {mesa.comandaItens.length}
                        </span>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMesaParaLancar(mesa);
                          setAbaModalComanda('itens_consumidos');
                        }}
                        className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Comanda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMesaParaFechar(mesa);
                          setPessoasDivisao(mesa.quantidadePessoas || 2);
                        }}
                        className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Split className="w-3.5 h-3.5" />
                        <span>Fechar Conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL: ABERTURA DE MESA PELO GARÇOM (SEÇÃO 4.17)               */}
      {/* ============================================================== */}
      {mesaParaAbrir && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Abrir Mesa #{mesaParaAbrir.numero}</span>
              </h3>
              <button onClick={() => setMesaParaAbrir(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAberturaMesa} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  São quantas pessoas? (Obrigatório) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formAbertura.quantidadePessoas}
                  onChange={(e) => setFormAbertura({ ...formAbertura, quantidadePessoas: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-center text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Nome do Responsável pela Comanda *
                </label>
                <input
                  type="text"
                  required
                  value={formAbertura.responsavelNome}
                  onChange={(e) => setFormAbertura({ ...formAbertura, responsavelNome: e.target.value })}
                  placeholder="Ex: Pedro Santos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Garçom Responsável pelo Atendimento
                </label>
                <select
                  value={formAbertura.garcomResponsavel}
                  onChange={(e) => setFormAbertura({ ...formAbertura, garcomResponsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                >
                  {garconsDisponiveis.map((g) => (
                    <option key={g.id} value={`${g.nome} ${g.sobrenome}`}>
                      {g.nome} {g.sobrenome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaAbrir(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DIVISÃO IGUALITÁRIA DA CONTA (SEÇÃO 4.14 - 4.15)        */}
      {/* ============================================================== */}
      {mesaParaFechar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Split className="w-5 h-5 text-purple-400" />
                <span>Fechamento & Divisão da Conta — Mesa #{mesaParaFechar.numero}</span>
              </h3>
              <button onClick={() => setMesaParaFechar(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Total da Conta */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Consumido:</span>
                  <p className="text-white font-bold text-xs">{mesaParaFechar.responsavelNome || 'Cliente'}</p>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  R$ {(mesaParaFechar.totalConsumo || 120).toFixed(2)}
                </span>
              </div>

              {/* Ajuste de Pessoas para Divisão Igualitária (Seção 4.14) */}
              <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Dividir a conta entre quantas pessoas?</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={pessoasDivisao}
                    onChange={(e) => setPessoasDivisao(parseInt(e.target.value) || 1)}
                    className="w-16 px-2.5 py-1 bg-slate-950 border border-purple-500/40 rounded-xl text-white font-mono font-bold text-center"
                  />
                </div>

                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="text-purple-300 font-bold">Valor por pessoa (Divisão Igualitária):</span>
                  <span className="text-base font-black text-white font-mono bg-purple-900/50 px-3 py-1 rounded-xl">
                    R$ {((mesaParaFechar.totalConsumo || 120) / Math.max(1, pessoasDivisao)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
                💡 Conforme a regra de fechamento (Seção 4.15), a divisão é sempre igualitária pelo total da comanda única, evitando filas e cálculo item a item.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMesaParaFechar(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    atualizarStatusMesa(mesaParaFechar.numero, 'livre', idLoja);
                    mesaParaFechar.totalConsumo = 0;
                    dispararToast(`Conta da Mesa #${mesaParaFechar.numero} quitada e mesa liberada!`);
                    setMesaParaFechar(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Confirmar Pagamento & Liberar Mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: QR CODE DA MESA COM SIMULADOR DO CLIENTE (SEÇÃO 4.12)  */}
      {/* ============================================================== */}
      {mesaModalQR && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    QR Code Real — Mesa #{mesaModalQR.numero}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Setor: {mesaModalQR.setor} • {mesaModalQR.capacidade} lugares
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMesaModalQR(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem do QR Code Real Gerado */}
            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-slate-800 mx-auto">
              {modalQrDataUrl ? (
                <img
                  src={modalQrDataUrl}
                  alt={`QR Code Real Mesa #${mesaModalQR.numero}`}
                  className="w-56 h-56 block rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {/* URL e Copiar Link */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-left">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Link de Acesso do Cliente:
                </span>
                <span className="text-xs text-orange-400 font-mono font-medium truncate block">
                  {getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleCopiarLink(getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja))
                  }
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copiar link da mesa"
                >
                  {copiadoLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={getUrlMesaCliente(mesaModalQR.numero, mesaModalQR.setor, idLoja)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-orange-500/20"
                  title="Abrir autoatendimento do cliente em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Ações de Impressão e Download */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (modalQrDataUrl) {
                    baixarQrCodeMesaPng(modalQrDataUrl, mesaModalQR.numero);
                    dispararToast(`QR Code da Mesa #${mesaModalQR.numero} baixado em PNG de alta definição!`);
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Baixar PNG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (modalQrDataUrl) {
                    imprimirDisplayMesaIndividual({
                      numero: mesaModalQR.numero,
                      setor: mesaModalQR.setor,
                      capacidade: mesaModalQR.capacidade,
                      nomeRestaurante: tenantAtual?.nomeFantasia || 'Restaurante EloServe',
                      qrDataUrl: modalQrDataUrl,
                      tenantId: idLoja,
                    });
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Display</span>
              </button>
            </div>

            {/* Painel Experiência do Consumidor (Seção 4.12) */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <span className="text-[10px] text-purple-300 font-bold uppercase block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Experiência do Consumidor (Seção 4.12):</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                1. Cliente escaneia na mesa sem digitar número.
              </p>
              <p className="text-slate-300 text-[11px]">
                2. Pergunta única obrigatória: <strong>"São quantas pessoas?"</strong>
              </p>
              <p className="text-slate-300 text-[11px]">
                3. Cardápio abre com comanda única e botão <strong>"Chamar Garçom"</strong>.
              </p>
            </div>

            {/* Simulação rápida */}
            <div className="pt-1">
              <button
                onClick={() => {
                  handleSimularChamarGarcom(mesaModalQR, 3);
                  setMesaModalQR(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Simular Chamado do Garçom nesta Mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Nova Mesa (com validação de limites do plano) */}
      {modalCriarMesaAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Criar Nova Mesa</h3>
                  <p className="text-[11px] text-slate-400">
                    Plano {planoAtual.nome} • {isPlanoIlimitado ? 'Mesas Ilimitadas' : `${totalMesasAtuais + 1} de ${maxMesasPermitidas} permitidas`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCriarMesaAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarMesa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Número da Mesa:
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formNovaMesa.numero}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, numero: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Número exclusivo da mesa para controle no salão e exibição no QR Code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Capacidade de Pessoas (Lugares):
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[2, 4, 6, 8].map((lugares) => (
                    <button
                      key={lugares}
                      type="button"
                      onClick={() => setFormNovaMesa({ ...formNovaMesa, capacidade: lugares })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formNovaMesa.capacidade === lugares
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lugares} lugares
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formNovaMesa.capacidade}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, capacidade: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  placeholder="Ou digite outra capacidade de lugares..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Setor / Ambiente:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Salão', 'Varanda', 'Deck', 'Área Externa', 'Mezanino', 'VIP'].map((setor) => (
                    <button
                      key={setor}
                      type="button"
                      onClick={() => setFormNovaMesa({ ...formNovaMesa, setor })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        formNovaMesa.setor === setor
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {setor}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formNovaMesa.setor}
                  onChange={(e) => setFormNovaMesa({ ...formNovaMesa, setor: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                  placeholder="Nome do setor (ex: Salão, Varanda...)"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalCriarMesaAberto(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95"
                >
                  Confirmar e Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Limite do Plano Atingido & Upgrade para Pro */}
      {modalUpgradeAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Limite de Mesas Atingido
                  </h3>
                  <p className="text-[11px] text-amber-400 font-semibold">
                    Plano Atual: {planoAtual.nome} ({totalMesasAtuais}/{maxMesasPermitidas} mesas)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalUpgradeAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              O seu plano <strong>{planoAtual.nome}</strong> permite até <strong>{maxMesasPermitidas} mesas cadastradas</strong> no salão. Você já atingiu a capacidade máxima deste plano.
            </div>

            {/* Destaque do Plano Pro */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-orange-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400">
                    Recomendado para Expansão
                  </span>
                  <h4 className="text-lg font-black text-white">EloServe Pro</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">R$ 199</span>
                  <span className="text-xs text-slate-400"> / mês</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Mesas 100% Ilimitadas</strong> no Salão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Painel KDS de Cozinha e Bar em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Comanda Mobile para Garçons atenderem nas mesas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Controle de Estoque e Ficha Técnica dos pratos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalUpgradeAberto(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFazerUpgradeParaPro}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Fazer Upgrade para o Pro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TROCA & TRANSFERÊNCIA DE MESA                           */}
      {/* ============================================================== */}
      {mesaParaTrocar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Troca & Transferência de Mesa
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {mesaParaTrocar.status === 'livre'
                      ? `Mesa #${mesaParaTrocar.numero} (${mesaParaTrocar.setor}) está Livre`
                      : `Mesa #${mesaParaTrocar.numero} (${mesaParaTrocar.setor}) • ${mesaParaTrocar.responsavelNome || 'Cliente'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMesaParaTrocar(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CASO 1: A mesa onde clicou nos 3 pontos está OCUPADA (vamos transferir ELA para outra) */}
            {mesaParaTrocar.status !== 'livre' ? (
              <form onSubmit={handleConfirmarTrocaMesa} className="space-y-4 text-xs">
                {/* Card Mesa Origem */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Mesa de Origem (Atual)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      Ocupada
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white">
                        Mesa #{mesaParaTrocar.numero}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {mesaParaTrocar.setor} • {mesaParaTrocar.quantidadePessoas || 2} pessoas
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Consumo Atual:</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        R$ {(mesaParaTrocar.totalConsumo || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Cliente: <strong className="text-white">{mesaParaTrocar.responsavelNome || 'Cliente'}</strong></span>
                    <span>Garçom: <strong className="text-purple-300">{mesaParaTrocar.garcomResponsavel || 'Lucas Oliveira'}</strong></span>
                    <span>Itens Comanda: <strong className="text-orange-400">{mesaParaTrocar.comandaItens?.length || 0}</strong></span>
                  </div>
                </div>

                {/* Seta indicativa */}
                <div className="flex justify-center -my-1">
                  <div className="p-1.5 rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/30">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>

                {/* Seletor Mesa Destino */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Selecione a Mesa de Destino:
                  </label>

                  {/* Grid de Mesas Destino Disponíveis */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {mesas
                      .filter((m) => m.numero !== mesaParaTrocar.numero)
                      .map((m) => {
                        const isDestLivre = m.status === 'livre';
                        const isSelecionada = mesaDestinoTroca === m.numero;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setMesaDestinoTroca(m.numero);
                              if (isDestLivre) {
                                setModoTrocaMesa('transferir');
                              } else {
                                setModoTrocaMesa('unificar');
                              }
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelecionada
                                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 text-white'
                                : isDestLivre
                                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-300'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-amber-500/40 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-white">#{m.numero}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  isDestLivre
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {isDestLivre ? 'Livre' : 'Ocupada'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 truncate mt-1">{m.setor}</span>
                            <span className="text-[9px] text-slate-500">{m.capacidade} lugares</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Exibição da Ação Selecionada */}
                {mesaDestinoTroca !== null && (() => {
                  const mDestino = mesas.find((m) => m.numero === mesaDestinoTroca);
                  if (!mDestino) return null;
                  const isDestLivre = mDestino.status === 'livre';

                  return (
                    <div className="space-y-3">
                      {isDestLivre ? (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Mesa #{mDestino.numero} está 100% Livre</span>
                          </p>
                          <p className="text-emerald-400/90">
                            O atendimento, cliente <strong>{mesaParaTrocar.responsavelNome || 'Cliente'}</strong>, pedidos da comanda e pedidos no KDS serão movidos para a <strong>Mesa #{mDestino.numero}</strong>. A <strong>Mesa #{mesaParaTrocar.numero}</strong> será liberada automaticamente.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                          <div className="text-[11px] text-amber-300">
                            <p className="font-bold flex items-center gap-1.5 text-amber-200">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Mesa #{mDestino.numero} já está Ocupada</span>
                            </p>
                            <p className="text-slate-300 mt-0.5">
                              Cliente atual: <strong>{mDestino.responsavelNome || 'Cliente'}</strong> • Consumo atual: <strong>R$ {(mDestino.totalConsumo || 0).toFixed(2)}</strong>. Como deseja prosseguir?
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setModoTrocaMesa('unificar')}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                modoTrocaMesa === 'unificar'
                                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="font-bold text-xs block text-amber-300">
                                Unificar Comandas
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Soma consumos e pedidos na Mesa #{mDestino.numero} e libera a Mesa #{mesaParaTrocar.numero}.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setModoTrocaMesa('inverter')}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                modoTrocaMesa === 'inverter'
                                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="font-bold text-xs block text-purple-300">
                                Inverter Mesas
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Troca as posições e comandas entre as Mesas #{mesaParaTrocar.numero} e #{mDestino.numero}.
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Motivo Opcional */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Motivo da Troca (Opcional):
                        </label>
                        <input
                          type="text"
                          value={motivoTrocaMesa}
                          onChange={(e) => setMotivoTrocaMesa(e.target.value)}
                          placeholder="Ex: Cliente solicitou mesa na varanda / ar-condicionado..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Botões do Rodapé */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMesaParaTrocar(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mesaDestinoTroca === null}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Confirmar Troca de Mesa</span>
                  </button>
                </div>
              </form>
            ) : (
              /* CASO 2: A mesa onde clicou nos 3 pontos está LIVRE (como no print enviado!) */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">
                      Mesa #{mesaParaTrocar.numero}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Livre no Salão
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Esta mesa está desocupada. Você pode <strong>trazer e transferir</strong> um atendimento em andamento de outra mesa ocupada para cá:
                  </p>
                </div>

                {(() => {
                  const mesasOcupadas = mesas.filter((m) => m.status !== 'livre');
                  if (mesasOcupadas.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <p className="font-semibold text-slate-300">
                          Não há mesas ocupadas no momento no salão.
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Todas as mesas estão livres. Para iniciar um atendimento nesta mesa:
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const mesaAlvo = mesaParaTrocar;
                            setMesaParaTrocar(null);
                            setMesaParaAbrir(mesaAlvo);
                            setFormAbertura({
                              quantidadePessoas: mesaAlvo.capacidade,
                              responsavelNome: '',
                              garcomResponsavel: garconsDisponiveis[0]?.nome || 'Lucas Oliveira',
                            });
                          }}
                          className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Abrir Mesa #{mesaParaTrocar.numero}</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <form onSubmit={handleConfirmarTrocaMesa} className="space-y-3.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Qual mesa ocupada deseja transferir para a Mesa #{mesaParaTrocar.numero}?
                      </label>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {mesasOcupadas.map((m) => {
                          const isSelecionada = mesaDestinoTroca === m.numero;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setMesaDestinoTroca(m.numero);
                                setModoTrocaMesa('transferir');
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelecionada
                                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30'
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-white">
                                    Mesa #{m.numero}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                                    {m.setor}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">
                                  Cliente: <strong className="text-white">{m.responsavelNome || 'Cliente'}</strong> • Garçom: <strong className="text-purple-300">{m.garcomResponsavel || 'Lucas'}</strong>
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-black text-emerald-400 block">
                                  R$ {(m.totalConsumo || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {m.comandaItens?.length || 0} itens
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Motivo Opcional */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Motivo da Troca (Opcional):
                        </label>
                        <input
                          type="text"
                          value={motivoTrocaMesa}
                          onChange={(e) => setMotivoTrocaMesa(e.target.value)}
                          placeholder="Ex: Mudança de ambiente / melhor acomodação..."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Botões */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMesaParaTrocar(null)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={mesaDestinoTroca === null}
                          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Trazer Atendimento para Cá</span>
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: COMANDA & LANÇAMENTO DE PEDIDOS NA MESA (KDS & ESTOQUE) */}
      {/* ============================================================== */}
      {mesaParaLancar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header da Comanda */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Mesa #{mesaParaLancar.numero}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {mesaParaLancar.setor}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ocupada
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span>
                      Cliente: <strong className="text-white">{mesaParaLancar.responsavelNome || 'Cliente Salão'}</strong>
                    </span>
                    <span>
                      Garçom: <strong className="text-purple-300">{mesaParaLancar.garcomResponsavel || 'Lucas Oliveira'}</strong>
                    </span>
                    <span>
                      Pessoas: <strong className="text-slate-200">{mesaParaLancar.quantidadePessoas || 2}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Consumido:</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    R$ {(mesaParaLancar.totalConsumo || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMesaParaLancar(null);
                    setCarrinhoMesa([]);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navegação de Abas do Modal */}
            <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 sm:px-5 shrink-0">
              <button
                type="button"
                onClick={() => setAbaModalComanda('cardapio')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
                  abaModalComanda === 'cardapio'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Lançar Pedidos do Cardápio</span>
                {carrinhoMesa.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-mono font-bold">
                    {carrinhoMesa.reduce((acc, it) => acc + it.quantidade, 0)}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAbaModalComanda('itens_consumidos')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
                  abaModalComanda === 'itens_consumidos'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Comanda da Mesa & KDS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {mesaParaLancar.comandaItens?.length || 0}
                </span>
              </button>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {abaModalComanda === 'cardapio' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                  {/* Coluna Esquerda: Catálogo do Cardápio (7 cols) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Barra de Busca e Filtros de Categoria */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={buscaPratoMesa}
                          onChange={(e) => setBuscaPratoMesa(e.target.value)}
                          placeholder="Buscar pratos, cortes, porções, bebidas..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Chips de Categorias */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setCategoriaCardapioMesa('todas')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                            categoriaCardapioMesa === 'todas'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Todas
                        </button>
                        {categorias.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoriaCardapioMesa(cat.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                              categoriaCardapioMesa === cat.id
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat.nome}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lista / Grid de Pratos do Cardápio */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {produtosFiltradosMesa.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800">
                          Nenhum prato encontrado com o filtro aplicado.
                        </div>
                      ) : (
                        produtosFiltradosMesa.map((prod) => {
                          const temFicha = fichasTecnicas.some(
                            (f) => f.produtoId === prod.id && f.componentes && f.componentes.length > 0
                          );
                          const noCarrinho = carrinhoMesa.find((it) => it.produto.id === prod.id);

                          return (
                            <div
                              key={prod.id}
                              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                                    {prod.nome}
                                  </span>
                                  {temFicha ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                                      🥗 Ficha Técnica (Baixa Estoque)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-semibold shrink-0">
                                      Item Direto
                                    </span>
                                  )}
                                </div>
                                {prod.descricao && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1">
                                    {prod.descricao}
                                  </p>
                                )}
                                <span className="text-xs font-black font-mono text-emerald-400 block">
                                  R$ {prod.precoVenda.toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAdicionarItemCarrinhoMesa(prod)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                  noCarrinho
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-orange-500/50'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{noCarrinho ? `${noCarrinho.quantidade}x` : 'Adicionar'}</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Coluna Direita: Lote a Enviar para a Cozinha / KDS (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <h4 className="text-xs font-extrabold uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4" />
                          <span>Lote a Enviar à Cozinha</span>
                        </h4>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {carrinhoMesa.reduce((acc, it) => acc + it.quantidade, 0)} itens
                        </span>
                      </div>

                      {carrinhoMesa.length === 0 ? (
                        <div className="py-12 px-4 text-center text-slate-500 text-xs rounded-xl border border-dashed border-slate-800/80 space-y-2">
                          <UtensilsCrossed className="w-7 h-7 mx-auto text-slate-600 opacity-60" />
                          <p className="font-semibold text-slate-400">Nenhum prato adicionado ao lote.</p>
                          <p className="text-[11px] text-slate-500">
                            Selecione os itens do cardápio ao lado para montar o pedido desta mesa.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                          {carrinhoMesa.map((it) => (
                            <div
                              key={it.produto.id}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {it.produto.nome}
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                                  R$ {(it.produto.precoVenda * it.quantidade).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, -1)}
                                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 font-mono font-bold text-white text-xs">
                                    {it.quantidade}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, 1)}
                                    className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={it.observacoes}
                                  onChange={(e) =>
                                    handleAlterarObsItemCarrinhoMesa(it.produto.id, e.target.value)
                                  }
                                  placeholder="Obs: sem cebola, ponto..."
                                  className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleAlterarQtdItemCarrinhoMesa(it.produto.id, -it.quantidade)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resumo do Lote e Envio */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Subtotal deste Lote:</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          R$ {totalLoteCarrinho.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Ao confirmar, os ingredientes serão <strong>baixados do estoque automaticamente</strong> e o pedido entrará em tempo real na tela do <strong>KDS da Cozinha</strong>.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnviarPedidoKDS()}
                        disabled={carrinhoMesa.length === 0}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Pedido para a Cozinha (KDS)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Aba 2: Comanda Completa da Mesa & KDS */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Histórico de Consumo da Mesa #{mesaParaLancar.numero}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Todos os pedidos lançados até o momento para este atendimento.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAbaModalComanda('cardapio')}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lançar Mais Pedidos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Conferência</span>
                      </button>
                    </div>
                  </div>

                  {!mesaParaLancar.comandaItens || mesaParaLancar.comandaItens.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                      <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="font-semibold text-slate-400">Nenhum pedido lançado nesta comanda até o momento.</p>
                      <button
                        type="button"
                        onClick={() => setAbaModalComanda('cardapio')}
                        className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Abrir Cardápio e Lançar Itens</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                              <th className="py-2.5 px-3">Horário</th>
                              <th className="py-2.5 px-3">Item / Prato</th>
                              <th className="py-2.5 px-3">Qtd</th>
                              <th className="py-2.5 px-3">Unitário</th>
                              <th className="py-2.5 px-3">Subtotal</th>
                              <th className="py-2.5 px-3">KDS Cozinha</th>
                              <th className="py-2.5 px-3 text-right">Lançado Por</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {mesaParaLancar.comandaItens.map((item, idx) => (
                              <tr key={item.id || idx} className="hover:bg-slate-950/60 transition-colors">
                                <td className="py-2.5 px-3 font-mono text-slate-400">{item.horario}</td>
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-white block">{item.nome}</span>
                                  {item.observacoes && (
                                    <span className="text-[11px] text-amber-300 italic block mt-0.5">
                                      "{item.observacoes}"
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-orange-400">
                                  {item.quantidade}x
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-300">
                                  R$ {item.precoUnitario.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                                  R$ {item.subtotal.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase inline-block ${
                                      item.statusKDS === 'pronto'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : item.statusKDS === 'em_preparo'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}
                                  >
                                    {item.statusKDS === 'pronto'
                                      ? 'Pronto / Servido'
                                      : item.statusKDS === 'em_preparo'
                                      ? 'Em Preparo'
                                      : 'Fila da Cozinha'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                                  {item.garcomNome || 'Lucas Oliveira'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totais e Fechamento */}
                      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-xs text-slate-400">
                          <p>
                            Total de pratos/bebidas servidos:{' '}
                            <strong className="text-white">
                              {mesaParaLancar.comandaItens.reduce((acc, it) => acc + it.quantidade, 0)} unidades
                            </strong>
                          </p>
                          <p>
                            10% Serviço Sugerido (opcional):{' '}
                            <strong className="text-slate-300">
                              R$ {((mesaParaLancar.totalConsumo || 0) * 0.1).toFixed(2)}
                            </strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-semibold">Total a Pagar:</span>
                            <span className="text-2xl font-black font-mono text-emerald-400">
                              R$ {(mesaParaLancar.totalConsumo || 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const mesaAlvo = mesaParaLancar;
                              setMesaParaLancar(null);
                              setMesaParaFechar(mesaAlvo);
                              setPessoasDivisao(mesaAlvo.quantidadePessoas || 2);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Split className="w-4 h-4" />
                            <span>Fechar Conta / Checkout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
