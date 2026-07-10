<script setup lang="ts">
import type { File, Dir } from '~/types/filesystem';

const props = defineProps<{ entries: (File | Dir)[] }>();
const filesystemStore = useFilesystemStore();
const settingsStore = useSettingsStore();

function toggleDir(path: string) {
  if (filesystemStore.expandedDirs.has(path)) {
    filesystemStore.expandedDirs.delete(path);
  } else {
    filesystemStore.expandedDirs.add(path);
  }
}

async function deleteFile(path: string) {
  const entry = await filesystemStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await filesystemStore.deleteFile(path);
    if (!(filesystemStore.currentEntry && await filesystemStore.exists(filesystemStore.currentEntry.path))) {
      await filesystemStore.changeURL("/");
    }
    if (path == settingsStore.rootSettingsPath) await settingsStore.refresh();
  }
}

async function deleteDir(path: string, recursive: boolean) {
  const entry = await filesystemStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await filesystemStore.deleteDir(path, recursive);
    if (!(filesystemStore.currentEntry && await filesystemStore.exists(filesystemStore.currentEntry.path))) {
      await filesystemStore.changeURL("/");
    }
  }
}

async function rename(path: string) {
  const entry = await filesystemStore.getEntry(path);
  const newName = prompt(`Renomear`, entry.name)?.trim();
  if (newName === undefined) return;
  await filesystemStore.rename(path, newName);
  if (path === filesystemStore.currentEntry?.path) {
    const newPath = normalizePath(`/${getParentPath(path)}/${newName}`);
    await filesystemStore.changeURL(newPath);
  }
}
</script>

<template>
  <ul v-if="settingsStore.rootSettings.view == 'App'" class="list-group w-100 list-group-flush gap-1">
    <template v-for="entry in entries" :key="entry.path">
      <li
        v-if="entry.type !== 'file'"
        class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center">
  
        <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
          <i @click="toggleDir(entry.path)" :class="{ invisible: !['page', 'database', 'dir'].includes(entry.type), 'bi-chevron-right': !filesystemStore.expandedDirs.has(entry.path), 'bi-chevron-down': filesystemStore.expandedDirs.has(entry.path) }" class="bi ms-2"></i>
          <i v-if="entry.type === 'settings'" class="bi bi-gear text-secondary-emphasis fs-5 ms-2"></i>
          <i v-if="entry.type === 'properties'" class="bi bi-puzzle text-secondary-emphasis fs-5 ms-2"></i>
          <i v-if="entry.type === 'page'" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.mainFile.content, 'bi-file-earmark': !entry.mainFile.content }"></i>
          <i v-else-if="entry.type === 'database'" class="bi bi-database text-primary fs-5 ms-2"></i>
          <i v-else-if="entry.type === 'dir'" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': filesystemStore.expandedDirs.has(entry.path), 'bi-folder': !filesystemStore.expandedDirs.has(entry.path) }"></i>
          <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
            {{ entry.name }}
          </NuxtLink>
          <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="rename(entry.path)"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="['file', 'settings', 'properties'].includes(entry.type) ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
        </div>
  
        <DirTree class="ps-4 pt-1" v-if="['page', 'database', 'dir'].includes(entry.type) && filesystemStore.expandedDirs.has(entry.path) && (entry as Dir).children.filter(e => e.type !== 'file').length" :entries="entry.children"></DirTree>
        <div v-else-if="filesystemStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>
  
      </li>
    </template>
  </ul>

  <ul v-else-if="settingsStore.rootSettings.view == 'Filesystem'" class="list-group w-100 list-group-flush gap-1">
    <li
      v-for="entry in props.entries"
      :key="entry.path"
      class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center">

      <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
        <i @click="toggleDir(entry.path)" :class="{ invisible: !['dir', 'page', 'database'].includes(entry.type), 'bi-chevron-right': !filesystemStore.expandedDirs.has(entry.path), 'bi-chevron-down': filesystemStore.expandedDirs.has(entry.path) }" class="bi ms-2"></i>
        <i v-if="['file', 'settings', 'properties'].includes(entry.type)" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
        <i v-else-if="['dir', 'page', 'database'].includes(entry.type)" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': filesystemStore.expandedDirs.has(entry.path), 'bi-folder': !filesystemStore.expandedDirs.has(entry.path) }"></i>
        <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
          {{ entry.name }}
        </NuxtLink>
        <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="rename(entry.path)"><i class="bi bi-pencil"></i></button>
        <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="['file', 'settings', 'properties'].includes(entry.type) ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button>
      </div>

      <DirTree class="ps-4 pt-1" v-if="['dir', 'page', 'database'].includes(entry.type) && filesystemStore.expandedDirs.has(entry.path) && entry.children.length" :entries="entry.children"></DirTree>
      <div v-else-if="filesystemStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>

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