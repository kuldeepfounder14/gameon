import React, { useState, useEffect } from "react";

export default function BidModal({ selectedBid,setSelectedBid,onConfirm }) {
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (bid) => setSelectedBid(bid);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-blue-900 text-white rounded-xl shadow-lg w-80 p-6">
        <h2 className="text-lg font-semibold text-center mb-4">Select your bid</h2>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handleSelect(num)}
              className={`py-2 rounded-md font-semibold ${
                selectedBid === num
                  ? "bg-green text-white"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="text-center text-sm mb-4">
          ⏰ Match start in {countdown}s
        </div>

        <button
          className="w-full bg-green hover:bg-green py-2 rounded-md text-white font-bold"
          onClick={() => onConfirm(selectedBid)}
          disabled={selectedBid === null}
        >
          CONFIRM BID
        </button>
      </div>
    </div>
  );
}
