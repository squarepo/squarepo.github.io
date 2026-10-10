<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import { DEFAULT_SETTINGS } from '~/defaults/settings';
import type { File, Dir, Entry } from '~/types/filesystem';
import type { ContextMenuItem } from '~/types/contextMenu';

const props = defineProps<{ entries: (File | Dir)[] }>();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();

const contextMenu = ref<{
  x: number,
  y: number,
  entry: Entry,
  items: ContextMenuItem[]
} | null>(null);

function openContextMenu(event: MouseEvent, entry: Entry) {
  event.preventDefault()

  contextMenu.value = {
    x: event.clientX,
    y: event.clientY,
    entry,
    items: [
      {
        type: 'item',
        label: "Adicionar página",
        value: "add-page"
      },
      {
        type: 'item',
        label: "Adicionar pasta",
        value: "add-dir"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: "Adicionar repositório",
        value: "add-repository"
      },
      {
        type: 'item',
        label: "Clonar repositório",
        value: "clone-repository"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: "Adicionar configurações",
        value: "add-settings"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: 'Renomear',
        value: 'rename',
      },
      {
        type: 'item',
        label: 'Excluir',
        value: 'delete'
      }
    ]
  }
}

function handleContextMenuSelect(item: Extract<ContextMenuItem, { type: "item" }>) {
  const entry = contextMenu.value?.entry;
  if (entry) {
    const basePath = ["file", "settings", "properties"].includes(entry.type) ? getParentPath(entry.path) : entry.path;
    switch (item.value) {
      case "add-page": createPage(basePath); break;
      case "add-dir": createDir(basePath); break;
      case "add-repository": createRepository(basePath); break;
      case "clone-repository": cloneRepository(basePath); break;
      case "add-file": createFile(basePath); break;
      case "add-settings": createSettings(basePath); break;
      // divider
      case "rename": rename(entry.path); break;
      case "delete":
        switch (entry.type) {
          case 'file': 
          case 'settings': 
          case 'properties': deleteFile(entry.path); break;
          case 'dir': 
          case 'page': 
          case 'repository': 
          case 'database': deleteDir(entry.path, true); break;
        }
        break;
    }
  }
}

async function createRepository(path: string) {
  const name = prompt(`Criar novo repositório`,  await getName(path, "Repositório"))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createDir(normalizedPath);
  await entryStore.initializeRepository(normalizedPath);
}

async function cloneRepository(path: string) {
  const url = prompt(`URL do repositório`)?.trim();
  if (url === undefined) return;
  await entryStore.cloneRepository(path, url);
}

async function createPage(path: string) {
  const name = prompt(`Criar nova página`,  await getName(path, "Página"))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createDir(normalizedPath);
  await entryStore.createFile(`${normalizedPath}/${FILESYSTEM_ENTRIES.PAGE}`, "");
  await entryStore.changeURL(normalizedPath);
}

