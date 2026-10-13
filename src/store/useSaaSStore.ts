import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenantRestaurante, PlanoAssinatura, TipoPlanoSaaS, StatusAssinatura } from '../types';

export const PLANOS_DISPONIVEIS: PlanoAssinatura[] = [
  {
    id: 'starter',
    nome: 'EloServe Starter',
    precoMensal: 99.0,
    precoAnual: 990.0,
    descricao: 'Ideal para pequenos cafés, lanchonetes e bares com operação essencial.',
    regrasTexto: [
      'Limite de 1 terminal PDV frente de caixa por estabelecimento',
      'Até 10 mesas simultâneas com controle no salão',
      'Cardápio digital via QR Code interativo nas mesas',
      'Impressão automática em impressora térmica (ESC/POS)',
      'Sem painel de cozinha KDS e sem automação de WhatsApp',
      'Tolerância de 3 dias de atraso na fatura antes da suspensão automática',
      'Período padrão de degustação: 7 dias grátis',
    ],
    limites: {
      maxMesas: 10,
      maxCaixasSimultaneos: 1,
      kdsIncluso: false,
      whatsappIAIncluso: false,
      relatoriosAvancados: false,
      suportePrioritario: false,
      cardapioQrCodeIncluso: true,
      garcomMobileIncluso: false,
      impressaoTermicaInclusa: true,
      controleEstoqueIncluso: false,
      maxUsuarios: 3,
      maxItensCardapio: 50,
      maxPedidosMes: 500,
      diasTrialPadrao: 7,
      diasToleranciaAtraso: 3,
      taxaAdesao: 0,
    },
  },
  {
    id: 'pro',
    nome: 'EloServe Pro',
    precoMensal: 199.0,
    precoAnual: 1990.0,
    descricao: 'Completo para restaurantes médios e pizzarias de alto volume.',
    destaque: true,
    regrasTexto: [
      'Mesas ilimitadas no salão e até 5 caixas PDV simultâneos',
      'Painel KDS de Cozinha e Bar habilitado em tempo real',
      'Comanda Mobile para Garçons atenderem direto nas mesas',
      'Controle de Estoque e Ficha Técnica de insumos e pratos',
      'Relatórios gerenciais avançados de faturamento e vendas',
      'Tolerância de 5 dias de atraso na fatura com aviso amigável no WhatsApp',
      'Período padrão de degustação: 7 dias grátis',
    ],
    limites: {
      maxMesas: 999,
      maxCaixasSimultaneos: 5,
      kdsIncluso: true,
      whatsappIAIncluso: false,
      relatoriosAvancados: true,
      suportePrioritario: true,
      cardapioQrCodeIncluso: true,
      garcomMobileIncluso: true,
      impressaoTermicaInclusa: true,
      controleEstoqueIncluso: true,
      maxUsuarios: 10,
      maxItensCardapio: 999,
      maxPedidosMes: 9999,
      diasTrialPadrao: 7,
      diasToleranciaAtraso: 5,
      taxaAdesao: 0,
    },
  },
  {
    id: 'enterprise',
    nome: 'EloServe Enterprise & IA',
    precoMensal: 299.0,
    precoAnual: 2990.0,
    descricao: 'A máquina definitiva com atendente inteligente no WhatsApp 24h e automação total.',
    regrasTexto: [
      'EloBot Inteligência Artificial no WhatsApp oficial 24 horas por dia',
      'Mesas, Caixas PDV, Itens de Cardápio e Usuários 100% Ilimitados',
      'Painel KDS Cozinha com múltiplos setores (Cozinha, Forno, Bar, Sobremesas)',
      'Relatórios DRE completos e cálculo de lucratividade em tempo real',
      'Suporte VIP Prioritário 24/7 com canal direto com o Franqueador',
      'Tolerância estendida de 7 dias de atraso na fatura',
      'Período de degustação estendido: 14 dias grátis',
      'Treinamento operacional remoto de equipe incluso sem taxa adicional',
    ],
    limites: {
      maxMesas: 999,
      maxCaixasSimultaneos: 99,
      kdsIncluso: true,
      whatsappIAIncluso: true,
      relatoriosAvancados: true,
      suportePrioritario: true,
      cardapioQrCodeIncluso: true,
      garcomMobileIncluso: true,
      impressaoTermicaInclusa: true,
      controleEstoqueIncluso: true,
      maxUsuarios: 999,
      maxItensCardapio: 999,
      maxPedidosMes: 99999,
      diasTrialPadrao: 14,
      diasToleranciaAtraso: 7,
      taxaAdesao: 0,
    },
  },
];

