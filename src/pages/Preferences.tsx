import { writeStorage } from "@rehooks/local-storage";
import { useEffect, useState } from "react";
import { useFetch } from "use-http";
import socket from "../socket";
import { createPortal } from "react-dom";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

interface PreferencesProps {
  setTitle: (title: string) => void;
  config: Config | null;
}
interface ServiceHealth {
  status: string;
  memory: number;
  lastHeartbeat?: Date;
}

export default function Preferences({ config, setTitle }: PreferencesProps) {
  const [token, setToken] = useState<string>('');
  const { post, get, response } = useFetch()
  const [worker, setWorker] = useState<ServiceHealth>({ status: 'waiting...', memory: 0 });
  const [wateringLogs, setWateringLogs] = useState<string>('');

  useEffect(() => {
    socket && socket.on("message", (message) => {
      if (message.action === 'heartbeat') {
        if (message.process === 'worker') {
          const newWorker = { ...worker };
          newWorker.status = 'online';
          newWorker.memory = message.memory;
          newWorker.lastHeartbeat = new Date();
          setWorker(newWorker);
        }
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (worker) {
        const newWorker = { ...worker };
        newWorker.status = 'offline';
        setWorker(newWorker);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [worker]);

  useEffect(() => {
    setTitle('Preferences');
  }, [setTitle]);

  useEffect(() => {
    get('/logs/watering').then((logs) => {
      setWateringLogs(logs);
    });
  }, [get])

  const handleChangeToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(() => event.target.value);
  }

  const handleSaveToken = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    writeStorage('token', token);
    window.location.href = '/';
  }

  const handleSetNewToken = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const data = await post('/token', { token });
    if (response.ok) {
      writeStorage('token', data.token);
      alert('Password changed');
    }
  }

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    writeStorage('token', '');
    window.location.href = '/preferences';
  }

  return (<div className="px-4 sm:px-0">
    <form className="form">
      {config && config.preferences.token && <>{createPortal(
        <div className="text-right">
          <button className="btn btn-rounded" onClick={handleLogout}><ArrowLeftOnRectangleIcon className="h-5 w-5" /></button>
        </div>, document.getElementById('afterTitle') as HTMLElement)}
      </>}
      {!config ?
        <label htmlFor="token">Password</label> :
        <label htmlFor="token">New password</label>
      }
      <input type="password" name="token" value={token} onChange={handleChangeToken} />
      {!config ?
        <button className="btn btn-primary ml-2" onClick={handleSaveToken}>Connect</button> : <>
          <button className="btn btn-primary ml-2" onClick={handleSetNewToken}>Set</button>
        </>
      }

    </form>
    {config && worker && <div className="mt-4">
      <h1 className="text-2xl mt-8 pt-4 border-t">Services status</h1>
      <h2>Worker</h2>
      <p>Status: <span className={`font-bold text-${worker.status === 'online' ? 'green' : worker.status === 'offline' ? 'red' : 'slate'}-500`}>{worker.status}</span></p>
      <p>Memory: {worker.memory}</p>
      <p>Last heartbeat: {worker.lastHeartbeat ? worker.lastHeartbeat.toLocaleString() : 'waiting...'}</p>
    </div>}

    {config && <div className="mt-4">
      <h1 className="text-2xl mt-8 pt-4 border-t">Logs</h1> 
      <h2>Watering</h2>
      <pre className="text-xs bg-gray-100 shadow-inner overflow-auto h-[50vh] border p-2 rounded">{wateringLogs}</pre>
    </div>}
  </div>);
}