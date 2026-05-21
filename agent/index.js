const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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
let currentDir = process.cwd();

io.on('connection', (socket) => {
  console.log('Menazeah UI connected');

  socket.on('ls', async (dir) => {
    try {
      const target = dir ? path.resolve(currentDir, dir) : currentDir;
      const files = await fs.readdir(target);
      socket.emit('ls_res', { success: true, files });
    } catch (err) {
      socket.emit('ls_res', { success: false, error: err.message });
    }
  });

  socket.on('pwd', () => {
    socket.emit('pwd_res', { success: true, dir: currentDir });
  });

  socket.on('cd', async (dir) => {
    try {
      const newDir = path.resolve(currentDir, dir);
      const stat = await fs.stat(newDir);
      if (stat.isDirectory()) {
        currentDir = newDir;
        socket.emit('cd_res', { success: true, dir: currentDir });
      } else {
        throw new Error('Not a directory');
      }
    } catch (err) {
      socket.emit('cd_res', { success: false, error: err.message });
    }
  });

  socket.on('mkdir', async (dir) => {
    try {
      await fs.mkdir(path.resolve(currentDir, dir), { recursive: true });
      socket.emit('mkdir_res', { success: true });
    } catch (err) {
      socket.emit('mkdir_res', { success: false, error: err.message });
    }
  });

  socket.on('writeFile', async ({ file, content }) => {
    try {
      await fs.writeFile(path.resolve(currentDir, file), content);
      socket.emit('writeFile_res', { success: true });
    } catch (err) {
      socket.emit('writeFile_res', { success: false, error: err.message });
    }
  });

  socket.on('readFile', async (file) => {
    try {
      const content = await fs.readFile(path.resolve(currentDir, file), 'utf8');
      socket.emit('readFile_res', { success: true, content });
    } catch (err) {
      socket.emit('readFile_res', { success: false, error: err.message });
    }
  });

  socket.on('exec', async (command) => {
    try {
      const { stdout, stderr } = await execPromise(command, { cwd: currentDir });
      socket.emit('exec_res', { success: true, stdout, stderr });
    } catch (err) {
      socket.emit('exec_res', { success: false, error: err.message, stderr: err.stderr });
    }
  });

  socket.on('disconnect', () => {
    console.log('Menazeah UI disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Menazeah Local Agent running on http://localhost:${PORT}`);
  console.log(`Current Working Directory: ${currentDir}`);
});
