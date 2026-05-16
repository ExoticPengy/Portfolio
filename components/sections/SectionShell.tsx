import type { ReactNode } from "react";

type Props = {
  num: string;
  title: string;
  ghost?: string;
  onBack: () => void;
  children: ReactNode;
};

export default function SectionShell({ num, title, ghost, onBack, children }: Props) {
  return (
    <div className="section-inner">
      {ghost && <div className="section-ghost">{ghost}</div>}
      <div className="section-head reveal">
        <div>
          <div className="meta">STAGE {num} · NOW LOADED</div>
          <h1>{title}</h1>
        </div>
        <button className="back" onClick={onBack}>◀ BACK TO MENU</button>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
