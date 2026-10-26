export type CargoUsuario =
  | 'super_admin'
  | 'admin_restaurante'
  | 'caixa'
  | 'garcom'
  | 'cozinha'
  | 'entregador';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  tenantId: string;
  avatar?: string;
  pin: string;
  senha?: string;
  ativo: boolean;
}

export type PerfilUsuario = CargoUsuario;

export interface Categoria {
  id: string;
  nome: string;
  icone?: string;
  cor?: string;
}

export interface IngredientePrato {
  ingredienteId: string;
  ingredienteNome: string;
  quantidade: number;
  unidadeMedida: string;
  custoUnitarioEstimado?: number;
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
  fichaTecnica?: IngredientePrato[];
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
  adicionais?: { nome: string; preco: number }[];
  subtotal: number;
}

export type StatusMesa = 'livre' | 'ocupada' | 'aguardando_pagamento' | 'chamar_garcom' | 'reservada';

export type StatusReserva = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export interface InformacoesEspeciaisReserva {
  aniversario?: boolean;
  presencaBolo?: boolean;
  decoracao?: boolean;
  observacoes?: string;
}

export interface ReservaMesa {
  id: string;
  tenantId: string;
  clienteNome: string;
  clienteTelefone: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  quantidadePessoas: number;
  mesaNumero?: number;
  status: StatusReserva;
  especiais?: InformacoesEspeciaisReserva;
  observacoes?: string;
  origem: 'elobot' | 'manual';
  criadoEm: string;
}

export interface CancelamentoItemMesa {
  id: string;
  itemId: string;
  produtoId: string;
  nome: string;
  quantidade: number;
  subtotal: number;
  clienteNome?: string;
  motivo: string;
  canceladoPor: string;
  horario: string;
}

export interface ItemComandaMesa {
  id: string;
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes?: string;
  horario: string;
  garcomNome?: string;
  clienteNome?: string;
  statusKDS?: StatusProducaoKDS;
  cancelado?: boolean;
  motivoCancelamento?: string;
  canceladoPor?: string;
  canceladoEm?: string;
}

export interface Mesa {
  id: string;
  tenantId?: string;
  numero: number;
  capacidade: number;
  setor: string;
  status: StatusMesa;
  tempoOcupadaMin?: number;
  totalConsumo?: number;
  qrCodeUrl?: string;
  quantidadePessoas?: number;
  responsavelNome?: string;
  pessoas?: string[];
  garcomResponsavel?: string;
  tempoChamadaGarcomMin?: number;
  garcomAtendeu?: boolean;
  alertaCritico?: boolean;
  solicitacaoTransferida?: boolean;
  mesasUnidas?: number[];
  comandaItens?: ItemComandaMesa[];
  taxaServicoAtiva?: boolean;
  isencaoTaxaPorPessoa?: string[];
  descontosPorPessoa?: Record<string, number>;
  descontoMesa?: number;
  historicoCancelamentos?: CancelamentoItemMesa[];
  couvertArtisticoAtivo?: boolean;
  valorCouvertPorPessoa?: number;
  valorCouvertPorComanda?: number;
  quantidadeCouvert?: number;
  isencaoCouvertPorPessoa?: string[];
  reservaId?: string;
}

export type StatusProducaoKDS = 'novo' | 'em_preparo' | 'pronto' | 'entregue';
export type EstacaoKDS = 'todas' | 'cozinha' | 'bar';

export interface ItemPedidoKDS {
  id?: string;
  produtoId?: string;
  nome: string;
  quantidade: number;
  observacoes?: string;
  setorPreparo?: 'cozinha' | 'bar' | 'nenhum';
  concluido?: boolean;
}

export interface PedidoKDS {
  id: string;
  numero: number;
  tipo: 'mesa' | 'balcao' | 'delivery';
  mesaNumero?: number;
  nomeCliente?: string;
  status: StatusProducaoKDS;
  itens: ItemPedidoKDS[];
  minutosEspera: number;
  criadoEm: string;
  estacaoDestino?: 'cozinha' | 'bar' | 'misto';
}

