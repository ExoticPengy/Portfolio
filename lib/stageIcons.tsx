import type { ReactNode } from "react";
import type { PanelData } from "./types";

// 1-bit pixel sprites on a 16x16 grid. fill=currentColor so CSS drives color.
const SPRITES: Record<PanelData["id"], ReactNode> = {
  // person
  about: (
    <>
      <rect x="6" y="2" width="4" height="4" />
      <rect x="5" y="7" width="6" height="1" />
      <rect x="4" y="8" width="8" height="6" />
    </>
  ),
  // controller
  projects: (
    <>
      <rect x="2" y="6" width="12" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="1" y="8" width="1" height="3" />
      <rect x="14" y="8" width="1" height="3" />
      <rect x="4" y="9" width="3" height="1" />
      <rect x="5" y="8" width="1" height="3" />
      <rect x="10" y="8" width="1" height="1" />
      <rect x="12" y="8" width="1" height="1" />
      <rect x="11" y="10" width="1" height="1" />
    </>
  ),
  // lightning bolt
  skills: (
    <>
      <rect x="8" y="2" width="3" height="4" />
      <rect x="6" y="6" width="5" height="2" />
      <rect x="5" y="8" width="6" height="2" />
      <rect x="6" y="10" width="3" height="4" />
    </>
  ),
  // envelope
  contact: (
    <>
      <rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M2 4 L8 9 L14 4" fill="none" stroke="currentColor" strokeWidth="1" />
    </>
  ),
};

export function StageIcon({ id, className }: { id: PanelData["id"]; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {SPRITES[id]}
    </svg>
  );
}
