// GameControls.js
// Component for game control buttons (Hit and Stand)

import React from 'react';
import axios from 'axios';

function GameControls({ onGameUpdate }) {
  const handleHit = async () => {
    try {
      const response = await axios.post('/api/game/:gameId/hit');
      onGameUpdate(response.data.data);
    } catch (error) {
      console.error('Error hitting:', error);
    }
  };

  const handleStand = async () => {
    try {
      const response = await axios.post('/api/game/:gameId/stand');
      onGameUpdate(response.data.data);
    } catch (error) {
      console.error('Error standing:', error);
    }
  };

  return (
    <div className="game-controls">
      <button onClick={handleHit}>Hit</button>
      <button onClick={handleStand}>Stand</button>
    </div>
  );
}

export default GameControls;