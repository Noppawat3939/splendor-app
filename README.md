# Splendor — Project Structure (Planning)

> สถานะ: วางแผน | ยังไม่มี repo
> เป้าหมาย: Web-based Splendor, 2–4 ผู้เล่น, รองรับ AI ในอนาคต

---

## Tech Stack

| Layer       | เลือกใช้          | หมายเหตุ                          |
| ----------- | ----------------- | --------------------------------- |
| Language    | TypeScript        | ทั้ง frontend และ logic           |
| Frontend    | React + Vite      | fast dev server, HMR              |
| Styling     | Tailwind CSS      | utility-first                     |
| State       | Zustand           | เบากว่า Redux เหมาะกับ game state |
| Multiplayer | Socket.io         | real-time, 2-way communication    |
| Backend     | Node.js + Express | host game session                 |
| Testing     | Vitest            | compatible กับ Vite               |

---

## Project Structure

```
splendor/
│
├── packages/                        # monorepo (แนะนำ)
│   ├── core/                        # ✅ core logic (ไม่ขึ้นกับ UI หรือ server)
│   │   ├── src/
│   │   │   ├── splendor.types.ts    # ✅ สร้างแล้ว
│   │   │   ├── splendor.data.ts     # ✅ สร้างแล้ว
│   │   │   ├── splendor.engine.ts   # ✅ สร้างแล้ว
│   │   │   ├── splendor.setup.ts    # ✅ สร้างแล้ว
│   │   │   └── splendor.ai.ts       # 🔲 AI logic (อนาคต)
│   │   ├── tests/
│   │   │   ├── engine.test.ts       # 🔲 unit tests
│   │   │   ├── setup.test.ts        # 🔲 unit tests
│   │   │   └── ai.test.ts           # 🔲 unit tests
│   │   └── package.json
│   │
│   ├── client/                      # React frontend
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx         # หน้าหลัก, เลือกโหมด
│   │   │   │   ├── Lobby.tsx        # สร้าง/เข้าห้อง, ตั้งชื่อผู้เล่น
│   │   │   │   └── Game.tsx         # หน้าเล่นจริง
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── board/
│   │   │   │   │   ├── Board.tsx        # layout หลักของเกม
│   │   │   │   │   ├── CardRow.tsx      # การ์ด 4 ใบต่อ tier
│   │   │   │   │   ├── CardTile.tsx     # การ์ดแต่ละใบ
│   │   │   │   │   ├── NobleTile.tsx    # noble แต่ละใบ
│   │   │   │   │   └── GemBank.tsx      # token กลาง
│   │   │   │   │
│   │   │   │   ├── player/
│   │   │   │   │   ├── PlayerPanel.tsx  # แสดงข้อมูลผู้เล่น
│   │   │   │   │   ├── TokenHand.tsx    # token ในมือ
│   │   │   │   │   └── ReservedCards.tsx
│   │   │   │   │
│   │   │   │   ├── actions/
│   │   │   │   │   ├── GemPicker.tsx    # UI เลือก gem
│   │   │   │   │   └── ActionModal.tsx  # confirm action
│   │   │   │   │
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── Toast.tsx        # แสดง error / event
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── gameStore.ts     # Zustand — game state
│   │   │   │   └── socketStore.ts   # Zustand — socket connection
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useGame.ts       # read game state + dispatch action
│   │   │   │   ├── useSocket.ts     # connect / emit / listen
│   │   │   │   └── useLegalActions.ts  # getLegalActions wrapper
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── gemColor.ts      # color map สีแต่ละ gem
│   │   │       └── format.ts        # แปลงข้อมูลสำหรับ display
│   │   │
│   │   ├── public/
│   │   │   └── assets/              # รูปการ์ด, noble, gem icons
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── server/                      # Node.js backend (multiplayer)
│       ├── src/
│       │   ├── index.ts             # Express + Socket.io entry
│       │   │
│       │   ├── rooms/
│       │   │   ├── RoomManager.ts   # สร้าง / เข้า / ออกห้อง
│       │   │   └── Room.ts          # state ของแต่ละห้อง
│       │   │
│       │   ├── socket/
│       │   │   ├── gameHandler.ts   # จัดการ event จาก client
│       │   │   └── events.ts        # enum ชื่อ event ทั้งหมด
│       │   │
│       │   └── utils/
│       │       └── logger.ts
│       │
│       └── package.json
│
├── package.json                     # root (monorepo workspace)
├── tsconfig.base.json
└── README.md
```

---

## Socket Events (Multiplayer)

```
Client → Server
─────────────────────────────────
create_room       { playerName }
join_room         { roomId, playerName }
player_ready      { roomId }
submit_action     { roomId, action }
leave_room        { roomId }

Server → Client
─────────────────────────────────
room_created      { roomId, gameState }
room_joined       { gameState, players }
game_started      { gameState }
state_updated     { gameState }          ← หลังทุก action
action_error      { message }
game_ended        { winner, gameState }
player_left       { playerId }
```

---

## Data Flow

```
[Client A]                [Server]               [Client B]
    |                        |                        |
    |-- submit_action ------>|                        |
    |                        |-- applyAction()        |
    |                        |   (core package)       |
    |                        |-- new GameState        |
    |<-- state_updated ------|                        |
    |                        |-- state_updated ------>|
    |  update Zustand        |                   update Zustand
    |  React re-render       |                   React re-render
```

---

## Game Modes

| โหมด                | ต้องการ Server? | สถานะ                            |
| ------------------- | --------------- | -------------------------------- |
| Local (pass & play) | ไม่             | เล่นได้ทันทีใช้แค่ core + client |
| vs AI               | ไม่             | รอ splendor.ai.ts                |
| Online multiplayer  | ✅              | ต้องการ server package           |

---

## Development Order

```
Phase 1 — Core logic ✅
  splendor.types.ts
  splendor.data.ts
  splendor.engine.ts
  splendor.setup.ts

Phase 2 — Tests 🔲
  ติดตั้ง Vitest
  เขียน unit test ทุก action
  เช็ค edge cases (wild gem, noble trigger, last round)

Phase 3 — Client (Local play) 🔲
  สร้าง Vite + React + Tailwind
  Board layout
  Local multiplayer (pass & play) ก่อน

Phase 4 — AI 🔲
  splendor.ai.ts
  Easy: random legal action
  Medium: greedy scoring
  Hard: heuristic lookahead

Phase 5 — Server + Multiplayer 🔲
  Express + Socket.io
  Room system
  Sync game state ระหว่าง clients

Phase 6 — Polish 🔲
  Animations
  Sound effects
  Responsive (mobile)
  Error handling / reconnect
```

---

## Notes

- `packages/core` ไม่มี dependency ภายนอกเลย import ได้ทั้ง client และ server
- game state เป็น immutable ทุก action return state ใหม่ ง่ายต่อการ sync และ undo
- server ไม่ trust client — validate action ด้วย engine เสมอก่อน broadcast
- AI ใช้ `getLegalActions()` + `applyAction()` เหมือน human player
