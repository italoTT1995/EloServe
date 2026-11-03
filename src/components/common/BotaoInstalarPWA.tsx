import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function BotaoInstalarPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando em modo standalone (PWA instalado)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setInstalado(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalado(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (instalado || !deferredPrompt) {
    return null;
  }

  const handleInstalar = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalado(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <button
      onClick={handleInstalar}
      type="button"
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
      title="Instalar EloServe como aplicativo nativo no seu tablet ou computador"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Instalar App</span>
    </button>
  );
}
