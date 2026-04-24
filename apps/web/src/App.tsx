import React from 'react';
import { LobbyView } from './components/LobbyView';
import { GameBoardView } from './components/GameBoardView';
import { useGameSocket } from './hooks/useGameSocket';

export default function App() {
  const { player, gameState, submitMove, resetGame } = useGameSocket();

  if (gameState && player) {
    return <GameBoardView gameState={gameState} player={player} submitMove={submitMove} resetGame={resetGame} />;
  }

  return <LobbyView />;
}
