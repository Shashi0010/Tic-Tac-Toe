import { z } from 'zod';
export type PlayerSymbol = 'X' | 'O';
export declare const PlayerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodEnum<["X", "O"]>;
}, "strip", z.ZodTypeAny, {
    symbol: "X" | "O";
    id: string;
    name: string;
}, {
    symbol: "X" | "O";
    id: string;
    name: string;
}>;
export type Player = z.infer<typeof PlayerSchema>;
export declare const GameStatusSchema: z.ZodEnum<["LOBBY", "PLAYING", "FINISHED"]>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export type Winner = string | 'DRAW' | null;
export type BoardCell = PlayerSymbol | null;
export declare const GameStateSchema: z.ZodObject<{
    roomId: z.ZodString;
    status: z.ZodEnum<["LOBBY", "PLAYING", "FINISHED"]>;
    players: z.ZodTuple<[z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodEnum<["X", "O"]>;
    }, "strip", z.ZodTypeAny, {
        symbol: "X" | "O";
        id: string;
        name: string;
    }, {
        symbol: "X" | "O";
        id: string;
        name: string;
    }>>, z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodEnum<["X", "O"]>;
    }, "strip", z.ZodTypeAny, {
        symbol: "X" | "O";
        id: string;
        name: string;
    }, {
        symbol: "X" | "O";
        id: string;
        name: string;
    }>>], null>;
    currentTurnPlayerId: z.ZodNullable<z.ZodString>;
    board: z.ZodTuple<[z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>, z.ZodNullable<z.ZodEnum<["X", "O"]>>], null>;
    winner: z.ZodNullable<z.ZodString>;
    scores: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "LOBBY" | "PLAYING" | "FINISHED";
    roomId: string;
    players: [{
        symbol: "X" | "O";
        id: string;
        name: string;
    } | null, {
        symbol: "X" | "O";
        id: string;
        name: string;
    } | null];
    currentTurnPlayerId: string | null;
    board: ["X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null];
    winner: string | null;
    scores: Record<string, number>;
}, {
    status: "LOBBY" | "PLAYING" | "FINISHED";
    roomId: string;
    players: [{
        symbol: "X" | "O";
        id: string;
        name: string;
    } | null, {
        symbol: "X" | "O";
        id: string;
        name: string;
    } | null];
    currentTurnPlayerId: string | null;
    board: ["X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null, "X" | "O" | null];
    winner: string | null;
    scores: Record<string, number>;
}>;
export type GameState = z.infer<typeof GameStateSchema>;
export declare const MoveSchema: z.ZodObject<{
    roomId: z.ZodString;
    playerId: z.ZodString;
    cellIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    roomId: string;
    playerId: string;
    cellIndex: number;
}, {
    roomId: string;
    playerId: string;
    cellIndex: number;
}>;
export type MovePayload = z.infer<typeof MoveSchema>;
export declare const JoinRequestSchema: z.ZodObject<{
    roomId: z.ZodString;
    playerName: z.ZodString;
    symbol: z.ZodEnum<["X", "O"]>;
}, "strip", z.ZodTypeAny, {
    symbol: "X" | "O";
    roomId: string;
    playerName: string;
}, {
    symbol: "X" | "O";
    roomId: string;
    playerName: string;
}>;
