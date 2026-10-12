// Gerado por scripts/generate-sounds.mjs — não edite à mão.
export const SOUND_SPRITE = {
  "popUp": [
    0,
    90
  ],
  "popDown": [
    150,
    90
  ],
  "pop": [
    300,
    60
  ],
  "like": [
    420,
    80
  ],
  "tick": [
    560,
    25
  ],
  "success": [
    645,
    180
  ]
} as const;

export type SoundName = keyof typeof SOUND_SPRITE;