export type AbaMasterSaaS =
  | 'restaurantes'
  | 'financeiro'
  | 'editor_loja'
  | 'planos'
  | 'regras_planos'
  | 'whatsapp'
  | 'config'
  | 'dre_saas'
  | 'avisos_globais'
  | 'auditoria';

export interface CustosInfraSaaS {
  cloudVps: number;
  evolutionWhatsapp: number;
  taxaGatewayPct: number;
  impostoSimplesPct: number;
  suporteMarketing: number;
}

export interface AvisoGlobalSaaS {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'alerta' | 'urgente' | 'novidade';
  destinoTenantId: string; // 'todos' ou id de restaurante
  ativo: boolean;
  criadoEm: string;
}

export interface LogAuditoriaSaaS {
  id: string;
  dataHora: string;
  usuarioNome: string;
  acao: string;
  categoria: 'restaurante' | 'plano' | 'financeiro' | 'sistema' | 'cobranca' | 'seguranca';
  detalhes: string;
}

interface SaaSState {
  planos: PlanoAssinatura[];
  tenants: TenantRestaurante[];
  tenantAtivoId: string;
  abaAtivaMaster: AbaMasterSaaS;
  tenantEmEdicaoId: string | null;
  custosInfra: CustosInfraSaaS;
  avisos: AvisoGlobalSaaS[];
  logsAuditoria: LogAuditoriaSaaS[];
  setAbaAtivaMaster: (aba: AbaMasterSaaS) => void;
  setTenantEmEdicaoId: (id: string | null) => void;
  selecionarTenant: (tenantId: string) => void;
  adicionarTenant: (novo: Omit<TenantRestaurante, 'id' | 'criadoEm'>) => void;
  atualizarDadosTenant: (tenantId: string, dados: Partial<TenantRestaurante>) => void;
  atualizarStatusAssinatura: (tenantId: string, status: StatusAssinatura) => void;
  mudarPlanoTenant: (tenantId: string, planoId: TipoPlanoSaaS) => void;
  atualizarPlano: (planoId: TipoPlanoSaaS, dados: Partial<PlanoAssinatura>, atualizarAssinantes?: boolean) => void;
  atualizarCustosInfra: (novos: Partial<CustosInfraSaaS>) => void;
  adicionarAviso: (aviso: Omit<AvisoGlobalSaaS, 'id' | 'criadoEm'>) => void;
  alternarStatusAviso: (id: string) => void;
  removerAviso: (id: string) => void;
  registrarLogAuditoria: (acao: string, categoria: LogAuditoriaSaaS['categoria'], detalhes: string) => void;
  getAvisosAtivosParaTenant: (tenantId: string) => AvisoGlobalSaaS[];
  getTenantAtivo: () => TenantRestaurante;
  getMRR: () => number;
  getTotalAtivos: () => number;
  getTotalTrials: () => number;
  getTotalAtrasados: () => number;
}

export const TENANT_GLOBAL: TenantRestaurante = {
  id: 'global',
  nomeFantasia: 'EloServe SaaS (Visão Global)',
  razaoSocial: 'EloServe Tecnologia e Gestão SaaS LTDA',
  documento: '45.123.890/0001-12',
  responsavelNome: 'Italo Lemos (Super Admin)',
  telefoneWhatsApp: '+55 (31) 97182-6083',
  email: 'italo@eloserve.com.br',
  cidadeUf: 'Brasil (Multi-Tenant)',
  planoId: 'enterprise',
  statusAssinatura: 'ativo',
  valorMensalidade: 0,
  dataInicio: '01/01/2026',
  proximoVencimento: 'Recorrente',
  instanciaWhatsAppConectada: true,
  criadoEm: '2026-01-01',
};

