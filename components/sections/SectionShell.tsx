"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSeen } from "@/hooks/useSeen";
import Narrator, { type Line } from "../Narrator";

type Props = {
  num: string;
  title: string;
  ghost?: string;
  line: string; // narrator line on arrival; a change is said again (Projects: the detail view)
  onBack: () => void;
  children: ReactNode;
  overlay?: ReactNode;
};

export default function SectionShell({ num, title, ghost, line, onBack, children, overlay }: Props) {
  const [said, setSaid] = useState<Line | null>(null);
  const say = useCallback((text: string) => setSaid((p) => ({ text, n: (p?.n ?? 0) + 1 })), []);
  useEffect(() => { say(line); }, [line, say]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useSeen(scrollRef, say);

  return (
    // The CRT screen. .section-view around it is the bezel; .crt-scroll is the scroll container.
    <div className="crt">
      <div className="crt-scroll" ref={scrollRef}>
        <div className="section-inner">
          {ghost && <div className="section-ghost">{ghost}</div>}
          {overlay}
          <div className="section-head reveal">
            <div>
              <div className="meta">STAGE {num} · NOW LOADED</div>
              <h1>{title}</h1>
            </div>
            <button className="back" onClick={onBack}>◀ BACK TO MENU</button>
          </div>
          <div className="section-body">{children}</div>
        </div>
      </div>
      <Narrator line={said} />
    </div>
  );
}
