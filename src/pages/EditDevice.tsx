import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from '../socket.js';
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import EditDeviceOutput from "./EditDeviceOutput.js";

export default function EditDevice({ setTitle, config, setConfig }: { setTitle: (title: string) => void, config: Config | null, setConfig: (config: Config) => void }) {
  const { device } = useParams();
  const navigate = useNavigate();
  const [backBtnElement, setBackBtnElement] = useState<HTMLElement | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');
  const [defaultVolume, setDefaultVolume] = useState<number>(0);
  const [defaultRatio, setDefaultRatio] = useState<number>(0);
  const [maxVolumePerOutput, setMaxVolumePerOutput] = useState<number>(0);
  const [calibrateDuration, setCalibrateDuration] = useState<number>(0);
  const [outputs, setOutputs] = useState<Output | null>(null);

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
      setDeviceName(config.devices[device ?? 0]?.name ?? `${device}`);
      setDefaultVolume(config.devices[device ?? 0]?.settings.defaultVolume ?? 0);
      setDefaultRatio(config.devices[device ?? 0]?.settings.defaultRatio ?? 0);
      setMaxVolumePerOutput(config.devices[device ?? 0]?.settings.maxVolumePerOutput ?? 0);
      setCalibrateDuration(config.devices[device ?? 0]?.settings.calibrateDuration ?? 0);
      setOutputs(config.devices[device ?? 0]?.outputs ?? null);
    }
  }, [config, device, setTitle]);

  const handleDeviceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceName(e.target.value);
  };

  const handleDefaultVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultVolume(parseInt(e.target.value) || 0);
  };

  const handleDefaultRatio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultRatio(parseInt(e.target.value) || 0);
  };

  const handleMaxVolumePerOutput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxVolumePerOutput(parseInt(e.target.value) || 0);
  };

  const handleCalibrateDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalibrateDuration(parseInt(e.target.value) || 0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket && socket.emit("message", {
      action: "editDevice",
      device,
      name: deviceName,
      defaultVolume,
      defaultRatio,
      maxVolumePerOutput,
      calibrateDuration,
    });
  }

  if (!device) {
    return <div>Missing device id</div>
  }

  return (
    <>
      {backBtnElement && createPortal(<Link to={'/'} className="backBtn bg-slate-100 rounded-full px-2 mr-2">
        <ChevronLeftIcon className="h-5 w-5 text-gray-500 align-baseline inline-block" />
      </Link>, backBtnElement)}
      <div className="card mb-4 mx-4 p-4 sm:mx-0">
        <form onSubmit={handleSubmit} className="form sm:flex sm:items-start">
          <div className="w-full">
            <label htmlFor="volume">Name</label>
            <input type="text" className="mb-2 w-full" placeholder="Name" value={deviceName} onChange={handleDeviceNameChange} />
            <label>Default Watering Volume</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Name" value={defaultVolume} onChange={handleDefaultVolume} />
              <span className="unit-label mb-2">ml</span>
            </div>
            <label>Default Ratio (milliliters per second)</label>
            <input type="text" className="mb-2 w-full" placeholder="Name" value={defaultRatio} onChange={handleDefaultRatio} />
            <label>Maximum amount of water per output during one watering session</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Name" value={maxVolumePerOutput} onChange={handleMaxVolumePerOutput} />
              <span className="unit-label mb-2">ml</span>
            </div>
            <label>Calibrate duration</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Name" value={calibrateDuration} onChange={handleCalibrateDuration} />
              <span className="unit-label mb-2">sec</span>
            </div>
            <div className="text-right mb-4">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
      <div className="card mb-4 mx-4 p-4 sm:mx-0">
        <h2 className="mb-4">Outputs config</h2>
        <div className="flex border-b-2 font-bold mb-2 p-2">
          <div className="flex-none w-24 font-bold">Output ID</div>
          <div className="flex-1 w-1/3">Pin</div>
          <div className="flex-1 w-1/3 text-right">Active</div>
        </div>
        <div>
          {outputs && Object.keys(outputs).map((outputId) => {
            const output = outputs[outputId];
            return <EditDeviceOutput key={outputId} outputId={outputId} output={output} device={device ?? ''} setConfig={setConfig} />
          })}
        </div>
      </div>
    </>
  )
}