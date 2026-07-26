<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import { DEFAULT_SETTINGS } from '~/defaults/settings';


const { $bootstrap } = useNuxtApp();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
const route = useRoute();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("primarySidebar")!);
  watch(
    () => route.fullPath,
    async (fullPath) => {
      const entry = await entryStore.getEntry(fullPath);
      if (entry.type === "file") {
        offcanvas.hide();
      } else if (entry.type === "dir") {
        entryStore.expandedDirs.add(entry.path);
      }
    }
  );
});

async function createPage() {
  if (entryStore.currentEntry) {
    const path = ["file", "settings", "properties"].includes(entryStore.currentEntry?.type) ? getParentPath(entryStore.currentEntry?.path) : entryStore.currentEntry?.path;
    const name = prompt(`Criar nova página`,  await getName(path, "Página"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createDir(normalizedPath);
    await entryStore.createFile(`${normalizedPath}/${FILESYSTEM_ENTRIES.PAGE}`, "");
    await entryStore.changeURL(normalizedPath);
  }
}

async function createSettings() {
  if (entryStore.currentEntry) {
    const path = ["file", "settings", "properties"].includes(entryStore.currentEntry?.type) ? getParentPath(entryStore.currentEntry?.path) : entryStore.currentEntry?.path;
    const name = prompt(`Criar configurações`,  await getName(path, FILESYSTEM_ENTRIES.SETTINGS))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createFile(normalizedPath, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    await entryStore.changeURL(normalizedPath);
  }
}

async function createFile() {
  if (entryStore.currentEntry) {
    const path = ["file", "settings", "properties"].includes(entryStore.currentEntry?.type) ? getParentPath(entryStore.currentEntry?.path) : entryStore.currentEntry?.path;
    const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createFile(normalizedPath, "");
    await entryStore.changeURL(normalizedPath);
  }
}

async function createDir() {
  if (entryStore.currentEntry) {
    const path = ["file", "settings", "properties"].includes(entryStore.currentEntry?.type) ? getParentPath(entryStore.currentEntry.path) : entryStore.currentEntry.path;
    const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await entryStore.createDir(normalizedPath);
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await entryStore.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="primarySidebar">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Arquivos</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>

    <div class="offcanvas-body">
      <DirTree v-if="entryStore.root.children.length" :entries="entryStore.root.children"></DirTree>
      <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center"><span>Nenhum arquivo ou pasta</span></div>
    </div>
    
    <div class="p-3 d-flex gap-3">
      <template v-if="settingsStore.rootSettings.view == 'App'">
        <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createPage()">
          <i class="bi bi-file-earmark-text fs-5"></i>
          <span>Nova página</span>
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile()">
          <i class="bi bi-file-earmark-text fs-5"></i>
          <span>Novo arquivo</span>
        </button>
      </template>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
        <i class="bi bi-folder fs-5"></i>
        <span>Nova pasta</span>
      </button>
      <button type="button" class="btn btn-primary d-flex align-items-center justify-content-center p-2 gap-2" @click="createSettings()">
        <i class="bi bi-gear fs-5"></i>
        <!-- <span>Nova pasta</span> -->
      </button>
    </div>
    
  </div>
</template>