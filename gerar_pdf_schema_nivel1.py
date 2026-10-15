# -*- coding: utf-8 -*-
import os
import shutil
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Cabeçalho no topo (páginas 2 em diante)
        if self._pageNumber > 1:
            self.drawString(45, 802, "EloServe SaaS • Documentação de Arquitetura & Schema")
            self.drawRightString(550, 802, "Nível 1 (Acesso Global & Gestão de Restaurantes)")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.75)
            self.line(45, 794, 550, 794)

        # Rodapé em todas as páginas
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(550, 32, page_text)
        self.drawString(45, 32, "Confidencial • EloServe Tecnologia e Gestão SaaS LTDA © 2026")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(45, 44, 550, 44)
        self.restoreState()

def criar_caixa_codigo(codigo_texto, estilo_codigo, bg_color="#f8fafc", border_color="#cbd5e1"):
    linhas_html = codigo_texto.strip().replace('\n', '<br/>').replace(' ', '&nbsp;')
    p = Paragraph(linhas_html, estilo_codigo)
    tbl = Table([[p]], colWidths=[505])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg_color)),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor(border_color)),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return tbl

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Estilos de tipografia
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#4c1d95"),
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#6d28d9"),
        spaceAfter=8
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#1e1b4b"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    subsection_heading = ParagraphStyle(
        'SubSectionHeading',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#4338ca"),
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7,
        leading=9.2,
        textColor=colors.HexColor("#0f172a"),
    )

    code_style_dark = ParagraphStyle(
        'CodeStyleDark',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7,
        leading=9.2,
        textColor=colors.HexColor("#e2e8f0"),
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#ffffff")
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # =========================================================================
    # BANNER DE CABEÇALHO DO DOCUMENTO
    # =========================================================================
    header_data = [
        [
            Paragraph("<b>EloServe SaaS • Engenharia & Arquitetura de Software</b>", ParagraphStyle('TopTag', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#6d28d9"))),
            Paragraph("<b>VERSÃO 1.0 • OUTUBRO 2026</b>", ParagraphStyle('TopVer', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.HexColor("#64748b"), alignment=2))
        ],
        [
            Paragraph("Nível 1: Acesso Global & Gestão de Restaurantes", title_style),
            ""
        ],
        [
            Paragraph("Especificação técnica de Arquitetura Multi-Tenancy, Interfaces TypeScript e DDL Relacional (PostgreSQL / Supabase)", subtitle_style),
            ""
        ]
    ]

    header_table = Table(header_data, colWidths=[370, 135])
    header_table.setStyle(TableStyle([
        ('SPAN', (0, 1), (1, 1)),
        ('SPAN', (0, 2), (1, 2)),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)

    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7c3aed"), spaceAfter=8, spaceBefore=2))

    # =========================================================================
    # 1. HIERARQUIA DE ACESSO RBAC
    # =========================================================================
    story.append(Paragraph("1. Visão Geral & Matriz de Níveis de Acesso (RBAC)", section_heading))
    story.append(Paragraph(
        "O <b>EloServe</b> foi construído sobre uma arquitetura multi-inquilino de alto desempenho com <b>5 níveis de autorização</b>. "
        "O <b>Nível 1 (Super Admin / Franqueador)</b> opera com soberania global (<code>tenantId: 'global'</code>), tendo poder irrestrito sobre o faturamento recorrente (MRR), regras dos planos, limites de recursos, broadcast de notificações e cofre de segurança.",
        body_style
    ))

    rbac_data = [
        [
            Paragraph("Nível", table_header),
            Paragraph("Identificador / Papel", table_header),
            Paragraph("Escopo", table_header),
            Paragraph("Permissões e Responsabilidades", table_header),
        ],
        [
            Paragraph("<b>Nível 1</b>", table_cell_bold),
            Paragraph("<code>super_admin</code><br/>Dono do SaaS / Franqueador", table_cell),
            Paragraph("<b>Global (Todas as Lojas)</b><br/><code>tenantId: 'global'</code>", table_cell),
            Paragraph("Gestão de todos os restaurantes clientes, DRE SaaS consolidado, faturamento MRR/ARR, precificação de planos, broadcast de avisos e cofre master de segurança.", table_cell),
        ],
        [
            Paragraph("<b>Nível 2</b>", table_cell_bold),
            Paragraph("<code>admin_restaurante</code><br/>Gerente / Dono da Loja", table_cell),
            Paragraph("Restaurante Local<br/>(Apenas seu <code>tenant_id</code>)", table_cell),
            Paragraph("Gestão do estabelecimento: Cardápio, Fichas Técnicas, Estoque, Vendas, Cadastro de Equipe, Relatórios e Fechamento de Caixa local.", table_cell),
        ],
        [
            Paragraph("<b>Nível 3</b>", table_cell_bold),
            Paragraph("<code>caixa</code><br/>Operador de Caixa", table_cell),
            Paragraph("Frente de Caixa (PDV)<br/>Restaurante Local", table_cell),
            Paragraph("Abertura/fechamento de caixa, contagem física de troco, sangrias, suprimentos, liquidação F9 balcão e estorno com devolução de insumos ao estoque.", table_cell),
        ],
        [
            Paragraph("<b>Nível 4</b>", table_cell_bold),
            Paragraph("<code>garcom</code><br/>Atendente / Garçom", table_cell),
            Paragraph("Salão & Mesas<br/>Restaurante Local", table_cell),
            Paragraph("Comanda mobile nas mesas, lançamento ágil de pedidos, divisão de conta por clientes, alertas de atendimento e liberação de mesas.", table_cell),
        ],
        [
            Paragraph("<b>Nível 5</b>", table_cell_bold),
            Paragraph("<code>cozinha</code><br/>Equipe de Cozinha / Bar", table_cell),
            Paragraph("Painel KDS Cozinha<br/>Restaurante Local", table_cell),
            Paragraph("Visualização em tempo real das comandas (A Fazer / Em Preparo / Pronto), alertas sonoros e cronômetro de preparo por setor.", table_cell),
        ],
    ]

    rbac_table = Table(rbac_data, colWidths=[38, 110, 112, 245])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4c1d95")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(rbac_table)

    story.append(Spacer(1, 6))

    # =========================================================================
    # 2. TABELAS MESTRAS DO NÍVEL 1
    # =========================================================================
    story.append(Paragraph("2. Estrutura Conceitual & Tabelas Mestras do Nível 1", section_heading))

    entidades_info = [
        [
            Paragraph("Tabela", table_header),
            Paragraph("Chave Primária", table_header),
            Paragraph("Finalidade no Nível 1", table_header),
            Paragraph("Regra de Integridade", table_header)
        ],
        [
            Paragraph("<b>saas_planos</b>", table_cell_bold),
            Paragraph("<code>id (starter, pro, enterprise)</code>", table_cell),
            Paragraph("Define pacotes comerciais, mensalidades, anuidades e limites máximos de hardware (caixas, mesas, KDS, IA).", table_cell),
            Paragraph("Planos não podem ser removidos se houver restaurantes assinantes vinculados.", table_cell)
        ],
        [
            Paragraph("<b>tenants</b>", table_cell_bold),
            Paragraph("<code>id (ex: tenant-01)</code>", table_cell),
            Paragraph("Registro de cada estabelecimento assinante com dados fiscais (CNPJ), vencimento e status de assinatura.", table_cell),
            Paragraph("Chave estrangeira obrigatória para <code>saas_planos.id</code>. O Franqueador possui ID especial <code>'global'</code>.", table_cell)
        ],
        [
            Paragraph("<b>usuarios</b>", table_cell_bold),
            Paragraph("<code>id (UUID)</code>", table_cell),
            Paragraph("Credenciais de acesso e papéis de autorização. O Super Admin possui <code>cargo = 'super_admin'</code>.", table_cell),
            Paragraph("Isolamento estrito: usuários com cargos N2-N5 só acessam dados onde <code>tenant_id = usuario.tenant_id</code>.", table_cell)
        ],
        [
            Paragraph("<b>saas_avisos_globais</b>", table_cell_bold),
            Paragraph("<code>id (UUID)</code>", table_cell),
            Paragraph("Broadcast de notificações e comunicados do Franqueador para todas as lojas ou para um restaurante específico.", table_cell),
            Paragraph("Destino <code>'todos'</code> ou chave estrangeira para <code>tenants.id</code>.", table_cell)
        ],
        [
            Paragraph("<b>saas_logs_auditoria</b>", table_cell_bold),
            Paragraph("<code>id (UUID)</code>", table_cell),
            Paragraph("Trilha de auditoria imutável registrando ações críticas: suspensão de lojas, desbloqueio de cofre, etc.", table_cell),
            Paragraph("Registros somente-leitura (append-only), sem permissão de alteração ou deleção.", table_cell)
        ],
    ]

    ent_table = Table(entidades_info, colWidths=[90, 95, 175, 145])
    ent_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#3b0764")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(ent_table)

    story.append(PageBreak())

    # =========================================================================
    # 3. SCHEMA TYPESCRIPT MODULAR
    # =========================================================================
    story.append(Paragraph("3. Schema em TypeScript (Definições de Tipos & Interfaces)", section_heading))
    story.append(Paragraph(
        "Abaixo constam as interfaces TypeScript que estruturam o modelo de dados do Nível 1 no EloServe (<code>src/types/index.ts</code> e <code>src/store/useSaaSStore.ts</code>):",
        body_style
    ))

    # Box 1: Cargos e Usuário
    story.append(Paragraph("3.1. Papéis de Acesso e Usuários (RBAC)", subsection_heading))
    ts_code_1 = """export type CargoUsuario =
  | 'super_admin'        // Nível 1: Dono do SaaS (Acesso Global)
  | 'admin_restaurante'  // Nível 2: Gerente / Dono da Loja local
  | 'caixa'              // Nível 3: Frente de Caixa & PDV Balcão
  | 'garcom'             // Nível 4: Salão, Mesas & Comanda Mobile
  | 'cozinha'            // Nível 5: Painel KDS Cozinha & Bar
  | 'entregador';        // Logística e Despacho Delivery

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  tenantId: string;       // 'global' para o Nível 1 ou ID específico da loja
  pin: string;            // PIN numérico de acesso rápido
  ativo: boolean;
  avatar?: string;
}"""
    story.append(criar_caixa_codigo(ts_code_1, code_style))

    # Box 2: Planos SaaS
    story.append(Paragraph("3.2. Planos SaaS e Limites Operacionais de Hardware", subsection_heading))
    ts_code_2 = """export type TipoPlanoSaaS = 'starter' | 'pro' | 'enterprise';

export interface LimitesPlano {
  maxMesas: number;                  // Ex: 10 no Starter, 999 no Pro/Enterprise
  maxCaixasSimultaneos: number;      // Ex: 1 no Starter, 5 no Pro, 99 no Enterprise
  kdsIncluso: boolean;               // Habilita tela de produção da cozinha sem papel
  whatsappIAIncluso: boolean;        // Integração EloBot IA oficial 24h
  relatoriosAvancados: boolean;      // DRE gerencial, margens e curvas de lucratividade
  suportePrioritario: boolean;       // Canal VIP de atendimento direto com o Franqueador
  cardapioQrCodeIncluso?: boolean;   // Cardápio digital interativo nas mesas
  garcomMobileIncluso?: boolean;     // App web para garçons realizarem pedidos no salão
  impressaoTermicaInclusa?: boolean; // Spooler ESC/POS térmico USB/Rede
  controleEstoqueIncluso?: boolean;  // Baixa automática proporcional por Ficha Técnica
  maxUsuarios?: number;              // Quantidade máxima de funcionários cadastrados
  maxItensCardapio?: number;         // Cota de pratos e produtos ativos
  maxPedidosMes?: number;            // Volume mensal de transações
  diasTrialPadrao?: number;          // Dias padrão de degustação gratuita (ex: 7 ou 14)
  diasToleranciaAtraso?: number;     // Carência antes do bloqueio automático por inadimplência
  taxaAdesao?: number;               // Custo de implantação/onboarding
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
}"""
    story.append(criar_caixa_codigo(ts_code_2, code_style))

    # Box 3: Tenant Restaurante
    story.append(Paragraph("3.3. Restaurante Assinante (Tenant)", subsection_heading))
    ts_code_3 = """export type StatusAssinatura = 'ativo' | 'trial' | 'atrasado' | 'bloqueado' | 'cancelado';

export interface TenantRestaurante {
  id: string;                        // ID único do tenant (ex: 'tenant-01')
  nomeFantasia: string;
  razaoSocial?: string;
  documento: string;                 // CNPJ ou CPF do responsável legal
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
}"""
    story.append(criar_caixa_codigo(ts_code_3, code_style))

    story.append(Spacer(1, 10))

    # Box 4: Infra, Broadcast e Auditoria
    story.append(Paragraph("3.4. Infraestrutura, Broadcast e Auditoria do Nível 1", subsection_heading))
    ts_code_4 = """export interface CustosInfraSaaS {
  cloudVps: number;                  // Servidores de banco e aplicação (ex: VPS Hetzner)
  evolutionWhatsapp: number;         // Custos de gateways de mensageria WhatsApp
  taxaGatewayPct: number;            // Taxa percentual intermediadora de pagamentos
  impostoSimplesPct: number;         // Alíquota fiscal aplicada sobre faturamento
  suporteMarketing: number;          // Investimento mensal em suporte e aquisição
}

export interface AvisoGlobalSaaS {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'alerta' | 'urgente' | 'novidade';
  destinoTenantId: string;           // 'todos' ou ID específico da loja
  ativo: boolean;
  criadoEm: string;
}

export interface LogAuditoriaSaaS {
  id: string;
  dataHora: string;
  usuarioNome: string;
  acao: string;
  categoria: 'restaurante' | 'plano' | 'financeiro' | 'sistema' | 'cobranca' | 'seguranca';
  detalhes: string;
}"""
    story.append(criar_caixa_codigo(ts_code_4, code_style))

    story.append(Spacer(1, 8))

    # =========================================================================
    # 4. SCRIPT DDL SQL RELACIONAL
    # =========================================================================
    story.append(Paragraph("4. Schema Relacional SQL (PostgreSQL / Supabase)", section_heading))
    story.append(Paragraph(
        "Script DDL completo para persistência no PostgreSQL/Supabase com Row Level Security (RLS):",
        body_style
    ))

    sql_code_1 = """-- 1. TABELA DE PLANOS SAAS
CREATE TABLE saas_planos (
    id VARCHAR(30) PRIMARY KEY,                  -- 'starter', 'pro', 'enterprise'
    nome VARCHAR(100) NOT NULL,
    preco_mensal NUMERIC(10,2) NOT NULL,
    preco_anual NUMERIC(10,2),
    descricao TEXT,
    limites JSONB NOT NULL DEFAULT '{}'::jsonb,  -- maxMesas, maxCaixas, kds, ia, etc.
    regras_texto JSONB DEFAULT '[]'::jsonb,
    destaque BOOLEAN DEFAULT false,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE RESTAURANTES (TENANTS)
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,                  -- 'tenant-01', 'global'
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(150),
    documento VARCHAR(20) NOT NULL,              -- CNPJ ou CPF
    responsavel_nome VARCHAR(100) NOT NULL,
    telefone_whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    cidade_uf VARCHAR(80) NOT NULL,
    plano_id VARCHAR(30) NOT NULL REFERENCES saas_planos(id),
    status_assinatura VARCHAR(20) NOT NULL DEFAULT 'trial',
    valor_mensalidade NUMERIC(10,2) NOT NULL,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    proximo_vencimento DATE,
    instancia_whatsapp_conectada BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);"""
    story.append(criar_caixa_codigo(sql_code_1, code_style_dark, bg_color="#0f172a", border_color="#334155"))

    story.append(PageBreak())

    sql_code_2 = """-- 3. TABELA DE USUÁRIOS E CONTROLE RBAC
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    cargo VARCHAR(30) NOT NULL,                  -- super_admin, admin_restaurante, caixa, garcom, cozinha
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pin_acesso VARCHAR(10) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    avatar_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COMUNICADOS GLOBAIS E AUDITORIA SAAS
CREATE TABLE saas_avisos_globais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'info',    -- info, alerta, urgente, novidade
    destino_tenant_id VARCHAR(50) NOT NULL DEFAULT 'todos',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saas_logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_nome VARCHAR(100) NOT NULL,
    acao VARCHAR(150) NOT NULL,
    categoria VARCHAR(30) NOT NULL,              -- restaurante, plano, financeiro, seguranca
    detalhes TEXT NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS):
-- Super Admin (Nível 1) enxerga tudo; Níveis 2 a 5 enxergam apenas seu tenant.
-- =========================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY super_admin_all ON tenants
    FOR ALL
    USING (
        (SELECT cargo FROM usuarios WHERE id = auth.uid()) = 'super_admin'
        OR id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
    );

CREATE POLICY tenant_isolation_usuarios ON usuarios
    FOR ALL
    USING (
        (SELECT cargo FROM usuarios WHERE id = auth.uid()) = 'super_admin'
        OR tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
    );"""
    story.append(criar_caixa_codigo(sql_code_2, code_style_dark, bg_color="#0f172a", border_color="#334155"))

    story.append(Spacer(1, 8))

    # =========================================================================
    # 5. REGRAS DE NEGÓCIO E SEGURANÇA
    # =========================================================================
    story.append(Paragraph("5. Regras de Negócio & Segurança do Nível 1", section_heading))

    regras = [
        ("Cofre de Segurança Master:", "O acesso ao painel executivo do Nível 1 exige PIN exclusivo (padrão: <b>889900</b>). Para mitigar ataques de força bruta, 3 tentativas consecutivas incorretas disparam um bloqueio temporal de 30 segundos (cooldown)."),
        ("Gestão de MRR e Métricas Recorrentes:", "O faturamento recorrente mensal (MRR) é calculado somando as mensalidades de todos os restaurantes com <code>statusAssinatura = 'ativo'</code>. O faturamento anual estimado (ARR) corresponde a 12 vezes o MRR."),
        ("Política de Inadimplência & Carência:", "Cada plano possui dias de tolerância (ex: 3 dias no Starter, 5 no Pro, 7 no Enterprise). Após o vencimento, o status passa para <code>'atrasado'</code> com aviso amigável no WhatsApp. Esgotada a tolerância, o sistema suspende automaticamente o acesso com <code>statusAssinatura = 'bloqueado'</code>."),
        ("Broadcast de Notificações em Tempo Real:", "Avisos criados pelo Franqueador com destino <code>'todos'</code> são injetados nas telas de todos os caixas e gerentes do país através de banners flutuantes de alta visibilidade."),
        ("Auditoria Transacional Imutável:", "Qualquer alteração de preço de plano, suspensão manual de restaurante ou alteração de código master gera um registro indelével em <code>saas_logs_auditoria</code>.")
    ]

    for titulo, desc in regras:
        story.append(Paragraph(f"• <b>{titulo}</b> {desc}", body_style))

    # Constrói o PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF gerado com sucesso em: {filename}")

if __name__ == '__main__':
    target_project = r"C:\Users\italo.silva\.gemini\antigravity\scratch\EloServe\EloServe_SaaS_Nivel_1_Schema.pdf"
    target_brain = r"C:\Users\italo.silva\.gemini\antigravity\brain\63c30ba4-3bf8-4403-af38-ad79d7d7cb3e\EloServe_SaaS_Nivel_1_Schema.pdf"
    
    os.makedirs(os.path.dirname(target_project), exist_ok=True)
    os.makedirs(os.path.dirname(target_brain), exist_ok=True)
    
    build_pdf(target_project)
    shutil.copyfile(target_project, target_brain)
    print(f"Cópia sincronizada para: {target_brain}")
