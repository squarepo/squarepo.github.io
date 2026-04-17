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
  await fsStore.deleteFile(path);
  if (!(fsStore.currentEntry && await fsStore.exists(fsStore.currentEntry.path))) {
    await fsStore.changeURL("/");
  }
}

async function deleteDir(path: string, recursive: boolean) {
  await fsStore.deleteDir(path, recursive);
  if (!(fsStore.currentEntry && await fsStore.exists(fsStore.currentEntry.path))) {
    await fsStore.changeURL("/");
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
        <i v-if="entry.type === 'file'" class="bi bi-file-earmark-text fs-5 ms-2"></i>
        <i v-else-if="entry.type === 'dir'" class="bi bi-folder2 fs-5 ms-2"></i>
        <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
          {{ entry.name }}
        </NuxtLink>
        <button type="button" class="btn btn-delete border-0 p-1 m-2" @click="entry.type === 'file' ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
      </div>

      <DirList class="ps-4 pt-1" v-if="entry.type === 'dir' && fsStore.expandedDirs.has(entry.path) && entry.children.length" :entries="entry.children"></DirList>
      <div v-else-if="fsStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>

    </li>
  </ul>
</template>

<style>
.btn-delete:hover {
  color: var(--bs-danger);
}
</style>