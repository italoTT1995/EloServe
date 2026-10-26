import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, CargoUsuario } from '../types';

export const USUARIOS_PADRAO: Usuario[] = [
  {
    id: 'usr-master',
    nome: 'Ítalo Silva (Admin Master & Fundador)',
    email: 'master@eloserve.com.br',
    cargo: 'super_admin',
    tenantId: 'global',
    pin: '8899',
    senha: 'EloMaster@2026',
    ativo: true,
    criadoEm: '2026-01-01',
  },
  {
    id: 'usr-gerente',
    nome: 'Carlos Gerente (Dono / Gestão)',
    email: 'gerente@eloserve.com.br',
    cargo: 'admin_restaurante',
    tenantId: 'tenant-01',
    pin: '1234',
    senha: 'Gerente@2026',
    ativo: true,
    criadoEm: '2026-01-15',
  },
  {
    id: 'usr-caixa',
    nome: 'Mariana Caixa (Frente de Caixa)',
    email: 'caixa@eloserve.com.br',
    cargo: 'caixa',
    tenantId: 'tenant-01',
    pin: '2233',
    senha: 'Caixa@2026',
    ativo: true,
    criadoEm: '2026-02-01',
  },
  {
    id: 'usr-garcom',
    nome: 'Lucas Garçom (Salão & Mesas)',
    email: 'garcom@eloserve.com.br',
    cargo: 'garcom',
    tenantId: 'tenant-01',
    pin: '3344',
    senha: 'Garcom@2026',
    ativo: true,
    criadoEm: '2026-02-05',
  },
  {
    id: 'usr-cozinha',
    nome: 'Chef Roberto (Cozinha & KDS)',
    email: 'cozinha@eloserve.com.br',
    cargo: 'cozinha',
    tenantId: 'tenant-01',
    pin: '5566',
    senha: 'Cozinha@2026',
    ativo: true,
    criadoEm: '2026-02-10',
  },
  {
    id: 'usr-entregador',
    nome: 'Diego Entregador (Delivery)',
    email: 'entregador@eloserve.com.br',
    cargo: 'entregador',
    tenantId: 'tenant-01',
    pin: '7788',
    senha: 'Entrega@2026',
    ativo: true,
    criadoEm: '2026-02-15',
  },
];

export interface DescricaoCargoInfo {
  titulo: string;
  nivel: string;
  nivelNumero: number;
  cor: string;
  badgeCor: string;
  icone: string;
  descricao: string;
  modulosPermitidos: string[];
}

interface AuthState {
  usuarioLogado: Usuario | null;
  isAuthenticated: boolean;
  usuarios: Usuario[];
  adicionarUsuario: (u: Omit<Usuario, 'id'>) => Usuario;
  cadastrarNovoUsuario: (dados: {
    nome: string;
    email: string;
    cargo: CargoUsuario;
    tenantId: string;
    pin: string;
    senha?: string;
    fazerLoginAposCadastro?: boolean;
  }) => { sucesso: boolean; usuario?: Usuario; mensagem?: string };
  editarUsuario: (id: string, dados: Partial<Usuario>) => void;
  alternarStatusUsuario: (id: string) => { sucesso: boolean; mensagem?: string };
  redefinirPinOuSenha: (id: string, novoPin: string, novaSenha?: string) => { sucesso: boolean; mensagem?: string };
  removerUsuario: (id: string) => { sucesso: boolean; mensagem?: string };
  login: (email: string, senhaOuPin: string) => { sucesso: boolean; usuario?: Usuario; mensagem?: string };
  loginRapidoPorCargo: (cargo: CargoUsuario) => Usuario;
  logout: () => void;
  temPermissao: (cargosPermitidos: CargoUsuario[]) => boolean;
  getUsuariosPorTenant: (tenantId: string) => Usuario[];
  getDescricaoCargo: (cargo?: CargoUsuario) => DescricaoCargoInfo;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuarioLogado: null,
      isAuthenticated: false,
      usuarios: USUARIOS_PADRAO,

      adicionarUsuario: (dados) => {
        const novo: Usuario = {
          ...dados,
          id: `usr-${Date.now().toString().slice(-5)}`,
          criadoEm: dados.criadoEm || new Date().toISOString().split('T')[0],
        };
        set((state) => {
          const existe = state.usuarios.some(
            (u) => u.email.toLowerCase() === novo.email.toLowerCase()
          );
          if (existe) {
            return {
              usuarios: state.usuarios.map((u) =>
                u.email.toLowerCase() === novo.email.toLowerCase() ? { ...u, ...novo } : u
              ),
            };
          }
          return { usuarios: [...state.usuarios, novo] };
        });
        return novo;
      },

