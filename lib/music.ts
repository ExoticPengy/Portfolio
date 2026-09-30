// C major pentatonic over two octaves, semitones from C4. No half steps, so any walk sounds consonant.
export const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

// Next melody note: a random step of up to 2 scale degrees, bounced off the ends.
export function walk(i: number, rand: () => number): number {
  const j = i + Math.floor(rand() * 5) - 2;
  const last = SCALE.length - 1;
  return j < 0 ? -j : j > last ? 2 * last - j : j;
}