async function createSettings(path: string) {
  const name = prompt(`Criar configurações`,  await getName(path, FILESYSTEM_ENTRIES.SETTINGS))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createFile(normalizedPath, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  await entryStore.changeURL(normalizedPath);
}

async function createFile(path: string) {
  const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createFile(normalizedPath, "");
  await entryStore.changeURL(normalizedPath);
}

async function createDir(path: string) {
  const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createDir(normalizedPath);
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await entryStore.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

function toggleDir(path: string) {
  if (entryStore.expandedDirs.has(path)) {
    entryStore.expandedDirs.delete(path);
  } else {
    entryStore.expandedDirs.add(path);
  }
}

async function deleteFile(path: string) {
  const entry = await entryStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await entryStore.deleteFile(path);
    if (!(entryStore.currentEntry && await entryStore.exists(entryStore.currentEntry.path))) {
      await entryStore.changeURL("/");
    }
    if (path == settingsStore.rootSettingsPath) await settingsStore.refresh();
  }
}

async function deleteDir(path: string, recursive: boolean) {
  const entry = await entryStore.getEntry(path);
  if (confirm(`${entry.type === "file" ? "O arquivo" : "A pasta"} "${entry.name}" será excluíd${entry.type === "file" ? "o" : "a"}`)) {
    await entryStore.deleteDir(path, recursive);
    if (!(entryStore.currentEntry && await entryStore.exists(entryStore.currentEntry.path))) {
      await entryStore.changeURL("/");
    }
  }
}

async function rename(path: string) {
  const entry = await entryStore.getEntry(path);
  const newName = prompt(`Renomear`, entry.name)?.trim();
  if (newName === undefined) return;
  await entryStore.rename(path, newName);
  if (path === entryStore.currentEntry?.path) {
    const newPath = normalizePath(`/${getParentPath(path)}/${newName}`);
    await entryStore.changeURL(newPath);
  }
}
</script>

<template>

  <ul class="list-group w-100 list-group-flush gap-1">

    <ContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
      @select="handleContextMenuSelect"
      @close="contextMenu = null"
    />

    <template v-for="entry in entries" :key="entry.path">
      <li
        v-if="settingsStore.rootSettings.view == 'App' && entry.type !== 'file'"
        class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center"
        @contextmenu.stop="openContextMenu($event, entry)"
      >
  
        <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
          <i @click="toggleDir(entry.path)" :class="{ invisible: !['repository', 'page', 'database', 'dir'].includes(entry.type), 'bi-chevron-right': !entryStore.expandedDirs.has(entry.path), 'bi-chevron-down': entryStore.expandedDirs.has(entry.path) }" class="bi ms-2"></i>
          <i v-if="entry.type === 'settings'" class="bi bi-gear text-secondary-emphasis fs-5 ms-2"></i>
          <i v-else-if="entry.type === 'properties'" class="bi bi-puzzle text-secondary-emphasis fs-5 ms-2"></i>
          <i v-else-if="entry.type === 'repository'" class="bi bi-archive text-primary fs-5 ms-2"></i>
          <i v-else-if="entry.type === 'page'" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.mainEntry.content, 'bi-file-earmark': !entry.mainEntry.content }"></i>
          <i v-else-if="entry.type === 'database'" class="bi bi-database text-danger fs-5 ms-2"></i>
          <i v-else-if="entry.type === 'dir'" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': entryStore.expandedDirs.has(entry.path), 'bi-folder': !entryStore.expandedDirs.has(entry.path) }"></i>
          <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
            {{ entry.name }}
          </NuxtLink>
          <!-- <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="rename(entry.path)"><i class="bi bi-pencil"></i></button>
          <button v-if="true" type="button" class="btn btn-delete border-0 p-0 me-2" @click="['file', 'settings', 'properties'].includes(entry.type) ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button> -->
        </div>
  
        <DirTree class="ps-4 pt-1" v-if="['repository', 'page', 'database', 'dir'].includes(entry.type) && entryStore.expandedDirs.has(entry.path) && (entry as Dir).children.filter(e => e.type !== 'file').length" :entries="entry.children"></DirTree>
        <div v-else-if="entryStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>
      </li>

      <li
        v-else-if="settingsStore.rootSettings.view == 'Filesystem'"
        class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center"
        @contextmenu.stop="openContextMenu($event, entry)"
      >
        <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
          <i @click="toggleDir(entry.path)" :class="{ invisible: !['dir', 'page', 'database', 'repository'].includes(entry.type), 'bi-chevron-right': !entryStore.expandedDirs.has(entry.path), 'bi-chevron-down': entryStore.expandedDirs.has(entry.path) }" class="bi ms-2"></i>
          <i v-if="['file', 'settings', 'properties'].includes(entry.type)" class="bi text-secondary-emphasis fs-5 ms-2" :class="{ 'bi-file-earmark-text': entry.content, 'bi-file-earmark': !entry.content }"></i>
          <i v-else-if="['dir', 'page', 'database', 'repository'].includes(entry.type)" class="bi fs-5 ms-2 text-warning" :class="{ 'bi-folder2-open': entryStore.expandedDirs.has(entry.path), 'bi-folder': !entryStore.expandedDirs.has(entry.path) }"></i>
          <NuxtLink :to="entry.path" class="w-100 p-2 text-truncate text-body text-decoration-none">
            {{ entry.name }}
          </NuxtLink>
          <!-- <button type="button" class="btn btn-rename border-0 p-0 me-2" @click="rename(entry.path)"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-delete border-0 p-0 me-2" @click="['file', 'settings', 'properties'].includes(entry.type) ? deleteFile(entry.path) : deleteDir(entry.path, true)"><i class="bi bi-trash3"></i></button> -->
        </div>

        <DirTree class="ps-4 pt-1" v-if="['repository', 'page', 'database', 'dir'].includes(entry.type) && entryStore.expandedDirs.has(entry.path) && entry.children.length" :entries="entry.children"></DirTree>
        <div v-else-if="entryStore.expandedDirs.has(entry.path)" class="text-secondary align-self-start p-2 ms-4">Pasta vazia</div>
      </li>
    </template>
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