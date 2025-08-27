import { useEffect, useState, useRef } from "react";
import { fullDeck } from "./deck";
import Card from "./card";
import { useNavigate, useParams } from "react-router-dom";
import GameTable from "./GameTable";
import CardDealingAnimation from "./CardDealingAnimation";
import { toast } from "react-toastify";
import useGameSocket from "./useGameSocket";
import CBSocket from "./CBSocket";
import WinnerLoserModal from "./WinnerLoserModal";
import BidModal from "./BidModal";
import FinalWinnerLoserModal from "./FinalWinnerLoserModal";

const CallBreakHome = () => {
  const { gameType } = useParams();
  const userId = localStorage.getItem("userId");
  const [deck, setDeck] = useState(fullDeck);
  const [resultType, setResultType] = useState("eliminated");
  const [bidCardsAnimation, setBidCardsAnimation] = useState(false);
  const timerRef = useRef(null);
  const [playersHands, setPlayersHands] = useState({});
  const [roomData, setRoomData] = useState(null);
  const [message, setMessage] = useState("Waiting for room data...");
  const [playerPositions, setPlayerPositions] = useState({});
  const [lockMessageShown, setLockMessageShown] = useState(false);
  const [tossWinnerMessage, setTossWinnerMessage] = useState("");
  const [animatedHand, setAnimatedHand] = useState([]);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [yourPlayerKey, setYourPlayerKey] = useState("player1");
  const [currentTurnUserId, setCurrentTurnUserId] = useState(null);
  const [turnCountdown, setTurnCountdown] = useState(0);
  const eliminateTimerRef = useRef(null);
  const [eliminatedModalVisible, setEliminatedModalVisible] = useState(false);
  const [eliminatedWinner, setEliminatedWinner] = useState(null);
  const [eliminatedLoser, setEliminatedLoser] = useState(null);
  const [hasPickedCard, setHasPickedCard] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const navigate = useNavigate();
  const [finalWinnerModalVisible, setFinalWinnerModalVisible] = useState(false);
  const [bidModal, setBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [selectedOpponentBid, setSelectedOpponentBid] = useState(null);
  const [playersDetails, setPlayersDetails] = useState(null);
  const [levelOneGameResult, setLevelOneGameResult] = useState(null);
  const [levelTwoGameResult, setLevelTwoGameResult] = useState(null);
  const [firstRoundResutlModal, setfirstRoundResutlModal] = useState(false);
  const [discardedCards, setDiscardedCards] = useState({});
  const [roundOneResutlData, setRoundOneResutlData] = useState({
    yourName: "",
    opponentName: "",
    yourCreatedBid: 0,
    yourSelectedBid: 0,
    opponentCreatedBid: 0,
    opponentSelectedBid: 0,
  });
  const [roundTwoResutlData, setRoundTwoResutlData] = useState({
    yourName: "",
    opponentName: "",
    yourCreatedBid: 0,
    yourSelectedBid: 0,
    opponentCreatedBid: 0,
    opponentSelectedBid: 0,
  });
  useEffect(() => {
    const stored = sessionStorage.getItem("roomData_cb");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.keys(parsed).forEach((key) => {
        if (parsed[key] === "null") parsed[key] = null;
      });
      setRoomData(parsed);
      const players = parsed?.response?.players || [];
      const youIndex = players.findIndex((p) => p.user_id === Number(userId));
      if (youIndex === -1) return;
      const rotated = [
        ...players.slice(youIndex),
        ...players.slice(0, youIndex),
      ];
      const posOrder =
        players.length === 2
          ? ["bottom", "top"]
          : ["bottom", "right", "top", "left"];
      const positions = {};
      rotated.forEach((player, i) => {
        positions[posOrder[i]] =
          player.user_id === userId
            ? "You"
            : player.user_name || `Player ${i + 1}`;
      });
      setPlayerPositions(positions);
    }
  }, []);
  useGameSocket({
    cb_game_response: (payload) => {
      console.log("🎯 [Socket] game_response:", payload);
      setRoomData(payload);
      const players = payload?.response?.players || [];
      const youIndex = players.findIndex((p) => p.user_id === Number(userId));
      if (youIndex === -1) return;

      const rotated = [
        ...players.slice(youIndex),
        ...players.slice(0, youIndex),
      ];
      const posOrder =
        players.length === 2
          ? ["bottom", "top"]
          : ["bottom", "right", "top", "left"];
      const positions = {};
      rotated.forEach((player, i) => {
        positions[posOrder[i]] =
          player.user_id === userId
            ? "You"
            : player.user_name || `Player ${i + 1}`;
      });
      setPlayerPositions(positions);
      // 🔁 Update hands if received
      if (payload?.response?.playerHands) {
        const newHand = payload.response.playerHands?.[userId];
        if (newHand) {
          setPlayersHands((prev) => {
            const currentHand = prev[yourPlayerKey] || [];
            // If card is drawn (length increased by 1)
            if (newHand.length === currentHand.length + 1) {
              const addedCard = newHand.find(
                (card) => !currentHand.some((c) => c.id === card.id)
              );
              // Append drawn card to end of current hand
              return {
                ...prev,
                [yourPlayerKey]: [...currentHand, addedCard],
              };
            }
            return {
              ...prev,
              [yourPlayerKey]: newHand,
            };
          });
        }
      }
    },
  });

  useEffect(() => {
    if (roomData) {
      const task = roomData?.response?.task;
      console.log("🔍 Task received:", task, "Type:", typeof task); // Add this line
      const countdown = roomData?.response?.loading_timer?.countdown;
      const timerStatus = roomData?.response?.loading_timer?.status;
      if (task === "cb_room_destroyed") {
        navigate("/cbmenu");
        return;
      } else if (task === "cb_first_response") {
        setMessage("Waiting for other players...");
      } else if (
        task === "cb_loading_timer" &&
        countdown !== null &&
        timerStatus === 1
      ) {
        setMessage(`Game begins in ${countdown} seconds`);
        if (countdown < 6 && countdown > 1) {
          setLockMessageShown(true);
        } else {
          setLockMessageShown(false);
        }
      } else if (task === "cb_toss_result") {
        setMessage("");
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.setItem(
            `cbPlayerTossCard${i + 1}`,
            player?.toss_card?.id || {}
          );
        });
      } else if (
        task === "cb_loading_timer" &&
        countdown !== null &&
        timerStatus === 2
      ) {
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.setItem(
            `cbPlayerTossCard${i + 1}`,
            player?.toss_card?.id || {}
          );
          if (player?.toss_result === 1) {
            sessionStorage.setItem(`cbTossWinner`, player?.user_name || {});
          }
        });
        if (countdown === 1) {
          const tossWinner = sessionStorage.getItem("cbTossWinner");
          setMessage(`${tossWinner} won the toss!`);
        }
      } else if (
        task === "cb_loading_timer" &&
        countdown === 5 &&
        timerStatus === 3
      ) {
        const currentUserId = Number(userId);
        const yourCards =
          roomData?.response?.players?.find((p) => p.user_id === currentUserId)
            ?.game_card?.cards || [];
        // Convert card ids to fullDeck card objects
        const mappedCards = yourCards
          .map((cardId) => fullDeck.find((c) => c.id === Number(cardId?.id)))
          .filter(Boolean);
        setAnimatedHand(mappedCards);
        setPlayersDetails(yourCards);
      } else if (task === "cb_loading_timer" && timerStatus === "bid") {
        const currentUserId = Number(userId);
        const isLocal = roomData?.response?.players?.find(
          (p) => p.user_id === currentUserId
        );
        // console.log("cb_loading_timer ststAUSbibidbdbdbid", isLocal);
        setPlayersDetails(isLocal?.game_card?.cards);
        // Convert card ids to fullDeck card objects
        if (isLocal && !bidModal && countdown === 10) {
          setBidModal(true);
        }
        if (countdown === 0) {
          setBidModal(false);
        }
      } else if (roomData?.response?.task === "cb_turn_started") {
        setDiscardedCards({});
        setBidCardsAnimation(false);
        const results = roomData?.response?.results || [];
        // setAllowedCardIds(playableCards);
        setUserResult(results);
        const isLocal = roomData?.response?.players?.find(
          (p) => p.user_id === Number(userId)
        );
        // console.log("isLocal cb_turn_started", isLocal);
        setPlayersDetails(isLocal?.game_card?.cards);
        const turnPlayer = roomData?.response?.players.find(
          (p) => p.is_turn === 1
        );
        // console.log("turnPlayerturnPlayer",turnPlayer)
        if (turnPlayer) {
          setHasPickedCard(false);
          const newTurnUserId = turnPlayer.user_id;
          // console.log("newTurnUserId",newTurnUserId)
          setCurrentTurnUserId((prevUserId) => {
            if (prevUserId !== newTurnUserId) {
              setTurnCountdown(
                roomData?.response?.loading_timer?.countdown || 30
              );
            }
            // if (roomData?.response?.loading_timer?.countdown === 2)
            return newTurnUserId;
          });
          if (turnPlayer.user_id === Number(userId)) {
            if (eliminateTimerRef.current) {
              clearTimeout(eliminateTimerRef.current);
            }
            eliminateTimerRef.current = setTimeout(() => {
              const roomId = roomData?.response?.players?.[0]?.room_id;
              // console.log(
              //   "eliminateTimerRef.current turn ends",
              //   eliminateTimerRef.current
              // );
              if (roomId && userId && !hasPickedCard) {
               handleAutoCardDiscardFromHand()
              }
            }, roomData?.response?.loading_timer?.countdown * 1000);
          }
        }
      } else if (task === "selected_bid") {
        // console.log("selected_bid task received");
        const isLocal = roomData?.response?.players?.find(
          (p) => p.user_id === Number(userId)
        );
        // console.log("selected_bidselected_bid", isLocal);
        setPlayersDetails(isLocal?.game_card?.cards);
        const bidResults = roomData?.response?.bidCount;
        sessionStorage.setItem(
          "selectedLevelOneBidOfAllPlayers",
          JSON.stringify(bidResults)
        );
        const yourBid = bidResults?.find(
          (b) => Number(b.userId) === Number(userId)
        );
        const opponentBid = bidResults?.find(
          (b) => Number(b.userId) !== Number(userId)
        );
        // console.log("opponentBid",opponentBid)
        setSelectedBid(yourBid || 4);
        setSelectedOpponentBid(opponentBid || 4);
        if (yourBid && yourBid.bid !== null) {
          setBidModal(false); // ✅ Close only for this user
        }
      } else if (task === "levelOneResult") {
        const results = roomData?.response?.results;
        // setMessage(finalMessageAfterBothHandCompared);
        setLevelOneGameResult(results);
        resetGame();
        // sessionStorage.removeItem("roomData_cb");
      } else if (task === "levelFinalResult") {
        const results = roomData?.response?.results;
        // setMessage(finalMessageAfterBothHandCompared);
        setLevelTwoGameResult(results);
        resetGame();
        // sessionStorage.removeItem("roomData_cb");
      } else if (
        task === "cb_loading_timer" &&
        timerStatus === "1stRoundResultTimer" &&
        countdown !== null
      ) {
        if (countdown === 5) {
          setfirstRoundResutlModal(true);
        }
        if (countdown === 0) {
          setfirstRoundResutlModal(false);
        }
      } else if (task === "cb_discard_update") {
        const results = roomData?.response?.results || [];
        const playersCards = roomData?.response?.players?.find(
          (p) => p.user_id === Number(userId)
        );
        setUserResult(results);
        setPlayersDetails(playersCards?.game_card?.cards || []);
      } else if (
        task === "cb_loading_timer" &&
        timerStatus === "bidCreationAnimation" &&
        countdown !== null
      ) {
        if (countdown === 2) {
          setBidCardsAnimation(true);
          setMessage("");
        }
        if (countdown === 0) {
          setBidCardsAnimation(false);
          setDiscardedCards({});
        }
      } else if (task === "finalLevelResult") {
        setFinalWinnerModalVisible(true);
        const winnerId = roomData?.response?.loading_timer?.winnerId;
        const loserId = roomData?.response?.loading_timer?.loserId;
        const finalMessageAfterBothHandCompared =
          roomData?.response?.loading_timer?.message;

        const winner = roomData?.response?.players?.find(
          (p) => p.user_id === winnerId
        );
        const loser = roomData?.response?.players?.find(
          (p) => p.user_id === loserId
        );
        setResultType("game_result_final");
        setMessage(finalMessageAfterBothHandCompared);
        setEliminatedWinner(winner);
        setEliminatedLoser(loser);
        resetGame();
      } else {
        setMessage(""); // fallback
        setLockMessageShown(false);
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.removeItem(`cbPlayerTossCard${i + 1}`);
        });
      }
      const gamePlayers = Number(gameType);
      if (roomData?.response?.players?.length < gamePlayers) {
        return;
      }
    } else {
      setMessage("Waiting for room data...");
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [roomData, roomData?.response?.task]);

  const resetGame = () => {
    setDeck(fullDeck);
    setPlayersHands({});
    setPlayerPositions({});
    setLockMessageShown(false);
    setTossWinnerMessage("");
    setAnimatedHand([]);
    setDealingComplete(false);
    // setCurrentTurnKey(null);
    // setPlayerTurnHistory({});
    setCurrentTurnUserId(null);
    setTurnCountdown(0);
    // after 1st round
    setUserResult(null)
    setBidModal(null)
    setSelectedBid(null)
    setSelectedOpponentBid(null)
    setDiscardedCards({})
    setRoundOneResutlData({
    yourName: "",
    opponentName: "",
    yourCreatedBid: 0,
    yourSelectedBid: 0,
    opponentCreatedBid: 0,
    opponentSelectedBid: 0,
  })
    // sessionStorage.removeItem("roomData_cb");
  };

  const onClose = () => {
    setEliminatedModalVisible(false);
    navigate("/cbmenu");
  };
  const handleConfirmBid = (playerBidCount) => {
    if (selectedBid !== playerBidCount) {
      toast.warn("Bid already selected");
      return;
    } else {
      const payload = {
        roomId: roomData?.response?.players[0]?.room_id,
        userId: Number(userId),
        playerBidCount,
      };
      // console.log("payloadpayloadpayload of handleConfirmBid",payload)
      CBSocket.emit("cb_bid_selection", payload);
      setSelectedBid(null);
      setBidModal(false);
    }
  };
  const handleCardDiscardFromHand = (card) => {
    console.log("handleCardDiscardFromHand called with card:", card);
    if (!card) {
      toast.warn("Card not selected yet!");
      return;
    } else {
      const payload = {
        roomId: roomData?.response?.players[0]?.room_id,
        userId: Number(userId),
        card,
      };
      console.log("handleCardDiscardFromHand payload", payload);
      CBSocket.emit("cb_discard_card", payload);
      setHasPickedCard(true);
    }
  };
  // const { cards: playableCards, reason: invalidReason } = getPlayableCards();
  // console.log("userResultuserResult", userResult);
  // console.log("SelectedOpponentBid", discardedCards);
  // console.log("Playable cards:", playableCards.map((c) => `${c.rank}${c.suit}`));

  // Add this function inside your CallBreakHome component

