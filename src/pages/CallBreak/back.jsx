import CBPlayer from "../models/cbPlayerModel.js";
import { broadcastToRoom } from "../cbSocketIOBroadcast.js";
import cards from "./cards.js"
const cbPlayerHands = new Map(); // { roomId: { userId: [cards] } }
import CBGameController from "../controllers/cbGameController.js";
import { manageTurn } from "../controllers/cbGameController.js";
 const getFormattedPlayersWithHands = (players, roomId) => {
  const roomHands = cbPlayerHands.get(roomId) || {};
  return players.map((player) => {
    const hand = roomHands[player.user_id] || [];
    return {
      ...player,
      game_card: {
        cards: hand.map((card) => ({ id: card.id })),
      },
    };
  });
};
const cbDiscardMap = new Map();
const cbBidCreated = new Map();
// --- 2. Utility: Compare Cards ---
function getCardStrength(card) {
  const order = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  return order.indexOf(card.rank);
}
function determineBidWinner(discarded, trumpSuit) {
  const trumpDiscards = discarded.filter(d => d.card.suit === trumpSuit);
  if (trumpDiscards.length > 0) {
    // Highest trump card
    return trumpDiscards.reduce((a, b) => getCardStrength(a.card) > getCardStrength(b.card) ? a : b);
  }
  // Same suit comparison
  const leadSuit = discarded[0].card.suit;
  const sameSuit = discarded.filter(d => d.card.suit === leadSuit);
  return sameSuit.reduce((a, b) => getCardStrength(a.card) > getCardStrength(b.card) ? a : b);
}

