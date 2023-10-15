import Plant from './components/Plant';
import { useEffect, useState } from 'react';
import { socket } from './socket';
import getWateringDevicesFromConfig from './helpers/config';

function App() {
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [config, setConfig] = useState<Config>({ devices: {} });
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(1);
  const [wsIsConnected, setWsIsConnected] = useState(socket.connected);

  useEffect(() => {
    const fetchConfig = () => {
      fetch(`http://${window.location.hostname}:3001/config`)
        .then((response) => response.json())
        .then((data) => {
          setConfig(data.config);
          setFetchError(null);
        })
        .catch(error => {
          let message = `${error.message} (The server may be down. Retrying in ${retryDelay} seconds)`;
          if (retryCount < 5) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
              setRetryDelay(Math.round(retryDelay * 1.5));
            }, retryDelay * 1000);
          } else {
            message = `${error.message} (The server may be down)`;
          }
          setFetchError({ ...error, message });
        });
    };

    fetchConfig();
  }, [retryCount, retryDelay]);

  useEffect(() => {
    setDevices(getWateringDevicesFromConfig(config));
  }, [config]);

  useEffect(() => {
    socket.on('connect', () => setWsIsConnected(true));
    socket.on('disconnect', () => setWsIsConnected(false));
    return () => {
      socket.off('connect', () => setWsIsConnected(true));
      socket.off('disconnect', () => setWsIsConnected(false));
    };
  }, []);

  return (
    <div className="App">
      {fetchError && <div className="error">Error fetching config: {fetchError.message}</div>}
      {!wsIsConnected && <div className="error">Web Socket client is not connected</div>}
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
                <Plant device={device.id} key={`plant_${device.id}_${output.id}`} output={output.id} />
              ))}
            </div>
          </div>))
        }
      </div>
    </div>
  );
}

export default App
