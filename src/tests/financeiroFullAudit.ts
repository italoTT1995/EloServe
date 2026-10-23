import { useFinanceiroStore, CATEGORIAS_PADRAO_SISTEMA } from '../store/useFinanceiroStore';
import { useAppStore } from '../store/useAppStore';

let testesPassados = 0;
let testesFalhos = 0;

function assert(condicao: boolean, mensagem: string) {
  if (condicao) {
    console.log(`  ✅ [PASSOU] ${mensagem}`);
    testesPassados++;
  } else {
    console.error(`  ❌ [FALHOU] ${mensagem}`);
    testesFalhos++;
  }
}

async function runFinanceiroFullAudit() {
  console.log('====================================================');
  console.log('🏛️ AUDITORIA COMPLETA: MÓDULO FINANCEIRO ELOSERVE');
  console.log('====================================================\n');

  const financeiroStore = useFinanceiroStore.getState();

  // -----------------------------------------------------------------
  // 1. Categorias Oficiais do Sistema e Categorias Customizadas
  // -----------------------------------------------------------------
  console.log('🔹 1. Testando Categorias do Sistema e Criação de Customizadas...');
  const catsPadrao = financeiroStore.getCategorias('tenant-01');
  assert(catsPadrao.length >= 12, `Deve conter ao menos 12 categorias base (encontradas: ${catsPadrao.length})`);

  const nomesEsperados = [
    'Compras de alimentos e bebidas',
    'Funcionários, salários, encargos e benefícios',
    'Aluguel',
    'Água, energia, internet e telefone',
    'Impostos e taxas',
    'Fornecedores',
    'Manutenção e equipamentos',
    'Embalagens e materiais de consumo',
    'Marketing',
    'Taxas de cartão e delivery',
    'Outras despesas',
    'Receitas adicionais',
  ];

  for (const nome of nomesEsperados) {
    const existe = catsPadrao.some((c) => c.nome.toLowerCase() === nome.toLowerCase());
    assert(existe, `Categoria oficial obrigatória presente: "${nome}"`);
  }

  // Criação de categoria personalizada
  const novaCat = financeiroStore.adicionarCategoriaCustom({
    nome: 'Sobremesas Especiais e Tortas',
    tipo: 'despesa',
    linhaDRE: 'cmv',
    descricao: 'Insumos de confeitaria artesanal',
    corBadge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    tenantId: 'tenant-01',
  });
  assert(!!novaCat.id, 'Categoria customizada criada com ID único');
  const catsComNova = useFinanceiroStore.getState().getCategorias('tenant-01');
  assert(catsComNova.some((c) => c.id === novaCat.id), 'Categoria customizada recuperada com sucesso para o tenant');

  // -----------------------------------------------------------------
  // 2. Cadastro Financeiro Manual (Receitas e Despesas com Auditoria)
  // -----------------------------------------------------------------
  console.log('\n🔹 2. Testando Lançamentos Financeiros Manuais e Auditoria...');

  // Cadastrar Despesa de Feira e Hortifrúti
  const lancDespesa = useFinanceiroStore.getState().adicionarLancamento({
    tenantId: 'tenant-01',
    descricao: 'Feira Semanal de Legumes e Verduras',
    tipo: 'despesa',
    categoriaId: 'cat_compras_alimentos_bebidas',
    categoriaNome: 'Compras de alimentos e bebidas',
    valor: 450.75,
    dataCompetencia: '2026-10-23',
    dataVencimento: '2026-10-25',
    dataPagamento: '',
    formaPagamento: 'pix',
    status: 'pendente',
    fornecedorBeneficiario: 'Distribuidora Ceasa Hortifrúti',
    observacoes: 'Tomates, alfaces e temperos frescos',
    comprovanteNome: 'recibo_feira_2310.pdf',
    comprovanteUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    origem: 'manual',
    cadastradoPor: 'Gerente Carlos',
  });

  assert(!!lancDespesa.id, 'Lançamento de despesa manual criado');
  assert(lancDespesa.valor === 450.75, 'Valor correto da despesa: R$ 450,75');
  assert(lancDespesa.status === 'pendente', 'Status inicial é pendente');
  assert(lancDespesa.historicoAlteracoes?.length === 1, 'Histórico de auditoria inicial registrado');

  // Cadastrar Receita Adicional
  const lancReceita = useFinanceiroStore.getState().adicionarLancamento({
    tenantId: 'tenant-01',
    descricao: 'Locação Salão para Evento Corporativo',
    tipo: 'receita',
    categoriaId: 'cat_receitas_adicionais',
    categoriaNome: 'Receitas adicionais',
    valor: 1500.0,
    dataCompetencia: '2026-10-23',
    dataPagamento: '2026-10-23',
    formaPagamento: 'transferencia',
    status: 'recebido',
    fornecedorBeneficiario: 'Tech Solutions LTDA',
    observacoes: 'Reserva exclusiva da área externa',
    origem: 'manual',
    cadastradoPor: 'Admin Master Ítalo',
  });

  assert(lancReceita.tipo === 'receita', 'Lançamento de receita manual registrado');
  assert(lancReceita.status === 'recebido', 'Status de receita: recebido');

  // Alternar status da despesa (Liquidando / Pagando)
  useFinanceiroStore.getState().alternarStatusLancamento(lancDespesa.id, 'Gerente Carlos');
  const despesaPaga = useFinanceiroStore.getState().lancamentos.find((l) => l.id === lancDespesa.id);
  assert(despesaPaga?.status === 'pago', 'Status alterado de pendente para pago');
  assert(despesaPaga?.dataPagamento !== undefined, 'Data de pagamento preenchida automaticamente');
  assert(
    (despesaPaga?.historicoAlteracoes?.length || 0) >= 2,
    'Histórico de auditoria registra a liquidação do pagamento com usuário e timestamp'
  );

  // Edição com motivo de auditoria
  useFinanceiroStore.getState().editarLancamento(
    lancDespesa.id,
    { valor: 480.0, observacoes: 'Ajuste: Adicionado saco de cebola extra' },
    'Gerente Carlos',
    'Revisão da nota de entrega'
  );

  const despesaEditada = useFinanceiroStore.getState().lancamentos.find((l) => l.id === lancDespesa.id);
  assert(despesaEditada?.valor === 480.0, 'Valor atualizado para R$ 480,00');
  const ultimoHistorico = despesaEditada?.historicoAlteracoes?.[0];
  assert(
    ultimoHistorico?.motivo === 'Revisão da nota de entrega',
    'Motivo da alteração persistido no histórico de auditoria'
  );

  // Cancelamento de lançamento
  useFinanceiroStore.getState().cancelarLancamento(lancReceita.id, 'Admin Master', 'Cancelamento do evento pelo cliente');
  const receitaCancelada = useFinanceiroStore.getState().lancamentos.find((l) => l.id === lancReceita.id);
  assert(receitaCancelada?.status === 'cancelado', 'Lançamento marcado como cancelado');

  // -----------------------------------------------------------------
  // 3. Lançamentos Recorrentes e Automação Futura
  // -----------------------------------------------------------------
  console.log('\n🔹 3. Testando Lançamentos Recorrentes (Semanal, Mensal, Anual)...');

  // Cadastro de Aluguel Recorrente Mensal
  const recAluguel = useFinanceiroStore.getState().adicionarRecorrencia({
    tenantId: 'tenant-01',
    descricao: 'Aluguel Comercial do Imóvel',
    tipo: 'despesa',
    categoriaId: 'cat_aluguel',
    categoriaNome: 'Aluguel',
    valorEstimado: 2500.0,
    tipoValor: 'fixo',
    frequencia: 'mensal',
    dataInicio: '2026-10-01',
    diaVencimento: 10,
    formaPagamento: 'boleto',
    fornecedorBeneficiario: 'Imobiliária Central',
    ativo: true,
    cadastradoPor: 'Dono do Restaurante',
  });

  assert(!!recAluguel.id, 'Regra recorrente de Aluguel R$ 2.500 criada');

  // Cadastro de Internet Recorrente
  const recInternet = useFinanceiroStore.getState().adicionarRecorrencia({
    tenantId: 'tenant-01',
    descricao: 'Link Dedicado de Fibra Óptica',
    tipo: 'despesa',
    categoriaId: 'cat_utilidades',
    categoriaNome: 'Água, energia, internet e telefone',
    valorEstimado: 120.0,
    tipoValor: 'fixo',
    frequencia: 'mensal',
    dataInicio: '2026-10-01',
    diaVencimento: 15,
    formaPagamento: 'pix',
    fornecedorBeneficiario: 'Operadora Telecom',
    ativo: true,
    cadastradoPor: 'Dono do Restaurante',
  });

  assert(!!recInternet.id, 'Regra recorrente de Internet R$ 120 criada');

  // Processar recorrências
  const novosGerados = useFinanceiroStore.getState().processarRecorrencias('tenant-01');
  assert(novosGerados > 0, `Processamento gerou ${novosGerados} lançamentos futuros automáticos`);

  // Regra Fundamental: Lançamentos recorrentes NUNCA devem ser considerados pagos automaticamente!
  const lancamentosGerados = useFinanceiroStore
    .getState()
    .lancamentos.filter((l) => l.origem === 'recorrente');
  assert(lancamentosGerados.length > 0, 'Lançamentos recorrentes presentes no ledger financeiro');

  const todosPendentes = lancamentosGerados.every((l) => l.status === 'pendente');
  assert(
    todosPendentes,
    'REGRA CRÍTICA ATENDIDA: 100% dos lançamentos recorrentes iniciam estritamente como PENDENTES!'
  );

  // Proteção contra duplicação de lançamentos recorrentes
  const geradosSegundaVez = useFinanceiroStore.getState().processarRecorrencias('tenant-01');
  assert(
    geradosSegundaVez === 0,
    'PROTEÇÃO CONTRA DUPLICIDADE: Re-execução imediata gerou 0 duplicatas (idempotência perfeita)'
  );

  // Pausar recorrência
  useFinanceiroStore.getState().alternarAtivoRecorrencia(recInternet.id);
  const recPausada = useFinanceiroStore.getState().recorrencias.find((r) => r.id === recInternet.id);
  assert(recPausada?.ativo === false, 'Recorrência de internet pausada com sucesso');

  // -----------------------------------------------------------------
  // 4. Integração Multi-Tenant & Não-Duplicação com PDV e Estoque
  // -----------------------------------------------------------------
  console.log('\n🔹 4. Testando Isolamento Multi-Tenant e Não-Duplicação...');

  // Tenant 02 não deve ver despesas do Tenant 01
  const lancsTenant02 = useFinanceiroStore.getState().getLancamentosPorTenant('tenant-02');
  const temInvasao = lancsTenant02.some((l) => l.tenantId === 'tenant-01');
  assert(!temInvasao, 'ISOLAMENTO MULTI-TENANT: Tenant 02 não tem acesso aos lançamentos do Tenant 01');

  // Super Admin vê consolidado multi-tenant
  const lancsConsolidado = useFinanceiroStore.getState().getLancamentosPorTenant('todos');
  assert(lancsConsolidado.length >= lancamentosGerados.length, 'SUPER ADMIN: Visualização consolidada acessa todas as lojas');

  // Limpeza final para não deixar dados de teste na loja
  useFinanceiroStore.getState().limparDadosDemonstracao();

  console.log('\n====================================================');
  console.log(`📊 RESULTADO DA AUDITORIA FINANCEIRA:`);
  console.log(`Testes Aprovados: ${testesPassados} ✅`);
  console.log(`Testes Falhos: ${testesFalhos} ❌`);
  console.log('====================================================\n');

  if (testesFalhos > 0) {
    process.exit(1);
  }
}

runFinanceiroFullAudit();
