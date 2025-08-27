  // declare // home page
  const handleDeclare = () => {
    const hand = playersHands[yourPlayerKey] || [];
    // 🟢 Group into 4 groups of 3,3,3,4 manually or via drag UI
    const groups = [
      hand.slice(0, 3),
      hand.slice(3, 6),
      hand.slice(6, 9),
      hand.slice(9, 13),
    ];
    if (!canDeclareShow(groups, jokerCard)) {
      toast.error("❌ Invalid declaration. You need 1 pure & 1 more sequence.");
      return;
    }
    // ✅ Declare is valid, now check others’ points
    const points = {};
    for (let key of playerKeys) {
      const hand = playersHands[key];
      const g = [
        hand.slice(0, 3),
        hand.slice(3, 6),
        hand.slice(6, 9),
        hand.slice(9, 13),
      ];
      let total = 0;
      for (const group of g) {
        const type = getMeldType(group, jokerCard);
        if (type === "invalid") {
          total += group.reduce((sum, card) => sum + getCardPoints(card), 0);
        }
      }
      points[key] = total;
    }
    const sorted = Object.entries(points).sort((a, b) => a[1] - b[1]);
    const winner = sorted[0][0];
    toast.success(
      `${winner === yourPlayerKey ? "🎉 You" : winner} won the game!`
    );
  };


