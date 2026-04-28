import { useState } from "react";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

interface HomeProps {
  onStart: (players: PlayerConfig[]) => void;
}

export default function Home({ onStart }: HomeProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["", "", "", ""]);

  function handleStart() {
    const players: PlayerConfig[] = names
      .slice(0, playerCount)
      .map((name, i) => ({
        id: `p${i + 1}`,
        name: name.trim() || `Player ${i + 1}`,
        isAI: false,
      }));
    onStart(players);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-yellow-400">
          Splendor
        </h1>

        {/* Player count */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Number of Players</label>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  playerCount === n
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-400">Player Names</label>
          {names.slice(0, playerCount).map((name, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Player ${i + 1}`}
              value={name}
              onChange={(e) => {
                const next = [...names];
                next[i] = e.target.value;
                setNames(next);
              }}
              className="bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
