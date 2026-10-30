-- =========================================================================
-- ELOSERVE - SCHEMA COMPLETO SUPABASE (POSTGRESQL)
-- Executar no SQL Editor do Supabase (supabase.com)
-- =========================================================================

-- 1. TABELA DE RESTAURANTES (TENANTS MULTI-LOJAS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    nome_fantasia TEXT NOT NULL,
    razao_social TEXT,
    documento TEXT,
    responsavel_nome TEXT,
    telefone_whatsapp TEXT,
    email TEXT,
    cidade_uf TEXT DEFAULT 'São Paulo / SP',
    plano_id TEXT DEFAULT 'pro',
    status_assinatura TEXT DEFAULT 'ativo',
    valor_mensalidade NUMERIC(10,2) DEFAULT 199.00,
    data_inicio TEXT,
    proximo_vencimento TEXT,
    dias_restantes_trial INT DEFAULT 7,
    instancia_whatsapp_conectada BOOLEAN DEFAULT FALSE,
    dre_habilitado BOOLEAN DEFAULT TRUE,
    couvert_artistico_ativo BOOLEAN DEFAULT FALSE,
    valor_couvert_por_pessoa NUMERIC(10,2) DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE USUÁRIOS & CREDENCIAIS DE ACESSO
CREATE TABLE IF NOT EXISTS public.usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cargo TEXT NOT NULL,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    avatar TEXT,
    pin TEXT NOT NULL DEFAULT '1234',
    senha TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acesso TIMESTAMPTZ
);

