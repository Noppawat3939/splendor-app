import { AnyGem } from "@splendor/core";
import red from "../assets/red-gem.webp";
import green from "../assets/green-gem.webp";
import blue from "../assets/blue-gem.webp";
import white from "../assets/white-gem.webp";
import black from "../assets/brown-gem.webp";
import gold from "../assets/gold-gem.webp";

export function gemImageByColor(color: string | AnyGem) {
  const map: Record<string, string> = {
    white,
    green,
    blue,
    red,
    black,
    gold,
  };
  return map[color];
}
