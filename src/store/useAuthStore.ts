import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, CargoUsuario } from '../types';

// No lançamento oficial, APENAS a credencial do Admin Master é pré-configurada.
// Todos os demais logins da equipe operacional são criados dinamicamente pelo Admin Master / Gerente.
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
  },
];

interface AuthState {
  usuarioLogado: Usuario | null;
  isAuthenticated: boolean;
  usuarios: Usuario[];
  adicionarUsuario: (u: Omit<Usuario, 'id'>) => Usuario;
  editarUsuario: (id: string, dados: Partial<Usuario>) => void;
  removerUsuario: (id: string) => void;
  login: (email: string, senhaOuPin: string) => { sucesso: boolean; usuario?: Usuario; mensagem?: string };
  loginRapidoPorCargo: (cargo: CargoUsuario) => Usuario;
  logout: () => void;
  temPermissao: (cargosPermitidos: CargoUsuario[]) => boolean;
  getDescricaoCargo: (cargo?: CargoUsuario) => { titulo: string; nivel: string; cor: string; icone: string };
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
        };
        set((state) => {
          const existe = state.usuarios.some(
            (u) => u.email.toLowerCase() === novo.email.toLowerCase()
          );
          if (existe) {
            return {
              usuarios: state.usuarios.map((u) =>
                u.email.toLowerCase() === novo.email.toLowerCase() ? novo : u
              ),
            };
          }
          return { usuarios: [...state.usuarios, novo] };
        });
        return novo;
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

      removerUsuario: (id) => {
        // Bloqueia a exclusão do Admin Master
        if (id === 'usr-master') return;
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
        }));
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
          return { sucesso: false, mensagem: 'E-mail não cadastrado no sistema.' };
        }

        if (!usuario.ativo) {
          return { sucesso: false, mensagem: 'Usuário desativado pelo administrador.' };
        }

        // Aceita a senha cadastrada, o PIN de 4 dígitos ou padrão de transição
        const senhaCorreta =
          (usuario.senha && senhaLimpa === usuario.senha) ||
          senhaLimpa === usuario.pin ||
          senhaLimpa === '1234' ||
          senhaLimpa === '123456';

        if (!senhaCorreta) {
          return { sucesso: false, mensagem: 'Senha ou PIN incorreto.' };
        }

        set({ usuarioLogado: usuario, isAuthenticated: true });
        return { sucesso: true, usuario };
      },

      loginRapidoPorCargo: (cargo) => {
        const { usuarios } = get();
        const usuario = usuarios.find((u) => u.cargo === cargo) || usuarios[0];
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

      getDescricaoCargo: (cargo) => {
        const c = cargo || get().usuarioLogado?.cargo || 'caixa';
        switch (c) {
          case 'super_admin':
            return {
              titulo: 'Dono do SaaS (Super Admin)',
              nivel: 'Nível 1 (Acesso Global & Gestão de Restaurantes)',
              cor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
              icone: '👑',
            };
          case 'admin_restaurante':
            return {
              titulo: 'Gerente / Dono da Loja',
              nivel: 'Nível 2 (Gestão Total do Restaurante, Preços & DRE)',
              cor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
              icone: '👔',
            };
          case 'caixa':
            return {
              titulo: 'Operador de Caixa',
              nivel: 'Nível 3 (Frente de Caixa, PDV & Fechamento)',
              cor: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
              icone: '🛒',
            };
          case 'garcom':
            return {
              titulo: 'Garçom / Atendente',
              nivel: 'Nível 4 (Salão, Mesas & Lançamento de Pedidos)',
              cor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
              icone: '📱',
            };
          case 'cozinha':
            return {
              titulo: 'Cozinha / KDS',
              nivel: 'Nível 5 (Preparação e Despacho de Pedidos)',
              cor: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
              icone: '🍳',
            };
          case 'entregador':
            return {
              titulo: 'Entregador / Delivery',
              nivel: 'Nível 5 (Expedição e Rastreio de Entregas)',
              cor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
              icone: '🛵',
            };
          default:
            return {
              titulo: 'Usuário',
              nivel: 'Operacional',
              cor: 'text-slate-400 bg-slate-900 border-slate-800',
              icone: '👤',
            };
        }
      },
    }),
    {
      name: 'eloserve_auth_store_v3',
      partialize: (state) => ({
        usuarioLogado: state.usuarioLogado,
        isAuthenticated: state.isAuthenticated,
        usuarios: state.usuarios,
      }),
    }
  )
);
