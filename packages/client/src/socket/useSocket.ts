import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, Action } from "@splendor/core";
import { ClientEvent, ServerEvent } from "./events";

const SERVER_URL = "http://localhost:3000";

export interface RoomPlayer {
  id: string;
  name: string;
  isReady: boolean;
}

export type GameScreen = "home" | "lobby" | "game" | "ended";

export interface SocketState {
  screen: GameScreen;
  roomId: string | null;
  playerId: string | null;
  players: RoomPlayer[];
  gameState: GameState | null;
  error: string | null;
  winner: string | null;
  countdown: number | null;
  disconnectedPlayers: Set<string>;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    countdown: null,
    disconnectedPlayers: new Set<string>(),
    error: null,
    gameState: null,
    playerId: null,
    players: [],
    roomId: null,
    screen: "home",
    winner: null,
  });

  const roomIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);
  // track ว่ากำลัง reconnect อยู่ไหม
  const isReconnectingRef = useRef<boolean>(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: false });
    socketRef.current = socket;

    // restore จาก localStorage
    const savedRoomId = localStorage.getItem("splendor_roomId");
    const savedPlayerId = localStorage.getItem("splendor_playerId");
    if (savedRoomId && savedPlayerId) {
      roomIdRef.current = savedRoomId;
      playerIdRef.current = savedPlayerId;
      isReconnectingRef.current = true;
    }

    socket.on("connect", () => {
      console.log("[socket] connected");
      if (roomIdRef.current && playerIdRef.current) {
        socket.emit(ClientEvent.RECONNECT, {
          roomId: roomIdRef.current,
          playerId: playerIdRef.current,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("[socket] disconnected");
    });

    // ── ROOM_CREATED ─────────────────────────────────────────
    socket.on(ServerEvent.ROOM_CREATED, ({ roomId, playerId, players }) => {
      roomIdRef.current = roomId;
      playerIdRef.current = playerId;
      localStorage.setItem("splendor_roomId", roomId);
      localStorage.setItem("splendor_playerId", playerId);
      setState((s) => ({
        ...s,
        screen: "lobby",
        roomId,
        playerId,
        players,
        error: null,
      }));
    });

    // ── PLAYER_JOINED ─────────────────────────────────────────
    socket.on(ServerEvent.PLAYER_JOINED, ({ players }) => {
      setState((s) => ({ ...s, players }));
    });

    // ── PLAYER_READY ──────────────────────────────────────────
    socket.on(ServerEvent.PLAYER_READY, ({ playerId }) => {
      setState((s) => ({
        ...s,
        players: s.players.map((p) =>
          p.id === playerId ? { ...p, isReady: true } : p
        ),
      }));
    });

    // ── GAME_STARTED ──────────────────────────────────────────
    socket.on(ServerEvent.GAME_STARTED, ({ gameState }) => {
      const reconnecting = isReconnectingRef.current;
      isReconnectingRef.current = false;

      if (reconnecting) {
        // reconnect → ไปเกมเลย ไม่ต้อง countdown
        setState((s) => ({ ...s, screen: "game", gameState, countdown: null }));
        return;
      }

      // เริ่มเกมปกติ → countdown 3 วินาที
      setState((s) => ({ ...s, screen: "lobby", gameState, countdown: 3 }));

      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(timer);
          setState((s) => ({ ...s, screen: "game", countdown: null }));
        } else {
          setState((s) => ({ ...s, countdown: count }));
        }
      }, 1000);
    });

    // ── STATE_UPDATED ─────────────────────────────────────────
    socket.on(ServerEvent.STATE_UPDATED, ({ gameState }) => {
      setState((s) => ({ ...s, gameState }));
    });

    // ── ACTION_ERROR ──────────────────────────────────────────
    socket.on(ServerEvent.ACTION_ERROR, ({ message }) => {
      setState((s) => ({ ...s, error: message }));
    });

    // ── GAME_ENDED ────────────────────────────────────────────
    socket.on(ServerEvent.GAME_ENDED, ({ winner, gameState }) => {
      setState((s) => ({ ...s, screen: "ended", winner, gameState }));
    });

    // ── PLAYER_DISCONNECTED ───────────────────────────────────
    socket.on(
      ServerEvent.PLAYER_DISCONNECTED,
      ({ playerId, name, timeoutSec }) => {
        console.log(`[disconnected] ${name} — ${timeoutSec}s to reconnect`);
        setState((s) => ({
          ...s,
          disconnectedPlayers: new Set([...s.disconnectedPlayers, playerId]),
        }));
      }
    );

    // ── PLAYER_RECONNECTED ────────────────────────────────────
    socket.on(ServerEvent.PLAYER_RECONNECTED, ({ playerId }) => {
      setState((s) => {
        const next = new Set(s.disconnectedPlayers);
        next.delete(playerId);
        return { ...s, disconnectedPlayers: next };
      });
    });

    // ── PLAYER_LEFT ───────────────────────────────────────────
    socket.on(ServerEvent.PLAYER_LEFT, ({ playerId, name }) => {
      console.log(`[left] ${name}`);
      setState((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    });

    // ── PLAYER_KICKED ─────────────────────────────────────────
    socket.on(ServerEvent.PLAYER_KICKED, ({ playerId, name }) => {
      console.log(`[kicked] ${name}`);
      setState((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────

  function createRoom(playerName: string) {
    isReconnectingRef.current = false;
    socketRef.current?.emit(ClientEvent.CREATE_ROOM, { playerName });
  }

  function joinRoom(roomId: string, playerName: string) {
    isReconnectingRef.current = false;
    socketRef.current?.emit(ClientEvent.JOIN_ROOM, { roomId, playerName });
  }

  function setReady() {
    if (!state.roomId) return;
    socketRef.current?.emit(ClientEvent.PLAYER_READY, { roomId: state.roomId });
  }

  function submitAction(action: Action) {
    if (!state.roomId) return;
    socketRef.current?.emit(ClientEvent.SUBMIT_ACTION, {
      roomId: state.roomId,
      action,
    });
  }

  function leaveRoom() {
    const currentRoomId = state.roomId;
    roomIdRef.current = null;
    playerIdRef.current = null;
    isReconnectingRef.current = false;
    localStorage.removeItem("splendor_roomId");
    localStorage.removeItem("splendor_playerId");
    setState((s) => ({
      ...s,
      countdown: null,
      disconnectedPlayers: new Set(),
      gameState: null,
      playerId: null,
      players: [],
      roomId: null,
      screen: "home",
      winner: null,
    }));
    if (currentRoomId) {
      socketRef.current?.emit(ClientEvent.LEAVE_ROOM, {
        roomId: currentRoomId,
      });
    }
  }

  return {
    state,
    createRoom,
    joinRoom,
    setReady,
    submitAction,
    leaveRoom,
  };
}
