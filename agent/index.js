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

io.on('connection', (socket) => {
  console.log('Menazeah UI connected - Establishing PTY Tunnel');

  const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash');
  let ptyProcess;

  const spawnOptions = {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  };

  try {
    console.log(`Attempting to spawn shell: ${shell} with login flag`);
    ptyProcess = pty.spawn(shell, os.platform() === 'win32' ? [] : ['-l'], spawnOptions);
  } catch (err) {
    console.error(`Failed to spawn ${shell} with -l: ${err.message}`);
    try {
      console.log(`Attempting to spawn shell: ${shell} without flags`);
      ptyProcess = pty.spawn(shell, [], spawnOptions);
    } catch (err2) {
      console.error(`Failed to spawn ${shell}: ${err2.message}`);
      console.log(`Attempting to spawn fallback shell: /bin/sh`);
      ptyProcess = pty.spawn('/bin/sh', [], spawnOptions);
    }
  }

  // Pipe PTY output to Web UI
  ptyProcess.on('data', (data) => {
    socket.emit('pty_data', data);
  });

  // Pipe Web UI input to PTY
  socket.on('pty_input', (data) => {
    if (ptyProcess) ptyProcess.write(data);
  });

  // Handle terminal resizing
  socket.on('pty_resize', ({ cols, rows }) => {
    if (ptyProcess) ptyProcess.resize(cols, rows);
  });

  socket.on('disconnect', () => {
    console.log('Menazeah UI disconnected - Terminating PTY');
    if (ptyProcess) ptyProcess.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Menazeah Local PTY Agent running on http://localhost:${PORT}`);
  console.log(`Default Shell: ${process.env.SHELL || 'not found'}`);
});
