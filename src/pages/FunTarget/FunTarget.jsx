import { useState, useEffect, useRef } from "react";
import homebg from "../../assets/FunTargetAssets/homebg.png";
import yellobtns from "../../assets/FunTargetAssets/yellobtns.png";
import one from "../../assets/FunTargetAssets/1.png";
import five from "../../assets/FunTargetAssets/5.png";
import ten from "../../assets/FunTargetAssets/10.png";
import fifty from "../../assets/FunTargetAssets/50.png";
import thousand from "../../assets/FunTargetAssets/1000.png";
import fivehundred from "../../assets/FunTargetAssets/fivehundred.png";
import badachkra from "../../assets/FunTargetAssets/badachkra.png";
import chotachakra1 from "../../assets/FunTargetAssets/chotachakra.png";
import chotachakra2 from "../../assets/FunTargetAssets/chotachakra.png"; // add alternate image here
import scr1 from "../../assets/FunTargetAssets/scr.png";
import scr2 from "../../assets/FunTargetAssets/scrpio.gif"; // add alternate image here
import badge from "../../assets/FunTargetAssets/badge.png";
import cancelbet from "../../assets/FunTargetAssets/cancelbet.png";
import betokright from "../../assets/FunTargetAssets/betokright.png";
import lefttake from "../../assets/FunTargetAssets/lefttake.png";
import cirlbtn from "../../assets/FunTargetAssets/cirlbtn.png";
import circlbtn from "../../assets/FunTargetAssets/circlbtn.png";
import bottombig from "../../assets/FunTargetAssets/bottombig.png";
import staticCoin from "../../assets/FunTargetAssets/staticCoin.png";
import main from "../../assets/FunTargetAssets/main.gif";
import FunTargetHeader from "./FunTargetHeader";
import FunTargetSocket from "./FunTargetSocket";
import apis from "../../utils/apis";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function FunTarget() {
  const [selectedCoinValue, setSelectedCoinValue] = useState(null);
  const [circleValues, setCircleValues] = useState(Array(10).fill(0));
  const [selectedAmounts, setSelectedAmounts] = useState(Array(10).fill(0));
  const [lastBet, setLastBet] = useState(Array(10).fill(0));
  const userId = localStorage.getItem("userId");
  const [profileRefresher, setProfileRefresher] = useState(false);
  const [gameResultData, setGameResultData] = useState([]);
  const [gameResultHistory, setGameResultHistory] = useState([]);
  const [gameResultDataAnnouncemnt, setGameResultDataAnnouncemnt] =
    useState(null);
  const [betStatus, setBetStatus] = useState(false);
  const [isbetRepeated, setisbetRepeated] = useState(false);
  const [repeatBetPayload, setRepeatBetPayload] = useState(null);
  const [repeatCoinValue, setRepeatCoinValue] = useState(null);
  const [repeatCircleIndex, setRepeatCircleIndex] = useState(null);
  const [cancelOrder, setCancelOrder] = useState([]); // track cancel order
  // Spin wheel states
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const handleSocket = (hotair) => {
      const q = JSON.parse(hotair);
      setTimeLeft(q);
    };
    FunTargetSocket.on("gameon_funtarget", handleSocket);
    return () => FunTargetSocket.off("gameon_funtarget", handleSocket);
  }, []);

  const segments = 20;
  const degreesPerSegment = 360 / segments;
  const fullRotation = 360;
  const positionsPerNumber = 2;

  const lastResultRef = useRef(0); // to track where it stopped last

  const spinWheel = (newResult) => {
    if (isSpinning) return;

    const lastResult = lastResultRef.current;

    // 🔁 Flip index to match clockwise layout
    const flippedIndex = (number) => (10 - number) % 10;

    const lastIndex = flippedIndex(lastResult) * positionsPerNumber;
    const newIndex = flippedIndex(newResult) * positionsPerNumber;

    let segmentDiff = newIndex - lastIndex;
    if (segmentDiff < 0) segmentDiff += segments;

    const deltaAngle = segmentDiff * degreesPerSegment;
    const extraSpins = 8;
    const spinAngle = extraSpins * fullRotation + deltaAngle;

    const newRotation = rotation + spinAngle;

    setIsSpinning(true);
    setRotation(newRotation);
    lastResultRef.current = newResult;

    setTimeout(() => {
      setIsSpinning(false);
    }, 6000);
  };

  const coinlist1 = [
    { img: one, value: 1 },
    { img: five, value: 5 },
    { img: ten, value: 10 },
  ];

  const coinlist2 = [
    { img: fifty, value: 50 },
    { img: fivehundred, value: 500 },
    { img: thousand, value: 1000 },
  ];

  const handleCoinClick = (amount) => {
    setSelectedCoinValue(amount);
    if (isbetRepeated) {
      // reset repeat-related UI & data when user changes coin manually
      setisbetRepeated(false);
      setRepeatCoinValue(null);
      setRepeatCircleIndex(null);
    }
  };
  // console.log("circleValues", circleValues);
  const handleCircleClick = (index) => {
    if (selectedCoinValue === null) {
      toast.warn("Please select a coin first");
      return;
    }
    const updated = [...circleValues];
    updated[index] += selectedCoinValue;
    setCircleValues(updated);

    const newSelected = [...selectedAmounts];
    newSelected[index] += selectedCoinValue;
    setSelectedAmounts(newSelected);

    // Track cancel order
    setCancelOrder((prev) => [...prev, index]);

    if (isbetRepeated) {
      setisbetRepeated(false);
      setRepeatCoinValue(null);
      setRepeatCircleIndex(null);
    }
  };

  // console.log("selectedAmountsselectedAmounts", selectedAmounts);
  // Function to repeat the last bet
  const repeatBet = async () => {
    if (!repeatBetPayload || !repeatBetPayload.bets?.length) {
      toast.warn("Place a bet first before repeating");
      return;
    }
    setCancelOrder(repeatBetPayload.bets.map((b) => b.game_id));
    // Pick first index/amount from repeat payload to reflect in UI
    const { game_id, amount } = repeatBetPayload.bets[0];
    setRepeatCircleIndex(game_id);
    setRepeatCoinValue(amount);
    setSelectedCoinValue(amount); // auto-select that coin
    setisbetRepeated(true);
    console.log("repeatBetPayload", repeatBetPayload);
    try {
      const response = await axios.post(apis?.funTarget_bet, repeatBetPayload);
      if (response?.data?.status === 200) {
        setRepeatCircleIndex(null);
        setRepeatCoinValue(null);
        setSelectedCoinValue(null);
        setBetStatus(true);
        setProfileRefresher(true);
        localStorage.setItem("funtarget_bet", "true");
        toast.success(response?.data?.message);

        // ✅ Track order for repeated payload
        const orderedIndexes = repeatBetPayload.bets.map((b) => b.game_id);
        setCancelOrder(orderedIndexes);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error placing repeat bet");
    }
  };
  // Function to cancel all bets
  const cancelBetLastSelected = () => {
    const updatedCircle = [...circleValues];
    const updatedSelected = [...selectedAmounts];

    const order = [...cancelOrder];
    if (order.length === 0) return;

    const lastIndex = order[order.length - 1];

    updatedCircle[lastIndex] = 0;
    updatedSelected[lastIndex] = 0;

    setCircleValues(updatedCircle);
    setSelectedAmounts(updatedSelected);
    setCancelOrder(order.slice(0, -1));

    // Also clear repeat state if applicable
    if (isbetRepeated && repeatBetPayload) {
      const remainingBets = repeatBetPayload.bets.filter(
        (b) => b.game_id !== lastIndex
      );
      if (remainingBets.length === 0) {
        setisbetRepeated(false);
        setRepeatCoinValue(null);
        setRepeatCircleIndex(null);
        setRepeatBetPayload(null);
      } else {
        setRepeatBetPayload((prev) => ({
          ...prev,
          bets: remainingBets,
        }));
      }
    }
  };

  const clearAllBet = () => {
    setLastBet([...circleValues]);
    setCircleValues(Array(10).fill(0));
    setSelectedAmounts(Array(10).fill(0));
    setCancelOrder([]);

    // clear repeat state if active
    if (isbetRepeated) {
      setisbetRepeated(false);
      setRepeatCoinValue(null);
      setRepeatCircleIndex(null);
      setRepeatBetPayload(null);
    }
  };

  useEffect(() => {
    const totalBet = circleValues.reduce((a, b) => a + b, 0);
    if (totalBet > 0) {
      setLastBet([...circleValues]);
    }
  }, [circleValues]);

  const placeBetHandler = async () => {
    if (!userId) {
      toast.error("User not logged in");
      navigate("/login");
      return;
    }
    const totalBet = circleValues.reduce((sum, val) => sum + val, 0);
    if (totalBet === 0) {
      toast.warn("Please place a bet first");
      return;
    }

    const bets = [];
    circleValues.forEach((amount, index) => {
      if (amount > 0) {
        bets.push({ game_id: index, amount });
      }
    });

    const payload = {
      user_id: userId,
      bets,
    };
    console.log("object", payload);
    try {
      const response = await axios.post(apis?.funTarget_bet, payload);
      // console.log("bet resoinse", response);
      if (response?.data?.status === 200) {
        setRepeatBetPayload(payload);
        setBetStatus(true);
        setProfileRefresher(true);
        localStorage.setItem("funtarget_bet", "true");
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (err) {
      console.log("error bet", err);
      if (err?.response?.data?.status === 500) {
        console.log("error bet", err);
      } else {
        toast.error(err?.response?.data?.message);
      }
    }
  };
  // period number and last some results
  const gameResultSpinWheel = async () => {
    try {
      const res = await axios.get(`${apis?.funTarget_result}`);
      console.log("gameResultSpinWheel res", res);
      if (res?.data?.status === 200) {
        const number = res?.data?.data[0]?.number;
        spinWheel(number);
      }
    } catch (err) {
      if (err?.response?.data?.status === 500) {
        console.log("error hisotry", err);
      } else {
        toast.error(err?.response?.data?.message);
      }
    }
  };
  const gameResult = async () => {
    try {
      const res = await axios.get(`${apis?.funTarget_result}`);
      console.log("game res", res);
      if (res?.data?.status === 200) {
        setGameResultData(res?.data?.data);
      }
    } catch (err) {
      if (err?.response?.data?.status === 500) {
        console.log("error hisotry", err);
      } else {
        toast.error(err?.response?.data?.message);
      }
    }
  };

  const gameResultAnnouncement = async () => {
    if (!userId) {
      toast.error("User not logged in");
      navigate("/login");
      return;
    }
    // const sr = gameResultData[0]?.games_no;

    // console.log("pYLOASD", payload);
    try {
      const response = await axios.get(`${apis?.funTarget_winAmount}${userId}`);
      console.log("announcement responsere", response);
      if (response?.data?.status === 200) {
        setGameResultDataAnnouncemnt(response?.data);
        // setIsResultModal(true);
      }
    } catch (err) {
      //   console.log("server announcement erro ", err);
      if (err?.response?.data?.status === 500) {
        console.log("server erro ", err);
      } else {
        toast.error(err?.response?.data?.message);
      }
    }
  };

  const gameBetHistory = async () => {
    try {
      const res = await axios.get(
        `${apis?.funTarget_bet_history}${userId}&limit=10`
      );
      // console.log("hisotry", res);
      if (res?.data?.status === 200) {
        setGameResultHistory(res?.data?.data);
      }
    } catch (err) {
      //   console.log("error hisotry", err);
      if (err?.response?.data?.status === 500) {
        console.log("error hisotry", err);
      } else {
        toast.error(err?.response?.data?.message);
      }
    }
  };
  useEffect(() => {
    gameResult();
    gameBetHistory();
    gameResultAnnouncement();
    resetWheel();
    setSelectedCoinValue(null);
    setisbetRepeated(false);
  }, []);

  useEffect(() => {
    if (timeLeft?.timerBetTime === 9 && timeLeft?.timerStatus === 2) {
      gameResultSpinWheel();
    }
    if (timeLeft?.timerBetTime === 4 && timeLeft?.timerStatus === 2) {
      gameResult();
    }
    if (timeLeft?.timerBetTime === 3 && timeLeft?.timerStatus === 2) {
      gameBetHistory();
    }
    if (timeLeft?.timerBetTime === 1 && timeLeft?.timerStatus === 2) {
      resetWheel();
    }
  }, [timeLeft]);
  const resetWheel = () => {
    gameResultAnnouncement();
    setisbetRepeated(false);
    setSelectedCoinValue(null);
    setCircleValues(Array(10).fill(0));
    // setRotation(0);
    setBetStatus(false);
    const Status = localStorage.getItem("funtarget_bet");
    if (Status === "true") {
      localStorage.setItem("funtarget_bet", "false");
    }
    setIsSpinning(false);
  };

  useEffect(() => {
    const Status = localStorage.getItem("funtarget_bet");
    if (Status === "true") {
      setBetStatus(true);
    }
  }, [betStatus]);
  console.log("GameResultDataAnnouncemnt", gameResultDataAnnouncemnt);
  const totalBetAmount =
    isbetRepeated && repeatBetPayload?.bets
      ? repeatBetPayload.bets.reduce((acc, cur) => acc + cur.amount, 0)
      : selectedAmounts.reduce((sum, amount) => sum + amount, 0);
  // 🔄 Use this rendering block for your bet buttons (replaces existing UI)
  const renderBetCircles = () => {
    return [...Array(10).keys()].map((index) => {
      let showAmount = 0;

      if (isbetRepeated && repeatBetPayload?.bets) {
        showAmount =
          repeatBetPayload.bets.find((b) => b.game_id === index)?.amount || 0;
      } else {
        showAmount = circleValues[index];
      }

      return (
        <div
          key={index}
          onClick={() => handleCircleClick(index)}
          className="cursor-pointer"
        >
          <div className="relative h-7 w-8">
            <img src={cirlbtn} alt="" className="h-full w-full" />
            {showAmount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-[10px] pointer-events-none">
                {showAmount}
              </div>
            )}
          </div>
          <div className="relative h-7 w-7">
            <img src={circlbtn} alt="" className="h-full w-full" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] pointer-events-none">
              {index}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className="h-full min-h-screen overflow-y-scroll hide-scrollbar bg-center"
      style={{
        backgroundImage: `url(${homebg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
      }}
    >
      <FunTargetHeader
        profileRefresher={profileRefresher}
        gameResultHistory={gameResultHistory}
        setProfileRefresher={setProfileRefresher}
        timeLeft={timeLeft}
      />

      {/* sn and win amount */}
      <div className="flex justify-between m-4">
        <div className="flex-col items-center justify-center text-center ">
          <p
            className="font-roboto text-[12px] font-extrabold"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            S.no
          </p>
          <div
            className="relative h-6  w-20 px-1 text-[10px] font-roboto text-center  overflow-hidden"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            <img
              src={yellobtns}
              alt="Balance"
              className="absolute inset-0 w-full h-full opacity-90"
            />
            <div className="relative flex items-center justify-center h-full text-black font-bold">
              {gameResultData?.length > 0 &&
                Number(gameResultData[0]?.games_no) + 1}
            </div>
          </div>
        </div>
        <div className="flex-col items-center justify-center text-center ">
          <p
            className="font-roboto text-[12px] font-extrabold"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            Winner
          </p>
          <div
            className="relative h-6  w-20 text-[10px] font-roboto text-center text-white overflow-hidden"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            <img
              src={yellobtns}
              alt="Balance"
              className="absolute inset-0 w-full h-full opacity-90"
            />
            <div className="relative flex items-center justify-center h-full text-black font-bold">
              {gameResultDataAnnouncemnt?.win_amount > 0
                ? Number(gameResultDataAnnouncemnt?.win_amount).toFixed(2)
                : 0}
            </div>
          </div>
        </div>
      </div>
      {/* Time + Last 10 */}
      <div className="flex justify-between m-4">
        <div className="flex-col items-center justify-center text-center ">
          <p
            className="font-roboto text-[12px] font-extrabold"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            Time
          </p>
          <div
            className="relative h-6  w-20 text-[10px] font-roboto text-center text-white overflow-hidden"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            <img
              src={yellobtns}
              alt="Balance"
              className="absolute inset-0 w-full h-full opacity-90"
            />
            <div className="relative flex items-center justify-center h-full text-black font-bold">
              {timeLeft?.timerBetTime}
            </div>
          </div>
        </div>
        <div className="flex-col items-center justify-center text-center ">
          <p
            className="font-roboto text-[12px] font-extrabold"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            Last 10 data
          </p>
          <div
            className="relative h-6 w-20 px-1 text-[10px] font-roboto text-center text-white overflow-hidden"
            style={{ textShadow: "1px 1px 3px black" }}
          >
            <img
              src={yellobtns}
              alt="Balance"
              className="absolute inset-0 w-full h-full opacity-90"
            />
            <div className="relative flex items-center justify-center h-full text-black font-bold">
              {gameResultData?.length > 0 ? (
                gameResultData.map((item, i) => <p key={i}>{item?.number}</p>)
              ) : (
                <p>No results</p> // Optional fallback
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chakra and Coins */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={badge}
          alt="Bottom Decoration"
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-h-80 object-contain z-50"
        />
        <div className="flex justify-between items-start mt-20 relative z-20 ">
          {/* Left Coins */}
          <div className="h-8 w-24 bg-yellow opacity-80 rounded-e-xl">
            <div
              className="relative flex overflow-x-auto space-x-1 items-center h-full text-center hide-scrollbar justify-center"
              style={{ textShadow: "1px 1px 3px black" }}
            >
              {coinlist1.map((coin, index) => (
                <img
                  key={index}
                  src={coin.img}
                  onClick={() => handleCoinClick(coin.value)}
                  className={`w-7 h-7 shadow-md cursor-pointer rounded-full ${
                    selectedCoinValue === coin.value
                      ? "border-2 border-yellow-400"
                      : ""
                  }`}
                  alt={`coin-${coin.value}`}
                />
              ))}
            </div>
          </div>

          {/* Chakra - with rotation */}
          <div
            className="relative h-52 w-52 rounded-full cursor-pointer"
            onClick={spinWheel}
          >
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src={badachkra}
              alt="Big Wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 6s cubic-bezier(0.33, 1, 0.68, 1)"
                  : "none",
                transformOrigin: "50% 50%",
              }}
            />

            <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 origin-center">
              <img src={isSpinning ? main : chotachakra1} alt="Center Wheel" />
            </div>
            <img
              src={isSpinning ? scr2 : scr1}
              alt="Top Decoration"
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 max-5 z-50"
            />
          </div>

          {/* Right Coins */}
          <div className="h-8 w-24 bg-yellow opacity-80 rounded-s-xl">
            <div
              className="relative flex overflow-x-auto space-x-1 items-center h-full text-center hide-scrollbar justify-center"
              style={{ textShadow: "1px 1px 3px black" }}
            >
              {coinlist2.map((coin, index) => (
                <img
                  key={index}
                  src={coin.img}
                  onClick={() => handleCoinClick(coin.value)}
                  className={`w-7 h-7 shadow-md cursor-pointer rounded-full ${
                    selectedCoinValue === coin.value
                      ? "border-2 border-yellow-400"
                      : ""
                  }`}
                  alt={`coin-${coin.value}`}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Spin Button below chakra */}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-around gap-5 m-9">
        <button className="relative h-12 w-28" onClick={repeatBet}>
          <img src={cancelbet} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] pointer-events-none">
            Repeat
          </div>
        </button>
        <button className="relative h-12 w-28" onClick={cancelBetLastSelected}>
          <img src={cancelbet} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] pointer-events-none">
            Cancel Bet
          </div>
        </button>
      </div>

      {/* Take / Cancel Ok */}
      <div className="flex items-start justify-between mt-9">
        <button onClick={clearAllBet} className="relative h-12 w-28">
          <img src={lefttake} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] pointer-events-none">
            Clear all
          </div>
        </button>
        <button
          disabled={timeLeft?.timerBetTime < 11 && timeLeft?.timerStatus === 2}
          onClick={placeBetHandler}
          className="relative h-12 w-28"
        >
          <img src={betokright} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[14px] pointer-events-none">
            Bet Ok
          </div>
        </button>
      </div>

      {/* Circle Buttons with Total Amount */}
      <div className="flex space-x-1 items-center justify-center mt-5">
        {renderBetCircles()}
      </div>

      {/* Selected Coin Display */}
      <div className="flex items-start justify-between mt-7">
        <button className="relative h-7 w-18">
          <img src={lefttake} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] pointer-events-none">
            {totalBetAmount}
          </div>
        </button>
        <div className="relative h-7 w-64 flex items-center justify-center text-black">
          <img src={bottombig} alt="" className="h-7 w-64 absolute inset-0" />
          <p className="absolute top-2 left-2 text-[10px] text-center w-full">
            {betStatus
              ? "You have placed bet in this match!"
              : "You have not placed bet in this match!"}
          </p>
        </div>
        <Link to={-1} className="relative  h-7 w-18">
          <img src={betokright} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] pointer-events-none">
            Exit
          </div>
        </Link>
      </div>
    </div>
  );
}

export default FunTarget;
