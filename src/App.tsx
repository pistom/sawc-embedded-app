import Plant from './components/Plant';
import { useEffect, useMemo, useState } from 'react';
import { socket } from './socket';
import { getWateringDevicesFromConfig, fetchConfig } from './helpers/config';

function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [wsIsConnected, setWsIsConnected] = useState(socket.connected);

  useEffect(() => {
    async function fetchConfigData() {
      setConfig(await fetchConfig());
    }
    fetchConfigData();
  }, []);

  const devices = useMemo(() => {
    return config && getWateringDevicesFromConfig(config);
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
      {!config && <div className="error">Loading config...</div>}
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
