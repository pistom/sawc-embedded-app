'use client'

import Plant from '@/components/plant';
import { useEffect, useState } from 'react';

export default function Home() {
  useEffect(() => {
    document.title = "Smart Automatic Watering Controller"; // set the page title
  }, []);


  const handleGpioClick = (state: boolean) => {
    fetch(`http://${process.env.controllerIP}:3001/gpio/10/${state ? 'on' : 'off'}`)
      .then(() => console.log('GPIO17 triggered'))
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
          <Plant key={`plant_${plant}`} plant={plant} />
        ))}
        <button onClick={() => handleGpioClick(true)}>GPIO10 on</button><br />
        <button onClick={() => handleGpioClick(false)}>GPIO10 off</button>
      </div>
    </div>
  );
}
