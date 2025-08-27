// socket.js
import { io } from "socket.io-client";

const socket = io("https://blockchain.gameon.deals"); // Change this to your backend URL

export default socket;
