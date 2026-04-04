import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { FileNode, DirNode, FsNode } from '~/types/fs';

export const useFsStore = defineStore("fs", {
  state: () => {
    const { $pfs } = useNuxtApp();

    return {
      pfs: $pfs as LightningFS.PromisifiedFS,
      root: {
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
      this.root.children = await Promise.all(result.map((name) => this.getNode(`/${name}`)));
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
    async readFile(path: string) {
      const content = await this.pfs.readFile(path, "utf8");
      return content;
    },
    async writeFile(name: string, content: string) {
      await this.pfs.writeFile(`/${name}`, content);
      await this.readDir("/");
    },
    async removeFile(path: string) {
      await this.pfs.unlink(path);
      await this.readDir("/");
    }
  }
});