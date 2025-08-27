// WinnerLoserModal.jsx
import Card from "./card";
import cardBack from "../../assets/rummy/cards/diamond/back.png";
import { useEffect, useState } from "react";

const WinnerLoserModal = ({
  visible,
  onClose,
  levelOneGameResult,
  fullDeck,
  message,
  data,
  setData,
}) => {
  const userId = localStorage.getItem("userId");

  if (!visible) return null;

  useEffect(() => {
    // Get selected bids
    const selectedBidOfAllPlayers = sessionStorage.getItem(
      "selectedLevelOneBidOfAllPlayers"
    );
    let parsedSelectedBidOfAllPlayers = [];

    if (selectedBidOfAllPlayers) {
      try {
        parsedSelectedBidOfAllPlayers = JSON.parse(selectedBidOfAllPlayers);
      } catch {
        console.warn("Invalid JSON in selectedLevelOneBidOfAllPlayers");
      }
    }

    // Find your and opponent's selected bids
    const yourSelectedBidObj = parsedSelectedBidOfAllPlayers.find(
      (b) => Number(b.userId) === Number(userId)
    );
    const opponentSelectedBidObj = parsedSelectedBidOfAllPlayers.find(
      (b) => Number(b.userId) !== Number(userId)
    );

    // Get players from session
    const stored = sessionStorage.getItem("roomData_cb");
    let you, opponent;
    if (stored) {
      const parsed = JSON.parse(stored);
      const players = parsed?.response?.players || [];
      console.log("players check kro",players)
      you = players.find((p) => p.user_id === Number(userId));
      opponent = players.find((p) => p.user_id !== Number(userId));
    }
console.log("opponent check kro",opponent)
    // Get created bids
    const createdBidObj = levelOneGameResult?.createdBid || {};
    const dd = {
      // yourName: you?.user_name || "You",
      yourName:"You",
      opponentName: opponent?.user_name || "Opponent",
      yourCreatedBid: createdBidObj[userId] ?? 0,
      yourSelectedBid: yourSelectedBidObj?.bid ?? 0,
      opponentCreatedBid: createdBidObj[opponent?.user_id] ?? 0,
      opponentSelectedBid: opponentSelectedBidObj?.bid ?? 0,
    };
    localStorage.setItem("CBlevelOneGameResult", JSON.stringify(dd));
    setData(dd);
  }, [levelOneGameResult, userId]);

  console.log("dattatata", data);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2a143d] border-[2px] border-gold p-2 rounded-lg w-[98%] max-w-2xl text-white relative">
        {/* {resultType !== "game_result" && (
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-xl hover:text-gold font-bold text-red-500"
          >
            ×
          </button>
        )} */}
        <h2 className="text-sm font-bold mb-4 text-center">Round One Result</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>S.no.</th>
              <th>User</th>
              <th>Selected bid</th>
              <th>Round Score</th>
              <th>Total Score</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td>1</td>
              <td>{data && data?.yourName}</td>
              <td>{data && data?.yourSelectedBid} </td>
              <td>{data && data?.yourCreatedBid} </td>
              <td>{data && data?.yourCreatedBid} </td>
            </tr>
            <tr className="text-center">
              <td>2</td>
              <td>{data && data?.opponentName}</td>
              <td> {data && data?.opponentSelectedBid} </td>
              <td> {data && data?.opponentCreatedBid} </td>
              <td>{data && data?.opponentCreatedBid} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinnerLoserModal;
