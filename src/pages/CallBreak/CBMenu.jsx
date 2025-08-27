import { BsWallet2 } from "react-icons/bs";
import callBreakimage from "../../assets/callbreak/callbreakimage.png";
import { GiTabletopPlayers } from "react-icons/gi";
import useProfile from "../../reusable_component/gameApi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CBSocket from "./CBSocket";
import { GoDotFill } from "react-icons/go";
import { toast } from "react-toastify";
import axios from "axios";
const tableData = [
  {
    id: 1,
    entry_fees: 3,
    player_size: 2,
    win_multiplier: "1.5x",
    win_amount: 4.0,
    noOfRounds: 2,
  },
  {
    id: 2,
    entry_fees: 5,
    player_size: 2,
    win_multiplier: "1.8x",
    win_amount: 9.0,
    noOfRounds: 4,
  },
  //   { win: "1.8x", amount: 10.8, entry: 6.0 },
  //   { win: "2.5x", amount: 25.0, entry: 10.0 },
];

export default function CBMenu() {
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

  useEffect(() => {
    CBSocket.on("connect", () => {
      console.log("✅ Socket connected:", CBSocket.id);
    });

    CBSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      CBSocket.off("connect");
      CBSocket.off("connect_error");
    };
  }, []);

  const GamePlayHandler = (id) => {
    // console.log("fsdfdsfd")
    if (!CBSocket?.connected) {
      toast.warn("⚠️ Server not connected yet, try again later");
      CBSocket.connect();
      return;
    }
    const p = tableData?.find((item) => item?.id === id);
    const payload = { userId, ...p };
    // console.log("fsdfdsfasdd",payload)
    CBSocket.emit("cb_room", payload);
    CBSocket.on("cb_game_response", (data) => {
      sessionStorage.setItem("roomData_cb", JSON.stringify(data));
      navigate(`/callbreak/${toggleGameType}`);
    });
    CBSocket.on("cb_insufficient_balance", (data) => {
      toast.error(data?.message);
    });
  };

  return (
    <div className="min-h-screen bg-[#1d002e] text-white text-sm px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img
            src={callBreakimage}
            alt="Logo"
            className="h-20 w-24 object-fill"
          />
          {/* <FaQuestionCircle className="text-lg" /> */}
        </div>
        <div className="bg-green rounded-lg px-4 py-1 text-sm font-semibold flex items-center gap-2">
          <BsWallet2 />{" "}
          {myDetails ? Number(myDetails?.data?.wallet).toFixed(2) : 0.0}{" "}
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-center gap-4 mb-4">
        <button className="text-sm bg-[#561f84] font-bold text-white px-3 rounded-full">
          <GiTabletopPlayers size={34} /> 2
        </button>
        <div className="flex items-center">
          <GoDotFill className="text-greenAviator" /> {onlineUsers} Online
        </div>
      </div>

      {/* Table Cards */}
      <div className="space-y-4">
        {tableData?.map((table, i) => {
          // console.log("dfsdfds",table)
          return (
            <div key={i} className="bg-[#4a0f74]  rounded-lg ">
              <div className="w-full p-4 grid grid-cols-3">
                <div className="text-lg  font-bold col-span-1">
                  {table.win_amount.toFixed(2)}
                </div>
                <div className="text-yellow col-span-1 text-start text-sm font-semibold mb-1">
                  ⚡Win {table?.win_multiplier}
                </div>
                <button
                  onClick={() => GamePlayHandler(table?.id)}
                  className="col-span-1 bg-green py-1 rounded-lg font-semibold text-white text-xsm"
                >
                  {table?.entry_fees.toFixed(2)}
                </button>
              </div>
              <div className="mt-2 text-[10px] py-1.5 bg-opacity-50 rounded-b-lg bg-black justify-center flex items-center gap-2">
                <GiTabletopPlayers className="text-blue-700" size={24} /> 2P{" "}
                <span>•</span> 🧧 {table?.noOfRounds} Rounds
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
