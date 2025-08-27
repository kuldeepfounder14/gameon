import { useEffect, useRef, useState } from "react";

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

