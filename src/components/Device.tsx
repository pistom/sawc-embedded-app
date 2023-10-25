import { useEffect } from "react";
import Plant from "./Plant";
import socket from "../socket";

export default function Device({ device }: { device: DeviceConfig }) {

  useEffect(() => {
    socket && socket.emit("message", { action: "getRemainingTimes", device: device.id });
  }, [device]);

  return (
    <div className="" key={device.id}>
      <h2 className="text-2xl font-bold mb-4 mx-4 md:mx-0">{device.name}</h2>
      <div className="plants">
        {device.outputs.map((output: OutputConfig) => (
          <Plant device={device.id} key={`plant_${device.id}_${output.id}`} id={output.id} name={output.name} image={output.image} />
        ))}
      </div>
    </div>
  )
}