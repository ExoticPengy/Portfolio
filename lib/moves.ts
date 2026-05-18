// PokeAPI move-pool fetcher, type-color mapping, and fallback data.

export interface MovePool {
  moves: string[];
  primaryType: string;
}

interface PokeAPIPokemon {
  types: { type: { name: string } }[];
  moves: {
    move: { name: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
}

const TYPE_COLORS: Record<string, string> = {
  electric: "#FFD700",
  fire: "#FF4500",
  water: "#4169E1",
  grass: "#32CD32",
  poison: "#A040A0",
  normal: "#C8C8C8",
  flying: "#A890F0",
  bug: "#A8B820",
  ground: "#E0C068",
  rock: "#B8A038",
  ice: "#98D8D8",
  psychic: "#F85888",
  dragon: "#7038F8",
  ghost: "#705898",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  fighting: "#C03028",
};

const GENERIC_MOVES = ["Tackle", "Growl", "Swift", "Slam", "Take Down"];

const FALLBACK_POOLS: Record<string, MovePool> = {
  pikachu: { moves: ["Thunderbolt", "Quick Attack", "Iron Tail", "Electro Ball", "Thunder Wave"], primaryType: "electric" },
  charmander: { moves: ["Flamethrower", "Scratch", "Ember", "Fire Fang", "Slash"], primaryType: "fire" },
  squirtle: { moves: ["Water Gun", "Bite", "Rapid Spin", "Water Pulse", "Skull Bash"], primaryType: "water" },
  bulbasaur: { moves: ["Vine Whip", "Razor Leaf", "Seed Bomb", "Tackle", "Sleep Powder"], primaryType: "grass" },
  piplup: { moves: ["Bubble Beam", "Peck", "Water Pulse", "Drill Peck", "Whirlpool"], primaryType: "water" },
};

const cache = new Map<string, MovePool>();
const pending = new Map<string, Promise<MovePool>>();

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? TYPE_COLORS.normal;
}

export function getFallbackPool(name: string): MovePool {
  const key = name.toLowerCase();
  return FALLBACK_POOLS[key] ?? { moves: [...GENERIC_MOVES], primaryType: "normal" };
}

export async function fetchMovePool(name: string): Promise<MovePool> {
  const key = name.toLowerCase();

  const cached = cache.get(key);
  if (cached) return cached;

  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
      if (!res.ok) throw new Error(`PokeAPI returned ${res.status}`);
      const data: PokeAPIPokemon = await res.json();

      const levelUpMoves = data.moves
        .filter((m) =>
          m.version_group_details.some(
            (d) => d.move_learn_method.name === "level-up"
          )
        )
        .map((m) =>
          m.move.name
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        );

      const primaryType = data.types[0]?.type.name ?? "normal";

      const pool: MovePool = {
        moves: levelUpMoves.length > 0 ? levelUpMoves : getFallbackPool(key).moves,
        primaryType,
      };

      cache.set(key, pool);
      return pool;
    } catch {
      const fallback = getFallbackPool(key);
      // Don't cache failures — retry on next click
      return fallback;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, promise);
  return promise;
}

export function pickRandomMove(pool: MovePool): string {
  return pool.moves[Math.floor(Math.random() * pool.moves.length)];
}

export function clearMoveCache(): void {
  cache.clear();
  pending.clear();
}

export function preloadAllPools(names: string[]): Promise<MovePool[]> {
  return Promise.all(names.map(fetchMovePool));
}
