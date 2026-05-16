"use client";

import type { Ref } from "react";

type Props = {
  flashRef: Ref<HTMLDivElement>;
  streakRef: Ref<HTMLDivElement>;
};

export default function FxOverlays({ flashRef, streakRef }: Props) {
  return (
    <>
      <div className="streak" ref={streakRef} />
      <div className="flash" ref={flashRef} />
    </>
  );
}
