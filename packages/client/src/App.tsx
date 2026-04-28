import { useState } from "react";
import Home from "./pages/Home";

interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

export default function App() {
  const [players, setPlayers] = useState<PlayerConfig[] | null>(null);

  if (!players) {
    return <Home onStart={setPlayers} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p>Game starts with {players.length} players</p>
    </div>
  );
}
