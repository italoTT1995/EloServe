import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenantRestaurante, PlanoAssinatura, TipoPlanoSaaS, StatusAssinatura, ChamadoSuporte } from '../types';

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
      reservaMesasIncluso: false,
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
      'Gestão e Controle de Reserva de Mesas integrado',
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
      reservaMesasIncluso: true,
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
      'Reserva de Mesas Automatizada 24h com IA no WhatsApp',
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
      reservaMesasIncluso: true,
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
  | 'suporte_ao_vivo'
  | 'restaurantes'
  | 'dossie_mensal'
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
  adicionarTenant: (novo: Omit<TenantRestaurante, 'id' | 'criadoEm'>) => TenantRestaurante;
  atualizarDadosTenant: (tenantId: string, dados: Partial<TenantRestaurante>) => void;
  atualizarStatusAssinatura: (tenantId: string, status: StatusAssinatura) => void;
  mudarPlanoTenant: (tenantId: string, planoId: TipoPlanoSaaS) => void;
  atualizarPlano: (planoId: TipoPlanoSaaS, dados: Partial<PlanoAssinatura>, atualizarAssinantes?: boolean) => void;
  atualizarCustosInfra: (novos: Partial<CustosInfraSaaS>) => void;
  adicionarAviso: (aviso: Omit<AvisoGlobalSaaS, 'id' | 'criadoEm'>) => void;
  alternarStatusAviso: (id: string) => void;
  removerAviso: (id: string) => void;
  alternarPermissaoDRE: (tenantId: string, habilitado?: boolean, operadorNome?: string) => void;
  registrarLogAuditoria: (acao: string, categoria: LogAuditoriaSaaS['categoria'], detalhes: string) => void;
  getAvisosAtivosParaTenant: (tenantId: string) => AvisoGlobalSaaS[];
  getTenantAtivo: () => TenantRestaurante;
  getTenantPorId: (id: string) => TenantRestaurante | undefined;
  getMRR: () => number;
  getTotalAtivos: () => number;
  getTotalTrials: () => number;
  getTotalAtrasados: () => number;
  chamadosSuporte: ChamadoSuporte[];
  abrirChamadoSuporte: (dados: Omit<ChamadoSuporte, 'id' | 'status' | 'criadoEm'>) => ChamadoSuporte;
  atualizarStatusChamado: (id: string, status: 'aberto' | 'em_atendimento' | 'resolvido', atendente?: string) => void;
  getChamadosAbertos: () => ChamadoSuporte[];
  getChamadosPorTenant: (tenantId: string) => ChamadoSuporte[];
  codigoSegurancaMaster: string;
  masterDesbloqueado: boolean;
  tentativasFalhasMaster: number;
  bloqueadoAte: number | null;
  desbloquearMaster: (codigo: string) => { sucesso: boolean; mensagem?: string };
  bloquearMaster: () => void;
  alterarCodigoMaster: (codigoAtual: string, novoCodigo: string) => { sucesso: boolean; mensagem?: string };
}

export const TENANT_GLOBAL: TenantRestaurante = {
  id: 'global',
  nomeFantasia: 'ELOserve',
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
  couvertArtisticoAtivo: true,
  valorCouvertPorPessoa: 12.00,
  valorCouvertPorComanda: 12.00,
  diasAoVivo: ['quinta', 'sexta', 'sabado', 'domingo'],
};

const TENANTS_INICIAIS: TenantRestaurante[] = [];

const CUSTOS_INFRA_PADRAO: CustosInfraSaaS = {
  cloudVps: 180.0,
  evolutionWhatsapp: 120.0,
  taxaGatewayPct: 2.9,
  impostoSimplesPct: 6.0,
  suporteMarketing: 350.0,
};

const AVISOS_INICIAIS: AvisoGlobalSaaS[] = [];

const LOGS_INICIAIS: LogAuditoriaSaaS[] = [];

