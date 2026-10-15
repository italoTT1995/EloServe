import { useState, useEffect } from 'react';
import { gerarQrCodeMesaDataUrl } from '../../utils/qrCodeHelper';

interface MesaQRCodeThumbnailProps {
  numero: number;
  setor: string;
  size?: number;
  tenantId?: string;
  onClick?: () => void;
}

export function MesaQRCodeThumbnail({ numero, setor, size = 48, tenantId, onClick }: MesaQRCodeThumbnailProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let ativo = true;
    gerarQrCodeMesaDataUrl(numero, setor, 200, tenantId)
      .then((url) => {
        if (ativo) setDataUrl(url);
      })
      .catch((err) => console.error('Erro ao gerar thumbnail QR:', err));

    return () => {
      ativo = false;
    };
  }, [numero, setor, tenantId]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size + 8, height: size + 8 }}
        className="rounded-xl bg-slate-800 animate-pulse flex items-center justify-center shrink-0 border border-slate-700"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 bg-white rounded-xl shadow-md border border-slate-200 hover:border-orange-500 hover:scale-105 transition-all cursor-pointer shrink-0 group relative"
      title={`QR Code Real da Mesa #${numero} — Clique para ampliar / imprimir`}
    >
      <img
        src={dataUrl}
        alt={`QR Code Mesa #${numero}`}
        style={{ width: size, height: size }}
        className="block rounded-md"
      />
      <div className="absolute inset-0 bg-orange-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
        <span className="text-[8px] bg-slate-950 text-white font-bold px-1 rounded shadow">
          AMPLIAR
        </span>
      </div>
    </button>
  );
}
