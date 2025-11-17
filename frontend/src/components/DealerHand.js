// DealerHand.js
// Component to display the dealer's cards

import React from 'react';

function DealerHand({ hand }) {
  return (
    <div className="dealer-hand">
      <h2>Dealer's Hand</h2>
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

export default DealerHand;