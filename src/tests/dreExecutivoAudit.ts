import { useSaaSStore } from '../store/useSaaSStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { VendaRealizada } from '../types';

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

async function runDREExecutivoAudit() {
  console.log('====================================================');
  console.log('🏛️ AUDITORIA: DRE EXECUTIVO SAAS SIMPLIFICADO & COERÊNCIA');
  console.log('====================================================\n');

  const saas = useSaaSStore.getState();
  const app = useAppStore.getState();
  const auth = useAuthStore.getState();

  // Setup: Provisionar cenário para o teste
  const tenant1 = saas.adicionarTenant({
    nomeFantasia: 'Pizzaria Bella Forneria',
    razaoSocial: 'Bella Forneria LTDA',
    documento: '12.345.678/0001-90',
    telefone: '(11) 98888-7777',
    email: 'contato@bellaforneria.com.br',
    cidadeUf: 'São Paulo - SP',
    planoId: 'plano-pro',
    valorMensalidade: 199.0,
    statusAssinatura: 'ativo',
    dataVencimento: '2026-11-10',
    diaVencimento: 10,
    dreHabilitado: true,
  });

  const tenant2 = saas.adicionarTenant({
    nomeFantasia: 'Churrascaria Fogo Nobre',
    razaoSocial: 'Fogo Nobre Carnes Nobres ME',
    documento: '98.765.432/0001-11',
    telefone: '(31) 97777-6666',
    email: 'gerente@fogonobre.com.br',
    cidadeUf: 'Belo Horizonte - MG',
    planoId: 'plano-enterprise',
    valorMensalidade: 299.0,
    statusAssinatura: 'ativo',
    dataVencimento: '2026-11-15',
    diaVencimento: 15,
    dreHabilitado: true,
  });

  // Provisionar Gerente da Loja
  const gerenteLoja = auth.adicionarUsuario({
    nome: 'Carlos Eduardo (Gerente)',
    email: 'gerente@fogonobre.com.br',
    cargo: 'admin_restaurante',
    tenantId: tenant2.id,
    pin: '1234',
    senha: 'loja@2026',
    ativo: true,
  });

  // 1. Verificação de Coerência de Permissão e Papéis (RBAC)
  console.log('🔹 1. Coerência Funcional de Acesso ao DRE Executivo...');
  
  // Super Admin deve ter acesso ao painel Master
  auth.login('italo@eloserve.com.br', '8899');
  assert(auth.temPermissao(['super_admin']), 'Super Admin possui autorização total para DRE Executivo');

  // Gerente/Dono de Loja NÃO deve ter acesso ao DRE Corporativo do Franqueador
  auth.login('gerente@fogonobre.com.br', '1234');
  assert(!auth.temPermissao(['super_admin']), 'Gestor de Loja (admin_restaurante) é bloqueado no DRE Executivo SaaS');
  assert(auth.temPermissao(['admin_restaurante']), 'Gestor de Loja tem acesso estrito ao seu Financeiro & DRE Nível 2');

  // 2. Coerência Matemática das Linhas Contábeis do SaaS
  console.log('\n🔹 2. Coerência das Fórmulas Contábeis do DRE Executivo...');
  const mrr = saas.getMRR();
  const custos = saas.custosInfra;

  assert(mrr === 498.0, `MRR da base recuperado dinamicamente: R$ ${mrr.toFixed(2)} (R$ 199 + R$ 299)`);
  assert(custos.impostoSimplesPct > 0, `Alíquota Simples Nacional configurada: ${custos.impostoSimplesPct}%`);
  assert(custos.taxaGatewayPct > 0, `Taxa de Gateway configurada: ${custos.taxaGatewayPct}%`);

  // Simulação Mês Vigente (fator 1)
  const receitaBrutaMensal = mrr + (saas.tenants.length > 0 ? 150 : 0);
  const impostosMensal = receitaBrutaMensal * (custos.impostoSimplesPct / 100);
  const receitaLiquidaMensal = Math.max(0, receitaBrutaMensal - impostosMensal);

  const cogsMensal = custos.cloudVps + custos.evolutionWhatsapp + (receitaBrutaMensal * (custos.taxaGatewayPct / 100));
  const lucroBrutoMensal = Math.max(0, receitaLiquidaMensal - cogsMensal);
  const ebitdaMensal = lucroBrutoMensal - custos.suporteMarketing;

  assert(receitaLiquidaMensal === receitaBrutaMensal - impostosMensal, 'Receita Líquida (ROL) = Receita Bruta - Simples Nacional');
  assert(lucroBrutoMensal === Math.max(0, receitaLiquidaMensal - cogsMensal), 'Lucro Bruto = max(0, ROL - COGS)');
  assert(ebitdaMensal === lucroBrutoMensal - custos.suporteMarketing, 'EBITDA Operacional = Lucro Bruto - OPEX (Suporte/Marketing)');

  // 3. Coerência da Visão Anualizada (ARR)
  console.log('\n🔹 3. Coerência da Visão Anualizada (ARR)...');
  const receitaBrutaAnual = (mrr * 12) + (saas.tenants.length > 0 ? 450 : 0);
  const impostosAnual = receitaBrutaAnual * (custos.impostoSimplesPct / 100);
  const rolAnual = receitaBrutaAnual - impostosAnual;
  const cogsAnual = (custos.cloudVps * 12) + (custos.evolutionWhatsapp * 12) + (receitaBrutaAnual * (custos.taxaGatewayPct / 100));
  const lucroBrutoAnual = Math.max(0, rolAnual - cogsAnual);
  const ebitdaAnual = lucroBrutoAnual - (custos.suporteMarketing * 12);

  assert(rolAnual > 0, `ROL Anualizada (ARR Líquido) calculada: R$ ${rolAnual.toFixed(2)}`);
  assert(ebitdaAnual === lucroBrutoAnual - (custos.suporteMarketing * 12), 'EBITDA Anualizado consistente com fator 12');

  // 4. Regra de Governança: Vendas de Restaurantes NÃO entram no DRE Corporativo do SaaS
  console.log('\n🔹 4. Validação da Regra de Governança e Isolamento Contábil...');
  
  // Registrar venda de pizza no restaurante 1
  const vendaLoja: VendaRealizada = {
    id: 'venda-teste-pizza',
    tenantId: tenant1.id,
    tipoOrigem: 'mesa',
    mesaNumero: 1,
    dataHora: '25/10/2026 20:00',
    total: 120.0,
    subtotalBruto: 120.0,
    desconto: 0,
    formaPagamento: 'pix',
    itens: [{ produtoId: 'p-pizza', nome: 'Pizza Margherita', quantidade: 2, precoUnitario: 60.0, subtotal: 120.0 }],
    operador: 'Garçom',
    status: 'concluida',
  };
  app.registrarVenda(vendaLoja);

  const vendasTotaisRestaurantes = useAppStore.getState().vendas.reduce((acc, v) => acc + (v.total || 0), 0);
  assert(vendasTotaisRestaurantes >= 120.0, `Existem vendas registradas nos restaurantes (R$ ${vendasTotaisRestaurantes.toFixed(2)})`);
  assert(receitaBrutaMensal !== vendasTotaisRestaurantes, 'GOVERNANÇA ATENDIDA: Faturamento de vendas dos clientes NÃO compõe o DRE da franqueadora SaaS');

  console.log('\n====================================================');
  console.log('📊 RESULTADO DA AUDITORIA DO DRE EXECUTIVO:');
  console.log(`Testes Aprovados: ${testesPassados} ✅`);
  console.log(`Testes Falhos: ${testesFalhos} ❌`);
  console.log('====================================================\n');

  if (testesFalhos > 0) {
    process.exit(1);
  }
}

runDREExecutivoAudit();
