import { useEffect, useState } from "react";
import { Socket, } from "socket.io-client";
import Timer from "./timer";

export default function Plant({ output, socket, device }: { output: string, socket: Socket | null, device: string }) {

  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringTime, setWateringTime] = useState<number>(5);
  const [wateringIn, setWateringIn] = useState<number>(0);

  useEffect(() => {
    socket && socket.on("message", (newMessage) => {
      if (newMessage.status === "remainingTimes" && newMessage.device === device && newMessage.remainingTimes[output]) {
        setWateringTime(newMessage.remainingTimes[output].wateringTime);
        setWateringIn(parseInt(newMessage.remainingTimes[output].wateringIn));
      }
      if (newMessage.device === device && newMessage.output === output) {
        switch (newMessage.status) {
          case "done":
          case "aborted":
            setIsOn(false);
            break;
          case "watering":
            setIsWatering(true);
            setWateringTime(newMessage.duration);
            setWateringIn(0);
            break;
        }
        if (newMessage.status === "done" || newMessage.status === "aborted") {
          setIsOn(false);
          setWateringIn(0);
          setIsWatering(false);
        }
      }
    });
  }, [device, output, socket]);

  const handleMessageSubmit = (output: string, duration: number) => {
    if (!isOn) {
      setIsOn(true);
      socket && socket.emit("message", { action: 'startWater', device, output, duration });
    } else {
      setIsOn(false);
      socket && socket.emit("message", { action: 'stopWater', device, output });
      setIsWatering(false);
    }
  };

  return (
    <div className={`device ${isWatering ? 'is-watering' : ''} ${wateringIn > 0 ? 'is-scheduled' : ''}`}>
      Plant {output}
      <div className="form">
        <input type="number" disabled={isWatering || wateringIn > 0} value={wateringTime} onChange={(e) => setWateringTime(parseInt(e.target.value))} />
        <button onClick={() => handleMessageSubmit(output, wateringTime)}>{isOn ? "Stop" : "Water"}</button>
      </div>
      <div className="status">
        {wateringIn > 0 && (<Timer label="Scheduled" duration={wateringIn} />)}
        {isWatering && <Timer label="Watering" duration={wateringTime} />}
      </div>
    </div>
  )
}