const handleAutoCardDiscardFromHand = () => {
  console.log("Auto discard triggered - timer expired");
  
  if (hasPickedCard) {
    console.log("Player already picked a card, skipping auto discard");
    return;
  }

  // Get allowed card IDs
  const allowedCardIds = userResult?.allowedCardIds || [];

  if (allowedCardIds.length === 0) {
    console.log("No allowed cards available for auto discard");
    return;
  }

  // Pick a random allowed card ID
  const randomIndex = Math.floor(Math.random() * allowedCardIds.length);
  const randomAllowedCardId = allowedCardIds[randomIndex];

  // Find the actual card object from playersDetails
  const cardToDiscard = playersDetails?.find(card => card.id === randomAllowedCardId);

  if (!cardToDiscard) {
    console.log("Card not found in player's hand");
    return;
  }

  console.log("Auto discarding random card:", cardToDiscard);

  const payload = {
    roomId: roomData?.response?.players[0]?.room_id,
    userId: Number(userId),
    card: cardToDiscard,
  };

  console.log("Auto discard payload:", payload);
  CBSocket.emit("cb_discard_card", payload);
  setHasPickedCard(true);
  
  // Show notification to user
  toast.info(`Auto discarded: ${cardToDiscard.rank}${cardToDiscard.suit}`);
};

  return (
    <div className="w-full h-screen bg-[#0E2B39] flex flex-col items-center py-2 px-4 relative">
      {!eliminatedModalVisible && (
        <GameTable
          message={message}
          lockMessageShown={lockMessageShown}
          tossWinnerMessage={tossWinnerMessage}
          playerPositions={playerPositions}
          roomData={roomData}
          currentTurnUserId={currentTurnUserId}
          turnCountdown={turnCountdown}
          selectedBid={selectedBid}
          selectedOpponentBid={selectedOpponentBid}
          userResult={userResult}
          bidCardsAnimation={bidCardsAnimation} // Add this line
          setBidCardsAnimation={setBidCardsAnimation} // Add this line
          discardedCards={discardedCards}
          setDiscardedCards={setDiscardedCards}
        />
      )}
      {animatedHand.length > 0 && !dealingComplete ? (
        <CardDealingAnimation
          mappedCards={animatedHand}
          onFinish={() => {
            setAnimatedHand([]); // 🧼 clear animation state
            setPlayersHands((prev) => ({
              ...prev,
              [yourPlayerKey]: animatedHand,
            }));
            setDealingComplete(true);
          }}
        />
      ) : dealingComplete && playersDetails?.length > 0 ? (
        <>
          <div className="mt-4">
            {playersDetails?.length > 0 && (
              <div className="flex gap-1 border p-1 rounded bg-gray">
                {playersDetails.map((card, rowIndex) => {
                  const isAllowed = userResult?.allowedCardIds?.includes(
                    card.id
                  );

                  return (
                    <div key={`row-${rowIndex}`} className="flex gap-1 mb-1">
                      {/* {row.map((card, i) => ( */}
                      <Card
                        className={`${
                          isAllowed ? "border-4 border-yellow" : "opacity-50"
                        } rounded-md transition duration-200`}
                        key={`raw-card-${rowIndex}`}
                        card={card}
                        faceDown={false}
                        onClick={() => {
                          if (!isAllowed) {
                            toast.warn("This card is not allowed to play.");
                            return;
                          }
                          if (
                            currentTurnUserId &&
                            currentTurnUserId === Number(userId)
                          ) {
                            if (playersDetails.length <= 13) {
                              handleCardDiscardFromHand(card);
                            } else {
                              toast.warn("Card has not discarded yet");
                            }
                          } else {
                            toast.warn("not your turn");
                          }
                        }}
                        disabled={!isAllowed} // ✅ disable if not playabled
                      />
                      {/* ))} */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
      {bidModal && (
        <BidModal
          selectedBid={selectedBid}
          setSelectedBid={setSelectedBid}
          onConfirm={handleConfirmBid}
        />
      )}
      {levelOneGameResult && firstRoundResutlModal && (
        <WinnerLoserModal
          visible={levelOneGameResult}
          onClose={onClose}
          levelOneGameResult={levelOneGameResult}
          fullDeck={fullDeck}
          message={message}
          data={roundOneResutlData}
          setData={setRoundOneResutlData}
        />
      )}
      { roundTwoResutlData &&levelTwoGameResult&& (
        <FinalWinnerLoserModal
          // visible={levelTwoGameResult}
          onClose={onClose}
          levelTwoGameResult={levelTwoGameResult}
          fullDeck={fullDeck}
          message={message}
          data={roundTwoResutlData}
          setData={setRoundTwoResutlData}
          gameType={Number(gameType)}
        />
      )}
    </div>
  );
};
export default CallBreakHome;
