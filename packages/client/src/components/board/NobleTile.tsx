import type { Noble } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";
import noble1 from "../../assets/noble-1.webp";
import noble2 from "../../assets/noble-2.webp";
import noble3 from "../../assets/noble-3.webp";
import noble4 from "../../assets/noble-4.webp";
import noble5 from "../../assets/noble-5.webp";
import noble6 from "../../assets/noble-6.webp";
import noble7 from "../../assets/noble-7.webp";
import noble8 from "../../assets/noble-8.webp";
import noble9 from "../../assets/noble-9.webp";
import noble10 from "../../assets/noble-10.webp";

const nobleImageMap: Record<string, string> = {
  "n-01": noble1,
  "n-02": noble2,
  "n-03": noble3,
  "n-04": noble4,
  "n-05": noble5,
  "n-06": noble6,
  "n-07": noble7,
  "n-08": noble8,
  "n-09": noble9,
  "n-10": noble10,
};

interface NobleTileProps {
  noble: Noble;
}

export default function NobleTile({ noble }: NobleTileProps) {
  const img = nobleImageMap[noble.id];

  const required = GEM_COLORS.filter((c) => noble.requirement[c] > 0);

  return (
    <div
      className="rounded-xl shrink-0 border border-white/60 flex relative overflow-hidden flex-1 min-h-[220px] max-sm:min-h-[100px] transition-all duration-200 hover:translate-y-1"
      style={{
        background:
          "linear-gradient(135deg, #1c1107 0%, #2d1f0a 50%, #1c1107 100%)",
      }}
    >
      {/* background image */}
      {img && (
        <img
          src={img}
          alt="noble"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
      )}

      {/* content */}
      <div className="flex flex-col justify-between bg-white/25 pb-1 px-2 max-sm:px-1">
        <span className="font-serif [-webkit-text-stroke:0.6px_black] text-5xl max-sm:text-[18px] text-white font-bold-lg shrink-0 relative z-10">
          {noble.prestige}
        </span>

        {/* required card */}
        <div className="flex flex-col space-y-1">
          {required.map((color, i) => (
            <div
              key={`${color}-${i}`}
              style={{ background: gemColor(color) }}
              className="w-full min-h-9 max-sm:min-h-2 rounded-sm flex items-center justify-center z-10 shadow"
            >
              <span className="text-lg max-sm:text-xs max-sm:[-webkit-text-stroke:0.4px_black] [-webkit-text-stroke:0.8px_black] font-bold text-white">
                {noble.requirement[color]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
