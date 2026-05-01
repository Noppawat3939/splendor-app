import type { AnyGem } from "@splendor/core";

// primary tone
export function gemColor(color: AnyGem | string): string {
  const map: Record<string, string> = {
    white: "#e2e8f0",
    blue: "#2563eb",
    green: "#16a34a",
    red: "#dc2626",
    black: "#2C2C2C",
    gold: "#eab308",
  };
  return map[color] ?? "#fff";
}

// secondary tone
export function gemColorSecondary(color: AnyGem | string): string {
  const map: Record<string, string> = {
    white: "#EEEEEE",
    blue: "#111FA2",
    green: "#468432",
    red: "#C40C0C",
    black: "#000000",
    gold: "#eab308",
  };
  return map[color] ?? "#fff";
}
