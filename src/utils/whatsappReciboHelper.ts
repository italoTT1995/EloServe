export interface ItemReciboDigital {
  nome: string;
  quantidade: number;
  subtotal: number;
}

export interface DadosReciboDigital {
  nomeRestaurante: string;
  mesaNumero?: number;
  clienteNome?: string;
  garcomNome?: string;
  itens: ItemReciboDigital[];
  subtotal: number;
  taxaServico?: number;
  couvertArtistico?: number;
  desconto?: number;
  total: number;
  formaPagamento?: string;
  chavePix?: string;
  dataHora?: string;
}

/**
 * Gera texto formatado e elegante para envio no WhatsApp do cliente
 */
export function gerarTextoReciboWhatsApp(dados: DadosReciboDigital): string {
  const dataFormatada =
    dados.dataHora ||
    new Date().toLocaleDateString('pt-BR') +
      ' às ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let msg = `🧾 *EXTRATO DIGITAL — ${dados.nomeRestaurante.toUpperCase()}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (dados.mesaNumero) msg += `📍 *Mesa:* #${dados.mesaNumero}\n`;
  if (dados.clienteNome && dados.clienteNome !== 'todos') msg += `👤 *Cliente:* ${dados.clienteNome}\n`;
  if (dados.garcomNome) msg += `🧑‍🍳 *Atendimento:* ${dados.garcomNome}\n`;
  msg += `🕒 *Data:* ${dataFormatada}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*ITENS CONSUMIDOS:*\n`;

  if (dados.itens.length === 0) {
    msg += `• Consumo avulso registrado no caixa\n`;
  } else {
    dados.itens.forEach((it) => {
      msg += `• ${it.quantidade}x ${it.nome} — R$ ${it.subtotal.toFixed(2)}\n`;
    });
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Subtotal: R$ ${dados.subtotal.toFixed(2)}\n`;

  if (dados.taxaServico && dados.taxaServico > 0) {
    msg += `10% Serviço (Garçom): + R$ ${dados.taxaServico.toFixed(2)}\n`;
  }
  if (dados.couvertArtistico && dados.couvertArtistico > 0) {
    msg += `Couvert Artístico: + R$ ${dados.couvertArtistico.toFixed(2)}\n`;
  }
  if (dados.desconto && dados.desconto > 0) {
    msg += `Desconto: - R$ ${dados.desconto.toFixed(2)}\n`;
  }

  msg += `*VALOR TOTAL: R$ ${dados.total.toFixed(2)}*\n`;

  if (dados.formaPagamento) {
    msg += `Forma de Pagamento: ${dados.formaPagamento.toUpperCase()}\n`;
  }

  if (dados.chavePix) {
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔑 *Chave PIX:* \`${dados.chavePix}\`\n`;
    msg += `_(Copie a chave acima para pagar no app do seu banco)_\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Comprovante 100% digital gerado por EloServe._\n`;
  msg += `_Obrigado pela preferência e volte sempre!_ ✨`;

  return msg;
}

/**
 * Abre o WhatsApp (Web ou App nativo) diretamente com o número e o texto codificado
 */
export function abrirWhatsAppRecibo(telefone: string, texto: string) {
  const telLimpo = telefone.replace(/\D/g, '');
  const url = telLimpo
    ? `https://wa.me/55${telLimpo}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
