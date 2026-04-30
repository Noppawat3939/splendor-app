import { createGame, applyAction, getLegalActions } from "@splendor/core";
import type { GameState, Action } from "@splendor/core";

export interface RoomPlayer {
  id: string;
  name: string;
  socketId: string;
  isReady: boolean;
  isConnected: boolean;
}

export type RoomStatus = "waiting" | "playing" | "ended";

export class Room {
  id: string;
  players: RoomPlayer[] = [];
  gameState: GameState | null = null;
  status: RoomStatus = "waiting";

  private disconnectTimers: Map<string, Timer> = new Map();
  private readonly RECONNECT_TIMEOUT = 30_000; // 30s
  private readonly MAX_PLAYERS = 4;

  constructor(id: string) {
    this.id = id;
  }

  // ── Players ────────────────────────────────────────────────

  addPlayer(id: string, name: string, socketId: string): RoomPlayer {
    const player: RoomPlayer = {
      id,
      name,
      socketId,
      isReady: false,
      isConnected: true,
    };
    this.players.push(player);
    return player;
  }

  removePlayer(playerId: string): RoomPlayer | null {
    const idx = this.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return null;
    const [player] = this.players.splice(idx, 1);
    return player;
  }

  getPlayer(playerId: string): RoomPlayer | undefined {
    return this.players.find((p) => p.id === playerId);
  }

  getPlayerBySocket(socketId: string): RoomPlayer | undefined {
    return this.players.find((p) => p.socketId === socketId);
  }

  isFull(): boolean {
    return this.players.length >= this.MAX_PLAYERS;
  }

  isEmpty(): boolean {
    return this.players.length === 0;
  }

  setReady(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (player) player.isReady = true;
  }

  allReady(): boolean {
    return this.players.length >= 2 && this.players.every((p) => p.isReady);
  }

  // ── Game ───────────────────────────────────────────────────

  startGame(): GameState {
    this.gameState = createGame(
      this.players.map((p) => ({ id: p.id, name: p.name, isAI: false }))
    );
    this.status = "playing";
    return this.gameState;
  }

  applyAction(action: Action): GameState {
    if (!this.gameState) throw new Error("Game not started");
    this.gameState = applyAction(this.gameState, action);
    if (this.gameState.phase === "ended") this.status = "ended";
    return this.gameState;
  }

  getCurrentPlayerId(): string | null {
    if (!this.gameState) return null;
    return this.gameState.players[this.gameState.currentPlayerIndex].id;
  }

  skipCurrentTurn(): GameState {
    if (!this.gameState) throw new Error("Game not started");
    // get legal actions and pick takeDifferentGems with fewest gems as skip
    const actions = getLegalActions(this.gameState);
    const skip =
      actions.find((a) => a.type === "takeDifferentGems") ?? actions[0];
    if (skip) this.gameState = applyAction(this.gameState, skip);
    return this.gameState;
  }

  // ── Disconnect / Reconnect ─────────────────────────────────

  handleDisconnect(
    socketId: string,
    onTimeout: (playerId: string) => void
  ): RoomPlayer | null {
    const player = this.getPlayerBySocket(socketId);
    if (!player) return null;

    player.isConnected = false;

    // ถ้าเป็น currentPlayer → skip turn ทันที
    // (caller จะ handle broadcast)

    // start 30s timer
    const timer = setTimeout(() => {
      onTimeout(player.id);
    }, this.RECONNECT_TIMEOUT);

    this.disconnectTimers.set(player.id, timer);
    return player;
  }

  handleReconnect(playerId: string, newSocketId: string): RoomPlayer | null {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    // clear timer
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }

    player.socketId = newSocketId;
    player.isConnected = true;
    return player;
  }

  kickPlayer(playerId: string): RoomPlayer | null {
    // clear timer if exists
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }
    return this.removePlayer(playerId);
  }

  connectedCount(): number {
    return this.players.filter((p) => p.isConnected).length;
  }
}
