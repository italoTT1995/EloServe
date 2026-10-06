# 🏗️ Arquitetura e Escolha Tecnológica: EloServe PDV

A escolha da stack tecnológica para um sistema de Ponto de Venda (PDV) e Gestão de Restaurantes é uma das decisões mais críticas do projeto. Um PDV lida com dinheiro, inventário em tempo real, pedidos de cozinha com latência zero e clientes exigentes em horários de pico.

---

## 1. Desafios Técnicos Cruciais de um Sistema PDV

1. **Baixa Latência & Tempo Real (Realtime):** Quando o garçom clica em "Enviar Pedido" na Mesa 5, o KDS da cozinha precisa receber o pedido em menos de 200ms.
2. **Multi-Dispositivo & Multi-Plataforma:** O sistema precisa rodar com perfeição em:
   - PC desktop do Caixa (Windows/Linux/Mac);
   - Smart TVs ou tablets na Cozinha (KDS);
   - Celulares dos garçons (Android/iOS);
   - Celulares dos clientes na mesa (Cardápio Digital via QR Code, sem instalar nada);
3. **Resiliência a Quedas de Conexão (Offline-First):** Se o link de internet oscilar por 10 minutos, o caixa não pode travar. O sistema deve armazenar as vendas localmente (IndexedDB / Local Storage) e sincronizar ao reconectar.
4. **Precisão Financeira Estrita:** Sem arredondamentos errados em centavos (necessidade de tipagem estrita e operações monetárias seguras).
5. **Integração com Hardware Local:** Impressoras térmicas não-fiscais (ESC/POS 80mm/58mm via USB, Ethernet ou Bluetooth) e gavetas de dinheiro.

---

## 2. A Stack Tecnológica Selecionada

Após analisar os requisitos de velocidade de desenvolvimento, escalabilidade, facilidade de colaboração em equipe e custo de infraestrutura, a stack mais recomendada e adotada para o **EloServe** é:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ECOSSISTEMA ELOSERVE                            │
├───────────────────┬───────────────────────────────┬────────────────────┤
│   FRENTE DE CAIXA │        KDS COZINHA &          │   CARDÁPIO QR CODE │
│   & DASHBOARD     │        COMANDA GARÇOM         │   & DELIVERY       │
│  (React 19 + TS)  │     (React 19 Mobile/Tablet)  │  (PWA Mobile Web)  │
└─────────┬─────────┴───────────────┬───────────────┴──────────┬─────────┘
          │                         │                          │
          └─────────────────────────┼──────────────────────────┘
                                    │ WebSockets / HTTP
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               BACKEND & REALTIME (Node.js + Supabase)                 │
├────────────────────────────────────────────────────────────────────────┤
│ • PostgreSQL 16 Relacional (ACID para integridade de caixa e estoque) │
│ • Supabase Realtime (WebSockets nativos para sincronização imediata)  │
│ • Row Level Security (RLS) para isolamento Multi-tenant               │
│ • Edge Functions / API REST (Fastify/Express TypeScript)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              MICROSERVIÇO WHATSAPP & IA (EloBot 24h)                   │
├────────────────────────────────────────────────────────────────────────┤
│ • @whiskeysockets/baileys (Conexão WebSocket direta WhatsApp Web)      │
│ • Google Gemini 1.5 Flash API (Processamento de Linguagem Natural)     │
│ • RAG Semântico / Fila de Mensagens Automáticas                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Detalhamento dos Componentes:

### 1. Frontend & Client: **React 19 + TypeScript + Vite + TailwindCSS**
* **Por que React 19 + Vite?**
  - **Performance extrema:** O Vite inicializa em milissegundos e produz bundles altamente otimizados.
  - **Ecossistema:** Maior comunidade do mundo, facilidade de encontrar bibliotecas para PDV (impressão térmica, QR Code, gráficos analíticos, leitores de código de barras).
  - **TypeScript:** Impede erros silenciosos em tempo de desenvolvimento, especialmente com cálculos monetários, status de pedidos e tipagem de produtos.
* **Gerenciamento de Estado:** **Zustand** (leve, veloz, sem boilerplate do Redux, ideal para o carrinho e a mesa ativa).
* **Estilização:** **TailwindCSS** (design system corporativo rápido, consistente, responsivo para celulares, tablets e monitores widescreen).
* **Ícones:** **Lucide React** (moderno, leve e padronizado).

---

### 2. Banco de Dados & Camada Realtime: **PostgreSQL + Supabase**
* **Por que PostgreSQL?**
  - Bancos NoSQL (como MongoDB) são arriscados para sistemas financeiros e de estoque que exigem transações atômicas (**ACID**). Um fechamento de caixa ou baixa de estoque exige consistência imediata.
* **Por que Supabase?**
  - **Sincronização em Tempo Real (WebSockets):** O Supabase escuta as alterações da tabela `pedidos` e transmite instantaneamente para as telas da cozinha (KDS) e garçons sem que você precise configurar e manter servidores complexos de Socket.io.
  - **Multi-Tenancy com RLS:** Permite que milhares de restaurantes usem o mesmo banco de dados com segurança absoluta, isolando os dados de cada estabelecimento na própria camada do banco via `tenant_id`.

---

### 3. Comunicação com Impressoras Térmicas: **ESC/POS**
* O sistema utiliza a especificação padrão da indústria **ESC/POS** (Epson Standard Code for POS):
  - Suporte a impressão via Web Bluetooth (para maquininhas e impressoras portáteis);
  - Impressão via Rede Local (Ethernet / IP da impressora na cozinha);
  - Compatibilidade com impressoras Bematech, Daruma, Epson, Elgin e chinesas genéricas (58mm e 80mm).

---

### 4. Gateway de Atendimento com IA: **Node.js + Baileys + Gemini Flash**
* **Conexão WhatsApp:** Utiliza a biblioteca `@whiskeysockets/baileys` para operar diretamente via WebSocket do WhatsApp Web, eliminando cobranças em dólar de intermediários.
* **Inteligência Artificial:** O **Google Gemini 1.5 Flash** atua com processamento em linguagem natural e tempo de resposta ultrarrápido (< 800ms), consultando o cardápio do restaurante para responder dúvidas e registrar pedidos.

---

## 3. Comparativo de Alternativas Avaliadas

| Stack Avaliada | Veredito | Justificativa |
| :--- | :---: | :--- |
| **Java / C# Desktop (WPF/WinForms)** | ❌ Recusada | Antiga, exige instalação manual máquina a máquina, não roda no celular do garçom nem na mesa do cliente via QR Code. |
| **Python / Django / Flask** | ⚠️ Secundária | Excelente para IA e dados, mas mais pesada para interfaces reativas em tempo real na frente de caixa e KDS. |
| **PHP / Laravel** | ⚠️ Secundária | Muito boa para portais web, mas menos fluida para aplicações SPA offline-first e WebSockets de alta frequência. |
| **React 19 + TypeScript + Node/Postgres** | ✅ **ESCOLHIDA** | A mais versátil, moderna, suporta web, mobile e desktop, tempo real nativo e maior facilidade de manutenção em equipe. |
