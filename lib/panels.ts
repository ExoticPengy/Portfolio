import { FaBolt, FaEye, FaLeaf, FaTint } from "react-icons/fa";
import type { PanelData } from "./types";
import { PROJECTS } from "@/components/sections/Projects";
import { SKILLS } from "@/components/sections/Skills";

const skillCount = SKILLS.reduce((n, c) => n + c.items.length, 0);

export const PANELS: PanelData[] = [
  {
    id: "about", num: "01", label: "ABOUT", glyph: FaTint, hp: 150,
    strip: "CHARACTER · DEV × DATA SCIENTIST",
    attack: { name: "Ship It", desc: "products in production", value: "5+" },
    flavour: "Ship it, then make it better.",
    x: -380, y: -215, z: 100, ry: 16, rx: -3, delay: 0,
  },
  {
    id: "projects", num: "02", label: "PROJECTS", glyph: FaEye, hp: 120,
    strip: "STAGES CLEARED",
    attack: { name: "Full Clear", desc: "stages shipped", value: String(PROJECTS.length) },
    flavour: "Every stage shipped. A few still grinding.",
    x: 380, y: -215, z: 40, ry: -16, rx: -3, delay: 0.8,
  },
  {
    id: "skills", num: "03", label: "SKILLS", glyph: FaBolt, hp: 110,
    strip: `ABILITIES · ${SKILLS.length} CLASSES`,
    attack: { name: "Tech Stack", desc: "abilities learned", value: String(skillCount) },
    flavour: "Python and SQL at 90. Svelte still levelling.",
    x: -400, y: 235, z: 140, ry: 14, rx: 3, delay: 2.4,
  },
  {
    id: "contact", num: "04", label: "CONTACT", glyph: FaLeaf, hp: 90,
    strip: "CONNECT · REMOTE OK",
    attack: { name: "Open Channel", desc: "ways to reach me", value: "4" },
    flavour: "Replies faster than Quick Attack.",
    x: 400, y: 235, z: 60, ry: -14, rx: 3, delay: 1.6,
  },
];

export const TICKER_BITS = ["STARS · 27", "COINS · 99", "HI · 999K"];
