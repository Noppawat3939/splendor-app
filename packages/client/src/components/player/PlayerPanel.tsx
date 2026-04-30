import type { Player } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";
import CardTile from "../board/CardTile";
import GemToken from "../board/GemToken";

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  onBuyReserved: (cardId: string) => void;
  onReserve: (cardId: string) => void;
}

export default function PlayerPanel({
  player,
  isActive,
  onBuyReserved,
  onReserve,
}: PlayerPanelProps) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 flex w-full flex-col gap-3 ${
        isActive ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{player.name}</p>
          {isActive && <p className="text-xs text-yellow-400">Your turn</p>}
        </div>
        <p className="text-yellow-400 font-bold text-xl">★ {player.prestige}</p>
      </div>

      {/* Tokens */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Tokens</p>
        <div className="flex gap-2 flex-wrap">
          {GEM_COLORS.map((color) => (
            <GemToken
              key={color}
              color={color}
              count={player.tokens[color]}
              size={36}
            />
          ))}
          <GemToken color="gold" count={player.tokens.gold} size={36} />
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
              <div key={card.id} className="flex flex-col gap-1">
                <CardTile
                  card={card}
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
