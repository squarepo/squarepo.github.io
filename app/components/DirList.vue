<script setup lang="ts">
import type { File, Dir } from '~/types/fs';

const props = defineProps<{ dir: Dir }>();
const fsStore = useFsStore();

async function deleteFile(path: string) {
  const entry = await fsStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await fsStore.deleteFile(path);
    props.dir.children = await fsStore.readDir(props.dir.path);
    if (!(fsStore.currentEntry && await fsStore.exists(fsStore.currentEntry.path))) {
      await fsStore.changeURL("/");
    }
  }
}

async function deleteDir(path: string, recursive: boolean) {
  const entry = await fsStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await fsStore.deleteDir(path, recursive);
    props.dir.children = await fsStore.readDir(props.dir.path);
    if (!(fsStore.currentEntry && await fsStore.exists(fsStore.currentEntry.path))) {
      await fsStore.changeURL("/");
    }
  }
}

async function renameFile(path: string) {
  const entry = await fsStore.getEntry(path);
  if (entry.type !== "file") return;
  const name = prompt(`Renomear arquivo`, entry.name)?.trim();
  if (name === undefined) return;
  const newPath = fsStore.normalizePath(`/${fsStore.getParentPath(path)}/${name}`);
  await fsStore.renameFile(path, newPath);
  props.dir.children = await fsStore.readDir(props.dir.path);
  if (path === fsStore.currentEntry?.path) {
    await fsStore.changeURL(newPath);
  }
}

async function renameDir(path: string) {
  const entry = await fsStore.getEntry(path);
  if (entry.type !== "dir") return;
  const name = prompt(`Renomear pasta`, entry.name)?.trim();
  if (name === undefined) return;
  const newPath = fsStore.normalizePath(`/${fsStore.getParentPath(path)}/${name}`);
  await fsStore.renameDir(path, newPath);
  props.dir.children = await fsStore.readDir(props.dir.path);
  if (path === fsStore.currentEntry?.path) {
    await fsStore.changeURL(newPath);
  }
}

async function createFile() {
  if (fsStore.currentEntry) {
    const path = fsStore.currentEntry?.type === "file" ? fsStore.getParentPath(fsStore.currentEntry?.path) : fsStore.currentEntry?.path;
    const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
    if (name === undefined) return;
    const normalizedPath = fsStore.normalizePath(`/${path}/${name}`);
    await fsStore.createFile(normalizedPath, "");
    props.dir.children = await fsStore.readDir(props.dir.path);
    await fsStore.changeURL(normalizedPath);
  }
}

async function createDir() {
  if (fsStore.currentEntry) {
    const path = fsStore.currentEntry.type === "file" ? fsStore.getParentPath(fsStore.currentEntry.path) : fsStore.currentEntry.path;
    const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = fsStore.normalizePath(`/${path}/${name}`);
    await fsStore.createDir(normalizedPath);
    props.dir.children = await fsStore.readDir(props.dir.path);
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await fsStore.exists(fsStore.normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

watch(() => fsStore.root.children, async () => {
  props.dir.children = await fsStore.readDir(props.dir.path);
});
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <ul v-if="props.dir.children.length > 0" class="list-group w-100">
      <li
        v-if="fsStore.currentEntry?.path !== '/'"
        class="list-group-item list-group-item-action p-0 d-flex align-items-center"
      >
        <i class="bi bi-folder fs-5 ms-2 text-warning"></i>
        <NuxtLink :to="fsStore.getParentPath(dir.path)" class="w-100 p-2 text-truncate text-body text-decoration-none">..</NuxtLink>
      </li>
      <li
        v-for="entry in props.dir.children"
        :key="entry.path"
        class="list-group-item p-0 d-flex align-items-center">
  
        <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
          <template v-if="entry.type === 'file'">
            <i v-if="entry.name === 'db.json'" class="bi bi-database text-primary fs-5 ms-2"></i>
            <i v-else class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
          </template>
          <i v-else-if="entry.type === 'dir'" class="bi bi-folder fs-5 ms-2 text-warning"></i>
          <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
            {{ entry.name }}
          </NuxtLink>
          <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="entry.type === 'file' ? renameFile(entry.path) : renameDir(entry.path)"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="entry.type === 'file' ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
        </div>
  
      </li>
    </ul>
  
    <div class="d-flex gap-3">
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile()">
        <i class="bi bi-file-earmark-text fs-5"></i>
        <span>Novo arquivo</span>
      </button>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
        <i class="bi bi-folder fs-5"></i>
        <span>Nova pasta</span>
      </button>
    </div>
  </div>
</template>

<style>
.btn-delete:hover {
  color: var(--bs-danger);
}
.btn-rename:hover {
  color: var(--bs-secondary);
}
</style>