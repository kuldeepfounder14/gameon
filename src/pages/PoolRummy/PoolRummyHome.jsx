import { useEffect, useState, useRef } from "react";
import { fullDeck } from "./deck";
import Card from "./card";
import { useNavigate, useParams } from "react-router-dom";
import BottomControls from "./BottomControls";
import GameTable from "./GameTable";
import LeftDiscarded from "./LeftDiscarded";
import CardDealingAnimation from "./CardDealingAnimation";
import { toast } from "react-toastify";
// import { extractPureSequences } from "./analyzeHand"; // adjust path if needed
import useGameSocket from "./useGameSocket";
import PoolRummySocket from "./PoolRummySocket";
import WinnerLoserModal from "./WinnerLoserModal"; // import the modal

const PoolRummyHome = () => {
  // console.log("fullDeck",fullDeck)
  const { gameType } = useParams();
  const userId = localStorage.getItem("userId");
  const [deck, setDeck] = useState(fullDeck);
  const [dealtCards, setDealtCards] = useState([]);
  const [resultType, setResultType] = useState("eliminated");
  const timerRef = useRef(null);
  const [showRemainingCards, setShowRemainingCards] = useState(false);
  const [discardPile, setDiscardPile] = useState(null);
  const [playersHands, setPlayersHands] = useState({});
  const [jokerCard, setJokerCard] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [message, setMessage] = useState("Waiting for room data...");
  const [playerPositions, setPlayerPositions] = useState({});
  const [gameStartTimer, setGameStartTimer] = useState(null);
  const [lockMessageShown, setLockMessageShown] = useState(false);
  const [tossWinnerMessage, setTossWinnerMessage] = useState("");
  const [animatedHand, setAnimatedHand] = useState([]);
  const [dealingComplete, setDealingComplete] = useState(false);
  const [yourPlayerKey, setYourPlayerKey] = useState("player1");
  const [currentPoints, setCurrentPoints] = useState(0);
  const intervalRef = useRef(null);
  const [tossWinnerKey, setTossWinnerKey] = useState(null);
  const [currentTurnKey, setCurrentTurnKey] = useState(null);
  const [playerTurnHistory, setPlayerTurnHistory] = useState({});
  const [currentTurnUserId, setCurrentTurnUserId] = useState(null);
  const [turnCountdown, setTurnCountdown] = useState(0);
  const eliminateTimerRef = useRef(null);
  const [eliminatedModalVisible, setEliminatedModalVisible] = useState(false);
  const [eliminatedWinner, setEliminatedWinner] = useState(null);
  const [eliminatedLoser, setEliminatedLoser] = useState(null);
  const [hasPickedCard, setHasPickedCard] = useState(false);
  const [cardDiscardedFromHand, setCardDiscardedFromHand] = useState(null);
  const [declareAfterFinally, setDeclareAfterFinally] = useState(false);
  const [gameTie, setGameTie] = useState(false);
  const [sortEnabled, setSortEnabled] = useState(false);
  const [sortedResult, setSortedResult] = useState(null);
  const [userResult, setUserResult] = useState(null);
  const navigate = useNavigate();
  const [selectedCardForAction, setSelectedCardForAction] = useState(null);
  const [finalWinnerModalVisible, setFinalWinnerModalVisible] = useState(false);
  const [finalResultData, setFinalResultData] = useState(null);
  
  // const handleSort = () => {
  //   if (!userResult?.cards) return;
  //   const { pureSequences, leftCards } = extractPureSequences(
  //     userResult.cards.filter((c) => !c.joker)
  //   );
  //   // console.log("pureSequences, leftCards", pureSequences, leftCards);
  //   setSortedResult({
  //     sequences: [], // ⛔ No impure sequences allowed here
  //     pureSequences,
  //     leftCards,
  //   });
  //   setSortEnabled(true);
  // };
  // socket
  useEffect(() => {
    const stored = sessionStorage.getItem("roomData_pool");
    if (stored) {
      const parsed = JSON.parse(stored);
      // console.log(" pawrse stored", parsed);
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
    pool_game_response: (payload) => {
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

            // First-time or normal update (e.g., discard, 13 cards, etc.)
            return {
              ...prev,
              [yourPlayerKey]: newHand,
            };
          });
        }
      }

      // 🃏 Update discarded card
      if (payload?.response?.discardedCard) {
        setDiscardPile(payload.response.discardedCard);
      }
      // 🗂 Update left deck
      if (payload?.response?.leftDeck) {
        setDeck(payload.response.leftDeck);
      }
    },
  });

  // console.log("roomData", roomData);

  // Load and process roomData from sessionStorage
  useEffect(() => {
    if (roomData) {
      const task = roomData?.response?.task;
      const countdown = roomData?.response?.loading_timer?.countdown;
      const timerStatus = roomData?.response?.loading_timer?.status;
      // const validatedHand = roomData?.response?.loading_timer?.results;
      if (task === "pool_room_destroyed") {
        // console.log("room destroyed")
        navigate("/plmenu");
        return;
      } else if (task === "pool_first_response") {
        setMessage("Waiting for other players...");
        setCurrentPoints(0);
      } else if (
        task === "pool_loading_timer" &&
        countdown !== null &&
        timerStatus === 1
      ) {
        setCurrentPoints(0);
        setMessage(`Game begins in ${countdown} seconds`);
        if (countdown < 6 && countdown > 1) {
          setLockMessageShown(true);
        } else {
          setLockMessageShown(false);
        }
      } else if (task === "pool_toss_result") {
        setMessage("");
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.setItem(
            `plRummyPlayerTossCard${i + 1}`,
            player?.toss_card?.id || {}
          );
        });
        // setTossWinnerKey(roomData?.response?.toss_winner_key || null);
      } else if (
        task === "pool_loading_timer" &&
        countdown !== null &&
        timerStatus === 2
      ) {
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.setItem(
            `plRummyPlayerTossCard${i + 1}`,
            player?.toss_card?.id || {}
          );
          if (player?.toss_result === 1) {
            //  sessionStorage.setItem(`ptRummyTossWinner`,player?.user_id || {});
            sessionStorage.setItem(
              `plRummyTossWinner`,
              player?.user_name || {}
            );
          }
        });
        if (countdown === 1) {
          const tossWinner = sessionStorage.getItem("plRummyTossWinner");
          setMessage(`${tossWinner} won the toss!`);
        }
      } else if (
        task === "pool_loading_timer" &&
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
      } else if (task === "pool_joker_and_discarded") {
        setShowRemainingCards(roomData?.response?.leftDeck || null);
        setJokerCard(roomData?.response?.jokers || null);
        setDiscardPile(roomData?.response?.discardedCard || []);
        setCurrentPoints(79);
      } else if (task === "pool_card_drawn_from_deck") {
         const sortedResults=roomData?.response?.results[userId] || null;
        setSortedResult(sortedResults)
        // console.log("oomData?.response?.", roomData?.response?.leftDeck);
        setShowRemainingCards(roomData?.response?.leftDeck || null);
      
      }else if (task === "pool_card_drawn_from_discard") {
        const sortedResults=roomData?.response?.results[userId] || null;
        setSortedResult(sortedResults)
       
      }  else if (roomData?.response?.task === "pool_turn_started") {
          const sortedResults=roomData?.response?.results[userId] || null;
        setSortedResult(sortedResults)
        const turnPlayer = roomData?.response?.players.find(
          (p) => p.is_turn === 1
        );
        if (turnPlayer) {
          setHasPickedCard(false);
          const newTurnUserId = turnPlayer.user_id;
          // setSelectedCardForAction(null);
          setCurrentTurnUserId((prevUserId) => {
            if (prevUserId !== newTurnUserId) {
              setTurnCountdown(
                roomData?.response?.loading_timer?.countdown || 30
              );
            }
            if (roomData?.response?.loading_timer?.countdown === 2)
              setCardDiscardedFromHand(null);
            return newTurnUserId;
          });
          if (turnPlayer.user_id === Number(userId)) {
            if (eliminateTimerRef.current) {
              // setSelectedCardForAction(null);
              clearTimeout(eliminateTimerRef.current);
            }
            eliminateTimerRef.current = setTimeout(() => {
              const roomId = roomData?.response?.players?.[0]?.room_id;
              if (roomId && userId && !hasPickedCard) {
                console.log("⛔ Discard not done in time. Emitting eliminate.");
                PoolRummySocket.emit("pool_eliminate", {
                  roomId,
                  userId: Number(userId),
                });
              }
            }, roomData?.response?.loading_timer?.countdown * 1000);
          }
        }
      } else if (task === "pool_eliminated") {
        // console.log("eliminatedeliminatedeliminated");
        const winnerId = roomData?.response?.loading_timer?.winnerId;
        const loserId = roomData?.response?.loading_timer?.loserId;
        const mess = roomData?.response?.loading_timer?.message;
        const winner = roomData?.response?.players?.find(
          (p) => p.user_id === winnerId
        );
        const loser = roomData?.response?.players?.find(
          (p) => p.user_id === loserId
        );
        // if (winner && loser) {
        setResultType("eliminated");
        setMessage(mess);
        resetGame();
        setEliminatedWinner(winner);
        setEliminatedLoser(loser);
        setEliminatedModalVisible(true);
        // console.log("eliminated eliminated when player played its turn");
        // setTimeout(() => {
        //   navigate("/");
        // }, 2000);
      } else if (task === "pool_wait_for_opponent_declare") {
          const sortedResults=roomData?.response?.results[userId] || null;
        setSortedResult(sortedResults)
        const turnPlayer = roomData?.response?.players.find(
          (p) => p.is_turn === 1
        );
        if (turnPlayer) {
          const newTurnUserId = turnPlayer.user_id;
          setCurrentTurnUserId((prevUserId) => {
            if (prevUserId !== newTurnUserId) {
              setTurnCountdown(
                roomData?.response?.loading_timer?.countdown || 59
              );
            }
            return newTurnUserId;
          });
          if (turnPlayer.user_id === Number(userId)) {
            if (eliminateTimerRef.current) {
              clearTimeout(eliminateTimerRef.current);
            }
            eliminateTimerRef.current = setTimeout(() => {
              const roomId = roomData?.response?.players?.[0]?.room_id;
              if (roomId && userId && !hasPickedCard) {
                console.log("⛔ Discard not done in time. Emitting eliminate.");
                PoolRummySocket.emit("eliminate", {
                  roomId,
                  userId: Number(userId),
                });
              }
            }, roomData?.response?.loading_timer?.countdown * 1000);
          }
        }
        //   console.log("roomData?.response?.loading_timer",roomData?.response)
        const declareUserId = roomData?.response?.declaringUserId;
        const messageForFirstDeclaredUser =
          roomData?.response?.messageForFirstDeclaredUser;
        const messageForNextDeclaredUser =
          roomData?.response?.messageForNextDeclaredUser;
        if (Number(userId) !== Number(declareUserId)) {
          setMessage(messageForNextDeclaredUser);
          setDeclareAfterFinally(true);
        }
        if (Number(userId) === Number(declareUserId)) {
          setMessage(messageForFirstDeclaredUser);
          setDeclareAfterFinally(false);
        }
        // Optionally: prevent user from playing further
      } else if (task === "pool_game_result") {
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
        setResultType("game_result");
        // if (winner && loser) {
        setMessage(finalMessageAfterBothHandCompared);
        setEliminatedWinner(winner);
        setEliminatedLoser(loser);
        setEliminatedModalVisible(true);
        // console.log(
        //   "game_resultgame_resultgame_result when player played its turn"
        // );
        resetGame();
        // alert("sdsadf")
        // setTimeout(() => {
        //   navigate("/");
        // }, 2000);

        // }
      } else if (task === "pool_game_tie") {
        setGameTie(true);
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
        setResultType("game_result");
        // if (winner && loser) {
        setMessage(finalMessageAfterBothHandCompared);
        setEliminatedWinner(winner);
        setEliminatedLoser(loser);
        setEliminatedModalVisible(true);
        resetGame();
      } else if (task === "final_pool_result") {
        // const finalResult = roomData?.response?.loading_timer?.results || {};
        // setFinalResultData(finalResult);
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
        // if (winner && loser) {
        setMessage(finalMessageAfterBothHandCompared);
        setEliminatedWinner(winner);
        setEliminatedLoser(loser);
        // setEliminatedModalVisible(true);
        // console.log(
        //   "game_resultgame_resultgame_result when player played its turn"
        // );
        resetGame();
      } else if (task === "pool_Next_round_loading_timer") {
        const countdown = roomData?.response?.loading_timer?.countdown;
        // setNextRoundModalVisible(true);
        if (countdown > 0) {
          setTimeout(() => {
            setEliminatedModalVisible(false);
          }, countdown * 1000);
        } else {
          setEliminatedModalVisible(false);
        }
      } else {
        setMessage(""); // fallback
        setLockMessageShown(false);
        roomData?.response?.players?.forEach((player, i) => {
          sessionStorage.removeItem(`plRummyPlayerTossCard${i + 1}`);
        });
      }
      // Your existing logic for checking player count can stay
      const gamePlayers = Number(gameType);
      if (roomData?.response?.players?.length < gamePlayers) {
        // No need to override message here anymore
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
  }, [roomData]);
  // console.log("setSelectedCardForAction(null);", selectedCardForAction);
  // useEffect(() => {
  //   const updatedHand = playersHands?.[yourPlayerKey];
  //   if (!updatedHand) return;

  //   setUserResult({ cards: updatedHand }); // Always show raw hand on UI
  //   // handleSort();
  //   // if (updatedHand.length === 14) {
  //   //   const result = analyzeHand(updatedHand); // 🔍 Run analysis only for 14 cards
  //   //   setSortedResult(result);
  //   // } else {
  //   //   setSortedResult(null); // If not 14, clear analyzed result
  //   // }
  // }, [playersHands?.[yourPlayerKey]]);
