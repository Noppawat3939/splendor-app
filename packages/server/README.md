# Server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

---

## Mode 1 — Online Multiplayer

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Host
    participant Guest
    participant CurrentPlayer
    participant Server
    participant Others

    %% 1. Create & Join Room
    Host->>Server: create_room { playerName }
    Note right of Server: generate roomId (6 chars)\n create Room\n add Host
    Server-->>Host: room_created { roomId, players }

    Guest->>Server: join_room { roomId, playerName }
    Note right of Server: validate roomId\n check capacity\n ensure not started\n add Guest
    Server-->>Host: player_joined { players }
    Server-->>Guest: player_joined { players }

    %% 2. Ready & Start
    Host->>Server: player_ready
    Guest->>Server: player_ready
    Note right of Server: if all ready\n createGame()\n shuffle deck\n assign nobles
    Server-->>Host: game_started { gameState }
    Server-->>Guest: game_started { gameState }

    %% 3. Submit Action
    CurrentPlayer->>Server: submit_action { roomId, action }
    Note right of Server: validate currentPlayer\n validate action

    alt invalid action
        Server-->>CurrentPlayer: action_error { message }
    else valid action
        Note right of Server: applyAction()\n checkNobles()\n advanceTurn()\n persist state
        Server-->>CurrentPlayer: state_updated { gameState }
        Server-->>Others: state_updated { gameState }
    end

    %% 4. Disconnect & Reconnect
    CurrentPlayer->>Server: disconnect
    Note right of Server: mark disconnected\n start 30s timer\n if currentPlayer → auto skip turn

    Server-->>Others: player_disconnected { playerId, timeoutSec: 30 }
    Server-->>Others: state_updated { gameState }

    alt reconnect within 30s
        CurrentPlayer->>Server: reconnect { roomId, playerId }
        Note right of Server: clear timer\n remap socket
        Server-->>CurrentPlayer: reconnected { gameState }
        Server-->>Others: player_reconnected { playerId }
    else timeout exceeded
        Note right of Server: kick player\n check remaining players
        Server-->>Others: player_kicked { playerId }

        opt only 1 player left
            Server-->>Others: game_ended { winner, gameState }
        end
    end

    %% 5. Leave Room
    CurrentPlayer->>Server: leave_room { roomId }
    Note right of Server: remove player\n delete room if empty

    Server-->>Others: player_left { playerId }

    opt only 1 player left
        Server-->>Others: game_ended { winner, gameState }
    end
```
