import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { File, Dir } from '~/types/fs';

export const useFsStore = defineStore("fs", {
  state: () => {
    const { $pfs } = useNuxtApp();

    return {
      pfs: $pfs as LightningFS.PromisifiedFS,
      currentEntry: null as (File | Dir) | null,
      expandedDirs: new Set<string>(),
      root: {
        name: "/",
        path: "/",
        type: "dir",
        children: []
      } as Dir
    }
  },

  actions: {
    async createFile(path: string, content: string) {
      if (await this.exists(path)) return;
      await this.pfs.writeFile(path, content);
      this.root.children = await this.readDir("/", true);
    },
    async createDir(path: string) {
      if (await this.exists(path)) return;
      await this.pfs.mkdir(path);
      this.root.children = await this.readDir("/", true);
    },

    async getEntry(path: string) {
      const stat = await this.pfs.stat(path);
      const entry = {
        name: this.getName(path),
        path,
        type: stat.type,
        ...(stat.type === "file" && { content: await this.readFile(path) }),
        ...(stat.type === "dir" && { children: [] }),
      } as (File | Dir);
      return entry;
    },
    async readFile(path: string) {
      const content = await this.pfs.readFile(path, "utf8");
      return content;
    },
    async readDir(path: string, recursive: boolean = false) {
      const entryNames = await this.pfs.readdir(path);
      entryNames.sort((a, b) => a.localeCompare(b));
      return await Promise.all(entryNames.map(async (name) => {
        const entry = await this.getEntry(this.normalizePath(`/${path}/${name}`));
        if (entry.type === "dir") entry.children = await this.readDir(entry.path);
        return entry;
      }));
    },

    async renameFile(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await this.pfs.stat(oldPath);
      if (oldStat.type !== "file") return;
      if (await this.exists(newPath)) return;
      await this.pfs.rename(oldPath, newPath);
      this.root.children = await this.readDir("/", true);
    },
    async renameDir(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await this.pfs.stat(oldPath);
      if (oldStat.type !== "dir") return;
      if (await this.exists(newPath)) return;
      await this.pfs.rename(oldPath, newPath);
      this.root.children = await this.readDir("/", true);
    },
    async updateFileContent(path: string, content: string) {
      const file = await this.getEntry(path) as File;
      if (file.content === content) return;
      await this.pfs.writeFile(path, content);
      this.root.children = await this.readDir("/", true);
    },

    async deleteFile(path: string) {
      await this.pfs.unlink(path);
      this.root.children = await this.readDir("/", true);
    },
    async deleteDir(path: string, recursive: boolean = false) {
      if (recursive) {
        const entries = await this.readDir(path);
        for (const entry of entries) {
          if (entry.type === "dir") await this.deleteDir(entry.path, true);
          else if (entry.type === "file") await this.deleteFile(entry.path);
        }
      }
      await this.pfs.rmdir(path);
      this.root.children = await this.readDir("/", true);
    },

    getName(path: string) {
      if (!path) return "";
      const parts = path.split("/").filter(Boolean);
      return parts.pop() || "/";
    },
    getParentPath(path: string) {
      const normalized = this.normalizePath(path);
      if (normalized === "/") return "/";
      const lastSlash = normalized.lastIndexOf("/");
      return lastSlash <= 0 ? "/" : normalized.substring(0, lastSlash);
    },
    normalizePath(path: string) {
      if (!path) return "/";
      let normalized = path.replace(/\/+/g, "/");
      if (normalized.length > 1) {
        normalized = normalized.replace(/\/$/, "");
      }
      return normalized;
    },
    async getPathEntries(path: string) {
      const entries: (File | Dir)[] = [];
      if (path === "/") return [await this.getEntry("/")];
      const parts = path.split("/");
      let accumulator = "";
      for (let index = 0; index < parts.length; index++) {
        if (index > 0) {
          const part = parts[index];
          const currentPath = `${accumulator}/${part}`;
          entries.push(await this.getEntry(currentPath));
          accumulator = currentPath;
        } else {
          entries.push(await this.getEntry("/"));
        }
      }
      return entries;
    },
    async changeCurrentEntry(path: string) {
      path = decodeURIComponent(path);
      try {
        const stat = await this.pfs.stat(path);
        if (stat.type === "file") {
          this.currentEntry = {
            name: this.getName(path),
            path,
            type: "file",
            content: await this.readFile(path)
          } as File;
        } else if (stat.type === "dir") {
          this.currentEntry = {
            name: this.getName(path),
            path,
            type: "dir",
            children: await this.readDir(path, true)
          } as Dir;
        }
      } catch {
        this.currentEntry = null;
      }
    },
    async changeURL(path: string, method: "push" | "replace" = "push") {
      const router = useRouter();
      if (method === "push") {
        router.push(path);
      } else if (method === "replace") {
        router.replace(path);
      }
    },
    async exists(path: string) {
      try {
        await this.pfs.stat(path);
        return true;
      } catch {
        return false;
      }
    }
  }
});