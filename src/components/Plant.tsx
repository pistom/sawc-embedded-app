import { useCallback, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";

export default function Plant({ output, device }: { output: string, device: string }) {

  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringTime, setWateringTime] = useState<number>(5);
  const [remainingWateringTime, setRemainingWateringTime] = useState<number>(0);
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
      if (newMessage.remainingTimes[output].wateringIn < 0) {
        setIsWatering(true);
        setRemainingWateringTime(newMessage.remainingTimes[output].wateringTime + newMessage.remainingTimes[output].wateringIn);
      } else {
        setWateringIn(newMessage.remainingTimes[output].wateringIn);
        setWateringTime(newMessage.remainingTimes[output].wateringTime);
      }
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
          setRemainingWateringTime(newMessage.duration);
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
    <div className="w-full md:w-1/2 lg:w-1/3">
    <div className="plant">
      <img className="image" src="/plant.svg" alt="" />
      <div className="details">
        <h5 className="title">Output {output}</h5>
        <div className="flex gap-3 mb-3 font-normal text-gray-700">
          <input className="quantity w-24" type="number" disabled={isWatering || wateringIn > 0} value={wateringTime} onChange={(e) => setWateringTime(parseInt(e.target.value) || 0)} />
          <button className="waterBtn" onClick={() => handleMessageSubmit(output, wateringTime)}>
            Water
          </button>
        </div>
        {isOn &&
            <div className={`watering ${wateringIn > 0 && 'scheduled'}`}>
              <h2 className="text-xl mt-2 mb-4">
                {wateringIn > 0 && (<Timer label="Scheduled" duration={wateringIn} />)}
                {isWatering && <Timer label="Watering" duration={remainingWateringTime} />}
              </h2>
              <button className="stopBtn" onClick={() => handleMessageSubmit(output, wateringTime)}>
                Stop
              </button>
            </div>
        }
      </div>
    </div>
    </div>
  )
}