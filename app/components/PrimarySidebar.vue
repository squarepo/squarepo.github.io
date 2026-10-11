<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import { DEFAULT_SETTINGS } from '~/defaults/settings';
import type { ContextMenuItem } from '~/types/contextMenu';


const { $bootstrap } = useNuxtApp();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
const route = useRoute();

const repositories = computed(() => {
  return entryStore.root.children.filter(e => e.type == "repository");
});

const contextMenu = ref<{
  x: number,
  y: number,
  items: ContextMenuItem[]
} | null>(null);

function openContextMenu(event: MouseEvent) {
  event.preventDefault()

  contextMenu.value = {
    x: event.clientX,
    y: event.clientY,
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
      }
    ]
  }
}

async function handleContextMenuSelect(item: Extract<ContextMenuItem, { type: "item" }>) {
  const rootPath = entryStore.root.path;
  switch (item.value) {
    case "create-page": await entryStore.createPage(rootPath); break;
    case "create-folder": await entryStore.createFolder(rootPath); break;
    case "create-repository": await entryStore.createRepository(rootPath); break;
    case "clone-repository": await entryStore.cloneRepository(rootPath); break;
    case "create-settings": await entryStore.createSettings(rootPath); break;
  }
}

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("primarySidebar")!);
});

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="primarySidebar">

    <div class="offcanvas-header">
      <select class="form-select me-3">
        <option value="/">Raiz</option>
        <option
          v-for="repo in repositories"
          :value="repo.path"
        >
          {{ repo.name }}
        </option>
      </select>
      <button type="button" class="btn-close m-0" data-bs-dismiss="offcanvas"></button>
    </div>

    <div
      class="offcanvas-body pt-0"
      @contextmenu="openContextMenu"
    >
      <ItemTree v-if="entryStore.root.children.length" :entries="entryStore.root.children"></ItemTree>
      <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center">
        <span>Nenhum arquivo ou pasta</span>
      </div>

      <ContextMenu
        v-if="contextMenu"
        :x="contextMenu.x"
        :y="contextMenu.y"
        :items="contextMenu.items"
        @select="handleContextMenuSelect"
        @close="contextMenu = null"
      />
    </div>
    
  </div>
</template>