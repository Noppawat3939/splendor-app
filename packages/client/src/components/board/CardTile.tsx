import type { DevelopmentCard } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";

interface CardTileProps {
  card: DevelopmentCard;
  onClick?: () => void;
  disabled?: boolean;
  isReserved?: boolean;
  highlight?: boolean;
}

function cardBg(bonus: string): { bg: string; pattern: string } {
  const map: Record<string, { bg: string; pattern: string }> = {
    white: {
      bg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 1px, transparent 1px)",
    },
    blue: {
      bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #2563eb 100%)",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(219,234,254,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(219,234,254,0.4) 1px, transparent 1px)",
    },
    green: {
      bg: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #16a34a 100%)",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(220,252,231,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(220,252,231,0.4) 1px, transparent 1px)",
    },
    red: {
      bg: "linear-gradient(135deg, #ef4444 0%, #f87171 50%, #dc2626 100%)",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(254,226,226,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(254,226,226,0.4) 1px, transparent 1px)",
    },
    black: {
      bg: "linear-gradient(135deg, #374151 0%, #4b5563 50%, #1f2937 100%)",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(209,213,219,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(209,213,219,0.4) 1px, transparent 1px)",
    },
  };
  return map[bonus] ?? { bg: "#1e293b", pattern: "" };
}

export default function CardTile({
  card,
  onClick,
  disabled,
  isReserved,
  highlight,
}: CardTileProps) {
  const { pattern } = cardBg(card.bonus);

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
      rounded-lg p-2 flex flex-col justify-between
      border-2 transition-all relative overflow-hidden
      aspect-[2/3] w-full
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${isReserved ? "opacity-80" : ""}
    `}
      style={{
        background: "#000",
      }}
    >
      {/* pattern overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: pattern, backgroundSize: "8px 8px" }}
      />

      {/* bonus gem + prestige */}
      <div className="relative z-10 flex items-center justify-between">
        <div
          className="w-5 h-5 rounded-full border border-white/30"
          style={{ background: gemColor(card.bonus) }}
        />
        {card.prestige > 0 && (
          <span className="text-white font-bold text-sm drop-shadow">
            ★{card.prestige}
          </span>
        )}
      </div>

      {/* cost */}
      <div className="relative z-10 flex flex-col gap-0.5 mt-2">
        {GEM_COLORS.filter((c) => card.cost[c] > 0).map((color) => (
          <div key={color} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ background: gemColor(color) }}
            />
            <span className="text-xs text-white drop-shadow">
              {card.cost[color]}
            </span>
          </div>
        ))}
      </div>

      {/* reserve hint */}
      {highlight && (
        <div className="relative z-10 text-yellow-400 text-xs text-center mt-1">
          Reserve
        </div>
      )}
    </div>
  );
}
