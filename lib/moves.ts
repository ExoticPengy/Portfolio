// Iconic Pokemon move pools and type-color mapping.

export interface MovePool {
  moves: string[];
  primaryType: string;
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

const MOVE_POOLS: Record<string, MovePool> = {
  pikachu: {
    moves: ["Thunderbolt", "Volt Tackle", "Electro Ball"],
    primaryType: "electric",
  },
  // Kanto fire chain
  charmander: {
    moves: ["Flamethrower", "Fire Spin", "Ember"],
    primaryType: "fire",
  },
  charmeleon: {
    moves: ["Flamethrower", "Fire Spin", "Ember"],
    primaryType: "fire",
  },
  charizard: {
    moves: ["Flamethrower", "Fire Spin", "Ember"],
    primaryType: "fire",
  },
  // Kanto water chain
  squirtle: {
    moves: ["Hydro Pump", "Surf", "Aqua Tail"],
    primaryType: "water",
  },
  wartortle: {
    moves: ["Hydro Pump", "Surf", "Aqua Tail"],
    primaryType: "water",
  },
  blastoise: {
    moves: ["Hydro Pump", "Surf", "Aqua Tail"],
    primaryType: "water",
  },
  // Kanto grass chain
  bulbasaur: {
    moves: ["Vine Whip", "Razor Leaf", "Solar Beam"],
    primaryType: "grass",
  },
  ivysaur: {
    moves: ["Vine Whip", "Razor Leaf", "Solar Beam"],
    primaryType: "grass",
  },
  venusaur: {
    moves: ["Vine Whip", "Razor Leaf", "Solar Beam"],
    primaryType: "grass",
  },
  piplup: {
    moves: ["Bubble Beam", "Whirlpool", "Aqua Jet"],
    primaryType: "water",
  },
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? TYPE_COLORS.normal;
}

export function getPool(name: string): MovePool {
  const key = name.toLowerCase();
  return MOVE_POOLS[key] ?? { moves: [...GENERIC_MOVES], primaryType: "normal" };
}

export function pickRandomMove(pool: MovePool): string {
  return pool.moves[Math.floor(Math.random() * pool.moves.length)];
}
