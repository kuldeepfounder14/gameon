// PointsRummySocket.js (file name should match import)
import { io } from "socket.io-client";

const PointsRummySocket = io("https://blockchain.gameon.deals/", {
  transports: ["websocket"],
  reconnection: true,
});

export default PointsRummySocket;
