<script setup lang="ts">
import type { Dir } from '~/domain/filesystem/fs';
import { getParentPath, normalizePath } from '~/domain/filesystem/fs.utils';


const { $bootstrap } = useNuxtApp();
const fsStore = useFsStore();
const route = useRoute();

const props = defineProps<{ fs: "fs" | "appFs", dir: Dir }>();

onMounted(() => {
  const offcanvas = new $bootstrap.Offcanvas(document.getElementById("offcanvas")!);
  watch(
    () => route.fullPath,
    async (fullPath) => {
      const entry = await fsStore.fs.getEntry(fullPath);
      if (entry.type === "file") {
        offcanvas.hide();
      } else if (entry.type === "dir") {
        fsStore.expandedDirs.add(entry.path);
      }
    }
  );
});

async function createPage() {
  if (fsStore.currentEntry) {
    const dirPath = fsStore.currentEntry?.type === "file" ? getParentPath(fsStore.currentEntry?.path) : fsStore.currentEntry?.path;
    const name = prompt(`Criar nova página`,  await getName(dirPath, "Página"))?.trim();
    if (name === undefined) return;
    const pagePath = normalizePath(`/${dirPath}/${name}`);
    await fsStore.createDir(pagePath);
    await fsStore.createFile(`${pagePath}/page.md`, "");
    await fsStore.changeURL(pagePath);
  }
}

async function createFile() {
  if (fsStore.currentEntry) {
    const path = fsStore.currentEntry?.type === "file" ? getParentPath(fsStore.currentEntry?.path) : fsStore.currentEntry?.path;
    const name = prompt(`Criar novo arquivo`,  await getName(path, "Arquivo"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await fsStore.createFile(normalizedPath, "");
    await fsStore.changeURL(normalizedPath);
  }
}

async function createDir() {
  if (fsStore.currentEntry) {
    const path = fsStore.currentEntry.type === "file" ? getParentPath(fsStore.currentEntry.path) : fsStore.currentEntry.path;
    const name = prompt(`Criar nova pasta`, await getName(path, "Pasta"))?.trim();
    if (name === undefined) return;
    const normalizedPath = normalizePath(`/${path}/${name}`);
    await fsStore.createDir(normalizedPath);
  }
}

async function getName(path: string, baseName: string) {
  let name: string = baseName;
  let num = 0;
  while (await fsStore.fs.exists(normalizePath(`/${path}/${name}`))) {
    name = `${baseName} ${++num}`;
  }
  return name;
}

</script>

<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas">

    <template v-if="fs === 'appFs'">
      <div class="offcanvas-header gap-3">
        <select class="form-select">
          <option value="root">Raiz</option>
        </select>
        <button type="button" class="btn-close m-0" data-bs-dismiss="offcanvas"></button>
      </div>
  
      <div class="offcanvas-body">
        <DirTree v-if="dir.children.length" :entries="dir.children"></DirTree>
        <div v-else class="text-body-tertiary w-100 h-100 d-flex justify-content-center align-items-center"><span>Nenhum arquivo ou pasta</span></div>
      </div>
      
      <div class="p-3 d-flex gap-3">
        <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createPage()">
          <i class="bi bi-file-earmark-text fs-5"></i>
          <span>Nova página</span>
        </button>
        <button type="button" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" @click="createDir()">
          <i class="bi bi-folder fs-5"></i>
          <span>Nova pasta</span>
        </button>
      </div>
    </template>

    <template v-else>
      <div class="offcanvas-header gap-3">
        <select class="form-select">
          <option value="root">Raiz</option>
        </select>
        <button type="button" class="btn-close m-0" data-bs-dismiss="offcanvas"></button>
      </div>
  
      <div class="offcanvas-body">
        <DirTree v-if="dir.children.length" :entries="dir.children"></DirTree>
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
    </template>
    
  </div>
</template>