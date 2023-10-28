import { useEffect } from "react";
import Plant from "./Plant";
import socket from "../socket";
import { Link } from "react-router-dom";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

export default function Device({ device }: { device: DeviceConfig }) {

  useEffect(() => {
    socket && socket.emit("message", { action: "getRemainingTimes", device: device.id });
  });

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-4 mx-4 sm:mx-0">{device.name}</h2>
      <Link to={`/output/edit/${device.id}`} className="editBtn">
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-400 absolute top-2 right-2" />
      </Link>
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