export interface ModificadorRapido {
  id: string;
  rotulo: string;
  texto: string;
  icone?: string;
  categoriaAlvo: 'carnes' | 'cozinha' | 'bar' | 'geral';
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
  reservaMesasIncluso?: boolean;
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



export interface ChamadoSuporte {
  id: string;
  tenantId: string;
  tenantNome: string;
  solicitanteNome: string;
  solicitanteCargo: string;
  telefoneContato: string;
  categoria: 'caixa' | 'kds' | 'pedidos' | 'whatsapp' | 'duvida' | 'urgente';
  descricao: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  criadoEm: string;
  resolvidoEm?: string;
  resolvidoPor?: string;
  prioridade: 'normal' | 'urgente';
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
  dreHabilitado?: boolean;
  drePermissaoModificadoPor?: string;
  drePermissaoModificadoEm?: string;
  couvertArtisticoAtivo?: boolean;
  valorCouvertPorPessoa?: number;
  valorCouvertPorComanda?: number;
  diasAoVivo?: string[];
}

// -------------------------------------------------------------
// GESTÃO DE ESTOQUE INTELIGENTE & COMPRAS (SEÇÕES 1.3 - 1.10, 11, 19, 20)
// -------------------------------------------------------------
export type CategoriaEstoque =
  | 'alimentos'
  | 'bebidas'
  | 'higiene'
  | 'utensilios'
  | 'limpeza'
  | 'balcao';

export type MetodoControleEstoque =
  | 'recorrente'   // Insumos recorrentes com consumo diário previsto e verificação de sobras na abertura
  | 'individual'   // Bebidas e unitários com baixa automática na venda
  | 'manual';      // Limpeza e operação com baixa manual de unidades inteiras

export type StatusDisponibilidade = 'disponivel' | 'esgotando' | 'esgotado';

export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  metodoControle: MetodoControleEstoque;
  quantidadeAtual: number;
  unidadeMedida: 'kg' | 'g' | 'un' | 'pct' | 'l' | 'ml' | 'frasco' | 'cx';
  consumoDiarioPrevisto?: number; // Para itens de consumo recorrente (ex: 5 kg/dia)
  sobraDiaAnterior?: number;      // Ajustado na abertura do caixa
  estoqueMinimo: number;
  estoqueIdeal: number;
  precoCusto: number;             // Preço de custo unitário mais recente
  precoVenda?: number;            // Para produtos vendidos diretamente (ex: cervejas)
  statusDisponibilidade: StatusDisponibilidade;
  fornecedorHabitual?: string;
}

export interface RegistroCompra {
  id: string;
  data: string;
  fornecedorOuLocal: string;
  produtoNome: string;
  categoria: CategoriaEstoque;
  quantidade: number;
  unidadeMedida: string;
  precoTotal: number;
  precoUnitario: number;
}

export interface ComponenteFichaTecnica {
  ingredienteId: string;
  ingredienteNome: string;
  pesoGramas: number;
  custoPorGrama: number;
  custoTotalComponente: number;
}

export interface FichaTecnica {
  id: string;
  produtoId: string;
  nomePrato: string;
  componentes: ComponenteFichaTecnica[];
  custoTotalEstimado: number;
  precoVenda: number;
  margemBrutaPercentual: number;
}

export type TipoMovimentacaoEstoque =
  | 'saida_venda'
  | 'estorno_cancelamento'
  | 'entrada_compra'
  | 'saida_manual'
  | 'ajuste_sobra';

export interface MovimentacaoEstoque {
  id: string;
  dataHora: string;
  itemId: string;
  itemNome: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  unidadeMedida: string;
  motivo: string;
  pedidoId?: string;
  responsavel: string;
  saldoApos?: number;
}

export interface ItemVendaRealizada {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  fichaTecnica?: IngredientePrato[];
}

export interface VendaRealizada {
  id: string;
  tenantId?: string;
  tipoOrigem?: 'balcao' | 'mesa' | 'delivery';
  mesaNumero?: number;
  dataHora: string;
  total: number;
  subtotalBruto?: number;
  desconto?: number;
  taxaServico?: number;
  taxaEntrega?: number;
  couvertArtistico?: number;
  quantidadeCouvert?: number;
  formaPagamento: FormaPagamento;
  itens: ItemVendaRealizada[];
  operador: string;
  status: 'concluida' | 'cancelada';
  motivoCancelamento?: string;
  canceladoEm?: string;
  canceladoPor?: string;
}

