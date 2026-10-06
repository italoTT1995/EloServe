# 🔍 Análise de Benchmark: iSolver PDV (isolver.com.br)

Esta análise serve como estudo de referência para o desenvolvimento do **EloServe PDV**. O iSolver é um sistema de gestão e ponto de venda (PDV) focado em bares, restaurantes, hamburguerias, lanchonetes e pizzarias, posicionado no mercado com uma proposta de unificação operacional e preço transparente.

---

## 1. Proposta de Valor e Posicionamento

* **Slogan & Missão:** *"Do pedido ao fechamento do caixa — sem taxa escondida, sem confusão, sem grito, sem papel."*
* **Público-Alvo:** Bares, restaurantes, pubs, hamburguerias, cafeterias e deliveries de médio e pequeno porte.
* **Dores Críticas do Cliente que o Sistema Resolve:**
  1. **Pedidos errados ou esquecidos:** Garçons anotando em comandas de papel ilegíveis ou com atraso para levar à cozinha.
  2. **Gargalo no atendimento do salão:** Faltam garçons em horários de pico; clientes esperam muito para pedir ou pagar a conta.
  3. **Comunicação ruidosa salão ↔ cozinha:** Gritaria, papel térmico voando ou molhando, desorganização da ordem de preparo (FIFO).
  4. **Furos no caixa e divergências:** Fechamento de caixa que não bate no fim do turno, sem clareza de quem recebeu em dinheiro, PIX ou cartão.
  5. **Estoque que "some":** Falta de baixa automática dos ingredientes (insumos) ao vender um prato.
  6. **Custo abusivo de plataformas tradicionais:** Taxas de 12% a 27% por pedido em marketplaces de delivery e taxas ocultas sobre PIX de outros softwares.

---

## 2. Levantamento Detalhado de Módulos e Funcionalidades

### A. Gestão de Pedidos (Fluxo Operacional Unificado)
* **Kanban Visual de Pedidos:** Organização em colunas por status (*Novo ➔ Em Preparo ➔ Pronto ➔ Entregue / Finalizado*).
* **Canais Integrados:** Balcão (Takeaway/PDV rápido), Salão (Mesas/Comandas) e Delivery no mesmo painel.
* **Alertas Multissensoriais:** Alertas visuais piscantes e sonoros no navegador a cada novo pedido recebido.
* **Acompanhamento do Cliente:** Status transparente para o cliente saber quando o pedido foi aceito, entrou em preparo e saiu para entrega.

### B. Gestão de Mesas e Salão com QR Code
* **Mapa de Mesas em Tempo Real:** Layout visual do salão mostrando mesas livres, ocupadas, tempo de permanência e valor parcial da comanda.
* **Cardápio Digital na Mesa via QR Code:**
  * O cliente senta à mesa, aponta a câmera do celular para o QR Code e abre o cardápio interativo sem precisar instalar nenhum aplicativo.
  * O cliente faz os pedidos direto do celular dele, enviando instantaneamente para a cozinha.
  * Reduz a necessidade de muitos garçons no salão (*"Você atende mais com menos gente"*).
* **Chamar Garçom & Pedir a Conta:** Botão de 1 toque no cardápio digital do celular do cliente que dispara um alerta sonoro e visual no painel do caixa/garçom com o número da mesa.
* **Controle de Atenção:** Alertas automáticos no mapa para mesas que estão há mais de X minutos sem consumo ou com o cardápio aberto no celular.

### C. KDS — Kitchen Display System (Painel da Cozinha)
* **Substituição do Papel:** Tela/monitor na área de preparo da cozinha (fogão, chapa, bar, montagem).
* **Fila de Produção Inteligente (FIFO):** Pedidos ordenados por tempo de chegada, com cores indicadoras de atraso (verde: no prazo, amarelo: atenção, vermelho: atrasado).
* **Detalhes da Comanda:** Prato, ponto da carne, observações (ex: *"sem cebola"*, *"molho à parte"*), adicionais e número da comanda/mesa.
* **Impressão Térmica Opcional:** Suporte a impressão automática de comandas para estabelecimentos que ainda preferem a comanda impressa.

### D. Controle de Caixa e Frente de Caixa (PDV)
* **Abertura e Fechamento de Turno:** Registro do saldo inicial (suprimento/troco).
* **Sangrias e Suprimentos:** Registro justificado de retiradas ou entradas extras de dinheiro durante o turno.
* **Múltiplas Formas de Pagamento:** Dinheiro (com cálculo automático de troco), Cartão Débito, Cartão Crédito, PIX, Voucher/Refeição e Fiado/Conta Cliente.
* **Fechamento Cego:** O operador de caixa conta o dinheiro sem ver o saldo do sistema antes, evitando fraudes e divergências.

### E. Controle de Estoque com Ficha Técnica
* **Baixa por Insumo (Engenharia do Cardápio):** Cada produto vendido desconta os ingredientes cadastrados na ficha técnica (ex: 1 X-Burger dá baixa em 1 pão brioche, 160g de blend bovino, 30g de queijo cheddar e 1 embalagem).
* **Aviso de Estoque Mínimo:** Notificação preventiva antes de o insumo acabar em pleno expediente de atendimento.

### F. Atendente Virtual com IA no WhatsApp ("Mark")
* **Operação 24 Horas:** Atende clientes no WhatsApp mesmo de madrugada ou em dias fechados.
* **Funcionalidades do Bot:**
  * Tira dúvidas sobre cardápio, pratos vegetarianos, sem glúten, etc.
  * Monta e confirma pedidos de delivery direto pela conversa.
  * Envia notificações automáticas de status (*"Oi! Seu pedido já está sendo preparado na cozinha..."*).
  * Envia chave PIX Copia-e-Cola e confirmação de pagamento.

---

## 3. Modelo Comercial e Precificação do iSolver

* **Assinatura Única:** R$ 149,99/mês (sem surpresas).
* **Diferencial Competitivo:**
  * ❌ Sem taxa por pedido (ao contrário de concorrentes que cobram R$ 0,99 por pedido).
  * ❌ Sem taxa sobre transações PIX (concorrentes chegam a cobrar 0,99% sobre o faturamento do PIX).
  * ✅ Teste grátis de 7 dias sem cartão de crédito.
  * ✅ Todos os módulos inclusos no mesmo plano (Mesas, KDS, Delivery, Estoque e IA no WhatsApp).

---

## 4. Oportunidades para o EloServe Superar a Concorrência

1. **Modo Offline-First Real:** Em restaurantes, a internet cai com frequência. Se a internet cair, o PDV local do EloServe continuará tirando pedidos e sincronizará com a nuvem assim que a rede voltar.
2. **Multi-Tenancy SaaS Nativo:** Arquitetura pensada para operar com múltiplos restaurantes em instâncias isoladas e seguras.
3. **PWA Instalável e Super Rápido:** Aplicação web progressiva que roda no Windows, Linux, Android, iOS e maquininhas Smart POS (Cielo, PagBank, Stone) sem necessidade de instalação pesada.
4. **Relatórios Gerenciais Avançados:** Curva ABC de produtos, pratos mais lucrativos vs pratos menos rentáveis, ticket médio por mesa e giro de mesas no salão.
