import LightningFS from "@isomorphic-git/lightning-fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import { FILESYSTEM_ENTRIES } from "~/constants/filesystem";
import type { File, Dir, Entry } from "~/types/filesystem";
import { getName, getParentPath, normalizePath } from "~/utils/path";

export class FilesystemService {
  
  constructor(private filesystem: LightningFS.PromisifiedFS) {}

  async exists(path: string, type?: "file" | "dir") {
    try {
      const stat = await this.filesystem.stat(path);
      return !type || stat.type === type;
    } catch {
      return false;
    }
  }

  // Git
  async listBranches(path: string) {
    return await git.listBranches({
      fs: this.filesystem,
      dir: path
    });
  }

  async getGitLog(path: string) {
    return await git.log({
      fs: this.filesystem,
      dir: path
    });
  }

  async initializeRepository(path: string) {
    await git.init({
      fs: this.filesystem,
      dir: path
    });
  }

  async cloneRepository(path: string, url: string) {
    await git.clone({
      fs: this.filesystem,
      http,
      dir: path,
      url,
      corsProxy: "https://cors.isomorphic-git.org" // just for testing
    });
  }

  // Create
  async createFile(path: string, content: string) {
    if (await this.exists(path)) return;
    await this.filesystem.writeFile(path, content);
  }

  async createDir(path: string) {
    if (await this.exists(path)) return;
    await this.filesystem.mkdir(path);
  }

  // Read
  async readFile(path: string) {
    return this.filesystem.readFile(path, "utf8");
  }

  async readDir(path: string, recursive: boolean = false) {
    const entryNames = await this.filesystem.readdir(path);
    entryNames.sort((a, b) => a.localeCompare(b));
    return await Promise.all(entryNames.map(async (name) => {
      const entry = await this.getEntry(normalizePath(`${path}/${name}`));
      if (recursive) {
        if (['repository', 'page', 'database', 'dir'].includes(entry.type)) entry.children = await this.readDir(entry.path, true);
      }
      return entry;
    }));
  }

  async getEntry(path: string) {
    const stat = await this.filesystem.stat(path);
    const name = getName(path);

    if (stat.isFile()) {
      return {
        name,
        path,
        content: await this.readFile(path),
        type: name === FILESYSTEM_ENTRIES.SETTINGS
          ? "settings"
          : name === FILESYSTEM_ENTRIES.PROPERTIES
          ? "properties"
          : "file"
      } as File;

    } else { // isDirectory
      const normalizedPath = path === "/" ? "/" : `${path}/`;
      const type = await this.exists(normalizedPath + FILESYSTEM_ENTRIES.GIT, "dir")
        ? "repository"
        : await this.exists(normalizedPath + FILESYSTEM_ENTRIES.PAGE, "file")
        ? "page"
        : await this.exists(normalizedPath + FILESYSTEM_ENTRIES.DATABASE, "file")
        ? "database"
        : "dir";
      return {
        name,
        path,
        children: [],
        type,
        ...(type !== "dir" && { mainEntry: await this.getEntry(normalizedPath +
          (type == "repository"
          ? FILESYSTEM_ENTRIES.GIT
          : type == "page"
          ? FILESYSTEM_ENTRIES.PAGE
          : type == "database"
          ? FILESYSTEM_ENTRIES.DATABASE
          : "")
        )}),
        ...(type !== "dir" && await this.exists(normalizedPath + FILESYSTEM_ENTRIES.PROPERTIES) && { propertiesFile: await this.getEntry(normalizedPath + FILESYSTEM_ENTRIES.PROPERTIES)})
      } as Dir;
    }
  }

  // Update
  async writeFile(path: string, content: string) {
    return this.filesystem.writeFile(path, content);
  }

  async rename(path: string, newName: string) {
    const parentPath = getParentPath(path);
    const newPath = parentPath == "/" ? `/${newName}` : `${parentPath}/${newName}`;
    if (await this.exists(newPath)) {
      throw new Error("Este nome já existe.");
    };
    await this.filesystem.rename(path, newPath);
  }

  async move(entryPath: string, dirPath: string) {
    const entry = await this.getEntry(entryPath);
    if (entry.type === "file") {
      await this.rename(entryPath, normalizePath(`${dirPath}/${entry.name}`));
    } else if (entry.type === "dir") {
      await this.rename(entryPath, normalizePath(`${dirPath}/${entry.name}`));
    }
  }

  // Delete
  async deleteFile(path: string) {
    await this.filesystem.unlink(path);
  }

  async deleteDir(path: string, recursive = false) {
    if (recursive) {
      const entries = await this.readDir(path);
      for (const entry of entries) {
        if (['repository', 'page', 'database', 'dir'].includes(entry.type)) await this.deleteDir(entry.path, true);
        else if (['settings', 'properties', 'file'].includes(entry.type)) await this.deleteFile(entry.path);
      }
    }
    await this.filesystem.rmdir(path);
  }
}