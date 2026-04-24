# RFC: Enterprise-Grade Real-Time Multiplayer Tic-Tac-Toe System Design

**Status:** Draft
**Author:** Principal Software Engineer (L7)
**Date:** 2026-04-21
**Complexity:** Medium (Multiplayer/Real-time)

---

## 1. Executive Summary

This document outlines the technical specification for a high-integrity, real-time multiplayer Tic-Tac-Toe application. The objective is to move beyond a simple "toy" implementation to an enterprise-grade architecture that emphasizes strict type safety, a single source of truth, and scalable monorepo management. The system will utilize a client-server model over WebSockets to ensure low-latency, bidirectional communication.

## 2. Monorepo Architecture

We will adopt a strict **npm workspaces** monorepo topology. This architecture enforces physical and logical separation between the presentation layer, the business logic/orchestration layer, and the shared domain models.

### Topology
- `apps/web`: A React-based frontend. Responsible for rendering the UI, managing local view-state, and maintaining a WebSocket client connection.
- `apps/server`: A Node.js server. The absolute source of truth. Responsible for game orchestration, room management, move validation, and state broadcasting.
- `packages/shared`: A pure TypeScript package. Contains the "Single Source of Truth" for all data contracts, enums, and validation schemas used by both `web` and `server`.

### Rationale
1. **Type Safety:** Changes to the data model in `shared` trigger immediate compilation errors in both `web` and `server`.
2. **Code Reuse:** Logic related to move validation (via Zod) and type definitions can be shared without duplication.
3. **Deployment Isolation:** The frontend and backend can be deployed to separate environments (e.g., Vercel for `web`, AWS/Render for `server`) while remaining in a single repository for atomic commits.

## 3. Domain Model & Data Contracts

All contracts are defined in `packages/shared` and are strictly typed. No `any` types are permitted.

### 3.1 Player Entities
```typescript
export type PlayerSymbol = 'X' | 'O';

export type PlayerStatus = 'IDLE' | 'IN_GAME' | 'DISCONNECTED';

export interface Player {
  readonly id: string; // UUID v4
  readonly name: string;
  readonly symbol: PlayerSymbol;
  readonly status: PlayerStatus;
}
```

### 3.2 Game State
```typescript
export type GameStatus = 'LOBBY' | 'PLAYING' | 'FINISHED';

export type Winner = Player['id'] | 'DRAW' | null;

export type BoardCell = PlayerSymbol | null;

export interface GameState {
  readonly roomId: string;
  readonly players: readonly [Player, Player];
  readonly board: readonly [
    BoardCell, BoardCell, BoardCell,
    BoardCell, BoardCell, BoardCell,
    BoardCell, BoardCell, BoardCell
  ];
  readonly currentTurnPlayerId: string;
  readonly winner: Winner;
  readonly status: GameStatus;
  readonly lastMoveAt: number; // Epoch timestamp
}
```

### 3.3 Move Payloads
```typescript
export interface MovePayload {
  readonly roomId: string;
  readonly playerId: string;
  readonly cellIndex: number; // 0-8
}
```

## 4. WebSocket Communication Protocol

Communication will occur over a persistent WebSocket connection. We will use a deterministic event dictionary to manage state transitions.

### 4.1 Event Dictionary

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `ROOM_JOIN_REQUEST` | Client $\rightarrow$ Server | `{ roomId: string, playerName: string }` | Request to join a specific room. |
| `ROOM_JOIN_SUCCESS` | Server $\rightarrow$ Client | `{ player: Player, gameState: GameState }` | Confirmation of join and initial state. |
| `MOVE_SUBMIT` | Client $\rightarrow$ Server | `MovePayload` | Request to place a symbol in a cell. |
| `STATE_SYNC` | Server $\rightarrow$ Client | `GameState` | Broadcast of the authoritative state. |
| `GAME_ERROR` | Server $\rightarrow$ Client | `{ code: string, message: string }` | Error notification (e.g., "Not your turn"). |

### 4.2 Data Flow Pattern
1. **Action:** Client triggers an action (e.g., clicks a cell) $\rightarrow$ Client emits `MOVE_SUBMIT`.
2. **Validation:** Server receives `MOVE_SUBMIT`, validates against current `GameState`.
3. **Mutation:** If valid, Server updates internal `GameState`.
4. **Broadcast:** Server emits `STATE_SYNC` to all clients in the room.
5. **Reconciliation:** Clients receive `STATE_SYNC` and update their local view.

## 5. Server-Side State Machine

The server is the **authoritative orchestrator**. It prevents client-side manipulation by ignoring any payload that violates the current state.

### 5.1 Room Routing
- Rooms are identified by high-entropy, cryptographically secure UUIDs.
- A `RoomManager` class will maintain an in-memory map of `roomId -> GameState`.

### 5.2 Validation Logic (The "Guardian")
For every `MOVE_SUBMIT`, the server must satisfy:
1. **Identity:** `payload.playerId` matches the connected socket session.
2. **Existence:** `roomId` exists and is in `PLAYING` status.
3. **Turn Order:** `payload.playerId === gameState.currentTurnPlayerId`.
4. **Availability:** `gameState.board[payload.cellIndex]` is `null`.
5. **Bounds:** `payload.cellIndex` is $\in [0, 8]$.

### 5.3 Win Detection
The server will run a deterministic win-check algorithm after every valid move. Upon detection of a win or a draw, the `GameState` status transitions to `FINISHED` and the `winner` field is populated.

## 6. Frontend Architecture (UI/UX)

The frontend will follow a minimalist, high-contrast corporate design system.

### 6.1 Component Tree
- `App` (Provider Wrapper: WebSocket & Theme)
  - `Layout` (Container with responsive padding)
    - `GameView` (Conditional rendering based on connection/room status)
      - `LobbyView` (Join form, room list)
      - `GameBoardView` (Main gameplay)
        - `PlayerInfoBar` (Status of X and O)
        - `Grid` (The 3x3 board)
          - `Cell` (Interactive primitive)
        - `GameStatusBanner` (Win/Draw/Turn indicator)
      - `ErrorOverlay` (Transient error notifications)

### 6.2 Design System
- **Styling:** Tailwind CSS for utility-first, rapid styling.
- **Primitives:** Radix UI / Shadcn/ui for accessible components (Dialogs, Buttons, Toast).
- **Visual Language:** 
  - Neutral palette (Slate/Zinc).
  - Semantic colors: Primary (Blue/Indigo), Success (Emerald), Danger (Rose).
  - Strict spacing and typographic hierarchy.

## 7. Execution Sequence

Implementation will proceed in the following rigid phases:

1.  **Phase 1: Foundation (The Contracts)**
    - Initialize npm workspaces.
    - Implement `packages/shared` with all TypeScript interfaces and Zod schemas.
2.  **Phase 2: The Brain (The Server)**
    - Implement `apps/server` core: WebSocket handler, `RoomManager`, and the `GameState` transition logic.
    - Validate server logic with unit tests (no client required).
3.  **Phase 3: The Interface (The Client)**
    - Implement `apps/web` scaffolding with Tailwind and Shadcn.
    - Implement WebSocket client service and state reconciliation.
4.  **Phase 4: Integration & Hardening**
    - Full end-to-end testing of the game loop.
    - Error handling implementation (reconnection logic, invalid move feedback).
