import { z } from 'zod';

export type PlayerSymbol = 'X' | 'O';

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.enum(['X', 'O']),
});
export type Player = z.infer<typeof PlayerSchema>;

export const GameStatusSchema = z.enum(['LOBBY', 'PLAYING', 'FINISHED']);
export type GameStatus = z.infer<typeof GameStatusSchema>;

export type Winner = string | 'DRAW' | null; // Player['id'] is a string

export type BoardCell = PlayerSymbol | null;

export const GameStateSchema = z.object({
  roomId: z.string(),
  status: GameStatusSchema,
  players: z.tuple([PlayerSchema.nullable(), PlayerSchema.nullable()]),
  currentTurnPlayerId: z.string().nullable(),
  board: z.tuple([
    z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(),
    z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(),
    z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(), z.enum(['X', 'O']).nullable(),
  ]),
  winner: z.string().nullable(),
  scores: z.record(z.string(), z.number()),
});
export type GameState = z.infer<typeof GameStateSchema>;

export const MoveSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  cellIndex: z.number().int().min(0).max(8),
});
export type MovePayload = z.infer<typeof MoveSchema>;

export const JoinRequestSchema = z.object({
  roomId: z.string(),
  playerName: z.string(),
  symbol: z.enum(['X', 'O']),
});
