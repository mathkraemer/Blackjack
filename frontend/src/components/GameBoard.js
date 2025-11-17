// GameBoard.js
// Main game interface component

import React, { useState } from 'react';
import PlayerHand from './PlayerHand';
import DealerHand from './DealerHand';
import GameControls from './GameControls';
import GameStats from './GameStats';

function GameBoard() {
  const [gameState, setGameState] = useState(null);

  const handleGameUpdate = (newState) => {
    setGameState(newState);
  };

  return (
    <div className="game-board">
      <h1>Blackjack</h1>
      <DealerHand hand={gameState?.dealerHand} />
      <PlayerHand hand={gameState?.playerHand} />
      <GameControls onGameUpdate={handleGameUpdate} />
      <GameStats stats={gameState} />
    </div>
  );
}

export default GameBoard;