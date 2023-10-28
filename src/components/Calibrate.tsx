import { useEffect, useState } from "react";
import Timer from "./Timer";
import socket from "../socket";

interface CalibrateInterface {
  setIsCalibrating: (isCalibrating: boolean) => void, 
  setRatio: (ratio: number) => void, 
  output: string, 
  device: string,
  duration: number,
}

const Calibrate = ({ setIsCalibrating, duration, setRatio, output, device }: CalibrateInterface) => {
  const [volume, setVolume] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWater, setIsWater] = useState<boolean>(false);
  const [waterIsDone, setWaterIsDone] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>();

  useEffect(() => {
    socket && socket.on("message", (newMessage: CalibrationMessage) => {
      if (output === newMessage.output && device === newMessage.device) {
        setErrorMessage(null);
        switch (newMessage.status) {
          case "calibratingWaterStarted":
            setIsWater(true);
            setVolume(0);
            setWaterIsDone(false);
            setTimeLeft(newMessage.duration);
            break;
          case "calibratingWaterStopped":
            setIsWater(false);
            setTimeLeft(0);
            setWaterIsDone(true);
            break;
          case "calibratingWaterAborted":
            setIsWater(false);
            setTimeLeft(0);
            setWaterIsDone(false);
            setVolume(0);
            break;
          case "calibratingError":
            setIsWater(false);
            setErrorMessage(newMessage.message);
            break;
          case "ratioCalculated":
            setIsCalibrating(false);
            setRatio(newMessage.ratio);
        }
      }
    });
  }, [device, output, setIsCalibrating, setRatio]);

  const handleMesure = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isWater) {
      socket && socket.emit("message", { action: "stopCalibrating", device, output });
    } else {
      socket && socket.emit("message", { action: "calibrate", device, output });
    }
  }
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsCalibrating(false);
  }

  const handleCalculate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    socket && socket.emit("message", { action: "calculateRatio", device, output, volume });
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Math.abs(parseInt(e.target.value) || 0));
  };

  return <div className="border p-4 rounded-lg border-slate-300 transition">
    <div>{errorMessage}</div>
    <div className="step-1 relative pb-8">
      <h1 className="text-xl">Calibrate</h1>
      <div className="flex flex-col items-center sm:flex-row w-full items-start">
        <div className="bg-slate-200 p-4 rounded-lg text-center w-full mb-2 h-28 sm:w-40 sm:order-last">
          <img src="/cup.svg" className="object-cover h-full inline" alt="" />
        </div>
        <div className="w-full sm:mr-4">
          <p className="text-sm">
            {`Prepare a measuring cup with milliliter markings. Place it under the tip of the watering hose. Press the "start" button. Water will fill the measuring cup for ${duration} seconds.`}
          </p>
          <div className="text-right">
            <button className="btn btn-sm btn-primary" onClick={handleMesure}>{isWater ? 'Stop' : 'Start'}</button>
          </div>
        </div>
      </div>
      {isWater && <Timer type="current" duration={timeLeft} finishCallback={() => setIsWater(false)} />}
    </div>
    {waterIsDone && <>
      <p className="text-sm">How much water is in the cup?</p>
      <div className="relative flex items-center mb-4 pb-4">
        <input className="volume" type="number" disabled={!waterIsDone} onChange={handleVolumeChange} value={volume} placeholder="Calibration value" />
        <span className="volume-label">ml</span>
      </div>
    </>}
    <div className="text-right mt-4">
      <button className="btn btn-md mr-2" onClick={handleClose}>Close</button>
      <button className="btn btn-primary btn-md" disabled={volume === 0} onClick={handleCalculate}>Calculate ratio</button>
    </div>
  </div>
}

export default Calibrate;