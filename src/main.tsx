import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Limpeza de lançamento oficial: limpa qualquer dado residual de testes anteriores do navegador
try {
  if (typeof window !== 'undefined') {
    const sysVersion = 'eloserve_prod_v2_zero_testes';
    if (localStorage.getItem('eloserve_sys_version') !== sysVersion) {
      const keysToClear = Object.keys(localStorage).filter(
        (k) => k.startsWith('eloserve_') && k !== 'eloserve_theme_preference'
      );
      keysToClear.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('eloserve_sys_version', sysVersion);
    }
  }
} catch (e) {
  console.warn('Erro ao processar limpeza de cache inicial:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
