import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from '../socket.js';
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import EditDeviceOutput from "./EditDeviceOutput.js";

interface EditDeviceProps {
  config: Config | null,
  setConfig: (config: Config) => void,
}

export default function EditDevice({ config, setConfig }: EditDeviceProps) {
  const { device } = useParams();
  const navigate = useNavigate();
  const [backBtnElement, setBackBtnElement] = useState<HTMLElement | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');
  const [deviceType, setDeviceType] = useState<string>('');
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [deviceAddress, setDeviceAddress] = useState<string>('');
  const [defaultVolume, setDefaultVolume] = useState<number|string>(0);
  const [defaultRatio, setDefaultRatio] = useState<number|string>(0);
  const [maxVolumePerOutput, setMaxVolumePerOutput] = useState<number|string>(0);
  const [calibrateDuration, setCalibrateDuration] = useState<number|string>(0);
  const [outputs, setOutputs] = useState<Output | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    socket && socket.on("message", (newMessage: ConfigMessage) => {
      if (newMessage.status === "configEdited") {
        setConfig(newMessage.config);
      }
    });
    setBackBtnElement(document.getElementById('backBtn') as HTMLElement)
  }, [setConfig, navigate]);

  useEffect(() => {
    if (saved) {
      navigate('/');
    }
  }, [config]);

  useEffect(() => {
    if (config) {
      setDeviceType(config.devices[device ?? 0]?.type ?? 'network');
      setDeviceName(config.devices[device ?? 0]?.name ?? `${device}`);
      setDefaultVolume(config.devices[device ?? 0]?.settings.defaultVolume ?? 0);
      setDefaultRatio(config.devices[device ?? 0]?.settings.defaultRatio ?? 0);
      setMaxVolumePerOutput(config.devices[device ?? 0]?.settings.maxVolumePerOutput ?? 0);
      setCalibrateDuration(config.devices[device ?? 0]?.settings.calibrateDuration ?? 0);
      setOutputs(config.devices[device ?? 0]?.outputs ?? null);
      if(config.devices[device ?? 0]?.type === 'network') {
        setDeviceAddress(config.devices[device ?? 0]?.address ?? "");
        setDeviceToken(config.devices[device ?? 0]?.token ?? "");
      }
    }
  }, [config, device]);

  const handleDeviceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceName(e.target.value);
  };

  const handleDeviceAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceAddress(e.target.value);
  };

  const handleDeviceTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceToken(e.target.value);
  };

  const handleDefaultVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultVolume(e.target.value);
    e.target.classList.remove('error');
    setErrors(errors.filter((error) => error !== 'defaultVolume'));
    if (isNaN(Number(e.target.value)) || Number(e.target.value) <= 0) {
      e.target.classList.add('error');
      setErrors([...errors, 'defaultVolume'])
    } 
  };

  const handleDefaultRatio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultRatio(e.target.value);
    e.target.classList.remove('error');
    setErrors(errors.filter((error) => error !== 'defaultRatio'));
    if (isNaN(Number(e.target.value)) || Number(e.target.value) <= 0) {
      e.target.classList.add('error');
      setErrors([...errors, 'defaultRatio'])
    } 
  };

  const handleMaxVolumePerOutput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxVolumePerOutput(e.target.value);
    e.target.classList.remove('error');
    setErrors(errors.filter((error) => error !== 'maxVolumePerOutput'));
    if (isNaN(Number(e.target.value)) || Number(e.target.value) <= 0) {
      e.target.classList.add('error');
      setErrors([...errors, 'maxVolumePerOutput'])
    } 
  };

  const handleCalibrateDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalibrateDuration(e.target.value);
    e.target.classList.remove('error');
    setErrors(errors.filter((error) => error !== 'calibrateDuration'));
    if (isNaN(Number(e.target.value)) || Number(e.target.value) <= 0) {
      e.target.classList.add('error');
      setErrors([...errors, 'calibrateDuration'])
    } 
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(() => true);
    socket && socket.emit("message", {
      action: "editDevice",
      device,
      name: deviceName,
      defaultVolume: Number(defaultVolume) || 0,
      defaultRatio: Number(defaultRatio) || 0,
      maxVolumePerOutput: Number(maxVolumePerOutput) || 0,
      calibrateDuration: Number(calibrateDuration) || 0,
      address: deviceAddress,
      token: deviceToken,
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
            {deviceType === 'network' && <>
              <label htmlFor="volume">Address</label>
              <input type="text" className="mb-2 w-full" placeholder="Name" value={deviceAddress} onChange={handleDeviceAddressChange} />
              <label htmlFor="volume">Token</label>
              <input type="text" className="mb-2 w-full" placeholder="Name" value={deviceToken} onChange={handleDeviceTokenChange} />
            </>}
            <label>Default Watering Volume</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Name" value={defaultVolume} onChange={handleDefaultVolume} />
              <span className="unit-label mb-2">ml</span>
            </div>
            <label>Default Ratio (milliliters per second)</label>
            <input type="text" className="mb-2 w-full" placeholder="Name" value={defaultRatio} onChange={handleDefaultRatio} />
            <label>Maximum amount of water per output during one watering session</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Maximum amount of water" value={maxVolumePerOutput} onChange={handleMaxVolumePerOutput} />
              <span className="unit-label mb-2">ml</span>
            </div>
            <label>Calibrate duration</label>
            <div className="flex items-center mb-2">
              <input type="text" className="mb-2 unit" placeholder="Name" value={calibrateDuration} onChange={handleCalibrateDuration} />
              <span className="unit-label mb-2">sec</span>
            </div>
            <div className="text-right mb-4">
              <button type="submit" disabled={errors.length > 0} className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
      <div className="card mb-4 mx-4 p-4 sm:mx-0">
        <h2 className="mb-4">Outputs config</h2>
        <div className="flex border-b-2 font-bold mb-2 p-2">
          <div className="flex-none w-20 font-bold">Output ID</div>
          <div className="flex-1 w-100">Pin</div>
          <div className="flex-none flex text-right">
            <div className="flex-1 mr-4">Active</div>
            <div className="flex-1">Sync</div>
          </div>
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