"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    rooms = new Map();
    playersBySocketId = new Map();
    getPlayerBySocketId(socketId) {
        return this.playersBySocketId.get(socketId);
    }
    registerPlayer(socketId, name, symbol) {
        const existing = this.playersBySocketId.get(socketId);
        if (existing) {
            return existing;
        }
        const player = {
            id: crypto.randomUUID(),
            name,
            symbol,
            status: 'IDLE',
        };
        this.playersBySocketId.set(socketId, player);
        return player;
    }
    unregisterPlayer(socketId) {
        this.playersBySocketId.delete(socketId);
        for (const [roomId, room] of this.rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p?.id === socketId);
            if (playerIndex !== -1) {
                const updatedPlayers = [...room.players];
                updatedPlayers[playerIndex] = null;
                if (!updatedPlayers[0] && !updatedPlayers[1]) {
                    this.rooms.delete(roomId);
                }
                else {
                    const updatedRoom = { ...room, players: updatedPlayers };
                    this.rooms.set(roomId, updatedRoom);
                }
            }
        }
    }
    joinOrCreateRoom(roomId, playerName, playerSymbol, socketId) {
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
            const newState = {
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
        }
        else {
            const updatedPlayers = [existingState.players[0], player];
            const updatedScores = { ...existingState.scores };
            if (!(player.id in updatedScores)) {
                updatedScores[player.id] = 0;
            }
            const newState = {
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
    submitMove(payload) {
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
        const newBoard = [...gameState.board];
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
        let nextPlayerId = gameState.currentTurnPlayerId;
        if (status === 'PLAYING') {
            const players = gameState.players;
            const currentIndex = players.findIndex(p => p?.id === payload.playerId);
            const nextIndex = (currentIndex + 1) % 2;
            nextPlayerId = players[nextIndex]?.id || null;
        }
        const newState = {
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
    resetGame(roomId) {
        const gameState = this.rooms.get(roomId);
        if (!gameState) {
            return undefined;
        }
        const newState = {
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
    calculateWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6], // Diagonals
        ];
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (!board.includes(null)) {
            return 'DRAW';
        }
        return null;
    }
}
exports.RoomManager = RoomManager;
