export type View = "home" | "flying" | "about" | "projects" | "skills" | "contact";

export interface ProjectData {
  num: string;
  title: string;
  desc: string;
  tags: string[];
  img: string;
  github?: string;
  live?: string;
  favicon?: string;
  involvements?: string[];
}

export type PaletteName =
  | "purple"
  | "purple-gold"
  | "purple-lime"
  | "arcade"
  | "cyan"
  | "acid"
  | "orange"
  | "mono"
  | "magenta";

export type PanelData = {
  id: Exclude<View, "home" | "flying">;
  num: string;
  label: string;
  sub: string;
  img: string;
  glyph: string;
  x: number;
  y: number;
  z: number;
  ry: number;
  rx: number;
  delay: number;
};

export type Tweaks = {
  palette: PaletteName;
  sunburst: boolean;
  scanlines: boolean;
  grain: boolean;
  motionIntensity: number; // 0..10
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;   // 0..10
  musicVolume: number; // 0..10
  shiny: boolean; // konami easter egg
};

export const DEFAULT_TWEAKS: Tweaks = {
  palette: "purple",
  sunburst: true,
  scanlines: true,
  grain: true,
  motionIntensity: 8,
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 8,
  musicVolume: 3,
  shiny: false,
};