export interface DespesaOperacionalRestaurante {
  id: string;
  tenantId: string;
  descricao: string;
  categoria: 'ocupacao' | 'pessoal' | 'servicos' | 'financeiro' | 'insumos' | 'outros';
  valor: number;
  data: string;
  tipo: 'fixa' | 'variavel';
  cadastradoPor?: string;
  formaPagamento?: 'pix' | 'dinheiro' | 'boleto' | 'transferencia' | 'cartao';
  statusPagamento?: 'pago' | 'pendente';
  dataVencimento?: string;
  observacoes?: string;
  notaFiscalId?: string;
  numeroNotaFiscal?: string;
}

// -------------------------------------------------------------
// GESTÃO FINANCEIRA COMPLETA (RECEITAS, DESPESAS, RECORRÊNCIAS, DRE)
// -------------------------------------------------------------
export type TipoLancamentoFinanceiro = 'receita' | 'despesa';

export type StatusLancamentoFinanceiro = 'pendente' | 'pago' | 'recebido' | 'cancelado';

export type FormaPagamentoFinanceiro =
  | 'dinheiro'
  | 'pix'
  | 'boleto'
  | 'transferencia'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'outros';

export type OrigemLancamentoFinanceiro = 'manual' | 'recorrente' | 'pdv' | 'estoque' | 'nfe' | 'comissao';

export type LinhaDREContabil =
  | 'receita_bruta'
  | 'deducoes'
  | 'cmv'
  | 'pessoal'
  | 'ocupacao'
  | 'comercial'
  | 'servicos'
  | 'resultado_financeiro'
  | 'outros';

export interface CategoriaFinanceira {
  id: string;
  tenantId?: string; // Se omitido, é uma categoria global padrão
  nome: string;
  tipo: TipoLancamentoFinanceiro;
  linhaDRE: LinhaDREContabil;
  descricao?: string;
  corBadge?: string;
  icone?: string;
  sistema?: boolean; // Se true, categoria padrão do sistema
}

export interface HistoricoAlteracaoFinanceira {
  id: string;
  dataHora: string;
  usuarioNome: string;
  campoAlterado: string;
  valorAntigo?: string | number;
  valorNovo?: string | number;
  motivo?: string;
}

export interface LancamentoFinanceiro {
  id: string;
  tenantId: string;
  descricao: string;
  tipo: TipoLancamentoFinanceiro;
  categoriaId: string;
  categoriaNome: string;
  valor: number;
  dataCompetencia: string; // YYYY-MM-DD (para regime de competência no DRE)
  dataVencimento?: string; // YYYY-MM-DD (para controle de contas a pagar/receber)
  dataPagamento?: string;  // YYYY-MM-DD (quando efetivamente pago/recebido para fluxo de caixa)
  formaPagamento: FormaPagamentoFinanceiro;
  status: StatusLancamentoFinanceiro;
  fornecedorBeneficiario?: string;
  observacoes?: string;
  comprovanteNome?: string;
  comprovanteUrl?: string; // Base64 ou URL do arquivo anexado
  origem: OrigemLancamentoFinanceiro;
  origemId?: string; // ID do pedido PDV, nota fiscal ou compra de estoque
  recorrenciaId?: string; // ID da regra de recorrência que gerou
  parcelaInfo?: string; // Ex: "1/12"
  historicoAlteracoes?: HistoricoAlteracaoFinanceira[];
  cadastradoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type FrequenciaRecorrencia = 'semanal' | 'mensal' | 'anual';
export type TipoValorRecorrente = 'fixo' | 'variavel';

export interface LancamentoRecorrente {
  id: string;
  tenantId: string;
  descricao: string;
  tipo: TipoLancamentoFinanceiro;
  categoriaId: string;
  categoriaNome: string;
  valorEstimado: number;
  tipoValor: TipoValorRecorrente;
  frequencia: FrequenciaRecorrencia;
  dataInicio: string;    // YYYY-MM-DD
  dataTermino?: string;  // YYYY-MM-DD (opcional)
  diaVencimento: number; // Dia do mês (1 a 31) ou dia da semana (0 a 6)
  formaPagamento: FormaPagamentoFinanceiro;
  fornecedorBeneficiario?: string;
  ativo: boolean;
  observacoes?: string;
  cadastradoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

// -------------------------------------------------------------
// NOTAS FISCAIS & DOCUMENTOS FISCAIS (NF-e, NFC-e, NFS-e)
// -------------------------------------------------------------
export type TipoNotaFiscal =
  | 'entrada_insumos'     // Compra de matéria-prima / alimentos -> DRE CMV (Linha 4.0)
  | 'entrada_embalagens'  // Embalagens para delivery -> DRE Comercial & Embalagens (Linha 6.3)
  | 'entrada_servicos'    // NFS-e Serviços Tomados (manutenção, TI, dedetização) -> DRE Serviços (Linha 6.4)
  | 'entrada_utilidades'  // Contas com NF (Energia, Gás, Internet) -> DRE Ocupação (Linha 6.2)
  | 'entrada_equipamento' // Imobilizado / Máquinas / Fogões
  | 'saida_venda'         // NFC-e / NF-e emitida ao consumidor -> DRE Receita Bruta (Linha 1.0)
  | 'outros';

export type ModeloDocumentoFiscal = 'NFe_55' | 'NFCe_65' | 'NFSe_servico' | 'CF_e_SAT' | 'cupom_fiscal';

export type StatusNotaFiscal = 'autorizada' | 'cancelada' | 'pendente' | 'em_processamento';

export interface ItemNotaFiscal {
  id: string;
  codigo?: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  aliquotaIcms?: number;
  valorIcms?: number;
}

export interface NotaFiscalRegistro {
  id: string;
  tenantId: string;
  numero: string;               // Ex: '000142'
  serie?: string;               // Ex: '1'
  chaveAcesso?: string;         // 44 dígitos
  modelo: ModeloDocumentoFiscal;
  tipo: TipoNotaFiscal;
  direcao: 'entrada' | 'saida';
  emitenteRazaoSocial: string;
  emitenteCnpjCpf: string;
  destinatarioRazaoSocial?: string;
  destinatarioCnpjCpf?: string;
  dataEmissao: string;          // YYYY-MM-DD
  dataCompetencia?: string;
  valorTotalProdutos: number;
  valorFrete?: number;
  valorOutrasDespesas?: number;
  valorDesconto?: number;
  valorTotalNota: number;
  