// --- 3. Main Discard Handler ---
async function handlePlayerDiscard(io, roomId, userId, card, trumpSuit="S") {
 const fullCard = cards.find(c => c.id === card.id);
  if (!fullCard) {
    console.error("❌ Invalid card ID received:", card.id);
    return;
  }
  card = fullCard; 
  console.log("✅ Full card after resolving:", card)
  if (!cbDiscardMap.has(roomId)) cbDiscardMap.set(roomId, {});
 // c if (!cbBidCreated[roomId]) cbBidCreated[roomId] = {};
	  if (!cbBidCreated.has(roomId)) cbBidCreated.set(roomId, {});
  const discards = cbDiscardMap.get(roomId) || {};
  discards[userId] = card;
	console.log("discards[userId]discards[userId]",discards)
  cbDiscardMap.set(roomId, discards);
        const players = await CBPlayer.getPlayersInRoom(roomId);
  const discardedUserIds = Object.keys(discards);
  const allDiscarded = players.length === discardedUserIds.length;
  const currentPlayer = players.find(p => p.user_id === userId);
  // Calculate suit rules for next player
  const leadSuit = Object.values(discards)[0]?.suit;
const roomHands = cbPlayerHands.get(roomId) || {};
	//	console.log("roomHandsroomHands",roomHands)
const playerHand = roomHands[userId] || [];
	if (!playerHand || !Array.isArray(playerHand)) {
  console.error("Invalid player hand for user:", userId);
  return;
}
	// ✅ Remove the discarded card from the player's hand
const updatedHand = playerHand.filter((c) => c.id !== card.id);
roomHands[userId] = updatedHand;
cbPlayerHands.set(roomId, roomHands);
	// Identify next player index
const currentIndex = players.findIndex(p => p.user_id === userId);
const nextIndex = (currentIndex + 1) % players.length;

// Update hand + is_turn for all players
for (let i = 0; i < players.length; i++) {
  const player = players[i];
  const hand = roomHands[player.user_id] || [];
  player.game_card = { cards: hand.map(card => ({ id: card.id })) };
 // player.is_turn = (i === nextIndex) ? 1 : 0;  // ✅ TURN SWITCH
}
	console.log("playerHandplayerHand",playerHand)
		console.log("leadSuitleadSuit",leadSuit)
 let allowedCardIds = [];

if (!leadSuit) {
  allowedCardIds = playerHand.map(c => c.id);
} else {
  const sameSuitCards = playerHand.filter(c => c.suit === leadSuit);
  if (sameSuitCards.length > 0) {
    allowedCardIds = sameSuitCards.map(c => c.id);
  } else {
    const trumpCards = playerHand.filter(c => c.suit === trumpSuit);
    if (trumpCards.length > 0) {
      allowedCardIds = trumpCards.map(c => c.id);
    } else {
      allowedCardIds = playerHand.map(c => c.id);
    }
  }
}
	//	console.log("canPlayTrumpcanPlayTrump",canPlayTrump)
  broadcastToRoom(
  io,
  roomId,
  'cb_discard_update',
  11,
  2,
  { status: 4, countdown: 0 },
  {
    finalPlayers:getFormattedPlayersWithHands(players, roomId), // ✅ final list to emit
    results: {
      discarded: discards,
     allowedCardIds,
		 createdBid: cbBidCreated.get(roomId) || {},
    }
  }
);
if (!allDiscarded) {
  const formattedPlayers = getFormattedPlayersWithHands(players, roomId);
  const currentIndex = formattedPlayers.findIndex(p => p.is_turn === 1);

  if (currentIndex === -1) {
    console.error("❌ No active player (is_turn === 1) found in formattedPlayers");
    return;
  }

  const nextIndex = (currentIndex + 1) % players.length;
  const nextPlayer = players[nextIndex];
  const turnTimerRef = CBGameController.turnTimers[roomId] || (CBGameController.turnTimers[roomId] = {});
  await manageTurn(
    nextPlayer,
    roomId,
    io,
    players,
    nextIndex,
    players,
    turnTimerRef
  );
}

  if (allDiscarded) {
  const round = Object.entries(discards).map(([uid, card]) => ({ userId: parseInt(uid), card }));
  const winner = determineBidWinner(round, trumpSuit);
  // Track bidCreated count
  const bidMap = cbBidCreated.get(roomId) || {};
  bidMap[winner.userId] = (bidMap[winner.userId] || 0) + 1;
  cbBidCreated.set(roomId, bidMap);
  // Mark other players is_win = 0
  players.forEach(p => {
    p.is_win = p.user_id === winner.userId ? 1 : 0;
    p.is_turn = p.user_id !== winner.userId ? 1 : 0;
  });
  cbDiscardMap.set(roomId, {});
   const turnTimerRef = CBGameController.turnTimers[roomId];
  setTimeout(async () => {
    const freshPlayers = await CBPlayer.getPlayersInRoom(roomId); // ✅ Get updated list from DB
    const winnerIndex = freshPlayers.findIndex(p => p.user_id === winner.userId);
	      const loserIndex = freshPlayers.findIndex(p => p.user_id !== winner.userId);
//console.log("freshPlayersfreshPlayers",freshPlayers[loserIndex], freshPlayers[winnerIndex],freshPlayers)
    // Reset turns here to be safe
    freshPlayers.forEach((p, i) => {
      p.is_turn = i === winnerIndex ? 1 : 0;
    });

    await manageTurn(
      freshPlayers[winnerIndex],
      roomId,
      io,
      freshPlayers,
      winnerIndex,
      freshPlayers,
      turnTimerRef
    );
  }, 300);
}
}

// --- 4. Level Completion Handler ---
async function finalizeLevel(io, roomId, level = 1) {
  const players = await CBPlayer.getPlayersInRoom(roomId);
  const bidMap = cbBidCreated.get(roomId) || {};
  const bids = CBGameController.bidStates[roomId];
  const results = [];

  for (const player of players) {
    const bid = bids?.[player.user_id] ?? 4;
    const achieved = bidMap[player.user_id] || 0;
    let securedPoints = 0;
    if (achieved < bid) securedPoints = -bid;
    else if (achieved === bid) securedPoints = 0;
    else securedPoints = bid + (achieved - bid);

    results.push({
      user_id: player.user_id,
      selectedBid: bid,
      bidCreated: achieved,
      securedPoints
    });
  }
  cbBidCreated.delete(roomId);
  cbDiscardMap.delete(roomId);
  broadcastToRoom(
    io,
    roomId,
    level === 1 ? 'levelOneResult' : 'finalLevelResult',
    200,
    0,
    0,
    { results }
  );
}
export {
  handlePlayerDiscard,
  cbDiscardMap,
  cbBidCreated,
  finalizeLevel ,
  cbPlayerHands 
};







