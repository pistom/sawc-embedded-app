import { useEffect, useState } from 'react';
import socket from '../socket.js';
import Toggle from '../components/form/Toggle.js';

interface EditDeviceOutputProps {
  outputId: string;
  output: OutputConfig;
  device: string;
  setConfig: (config: Config) => void;
}
const EditDeviceOutput = ({ outputId, output, device, setConfig }: EditDeviceOutputProps) => {

  const [pin, setPin] = useState<number>(output.pin || 0);
  const [disabled, setDisabled] = useState<boolean>(output.disabled || false);
  const [sync, setSync] = useState<boolean>(output.sync || false);
  const [edited, setEdited] = useState<boolean>(false);

  useEffect(() => {
    socket && socket.on("message", (newMessage: ConfigMessage) => {
      if (newMessage.status === "configOutputEdited") {
        setConfig(newMessage.config);
        if (newMessage.device === device && newMessage.output === outputId) {
          setEdited(true);
          setTimeout(() => {
            setEdited(false);
          }, 1000);
        }
      }
    });
  }, [device, outputId, setConfig]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '' || parseInt(e.target.value) < 0) {
      setPin(0);
    } else {
      setPin(parseInt(e.target.value));
    }
  };

  const handlePinBlur = () => {
    socket && socket.emit("message", { action: "editDeviceOutput", device, output: outputId, pin });
  }

  const handleDisableCheck = () => {
    setDisabled(!disabled);
    socket && socket.emit("message", { action: "editDeviceOutput", device, output: outputId, disabled: !disabled, sync });
  };
  const handleSyncCheck = () => {
    if (sync && !confirm('This action will completely remove all synchronised plants from this output. Are you sure you want to continue?')) {
      return;
    }
    setSync(!sync);
    socket && socket.emit("message", { action: "editOutput", device, output: outputId, sync: !sync });
  };

  return (
    <div key={outputId} className={`flex items-center p-2 mb-2 transition duration-3000 row ${edited ? 'saved' : ''}`}>
      <form className="form flex items-center">
        <div className="flex-none w-20 font-bold">{outputId}</div>
        <div className="flex-1 w-1/3 pr-4">
          <input
            className="w-full sm:w-20"
            type="number"
            placeholder="Pin"
            value={pin}
            onChange={handlePinChange}
            onBlur={handlePinBlur}
          />
        </div>
        <div className="flex-none w-[100px] flex text-center">
          <div className="flex-1">
            <Toggle checked={!disabled} onChange={handleDisableCheck} />
          </div>
          <div className="flex-1">
            <Toggle disabled={disabled} checked={sync} onChange={handleSyncCheck} />
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditDeviceOutput;