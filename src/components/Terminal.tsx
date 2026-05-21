import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Shell } from '../services/shell';
import { io, Socket } from 'socket.io-client';

interface TerminalProps {
  id: string;
  title: string;
}

const TerminalComponent = ({ title, id }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const shellRef = useRef<Shell | null>(null);
  const socketRef = useRef<Socket | null>(null);
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
    xtermRef.current = term;

    // Initialize local PTY tunnel only for the Right Terminal (Workspace)
    if (id === 'right-terminal') {
      const socket = io('http://localhost:9001');
      socketRef.current = socket;

      socket.on('connect', () => {
        term.writeln('\r\n\x1b[1;32mCONNECTED TO LOCAL PTY TUNNEL\x1b[0m');
        socket.emit('pty_resize', { cols: term.cols, rows: term.rows });
      });

      socket.on('pty_data', (data) => {
        term.write(data);
      });

      socket.on('disconnect', () => {
        term.writeln('\r\n\x1b[1;31mDISCONNECTED FROM LOCAL PTY TUNNEL\x1b[0m');
        term.write('\r\n$ ');
      });

      term.onData((data) => {
        if (socket.connected) {
          socket.emit('pty_input', data);
        } else {
          handleVirtualInput(data, term);
        }
      });
    } else {
      // Left terminal remains virtual orchestration
      shellRef.current = new Shell((data) => term.write(data));
      term.writeln(`\x1b[1;32mMenazeah ${title} Terminal\x1b[0m`);
      term.write('\r\n$ ');
      term.onData((data) => handleVirtualInput(data, term));
    }

    function handleVirtualInput(data: string, t: Terminal) {
      if (data === '\r') {
        const cmd = inputBuffer.current;
        inputBuffer.current = '';
        if (shellRef.current) shellRef.current.execute(cmd);
        else t.write('\r\n$ ');
      } else if (data === '\x7f') { // Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          t.write('\b \b');
        }
      } else {
        inputBuffer.current += data;
        t.write(data);
      }
    }

    const handleResize = () => {
      fitAddon.fit();
      if (socketRef.current?.connected) {
        socketRef.current.emit('pty_resize', { cols: term.cols, rows: term.rows });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socketRef.current?.disconnect();
      term.dispose();
    };
  }, [title, id]);

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

