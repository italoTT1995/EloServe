# ⚡ EloServe PDV

> **Sistema Completo de Ponto de Venda (PDV), Gestão de Mesas, KDS da Cozinha, Estoque e Automação de Atendimento com IA para Bares, Restaurantes e Lanchonetes.**

Inspirado nas melhores práticas e diferenciais do benchmark de mercado (*iSolver.com.br*), o **EloServe** foi projetado para unificar todo o fluxo operacional do restaurante em uma única plataforma moderna, eliminando papéis, confusões entre salão e cozinha, furos de caixa e taxas abusivas de intermediários.

---

## 📑 Documentação Técnica Completa

Toda a engenharia, modelagem e planejamento do sistema foram documentados e versionados no repositório:

| Documento | Descrição |
| :--- | :--- |
| 🔍 **[01. Análise de Benchmark (iSolver)](docs/01_ANALISE_BENCHMARK_ISOLVER.md)** | Estudo aprofundado do produto referência, proposta de valor, dores resolvidas e diferenciais competitivos. |
| 🏗️ **[02. Arquitetura & Stack Tecnológica](docs/02_ARQUITETURA_E_STACK.md)** | Justificativa técnica da escolha da stack (React 19 + TypeScript + Vite + PostgreSQL/Supabase + Baileys + Gemini Flash). |
| 📋 **[03. Requisitos & Módulos Funcionais](docs/03_REQUISITOS_E_MODULOS.md)** | Especificação detalhada dos 7 módulos: PDV Balcão, Mesas QR Code, KDS Cozinha, Delivery, Caixa, Estoque e EloBot IA. |
| 🗄️ **[04. Modelagem do Banco de Dados](docs/04_MODELAGEM_BANCO_DE_DADOS.md)** | Diagrama ER e scripts DDL (SQL) das tabelas relacionais multi-tenant. |
| 🗺️ **[05. Roadmap de Desenvolvimento](docs/05_ROADMAP_DE_DESENVOLVIMENTO.md)** | Fases práticas de implementação organizadas em sprints graduais. |
| 📘 **[06. Guia Técnico & Linguagens](docs/06_GUIA_TECNICO_E_LINGUAGEM.md)** | Detalhamento profundo do TypeScript, React 19, Vite, Tailwind, Zustand e boas práticas. |

---

## 🎯 Principais Módulos do Sistema

1. **Frente de Caixa (PDV Rápido):** Vendas de balcão ágeis com atalhos de teclado, busca instantânea, cálculo de troco, PIX dinâmico e impressão de comandas não-fiscais (ESC/POS 80mm/58mm).
2. **Mapa de Mesas & Comandas (Salão):** Controle visual em tempo real com ocupação, tempo de permanência, divisão de conta e autosserviço na mesa via QR Code no celular do próprio cliente.
3. **KDS — Painel da Cozinha (Kitchen Display):** Fila de produção Kanban sem papel (*A Fazer ➔ Em Preparo ➔ Pronto*), com cronômetro de atraso e destaque para alergias/observações.
4. **Cardápio Digital & Delivery:** Plataforma online própria para receber pedidos com fotos, complementos e taxas de entrega sem pagar comissões de 27% a aplicativos terceiros.
5. **Controle de Caixa:** Abertura de turno, controle rigoroso de sangrias/suprimentos e **fechamento cego** para auditoria sem quebras financeiras.
6. **Controle de Estoque & Ficha Técnica:** Baixa automática de ingredientes por item vendido (engenharia de cardápio) e alertas de estoque mínimo.
7. **EloBot (Atendente 24h no WhatsApp):** Robô inteligente integrado ao WhatsApp com IA (Gemini Flash), respondendo dúvidas, tirando pedidos e notificando clientes sobre o status de preparo.

---

## 🛠️ Stack Tecnológica

* **Frontend:** React 19, TypeScript, Vite, TailwindCSS, Zustand, Lucide React.
* **Backend & Realtime:** Supabase / PostgreSQL 16 (WebSockets para sincronização de comandas e KDS em milissegundos) + Node.js.
* **Hardware & Impressão:** Protocolo padrão de mercado ESC/POS (USB, Ethernet/Rede e Bluetooth).
* **Automação WhatsApp:** Node.js + `@whiskeysockets/baileys` + Google Gemini 1.5 Flash API.

---

## 👥 Colaboração em Equipe

Para colaborar neste repositório:
```bash
# Clonar o repositório
git clone git@github.com:italoTT1995/EloServe.git

# Acessar a pasta
cd EloServe

# Criar uma branch para sua funcionalidade
git checkout -b feature/nome-da-funcionalidade
```

---
*EloServe — Tecnologia de ponta para a operação gastronômica.*
