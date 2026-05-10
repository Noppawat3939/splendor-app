import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomManager } from "./rooms/RoomManager";
import { ClientEvent, ServerEvent } from "./socket/events";
import { v4 as uuidv4 } from "uuid";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const manager = new RoomManager();
const PORT = 3000;

app.get("/", (_, res) => res.send("Splendor server running"));

// ── Socket.io ─────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ── create_room ─────────────────────────────────────────────
  socket.on(
    ClientEvent.CREATE_ROOM,
    ({ playerName }: { playerName: string }) => {
      const playerId = uuidv4();
      const room = manager.createRoom(playerId, playerName, socket.id);
      socket.join(room.id);

      socket.emit(ServerEvent.ROOM_CREATED, {
        roomId: room.id,
        playerId,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
        })),
      });

      console.log(`[create_room] ${playerName} created room ${room.id}`);
    }
  );

  // ── join_room ───────────────────────────────────────────────
  socket.on(
    ClientEvent.JOIN_ROOM,
    ({ roomId, playerName }: { roomId: string; playerName: string }) => {
      const result = manager.validateJoin(roomId);
      if (!result.ok) {
        socket.emit(ServerEvent.ACTION_ERROR, { message: result.reason });
        return;
      }

      const playerId = uuidv4();
      const room = result.room;
      room.addPlayer(playerId, playerName, socket.id);
      socket.join(roomId);

      socket.emit(ServerEvent.ROOM_CREATED, {
        roomId,
        playerId,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
        })),
      });

      io.to(roomId).emit(ServerEvent.PLAYER_JOINED, {
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
        })),
      });

      console.log(`[join_room] ${playerName} joined room ${roomId}`);
    }
  );

  // ── player_ready ────────────────────────────────────────────
  socket.on(ClientEvent.PLAYER_READY, ({ roomId }: { roomId: string }) => {
    const room = manager.getRoom(roomId);
    if (!room) return;

    const player = room.getPlayerBySocket(socket.id);
    if (!player) return;

    room.setReady(player.id);

    io.to(roomId).emit(ServerEvent.PLAYER_READY, { playerId: player.id });

    if (room.allReady()) {
      const gameState = room.startGame();
      io.to(roomId).emit(ServerEvent.GAME_STARTED, { gameState });
      console.log(`[game_started] room ${roomId}`);
    }
  });

  // ── submit_action ───────────────────────────────────────────
  socket.on(
    ClientEvent.SUBMIT_ACTION,
    ({ roomId, action }: { roomId: string; action: any }) => {
      const room = manager.getRoom(roomId);
      if (!room || !room.gameState) return;

      const player = room.getPlayerBySocket(socket.id);
      if (!player) return;

      // validate: must be current player
      if (room.getCurrentPlayerId() !== player.id) {
        socket.emit(ServerEvent.ACTION_ERROR, { message: "Not your turn" });
        return;
      }

      try {
        const gameState = room.applyAction(action);
        io.to(roomId).emit(ServerEvent.STATE_UPDATED, { gameState });

        if (gameState.phase === "ended") {
          io.to(roomId).emit(ServerEvent.GAME_ENDED, {
            winner: gameState.winner,
            gameState,
          });
          console.log(
            `[game_ended] room ${roomId} winner: ${gameState.winner}`
          );
        }
      } catch (e) {
        socket.emit(ServerEvent.ACTION_ERROR, {
          message: (e as Error).message,
        });
      }
    }
  );

  // ── reconnect ───────────────────────────────────────────────
  socket.on(
    ClientEvent.RECONNECT,
    ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = manager.getRoom(roomId);
      if (!room) {
        socket.emit(ServerEvent.ACTION_ERROR, { message: "Room not found" });
        return;
      }

      const player = room.handleReconnect(playerId, socket.id);
      if (!player) {
        socket.emit(ServerEvent.ACTION_ERROR, { message: "Player not found" });
        return;
      }

      socket.join(roomId);

      // ส่ง room info กลับ
      socket.emit(ServerEvent.ROOM_CREATED, {
        roomId,
        playerId,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isReady: p.isReady,
        })),
      });

      // ถ้าเกมเริ่มแล้ว → ส่ง gameState กลับ
      if (room.gameState) {
        socket.emit(ServerEvent.GAME_STARTED, { gameState: room.gameState });
      }

      io.to(roomId).emit(ServerEvent.PLAYER_RECONNECTED, {
        playerId: player.id,
        name: player.name,
      });

      console.log(`[reconnect] ${player.name} reconnected to room ${roomId}`);
    }
  );

  // ── leave_room ──────────────────────────────────────────────
  socket.on(ClientEvent.LEAVE_ROOM, ({ roomId }: { roomId: string }) => {
    handleLeave(socket.id, roomId);
  });

  // ── disconnect ──────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[disconnect] ${socket.id}`);
    const room = manager.getRoomBySocket(socket.id);
    if (!room) return;

    const player = room.handleDisconnect(socket.id, (playerId) => {
      // timeout callback — kick player หลัง 30s
      const kicked = room.kickPlayer(playerId);
      if (!kicked) return;

      io.to(room.id).emit(ServerEvent.PLAYER_KICKED, {
        playerId: kicked.id,
        name: kicked.name,
      });

      console.log(`[kicked] ${kicked.name} from room ${room.id}`);

      // ถ้าเป็น currentPlayer → skip turn ตอน kick เท่านั้น
      if (room.gameState && room.getCurrentPlayerId() === kicked.id) {
        try {
          const gameState = room.skipCurrentTurn();
          io.to(room.id).emit(ServerEvent.STATE_UPDATED, { gameState });
        } catch (e) {
          console.error("[skip_turn_error]", e);
        }
      }

      if (room.gameState && room.players.length === 1) {
        const winner = room.players[0];
        io.to(room.id).emit(ServerEvent.GAME_ENDED, {
          winner: winner.id,
          gameState: room.gameState,
        });
        manager.deleteRoom(room.id);
        return;
      }

      if (room.isEmpty()) {
        manager.deleteRoom(room.id);
      }
    });

    if (!player) return;

    // broadcast disconnect — ไม่ skip turn
    io.to(room.id).emit(ServerEvent.PLAYER_DISCONNECTED, {
      playerId: player.id,
      name: player.name,
      timeoutSec: 30,
    });
  });
});

// ── Helpers ───────────────────────────────────────────────────

function handleLeave(socketId: string, roomId: string) {
  const room = manager.getRoom(roomId);
  if (!room) return;

  const player = room.getPlayerBySocket(socketId);
  if (!player) return;

  room.removePlayer(player.id);

  io.to(roomId).emit(ServerEvent.PLAYER_LEFT, {
    playerId: player.id,
    name: player.name,
  });

  console.log(`[leave] ${player.name} left room ${roomId}`);

  // ถ้าเหลือ 1 คน และเกมเริ่มแล้ว → win
  if (
    room.status === "playing" &&
    room.gameState &&
    room.players.length === 1
  ) {
    const winner = room.players[0];
    io.to(roomId).emit(ServerEvent.GAME_ENDED, {
      winner: winner.id,
      gameState: room.gameState,
    });
    manager.deleteRoom(roomId);
    console.log(`[room_deleted] ${roomId} — last player won`);
    return;
  }

  // ถ้าไม่มีใครเลย หรือ ยังอยู่ใน lobby → ลบห้อง
  if (room.isEmpty()) {
    manager.deleteRoom(roomId);
    console.log(`[room_deleted] ${roomId} — empty`);
  }
}

// ── Start ─────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
