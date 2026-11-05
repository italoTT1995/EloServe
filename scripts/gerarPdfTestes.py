import os
import base64
import subprocess
import time

base_dir = r"C:\Users\italo.silva\.gemini\antigravity\scratch\EloServe"
logo_path = os.path.join(base_dir, "public", "images", "elogastro-logo-transparent.png")
cloche_path = os.path.join(base_dir, "public", "images", "elogastro-cloche.png")
html_path = os.path.join(base_dir, "docs", "Roteiro_de_Testes_EloServe.html")
pdf_path = os.path.join(base_dir, "docs", "Roteiro_de_Testes_EloServe.pdf")

logo_base64 = ""
if os.path.exists(logo_path):
    with open(logo_path, "rb") as f:
        logo_base64 = base64.b64encode(f.read()).decode("utf-8")

cloche_base64 = ""
if os.path.exists(cloche_path):
    with open(cloche_path, "rb") as f:
        cloche_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>EloServe - Roteiro Oficial de Homologação e Testes</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @page {{
            size: A4;
            margin: 12mm 12mm 14mm 12mm;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}

        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1E293B;
            background-color: #FFFFFF;
            line-height: 1.45;
            font-size: 11.5px;
        }}

        /* HEADER */
        .header {{
            background: linear-gradient(135deg, #0B1120 0%, #161F37 100%);
            color: #FFFFFF;
            border-radius: 12px;
            padding: 18px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            border-left: 6px solid #E6B34A;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }}

        .header-logo-container {{
            display: flex;
            align-items: center;
            gap: 16px;
        }}

        .logo-img {{
            height: 52px;
            width: auto;
            object-fit: contain;
        }}

        .header-title-box h1 {{
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.3px;
            color: #FFFFFF;
            margin-bottom: 2px;
        }}

        .header-title-box h1 span {{
            color: #E6B34A;
        }}

        .header-title-box p {{
            font-size: 11px;
            color: #94A3B8;
            font-weight: 500;
        }}

        .badge-status {{
            background: rgba(230, 179, 74, 0.15);
            border: 1px solid #E6B34A;
            color: #F8D377;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 10.5px;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
        }}

        .badge-status div:first-child {{
            color: #10B981;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        /* ACCESS BANNER */
        .access-banner {{
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 12px 18px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .access-link {{
            font-size: 12.5px;
            font-weight: 700;
            color: #0F172A;
        }}

        .access-link span {{
            color: #2563EB;
            text-decoration: underline;
        }}

        .access-tags {{
            display: flex;
            gap: 8px;
        }}

        .tag {{
            background: #E0E7FF;
            color: #3730A3;
            font-size: 9.5px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            text-transform: uppercase;
        }}

        .tag-digital {{
            background: #D1FAE5;
            color: #065F46;
        }}

        /* TESTERS GRID */
        .testers-container {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 18px;
        }}

        .tester-card {{
            border: 1px solid #CBD5E1;
            border-radius: 10px;
            padding: 14px 16px;
            background: #FFFFFF;
            position: relative;
        }}

        .tester-card.wendel {{
            border-top: 4px solid #3B82F6;
        }}

        .tester-card.clara {{
            border-top: 4px solid #10B981;
        }}

        .tester-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }}

        .tester-name {{
            font-size: 14px;
            font-weight: 800;
            color: #0F172A;
        }}

        .tester-role-badge {{
            font-size: 9px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
            text-transform: uppercase;
        }}

        .tester-card.wendel .tester-role-badge {{
            background: #EFF6FF;
            color: #1D4ED8;
        }}

        .tester-card.clara .tester-role-badge {{
            background: #ECFDF5;
            color: #047857;
        }}

        .tester-meta {{
            font-size: 10.5px;
            color: #475569;
            margin-bottom: 6px;
        }}

        .tester-meta strong {{
            color: #0F172A;
        }}

        .tester-focus {{
            background: #F8FAFC;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 10px;
            color: #334155;
            line-height: 1.35;
            border-left: 3px solid #94A3B8;
        }}

        /* SECTIONS & MODULES */
        .section-title {{
            font-size: 13.5px;
            font-weight: 800;
            color: #0F172A;
            margin-top: 14px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 4px;
        }}

        .section-icon {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background: #0B1120;
            color: #E6B34A;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
        }}

        .module-card {{
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin-bottom: 10px;
            padding: 10px 14px;
            page-break-inside: avoid;
        }}

        .module-head {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }}

        .module-title {{
            font-size: 12px;
            font-weight: 700;
            color: #1E293B;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .module-assignee {{
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
        }}

        .assignee-wendel {{
            background: #DBEAFE;
            color: #1E40AF;
        }}

        .assignee-clara {{
            background: #D1FAE5;
            color: #065F46;
        }}

        .assignee-both {{
            background: #FEF3C7;
            color: #92400E;
        }}

        /* CHECKLIST ITEMS */
        .checklist {{
            list-style: none;
            margin-top: 4px;
        }}

        .check-item {{
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 3.5px 0;
            font-size: 11px;
            color: #334155;
            line-height: 1.35;
        }}

        .checkbox-square {{
            width: 14px;
            height: 14px;
            border: 1.5px solid #94A3B8;
            border-radius: 3px;
            margin-top: 1px;
            flex-shrink: 0;
            display: inline-block;
            background: #F8FAFC;
        }}

        .item-text strong {{
            color: #0F172A;
        }}

        .item-text em {{
            color: #64748B;
            font-size: 10px;
            font-style: normal;
        }}

        /* PAGE BREAK UTILITY */
        .page-break {{
            page-break-before: always;
        }}

        /* CRITERIOS DE ACEITE BANNER */
        .highlight-box {{
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border: 1px solid #86EFAC;
            border-radius: 8px;
            padding: 10px 14px;
            margin: 12px 0;
            page-break-inside: avoid;
        }}

        .highlight-box h4 {{
            font-size: 11.5px;
            font-weight: 800;
            color: #166534;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .highlight-box p {{
            font-size: 10.5px;
            color: #14532D;
            line-height: 1.4;
        }}

        /* FEEDBACK TABLE */
        .feedback-section {{
            margin-top: 14px;
            page-break-inside: avoid;
        }}

        .feedback-box {{
            border: 1px dashed #94A3B8;
            border-radius: 8px;
            background: #F8FAFC;
            padding: 12px;
            margin-top: 6px;
            min-height: 90px;
        }}

        .feedback-lines {{
            border-bottom: 1px solid #CBD5E1;
            height: 22px;
        }}

        /* FOOTER */
        .footer {{
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9.5px;
            color: #64748B;
        }}

        .footer-sig {{
            font-weight: 700;
            color: #0F172A;
        }}
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <div class="header-logo-container">
            {"<img src='data:image/png;base64," + logo_base64 + "' class='logo-img' alt='EloServe Logo' />" if logo_base64 else "<div style='font-size:24px; font-weight:800; color:#E6B34A;'>EloServe</div>"}
            <div class="header-title-box">
                <h1>Elo<span>Serve</span> • Roteiro de Homologação</h1>
                <p>Ecossistema 100% Digital para Gastronomia • Testes Integrados</p>
            </div>
        </div>
        <div class="badge-status">
            <div>● Homologação Ativa</div>
            Fase de Validação Beta
        </div>
    </div>

    <!-- ACCESS BANNER -->
    <div class="access-banner">
        <div class="access-link">
            Ambiente Oficial de Testes: <span>https://eloserve.pages.dev</span>
        </div>
        <div class="access-tags">
            <span class="tag tag-digital">100% Sem Impressora</span>
            <span class="tag">Multi-Dispositivo</span>
            <span class="tag">PWA & Nuvem</span>
        </div>
    </div>

    <!-- TESTERS CARDS -->
    <div class="testers-container">
        <!-- WENDEL -->
        <div class="tester-card wendel">
            <div class="tester-header">
                <span class="tester-name">Wendel</span>
                <span class="tester-role-badge">Frente de Salão & Atendimento</span>
            </div>
            <div class="tester-meta">
                <strong>E-mail:</strong> wendelteixera@gmail.com &nbsp;|&nbsp; <strong>PIN / Senha:</strong> <code>1234</code>
            </div>
            <div class="tester-focus">
                <strong>Foco do Teste:</strong> Abertura e gestão de mesas, lançar pedidos no smartphone, adicionar pessoas e observações, taxa de serviço, couvert artístico, venda rápida no PDV balcão e pedidos de Delivery.
            </div>
        </div>

        <!-- CLARA -->
        <div class="tester-card clara">
            <div class="tester-header">
                <span class="tester-name">Clara</span>
                <span class="tester-role-badge">Cozinha Digital, Gestão & Lixeira</span>
            </div>
            <div class="tester-meta">
                <strong>E-mail:</strong> claraprudencio@gmail.com &nbsp;|&nbsp; <strong>PIN / Senha:</strong> <code>1234</code>
            </div>
            <div class="tester-focus">
                <strong>Foco do Teste:</strong> Operação do KDS (Cozinha e Bar sem papel), alteração de status de preparo, conferência de estoque mínimo, DRE Financeiro, gestão de equipe com a Lixeira de Logins e Lixeira de Restaurantes.
            </div>
        </div>
    </div>

    <!-- BLOCO 1: OPERAÇÃO DE ATENDIMENTO E SALÃO -->
    <div class="section-title">
        <span class="section-icon">01</span>
        Operação de Frente de Loja, Salão e Pedidos
    </div>

    <!-- MODULO 1 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">1. Autenticação & Seleção de Restaurante</div>
            <span class="module-assignee assignee-both">Wendel & Clara</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Acesso à Plataforma:</strong> Abrir <code>https://eloserve.pages.dev</code> no celular ou computador e conferir a tela de login.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Login Rápido:</strong> Entrar com e-mail e senha/PIN <code>1234</code>. Validar transição suave e redirecionamento de tela.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Seleção de Restaurante:</strong> No topo da tela (Header), certificar-se de selecionar <em>"Resenha da Naty"</em> ou <em>"EloServe Global"</em>.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 2 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">2. Gestão de Mesas, Comandas e Divisão por Pessoa</div>
            <span class="module-assignee assignee-wendel">Wendel (Salão)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Abertura de Mesa:</strong> Clicar na <strong>Mesa 02</strong> (livre), informar nome do cliente e número de pessoas.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Lançamento com Observações:</strong> Adicionar itens ao pedido e digitar observação (ex: <em>"Hambúrguer sem cebola"</em> ou <em>"Suco com gelo"</em>).</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Comanda por Pessoa:</strong> Lançar 1 item atribuído à <em>Pessoa 1</em> e outro à <em>Pessoa 2</em> para conferir o rateio individual.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Couvert Artístico & 10%:</strong> Alternar a taxa de serviço de 10% e o couvert para verificar o recálculo em tempo real.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Transferência de Mesa:</strong> Testar o comando de transferir a Mesa 02 para a Mesa 05 com todo o saldo.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 3 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">3. Fechamento de Conta & Recibo Digital WhatsApp</div>
            <span class="module-assignee assignee-wendel">Wendel (Salão)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Divisão de Pagamento:</strong> Simular fechamento dividindo valor (ex: metade em Pix e metade em Cartão).</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Recibo Digital WhatsApp:</strong> Clicar em <em>"Enviar Comanda via WhatsApp"</em> e validar o texto automático pronto.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Liberação da Mesa:</strong> Confirmar o pagamento e checar se a mesa volta automaticamente ao status de <em>Livre</em>.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 4 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">4. PDV Balcão & Pedidos de Delivery</div>
            <span class="module-assignee assignee-wendel">Wendel (Balcão)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Venda Rápida de Balcão (PDV):</strong> Acessar <code>/pdv</code>, adicionar produtos ao carrinho e finalizar venda no Dinheiro.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Módulo de Delivery:</strong> Acessar <code>/delivery</code>, cadastrar novo pedido com endereço e atribuir a um entregador.</div>
            </li>
        </ul>
    </div>

    <!-- QUEBRA DE PÁGINA PARA PÁGINA 2 -->
    <div class="page-break"></div>

    <!-- BLOCO 2: PRODUÇÃO, KDS, GESTÃO E LIXEIRA -->
    <div class="section-title">
        <span class="section-icon">02</span>
        Cozinha Digital (KDS), Retaguarda & Lixeira Inteligente
    </div>

    <!-- DESTAQUE DIGITAL SEM PAPEL -->
    <div class="highlight-box">
        <h4>⚡ Experiência 100% Digital sem Impressora</h4>
        <p>O EloServe elimina bobinas térmicas e filas de impressão. O teste conjunto entre <strong>Wendel</strong> e <strong>Clara</strong> comprova o envio instantâneo do salão para os monitores da cozinha e do bar.</p>
    </div>

    <!-- MODULO 5 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">5. KDS - Monitor de Cozinha & Bar (Sem Papel)</div>
            <span class="module-assignee assignee-clara">Clara (Cozinha)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Recepção em Tempo Real:</strong> Abrir a tela <code>/kds</code> e observar a chegada automática do pedido lançado pelo Wendel.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Separação por Setores:</strong> Alternar os filtros de visualização entre <em>Cozinha</em> e <em>Bar/Copa</em>.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Fluxo de Produção:</strong> Mover o pedido de <strong>"Novo / Pendente"</strong> ➔ <strong>"Em Preparo"</strong> ➔ <strong>"Pronto para Servir"</strong>.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Controle de Cronômetro:</strong> Verificar a contagem de tempo decorrido para evitar atrasos no salão.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 6 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">6. Gestão de Logins & Lixeira Inteligente de Usuários</div>
            <span class="module-assignee assignee-clara">Clara (Gestão)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Novo Colaborador:</strong> Em <code>/funcionarios</code>, cadastrar um usuário temporário (ex: <em>"Garçom Teste"</em> com PIN 4 dígitos).</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Mover para a Lixeira:</strong> Clicar no ícone de lixeira do colaborador recém-criado.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Restauração Segura:</strong> Acessar a aba <strong>Lixeira</strong> e clicar em <em>Restaurar</em>. Verificar retorno à lista de ativos.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Exclusão Definitiva:</strong> Enviar novamente para a lixeira e executar a exclusão definitiva do banco de dados.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 7 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">7. Estoque, Caixa e DRE Financeiro</div>
            <span class="module-assignee assignee-clara">Clara (Financeiro)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Controle de Caixa:</strong> Em <code>/caixa</code>, simular 1 Suprimento (R$ 100,00) e 1 Sangria de retirada (R$ 50,00).</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Alerta de Estoque Mínimo:</strong> Em <code>/estoque</code>, conferir itens cadastrados e regras de quantidade mínima.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>DRE Gerencial:</strong> Em <code>/financeiro</code>, validar o cálculo de Receita Bruta, Custos e Lucro Líquido do dia.</div>
            </li>
        </ul>
    </div>

    <!-- MODULO 8 -->
    <div class="module-card">
        <div class="module-head">
            <div class="module-title">8. SaaS Master & Lixeira de Restaurantes (Multi-Lojas)</div>
            <span class="module-assignee assignee-clara">Clara (SaaS Admin)</span>
        </div>
        <ul class="checklist">
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Visão Geral SaaS:</strong> Acessar <code>/saas</code> e conferir os restaurantes ativos (ex: <em>Resenha da Naty</em>).</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Criar Restaurante de Teste:</strong> Adicionar uma nova loja de simulação com plano e responsável.</div>
            </li>
            <li class="check-item">
                <span class="checkbox-square"></span>
                <div class="item-text"><strong>Lixeira de Restaurantes:</strong> Mover o restaurante teste para a lixeira, testar <em>Restaurar</em> e <em>Excluir Definitivo</em>.</div>
            </li>
        </ul>
    </div>

    <!-- PARECER E FEEDBACK -->
    <div class="feedback-section">
        <div class="section-title">
            <span class="section-icon">📝</span>
            Parecer & Apontamentos dos Testadores
        </div>
        <div class="feedback-box">
            <div class="feedback-lines"></div>
            <div class="feedback-lines"></div>
            <div class="feedback-lines"></div>
            <div class="feedback-lines"></div>
        </div>
    </div>

    <!-- RODAPÉ -->
    <div class="footer">
        <div>
            <strong>EloServe Tecnologia</strong> • Plataforma Cloud & PWA para Bares e Restaurantes
        </div>
        <div>
            Documento de Homologação emitido em: <strong>05/11/2026</strong> • Fundador: <span class="footer-sig">Ítalo Silva</span>
        </div>
    </div>

</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML gerado com sucesso em: {html_path}")

# Gerar PDF com o Microsoft Edge Headless
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_exe):
    edge_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

cmd = [
    edge_exe,
    "--headless=new",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Executando gerador de PDF...")
result = subprocess.run(cmd, capture_output=True, text=True)
time.sleep(2)

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"[OK] PDF gerado com sucesso: {pdf_path} ({size_kb:.1f} KB)")
else:
    print(f"[ERRO] Falha ao gerar PDF. Saida do processo: {result.stdout} {result.stderr}")
