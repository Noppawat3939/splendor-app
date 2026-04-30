import { useState } from "react";
import type { GemColor, GameState } from "@splendor/core";
import { GEM_COLORS } from "@splendor/core";
import { gemColor } from "../../utils/gemColor";

interface GemPickerProps {
  state: GameState;
  onTakeDifferent: (gems: Partial<Record<GemColor, number>>) => void;
  onTakeSame: (color: GemColor) => void;
  onReserveFromDeck: (tier: 1 | 2 | 3) => void;
  onCancel: () => void;
}

export default function GemPicker({
  state,
  onTakeDifferent,
  onTakeSame,
  onReserveFromDeck,
  onCancel,
}: GemPickerProps) {
  const [selected, setSelected] = useState<Partial<Record<GemColor, number>>>(
    {}
  );
  const bank = state.board.bank;
  const totalSelected = Object.values(selected).reduce((a, b) => a + b, 0);

  function toggleGem(color: GemColor) {
    const current = selected[color] ?? 0;

    // already selected this color → deselect
    if (current > 0) {
      const next = { ...selected };
      delete next[color];
      setSelected(next);
      return;
    }

    const colorCount = Object.keys(selected).length;

    // max 3 different colors
    if (colorCount >= 3) return;

    setSelected({ ...selected, [color]: 1 });
  }

  function handleTakeSame(color: GemColor) {
    onTakeSame(color);
  }

  function handleConfirm() {
    if (totalSelected === 0) return;
    onTakeDifferent(selected);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-gray-800 rounded-t-2xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-white font-bold text-lg">Take Gems</h2>

        {/* Take different gems */}
        <div>
          <p className="text-gray-400 text-sm mb-2">
            Take up to 3 different colors
          </p>
          <div className="flex gap-3 justify-center">
            {GEM_COLORS.map((color) => {
              const inBank = bank[color];
              const isSelected = (selected[color] ?? 0) > 0;
              return (
                <button
                  key={color}
                  disabled={inBank === 0}
                  onClick={() => toggleGem(color)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    border-4 transition-all
                    ${
                      inBank === 0
                        ? "opacity-30 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    ${
                      isSelected
                        ? "border-yellow-400 scale-110 shadow-lg"
                        : "border-transparent"
                    }
                  `}
                  style={{
                    background: gemColor(color),
                    color: color === "white" ? "#111" : "#fff",
                  }}
                >
                  {inBank}
                </button>
              );
            })}
          </div>
          {totalSelected > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Selected: {totalSelected} gem
              {totalSelected > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Confirm take different */}
        <button
          onClick={handleConfirm}
          disabled={totalSelected === 0}
          className="bg-yellow-400 text-gray-900 font-bold py-2 rounded-lg disabled:opacity-40"
        >
          Take Selected Gems
        </button>

        {/* Take 2 same */}
        <div>
          <p className="text-gray-400 text-sm mb-2">
            Or take 2 of the same (needs ≥4 in bank)
          </p>
          <div className="flex gap-3 justify-center">
            {GEM_COLORS.map((color) => {
              const inBank = bank[color];
              const canTake2 = inBank >= 4;
              return (
                <button
                  key={color}
                  disabled={!canTake2}
                  onClick={() => handleTakeSame(color)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    border-2 border-transparent transition-all
                    ${
                      !canTake2
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:border-white cursor-pointer"
                    }
                  `}
                  style={{
                    background: gemColor(color),
                    color: color === "white" ? "#111" : "#fff",
                  }}
                >
                  ×2
                </button>
              );
            })}
          </div>
        </div>

        {/* Reserve from deck */}
        <div>
          <p className="text-gray-400 text-sm mb-2">
            Or reserve top card from deck
          </p>
          <div className="flex gap-2 justify-center">
            {([1, 2, 3] as const).map((tier) => (
              <button
                key={tier}
                disabled={state.board.tiers[tier].draw.length === 0}
                onClick={() => onReserveFromDeck(tier)}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 px-4 py-2 rounded-lg text-sm font-bold"
              >
                Tier {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white text-sm text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