/////////////////////

//   let allowedCardIds = [];
//     if (!firstCard) {
//         allowedCardIds = currentPlayerHand.map(c => c.id);
//     }else {
// const sameSuitCards = firstCard
//   ? currentPlayerHand.filter(c => c.suit === firstCard.suit)
//   : [];
//   if (sameSuitCards.length > 0) {
//     allowedCardIds = sameSuitCards.map(c => c.id);
//   } else {
//     const trumpCards = currentPlayerHand.filter(c => c.suit === "S");
//     if (trumpCards.length > 0) {
//       allowedCardIds = trumpCards.map(c => c.id);
//     } else {
//       allowedCardIds = currentPlayerHand.map(c => c.id);
//     }
//   }
// }



  // ✅ Update all players' hands and turn status
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const hand = roomHands[player.user_id] || [];
    player.game_card = { cards: hand.map(card => ({ id: card.id })) };
    
    // ✅ IMMEDIATELY set turn status
    if (!allDiscarded && nextPlayer) {
		console.log(" turn at discard event for one",allDiscarded , nextPlayer)
      player.is_turn = player.user_id === nextPlayer.user_id ? 1 : 0;
				console.log(" player.is_turn at discard event for one",player.is_turn,allDiscarded , nextPlayer)
    } else {
				console.log(" turn at discard event for two two",allDiscarded , nextPlayer)
      player.is_turn = 0; // Reset all turns if round complete
						console.log(" player.is_turn at discard event for one",player.is_turn,allDiscarded , nextPlayer)
    }
  }






  new forntedn 
  // Modified handlePlayerDiscard function in cbCallBreakGameService.js
