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

  // Alerta sonoro duplo característico de chamada de WhatsApp / Transbordo Humano
  tocarAlertaTransbordo() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const agora = ctx.currentTime;
      // Tom 1 (Ding)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, agora);
      gain1.gain.setValueAtTime(0.18, agora);
      gain1.gain.exponentialRampToValueAtTime(0.001, agora + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(agora);
      osc1.stop(agora + 0.35);

      // Tom 2 (Dong - mais agudo)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, agora + 0.14);
      gain2.gain.setValueAtTime(0.22, agora + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, agora + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(agora + 0.14);
      osc2.stop(agora + 0.65);
    } catch {
      // Silencioso
    }
  }

  // Som de clique sutil/confirmação ao ticar item no KDS da cozinha
  tocarCheckItem() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.10, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Silencioso
    }
  }
}

export const audio = new AudioManager();