console.log("playersHands?.[yourPlayerKey]playersHands?.[yourPlayerKey]",playersHands?.[yourPlayerKey])
  const resetGame = () => {
    setDeck(fullDeck);
    setDealtCards([]);
    setShowRemainingCards(false);
    setDiscardPile(null);
    setPlayersHands({});
    // setJokerCard(null);
    // setMessage("Game finished.");
    setPlayerPositions({});
    setGameStartTimer(null);
    setLockMessageShown(false);
    setTossWinnerMessage("");
    setAnimatedHand([]);
    setDealingComplete(false);
    setCurrentPoints(0);
    setTossWinnerKey(null);
    setCurrentTurnKey(null);
    setPlayerTurnHistory({});
    setCurrentTurnUserId(null);
    setTurnCountdown(0);
    sessionStorage.removeItem("roomData_pool");
  };

  useEffect(() => {
    const countdown = roomData?.response?.loading_timer?.countdown;
    const status = roomData?.response?.loading_timer?.status;
    if (status === 4 && countdown === 2) {
      setSelectedCardForAction(null);
    }
  }, [roomData]);
  const discardCardFromHand = (cardToDiscard) => {
    if (!PoolRummySocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      PoolRummySocket.connect();
      return;
    }

    const currentTurnPLayer = roomData?.response?.players?.find(
      (p) => p.is_turn === 1
    );
    if (!currentTurnPLayer || currentTurnPLayer?.user_id !== Number(userId)) {
      toast.warn("Not your turn!");
      return;
    }

    const hand = playersHands[yourPlayerKey] || [];
    if (hand.length !== 14) {
      return toast.warn("Pick a card before discarding!");
    }
    // console.log("eliminateTimerRef.current", eliminateTimerRef.current);
    // Clear eliminate timer on valid discard
    if (eliminateTimerRef.current) {
      clearTimeout(eliminateTimerRef.current);
      eliminateTimerRef.current = null;
    }
    // console.log("eliminateTimerRef.current", eliminateTimerRef.current);

    const payload = {
      userId,
      roomId: roomData?.response?.players[0]?.room_id,
      cardId: cardToDiscard.id,
      isFinalDeclare: false,
    };
    console.log("payload discardCardFromHand", payload);
    PoolRummySocket.emit("pool_discardCard", payload);
    setCardDiscardedFromHand(cardToDiscard);
  };
  // declare should after discardCard event
  const discardCardFromHandFinally = (cardToDiscard) => {
    if (!PoolRummySocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      PoolRummySocket.connect();
      return;
    }
    const currentTurnPLayer = roomData?.response?.players?.find(
      (p) => p.is_turn === 1
    );
    if (!currentTurnPLayer || currentTurnPLayer?.user_id !== Number(userId)) {
      toast.warn("Not your turn!");
      return;
    }
   
    const hasAtLeast2Sequences =
       sortedResult?.pureSequences.length >= 2;
    const hasAtLeast1Pure = sortedResult.sets.length >= 1;

    if (!hasAtLeast2Sequences && !hasAtLeast1Pure) {
      toast.error(
        "You must have at least 2 sequences and 1 set before discarding."
      );
      return;
    }

    if (eliminateTimerRef.current) {
      clearTimeout(eliminateTimerRef.current);
      eliminateTimerRef.current = null;
    }
    const payload = {
      userId,
      roomId: roomData?.response?.players[0]?.room_id,
      cardId: cardToDiscard?.id,
      isFinalDeclare: true,
    };
    console.log("payload discardCardFromHandFinally", payload);

    PoolRummySocket.emit("pool_discardCard", payload);
    setCardDiscardedFromHand(cardToDiscard);
  };
  // console.log("card staus", cardDiscardedFromHand);
  const pickFromDiscardPile = () => {
    // console.log("")
    if (!PoolRummySocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      PoolRummySocket.connect();
      return;
    }
    const currentTurnPLayer = roomData?.response?.players?.find(
      (p) => p.is_turn === 1
    );
    if (!currentTurnPLayer || currentTurnPLayer?.user_id !== Number(userId)) {
      toast.warn("Not your turn!");
      return;
    }
    if (setDeclareAfterFinally === true) {
      toast.warn("opponent is waiting for you declaration");
      return;
    }
    // make it discardPile when recieving from backend
    if (userResult?.cards?.length === 14) {
      toast.warn("Card has been discarded already!");
      return;
    }
    const payload = {
      userId,
      roomId: roomData?.response?.players[0]?.room_id,
      cardId: discardPile?.id, // Top discarded card
    };
    PoolRummySocket.emit("pool_selectCardsFromDiscardedCards", payload);
    setDiscardPile(null);
    setHasPickedCard(true); // After successful pick
  };
  const pickFromLeftDeck = () => {
    if (!PoolRummySocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      PoolRummySocket.connect();
      return;
    }
    const currentTurnPLayer = roomData?.response?.players?.find(
      (p) => p.is_turn === 1
    );
    if (!currentTurnPLayer || currentTurnPLayer?.user_id !== Number(userId)) {
      toast.warn("Not your turn!");
      return;
    }
    //console.log("showRemainingCards", showRemainingCards);
    if (showRemainingCards?.length === 0) {
      toast.warn("No cards left in the remaining deck!");
      return;
    }

    if (setDeclareAfterFinally === true) {
      toast.warn("opponent is waiting for you declaration");
      return;
    }
    if (userResult?.cards?.length > 13) {
      toast.warn("Card has been discarded already!");
      return;
    }
    const payload = {
      userId,
      roomId: roomData?.response?.players[0]?.room_id,
      cardId: showRemainingCards[0]?.id, // Send top card from deck
    };
    PoolRummySocket.emit("pool_selectCardsFromLeftCards", payload);
    setHasPickedCard(true); // After successful pick
  };
  // declare
  const handleDeclare = () => {
    if (!PoolRummySocket?.connected) {
      return toast.warn("⚠️ Server not connected. Try again.");
    }
    const currentTurnPLayer = roomData?.response?.players?.find(
      (p) => p.is_turn === 1
    );
    if (!currentTurnPLayer || currentTurnPLayer?.user_id !== Number(userId)) {
      toast.warn("Not your turn!");
      return;
    }
    // console.log("first")
    if (!declareAfterFinally) {
      // return toast.warn("⚠️ Server not connected. Try again.");
      return;
    }
    // console.log("second");

    const hand = playersHands[yourPlayerKey] || [];
    if (hand.length !== 13) {
      return toast.warn("You must discard one card before declaring.");
    }
    // console.log("third hand", hand);

    const payload = {
      roomId: roomData?.response?.players[0]?.room_id,
      userId: Number(userId),
      declaredCards: hand,
    };
    // console.log("handledeclare payload", payload);
    PoolRummySocket.emit("pool_declare", payload);
    toast.success("Declaration submitted! Waiting for result...");
    setDeclareAfterFinally(false); // Reset declare state
  };

  const onClose = () => {
    setEliminatedModalVisible(false);
    navigate("/plmenu");
  };

  // const prevHandLength = useRef(0);

  useEffect(() => {
    const updatedHand = playersHands?.[yourPlayerKey];
    if (!updatedHand) return;

    setUserResult({ cards: updatedHand });
    setSortEnabled(false); // 👈 Reset sort flag
    // if (updatedHand.length === 14) {
    //   const result = analyzeHand(updatedHand);
    //   setSortedResult(result);
    // } else {
    //   setSortedResult(null);
    // }
  }, [playersHands?.[yourPlayerKey]]);
  // console.log("turnCountdownturnCountdown",turnCountdown)
  useEffect(() => {
    const updatedHand = playersHands?.[yourPlayerKey];
    const isYourTurn = currentTurnUserId === Number(userId);
    const countdown = roomData?.response?.loading_timer?.countdown;
    const timerStatus = roomData?.response?.loading_timer?.status;

    // Only when:
    // - your turn
    // - timerStatus is active (usually 3)
    // - countdown is 2 seconds
    // - you have 14 cards
    // - and you haven't discarded yet
    if (
      isYourTurn &&
      timerStatus === 4 &&
      countdown === 2 &&
      updatedHand?.length === 14
    ) {
      const currentHand = updatedHand;
      // Optional: You can use better logic to pick which card to discard
      const cardToDiscard = currentHand[currentHand.length - 1];
      // console.log("⏳ Auto-discarding due to timeout:", cardToDiscard);
      discardCardFromHand(cardToDiscard);
    }
  }, [
    playersHands?.[yourPlayerKey],
    currentTurnUserId,
    roomData?.response?.loading_timer?.countdown,
    cardDiscardedFromHand,
  ]);

  // squence ,pure sequencxe , left cards mapping
  // const results = roomData?.response?.results;
  // const playerHand = roomData?.response?.players;
  // const userResult = playerHand?.find(
  //   (player) => player.user_id === Number(userId))?.game_card;
  const playerAnalysedHandTurnStarted = roomData?.response?.results;
  const playerAnalysedHandloading_timer =
    roomData?.response?.loading_timer?.results;

  // console.log(
  //   "playerAnalysedHand",
  //   playerAnalysedHandTurnStarted,
  //   playerAnalysedHandloading_timer
  // );

  // Determine which one is available
  const sourceData =
    playerAnalysedHandTurnStarted || playerAnalysedHandloading_timer;

  // Convert to array only if it's an object
  const analysedList =
    sourceData && typeof sourceData === "object"
      ? Object.entries(sourceData).map(([userId, data]) => ({
          user_id: Number(userId),
          ...data,
        }))
      : [];

  // console.log("analysedList", analysedList);

  // Find the matching player object based on userId
  const userData = analysedList.find(
    (player) => player.user_id === Number(userId)
  );
  // console.log("userData", userData);
  // Get leftPoints
  const userPoints = userData?.leftPoints;
  const splitIntoRows = (cards) => {
    const mid = Math.ceil(cards.length / 2);
    return [cards.slice(0, mid), cards.slice(mid)];
  };

  // console.log("userResult userResult", userResult);
  // console.log("sortedResultsortedResult", sortedResult);

  return (
    <div className="w-full h-screen bg-[#1b0e26] flex flex-col items-center py-2 px-4 relative">
      {showRemainingCards &&
        jokerCard &&
        deck.length > 0 &&
        !eliminatedModalVisible && (
          <LeftDiscarded
            jokerCard={jokerCard}
            deck={deck}
            playersHands={playersHands}
            pickFromDeck={pickFromLeftDeck}
            pickFromDiscardPile={pickFromDiscardPile}
            leftDeck={showRemainingCards}
            discardedPile={discardPile}
          />
        )}
      {!eliminatedModalVisible && (
        <GameTable
          message={message}
          gameStartTimer={gameStartTimer}
          lockMessageShown={lockMessageShown}
          tossWinnerMessage={tossWinnerMessage}
          playerPositions={playerPositions}
          showRemainingCards={showRemainingCards}
          jokerCard={jokerCard}
          discardPile={discardPile}
          roomData={roomData}
          gameType={gameType}
          tossWinnerKey={tossWinnerKey}
          currentTurnUserId={currentTurnUserId}
          turnCountdown={turnCountdown}
        />
      )}
      {animatedHand.length > 0 ? (
        <CardDealingAnimation
          mappedCards={animatedHand}
          onFinish={() => {
            setAnimatedHand([]); // 🧼 clear animation state
            setDealtCards(animatedHand); // 🟢 finally set dealt cards now
            setPlayersHands((prev) => ({
              ...prev,
              [yourPlayerKey]: animatedHand,
            }));
            setDealingComplete(true);
          }}
        />
      ) : dealingComplete && playersHands?.[yourPlayerKey]?.length > 0 ? (
        <>
          {/* <div className="mb-2">
            {!sortedResult && (
              <button
                onClick={handleSort}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Sort
              </button>
            )}
          </div> */}

          {userResult && (
            <div className="mt-4">
              <div className="flex items-start justify-center gap-[5px] mt-2 flex-wrap">
                { sortedResult ? (
                  <>
                    {/* 🔹 Sorted Sequences */}
                    {sortedResult?.sequences?.length > 0 &&
                      sortedResult.sequences.map((sequence, idx) => (
                        <div
                          key={`seq-${idx}`}
                          className="flex gap-1 border p-1 rounded bg-green-50"
                        >
                          {sequence.map((card, i) => (
                            <Card
                              key={`seq-card-${idx}-${i}`}
                              card={card}
                              faceDown={false}
                              onClick={() => {
                                const totalLength =
                                  (sortedResult.sequences?.flat().length || 0) +
                                  (sortedResult.sets?.flat().length ||
                                    0) +
                                  (sortedResult.leftCards?.length || 0);
                                if (
                                  currentTurnUserId &&
                                  currentTurnUserId === Number(userId)
                                ) {
                                  if (totalLength >= 14) {
                                    setSelectedCardForAction(card);
                                  } else {
                                    toast.warn("Card has not discarded yet");
                                  }
                                } else {
                                  toast.warn("not your turn");
                                }
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    {/* 🔹 Pure Sequences */}
                    {/* {sortedResult?.pureSequences?.length > 0 &&
                      sortedResult.pureSequences.map((sequence, idx) => (
                        <div
                          key={`pure-seq-${idx}`}
                          className="flex gap-1 border p-1 rounded bg-blue-50"
                        >
                          {sequence.map((card, i) => (
                            <Card
                              key={`pure-card-${idx}-${i}`}
                              card={card}
                              faceDown={false}
                              onClick={() => {
                                const totalLength =
                                  (sortedResult.sequences?.flat().length || 0) +
                                  (sortedResult.pureSequences?.flat().length ||
                                    0) +
                                  (sortedResult.leftCards?.length || 0);
                                if (
                                  currentTurnUserId &&
                                  currentTurnUserId === Number(userId)
                                ) {
                                  if (totalLength === 14) {
                                    setSelectedCardForAction(card);
                                  } else {
                                    toast.warn("Card has not discarded yet");
                                  }
                                } else {
                                  toast.warn("not your turn");
                                }
                              }}
                            />
                          ))}
                        </div>
                      ))} */}
                    {sortedResult?.sets?.length > 0 &&
                      sortedResult.sets.map((set, idx) => (
                        <div
                          key={`pure-seq-${idx}`}
                          className="flex gap-1 border p-1 rounded bg-blue-50"
                        >
                          {set.map((card, i) => (
                            <Card
                              key={`pure-card-${idx}-${i}`}
                              card={card}
                              faceDown={false}
                              onClick={() => {
                                const totalLength =
                                  (sortedResult.sequences?.flat().length || 0) +
                                  (sortedResult.sets?.flat().length ||
                                    0) +
                                  (sortedResult.leftCards?.length || 0);
                                if (
                                  currentTurnUserId &&
                                  currentTurnUserId === Number(userId)
                                ) {
                                  if (totalLength >= 14) {
                                    setSelectedCardForAction(card);
                                  } else {
                                    toast.warn("Card has not discarded yet");
                                  }
                                } else {
                                  toast.warn("not your turn");
                                }
                              }}
                            />
                          ))}
                        </div>
                      ))}
                  
                    {/* 🔹 Left Cards */}
                    {sortedResult?.leftCards?.length > 0 && (
                      <div className="flex gap-1 border p-1 rounded bg-red-50">
                        {sortedResult.leftCards.map((card, i) => (
                          <Card
                            key={`left-card-${i}`}
                            card={card}
                            faceDown={false}
                            onClick={() => {
                              const totalLength =
                                (sortedResult.sequences?.flat().length || 0) +
                                (sortedResult.sets?.flat().length ||
                                  0) +
                                (sortedResult.leftCards?.length || 0);
                              if (
                                currentTurnUserId &&
                                currentTurnUserId === Number(userId)
                              ) {
                                if (totalLength >= 14) {
                                  setSelectedCardForAction(card);
                                } else {
                                  toast.warn("Card has not discarded yet");
                                }
                              } else {
                                toast.warn("not your turn");
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Raw Mapping without Sort */}
                    {userResult?.cards?.length > 0 && (
                      <div className="flex gap-1 border p-1 rounded bg-gray-100">
                        {splitIntoRows(userResult.cards).map(
                          (row, rowIndex) => (
                            <div
                              key={`row-${rowIndex}`}
                              className="flex gap-1 mb-1"
                            >
                              {row.map((card, i) => (
                                <Card
                                  key={`raw-card-${rowIndex}-${i}`}
                                  card={card}
                                  faceDown={false}
                                  onClick={() => {
                                    if (
                                      currentTurnUserId &&
                                      currentTurnUserId === Number(userId)
                                    ) {
                                      if (userResult?.cards.length >= 14) {
                                        setSelectedCardForAction(card);
                                      } else {
                                        toast.warn(
                                          "Card has not discarded yet"
                                        );
                                      }
                                    } else {
                                      toast.warn("not your turn");
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}

      {cardDiscardedFromHand && turnCountdown === 1 && (
        <div className="absolute top-2 text-sm bg-black bg-opacity-50 text-bg2 font-bold">
          ⏱️ Auto-discarded due to timeout
        </div>
      )}

      <div className="flex items-center justify-between w-full">
        <div>{userPoints ? userPoints : 0}</div>
        <div>
          {selectedCardForAction && (
            <div className="flex gap-4 mt-2">
              <button
                className="bg-green text-white px-4 py-2 rounded"
                onClick={() => {
                  discardCardFromHandFinally(selectedCardForAction);
                  setSelectedCardForAction(null);
                }}
              >
                Declare
              </button>
              <button
                className="bg-bg2 text-white px-4 py-2 rounded"
                onClick={() => {
                  discardCardFromHand(selectedCardForAction);
                  setSelectedCardForAction(null);
                }}
              >
                Discard
              </button>
            </div>
          )}
          {declareAfterFinally && (
            <div className="flex gap-4 mt-2">
              <button
                className="bg-green text-white px-4 py-2 rounded"
                onClick={handleDeclare}
              >
                Declare
              </button>
            </div>
          )}
        </div>
      </div>

      {finalWinnerModalVisible && finalResultData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-2xl font-bold text-center mb-4">
              🎉 Final Game Result
            </h2>

            {Object.entries(finalResultData).map(([playerId, result]) => (
              <div key={playerId} className="mb-4 border-b pb-4">
                <h3 className="font-semibold text-lg mb-1">
                  Player:{" "}
                  {
                    playerPositions?.[
                      Object.keys(playerPositions).find(
                        (k) =>
                          roomData?.response?.players.find(
                            (p) => p.user_id === Number(playerId)
                          )?.user_name === playerPositions[k]
                      )
                    ]
                  }
                </h3>

                <p className="text-sm mb-1 text-green-600">
                  Points: {result.leftPoints ?? "N/A"}
                </p>

                <p className="font-medium">Pure Sequences:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(result.pureSequences || []).flat().map((card, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-200 px-2 py-1 rounded"
                    >
                      {card.rank} of {card.suit}
                    </span>
                  ))}
                </div>

                <p className="font-medium">Other Sequences:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(result.sequences || []).flat().map((card, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-200 px-2 py-1 rounded"
                    >
                      {card.rank} of {card.suit}
                    </span>
                  ))}
                </div>

                <p className="font-medium">Left Cards:</p>
                <div className="flex flex-wrap gap-2">
                  {(result.leftCards || []).map((card, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-200 px-2 py-1 rounded"
                    >
                      {card.rank} of {card.suit}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setFinalWinnerModalVisible(false);
                navigate("/plmenu"); // or reload game
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {finalWinnerModalVisible && (
        <WinnerLoserModal
          visible={finalWinnerModalVisible}
          onClose={onClose}
          winner={eliminatedWinner}
          loser={eliminatedLoser}
          fullDeck={fullDeck}
          message={message}
          resultType={resultType}
          jokerCard={jokerCard}
          gameTie={gameTie}
        />
      )}
      {eliminatedModalVisible && (
        <WinnerLoserModal
          visible={eliminatedModalVisible}
          onClose={onClose}
          winner={eliminatedWinner}
          loser={eliminatedLoser}
          fullDeck={fullDeck}
          message={message}
          resultType={resultType}
          jokerCard={jokerCard}
          gameTie={gameTie}
        />
      )}
    </div>
  );
};
export default PoolRummyHome;
