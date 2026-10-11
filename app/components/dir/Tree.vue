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
        value: "create-page"
      },
      {
        type: 'item',
        label: "Adicionar pasta",
        value: "create-folder"
      },
      {
        type: 'divider'
      },
      {
        type: 'item',
        label: "Adicionar repositório",
        value: "create-repository"
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
        value: "create-settings"
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

async function handleContextMenuSelect(item: Extract<ContextMenuItem, { type: "item" }>) {
  const entry = contextMenu.value?.entry;
  if (entry) {
    const basePath = ["file", "settings", "properties"].includes(entry.type) ? getParentPath(entry.path) : entry.path;
    switch (item.value) {
      case "create-page": await entryStore.createPage(basePath); break;
      case "create-folder": await entryStore.createFolder(basePath); break;
      case "create-repository": await entryStore.createRepository(basePath); break;
      case "clone-repository": await entryStore.cloneRepository(basePath); break;
      case "create-settings": await entryStore.createSettings(basePath); break;
      // divider
      case "rename": await entryStore.rename(entry.path); break;
      case "delete":
        switch (entry.type) {
          case 'file': 
          case 'settings': 
          case 'properties': await entryStore.deleteFile(entry.path); break;
          case 'dir': 
          case 'page': 
          case 'repository': 
          case 'database': await entryStore.deleteDir(entry.path, true); break;
        }
        break;
    }
  }
}

function toggleDir(path: string) {
  if (entryStore.expandedDirs.has(path)) {
    entryStore.expandedDirs.delete(path);
  } else {
    entryStore.expandedDirs.add(path);
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