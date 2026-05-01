import { useState } from "react";
import { GEM_COLORS, applyAction, createGame } from "@splendor/core";
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
import logo from "../assets/game-logo.webp";
import gameBackground1 from "../assets/game-background-1.webp";
import ToastContainer from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { useIsMobile } from "../hooks/useMobile";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

// Local mode
interface LocalGameProps {
  players: PlayerConfig[];
  onExit: () => void;
  gameState?: never;
  playerId?: never;
  onAction?: never;
}

// Online mode
interface OnlineGameProps {
  disconnectedPlayers?: Set<string>;
  gameState: GameState;
  onAction: (action: Action) => void;
  onExit: () => void;
  playerId: string;
  players?: never;
}

type GameProps = LocalGameProps | OnlineGameProps;

export default function Game(props: GameProps) {
  const isOnline = !!props.playerId;

  const { toasts, showToast, removeToast } = useToast();
  const isMobile = useIsMobile();

  // Local mode — manage state internally
  const [localState, setLocalState] = useState<GameState | null>(() => {
    if (isOnline) return null;
    // restore จาก localStorage ถ้ามี
    try {
      const saved = localStorage.getItem("splendor_local_game");
      if (saved) return JSON.parse(saved);
    } catch {}
    return createGame(props.players!);
  });
  const state = isOnline ? props.gameState : localState!;

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

  // Online: only current player can act
  const isMyTurn = isOnline
    ? state.players[state.currentPlayerIndex].id === props.playerId
    : true;

  function handleAction(action: Action) {
    if (isOnline) {
      props.onAction(action);
      return;
    }
    try {
      const next = applyAction(state, action);
      setLocalState(next);
      localStorage.setItem("splendor_local_game", JSON.stringify(next));
    } catch (e) {
      showToast((e as Error).message, "error");
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

  // ── Game Over ─────────────────────────────────────────────
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
            onClick={() => {
              localStorage.removeItem("splendor_local_game");
              props.onExit();
            }}
            className="bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300"
          >
            {isOnline ? "Back to Home" : "Play Again"}
          </button>
        </div>
      </div>
    );
  }

  // ── Game Board ────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col text-white 
    overflow-hidden bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${gameBackground1})` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <img
          src={logo}
          alt="logo"
          className="my-auto w-[120px] max-sm:w-[76px]"
        />
        <div className="text-sm text-center">
          <span className="text-yellow-400 font-bold">
            {currentPlayer.name}
          </span>
          <span className="text-gray-400"> — Turn {state.turnNumber}</span>
          {isOnline && !isMyTurn && (
            <p className="text-xs text-gray-500">Waiting...</p>
          )}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("splendor_local_game");
            props.onExit();
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Exit
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3">
        {/* Bank */}
        <div className="bg-gray-950/50 rounded-xl p-3 max-w-4xl mx-auto w-full">
          <p className="text-xs text-gray-400 mb-2">Bank</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {([...GEM_COLORS, "gold"] as const).map((color) => {
              if (state.board.bank[color] === 0) {
                return <div className="h-[80px] max-sm:h-[40px]" />;
              }

              return (
                <GemToken
                  key={color}
                  color={color}
                  count={state.board.bank[color]}
                  size={isMobile ? 40 : 80}
                />
              );
            })}
          </div>
        </div>

        {/* Nobles */}
        <div className="bg-gray-950/50 rounded-xl p-3 max-w-4xl mx-auto w-full">
          <p className="text-xs text-gray-400 mb-2">Nobles</p>
          <div className="flex space-x-4 max-sm:space-x-2 overflow-x-auto pb-1">
            {state.board.nobles.map((noble) => (
              <NobleTile key={noble.id} noble={noble} />
            ))}
          </div>
        </div>

        {/* Cards per tier */}
        {([3, 2, 1] as const).map((tier) => (
          <div
            key={tier}
            className="bg-gray-950/50 rounded-xl p-3 max-w-4xl mx-auto w-full"
          >
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
                  disabled={!isMyTurn}
                  isMobile={isMobile}
                  onClick={() => {
                    if (!isMyTurn) return;
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

      {/* Player panel */}
      {showPlayerPanel && (
        <div className="bg-gray-800/60 border-t border-gray-700 px-3 py-2 shrink-0 max-h-52 h-full max-sm:max-h-48 overflow-y-auto">
          <PlayerPanel
            player={viewingPlayer}
            isMobile={isMobile}
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

      {/* Player tabs */}
      <div className="bg-gray-900 border-t border-gray-700 flex shrink-0">
        {state.players.map((player, i) => {
          const isDisconnected =
            isOnline && props.disconnectedPlayers?.has(player.id);
          return (
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
              } ${
                activePlayerTab === i && showPlayerPanel ? "bg-gray-800" : ""
              }`}
            >
              {/* Name + online status */}
              <div className="flex items-center gap-1 justify-center w-full">
                {/* status dot */}
                {isOnline && (
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isDisconnected ? "bg-gray-500" : "bg-green-400"
                    }`}
                  />
                )}
                <span className="text-xs font-bold truncate">
                  {player.name}
                  {isOnline && player.id === props.playerId && (
                    <span className="text-blue-400"> (You)</span>
                  )}
                </span>
              </div>

              {/* prestige */}
              <span className="text-yellow-400 text-xs">
                ★ {player.prestige}
              </span>

              {/* disconnected label */}
              {isDisconnected && (
                <span className="text-gray-500 text-[10px]">disconnected</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-3 py-2 bg-gray-900 border-t border-gray-700 shrink-0">
        <button
          onClick={() => setShowGemPicker(true)}
          disabled={!isMyTurn}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-sm"
        >
          Take Gems
        </button>
        <button
          onClick={() => setReserveMode(!reserveMode)}
          disabled={!isMyTurn || currentPlayer.reservedCards.length >= 3}
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

      {/* Modals */}
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
