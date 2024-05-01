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
import PageTitle from './components/PageTitle';
import CompactView from './pages/Compact';

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
          <PageTitle title={pageTitle} />
          <main>
            {!config && !configError && <div className="error">Loading config...</div>}
            {!cnnected && !error && <div className="modal"><div className="error relative rounded-lg bg-blue-100 text-blue-500 text-sm p-4 pr-10 shadow-lg">Connecting to the device controller...</div></div>}
            <ErrorBoundary FallbackComponent={Error}>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8"><Outlet /></div>} >
                    <Route path="" element={<Devices devices={devices} />} />
                    <Route path="schedule" element={<ScheduleLazy devices={devices} config={config} />} />
                    <Route path="output" element={<Outlet />}>
                      <Route path="edit/:device" element={<EditDevice config={config} setConfig={setConfig} />} />
                      <Route path="edit/:device/:outputId" element={<EditOutput config={config} setConfig={setConfig} />} />
                    </Route>
                    <Route path="/preferences" element={<PreferencesLazy config={config} />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="compact" element={<CompactView devices={devices} />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
        </ApiProvider>
      </div>
    </BrowserRouter>
  );
}