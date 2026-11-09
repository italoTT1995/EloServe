/**
 * Serviço de Gerenciamento de Impressão Térmica do EloServe PDV
 * Suporta bobinas de 58 mm e 80 mm para comandas, cozinha, delivery e comprovantes de caixa.
 */

export interface ConfiguracaoImpressaoTermica {
  habilitada: boolean;
  larguraPadrao: '58mm' | '80mm';
  imprimirAutomaticoAoFinalizar: boolean;
  viasCozinha: number;
  viasEntrega: number;
  viasCliente: number;
  incluirQrCodePix: boolean;
}

const CONFIG_PADRAO: ConfiguracaoImpressaoTermica = {
  habilitada: true,
  larguraPadrao: '80mm',
  imprimirAutomaticoAoFinalizar: false,
  viasCozinha: 1,
  viasEntrega: 1,
  viasCliente: 1,
  incluirQrCodePix: true,
};

const STORAGE_KEY = 'eloserve_config_impressao_termica';

class ImpressaoTermicaService {
  private config: ConfiguracaoImpressaoTermica = { ...CONFIG_PADRAO };

  constructor() {
    this.carregarConfiguracao();
  }

  public carregarConfiguracao(): ConfiguracaoImpressaoTermica {
    if (typeof window === 'undefined') return this.config;
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        this.config = { ...CONFIG_PADRAO, ...JSON.parse(salvo) };
      }
    } catch {
      this.config = { ...CONFIG_PADRAO };
    }
    return this.config;
  }

  public salvarConfiguracao(novaConfig: Partial<ConfiguracaoImpressaoTermica>): ConfiguracaoImpressaoTermica {
    this.config = { ...this.config, ...novaConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (err) {
        console.error('Erro ao persistir configurações de impressão:', err);
      }
    }
    return this.config;
  }

  public getConfig(): ConfiguracaoImpressaoTermica {
    return { ...this.config };
  }
}

export const impressaoTermicaService = new ImpressaoTermicaService();
