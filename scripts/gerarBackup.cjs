const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://jjyexujkbipbiqeyrdfj.supabase.co';
const key = 'sb_publishable_G6YkQuE1T_ao0xOu_VUfeQ_h0TaBLi5';
const supabase = createClient(url, key);

async function runBackup() {
  const dir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tables = ['tenants', 'usuarios', 'categorias', 'produtos', 'mesas', 'pedidos'];
  const dump = {};

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) {
      console.warn(`Aviso ao ler tabela ${t}:`, error.message);
      dump[t] = [];
    } else {
      dump[t] = data || [];
      console.log(`Tabela ${t}: ${dump[t].length} registro(s) obtido(s)`);
    }
  }

  // 1. JSON Dump
  const jsonPath = path.join(dir, 'backup_database_live_2026-11-05.json');
  fs.writeFileSync(jsonPath, JSON.stringify(dump, null, 2), 'utf8');
  console.log('✅ Arquivo JSON gravado:', jsonPath);

  // 2. SQL Dump
  let sql = '-- =========================================================================\n';
  sql += '-- ELOSERVE - BACKUP COMPLETO DO BANCO DE DADOS (SUPABASE POSTGRESQL)\n';
  sql += `-- Gerado em: ${new Date().toISOString()}\n`;
  sql += `-- Servidor / Projeto: ${url}\n`;
  sql += '-- =========================================================================\n\n';

  const schemaBase = fs.readFileSync('supabase_schema.sql', 'utf8');
  const splitMarker = '-- =========================================================================\n-- CARGA INICIAL DE DADOS PADRÃO';
  const ddl = schemaBase.includes(splitMarker) ? schemaBase.split(splitMarker)[0] : schemaBase;
  sql += ddl;

  sql += '\n-- =========================================================================\n';
  sql += '-- DADOS REAIS DO BANCO SUPABASE (SNAPSHOT ATUAL)\n';
  sql += '-- =========================================================================\n\n';

  const escape = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean' || typeof val === 'number') return String(val);
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  // Tenants
  if (dump.tenants && dump.tenants.length > 0) {
    sql += '-- 1. RESTAURANTES (TENANTS ATIVOS NO SUPABASE)\n';
    for (const t of dump.tenants) {
      sql += `INSERT INTO public.tenants (id, nome_fantasia, razao_social, documento, responsavel_nome, telefone_whatsapp, email, cidade_uf, plano_id, status_assinatura, valor_mensalidade, data_inicio, proximo_vencimento, dias_restantes_trial, instancia_whatsapp_conectada, dre_habilitado, couvert_artistico_ativo, valor_couvert_por_pessoa, na_lixeira, deletado_em)\n`;
      sql += `VALUES (${escape(t.id)}, ${escape(t.nome_fantasia)}, ${escape(t.razao_social)}, ${escape(t.documento)}, ${escape(t.responsavel_nome)}, ${escape(t.telefone_whatsapp)}, ${escape(t.email)}, ${escape(t.cidade_uf)}, ${escape(t.plano_id)}, ${escape(t.status_assinatura)}, ${Number(t.valor_mensalidade || 0)}, ${escape(t.data_inicio)}, ${escape(t.proximo_vencimento)}, ${Number(t.dias_restantes_trial ?? 7)}, ${!!t.instancia_whatsapp_conectada}, ${t.dre_habilitado ?? true}, ${!!t.couvert_artistico_ativo}, ${Number(t.valor_couvert_por_pessoa || 0)}, ${!!t.na_lixeira}, ${t.deletado_em ? escape(t.deletado_em) : 'NULL'})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET nome_fantasia = EXCLUDED.nome_fantasia, status_assinatura = EXCLUDED.status_assinatura, responsavel_nome = EXCLUDED.responsavel_nome;\n\n`;
    }
  }

  // Usuarios
  if (dump.usuarios && dump.usuarios.length > 0) {
    sql += '-- 2. USUÁRIOS & CREDENCIAIS DE ACESSO (LOGINS REAIS)\n';
    for (const u of dump.usuarios) {
      sql += `INSERT INTO public.usuarios (id, nome, email, cargo, tenant_id, avatar, pin, senha, ativo, na_lixeira, deletado_em)\n`;
      sql += `VALUES (${escape(u.id)}, ${escape(u.nome)}, ${escape(u.email)}, ${escape(u.cargo)}, ${escape(u.tenant_id)}, ${escape(u.avatar)}, ${escape(u.pin)}, ${escape(u.senha)}, ${u.ativo ?? true}, ${!!u.na_lixeira}, ${u.deletado_em ? escape(u.deletado_em) : 'NULL'})\n`;
      sql += `ON CONFLICT (email) DO UPDATE SET pin = EXCLUDED.pin, senha = EXCLUDED.senha, ativo = EXCLUDED.ativo;\n\n`;
    }
  }

  // Categorias
  if (dump.categorias && dump.categorias.length > 0) {
    sql += '-- 3. CATEGORIAS DE PRODUTOS\n';
    for (const c of dump.categorias) {
      sql += `INSERT INTO public.categorias (id, tenant_id, nome, icone, cor)\n`;
      sql += `VALUES (${escape(c.id)}, ${escape(c.tenant_id)}, ${escape(c.nome)}, ${escape(c.icone)}, ${escape(c.cor)})\n`;
      sql += `ON CONFLICT (id) DO NOTHING;\n\n`;
    }
  }

  // Produtos
  if (dump.produtos && dump.produtos.length > 0) {
    sql += '-- 4. PRODUTOS DO CARDÁPIO\n';
    for (const p of dump.produtos) {
      sql += `INSERT INTO public.produtos (id, tenant_id, categoria_id, nome, descricao, preco_venda, preco_custo, foto_url, codigo_barras, setor_preparo, disponivel, destaque, ficha_tecnica)\n`;
      sql += `VALUES (${escape(p.id)}, ${escape(p.tenant_id)}, ${escape(p.categoria_id)}, ${escape(p.nome)}, ${escape(p.descricao)}, ${Number(p.preco_venda || 0)}, ${Number(p.preco_custo || 0)}, ${escape(p.foto_url)}, ${escape(p.codigo_barras)}, ${escape(p.setor_preparo)}, ${p.disponivel ?? true}, ${p.destaque ?? false}, '${JSON.stringify(p.ficha_tecnica || [])}'::jsonb)\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET preco_venda = EXCLUDED.preco_venda, disponivel = EXCLUDED.disponivel;\n\n`;
    }
  }

  // Mesas
  if (dump.mesas && dump.mesas.length > 0) {
    sql += '-- 5. MESAS & SALÃO\n';
    for (const m of dump.mesas) {
      sql += `INSERT INTO public.mesas (id, tenant_id, numero, capacidade, setor, status, total_consumo, qr_code_url, quantidade_pessoas, responsavel_nome, pessoas, garcom_responsavel, comanda_itens, taxa_servico_ativa, historico_cancelamentos, couvert_artistico_ativo, valor_couvert_por_pessoa)\n`;
      sql += `VALUES (${escape(m.id)}, ${escape(m.tenant_id)}, ${m.numero}, ${m.capacidade || 4}, ${escape(m.setor)}, ${escape(m.status)}, ${Number(m.total_consumo || 0)}, ${escape(m.qr_code_url)}, ${m.quantidade_pessoas || 0}, ${escape(m.responsavel_nome)}, '${JSON.stringify(m.pessoas || [])}'::jsonb, ${escape(m.garcom_responsavel)}, '${JSON.stringify(m.comanda_itens || [])}'::jsonb, ${m.taxa_servico_ativa ?? true}, '${JSON.stringify(m.historico_cancelamentos || [])}'::jsonb, ${m.couvert_artistico_ativo ?? false}, ${Number(m.valor_couvert_por_pessoa || 0)})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, total_consumo = EXCLUDED.total_consumo;\n\n`;
    }
  }

  const sqlPath = path.join(dir, 'backup_database_live_2026-11-05.sql');
  fs.writeFileSync(sqlPath, sql, 'utf8');
  console.log('✅ Arquivo SQL gerado:', sqlPath);
}

runBackup().catch((e) => {
  console.error('Erro ao gerar backup:', e);
  process.exit(1);
});
