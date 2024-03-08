import { useContext, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";
import { Cog6ToothIcon, LockOpenIcon } from '@heroicons/react/24/solid'
import { Link } from "react-router-dom";
import './plant.css';
import { UserMessagesContext } from "../context/UserMessagesContext";

interface PlantProps {
  device: DeviceConfig;
  output: OutputConfig;
  plantMessage?: Message;
  remainingTime?: { wateringTime: number, wateringIn: number, wateringVolume: number };
}

export default function Plant({ device, output, plantMessage, remainingTime }: PlantProps) {
  const { id: deviceId, settings: deviceSettings } = device;
  const { id, name, image, defaultVolume, sync } = output;
  const [isOn, setIsOn] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [wateringVolume, setWateringVolume] = useState<number>(defaultVolume || deviceSettings.defaultVolume);
  const [wateringVolumeRaw, setWateringVolumeRaw] = useState<number | string>(defaultVolume || deviceSettings.defaultVolume);
  const [initialWateringTime, setInitialWateringTime] = useState<number>(0);
  const [remainingWateringTime, setRemainingWateringTime] = useState<number>(0);
  const [wateringIn, setWateringIn] = useState<number>(0);
  const [isDisabledWateringBtn, setIsDisabledWateringBtn] = useState<boolean>(false);
  const userMessagesContext = useContext(UserMessagesContext);
  const { addMessage } = userMessagesContext;

  useEffect(() => {
    if (remainingTime) {
      setWateringVolume(remainingTime.wateringVolume);
      if (remainingTime.wateringIn < 0) {
        setIsWatering(true);
        setRemainingWateringTime(remainingTime.wateringTime + remainingTime.wateringIn);
        setInitialWateringTime(remainingTime.wateringTime);
      } else {
        setWateringIn(() => remainingTime.wateringIn);
        setWateringVolume(remainingTime.wateringVolume);
        setInitialWateringTime((initialWateringTime) => initialWateringTime === 0 ? remainingTime.wateringTime : initialWateringTime);
      }
      setIsOn(true);
    }
  }, [remainingTime]);

  useEffect(() => {
    if (plantMessage) {
      switch (plantMessage.status) {
        case "done":
        case "error":
        case "stopError":
          setTimeout(() => {
            setIsOn(false);
            setIsWatering(false);
            if (plantMessage.status === "error") {
              switch (plantMessage.context?.errno) {
                case -113:
                case "EHOSTUNREACH":
                  addMessage({
                    type: 'error',
                    title: `Can not reach network module (${plantMessage.context?.address})`,
                    message: 'Check that the device is switched on and properly configured.'
                  });
                  break;
                case -123:
                  addMessage({
                    type: 'error',
                    title: `Output number not found (${plantMessage.device}, output: ${plantMessage.output})`,
                    message: 'Check the device configuration.'
                  });
                  break;
                case "INVALIDTOKEN":
                  addMessage({
                    type: 'error',
                    title: `Invalid token`,
                    message: 'Check the device configuration.'
                  });
                  break;
              }
            }
          }, 1000);
          setWateringIn(0);
          break;
        case "aborted":
        case "stopped":
          setIsOn(false);
          setWateringIn(0);
          setIsWatering(false);
          break;
        case "watering":
          setIsOn(true);
          setIsWatering(true);
          setInitialWateringTime((initialWateringTime) => initialWateringTime === 0 ? plantMessage.duration : initialWateringTime);
          setRemainingWateringTime(plantMessage.duration);
          setWateringIn(0);
          break;
        case "calibratingError":
          console.error('calibratingError', plantMessage);
          break;
      }
    }
  }, [plantMessage, addMessage]);

  const handleWateringVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWateringVolumeRaw(e.target.value);
    if (e.target.value !== "" && parseInt(e.target.value) > 0) {
      setIsDisabledWateringBtn(false);
      let value = parseInt(e.target.value);
      if (value > deviceSettings.maxVolumePerOutput) {
        value = deviceSettings.maxVolumePerOutput;
      }
      setWateringVolume(value);
      setInitialWateringTime(0);
    } else {
      setIsDisabledWateringBtn(true);
    }
  }

  const handleMessageSubmit = (id: string, volume: number) => {
    if (!isOn) {
      socket && socket.emit("message", { action: 'startWater', device: deviceId, output: id, volume });
    } else {
      socket && socket.emit("message", { action: 'stopWater', device: deviceId, output: id });
    }
  };
  
  let imageSrc = image ? `/plants/${image}` : "/plant.svg";
  !name && (imageSrc = "/no-plant.svg");

  return <div className="w-full md:w-1/2 lg:w-1/3">
    <div className="plant relative">
      {!sync && !isOn && <span className="absolute bottom-2 right-2 text-sm text-slate-400 ">Not synced <LockOpenIcon className="align-sub h-5 w-5 inline-block" /></span>}
      <img className="image bg-slate-200" src={imageSrc} alt="" />
      <div className="details">
        {!isOn &&
          <Link to={`/output/edit/${deviceId}/${id}`} className="editBtn">
            <Cog6ToothIcon className="h-5 w-5 text-slate-300 absolute top-2 right-2" />
          </Link>}
        <h5 className="title">{name ?? `Output ${id}`}</h5>
        <div className="form flex gap-3 mb-3 font-normal text-gray-700">
          <div className="flex items-center">
            <input className="unit" type="number" disabled={isWatering || wateringIn > 0} value={wateringVolumeRaw} onChange={handleWateringVolume} />
            <span className="unit-label">ml</span>
          </div>
          <button className={`waterBtn btn ${!isOn ? `bg-emerald-700` : `bg-slate-700`}`} disabled={isDisabledWateringBtn} onClick={() => handleMessageSubmit(id, wateringVolume)}>
            {!isOn ? `Water` : wateringIn > 0 ? `Abort` : `Stop`}
          </button>
        </div>
        {wateringIn > 0 && (<Timer type="scheduled" duration={wateringIn} />)}
        {isWatering && <Timer type="current" duration={remainingWateringTime} initial={initialWateringTime} />}
      </div>
    </div>
  </div>

}