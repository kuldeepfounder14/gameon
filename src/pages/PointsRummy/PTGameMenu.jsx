import splash_screen_image from "../../assets/rummy/images/splash_screen_image.jpg";
import bgImage from "../../assets/rummy/images/bgImage.jpg";
import backButton from "../../assets/usaAsset/wingo/back.png";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import PointsRummySocket from "./PointsRummySocket";
import { toast } from "react-toastify";
import useProfile from "../../reusable_component/gameApi";
// jab discsard se draw kr rhe hain to saayd card waha se ni hat rha 
// jokers ui me hand me mat count kro bs poinst k liyew use kro
// declare ogera ka message ni dikh rha aur final declare button ni dikha chchaiye 
// wallet duduction issue 
function PTGameMenu() {
  const userId = localStorage.getItem("userId");
  const [onlineUsers, setOnlineUsers] = useState(getRandomNumber());
  const [toggleGameType, setToggleGameType] = useState(1);
  const navigate = useNavigate();
    const { myDetails, loading, error, fetchProfileDetails } = useProfile(userId);

  function getRandomNumber() {
    return Math.floor(Math.random() * (200 - 10 + 1)) + 10;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(getRandomNumber());
    }, 50000);

    return () => clearInterval(interval);
  }, []);

  const GamePlayerHandler = (playerId) => {
    setToggleGameType(playerId);
  };

  useEffect(() => {
    PointsRummySocket.on("connect", () => {
      console.log("✅ Socket connected:", PointsRummySocket.id);
    });

    PointsRummySocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      PointsRummySocket.off("connect");
      PointsRummySocket.off("connect_error");
    };
  }, []);

  const GamePlayHandler = () => {
    // console.log("fsdfdsfd")
    if (!PointsRummySocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      PointsRummySocket.connect();
      return;
    }
    const payload = { userId, gameId: String(toggleGameType) };
    PointsRummySocket.emit("room", payload);
    PointsRummySocket.on("game_response", (data) => {
      // console.log("connected")
      // console.log("datadata",data)
      sessionStorage.setItem("roomData", JSON.stringify(data));
      navigate(`/pointsrummy/${toggleGameType}`);
    });
    PointsRummySocket.on("insufficient_balance", (data) => {
      // console.log("connected")
     toast.error(data?.message)
      // sessionStorage.setItem("roomData", JSON.stringify(data));
      // navigate(`/pointsrummy/${toggleGameType}`);
    });
  };

  return (
    <div
      className="font-serif"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <header className="px-4 py-2 flex justify-between items-center">
        <Link to={-1}>
          <img src={backButton} className="w-6 h-6" alt="back" />
        </Link>{" "}
        <p className="font-serif">Points Rummy </p>
        <p className="font-serif"> {myDetails ? Number(myDetails?.data?.wallet).toFixed(2) : 0.0}{" "} </p>
      </header>

      <div className="w-full flex flex-col items-center justify-center mt-10 ">
        <img
          src={splash_screen_image}
          className="w-28 h-28 rounded-lg object-fill"
          alt="logo"
        />
      </div>

      <div className="w-full flex flex-col justify-center mt-10 px-10 shadow-lg">
        <div className="flex items-center justify-between w-full">
          <h1>Players</h1>
          <h1 className="flex items-center ">
            <GoDotFill className="text-greenAviator" /> {onlineUsers} Online
          </h1>
        </div>
        {/* <div className="w-full h-7 border shadow-2xl mt-3 border-[#FFFD5D] rounded-md text-[13px]">
          <button
            onClick={() => GamePlayerHandler(1)}
            className={`w-1/2 h-full shadow-2xl rounded-md ${
              toggleGameType === 1 ? "bg-blue-500 text-white" : " text-white"
            }`}
          >
            2 players
          </button>
          <button
            onClick={() => GamePlayerHandler(2)}
            className={`w-1/2 h-full shadow-2xl rounded-md ${
              toggleGameType === 2 ? "bg-blue-500 text-white" : " text-white"
            }`}
          >
            4 players
          </button>
        </div> */}
                 <div className=" h-7 w-full flex justify-center shadow-2xl mt-3 rounded-md text-[13px]">
          <button
            onClick={() => GamePlayerHandler(1)}
            className={`w-1/2 h-full shadow-2xl border border-[#FFFD5D] rounded-md ${
              toggleGameType === 1 ? "bg-blue-500 text-white" : " text-white"
            }`}
          >
            2 players
          </button>
          {/* <button
            onClick={() => GamePlayerHandler(2)}
            className={`w-1/2 h-full shadow-2xl rounded-md ${
              toggleGameType === 2 ? "bg-blue-500 text-white" : " text-white"
            }`}
          >
            4 players
          </button> */}
        </div>
      </div>

      <div className="flex items-center justify-center w-full px-10">
        <button
          onClick={GamePlayHandler}
          className="w-full rounded-md mt-10 bg-green py-1 text-center shadow-2xl"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

export default PTGameMenu;