  // Impostos destacados
  valorIcms?: number;
  valorPis?: number;
  valorCofins?: number;
  valorIss?: number;
  
  status: StatusNotaFiscal;
  itens?: ItemNotaFiscal[];
  nomeArquivoXml?: string;
  xmlConteudo?: string;
  observacoes?: string;
  cadastradoPor?: string;
  criadoEm: string;
  
  // Enquadramento no DRE
  linhaDRE: 'cmv' | 'receita_bruta' | 'deducoes_impostos' | 'ocupacao' | 'comercial_embalagens' | 'servicos' | 'outros';
}

// -------------------------------------------------------------
// GESTÃO DE FUNCIONÁRIOS & RH (SEÇÃO 2)
// -------------------------------------------------------------
export interface VeiculoEntregador {
  modelo: string;
  ano: number;
  cor: string;
  placa: string;
}

export interface FuncionarioCompleto {
  id: string;
  foto?: string;
  nome: string;
  sobrenome: string;
  telefoneWhatsApp: string;
  dataNascimento: string;
  dataAdmissao: string;
  email: string;
  cargo: CargoUsuario;
  salario?: number;
  fgts?: number;
  inss?: number;
  periodoFerias?: string;
  veiculo?: VeiculoEntregador;
  ativo: boolean;
  pin: string;
}

// -------------------------------------------------------------
// DELIVERY & ENTREGAS (SEÇÕES 3.6 - 3.13, 8)
// -------------------------------------------------------------
export type StatusDelivery = 'preparando' | 'pronto' | 'retirado' | 'a_caminho' | 'entregue';
export type StatusRetirada = 'preparando' | 'pronto' | 'retirado';

export interface EnderecoEntrega {
  cep?: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  pontoReferencia?: string;
  obs?: string;
  distanciaKm?: number;
}

export interface PedidoDelivery {
  id: string;
  numero: number;
  clienteNome: string;
  clienteTelefone: string;
  tipo: 'delivery' | 'retirada';
  endereco?: EnderecoEntrega;
  itens: {
    nome: string;
    quantidade: number;
    preco: number;
    observacoes?: string;
  }[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: 'pix' | 'maquininha_entrega' | 'dinheiro';
  status: StatusDelivery;
  horario: string;
  entregadorNome?: string;
  pago: boolean;
}

export interface ClienteDelivery {
  id: string;
  nome: string;
  telefone: string;
  dataNascimento: string;
  dataUltimoPedido: string;
  descricaoUltimoPedido: string;
  valorUltimoPedido: number;
  totalPedidos: number;
  totalGasto: number;
  enderecos: string[];
}

export interface FaixaTaxaEntrega {
  ateKm: number;
  taxa: number;
}

// -------------------------------------------------------------
// FORNECEDORES & RELATÓRIOS (SEÇÃO 12)
// -------------------------------------------------------------
export interface Fornecedor {
  id: string;
  nomeOuEmpresa: string;
  pessoaContato: string;
  telefone: string;
  email: string;
  cnpj: string;
  endereco: string;
  categoriaPrincipal: string;
}

// -------------------------------------------------------------
// CAIXA DETALHADO & QUESTIONÁRIO DE FECHAMENTO (SEÇÕES 6 E 14.4)
// -------------------------------------------------------------
export interface ContagemDinheiroFisico {
  moedas050: number;
  moedas100: number;
  cedulas002: number;
  cedulas005: number;
  cedulas010: number;
  cedulas020: number;
  cedulas050: number;
  cedulas100: number;
}

export interface QuestionarioFechamentoCaixa {
  avaliacaoDia: 'otimo' | 'bom' | 'regular' | 'dificil';
  fluxoClientes: 'alto' | 'medio' | 'baixo';
  teveOcorrencia: boolean;
  descricaoOcorrencia?: string;
  valorEsperadoDinheiro: number;
  valorContadoDinheiro: number;
  divergencia: number;
  justificativaDivergencia?: string;
  fechadoEm: string;
  responsavel: string;
}

// -------------------------------------------------------------
// IMPRESSÃO TÉRMICA DIRETA & SILENCIOSA (COZINHA, BAR, CAIXA)
// -------------------------------------------------------------
export interface ConfiguracaoImpressaoTermica {
  impressaoAutomaticaCozinha: boolean;
  impressaoAutomaticaBar: boolean;
  impressaoAutomaticaCaixa: boolean;
  larguraPapel: '80mm' | '58mm';
  nomeImpressoraCozinha: string;
  nomeImpressoraBar: string;
  nomeImpressoraCaixa: string;
  viasImpressao: number;
  beepSonoroAoImprimir: boolean;
  destacarObservacoes: boolean;
  ipBridgeLocal?: string;
}

export interface ItemTicketImpressao {
  id?: string;
  nome: string;
  quantidade: number;
  observacoes?: string;
  setorPreparo?: 'cozinha' | 'bar' | 'nenhum';
  precoUnitario?: number;
  subtotal?: number;
  clienteNome?: string;
}

export interface TicketImpressao {
  pedidoId: string;
  numeroPedido: number | string;
  tipo: 'mesa' | 'balcao' | 'delivery';
  mesaNumero?: number;
  clienteNome?: string;
  garcomNome?: string;
  dataHora?: string;
  setorAlvo: 'cozinha' | 'bar' | 'caixa';
  itens: ItemTicketImpressao[];
  observacaoGeral?: string;
  subtotal?: number;
  taxaServico?: number;
  total?: number;
  formaPagamento?: string;
}

// -------------------------------------------------------------
// COMISSÕES & RATEIO DOS 10% DO GARÇOM
// -------------------------------------------------------------
export interface RateioGarcomDetalhe {
  garcomId: string;
  garcomNome: string;
  totalVendido: number;
  mesasAtendidas: number;
  taxaBrutaArrecadada: number;
  valorRetencaoCasa: number;
  comissaoLiquida: number;
  status: 'pago' | 'pendente';
  pagoEm?: string;
}

export interface RegistroFechamentoComissao {
  id: string;
  tenantId: string;
  dataFechamento: string;
  periodoDescricao: string;
  modeloRateio: 'direto' | 'igualitario';
  totalVendasFaturadas: number;
  totalTaxaServicoBruta: number;
  percentualRetencaoCasa: number;
  valorRetencaoCasa: number;
  totalLiquidoRateado: number;
  garcons: RateioGarcomDetalhe[];
  lancadoNoFinanceiro: boolean;
  financeiroLancamentoId?: string;
  criadoPor: string;
  criadoEm: string;
  observacoes?: string;
}
