import React, { useState } from 'react';
import {
  Printer,
  X,
  Check,
  Settings,
  Sparkles,
  Volume2,
  FileText,
  ChefHat,
  Wine,
  Store,
  HelpCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { impressaoTermicaService } from '../../services/impressaoTermicaService';
import { ConfiguracaoImpressaoTermica } from '../../types';

interface ModalConfiguracaoImpressaoProps {
  isOpen: boolean;
  onClose: () => void;
  isWhite?: boolean;
  nomeRestaurante?: string;
}

export function ModalConfiguracaoImpressao({
  isOpen,
  onClose,
  isWhite = false,
  nomeRestaurante = 'EloGastrô',
}: ModalConfiguracaoImpressaoProps) {
  const [config, setConfig] = useState<ConfiguracaoImpressaoTermica>(() =>
    impressaoTermicaService.getConfig()
  );
  const [toastTeste, setToastTeste] = useState<string | null>(null);
  const [abaAjudaAberta, setAbaAjudaAberta] = useState(false);

  if (!isOpen) return null;

  function handleSalvar() {
    impressaoTermicaService.salvarConfiguracao(config);
    onClose();
  }

  function handleTestar(setor: 'cozinha' | 'bar' | 'caixa') {
    impressaoTermicaService.testarImpressora(setor, nomeRestaurante);
    setToastTeste(`Ticket de teste enviado para a impressora do ${setor.toUpperCase()}!`);
    setTimeout(() => setToastTeste(null), 4000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isWhite ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1E293B] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0F172A]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-black ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                  Configuração de Impressão Térmica
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  COZINHA & BAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impressão direta, silenciosa e separada por setores (80mm e 58mm)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isWhite ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback de Teste */}
        {toastTeste && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastTeste}</span>
          </div>
        )}

        {/* Body com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Largura da Bobina Térmica */}
          <div>
            <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${
              isWhite ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Formato e Largura do Papel Térmico
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, larguraPapel: '80mm' })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  config.larguraPapel === '80mm'
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] font-black shadow-md'
                    : isWhite
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-800 bg-[#0F172A] hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm">Padrão 80mm / 76mm</div>
                  <div className="text-[11px] opacity-75">Epson TM-T20, Bematech MP-4200, Elgin i9</div>
                </div>
                {config.larguraPapel === '80mm' && <Check className="w-4 h-4 text-[#FF6B00]" />}
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, larguraPapel: '58mm' })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  config.larguraPapel === '58mm'
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00] font-black shadow-md'
                    : isWhite
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-800 bg-[#0F172A] hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm">Mini 58mm / 54mm</div>
                  <div className="text-[11px] opacity-75">Impressoras compactas e maquininhas Smart</div>
                </div>
                {config.larguraPapel === '58mm' && <Check className="w-4 h-4 text-[#FF6B00]" />}
              </button>
            </div>
          </div>

          {/* Setores de Impressão */}
          <div className="space-y-3">
            <label className={`text-xs font-black uppercase tracking-wider block ${
              isWhite ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Automação por Setor de Produção
            </label>

            {/* Setor Cozinha */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Impressão Automática da Cozinha</span>
                    <span className="text-[11px] text-slate-400">
                      Dispara cupom de pratos quentes, porções e lanches ao lançar na mesa ou PDV
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestar('cozinha')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Play className="w-3 h-3 text-orange-400" />
                    <span>Testar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, impressaoAutomaticaCozinha: !config.impressaoAutomaticaCozinha })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.impressaoAutomaticaCozinha ? 'bg-[#FF6B00]' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        config.impressaoAutomaticaCozinha ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Setor Bar */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Wine className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Impressão Automática do Bar</span>
                    <span className="text-[11px] text-slate-400">
                      Dispara cupom de bebidas, drinks, chopps e sucos separadamente
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestar('bar')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Play className="w-3 h-3 text-purple-400" />
                    <span>Testar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, impressaoAutomaticaBar: !config.impressaoAutomaticaBar })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.impressaoAutomaticaBar ? 'bg-purple-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        config.impressaoAutomaticaBar ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Setor Caixa / Balcão */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Impressão do Caixa / Balcão</span>
                    <span className="text-[11px] text-slate-400">
                      Dispara cupom de conferência e comprovante de venda ao fechar contas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestar('caixa')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                      isWhite
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Testar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, impressaoAutomaticaCaixa: !config.impressaoAutomaticaCaixa })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.impressaoAutomaticaCaixa ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        config.impressaoAutomaticaCaixa ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferências Visuais e Sonoras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Destacar Observações (Sem cebola, etc)</span>
              </div>
              <input
                type="checkbox"
                checked={config.destacarObservacoes}
                onChange={(e) => setConfig({ ...config, destacarObservacoes: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
              />
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#0F172A] border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">Bip Sonoro de Confirmação</span>
              </div>
              <input
                type="checkbox"
                checked={config.beepSonoroAoImprimir}
                onChange={(e) => setConfig({ ...config, beepSonoroAoImprimir: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
              />
            </div>
          </div>

          {/* Dica Modo Kiosk Printing Silencioso */}
          <div className={`p-4 rounded-2xl border ${
            isWhite ? 'bg-orange-50/70 border-orange-200 text-slate-800' : 'bg-[#0F172A] border-orange-500/30 text-slate-300'
          }`}>
            <button
              type="button"
              onClick={() => setAbaAjudaAberta(!abaAjudaAberta)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#FF6B00] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Como ativar a Impressão 100% Silenciosa (Zero Diálogos)?</span>
              </div>
              <span>{abaAjudaAberta ? 'Ocultar' : 'Ver Instrução'}</span>
            </button>
            {abaAjudaAberta && (
              <div className="mt-3 text-xs space-y-2 leading-relaxed opacity-90 border-t pt-2 border-orange-200/50">
                <p>
                  Para o sistema imprimir na bobina térmica <strong>sem abrir nenhuma janela ou confirmação</strong> do Windows:
                </p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] bg-black/10 p-2.5 rounded-xl">
                  <li>Defina sua impressora térmica como a <strong>Impressora Padrão</strong> do Windows.</li>
                  <li>Crie um atalho do Google Chrome ou Edge na Área de Trabalho.</li>
                  <li>Nas Propriedades do Atalho, ao final do Destino, adicione: <code className="text-orange-600 font-bold">--kiosk-printing</code></li>
                  <li>Pronto! Ao abrir pelo atalho, qualquer comanda enviada sairá instantaneamente no papel sem intervenção humana.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-end gap-2.5 ${
          isWhite ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0F172A]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isWhite ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white font-bold text-xs shadow-lg shadow-[#FF6B00]/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Preferências de Impressão</span>
          </button>
        </div>
      </div>
    </div>
  );
}
