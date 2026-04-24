import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import crypto from 'crypto';
import { RoomManager } from './RoomManager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('ROOM_JOIN_REQUEST', (data) => {
    try {
      const { roomId, playerName, symbol } = data;

      // Find or create room
      const roomIdToUse = roomId === 'new' ? crypto.randomUUID() : roomId;

      const { player, gameState } = roomManager.joinOrCreateRoom(roomIdToUse, playerName, symbol, socket.id);

      // Register the socket to the room in socket.io sense
      socket.join(roomIdToUse);

      // Emit success to the joining player
      socket.emit('ROOM_JOIN_SUCCESS', { player, gameState });

      // Notify others in the room about the new player/state change
      socket.to(roomIdToUse).emit('STATE_SYNC', gameState);

      console.log(`Player ${player.name} (${player.id}) joined room ${roomIdToUse}`);
      } catch (error) {
        console.error('Join error:', error instanceof Error ? error.message : "Unknown error");
        socket.emit('GAME_ERROR', {
          code: 'JOIN_FAILED',
          message: error instanceof Error ? error.message : 'Invalid join request'
        });
      }
    });

  socket.on('RESET_GAME', (data) => {
    try {
      const { roomId } = data;
      const newState = roomManager.resetGame(roomId);

      if (newState) {
        io.to(roomId).emit('STATE_SYNC', newState);
        console.log(`Game reset in room ${roomId}`);
      } else {
        socket.emit('GAME_ERROR', {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        });
      }
    } catch (error) {
      console.error('Reset error:', error instanceof Error ? error.message : "Unknown error");
      socket.emit('GAME_ERROR', {
        code: 'MALFORMED_PAYLOAD',
        message: 'Invalid reset request payload format'
      });
    }
  });

  socket.on('MOVE_SUBMIT', (data) => {
    try {
      const { roomId, playerId, cellIndex } = data;
      const result = roomManager.submitMove({ roomId, playerId, cellIndex });

      if (result.success) {
        // Broadcast the new state to everyone in the room
        io.to(roomId).emit('STATE_SYNC', result.newState);
        console.log(`Move accepted in room ${roomId} by player ${playerId}`);
      } else {
        // Notify only the sender of the error
        socket.emit('GAME_ERROR', {
          code: 'INVALID_MOVE',
          message: result.error
        });
      }
    } catch (error) {
      console.error('Move error:', error instanceof Error ? error.message : "Unknown error");
      socket.emit('GAME_ERROR', {
        code: 'MALFORMED_PAYLOAD',
        message: 'Invalid move payload format'
      });
    }
  });

  socket.on('disconnect', () => {
    const player = roomManager.getPlayerBySocketId(socket.id);
    if (player) {
      console.log(`Player ${player.name} (${player.id}) disconnected. Cleaning up.`);
      roomManager.unregisterPlayer(socket.id);
    } else {
      console.log(`User disconnected: ${socket.id}`);
      roomManager.unregisterPlayer(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
