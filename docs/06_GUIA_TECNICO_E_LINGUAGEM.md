# 📘 Guia Técnico Completo: Linguagens, Tecnologias e Arquitetura do EloServe

Este documento detalha **em profundidade** a escolha da linguagem de programação, bibliotecas, ferramentas de compilação, banco de dados e padrões de engenharia adotados no desenvolvimento do **EloServe PDV**.

---

## 1. A Linguagem Central: Por que TypeScript?

O **EloServe** foi inteiramente desenvolvido em **TypeScript (versão 5.7+)**, utilizando arquivos `.ts` e componentes `.tsx`.

### O que é o TypeScript?
O TypeScript é uma linguagem desenvolvida pela Microsoft que adiciona **tipagem estática forte** e verificação de tipos em tempo de compilação sobre o JavaScript moderno.

### Por que o TypeScript é obrigatório para um Sistema de PDV e Restaurante?

1. **Blindagem contra Bugs Financeiros:**
   Em um sistema de frente de caixa, uma venda de `R$ 34,90` que por descuido recebesse uma string `"34.90"` em vez de número poderia causar erros de concatenação (`"34.90" + 10 = "34.9010"` em vez de `R$ 44,90`). O TypeScript **impede que o código compile** se houver incompatibilidade de tipos numéricos.

2. **Eliminação do Erro "Cannot read property of undefined":**
   Em horários de pico num restaurante lotado, um garçom ou operador de caixa não pode se deparar com uma tela branca travada. O TypeScript valida se os dados da mesa, do prato, dos adicionais e do troco existem antes de tentar acessá-los.

3. **Autocompletação e Produtividade em Equipe:**
   Como você vai trabalhar com outra pessoa no repositório, o TypeScript atua como uma **documentação viva do código**. Quando o outro desenvolvedor for criar uma tela nova, o editor (VS Code, Cursor, etc.) já sugere exatamente os campos disponíveis:
   ```typescript
   // Exemplo real definido em src/types/index.ts:
   export interface Produto {
     id: string;
     categoriaId: string;
     nome: string;
     precoVenda: number;
     precoCusto?: number;
     setorPreparo: 'cozinha' | 'bar' | 'nenhum';
     disponivel: boolean;
   }
   ```

4. **Padrão das Maiores Empresas do Setor:**
   Empresas como **Stripe, iFood, Nubank, Shopify e Mercado Pago** utilizam TypeScript em 100% dos seus sistemas de checkout e pagamento.

---

## 2. A Stack Tecnológica Completa (Camada por Camada)

| Camada | Tecnologia | Versão | Papel no Sistema |
| :--- | :--- | :--- | :--- |
| **Linguagem Principal** | **TypeScript** | `5.7+` | Tipagem estática, contratos de dados e segurança do código. |
| **Frontend Framework** | **React** | `19.0` | Construção de interfaces reativas, componentes e renderização ultrarrápida. |
| **Build & Bundler** | **Vite** | `6.1` | Servidor de desenvolvimento com Hot Module Replacement (HMR) em menos de 1 segundo. |
| **Design System** | **TailwindCSS** | `3.4` | Estilização moderna através de classes utilitárias, suporte a Dark Mode e layout responsivo. |
| **Gerenciamento de Estado** | **Zustand** | `5.0` | Armazenamento reativo do carrinho de compras, mesas ativas e status do caixa sem boilerplate. |
| **Roteamento SPA** | **React Router DOM** | `7.2` | Navegação fluida entre telas (PDV, Mesas, KDS, Cardápio, Caixa, Relatórios, EloBot). |
| **Ícones do Sistema** | **Lucide React** | `0.475` | Biblioteca padronizada com mais de 1.000 ícones vetoriais leves. |
| **Banco de Dados & Realtime** | **PostgreSQL 16 / Supabase** | `2.49` | Banco relacional com transações atômicas (ACID) e WebSockets para a cozinha e salão. |
| **Comunicação Hardware** | **ESC/POS** | Universal | Protocolo para impressão de comandas térmicas (Epson, Bematech, Elgin). |
| **Automação de IA WhatsApp** | **Node.js + Baileys + Gemini** | `Node 24+` | Bot inteligente que atende 24h no WhatsApp real com a API do Google Gemini. |

---

## 3. Arquitetura do Estado Global com Zustand

Diferente de sistemas legados que usam o Redux (complexo, pesado e cheio de arquivos desnecessários), o **EloServe** utiliza o **Zustand**:

