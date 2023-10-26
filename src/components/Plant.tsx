import { useCallback, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";
import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import { Link } from "react-router-dom";


export default function Plant({ id, device, name, image, defaultVolume }: { id: string, device: string, name: string | undefined, image: string | undefined, defaultVolume: number }) {

  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringVolume, setWateringVolume] = useState<number>(defaultVolume);
  const [initialWateringTime, setInitialWateringTime] = useState<number>(0);
  const [remainingWateringTime, setRemainingWateringTime] = useState<number>(0);
  const [wateringIn, setWateringIn] = useState<number>(0);

  const socketOnCallback = useCallback((newMessage: RemainingTimesMessage) => {
    if (newMessage.status === "remainingTimes" && newMessage.device === device && newMessage.remainingTimes[id]) {
      setWateringVolume(newMessage.remainingTimes[id].wateringVolume);
      if (newMessage.remainingTimes[id].wateringIn < 0) {
        setIsWatering(true);
        setRemainingWateringTime(newMessage.remainingTimes[id].wateringTime + newMessage.remainingTimes[id].wateringIn);
      } else {
        setWateringIn(newMessage.remainingTimes[id].wateringIn);
        setWateringVolume(newMessage.remainingTimes[id].wateringVolume);
        setInitialWateringTime((initialWateringTime) => initialWateringTime === 0 ? newMessage.remainingTimes[id].wateringTime : initialWateringTime);
      }
      setIsOn(true);
    }
    if (newMessage.device === device && newMessage.output === id) {
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
          setInitialWateringTime((initialWateringTime) => initialWateringTime === 0 ? newMessage.duration : initialWateringTime);
          setRemainingWateringTime(newMessage.duration);
          setWateringIn(0);
          break;
      }
    }
  }, [device, id]);

  const handleWateringVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0;
      setWateringVolume(value);
      setInitialWateringTime(0);
  }

  useEffect(() => {
    socket && socket.on("message", socketOnCallback);
  }, [socketOnCallback]);

  const handleMessageSubmit = (id: string, volume: number) => {
    if (!isOn) {
      socket && socket.emit("message", { action: 'startWater', device, output: id, volume });
    } else {
      socket && socket.emit("message", { action: 'stopWater', device, output: id });
    }
  };

  return (
    <div className="w-full md:w-1/2 lg:w-1/3">
    <div className="plant">
      <img className="image" src={image ? `/plants/${image}` : "/plant.svg"} alt="" />
      <div className="details">
        <Link to={`/output/edit/${device}/${id}`} className="editBtn">
          <Cog6ToothIcon className="h-5 w-5 text-slate-300 absolute top-2 right-2" />
        </Link>
        <h5 className="title">{name ?? `Output ${id}`}</h5>
        <div className="flex gap-3 mb-3 font-normal text-gray-700">
          <div className="flex items-center">
            <input className="volume" type="number" disabled={isWatering || wateringIn > 0} value={wateringVolume} onChange={handleWateringVolume} />
            <span className="volume-label">ml</span>
          </div>
          <button className={`waterBtn ${!isOn ? `bg-emerald-700` : `bg-slate-700`}`} onClick={() => handleMessageSubmit(id, wateringVolume)}>
            {!isOn ? `Water` : wateringIn > 0 ? `Abort` : `Stop`}
          </button>
        </div>
        {wateringIn > 0 && (<Timer type="scheduled" duration={wateringIn} initial={initialWateringTime}/>)}
        {isWatering && <Timer type="current" duration={remainingWateringTime} initial={initialWateringTime} />}
      </div>
    </div>
    </div>
  )
}