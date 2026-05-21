import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Shell } from '../services/shell';

interface TerminalProps {
  id: string;
  title: string;
  onData?: (data: string) => void;
}

const TerminalComponent = ({ title }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const shellRef = useRef<Shell | null>(null);
  const inputBuffer = useRef<string>('');

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

    shellRef.current = new Shell((data) => term.write(data));

    term.writeln(`\x1b[1;32mMenazeah ${title} Terminal\x1b[0m`);
    term.write('\r\n$ ');

    term.onData((data) => {
      if (data === '\r') {
        const cmd = inputBuffer.current;
        inputBuffer.current = '';
        shellRef.current?.execute(cmd);
      } else if (data === '\x7f') { // Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        inputBuffer.current += data;
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
  }, [title]);

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

