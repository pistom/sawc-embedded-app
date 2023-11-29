import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from '../socket.js';
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import './output.css'
import Calibrate from "../components/Calibrate.js";
import Toggle from "../components/form/Toggle.js";

interface EditOutputProps {
  setTitle: (title: string) => void;
  config: Config | null;
  setConfig: (config: Config) => void;
}

export default function EditOutput({ setTitle, config, setConfig }: EditOutputProps) {
  const { device, outputId } = useParams();
  const [outputData, setOutputData] = useState<OutputConfig>();
  const [name, setName] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [onlinePlantsIds, setOnlinePlantsIds] = useState<string[]>([]);
  const [isSynchronised, setIsSynchronised] = useState<boolean>(false);
  const [defaultVolume, setDefaultVolume] = useState<number>(0);
  const [defaultVolumeRaw, setDefaultVolumeRaw] = useState<string>('0');
  const [ratio, setRatio] = useState<number>(0);
  const navigate = useNavigate();
  const [backBtnElement, setBackBtnElement] = useState<HTMLElement | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrateDuration, setCalibrateDuration] = useState<number>(0);

  useEffect(() => {
    socket && socket.on("message", (newMessage: ConfigMessage) => {
      if (newMessage.status === "configEdited") {
        setConfig(newMessage.config);
        navigate('/')
      }
    });
    setBackBtnElement(document.getElementById('backBtn') as HTMLElement)
  }, [setConfig, navigate]);

  useEffect(() => {
    if (config) {
      setOutputData(config.devices[device ?? 0]?.outputs[outputId ?? 0])
      setTitle(outputData?.name ?? `Output ${outputId}`);
      setName(outputData?.name ?? '');
      setImage(outputData?.image ?? '');
      setDefaultVolume(outputData?.defaultVolume ?? config.devices[device ?? 0]?.settings.defaultVolume ?? 0);
      setIsSynchronised(outputData?.sync ?? false);
      setOnlinePlantsIds(outputData?.onlinePlantsIds ?? []);
      setDefaultVolumeRaw(outputData?.defaultVolume ? outputData.defaultVolume.toString() : config.devices[device ?? 0]?.settings.defaultVolume.toString());
      setRatio(outputData?.ratio ?? config.devices[device ?? 0]?.settings.defaultRatio ?? 0);
      setCalibrateDuration(config.devices[device ?? 0]?.settings.calibrateDuration ?? 0);
    }
  }, [config, device, outputData?.defaultVolume, outputData?.image, outputData?.name, outputData?.onlinePlantsIds, outputData?.ratio, outputData?.sync, outputId, setTitle]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImage(e.target.value);
  };

  const handleDefaultVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultVolumeRaw(e.target.value);
    e.target.classList.remove('error');
    if (typeof Number(e.target.value) === 'number' && parseInt(e.target.value) >= 0) {
      setDefaultVolume(parseInt(e.target.value));
    } else {
      e.target.classList.add('error');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCalibrating) {
      socket && socket.emit("message", { action: "stopCalibrating", device, output: outputId });
    }
    socket && socket.emit("message", { action: "editOutput", device, output: outputId, name, image, defaultVolume, ratio, sync: isSynchronised });
  }

  const handleCalibrate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsCalibrating(true);
  }

  const handleBackBtnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isCalibrating) {
      socket && socket.emit("message", { action: "stopCalibrating", device, output: outputId });
    }
    navigate('/');
  }

  const handleScheduleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(`/schedule?device=${device}&output=${outputId}`);
  }

  if (!device || !outputId) {
    return <div>Missing device or output id</div>
  }

  return (
    <>
      {backBtnElement && createPortal(<Link to={'/'} onClick={handleBackBtnClick} className="backBtn bg-slate-100 rounded-full px-2 mr-2">
        <ChevronLeftIcon className="h-5 w-5 text-gray-500 align-baseline inline-block" />
      </Link>, backBtnElement)}
      <div className="card mb-4 mx-4 p-4 sm:mx-0">
        <form onSubmit={handleSubmit} className="form sm:flex sm:items-start">
          <div className="sm:w-2/3">
            <label htmlFor="volume">Name</label>
            <input disabled={onlinePlantsIds.length > 0} type="text" className="mb-2 w-full" placeholder="Name" value={name} onChange={handleNameChange} />
            <label htmlFor="volume">Default watering volume (0 for default device value)</label>
            <div id="volume" className="flex items-center mb-2">
              <input className="unit" type="number" value={defaultVolumeRaw} onChange={handleDefaultVolumeChange} />
              <span className="unit-label">ml</span>
            </div>
            <label htmlFor="ratio">Ratio (milliliters per second)</label>
            <div className="flex items-center mb-2">
              <input id="ratio" className="unit" type="number" disabled value={ratio} onChange={() => setRatio(5)} />
              <button className="inputBtn" onClick={handleCalibrate}>Calibrate</button>
            </div>
            <div className="mb-2">
              {isCalibrating && <Calibrate duration={calibrateDuration} setRatio={setRatio} setIsCalibrating={setIsCalibrating} output={outputId} device={device} />}
            </div>
            <label htmlFor="image">Image</label>
            <select disabled={onlinePlantsIds.length > 0} id="image" onChange={handleImageChange} value={image} className="mb-4 w-full" >
              <option value="">Select image</option>
              {[...Array(7)].map((_, i) => <option key={i} value={`0${i + 1}.jpg`}>Image {i + 1}</option>)}
            </select>
            <label htmlFor="image">Sync with houseplants.life</label>
            <div className="mb-2 text-left">
              <Toggle checked={isSynchronised} onChange={() => setIsSynchronised(!isSynchronised)} label="" />
            </div>
            <div className="text-right mb-4">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
            <div className="text-right mb-4">
              <button className="btn btn-sm btn-secondary" onClick={handleScheduleClick}>Schedule watering</button>
            </div>
          </div>
          <div className="w-full h-72 sm:w-1/3 sm:ml-4 text-center">
            <img src={image ? `/plants/${image}` : `/plant.svg`} className="image object-cover w-full inline bg-slate-200 h-72" alt="" />
          </div>
        </form>
      </div>
    </>
  )
}