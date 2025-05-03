/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const PlinkoGridMobile = ({ betId, setBetId, ballDropped, setballDropped, getNumbersList, betAndDropId, betAndDropStatus, setBetAndDrop }) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth); // Set initial width dynamically

  useEffect(() => {
    // console.log("Initial window.innerWidth", window.innerWidth);

    const handleResize = () => {
      // console.log("window.innerWidth", window.innerWidth);
      setIsMobile(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures this effect runs only once

  useEffect(() => {
    console.log("ballDropped", ballDropped);

  }, [ballDropped])
  useEffect(() => {
    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: isMobile > 400 ? 410 : isMobile > 420 ? 420 : isMobile > 389 ? 385 : 355,
        height: 415,
        wireframes: false,
        background: "transparent",
      },
    });

    // Set background to transparent
    render.canvas.style.background = "transparent";

    // **Plinko Pegs (grid layout)**
    const pegs = [];
    const rows = 14;
    const canvasWidth = isMobile > 400 ? 410 : isMobile > 420 ? 420 : isMobile > 389 ? 385 : 355;
    const baseX = canvasWidth / 2; // Centered in the canvas

    for (let row = 2; row < rows; row++) {
      for (let col = 0; col <= row; col++) {
        // Center the V-shape pyramid
        const f = isMobile > 400 ? 30 : isMobile > 389 ? 28 : 26.5
        const offsetX = (col - row / 2) * f;
        // console.log("xxxxxxx", offsetX)
        // const offsetX = (col - row / 2) * 30;
        const offsetY = row * 27;
        // console.log(`Peg at (${baseX + offsetX}, ${50 + offsetY})`);

        const peg = Matter.Bodies.circle(baseX + offsetX, 50 + offsetY, 5, {
          isStatic: true,
          render: { fillStyle: "white" },
        });

        pegs.push(peg);
      }
    }

    // Side walls (Hidden but still functional)
    const leftWall = Matter.Bodies.rectangle(0, 250, 10, 500, {
      isStatic: true,
      render: { visible: false }, // Hide wall but keep its restriction
    });
    // console.log(`Left Wall: (0, 250), Right Wall: (${canvasWidth}, 250)`);

    const rightWall = Matter.Bodies.rectangle(canvasWidth, 250, 10, 500, {
      isStatic: true,
      render: { visible: false }, // Hide wall but keep its restriction
    });

    // **Bottom Slots**
    // const slotWidth = 39;
    // const slots = [];
    // for (let i = 0; i < 10; i++) {
    //   const slot = Matter.Bodies.rectangle(i * slotWidth +30, 450, 5, 50, {
    //     isStatic: true,
    //     render: { fillStyle: "white" },
    //   });
    //   slots.push(slot);
    // }

    // **Add Everything to the World**
    // Matter.World.add(world, [leftWall, rightWall, ...pegs, ...slots]);
    Matter.World.add(world, [leftWall, rightWall, ...pegs]);
    // Matter.World.add(world, [...pegs]);

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  useEffect(() => {
    if (!betAndDropStatus || !engineRef.current) return;

    // **Drop the ball**
    const l = 170;
    const h = 200;
    const randomX = Math.random() * (h - l) + l;
    console.log("randomXrandomX"), randomX
    const ball = Matter.Bodies.circle(randomX, 40, 6, {
      restitution: 0.4,  // Lower bounce (was 0.8)
      friction: 0.1,     // Adds resistance to movement
      density: 0.02,     // Makes the ball heavier
      frictionAir: 0.02, // Slows it down in the air
      render: { fillStyle: "yellow" },
      label: "ball",
      // restitution: 0.8,
      // render: { fillStyle: "yellow" },
    });

    Matter.World.add(engineRef.current.world, ball);
    Matter.Events.on(engineRef.current, "afterUpdate", () => {
      // console.log("ball.positionball.position", ball.position)
      if (ball.position.y > 400) { // Adjust Y value based on your layout
        const ballX = ball.position.x;
        // console.log("ballllxxxx", ballX)
        // Find the closest slot index
        const slotWidth = isMobile > 400 ? 30 : isMobile > 389 ? 29 : 2; // Adjust if needed
        const dropIndex = (Math.round((ballX) / slotWidth)); // Adjust offset
        console.log("dropindex", dropIndex)
        if (dropIndex) {
          setBetId(dropIndex)
          // console.log(`Ball with ID ${ball.id} landed in slot:`, dropIndex);
          setballDropped(true)
        }

        // console.log("Ball dropped at index:", dropIndex);

        // Stop tracking to prevent multiple logs
        Matter.Events.off(engineRef.current, "afterUpdate");
      }
    });
    // setTimeout(() => {
    //   setBetAndDrop({ betStatus: false });
    // }, 3000);
  }, [betAndDropStatus, setBetAndDrop]);

  useEffect(() => {
    if (!engineRef.current) return;
    // console.log("entryentry")

    const engine = engineRef.current;

    const handleCollision = (event) => {
      // console.log("gvhgvbghvhvbhjvbh", event)
      event.pairs.forEach((collision) => {
        let slotIndex = -1;
        let ball;
        // console.log("collision", collision)
        if (collision.bodyA.label.startsWith("Circle Body")) {
          slotIndex = parseInt(collision.bodyA.label.replace("slot-", ""), 10);
          ball = collision.bodyB;
        } else if (collision.bodyB.label.startsWith("Circle Body")) {
          slotIndex = parseInt(collision.bodyB.label.replace("slot-", ""), 10);
          ball = collision.bodyA;
        }
        // console.log("slot index", slotIndex)

      });
    };

    Matter.Events.on(engine, "collisionActive", handleCollision);

    return () => {
      Matter.Events.off(engine, "collisionActive", handleCollision);
    };
  }, []);
  // setballDropped(false);
  // setTimeout(() => {
  //     setballDropped(true);
  // }, 200);

  // console.log("getNumbersList", betId)
  // console.log("getNumbersList", getNumbersList)
  return (
    <div className="flex flex-col items-center z-10">
      <div className="relative z-10 -mt-14 w-full xs1:w-[390px] xs:w-[400px] flex justify-center" ref={sceneRef}></div>
      <div className="flex justify-center w-full overflow-x-auto">
        {getNumbersList?.data1?.map((num, index) => {
          // const i = betId > 5 ? index + 1 : index
          return (
            <div
              key={index}
              className={`${(betId === index + 1 && ballDropped && num?.type === 1) ? "animate-zoomIn scale-110" : ""} 
            ${betAndDropId === 1 ? "border-black" : "border-green"} 
            border-[1px] relative bg-gradient-to-tr from-[#448B02] to-[#5FAF09] 
            text-white text-[10px] shadow-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] 
            rounded-sm h-5 w-[27px] xs1:w-[28px] xs:w-[30px] flex items-center 
            justify-center after:content-[''] after:absolute after:bottom-0 after:left-0 
            after:w-full after:h-[2px] after:bg-black/50`}
            >
              {num?.multiplier}
            </div>

          )
        })}
      </div>
      <div className="flex justify-center w-full overflow-x-auto">
        {getNumbersList?.data2?.map((num, index) => (
          <div
            key={index}
            className={`${(betId === index + 1 && ballDropped && num?.type === 1) ? "animate-zoomIn scale-110" : ""} ${betAndDropId === 2 ? "border-black" : "border-green"} border-[1px] relative bg-gradient-to-tr from-[#C47400] to-[#DD9600] text-white text-[10px] shadow-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] rounded-sm h-5 5 w-[27px] xs1:w-[28px] xs:w-[30px] flex items-center justify-center after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black/50`}
          >
            {num?.multiplier}
          </div>
        ))}
      </div>
      <div className="flex justify-center w-full overflow-x-auto">
        {getNumbersList?.data3?.map((num, index) => (
          <div
            key={index}
            className={`${(betId === index + 1 && ballDropped && num?.type === 1) ? "animate-zoomIn scale-110" : ""} ${betAndDropId === 3 ? "border-black" : "border-green"} border-[1px] relative bg-gradient-to-tr from-[#F5240C] to-[#CC1C00] text-white text-[10px] shadow-lg drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)] rounded-sm h-5 5 w-[27px] xs1:w-[28px] xs:w-[30px] flex items-center justify-center after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#981204]/90`}
          >
            {num?.multiplier}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlinkoGridMobile;
