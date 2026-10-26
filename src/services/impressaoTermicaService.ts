import { ConfiguracaoImpressaoTermica, TicketImpressao, ItemTicketImpressao, RegistroFechamentoComissao } from '../types';

const STORAGE_KEY = 'eloserve_impressao_config_v1';

export const CONFIG_IMPRESSAO_PADRAO: ConfiguracaoImpressaoTermica = {
  impressaoAutomaticaCozinha: true,
  impressaoAutomaticaBar: true,
  impressaoAutomaticaCaixa: true,
  larguraPapel: '80mm',
  nomeImpressoraCozinha: 'Impressora Térmica Cozinha',
  nomeImpressoraBar: 'Impressora Térmica Bar',
  nomeImpressoraCaixa: 'Impressora Térmica Balcão / Caixa',
  viasImpressao: 1,
  beepSonoroAoImprimir: true,
  destacarObservacoes: true,
  ipBridgeLocal: '',
};

class ImpressaoTermicaService {
  private config: ConfiguracaoImpressaoTermica;

  constructor() {
    this.config = this.carregarConfiguracao();
  }

  public carregarConfiguracao(): ConfiguracaoImpressaoTermica {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        return { ...CONFIG_IMPRESSAO_PADRAO, ...JSON.parse(salvo) };
      }
    } catch (e) {
      console.error('Erro ao ler configuração de impressão:', e);
    }
    return { ...CONFIG_IMPRESSAO_PADRAO };
  }

  public salvarConfiguracao(novaConfig: Partial<ConfiguracaoImpressaoTermica>): ConfiguracaoImpressaoTermica {
    this.config = { ...this.config, ...novaConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Erro ao salvar configuração de impressão:', e);
    }
    return this.config;
  }

  public getConfig(): ConfiguracaoImpressaoTermica {
    return { ...this.config };
  }

  private emitirBeepImpressao() {
    if (!this.config.beepSonoroAoImprimir) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Ignora falhas de áudio silenciosamente
    }
  }

  /**
   * Imprime silenciosamente o conteúdo HTML usando um iframe invisível.
   * Se o navegador estiver com a flag `--kiosk-printing`, a impressão sai diretamente sem diálogo.
   */
  private dispararImpressaoIframe(htmlContent: string) {
    this.emitirBeepImpressao();

    let iframe = document.getElementById('eloserve-silent-printer') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'eloserve-silent-printer';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Falha no iframe print, acionando fallback:', err);
      }
    }, 150);
  }

  private gerarCssTermico(): string {
    const largura = this.config.larguraPapel === '58mm' ? '54mm' : '76mm';
    return `
      @page {
        size: ${this.config.larguraPapel} auto;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 4px 6px;
        width: ${largura};
        font-family: 'Courier New', Courier, monospace, sans-serif;
        font-size: ${this.config.larguraPapel === '58mm' ? '11px' : '13px'};
        line-height: 1.25;
        color: #000;
        background: #fff;
        font-weight: bold;
      }
      .cabecalho {
        text-align: center;
        border-bottom: 2px dashed #000;
        padding-bottom: 6px;
        margin-bottom: 6px;
      }
      .titulo-restaurante {
        font-size: 15px;
        font-weight: 900;
        text-transform: uppercase;
      }
      .setor-badge {
        display: inline-block;
        font-size: 14px;
        font-weight: 900;
        padding: 2px 6px;
        border: 2px solid #000;
        margin: 4px 0;
        text-transform: uppercase;
      }
      .dados-pedido {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin: 2px 0;
      }
      .linha-destaque {
        font-size: 16px;
        font-weight: 900;
        background: #000;
        color: #fff;
        padding: 2px 4px;
        margin: 4px 0;
        text-align: center;
      }
      .divisor {
        border-top: 1px dashed #000;
        margin: 6px 0;
      }
      .divisor-duplo {
        border-top: 2px solid #000;
        margin: 6px 0;
      }
      .item-pedido {
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px dotted #ccc;
      }
      .item-topo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .item-qtd {
        font-size: 14px;
        font-weight: 900;
        min-width: 32px;
      }
      .item-nome {
        flex: 1;
        font-size: 13px;
        font-weight: 900;
        text-transform: uppercase;
      }
      .item-obs {
        font-size: 11px;
        font-weight: 900;
        margin-top: 2px;
        margin-left: 32px;
        padding: 2px 4px;
        border-left: 3px solid #000;
        background: #f0f0f0;
      }
      .item-cliente {
        font-size: 10px;
        margin-left: 32px;
        color: #333;
      }
      .rodape {
        text-align: center;
        margin-top: 8px;
        font-size: 10px;
        border-top: 1px dashed #000;
        padding-top: 4px;
      }
      .totais-bloco {
        margin-top: 6px;
        border-top: 1px dashed #000;
        padding-top: 4px;
      }
      .linha-total {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
        font-size: 12px;
      }
      .linha-total-final {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 15px;
        font-weight: 900;
        border-top: 2px solid #000;
        padding-top: 4px;
      }
    `;
  }

  /**
   * Dispara a impressão do ticket térmico para Cozinha ou Bar
   */
  public imprimirTicketSetor(ticket: TicketImpressao, nomeRestaurante = 'EloGastrô') {
    if (ticket.itens.length === 0) return;

    const dataHoraStr = ticket.dataHora || new Date().toLocaleString('pt-BR');
    const iconeSetor = ticket.setorAlvo === 'bar' ? '🍹 BAR / BEBIDAS' : '🍳 COZINHA / PREPARO';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket ${ticket.setorAlvo} #${ticket.numeroPedido}</title>
        <style>${this.gerarCssTermico()}</style>
      </head>
      <body>
        <div class="cabecalho">
          <div class="titulo-restaurante">${nomeRestaurante}</div>
          <div class="setor-badge">${iconeSetor}</div>
          <div class="linha-destaque">
            ${ticket.tipo === 'mesa' ? `MESA #${ticket.mesaNumero || '00'}` : ticket.tipo === 'delivery' ? 'PEDIDO DELIVERY' : 'BALCÃO / TAKEAWAY'}
          </div>
          <div class="dados-pedido">
            <span>PEDIDO: #${ticket.numeroPedido}</span>
            <span>HORA: ${dataHoraStr.split(' ')[1] || dataHoraStr}</span>
          </div>
          <div class="dados-pedido">
            <span>GARÇOM: ${ticket.garcomNome || 'Salão'}</span>
            <span>DATA: ${dataHoraStr.split(' ')[0]}</span>
          </div>
          ${ticket.clienteNome ? `<div style="text-align: left; font-size: 11px; margin-top: 2px;">CLIENTE: ${ticket.clienteNome}</div>` : ''}
        </div>

        <div class="itens-container">
          ${ticket.itens
            .map(
              (it) => `
            <div class="item-pedido">
              <div class="item-topo">
                <span class="item-qtd">${it.quantidade}x</span>
                <span class="item-nome">${it.nome}</span>
              </div>
              ${
                it.observacoes && this.config.destacarObservacoes
                  ? `<div class="item-obs">*** OBS: ${it.observacoes.toUpperCase()} ***</div>`
                  : ''
              }
              ${it.clienteNome ? `<div class="item-cliente">Pessoa: ${it.clienteNome}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>

        ${ticket.observacaoGeral ? `
          <div class="divisor"></div>
          <div style="font-size: 11px; font-weight: 900; background: #eee; padding: 4px;">
            OBS GERAL: ${ticket.observacaoGeral.toUpperCase()}
          </div>
        ` : ''}

        <div class="divisor-duplo"></div>
        <div class="rodape">
          TOTAL DE ITENS: ${ticket.itens.reduce((acc, i) => acc + i.quantidade, 0)}<br />
          EloGastrô • Produção Inteligente
        </div>
      </body>
      </html>
    `;

    this.dispararImpressaoIframe(html);
  }

  /**
   * Analisa um pedido recém-lançado e dispara a impressão de Cozinha e de Bar
   * de forma independente e automática caso as opções estejam ativas.
   */
  public imprimirTicketCozinhaEBar(pedido: {
    pedidoId: string;
    numeroPedido: number | string;
    tipo: 'mesa' | 'balcao' | 'delivery';
    mesaNumero?: number;
    clienteNome?: string;
    garcomNome?: string;
    dataHora?: string;
    observacaoGeral?: string;
    itens: ItemTicketImpressao[];
    nomeRestaurante?: string;
  }) {
    const nomeRestaurante = pedido.nomeRestaurante || 'EloGastrô';

    // 1. Separa itens de Bar e Cozinha
    const itensCozinha: ItemTicketImpressao[] = [];
    const itensBar: ItemTicketImpressao[] = [];

    pedido.itens.forEach((it) => {
      const ehBar =
        it.setorPreparo === 'bar' ||
        /chopp|cerveja|vinho|refrigerante|suco|drink|caipirinha|saquê|água|refri|lata|garrafa|vodka|gin|whisky|coquetel|red bull|energético/i.test(
          it.nome
        );

      if (ehBar) {
        itensBar.push({ ...it, setorPreparo: 'bar' });
      } else {
        itensCozinha.push({ ...it, setorPreparo: 'cozinha' });
      }
    });

    // 2. Dispara Cozinha
    if (this.config.impressaoAutomaticaCozinha && itensCozinha.length > 0) {
      this.imprimirTicketSetor(
        {
          ...pedido,
          setorAlvo: 'cozinha',
          itens: itensCozinha,
        },
        nomeRestaurante
      );
    }

    // 3. Dispara Bar com pequeno atraso para não engavetar o spooler
    if (this.config.impressaoAutomaticaBar && itensBar.length > 0) {
      setTimeout(() => {
        this.imprimirTicketSetor(
          {
            ...pedido,
            setorAlvo: 'bar',
            itens: itensBar,
          },
          nomeRestaurante
        );
      }, 350);
    }
  }

  /**
   * Imprime conferência de mesa (Pré-Conta) para o cliente no salão
   */
  public imprimirConferenciaMesa(dados: {
    mesaNumero: number;
    clienteNome?: string;
    garcomNome?: string;
    pessoas?: string[];
    itens: Array<{ nome: string; quantidade: number; precoUnitario: number; subtotal: number; clienteNome?: string }>;
    subtotal: number;
    taxaServico: number;
    couvertTotal: number;
    desconto: number;
    total: number;
    nomeRestaurante?: string;
  }) {
    const nomeRestaurante = dados.nomeRestaurante || 'EloGastrô';
    const dataHoraStr = new Date().toLocaleString('pt-BR');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Pré-Conta Mesa #${dados.mesaNumero}</title>
        <style>${this.gerarCssTermico()}</style>
      </head>
      <body>
        <div class="cabecalho">
          <div class="titulo-restaurante">${nomeRestaurante}</div>
          <div class="setor-badge">CONFERÊNCIA DE MESA</div>
          <div class="linha-destaque">MESA #${dados.mesaNumero}</div>
          <div class="dados-pedido">
            <span>DATA/HORA: ${dataHoraStr}</span>
          </div>
          <div class="dados-pedido">
            <span>GARÇOM: ${dados.garcomNome || 'Salão'}</span>
            ${dados.clienteNome ? `<span>CLIENTE: ${dados.clienteNome}</span>` : ''}
          </div>
        </div>

        <div class="itens-container">
          <div style="display: flex; justify-content: space-between; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px;">
            <span>QTD ITEM</span>
            <span>TOTAL (R$)</span>
          </div>
          ${dados.itens
            .map(
              (it) => `
            <div class="item-pedido" style="margin-bottom: 3px; padding-bottom: 2px;">
              <div class="item-topo">
                <span class="item-qtd">${it.quantidade}x</span>
                <span class="item-nome">${it.nome}</span>
                <span style="font-size: 12px; font-weight: 900; margin-left: 4px;">${it.subtotal.toFixed(2)}</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="totais-bloco">
          <div class="linha-total">
            <span>Subtotal dos Produtos:</span>
            <span>R$ ${dados.subtotal.toFixed(2)}</span>
          </div>
          ${
            dados.couvertTotal > 0
              ? `
          <div class="linha-total">
            <span>Couvert Artístico:</span>
            <span>R$ ${dados.couvertTotal.toFixed(2)}</span>
          </div>`
              : ''
          }
          ${
            dados.taxaServico > 0
              ? `
          <div class="linha-total">
            <span>Serviço Opcional (10%):</span>
            <span>R$ ${dados.taxaServico.toFixed(2)}</span>
          </div>`
              : `
          <div class="linha-total">
            <span>Serviço (10%):</span>
            <span>Isento</span>
          </div>`
          }
          ${
            dados.desconto > 0
              ? `
          <div class="linha-total" style="color: #c00;">
            <span>Desconto Concedido:</span>
            <span>- R$ ${dados.desconto.toFixed(2)}</span>
          </div>`
              : ''
          }
          <div class="linha-total-final">
            <span>TOTAL A PAGAR:</span>
            <span>R$ ${dados.total.toFixed(2)}</span>
          </div>
          ${
            dados.pessoas && dados.pessoas.length > 1
              ? `
          <div class="divisor"></div>
          <div style="text-align: center; font-size: 12px; font-weight: 900;">
            DIVIDIDO EM ${dados.pessoas.length} PESSOAS:<br />
            R$ ${(dados.total / dados.pessoas.length).toFixed(2)} por pessoa
          </div>`
              : ''
          }
        </div>

        <div class="divisor-duplo"></div>
        <div class="rodape">
          *** NÃO É DOCUMENTO FISCAL ***<br />
          Agradecemos a sua preferência! Volte sempre!
        </div>
      </body>
      </html>
    `;

    this.dispararImpressaoIframe(html);
  }

  /**
   * Imprime Comprovante de Fechamento de Comissões e Rateio do Garçom
   */
  public imprimirReciboComissao(dados: {
    fechamento: RegistroFechamentoComissao;
    garcomId?: string;
    nomeRestaurante?: string;
  }) {
    const nomeRestaurante = dados.nomeRestaurante || 'EloGastrô';
    const f = dados.fechamento;
    const garcomEspecifico = dados.garcomId
      ? f.garcons.find((g) => g.garcomId === dados.garcomId)
      : null;

    const listaGarcons = garcomEspecifico ? [garcomEspecifico] : f.garcons;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Recibo de Comissões e 10%</title>
        <style>${this.gerarCssTermico()}</style>
      </head>
      <body>
        <div class="cabecalho">
          <div class="titulo-restaurante">${nomeRestaurante}</div>
          <div class="setor-badge">FECHAMENTO DE GORJETAS (10%)</div>
          <div class="linha-destaque">${f.periodoDescricao.toUpperCase()}</div>
          <div class="dados-pedido">
            <span>DATA: ${f.dataFechamento}</span>
            <span>TIPO: ${f.modeloRateio === 'direto' ? 'DIRETO POR MESA' : 'RATEIO IGUALITÁRIO'}</span>
          </div>
          <div class="dados-pedido">
            <span>RETENÇÃO CASA: ${f.percentualRetencaoCasa}%</span>
            <span>RESP: ${f.criadoPor}</span>
          </div>
        </div>

        ${listaGarcons
          .map(
            (g) => `
          <div style="border: 2px solid #000; padding: 6px; margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px;">
              GARÇOM: ${g.garcomNome}
            </div>
            <div class="linha-total" style="margin-top: 4px;">
              <span>Mesas Atendidas:</span>
              <span>${g.mesasAtendidas} mesas</span>
            </div>
            <div class="linha-total">
              <span>Total Vendido:</span>
              <span>R$ ${g.totalVendido.toFixed(2)}</span>
            </div>
            <div class="linha-total">
              <span>10% Bruto Gerado:</span>
              <span>R$ ${g.taxaBrutaArrecadada.toFixed(2)}</span>
            </div>
            ${
              g.valorRetencaoCasa > 0
                ? `
            <div class="linha-total" style="font-size: 11px;">
              <span>Retenção Legal Encargos (${f.percentualRetencaoCasa}%):</span>
              <span>- R$ ${g.valorRetencaoCasa.toFixed(2)}</span>
            </div>`
                : ''
            }
            <div class="linha-total-final" style="margin-top: 4px;">
              <span>LÍQUIDO A RECEBER:</span>
              <span>R$ ${g.comissaoLiquida.toFixed(2)}</span>
            </div>
            <div style="margin-top: 18px; border-top: 1px dashed #000; padding-top: 4px; text-align: center; font-size: 10px;">
              Assinatura do Garçom: ___________________________<br />
              Data: ____/____/________
            </div>
          </div>
        `
          )
          .join('')}

        <div class="divisor-duplo"></div>
        <div class="rodape">
          TOTAL LÍQUIDO RATEADO: R$ ${f.totalLiquidoRateado.toFixed(2)}<br />
          EloGastrô • Gestão de Comissões e Equipe
        </div>
      </body>
      </html>
    `;

    this.dispararImpressaoIframe(html);
  }

  /**
   * Imprime teste de impressora térmica
   */
  public testarImpressora(setor: 'cozinha' | 'bar' | 'caixa', nomeRestaurante = 'EloGastrô') {
    const ticketTeste: TicketImpressao = {
      pedidoId: `teste_${Date.now()}`,
      numeroPedido: 999,
      tipo: 'mesa',
      mesaNumero: 10,
      clienteNome: 'Teste de Comunicação',
      garcomNome: 'Administrador',
      setorAlvo: setor,
      dataHora: new Date().toLocaleString('pt-BR'),
      itens:
        setor === 'bar'
          ? [
              { nome: 'Chopp Pilsen 500ml', quantidade: 2, observacoes: 'Bem Gelado com Colarinho' },
              { nome: 'Caipirinha de Limão com Cachaça', quantidade: 1, observacoes: 'Açúcar Demerara' },
            ]
          : [
              { nome: 'Hambúrguer Artesanal Smash Duplo', quantidade: 2, observacoes: 'Ponto Médio, Sem Picles' },
              { nome: 'Batata Frita Rústica com Cheddar', quantidade: 1, observacoes: 'Bacon Crocante à Parte' },
            ],
      observacaoGeral: 'IMPRESSÃO DE TESTE REALIZADA COM SUCESSO',
    };

    this.imprimirTicketSetor(ticketTeste, nomeRestaurante);
  }
}

export const impressaoTermicaService = new ImpressaoTermicaService();
