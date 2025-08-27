// hooks/useGameSocket.js
import { useEffect } from "react";
import PointsRummySocket from "./PointsRummySocket";

const useGameSocket = (handlers = {}) => {
  useEffect(() => {
    const handleGameResponse = (wrapper) => {
      console.log("✅ [useGameSocket] game_response:", wrapper);

      const actualPayload = wrapper ?? wrapper;
      
      if (handlers["game_response"]) {
        handlers["game_response"](actualPayload);
      }
    };

    PointsRummySocket.on("game_response", handleGameResponse);

    return () => {
      PointsRummySocket.off("game_response", handleGameResponse);
    };
  }, [handlers]);
};

export default useGameSocket;
