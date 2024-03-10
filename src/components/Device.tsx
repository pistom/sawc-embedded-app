import { useEffect, useState } from "react";
import Plant from "./Plant";
import socket from "../socket";
import { Link } from "react-router-dom";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";

type PlantMessagesType = {
  [key: string]: Message;
}

interface DeviceProps {
  device: DeviceConfig;
  displayErrors: (plantMessage: Message) => void;
}

export default function Device({ device, displayErrors }: DeviceProps) {
  const [plantMessages, setPlantMessages] = useState<PlantMessagesType>({});
  const [remainingTimes, setRemainingTimes] = useState<RemainingTimesMessage>();

  useEffect(() => {
    socket && socket.emit("message", { action: "getRemainingTimes", device: device.id });
  }, [device.id, device.name]);

  useEffect(() => {
    socket && socket.on("message", function (newMessage: Message) {
      if (newMessage.status === "remainingTimes" && newMessage.device === device.id) {
        setRemainingTimes(newMessage as RemainingTimesMessage);
      } else {
        if (newMessage.device === device.id && newMessage.output) {
          setPlantMessages((prev) => ({ ...prev, [newMessage.output]: newMessage }));
        }
      }
    });
    
    return () => {socket.off("message")};
  }, [device.id]);

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
            plantMessage={plantMessages[output.id]}
            remainingTime={remainingTimes?.remainingTimes[output.id]}
            displayErrors={displayErrors}
            key={`plant_${device.id}_${output.id}`}
          />
        ))}
      </div>
    </div>
  )
}