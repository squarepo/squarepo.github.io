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
        type: 'divider'
      },
      {
        type: 'item',
        label: "Adicionar configurações",
        value: "add-settings"
      }
    ]
  }
}

function handleContextMenuSelect(item: Extract<ContextMenuItem, { type: "item" }>) {
  const rootPath = entryStore.root.path;
  switch (item.value) {
    case "add-page": createPage(rootPath); break;
    case "add-dir": createDir(rootPath); break;
    case "add-repository": createRepository(rootPath); break;
    case "add-settings": createSettings(rootPath); break;
  }
}

async function createRepository(path: string) {
  const name = prompt(`Criar novo repositório`,  await getName(path, "Repositório"))?.trim();
  if (name === undefined) return;
  const normalizedPath = normalizePath(`/${path}/${name}`);
  await entryStore.createDir(normalizedPath);
  await entryStore.initializeRepository(normalizedPath);
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

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("primarySidebar")!);
  // watch(
  //   () => route.fullPath,
  //   async (fullPath) => {
  //     const entry = await entryStore.getEntry(fullPath);
  //     if (entry.type === "file") {
  //       offcanvas.hide();
  //     } else if (entry.type === "dir") {
  //       entryStore.expandedDirs.add(entry.path);
  //     }
  //   }
  // );
});

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="primarySidebar">

    <div class="offcanvas-header pb-0">
      <!-- <h5 class="offcanvas-title">Arquivos</h5> -->
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
      class="offcanvas-body"
      @contextmenu="openContextMenu"
    >
      <DirTree v-if="entryStore.root.children.length" :entries="entryStore.root.children"></DirTree>
      <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center"><span>Nenhum arquivo ou pasta</span></div>

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