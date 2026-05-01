import { useState } from "react";
import logo from "../assets/game-logo.webp";

interface RoomPlayer {
  id: string;
  name: string;
  isReady: boolean;
}

interface LobbyProps {
  roomId: string;
  playerId: string;
  players: RoomPlayer[];
  countdown: number | null;
  onReady: () => void;
  onLeave: () => void;
}

export default function Lobby({
  roomId,
  playerId,
  players,
  countdown,
  onReady,
  onLeave,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const me = players.find((p) => p.id === playerId);
  const isReady = me?.isReady ?? false;

  function copyRoomId() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Countdown overlay ──────────────────────────────────────
  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6">
        <p className="text-gray-400 text-lg">Game starting in</p>
        <div
          className="text-9xl font-bold text-yellow-400 tabular-nums"
          style={{ transition: "transform 0.3s", transform: "scale(1)" }}
        >
          {countdown}
        </div>
        <p className="text-gray-500 text-sm">Get ready!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5">
        <img src={logo} alt="logo" width={140} className="mx-auto" />

        {/* Room ID */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400">Room ID — share with friends</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-xl px-4 py-3 text-center font-bold text-xl tracking-widest text-yellow-400">
              {roomId}
            </div>
            <button
              onClick={copyRoomId}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-3 rounded-xl text-sm"
            >
              {copied ? "✅" : "📋"}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">Players ({players.length}/4)</p>
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-700 rounded-xl px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{player.name}</span>
                {player.id === playerId && (
                  <span className="text-xs text-blue-400">(You)</span>
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  player.isReady ? "text-green-400" : "text-gray-500"
                }`}
              >
                {player.isReady ? "✅ Ready" : "⏳ Waiting"}
              </span>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 2 - players.length) }).map(
            (_, i) => (
              <div
                key={i}
                className="flex items-center bg-gray-700/40 rounded-xl px-4 py-2"
              >
                <span className="text-sm text-gray-600">
                  Waiting for player...
                </span>
              </div>
            )
          )}
        </div>

        {/* Status */}
        <p className="text-xs text-gray-500 text-center">
          {players.length < 2
            ? "Need at least 2 players to start"
            : players.every((p) => p.isReady)
            ? "All ready! Starting soon..."
            : "Waiting for everyone to ready up"}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onLeave}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl"
          >
            Leave
          </button>
          <button
            onClick={onReady}
            disabled={isReady}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl"
          >
            {isReady ? "Ready!" : "Ready"}
          </button>
        </div>
      </div>
    </div>
  );
}
