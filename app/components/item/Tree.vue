<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import { DEFAULT_SETTINGS } from '~/defaults/settings';
import type { File, Dir, Entry } from '~/types/filesystem';
import type { ContextMenuItem } from '~/types/contextMenu';

const props = defineProps<{ entries: (File | Dir)[] }>();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();

const filteredEntries = computed(() => {
  if (settingsStore.rootSettings.view == 'App') {
    return props.entries.filter((e) => e.type !== 'file');
  } else {
    return props.entries;
  }
});

function filteredChildren(entry: Dir) {
  if (settingsStore.rootSettings.view == 'App') {
    return entry.children.filter(e => e.type !== 'file');
  } else {
    return entry.children;
  }
}

const contextMenu = ref<{
  x: number,
  y: number,
  entry: Entry,
  items: ContextMenuItem[]
} | null>(null);

function openContextMenu(event: MouseEvent, entry: Entry) {
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

  <ul class="list-group w-100 list-group-flush gap-1 user-select-none">

    <ContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
      @select="handleContextMenuSelect"
      @close="contextMenu = null"
    />

    <template v-for="entry in filteredEntries" :key="entry.path">
      <li
        class="list-group-item border-0 rounded p-0 d-flex flex-column align-items-center"
        @contextmenu.prevent.stop="openContextMenu($event, entry)"
      >
        <div class="d-flex w-100 align-items-center text-body list-group-item-action rounded">
          <i
            @click="toggleDir(entry.path)"
            style="cursor: pointer"
            class="bi ms-2"
            :class="{
              invisible: !['repository', 'page', 'database', 'dir'].includes(entry.type),
              'bi-chevron-right': !entryStore.expandedDirs.has(entry.path),
              'bi-chevron-down': entryStore.expandedDirs.has(entry.path)
            }"
          ></i>
          <ItemIcon
            :view="settingsStore.rootSettings.view"
            :entry="entry"
          ></ItemIcon>
          <NuxtLink
            :to="entry.path"
            class="w-100 p-2 text-truncate text-body text-decoration-none"
          >
            {{ entry.name }}
          </NuxtLink>
        </div>
  
        <ItemTree
          v-if="['repository', 'page', 'database', 'dir'].includes(entry.type)
            && entryStore.expandedDirs.has(entry.path)
            && filteredChildren(entry as Dir).length"
          class="ps-4 pt-1"
          :entries="(entry as Dir).children"
        ></ItemTree>
        <div
          v-else-if="entryStore.expandedDirs.has(entry.path)"
          class="text-secondary align-self-start p-2 ms-4"
        >
          Pasta vazia
        </div>
      </li>
    </template>

  </ul>

</template>