import React, { useEffect, useRef, useState } from "react";

const CircleTimer = ({ size = 60, strokeWidth = 6, duration = 59 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    startTimeRef.current = null;
    setProgress(0);

    const totalDuration = duration * 1000;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const newProgress = Math.min(elapsed / totalDuration, 1);
      setProgress(newProgress);

      if (elapsed < totalDuration) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(requestRef.current);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [duration]);

  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#00000066"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <span className="text-white text-xs absolute top-5 left-4 font-bold z-10 ">
        ⏳
        {Math.ceil((1 - progress) * duration)}
      </span>
    </div>
  );
};

export default CircleTimer;

// import React, { useEffect, useRef, useState } from "react";

// const CircleTimer = ({ size = 60, strokeWidth = 6 }) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = 2 * Math.PI * radius;

//   const [progress, setProgress] = useState(0); // 0 to 1
//   const [phase, setPhase] = useState("phase1"); // "phase1" → "phase2" → "done"

//   const requestRef = useRef();
//   const startTimeRef = useRef();

//   const duration = phase === "phase1" ? 30_000 : 15_000; // ms
//   const bgColor = "bg-black/40";
//   const fillColor = phase === "phase1" ? "#22c55e" : "#EB1C23"; 

//   useEffect(() => {
//     startTimeRef.current = null;

//     const animate = (timestamp) => {
//       if (!startTimeRef.current) startTimeRef.current = timestamp;
//       const elapsed = timestamp - startTimeRef.current;

//       const newProgress = Math.min(elapsed / duration, 1);
//       setProgress(newProgress);

//       if (elapsed < duration) {
//         requestRef.current = requestAnimationFrame(animate);
//       } else if (phase === "phase1") {
//         // Move to next phase
//         setPhase("phase2");
//         setProgress(0);
//       } else {
//         // Done
//         cancelAnimationFrame(requestRef.current);
//         setPhase("done");
//       }
//     };

//     requestRef.current = requestAnimationFrame(animate);

//     return () => cancelAnimationFrame(requestRef.current);
//   }, [phase]);

//   const strokeDashoffset = circumference * (1 - progress);

//   return (
//     <div
//       className={`relative w-[${size}px] h-[${size}px] flex items-center justify-center`}
//     >
//       <svg width={size} height={size} className={`absolute`}>
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke="#00000066" 
//           strokeWidth={strokeWidth}
//           fill="transparent"
//         />
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke={fillColor}
//           strokeWidth={strokeWidth}
//           fill="transparent"
//           strokeDasharray={circumference}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
//         />
//       </svg>

//       {(phase === "phase1" || phase === "phase2") && (
//         <span className="text-white text-xs font-bold z-10">
//           ⏳<br/>{Math.ceil((1 - progress) * (phase === "phase1" ? 30 : 15))}
//         </span>
//       )}
//     </div>
//   );
// };

// export default CircleTimer;
