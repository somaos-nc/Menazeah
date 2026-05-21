import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  title: string;
  onData?: (data: string) => void;
}

const TerminalComponent: React.FC<TerminalProps> = ({ id, title, onData }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln(`\x1b[1;32mMenazeah ${title} Terminal\x1b[0m`);
    term.write('\r\n$ ');

    term.onData((data) => {
      if (onData) onData(data);
      // Basic echo for now
      if (data === '\r') {
        term.write('\r\n$ ');
      } else {
        term.write(data);
      }
    });

    xtermRef.current = term;

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [title, onData]);

  return (
    <div className="terminal-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '5px' }}>
      <div className="terminal-header" style={{ background: '#333', color: '#fff', padding: '5px', fontSize: '12px' }}>
        {title}
      </div>
      <div ref={terminalRef} style={{ flex: 1 }} />
    </div>
  );
};

export default TerminalComponent;
