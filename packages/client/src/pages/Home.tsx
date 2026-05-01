import { useMemo, useState } from "react";
import logo from "../assets/game-logo.webp";
import banner from "../assets/banner.webp";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/Toast";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

interface HomeProps {
  onStart: (players: PlayerConfig[]) => void;
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
}

type Mode = "select" | "local" | "online";
type OnlineAction = "select" | "create" | "join";

export default function Home({ onStart, onCreateRoom, onJoinRoom }: HomeProps) {
  const { toasts, showToast, removeToast } = useToast();

  const [mode, setMode] = useState<Mode>("select");
  const [onlineAction, setOnlineAction] = useState<OnlineAction>("select");

  // local state
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["", "", "", ""]);

  // online state
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");

  const isEmptyPlayerName = useMemo(
    () => names.every((name) => !name.trim()),
    [names]
  );

  function handleLocalStart() {
    if (isEmptyPlayerName)
      return showToast("Please enter player name", "error");

    const players: PlayerConfig[] = names
      .slice(0, playerCount)
      .map((name, i) => ({
        id: `p${i + 1}`,
        name: name.trim() || `Player ${i + 1}`,
        isAI: false,
      }));

    // save mode to local
    localStorage.setItem("game_mode", mode);
    localStorage.setItem("local_config", JSON.stringify(players));

    onStart(players);
  }

  function handleCreateRoom() {
    if (!playerName.trim()) return showToast("Please enter your name", "error");
    onCreateRoom(playerName.trim());
  }

  function handleJoinRoom() {
    if (!playerName.trim()) return showToast("Please enter your name", "error");
    if (!roomId.trim()) return showToast("Please enter room ID", "error");
    onJoinRoom(roomId.trim().toUpperCase(), playerName.trim());
  }

  return (
    <div
      style={{ backgroundImage: `url(${banner})` }}
      className="min-h-screen bg-cover bg-center text-white flex items-center justify-center"
    >
      <div className="bg-gray-900/60 backdrop-blur-sm shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 max-sm:mx-3 max-sm:p-5">
        <img
          src={logo}
          alt="logo"
          width={200}
          className="mx-auto"
          loading="lazy"
        />

        {/* ── Mode Selection ── */}
        {mode === "select" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-400 text-center">Select Mode</p>
            <button
              onClick={() => setMode("local")}
              className="bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Single Player
            </button>
            <button
              onClick={() => {
                localStorage.setItem("game_mode", "online");

                setMode("online");
              }}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors"
            >
              Online Player
            </button>
            <button
              disabled
              className="bg-gray-700 text-gray-500 font-bold py-3 rounded-xl disabled:cursor-not-allowed"
            >
              vs AI (Coming Soon)
            </button>
          </div>
        )}

        {/* ── Local Mode ── */}
        {mode === "local" && (
          <>
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

            <div className="flex gap-2">
              <button
                onClick={() => setMode("select")}
                className="bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600"
              >
                ←
              </button>
              <button
                onClick={handleLocalStart}
                className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Start Game
              </button>
            </div>
          </>
        )}

        {/* ── Online Mode ── */}
        {mode === "online" && (
          <>
            {onlineAction === "select" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400 text-center">
                  Online Multiplayer
                </p>
                <button
                  onClick={() => setOnlineAction("create")}
                  className="bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setOnlineAction("join")}
                  className="bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600"
                >
                  Join Room
                </button>
                <button
                  onClick={() => setMode("select")}
                  className="text-gray-400 hover:text-white text-sm text-center"
                >
                  ← Back
                </button>
              </div>
            )}

            {onlineAction === "create" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">Create Room</p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setOnlineAction("select")}
                    className="bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {onlineAction === "join" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">Join Room</p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="text"
                  placeholder="Room ID (e.g. ABC123)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400 uppercase tracking-widest"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setOnlineAction("select")}
                    className="bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
