import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Devices from './pages/Devices';
import Schedule from './pages/Schedule';

import { useMemo, useState } from 'react';
import socket from './socket';
import { getWateringDevicesFromConfig } from './helpers/config';
import { useFetchConfig } from './hooks/useFetchConfig';
import { useSocket } from './hooks/useSocket';
import Output from './pages/Output';

export default function App() {
  const [pageTitle, setPageTitle] = useState('SAWC');
  const [config, setConfig] = useFetchConfig();
  const cnnected = useSocket(socket);
  const devices = useMemo(() => {
    return config ? getWateringDevicesFromConfig(config) : [];
  }, [config]);

  return (
    <BrowserRouter>
      <div className="min-h-full">
        <Navigation />
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              <span id="backBtn"></span>{pageTitle}
            </h1>
          </div>
        </header>
        <main>
          {!config && <div className="error">Loading config...</div>}
          {!cnnected && <div className="error">Connecting web socket</div>}
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Devices devices={devices} setTitle={setPageTitle} />} />
              <Route path="/schedule" element={<Schedule setTitle={setPageTitle} />} />
              <Route path="/output/edit/:device/:outputId" element={<Output setTitle={setPageTitle} config={config} setConfig={setConfig} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}