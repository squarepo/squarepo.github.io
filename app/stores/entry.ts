import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import { DEFAULT_SETTINGS } from '~/defaults/settings';
import type { File, Dir, Entry } from '~/types/filesystem';
import { getIncrementalName, getParentPath, normalizePath } from "~/utils/path";

export const useEntryStore = defineStore("entry", () => {

  const { $filesystem } = useNuxtApp();

  const currentEntry = ref<Entry | null>(null);

  const raw = ref<boolean>(false);

  const expandedDirs = ref(new Set<string>());

  const root = ref<Dir>({
    name: "/",
    path: "/",
    type: "dir",
    children: []
  });



  // Git
  async function listBranches(path: string) {
    return await $filesystem.listBranches(path);
  }

  async function getGitLog(path: string) {
    return await $filesystem.getGitLog(path);
  }

  async function initializeRepository(path: string) {
    await $filesystem.initializeRepository(path);
    await refresh();
  }

  async function cloneRepository(path: string) {
    const url = prompt(`URL do repositório`)?.trim();
    if (url === undefined) return;
    await $filesystem.cloneRepository(path, url);
    await refresh();
  }

  async function createRepository(path: string) {
    const name = prompt(`Criar repositório`,  await getIncrementalName(path, "Repositório"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await $filesystem.createDir(normalizedPath);
    await $filesystem.initializeRepository(normalizedPath);
    await refresh();
  }

  // Create
  async function createFile(path: string, content: string) {
    await $filesystem.createFile(path, content);
    await refresh();
  }

  async function createSettings(path: string) {
    const name = prompt(`Criar configurações`, await getIncrementalName(path, FILESYSTEM_ENTRIES.SETTINGS))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await $filesystem.createFile(normalizedPath, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    await refresh();
    await changeURL(normalizedPath);
  }

  async function createFolder(path: string) {
    const name = prompt(`Criar pasta`, await getIncrementalName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await $filesystem.createDir(normalizedPath);
    await refresh();
  }

  async function createPage(path: string) {
    const name = prompt(`Criar página`, await getIncrementalName(path, "Página"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await $filesystem.createDir(normalizedPath);
    await $filesystem.createFile(`${normalizedPath}/${FILESYSTEM_ENTRIES.PAGE}`, "");
    await refresh();
    await changeURL(normalizedPath);
  }

  // Read
  async function readFile(path: string) {
    const content = await $filesystem.readFile(path);
    return content;
  }

  async function readDir(path: string, recursive = false) {
    return await $filesystem.readDir(path, recursive);
  }

  async function getEntry<T = Entry>(path: string): Promise<T> {
    return await $filesystem.getEntry(path);
  }

  // Update
  async function rename(path: string, newName?: string) {
    if (newName === undefined) {
      const entry = await getEntry(path);
      newName = prompt(`Renomear`, entry.name)?.trim();
    }
    await $filesystem.rename(path, newName!);
    await refresh();
    if (path === currentEntry.value?.path) {
      const newPath = normalizePath(`/${getParentPath(path)}/${newName}`);
      await changeURL(newPath);
    }
  }

  async function move(entryPath: string, dirPath: string) {
    await $filesystem.move(entryPath, dirPath);
  }

  async function writeFile(path: string, content: string) {
    const file = await getEntry(path) as File;
    if (file.content === content) return;
    await $filesystem.writeFile(path, content);
    await refresh();
  }

  // Delete
  async function deleteFile(path: string) {
    const entry = await getEntry(path);
    if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
      await $filesystem.deleteFile(path);
      await refresh();
      if (!(currentEntry.value && await exists(currentEntry.value.path))) {
        await changeURL("/");
      }
      // if (path == settingsStore.rootSettingsPath) await settingsStore.refresh();
    }
  }

  async function deleteDir(path: string, recursive: boolean) {
    const entry = await getEntry(path);
    if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
      await $filesystem.deleteDir(path, recursive);
      await refresh();
      if (!(currentEntry.value && await exists(currentEntry.value.path))) {
        await changeURL("/");
      }
    }
  }


  
  async function refresh() {
    root.value.children = await $filesystem.readDir("/", true);
    await changeCurrentEntry(useRoute().fullPath);
  }
  async function loadRoot() {
    const route = useRoute();
    const pathEntries = await getPathEntries(normalizePath(decodeURIComponent(route.path)));
    root.value.children = await readDir("/", true);
    for (const entry of pathEntries) {
      if (entry.type === "dir" && entry.path !== "/") {
        expandedDirs.value.add(entry.path);
      }
    }
  }
  function startRouteSync() {
    const route = useRoute();
    watch(
      () => route.fullPath,
      async (fullPath) => {
        await changeCurrentEntry(fullPath);
      },
      { immediate: true }
    );
  }
  async function exists(path: string) {
    return await $filesystem.exists(path);
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
      currentEntry.value = await getEntry(path);
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

  return {
    currentEntry,
    expandedDirs,
    raw,
    root,

    loadRoot,
    startRouteSync,
    refresh,

    listBranches,
    getGitLog,
    initializeRepository,
    cloneRepository,

    createFile,
    createPage,
    createFolder,
    createSettings,
    createRepository,

    getEntry,
    readFile,
    readDir,

    rename,
    moveEntry: move,
    updateFileContent: writeFile,

    deleteFile,
    deleteDir,

    getPathEntries,
    changeCurrentEntry,
    changeURL,
    exists
  }
});