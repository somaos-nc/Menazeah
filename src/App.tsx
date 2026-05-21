import TerminalComponent from './components/Terminal';
import './App.css';

function App() {
  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <header className="App-header" style={{ background: '#111', padding: '10px', color: '#fff', borderBottom: '1px solid #333' }}>
        <h1>Menazeah (מנצח)</h1>
      </header>
      <main style={{ flex: 1, display: 'flex', padding: '10px', overflow: 'hidden' }}>
        <TerminalComponent id="left-terminal" title="Conductor Orchestration" />
        <TerminalComponent id="right-terminal" title="Gemini CLI Workspace" />
      </main>
      <footer style={{ background: '#111', padding: '5px', color: '#666', fontSize: '12px', textAlign: 'center' }}>
        WTTITRTL: Write tests, Test, Implement, Test, Refactor, Test, Loop
      </footer>
    </div>
  );
}

export default App;
