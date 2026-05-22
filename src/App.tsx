import { useState } from 'react';
import TerminalComponent from './components/Terminal';
import DocsPanel from './components/DocsPanel';
import './App.css';

function App() {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <header className="App-header" style={{ background: '#111', padding: '10px 20px', color: '#fff', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Menazeah (מנצח)</h1>
          <a
            href="https://github.com/somaos-nc/Menazeah"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ccc',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ccc';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
        <button 
          onClick={() => setIsDocsOpen(prev => !prev)}
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.filter = 'none';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
        >
          {isDocsOpen ? 'Hide Docs' : 'Show Docs'}
        </button>
      </header>
      <main style={{ flex: 1, display: 'flex', padding: '10px', overflow: 'hidden', transition: 'margin-inline-end 0.4s cubic-bezier(0.16, 1, 0.3, 1)', marginInlineEnd: isDocsOpen ? '380px' : '0' }}>
        <TerminalComponent id="left-terminal" title="Conductor Orchestration" />
        <TerminalComponent id="right-terminal" title="Gemini CLI Workspace" />
      </main>
      <DocsPanel isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <footer style={{ background: '#111', padding: '5px', color: '#666', fontSize: '12px', textAlign: 'center' }}>
        WTTITRTL: Write tests, Test, Implement, Test, Refactor, Test, Loop
      </footer>
    </div>
  );
}

export default App;
