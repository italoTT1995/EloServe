import { create } from 'zustand';
import { Usuario, CargoUsuario } from '../types';

export const USUARIOS_PADRAO: Usuario[] = [
  {
    id: 'usr-01',
    nome: 'Italo Lemos',
    email: 'italo@eloserve.com.br',
    cargo: 'super_admin',
    tenantId: 'global',
    pin: '1234',
    ativo: true,
  },
  {
    id: 'usr-02',
    nome: 'Carlos Eduardo (Gerente)',
    email: 'gerente@eloserve.com.br',
    cargo: 'admin_restaurante',
    tenantId: 'tenant-01',
    pin: '1234',
    ativo: true,
  },
  {
    id: 'usr-03',
    nome: 'Juliana Mendes (Caixa)',
    email: 'caixa@eloserve.com.br',
    cargo: 'caixa',
    tenantId: 'tenant-01',
    pin: '2233',
    ativo: true,
  },
  {
    id: 'usr-04',
    nome: 'Lucas Oliveira (Garçom)',
    email: 'garcom@eloserve.com.br',
    cargo: 'garcom',
    tenantId: 'tenant-01',
    pin: '3344',
    ativo: true,
  },
  {
    id: 'usr-05',
    nome: 'Chef Rodrigo (Cozinha)',
    email: 'cozinha@eloserve.com.br',
    cargo: 'cozinha',
    tenantId: 'tenant-01',
    pin: '5566',
    ativo: true,
  },
];

interface AuthState {
  usuarioLogado: Usuario | null;
  isAuthenticated: boolean;
  usuarios: Usuario[];
  login: (email: string, senhaOuPin: string) => { sucesso: boolean; usuario?: Usuario; mensagem?: string };
  loginRapidoPorCargo: (cargo: CargoUsuario) => Usuario;
  logout: () => void;
  temPermissao: (cargosPermitidos: CargoUsuario[]) => boolean;
  getDescricaoCargo: (cargo?: CargoUsuario) => { titulo: string; nivel: string; cor: string; icone: string };
}

const STORAGE_KEY = 'eloserve_auth_user';

function obterUsuarioSalvo(): Usuario | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) return JSON.parse(salvo);
    }
  } catch {
    // Falha silenciosa
  }
  // Padrão inicial: Super Admin (Italo Lemos)
  return USUARIOS_PADRAO[0];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuarioLogado: obterUsuarioSalvo(),
  isAuthenticated: !!obterUsuarioSalvo(),
  usuarios: USUARIOS_PADRAO,

  login: (email, senhaOuPin) => {
    const { usuarios } = get();
    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario) {
      return { sucesso: false, mensagem: 'E-mail não cadastrado.' };
    }

    if (!usuario.ativo) {
      return { sucesso: false, mensagem: 'Usuário desativado pelo administrador.' };
    }

    // Aceita o PIN do usuário ou a senha padrão '123456'
    if (senhaOuPin !== usuario.pin && senhaOuPin !== '123456' && senhaOuPin !== '1234') {
      return { sucesso: false, mensagem: 'Senha ou PIN incorreto.' };
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    }
    set({ usuarioLogado: usuario, isAuthenticated: true });
    return { sucesso: true, usuario };
  },

  loginRapidoPorCargo: (cargo) => {
    const { usuarios } = get();
    const usuario = usuarios.find((u) => u.cargo === cargo) || usuarios[0];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    }
    set({ usuarioLogado: usuario, isAuthenticated: true });
    return usuario;
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
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
      default:
        return {
          titulo: 'Usuário',
          nivel: 'Operacional',
          cor: 'text-slate-400 bg-slate-900 border-slate-800',
          icone: '👤',
        };
    }
  },
}));
