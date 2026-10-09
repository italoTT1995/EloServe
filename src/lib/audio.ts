// Web Audio API Synthesizer para alertas do PDV (sem depender de arquivos externos)
class AudioManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Beep agradável ao bipar/adicionar item no PDV
  tocarBipItem() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // Sobe rápido

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignora erro de áudio silenciosamente
    }
  }

  // Alerta sonoro quando novo pedido chega ou mesa chama garçom
  tocarAlertaNotificacao() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const agora = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.1);

        gain.gain.setValueAtTime(0.15, agora + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.1 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(agora + idx * 0.1);
        osc.stop(agora + idx * 0.1 + 0.2);
      });
    } catch {
      // Ignora erro de áudio silenciosamente
    }
  }

  // Som harmônico agradável ao finalizar a venda com sucesso
  tocarSucessoVenda() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const agora = ctx.currentTime;
      // Tríade maior ascendente (Dó - Mi - Sol - Dó oitava)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.08);

        gain.gain.setValueAtTime(0.12, agora + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(agora + idx * 0.08);
        osc.stop(agora + idx * 0.08 + 0.3);
      });
    } catch {
      // Silencioso
    }
  }
}

export const audio = new AudioManager();
