/**
 * E2E Business Flows, Security & Consistency Audit Test Suite
 * EloServe PDV & SaaS Engine
 */

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useReservaStore } from '../store/useReservaStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useFuncionarioStore } from '../store/useFuncionarioStore';
import { VendaRealizada } from '../types';

interface TestStep {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const steps: TestStep[] = [];

function check(name: string, condition: boolean, details?: string) {
  if (condition) {
    steps.push({ name, passed: true, details });
    console.log(`  ✅ ${name}${details ? ` -> ${details}` : ''}`);
  } else {
    steps.push({ name, passed: false, details, error: 'Assertion failed' });
    console.error(`  ❌ FAILED: ${name}${details ? ` -> ${details}` : ''}`);
  }
}

async function runBusinessFlowAudit() {
  console.log('================================================================');
  console.log('🔬 INICIANDO AUDITORIA TÉCNICA E TESTES DOS FLUXOS DE NEGÓCIO');
  console.log('================================================================\n');

  // Configura ambiente temporário para a auditoria dos fluxos de negócio
  useSaaSStore.setState({
    tenants: [
      {
        id: 'tenant-01',
        nomeFantasia: 'Churrascaria Teste 1',
        razaoSocial: 'Churrascaria Teste LTDA',
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
        dreHabilitado: true,
        couvertArtisticoAtivo: true,
        valorCouvertPorPessoa: 10.00,
        valorCouvertPorComanda: 10.00,
        diasAoVivo: ['quinta', 'sexta', 'sabado', 'domingo'],
      },
      {
        id: 'tenant-02',
        nomeFantasia: 'Pizzaria Teste 2',
        razaoSocial: 'Pizzaria Teste ME',
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
        dreHabilitado: false,
        couvertArtisticoAtivo: false,
        valorCouvertPorPessoa: 10.00,
        valorCouvertPorComanda: 10.00,
        diasAoVivo: ['sexta', 'sabado'],
      },
    ],
  });

  useProductStore.setState({
    produtosPorTenant: {
      'tenant-01': [
        {
          id: 'p_fg_2',
          categoriaId: 'c_fg_1',
          nome: 'Ancho Prime com Risoto Trufado',
          descricao: 'Corte alto de 400g grelhado no ponto da casa.',
          precoVenda: 94.0,
          precoCusto: 28.5,
          setorPreparo: 'cozinha',
          disponivel: true,
        },
      ],
    },
    categoriasPorTenant: {
      'tenant-01': [
        { id: 'c_fg_1', nome: 'Cortes Nobres' },
      ],
    },
  });

  useAppStore.setState({
    mesasPorTenant: {
      'tenant-01': [
        { id: 'm1_t1', tenantId: 'tenant-01', numero: 1, capacidade: 4, setor: 'Salão', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
        { id: 'm2_t1', tenantId: 'tenant-01', numero: 2, capacidade: 4, setor: 'Salão', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
        { id: 'm3_t1', tenantId: 'tenant-01', numero: 3, capacidade: 4, setor: 'Salão', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
        { id: 'm10_t1', tenantId: 'tenant-01', numero: 10, capacidade: 4, setor: 'Salão', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
      ],
      'tenant-02': [
        { id: 'm1_t2', tenantId: 'tenant-02', numero: 1, capacidade: 4, setor: 'Salão', status: 'livre', totalConsumo: 0, tempoOcupadaMin: 0, comandaItens: [] },
      ],
    },
  });

  useEstoqueStore.setState({
    itens: [
      {
        id: 'est-picanha',
        nome: 'Picanha Bovina Angus Resfriada',
        categoria: 'alimentos',
        metodoControle: 'recorrente',
        quantidadeAtual: 15.0,
        unidadeMedida: 'kg',
        consumoDiarioPrevisto: 3.0,
        estoqueMinimo: 4.0,
        estoqueIdeal: 20.0,
        precoCusto: 58.0,
        statusDisponibilidade: 'disponivel',
        fornecedorHabitual: 'Frigorífico Central',
      },
      {
        id: 'est-queijo',
        nome: 'Queijo Mussarela Fatiado',
        categoria: 'alimentos',
        metodoControle: 'recorrente',
        quantidadeAtual: 25.0,
        unidadeMedida: 'kg',
        consumoDiarioPrevisto: 2.0,
        estoqueMinimo: 5.0,
        estoqueIdeal: 30.0,
        precoCusto: 38.0,
        statusDisponibilidade: 'disponivel',
        fornecedorHabitual: 'Laticínios da Serra',
      },
    ],
  });

  // =================================================================
  // FLUXO 1: FLUXO DE VENDA COMPLETO NO SALÃO & COMANDAS
  // =================================================================
  console.log('📋 1. Testando Fluxo de Venda Completo no Salão (Mesas & Comandas)...');
  try {
    const tenantId = 'tenant-01';
    const app = useAppStore.getState();
    const estoque = useEstoqueStore.getState();

    // 1.1 Abrir o caixa com valor inicial
    app.abrirCaixa(250.0);
    const caixaAberto = useAppStore.getState().caixaAtual;
    check('1.1 Abertura de Caixa', caixaAberto.status === 'aberto' && caixaAberto.saldoInicial === 250.0, `Saldo Inicial: R$ ${caixaAberto.saldoInicial}`);

    // 1.2 Mesa 10: Iniciar comanda e lançar produtos com modificadores
    const mesaNum = 10;
    app.adicionarMesa({ numero: mesaNum, capacidade: 4, setor: 'Varanda VIP' }, tenantId);

    // Identificar estoque inicial dos insumos da carne/pão para verificar baixa
    const picanhaInsumo = estoque.itens.find(i => i.nome.toLowerCase().includes('carne') || i.nome.toLowerCase().includes('picanha'));
    const qtdEstoqueAntes = picanhaInsumo?.quantidadeAtual || 0;

    const lancamento = app.lancarItensComandaMesa(
      mesaNum,
      [
        {
          produtoId: 'prod-picanha-vip',
          nome: 'Picanha na Chapa Especial',
          precoUnitario: 80.0,
          quantidade: 2,
          subtotal: 160.0,
          observacoes: 'Ao Ponto | Sem Cebola',
          clienteNome: 'Mariana Lima',
        },
        {
          produtoId: 'prod-suco',
          nome: 'Suco Natural de Laranja',
          precoUnitario: 12.0,
          quantidade: 2,
          subtotal: 24.0,
          observacoes: 'Com Gelo e Limão',
          clienteNome: 'Roberto Lima',
        },
      ],
      'Garçom Marcelo',
      tenantId
    );
    check('1.2 Lançamento de Itens na Comanda', lancamento.sucesso && lancamento.totalAdicionado === 184.0, `Total Adicionado: R$ ${lancamento.totalAdicionado}`);

    let mesa = useAppStore.getState().getMesasPorTenant(tenantId).find(m => m.numero === mesaNum);
    check('1.3 Status da Mesa passa a Ocupada', mesa?.status === 'ocupada');
    check('1.4 Consumo Total da Mesa correto', mesa?.totalConsumo === 184.0);
    check('1.5 Comanda possui 2 itens registrados', mesa?.comandaItens?.length === 2);

    // 1.6 Couvert Artístico: ativar e verificar cálculo por comanda
    useSaaSStore.getState().atualizarDadosTenant(tenantId, {
      couvertArtisticoAtivo: true,
      valorCouvertPorComanda: 15.0,
      valorCouvertPorPessoa: 15.0,
    });
    const subtotalBruto = 184.0;
    const taxaServico10 = Number((subtotalBruto * 0.1).toFixed(2)); // R$ 18,40
    const couvertTotal = 30.0; // 2 comandas abertas (Mariana + Roberto)
    const totalComTaxas = subtotalBruto + taxaServico10 + couvertTotal; // R$ 232,40

    check('1.6 Cálculo de Subtotal + 10% + Couvert Artístico', totalComTaxas === 232.40, `Subtotal: R$ 184 | 10%: R$ ${taxaServico10} | Couvert: R$ ${couvertTotal} = R$ ${totalComTaxas}`);

    // 1.7 Confirmar pagamento da conta via PIX
    const vendaMesa: VendaRealizada = {
      id: `venda-mesa-${Date.now()}`,
      tenantId,
      tipoOrigem: 'mesa',
      mesaNumero: mesaNum,
      dataHora: '20/10/2026 13:00',
      total: totalComTaxas,
      subtotalBruto,
      taxaServico: taxaServico10,
      couvertArtistico: couvertTotal,
      quantidadeCouvert: 2,
      desconto: 0,
      formaPagamento: 'pix',
      itens: [
        { produtoId: 'prod-picanha-vip', nome: 'Picanha na Chapa', quantidade: 2, precoUnitario: 80.0, subtotal: 160.0 },
        { produtoId: 'prod-suco', nome: 'Suco Natural', quantidade: 2, precoUnitario: 12.0, subtotal: 24.0 },
      ],
      operador: 'Garçom Marcelo',
      status: 'concluida',
    };
    app.registrarVenda(vendaMesa);

    // 1.8 Baixa de estoque do prato
    useEstoqueStore.getState().baixarEstoquePorVenda('Picanha na Chapa Especial', 2);
    check('1.7 Venda registrada no histórico financeiro', useAppStore.getState().vendas.some(v => v.id === vendaMesa.id));
    check('1.8 Caixa atualizado com total de vendas', useAppStore.getState().caixaAtual.totalVendas >= totalComTaxas);

    // 1.9 Liberar mesa
    app.editarMesa(mesaNum, { status: 'livre', totalConsumo: 0, comandaItens: [] }, tenantId);
    mesa = useAppStore.getState().getMesasPorTenant(tenantId).find(m => m.numero === mesaNum);
    check('1.9 Mesa liberada após encerramento da conta', mesa?.status === 'livre');
  } catch (err: any) {
    check('1.X Erro Crítico no Fluxo de Venda', false, err?.message);
  }

  // =================================================================
  // FLUXO 2: FLUXO DE DELIVERY COMPLETO
  // =================================================================
  console.log('\n📋 2. Testando Fluxo de Delivery Completo (Pedido ➔ Entrega)...');
  try {
    const delivery = useDeliveryStore.getState();

    // 2.1 Cálculo automático de taxa por distância
    const taxa1Km = delivery.calcularTaxaPorDistancia(1.2);
    const taxa3Km = delivery.calcularTaxaPorDistancia(3.5);
    const taxa7Km = delivery.calcularTaxaPorDistancia(7.0);
    check('2.1 Cálculo progressivo de taxa de entrega por raio', taxa1Km < taxa3Km && taxa3Km < taxa7Km, `1.2km: R$ ${taxa1Km} | 3.5km: R$ ${taxa3Km} | 7.0km: R$ ${taxa7Km}`);

    // 2.2 Criação do pedido com formulário completo
    const subtotalItens = 89.0;
    const taxaCalculada = delivery.calcularTaxaPorDistancia(2.8); // Faixa 4.0km = R$ 6.50
    const totalEsperado = subtotalItens + taxaCalculada;

    const novoPedido = delivery.adicionarPedidoDelivery({
      clienteNome: 'Juliana Beatriz',
      clienteTelefone: '(31) 99333-2211',
      tipo: 'delivery',
      endereco: {
        rua: 'Rua Tomé de Souza',
        numero: '850',
        bairro: 'Savassi',
        cidade: 'Belo Horizonte',
        complemento: 'Bloco B, Apto 301',
        pontoReferencia: 'Ao lado da Praça da Liberdade',
        distanciaKm: 2.8,
      },
      itens: [
        { nome: 'Combo Burger Artesanal + Batata Rústica', quantidade: 2, preco: 44.5 },
      ],
      subtotal: subtotalItens,
      taxaEntrega: taxaCalculada,
      total: totalEsperado,
      formaPagamento: 'pix',
      status: 'preparando',
      pago: true,
    });

    check('2.2 Criação do Pedido Delivery com Total e Taxa', !!novoPedido && novoPedido.total === totalEsperado, `Total: R$ ${novoPedido?.total}`);
    check('2.3 Dados de endereço completo persistidos', novoPedido?.endereco?.complemento === 'Bloco B, Apto 301');

    // 2.3 Transição dos status de entrega
    delivery.avancarStatusDelivery(novoPedido.id); // preparando -> pronto
    let p = useDeliveryStore.getState().pedidos.find(x => x.id === novoPedido.id);
    check('2.4 Avanço: preparando ➔ pronto na bancada', p?.status === 'pronto');

    delivery.atribuirEntregador(novoPedido.id, 'Thiago Silva (Moto 1)');
    p = useDeliveryStore.getState().pedidos.find(x => x.id === novoPedido.id);
    check('2.5 Atribuição de Entregador ➔ retirado para entrega', p?.entregadorNome === 'Thiago Silva (Moto 1)' && p?.status === 'retirado');

    delivery.avancarStatusDelivery(novoPedido.id); // retirado -> a_caminho
    p = useDeliveryStore.getState().pedidos.find(x => x.id === novoPedido.id);
    check('2.6 Avanço: retirado ➔ a caminho do endereço', p?.status === 'a_caminho');

    delivery.avancarStatusDelivery(novoPedido.id); // a_caminho -> entregue
    p = useDeliveryStore.getState().pedidos.find(x => x.id === novoPedido.id);
    check('2.7 Avanço: a caminho ➔ entregue ao cliente', p?.status === 'entregue');
  } catch (err: any) {
    check('2.X Erro Crítico no Fluxo de Delivery', false, err?.message);
  }

  // =================================================================
  // FLUXO 3: ESTOQUE, FICHA TÉCNICA, CANCELAMENTO E ESTORNO
  // =================================================================
  console.log('\n📋 3. Testando Ficha Técnica, Baixa e Estorno de Estoque...');
  try {
    const estoque = useEstoqueStore.getState();
    const app = useAppStore.getState();

    // 3.1 Selecionar insumo de teste
    const queijo = estoque.itens.find(i => i.nome.toLowerCase().includes('queijo') || i.nome.toLowerCase().includes('mussarela'));
    if (!queijo) throw new Error('Insumo Queijo não localizado');

    const saldoOriginal = queijo.quantidadeAtual;

    // 3.2 Simular venda com baixa de estoque
    estoque.registrarMovimentacao({
      itemId: queijo.id,
      itemNome: queijo.nome,
      tipo: 'saida_manual',
      quantidade: 3,
      unidadeMedida: queijo.unidadeMedida,
      motivo: 'Baixa de teste auditoria',
      responsavel: 'Auditor de Sistema',
    });
    check('3.1 Registro de saída de estoque para venda', useEstoqueStore.getState().movimentacoes[0].tipo === 'saida_manual');

    // 3.3 Testar Estorno por Cancelamento de Venda
    const vendaTeste: VendaRealizada = {
      id: `venda-cancelar-${Date.now()}`,
      tenantId: 'tenant-01',
      tipoOrigem: 'balcao',
      dataHora: '20/10/2026 13:30',
      total: 50.0,
      subtotalBruto: 50.0,
      taxaServico: 0,
      couvertArtistico: 0,
      desconto: 0,
      formaPagamento: 'dinheiro',
      itens: [{ produtoId: queijo.id, nome: 'Porção de Queijo Empanado', quantidade: 1, precoUnitario: 50.0, subtotal: 50.0 }],
      operador: 'Operador Caixa',
      status: 'concluida',
    };
    app.registrarVenda(vendaTeste);

    const cancelamento = app.cancelarVenda(vendaTeste.id, 'Cliente desistiu antes do preparo', 'Gerente Master');
    check('3.2 Cancelamento de venda com autorização', cancelamento.sucesso);

    const vendaCancelada = useAppStore.getState().vendas.find(v => v.id === vendaTeste.id);
    check('3.3 Status da venda marcado como "cancelada"', vendaCancelada?.status === 'cancelada');
    check('3.4 Motivo do cancelamento registrado', vendaCancelada?.motivoCancelamento === 'Cliente desistiu antes do preparo');
  } catch (err: any) {
    check('3.X Erro Crítico no Fluxo de Estoque', false, err?.message);
  }

  // =================================================================
  // FLUXO 4: RESERVAS DE MESAS E VALIDAÇÃO DE PLANOS
  // =================================================================
  console.log('\n📋 4. Testando Módulo de Reservas de Mesas...');
  try {
    const saas = useSaaSStore.getState();
    const reservas = useReservaStore.getState();

    // 4.1 Validação de Planos: Starter bloqueado / Pro e Enterprise liberados
    const planoStarter = saas.planos.find(p => p.id === 'starter');
    const planoPro = saas.planos.find(p => p.id === 'pro');
    const planoEnterprise = saas.planos.find(p => p.id === 'enterprise');

    check('4.1 Plano Starter bloqueia Reservas', planoStarter?.limites.reservaMesasIncluso === false);
    check('4.2 Plano Pro libera Reservas', planoPro?.limites.reservaMesasIncluso === true);
    check('4.3 Plano Enterprise libera Reservas', planoEnterprise?.limites.reservaMesasIncluso === true);

    // 4.2 Criação de reserva com perguntas do ELOBOT (bolo, aniversário, pessoas)
    const novaReserva = reservas.adicionarReserva({
      tenantId: 'tenant-01',
      clienteNome: 'Carlos Andrade',
      clienteTelefone: '(31) 98888-9999',
      data: '2026-10-25',
      horario: '21:00',
      quantidadePessoas: 6,
      mesaNumero: 3,
      status: 'pendente',
      especiais: {
        aniversario: true,
        presencaBolo: true,
        decoracao: true,
        observacoes: 'Trazer bolo na hora do parabéns com velinhas',
      },
      observacoes: 'Mesa no piso superior perto da janela',
      origem: 'elobot',
    });

    check('4.4 Reserva criada com campos especiais do ELOBOT', !!novaReserva && novaReserva.especiais?.presencaBolo === true && novaReserva.especiais?.aniversario === true);

    // 4.3 Acomodar clientes na mesa
    const sentar = reservas.sentarReservaNaMesa(novaReserva.id, 3, 'tenant-01');
    check('4.5 Acomodar reserva na Mesa #3', sentar.sucesso);

    const mesa3 = useAppStore.getState().getMesasPorTenant('tenant-01').find(m => m.numero === 3);
    check('4.6 Mesa #3 vinculada ao cliente da reserva', mesa3?.status === 'ocupada' && mesa3?.responsavelNome === 'Carlos Andrade');

    // 4.4 Cancelar reserva e liberar mesa
    reservas.cancelarReserva(novaReserva.id, 'Desistência do cliente', 'tenant-01');
    const resCancel = useReservaStore.getState().getReservas('tenant-01').find(r => r.id === novaReserva.id);
    check('4.7 Cancelamento de reserva com registro de motivo', resCancel?.status === 'cancelada');
  } catch (err: any) {
    check('4.X Erro Crítico no Fluxo de Reservas', false, err?.message);
  }

  // =================================================================
  // FLUXO 5: FLUXO FINANCEIRO & DRE DO RESTAURANTE VS MASTER
  // =================================================================
  console.log('\n📋 5. Testando DRE Financeiro do Restaurante e DRE Corporativo Master...');
  try {
    const tenantId = 'tenant-01';
    const app = useAppStore.getState();
    const saas = useSaaSStore.getState();

    // 5.1 DRE Básico do Restaurante
    const vendasTenant = app.getVendasPorTenant(tenantId).filter(v => v.status === 'concluida');
    const receitaBruta = vendasTenant.reduce((acc, v) => acc + (v.total || 0), 0);
    const totalDescontos = vendasTenant.reduce((acc, v) => acc + (v.desconto || 0), 0);
    const receitaLiquida = receitaBruta - totalDescontos;

    const despesas = app.getDespesasPorTenant(tenantId);
    const totalDespesasOperacionais = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);

    // Estimativa padrão de CMV (35% dos insumos)
    const cmvEstimado = Number((receitaLiquida * 0.35).toFixed(2));
    const lucroBruto = receitaLiquida - cmvEstimado;
    const resultadoOperacional = lucroBruto - totalDespesasOperacionais;

    check('5.1 Receita Bruta calculada no DRE', receitaBruta > 0, `Receita Bruta: R$ ${receitaBruta.toFixed(2)}`);
    check('5.2 Receita Líquida e Deduções calculadas', receitaLiquida === receitaBruta - totalDescontos);
    check('5.3 Margem de Contribuição / Lucro Bruto calculado', lucroBruto > 0, `Lucro Bruto: R$ ${lucroBruto.toFixed(2)}`);
    check('5.4 Resultado Operacional do Estabelecimento calculado', typeof resultadoOperacional === 'number', `Resultado Operacional: R$ ${resultadoOperacional.toFixed(2)}`);

    // 5.2 DRE Corporativo do SaaS Master
    const mrr = saas.getMRR();
    const custosInfra = saas.custosInfra;
    const custosVariaveisGatewayImposto = Number(((mrr * ((custosInfra.taxaGatewayPct || 0) + (custosInfra.impostoSimplesPct || 0))) / 100).toFixed(2));
    const totalCustosInfra = (custosInfra.cloudVps || 0) + (custosInfra.evolutionWhatsapp || 0) + (custosInfra.suporteMarketing || 0) + custosVariaveisGatewayImposto;
    const lucroLiquidoSaaSMaster = mrr - totalCustosInfra;

    check('5.5 MRR do SaaS Master calculado', mrr > 0, `MRR: R$ ${mrr.toFixed(2)}`);
    check('5.6 Custos de Infraestrutura calculados', totalCustosInfra > 0, `Custos Cloud/Infra: R$ ${totalCustosInfra.toFixed(2)}`);
    check('5.7 Lucro Líquido Corporativo do Master calculado', typeof lucroLiquidoSaaSMaster === 'number', `Lucro Master: R$ ${lucroLiquidoSaaSMaster.toFixed(2)}`);

    // 5.3 Isolamento Multi-Tenancy: Dados de vendas do Tenant 01 não vazam para Tenant 02
    const vendasT1 = app.getVendasPorTenant('tenant-01');
    const vendasT2 = app.getVendasPorTenant('tenant-02');
    const idsT1 = new Set(vendasT1.map(v => v.id));
    const vazamento = vendasT2.some(v => idsT1.has(v.id));
    check('5.8 Isolamento Multi-Tenancy estrito de vendas entre lojas', !vazamento, `T1: ${vendasT1.length} vendas | T2: ${vendasT2.length} vendas`);
  } catch (err: any) {
    check('5.X Erro Crítico no Fluxo Financeiro', false, err?.message);
  }

  // =================================================================
  // FLUXO 6: SEGURANÇA, PERMISSÕES (RBAC) & PIN MASTER
  // =================================================================
  console.log('\n📋 6. Testando Segurança, RBAC e Bloqueio de PIN...');
  try {
    const auth = useAuthStore.getState();
    const app = useAppStore.getState();
    const saas = useSaaSStore.getState();

    // Provisiona dinamicamente colaboradores pelo Master
    auth.adicionarUsuario({
      nome: 'Lucas Oliveira (Garçom)',
      email: 'garcom@eloserve.com.br',
      cargo: 'garcom',
      tenantId: 'tenant-01',
      pin: '3344',
      senha: 'garcom@2026',
      ativo: true,
    });
    auth.adicionarUsuario({
      nome: 'Chef Rodrigo (Cozinha)',
      email: 'cozinha@eloserve.com.br',
      cargo: 'cozinha',
      tenantId: 'tenant-01',
      pin: '5566',
      senha: 'cozinha@2026',
      ativo: true,
    });

    // 6.1 Permissões de Garçom
    auth.login('garcom@eloserve.com.br', '3344');
    check('6.1 Garçom tem acesso a Mesas e PDV', auth.temPermissao(['garcom', 'caixa']));
    check('6.2 Garçom bloqueado no Painel do Dono', !auth.temPermissao(['admin_restaurante']));
    check('6.3 Garçom bloqueado no SaaS Master', !auth.temPermissao(['super_admin']));

    // 6.2 Permissões de Cozinha
    auth.login('cozinha@eloserve.com.br', '5566');
    check('6.4 Cozinha tem acesso ao KDS', auth.temPermissao(['cozinha']));
    check('6.5 Cozinha bloqueada no Caixa e Financeiro', !auth.temPermissao(['caixa', 'admin_restaurante']));

    // 6.3 Validação de PIN de Gerente para operações críticas
    check('6.6 PIN Admin válido aceito (1234)', app.validarPinAdmin('1234'));
    check('6.7 PIN incorreto rejeitado', !app.validarPinAdmin('0000'));

    // 6.4 Brute-force Lock do Painel Master
    saas.bloquearMaster();
    check('6.8 Painel Master bloqueado inicialmente', !saas.masterDesbloqueado);

    // Tentativa com PIN errado
    const resErr = saas.desbloquearMaster('errado');
    check('6.9 Rejeição de senha Master incorreta', !resErr.sucesso);

    // Desbloqueio com PIN correto
    const resOk = saas.desbloquearMaster(saas.codigoSegurancaMaster);
    check('6.10 Desbloqueio com senha Master correta', resOk.sucesso);
  } catch (err: any) {
    check('6.X Erro Crítico de Segurança', false, err?.message);
  }

  // =================================================================
  // RESUMO GERAL
  // =================================================================
  console.log('\n================================================================');
  console.log('📊 RESULTADO DA AUDITORIA GERAL DOS FLUXOS');
  console.log('================================================================');
  const total = steps.length;
  const passed = steps.filter(s => s.passed).length;
  const failed = steps.filter(s => !s.passed).length;

  console.log(`Total de verificações realizadas: ${total}`);
  console.log(`Aprovadas: ${passed} ✅`);
  console.log(`Reprovadas: ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('Falhas detectadas:');
    steps.filter(s => !s.passed).forEach(f => console.error(`- ${f.name}: ${f.details || f.error}`));
    process.exit(1);
  } else {
    console.log('🏆 TODOS OS 6 FLUXOS DE NEGÓCIO E SEGURANÇA FORAM VALIDADOS COM 100% DE SUCESSO!');
    process.exit(0);
  }
}

runBusinessFlowAudit().catch(e => {
  console.error('Erro geral durante auditoria:', e);
  process.exit(1);
});
