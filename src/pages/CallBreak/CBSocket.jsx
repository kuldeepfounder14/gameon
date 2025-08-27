// PointsRummySocket.js (file name should match import)
import { io } from "socket.io-client";

const CBSocket = io("https://blockchain.gameon.deals/", {
  transports: ["websocket"],
  reconnection: true,
});

export default CBSocket;
