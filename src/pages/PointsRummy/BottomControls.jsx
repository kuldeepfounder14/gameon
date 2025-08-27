import React from "react";

const BottomControls = ({
  sortCards,
  playersHands,
  yourPlayerKey,
  score = 80,
  discardCardFromHandFinally,
  canDeclare,
  cardDiscardedFromHand,
  declareAfterFinally,
  handleDeclare,
}) => {
  const showSortButton = playersHands?.[yourPlayerKey]?.length > 0;
console.log("playersHands[yourPlayerKey]",playersHands[yourPlayerKey])
console.log("declareAfterFinally",declareAfterFinally,cardDiscardedFromHand)
  return (
    <div className="flex justify-between items-center w-full max-w-md mt-4">
      {/* Left - Score & Round */}
      <div className="flex items-center gap-2">
        {/* <div className="bg-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          {round}
        </div> */}
        <div className="text-white text-xs">
          Score: <span className="font-bold">💰 {score}</span>
        </div>
      </div>

      {/* Right - Buttons */}
      {/* <div className="flex gap-2 mt-4">
        {
          cardDiscardedFromHand!==null && (
            <button
              className="bg-green px-4 h-10 rounded text-white "
              onClick={discardCardFromHandFinally}
            >
              Declare 
            </button>
          )}
        { declareAfterFinally && (
          <button
            className="bg-green px-4 h-10 rounded text-white "
            onClick={handleDeclare}
          >
            Declare
          </button>
        )}

       
      </div> */}
    </div>
  );
};

export default BottomControls;
