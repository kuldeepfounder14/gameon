import cardBack from "../../assets/rummy/cards/diamond/back.png";

const DeckStack = ({ count = 5 }) => {
  return (
    <div className="relative w-8 h-12">
      {[...Array(count)].map((_, i) => (
        <img
          key={i}
          src={cardBack}
          alt="Back"
          className="absolute w-full h-full object-cover rounded shadow-md"
          style={{ top: `${i * 0.2}px`, left: `${i * 0.2}px`, zIndex: i }}
        />
      ))}
    </div>
  );
};

export default DeckStack;
