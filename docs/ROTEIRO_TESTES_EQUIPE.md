# 🍽️ Guia de Testes Práticos - EloServe

Link de Acesso: https://eloserve.pages.dev

---

## 🔑 Acessos dos Testadores

* **Wendel:**
  - E-mail: `wendelteixera@gmail.com`
  - Senha / PIN: `1234`
  - Foco: Frente de Loja, Garçom, Mesas, Balcão e Delivery.

* **Clara:**
  - E-mail: `claraprudencio@gmail.com`
  - Senha / PIN: `1234`
  - Foco: Cozinha Digital (KDS), Estoque, Financeiro, Gestão de Logins e Lixeira.

---

## 📱 Roteiro de Teste do Wendel (Salão, Mesas e Vendas)

1. **Login:** Entrar com seu e-mail e senha `1234`.
2. **Abrir Mesa:** Ir em **Mesas**, abrir a **Mesa 02**, colocar o nome do cliente e quantidade de pessoas.
3. **Lançar Pedidos:** Adicionar itens na mesa, testar colocar observação (ex: "sem cebola").
4. **Dividir por Pessoa:** Adicionar um item para a "Pessoa 1" e outro para a "Pessoa 2".
5. **Couvert & 10%:** Ligar/desligar a taxa de 10% e o couvert artístico para ver o valor recalcular.
6. **PDV Balcão:** Ir no menu **PDV**, simular uma venda rápida de balcão e finalizar no Pix ou Dinheiro.
7. **Delivery:** Ir em **Delivery**, cadastrar um pedido com nome, telefone e endereço de entrega.
8. **Fechar Mesa & WhatsApp:** Voltar na Mesa 02, clicar em **Fechar Conta**, testar o botão **Recibo via WhatsApp** e concluir o pagamento.

---

## 👩‍🍳 Roteiro de Teste da Clara (Cozinha KDS, Gestão e Lixeira)

1. **Login:** Entrar com seu e-mail e senha `1234`.
2. **Cozinha Digital (KDS):** Ficar com a tela do **KDS** aberta enquanto o Wendel lança os pedidos das mesas.
3. **Produção sem Papel:**
   - Conferir se o pedido do Wendel apareceu na hora na tela.
   - Clicar para mudar o status de **"Novo"** para **"Em Preparo"**.
   - Clicar para marcar como **"Pronto / Finalizado"**.
4. **Lixeira de Usuários:**
   - Ir em **Funcionários**, cadastrar um funcionário teste.
   - Clicar no botão da **Lixeira** para enviar ele para a lixeira.
   - Ir na aba **Lixeira**, testar **Restaurar** e depois fazer a **Exclusão Definitiva**.
5. **Estoque & DRE:**
   - Ir em **Estoque** e cadastrar um item com estoque mínimo.
   - Ir em **Financeiro** e conferir o resumo do DRE.
6. **SaaS Master & Lixeira de Restaurantes:**
   - Ir em **SaaS Master**, criar um restaurante teste.
   - Enviar o restaurante teste para a lixeira e conferir na aba **Lixeira de Restaurantes** a restauração ou exclusão definitiva.

---

## 💬 Feedback ao Final

- O sistema foi rápido e fácil de mexer no celular/computador?
- O painel da cozinha substitui bem a impressora de papel?
- Encontraram algum erro, botão travado ou texto estranho?
- O que acharam que pode melhorar?
