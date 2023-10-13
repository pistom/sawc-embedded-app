import Plant from './components/plant';
import { useEffect, useState } from 'react';
import io, { Socket } from "socket.io-client";
import getWateringDevicesFromConfig from './helpers/config';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [config, setConfig] = useState<Config>({ devices: {} });
  const [devices, setDevices] = useState<DeviceConfig[]>([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/config`)
      .then((response) => response.json())
      .then((data) => {
        setConfig(data.config);
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    setDevices(getWateringDevicesFromConfig(config));
  }, [config]);

  useEffect(() => {
    const newSocket = io(`${window.location.hostname}:3001`, {
      transports: ["websocket"],
    });
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 data-testid="app-logo">
          Smart Automatic Watering Controller
        </h1>
      </header>
      <div>
        {devices && devices.map((device: DeviceConfig) => (
          <div className="module" key={device.id}>
            <h2>{device.name}</h2>
            <div className="devices">
              {device.outputs.map((output: OutputConfig) => (
                <Plant socket={socket} device={device.id} key={`plant_${device.id}_${output.id}`} output={output.id} />
              ))}
            </div>
          </div>))
        }
      </div>
    </div>
  );
}

export default App
