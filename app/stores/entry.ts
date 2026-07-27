import LightningFS from '@isomorphic-git/lightning-fs';
import { defineStore } from "pinia";
import type { File, Dir, Entry } from '~/types/filesystem';
import { getName, getParentPath, normalizePath } from "~/utils/path";

export const useEntryStore = defineStore("entry", () => {

  const { $filesystem } = useNuxtApp();

  const entry = ref<Entry | null>(null);

  const raw = ref<boolean>(false);

  const expandedDirs = ref(new Set<string>());

  const root = ref<Dir>({
    name: "/",
    path: "/",
    type: "dir",
    children: []
  });



  // Create
  async function createFile(path: string, content: string) {
    await $filesystem.createFile(path, content);
    await refresh();
  }

  async function createDir(path: string) {
    await $filesystem.createDir(path);
    await refresh();
  }

  // Read
  async function readFile(path: string) {
    const content = await $filesystem.readFile(path);
    return content;
  }

  async function readDir(path: string, recursive = false) {
    return await $filesystem.readDir(path, recursive);
  }

  async function getEntry(path: string) {
    return await $filesystem.getEntry(path);
  }

  // Update
  async function rename(path: string, newName: string) {
    await $filesystem.rename(path, newName);
    await refresh();
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
    await $filesystem.deleteFile(path);
    await refresh();
  }

  async function deleteDir(path: string, recursive = false) {
    await $filesystem.deleteDir(path, recursive);
    await refresh();
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
      entry.value = await getEntry(path);
    } catch {
      entry.value = null;
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
    currentEntry: entry,
    expandedDirs,
    raw,
    root,

    loadRoot,
    startRouteSync,
    refresh,

    createFile,
    createDir,

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