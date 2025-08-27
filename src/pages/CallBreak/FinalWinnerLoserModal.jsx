// FinalWinnerLoserModal.jsx
import Card from "./card";
import cardBack from "../../assets/rummy/cards/diamond/back.png";
import { useEffect, useState, useRef } from "react";
import CBSocket from "./CBSocket";

const FinalWinnerLoserModal = ({
  onClose,
  levelTwoGameResult,
  fullDeck,
  message,
  data,
  setData,
  gameType,
}) => {
  const userId = localStorage.getItem("userId");
  const [opponent, setOpponent] = useState(null);
  const walletUpdateSent = useRef(false); // ✅ Track if wallet update was sent
  const [grandTotalResultOfAllRounds, setGrandTotalResultOfAllRounds] =
    useState({
      yourName: "",
      opponentName: "",
      yourCreatedBid: 0,
      yourSelectedBid: 0,
      opponentCreatedBid: 0,
      opponentSelectedBid: 0,
    });



  // Single useEffect: Calculate everything when levelTwoGameResult is available
  useEffect(() => {
    if (!levelTwoGameResult) {
      console.log("Missing levelTwoGameResult:", levelTwoGameResult);
      return;
    }

    // ✅ Reset wallet update flag when levelTwoGameResult changes
    walletUpdateSent.current = false;

    // Get players from session
    const stored = sessionStorage.getItem("roomData_cb");
    const firstRoundResult = JSON.parse(
      localStorage.getItem("CBlevelOneGameResult")
    );
    console.log("firstRoundResult:", firstRoundResult);
    
    let opponentPlayer = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const players = parsed?.response?.players || [];
        opponentPlayer = players.find((p) => p.user_id !== Number(userId));
        console.log("opponentPlayer:", opponentPlayer);
        setOpponent(opponentPlayer); // Still set state for rendering
      } catch (error) {
        console.error("Error parsing roomData_cb:", error);
        return;
      }
    }

    if (!opponentPlayer) {
      console.log("No opponent found");
      return;
    }

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

    // Get created bids - use opponentPlayer directly, not opponent state
    const createdBidObj = levelTwoGameResult?.createdBid || {};
    console.log("createdBidObj:", createdBidObj);

    const dd = {
      yourName: "You",
      opponentName: opponentPlayer?.user_name || "Opponent",
      yourCreatedBid: createdBidObj[userId] ?? 0,
      yourSelectedBid: yourSelectedBidObj?.bid ?? 0,
      opponentCreatedBid: createdBidObj[opponentPlayer?.user_id] ?? 0,
      opponentSelectedBid: opponentSelectedBidObj?.bid ?? 0,
    };
    console.log("Score calculation data:", dd);

    // Calculate scores
    const yourRoundOneScore = calculateScore(
      firstRoundResult?.yourSelectedBid || 0,
      firstRoundResult?.yourCreatedBid || 0
    );
    const opponentRoundOneScore = calculateScore(
      firstRoundResult?.opponentSelectedBid || 0,
      firstRoundResult?.opponentCreatedBid || 0
    );

    const yourRoundFinalScore = calculateScore(
      dd.yourSelectedBid,
      dd.yourCreatedBid
    );
    const opponentRoundFinalScore = calculateScore(
      dd.opponentSelectedBid,
      dd.opponentCreatedBid
    );

    const calculatedResults = {
      yourName: "You",
      opponentName: opponentPlayer?.user_name || "Opponent",
      yourRoundOneScore,
      yourRoundFinalScore,
      opponentRoundOneScore,
      opponentRoundFinalScore,
    };

    setGrandTotalResultOfAllRounds(calculatedResults);

    // Handle wallet update immediately with calculated values
    const yourFinalScore = Number(yourRoundOneScore || 0) + Number(yourRoundFinalScore || 0);
    const opponentFinalScore = Number(opponentRoundOneScore || 0) + Number(opponentRoundFinalScore || 0);

    let winnerId = null;
    let loserId = null;

    if (yourFinalScore > opponentFinalScore) {
      winnerId = Number(userId);
      loserId = opponentPlayer?.user_id;
    } else if (opponentFinalScore > yourFinalScore) {
      winnerId = opponentPlayer?.user_id;
      loserId = Number(userId);
    }

    const tableData = [
      {
        id: 1,
        entry_fees: 3.0,
        player_size: 2,
        win_multiplier: "1.5x",
        win_amount: 4,
        noOfRounds: 2,
      },
      {
        id: 2,
        entry_fees: 5.0,
        player_size: 2,
        win_multiplier: "1.8x",
        win_amount: 9,
        noOfRounds: 4,
      },
    ];

    const winnerAmount = tableData.find((item) => item.id === gameType)?.win_amount || 0;

    // ✅ Only send wallet update once
    if (winnerId && loserId && !walletUpdateSent.current) {
      walletUpdateSent.current = true; // Mark as sent
      CBSocket.emit("wallet_update", { winnerId, loserId, winnerAmount });
      console.log("Emitted wallet update", { winnerId, loserId, winnerAmount });
    }
  }, [levelTwoGameResult, userId, gameType]); // Only depend on levelTwoGameResult, userId, and gameType

  const calculateScore = (selectedBid, createdBid) => {
    if (selectedBid === createdBid) {
      // Case a
      return selectedBid;
    } else if (selectedBid > createdBid) {
      // Case b
      return -selectedBid;
    } else {
      // Case c
      return Number(`${selectedBid}${createdBid - selectedBid}`);
    }
  };

  console.log("data:", data);
  console.log("grandTotalResultOfAllRounds:", grandTotalResultOfAllRounds);

  const yourFinalScore =
    grandTotalResultOfAllRounds &&
    Number(grandTotalResultOfAllRounds?.yourRoundOneScore || 0) +
      Number(grandTotalResultOfAllRounds?.yourRoundFinalScore || 0);
      
  const opponentFinalScore =
    grandTotalResultOfAllRounds &&
    Number(grandTotalResultOfAllRounds?.opponentRoundOneScore || 0) +
      Number(grandTotalResultOfAllRounds?.opponentRoundFinalScore || 0);



  const winnerName =
    yourFinalScore > opponentFinalScore
      ? grandTotalResultOfAllRounds?.yourName
      : opponentFinalScore > yourFinalScore
      ? grandTotalResultOfAllRounds?.opponentName
      : "Draw";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2a143d] border-[2px] border-gold p-2 rounded-lg w-[98%] max-w-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl hover:text-gold font-bold text-red-500"
        >
          ×
        </button>
        
        <h2 className="text-sm font-bold mb-4 text-center">Final Result</h2>
        <h2 className="text-sm font-bold mb-4 text-green text-center">
          Winner : {winnerName}
        </h2>
        
        <table className="w-full">
          <thead>
            <tr>
              <th>S.no.</th>
              <th>User</th>
              <th>Round One Score</th>
              <th>Round Two Score</th>
              <th>Total Score</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td>1</td>
              <td>
                {grandTotalResultOfAllRounds?.yourName || "You"}
              </td>
              <td>
                {grandTotalResultOfAllRounds?.yourRoundOneScore || 0}
              </td>
              <td>
                {grandTotalResultOfAllRounds?.yourRoundFinalScore || 0}
              </td>
              <td>
                {yourFinalScore || 0}
              </td>
            </tr>
            <tr className="text-center">
              <td>2</td>
              <td>
                {grandTotalResultOfAllRounds?.opponentName || "Opponent"}
              </td>
              <td>
                {grandTotalResultOfAllRounds?.opponentRoundOneScore || 0}
              </td>
              <td>
                {grandTotalResultOfAllRounds?.opponentRoundFinalScore || 0}
              </td>
              <td>
                {opponentFinalScore || 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinalWinnerLoserModal;