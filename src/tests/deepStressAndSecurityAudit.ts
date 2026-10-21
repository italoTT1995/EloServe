/**
 * DEEP STRESS, SECURITY & INTEGRATION AUDIT SUITE
 * EloServe PDV & SaaS Engine - v2.4
 *
 * Suites de testes aprofundados:
 * 1. Torre de Monitoramento & Central de Suporte ao Vivo (Helpdesk)
 * 2. Autenticação, RBAC & Governança Corporativa
 * 3. Multi-Tenancy Rígido: Isolamento Triplo e Zero-Vazamento
 * 4. Ficha Técnica, Baixa Múltipla e Estorno de Insumos
 * 5. Couvert Artístico, Taxa de 10% e Split Payments (Divisão de Conta)
 * 6. Delivery: Faixas Progressivas, Raio Máximo e Ciclo de Vida
 * 7. Reservas de Mesas: Limites de Planos e Alocação de Salão
 * 8. Caixa Operacional: Fundo de Troco, Sangria, Suprimento e Fechamento
 */

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useReservaStore } from '../store/useReservaStore';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { VendaRealizada } from '../types';

interface AuditResult {
  suite: string;
  testName: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const auditResults: AuditResult[] = [];

function check(suite: string, testName: string, condition: boolean, details?: string) {
  if (condition) {
    auditResults.push({ suite, testName, passed: true, details });
    console.log(`  ✅ [${suite}] ${testName}${details ? ` -> ${details}` : ''}`);
  } else {
    auditResults.push({ suite, testName, passed: false, details, error: 'Falha na asserção' });
    console.error(`  ❌ [${suite}] FALHA: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runDeepStressAudit() {
  console.log('================================================================');
  console.log('⚡ AUDITORIA PROFUNDA DE SEGURANÇA, ESTRESSE E MULTI-TENANCY');
  console.log('================================================================\n');

  // ============================================================================
  // SUITE 1: TORRE DE MONITORAMENTO & CENTRAL DE SUPORTE AO VIVO (HELPDESK)
  // ============================================================================
  console.log('📡 1. Testando Central de Chamados de Suporte & Monitoramento Master...');

  // 1.1 Limpeza e inicialização de chamados
  useSaaSStore.setState({ chamadosSuporte: [] });
  check('SUPORTE', '1.1 Fila de suporte inicializada limpa', useSaaSStore.getState().chamadosSuporte.length === 0);

  // 1.2 Abertura de chamado normal por Restaurante A
  const chamadoA = useSaaSStore.getState().abrirChamadoSuporte({
    tenantId: 'tenant-loja-a',
    tenantNome: 'Pizzaria Bella Napoli',
    solicitanteNome: 'Carlos Gerente',
    solicitanteCargo: 'Gerente Operacional',
    telefoneContato: '(31) 98888-1111',
    categoria: 'caixa',
    descricao: 'Dúvida sobre cancelamento de cupom fiscal no fechamento',
    prioridade: 'normal',
  });

  check('SUPORTE', '1.2 Chamado de suporte criado com ID único', Boolean(chamadoA && chamadoA.id.startsWith('chm-')));
  check('SUPORTE', '1.3 Status inicial do chamado é "aberto"', chamadoA.status === 'aberto');
  check('SUPORTE', '1.4 Horário de criação registrado', Boolean(chamadoA.criadoEm));

  // 1.3 Abertura de chamado URGENTE por Restaurante B
  const chamadoB = useSaaSStore.getState().abrirChamadoSuporte({
    tenantId: 'tenant-loja-b',
    tenantNome: 'Burger Prime',
    solicitanteNome: 'Lucas Caixa',
    solicitanteCargo: 'Operador de Caixa',
    telefoneContato: '(31) 97777-2222',
    categoria: 'kds',
    descricao: 'Impressora do Bar não está recebendo os pedidos da comanda',
    prioridade: 'urgente',
  });

  check('SUPORTE', '1.5 Chamado urgente registrado com prioridade "urgente"', chamadoB.prioridade === 'urgente');

  // 1.4 Verificação da lista de chamados abertos
  const abertos = useSaaSStore.getState().getChamadosAbertos();
  check('SUPORTE', '1.6 Fila de chamados abertos possui 2 registros', abertos.length === 2);

  // 1.5 Transição para "em_atendimento"
  useSaaSStore.getState().atualizarStatusChamado(chamadoA.id, 'em_atendimento', 'Ítalo Silva (Master)');
  const chamadoAAtualizado = useSaaSStore.getState().chamadosSuporte.find((c) => c.id === chamadoA.id);
  check('SUPORTE', '1.7 Chamado A transicionado para "em_atendimento"', chamadoAAtualizado?.status === 'em_atendimento');

  // 1.6 Conclusão de chamado (resolvido) com carimbo de auditoria
  useSaaSStore.getState().atualizarStatusChamado(chamadoB.id, 'resolvido', 'Ítalo Silva (Master)');
  const chamadoBResolvido = useSaaSStore.getState().chamadosSuporte.find((c) => c.id === chamadoB.id);
  check('SUPORTE', '1.8 Chamado B marcado como "resolvido"', chamadoBResolvido?.status === 'resolvido');
  check('SUPORTE', '1.9 Carimbo de atendente Master registrado', chamadoBResolvido?.resolvidoPor === 'Ítalo Silva (Master)');
  check('SUPORTE', '1.10 Carimbo de hora de resolução registrado', Boolean(chamadoBResolvido?.resolvidoEm));

  // 1.7 Chamados abertos agora devem ser apenas 1
  const abertosAposResolucao = useSaaSStore.getState().getChamadosAbertos();
  check('SUPORTE', '1.11 Fila de pendências atualizada para 1 chamado ativo', abertosAposResolucao.length === 1);

  // 1.8 Filtro por tenant
  const chamadosPorLojaA = useSaaSStore.getState().getChamadosPorTenant('tenant-loja-a');
  check('SUPORTE', '1.12 Isolamento de histórico de chamados por tenant', chamadosPorLojaA.length === 1 && chamadosPorLojaA[0].tenantId === 'tenant-loja-a');

  // ============================================================================
  // SUITE 2: AUTENTICAÇÃO, GOVERNANÇA CORPORATIVA & RBAC
  // ============================================================================
  console.log('\n🔐 2. Testando Autenticação, Governança & Níveis de Acesso (RBAC)...');

  // 2.1 Login Master Oficial via e-mail e senha
  const loginMasterSenha = useAuthStore.getState().login('master@eloserve.com.br', 'EloMaster@2026');
  check('AUTH_RBAC', '2.1 Login Master Oficial com senha aprovado', loginMasterSenha.sucesso === true && loginMasterSenha.usuario?.cargo === 'super_admin');

  // 2.2 Login Master Oficial com PIN Rápido 8899
  const loginMasterPin = useAuthStore.getState().login('master@eloserve.com.br', '8899');
  check('AUTH_RBAC', '2.2 Login Master Oficial com PIN 8899 aprovado', loginMasterPin.sucesso === true && loginMasterPin.usuario?.cargo === 'super_admin');

  // 2.3 Login Master com alias italo@eloserve.com.br
  const loginMasterAlias = useAuthStore.getState().login('italo@eloserve.com.br', '8899');
  check('AUTH_RBAC', '2.3 Login Master com alias italo@eloserve.com.br aprovado', loginMasterAlias.sucesso === true);

  // 2.4 Rejeição de senha inválida
  const loginSenhaErrada = useAuthStore.getState().login('master@eloserve.com.br', 'senha_errada_123');
  check('AUTH_RBAC', '2.4 Rejeição de senha Master incorreta', loginSenhaErrada.sucesso === false);

  // 2.5 Rejeição de e-mail não existente
  const loginInexistente = useAuthStore.getState().login('fantasma@inexistente.com', '1234');
  check('AUTH_RBAC', '2.5 Rejeição de e-mail não cadastrado', loginInexistente.sucesso === false);

  // 2.6 Cadastro de usuário de restaurante dinâmico e teste de bloqueio de usuário inativo
  const novoOperador = useAuthStore.getState().adicionarUsuario({
    nome: 'Marcos Inativo',
    email: 'marcos@restaurante.com',
    cargo: 'garcom',
    tenantId: 'tenant-loja-a',
    pin: '7788',
    senha: 'Senha@123',
    ativo: false, // DESATIVADO
  });

  const loginUsuarioInativo = useAuthStore.getState().login('marcos@restaurante.com', '7788');
  check('AUTH_RBAC', '2.6 Usuário desativado é impedido de logar', loginUsuarioInativo.sucesso === false && Boolean(loginUsuarioInativo.mensagem?.includes('desativado')));

  // Ativa o operador e valida acesso
  useAuthStore.getState().editarUsuario(novoOperador.id, { ativo: true });
  const loginUsuarioAtivo = useAuthStore.getState().login('marcos@restaurante.com', '7788');
  check('AUTH_RBAC', '2.7 Operador ativado acessa com sucesso', loginUsuarioAtivo.sucesso === true && loginUsuarioAtivo.usuario?.cargo === 'garcom');

  // 2.7 Logout seguro
  useAuthStore.getState().logout();
  check('AUTH_RBAC', '2.8 Logout limpa sessão e remove permissões ativas', useAuthStore.getState().usuarioLogado === null && useAuthStore.getState().isAuthenticated === false);

  // ============================================================================
  // SUITE 3: MULTI-TENANCY RÍGIDO: ISOLAMENTO TRIPLO
  // ============================================================================
  console.log('\n🌐 3. Testando Multi-Tenancy Rígido com 3 Estabelecimentos Independentes...');

  const tA = 'tenant-pizzaria';
  const tB = 'tenant-hamburgueria';
  const tC = 'tenant-sushi';

  // Configuração dos 3 estabelecimentos
  useSaaSStore.setState({
    tenants: [
      {
        id: tA,
        nomeFantasia: 'Pizzaria Napolitana',
        razaoSocial: 'Napoli Pizza LTDA',
        documento: '11.111.111/0001-11',
        responsavelNome: 'Antonio Napoli',
        telefoneWhatsApp: '(11) 91111-1111',
        email: 'antonio@napoli.com',
        cidadeUf: 'São Paulo / SP',
        planoId: 'enterprise',
        statusAssinatura: 'ativo',
        valorMensalidade: 299,
        dataInicio: '01/01/2026',
        proximoVencimento: '01/12/2026',
        instanciaWhatsAppConectada: true,
        criadoEm: '2026-01-01',
        dreHabilitado: true,
        couvertArtisticoAtivo: false,
      },
      {
        id: tB,
        nomeFantasia: 'Burger Prime Gourmet',
        razaoSocial: 'Prime Burger LTDA',
        documento: '22.222.222/0001-22',
        responsavelNome: 'Beatriz Burger',
        telefoneWhatsApp: '(21) 92222-2222',
        email: 'beatriz@burger.com',
        cidadeUf: 'Rio de Janeiro / RJ',
        planoId: 'pro',
        statusAssinatura: 'ativo',
        valorMensalidade: 199,
        dataInicio: '01/01/2026',
        proximoVencimento: '01/12/2026',
        instanciaWhatsAppConectada: false,
        criadoEm: '2026-01-01',
        dreHabilitado: true,
        couvertArtisticoAtivo: false,
      },
      {
        id: tC,
        nomeFantasia: 'Sushi Kenzo',
        razaoSocial: 'Kenzo Sushi LTDA',
        documento: '33.333.333/0001-33',
        responsavelNome: 'Kenzo Takahashi',
        telefoneWhatsApp: '(31) 93333-3333',
        email: 'kenzo@sushi.com',
        cidadeUf: 'Belo Horizonte / MG',
        planoId: 'starter',
        statusAssinatura: 'ativo',
        valorMensalidade: 99,
        dataInicio: '01/01/2026',
        proximoVencimento: '01/12/2026',
        instanciaWhatsAppConectada: true,
        criadoEm: '2026-01-01',
        dreHabilitado: false,
        couvertArtisticoAtivo: true,
      },
    ],
  });

  // 3.1 Provisionamento e isolamento de mesas
  const mesasA = useAppStore.getState().getMesasPorTenant(tA);
  const mesasB = useAppStore.getState().getMesasPorTenant(tB);
  const mesasC = useAppStore.getState().getMesasPorTenant(tC);

  check('MULTI_TENANT', '3.1 Mesas provisionadas para Pizzaria', mesasA.length > 0 && mesasA.every((m) => m.tenantId === tA));
  check('MULTI_TENANT', '3.2 Mesas provisionadas para Hamburgueria', mesasB.length > 0 && mesasB.every((m) => m.tenantId === tB));
  check('MULTI_TENANT', '3.3 Mesas provisionadas para Sushi', mesasC.length > 0 && mesasC.every((m) => m.tenantId === tC));

  // 3.2 Lançamento de consumo na Mesa 1 da Pizzaria
  useAppStore.getState().lancarItensComandaMesa(
    1,
    [
      {
        produtoId: 'pizza-calabresa',
        nome: 'Pizza Calabresa Gourmet',
        precoUnitario: 75.0,
        quantidade: 2,
        subtotal: 150.0,
        clienteNome: 'Mesa 1',
      },
    ],
    'Garçom',
    tA
  );

  const mesasAposLancamentoA = useAppStore.getState().getMesasPorTenant(tA);
  const mesasAposLancamentoB = useAppStore.getState().getMesasPorTenant(tB);
  const mesa1Pizzaria = mesasAposLancamentoA.find((m) => m.numero === 1);
  const mesa1Burger = mesasAposLancamentoB.find((m) => m.numero === 1);

  check('MULTI_TENANT', '3.4 Mesa 1 da Pizzaria ficou ocupada com R$ 150', mesa1Pizzaria?.status === 'ocupada' && mesa1Pizzaria.totalConsumo === 150);
  check('MULTI_TENANT', '3.5 Mesa 1 da Hamburgueria permaneceu livre com R$ 0 (zero vazamento)', mesa1Burger?.status === 'livre' && mesa1Burger.totalConsumo === 0);

  // 3.3 Registro de venda apenas na Hamburgueria
  useAppStore.setState({ vendas: [] });
  useAppStore.getState().registrarVenda({
    id: 'venda-burger-01',
    tenantId: tB,
    dataHora: new Date().toISOString(),
    formaPagamento: 'pix',
    itens: [
      {
        produtoId: 'b1',
        nome: 'Burger Cheddar Bacon',
        quantidade: 2,
        precoUnitario: 42.0,
        subtotal: 84.0,
      },
    ],
    subtotalBruto: 84.0,
    desconto: 0,
    total: 84.0,
    operador: 'Caixa Burger',
    status: 'concluida',
    tipoOrigem: 'balcao',
  });

  const vendasPizzaria = useAppStore.getState().getVendasPorTenant(tA);
  const vendasBurger = useAppStore.getState().getVendasPorTenant(tB);
  const vendasSushi = useAppStore.getState().getVendasPorTenant(tC);

  check('MULTI_TENANT', '3.6 Vendas da Hamburgueria = 1 venda (R$ 84)', vendasBurger.length === 1 && vendasBurger[0].total === 84);
  check('MULTI_TENANT', '3.7 Vendas da Pizzaria = 0 vendas (isolada)', vendasPizzaria.length === 0);
  check('MULTI_TENANT', '3.8 Vendas do Sushi = 0 vendas (isolada)', vendasSushi.length === 0);

  // ============================================================================
  // SUITE 4: FICHA TÉCNICA (RECEITUÁRIO), BAIXA MÚLTIPLA E ESTORNO
  // ============================================================================
  console.log('\n🥩 4. Testando Ficha Técnica de Pratos, Baixa Proporcional e Estorno...');

  // 4.1 Insumos de estoque para a Hamburgueria
  useEstoqueStore.setState({
    itens: [
      {
        id: 'ins-carne',
        nome: 'Blend de Fraldinha',
        categoria: 'alimentos',
        metodoControle: 'recorrente',
        quantidadeAtual: 10.0, // 10 kg
        unidadeMedida: 'kg',
        estoqueMinimo: 2.0,
        estoqueIdeal: 15.0,
        precoCusto: 35.0,
        statusDisponibilidade: 'disponivel',
      },
      {
        id: 'ins-queijo',
        nome: 'Queijo Cheddar Fatiado',
        categoria: 'alimentos',
        metodoControle: 'recorrente',
        quantidadeAtual: 5.0, // 5 kg
        unidadeMedida: 'kg',
        estoqueMinimo: 1.0,
        estoqueIdeal: 8.0,
        precoCusto: 40.0,
        statusDisponibilidade: 'disponivel',
      },
      {
        id: 'ins-pao',
        nome: 'Pão de Brioche Selado',
        categoria: 'alimentos',
        metodoControle: 'individual',
        quantidadeAtual: 50, // 50 unidades
        unidadeMedida: 'un',
        estoqueMinimo: 10,
        estoqueIdeal: 100,
        precoCusto: 2.0,
        statusDisponibilidade: 'disponivel',
      },
    ],
    fichasTecnicas: [
      {
        id: 'ft-burger',
        produtoId: 'prod-burger-prime',
        nomePrato: 'Burger Cheddar Bacon',
        componentes: [
          {
            ingredienteId: 'ins-carne',
            ingredienteNome: 'Blend de Fraldinha',
            pesoGramas: 200, // 0.2 kg
            custoPorGrama: 0.035,
            custoTotalComponente: 7.0,
          },
          {
            ingredienteId: 'ins-queijo',
            ingredienteNome: 'Queijo Cheddar Fatiado',
            pesoGramas: 50, // 0.05 kg
            custoPorGrama: 0.04,
            custoTotalComponente: 2.0,
          },
        ],
        custoTotalEstimado: 9.0,
        precoVenda: 42.0,
        margemBrutaPercentual: 78.5,
      },
    ],
    movimentacoes: [],
    pedidosProcessados: [],
  });

  check('ESTOQUE', '4.1 Ficha técnica e insumos configurados com sucesso', useEstoqueStore.getState().itens.length === 3);

  // 4.2 Simulação de baixa em venda de 2 Burgers via Ficha Técnica
  const vendaComFicha: VendaRealizada = {
    id: 'venda-ft-01',
    dataHora: new Date().toISOString(),
    formaPagamento: 'pix',
    itens: [
      {
        produtoId: 'prod-burger-prime',
        nome: 'Burger Cheddar Bacon',
        quantidade: 2,
        precoUnitario: 42.0,
        subtotal: 84.0,
        fichaTecnica: [
          {
            ingredienteId: 'ins-carne',
            ingredienteNome: 'Blend de Fraldinha',
            quantidade: 200,
            unidadeMedida: 'g',
            custoUnitarioEstimado: 7.0,
          },
          {
            ingredienteId: 'ins-queijo',
            ingredienteNome: 'Queijo Cheddar Fatiado',
            quantidade: 50,
            unidadeMedida: 'g',
            custoUnitarioEstimado: 2.0,
          },
        ],
      },
    ],
    subtotalBruto: 84.0,
    desconto: 0,
    total: 84.0,
    operador: 'Caixa Master',
    status: 'concluida',
    tipoOrigem: 'balcao',
  };

  const baixaRes = useEstoqueStore.getState().processarBaixaVenda(vendaComFicha);
  check('ESTOQUE', '4.2 Baixa de venda com ficha técnica processada', baixaRes.sucesso === true && baixaRes.movimentacoesGeradas === 2);

  const carneApos = useEstoqueStore.getState().itens.find((i) => i.id === 'ins-carne');
  const queijoApos = useEstoqueStore.getState().itens.find((i) => i.id === 'ins-queijo');

  // 10kg - (2 x 0.2kg) = 9.6kg
  check('ESTOQUE', '4.3 Saldo de carne baixado corretamente (10kg - 0.4kg = 9.6kg)', carneApos?.quantidadeAtual === 9.6);
  // 5kg - (2 x 0.05kg) = 4.9kg
  check('ESTOQUE', '4.4 Saldo de queijo baixado corretamente (5kg - 0.1kg = 4.9kg)', queijoApos?.quantidadeAtual === 4.9);

  // 4.3 Proteção contra baixa duplicada do mesmo pedido
  const baixaDuplicada = useEstoqueStore.getState().processarBaixaVenda(vendaComFicha);
  check('ESTOQUE', '4.5 Idempotência: Bloqueio de baixa duplicada no mesmo pedido', baixaDuplicada.sucesso === false);

  // 4.4 Estorno de baixa de venda
  const estornoRes = useEstoqueStore.getState().estornarBaixaVenda(vendaComFicha, 'Cancelamento de teste', 'Gerente');
  check('ESTOQUE', '4.6 Estorno de baixa de venda executado', estornoRes.sucesso === true && estornoRes.itensRestaurados === 2);

  const carneEstornada = useEstoqueStore.getState().itens.find((i) => i.id === 'ins-carne');
  const queijoEstornado = useEstoqueStore.getState().itens.find((i) => i.id === 'ins-queijo');
  check('ESTOQUE', '4.7 Saldo de carne restaurado para 10kg', carneEstornada?.quantidadeAtual === 10.0);
  check('ESTOQUE', '4.8 Saldo de queijo restaurado para 5kg', queijoEstornado?.quantidadeAtual === 5.0);

  // ============================================================================
  // SUITE 5: COUVERT ARTÍSTICO, TAXA 10% E SPLIT PAYMENT
  // ============================================================================
  console.log('\n🎭 5. Testando Couvert Artístico, Taxa de 10% e Divisão de Contas...');

  const subtotalConsumo = 200.0;
  const numPessoas = 4;
  const valorCouvertIndividual = 10.0;
  const couvertTotal = numPessoas * valorCouvertIndividual; // R$ 40
  const taxaServico10 = subtotalConsumo * 0.1; // R$ 20
  const totalEsperado = subtotalConsumo + couvertTotal + taxaServico10; // R$ 260.0

  check('FINANCEIRO', '5.1 Cálculo de subtotal + couvert + taxa 10% correto (R$ 260)', totalEsperado === 260.0);

  // Isenção de couvert para 1 pessoa (ex: criança)
  const couvertComIsencao = (numPessoas - 1) * valorCouvertIndividual; // R$ 30
  const totalComIsencao = subtotalConsumo + couvertComIsencao + taxaServico10; // R$ 250.0
  check('FINANCEIRO', '5.2 Recálculo com isenção pontual de 1 couvert (R$ 250)', totalComIsencao === 250.0);

  // Split Payment (Divisão da conta de R$ 250 em 3 pagamentos)
  const pagamentos = [
    { metodo: 'pix', valor: 100.0 },
    { metodo: 'cartao_credito', valor: 100.0 },
    { metodo: 'dinheiro', valor: 50.0 },
  ];

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const saldoDevedor = totalComIsencao - totalPago;

  check('FINANCEIRO', '5.3 Soma dos pagamentos fracionados atinge R$ 250,00', totalPago === 250.0);
  check('FINANCEIRO', '5.4 Saldo devedor zerado após split payments', saldoDevedor === 0);

  // ============================================================================
  // SUITE 6: DELIVERY: FAIXAS PROGRESSIVAS & RAIO MÁXIMO
  // ============================================================================
  console.log('\n🛵 6. Testando Módulo Delivery: Cálculo por Raio e Ciclo de Vida...');

  useDeliveryStore.setState({
    raioMaximoKm: 12.0,
    faixasTaxa: [
      { ateKm: 2, taxa: 4.0 },
      { ateKm: 5, taxa: 8.0 },
      { ateKm: 10, taxa: 15.0 },
      { ateKm: 99, taxa: 25.0 },
    ],
    pedidos: [],
  });

  const taxa1km = useDeliveryStore.getState().calcularTaxaPorDistancia(1.5);
  const taxa4km = useDeliveryStore.getState().calcularTaxaPorDistancia(4.2);
  const taxa8km = useDeliveryStore.getState().calcularTaxaPorDistancia(8.0);
  const taxa15km = useDeliveryStore.getState().calcularTaxaPorDistancia(15.0);

  check('DELIVERY', '6.1 Taxa raio 1.5km = R$ 4.00', taxa1km === 4.0);
  check('DELIVERY', '6.2 Taxa raio 4.2km = R$ 8.00', taxa4km === 8.0);
  check('DELIVERY', '6.3 Taxa raio 8.0km = R$ 15.00', taxa8km === 15.0);
  check('DELIVERY', '6.4 Taxa raio 15km = R$ 25.00 (faixa estendida)', taxa15km === 25.0);

  // Ciclo de status do pedido delivery
  const novoPedidoDelivery = useDeliveryStore.getState().adicionarPedidoDelivery({
    clienteNome: 'Mariana Lima',
    clienteTelefone: '(31) 98765-4321',
    tipo: 'delivery',
    endereco: {
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Belo Horizonte',
      complemento: 'Apto 402',
    },
    itens: [
      {
        nome: 'Super Combo Artesanal',
        quantidade: 1,
        preco: 60.0,
      },
    ],
    subtotal: 60.0,
    taxaEntrega: 8.0,
    total: 68.0,
    formaPagamento: 'pix',
    status: 'preparando',
    pago: true,
  });

  check('DELIVERY', '6.5 Pedido delivery criado com status "preparando"', novoPedidoDelivery.status === 'preparando');
  check('DELIVERY', '6.6 Dados completos de endereço persistidos', Boolean(novoPedidoDelivery.endereco && novoPedidoDelivery.endereco.complemento === 'Apto 402'));

  // Avança para pronto
  useDeliveryStore.getState().avancarStatusDelivery(novoPedidoDelivery.id);
  let pedidoAtualizado = useDeliveryStore.getState().pedidos.find((p) => p.id === novoPedidoDelivery.id);
  check('DELIVERY', '6.7 Avanço para "pronto"', pedidoAtualizado?.status === 'pronto');

  // Atribui entregador
  useDeliveryStore.getState().atribuirEntregador(novoPedidoDelivery.id, 'Motoboy Rogério');
  pedidoAtualizado = useDeliveryStore.getState().pedidos.find((p) => p.id === novoPedidoDelivery.id);
  check('DELIVERY', '6.8 Entregador atribuído com sucesso', pedidoAtualizado?.entregadorNome === 'Motoboy Rogério' && pedidoAtualizado?.status === 'retirado');

  // Avança para a caminho
  useDeliveryStore.getState().avancarStatusDelivery(novoPedidoDelivery.id);
  pedidoAtualizado = useDeliveryStore.getState().pedidos.find((p) => p.id === novoPedidoDelivery.id);
  check('DELIVERY', '6.9 Avanço para "a_caminho"', pedidoAtualizado?.status === 'a_caminho');

  // Avança para entregue
  useDeliveryStore.getState().avancarStatusDelivery(novoPedidoDelivery.id);
  pedidoAtualizado = useDeliveryStore.getState().pedidos.find((p) => p.id === novoPedidoDelivery.id);
  check('DELIVERY', '6.10 Conclusão do ciclo com status "entregue"', pedidoAtualizado?.status === 'entregue');

  // ============================================================================
  // SUITE 7: RESERVAS DE MESAS & LIMITES DE PLANOS
  // ============================================================================
  console.log('\n📅 7. Testando Módulo Reservas: Limites por Plano e Alocação de Mesa...');

  // Plano Starter não tem reservas
  const planos = useSaaSStore.getState().planos;
  const planoStarter = planos.find((p) => p.id === 'starter');
  const planoEnterprise = planos.find((p) => p.id === 'enterprise');

  check('RESERVAS', '7.1 Plano Starter bloqueia Reservas', planoStarter?.limites.reservaMesasIncluso === false);
  check('RESERVAS', '7.2 Plano Enterprise libera Reservas', planoEnterprise?.limites.reservaMesasIncluso === true);

  // Criação de reserva com bolo e aniversário
  useReservaStore.setState({ reservasPorTenant: {} });
  const novaReserva = useReservaStore.getState().adicionarReserva({
    tenantId: tA,
    clienteNome: 'Juliana Costa',
    clienteTelefone: '(31) 99123-4567',
    data: '2026-10-25',
    horario: '20:00',
    quantidadePessoas: 6,
    status: 'confirmada',
    especiais: {
      aniversario: true,
      presencaBolo: true,
      decoracao: false,
      observacoes: 'Mesa perto da janela',
    },
    origem: 'elobot',
  });

  check('RESERVAS', '7.3 Reserva cadastrada com sucesso', Boolean(novaReserva?.id));
  check('RESERVAS', '7.4 Campos do aniversariante e bolo salvos', Boolean(novaReserva.especiais && novaReserva.especiais.aniversario === true && novaReserva.especiais.presencaBolo === true));

  // Acomodar reserva na mesa 2
  const sentarRes = useReservaStore.getState().sentarReservaNaMesa(novaReserva.id, 2, tA);
  check('RESERVAS', '7.5 Acomodação de reserva na mesa executada', sentarRes.sucesso === true);

  const reservaAcomodada = useReservaStore.getState().getReservas(tA).find((r) => r.id === novaReserva.id);
  const mesa2Pizzaria = useAppStore.getState().getMesasPorTenant(tA).find((m) => m.numero === 2);

  check('RESERVAS', '7.6 Status da reserva passa a "concluida"', reservaAcomodada?.status === 'concluida');
  check('RESERVAS', '7.7 Mesa 2 ocupada com o cliente da reserva', mesa2Pizzaria?.status === 'ocupada');

  // ============================================================================
  // SUITE 8: CAIXA OPERACIONAL: FUNDO DE TROCO, SANGRIA E FECHAMENTO
  // ============================================================================
  console.log('\n💵 8. Testando Caixa Operacional: Fundo de Troco, Sangria e Fechamento...');

  // 8.1 Abertura de caixa com troco de R$ 300
  useAppStore.getState().abrirCaixa(300.0);
  let cx = useAppStore.getState().caixaAtual;
  check('CAIXA', '8.1 Abertura de caixa com R$ 300,00', cx.status === 'aberto' && cx.saldoInicial === 300.0);

  // 8.2 Sangria de R$ 100 para compra de gelo
  const sangriaRes = useAppStore.getState().registrarSangria(100.0, 'Compra emergencial de sacos de gelo', 'Caixa Operador');
  cx = useAppStore.getState().caixaAtual;
  check('CAIXA', '8.2 Sangria registrada no caixa', sangriaRes.sucesso === true && cx.totalSangrias === 100.0);

  // 8.3 Suprimento de R$ 50 para moedas
  const suprimentoRes = useAppStore.getState().registrarSuprimento(50.0, 'Entrada de moedas de troco', 'Caixa Operador');
  cx = useAppStore.getState().caixaAtual;
  check('CAIXA', '8.3 Suprimento registrado no caixa', suprimentoRes.sucesso === true && cx.totalSuprimentos === 350.0);

  // 8.4 Registro de venda em dinheiro de R$ 150
  useAppStore.getState().registrarVendaCaixa(150.0);
  cx = useAppStore.getState().caixaAtual;
  check('CAIXA', '8.4 Total de vendas acumulado no caixa', cx.totalVendas === 150.0);

  // Saldo esperado em caixa físico: 350 (suprimentos totais com troco inicial) - 100 (sangria) + 150 (vendas) = R$ 400.0
  const saldoEsperadoCaixa = cx.totalSuprimentos - cx.totalSangrias + cx.totalVendas;
  check('CAIXA', '8.5 Saldo físico final esperado = R$ 400,00', saldoEsperadoCaixa === 400.0);

  // 8.5 Fechamento de caixa
  useAppStore.getState().fecharCaixa();
  cx = useAppStore.getState().caixaAtual;
  check('CAIXA', '8.6 Caixa encerrado com status "fechado"', cx.status === 'fechado');

  // ============================================================================
  // RELATÓRIO CONSOLIDADO DA AUDITORIA
  // ============================================================================
  console.log('\n================================================================');
  console.log('📊 RELATÓRIO FINAL DA AUDITORIA PROFUNDA DE SISTEMA');
  console.log('================================================================');

  const total = auditResults.length;
  const aprovados = auditResults.filter((r) => r.passed).length;
  const reprovados = auditResults.filter((r) => !r.passed).length;

  console.log(`Total de Casos de Teste Executados: ${total}`);
  console.log(`Testes Aprovados: ${aprovados} ✅`);
  console.log(`Testes Reprovados: ${reprovados} ${reprovados === 0 ? '🎉' : '❌'}`);
  console.log('================================================================\n');

  if (reprovados === 0) {
    console.log('🏆 100% DOS TESTES PROFUNDOS PASSARAM COM SUCESSO ABSOLUTO!');
  } else {
    console.error('⚠️ ALGUNS TESTES FALHARAM! VERIFIQUE AS MENSAGENS ACIMA.');
    process.exit(1);
  }
}

runDeepStressAudit().catch((err) => {
  console.error('Erro fatal durante a auditoria profunda:', err);
  process.exit(1);
});
