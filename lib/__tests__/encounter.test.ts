import { it, expect } from "vitest";
import { wildLine } from "@/lib/encounter";

it("names one, two or more wild encounters in one line", () => {
  expect(wildLine([])).toBeUndefined();
  expect(wildLine(["TIAN DI"])).toBe("A wild TIAN DI appeared!");
  expect(wildLine(["TIAN DI", "BINGO"])).toBe("Wild TIAN DI and BINGO appeared!");
  expect(wildLine(["A", "B", "C"])).toBe("Wild A, B and C appeared!");
});
