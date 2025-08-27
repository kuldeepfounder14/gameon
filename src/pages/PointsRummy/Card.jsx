import { fullDeck } from "./deck";
import cardBack from "../../assets/rummy/cards/diamond/back.png";

const Card = ({ card, faceDown = false, onClick }) => {
  if (!card) return null;
// console.log("cardc in card page",card)
  // Find the card details from fullDeck using card.id
  const cardData = fullDeck.find((c) => c.id === card.id);

  return (
    <div
      onClick={onClick}
      className="w-6 h-9 rounded shadow-md overflow-hidden cursor-pointer"
    >
      {faceDown ? (
        <img src={cardBack} className="w-full h-full object-cover" alt="Back" />
      ) : (
        <img
          src={cardData?.image || cardBack}
          className="w-full h-full object-cover"
          alt={`${cardData?.rank}${cardData?.suit}`}
        />
      )}
    </div>
  );
};

export default Card;
