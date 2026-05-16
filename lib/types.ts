export type View = "home" | "flying" | "about" | "projects" | "skills" | "contact";

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
  motionIntensity: number; // 1..10
  soundEnabled: boolean;
};

export const DEFAULT_TWEAKS: Tweaks = {
  palette: "purple",
  sunburst: true,
  scanlines: true,
  grain: true,
  motionIntensity: 8,
  soundEnabled: true,
};