async function handlePlayerDiscard(io, roomId, userId, card, trumpSuit = "S") {
  const fullCard = cards.find(c => c.id === card.id);
  if (!fullCard) {
    console.error("❌ Invalid card ID received:", card.id);
    return;
  }
  card = fullCard;

  if (!cbDiscardMap.has(roomId)) cbDiscardMap.set(roomId, {});
  if (!cbBidCreated.has(roomId)) cbBidCreated.set(roomId, {});

  const discards = cbDiscardMap.get(roomId) || {};
  discards[userId] = card;
  cbDiscardMap.set(roomId, discards);

  const players = await CBPlayer.getPlayersInRoom(roomId);
  const discardedUserIds = Object.keys(discards);
  const allDiscarded = players.length === discardedUserIds.length;

  const roomHands = cbPlayerHands.get(roomId) || {};
  const playerHand = roomHands[userId] || [];

  if (!playerHand || !Array.isArray(playerHand)) {
    console.error("Invalid player hand for user:", userId);
    return;
  }

  const updatedHand = playerHand.filter((c) => c.id !== card.id);
  roomHands[userId] = updatedHand;
  cbPlayerHands.set(roomId, roomHands);

  let allowedCardIds = [];
  let nextPlayer = null;
  let nextPlayerUserId = null;
  let nextIndex = 0;
  let bidWinnerUserId = null;

  if (!allDiscarded) {
    const currentIndex = players.findIndex(p => p.user_id === userId);
    nextIndex = (currentIndex + 1) % players.length;
    nextPlayer = players[nextIndex];
    nextPlayerUserId = nextPlayer.user_id;

    players.forEach((p, index) => {
      p.is_turn = index === nextIndex ? 1 : 0;
      p.is_win = 0;
    });

    const nextPlayerHand = roomHands[nextPlayerUserId] || [];
    const leadSuit = Object.values(discards)[0]?.suit;

    if (!leadSuit) {
      allowedCardIds = nextPlayerHand.map(c => c.id);
    } else {
      const sameSuitCards = nextPlayerHand.filter(c => c.suit === leadSuit);
      if (sameSuitCards.length > 0) {
        allowedCardIds = sameSuitCards.map(c => c.id);
      } else {
        const trumpCards = nextPlayerHand.filter(c => c.suit === trumpSuit);
        allowedCardIds = trumpCards.length > 0
          ? trumpCards.map(c => c.id)
          : nextPlayerHand.map(c => c.id);
      }
    }
    bidWinnerUserId = null;
  } else {
    const round = Object.entries(discards).map(([uid, card]) => ({
      userId: parseInt(uid),
      card
    }));
    const winner = determineBidWinner(round, trumpSuit);
    const next = players.find(p => p.user_id === winner.userId);
    nextPlayerUserId = next.user_id;

    const bidMap = cbBidCreated.get(roomId) || {};
    bidMap[winner.userId] = (bidMap[winner.userId] || 0) + 1;
    cbBidCreated.set(roomId, bidMap);

    nextIndex = players.findIndex(p => p.user_id === winner.userId);
    nextPlayer = players[nextIndex];

    players.forEach((p, index) => {
      p.is_win = index === nextIndex ? 1 : 0;
      p.is_turn = index === nextIndex ? 1 : 0;
    });

    const winnerHand = roomHands[winner.userId] || [];
    allowedCardIds = winnerHand.map(c => c.id);
    bidWinnerUserId = winner.userId;
  }

  // ✅ Moved outside both if-else blocks
  const formattedPlayers = players.map(player => {
    const hand = roomHands[player.user_id] || [];
    return {
      ...player,
      game_card: { cards: hand.map(card => ({ id: card.id })) }
    };
  });

  // ✅ Check if all players have finished their 13 cards
  const allPlayersCardsFinished = players.every(player => {
    const hand = roomHands[player.user_id] || [];
    return hand.length === 0;
  });

  // ✅ If all cards are finished, start level completion process
  if (allPlayersCardsFinished) {
    console.log("🎯 All players have finished their 13 cards, starting level completion...");
    
    // Emit cb_discard_update first
    broadcastToRoom(
      io,
      roomId,
      'cb_discard_update',
      11,
      2,
      userId,
      { status: 4, countdown: 0 },
      {
        players: formattedPlayers,
        results: {
          discarded: cbDiscardMap.get(roomId) || {},
          allowedCardIds,
          createdBid: cbBidCreated.get(roomId) || {},
          bidWinner: bidWinnerUserId,
        }
      }
    );

    // Clear any existing timers
    const turnTimerRef = CBGameController.turnTimers[roomId] || {};
    if (turnTimerRef.timer) clearTimeout(turnTimerRef.timer);
    if (turnTimerRef.interval) clearInterval(turnTimerRef.interval);

    // Start level completion timer (5 seconds)
    await startLevelCompletionTimer(io, roomId, players);
    return;
  }

  // ✅ Regular discard update (not level completion)
  broadcastToRoom(
    io,
    roomId,
    'cb_discard_update',
    11,
    2,
    userId,
    { status: 4, countdown: 0 },
    {
      players: formattedPlayers,
      results: {
        discarded: cbDiscardMap.get(roomId) || {},
        allowedCardIds,
        createdBid: cbBidCreated.get(roomId) || {},
        bidWinner: bidWinnerUserId,
      }
    }
  );

  // ✅ Manage turn or next round
  if (!allDiscarded) {
    const turnTimerRef = CBGameController.turnTimers[roomId] || {};
    if (turnTimerRef.timer) clearTimeout(turnTimerRef.timer);
    if (turnTimerRef.interval) clearInterval(turnTimerRef.interval);

    CBGameController.turnTimers[roomId] = { timer: null, interval: null };

    await manageTurn(
      nextPlayer,
      roomId,
      io,
      formattedPlayers,
      nextIndex,
      formattedPlayers,
      CBGameController.turnTimers[roomId],
      true,
      true
    );
  } else {
    const turnTimerRef = CBGameController.turnTimers[roomId] || { timer: null, interval: null };
    if (turnTimerRef.timer) clearTimeout(turnTimerRef.timer);
    if (turnTimerRef.interval) clearInterval(turnTimerRef.interval);

    const freshPlayers = await CBPlayer.getPlayersInRoom(roomId);
    const winnerIndex = freshPlayers.findIndex(p => p.user_id === nextPlayerUserId);
    const winner = freshPlayers[winnerIndex];

    freshPlayers.forEach((player, index) => {
      player.is_turn = index === winnerIndex ? 1 : 0;
      player.is_win = index === winnerIndex ? 1 : 0;
    });

    const freshFormattedPlayers = freshPlayers.map(player => {
      const hand = roomHands[player.user_id] || [];
      return {
        ...player,
        game_card: { cards: hand.map(card => ({ id: card.id })) }
      };
    });

    CBGameController.turnTimers[roomId] = { timer: null, interval: null };
    let countdown = 2;
    const interval = setInterval(() => {
      broadcastToRoom(
        io,
        roomId,
        "cb_loading_timer",
        15,
        2,
        0,
        {
          status: "bidCreationAnimation",
          countdown
        }
      );

      if (--countdown < 0) {
        cbDiscardMap.set(roomId, {});
        clearInterval(interval);
        manageTurn(
          nextPlayer,
          roomId,
          io,
          freshFormattedPlayers,
          winnerIndex,
          freshFormattedPlayers,
          CBGameController.turnTimers[roomId],
          false,
          false
        );
      }
    }, 1000);
  }
}

