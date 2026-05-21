import { gitService } from './git';
import { settingsService } from './db';
import { GoogleGenerativeAI, ChatSession, type FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { io, Socket } from 'socket.io-client';

const fs = gitService.fs.promises;

const tools: FunctionDeclaration[] = [
  {
    name: "ls",
    description: "List files and directories",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING, description: "Path to list" }
      }
    }
  },
  {
    name: "pwd",
    description: "Get current directory",
    parameters: { type: SchemaType.OBJECT, properties: {} }
  },
  {
    name: "mkdir",
    description: "Create directory",
    parameters: {
      type: SchemaType.OBJECT,
      properties: { dir: { type: SchemaType.STRING } },
      required: ["dir"]
    }
  },
  {
    name: "touch",
    description: "Create empty file",
    parameters: {
      type: SchemaType.OBJECT,
      properties: { file: { type: SchemaType.STRING } },
      required: ["file"]
    }
  },
  {
    name: "readFile",
    description: "Read file content",
    parameters: {
      type: SchemaType.OBJECT,
      properties: { file: { type: SchemaType.STRING } },
      required: ["file"]
    }
  },
  {
    name: "writeFile",
    description: "Write content to file",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        file: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING }
      },
      required: ["file", "content"]
    }
  },
  {
    name: "exec",
    description: "Execute a shell command on the local system (only available in Local Mode)",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        command: { type: SchemaType.STRING, description: "The command to run (e.g. 'npm install', 'python app.py')" }
      },
      required: ["command"]
    }
  }
];

export class Shell {
  private currentDir: string = '/';
  private apiKey: string | null = null;
  private currentModel: string = 'gemini-2.5-flash';
  private onWrite: (data: string) => void;
  private isInteractiveMode: boolean = false;
  private chatSession: ChatSession | null = null;
  private socket: Socket | null = null;
  private isLocalMode: boolean = false;

  constructor(onWrite: (data: string) => void) {
    this.onWrite = onWrite;
    this.init();
    this.connectAgent();
  }

  private connectAgent() {
    this.socket = io('http://localhost:9001');
    this.socket.on('connect', () => {
      this.isLocalMode = true;
      this.onWrite('\r\n\x1b[1;32mConnected to Menazeah Local Agent!\x1b[0m');
      this.onWrite('\r\n\x1b[1;32mSwitched to Local Filesystem Mode.\x1b[0m');
      this.socket?.emit('pwd');
    });

    this.socket.on('pwd_res', (res) => {
      if (res.success) this.currentDir = res.dir;
    });

    this.socket.on('disconnect', () => {
      this.isLocalMode = false;
      this.onWrite('\r\n\x1b[1;31mDisconnected from Menazeah Local Agent.\x1b[0m');
      this.onWrite('\r\n\x1b[1;31mSwitched back to Virtual Filesystem Mode.\x1b[0m');
    });
  }

  private async init() {
    this.apiKey = await settingsService.getGeminiApiKey() || null;
    this.currentModel = await settingsService.getGeminiModel();
    if (!this.apiKey) {
      this.onWrite('\r\n\x1b[1;33mWelcome to Menazeah!\x1b[0m');
      this.onWrite('\r\nTo use the Gemini CLI, please set your API key:');
      this.onWrite('\r\n\x1b[1;32mset-key <your-api-key>\x1b[0m');
    }
  }

