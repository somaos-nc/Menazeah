import git from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web';
import { Buffer } from 'buffer';

// Polyfill Buffer for the browser
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

const fs = new LightningFS('menazeah-fs');

export const gitService = {
  fs,
  http,
  
  async initRepo(dir: string) {
    await git.init({ fs, dir });
  },

  async cloneRepo(dir: string, url: string) {
    await git.clone({
      fs,
      http,
      dir,
      url,
      singleBranch: true,
      depth: 1
    });
  },

  async commit(dir: string, message: string, author: { name: string, email: string }) {
    await git.add({ fs, dir, filepath: '.' });
    return await git.commit({
      fs,
      dir,
      message,
      author
    });
  },

  async getStatus(dir: string) {
    return await git.statusMatrix({ fs, dir });
  }
};

export default gitService;
