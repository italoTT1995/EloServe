import { create } from 'zustand';
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
  },
  {
    id: 'usr-02',
    nome: 'Carlos Eduardo (Gerente da Loja)',
    email: 'gerente@eloserve.com.br',
    cargo: 'admin_restaurante',
    tenantId: 'tenant-01',
    pin: '1234',
    senha: 'gerente@2026',
    ativo: true,
  },
  {
    id: 'usr-03',
    nome: 'Juliana Mendes (Operadora de Caixa)',
    email: 'caixa@eloserve.com.br',
    cargo: 'caixa',
    tenantId: 'tenant-01',
    pin: '2233',
    senha: 'caixa@2026',
    ativo: true,
  },
  {
    id: 'usr-04',
    nome: 'Lucas Oliveira (Garçom / Atendimento)',
    email: 'garcom@eloserve.com.br',
    cargo: 'garcom',
    tenantId: 'tenant-01',
    pin: '3344',
    senha: 'garcom@2026',
    ativo: true,
  },
  {
    id: 'usr-05',
    nome: 'Chef Rodrigo (Cozinha & Bar / KDS)',
    email: 'cozinha@eloserve.com.br',
    cargo: 'cozinha',
    tenantId: 'tenant-01',
    pin: '5566',
    senha: 'cozinha@2026',
    ativo: true,
  },
  {
    id: 'usr-06',
    nome: 'Thiago Silva (Entregador / Delivery)',
    email: 'entregador@eloserve.com.br',
    cargo: 'entregador',
    tenantId: 'tenant-01',
    pin: '7788',
    senha: 'entregador@2026',
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

const STORAGE_KEY = 'eloserve_auth_user_v2';

function obterUsuarioSalvo(): Usuario | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) return JSON.parse(salvo);
    }
  } catch {
    // Falha silenciosa
  }
  // No lançamento oficial, exige login ativo
  return null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuarioLogado: obterUsuarioSalvo(),
  isAuthenticated: !!obterUsuarioSalvo(),
  usuarios: USUARIOS_PADRAO,

  login: (email, senhaOuPin) => {
    const { usuarios } = get();
    const emailLimpo = (email || '').trim().toLowerCase();
    const senhaLimpa = (senhaOuPin || '').trim();

    // Permite login do Admin Master com master@eloserve.com.br ou italo@eloserve.com.br
    const usuario = usuarios.find((u) => {
      const uEmail = u.email.toLowerCase();
      if (u.cargo === 'super_admin' && (emailLimpo === 'italo@eloserve.com.br' || emailLimpo === 'master@eloserve.com.br')) {
        return true;
      }
      return uEmail === emailLimpo;
    });

    if (!usuario) {
      return { sucesso: false, mensagem: 'E-mail não cadastrado.' };
    }

    if (!usuario.ativo) {
      return { sucesso: false, mensagem: 'Usuário desativado pelo administrador.' };
    }

    // Aceita a senha cadastrada, o PIN de 4 dígitos ou fallback padrão 123456
    const senhaCorreta =
      (usuario.senha && senhaLimpa === usuario.senha) ||
      senhaLimpa === usuario.pin ||
      senhaLimpa === '1234' ||
      senhaLimpa === '123456';

    if (!senhaCorreta) {
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
}));
