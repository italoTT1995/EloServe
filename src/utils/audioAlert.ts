/**
 * Sintetizador Web Audio API nativo para alertas sonoros no PDV, KDS e Garçom Mobile
 * Funciona 100% offline sem necessidade de carregar arquivos MP3 externos.
 */

export function vibrarDispositivo(padrao: number[] = [200, 100, 200]) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(padrao);
    } catch {
      // Ignora se não houver suporte a vibração
    }
  }
}

/**
 * Sino clássico de Cozinha (Prato Pronto para o Garçom servir)
 * Tom duplo harmônico e cristalino (Frequências 1046.5Hz / C6 -> 1318.5Hz / E6)
 */
export function tocarSinoPratoPronto() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Primeiro toque do sino
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Segundo toque mais alto (ding!)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Áudio de prato pronto indisponível:', e);
  }

  // Vibra o celular do garçom em pulso duplo
  vibrarDispositivo([150, 80, 250]);
}

/**
 * Alerta sonoro quando um cliente solicita atendimento na mesa (Chamar Garçom)
 */
export function tocarAlertaChamadoMesa() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(784.0, ctx.currentTime); // G5
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.15); // C6
    osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.3); // E6
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch (e) {
    console.warn('Áudio de chamado indisponível:', e);
  }

  vibrarDispositivo([300, 100, 300]);
}

export function tocarAlertaTransbordo() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Primeiro tom (Ding - 880Hz / A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Segundo tom mais agudo (Dong - 1320Hz / E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.14);
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.14);
    osc2.stop(ctx.currentTime + 0.65);
  } catch (e) {
    console.warn('Áudio de alerta não inicializado pelo navegador:', e);
  }
}

export function tocarSomNovoPedido() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn('Áudio não inicializado:', e);
  }
}
