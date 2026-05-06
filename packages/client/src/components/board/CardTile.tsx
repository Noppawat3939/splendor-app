import type { DevelopmentCard } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";
import cardBackgroundBlue from "../../assets/card-background-blue.webp";
import cardBackgroundRed from "../../assets/card-background-red.webp";
import cardBackgroundGreen from "../../assets/card-background-green.webp";
import cardBackgroundBlack from "../../assets/card-background-black.webp";
import cardBackgroundWhite from "../../assets/card-background-white.webp";

import GemToken from "./GemToken";
import { ScreenSize } from "../../hooks/use-get-screen-size";
import { useMemo } from "react";

interface CardTileProps {
  card: DevelopmentCard;
  onClick?: () => void;
  disabled?: boolean;
  isReserved?: boolean;
  highlight?: boolean;
  screenSize: ScreenSize;
}

const cardTileImageMap: Record<string, string> = {
  black: cardBackgroundBlack,
  blue: cardBackgroundBlue,
  green: cardBackgroundGreen,
  red: cardBackgroundRed,
  white: cardBackgroundWhite,
};

export default function CardTile({
  card,
  onClick,
  disabled,
  isReserved,
  highlight,
  screenSize,
}: CardTileProps) {
  const { isMobile, isTablet } = useMemo(() => {
    return {
      isMobile: screenSize === "mobile",
      isTablet: screenSize === "tablet",
    };
  }, [screenSize]);

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
      rounded-lg flex flex-col justify-between relative
      transition-all overflow-hidden
      aspect-[2/3] w-full bg-cover bg-no-repeat bg-center shadow-2xl border-white/30 border-l border-b duration-300 hover:-translate-y-1 hover:border-b-2 
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${isReserved ? "opacity-80" : ""}
      ${highlight ? "hover:border-yellow-300/70" : ""}
    `}
      style={{ backgroundImage: `url(${cardTileImageMap[card.bonus]})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-gray-950/60 to-gray-900/10" />

      <div className="flex flex-col justify-between flex-1 p-2 max-sm:p-1">
        {/* bonus gem + prestige */}
        <div className="flex items-center justify-between mt-0 z-10">
          {card.prestige > 0 ? (
            <span
              className={`text-white font-bold drop-shadow w-fit font-serif
              ${
                isMobile
                  ? "text-[16px] [-webkit-text-stroke:0.4px_black]"
                  : "text-[3rem] [-webkit-text-stroke:1.5px_black]"
              }`}
              style={{ lineHeight: 0 }}
            >
              {card.prestige}
            </span>
          ) : (
            <span />
          )}
          <GemToken
            color={card.bonus}
            count={0}
            size={isMobile ? 16 : isTablet ? 28 : 40}
          />
        </div>

        {/* cost */}
        <div className="relative z-10 flex flex-col gap-0.5">
          {GEM_COLORS.filter((c) => card.cost[c] > 0).map((color) => (
            <div key={color} className="flex items-center gap-1">
              <div
                className={`
                ${isMobile ? "w-4 h-4" : "w-10 h-10"}
                relative rounded-full shadow-inner border-2 max-sm:border border-white/80 flex justify-center items-center`}
                style={{ background: gemColor(color) }}
              >
                <span
                  className="text-2xl font-black max-sm:text-xs text-white drop-shadow
                 [-webkit-text-stroke:0.8px_black] max-sm:[-webkit-text-stroke:0.4px_black]"
                >
                  {card.cost[color]}
                </span>
                <span className="absolute -right-3 max-sm:hidden">
                  <GemToken color={color} count={0} size={22} />
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
