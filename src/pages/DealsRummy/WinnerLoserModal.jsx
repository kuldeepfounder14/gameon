// WinnerLoserModal.jsx
import React from "react";
import Card from "./card";
import cardBack from "../../assets/rummy/cards/diamond/back.png";

const WinnerLoserModal = ({
  visible,
  onClose,
  winner,
  loser,
  fullDeck,
  message,
  resultType,
  jokerCard,
  gameTie,
}) => {
  if (!visible) return null;

  const getMappedCards = (hand = []) =>
    hand
      .map((cardId) => fullDeck?.find((c) => c.id === Number(cardId?.id)))
      .filter(Boolean);
  const cardData = fullDeck?.find((c) => c.id === jokerCard[0]?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2a143d] border-[2px] border-gold p-4 rounded-lg w-[90%] max-w-2xl text-white relative">
       {resultType!=="game_result"&& <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl hover:text-gold font-bold text-red-500"
        >
          ×
        </button>}
        <h2 className="text-lg font-bold mb-4 text-center">Result</h2>
        <div className="flex items-center justify-center">
        Joker  &nbsp; <img className="w-8 h-12" src={cardData?.image || cardBack} alt="" />
        </div>
        {gameTie ? (
          <h1>
            {winner?.user_name} ,{message}
          </h1>
        ) : (
          <h2 className="text-[12px] font-bold mb-4 text-center">
            {resultType === "eliminated" ? loser?.user_name : winner?.user_name}
            , {message}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {gameTie ? (
              <h3 className=" text-center">{winner?.user_name}</h3>
            ) : (
              <h3 className="text-green text-center">
                🏆 Winner: {winner?.user_name}
              </h3>
            )}
            <div className="grid grid-cols-7 gap-1 mt-2">
              {getMappedCards(winner?.game_card?.cards).map((card, i) => (
                <Card key={`w-${i}`} card={card} />
              ))}
            </div>
          </div>
          <div>
            {gameTie ? (
              <h3 className=" text-center">{loser?.user_name}</h3>
            ) : (
              <h3 className="text-customred text-center">
                ❌ Loser: {loser?.user_name}
              </h3>
            )}
            <div className="grid grid-cols-7 gap-1 mt-2">
              {getMappedCards(loser?.game_card?.cards).map((card, i) => (
                <Card key={`l-${i}`} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerLoserModal;
