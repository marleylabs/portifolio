// Sintetiza os efeitos sonoros do site em um único sprite WAV (mono, 16-bit).
// Sons próprios, gerados por código: sem licenças de terceiros.
// Uso: node scripts/generate-sounds.mjs
// Saída: public/sounds/sprite.wav + src/lib/sound-sprite.ts (mapa do sprite)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const GAP_MS = 60;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Envelope rápido de ataque + decaimento exponencial. */
function envelope(t, duration, attack = 0.004) {
  if (t < attack) return t / attack;
  return Math.exp(-((t - attack) / duration) * 6);
}

/** Tom com glide de frequência (o "pop" vem da subida/descida rápida). */
function tone({ from, to, duration, volume = 0.5, harmonics = [1, 0.25] }) {
  const length = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / length;
    const freq = from * Math.pow(to / from, Math.min(1, progress * 3));
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    let sample = 0;
    harmonics.forEach((amp, h) => {
      sample += amp * Math.sin(phase * (h + 1));
    });
    out[i] = sample * envelope(t, duration) * volume;
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function silence(ms) {
  return new Float32Array(Math.floor((SAMPLE_RATE * ms) / 1000));
}

const sounds = {
  // Bolha subindo: ativar algo (tema escuro, som ligado).
  popUp: tone({ from: 420, to: 880, duration: 0.09, volume: 0.45 }),
  // Bolha descendo: desativar algo.
  popDown: tone({ from: 760, to: 360, duration: 0.09, volume: 0.45 }),
  // "Pop" curto e encorpado: botões que afundam ao clicar.
  pop: tone({ from: 950, to: 260, duration: 0.06, volume: 0.55, harmonics: [1, 0.45, 0.2] }),
  // Curtida: "blip" brilhante; o site toca com pitch crescente (playbackRate) a cada clique.
  like: tone({ from: 520, to: 820, duration: 0.08, volume: 0.42, harmonics: [1, 0.3, 0.1] }),
  // Clique curto e seco para botões e links de destaque.
  tick: tone({ from: 1800, to: 1400, duration: 0.025, volume: 0.3, harmonics: [1] }),
  // Dois tons em sequência: confirmação (ex.: código copiado).
  success: concat(
    tone({ from: 660, to: 680, duration: 0.07, volume: 0.35 }),
    tone({ from: 990, to: 1000, duration: 0.11, volume: 0.35 }),
  ),
};

const sprite = {};
const chunks = [];
let cursorMs = 0;
for (const [name, samples] of Object.entries(sounds)) {
  const durationMs = Math.round((samples.length / SAMPLE_RATE) * 1000);
  sprite[name] = [cursorMs, durationMs];
  chunks.push(samples, silence(GAP_MS));
  cursorMs += durationMs + GAP_MS;
}

const data = concat(...chunks);
const buffer = Buffer.alloc(44 + data.length * 2);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + data.length * 2, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(data.length * 2, 40);
data.forEach((sample, i) => {
  const clamped = Math.max(-1, Math.min(1, sample));
  buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
});

mkdirSync(join(root, "public/sounds"), { recursive: true });
writeFileSync(join(root, "public/sounds/sprite.wav"), buffer);

const ts = `// Gerado por scripts/generate-sounds.mjs — não edite à mão.
export const SOUND_SPRITE = ${JSON.stringify(sprite, null, 2)} as const;

export type SoundName = keyof typeof SOUND_SPRITE;
`;
writeFileSync(join(root, "src/lib/sound-sprite.ts"), ts);

console.log(`sprite.wav: ${(buffer.length / 1024).toFixed(1)} KB`, sprite);
