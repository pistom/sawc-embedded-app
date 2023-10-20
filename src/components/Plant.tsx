import { useCallback, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";

export default function Plant({ output, device }: { output: string, device: string }) {

  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringTime, setWateringTime] = useState<number>(5);
  const [wateringIn, setWateringIn] = useState<number>(0);

  interface Message {
    device: string;
    output: string;
    status: string;
    duration: number;
    remainingTimes: { [key: string]: { wateringTime: number, wateringIn: number } };
  }
  const socketOnCallback = useCallback((newMessage: Message) => {
      if (newMessage.status === "remainingTimes" && newMessage.device === device && newMessage.remainingTimes[output]) {
        setWateringTime(newMessage.remainingTimes[output].wateringTime);
        setWateringIn(newMessage.remainingTimes[output].wateringIn);
        setIsOn(true);
      }
    if (newMessage.device === device && newMessage.output === output) {
        switch (newMessage.status) {
          case "done":
          case "aborted":
          case "stopped":
            setIsOn(false);
            setWateringIn(0);
            setIsWatering(false);
            break;
          case "watering":
            setIsOn(true);
            setIsWatering(true);
            setWateringTime(newMessage.duration);
            setWateringIn(0);
            break;
        }
      }
  }, [device, output]);

  useEffect(() => {
    socket && socket.on("message", socketOnCallback);
  }, [socketOnCallback]);

  const handleMessageSubmit = (output: string, duration: number) => {
    if (!isOn) {
      socket && socket.emit("message", { action: 'startWater', device, output, duration });
    } else {
      socket && socket.emit("message", { action: 'stopWater', device, output });
    }
  };

  return (
    <div className={`device ${isWatering ? 'is-watering' : ''} ${wateringIn > 0 ? 'is-scheduled' : ''}`}>
      Plant {output}
      <div className="form">
        <input type="number" disabled={isWatering || wateringIn > 0} value={wateringTime} onChange={(e) => setWateringTime(parseInt(e.target.value) || 0)} />
        <button onClick={() => handleMessageSubmit(output, wateringTime)}>{isOn ? "Stop" : "Water"}</button>
      </div>
      <div className="status">
        {wateringIn > 0 && (<Timer label="Scheduled" duration={wateringIn} />)}
        {isWatering && <Timer label="Watering" duration={wateringTime} />}
      </div>
    </div>
  )
}