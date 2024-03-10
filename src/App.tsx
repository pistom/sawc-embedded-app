import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import Devices from './pages/Devices';

import { Suspense, lazy, useContext, useMemo } from 'react';
import socket from './socket';
import { getWateringDevicesFromConfig } from './helpers/config';
import { useFetchConfig } from './hooks/useFetchConfig';
import { useSocket } from './hooks/useSocket';
import EditOutput from './pages/EditOutput';
import EditDevice from './pages/EditDevice';
import { Provider as ApiProvider } from 'use-http';
import useLocalStorage from '@rehooks/local-storage';
import UserMessage from './components/UserMessage';
import { AppParamsContext } from './context/AppParamsContext';
import apiOptions from './helpers/apiOptions';
import Error from './components/Error';
import { ErrorBoundary } from 'react-error-boundary';
import NotFound from './pages/NotFound';

export default function App() {
  const [config, setConfig, configError] = useFetchConfig();
  const [cnnected, error] = useSocket(socket);
  const devices = useMemo(() => config ? getWateringDevicesFromConfig(config) : [], [config]);
  const [token] = useLocalStorage('token', '');
  const pageTitle = useContext(AppParamsContext).pageTitle;

  const ScheduleLazy = lazy(() => import('./pages/Schedule'));
  const PreferencesLazy = lazy(() => import('./pages/Preferences'));

  socket && socket.on("message", (newMessage: ConfigMessage) => {
    if (newMessage.status === "configFileEdited") {
      setConfig(newMessage.config);
    }
  });

  return (
    <BrowserRouter>
      <div className="min-h-full">
        <ApiProvider url={`http://${window.location.hostname}:3001`} options={apiOptions(token)}>
          <Navigation />
          <UserMessage />
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
              <ErrorBoundary FallbackComponent={Error}>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Devices devices={devices} />} >
                      <Route path="schedule" element={<ScheduleLazy devices={devices} config={config} />} />
                      <Route path="output" element={<Outlet />}>
                        <Route path="edit/:device" element={<EditDevice config={config} setConfig={setConfig} />} />
                        <Route path="edit/:device/:outputId" element={<EditOutput config={config} setConfig={setConfig} />} />
                      </Route>
                      <Route path="/preferences" element={<PreferencesLazy config={config} />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </ApiProvider>
      </div>
    </BrowserRouter>
  );
}