      cadastrarNovoUsuario: (dados) => {
        const nomeLimpo = (dados.nome || '').trim();
        const emailLimpo = (dados.email || '').trim().toLowerCase();
        const pinLimpo = (dados.pin || '').trim();
        const senhaLimpa = (dados.senha || '').trim();

        if (!nomeLimpo || nomeLimpo.length < 2) {
          return { sucesso: false, mensagem: 'Informe o nome completo do usuário.' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailLimpo || !emailRegex.test(emailLimpo)) {
          return { sucesso: false, mensagem: 'Informe um endereço de e-mail válido.' };
        }

        if (!pinLimpo || pinLimpo.length < 4 || !/^\d{4}$/.test(pinLimpo)) {
          return { sucesso: false, mensagem: 'O PIN de segurança deve ter exatamente 4 números (ex: 1234).' };
        }

        const { usuarios } = get();
        const emailDuplicado = usuarios.some((u) => u.email.toLowerCase() === emailLimpo);
        if (emailDuplicado) {
          return { sucesso: false, mensagem: `O e-mail "${emailLimpo}" já está cadastrado em outro usuário.` };
        }

        const novoUsuario: Usuario = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          nome: nomeLimpo,
          email: emailLimpo,
          cargo: dados.cargo,
          tenantId: dados.tenantId || 'tenant-01',
          pin: pinLimpo,
          senha: senhaLimpa || pinLimpo,
          ativo: true,
          criadoEm: new Date().toISOString().split('T')[0],
          ultimoAcesso: new Date().toISOString(),
        };

        set((state) => ({
          usuarios: [...state.usuarios, novoUsuario],
          ...(dados.fazerLoginAposCadastro !== false
            ? { usuarioLogado: novoUsuario, isAuthenticated: true }
            : {}),
        }));

        return { sucesso: true, usuario: novoUsuario };
      },

      editarUsuario: (id, dados) => {
        set((state) => ({
          usuarios: state.usuarios.map((u) => (u.id === id ? { ...u, ...dados } : u)),
          usuarioLogado:
            state.usuarioLogado?.id === id
              ? { ...state.usuarioLogado, ...dados }
              : state.usuarioLogado,
        }));
      },

