import { writeStorage } from "@rehooks/local-storage";
import { useContext, useEffect, useState } from "react";
import { useFetch } from "use-http";
import socket from "../socket";
import { createPortal } from "react-dom";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { AppParamsContext } from "../context/AppParamsContext";

interface PreferencesProps {
  config: Config | null;
}
interface ServiceHealth {
  status: string;
  memory: number;
  lastHeartbeat?: Date;
  onlineApiStatus?: string;
}

export default function Preferences({ config }: PreferencesProps) {
  const [token, setToken] = useState<string>('');
  const { post, get, response } = useFetch()
  const [worker, setWorker] = useState<ServiceHealth>({ status: 'waiting...', memory: 0 });
  const [workerOnline, setWorkerOnline] = useState<ServiceHealth>({ status: 'waiting...', memory: 0 });
  const [wateringLogs, setWateringLogs] = useState<string>('');
  const [controllerWorkingSince, setControllerWorkingSince] = useState<Date | undefined>();
  const [controllerMemoryUsage, setControllerMemoryUsage] = useState<number | undefined>();

  useEffect(() => {
    socket && socket.emit("message", { action: 'getAppStatus' });
    socket && socket.on("message", (message) => {
      if (message.action === 'heartbeat') {
        if (message.process === 'worker') {
          const newWorker = { ...worker };
          newWorker.status = 'online';
          newWorker.memory = message.memory;
          newWorker.lastHeartbeat = new Date();
          setWorker(newWorker);
        }
        if (message.process === 'workeronline') {
          const newWorkerOnline = { ...workerOnline };
          newWorkerOnline.status = 'online';
          newWorkerOnline.memory = message.memory;
          newWorkerOnline.lastHeartbeat = new Date();
          newWorkerOnline.onlineApiStatus = message.onlineApiStatus;
          setWorkerOnline(newWorkerOnline);
        }
      } else if (message.status === 'appStatus') {
        setWorker({...worker, lastHeartbeat: new Date(message.worker?.lastHeartbeat)});
        setWorkerOnline({...workerOnline, lastHeartbeat: new Date(message.workerOnline?.lastHeartbeat)});
        setControllerWorkingSince(new Date(message.controller?.workingSince));
        setControllerMemoryUsage(message.controller?.memoryUsage)
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
    const interval = setInterval(() => {
      if (workerOnline) {
        const newWorkerOnline = { ...workerOnline };
        newWorkerOnline.status = 'offline';
        setWorkerOnline(newWorkerOnline);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [workerOnline]);

  const appParams = useContext(AppParamsContext);
  useEffect(() => {
    appParams.setPageTitle('Preferences');
  }, [appParams]);

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
      window.location.href = '/';
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
          <button className="btn btn-rounded flex" title="Logout" onClick={handleLogout}><ArrowLeftEndOnRectangleIcon className="h-5 w-5" /> Logout</button>
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

    <h1 className="text-2xl mt-8 pt-4 border-t">Services</h1>
    <div className="statuses flex flex-col md:flex-row gap-4">
      {config && <div className="flex-1">
        <h2>Controller</h2>
        <p>Status: {socket.connected ? <span className="font-bold text-green-500">online</span> : <span className="font-bold text-red-500">offline</span>}</p>
        <p>Memory: {controllerMemoryUsage}</p>
        <p>Has been working since: {controllerWorkingSince?.toLocaleString()}</p>
      </div>}
      {config && worker && <div className="flex-1">
        <h2>Schedule worker</h2>
        <p>Status: <span className={`font-bold text-${worker.status === 'online' ? 'green' : worker.status === 'offline' ? 'red' : 'slate'}-500`}>{worker.status}</span></p>
        <p>Memory: {worker.memory}</p>
        <p>Last heartbeat: {worker.lastHeartbeat ? worker.lastHeartbeat.toLocaleString() : 'waiting...'}</p>
      </div>}
      {config && workerOnline && <div className="flex-1">
        <h2>Online API worker</h2>
        <p>Status: <span className={`font-bold text-${workerOnline.status === 'online' ? 'green' : workerOnline.status === 'offline' ? 'red' : 'slate'}-500`}>{workerOnline.status}</span></p>
        <p>Memory: {workerOnline.memory}</p>
        <p>Last heartbeat: {workerOnline.lastHeartbeat ? workerOnline.lastHeartbeat.toLocaleString() : 'waiting...'}</p>
        <p>Api status: <span className={workerOnline.onlineApiStatus !== 'online' ? 'text-red-500' : ''}>{workerOnline.status === 'online' ? workerOnline.onlineApiStatus || 'waiting...' : 'unknown'}</span></p>
      </div>}
    </div>

    {config && <div className="mt-4">
      <h1 className="text-2xl mt-8 pt-4 border-t">Logs</h1> 
      <h2>Watering</h2>
      <pre className="text-xs bg-gray-100 shadow-inner overflow-auto h-[50vh] border p-2 rounded">{wateringLogs}</pre>
    </div>}
  </div>);
}