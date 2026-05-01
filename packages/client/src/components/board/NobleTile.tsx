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
import GemToken from "./GemToken";

const nobleImageMap: Record<string, string> = {
  "n-01": noble1,
  "n-02": noble2,
  "n-03": noble3,
  "n-04": noble4,
  "n-05": noble5,
  "n-06": noble6,
  "n-07": noble7,
  "n-08": noble8,
  "n-09": noble3,
  "n-10": noble1,
};

interface NobleTileProps {
  noble: Noble;
}

export default function NobleTile({ noble }: NobleTileProps) {
  const img = nobleImageMap[noble.id];

  const required = GEM_COLORS.filter((c) => noble.requirement[c] > 0);

  return (
    <div
      className="rounded-xl shrink-0 border-l border-b border-white/70 flex relative overflow-hidden pb-2 max-sm:pb-1
     flex-1 min-h-[220px] max-sm:min-h-[100px] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${img})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-gray-950/60 to-gray-600/10" />

      {/* content */}
      <div className="flex flex-col justify-between px-2 max-sm:px-1">
        <span className="font-serif [-webkit-text-stroke:0.6px_black] text-5xl max-sm:text-[18px] text-white font-bold-lg shrink-0 relative z-10">
          {noble.prestige}
        </span>

        {/* required card */}
        <div className="flex flex-col space-y-2 max-sm:space-y-1">
          {required.map((color, i) => (
            <div
              key={`${color}-${i}`}
              style={{ background: gemColor(color) }}
              className="w-full min-h-9 max-sm:min-h-2 rounded-sm flex relative items-center border-2 border-white max-sm:border shadow-inner justify-center z-10"
            >
              <span className="text-lg max-sm:text-xs max-sm:[-webkit-text-stroke:0.4px_black] [-webkit-text-stroke:0.8px_black] font-bold text-white">
                {noble.requirement[color]}
              </span>
              <span className="absolute -right-3 max-sm:hidden">
                <GemToken color={color} count={0} size={16} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
