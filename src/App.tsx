import Plant from './components/Plant';
import { useMemo } from 'react';
import socket from './socket';
import { getWateringDevicesFromConfig } from './helpers/config';
import { useFetchConfig } from './hooks/useFetchConfig';
import { useSocket } from './hooks/useSocket';

function App() {
  const config = useFetchConfig();
  const cnnected = useSocket(socket);
  const devices = useMemo(() => {
    return config && getWateringDevicesFromConfig(config);
  }, [config]);

  return (
    <div className="App">
      {!config && <div className="error">Loading config...</div>}
      {!cnnected && <div className="error">Connecting web socket</div>}
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
