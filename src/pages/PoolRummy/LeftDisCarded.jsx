import React from "react";
import Card from "./Card"; // Adjust import paths as needed
import DeckStack from "./DeckStack";

const LeftDiscarded = ({
  jokerCard,
  deck = [],
  playersHands,
  pickFromDeck,
  pickFromDiscardPile,
  leftDeck,
  discardedPile,
  discardRef,
  setDiscardTarget
}) => {
  return (
    <div className="flex items-center justify-between w-full mt-4">
      {/* Left - Joker + Deck + Draw */}
      <div className="-mt-10">
        {/* Joker card (rotated) */}
        {jokerCard?.length>0 && (
          <div className="-mb-10 -ml-3 transform -rotate-90">
            <Card card={jokerCard[0]} />
          </div>
        )}
        {/* Deck stack */}
        <div onClick={pickFromDeck} className="cursor-pointer ml-16">
          <DeckStack count={leftDeck.length} />
        </div>
      </div>

      {/* Right - Discard pile */}
      <div className="relative w-16 h-24">
       
        {/* Topmost card */}
        {discardedPile!==null && (
          <div
          ref={discardRef}
            onClick={pickFromDiscardPile}
            className="absolute top-0 left-2 transform rotate-[0deg] z-20 cursor-pointer"
          >
            <Card card={discardedPile} faceDown={false} />
          </div>
        )}

        {/* Optional arrow */}
        <div className="absolute right-[60px] top-[20%] transform -translate-y-1/2 z-30">
          <span className="text-white text-lg font-bold">»</span>
        </div>
      </div>
    </div>
  );
};

export default LeftDiscarded;
