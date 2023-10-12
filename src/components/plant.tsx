import { useEffect, useState } from "react";
import { Socket,  } from "socket.io-client";

export default function Plant({ output, socket, device }: { output: number, socket: Socket|null, device: string }) {

  const [isOn, setIsOn] = useState<boolean>(false);

  useEffect(() => {
    socket && socket.on("message", (newMessage) => {
      if (newMessage.device === device && newMessage.output === output) {
        setIsOn(false);
      }
    });
  }, [device, output, socket]);

  const handleMessageSubmit = (output: number, duration: number) => {
    if (!isOn) {
      setIsOn(true);
      socket && socket.emit("message", { action: 'startWater', device, output, duration });
    } else {
      setIsOn(false);
      socket && socket.emit("message", { action: 'stopWater', device, output });
    }
  };

  return (
    <div>
      Plant {output} <input
        type="checkbox"
        role="switch"
        id={`plant_${device}_${output}`}
        checked={isOn}
        onChange={() => handleMessageSubmit(output, 5)} />
      <label
        htmlFor={`plant_${device}_${output}`}
      >{isOn ? "On" : "Off"}</label>
    </div>
  )
}