  async execute(commandLine: string) {
    if (this.isInteractiveMode) {
      await this.handleInteractiveInput(commandLine);
      return;
    }

    const args = commandLine.trim().split(/\s+/);
    const cmd = args[0];

    if (!cmd) {
      this.onWrite('\r\n$ ');
      return;
    }

    try {
      if (this.isLocalMode) {
        await this.executeLocal(cmd, args);
      } else {
        await this.executeVirtual(cmd, args);
      }
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31merror:\x1b[0m ${err.message}`);
    }

    if (!this.isInteractiveMode) {
      this.onWrite('\r\n$ ');
    }
  }

  private async executeLocal(cmd: string, args: string[]) {
    return new Promise<void>((resolve) => {
      switch (cmd) {
        case 'ls':
          this.socket?.emit('ls', args[1]);
          this.socket?.once('ls_res', (res) => {
            if (res.success) this.onWrite(`\r\n${res.files.join('  ')}`);
            else this.onWrite(`\r\nerror: ${res.error}`);
            resolve();
          });
          break;
        case 'pwd':
          this.onWrite(`\r\n${this.currentDir}`);
          resolve();
          break;
        case 'cd':
          this.socket?.emit('cd', args[1]);
          this.socket?.once('cd_res', (res) => {
            if (res.success) this.currentDir = res.dir;
            else this.onWrite(`\r\nerror: ${res.error}`);
            resolve();
          });
          break;
        case 'mkdir':
          this.socket?.emit('mkdir', args[1]);
          this.socket?.once('mkdir_res', (res) => {
            if (!res.success) this.onWrite(`\r\nerror: ${res.error}`);
            resolve();
          });
          break;
        case 'touch':
          this.socket?.emit('writeFile', { file: args[1], content: '' });
          this.socket?.once('writeFile_res', (res) => {
            if (!res.success) this.onWrite(`\r\nerror: ${res.error}`);
            resolve();
          });
          break;
        case 'cat':
          this.socket?.emit('readFile', args[1]);
          this.socket?.once('readFile_res', (res) => {
            if (res.success) this.onWrite(`\r\n${res.content}`);
            else this.onWrite(`\r\nerror: ${res.error}`);
            resolve();
          });
          break;
        case 'gemini':
          this.gemini(args.slice(1)).then(resolve);
          break;
        case 'set-key':
          this.setKey(args[1]).then(resolve);
          break;
        case 'set-model':
          this.setModel(args[1]).then(resolve);
          break;
        case 'models':
          this.listModels().then(resolve);
          break;
        case 'clear':
          this.onWrite('\x1bc');
          resolve();
          break;
        case 'help':
          this.help();
          resolve();
          break;
        default:
          // Try to execute as a shell command
          this.socket?.emit('exec', [cmd, ...args.slice(1)].join(' '));
          this.socket?.once('exec_res', (res) => {
            if (res.success) {
              if (res.stdout) this.onWrite(`\r\n${res.stdout}`);
              if (res.stderr) this.onWrite(`\r\n\x1b[1;31m${res.stderr}\x1b[0m`);
            } else {
              this.onWrite(`\r\n\x1b[1;31m${res.error}\x1b[0m`);
            }
            resolve();
          });
      }
    });
  }

  private async executeVirtual(cmd: string, args: string[]) {
    switch (cmd) {
      case 'ls':
        await this.ls(args.slice(1));
        break;
      case 'pwd':
        this.onWrite(`\r\n${this.currentDir}`);
        break;
      case 'cd':
        await this.cd(args[1]);
        break;
      case 'mkdir':
        await this.mkdir(args[1]);
        break;
      case 'touch':
        await this.touch(args[1]);
        break;
      case 'cat':
        await this.cat(args[1]);
        break;
      case 'set-key':
        await this.setKey(args[1]);
        break;
      case 'set-model':
        await this.setModel(args[1]);
        break;
      case 'models':
        await this.listModels();
        break;
      case 'gemini':
        await this.gemini(args.slice(1));
        break;
      case 'help':
        this.help();
        break;
      case 'clear':
        this.onWrite('\x1bc');
        break;
      default:
        this.onWrite(`\r\ncommand not found: ${cmd}`);
    }
  }

  private async handleInteractiveInput(input: string) {
    if (input.trim().toLowerCase() === 'exit' || input.trim().toLowerCase() === 'quit') {
      this.isInteractiveMode = false;
      this.chatSession = null;
      this.onWrite('\r\nExiting Gemini Mode.');
      this.onWrite('\r\n$ ');
      return;
    }

    if (!this.chatSession) {
      this.onWrite('\r\n\x1b[1;31mError:\x1b[0m No active chat session.');
      this.isInteractiveMode = false;
      this.onWrite('\r\n$ ');
      return;
    }

    this.onWrite('\r\n\x1b[1;34mThinking...\x1b[0m');
    try {
      let result = await this.chatSession.sendMessage(input);
      let response = result.response;
      
      while (response.functionCalls() && response.functionCalls()!.length > 0) {
        const functionCalls = response.functionCalls()!;
        const functionResponses = [];

        for (const call of functionCalls) {
          const { name, args } = call;
          this.onWrite(`\r\n\x1b[1;36m[Tool Call: ${name}]\x1b[0m`);
          let toolResult;
          
          if (this.isLocalMode) {
            toolResult = await this.callLocalTool(name, args);
          } else {
            toolResult = await this.callVirtualTool(name, args);
          }

          functionResponses.push({
            functionResponse: {
              name,
              response: { result: toolResult }
            }
          });
        }

        result = await this.chatSession.sendMessage(functionResponses);
        response = result.response;
      }

      const text = response.text();
      if (text) {
        this.onWrite(`\r\n\r\n\x1b[1;32mGemini (${this.currentModel}):\x1b[0m ${text}`);
      }
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31mGemini Error:\x1b[0m ${err.message}`);
    }
    this.onWrite(`\r\n\r\n\x1b[1;35mGemini Mode (${this.currentModel})\x1b[0m > `);
  }

  private async callLocalTool(name: string, args: any): Promise<any> {
    return new Promise((resolve) => {
      switch (name) {
        case 'ls':
          this.socket?.emit('ls', args.path);
          this.socket?.once('ls_res', (res) => resolve(res.success ? res.files.join(', ') : res.error));
          break;
        case 'pwd':
          resolve(this.currentDir);
          break;
        case 'mkdir':
          this.socket?.emit('mkdir', args.dir);
          this.socket?.once('mkdir_res', (res) => resolve(res.success ? "Success" : res.error));
          break;
        case 'touch':
          this.socket?.emit('writeFile', { file: args.file, content: '' });
          this.socket?.once('writeFile_res', (res) => resolve(res.success ? "Success" : res.error));
          break;
        case 'readFile':
          this.socket?.emit('readFile', args.file);
          this.socket?.once('readFile_res', (res) => resolve(res.success ? res.content : res.error));
          break;
        case 'writeFile':
          this.socket?.emit('writeFile', { file: args.file, content: args.content });
          this.socket?.once('writeFile_res', (res) => resolve(res.success ? "Success" : res.error));
          break;
        case 'exec':
          this.socket?.emit('exec', args.command);
          this.socket?.once('exec_res', (res) => resolve(res.success ? `STDOUT: ${res.stdout}\nSTDERR: ${res.stderr}` : res.error));
          break;
        default:
          resolve("Error: Unknown tool");
      }
    });
  }

  private async callVirtualTool(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'ls':
          const files = await fs.readdir(args.path || this.currentDir);
          return files.join(', ');
        case 'pwd':
          return this.currentDir;
        case 'mkdir':
          await this.mkdir(args.dir);
          return "Success";
        case 'touch':
          await this.touch(args.file);
          return "Success";
        case 'readFile':
          return await fs.readFile(args.file, 'utf8');
        case 'writeFile':
          await fs.writeFile(args.file, args.content);
          return "Success";
        default:
          return "Error: Unknown tool";
      }
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }

  private async setKey(key: string) {
    if (!key) throw new Error('missing API key');
    await settingsService.setGeminiApiKey(key);
    this.apiKey = key;
    this.onWrite('\r\nAPI key set successfully!');
  }

  private async setModel(model: string) {
    if (!model) throw new Error('missing model name');
    await settingsService.setGeminiModel(model);
    this.currentModel = model;
    this.onWrite(`\r\nModel set to: \x1b[1;32m${model}\x1b[0m`);
  }

  private async listModels() {
    if (!this.apiKey) throw new Error('API key not set');
    this.onWrite('\r\nFetching available models...');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      const data = await response.json();
      if (data.models) {
        data.models.forEach((m: any) => {
          const name = m.name.replace('models/', '');
          const isCurrent = name === this.currentModel;
          this.onWrite(`\r\n${isCurrent ? '\x1b[1;32m* ' : '- '}${name} (${m.displayName})\x1b[0m`);
        });
      } else {
        this.onWrite(`\r\nNo models found or error: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      this.onWrite(`\r\nError: ${err.message}`);
    }
  }

  private async ls(args: string[]) {
    const target = args[0] || this.currentDir;
    const files = await fs.readdir(target);
    this.onWrite(`\r\n${files.join('  ')}`);
  }

  private async cd(dir: string) {
    if (!dir || dir === '/') {
      this.currentDir = '/';
      return;
    }
    const newDir = dir.startsWith('/') ? dir : `${this.currentDir}${this.currentDir === '/' ? '' : '/'}${dir}`;
    const stat = await fs.stat(newDir);
    if (stat.isDirectory()) {
      this.currentDir = newDir;
    } else {
      throw new Error('not a directory');
    }
  }

  private async mkdir(dir: string) {
    if (!dir) throw new Error('missing directory name');
    const path = dir.startsWith('/') ? dir : `${this.currentDir}${this.currentDir === '/' ? '' : '/'}${dir}`;
    await fs.mkdir(path);
  }

  private async touch(file: string) {
    if (!file) throw new Error('missing file name');
    const path = file.startsWith('/') ? file : `${this.currentDir}${this.currentDir === '/' ? '' : '/'}${file}`;
    await fs.writeFile(path, '');
  }

  private async cat(file: string) {
    if (!file) throw new Error('missing file name');
    const path = file.startsWith('/') ? file : `${this.currentDir}${this.currentDir === '/' ? '' : '/'}${file}`;
    const content = await fs.readFile(path, 'utf8');
    this.onWrite(`\r\n${content}`);
  }

  private async gemini(args: string[]) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not set. Use "set-key <key>" to configure it.');
    }

    const prompt = args.join(' ');
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: this.currentModel,
      tools: [{ functionDeclarations: tools }]
    });

    if (!prompt) {
      this.isInteractiveMode = true;
      this.chatSession = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 2000 },
      });
      this.onWrite(`\r\n\x1b[1;35mEntering Gemini Interactive Mode (${this.currentModel}). Type "exit" to return to shell.\x1b[0m`);
      this.onWrite(`\r\n\x1b[1;35mGemini Mode (${this.currentModel})\x1b[0m > `);
      return;
    }

    this.onWrite('\r\n\x1b[1;34mThinking...\x1b[0m');
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      this.onWrite(`\r\n\x1b[1;32mGemini (${this.currentModel}):\x1b[0m ${text}`);
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31mGemini Error:\x1b[0m ${err.message}`);
    }
  }

  private help() {
    this.onWrite(`\r\nAvailable commands: ls, pwd, cd, mkdir, touch, cat, set-key, set-model, models, gemini, help, clear`);
    if (this.isLocalMode) {
      this.onWrite(`\r\n\x1b[1;32mLocal Mode enabled: You can also run any shell command (e.g. npm, python).\x1b[0m`);
    }
  }
}
