import { useContext, useEffect } from 'react';
import Device from '../components/Device';
import { useDisplayErrors } from '../hooks/useDisplayErrors';
import { AppParamsContext } from '../context/AppParamsContext';

function Devices({devices}: {devices: DeviceConfig[]}) {
  const appParams = useContext(AppParamsContext);
  useEffect(() => {
    appParams.setPageTitle('Devices');
  }, [appParams]);

  const displayErrors = useDisplayErrors();

  return (
    <>
      {
        devices && devices.map((device: DeviceConfig) => (
          <Device key={device.id} device={device} displayErrors={displayErrors} />))
      }
    </>
  );
}

export default Devices