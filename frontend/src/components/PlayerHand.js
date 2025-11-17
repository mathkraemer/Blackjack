// PlayerHand.js
// Component to display the player's cards

import React from 'react';

function PlayerHand({ hand }) {
  return (
    <div className="player-hand">
      <h2>Player's Hand</h2>
      <div className="cards">
        {hand?.map((card, index) => (
          <div key={index} className="card">
            {card.rank} of {card.suit}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerHand;