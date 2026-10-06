# 📋 Especificação Funcional e Módulos: EloServe PDV

Este documento especifica em nível detalhado todos os requisitos funcionais e não-funcionais que compõem o **EloServe**, espelhando e aprimorando as capacidades observadas no modelo de referência iSolver.

---

## MÓDULO 1: Frente de Caixa & Ponto de Venda (PDV Rápido)
**Objetivo:** Permitir vendas rápidas de balcão (takeaway) com o mínimo de cliques e máxima agilidade.

### Funcionalidades:
1. **Catálogo Rápido de Produtos:** Grid com fotos, atalhos de teclado (F1 a F12) e busca instantânea por código, nome ou leitor de código de barras.
2. **Carrinho de Compras Interativo:** Adição rápida, seleção de quantidade, aplicação de descontos (em % ou R$), acréscimos e observações por item.
3. **Múltiplos Meios de Pagamento por Venda:**
   - Dinheiro (com calculadora visual de troco);
   - PIX (geração dinâmica de QR Code PIX copia-e-cola na tela);
   - Cartão de Crédito e Débito;
   - Vale-Refeição / Alimentação (VR/VA);
   - Pagamento Misto (ex: R$ 50 no Dinheiro + R$ 35 no Cartão).
4. **Impressão do Cupom:** Disparo instantâneo para impressora térmica 80mm/58mm via ESC/POS ou envio do comprovante para o WhatsApp do cliente.
5. **Aguardando / Suspender Venda:** Permite colocar uma venda em espera no balcão caso o cliente precise buscar a carteira, liberando a fila para o próximo.

---

## MÓDULO 2: Gestão de Mesas & Comandas (Salão Inteligente)
**Objetivo:** Gerenciar o fluxo de clientes sentados no salão, pedidos por garçons ou autosserviço por QR Code.

### Funcionalidades:
1. **Mapa Visual do Salão:**
   - Visualização gráfica das mesas organizadas por setores (Salão Principal, Varanda, Deck, Bar).
   - Indicadores visuais por cores:
     - 🟢 **Verde (Livre):** Pronta para novos clientes;
     - 🔴 **Vermelho (Ocupada):** Comanda aberta e consumindo;
     - 🟡 **Amarelo (Aguardando Conta):** Cliente pediu o fechamento;
     - 🔵 **Azul (Chamar Garçom):** Cliente acionou o botão de ajuda via QR Code.
2. **Tempo de Permanência & Ticket Médio:** Contador de minutos desde a abertura da mesa e valor parcial acumulado.
3. **Ações Rápidas de Mesa:**
   - Adicionar itens à comanda;
   - Transferir itens de uma mesa para outra;
   - Juntar mesas (agrupar mesas para grupos grandes);
   - Divisão de conta flexível (por pessoa, por consumo ou divisão igualitária).
4. **QR Code na Mesa (Cardápio na Palma da Mão):**
   - Cada mesa possui um QR Code único e seguro (ex: `eloserve.com.br/m/12?mesa=05`).
   - O cliente faz o pedido pelo próprio celular, que cai automaticamente no KDS da cozinha vinculado à Mesa 5.

---

## MÓDULO 3: Painel da Cozinha (KDS - Kitchen Display System)
**Objetivo:** Orquestrar a fila de produção da cozinha sem gritos, papéis ou atrasos.

### Funcionalidades:
1. **Fila Visual por Colunas (Kanban de Produção):**
   - **A Fazer (Novo):** Pedidos recém-chegados com cronômetro em contagem progressiva;
   - **Em Preparo:** O cozinheiro clica para avisar que começou a preparar;
   - **Pronto:** Pedido finalizado, pronto para o garçom levar ou motoboy retirar.
2. **Destaque de Observações Críticas:** Alertas em vermelho para alergias, restrições e modificações de prato (ex: *"ALÉRGICO A AMENDOIM"*, *"SEM TOMATE"*).
3. **Agrupamento por Setor de Preparo:**
   - Tela da Cozinha Quente (Fogão/Chapa/Forno);
   - Tela do Bar (Drinks, Chopps, Sucos);
   - Tela de Sobremesas.
4. **Alerta de Atraso por Cor:**
   - 🟢 Até 15 min: dentro do prazo;
   - 🟡 16 a 25 min: atenção;
   - 🔴 Acima de 25 min: alerta de atraso crítico com bip sonoro.

---

## MÓDULO 4: Cardápio Digital & Delivery Próprio
**Objetivo:** Criar um canal próprio de vendas online sem comissões de 27% de marketplaces externos.

### Funcionalidades:
1. **PWA Mobile-First:** Carregamento ultra rápido, responsivo e adaptado para qualquer smartphone.
2. **Customizador de Pratos (Modifiers):**
   - Ponto da carne (Mal passado, Ao ponto, Bem passado);
   - Tamanho (P, M, G);
   - Adicionais pagos (Bacon extra, Queijo extra, Borda recheada);
   - Ingredientes a retirar.
3. **Cálculo Inteligente de Entrega:**
   - Taxa fixa, por bairro ou por raio de distância (KM).
4. **Integração com PIX Automático:** Exibição do QR Code PIX com confirmação em tela.

---

## MÓDULO 5: Controle Financeiro & Fluxo de Caixa
**Objetivo:** Garantir que 100% das entradas e saídas batam no centavo sem furos.

### Funcionalidades:
1. **Abertura de Caixa (Suprimento Inicial):** Registro do operador, turno e fundo de troco.
2. **Sangria (Retiradas):** Registro obrigatório de justificativa (ex: pagamento de fornecedor urgente na porta).
3. **Fechamento Cego de Caixa:**
   - O operador digita o total de cédulas e moedas físicas contadas no caixa;
   - O sistema só então compara com o registrado nas vendas e gera o relatório de conferência (sobra ou quebra de caixa).
4. **Relatório Diário de Faturamento:** Gráficos com total faturado, divisão por canal (Balcão vs Mesa vs Delivery) e por meio de pagamento.

---

## MÓDULO 6: Controle de Estoque com Ficha Técnica
**Objetivo:** Impedir o desperdício, desvio de ingredientes e surpresas de prato indisponível.

### Funcionalidades:
1. **Cadastro de Insumos (Matéria-Prima):**
   - Unidades de medida suportadas: KG, Gramas, Litros, ML, Unidades.
   - Custo médio unitário.
2. **Ficha Técnica do Produto (BOM - Bill of Materials):**
   - Exemplo: 1 Pizza Calabresa Grande = 350g de massa + 200g de queijo mussarela + 150g de calabresa fatiada + 1 caixa de pizza.
3. **Baixa Automática:** Ao finalizar a venda no PDV ou no KDS, o estoque é debitado automaticamente.
4. **Alerta de Estoque Mínimo:** Notificação automática no painel avisando que insumos cruciais estão abaixo do estoque de segurança.

---

## MÓDULO 7: EloBot — Atendente de IA 24h no WhatsApp
**Objetivo:** Automatizar o atendimento de delivery e salão sem folgas ou atrasos.

### Funcionalidades:
1. **Atendimento Humanizado:** Utiliza IA de última geração para conversar em português natural, tirando dúvidas sobre horário, pratos e promoções.
2. **Transbordo Humano Inteligente:** Se o cliente pedir para falar com um humano ou tiver um problema complexo, a IA pausa o bot e notifica a equipe do balcão.
3. **Notificações Proativas:** Envio de atualizações de status via WhatsApp:
   - *"Seu pedido #104 foi confirmado e já está na cozinha!"*
   - *"Seu pedido saiu para entrega com o entregador João!"*
