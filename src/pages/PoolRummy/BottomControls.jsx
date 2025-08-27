import React from "react";

const BottomControls = ({
  sortCards,
  playersHands,
  yourPlayerKey,
  score = 80,
handleDeclare ,
canDeclare 
}) => {
  const showSortButton = playersHands?.[yourPlayerKey]?.length > 0;

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
      <div className="flex gap-2 mt-4">
        {playersHands[yourPlayerKey]?.length === 13 && (
          <button
            className="bg-green px-4 h-10 rounded text-white "
            onClick={handleDeclare}
          >
            Declare
          </button>
        )}

        {showSortButton && (
          <button
            onClick={sortCards}
            className="bg-blue-700 h-10 text-white px-4 rounded text-sm"
          >
            Sort
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomControls;
