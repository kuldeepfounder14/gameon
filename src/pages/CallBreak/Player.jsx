import CircleTimer from "./CircleTimer";
const Player = ({ position, name, showTimer, timerValue, isCurrentTurn }) => {
  const positions = {
    bottom: "bottom-2 left-1/2 -translate-x-1/2",
    top: "top-2 left-1/2 -translate-x-1/2",
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={`absolute z-10 ${positions[position]} flex flex-col items-center`}
    >
      <div
        className={`w-10 h-10 rounded-full ${
          isCurrentTurn ? "border-4 border-black" : "bg-gray"
        } mx-auto mb-1`}
      ></div>

      {showTimer && (
        <div className="absolute -top-2.5">
          <CircleTimer duration={timerValue} />
        </div>
      )}

      <p className="text-white text-xs">{name}</p>
    </div>
  );
};
export default Player;

