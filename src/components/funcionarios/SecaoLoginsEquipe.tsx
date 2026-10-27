import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit2,
  X,
  Check,
  Store,
  Crown,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSaaSStore } from '../../store/useSaaSStore';
import { Usuario, CargoUsuario } from '../../types';

interface SecaoLoginsEquipeProps {
  tenantId: string;
  isWhite?: boolean;
  onCadastrarRestauranteComLogin?: () => void;
}

export function SecaoLoginsEquipe({
  tenantId,
  isWhite = false,
  onCadastrarRestauranteComLogin,
}: SecaoLoginsEquipeProps) {
  const {
    usuarios,
    usuarioLogado,
    cadastrarNovoUsuario,
    editarUsuario,
    alternarStatusUsuario,
    redefinirPinOuSenha,
    removerUsuario,
    getDescricaoCargo,
  } = useAuthStore();

  const { tenants } = useSaaSStore();

  const isMaster = usuarioLogado?.cargo === 'super_admin';
  const isVisaoGlobalMaster = isMaster && tenantId === 'global';

  // Filtros
  const [busca, setBusca] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativos' | 'bloqueados'>('todos');
  const [filtroTenantId, setFiltroTenantId] = useState<string>('todos');

  // Controle de visibilidade de PINs
  const [pinsRevelados, setPinsRevelados] = useState<Record<string, boolean>>({});

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalResetAberto, setModalResetAberto] = useState(false);
  const [usuarioAlvo, setUsuarioAlvo] = useState<Usuario | null>(null);

  // Form de Novo Login
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCargo, setFormCargo] = useState<CargoUsuario>('garcom');
  const [formTenantId, setFormTenantId] = useState(
    isVisaoGlobalMaster ? (tenants[0]?.id || 'tenant-01') : (tenantId || 'tenant-01')
  );
  const [formPin, setFormPin] = useState('');
  const [formSenha, setFormSenha] = useState('');

  // Form de Reset
  const [novoPinReset, setNovoPinReset] = useState('');
  const [novaSenhaReset, setNovaSenhaReset] = useState('');

  // Mensagens
  const [toast, setToast] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  function dispararToast(tipo: 'sucesso' | 'erro', texto: string) {
    setToast({ tipo, texto });
    setTimeout(() => setToast(null), 4000);
  }

  function alternarRevelarPin(id: string) {
    setPinsRevelados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function gerarPinAleatorio() {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormPin(pin);
  }

  // Nome do Restaurante para exibição
  const getNomeRestaurante = (tId?: string) => {
    if (!tId || tId === 'global') return 'EloServe Central (Master)';
    const found = tenants.find((t) => t.id === tId);
    return found ? found.nomeFantasia : `Loja (${tId})`;
  };

  // Usuários do escopo atual
  const usuariosDoRestaurante = useMemo(() => {
    return usuarios.filter((u) => {
      if (isVisaoGlobalMaster) {
        if (filtroTenantId === 'todos') return true;
        if (filtroTenantId === 'global') return u.tenantId === 'global' || u.cargo === 'super_admin';
        return u.tenantId === filtroTenantId;
      }
      return u.tenantId === tenantId || (isMaster && u.cargo === 'super_admin');
    });
  }, [usuarios, tenantId, isVisaoGlobalMaster, isMaster, filtroTenantId]);

  // Usuários filtrados por busca, cargo e status
  const usuariosFiltrados = useMemo(() => {
    return usuariosDoRestaurante.filter((u) => {
      const matchCargo = cargoFiltro === 'todos' || u.cargo === cargoFiltro;

      const matchStatus =
        statusFiltro === 'todos'
          ? true
          : statusFiltro === 'ativos'
          ? u.ativo
          : !u.ativo;

      const termo = busca.toLowerCase();
      const nomeRestaurante = getNomeRestaurante(u.tenantId).toLowerCase();
      const matchBusca =
        !busca ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.pin.includes(termo) ||
        (isVisaoGlobalMaster && nomeRestaurante.includes(termo));

      return matchCargo && matchStatus && matchBusca;
    });
  }, [usuariosDoRestaurante, cargoFiltro, statusFiltro, busca, isVisaoGlobalMaster, tenants]);

  // Contadores analíticos
  const totalAtivos = usuariosDoRestaurante.filter((u) => u.ativo).length;
  const totalBloqueados = usuariosDoRestaurante.filter((u) => !u.ativo).length;
  const totalGerentes = usuariosDoRestaurante.filter(
    (u) => u.cargo === 'super_admin' || u.cargo === 'admin_restaurante'
  ).length;
  const totalFrente = usuariosDoRestaurante.filter(
    (u) => u.cargo === 'caixa' || u.cargo === 'garcom'
  ).length;
  const totalCozinha = usuariosDoRestaurante.filter(
    (u) => u.cargo === 'cozinha' || u.cargo === 'entregador'
  ).length;

  function handleCriarLogin(e: React.FormEvent) {
    e.preventDefault();
    const tId =
      formCargo === 'super_admin'
        ? 'global'
        : isVisaoGlobalMaster
        ? formTenantId
        : tenantId;

    const res = cadastrarNovoUsuario({
      nome: formNome,
      email: formEmail,
      cargo: formCargo,
      tenantId: tId,
      pin: formPin,
      senha: formSenha || formPin,
      fazerLoginAposCadastro: false,
    });

    if (res.sucesso && res.usuario) {
      dispararToast('sucesso', `Login de ${res.usuario.nome} criado com sucesso!`);
      setModalNovoAberto(false);
      setFormNome('');
      setFormEmail('');
      setFormPin('');
      setFormSenha('');
    } else {
      dispararToast('erro', res.mensagem || 'Erro ao criar login.');
    }
  }

  function handleToggleStatus(u: Usuario) {
    const res = alternarStatusUsuario(u.id);
    if (res.sucesso) {
      dispararToast(
        'sucesso',
        `Acesso de ${u.nome} ${u.ativo ? 'bloqueado' : 'desbloqueado'} com sucesso!`
      );
    } else {
      dispararToast('erro', res.mensagem || 'Não foi possível alterar status.');
    }
  }

  function handleExcluir(u: Usuario) {
    if (confirm(`Tem certeza que deseja excluir o login de ${u.nome}?`)) {
      const res = removerUsuario(u.id);
      if (res.sucesso) {
        dispararToast('sucesso', `Login de ${u.nome} removido do sistema.`);
      } else {
        dispararToast('erro', res.mensagem || 'Erro ao remover login.');
      }
    }
  }

  function handleConfirmarReset(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioAlvo) return;
    const res = redefinirPinOuSenha(usuarioAlvo.id, novoPinReset, novaSenhaReset);
    if (res.sucesso) {
      dispararToast('sucesso', `PIN/Senha de ${usuarioAlvo.nome} atualizado com sucesso!`);
      setModalResetAberto(false);
      setUsuarioAlvo(null);
      setNovoPinReset('');
      setNovaSenhaReset('');
    } else {
      dispararToast('erro', res.mensagem || 'Erro ao atualizar.');
    }
  }

  const infoCargoForm = getDescricaoCargo(formCargo);

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in ${
            toast.tipo === 'sucesso'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
          }`}
        >
          {toast.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.texto}</span>
        </div>
      )}

      {/* Header do Módulo de Logins */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isWhite
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isVisaoGlobalMaster
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <span className={isWhite ? 'text-slate-900' : 'text-white'}>
                {isVisaoGlobalMaster
                  ? 'Gestão Unificada de Logins & Credenciais'
                  : 'Logins & Hierarquias de Acesso da Equipe'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isVisaoGlobalMaster
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {isVisaoGlobalMaster ? '👑 SaaS Master' : 'Segurança Ativa'}
              </span>
            </h3>
            <p className={`text-xs ${isWhite ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
              {isVisaoGlobalMaster
                ? 'O Admin Master cria restaurantes com login integrado do gestor ou cria e administra credenciais de todas as lojas.'
                : 'Crie logins com PIN de 4 dígitos ou senha para garçons, caixas, cozinheiros e gerentes com permissões isoladas.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Se for Admin Master em visão global, botão de criar restaurante + login */}
          {isVisaoGlobalMaster && onCadastrarRestauranteComLogin && (
            <button
              type="button"
              onClick={onCadastrarRestauranteComLogin}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Store className="w-4 h-4" />
              <span>+ Criar Restaurante & Login</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              gerarPinAleatorio();
              setFormTenantId(isVisaoGlobalMaster ? (tenants[0]?.id || 'tenant-01') : tenantId);
              setModalNovoAberto(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isVisaoGlobalMaster ? '+ Criar Novo Login Avulso' : '+ Criar Login de Funcionário'}</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas de Acessos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Logins Ativos
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalAtivos}{' '}
            <span className="text-xs text-slate-500 font-normal">
              / {usuariosDoRestaurante.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {totalBloqueados > 0 ? `${totalBloqueados} bloqueado(s)` : 'Todos em operação'}
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Gestão (Nível 1 & 2)
            </span>
            <span className="text-xs">👔</span>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{totalGerentes}</div>
          <span className="text-[11px] text-slate-500">
            {isVisaoGlobalMaster ? 'Master & Donos de Lojas' : 'Gerentes e Administradores'}
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Salão & Caixa (Nível 3-4)
            </span>
            <span className="text-xs">📱</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{totalFrente}</div>
          <span className="text-[11px] text-slate-500">Garçons & Operadores PDV</span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Cozinha & Delivery (Nível 5)
            </span>
            <span className="text-xs">🍳</span>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{totalCozinha}</div>
          <span className="text-[11px] text-slate-500">Chef KDS & Entregadores</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={
                isVisaoGlobalMaster
                  ? 'Buscar por nome, e-mail, PIN ou restaurante...'
                  : 'Buscar por nome, e-mail ou PIN...'
              }
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border ${
                isWhite
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
              } focus:outline-none focus:border-amber-400`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Se for Admin Master em visualização global: Filtro por Estabelecimento / Restaurante */}
            {isVisaoGlobalMaster && (
              <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs">
                <Store className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-purple-300 font-bold shrink-0">Loja:</span>
                <select
                  value={filtroTenantId}
                  onChange={(e) => setFiltroTenantId(e.target.value)}
                  className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="todos" className="bg-slate-900 text-white">
                    🏪 Todos os Restaurantes ({tenants.length})
                  </option>
                  <option value="global" className="bg-slate-900 text-white">
                    👑 EloServe Central (Master)
                  </option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.nomeFantasia} ({t.planoId.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro de Status: Todos / Ativos / Bloqueados */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border ${
                isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'ativos', label: '🟢 Ativos' },
                { id: 'bloqueados', label: '🔴 Bloqueados' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFiltro(st.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFiltro === st.id
                      ? isWhite
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtro por Cargos */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Cargo:</span>
          </span>
          {[
            { id: 'todos', label: 'Todos os Cargos' },
            ...(isVisaoGlobalMaster ? [{ id: 'super_admin', label: '👑 Master SaaS' }] : []),
            { id: 'admin_restaurante', label: '👔 Dono / Gerente' },
            { id: 'caixa', label: '🛒 Caixa (PDV)' },
            { id: 'garcom', label: '📱 Garçom / Salão' },
            { id: 'cozinha', label: '🍳 Cozinha (KDS)' },
            { id: 'entregador', label: '🛵 Delivery' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCargoFiltro(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                cargoFiltro === item.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : isWhite
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Logins Cadastrados */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xl ${
          isWhite ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isWhite
                    ? 'bg-slate-50 border-slate-200 text-slate-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <th className="py-3 px-4">Usuário / Colaborador</th>
                {isVisaoGlobalMaster && (
                  <th className="py-3 px-4">Restaurante / Unidade</th>
                )}
                <th className="py-3 px-4">Cargo & Hierarquia</th>
                <th className="py-3 px-4">PIN de Acesso</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {usuariosFiltrados.map((u) => {
                const infoCargo = getDescricaoCargo(u.cargo);
                const pinVisivel = !!pinsRevelados[u.id];

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isWhite ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    } ${!u.ativo ? 'opacity-50' : ''}`}
                  >
                    {/* Nome & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            u.cargo === 'super_admin'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : u.cargo === 'admin_restaurante'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : u.cargo === 'caixa'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : u.cargo === 'garcom'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : u.cargo === 'cozinha'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {infoCargo.icone}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${
                              isWhite ? 'text-slate-900' : 'text-white'
                            } flex items-center gap-1.5`}
                          >
                            <span>{u.nome}</span>
                            {u.id === usuarioLogado?.id && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                                Você
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-[11px] ${
                              isWhite ? 'text-slate-500' : 'text-slate-400'
                            } font-mono`}
                          >
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Restaurante (quando for Master em visão global) */}
                    {isVisaoGlobalMaster && (
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          <Store className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {getNomeRestaurante(u.tenantId)}
                          </span>
                        </span>
                      </td>
                    )}

                    {/* Cargo & Nível */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${infoCargo.badgeCor}`}
                        >
                          {infoCargo.titulo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {infoCargo.nivel}
                        </span>
                      </div>
                    </td>

                    {/* PIN */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold tracking-widest text-xs px-2 py-1 rounded-lg bg-black/40 border border-slate-700">
                          {pinVisivel ? u.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => alternarRevelarPin(u.id)}
                          className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                          title={pinVisivel ? 'Ocultar PIN' : 'Ver PIN'}
                        >
                          {pinVisivel ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === 'usr-master'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          u.ativo
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.ativo ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{u.ativo ? 'Ativo' : 'Bloqueado'}</span>
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUsuarioAlvo(u);
                            setNovoPinReset(u.pin);
                            setNovaSenhaReset(u.senha || '');
                            setModalResetAberto(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Redefinir PIN / Senha"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {u.id !== 'usr-master' && u.id !== usuarioLogado?.id && (
                          <button
                            type="button"
                            onClick={() => handleExcluir(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Excluir Login"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={isVisaoGlobalMaster ? 6 : 5}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    Nenhum login encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: CRIAR NOVO LOGIN                                        */}
      {/* ============================================================== */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl relative ${
              isWhite ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    {isVisaoGlobalMaster ? 'Criar Novo Login (SaaS Master)' : 'Criar Novo Login para Equipe'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina as credenciais e nível de acesso do colaborador.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarLogin} className="space-y-3.5">
              {/* Se for Master Global: Escolha da Loja */}
              {isVisaoGlobalMaster && (
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-purple-400" />
                      <span>Vincular ao Estabelecimento / Loja *</span>
                    </label>
                    {onCadastrarRestauranteComLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalNovoAberto(false);
                          onCadastrarRestauranteComLogin();
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-bold flex items-center gap-1"
                      >
                        <Crown className="w-3 h-3 text-purple-400" />
                        <span>Criar Nova Loja Completa</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={formTenantId}
                    onChange={(e) => setFormTenantId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-900 border-slate-700 text-white'
                    } focus:outline-none focus:border-purple-500`}
                  >
                    <option value="global">👑 EloServe Central (Super Admin)</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        🏪 {t.nomeFantasia} ({t.planoId.toUpperCase()} - {t.cidadeUf})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Matheus Lima"
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                    } focus:outline-none focus:border-[#FF6B00]`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="matheus@restaurante.com"
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                    } focus:outline-none focus:border-[#FF6B00]`}
                  />
                </div>
              </div>

              {/* Cargo & Nível */}
              <div>
                <label className="text-xs font-bold block mb-1">Hierarquia & Permissão *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(
                    [
                      { cargo: 'admin_restaurante', label: '👔 Dono / Gerente', nivel: 'Nível 2' },
                      { cargo: 'caixa', label: '🛒 Caixa (PDV)', nivel: 'Nível 3' },
                      { cargo: 'garcom', label: '📱 Garçom / Salão', nivel: 'Nível 4' },
                      { cargo: 'cozinha', label: '🍳 Cozinha / KDS', nivel: 'Nível 5' },
                      { cargo: 'entregador', label: '🛵 Entregador', nivel: 'Nível 5' },
                      ...(isMaster ? [{ cargo: 'super_admin', label: '👑 Super Admin', nivel: 'Nível 1' }] : []),
                    ] as { cargo: CargoUsuario; label: string; nivel: string }[]
                  ).map((c) => (
                    <button
                      key={c.cargo}
                      type="button"
                      onClick={() => setFormCargo(c.cargo)}
                      className={`p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                        formCargo === c.cargo
                          ? 'bg-[#FF6B00]/20 border-[#FF6B00] font-bold text-white ring-1 ring-[#FF6B00]'
                          : isWhite
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block truncate">{c.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.nivel}</span>
                    </button>
                  ))}
                </div>

                <div className={`mt-2 p-2.5 rounded-xl border text-xs ${infoCargoForm.cor} space-y-1`}>
                  <p className="text-[11px] text-slate-300">{infoCargoForm.descricao}</p>
                </div>
              </div>

              {/* PIN e Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold">PIN de 4 Dígitos *</label>
                    <button
                      type="button"
                      onClick={gerarPinAleatorio}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                    >
                      Gerar Aleatório
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono tracking-widest border ${
                      isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                    } focus:outline-none focus:border-[#FF6B00]`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Senha (Opcional)</label>
                  <input
                    type="text"
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                    placeholder="Caso não queira usar PIN"
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                    } focus:outline-none focus:border-[#FF6B00]`}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-[#E66000] hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-[#FF6B00]/25 cursor-pointer"
                >
                  Salvar e Criar Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REDEFINIR PIN / SENHA                                    */}
      {/* ============================================================== */}
      {modalResetAberto && usuarioAlvo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl relative ${
              isWhite ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">Redefinir PIN / Senha</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalResetAberto(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Atualize as credenciais de acesso para <strong className="text-white">{usuarioAlvo.nome}</strong>:
            </p>

            <form onSubmit={handleConfirmarReset} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Novo PIN (4 dígitos) *</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={novoPinReset}
                  onChange={(e) => setNovoPinReset(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono tracking-widest border ${
                    isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                  } focus:outline-none focus:border-amber-400`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Nova Senha (Opcional)</label>
                <input
                  type="text"
                  value={novaSenhaReset}
                  onChange={(e) => setNovaSenhaReset(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    isWhite ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700'
                  } focus:outline-none focus:border-amber-400`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalResetAberto(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Atualizar Credenciais
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}