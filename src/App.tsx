import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Devices from './pages/Devices';
import Schedule from './pages/Schedule';

import { useMemo, useState } from 'react';
import socket from './socket';
import { getWateringDevicesFromConfig } from './helpers/config';
import { useFetchConfig } from './hooks/useFetchConfig';
import { useSocket } from './hooks/useSocket';
import EditOutput from './pages/EditOutput';
import EditDevice from './pages/EditDevice';
import Preferences from './pages/Preferences';
import { IncomingOptions, Provider } from 'use-http';
import useLocalStorage from '@rehooks/local-storage';

export default function App() {
  const [pageTitle, setPageTitle] = useState('SAWC');
  const [config, setConfig, configError] = useFetchConfig();
  const [cnnected, error] = useSocket(socket);
  const devices = useMemo(() => config ? getWateringDevicesFromConfig(config) : [], [config]);
  const [token] = useLocalStorage('token');
  const options = {
    interceptors: {
      request: ({ options }) => {
        options.headers = [
          ['Authorization', `Bearer ${token}`],
          ['Content-Type', 'application/json'],
          ['Accept', 'application/json'],
        ];
        return options;
      },
    },
  } as IncomingOptions;

  socket && socket.on("message", (newMessage: ConfigMessage) => {
    if (newMessage.status === "configFileEdited") {
      setConfig(newMessage.config);
    }
  });

  return (
    <BrowserRouter>
      <div className="min-h-full">
        <Provider url={`http://${window.location.hostname}:3001`} options={options}>
          <Navigation />
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="text-3xl font-bold tracking-tight text-gray-900 flex">
                <span id="backBtn" className="flex-none"></span><span className="flex-1">{pageTitle}</span><span id="afterTitle"></span>
              </div>
            </div>
          </header>
          <main>
            {!config && !configError && <div className="error">Loading config...</div>}
            {!cnnected && !error && <div className="modal"><div className="error relative rounded-lg bg-blue-100 text-blue-500 text-sm p-4 pr-10 shadow-lg">Connecting to the device controller...</div></div>}
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Devices devices={devices} setTitle={setPageTitle} />} />
                <Route path="/schedule" element={<Schedule devices={devices} setTitle={setPageTitle} config={config} />} />
                <Route path="/output/edit/:device" element={<EditDevice config={config} setConfig={setConfig} />} />
                <Route path="/output/edit/:device/:outputId" element={<EditOutput setTitle={setPageTitle} config={config} setConfig={setConfig} />} />
                <Route path="/preferences" element={<Preferences config={config} setTitle={setPageTitle} />} />
              </Routes>
            </div>
          </main>
        </Provider>
      </div>
    </BrowserRouter>
  );
}