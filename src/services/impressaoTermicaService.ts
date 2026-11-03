/**
 * Serviço de Impressão Térmica (Desativado)
 * O sistema EloServe agora é 100% digital (sem papel e sem impressoras físicas).
 * Todos os setores (Cozinha KDS, Barman KDS, Garçom Mobile, PDV e Caixa) operam em tempo real nas telas.
 */
class ImpressaoTermicaService {
  public carregarConfiguracao() {
    return {};
  }
  public salvarConfiguracao() {
    return {};
  }
  public getConfig() {
    return {};
  }
  public imprimirTicketSetor(..._args: any[]) {
    // 100% digital - nada a imprimir
  }
  public imprimirTicketCozinhaEBar(..._args: any[]) {
    // 100% digital - pedidos fluem diretamente via KDS e WebSocket/Store
  }
  public imprimirConferenciaMesa(..._args: any[]) {
    // 100% digital - conferência visual em tela ou WhatsApp
  }
  public imprimirReciboComissao(..._args: any[]) {
    // 100% digital - controle em tela e DRE financeiro
  }
  public testarImpressora(..._args: any[]) {
    // 100% digital
  }
}

export const impressaoTermicaService = new ImpressaoTermicaService();