const TENANTS_INICIAIS: TenantRestaurante[] = [
  {
    id: 'tenant-01',
    nomeFantasia: 'Churrascaria & Parrilla Fogo de Minas',
    razaoSocial: 'Fogo de Minas Carnes Nobres LTDA',
    documento: '45.123.890/0001-12',
    responsavelNome: 'Rodrigo Alvarenga',
    telefoneWhatsApp: '+55 (31) 98112-9900',
    email: 'gerencia@fogodeminas.com.br',
    cidadeUf: 'Belo Horizonte / MG',
    planoId: 'enterprise',
    statusAssinatura: 'ativo',
    valorMensalidade: 299.0,
    dataInicio: '01/01/2026',
    proximoVencimento: '15/11/2026',
    instanciaWhatsAppConectada: true,
    criadoEm: '2026-01-01',
  },
  {
    id: 'tenant-02',
    nomeFantasia: 'Pizzaria & Trattoria Bella Napoli',
    razaoSocial: 'Bella Napoli Forno a Lenha ME',
    documento: '28.987.654/0001-33',
    responsavelNome: 'Giovanni Rossi',
    telefoneWhatsApp: '+55 (31) 98455-1122',
    email: 'contato@bellanapoli.com.br',
    cidadeUf: 'Belo Horizonte / MG',
    planoId: 'pro',
    statusAssinatura: 'ativo',
    valorMensalidade: 199.0,
    dataInicio: '10/02/2026',
    proximoVencimento: '10/11/2026',
    instanciaWhatsAppConectada: false,
    criadoEm: '2026-02-10',
  },
  {
    id: 'tenant-03',
    nomeFantasia: 'Smash Burguer Mania',
    razaoSocial: 'Burguer Mania Lanches EIRELI',
    documento: '33.456.789/0001-88',
    responsavelNome: 'Camila Fernandes',
    telefoneWhatsApp: '+55 (31) 99123-4567',
    email: 'financeiro@burguermania.com.br',
    cidadeUf: 'Contagem / MG',
    planoId: 'enterprise',
    statusAssinatura: 'trial',
    diasRestantesTrial: 5,
    valorMensalidade: 299.0,
    dataInicio: '04/10/2026',
    proximoVencimento: '11/10/2026',
    instanciaWhatsAppConectada: true,
    criadoEm: '2026-10-04',
  },
  {
    id: 'tenant-04',
    nomeFantasia: 'Boteco & Espetos do Silva',
    razaoSocial: 'Silva Bar e Restaurante ME',
    documento: '19.876.543/0001-99',
    responsavelNome: 'Marcos Silva',
    telefoneWhatsApp: '+55 (31) 98765-4321',
    email: 'silva.espetos@gmail.com',
    cidadeUf: 'Betim / MG',
    planoId: 'starter',
    statusAssinatura: 'atrasado',
    valorMensalidade: 99.0,
    dataInicio: '15/03/2026',
    proximoVencimento: '05/10/2026',
    instanciaWhatsAppConectada: false,
    criadoEm: '2026-03-15',
  },
  {
    id: 'tenant-05',
    nomeFantasia: 'Sushi Prime Oriental',
    razaoSocial: 'Prime Culinaria Asiatica LTDA',
    documento: '51.222.333/0001-44',
    responsavelNome: 'Juliana Tanaka',
    telefoneWhatsApp: '+55 (31) 99654-7890',
    email: 'gerencia@sushiprime.com.br',
    cidadeUf: 'Nova Lima / MG',
    planoId: 'pro',
    statusAssinatura: 'ativo',
    valorMensalidade: 199.0,
    dataInicio: '20/05/2026',
    proximoVencimento: '20/10/2026',
    instanciaWhatsAppConectada: false,
    criadoEm: '2026-05-20',
  },
];

