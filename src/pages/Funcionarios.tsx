import { useState } from 'react';
import {
  Users,
  UserPlus,
  Bike,
  ShieldCheck,
  Calendar,
  DollarSign,
  Cake,
  Award,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  X,
  Search,
  Check,
} from 'lucide-react';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { FuncionarioCompleto, CargoUsuario } from '../types';

export default function Funcionarios() {
  const {
    funcionarios,
    adicionarFuncionario,
    alternarStatusAtivo,
    getAniversariantesDoMes,
    getAniversariantesDeEmpresa,
  } = useFuncionarioStore();

  const [abaAtiva, setAbaAtiva] = useState<'equipe' | 'rh_admin' | 'calendario'>('equipe');
  const [cargoFiltro, setCargoFiltro] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [modalNovo, setModalNovo] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Formulário Novo Funcionário
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    telefoneWhatsApp: '',
    dataNascimento: '',
    dataAdmissao: new Date().toLocaleDateString('pt-BR'),
    email: '',
    cargo: 'garcom' as CargoUsuario,
    salario: 1800,
    fgts: 144,
    inss: 162,
    pin: '1234',
    // Moto se for entregador
    motoModelo: '',
    motoAno: 2023,
    motoCor: '',
    motoPlaca: '',
  });

  function dispararToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  const aniversariantesMes = getAniversariantesDoMes(10); // Outubro
  const aniversariantesEmpresa = getAniversariantesDeEmpresa();

  const funcionariosFiltrados = funcionarios.filter((f) => {
    const matchCargo = cargoFiltro === 'todos' || f.cargo === cargoFiltro;
    const nomeCompleto = `${f.nome} ${f.sobrenome}`.toLowerCase();
    const matchBusca = nomeCompleto.includes(busca.toLowerCase()) || f.email.toLowerCase().includes(busca.toLowerCase());
    return matchCargo && matchBusca;
  });

  function handleSalvarFuncionario(e: React.FormEvent) {
    e.preventDefault();
    adicionarFuncionario({
      nome: form.nome,
      sobrenome: form.sobrenome,
      telefoneWhatsApp: form.telefoneWhatsApp,
      dataNascimento: form.dataNascimento,
      dataAdmissao: form.dataAdmissao,
      email: form.email,
      cargo: form.cargo,
      salario: Number(form.salario),
      fgts: Number(form.fgts),
      inss: Number(form.inss),
      pin: form.pin,
      ativo: true,
      veiculo:
        form.cargo === 'entregador' && form.motoModelo
          ? {
              modelo: form.motoModelo,
              ano: Number(form.motoAno),
              cor: form.motoCor,
              placa: form.motoPlaca,
            }
          : undefined,
    });
    setModalNovo(false);
    dispararToast(`Colaborador "${form.nome} ${form.sobrenome}" cadastrado com sucesso!`);
  }

  function abrirWhatsApp(telefone: string, mensagem: string) {
    const limpo = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${limpo}?text=${encodeURIComponent(mensagem)}`, '_blank');
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Gestão de Funcionários & Equipe</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                RH & Operação
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastros individuais, veículos de entregadores, dados administrativos e calendário de aniversários.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAbaAtiva('equipe')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'equipe'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quadro da Equipe ({funcionarios.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('calendario')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'calendario'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Aniversários & Tempo de Casa ({aniversariantesMes.length + aniversariantesEmpresa.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('rh_admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'rh_admin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dados Administrativos & Salários</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: LISTAGEM E CONTROLE DA EQUIPE                           */}
      {/* ============================================================== */}
      {abaAtiva === 'equipe' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar funcionário..."
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={cargoFiltro}
                onChange={(e) => setCargoFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="todos">Todos os Cargos</option>
                <option value="admin_restaurante">Gerente / Administrador</option>
                <option value="caixa">Operador de Caixa</option>
                <option value="garcom">Garçom</option>
                <option value="cozinha">Cozinha</option>
                <option value="entregador">Entregador (Motoboy)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionariosFiltrados.map((f) => {
              const isEntregador = f.cargo === 'entregador';

              return (
                <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm">
                          {f.nome[0]}{f.sobrenome[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{f.nome} {f.sobrenome}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-950 border border-slate-800 text-slate-300">
                            {f.cargo === 'admin_restaurante' ? 'Gerência' : f.cargo}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => alternarStatusAtivo(f.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                          f.ativo
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-emerald-400">{f.telefoneWhatsApp}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-slate-400 text-[11px]">{f.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400 text-[11px]">Admitido em {f.dataAdmissao}</span>
                      </p>
                    </div>

                    {/* Dados da Moto se for Entregador (Seção 2.4) */}
                    {isEntregador && f.veiculo && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Veículo Cadastrado:</span>
                        </span>
                        <p className="text-white font-bold text-xs">{f.veiculo.modelo} ({f.veiculo.ano})</p>
                        <p className="text-[11px] text-slate-400">
                          Cor: <strong>{f.veiculo.cor}</strong> • Placa: <strong className="font-mono text-emerald-400">{f.veiculo.placa}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">PIN de Acesso: ****</span>
                    <button
                      onClick={() => abrirWhatsApp(f.telefoneWhatsApp, `Olá ${f.nome}! Mensagem da administração do restaurante EloServe.`)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Mensagem</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: CALENDÁRIO DE ANIVERSÁRIOS & TEMPO DE CASA (SEÇÃO 2.6)  */}
      {/* ============================================================== */}
      {abaAtiva === 'calendario' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
            <Cake className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-300">
              <h4 className="font-extrabold text-white">Calendário Integrado de Celebrações</h4>
              <p>
                Identificação automática dos aniversários de nascimento dos funcionários e dos aniversários de admissão (tempo de empresa) para reconhecimento e organização interna.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Aniversariantes de Nascimento */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Cake className="w-4 h-4 text-purple-400" />
                  <span>Aniversariantes Deste Mês (Outubro)</span>
                </h3>
                <span className="text-xs font-mono font-bold text-purple-300">{aniversariantesMes.length} colaboradores</span>
              </div>

              <div className="space-y-2">
                {aniversariantesMes.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{f.nome} {f.sobrenome}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Data: {f.dataNascimento}</p>
                      <span className="text-[9px] uppercase font-bold text-purple-400">{f.cargo}</span>
                    </div>

                    <button
                      onClick={() => abrirWhatsApp(f.telefoneWhatsApp, `Parabéns ${f.nome}! Toda a equipe do restaurante deseja a você um feliz aniversário!`)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <Cake className="w-3.5 h-3.5" />
                      <span>Parabenizar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aniversariantes de Admissão / Tempo de Empresa */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Tempo de Empresa / Vínculo (Outubro)</span>
                </h3>
                <span className="text-xs font-mono font-bold text-amber-300">{aniversariantesEmpresa.length} celebrações</span>
              </div>

              <div className="space-y-2">
                {aniversariantesEmpresa.map(({ funcionario: f, anosDeEmpresa }) => (
                  <div key={f.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{f.nome} {f.sobrenome}</h4>
                      <p className="text-[11px] text-amber-400 font-bold">
                        🎉 Completa {anosDeEmpresa} {anosDeEmpresa === 1 ? 'ano' : 'anos'} de dedicação à empresa!
                      </p>
                      <span className="text-[10px] text-slate-500">Admitido em {f.dataAdmissao}</span>
                    </div>

                    <button
                      onClick={() => abrirWhatsApp(f.telefoneWhatsApp, `Parabéns ${f.nome}! Agradecemos pela dedicação nestes ${anosDeEmpresa} anos de parceria com a nossa equipe!`)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Homenagear</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: DADOS ADMINISTRATIVOS E TRABALHISTAS (SEÇÃO 2.5)        */}
      {/* ============================================================== */}
      {abaAtiva === 'rh_admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Ficha Financeira & Trabalhista dos Funcionários</span>
              </h3>
              <p className="text-xs text-slate-400">
                Acesso restrito à administração. Centraliza salários, FGTS, INSS e períodos de férias.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4">Salário Base</th>
                  <th className="py-3 px-4">FGTS (8%)</th>
                  <th className="py-3 px-4">INSS Estimado</th>
                  <th className="py-3 px-4">Período de Férias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {funcionarios.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {f.nome} {f.sobrenome}
                    </td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{f.cargo}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      R$ {f.salario ? f.salario.toFixed(2) : '1.800,00'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      R$ {f.fgts ? f.fgts.toFixed(2) : '144,00'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      R$ {f.inss ? f.inss.toFixed(2) : '162,00'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {f.periodoFerias || 'Sem período agendado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO COLABORADOR                                        */}
      {/* ============================================================== */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Cadastrar Funcionário</h3>
              <button onClick={() => setModalNovo(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarFuncionario} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Sobrenome *</label>
                  <input
                    type="text"
                    required
                    value={form.sobrenome}
                    onChange={(e) => setForm({ ...form, sobrenome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={form.telefoneWhatsApp}
                    onChange={(e) => setForm({ ...form, telefoneWhatsApp: e.target.value })}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Data de Nascimento (DD/MM/AAAA) *</label>
                  <input
                    type="text"
                    required
                    value={form.dataNascimento}
                    onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                    placeholder="15/10/1995"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Função / Cargo *</label>
                  <select
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    <option value="garcom">Garçom</option>
                    <option value="caixa">Operador de Caixa</option>
                    <option value="cozinha">Cozinha</option>
                    <option value="entregador">Entregador (Delivery)</option>
                    <option value="admin_restaurante">Gerente / Administrador</option>
                  </select>
                </div>
              </div>

              {/* Se for entregador, exibir campos do veículo (Seção 2.4) */}
              {form.cargo === 'entregador' && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2">
                  <p className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    <span>Dados da Motocicleta do Entregador (Seção 2.4)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-0.5">Modelo da Moto:</label>
                      <input
                        type="text"
                        value={form.motoModelo}
                        onChange={(e) => setForm({ ...form, motoModelo: e.target.value })}
                        placeholder="Ex: Honda CG 160"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-0.5">Placa:</label>
                      <input
                        type="text"
                        value={form.motoPlaca}
                        onChange={(e) => setForm({ ...form, motoPlaca: e.target.value })}
                        placeholder="Ex: ABC-1D23"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-0.5">Ano:</label>
                      <input
                        type="number"
                        value={form.motoAno}
                        onChange={(e) => setForm({ ...form, motoAno: parseInt(e.target.value) || 2023 })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-0.5">Cor:</label>
                      <input
                        type="text"
                        value={form.motoCor}
                        onChange={(e) => setForm({ ...form, motoCor: e.target.value })}
                        placeholder="Ex: Vermelha"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
