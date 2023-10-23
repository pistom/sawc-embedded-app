import { useEffect } from "react";
import Plant from "./Plant";
import socket from "../socket";

export default function Device({ device }: { device: DeviceConfig }) {

  useEffect(() => {
    socket && socket.emit("message", { action: "getRemainingTimes", device: device.id});
  }, [device]);

  return (<div className="p-4" key={device.id}>
    <h2 className="text-xl mb-4">{device.name}</h2>
    <div className="flex flex-wrap w-full justify-center gap-4">
      {device.outputs.map((output: OutputConfig) => (
        <Plant device={device.id} key={`plant_${device.id}_${output.id}`} output={output.id} />
      ))}
    </div>
  </div>)
}