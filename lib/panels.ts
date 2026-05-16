import type { PanelData } from "./types";

export const PANELS: PanelData[] = [
  { id: "about",    num: "01", label: "ABOUT",    sub: "CHARACTER",      img: "portrait · 4:5",  glyph: "◆", x: -380, y: -215, z: 100, ry:  16, rx: -3, delay: 0    },
  { id: "projects", num: "02", label: "PROJECTS", sub: "STAGES CLEARED", img: "cover · 4:3",     glyph: "▲", x:  380, y: -215, z:  40, ry: -16, rx: -3, delay: 0.8  },
  { id: "skills",   num: "03", label: "SKILLS",   sub: "ABILITIES",      img: "matrix · 4:3",    glyph: "★", x: -400, y:  235, z: 140, ry:  14, rx:  3, delay: 2.4  },
  { id: "contact",  num: "04", label: "CONTACT",  sub: "CONNECT",        img: "channels · 4:3",  glyph: "◉", x:  400, y:  235, z:  60, ry: -14, rx:  3, delay: 1.6  },
];

export const TICKER_BITS = ["STARS · 27", "COINS · 99", "HI · 999K"];
