import { useEffect } from 'react';
import Device from '../components/Device';

function Devices({devices, setTitle}: {devices: DeviceConfig[], setTitle: (title: string) => void}) {
  useEffect(() => {
    setTitle('My plants');
  },[setTitle]);

  return (
    <>
      {
        devices && devices.map((device: DeviceConfig) => (
          <Device key={device.id} device={device} />))
      }
    </>
  );
}

export default Devices