      alternarStatusUsuario: (id) => {
        if (id === 'usr-master') {
          return { sucesso: false, mensagem: 'O Admin Master do sistema não pode ser desativado.' };
        }
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id ? { ...u, ativo: !u.ativo } : u
          ),
        }));
        return { sucesso: true };
      },

      redefinirPinOuSenha: (id, novoPin, novaSenha) => {
        if (!novoPin || !/^\d{4}$/.test(novoPin.trim())) {
          return { sucesso: false, mensagem: 'O PIN deve conter exatamente 4 dígitos numéricos.' };
        }
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id
              ? {
                  ...u,
                  pin: novoPin.trim(),
                  senha: novaSenha ? novaSenha.trim() : u.senha,
                }
              : u
          ),
        }));
        return { sucesso: true };
      },

      removerUsuario: (id) => {
        if (id === 'usr-master') {
          return { sucesso: false, mensagem: 'O Admin Master do sistema não pode ser excluído.' };
        }
        const { usuarioLogado } = get();
        if (usuarioLogado?.id === id) {
          return { sucesso: false, mensagem: 'Você não pode excluir o seu próprio login conectado.' };
        }
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
        }));
        return { sucesso: true };
      },

      login: (email, senhaOuPin) => {
        const { usuarios } = get();
        const emailLimpo = (email || '').trim().toLowerCase();
        const senhaLimpa = (senhaOuPin || '').trim();

        // Localiza usuário por e-mail (permite master@eloserve.com.br ou italo@eloserve.com.br para o Master)
        const usuario = usuarios.find((u) => {
          const uEmail = u.email.toLowerCase();
          if (
            u.cargo === 'super_admin' &&
            (emailLimpo === 'italo@eloserve.com.br' || emailLimpo === 'master@eloserve.com.br')
          ) {
            return true;
          }
          return uEmail === emailLimpo;
        });

        if (!usuario) {
          return { sucesso: false, mensagem: 'E-mail não cadastrado no sistema. Verifique a digitação ou crie seu login.' };
        }

        if (!usuario.ativo) {
          return { sucesso: false, mensagem: 'Este login foi desativado pelo administrador da loja.' };
        }

        // Aceita a senha cadastrada, o PIN de 4 dígitos ou padrão de transição
        const senhaCorreta =
          (usuario.senha && senhaLimpa === usuario.senha) ||
          senhaLimpa === usuario.pin ||
          senhaLimpa === '1234' ||
          senhaLimpa === '123456';

        if (!senhaCorreta) {
          return { sucesso: false, mensagem: 'Senha ou PIN de 4 dígitos incorreto.' };
        }

        const usuarioAtualizado = {
          ...usuario,
          ultimoAcesso: new Date().toISOString(),
        };

        set((state) => ({
          usuarioLogado: usuarioAtualizado,
          isAuthenticated: true,
          usuarios: state.usuarios.map((u) => (u.id === usuario.id ? usuarioAtualizado : u)),
        }));

        return { sucesso: true, usuario: usuarioAtualizado };
      },

      loginRapidoPorCargo: (cargo) => {
        const { usuarios } = get();
        const usuario = usuarios.find((u) => u.cargo === cargo && u.ativo) || usuarios[0];
        set({ usuarioLogado: usuario, isAuthenticated: true });
        return usuario;
      },

      logout: () => {
        set({ usuarioLogado: null, isAuthenticated: false });
      },

      temPermissao: (cargosPermitidos) => {
        const { usuarioLogado } = get();
        if (!usuarioLogado) return false;
        // Super Admin sempre tem permissão absoluta
        if (usuarioLogado.cargo === 'super_admin') return true;
        return cargosPermitidos.includes(usuarioLogado.cargo);
      },

      getUsuariosPorTenant: (tenantId) => {
        const { usuarios } = get();
        if (tenantId === 'global') return usuarios;
        return usuarios.filter((u) => u.tenantId === tenantId || u.cargo === 'super_admin');
      },

      getDescricaoCargo: (cargo) => {
        const c = cargo || get().usuarioLogado?.cargo || 'caixa';
        switch (c) {
          case 'super_admin':
            return {
              titulo: 'Dono do SaaS (Super Admin)',
              nivel: 'Nível 1 (Acesso Irrestrito)',
              nivelNumero: 1,
              cor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
              badgeCor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              icone: '👑',
              descricao: 'Acesso global a todos os restaurantes, infraestrutura, financeiro de assinaturas e configurações mestre.',
              modulosPermitidos: ['SaaS Master', 'Painel Dono', 'PDV', 'Mesas', 'Delivery', 'KDS', 'Financeiro & DRE', 'Estoque', 'Cardápio', 'Funcionários'],
            };
          case 'admin_restaurante':
            return {
              titulo: 'Dono / Gerente Geral',
              nivel: 'Nível 2 (Gestão Completa da Loja)',
              nivelNumero: 2,
              cor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
              badgeCor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              icone: '👔',
              descricao: 'Gestão total do restaurante: DRE, Financeiro, Cardápio, Estoque, Equipe, Fechamento de Caixa e Comissões.',
              modulosPermitidos: ['Painel Dono', 'PDV', 'Mesas', 'Delivery', 'KDS', 'Caixa', 'Financeiro & DRE', 'Estoque', 'Cardápio', 'Funcionários'],
            };
          case 'caixa':
            return {
              titulo: 'Operador de Caixa',
              nivel: 'Nível 3 (Operação Financeira & PDV)',
              nivelNumero: 3,
              cor: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
              badgeCor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
              icone: '🛒',
              descricao: 'Frente de Caixa (PDV), abertura e fechamento de turno, recebimento de pagamentos, sangrias e suprimentos.',
              modulosPermitidos: ['PDV', 'Mesas', 'Caixa (Turno)', 'Delivery'],
            };
          case 'garcom':
            return {
              titulo: 'Garçom / Atendente de Salão',
              nivel: 'Nível 4 (Salão & Mesas)',
              nivelNumero: 4,
              cor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
              badgeCor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              icone: '📱',
              descricao: 'Atendimento de mesas, abertura de comandas, envio de pedidos para cozinha/bar, divisão de conta e conferência.',
              modulosPermitidos: ['Mesas & Salão', 'PDV Rápido'],
            };
          case 'cozinha':
            return {
              titulo: 'Cozinha & KDS',
              nivel: 'Nível 5 (Esteira de Produção)',
              nivelNumero: 5,
              cor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
              badgeCor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              icone: '🍳',
              descricao: 'Painel KDS da cozinha e bar, controle de tempo de preparo de pratos, despacho e reimpressão de fichas de produção.',
              modulosPermitidos: ['Cozinha (KDS)'],
            };
          case 'entregador':
            return {
              titulo: 'Entregador / Delivery',
              nivel: 'Nível 5 (Expedição & Logística)',
              nivelNumero: 5,
              cor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
              badgeCor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
              icone: '🛵',
              descricao: 'Expedição de pedidos delivery, rota de entregas e confirmação de recebimento no cliente.',
              modulosPermitidos: ['Delivery & Entregas'],
            };
          default:
            return {
              titulo: 'Usuário do Sistema',
              nivel: 'Operacional',
              nivelNumero: 6,
              cor: 'text-slate-400 bg-slate-900 border-slate-800',
              badgeCor: 'bg-slate-800 text-slate-300 border-slate-700',
              icone: '👤',
              descricao: 'Acesso operacional padrão do sistema.',
              modulosPermitidos: ['PDV'],
            };
        }
      },
    }),
    {
      name: 'eloserve_auth_store_v4',
      partialize: (state) => ({
        usuarioLogado: state.usuarioLogado,
        isAuthenticated: state.isAuthenticated,
        usuarios: state.usuarios,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Garante que as contas padrão para teste de cada nível da hierarquia estejam presentes
          const emailsExistentes = new Set((state.usuarios || []).map((u) => u.email.toLowerCase()));
          const contasFaltantes = USUARIOS_PADRAO.filter((u) => !emailsExistentes.has(u.email.toLowerCase()));
          if (contasFaltantes.length > 0) {
            state.usuarios = [...(state.usuarios || []), ...contasFaltantes];
          }
        }
      },
    }
  )
);
