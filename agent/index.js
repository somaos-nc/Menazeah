const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pty = require('node-pty');
const os = require('os');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 9001;
const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');

io.on('connection', (socket) => {
  console.log('Menazeah UI connected - Establishing PTY Tunnel');

  // Spawn a real pseudoterminal as a login shell
  const ptyProcess = pty.spawn(shell, os.platform() === 'win32' ? [] : ['-l'], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });

  // Pipe PTY output to Web UI
  ptyProcess.on('data', (data) => {
    socket.emit('pty_data', data);
  });

  // Pipe Web UI input to PTY
  socket.on('pty_input', (data) => {
    ptyProcess.write(data);
  });

  // Handle terminal resizing
  socket.on('pty_resize', ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('Menazeah UI disconnected - Terminating PTY');
    ptyProcess.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Menazeah Local PTY Agent running on http://localhost:${PORT}`);
  console.log(`Tunneling shell: ${shell}`);
});
