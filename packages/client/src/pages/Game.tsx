import { useState } from "react";
import { applyAction, createGame } from "@splendor/core";
import type {
  GameState,
  Action,
  GemColor,
  DevelopmentCard,
} from "@splendor/core";
import NobleTile from "../components/board/NobleTile";
import CardTile from "../components/board/CardTile";
import PlayerPanel from "../components/player/PlayerPanel";
import GemPicker from "../components/actions/GemPicker";
import GemToken from "../components/board/GemToken";
import BuyCardModal from "../components/actions/BuyCardModal";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

interface GameProps {
  players: PlayerConfig[];
  onExit: () => void;
}

export default function Game({ players, onExit }: GameProps) {
  const [state, setState] = useState<GameState>(() => createGame(players));
  const [showGemPicker, setShowGemPicker] = useState(false);
  const [reserveMode, setReserveMode] = useState(false);
  const [buyTarget, setBuyTarget] = useState<{
    card: DevelopmentCard;
    fromReserved: boolean;
  } | null>(null);
  const [activePlayerTab, setActivePlayerTab] = useState(0);
  const [showPlayerPanel, setShowPlayerPanel] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const viewingPlayer = state.players[activePlayerTab];

  function handleAction(action: Action) {
    try {
      const next = applyAction(state, action);
      setState(next);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function handleTakeDifferent(gems: Partial<Record<GemColor, number>>) {
    handleAction({ type: "takeDifferentGems", gems });
    setShowGemPicker(false);
  }

  function handleTakeSame(color: GemColor) {
    handleAction({ type: "takeSameGems", gemColor: color });
    setShowGemPicker(false);
  }

  function handleReserveFromDeck(tier: 1 | 2 | 3) {
    handleAction({ type: "reserveCard", cardTier: tier });
    setShowGemPicker(false);
  }

  if (state.phase === "ended") {
    const winner = state.players.find((p) => p.id === state.winner);
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 text-center flex flex-col gap-4 w-full max-w-sm">
          <h1 className="text-3xl font-bold text-yellow-400">Game Over!</h1>
          <p className="text-xl">{winner?.name} wins!</p>
          <p className="text-gray-400">{winner?.prestige} prestige points</p>
          <div className="flex flex-col gap-2">
            {[...state.players]
              .sort((a, b) => b.prestige - a.prestige)
              .map((p, i) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span
                    className={
                      i === 0 ? "text-yellow-400 font-bold" : "text-gray-300"
                    }
                  >
                    {i + 1}. {p.name}
                  </span>
                  <span className="text-yellow-400">★ {p.prestige}</span>
                </div>
              ))}
          </div>
          <button
            onClick={onExit}
            className="bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* ── Header (fixed) ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <h1 className="text-lg font-bold text-yellow-400">Splendor</h1>
        <div className="text-sm text-center">
          <span className="text-yellow-400 font-bold">
            {currentPlayer.name}
          </span>
          <span className="text-gray-400"> — Turn</span>
        </div>
        <button
          onClick={onExit}
          className="text-sm text-gray-400 hover:text-white"
        >
          Exit
        </button>
      </div>

      {/* ── Board (scrollable center) ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3">
        {/* Bank */}
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2">Bank</p>
          <div className="flex gap-2 flex-wrap">
            {(["white", "blue", "green", "red", "black"] as const).map(
              (color) => (
                <GemToken
                  key={color}
                  color={color}
                  count={state.board.bank[color]}
                  size={40}
                />
              )
            )}
            <GemToken color="gold" count={state.board.bank.gold} size={40} />
          </div>
        </div>

        {/* Nobles */}
        <div className="bg-gray-800 rounded-xl p-3 max-w-3xl mx-auto w-full">
          <p className="text-xs text-gray-400 mb-2">Nobles</p>
          <div className="flex space-x-4 max-sm:space-x-2 overflow-x-auto pb-1">
            {state.board.nobles.map((noble) => (
              <NobleTile key={noble.id} noble={noble} />
            ))}
          </div>
        </div>

        {/* Cards per tier */}
        {([3, 2, 1] as const).map((tier) => (
          <div key={tier} className="bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-gray-400">Tier {tier}</p>
              <p className="text-xs text-gray-600">
                ({state.board.tiers[tier].draw.length} left)
              </p>
              {reserveMode && (
                <p className="text-xs text-yellow-400 ml-auto">
                  Tap to reserve
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {state.board.tiers[tier].visible.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  highlight={reserveMode}
                  onClick={() => {
                    if (reserveMode) {
                      handleAction({ type: "reserveCard", cardId: card.id });
                      setReserveMode(false);
                    } else {
                      setBuyTarget({ card, fromReserved: false });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Player panel (collapsible) ── */}
      {showPlayerPanel && (
        <div className="bg-gray-800 border-t border-gray-700 px-3 py-2 shrink-0 max-h-48 overflow-y-auto">
          <PlayerPanel
            player={viewingPlayer}
            isActive={activePlayerTab === state.currentPlayerIndex}
            onBuyReserved={(cardId) => {
              const card = currentPlayer.reservedCards.find(
                (c) => c.id === cardId
              );
              if (card) setBuyTarget({ card, fromReserved: true });
            }}
            onReserve={(cardId) =>
              handleAction({ type: "reserveCard", cardId })
            }
          />
        </div>
      )}

      {/* ── Player tabs ── */}
      <div className="bg-gray-900 border-t border-gray-700 flex shrink-0">
        {state.players.map((player, i) => (
          <button
            key={player.id}
            onClick={() => {
              if (activePlayerTab === i) {
                setShowPlayerPanel(!showPlayerPanel);
              } else {
                setActivePlayerTab(i);
                setShowPlayerPanel(true);
              }
            }}
            className={`flex-1 py-2 px-1 flex flex-col items-center gap-0.5 transition-colors ${
              i === state.currentPlayerIndex
                ? "border-t-2 border-yellow-400"
                : "border-t-2 border-transparent"
            } ${activePlayerTab === i && showPlayerPanel ? "bg-gray-800" : ""}`}
          >
            <span className="text-xs font-bold truncate w-full text-center">
              {player.name}
            </span>
            <span className="text-yellow-400 text-xs">★ {player.prestige}</span>
          </button>
        ))}
      </div>

      {/* ── Action buttons (fixed bottom) ── */}
      <div className="flex gap-2 px-3 py-2 bg-gray-900 border-t border-gray-700 shrink-0">
        <button
          onClick={() => setShowGemPicker(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-sm"
        >
          Take Gems
        </button>
        <button
          onClick={() => setReserveMode(!reserveMode)}
          disabled={currentPlayer.reservedCards.length >= 3}
          className={`flex-1 font-bold py-2 rounded-xl text-sm disabled:opacity-40 ${
            reserveMode
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-700 text-white"
          }`}
        >
          {reserveMode
            ? "Cancel"
            : `Reserve (${currentPlayer.reservedCards.length}/3)`}
        </button>
      </div>

      {/* ── Modals ── */}
      {showGemPicker && (
        <GemPicker
          state={state}
          onTakeDifferent={handleTakeDifferent}
          onTakeSame={handleTakeSame}
          onReserveFromDeck={handleReserveFromDeck}
          onCancel={() => setShowGemPicker(false)}
        />
      )}

      {buyTarget && (
        <BuyCardModal
          card={buyTarget.card}
          player={currentPlayer}
          fromReserved={buyTarget.fromReserved}
          onConfirm={() => {
            handleAction({
              type: "buyCard",
              cardId: buyTarget.card.id,
              fromReserved: buyTarget.fromReserved,
            });
            setBuyTarget(null);
          }}
          onCancel={() => setBuyTarget(null)}
        />
      )}
    </div>
  );
}
