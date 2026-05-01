import type { DevelopmentCard } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor, gemColorSecondary } from "../../utils/gemColor";
import { gemImageByColor } from "../../utils/gemImage";
import background from "../../assets/banner.webp";

interface CardTileProps {
  card: DevelopmentCard;
  onClick?: () => void;
  disabled?: boolean;
  isReserved?: boolean;
  highlight?: boolean;
}

export default function CardTile({
  card,
  onClick,
  disabled,
  isReserved,
  highlight,
}: CardTileProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
      rounded-lg flex flex-col justify-between relative
      transition-all overflow-hidden
      aspect-[2/3] w-full bg-cover bg-no-repeat bg-center shadow-2xl border border-white/20 duration-200 hover:-translate-y-1
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${isReserved ? "opacity-80" : ""}
    `}
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-gray-950/70 to-sky-400/20" />

      <div className="flex flex-col justify-between flex-1">
        {/* bonus gem + prestige */}
        <div className="flex items-center justify-between mt-0 z-10">
          {card.prestige > 0 && (
            <span
              className="text-white [-webkit-text-stroke:0.8px_black] max-sm:[-webkit-text-stroke:0.4px_black] font-bold text-sm drop-shadow px-1 w-4 ml-1 pb-1 rounded-bl rounded-br  border-b border-l border-white/60"
              style={{ backgroundColor: gemColorSecondary(card.bonus) }}
            >
              {card.prestige}
            </span>
          )}

          <div
            className="w-6 h-6 rounded-full flex justify-center items-center overflow-hidden border-2 shadow mt-1 mr-1"
            style={{
              background: gemColor(card.bonus),
              borderColor: gemColor(card.bonus),
            }}
          >
            <span
              aria-label="inner"
              className="w-full h-full flex justify-center items-center bg-[#FFCE99]"
            >
              <img
                src={gemImageByColor(card.bonus)}
                alt="gem"
                width={17}
                height={17}
                className="bg-contain"
              />
            </span>
          </div>
        </div>

        {/* cost */}
        <div className="relative z-10 flex flex-col gap-0.5 mt-2 pl-1 pb-1">
          {GEM_COLORS.filter((c) => card.cost[c] > 0).map((color) => (
            <div key={color} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-white/20 flex justify-center items-center"
                style={{ background: gemColor(color) }}
              >
                <span className="text-xs text-white drop-shadow [-webkit-text-stroke:0.8px_black] max-sm:[-webkit-text-stroke:0.4px_black]">
                  {card.cost[color]}
                </span>
              </div>
            </div>
          ))}
        </div>
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
