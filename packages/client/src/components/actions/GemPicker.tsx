import { useState } from "react";
import type { GemColor, GameState } from "@splendor/core";
import { GEM_COLORS, GAME_CONFIG } from "@splendor/core";
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
  const player = state.players[state.currentPlayerIndex];

  // จำนวน token ที่มีอยู่แล้ว
  const currentTokens = Object.values(player.tokens).reduce((a, b) => a + b, 0);
  const totalSelected = Object.values(selected).reduce((a, b) => a + b, 0);
  const tokensAfter = currentTokens + totalSelected;
  const remainingSlots = GAME_CONFIG.MAX_TOKENS_IN_HAND - currentTokens;

  function toggleGem(color: GemColor) {
    const current = selected[color] ?? 0;

    // deselect
    if (current > 0) {
      const next = { ...selected };
      delete next[color];
      setSelected(next);
      return;
    }

    // ถ้าเพิ่มแล้วจะเกิน 10 → ไม่ให้เลือก
    if (totalSelected >= remainingSlots) return;

    // max 3 different colors
    if (Object.keys(selected).length >= 3) return;

    setSelected({ ...selected, [color]: 1 });
  }

  function handleConfirm() {
    if (totalSelected === 0) return;
    onTakeDifferent(selected);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-gray-800 rounded-t-2xl p-6 w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Take Gems</h2>
          {/* token counter */}
          <div
            className={`text-sm font-bold px-3 py-1 rounded-full ${
              tokensAfter >= GAME_CONFIG.MAX_TOKENS_IN_HAND
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {tokensAfter} / {GAME_CONFIG.MAX_TOKENS_IN_HAND}
          </div>
        </div>

        {/* Take different gems */}
        <div>
          <p className="text-gray-400 text-sm mb-2">
            Take up to 3 different colors
          </p>
          <div className="flex gap-3 justify-center">
            {GEM_COLORS.map((color) => {
              const inBank = bank[color];
              const isSelected = (selected[color] ?? 0) > 0;
              // disable ถ้า bank หมด หรือ token เต็ม หรือ เลือกครบ 3 สีแล้ว
              const isDisabled =
                inBank === 0 ||
                (!isSelected && totalSelected >= remainingSlots) ||
                (!isSelected && Object.keys(selected).length >= 3);

              return (
                <button
                  key={color}
                  disabled={isDisabled}
                  onClick={() => toggleGem(color)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    border-4 transition-all
                    ${
                      isDisabled
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
              Selected: {totalSelected} gem{totalSelected > 1 ? "s" : ""}
            </p>
          )}
          {remainingSlots === 0 && (
            <p className="text-center text-xs text-red-400 mt-2">
              Token limit reached ({GAME_CONFIG.MAX_TOKENS_IN_HAND}/10)
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
              const canTake2 = inBank >= 4 && remainingSlots >= 2;
              return (
                <button
                  key={color}
                  disabled={!canTake2}
                  onClick={() => onTakeSame(color)}
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
          {remainingSlots < 2 && remainingSlots > 0 && (
            <p className="text-center text-xs text-yellow-400 mt-1">
              Need 2 slots free to take same gems
            </p>
          )}
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
