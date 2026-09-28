import { it, expect } from "vitest";
import { notify, getToasts } from "@/hooks/useAchievements";

// Queued toasts render in one slot; only a new key restarts the fade-out animation.
it("gives every toast its own id, even with the same text", () => {
  notify("A");
  notify("A");
  const [a, b] = getToasts();
  expect(a.id).not.toBe(b.id);
});
