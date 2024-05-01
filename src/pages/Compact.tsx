import { useContext, useEffect } from 'react';
import Device from '../components/Device';
import { useDisplayErrors } from '../hooks/useDisplayErrors';
import { AppParamsContext } from '../context/AppParamsContext';
import { NavLink } from 'react-router-dom';

function CompactView({ devices }: { devices: DeviceConfig[] }) {
  const appParams = useContext(AppParamsContext);
  useEffect(() => {
    appParams.setPageTitle('');
  }, [appParams]);

  const displayErrors = useDisplayErrors();
  return (
    <div className="p-4">
      {devices?.map((device: DeviceConfig) => (
        <Device key={device.id} device={device} displayErrors={displayErrors} compact={true} />))
      }
      <NavLink to="/">Back</NavLink>
    </div>
  );
}

export default CompactView