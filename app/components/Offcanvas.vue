<script setup lang="ts">

import { v4 as uuidv4 } from 'uuid';

const { $bootstrap } = useNuxtApp();
const fsStore = useFsStore();
const route = useRoute();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("offcanvas")!);
  watch(
    () => route.fullPath,
    async (fullPath) => {
      if ((await fsStore.getEntry(fullPath)).type === "file") {
        offcanvas.hide();
      }
    }
  );
});

async function createFile() {
  const name = prompt(`Criar novo arquivo`, uuidv4());
  if (name === null) return;
  const path = fsStore.currentEntry?.type === "file" ? fsStore.getParentPath(fsStore.currentEntry?.path) : fsStore.currentEntry?.path;
  const normalizedPath = fsStore.normalizePath(`/${path}/${name}`);
  await fsStore.createFile(normalizedPath, "");
  await fsStore.changeURL(normalizedPath);
}

async function createDir() {
  const name = prompt(`Criar nova pasta`, uuidv4());
  if (name === null) return;
  const path = fsStore.currentEntry?.type === "file" ? fsStore.getParentPath(fsStore.currentEntry?.path) : fsStore.currentEntry?.path;
  const normalizedPath = fsStore.normalizePath(`/${path}/${name}`);
  await fsStore.createDir(normalizedPath);
}

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvas">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Arquivos</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <DirList v-if="fsStore.root.children.length" :entries="fsStore.root.children"></DirList>
      <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center"><span>Nenhum arquivo ou pasta</span></div>
    </div>
    
    <div class="p-3 d-flex gap-3">
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile()">
        <i class="bi bi-file-earmark-text fs-5"></i>
        <span>Novo arquivo</span>
      </button>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
        <i class="bi bi-folder2 fs-5"></i>
        <span>Nova pasta</span>
      </button>
    </div>
    
  </div>
</template>