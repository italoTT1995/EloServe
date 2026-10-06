# 🗺️ Roadmap de Desenvolvimento: EloServe PDV

Este roadmap divide a construção do **EloServe** em marcos graduais e testáveis (Sprints), garantindo que cada fase entregue valor imediato e funcional.

---

## 📌 Fase 1: Fundação, Design System & Arquitetura Base
* [ ] Inicializar projeto com React 19, TypeScript, Vite e TailwindCSS.
* [ ] Configurar variáveis de ambiente e cliente Supabase com fallbacks resilientes.
* [ ] Construir layout base e navegação responsiva (Menu lateral, modo escuro/claro, topo com status de caixa e notificações).
* [ ] Configurar controle de estado global com Zustand.

---

## 📌 Fase 2: Cardápio, Categorias & Produtos
* [ ] CRUD de Categorias com cores e ícones.
* [ ] Cadastro de Produtos com fotos, preço de custo, preço de venda e setor de impressão (Cozinha/Bar).
* [ ] Suporte a adicionais/complementos (ex: Ponto da carne, molhos extras, adicionais pagos).
* [ ] Controle rápido de disponibilidade de item (ativar/desativar com 1 clique).

---

## 📌 Fase 3: Frente de Caixa & PDV Balcão (Takeaway)
* [ ] Grade visual de produtos com busca ultrarrápida e leitor de código de barras.
* [ ] Carrinho de compras com aplicação de descontos e observações.
* [ ] Modal de liquidação com cálculo de troco e gerador dinâmico de PIX (QR Code).
* [ ] Módulo de impressão não-fiscal (formatação de recibo 80mm/58mm via ESC/POS).

---

## 📌 Fase 4: Salão, Mapa de Mesas & Comandas
* [ ] Mapa interativo do salão com status em tempo real (Livre, Ocupada, Pagando, Chamar Garçom).
* [ ] Abertura, fechamento e transferência de mesas e comandas.
* [ ] Divisão de conta por cliente ou valor igual.
* [ ] Geração de QR Codes individuais por mesa para cardápio digital no celular do cliente.

---

## 📌 Fase 5: KDS (Kitchen Display System - Painel da Cozinha)
* [ ] Fila de pedidos em tempo real estilo Kanban (A Fazer ➔ Em Preparo ➔ Pronto).
* [ ] Cronômetro individual de tempo de preparo com alertas de atraso (Verde, Amarelo, Vermelho).
* [ ] Alertas sonoros a cada novo pedido que entra na cozinha.
* [ ] Filtro por setor (exibir apenas bebidas para o Bar e pratos para a Cozinha).

---

## 📌 Fase 6: Controle Financeiro & Fechamento de Caixa
* [ ] Abertura de turno (suprimento/troco inicial).
* [ ] Registro de sangrias (retiradas) com justificativa.
* [ ] Fechamento cego de caixa (conferência física vs sistema com cálculo de quebra/sobra).
* [ ] Relatórios analíticos diários de vendas, ticket médio e formas de pagamento.

---

## 📌 Fase 7: Controle de Estoque & Ficha Técnica
* [ ] Cadastro de insumos e unidades de medida (kg, g, l, un).
* [ ] Ficha técnica por prato com cálculo de custo e margem de lucro.
* [ ] Baixa automática de matéria-prima a cada venda concluída.
* [ ] Relatório de insumos com estoque crítico/mínimo.

---

## 📌 Fase 8: EloBot (Atendente Virtual 24h no WhatsApp)
* [ ] Integração com WhatsApp Web via Baileys no servidor local/VPS.
* [ ] Conexão com Google Gemini API para interpretação de linguagem natural.
* [ ] Notificações automáticas de status de pedido diretamente no WhatsApp do cliente.
* [ ] Transbordo humano inteligente com pausa da IA.
