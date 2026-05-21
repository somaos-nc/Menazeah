import { gitService } from './git';
import { settingsService } from './db';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

const fs = gitService.fs.promises;

export class Shell {
  private currentDir: string = '/';
  private apiKey: string | null = null;
  private currentModel: string = 'gemini-1.5-flash';
  private onWrite: (data: string) => void;
  private isInteractiveMode: boolean = false;
  private chatSession: ChatSession | null = null;

  constructor(onWrite: (data: string) => void) {
    this.onWrite = onWrite;
    this.init();
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
        case 'gemini':
          await this.gemini(args.slice(1));
          break;
        case 'models':
          await this.listModels();
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
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31merror:\x1b[0m ${err.message}`);
    }

    if (!this.isInteractiveMode) {
      this.onWrite('\r\n$ ');
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
      const result = await this.chatSession.sendMessage(input);
      const response = await result.response;
      const text = response.text();
      this.onWrite(`\r\n\r\n\x1b[1;32mGemini (${this.currentModel}):\x1b[0m ${text}`);
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31mGemini Error:\x1b[0m ${err.message}`);
    }
    this.onWrite(`\r\n\r\n\x1b[1;35mGemini Mode (${this.currentModel})\x1b[0m > `);
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
    const model = genAI.getGenerativeModel({ model: this.currentModel });

    if (!prompt) {
      // Enter interactive mode
      this.isInteractiveMode = true;
      this.chatSession = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });
      this.onWrite(`\r\n\x1b[1;35mEntering Gemini Interactive Mode (${this.currentModel}). Type "exit" to return to shell.\x1b[0m`);
      this.onWrite(`\r\n\x1b[1;35mGemini Mode (${this.currentModel})\x1b[0m > `);
      return;
    }

    // Single prompt mode
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
  }
}
