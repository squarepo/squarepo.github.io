<script setup lang="ts">
import type { File, Dir } from '~/types/fs';

const props = defineProps<{ entries: (File | Dir)[] }>();
const fsStore = useFsStore();

function toggleDir(path: string) {
  if (fsStore.expandedDirs.has(path)) {
    fsStore.expandedDirs.delete(path);
  } else {
    fsStore.expandedDirs.add(path);
  }
}

async function deleteFile(path: string) {
  const entry = await fsStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await fsStore.deleteFile(path);
    if (!(fsStore.currentEntry && await fsStore.exists(fsStore.currentEntry.path))) {
      await fsStore.changeURL("/");
    }
  }
}

async function deleteDir(path: string, recursive: boolean) {
  const entry = await fsStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await fsStore.deleteDir(path, recursive);
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
  if (path === fsStore.currentEntry?.path) {
    await fsStore.changeURL(newPath);
  }
}
</script>

<template>
  <ul class="list-group w-100 list-group-flush gap-1">
    <li
      v-for="entry in props.entries"
      :key="entry.path"
      class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center">

      <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
        <i @click="toggleDir(entry.path)" :class="{ invisible: entry.type !== 'dir', 'bi-chevron-right': !fsStore.expandedDirs.has(entry.path), 'bi-chevron-down': fsStore.expandedDirs.has(entry.path) }" class="bi ms-2"></i>
        <template v-if="entry.type === 'file'">
          <i v-if="entry.name === 'db.json'" class="bi bi-database text-primary fs-5 ms-2"></i>
          <i v-else class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
        </template>
        <i v-else-if="entry.type === 'dir'" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': fsStore.expandedDirs.has(entry.path), 'bi-folder': !fsStore.expandedDirs.has(entry.path) }"></i>
        <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
          {{ entry.name }}
        </NuxtLink>
        <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="entry.type === 'file' ? renameFile(entry.path) : renameDir(entry.path)"><i class="bi bi-pencil"></i></button>
        <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="entry.type === 'file' ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
      </div>

      <DirTree class="ps-4 pt-1" v-if="entry.type === 'dir' && fsStore.expandedDirs.has(entry.path) && entry.children.length" :entries="entry.children"></DirTree>
      <div v-else-if="fsStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>

    </li>
  </ul>
</template>

<style>
.btn-delete:hover {
  color: var(--bs-danger);
}
.btn-rename:hover {
  color: var(--bs-secondary);
}
</style>