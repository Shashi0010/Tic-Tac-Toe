import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { GameState, Player, PlayerSymbol } from '@tic-tac-toe/shared';

// 1. Move socket OUTSIDE the hook. It connects exactly once.
const serverUrl = import.meta.env.PROD
  ? 'https://tic-tac-toe-server-3dd0.onrender.com'
  : 'http://localhost:3001';

const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
});

export function useGameSocket() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // 2. Safely wire up events without recreating the socket
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    function onRoomJoinSuccess(data: { player: Player; gameState: GameState }) {
      setPlayer(data.player);
      setGameState(data.gameState);
      setError(null);
    }

    function onStateSync(data: GameState) {
      setGameState(data);
    }

    function onGameError(err: { code: string; message: string }) {
      setError(err);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ROOM_JOIN_SUCCESS', onRoomJoinSuccess);
    socket.on('STATE_SYNC', onStateSync);
    socket.on('GAME_ERROR', onGameError);

    // 3. Clean up listeners on unmount, but leave the socket alive
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ROOM_JOIN_SUCCESS', onRoomJoinSuccess);
      socket.off('STATE_SYNC', onStateSync);
      socket.off('GAME_ERROR', onGameError);
    };
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string, symbol: PlayerSymbol) => {
    socket.emit('ROOM_JOIN_REQUEST', { roomId, playerName, symbol });
  }, []);

  const submitMove = useCallback((cellIndex: number) => {
    if (gameState && player) {
      socket.emit('MOVE_SUBMIT', {
        roomId: gameState.roomId,
        playerId: player.id,
        cellIndex,
      });
    }
  }, [gameState, player]);

  const resetGame = useCallback(() => {
    if (gameState) {
      socket.emit('RESET_GAME', { roomId: gameState.roomId });
    }
  }, [gameState]);

  return { player, gameState, isConnected, error, joinRoom, submitMove, resetGame };
}
