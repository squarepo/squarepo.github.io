<script setup lang="ts">
import { FILESYSTEM_ENTRIES } from '~/constants/filesystem';
import type { Dir } from '~/types/filesystem';

const props = defineProps<{ entry: Dir }>();

const entryStore = useEntryStore();

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
  <div class="border p-2 d-flex justify-content-end gap-2 overflow-auto">
    <button type="button" class="btn btn-sm btn-secondary d-flex align-items-center justify-content-center p-2 gap-2" data-bs-toggle="offcanvas" data-bs-target="#secondarySidebar">
      <i class="bi bi-sliders"></i>
      <!-- <span>Nova página</span> -->
    </button>
    <button type="button" class="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-2" @click="createPage()">
      <!-- <i class="bi bi-file-earmark-text fs-5"></i> -->
      <span>Nova página</span>
    </button>
  </div>
</template>