// ✅ New function to handle level completion timer
async function startLevelCompletionTimer(io, roomId, players) {
  let countdown = 5;
  
  // Calculate level results
  const bidMap = cbBidCreated.get(roomId) || {};
  const bids = CBGameController.bidStates[roomId] || {};
  const results = [];

  for (const player of players) {
    const selectedBid = bids[player.user_id] ?? 4;
    const bidCreated = bidMap[player.user_id] || 0;
    let securedPoints = 0;

    if (bidCreated < selectedBid) {
      securedPoints = -selectedBid;
    } else if (bidCreated === selectedBid) {
      securedPoints = 0;
    } else {
      securedPoints = selectedBid + (bidCreated - selectedBid);
    }

    results.push({
      user_id: player.user_id,
      selectedBid,
      bidCreated,
      securedPoints
    });
  }

  // Determine winner and loser
  const sortedResults = [...results].sort((a, b) => b.securedPoints - a.securedPoints);
  const winner = players.find(p => p.user_id === sortedResults[0].user_id);
  const loser = players.find(p => p.user_id === sortedResults[sortedResults.length - 1].user_id);

  const totalBetValue = players.reduce((total, player) => total + player.bet_value, 0);

  // Start countdown timer
  const interval = setInterval(() => {
    broadcastToRoom(
      io,
      roomId,
      "levelOneResult",
      12,
      2,
      totalBetValue,
      { 
        status: 3, 
        countdown,
        winnerId: winner?.user_id,
        loserId: loser?.user_id,
        message: `Level completed! ${winner?.user_name || 'Player'} wins this level.`,
        results
      },
      {
        players: getFormattedPlayersWithHands(players, roomId),
        levelResults: results
      }
    );

    if (--countdown < 0) {
      clearInterval(interval);
      // Start level two
      startLevelTwo(io, roomId, players, winner?.user_id);
    }
  }, 1000);
}

