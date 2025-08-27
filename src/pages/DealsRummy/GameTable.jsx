import React, { useEffect, useState } from "react";
import Player from "./Player";
import Card from "./card";
import table from "../../assets/rummy/images/tableH.png";
import { fullDeck } from "./deck"; // assuming correct import path

const GameTable = ({
  message,
  gameStartTimer,
  lockMessageShown,
  tossWinnerMessage,
  playerPositions,
  showRemainingCards,
  jokerCard,
  discardPile,
  roomData,
  gameType,
  tossWinnerKey,
  currentTurnUserId,
  turnCountdown
}) => {
  const userId = Number(localStorage.getItem("userId"));
  const [showTossFront, setShowTossFront] = useState(false);
  const [tossCards, setTossCards] = useState({
    player1TossCard: null,
    player2TossCard: null,
    player3TossCard: null,
    player4TossCard: null,
  });

useEffect(() => {
  const getCardById = (id) =>
    fullDeck.find((card) => card.id === Number(id)) || null;

  const newTossCards = {
    player1TossCard: getCardById(sessionStorage.getItem("ptRummyPlayerTossCard1")),
    player2TossCard: getCardById(sessionStorage.getItem("ptRummyPlayerTossCard2")),
    player3TossCard: getCardById(sessionStorage.getItem("ptRummyPlayerTossCard3")),
    player4TossCard: getCardById(sessionStorage.getItem("ptRummyPlayerTossCard4")),
  };

  // Check if tossCards are same, prevent re-setting
  const isSame =
    JSON.stringify(newTossCards) === JSON.stringify(tossCards);

  if (!isSame) {
    setTossCards(newTossCards);
    setShowTossFront(false);

    const flipTimeout = setTimeout(() => setShowTossFront(true), 800);
    return () => clearTimeout(flipTimeout);
  }
}, [roomData]); // or you can also use an explicit toss event trigger


  const shouldShowTimer = (position) => {
    const userName = playerPositions[position];
    const matchedPlayer = roomData?.response?.players.find(
      (p) => p.user_name === userName
    );
    return matchedPlayer?.user_id === currentTurnUserId && turnCountdown > 0;
  };
  // console.log("ossCards.player1TossCard", tossCards.player1TossCard);
  return (
    <div className="relative w-full h-[300px] mt-4 flex justify-center items-center">
      <img
        src={table}
        alt="table"
        className="absolute w-[100%] h-[200px] object-fill pointer-events-none"
      />

      {message && (
        <p className={`text-white absolute top-[41%] ${lockMessageShown?"top-[41%]":"top-[49%]"} left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm`}>
          {message}
        </p>
      )}

      {/* {gameStartTimer !== null && ( */}
      <div className="absolute text-center top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* <p className="text-yellow text-sm font-bold">
            Game begins in {gameStartTimer} seconds
          </p> */}
        {lockMessageShown && (
          <p className="text-customred text-[10px] mt-2 max-w-xs">
            Players on this table have been locked. Entry fee will be deducted
            if you leave now.
          </p>
        )}
      </div>
      {/* )} */}

      {tossWinnerMessage && (
        <p className="absolute top-[47%] left-1/2 transform -translate-x-1/2 text-green text-[12px] font-semibold">
          {tossWinnerMessage}
        </p>
      )}

      {/* 🔽 Players layout */}
      {playerPositions?.bottom && (
        <>
          <Player
            position="bottom"
            name={"You"}
            showTimer={shouldShowTimer("bottom")}
              timerValue={turnCountdown}
          />
          {tossCards?.player1TossCard && (
            <div className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2">
              <Card
                card={tossCards.player1TossCard}
                faceDown={!showTossFront}
              />
            </div>
          )}
        </>
      )}

      {playerPositions?.top && (
        <>
          <Player
            position="top"
            name={playerPositions.top}
            showTimer={shouldShowTimer("top")}
              timerValue={turnCountdown}
          />
          {tossCards?.player2TossCard && (
            <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2">
              <Card
                card={tossCards.player2TossCard}
                faceDown={!showTossFront}
              />
            </div>
          )}
        </>
      )}

      {playerPositions?.left && (
        <>
          <Player
            position="left"
            name={playerPositions.left}
            showTimer={shouldShowTimer("left")}
              timerValue={turnCountdown}
          />
          {tossCards?.player4TossCard && (
            <div className="absolute top-1/2 left-[55px] transform -translate-y-1/2">
             <Card card={tossCards.player4TossCard} faceDown={!showTossFront} />
            </div>
          )}
        </>
      )}

      {playerPositions?.right && (
        <>
          <Player
            position="right"
            name={playerPositions.right}
            showTimer={shouldShowTimer("right")}
              timerValue={turnCountdown}
          />
          {tossCards?.player3TossCard && (
            <div className="absolute top-1/2 right-[55px] transform -translate-y-1/2">
             <Card card={tossCards.player3TossCard} faceDown={!showTossFront} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameTable;
