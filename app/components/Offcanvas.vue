<script setup lang="ts">

const { $bootstrap } = useNuxtApp();
const filesystemStore = useFilesystemStore();
const route = useRoute();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("offcanvas")!);
  watch(
    () => route.fullPath,
    async (fullPath) => {
      const entry = await filesystemStore.getEntry(fullPath);
      if (entry.type === "file") {
        offcanvas.hide();
      } else if (entry.type === "dir") {
        filesystemStore.expandedDirs.add(entry.path);
      }
    }
  );
});

async function createFile() {
  if (filesystemStore.currentEntry) {
    const path = filesystemStore.currentEntry?.type === "file" ? filesystemStore.getParentPath(filesystemStore.currentEntry?.path) : filesystemStore.currentEntry?.path;
    const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
    if (name === undefined) return;
    const normalizedPath = filesystemStore.normalizePath(`/${path}/${name}`);
    await filesystemStore.createFile(normalizedPath, "");
    await filesystemStore.changeURL(normalizedPath);
  }
}

async function createDir() {
  if (filesystemStore.currentEntry) {
    const path = filesystemStore.currentEntry.type === "file" ? filesystemStore.getParentPath(filesystemStore.currentEntry.path) : filesystemStore.currentEntry.path;
    const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = filesystemStore.normalizePath(`/${path}/${name}`);
    await filesystemStore.createDir(normalizedPath);
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await filesystemStore.exists(filesystemStore.normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvas">

    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Arquivos</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body">
      <DirTree v-if="filesystemStore.root.children.length" :entries="filesystemStore.root.children"></DirTree>
      <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center"><span>Nenhum arquivo ou pasta</span></div>
    </div>
    
    <div class="p-3 d-flex gap-3">
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createFile()">
        <i class="bi bi-file-earmark-text fs-5"></i>
        <span>Novo arquivo</span>
      </button>
      <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
        <i class="bi bi-folder fs-5"></i>
        <span>Nova pasta</span>
      </button>
    </div>
    
  </div>
</template>