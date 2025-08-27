// hooks/useGameSocket.js
import { useEffect } from "react";
import PoolRummySocket from "./PoolRummySocket";

const useGameSocket = (handlers = {}) => {
  useEffect(() => {
    const handleGameResponse = (wrapper) => {
      // console.log("✅ [useGameSocket] game_response:", wrapper);

      const actualPayload = wrapper ?? wrapper;
      if (handlers["pool_game_response"]) {
        handlers["pool_game_response"](actualPayload);
      }
    };

    PoolRummySocket.on("pool_game_response", handleGameResponse);

    return () => {
      PoolRummySocket.off("pool_game_response", handleGameResponse);
    };
  }, [handlers]);
};

export default useGameSocket;
