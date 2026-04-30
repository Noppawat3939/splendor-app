import { Room } from "./Room";

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(hostId: string, hostName: string, hostSocketId: string): Room {
    let roomId = generateRoomId();
    // ensure unique
    while (this.rooms.has(roomId)) roomId = generateRoomId();

    const room = new Room(roomId);
    room.addPlayer(hostId, hostName, hostSocketId);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocket(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.getPlayerBySocket(socketId)) return room;
    }
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  // ── Validation ─────────────────────────────────────────────

  validateJoin(
    roomId: string
  ): { ok: true; room: Room } | { ok: false; reason: string } {
    const room = this.getRoom(roomId);
    if (!room) return { ok: false, reason: "Room not found" };
    if (room.isFull()) return { ok: false, reason: "Room is full" };
    if (room.status !== "waiting")
      return { ok: false, reason: "Game already started" };
    return { ok: true, room };
  }
}
