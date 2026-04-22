import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { File, Dir } from '~/domain/filesystem/fs';
import { createFsService } from '~/domain/filesystem/fs.service';
import { getName } from '~/domain/filesystem/fs.utils';

export const useFsStore = defineStore("fs", {
  state: () => {
    const { $pfs } = useNuxtApp();
    return {
      fs: createFsService($pfs),
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

    async refreshRoot() {
      this.root.children = await this.fs.readDir("/", true);
    },

    async createFile(path: string, content: string) {
      await this.fs.createFile(path, content);
      await this.refreshRoot();
    },

    async createDir(path: string) {
      await this.fs.createDir(path);
      await this.refreshRoot();
    },

    async renameFile(oldPath: string, newPath: string) {
      await this.fs.renameFile(oldPath, newPath);
      await this.refreshRoot();
    },

    async renameDir(oldPath: string, newPath: string) {
      await this.fs.renameDir(oldPath, newPath);
      await this.refreshRoot();
    },

    async updateFileContent(path: string, content: string) {
      await this.fs.updateFileContent(path, content);
      await this.refreshRoot();
    },

    async deleteFile(path: string, refresh = true) {
      await this.fs.deleteFile(path);
      if (refresh) this.refreshRoot();
    },

    async deleteDir(path: string, recursive = false, refresh = true) {
      await this.fs.deleteDir(path, recursive);
      if (refresh) this.refreshRoot();
    },
    

    
    async getPathEntries(path: string) {
      const entries: (File | Dir)[] = [];
      if (path === "/") return [await this.fs.getEntry("/")];
      const parts = path.split("/");
      let accumulator = "";
      for (let index = 0; index < parts.length; index++) {
        if (index > 0) {
          const part = parts[index];
          const currentPath = `${accumulator}/${part}`;
          entries.push(await this.fs.getEntry(currentPath));
          accumulator = currentPath;
        } else {
          entries.push(await this.fs.getEntry("/"));
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
            name: getName(path),
            path,
            type: "file",
            content: await this.fs.readFile(path)
          } as File;
        } else if (stat.type === "dir") {
          this.currentEntry = {
            name: getName(path),
            path,
            type: "dir",
            children: await this.fs.readDir(path, true)
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
  }
});