1. **`useCartStore.ts` (Frente de Caixa):**
   - Controla os itens adicionados ao carrinho;
   - Atualiza quantidades instantaneamente;
   - Calcula subtotal bruto, descontos e total líquido a pagar;
   - Vincula o pedido ao tipo: *Balcão, Mesa ou Delivery*.

2. **`useAppStore.ts` (Sessão Geral do Restaurante):**
   - Controla o status do caixa (*Aberto/Fechado*, saldo inicial de troco, faturamento do dia);
   - Sincroniza o mapa de mesas (*Livres, Ocupadas, Chamar Garçom, Aguardando Conta*);
   - Gerencia a fila do **KDS da Cozinha** (*A Fazer ➔ No Fogo ➔ Pronto*).

---

## 4. Estrutura de Pastas e Arquivos no Código-Fonte

```text
EloServe/
├── docs/                               # Toda a documentação e modelagem do sistema
│   ├── 01_ANALISE_BENCHMARK_ISOLVER.md # Benchmark detalhado do iSolver.com.br
│   ├── 02_ARQUITETURA_E_STACK.md       # Decisões de arquitetura
│   ├── 03_REQUISITOS_E_MODULOS.md      # Especificação funcional dos 7 módulos
│   ├── 04_MODELAGEM_BANCO_DE_DADOS.md  # Scripts SQL DDL e diagrama ER
│   ├── 05_ROADMAP_DE_DESENVOLVIMENTO.md# Sprints e fases do projeto
│   └── 06_GUIA_TECNICO_E_LINGUAGEM.md  # Este guia técnico completo
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx             # Menu lateral com atalhos e identidade visual
│   │       ├── Header.tsx              # Barra superior com relógio, status online e caixa
│   │       └── Layout.tsx              # Estrutura unificada de casca do app
│   ├── pages/
│   │   ├── PDV.tsx                     # Frente de caixa principal com catálogo e pagamento
│   │   ├── Mesas.tsx                   # Mapa de mesas do salão em tempo real e QR Codes
│   │   ├── KDS.tsx                     # Painel da cozinha estilo Kanban com cronômetros
│   │   ├── Cardapio.tsx                # Gestão de produtos, preços e disponibilidade
│   │   ├── Caixa.tsx                   # Controle de caixa, sangrias e fechamento cego
│   │   ├── Relatorios.tsx              # Gráficos DRE, ticket médio e Curva ABC
│   │   └── EloBot.tsx                  # Simulador e configurações do WhatsApp IA
│   ├── store/
│   │   ├── useCartStore.ts             # Estado do carrinho de compras (Zustand)
│   │   └── useAppStore.ts              # Estado global do restaurante (Zustand)
│   ├── types/
│   │   └── index.ts                    # Todas as interfaces TypeScript estritas
│   ├── lib/
│   │   └── supabase.ts                 # Conexão resiliente com o banco de dados
│   ├── App.tsx                         # Roteamento central das páginas
│   ├── main.tsx                        # Ponto de entrada do React 19
│   ├── index.css                       # Estilização base do Tailwind CSS
│   └── vite-env.d.ts                   # Definições de tipos do Vite
├── index.html                          # HTML base da aplicação
├── package.json                        # Gerenciamento de dependências e scripts npm
├── tailwind.config.js                  # Configurações do Tailwind CSS
├── tsconfig.json                       # Configurações do compilador TypeScript
└── vite.config.ts                      # Configuração do Vite e aliases de importação
```

---

## 5. Como Executar e Trabalhar no Projeto

### Para rodar no computador:
```bash
# 1. Instalar dependências (se ainda não tiver instalado)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```
O sistema abrirá automaticamente na porta local: **`http://localhost:5174`**

### Para compilar para produção (verificar integridade TypeScript):
```bash
npm run build
```
O Vite e o TypeScript validarão todos os arquivos gerando a pasta otimizada `dist/` com zero erros.

---

## 6. Boas Práticas para Colaboração em Equipe no Git

1. **Branches:** Crie sempre uma branch para cada funcionalidade nova:
   ```bash
   git checkout -b feature/minha-tela
   ```
2. **Commits Semânticos:** Use mensagens claras:
   - `feat:` para funcionalidades novas;
   - `fix:` para correção de bugs;
   - `docs:` para melhorias na documentação;
   - `refactor:` para melhorias no código sem alterar comportamento.
3. **Sincronização:** Antes de começar o dia de trabalho:
   ```bash
   git pull origin main
   ```
