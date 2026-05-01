import type { AnyGem } from "@splendor/core";

export function gemColor(color: AnyGem | string): string {
  const map: Record<string, string> = {
    white: "#e2e8f0",
    blue: "#2563eb",
    green: "#16a34a",
    red: "#dc2626",
    black: "#101010",
    gold: "#eab308",
  };
  return map[color] ?? "#fff";
}
