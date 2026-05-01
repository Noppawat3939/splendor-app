import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, Action } from "@splendor/core";
import { ClientEvent, ServerEvent } from "./events";

const SERVER_URL = "http://localhost:3000"; // get from .env

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
    screen: "home",
    roomId: null,
    playerId: null,
    players: [],
    gameState: null,
    error: null,
    winner: null,
    countdown: null,
    disconnectedPlayers: new Set<string>(),
  });

  // store roomId + playerId for reconnect
  const roomIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: false });
    socketRef.current = socket;

    // restore จาก localStorage ถ้ามี
    const savedRoomId = localStorage.getItem("splendor_roomId");
    const savedPlayerId = localStorage.getItem("splendor_playerId");
    if (savedRoomId && savedPlayerId) {
      roomIdRef.current = savedRoomId;
      playerIdRef.current = savedPlayerId;
    }

    socket.on("connect", () => {
      console.log("[socket] connected");
      // ถ้ามี roomId + playerId → reconnect
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

    // ── Server events ────────────────────────────────────────

    socket.on(ServerEvent.ROOM_CREATED, ({ roomId, playerId, players }) => {
      roomIdRef.current = roomId;
      playerIdRef.current = playerId;
      // เก็บไว้ใน localStorage กัน refresh
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

    // reconnect กลับมาตอน game กำลังเล่น
    socket.on(ServerEvent.GAME_STARTED, ({ gameState }) => {
      // ถ้ามาจาก reconnect และ screen ไม่ใช่ lobby → ไปเกมเลย
      setState((s) => ({
        ...s,
        screen: "lobby",
        gameState,
        countdown: s.screen === "game" ? null : 3, // reconnect ไม่ต้อง countdown
      }));

      // ถ้า screen เป็น game อยู่แล้ว (reconnect) → ไม่ countdown
      const isReconnecting = !!localStorage.getItem("splendor_roomId");
      if (isReconnecting && roomIdRef.current) {
        setState((s) => ({ ...s, screen: "game", countdown: null }));
        return;
      }

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

    socket.on(ServerEvent.PLAYER_JOINED, ({ players }) => {
      setState((s) => ({ ...s, players }));
    });

    socket.on(ServerEvent.PLAYER_READY, ({ playerId }) => {
      setState((s) => ({
        ...s,
        players: s.players.map((p) =>
          p.id === playerId ? { ...p, isReady: true } : p
        ),
      }));
    });

    socket.on(ServerEvent.GAME_STARTED, ({ gameState }) => {
      // เริ่ม countdown 3 วินาที
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

    socket.on(ServerEvent.STATE_UPDATED, ({ gameState }) => {
      setState((s) => ({ ...s, gameState }));
    });

    socket.on(ServerEvent.ACTION_ERROR, ({ message }) => {
      setState((s) => ({ ...s, error: message }));
    });

    socket.on(ServerEvent.GAME_ENDED, ({ winner, gameState }) => {
      setState((s) => ({ ...s, screen: "ended", winner, gameState }));
    });

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

    socket.on(ServerEvent.PLAYER_RECONNECTED, ({ playerId }) => {
      setState((s) => {
        const next = new Set(s.disconnectedPlayers);
        next.delete(playerId);
        return { ...s, disconnectedPlayers: next };
      });
    });

    socket.on(ServerEvent.PLAYER_LEFT, ({ playerId }) => {
      setState((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    });

    socket.on(ServerEvent.PLAYER_KICKED, ({ playerId }) => {
      setState((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
      }));
    });

    socket.on(ServerEvent.PLAYER_KICKED, ({ name }) => {
      console.log(`[kicked] ${name}`);
    });

    socket.on(ServerEvent.PLAYER_LEFT, ({ name }) => {
      console.log(`[left] ${name}`);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────

  function createRoom(playerName: string) {
    socketRef.current?.emit(ClientEvent.CREATE_ROOM, { playerName });
  }

  function joinRoom(roomId: string, playerName: string) {
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

    // clear state ก่อน
    roomIdRef.current = null;
    playerIdRef.current = null;
    localStorage.removeItem("splendor_roomId");
    localStorage.removeItem("splendor_playerId");
    setState((s) => ({
      ...s,
      screen: "home",
      roomId: null,
      playerId: null,
      players: [],
      gameState: null,
      winner: null,
      countdown: null,
      disconnectedPlayers: new Set(),
    }));

    // emit หลัง clear state
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
