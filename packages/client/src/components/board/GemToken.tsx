import type { AnyGem } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";
import red from "../../assets/red-gem.webp";
import green from "../../assets/green-gem.webp";
import blue from "../../assets/blue-gem.webp";
import white from "../../assets/white-gem.webp";
import black from "../../assets/brown-gem.webp";
import gold from "../../assets/gold-gem.webp";

interface GemTokenProps {
  color: AnyGem;
  count: number;
  size?: number;
}

const imageMap: Record<string, string> = {
  white,
  green,
  blue,
  red,
  black,
  gold,
};

export default function GemToken({ color, count, size = 44 }: GemTokenProps) {
  const outerBg = gemColor(color);
  const isLight = color === "white";

  const innerSize = size * 0.68;
  const imageSize = innerSize * 0.7;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* outer circle — gem color */}
      <div
        className="rounded-full flex items-center justify-center relative shadow-lg"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${lighten(
            outerBg
          )}, ${outerBg} 60%, ${darken(outerBg)})`,
          boxShadow: `0 2px 8px ${outerBg}88, inset 0 1px 2px rgba(255,255,255,0.3)`,
        }}
      >
        {/* shine */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.35,
            height: size * 0.2,
            top: size * 0.1,
            left: size * 0.18,
            background: "rgba(255,255,255,0.35)",
            filter: "blur(2px)",
            transform: "rotate(-20deg)",
          }}
        />

        {/* inner circle — nature bg */}
        <div
          className="rounded-full flex items-center justify-center relative overflow-hidden shadow-inner"
          style={{
            width: innerSize,
            height: innerSize,
            background: "#D9CFC7",
          }}
        >
          {/* image slot */}
          {imageMap[color] ? (
            <img
              src={imageMap[color]}
              alt={color}
              style={{
                width: imageSize,
                height: imageSize,
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ width: imageSize, height: imageSize }} />
          )}
        </div>

        {/* count badge */}
        {count > 0 && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-bold shadow"
            style={{
              width: size * 0.38,
              height: size * 0.38,
              fontSize: size * 0.2,
              background: isLight ? "#374151" : "white",
              color: isLight ? "white" : "#111",
            }}
          >
            {count}
          </div>
        )}
      </div>
    </div>
  );
}

function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + 60);
  const g = Math.min(255, ((n >> 8) & 0xff) + 60);
  const b = Math.min(255, (n & 0xff) + 60);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `rgb(${r},${g},${b})`;
}