export const useSaaSStore = create<SaaSState>()(
  persist(
    (set, get) => ({
      planos: PLANOS_DISPONIVEIS,
      tenants: TENANTS_INICIAIS,
      tenantAtivoId: 'global',
      abaAtivaMaster: 'restaurantes',
      tenantEmEdicaoId: null,
      custosInfra: CUSTOS_INFRA_PADRAO,
      avisos: AVISOS_INICIAIS,
      logsAuditoria: LOGS_INICIAIS,
      chamadosSuporte: [],

      abrirChamadoSuporte: (dados) => {
        const novo: ChamadoSuporte = {
          ...dados,
          id: `chm-${Date.now().toString().slice(-5)}`,
          status: 'aberto',
          criadoEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({
          chamadosSuporte: [novo, ...(state.chamadosSuporte || [])],
        }));
        get().registrarLogAuditoria(
          'Abertura de Chamado de Suporte',
          'sistema',
          `Restaurante ${dados.tenantNome} solicitou suporte: ${dados.descricao} (Prioridade: ${dados.prioridade})`
        );
        return novo;
      },

      atualizarStatusChamado: (id, status, atendente) => {
        set((state) => ({
          chamadosSuporte: (state.chamadosSuporte || []).map((ch) =>
            ch.id === id
              ? {
                  ...ch,
                  status,
                  ...(status === 'resolvido'
                    ? {
                        resolvidoEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        resolvidoPor: atendente || 'Super Admin Master',
                      }
                    : {}),
                }
              : ch
          ),
        }));
      },

      getChamadosAbertos: () => {
        return (get().chamadosSuporte || []).filter((ch) => ch.status !== 'resolvido');
      },

      getChamadosPorTenant: (tenantId: string) => {
        return (get().chamadosSuporte || []).filter((ch) => ch.tenantId === tenantId);
      },

      codigoSegurancaMaster: '889900',
      masterDesbloqueado: false,
      tentativasFalhasMaster: 0,
      bloqueadoAte: null,

      setAbaAtivaMaster: (aba) => set({ abaAtivaMaster: aba }),
      setTenantEmEdicaoId: (id) => set({ tenantEmEdicaoId: id }),

      selecionarTenant: (tenantId: string) => {
        set({
          tenantAtivoId: tenantId,
          tenantEmEdicaoId: tenantId === 'global' ? null : tenantId,
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

        // Sincroniza o novo restaurante com o backend de catálogo do WhatsApp
        try {
          const apiUrl =
            (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
            (typeof window !== 'undefined' && window.location.port === '5174'
              ? 'http://localhost:3001'
              : typeof window !== 'undefined'
              ? window.location.origin
              : 'http://localhost:3001');

          fetch(`${apiUrl}/api/whatsapp/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenantId: id,
              nomeLoja: novo.nomeFantasia,
              nomeAgente: `EloBot ${novo.nomeFantasia.split(' ')[0]}`,
              tomDeVoz: 'acolhedor',
              chavePix: novo.documento || 'financeiro@eloserve.com.br',
              produtos: [],
            }),
          }).catch(() => {});
        } catch {}

        return tenantCompleto;
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

      getTenantPorId: (id: string) => {
        if (!id || id === 'global') return TENANT_GLOBAL;
        return get().tenants.find((t) => t.id === id);
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

      alternarPermissaoDRE: (tenantId, habilitado, operadorNome = 'Super Admin (Dono do SaaS)') => {
        const state = get();
        const tenant = state.tenants.find((t) => t.id === tenantId);
        if (!tenant) return;

        const novoValor = habilitado !== undefined ? habilitado : !tenant.dreHabilitado;
        const agoraTexto = new Date().toLocaleString('pt-BR');

        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === tenantId
              ? {
                  ...t,
                  dreHabilitado: novoValor,
                  drePermissaoModificadoPor: operadorNome,
                  drePermissaoModificadoEm: agoraTexto,
                }
              : t
          ),
        }));

        get().registrarLogAuditoria(
          `Permissão DRE Básico ${novoValor ? 'Liberada' : 'Revogada / Bloqueada'}`,
          'seguranca',
          `O acesso ao DRE Básico do cliente foi ${novoValor ? 'LIBERADO' : 'REVOGADO / BLOQUEADO'} para a loja "${tenant.nomeFantasia}" (${tenant.id}) pelo operador "${operadorNome}".`
        );
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

      desbloquearMaster: (codigo: string) => {
        const state = get();
        const agora = Date.now();
        if (state.bloqueadoAte && agora < state.bloqueadoAte) {
          const segs = Math.ceil((state.bloqueadoAte - agora) / 1000);
          return { sucesso: false, mensagem: `Cofre bloqueado por segurança. Aguarde ${segs} segundos.` };
        }

        if (codigo === state.codigoSegurancaMaster) {
          set({
            masterDesbloqueado: true,
            tentativasFalhasMaster: 0,
            bloqueadoAte: null,
          });
          get().registrarLogAuditoria('Desbloqueio do Painel Master', 'seguranca', 'Painel executivo SaaS Master autenticado e desbloqueado com sucesso.');
          return { sucesso: true };
        }

        const falhas = state.tentativasFalhasMaster + 1;
        let novoBloqueio = null;
        let msg = `Código Master incorreto (${falhas}/3 tentativas).`;
        if (falhas >= 3) {
          novoBloqueio = agora + 30 * 1000;
          msg = '3 tentativas incorretas atingidas. Cofre bloqueado temporariamente por 30 segundos.';
        }
        set({
          tentativasFalhasMaster: falhas,
          bloqueadoAte: novoBloqueio,
        });
        get().registrarLogAuditoria('Falha de Desbloqueio Master', 'seguranca', `Tentativa de acesso com código incorreto (${falhas}ª tentativa).`);
        return { sucesso: false, mensagem: msg };
      },

      bloquearMaster: () => {
        set({ masterDesbloqueado: false });
        get().registrarLogAuditoria('Bloqueio do Painel Master', 'seguranca', 'O painel SaaS Master foi bloqueado pelo Super Admin.');
      },

      alterarCodigoMaster: (codigoAtual: string, novoCodigo: string) => {
        const state = get();
        if (codigoAtual !== state.codigoSegurancaMaster) {
          return { sucesso: false, mensagem: 'O código atual informado está incorreto.' };
        }
        if (!novoCodigo || novoCodigo.length < 4 || novoCodigo.length > 8) {
          return { sucesso: false, mensagem: 'O novo código deve conter entre 4 e 8 dígitos numéricos.' };
        }
        set({ codigoSegurancaMaster: novoCodigo });
        get().registrarLogAuditoria('Alteração de Código Master', 'seguranca', 'O Código de Segurança Master foi alterado pelo Super Admin.');
        return { sucesso: true, mensagem: 'Código de Segurança Master alterado com sucesso!' };
      },
    }),
    {
      name: 'eloserve_saas_store_v6',
      partialize: (state) => {
        const { masterDesbloqueado, tentativasFalhasMaster, bloqueadoAte, ...rest } = state;
        return {
          ...rest,
          tenants: (rest.tenants || []).filter(
            (t) => !['tenant-01', 'tenant-02', 'tenant-03', 'tenant-04', 'tenant-05'].includes(t.id) &&
                   !t.nomeFantasia.includes('Fogo de Minas') &&
                   !t.nomeFantasia.includes('Bella Napoli') &&
                   !t.nomeFantasia.includes('Smash Burguer') &&
                   !t.nomeFantasia.includes('Boteco & Espetos') &&
                   !t.nomeFantasia.includes('Sushi Prime')
          ),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tenants = (state.tenants || []).filter(
            (t) => !['tenant-01', 'tenant-02', 'tenant-03', 'tenant-04', 'tenant-05'].includes(t.id) &&
                   !t.nomeFantasia.includes('Fogo de Minas') &&
                   !t.nomeFantasia.includes('Bella Napoli') &&
                   !t.nomeFantasia.includes('Smash Burguer') &&
                   !t.nomeFantasia.includes('Boteco & Espetos') &&
                   !t.nomeFantasia.includes('Sushi Prime')
          );
        }
      },
    }
  )
);
