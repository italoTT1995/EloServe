export type PerfilUsuario = 'admin' | 'gerente' | 'caixa' | 'garcom' | 'cozinha';

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
