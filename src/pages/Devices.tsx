import { useContext, useEffect } from 'react';
import Device from '../components/Device';
import { useDisplayErrors } from '../hooks/useDisplayErrors';
import { AppParamsContext } from '../context/AppParamsContext';
import { Outlet, useLocation } from 'react-router-dom';

function Devices({ devices }: { devices: DeviceConfig[] }) {
  const appParams = useContext(AppParamsContext);
  useEffect(() => {
    appParams.setPageTitle('Devices');
  }, [appParams]);

  const location = useLocation();
  const isMainRoute = location.pathname === '/';

  const displayErrors = useDisplayErrors();

  return (
    <>
      {isMainRoute ? devices?.map((device: DeviceConfig) => (
        <Device key={device.id} device={device} displayErrors={displayErrors} />)) :
        <Outlet />
      }
    </>
  );
}

export default Devices