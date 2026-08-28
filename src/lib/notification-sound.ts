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

// Ruido blanco de un instante, filtrado, para simular el golpe mecánico de
// la palanca de una caja registradora (no depende de ningún audio externo).
function playRegisterClunk(
  ctx: AudioContext,
  destination: AudioNode,
  startAt: number,
) {
  const duration = 0.07;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1100;
  bandpass.Q.value = 1.1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  noise.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(destination);
  noise.start(startAt);
  noise.stop(startAt + duration);
}

function playRegisterBell(
  ctx: AudioContext,
  destination: AudioNode,
  startAt: number,
) {
  const partials: Array<[freq: number, peak: number, decay: number]> = [
    [2637, 0.85, 0.5],
    [3729, 0.5, 0.38],
    [4978, 0.3, 0.26],
  ];
  partials.forEach(([freq, peak, decay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + decay);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(startAt);
    osc.stop(startAt + decay + 0.05);
  });
}

// "Cha-ching" de caja registradora sintetizado con Web Audio: el golpe de
// la palanca (ruido filtrado) seguido de dos timbrazos metálicos. No
// depende de ningún archivo de audio externo.
export function playNotificationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  try {
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);

    const now = ctx.currentTime;
    playRegisterClunk(ctx, compressor, now);
    playRegisterBell(ctx, compressor, now + 0.06);
    playRegisterBell(ctx, compressor, now + 0.3);
  } catch {
    // Web Audio bloqueado por el navegador — no interrumpe el resto del flujo.
  }
}
