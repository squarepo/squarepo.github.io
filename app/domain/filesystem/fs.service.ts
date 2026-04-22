import LightningFS from '@isomorphic-git/lightning-fs';
import type { File, Dir } from './fs';
import { getName, normalizePath } from './fs.utils';

export function createFsService(pfs: LightningFS.PromisifiedFS) {
  return {
    
    async getEntry(path: string) {
      const stat = await pfs.stat(path);
      const entry = {
        name: getName(path),
        path,
        type: stat.type,
        ...(stat.type === "file" && { content: await this.readFile(path) }),
        ...(stat.type === "dir" && { children: [] }),
      } as File | Dir;
      return entry;
    },

    async readFile(path: string) {
      const content = await pfs.readFile(path, "utf8");
      return content;
    },

    async readDir(path: string, recursive = false) {
      const entryNames = await pfs.readdir(path);
      entryNames.sort((a, b) => a.localeCompare(b));
      return await Promise.all(entryNames.map(async (name) => {
        const entry = await this.getEntry(normalizePath(`${path}/${name}`));
        if (recursive) {
          if (entry.type === "dir") entry.children = await this.readDir(entry.path, true);
        }
        return entry;
      }));
    },

    async createFile(path: string, content: string) {
      if (await this.exists(path)) return;
      await pfs.writeFile(path, content);
    },

    async createDir(path: string) {
      if (await this.exists(path)) return;
      await pfs.mkdir(path);
    },

    async renameFile(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await pfs.stat(oldPath);
      if (oldStat.type !== "file") return;
      if (await this.exists(newPath)) return;
      await pfs.rename(oldPath, newPath);
    },

    async renameDir(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await pfs.stat(oldPath);
      if (oldStat.type !== "dir") return;
      if (await this.exists(newPath)) return;
      await pfs.rename(oldPath, newPath);
    },

    async updateFileContent(path: string, content: string) {
      const file = await this.getEntry(path) as File;
      if (file.content === content) return;
      await pfs.writeFile(path, content);
    },

    async deleteFile(path: string) {
      await pfs.unlink(path);
    },

    async deleteDir(path: string, recursive = false) {
      if (recursive) {
        const entries = await this.readDir(path);
        for (const entry of entries) {
          if (entry.type === "dir") await this.deleteDir(entry.path, true);
          else if (entry.type === "file") await this.deleteFile(entry.path);
        }
      }
      await pfs.rmdir(path);
    },

    async exists(path: string) {
      try {
        await pfs.stat(path);
        return true;
      } catch {
        return false;
      }
    },

    async moveEntry(entryPath: string, dirPath: string) {
      const entry = await this.getEntry(entryPath);
      if (entry.type === "file") {
        await this.renameFile(entryPath, normalizePath(`${dirPath}/${entry.name}`));
      } else if (entry.type === "dir") {
        await this.renameDir(entryPath, normalizePath(`${dirPath}/${entry.name}`));
      }
    },

  };
}