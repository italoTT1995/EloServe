/**
 * Comprehensive System Audit & Integration Test Suite - Full Pass
 * EloServe PDV & SaaS Engine
 */

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSaaSStore } from '../store/useSaaSStore';
import { useProductStore } from '../store/useProductStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useReservaStore } from '../store/useReservaStore';
import { useEloBotStore } from '../store/useEloBotStore';
import { useEstoqueStore } from '../store/useEstoqueStore';

interface TestResult {
  module: string;
  testName: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(module: string, testName: string, condition: boolean, details?: string) {
  if (condition) {
    results.push({ module, testName, passed: true, details });
    console.log(`  ✅ [${module}] ${testName}${details ? ` -> ${details}` : ''}`);
  } else {
    results.push({ module, testName, passed: false, details, error: 'Assertion failed' });
    console.error(`  ❌ [${module}] FAILED: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 EXECUTANDO AUDITORIA COMPLETA DE TODOS OS MÓDULOS');
  console.log('====================================================\n');

  // -----------------------------------------------------------------
  // 1. MÓDULO AUTH & ROLES
  // -----------------------------------------------------------------
  console.log('🔹 1. Testando Módulo de Autenticação e Permissões...');
  try {
    const auth = useAuthStore.getState();
    assert('AUTH', 'Store de Autenticação inicializada', !!auth);
    
    // Login Admin / Gerente Restaurante
    const resLoginAdmin = auth.login('gerente@eloserve.com.br', '1234');
    const userAdmin = useAuthStore.getState().usuarioLogado;
    assert('AUTH', 'Login Gerente Restaurante', resLoginAdmin.sucesso && userAdmin?.cargo === 'admin_restaurante', `Logado: ${userAdmin?.nome}`);
    assert('AUTH', 'Permissão Admin para Mesas e PDV', auth.temPermissao(['admin_restaurante', 'caixa']));

    // Permissão restrita para garçom
    const resLoginGarcom = auth.login('garcom@eloserve.com.br', '3344');
    const userGarcom = useAuthStore.getState().usuarioLogado;
    assert('AUTH', 'Login Garçom', resLoginGarcom.sucesso && userGarcom?.cargo === 'garcom');
    assert('AUTH', 'Garçom sem permissão de dono', !useAuthStore.getState().temPermissao(['admin_restaurante']));

    // PIN Admin
    const app = useAppStore.getState();
    assert('AUTH', 'Validação PIN Admin correto (1234)', app.validarPinAdmin('1234'));
    assert('AUTH', 'Rejeição PIN Admin incorreto (9999)', !app.validarPinAdmin('9999'));
  } catch (err: any) {
    assert('AUTH', 'Falha crítica em Auth', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 2. MÓDULO SAAS & PLANOS
  // -----------------------------------------------------------------
  console.log('\n🔹 2. Testando Módulo SaaS Multi-Tenancy & Limites de Planos...');
  try {
    const saas = useSaaSStore.getState();
    const tenants = saas.tenants;
    assert('SAAS', 'Tenants cadastrados', tenants.length >= 2, `${tenants.length} estabelecimentos encontrados`);

    const t1 = saas.getTenantPorId('tenant-01');
    assert('SAAS', 'Tenant 01 recuperado via getTenantPorId', !!t1, `Nome: ${t1?.nomeFantasia} | Plano: ${t1?.planoId}`);

    const tAtivo = saas.getTenantAtivo();
    assert('SAAS', 'Tenant Ativo recuperado', !!tAtivo);

    // Validação de Planos
    const planos = saas.planos;
    const planoStarter = planos.find(p => p.id === 'starter');
    assert('SAAS', 'Plano Starter não inclui reserva de mesas', planoStarter?.limites.reservaMesasIncluso === false);
    
    const planoPro = planos.find(p => p.id === 'pro');
    assert('SAAS', 'Plano Pro inclui reserva de mesas', planoPro?.limites.reservaMesasIncluso === true);
    
    const planoEnterprise = planos.find(p => p.id === 'enterprise');
    assert('SAAS', 'Plano Enterprise inclui reserva de mesas', planoEnterprise?.limites.reservaMesasIncluso === true);
  } catch (err: any) {
    assert('SAAS', 'Falha crítica em SaaS', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 3. MÓDULO CARDÁPIO & PRODUTOS
  // -----------------------------------------------------------------
  console.log('\n🔹 3. Testando Módulo de Produtos & Cardápio...');
  try {
    const prodStore = useProductStore.getState();
    const produtosT1 = prodStore.getProdutosPorTenant('tenant-01');
    assert('PRODUTOS', 'Produtos do Tenant 01 carregados', produtosT1.length > 0, `${produtosT1.length} produtos`);

    // Adicionar produto de teste com precoVenda correto
    const novoProduto = prodStore.adicionarProduto({
      nome: 'Test Burger Especial',
      descricao: 'Hambúrguer artesanal para teste automatizado',
      categoriaId: 'cat-01',
      precoVenda: 42.5,
      disponivel: true,
      setorPreparo: 'cozinha',
    }, 'tenant-01');
    assert('PRODUTOS', 'Adição de novo produto', !!novoProduto && novoProduto.precoVenda === 42.5);

    // Atualizar preço
    prodStore.atualizarPreco(novoProduto.id, 48.0, 'tenant-01');
    const pAtualizado = useProductStore.getState().getProdutosPorTenant('tenant-01').find(p => p.id === novoProduto.id);
    assert('PRODUTOS', 'Atualização de preço', pAtualizado?.precoVenda === 48.0, `Novo Preço: R$ ${pAtualizado?.precoVenda}`);

    // Alternar disponibilidade
    prodStore.alternarDisponibilidade(novoProduto.id, 'tenant-01');
    const pInativo = useProductStore.getState().getProdutosPorTenant('tenant-01').find(p => p.id === novoProduto.id);
    assert('PRODUTOS', 'Alternar disponibilidade (desativar)', pInativo?.disponivel === false);

    // Limpar produto de teste
    prodStore.removerProduto(novoProduto.id, 'tenant-01');
  } catch (err: any) {
    assert('PRODUTOS', 'Falha crítica em Produtos', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 4. MÓDULO MESAS, COMANDAS, COUVERT & TAXA 10%
  // -----------------------------------------------------------------
  console.log('\n🔹 4. Testando Mesas, Comandas, Couvert Artístico e Taxa de Serviço 10%...');
  try {
    const app = useAppStore.getState();
    const tenantId = 'tenant-01';
    const mesas = app.getMesasPorTenant(tenantId);
    assert('MESAS', 'Mesas do Tenant 01 recuperadas', mesas.length > 0, `${mesas.length} mesas`);

    const numeroMesaTeste = 99;
    // Adicionar mesa de teste
    app.adicionarMesa({ numero: numeroMesaTeste, capacidade: 4, setor: 'Salão Principal' }, tenantId);
    let mesa99 = useAppStore.getState().getMesasPorTenant(tenantId).find(m => m.numero === numeroMesaTeste);
    assert('MESAS', 'Criação de mesa de teste', !!mesa99 && mesa99.status === 'livre');

    // Lançar itens na comanda da mesa (1 comida + 1 bebida para testar KDS também)
    const resLancamento = app.lancarItensComandaMesa(
      numeroMesaTeste,
      [
        {
          produtoId: 'prod-burger',
          nome: 'Picanha Burger Especial',
          precoUnitario: 50.0,
          quantidade: 2,
          subtotal: 100.0,
          observacoes: 'Ao Ponto | Sem Cebola',
          clienteNome: 'João Silva',
        },
        {
          produtoId: 'prod-chopp',
          nome: 'Chopp Artesanal IPA 500ml',
          precoUnitario: 18.0,
          quantidade: 2,
          subtotal: 36.0,
          observacoes: 'Bem Gelado',
          clienteNome: 'Maria Souza',
        },
      ],
      'Garçom Lucas',
      tenantId
    );
    assert('MESAS', 'Lançamento de itens na comanda da mesa', resLancamento.sucesso, `Total: R$ ${resLancamento.totalAdicionado}`);

    mesa99 = useAppStore.getState().getMesasPorTenant(tenantId).find(m => m.numero === numeroMesaTeste);
    assert('MESAS', 'Mesa ocupada após lançamento', mesa99?.status === 'ocupada');
    assert('MESAS', 'Total de consumo atualizado', (mesa99?.totalConsumo || 0) === 136.0);
    assert('MESAS', 'Itens na comanda', mesa99?.comandaItens?.length === 2);

    // Testar Couvert Artístico (Cobrança por comanda aberta)
    useSaaSStore.getState().atualizarDadosTenant(tenantId, {
      couvertArtisticoAtivo: true,
      valorCouvertPorComanda: 15.0,
      valorCouvertPorPessoa: 15.0,
    });
    const tenantAtualizado = useSaaSStore.getState().getTenantPorId(tenantId);
    assert('COUVERT', 'Configuração de Couvert Artístico ativada no Tenant', tenantAtualizado?.couvertArtisticoAtivo === true && tenantAtualizado?.valorCouvertPorComanda === 15.0);

    // Testar isenção de couvert para uma comanda
    const resIsencao = app.toggleCouvertMesa(numeroMesaTeste, 'Maria Souza', tenantId);
    assert('COUVERT', 'Toggle de isenção de Couvert na comanda', resIsencao.sucesso);

    // Testar Taxa de Serviço 10%
    const resTaxa = app.toggleTaxaServicoMesa(numeroMesaTeste, 'João Silva', tenantId);
    assert('TAXA_10', 'Toggle de taxa de serviço 10%', resTaxa.sucesso);

    // Reverter taxa para ativa
    app.toggleTaxaServicoMesa(numeroMesaTeste, 'João Silva', tenantId);

    // Cancelar item com autorização de gerente
    const itemIdCancelar = mesa99?.comandaItens?.[0]?.id;
    if (itemIdCancelar) {
      const resCancel = app.cancelarItemComandaMesa(numeroMesaTeste, itemIdCancelar, 'Cliente desistiu do chopp', 'Gerente Carlos', tenantId);
      assert('MESAS', 'Cancelamento de item por gerente', resCancel.sucesso);
    }

    // Limpar mesa de teste
    app.removerMesa(numeroMesaTeste, tenantId);
  } catch (err: any) {
    assert('MESAS', 'Falha crítica em Mesas e Comandas', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 5. MÓDULO KDS (COZINHA & BAR COM FLUXO DE 2 CLIQUES)
  // -----------------------------------------------------------------
  console.log('\n🔹 5. Testando Módulo KDS (Cozinha vs Bar e Fluxo de 2 Cliques)...');
  try {
    const app = useAppStore.getState();
    const pedidoTesteId = `kds-test-${Date.now()}`;
    
    // Adicionar pedido KDS com itens de cozinha e bar
    app.adicionarPedidoKDS({
      id: pedidoTesteId,
      numero: 88,
      tipo: 'mesa',
      nomeCliente: 'Mesa #88',
      status: 'novo',
      estacaoDestino: 'cozinha',
      minutosEspera: 0,
      criadoEm: '12:00',
      itens: [
        {
          id: 'item-1',
          nome: 'Costela BBQ Especial',
          quantidade: 1,
          observacoes: 'Molho à parte',
          setorPreparo: 'cozinha',
          concluido: false,
        },
        {
          id: 'item-2',
          nome: 'Caipirinha de Limão',
          quantidade: 2,
          observacoes: 'Pouco açúcar',
          setorPreparo: 'bar',
          concluido: false,
        },
      ],
    });

    let pedido = useAppStore.getState().pedidosKDS.find(p => p.id === pedidoTesteId);
    assert('KDS', 'Pedido criado no KDS com status "novo"', pedido?.status === 'novo');
    assert('KDS', 'Item de cozinha classificado', pedido?.itens[0].setorPreparo === 'cozinha');
    assert('KDS', 'Item de bar classificado', pedido?.itens[1].setorPreparo === 'bar');

    // 1º Passo de 2 cliques: Iniciar Produção
    app.iniciarProducaoKDS(pedidoTesteId);
    pedido = useAppStore.getState().pedidosKDS.find(p => p.id === pedidoTesteId);
    assert('KDS', '2 Cliques: Iniciar Produção -> status "em_preparo"', pedido?.status === 'em_preparo');

    // Checklist individual: Ticar item 1
    app.toggleItemConcluidoKDS(pedidoTesteId, 0);
    pedido = useAppStore.getState().pedidosKDS.find(p => p.id === pedidoTesteId);
    assert('KDS', 'Checklist: Marcar item 1 como concluído', pedido?.itens[0].concluido === true);

    // 2º Passo de 2 cliques: Marcar Feito (Pronto no balcão)
    app.marcarFeitoKDS(pedidoTesteId);
    pedido = useAppStore.getState().pedidosKDS.find(p => p.id === pedidoTesteId);
    assert('KDS', '2 Cliques: Marcar Feito -> status "pronto"', pedido?.status === 'pronto');

    // 3º Passo de 2 cliques: Garçom Entregou
    app.marcarEntregueKDS(pedidoTesteId, 'Garçom Paulo');
    const pedidoNoAtivo = useAppStore.getState().pedidosKDS.find(p => p.id === pedidoTesteId);
    const pedidoNoHistorico = useAppStore.getState().historicoKDS.find(p => p.id === pedidoTesteId);
    assert('KDS', '2 Cliques: Garçom Entregou arquiva pedido ativo', !pedidoNoAtivo);
    assert('KDS', 'Pedido entregue guardado no histórico do KDS', !!pedidoNoHistorico && pedidoNoHistorico.status === 'entregue');

    // Testar recuperação / desfazer último pedido
    const recuperado = app.recuperarUltimoPedidoKDS();
    assert('KDS', 'Recuperar / Desfazer último pedido arquivado', recuperado?.id === pedidoTesteId);
    
    // Limpar pedido de teste
    app.arquivarPedidoKDS(pedidoTesteId);
  } catch (err: any) {
    assert('KDS', 'Falha crítica em KDS', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 6. MÓDULO DELIVERY
  // -----------------------------------------------------------------
  console.log('\n🔹 6. Testando Módulo de Delivery & Pedidos...');
  try {
    const delivery = useDeliveryStore.getState();
    assert('DELIVERY', 'Store Delivery inicializada', !!delivery);

    // Criar pedido delivery com formulário completo
    const novoDelivery = delivery.adicionarPedidoDelivery({
      clienteNome: 'Roberto Alencar',
      clienteTelefone: '(31) 98888-7777',
      tipo: 'delivery',
      endereco: {
        rua: 'Av. Afonso Pena',
        numero: '1500',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        complemento: 'Apto 402',
        pontoReferencia: 'Próximo ao Parque',
        distanciaKm: 3.2,
      },
      itens: [
        {
          nome: 'Pizza Calabresa Artesanal',
          quantidade: 1,
          preco: 65.0,
        },
      ],
      subtotal: 65.0,
      taxaEntrega: 8.0,
      total: 73.0,
      formaPagamento: 'pix',
      status: 'preparando',
      pago: true,
    });

    assert('DELIVERY', 'Criação de pedido delivery completo', !!novoDelivery && novoDelivery.total === 73.0);
    assert('DELIVERY', 'Endereço e complemento persistidos', novoDelivery?.endereco?.complemento === 'Apto 402');

    // Ciclo completo de status de Delivery: preparando -> pronto -> retirado -> a_caminho -> entregue
    delivery.avancarStatusDelivery(novoDelivery.id); // -> pronto
    let delivAtual = useDeliveryStore.getState().pedidos.find(p => p.id === novoDelivery.id);
    assert('DELIVERY', 'Avanço de status para "pronto"', delivAtual?.status === 'pronto');

    delivery.avancarStatusDelivery(novoDelivery.id); // -> retirado
    delivAtual = useDeliveryStore.getState().pedidos.find(p => p.id === novoDelivery.id);
    assert('DELIVERY', 'Avanço de status para "retirado"', delivAtual?.status === 'retirado');

    delivery.avancarStatusDelivery(novoDelivery.id); // -> a_caminho
    delivAtual = useDeliveryStore.getState().pedidos.find(p => p.id === novoDelivery.id);
    assert('DELIVERY', 'Avanço de status para "a_caminho"', delivAtual?.status === 'a_caminho');

    delivery.avancarStatusDelivery(novoDelivery.id); // -> entregue
    delivAtual = useDeliveryStore.getState().pedidos.find(p => p.id === novoDelivery.id);
    assert('DELIVERY', 'Avanço de status para "entregue"', delivAtual?.status === 'entregue');
  } catch (err: any) {
    assert('DELIVERY', 'Falha crítica em Delivery', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 7. MÓDULO RESERVAS DE MESAS (PRO / ENTERPRISE)
  // -----------------------------------------------------------------
  console.log('\n🔹 7. Testando Módulo de Reservas de Mesas...');
  try {
    const resStore = useReservaStore.getState();
    assert('RESERVAS', 'Store de Reservas inicializada', !!resStore);

    const dataHoje = new Date().toISOString().split('T')[0];
    const novaReserva = resStore.adicionarReserva({
      tenantId: 'tenant-01',
      clienteNome: 'Mariana Duarte',
      clienteTelefone: '(31) 97777-1122',
      data: dataHoje,
      horario: '20:00',
      quantidadePessoas: 5,
      mesaNumero: 2,
      status: 'pendente',
      especiais: {
        aniversario: true,
        presencaBolo: true,
        decoracao: false,
        observacoes: 'Comemoração de 30 anos',
      },
      observacoes: 'Trazer pratos e garfos para bolo',
      origem: 'elobot',
    });

    assert('RESERVAS', 'Reserva cadastrada com sucesso', !!novaReserva && novaReserva.clienteNome === 'Mariana Duarte');
    assert('RESERVAS', 'Campos especiais (bolo, aniversário) salvos', novaReserva?.especiais?.presencaBolo === true && novaReserva?.especiais?.aniversario === true);

    // Confirmar reserva
    resStore.atualizarStatusReserva(novaReserva.id, 'confirmada', 'tenant-01');
    let resAtual = useReservaStore.getState().getReservas('tenant-01').find(r => r.id === novaReserva.id);
    assert('RESERVAS', 'Atualização de status para "confirmada"', resAtual?.status === 'confirmada');

    // Sentar clientes na mesa
    const sentarResult = resStore.sentarReservaNaMesa(novaReserva.id, 2, 'tenant-01');
    assert('RESERVAS', 'Acomodar clientes na mesa (#2)', sentarResult.sucesso);

    // Mesa #2 deve estar ocupada
    const mesa2 = useAppStore.getState().getMesasPorTenant('tenant-01').find(m => m.numero === 2);
    assert('RESERVAS', 'Mesa ocupada automaticamente com dados da reserva', mesa2?.status === 'ocupada' && mesa2?.responsavelNome === 'Mariana Duarte');
  } catch (err: any) {
    assert('RESERVAS', 'Falha crítica em Reservas', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 8. MÓDULO ELOBOT (WHATSAPP IA & ATENDIMENTO AUTOMÁTICO)
  // -----------------------------------------------------------------
  console.log('\n🔹 8. Testando Módulo EloBot & WhatsApp IA...');
  try {
    const eloBot = useEloBotStore.getState();
    assert('ELOBOT', 'Store EloBot inicializada', !!eloBot);

    const config = eloBot.getConfig('tenant-01');
    assert('ELOBOT', 'Configuração de WhatsApp do Tenant 01 recuperada', !!config, `Agente: ${config.nomeAgente}`);

    // Criar nova conversa e enviar mensagem
    const prods = useProductStore.getState().getProdutosPorTenant('tenant-01');
    const convId = eloBot.criarNovaConversa('tenant-01', 'Roberto Teste', '5531988880000', 'Olá, gostaria de fazer um pedido');
    assert('ELOBOT', 'Criação de conversa WhatsApp', !!convId);

    eloBot.enviarMensagemCliente('tenant-01', convId, 'Quais são as opções de carne?', prods, 'Fogo de Minas');
    const conversa = eloBot.getConversas('tenant-01').find(c => c.id === convId);
    assert('ELOBOT', 'Mensagem do cliente processada no chat', !!conversa && conversa.mensagens.length >= 2);
  } catch (err: any) {
    assert('ELOBOT', 'Falha crítica em EloBot', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 9. MÓDULO ESTOQUE & FICHA TÉCNICA
  // -----------------------------------------------------------------
  console.log('\n🔹 9. Testando Módulo de Estoque & Ficha Técnica...');
  try {
    const estStore = useEstoqueStore.getState();
    assert('ESTOQUE', 'Store de Estoque inicializada', !!estStore);
    assert('ESTOQUE', 'Itens de estoque carregados', estStore.itens.length > 0, `${estStore.itens.length} insumos`);

    // Insumo de teste
    const insumoCarne = estStore.itens.find(i => i.nome.toLowerCase().includes('carne') || i.nome.toLowerCase().includes('picanha'));
    if (insumoCarne) {
      estStore.registrarMovimentacao({
        itemId: insumoCarne.id,
        itemNome: insumoCarne.nome,
        tipo: 'entrada_compra',
        quantidade: 5,
        unidadeMedida: insumoCarne.unidadeMedida,
        motivo: 'Compra semanal fornecedor',
        responsavel: 'Operador Estoque',
      });
      const ultimaMov = useEstoqueStore.getState().movimentacoes[0];
      assert('ESTOQUE', 'Movimentação de entrada de estoque registrada', ultimaMov?.itemId === insumoCarne.id && ultimaMov?.quantidade === 5);
    }
  } catch (err: any) {
    assert('ESTOQUE', 'Falha crítica em Estoque', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 10. MÓDULO CAIXA & FLUXO DE TURNO
  // -----------------------------------------------------------------
  console.log('\n🔹 10. Testando Módulo de Caixa & Turno...');
  try {
    const app = useAppStore.getState();
    assert('CAIXA', 'Caixa inicializado', !!app.caixaAtual);

    // Abrir caixa
    app.abrirCaixa(200.0);
    let caixa = useAppStore.getState().caixaAtual;
    assert('CAIXA', 'Abertura de caixa com troco inicial R$ 200,00', caixa.status === 'aberto' && caixa.saldoInicial === 200.0);

    // Testar Sangria
    const sangriaRes = app.registrarSangria(50.0, 'Pagamento fornecedor de gelo', 'Operador Caixa');
    caixa = useAppStore.getState().caixaAtual;
    assert('CAIXA', 'Sangria registrada com sucesso no saldo', sangriaRes.sucesso && caixa.totalSangrias === 50.0);

    // Testar Suprimento (Reforço)
    const suprimentoRes = app.registrarSuprimento(100.0, 'Entrada de moedas para troco', 'Operador Caixa');
    caixa = useAppStore.getState().caixaAtual;
    assert('CAIXA', 'Suprimento registrado com sucesso no saldo', suprimentoRes.sucesso && caixa.totalSuprimentos === 300.0);

    // Registrar venda
    app.registrarVenda({
      id: `venda-teste-${Date.now()}`,
      tenantId: 'tenant-01',
      tipoOrigem: 'balcao',
      dataHora: '20/10/2026 12:30',
      total: 85.0,
      subtotalBruto: 85.0,
      taxaServico: 0,
      couvertArtistico: 0,
      desconto: 0,
      formaPagamento: 'dinheiro',
      itens: [{ produtoId: 'p1', nome: 'Almoço Executivo', quantidade: 1, precoUnitario: 85.0, subtotal: 85.0 }],
      operador: 'Operador Caixa',
      status: 'concluida',
    });

    caixa = useAppStore.getState().caixaAtual;
    assert('CAIXA', 'Total de vendas do caixa incrementado', caixa.totalVendas >= 85.0);

    // Fechar caixa
    app.fecharCaixa();
    caixa = useAppStore.getState().caixaAtual;
    assert('CAIXA', 'Fechamento de caixa', caixa.status === 'fechado');
  } catch (err: any) {
    assert('CAIXA', 'Falha crítica em Caixa', false, err?.message);
  }

  // -----------------------------------------------------------------
  // 11. MÓDULO RELATÓRIOS & DRE
  // -----------------------------------------------------------------
  console.log('\n🔹 11. Testando Módulo de Relatórios & DRE...');
  try {
    const app = useAppStore.getState();
    const vendasT1 = app.getVendasPorTenant('tenant-01');
    assert('RELATÓRIOS', 'Vendas do Tenant 01 para relatórios', vendasT1.length > 0, `${vendasT1.length} vendas registradas`);

    // Adicionar despesa operacional para cálculo do DRE
    app.adicionarDespesaRestaurante({
      tenantId: 'tenant-01',
      descricao: 'Conta de Energia Elétrica CEMIG',
      categoria: 'servicos',
      tipo: 'fixa',
      valor: 850.0,
      data: '2026-10-20',
    });

    const despesasT1 = useAppStore.getState().getDespesasPorTenant('tenant-01');
    assert('RELATÓRIOS', 'Despesa registrada no DRE', despesasT1.some(d => d.descricao.includes('CEMIG')));
  } catch (err: any) {
    assert('RELATÓRIOS', 'Falha crítica em Relatórios', false, err?.message);
  }

  // -----------------------------------------------------------------
  // RESUMO FINAL
  // -----------------------------------------------------------------
  console.log('\n====================================================');
  console.log('📊 RESUMO DA AUDITORIA DO SISTEMA');
  console.log('====================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total de testes: ${total}`);
  console.log(`Passaram: ${passed} ✅`);
  console.log(`Falharam: ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log('====================================================\n');

  if (failed > 0) {
    console.error('Detalhes das falhas:');
    results.filter(r => !r.passed).forEach(f => {
      console.error(`- [${f.module}] ${f.testName}: ${f.details || f.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Erro de execução geral:', e);
  process.exit(1);
});
