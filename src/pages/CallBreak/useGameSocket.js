// hooks/useGameSocket.js
import { useEffect } from "react";
import CBSocket from "./CBSocket";

const useGameSocket = (handlers = {}) => {
  useEffect(() => {
    const handleGameResponse = (wrapper) => {
      // console.log("✅ [useGameSocket] game_response:", wrapper);

      const actualPayload = wrapper ?? wrapper;
      if (handlers["cb_game_response"]) {
        handlers["cb_game_response"](actualPayload);
      }
    };

    CBSocket.on("cb_game_response", handleGameResponse);

    return () => {
      CBSocket.off("cb_game_response", handleGameResponse);
    };
  }, [handlers]);
};

export default useGameSocket;
