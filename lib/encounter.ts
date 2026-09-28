// Narrator line for items that come into view together, worded like a Pokémon double battle.
export function wildLine(names: string[]): string | undefined {
  if (names.length === 0) return undefined;
  if (names.length === 1) return `A wild ${names[0]} appeared!`;
  return `Wild ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} appeared!`;
}
