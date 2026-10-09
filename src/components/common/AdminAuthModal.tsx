import { useState } from 'react';
import { ShieldAlert, Lock, X, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
}

export function AdminAuthModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Esta ação exige privilégios de Administrador',
}: AdminAuthModalProps) {
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState(false);
  const { validarPinAdmin } = useAppStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarPinAdmin(pin)) {
      setErro(false);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setErro(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Autorização de Administrador</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{actionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">
              Digite o PIN do Gerente/Admin:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErro(false);
                }}
                placeholder="PIN (padrão: 1234)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            {erro && (
              <p className="text-xs text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                PIN incorreto! Verifique com o administrador.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!pin}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Autorizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
