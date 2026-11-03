import React, { useState } from 'react';
import { MessageSquare, Copy, Check, X, Smartphone, ExternalLink, QrCode } from 'lucide-react';
import { DadosReciboDigital, gerarTextoReciboWhatsApp, abrirWhatsAppRecibo } from '../../utils/whatsappReciboHelper';

interface ModalReciboWhatsAppProps {
  dados: DadosReciboDigital;
  onClose: () => void;
}

export function ModalReciboWhatsApp({ dados, onClose }: ModalReciboWhatsAppProps) {
  const [telefone, setTelefone] = useState('');
  const [chavePix, setChavePix] = useState(dados.chavePix || dados.nomeRestaurante.toLowerCase().replace(/\s+/g, '') + '@pix.com');
  const [copiado, setCopiado] = useState(false);

  const dadosComPix = {
    ...dados,
    chavePix: chavePix.trim() || undefined,
  };

  const textoRecibo = gerarTextoReciboWhatsApp(dadosComPix);

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoRecibo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    abrirWhatsAppRecibo(telefone, textoRecibo);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Extrato Digital via WhatsApp
              </h3>
              <p className="text-[11px] text-slate-400">
                Envio imediato da conta sem uso de papel ou impressora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações da Mesa e Total */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destinatário:</span>
            <span className="text-xs font-bold text-white">
              {dados.mesaNumero ? `Mesa #${dados.mesaNumero}` : 'Venda Direta'}
              {dados.clienteNome && ` • ${dados.clienteNome}`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total a Pagar:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              R$ {dados.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Formulário de Envio */}
        <form onSubmit={handleEnviar} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              WhatsApp do Cliente (com DDD):
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="(DDD) 99999-9999 ou deixe vazio para escolher no WhatsApp"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * Se deixar o campo em branco, o WhatsApp abrirá para você selecionar o contato na hora.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Chave PIX do Estabelecimento:
            </label>
            <input
              type="text"
              placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Pré-visualização do texto */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-400">Prévia da Mensagem:</span>
              <button
                type="button"
                onClick={handleCopiar}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Texto Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl max-h-40 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap select-text custom-scrollbar">
              {textoRecibo}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopiar}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? 'Copiado!' : 'Copiar Extrato'}</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir no WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
