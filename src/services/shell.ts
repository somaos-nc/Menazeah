import { gitService } from './git';
import { settingsService } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const fs = gitService.fs.promises;

export class Shell {
  private currentDir: string = '/';
  private apiKey: string | null = null;
  private onWrite: (data: string) => void;

  constructor(onWrite: (data: string) => void) {
    this.onWrite = onWrite;
    this.init();
  }

  private async init() {
    this.apiKey = await settingsService.getGeminiApiKey() || null;
    if (!this.apiKey) {
      this.onWrite('\r\n\x1b[1;33mWelcome to Menazeah!\x1b[0m');
      this.onWrite('\r\nTo use the Gemini CLI, please set your API key:');
      this.onWrite('\r\n\x1b[1;32mset-key <your-api-key>\x1b[0m');
    }
  }

  async execute(commandLine: string) {
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
        case 'gemini':
          await this.gemini(args.slice(1));
          break;
        case 'help':
          this.help();
          break;
        default:
          this.onWrite(`\r\ncommand not found: ${cmd}`);
      }
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31merror:\x1b[0m ${err.message}`);
    }

    this.onWrite('\r\n$ ');
  }

  private async setKey(key: string) {
    if (!key) throw new Error('missing API key');
    await settingsService.setGeminiApiKey(key);
    this.apiKey = key;
    this.onWrite('\r\nAPI key set successfully!');
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
    if (!prompt) {
      this.onWrite('\r\nUsage: gemini <prompt>');
      return;
    }

    this.onWrite('\r\n\x1b[1;34mThinking...\x1b[0m');
    
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      this.onWrite(`\r\n\x1b[1;32mGemini:\x1b[0m ${text}`);
    } catch (err: any) {
      this.onWrite(`\r\n\x1b[1;31mGemini Error:\x1b[0m ${err.message}`);
    }
  }

  private help() {
    this.onWrite(`\r\nAvailable commands: ls, pwd, cd, mkdir, touch, cat, set-key, gemini, help`);
  }
}
