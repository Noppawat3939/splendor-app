import { useState } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";

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

  return <Game players={players} onExit={() => setPlayers(null)} />;
}
