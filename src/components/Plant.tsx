import { ReactNode, useEffect, useState } from "react";
import socket from '../socket.ts';
import Timer from "./Timer";
import { Cog6ToothIcon, LockOpenIcon, NoSymbolIcon, PlayIcon, StopIcon } from '@heroicons/react/16/solid'
import { Link } from "react-router-dom";
import './plant.css';

interface PlantProps {
  device: DeviceConfig;
  output: OutputConfig;
  plantMessage?: Message;
  remainingTime?: { wateringTime: number, wateringIn: number, wateringVolume: number };
  displayErrors: (plantMessage: Message) => void;
  compact?: boolean;
}

export default function Plant({ device, output, plantMessage, remainingTime, displayErrors, compact }: PlantProps) {
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
  const [waterBtnLabels, setWaterBtnLabels] = useState<{ start: ReactNode, stop: ReactNode, abort: ReactNode }>({ start: 'Water', stop: 'Stop', abort: 'Abort' });

  useEffect(() => {
    if (remainingTime) {
      setIsDisabledWateringBtn(false);
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
    if (compact) {
      const startLabel = <PlayIcon className="h-5 w-5 text-slate-400 absolute top-2 right-2" />
      const stopLabel = <StopIcon className="h-5 w-5 text-slate-400 absolute top-2 right-2" />
      const abortLabel = <NoSymbolIcon className="h-5 w-5 text-slate-400 absolute top-2 right-2" />

      setWaterBtnLabels({ start: startLabel, stop: stopLabel, abort: abortLabel });
    }
  }, [compact])

  useEffect(() => {
    plantMessage && displayErrors(plantMessage);
  }, [plantMessage, displayErrors]);

  useEffect(() => {
    if (plantMessage) {
      setIsDisabledWateringBtn(false);
      switch (plantMessage.status) {
        case "done":
        case "error":
        case "stopError":
          setTimeout(() => {
            setIsOn(false);
            setIsWatering(false);
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
  }, [plantMessage]);

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
    setIsDisabledWateringBtn(true);
    if (!isOn) {
      socket && socket.emit("message", { action: 'startWater', device: deviceId, output: id, volume });
    } else {
      socket && socket.emit("message", { action: 'stopWater', device: deviceId, output: id });
    }
  };

  let imageSrc = image ? `/plants/${image}` : "/plant.svg";
  !name && (imageSrc = "/no-plant.svg");

  return <div className="w-full">
    <div className="plant relative">
      {!sync && !isOn && <span className="sync-status">Not synced <LockOpenIcon className="align-sub h-5 w-5 inline-block" /></span>}
      <img className="image bg-slate-200" src={imageSrc} alt="" />
      <div className="details">
        {!isOn && !compact &&
          <Link to={`/output/edit/${deviceId}/${id}`} className="editBtn">
            <Cog6ToothIcon className="h-5 w-5 text-slate-300 absolute top-2 right-2" />
          </Link>}
        <h5 className="title">{name ?? `Output ${id}`}</h5>
        <div className="form flex gap-3 mb-3 font-normal text-gray-700">
          {!compact &&
            <div className="flex items-center">
              <input className="unit" type="number" disabled={isWatering || wateringIn > 0} value={wateringVolumeRaw} onChange={handleWateringVolume} />
              <span className="unit-label">ml</span>
            </div>
          }
          <button className={`waterBtn btn ${!isOn ? `bg-emerald-700` : `bg-slate-700`}`} disabled={isDisabledWateringBtn} onClick={() => handleMessageSubmit(id, wateringVolume)}>
            {!isOn ? waterBtnLabels.start : wateringIn > 0 ? waterBtnLabels.abort : waterBtnLabels.stop}
          </button>
        </div>
        {wateringIn > 0 && (<Timer type="scheduled" duration={wateringIn} />)}
        {isWatering && <Timer type="current" duration={remainingWateringTime} initial={initialWateringTime} />}
      </div>
    </div>
  </div>

}