import type { Player } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";
import CardTile from "../board/CardTile";
import GemToken from "../board/GemToken";
import { useMemo } from "react";
import { ScreenSize } from "../../hooks/use-get-screen-size";

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  onBuyReserved: (cardId: string) => void;
  onReserve: (cardId: string) => void;
  screenSize: ScreenSize;
}

export default function PlayerPanel({
  isActive,
  screenSize,
  onBuyReserved,
  onReserve,
  player,
}: PlayerPanelProps) {
  const tokensCount = useMemo(
    () => Object.values(player.tokens).reduce((a, c) => c + a, 0),
    [player.tokens]
  );

  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 flex w-full flex-col gap-3 ${
        isActive ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2 items-center">
          <p className="font-bold">{player.name}</p>
          {isActive && <p className=" text-yellow-400">- Turn</p>}
        </div>
        <p className="text-yellow-400 font-bold text-xl">★ {player.prestige}</p>
      </div>

      {/* Tokens */}
      <div>
        <p className="text-xs text-gray-400 mb-1">{`Tokens - (${tokensCount})`}</p>
        <div className="flex gap-2 flex-wrap">
          {([...GEM_COLORS, "gold"] as const).map((color, i) => {
            if (player.tokens[color] === 0) {
              return <div key={i} className="h-16 max-sm:h-8" />;
            }
            return (
              <GemToken
                key={color}
                color={color}
                count={player.tokens[color]}
                // size={screenSize=== "mobile" ? 32  ? screenSize === "tablet" ?  : 64}
              />
            );
          })}
        </div>
      </div>

      {/* Bonuses from cards */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Bonuses</p>
        <div className="flex gap-2 flex-wrap">
          {GEM_COLORS.filter((c) => player.bonuses[c] > 0).map((color) => (
            <div key={color} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: gemColor(color) }}
              />
              <span className="text-xs text-gray-200">
                +{player.bonuses[color]}
              </span>
            </div>
          ))}
          {GEM_COLORS.every((c) => player.bonuses[c] === 0) && (
            <p className="text-xs text-gray-500">None yet</p>
          )}
        </div>
      </div>

      {/* Reserved cards */}
      {player.reservedCards.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">
            Reserved ({player.reservedCards.length}/3)
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {player.reservedCards.map((card) => (
              <div key={card.id} className="flex flex-[.3] flex-col gap-1">
                <CardTile
                  card={card}
                  screenSize={screenSize}
                  isReserved
                  onClick={() => onBuyReserved(card.id)}
                />
                {isActive && (
                  <button
                    onClick={() => onReserve(card.id)}
                    className="text-xs text-gray-400 hover:text-white text-center"
                  >
                    Buy
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nobles claimed */}
      {player.nobles.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Nobles</p>
          <div className="flex gap-1">
            {player.nobles.map((noble) => (
              <div
                key={noble.id}
                className="bg-gray-700 rounded px-2 py-1 text-xs text-yellow-400"
              >
                ★{noble.prestige}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
