import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { File, Dir } from '~/types/fs';

export const useFsStore = defineStore("fs", {
  state: () => {
    const { $pfs } = useNuxtApp();

    return {
      pfs: $pfs as LightningFS.PromisifiedFS,
      currentNode: null as (File | Dir) | null,
      wd: {
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
      this.wd.children = await this.readDir(this.wd.path);
    },
    async createDir(path: string) {
      if (await this.exists(path)) return;
      await this.pfs.mkdir(path);
      this.wd.children = await this.readDir(this.wd.path);
    },

    async getEntry(path: string) {
      const stat = await this.pfs.stat(path);
      const entry = {
        name: this.getNameFromPath(path),
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
    async readDir(path: string) {
      const result = await this.pfs.readdir(path);
      return await Promise.all(result.map((name) => this.getEntry(this.normalizePath(`${this.wd.path}/${name}`))));
    },

    async renameFile(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await this.pfs.stat(oldPath);
      if (oldStat.type !== "file") return;
      if (await this.exists(newPath)) return;
      await this.pfs.rename(oldPath, newPath);
      this.wd.children = await this.readDir(this.wd.path);
    },
    async renameDir(oldPath: string, newPath: string) {
      if (oldPath === newPath) return;
      const oldStat = await this.pfs.stat(oldPath);
      if (oldStat.type !== "dir") return;
      if (await this.exists(newPath)) return;
      await this.pfs.rename(oldPath, newPath);
      this.wd.children = await this.readDir(this.wd.path);
    },
    async updateFileContent(path: string, content: string) {
      const file = await this.getEntry(path) as File;
      if (file.content === content) return;
      await this.pfs.writeFile(path, content);
      this.wd.children = await this.readDir(this.wd.path);
    },

    async deleteFile(path: string) {
      await this.pfs.unlink(path);
      this.wd.children = await this.readDir(this.wd.path);
    },
    async deleteDir(path: string, recursive: boolean = false) {
      if (recursive) {
        const entries = await this.readDir(path);
        for (const entry of entries) {
          if (entry.type === "dir") await this.deleteDir(entry.path);
          else if (entry.type === "file") await this.deleteFile(entry.path);
        }
      }
      await this.pfs.rmdir(path);
      this.wd.children = await this.readDir(this.wd.path);
    },

    getNameFromPath(path: string) {
      if (!path) return "";
      const parts = path.split("/").filter(Boolean);
      return parts.pop() || "/";
    },
    getParentPathFromPath(path: string) {
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
    async changeCurrentNode(path: string) {
      path = decodeURIComponent(path);
      try {
        const stat = await this.pfs.stat(path);
        if (stat.type === "file") {
          this.currentNode = {
            name: this.getNameFromPath(path),
            path,
            type: "file",
            content: await this.readFile(path)
          } as File;
        } else if (stat.type === "dir") {
          this.wd = await this.getEntry(path) as Dir;
          this.wd.children = await this.readDir(this.wd.path);
          this.currentNode = null;
        }
      } catch {
        this.currentNode = null;
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