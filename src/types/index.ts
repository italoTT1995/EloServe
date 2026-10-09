export type CargoUsuario =
  | 'super_admin'
  | 'admin_restaurante'
  | 'caixa'
  | 'garcom'
  | 'cozinha';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  tenantId: string;
  avatar?: string;
  pin: string;
  ativo: boolean;
}

export type PerfilUsuario = CargoUsuario;

export interface Categoria {
  id: string;
  nome: string;
  icone?: string;
  cor?: string;
}

export interface Produto {
  id: string;
  categoriaId: string;
  nome: string;
  descricao?: string;
  precoVenda: number;
  precoCusto?: number;
  fotoUrl?: string;
  codigoBarras?: string;
  setorPreparo: 'cozinha' | 'bar' | 'nenhum';
  disponivel: boolean;
  destaque?: boolean;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
  adicionais?: { nome: string; preco: number }[];
  subtotal: number;
}

export type StatusMesa = 'livre' | 'ocupada' | 'aguardando_pagamento' | 'chamar_garcom';

export interface Mesa {
  id: string;
  numero: number;
  capacidade: number;
  setor: string;
  status: StatusMesa;
  tempoOcupadaMin?: number;
  totalConsumo?: number;
  qrCodeUrl?: string;
}

export type StatusProducaoKDS = 'novo' | 'em_preparo' | 'pronto';

export interface PedidoKDS {
  id: string;
  numero: number;
  tipo: 'mesa' | 'balcao' | 'delivery';
  mesaNumero?: number;
  nomeCliente?: string;
  status: StatusProducaoKDS;
  itens: {
    nome: string;
    quantidade: number;
    observacoes?: string;
  }[];
  minutosEspera: number;
  criadoEm: string;
}

export type FormaPagamento = 'dinheiro' | 'pix' | 'credito' | 'debito' | 'voucher';

export interface MovimentoCaixa {
  id: string;
  tipo: 'venda' | 'sangria' | 'suprimento';
  formaPagamento: FormaPagamento;
  valor: number;
  motivo?: string;
  horario: string;
}

export interface SessaoCaixa {
  id: string;
  status: 'aberto' | 'fechado';
  saldoInicial: number;
  totalVendas: number;
  totalSangrias: number;
  totalSuprimentos: number;
  abertoEm: string;
  operador: string;
}

// SaaS Multi-Tenancy & Assinaturas
export type TipoPlanoSaaS = 'starter' | 'pro' | 'enterprise';
export type StatusAssinatura = 'ativo' | 'trial' | 'atrasado' | 'bloqueado' | 'cancelado';

export interface LimitesPlano {
  maxMesas: number;
  maxCaixasSimultaneos: number;
  kdsIncluso: boolean;
  whatsappIAIncluso: boolean;
  relatoriosAvancados: boolean;
  suportePrioritario: boolean;
  cardapioQrCodeIncluso?: boolean;
  garcomMobileIncluso?: boolean;
  impressaoTermicaInclusa?: boolean;
  controleEstoqueIncluso?: boolean;
  maxUsuarios?: number;
  maxItensCardapio?: number;
  maxPedidosMes?: number;
  diasTrialPadrao?: number;
  diasToleranciaAtraso?: number;
  taxaAdesao?: number;
}

export interface PlanoAssinatura {
  id: TipoPlanoSaaS;
  nome: string;
  precoMensal: number;
  precoAnual?: number;
  descricao: string;
  limites: LimitesPlano;
  destaque?: boolean;
  regrasTexto?: string[];
}

export interface TenantRestaurante {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string;
  documento: string;
  responsavelNome: string;
  telefoneWhatsApp: string;
  email: string;
  cidadeUf: string;
  planoId: TipoPlanoSaaS;
  statusAssinatura: StatusAssinatura;
  valorMensalidade: number;
  dataInicio: string;
  proximoVencimento: string;
  diasRestantesTrial?: number;
  instanciaWhatsAppConectada: boolean;
  criadoEm: string;
}
