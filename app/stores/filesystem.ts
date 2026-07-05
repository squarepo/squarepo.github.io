import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { File, Dir, Entry } from '~/types/filesystem';

export const useFilesystemStore = defineStore("filesystem", () => {

  const { $filesystem } = useNuxtApp();

  const currentEntry = ref<Entry | null>(null);

  const expandedDirs = ref(new Set<string>());

  const root = ref<Dir>({
    name: "/",
    path: "/",
    type: "dir",
    children: []
  });

  async function createFile(path: string, content: string) {
    if (await exists(path)) return;
    await $filesystem.writeFile(path, content);
    root.value.children = await readDir("/", true);
  }
  async function createDir(path: string) {
    if (await exists(path)) return;
    await $filesystem.mkdir(path);
    root.value.children = await readDir("/", true);
  }

  async function getEntry(path: string) {
    const stat = await $filesystem.stat(path);
    const entry = {
      name: getName(path),
      path,
      type: stat.type,
      ...(stat.type === "file" && { content: await readFile(path) }),
      ...(stat.type === "dir" && { children: [] }),
    } as (File | Dir);
    return entry;
  }
  async function readFile(path: string) {
    const content = await $filesystem.readFile(path, "utf8");
    return content;
  }
  async function readDir(path: string, recursive = false) {
    const entryNames = await $filesystem.readdir(path);
    entryNames.sort((a, b) => a.localeCompare(b));
    return await Promise.all(entryNames.map(async (name) => {
      const entry = await getEntry(normalizePath(`${path}/${name}`));
      if (recursive) {
        if (entry.type === "dir") entry.children = await readDir(entry.path, true);
      }
      return entry;
    }));
  }

  async function renameFile(oldPath: string, newPath: string) {
    if (oldPath === newPath) return;
    const oldStat = await $filesystem.stat(oldPath);
    if (oldStat.type !== "file") return;
    if (await exists(newPath)) return;
    await $filesystem.rename(oldPath, newPath);
    root.value.children = await readDir("/", true);
  }
  async function renameDir(oldPath: string, newPath: string) {
    if (oldPath === newPath) return;
    const oldStat = await $filesystem.stat(oldPath);
    if (oldStat.type !== "dir") return;
    if (await exists(newPath)) return;
    await $filesystem.rename(oldPath, newPath);
    root.value.children = await readDir("/", true);
  }
  async function moveEntry(entryPath: string, dirPath: string) {
    const entry = await getEntry(entryPath);
    if (entry.type === "file") {
      await renameFile(entryPath, normalizePath(`${dirPath}/${entry.name}`));
    } else if (entry.type === "dir") {
      await renameDir(entryPath, normalizePath(`${dirPath}/${entry.name}`));
    }
  }
  async function updateFileContent(path: string, content: string) {
    const file = await getEntry(path) as File;
    if (file.content === content) return;
    await $filesystem.writeFile(path, content);
    root.value.children = await readDir("/", true);
  }

  async function deleteFile(path: string, refresh = true) {
    await $filesystem.unlink(path);
    if (refresh) {
      root.value.children = await readDir("/", true)
    }
  }
  async function deleteDir(path: string, recursive = false, refresh = true) {
    if (recursive) {
      const entries = await readDir(path);
      for (const entry of entries) {
        if (entry.type === "dir") await deleteDir(entry.path, true, false);
        else if (entry.type === "file") await deleteFile(entry.path, false);
      }
    }
    await $filesystem.rmdir(path);
    if (refresh) {
      root.value.children = await readDir("/", true)
    }
  }

  function getName(path: string) {
    if (!path) return "";
    const parts = path.split("/").filter(Boolean);
    return parts.pop() || "/";
  }
  function getParentPath(path: string) {
    const normalized = normalizePath(path);
    if (normalized === "/") return "/";
    const lastSlash = normalized.lastIndexOf("/");
    return lastSlash <= 0 ? "/" : normalized.substring(0, lastSlash);
  }
  function normalizePath(path: string) {
    if (!path) return "/";
    let normalized = path.replace(/\/+/g, "/");
    if (normalized.length > 1) {
      normalized = normalized.replace(/\/$/, "");
    }
    return normalized;
  }
  async function getPathEntries(path: string) {
    const entries: (File | Dir)[] = [];
    if (path === "/") return [await getEntry("/")];
    const parts = path.split("/");
    let accumulator = "";
    for (let index = 0; index < parts.length; index++) {
      if (index > 0) {
        const part = parts[index];
        const currentPath = `${accumulator}/${part}`;
        entries.push(await getEntry(currentPath));
        accumulator = currentPath;
      } else {
        entries.push(await getEntry("/"));
      }
    }
    return entries;
  }
  async function changeCurrentEntry(path: string) {
    path = decodeURIComponent(path);
    try {
      const stat = await $filesystem.stat(path);
      if (stat.type === "file") {
        currentEntry.value = {
          name: getName(path),
          path,
          type: "file",
          content: await readFile(path)
        } as File;
      } else if (stat.type === "dir") {
        currentEntry.value = {
          name: getName(path),
          path,
          type: "dir",
          children: await readDir(path, true)
        } as Dir;
      }
    } catch {
      currentEntry.value = null;
    }
  }
  async function changeURL(path: string, method: "push" | "replace" = "push") {
    const router = useRouter();
    if (method === "push") {
      router.push(path);
    } else if (method === "replace") {
      router.replace(path);
    }
  }
  async function exists(path: string) {
    try {
      await $filesystem.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  return {
    currentEntry,
    expandedDirs,
    root,

    createFile,
    createDir,

    getEntry,
    readFile,
    readDir,

    renameFile,
    renameDir,
    moveEntry,
    updateFileContent,

    deleteFile,
    deleteDir,

    getName,
    getParentPath,
    normalizePath,
    getPathEntries,
    changeCurrentEntry,
    changeURL,
    exists
  }
});