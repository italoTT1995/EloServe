import { useState, useEffect } from 'react';

export function useWindowFocus() {
  const [isFocused, setIsFocused] = useState<boolean>(document.hasFocus());
  const [lastBlurTime, setLastBlurTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
      document.title = '⚡ EloServe PDV — Ponto de Venda';
    };

    const handleBlur = () => {
      setIsFocused(false);
      setLastBlurTime(new Date());
      document.title = '⏸ (Fora de Foco) EloServe PDV';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsFocused(false);
        setLastBlurTime(new Date());
        document.title = '⏸ (Aba Oculta) EloServe PDV';
      } else {
        setIsFocused(true);
        document.title = '⚡ EloServe PDV — Ponto de Venda';
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isFocused, lastBlurTime };
}
