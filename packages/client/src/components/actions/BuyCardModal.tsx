import type { DevelopmentCard, Player } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { computePayment } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";

interface BuyCardModalProps {
  card: DevelopmentCard;
  fromReserved: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  player: Player;
}

export default function BuyCardModal({
  card,
  fromReserved,
  onCancel,
  onConfirm,
  player,
}: BuyCardModalProps) {
  const { canAfford, payment } = computePayment(player, card.cost);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-gray-800 rounded-t-2xl p-6 w-full max-w-md flex flex-col gap-4">
        {/* title */}
        <h2 className="text-white font-bold text-lg">
          {fromReserved ? "Buy Reserved Card" : "Buy Card"}
        </h2>

        {/* card info */}
        <div
          className="rounded-xl p-4 flex items-center justify-between border-2"
          style={{
            borderColor: gemColor(card.bonus),
            background: `linear-gradient(135deg, ${gemColor(
              card.bonus
            )}33, ${gemColor(card.bonus)}11)`,
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border border-white/30"
                style={{ background: gemColor(card.bonus) }}
              />
              <span className="text-sm text-gray-300 capitalize">
                {card.bonus} gem bonus
              </span>
            </div>
            {card.prestige > 0 && (
              <span className="text-yellow-400 font-bold">
                ★ {card.prestige} prestige
              </span>
            )}
          </div>

          {/* cost */}
          <div className="flex flex-col gap-1">
            {GEM_COLORS.filter((c) => card.cost[c] > 0).map((color) => (
              <div key={color} className="flex items-center gap-1 justify-end">
                <span className="text-xs text-gray-300">
                  {card.cost[color]}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: gemColor(color) }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* payment breakdown */}
        <div className="bg-gray-700 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-xs text-gray-400">You will pay</p>
          <div className="flex gap-3 flex-wrap">
            {GEM_COLORS.filter((c) => payment[c] > 0).map((color) => (
              <div key={color} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: gemColor(color) }}
                />
                <span className="text-sm text-white">{payment[color]}</span>
              </div>
            ))}
            {payment.gold > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-sm text-white">
                  {payment.gold} (wild)
                </span>
              </div>
            )}
            {GEM_COLORS.every((c) => payment[c] === 0) &&
              payment.gold === 0 && (
                <span className="text-sm text-green-400">Free!</span>
              )}
          </div>

          {/* bonus discount info */}
          {GEM_COLORS.some(
            (c) => player.bonuses[c] > 0 && card.cost[c] > 0
          ) && (
            <p className="text-xs text-green-400">
              ✓ Card bonuses applied as discount
            </p>
          )}
        </div>

        {/* buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canAfford ? "Buy" : "Cannot Afford"}
          </button>
        </div>
      </div>
    </div>
  );
}
