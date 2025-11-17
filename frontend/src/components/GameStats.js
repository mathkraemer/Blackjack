// GameStats.js
// Component to display game statistics

import React from 'react';

function GameStats({ stats }) {
  return (
    <div className="game-stats">
      <h2>Game Stats</h2>
      <p>Player Score: {stats?.playerScore}</p>
      <p>Dealer Score: {stats?.dealerScore}</p>
      <p>Game Status: {stats?.gameStatus}</p>
    </div>
  );
}

export default GameStats;