const CUSTOS_INFRA_PADRAO: CustosInfraSaaS = {
  cloudVps: 180.0,
  evolutionWhatsapp: 120.0,
  taxaGatewayPct: 2.9,
  impostoSimplesPct: 6.0,
  suporteMarketing: 350.0,
};

const AVISOS_INICIAIS: AvisoGlobalSaaS[] = [
  {
    id: 'aviso-01',
    titulo: 'Novos Módulos: Estoque Inteligente & Delivery',
    mensagem: 'Liberada a gestão com margem de segurança de 5 unidades, controle de sobras do dia anterior e rotas Google Maps.',
    tipo: 'novidade',
    destinoTenantId: 'todos',
    ativo: true,
    criadoEm: '13/10/2026 09:30',
  },
  {
    id: 'aviso-02',
    titulo: 'Otimização Preventiva na Madrugada',
    mensagem: 'Hoje entre 03:00 e 03:15 os servidores passarão por otimização de rotina. Nenhuma perda de comanda ou dado ocorrerá.',
    tipo: 'info',
    destinoTenantId: 'todos',
    ativo: true,
    criadoEm: '12/10/2026 14:00',
  },
];

const LOGS_INICIAIS: LogAuditoriaSaaS[] = [
  {
    id: 'log-01',
    dataHora: '13/10/2026 10:15',
    usuarioNome: 'Super Admin (Dono do SaaS)',
    acao: 'Atualização do DRE Executivo',
    categoria: 'financeiro',
    detalhes: 'Configurada a apuração de ROL, COGS Cloud, Lucro Bruto e Projeção de Valuation.',
  },
  {
    id: 'log-02',
    dataHora: '13/10/2026 09:30',
    usuarioNome: 'Super Admin (Dono do SaaS)',
    acao: 'Publicação de Aviso Global',
    categoria: 'sistema',
    detalhes: 'Disparado comunicado geral de liberação dos módulos de Estoque Inteligente.',
  },
  {
    id: 'log-03',
    dataHora: '12/10/2026 16:10',
    usuarioNome: 'Super Admin (Dono do SaaS)',
    acao: 'Alteração de Regras de Plano',
    categoria: 'plano',
    detalhes: 'Plano Pro atualizado para permitir mesas ilimitadas e até 5 caixas simultâneos.',
  },
  {
    id: 'log-04',
    dataHora: '11/10/2026 11:20',
    usuarioNome: 'Super Admin (Dono do SaaS)',
    acao: 'Cadastro de Restaurante',
    categoria: 'restaurante',
    detalhes: 'Cadastrado cliente Smash Burguer Mania no plano Enterprise (Trial 7 dias).',
  },
];

