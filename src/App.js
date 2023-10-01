import { useEffect, useState } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    document.title = "Smart Automatic Watering Controller"; // set the page title
  }, []);

  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    fetch(`http://localhost:3001/output/17/${isOn ? 'off' : 'on'}`) 
      .then(() => setIsOn(!isOn))
      .catch(error => console.error(error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 data-testid="app-logo">
          Smart Automatic Watering Controller
        </h1>
        <img src="/logo.svg" alt="Logo" className='App-logo' />
        <br />
        <button onClick={handleClick}>
          {isOn ? 'Turn Off' : 'Turn On'} 17
        </button>
      </header>
    </div>
  );
}

export default App;
