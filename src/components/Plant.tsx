import { useCallback, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";
import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import { Link } from "react-router-dom";
import './plant.css';


export default function Plant({ device, output }: { device: DeviceConfig, output: OutputConfig }) {
  const { id: deviceId, settings: deviceSettings } = device;
  const { id, name, image, defaultVolume } = output;
  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringVolume, setWateringVolume] = useState<number>(defaultVolume || deviceSettings.defaultVolume);
  const [initialWateringTime, setInitialWateringTime] = useState<number>(0);
  const [remainingWateringTime, setRemainingWateringTime] = useState<number>(0);
  const [wateringIn, setWateringIn] = useState<number>(0);

  const socketOnCallback = useCallback((newMessage: RemainingTimesMessage) => {
    if (newMessage.status === "remainingTimes" && newMessage.device === deviceId && newMessage.remainingTimes[id]) {
      setWateringVolume(newMessage.remainingTimes[id].wateringVolume);
      if (newMessage.remainingTimes[id].wateringIn < 0) {
        setIsWatering(true);
        setRemainingWateringTime(newMessage.remainingTimes[id].wateringTime + newMessage.remainingTimes[id].wateringIn);
        setInitialWateringTime(newMessage.remainingTimes[id].wateringTime);
      } else {
        setWateringIn(newMessage.remainingTimes[id].wateringIn);
        setWateringVolume(newMessage.remainingTimes[id].wateringVolume);
        setInitialWateringTime((initialWateringTime) => initialWateringTime === 0 ? newMessage.remainingTimes[id].wateringTime : initialWateringTime);
      }
      setIsOn(true);
    }
    if (newMessage.device === deviceId && newMessage.output === id) {
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
  }, [deviceId, id]);

  const handleWateringVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 0;
    if (value > deviceSettings.maxVolumePerOutput) {
      value = deviceSettings.maxVolumePerOutput;
    }
    setWateringVolume(value);
    setInitialWateringTime(0);
  }

  useEffect(() => {
    socket && socket.on("message", socketOnCallback);
  }, [socketOnCallback]);

  const handleMessageSubmit = (id: string, volume: number) => {
    if (!isOn) {
      socket && socket.emit("message", { action: 'startWater', device: deviceId, output: id, volume });
    } else {
      socket && socket.emit("message", { action: 'stopWater', device: deviceId, output: id });
    }
  };

  return <div className="w-full md:w-1/2 lg:w-1/3">
    <div className="plant">
      <img className="image bg-slate-200" src={image ? `/plants/${image}` : "/plant.svg"} alt="" />
      <div className="details">
        {!isOn &&
          <Link to={`/output/edit/${deviceId}/${id}`} className="editBtn">
            <Cog6ToothIcon className="h-5 w-5 text-slate-300 absolute top-2 right-2" />
          </Link>}
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
        {wateringIn > 0 && (<Timer type="scheduled" duration={wateringIn} />)}
        {isWatering && <Timer type="current" duration={remainingWateringTime} initial={initialWateringTime} />}
      </div>
    </div>
  </div>

}