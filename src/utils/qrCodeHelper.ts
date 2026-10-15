import QRCode from 'qrcode';

export interface DadosDisplayMesa {
  numero: number;
  setor: string;
  capacidade?: number;
  nomeRestaurante?: string;
  wifiNome?: string;
  wifiSenha?: string;
  qrDataUrl?: string;
  tenantId?: string;
}

/**
 * Retorna a URL real para acesso do cliente à mesa escaneada com isolamento do tenant
 */
export function getUrlMesaCliente(numero: number, setor?: string, tenantId?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5174';
  const params = new URLSearchParams();
  if (setor) params.set('setor', setor);
  if (tenantId) params.set('tenant', tenantId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return `${origin}/mesa/${numero}${query}`;
}

/**
 * Gera um DataURL (base64 PNG) com QR Code real de alta definição
 */
export async function gerarQrCodeMesaDataUrl(
  numero: number,
  setor?: string,
  tamanho = 600,
  tenantId?: string
): Promise<string> {
  const url = getUrlMesaCliente(numero, setor, tenantId);
  try {
    return await QRCode.toDataURL(url, {
      width: tamanho,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error(`Erro ao gerar QR Code para Mesa #${numero}:`, err);
    throw err;
  }
}

/**
 * Faz download do arquivo PNG do QR Code da mesa
 */
export function baixarQrCodeMesaPng(dataUrl: string, numeroMesa: number) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `eloserve-qrcode-mesa-${String(numeroMesa).padStart(2, '0')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Abre a janela de impressão com o Display de Mesa (totem acrílico / adesivo)
 */
export function imprimirDisplayMesaIndividual(dados: DadosDisplayMesa) {
  const popup = window.open('', '_blank', 'width=800,height=900');
  if (!popup) {
    alert('Por favor, permita pop-ups para imprimir o display da mesa.');
    return;
  }

  const nomeRestaurante = dados.nomeRestaurante || 'Restaurante EloServe';
  const wifiNome = dados.wifiNome || 'Cliente_Wifi';
  const wifiSenha = dados.wifiSenha || 'eloserve2026';
  const url = getUrlMesaCliente(dados.numero, dados.setor, dados.tenantId);

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Display de Mesa #${dados.numero} — ${nomeRestaurante}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background-color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .display-card {
          width: 380px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 28px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          page-break-inside: avoid;
        }
        .brand {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ea580c;
          margin-bottom: 4px;
        }
        .rest-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
        }
        .mesa-badge {
          display: inline-block;
          background: #0f172a;
          color: #ffffff;
          padding: 8px 24px;
          border-radius: 9999px;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .setor-badge {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .qr-wrapper {
          background: #ffffff;
          padding: 12px;
          border-radius: 20px;
          border: 3px solid #0f172a;
          display: inline-block;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .qr-image {
          width: 220px;
          height: 220px;
          display: block;
        }
        .instructions {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .sub-inst {
          font-size: 12px;
          color: #475569;
          margin-bottom: 18px;
          line-height: 1.4;
        }
        .steps {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
          padding-top: 14px;
          border-top: 1px dashed #cbd5e1;
        }
        .step-item {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
        }
        .step-icon {
          font-size: 16px;
          display: block;
          margin-bottom: 2px;
        }
        .wifi-box {
          background: #f1f5f9;
          border-radius: 14px;
          padding: 10px 14px;
          font-size: 11px;
          color: #334155;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-around;
        }
        .wifi-box strong {
          color: #0f172a;
        }
        .footer {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
        }
        .url-preview {
          font-size: 9px;
          color: #94a3b8;
          font-family: monospace;
          margin-top: 4px;
          word-break: break-all;
        }
        @media print {
          body { background: transparent; padding: 0; }
          .display-card {
            border: 1px solid #ccc;
            box-shadow: none;
            margin: auto;
          }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="display-card">
        <div class="brand">Cardápio Digital & Autoatendimento</div>
        <div class="rest-name">${nomeRestaurante}</div>

        <div class="mesa-badge">MESA #${dados.numero}</div>
        <div class="setor-badge">Setor: ${dados.setor || 'Salão'}</div>

        <div class="qr-wrapper">
          <img class="qr-image" src="${dados.qrDataUrl}" alt="QR Code Mesa #${dados.numero}" />
        </div>

        <div class="instructions">Aponte a câmera do seu celular</div>
        <div class="sub-inst">Abra o cardápio interativo, faça seus pedidos e chame o garçom sem filas!</div>

        <div class="steps">
          <div class="step-item"><span class="step-icon">📱</span>1. Escaneie</div>
          <div class="step-item"><span class="step-icon">🍔</span>2. Escolha</div>
          <div class="step-item"><span class="step-icon">🔔</span>3. Peça / Chame</div>
        </div>

        <div class="wifi-box">
          <span>Wi-Fi: <strong>${wifiNome}</strong></span>
          <span>Senha: <strong>${wifiSenha}</strong></span>
        </div>

        <div class="footer">EloServe • Sistema Inteligente para Restaurantes</div>
        <div class="url-preview">${url}</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `);
  popup.document.close();
}

/**
 * Imprime em lote displays de mesa para todas as mesas cadastradas (folhas A4 / 2 por folha)
 */
export async function imprimirTodosDisplaysMesas(
  mesas: { numero: number; setor: string; capacidade: number; tenantId?: string }[],
  nomeRestaurante = 'Restaurante EloServe',
  wifiNome = 'Cliente_Wifi',
  wifiSenha = 'eloserve2026',
  tenantId?: string
) {
  const popup = window.open('', '_blank', 'width=900,height=1000');
  if (!popup) {
    alert('Por favor, permita pop-ups para imprimir os displays das mesas.');
    return;
  }

  // Gera todos os QR codes em paralelo
  const mesasComQr = await Promise.all(
    mesas.map(async (m) => {
      const targetTenant = m.tenantId || tenantId;
      const qrDataUrl = await gerarQrCodeMesaDataUrl(m.numero, m.setor, 400, targetTenant);
      return {
        ...m,
        qrDataUrl,
        url: getUrlMesaCliente(m.numero, m.setor, targetTenant),
      };
    })
  );

  const htmlCards = mesasComQr
    .map(
      (m) => `
      <div class="display-card">
        <div class="brand">Cardápio Digital & Atendimento</div>
        <div class="rest-name">${nomeRestaurante}</div>

        <div class="mesa-badge">MESA #${m.numero}</div>
        <div class="setor-badge">Setor: ${m.setor} • Até ${m.capacidade} pessoas</div>

        <div class="qr-wrapper">
          <img class="qr-image" src="${m.qrDataUrl}" alt="QR Code Mesa #${m.numero}" />
        </div>

        <div class="instructions">Aponte a câmera do seu celular</div>
        <div class="sub-inst">Abra o cardápio interativo e faça seus pedidos diretamente na mesa.</div>

        <div class="wifi-box">
          <span>Wi-Fi: <strong>${wifiNome}</strong></span>
          <span>Senha: <strong>${wifiSenha}</strong></span>
        </div>

        <div class="footer">EloServe • Mesa #${m.numero}</div>
      </div>
    `
    )
    .join('');

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Lote de Displays de Mesas — ${nomeRestaurante}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background-color: #f8fafc;
          padding: 24px;
        }
        .header-print {
          text-align: center;
          margin-bottom: 24px;
        }
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .display-card {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          padding: 24px 20px;
          text-align: center;
          page-break-inside: avoid;
        }
        .brand {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #ea580c;
          margin-bottom: 2px;
        }
        .rest-name {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .mesa-badge {
          display: inline-block;
          background: #0f172a;
          color: #ffffff;
          padding: 6px 18px;
          border-radius: 9999px;
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .setor-badge {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .qr-wrapper {
          background: #ffffff;
          padding: 8px;
          border-radius: 16px;
          border: 2px solid #0f172a;
          display: inline-block;
          margin-bottom: 14px;
        }
        .qr-image {
          width: 170px;
          height: 170px;
          display: block;
        }
        .instructions {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .sub-inst {
          font-size: 10px;
          color: #475569;
          margin-bottom: 12px;
        }
        .wifi-box {
          background: #f1f5f9;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 10px;
          color: #334155;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-around;
        }
        .wifi-box strong {
          color: #0f172a;
        }
        .footer {
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }
        @media print {
          body { background: transparent; padding: 0; }
          .header-print { display: none; }
          .grid-cards { gap: 16px; }
          .display-card { border: 1px solid #ccc; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-print">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a;">Displays de Mesa para Impressão em Lote (${mesas.length} Mesas)</h2>
        <p style="font-size: 12px; color: #64748b;">Pronto para corte e inserção em totens acrílicos ou placas de mesa.</p>
      </div>

      <div class="grid-cards">
        ${htmlCards}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  popup.document.close();
}
