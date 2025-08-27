// DealsRummySocket.js (file name should match import)
import { io } from "socket.io-client";

const DealsRummySocket = io("https://blockchain.gameon.deals/", {
  transports: ["websocket"],
  reconnection: true,
});

export default DealsRummySocket;
