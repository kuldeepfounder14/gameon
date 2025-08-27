
// Update your GameTable component with these additions:
import React, { useEffect, useState } from "react";
import Player from "./Player";
import Card from "./card";
import table from "../../assets/rummy/images/table_cb.png";
import { fullDeck } from "./deck"; 
const GameTable = ({
  message,
  lockMessageShown,
  tossWinnerMessage,
  playerPositions,
  roomData,
  currentTurnUserId,
  turnCountdown,
  selectedBid,
  selectedOpponentBid,
  userResult,
  bidCardsAnimation, // Add this prop
  setBidCardsAnimation,
  discardedCards,
  setDiscardedCards
}) => {
  const userId = Number(localStorage.getItem("userId"));
  const [showTossFront, setShowTossFront] = useState(false);
  const [animatingCards, setAnimatingCards] = useState([]);
  const [bidWinnerCards, setBidWinnerCards] = useState([]); // New state for bid winner animation
  
  const [tossCards, setTossCards] = useState({
    player1TossCard: null,
    player2TossCard: null,
    player3TossCard: null,
    player4TossCard: null,
  });

  // Get bid winner's position
  const getBidWinnerPosition = () => {
    if (!userResult?.bidWinner) return null;
    
    const winnerPlayer = roomData?.response?.players.find(
      (p) => p.user_id === userResult.bidWinner
    );
    
    if (!winnerPlayer) return null;

    for (const [position, name] of Object.entries(playerPositions)) {
      if (
        name === winnerPlayer.user_name ||
        (name === "You" && userResult.bidWinner === userId)
      ) {
        return position;
      }
    }
    return null;
  };

  // Get final position for bid winner
  const getBidWinnerFinalPosition = (position) => {
    switch (position) {
      case "bottom":
        return { x: "50%", y: "75%" };
      case "top":
        return { x: "50%", y: "25%" };
      case "left":
        return { x: "25%", y: "50%" };
      case "right":
        return { x: "75%", y: "50%" };
      default:
        return { x: "50%", y: "75%" };
    }
  };

  // Handle bid winner animation
  useEffect(() => {
    // console.log("bidCardsAnimation 111111111111",bidCardsAnimation,discardedCards)
    if (bidCardsAnimation && userResult?.bidWinner && Object.keys(discardedCards).length > 0) {
      const winnerPosition = getBidWinnerPosition();
      if (winnerPosition) {
        const finalPos = getBidWinnerFinalPosition(winnerPosition);
        
        // Convert discarded cards to bid winner animation cards
        const cardsToAnimate = Object.values(discardedCards).map((discardData, index) => ({
          id: `bid-winner-${discardData.playerId}-${discardData.timestamp}`,
          card: discardData.card,
          startPosition: getCenterPosition(index, Object.keys(discardedCards).length),
          finalPosition: finalPos,
          delay: index * 100, // Stagger the animation slightly
        }));
        setBidWinnerCards(cardsToAnimate);
        // Clear the original discarded cards immediately
        setDiscardedCards({});
        // Clear bid winner cards after animation
        setTimeout(() => {
          setBidWinnerCards([]);
          setBidCardsAnimation(false)
              // console.log("bidCardsAnimation 2222222222",bidCardsAnimation,discardedCards)
        }, 1000);

      }
    }
  }, [bidCardsAnimation, userResult?.bidWinner, discardedCards]);

  // Your existing useEffect and functions remain the same...
  useEffect(() => {
    if (userResult?.discarded && Object.keys(userResult.discarded).length > 0) {
      const newDiscardedCards = {};
      const newAnimatingCards = [];

      Object.entries(userResult.discarded).forEach(([playerId, cardData]) => {
        if (cardData && cardData.id) {
          const card = fullDeck.find((c) => c.id === Number(cardData.id));
          if (card) {
            const player = roomData?.response?.players.find(
              (p) => p.user_id === Number(playerId)
            );
            const playerPosition = getPlayerPosition(Number(playerId));

            newDiscardedCards[playerId] = {
              card,
              playerId: Number(playerId),
              playerName: player?.user_name || `Player ${playerId}`,
              position: playerPosition,
              timestamp: Date.now(),
            };

            newAnimatingCards.push({
              id: `${playerId}-${cardData.id}-${Date.now()}`,
              card,
              fromPosition: playerPosition,
              playerId: Number(playerId),
            });
          }
        }
      });
console.log("newDiscardedCards",newDiscardedCards)
      setDiscardedCards(newDiscardedCards);

      if (newAnimatingCards.length > 0) {
        setAnimatingCards(newAnimatingCards);
        setTimeout(() => setAnimatingCards([]), 1000);
      }
    }
  }, [userResult?.discarded, roomData]);

  // Rest of your existing functions...
  const getPlayerPosition = (playerId) => {
    const player = roomData?.response?.players.find(
      (p) => p.user_id === playerId
    );
    if (!player) return "bottom";

    for (const [position, name] of Object.entries(playerPositions)) {
      if (
        name === player.user_name ||
        (name === "You" && playerId === userId)
      ) {
        return position;
      }
    }
    return "bottom";
  };

  const getStartingPosition = (position) => {
    switch (position) {
      case "bottom":
        return { x: "50%", y: "85%" };
      case "top":
        return { x: "50%", y: "15%" };
      case "left":
        return { x: "15%", y: "50%" };
      case "right":
        return { x: "85%", y: "50%" };
      default:
        return { x: "50%", y: "85%" };
    }
  };

  const getCenterPosition = (index, total) => {
    if (total === 1) return { x: "50%", y: "50%" };
    else if (total === 2)
      return index === 0 ? { x: "45%", y: "50%" } : { x: "55%", y: "50%" };
    else if (total === 3) {
      const positions = [
        { x: "45%", y: "48%" },
        { x: "55%", y: "48%" },
        { x: "50%", y: "52%" },
      ];
      return positions[index] || positions[0];
    } else {
      const positions = [
        { x: "45%", y: "45%" },
        { x: "55%", y: "45%" },
        { x: "45%", y: "55%" },
        { x: "55%", y: "55%" },
      ];
      return positions[index] || positions[0];
    }
  };

  const shouldShowTimer = (position) => {
    const userName = playerPositions[position];
    const matchedPlayer = roomData?.response?.players.find(
      (p) => p.user_name === userName
    );
    return matchedPlayer?.user_id === currentTurnUserId && turnCountdown > 0;
  };

  const myUserId = Number(localStorage.getItem("userId"));
  const myBidValue = userResult?.createdBid?.[myUserId] ?? 0;
  const topPlayerObj = roomData?.response?.players.find(
    (p) => p.user_name === playerPositions.top
  );
  const topBid = userResult?.createdBid?.[topPlayerObj?.user_id] ?? 0;
console.log("bidCardsAnimation",bidCardsAnimation,discardedCards)
  return (
    <>
      <div className="relative w-full h-[400px] mt-4 flex justify-center items-center">
        <img
          src={table}
          alt="table"
          className="absolute w-[280px] h-full object-fill pointer-events-none"
        />

        {message && (
          <p
            className={`text-white text-center absolute top-[41%] ${
              lockMessageShown ? "top-[41%]" : "top-[49%]"
            } left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm`}
          >
            {message}
          </p>
        )}
        {/* {!bidCardsAnimation && (
          <p
            className={`text-white text-center absolute top-[41%] ${
              lockMessageShown ? "top-[41%]" : "top-[49%]"
            } left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm`}
          >
            New round going to start, please wait
          </p>
        )} */}

        {/* Animating discarded cards (initial animation from player to center) */}
        {bidCardsAnimation&&animatingCards.map((animCard) => {
          const startPos = getStartingPosition(animCard.fromPosition);
          return (
            <div
              key={animCard.id}
              className="absolute z-20 pointer-events-none"
              style={{
                left: startPos.x,
                top: startPos.y,
                transform: "translate(-50%, -50%)",
                animation: "discardAnimation 1s ease-out forwards",
              }}
            >
              <Card card={animCard.card} faceDown={false} />
            </div>
          );
        })}

        {/* Static discarded cards at center (only show if not animating to bid winner) */}
        {!bidCardsAnimation && Object.values(discardedCards).map((discardData, index) => {
          const centerPos = getCenterPosition(
            index,
            Object.keys(discardedCards).length
          );
          return (
            <div
              key={`discarded-${discardData.playerId}-${discardData.timestamp}`}
              className="absolute z-10"
              style={{
                left: centerPos.x,
                top: centerPos.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <Card card={discardData.card} faceDown={false} />
            </div>
          );
        })}

        {/* Bid winner animation cards */}
        {bidWinnerCards.map((bidCard) => (
          <div
            key={bidCard.id}
            className="absolute z-30 pointer-events-none"
            style={{
              left: bidCard.startPosition.x,
              top: bidCard.startPosition.y,
              transform: "translate(-50%, -50%)",
              animation: `bidWinnerAnimation 1s ease-in-out forwards`,
              animationDelay: `${bidCard.delay}ms`,
              "--final-x": bidCard.finalPosition.x,
              "--final-y": bidCard.finalPosition.y,
            }}
          >
            <Card card={bidCard.card} faceDown={false} />
          </div>
        ))}

        {/* Rest of your existing JSX remains the same... */}
        <div className="absolute text-center top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {lockMessageShown && (
            <p className="text-customred text-[10px] mt-2 max-w-xs">
              Players on this table have been locked. Entry fee will be deducted
              if you leave now.
            </p>
          )}
        </div>

        {tossWinnerMessage && (
          <p className="absolute top-[47%] left-1/2 transform -translate-x-1/2 text-green text-[12px] font-semibold">
            {tossWinnerMessage}
          </p>
        )}

        {selectedBid && (
          <p className="absolute top-[47%] left-1/2 transform -translate-x-1/2 text-green text-[12px] font-semibold">
            {selectedBid?.bid}
          </p>
        )}

        {/* Players layout remains the same... */}
        {playerPositions?.bottom && (
          <>
            {selectedBid && (
              <p className="absolute bottom-[80px] font-bold left-1/2 transform -translate-x-1/2 text-white text-sm">
                {myBidValue}/{selectedBid.bid ? selectedBid.bid : 0}
              </p>
            )}

            <Player
              position="bottom"
              name={"You"}
              showTimer={shouldShowTimer("bottom")}
              timerValue={turnCountdown}
              selectedBid={selectedBid}
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
            {selectedOpponentBid && (
              <p className="absolute top-[80px] font-bold left-1/2 transform -translate-x-1/2 text-white text-sm">
                {topBid}/{selectedOpponentBid.bid ? selectedOpponentBid.bid : 0}
              </p>
            )}

            <Player
              position="top"
              name={playerPositions.top}
              showTimer={shouldShowTimer("top")}
              timerValue={turnCountdown}
              selectedOpponentBid={selectedOpponentBid}
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
                <Card
                  card={tossCards.player4TossCard}
                  faceDown={!showTossFront}
                />
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
                <Card
                  card={tossCards.player3TossCard}
                  faceDown={!showTossFront}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add the CSS for bid winner animation */}
      <style jsx>{`
        @keyframes discardAnimation {
          0% {
            opacity: 1;
            z-index: 30;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            z-index: 30;
          }
          100% {
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
            z-index: 10;
          }
        }

        @keyframes bidWinnerAnimation {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            z-index: 30;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            z-index: 30;
          }
          80% {
            left: var(--final-x);
            top: var(--final-y);
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            z-index: 30;
          }
          100% {
            left: var(--final-x);
            top: var(--final-y);
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
            z-index: 10;
          }
        }
      `}</style>
    </>
  );
};
export default GameTable;