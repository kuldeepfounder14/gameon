// Lucky12Home.jsx
import React, { useEffect } from "react";
import PointsRummySocket from "./PointsRummySocket"; // adjust if path differs

function Lucky12Home() {
  useEffect(() => {
    // Listen for the game response
    PointsRummySocket.on("game_response", (data) => {
      console.log("✅ game_response received:", data);
    });

    // Clean up on component unmount
    return () => {
      PointsRummySocket.off("game_response");
    };
  }, []);

  // Emit "room" event on button click
  const handleJoinRoom = () => {
    PointsRummySocket.emit("room", {
      userId: "1",
      gameId: "1",
    });
    console.log("🟡 room event emitted");
  };
  const handleJoinRoo2m = () => {
    PointsRummySocket.emit("room", {
      userId: "2",
      gameId: "1",
    });
    console.log("🟡 room event emitted");
  };

  return (
    <div>
      <h1>Game Page</h1>
      <button onClick={handleJoinRoom}>Join Room</button>
      <button onClick={handleJoinRoo2m}>Join Room2</button>
    </div>
  );
}

export default Lucky12Home;
