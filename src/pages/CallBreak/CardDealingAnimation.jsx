import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import cardBack from "../../assets/rummy/cards/diamond/back.png";

const CardDealingAnimation = ({ mappedCards = [], onFinish }) => {
  const [revealedCards, setRevealedCards] = useState([]);

  useEffect(() => {
    if (!mappedCards || mappedCards.length === 0) return;

    const totalBackfaceCards = 13;
    const backfaceInterval = 200;
    const flipWait = 500;

    let idx = 0;

    const deal = setInterval(() => {
      if (idx < totalBackfaceCards) {
        setRevealedCards((prev) => [
          ...prev,
          { ...mappedCards[idx], faceDown: true },
        ]);
        idx++;
      } else {
        clearInterval(deal);

        // Flip all cards after delay
        setTimeout(() => {
          const flipCards = mappedCards
            .slice(0, totalBackfaceCards)
            .map((card, i) => {
              return new Promise((resolve) =>
                setTimeout(() => {
                  setRevealedCards((prev) => {
                    const copy = [...prev];
                    if (copy[i]) copy[i] = { ...card, faceDown: false };
                    return copy;
                  });
                  resolve();
                }, i * 90)
              );
            });

          Promise.all(flipCards).then(() => {
            setTimeout(() => {
              onFinish?.();
            }, 300);
          });
        }, flipWait);
      }
    }, backfaceInterval);

    return () => clearInterval(deal);
  }, [mappedCards]);

  return (
    <div className="relative w-full h-40  flex justify-center items-center mt-4 px-1">
      {revealedCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ x: 30, y: -100, opacity: 0 }} // Shift start 30px right
          animate={{ x: i * 25 - 150, y: 0, opacity: 1 }} // Also shift animate right by +30 (180 → 150)
          transition={{ duration: 0.2, delay: i * 0.1 }}
          className="absolute"
        >
          <div className="w-6 h-10 rounded shadow-md overflow-hidden cursor-pointer">
            {card?.faceDown ? (
              <img
                src={cardBack}
                className="w-full h-full object-cover"
                alt="Back"
              />
            ) : (
              <img
                src={card?.image || cardBack}
                className="w-full h-full object-cover"
                alt={`${card?.rank}${card?.suit}`}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardDealingAnimation;
