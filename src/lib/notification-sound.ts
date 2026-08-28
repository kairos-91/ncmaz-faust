let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  return audioCtx;
}

// Los navegadores bloquean el audio hasta que el usuario interactúa con la
// página al menos una vez; se llama en el primer click/touch del admin para
// que el AudioContext quede listo antes de que llegue un pedido.
export function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

// Campanita sintetizada con Web Audio — tres parciales inarmónicos (como una
// campana real) más un compresor para subir el volumen percibido sin que se
// distorsione, y un segundo "din-don" para que se note más. No depende de
// ningún archivo de audio externo.
export function playNotificationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);

    const ring = (startAt: number) => {
      // Frecuencias altas y caída rápida con un ligero deslizamiento hacia
      // abajo en el tono — así suena como un "tilín" brillante y corto en
      // vez de un zumbido largo.
      const partials: Array<[freq: number, peak: number, decay: number]> = [
        [3136, 0.9, 0.55],
        [5000, 0.5, 0.35],
        [7040, 0.3, 0.22],
      ];
      partials.forEach(([freq, peak, decay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startAt);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.93, startAt + decay);
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(peak, startAt + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + decay);
        osc.connect(gain);
        gain.connect(compressor);
        osc.start(startAt);
        osc.stop(startAt + decay + 0.05);
      });
    };

    const now = ctx.currentTime;
    ring(now);
    ring(now + 0.24);
  } catch {
    // Web Audio bloqueado por el navegador — no interrumpe el resto del flujo.
  }
}
