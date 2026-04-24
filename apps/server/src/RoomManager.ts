import { GameState, Player, PlayerSymbol, GameStatus, BoardCell, Winner } from '@tic-tac-toe/shared';

export class RoomManager {
  private rooms: Map<string, GameState> = new Map();
  private playersBySocketId: Map<string, Player> = new Map();

  public getPlayerBySocketId(socketId: string): Player | undefined {
    return this.playersBySocketId.get(socketId);
  }

  public registerPlayer(socketId: string, name: string, symbol: PlayerSymbol): Player {
    const existing = this.playersBySocketId.get(socketId);
    if (existing) {
      return existing;
    }
    const player: Player = {
      id: crypto.randomUUID(),
      name,
      symbol,
      status: 'IDLE' as any,
    };
    this.playersBySocketId.set(socketId, player);
    return player;
  }

  public unregisterPlayer(socketId: string): void {
    this.playersBySocketId.delete(socketId);
    for (const [roomId, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p?.id === socketId);
      if (playerIndex !== -1) {
        const updatedPlayers = [...room.players] as any;
        updatedPlayers[playerIndex] = null;
        if (!updatedPlayers[0] && !updatedPlayers[1]) {
          this.rooms.delete(roomId);
        } else {
          const updatedRoom: any = { ...room, players: updatedPlayers };
          this.rooms.set(roomId, updatedRoom);
        }
      }
    }
  }

  public joinOrCreateRoom(roomId: string, playerName: string, playerSymbol: PlayerSymbol, socketId: string): { player: Player, gameState: GameState } {
    let existingState = this.rooms.get(roomId);
    const player = this.registerPlayer(socketId, playerName, playerSymbol);

    if (existingState) {
      const isAlreadyInRoom = existingState.players.some(p => p && p.id === player.id);
      if (isAlreadyInRoom) {
        return { player, gameState: existingState };
      }

      if (existingState.status !== 'LOBBY') {
        throw new Error("Room is already in progress");
      }
    }

    if (!existingState) {
      const newState: any = {
        roomId,
        players: [player, null],
        board: [null, null, null, null, null, null, null, null, null],
        currentTurnPlayerId: player.id,
        winner: null,
        status: 'LOBBY',
        lastMoveAt: Date.now(),
        scores: { [player.id]: 0 },
      };
      this.rooms.set(roomId, newState);
      return { player, gameState: newState };
    } else {
      const updatedPlayers = [existingState.players[0], player];
      const updatedScores = { ...existingState.scores };
      if (!(player.id in updatedScores)) {
        updatedScores[player.id] = 0;
      }
      const newState: any = {
        ...existingState,
        players: updatedPlayers,
        status: 'PLAYING',
        lastMoveAt: Date.now(),
        scores: updatedScores,
      };
      this.rooms.set(roomId, newState);
      return { player, gameState: newState };
    }
  }

  public submitMove(payload: { roomId: string, playerId: string, cellIndex: number }): { success: true, newState: GameState } | { success: false, error: string } {
    const gameState = this.rooms.get(payload.roomId);
    if (!gameState) {
      return { success: false, error: "Room not found" };
    }

    if (gameState.status !== 'PLAYING') {
      return { success: false, error: "Game is not in playing state" };
    }

    if (payload.playerId !== gameState.currentTurnPlayerId) {
      return { success: false, error: "Not your turn" };
    }

    if (payload.cellIndex < 0 || payload.cellIndex > 8) {
      return { success: false, error: "Invalid cell index" };
    }

    if (gameState.board[payload.cellIndex] !== null) {
      return { success: false, error: "Cell already occupied" };
    }

    const newBoard = [...gameState.board] as (PlayerSymbol | null)[];
    const currentPlayer = gameState.players.find(p => p?.id === payload.playerId);
    if (!currentPlayer) {
        return { success: false, error: "Player not found in game" };
    }
    newBoard[payload.cellIndex] = currentPlayer.symbol;

    const winnerSymbol = this.calculateWinner(newBoard);
    const status = winnerSymbol ? 'FINISHED' : 'PLAYING';
    let updatedScores = { ...gameState.scores };

    if (status === 'FINISHED' && typeof winnerSymbol === 'string') {
      const winnerPlayer = gameState.players.find(p => p?.symbol === winnerSymbol);
      if (winnerPlayer) {
        updatedScores[winnerPlayer.id] = (updatedScores[winnerPlayer.id] || 0) + 1;
      }
    }

    let nextPlayerId: string | null = gameState.currentTurnPlayerId;
    if (status === 'PLAYING') {
        const players = gameState.players;
        const currentIndex = players.findIndex(p => p?.id === payload.playerId);
        const nextIndex = (currentIndex + 1) % 2;
        nextPlayerId = players[nextIndex]?.id || null;
    }

    const newState: any = {
      ...gameState,
      board: newBoard,
      winner: winnerSymbol,
      status: status,
      currentTurnPlayerId: nextPlayerId,
      lastMoveAt: Date.now(),
      scores: updatedScores,
    };

    this.rooms.set(payload.roomId, newState);
    return { success: true, newState };
  }

  public resetGame(roomId: string): GameState | undefined {
    const gameState = this.rooms.get(roomId);
    if (!gameState) {
      return undefined;
    }

    const newState: any = {
      ...gameState,
      board: [null, null, null, null, null, null, null, null, null],
      winner: null,
      status: 'PLAYING',
      currentTurnPlayerId: gameState.players.find(p => p?.symbol === 'X')?.id || gameState.players[0]?.id || null,
      lastMoveAt: Date.now(),
    };

    this.rooms.set(roomId, newState);
    return newState;
  }

  private calculateWinner(board: (PlayerSymbol | null)[]): Winner {
    const winPatterns: number[][] = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6],             // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as PlayerSymbol;
      }
    }

    if (!board.includes(null)) {
      return 'DRAW';
    }

    return null;
  }
}
