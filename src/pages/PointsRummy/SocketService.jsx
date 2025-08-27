// utils/socketService.js

import { useNavigate } from "react-router-dom";
import PointsRummySocket from "./PointsRummySocket";

export const emitGameEvent = (type, payload = {}) => {
  console.log("type",{ type, ...payload })
    // PointsRummySocket.emit("pointsRummy", { type, ...payload });
    const navigate=useNavigate()
    return navigate("/")
};

