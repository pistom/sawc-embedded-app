import { useEffect } from 'react';
import './App.css';


function App() {
  useEffect(() => {
    document.title = "Smart Automatic Watering Controller"; // set the page title
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 data-testid="app-logo">
          Smart Automatic Watering Controller
        </h1>
        <img src="/logo.svg" alt="Logo" className='App-logo' />
      </header>
    </div>
  );
}

export default App;
