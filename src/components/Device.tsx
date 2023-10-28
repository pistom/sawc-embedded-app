import { useEffect } from "react";
import Plant from "./Plant";
import socket from "../socket";

export default function Device({ device }: { device: DeviceConfig }) {

  useEffect(() => {
    socket && socket.emit("message", { action: "getRemainingTimes", device: device.id });
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 mx-4 sm:mx-0">{device.name}</h2>
      <div className="plants">
        {device.outputs.map((output: OutputConfig) => (
          <Plant
            device={device}
            output={output}
            key={`plant_${device.id}_${output.id}`}
          />
        ))}
      </div>
    </div>
  )
}