export const useSaaSStore = create<SaaSState>()(
  persist(
    (set, get) => ({
      planos: PLANOS_DISPONIVEIS,
      tenants: TENANTS_INICIAIS,
      tenantAtivoId: 'global',
      abaAtivaMaster: 'restaurantes',
      tenantEmEdicaoId: 'tenant-01',
      custosInfra: CUSTOS_INFRA_PADRAO,
      avisos: AVISOS_INICIAIS,
      logsAuditoria: LOGS_INICIAIS,

      setAbaAtivaMaster: (aba) => set({ abaAtivaMaster: aba }),
      setTenantEmEdicaoId: (id) => set({ tenantEmEdicaoId: id }),

      selecionarTenant: (tenantId: string) => {
        set({
          tenantAtivoId: tenantId,
          tenantEmEdicaoId: tenantId === 'global' ? 'tenant-01' : tenantId,
        });
      },

      adicionarTenant: (novo) => {
        const id = `tenant-${Date.now().toString().slice(-4)}`;
        const criadoEm = new Date().toISOString().split('T')[0];
        const tenantCompleto: TenantRestaurante = {
          ...novo,
          id,
          criadoEm,
        };
        set((state) => ({
          tenants: [tenantCompleto, ...state.tenants],
        }));
      },

      atualizarDadosTenant: (tenantId, dados) => {
        set((state) => ({
          tenants: state.tenants.map((t) =>
            t.id === tenantId ? { ...t, ...dados } : t
          ),
        }));
      },

      atualizarStatusAssinatura: (tenantId, status) => {
        set((state) => ({
          tenants: state.tenants.map((t) =>
            t.id === tenantId ? { ...t, statusAssinatura: status } : t
          ),
        }));
      },

      mudarPlanoTenant: (tenantId, planoId) => {
        const plano = get().planos.find((p) => p.id === planoId);
        if (!plano) return;
        set((state) => ({
          tenants: state.tenants.map((t) =>
            t.id === tenantId
              ? {
                  ...t,
                  planoId,
                  valorMensalidade: plano.precoMensal,
                }
              : t
          ),
        }));
      },

      atualizarPlano: (planoId, dados, atualizarAssinantes = false) => {
        set((state) => {
          const novosPlanos = state.planos.map((p) => {
            if (p.id !== planoId) return p;
            return {
              ...p,
              ...dados,
              limites: {
                ...p.limites,
                ...(dados.limites || {}),
              },
            };
          });

          let novosTenants = state.tenants;
          if (atualizarAssinantes && dados.precoMensal !== undefined) {
            novosTenants = state.tenants.map((t) =>
              t.planoId === planoId
                ? { ...t, valorMensalidade: Number(dados.precoMensal) }
                : t
            );
          }

          return {
            planos: novosPlanos,
            tenants: novosTenants,
          };
        });
      },

      getTenantAtivo: () => {
        const { tenants, tenantAtivoId } = get();
        if (tenantAtivoId === 'global') {
          return TENANT_GLOBAL;
        }
        return tenants.find((t) => t.id === tenantAtivoId) || TENANT_GLOBAL;
      },

      getMRR: () => {
        const { tenants } = get();
        return tenants
          .filter((t) => t.statusAssinatura === 'ativo' || t.statusAssinatura === 'trial')
          .reduce((acc, t) => acc + t.valorMensalidade, 0);
      },

      getTotalAtivos: () => {
        return get().tenants.filter((t) => t.statusAssinatura === 'ativo').length;
      },

      getTotalTrials: () => {
        return get().tenants.filter((t) => t.statusAssinatura === 'trial').length;
      },

      getTotalAtrasados: () => {
        return get().tenants.filter(
          (t) => t.statusAssinatura === 'atrasado' || t.statusAssinatura === 'bloqueado'
        ).length;
      },

      atualizarCustosInfra: (novos) => {
        set((state) => ({ custosInfra: { ...state.custosInfra, ...novos } }));
      },

      adicionarAviso: (aviso) => {
        const novo: AvisoGlobalSaaS = {
          ...aviso,
          id: `aviso-${Date.now().toString().slice(-4)}`,
          criadoEm: new Date().toLocaleString('pt-BR'),
        };
        set((state) => ({ avisos: [novo, ...state.avisos] }));
      },

      alternarStatusAviso: (id) => {
        set((state) => ({
          avisos: state.avisos.map((a) => (a.id === id ? { ...a, ativo: !a.ativo } : a)),
        }));
      },

      removerAviso: (id) => {
        set((state) => ({ avisos: state.avisos.filter((a) => a.id !== id) }));
      },

      registrarLogAuditoria: (acao, categoria, detalhes) => {
        const novoLog: LogAuditoriaSaaS = {
          id: `log-${Date.now().toString().slice(-4)}`,
          dataHora: new Date().toLocaleString('pt-BR'),
          usuarioNome: 'Super Admin (Dono do SaaS)',
          acao,
          categoria,
          detalhes,
        };
        set((state) => ({ logsAuditoria: [novoLog, ...state.logsAuditoria] }));
      },

      getAvisosAtivosParaTenant: (tenantId) => {
        return get().avisos.filter(
          (a) => a.ativo && (a.destinoTenantId === 'todos' || a.destinoTenantId === tenantId)
        );
      },
    }),
    {
      name: 'eloserve_saas_store_v4',
    }
  )
);