// ✅ New function to start level two
async function startLevelTwo(io, roomId, players, tossWinnerUserId) {
  console.log("🎮 Starting Level Two...");
  
  // Clear previous level data
  cbBidCreated.delete(roomId);
  cbDiscardMap.delete(roomId);
  
  // Reset bid states for level two
  CBGameController.bidStates[roomId] = {};
  CBGameController.bidFinalized[roomId] = false;

  const totalBetValue = players.reduce((total, player) => total + player.bet_value, 0);

  // 1. Create and shuffle deck
  let finalDeck = [...cards];
  if (players.length === 4) {
    finalDeck = [...cards, ...cards]; // 104 cards for 4 players
  }

  // Fisher-Yates shuffle
  for (let i = finalDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalDeck[i], finalDeck[j]] = [finalDeck[j], finalDeck[i]];
  }

  // 2. Distribute 13 cards to each player
  const roomHands = {};
  for (const player of players) {
    if (finalDeck.length >= 13) {
      const playerCards = finalDeck.splice(0, 13);
      roomHands[player.user_id] = playerCards;
      
      broadcastToRoom(
        io,
        roomId,
        "cb_game_card_distribution",
        7,
        2,
        totalBetValue,
        { status: 2, countdown: 0 },
        {
          players: [
            {
              id: player.id,
              game_card: { cards: playerCards },
            },
          ],
        }
      );
    }
  }
  
  cbPlayerHands.set(roomId, roomHands);

  // 3. Start bid phase timer (same as level one)
  await new Promise((resolve) => {
    let countdown = 5;
    const interval = setInterval(() => {
      broadcastToRoom(io, roomId, "cb_loading_timer", 8, 2, totalBetValue, {
        status: 3,
        countdown,
      });
      if (--countdown < 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  // 4. Start bidding phase
  let countdown = 10;
  const bidInterval = setInterval(async () => {
    broadcastToRoom(io, roomId, "cb_loading_timer", 8, 2, totalBetValue, {
      status: "bid",
      countdown,
    });

    const currentPlayers = await CBPlayer.getPlayersInRoom(roomId);
    const bids = CBGameController.bidStates[roomId] || {};
    const playerIds = currentPlayers.map((p) => p.user_id);

    const allBidded = playerIds.every((id) => bids[id] !== undefined);

    if (allBidded) {
      clearInterval(bidInterval);
      if (!CBGameController.bidFinalized[roomId]) {
        CBGameController.bidFinalized[roomId] = true;
        await emitSelectedBids(io, roomId, tossWinnerUserId, CBGameController);
      }
      return;
    }

    if (--countdown < 0) {
      clearInterval(bidInterval);

      if (!CBGameController.bidStates[roomId]) {
        console.warn("Bid state already cleaned, skipping late update.");
        return;
      }

      // Set default bids for players who didn't bid
      for (const id of playerIds) {
        if (!(id in CBGameController.bidStates[roomId])) {
          CBGameController.bidStates[roomId][id] = 4;
        }
      }

      if (!CBGameController.bidFinalized[roomId]) {
        CBGameController.bidFinalized[roomId] = true;
        await emitSelectedBids(io, roomId, tossWinnerUserId, CBGameController);
      }
    }
  }, 1000);
}

// ✅ Modified finalizeLevel function to handle both level one and final level
async function finalizeLevel(io, roomId, level = 1) {
  const players = await CBPlayer.getPlayersInRoom(roomId);
  const bidMap = cbBidCreated.get(roomId) || {};
  const bids = CBGameController.bidStates[roomId] || {};
  const results = [];

  for (const player of players) {
    const selectedBid = bids[player.user_id] ?? 4;
    const bidCreated = bidMap[player.user_id] || 0;
    let securedPoints = 0;

    if (bidCreated < selectedBid) {
      securedPoints = -selectedBid;
    } else if (bidCreated === selectedBid) {
      securedPoints = 0;
    } else {
      securedPoints = selectedBid + (bidCreated - selectedBid);
    }

    results.push({
      user_id: player.user_id,
      selectedBid,
      bidCreated,
      securedPoints
    });
  }

  // Determine winner and loser
  const sortedResults = [...results].sort((a, b) => b.securedPoints - a.securedPoints);
  const winner = players.find(p => p.user_id === sortedResults[0].user_id);
  const loser = players.find(p => p.user_id === sortedResults[sortedResults.length - 1].user_id);

  const totalBetValue = players.reduce((total, player) => total + player.bet_value, 0);

  // Clean up
  cbBidCreated.delete(roomId);
  cbDiscardMap.delete(roomId);

  broadcastToRoom(
    io,
    roomId,
    level === 1 ? 'levelOneResult' : 'finalLevelResult',
    200,
    0,
    totalBetValue,
    { 
      status: 3,
      countdown: 0,
      winnerId: winner?.user_id,
      loserId: loser?.user_id,
      message: level === 1 
        ? `Level One completed! ${winner?.user_name || 'Player'} wins this level.`
        : `Game completed! ${winner?.user_name || 'Player'} wins the game!`,
      results 
    },
    {
      players: getFormattedPlayersWithHands(players, roomId),
      levelResults: results
    }
  );
}

export {
  handlePlayerDiscard,
  cbDiscardMap,
  cbBidCreated,
  finalizeLevel,
  cbPlayerHands,
  getAllowedCardIds,
  startLevelCompletionTimer, // New export
  startLevelTwo // New export
};





parsedSelectedBidOfAllPlayers (2) [{…}, {…}]0: {userId: 763, bid: 4}1: {userId: 740, bid: 3}length: 2[[Prototype]]: Array(0)
WinnerLoserModal.jsx?t=1755155602136:50 levelOneGameResult {discarded: {…}, allowedCardIds: Array(0), createdBid: {…}, bidWinner: 740, secondRound: true}allowedCardIds: []bidWinner: 740createdBid: {740: 7, 763: 6}740: 7763: 6[[Prototype]]: Objectdiscarded: {740: {…}, 763: {…}}secondRound: true[[Prototype]]: Object
WinnerLoserModal.jsx?t=1755155602136:61 yourSelectedBidyourSelectedBid {userId: 740, bid: 3} {userId: 763, bid: 4}
WinnerLoserModal.jsx?t=1755155602136:49 parsedSelectedBidOfAllPlayers (2) [{…}, {…}]0: {userId: 763, bid: 4}1: {userId: 740, bid: 3}length: 2[[Prototype]]: Array(0)
WinnerLoserModal.jsx?t=1755155602136:50 levelOneGameResult {discarded: {…}, allowedCardIds: Array(0), createdBid: {…}, bidWinner: 740, secondRound: true}
WinnerLoserModal.jsx?t=1755155602136:61 yourSelectedBidyourSelectedBid {userId: 740, bid: 3} {userId: 763, bid: 4}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
GameTable.jsx:214 bidCardsAnimation false {740: {…}}
client:883 [vite] hot updated: /src/pages/CallBreak/WinnerLoserModal.jsx
client:883 [vite] hot updated: /src/index.css
WinnerLoserModal.jsx:87 dattatata {yourName: '', opponentName: '', yourCreatedBid: 0, yourSelectedBid: 0, opponentCreatedBid: 0, …}opponentCreatedBid: 0opponentName: ""opponentSelectedBid: 0yourCreatedBid: 0yourName: ""yourSelectedBid: 0[[Prototype]]: Object
WinnerLoserModal.jsx:87 dattatata {yourName: '', opponentName: '', yourCreatedBid: 0, yourSelectedBid: 0, opponentCreatedBid: 0, …}
WinnerLoserModal.jsx:42 parsedSelectedBidOfAllPlayers (2) [{…}, {…}]
WinnerLoserModal.jsx:43 levelOneGameResult {discarded: {…}, allowedCardIds: Array(0), createdBid: {…}, bidWinner: 740, secondRound: true}
WinnerLoserModal.jsx:55 yourSelectedBidyourSelectedBid {userId: 740, bid: 3} {userId: 763, bid: 4}

// WinnerLoserModal.jsx
import Card from "./card";
import cardBack from "../../assets/rummy/cards/diamond/back.png";
import { useEffect, useState } from "react";

const WinnerLoserModal = ({
  visible,
  onClose,
  levelOneGameResult,
  fullDeck,
  message,
}) => {
  const userId = localStorage.getItem("userId");

  if (!visible) return null;
  const [data, setData] = useState({
    yourName: "",
    opponentName: "",
    yourCreatedBid: 0,
    yourSelectedBid: 0,
    opponentCreatedBid: 0,
    opponentSelectedBid: 0,
  });
  // const getMappedCards = (hand = []) =>
  //   hand
  //     .map((cardId) => fullDeck?.find((c) => c.id === Number(cardId?.id)))
  //     .filter(Boolean);

  useEffect(() => {
    const selectedBidOfAllPlayers = sessionStorage.getItem(
      "selectedLevelOneBidOfAllPlayers"
    );
    let parsedSelectedBidOfAllPlayers = [];
    if (typeof selectedBidOfAllPlayers === "string") {
      parsedSelectedBidOfAllPlayers = JSON.parse(selectedBidOfAllPlayers);
    } else if (
      typeof selectedBidOfAllPlayers === "object" &&
      selectedBidOfAllPlayers !== null
    ) {
      parsedSelectedBidOfAllPlayers = selectedBidOfAllPlayers; // already object
    }
    console.log("parsedSelectedBidOfAllPlayers", parsedSelectedBidOfAllPlayers);
    console.log("levelOneGameResult", levelOneGameResult);
    let yourSelectedBid;
    let opponentSelectedBid;
    if (parsedSelectedBidOfAllPlayers) {
      yourSelectedBid = parsedSelectedBidOfAllPlayers?.find(
        (b) => Number(b.userId) === Number(userId)
      );
      opponentSelectedBid = parsedSelectedBidOfAllPlayers?.find(
        (b) => Number(b.userId) !== Number(userId)
      );
    }

    console.log(
      "yourSelectedBidyourSelectedBid",
      yourSelectedBid,
      opponentSelectedBid
    );
    //
    const stored = sessionStorage.getItem("roomData_cb");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.keys(parsed).forEach((key) => {
        if (parsed[key] === "null") parsed[key] = null;
      });
      const players = parsed?.response?.players || [];
      const youIndex = players.findIndex((p) => p.user_id === Number(userId));
      const opponentIndex = players.findIndex(
        (p) => p.user_id !== Number(userId)
      );
      console.log("youIndex", youIndex);
      console.log("opponentIndex", opponentIndex);
      if (youIndex === -1 && opponentIndex === -1) return;
      const createdBidObj = levelOneGameResult?.createdBid || {};

      setData({
        yourName: "kuldeep",
        opponentName: "tum ho villian",
        yourCreatedBid: createdBidObj[userId] ?? 0,
        yourSelectedBid: yourSelectedBid ?? 0,
        opponentCreatedBid: createdBidObj[opponentIndex?.user_id] ?? 0,
        opponentSelectedBid: opponentSelectedBid ?? 0,
      });
    }
  }, []);
  console.log("dattatata",data)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2a143d] border-[2px] border-gold p-4 rounded-lg w-[90%] max-w-2xl text-white relative">
        {/* {resultType !== "game_result" && (
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-xl hover:text-gold font-bold text-red-500"
          >
            ×
          </button>
        )} */}
        <h2 className="text-lg font-bold mb-4 text-center">Round One Result</h2>
        <table>
          <thead>
            <th>S.no.</th>
            <th>User</th>
            <th>Selected bid</th>
            <th>Round Score</th>
            <th>Total Score</th>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{data && data?.yourName}</td>
              <td>{data && data?.yourSelectedBid} </td>
              <td>{data && data?.yourCreatedBid} </td>
              <td>{data && data?.yourCreatedBid} </td>
            </tr>
            <tr>
              <td>2</td>
              <td>{data && data?.opponentName}</td>
              <td> {data && data?.opponentSelectedBid} </td>
              <td> {data && data?.opponentCreatedBid} </td>
              <td>{data && data?.opponentCreatedBid} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinnerLoserModal;