-- 3. TABELA DE CATEGORIAS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS public.categorias (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    icone TEXT,
    cor TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PRODUTOS & PRATOS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    categoria_id TEXT REFERENCES public.categorias(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_venda NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    preco_custo NUMERIC(10,2) DEFAULT 0.00,
    foto_url TEXT,
    codigo_barras TEXT,
    setor_preparo TEXT DEFAULT 'cozinha',
    disponivel BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    ficha_tecnica JSONB DEFAULT '[]'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE MESAS & COMANDAS
CREATE TABLE IF NOT EXISTS public.mesas (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    capacidade INT DEFAULT 4,
    setor TEXT DEFAULT 'Salão Principal',
    status TEXT DEFAULT 'livre',
    tempo_ocupada_min INT DEFAULT 0,
    total_consumo NUMERIC(10,2) DEFAULT 0.00,
    qr_code_url TEXT,
    quantidade_pessoas INT DEFAULT 0,
    responsavel_nome TEXT,
    pessoas JSONB DEFAULT '[]'::jsonb,
    garcom_responsavel TEXT,
    comanda_itens JSONB DEFAULT '[]'::jsonb,
    taxa_servico_ativa BOOLEAN DEFAULT TRUE,
    historico_cancelamentos JSONB DEFAULT '[]'::jsonb,
    couvert_artistico_ativo BOOLEAN DEFAULT FALSE,
    valor_couvert_por_pessoa NUMERIC(10,2) DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE PEDIDOS (PDV, MESA E DELIVERY)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    tipo TEXT NOT NULL, -- 'mesa', 'balcao', 'delivery'
    mesa_numero INT,
    cliente_nome TEXT,
    cliente_telefone TEXT,
    status TEXT DEFAULT 'pendente',
    status_kds TEXT DEFAULT 'novo',
    itens JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    forma_pagamento TEXT,
    endereco_entrega TEXT,
    entregador_id TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE CONTROLE DE CAIXA E SANGRIAS
CREATE TABLE IF NOT EXISTS public.movimentacoes_caixa (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'venda', 'sangria', 'suprimento'
    forma_pagamento TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    motivo TEXT,
    operador TEXT,
    horario TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE ITENS DE ESTOQUE
CREATE TABLE IF NOT EXISTS public.estoque_itens (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    categoria TEXT DEFAULT 'alimentos',
    unidade_medida TEXT DEFAULT 'UN',
    quantidade_atual NUMERIC(10,2) DEFAULT 0.00,
    quantidade_minima NUMERIC(10,2) DEFAULT 0.00,
    custo_unitario NUMERIC(10,2) DEFAULT 0.00,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) COM PERMISSÕES PARA CLIENTE API
-- =========================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso irrestrito para anon/authenticated (chave pública do app)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Acesso total tenants" ON public.tenants;
    CREATE POLICY "Acesso total tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total usuarios" ON public.usuarios;
    CREATE POLICY "Acesso total usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total categorias" ON public.categorias;
    CREATE POLICY "Acesso total categorias" ON public.categorias FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
    CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total mesas" ON public.mesas;
    CREATE POLICY "Acesso total mesas" ON public.mesas FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total pedidos" ON public.pedidos;
    CREATE POLICY "Acesso total pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total caixa" ON public.movimentacoes_caixa;
    CREATE POLICY "Acesso total caixa" ON public.movimentacoes_caixa FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total estoque" ON public.estoque_itens;
    CREATE POLICY "Acesso total estoque" ON public.estoque_itens FOR ALL USING (true) WITH CHECK (true);
END $$;

-- =========================================================================
-- CARGA INICIAL DE DADOS PADRÃO (TENANTS & LOGINS INICIAIS)
-- =========================================================================

-- Inserir Tenant Global (SaaS Master) e Restaurante 01
INSERT INTO public.tenants (id, nome_fantasia, razao_social, documento, responsavel_nome, telefone_whatsapp, email, cidade_uf, plano_id, status_assinatura, valor_mensalidade, data_inicio, proximo_vencimento)
VALUES 
('global', 'EloServe Global (SaaS Master)', 'EloServe Tecnologia Ltda', '00.000.000/0001-00', 'Ítalo Silva', '(31) 98888-0000', 'master@eloserve.com.br', 'Belo Horizonte / MG', 'enterprise', 'ativo', 0, '2026-01-01', '2030-01-01'),
('tenant-01', 'Restaurante & Bar Sabor Brasil', 'Sabor Brasil Gastronomia ME', '12.345.678/0001-90', 'Carlos Gerente', '(31) 99999-1111', 'contato@saborbrasil.com.br', 'Belo Horizonte / MG', 'pro', 'ativo', 199.00, '2026-01-15', '2026-11-15')
ON CONFLICT (id) DO UPDATE SET nome_fantasia = EXCLUDED.nome_fantasia;

-- Inserir Logins Iniciais (Admin Master, Gerente, Caixa, Garçom, Cozinha, Entregador)
INSERT INTO public.usuarios (id, nome, email, cargo, tenant_id, pin, senha, ativo)
VALUES
('usr-master', 'Ítalo Silva (Admin Master & Fundador)', 'master@eloserve.com.br', 'super_admin', 'global', '8899', 'EloMaster@2026', true),
('usr-gerente', 'Carlos Gerente (Dono / Gestão)', 'gerente@eloserve.com.br', 'admin_restaurante', 'tenant-01', '1234', 'Gerente@2026', true),
('usr-caixa', 'Mariana Caixa (Frente de Caixa)', 'caixa@eloserve.com.br', 'caixa', 'tenant-01', '2233', 'Caixa@2026', true),
('usr-garcom', 'Lucas Garçom (Salão & Mesas)', 'garcom@eloserve.com.br', 'garcom', 'tenant-01', '3344', 'Garcom@2026', true),
('usr-cozinha', 'Chef Roberto (Cozinha & KDS)', 'cozinha@eloserve.com.br', 'cozinha', 'tenant-01', '5566', 'Cozinha@2026', true),
('usr-entregador', 'Diego Entregador (Delivery)', 'entregador@eloserve.com.br', 'entregador', 'tenant-01', '7788', 'Entrega@2026', true)
ON CONFLICT (email) DO UPDATE SET pin = EXCLUDED.pin, senha = EXCLUDED.senha;

-- Categorias Iniciais
INSERT INTO public.categorias (id, tenant_id, nome, icone, cor)
VALUES
('cat-1', 'tenant-01', 'Pratos Principais', 'Utensils', '#FF6B00'),
('cat-2', 'tenant-01', 'Bebidas & Drinks', 'Wine', '#00A3FF'),
('cat-3', 'tenant-01', 'Sobremesas', 'Cake', '#E040FB')
ON CONFLICT (id) DO NOTHING;

-- Produtos Iniciais
INSERT INTO public.produtos (id, tenant_id, categoria_id, nome, descricao, preco_venda, preco_custo, setor_preparo, disponivel, destaque)
VALUES
('prod-1', 'tenant-01', 'cat-1', 'Picanha na Brasa Especial', 'Acompanha arroz biro-biro, farofa de ovos e vinagrete da casa.', 89.90, 38.00, 'cozinha', true, true),
('prod-2', 'tenant-01', 'cat-1', 'Hambúrguer Artesanal EloBurger', 'Pão brioche, blend 180g, queijo cheddar inglês e maionese defumada.', 38.50, 14.20, 'cozinha', true, true),
('prod-3', 'tenant-01', 'cat-2', 'Chopp Artesanal 500ml', 'Pilsen gelado, puro malte artesanal.', 14.00, 4.50, 'bar', true, false),
('prod-4', 'tenant-01', 'cat-3', 'Petit Gâteau com Sorvete', 'Bolo quente de chocolate belga com sorvete de baunilha.', 26.00, 8.00, 'cozinha', true, false)
ON CONFLICT (id) DO NOTHING;

-- Mesas Iniciais
INSERT INTO public.mesas (id, tenant_id, numero, capacidade, setor, status, total_consumo)
VALUES
('mesa-1', 'tenant-01', 1, 4, 'Salão Principal', 'livre', 0),
('mesa-2', 'tenant-01', 2, 4, 'Salão Principal', 'livre', 0),
('mesa-3', 'tenant-01', 3, 2, 'Varanda', 'livre', 0),
('mesa-4', 'tenant-01', 4, 6, 'Varanda', 'livre', 0),
('mesa-5', 'tenant-01', 5, 8, 'Área VIP', 'livre', 0)
ON CONFLICT (id) DO NOTHING;
