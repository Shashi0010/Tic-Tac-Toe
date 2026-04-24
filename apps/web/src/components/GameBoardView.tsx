import { type GameState } from '@tic-tac-toe/shared';

interface GameBoardViewProps {
  gameState: GameState;
  player: any;
  submitMove: (cellIndex: number) => void;
  resetGame?: () => void;
}

export function GameBoardView({ gameState, player, submitMove, resetGame }: GameBoardViewProps) {
  if (!gameState || !player) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Connecting...</div>;

  const isMyTurn = gameState.currentTurnPlayerId === player.id;
  const isGameOver = gameState.status === 'FINISHED';
  const playerX = gameState.players.find(p => p?.symbol === 'X');
  const playerO = gameState.players.find(p => p?.symbol === 'O');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 overflow-hidden">
      <div className="animate-game-enter w-[340px] space-y-8 relative z-10">

        <div className="flex justify-between w-full px-2 mb-2 tracking-widest uppercase text-xs font-bold">
          <div className={`flex flex-col items-start ${gameState.currentTurnPlayerId === playerX?.id ? 'animate-pulse-glow text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 'text-slate-500'}`}>
            <span>{playerX ? playerX.name : 'Waiting...'} <span className="ml-2 px-2 py-1 bg-black/10 dark:bg-white/10 rounded-md font-mono text-sm">Score: {gameState.scores?.[playerX?.id || ''] || 0}</span></span>
            <span className="text-2xl">X</span>
          </div>
          <div className={`flex flex-col items-end ${gameState.currentTurnPlayerId === playerO?.id ? 'animate-pulse-glow text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'text-slate-500'}`}>
            <span>{playerO ? playerO.name : 'Waiting...'} <span className="ml-2 px-2 py-1 bg-black/10 dark:bg-white/10 rounded-md font-mono text-sm">Score: {gameState.scores?.[playerO?.id || ''] || 0}</span></span>
            <span className="text-2xl">O</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {gameState.board.map((cell, index) => {
            const isClickable = gameState.status === 'PLAYING' && !isGameOver && isMyTurn && cell === null;
            return (
              <button
                key={index}
                onClick={() => isClickable && submitMove(index)}
                disabled={!isClickable}
                className={`aspect-square rounded-2xl bg-white/5 border border-white/20 shadow-sm text-7xl font-black flex items-center justify-center transition-all duration-300 ${isClickable ? 'hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-90 cursor-pointer' : 'cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white/5'} ${cell === 'X' ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]' : ''} ${cell === 'O' ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]' : ''}`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        <div className="min-h-[80px] flex justify-center items-center">
          {isGameOver ? (
            <div
              onClick={resetGame}
              className="animate-win-pop cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600/90 to-purple-600/90 border border-white/20 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white font-black tracking-wide"
            >
              <span>{gameState.winner === 'DRAW' ? "It's a Draw!" : `${gameState.players.find(p => p?.id === gameState.winner || p?.symbol === gameState.winner)?.name} Wins!`}</span>
            </div>
          ) : (
            <div className="text-sm font-medium tracking-widest uppercase text-slate-500">
              {gameState.status !== 'PLAYING' ? 'Waiting for opponent...' : (isMyTurn ? 'Your Turn' : 'Opponent Thinking...')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
