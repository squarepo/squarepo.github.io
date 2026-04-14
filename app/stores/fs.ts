import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { FileNode, DirNode, FsNode } from '~/types/fs';

export const useFsStore = defineStore("fs", {
  state: () => {
    const { $pfs } = useNuxtApp();

    return {
      pfs: $pfs as LightningFS.PromisifiedFS,
      currentNode: null as FsNode | null,
      wd: {
        name: "/",
        path: "/",
        type: "dir",
        children: []
      } as DirNode
    }
  },

  actions: {
    async readDir(path: string) {
      const result = await this.pfs.readdir(path);
      this.wd.children = await Promise.all(result.map((name) => this.getNode(this.normalizePath(`${this.wd.path}/${name}`))));
      return result;
    },
    async getNode(path: string) {
      const stat = await this.pfs.stat(path);
      const node = {
        name: this.getNameFromPath(path),
        path,
        type: stat.type,
        ...(stat.type === "dir" && { children: [] }),
        ...(stat.type === "file" && { content: await this.readFile(path) })
      } as FsNode;
      return node;
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
          } as FileNode;
        } else if (stat.type === "dir") {
          this.wd = await this.getNode(path) as DirNode;
          await this.readDir(path);
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
    },
    async readFile(path: string) {
      const content = await this.pfs.readFile(path, "utf8");
      return content;
    },
    async writeFile(name: string, content: string) {
      const path = this.normalizePath(`${this.wd.path}/${name}`);
      await this.pfs.writeFile(path, content);
      await this.readDir(this.wd.path);
    },
    async mkdir(name: string) {
      const path = this.normalizePath(`${this.wd.path}/${name}`);
      await this.pfs.mkdir(path);
      await this.readDir(this.wd.path);
    },
    async removeFile(path: string) {
      await this.pfs.unlink(path);
      await this.readDir(this.wd.path);
    },
    async renameFile(oldPath: string, newPath: string) {
      if (this.normalizePath(oldPath) === this.normalizePath(newPath)) return;
      if (await this.exists(newPath)) return;
      await this.pfs.rename(oldPath, newPath);
      await this.readDir(this.wd.path);
    }
  }
});