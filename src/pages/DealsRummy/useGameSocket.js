// hooks/useGameSocket.js
import { useEffect } from "react";
import DealsRummySocket from "./DealsRummySocket";

const useGameSocket = (handlers = {}) => {
  useEffect(() => {
    const handleGameResponse = (wrapper) => {
      // console.log("✅ [useGameSocket] game_response:", wrapper);

      const actualPayload = wrapper ?? wrapper;
      if (handlers["deals_game_response"]) {
        handlers["deals_game_response"](actualPayload);
      }
    };

    DealsRummySocket.on("deals_game_response", handleGameResponse);

    return () => {
      DealsRummySocket.off("deals_game_response", handleGameResponse);
    };
  }, [handlers]);
};

export default useGameSocket;
