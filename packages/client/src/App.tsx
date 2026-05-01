import { useState } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Lobby from "./pages/Lobby";
import { useSocket } from "./socket/useSocket";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

export default function App() {
  const [localPlayers, setLocalPlayers] = useState<PlayerConfig[] | null>(null);
  const { state, createRoom, joinRoom, setReady, submitAction, leaveRoom } =
    useSocket();

  // ── Local mode ───────────────────────────────────────────
  if (localPlayers) {
    return <Game players={localPlayers} onExit={() => setLocalPlayers(null)} />;
  }

  // ── Online mode: lobby ───────────────────────────────────
  if (state.screen === "lobby" || state.countdown !== null) {
    return (
      <Lobby
        roomId={state.roomId!}
        playerId={state.playerId!}
        players={state.players}
        countdown={state.countdown}
        onReady={setReady}
        onLeave={leaveRoom}
      />
    );
  }

  // ── Online mode: game ────────────────────────────────────
  if (state.screen === "game" && state.gameState) {
    return (
      <Game
        gameState={state.gameState}
        playerId={state.playerId!}
        disconnectedPlayers={state.disconnectedPlayers}
        onAction={submitAction}
        onExit={leaveRoom}
      />
    );
  }

  // ── Online mode: ended ───────────────────────────────────
  if (state.screen === "ended" && state.gameState) {
    return (
      <Game
        gameState={state.gameState}
        playerId={state.playerId!}
        onAction={submitAction}
        onExit={leaveRoom}
      />
    );
  }

  // ── Home ─────────────────────────────────────────────────
  return (
    <Home
      onStart={setLocalPlayers}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
    />
  );
}
