/**
 * Utilitário seguro para cópia de texto com fallbacks e tratamento de permissões
 */
export async function copiarParaAreaDeTransferencia(
  texto: string
): Promise<{ sucesso: boolean; metodo: 'clipboard' | 'execCommand' | 'prompt' }> {
  if (!texto) {
    return { sucesso: false, metodo: 'clipboard' };
  }

  // 1. Tenta API moderna navigator.clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto);
      return { sucesso: true, metodo: 'clipboard' };
    } catch (err) {
      console.warn('Falha na API Clipboard, tentando fallback execCommand:', err);
    }
  }

  // 2. Fallback para document.execCommand('copy') com textarea invisível
  try {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (ok) {
      return { sucesso: true, metodo: 'execCommand' };
    }
  } catch (err) {
    console.warn('Falha no fallback execCommand:', err);
  }

  // 3. Fallback final: prompt manual para o usuário copiar
  try {
    window.prompt('Copie o link abaixo utilizando Ctrl+C ou pressionando e segurando:', texto);
    return { sucesso: true, metodo: 'prompt' };
  } catch {
    return { sucesso: false, metodo: 'prompt' };
  }
}
