'use client'

import Plant from '@/components/plant';
import { useEffect, useState } from 'react';
import io from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(`${process.env.controllerIP}:3001`, {
      transports: ["websocket"],
    });
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });
    setSocket(newSocket);
  }, []);

  const handleGpioClick = (state: boolean) => {
    fetch(`http://${process.env.controllerIP}:3001/gpio/10/${state ? 'on' : 'off'}`)
      .then(() => console.log('GPIO10 triggered'))
      .catch(error => console.error(error));
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 data-testid="app-logo">
          <img src="/logo.svg" alt="Logo" className='App-logo' />
          Smart Automatic Watering Controller
        </h1>
      </header>
      <div>
        {[1, 2, 3, 4].map((plant) => (
          <Plant socket={socket} device={plant <= 2 ? 'MODULE_01' : 'MODULE_02'} key={`plant_${plant}`} plant={plant} />
        ))}
        <button onClick={() => handleGpioClick(true)}>GPIO10 on</button><br />
        <button onClick={() => handleGpioClick(false)}>GPIO10 off</button>
      </div>
    </div>
  );
}
